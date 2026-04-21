import {
  Permission,
  Query,
  Role,
} from "react-native-appwrite";
import {
  databases,
  GYM_BACKEND_CONFIG_ERROR,
  gymBackendIds,
  ID,
  isGymBackendConfigured,
} from "@/lib/appwrite";
import type {
  EquipmentCheckoutRecord,
  EquipmentCondition,
  EquipmentConditionReportRecord,
  EquipmentItem,
  EquipmentItemRecord,
  MachineQueue,
  MachineQueueEntryRecord,
  MachineRecord,
} from "@/types/gym";

const QUERY_LIMIT = 100;

interface GymSnapshot {
  machines: MachineQueue[];
  equipment: EquipmentItem[];
}

const getBackendIds = () => {
  if (!isGymBackendConfigured()) {
    throw new Error(GYM_BACKEND_CONFIG_ERROR);
  }

  return gymBackendIds;
};

const getOwnedPermissions = (userId: string): string[] => [
  Permission.read(Role.users()),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

const mapMachines = (
  machineRecords: MachineRecord[],
  queueEntries: MachineQueueEntryRecord[],
): MachineQueue[] => {
  const activeMachines = [...machineRecords]
    .filter((machine) => machine.isActive)
    .sort((left, right) => left.name.localeCompare(right.name));
  const activeQueueEntries = queueEntries.filter((entry) => entry.status === "active");
  const queueEntriesByMachineId = new Map<string, string[]>();

  activeQueueEntries.forEach((entry) => {
    const existing = queueEntriesByMachineId.get(entry.machineId) ?? [];
    existing.push(entry.userId);
    queueEntriesByMachineId.set(entry.machineId, existing);
  });

  return activeMachines.map((machine) => ({
    id: machine.$id,
    name: machine.name,
    location: machine.location,
    queueUserIds: queueEntriesByMachineId.get(machine.$id) ?? [],
  }));
};

const mapEquipment = (
  equipmentRecords: EquipmentItemRecord[],
  checkoutRecords: EquipmentCheckoutRecord[],
  reportRecords: EquipmentConditionReportRecord[],
): EquipmentItem[] => {
  const activeItems = [...equipmentRecords]
    .filter((item) => item.isActive)
    .sort((left, right) => left.name.localeCompare(right.name));
  const activeCheckouts = checkoutRecords.filter(
    (checkout) => checkout.status === "active",
  );
  const activeCheckoutsByEquipmentId = new Map<string, string[]>();
  const latestReportByEquipmentId = new Map<string, EquipmentConditionReportRecord>();

  activeCheckouts.forEach((checkout) => {
    const existing = activeCheckoutsByEquipmentId.get(checkout.equipmentId) ?? [];
    existing.push(checkout.userId);
    activeCheckoutsByEquipmentId.set(checkout.equipmentId, existing);
  });

  reportRecords.forEach((report) => {
    if (!latestReportByEquipmentId.has(report.equipmentId)) {
      latestReportByEquipmentId.set(report.equipmentId, report);
    }
  });

  return activeItems.map((item) => {
    const latestReport = latestReportByEquipmentId.get(item.$id);

    return {
      id: item.$id,
      name: item.name,
      totalQuantity: item.totalQuantity,
      checkedOutBy: activeCheckoutsByEquipmentId.get(item.$id) ?? [],
      condition: latestReport?.condition ?? item.defaultCondition,
      lastReportedAt: latestReport?.reportedAt,
      lastReportedBy: latestReport?.userId,
      lastMaintenanceComment: latestReport?.maintenanceComment?.trim() || undefined,
    };
  });
};

const getActiveMachineQueueEntry = async (
  machineId: string,
  userId: string,
): Promise<MachineQueueEntryRecord | null> => {
  const ids = getBackendIds();
  const response = await databases.listDocuments<MachineQueueEntryRecord>(
    ids.databaseId,
    ids.collections.machineQueueEntries,
    [
      Query.orderAsc("joinedAt"),
      Query.limit(QUERY_LIMIT),
    ],
  );

  return (
    response.documents.find(
      (entry) =>
        entry.machineId === machineId &&
        entry.userId === userId &&
        entry.status === "active",
    ) ?? null
  );
};

const getActiveEquipmentCheckouts = async (
  equipmentId: string,
): Promise<EquipmentCheckoutRecord[]> => {
  const ids = getBackendIds();
  const response = await databases.listDocuments<EquipmentCheckoutRecord>(
    ids.databaseId,
    ids.collections.equipmentCheckouts,
    [
      Query.orderAsc("checkedOutAt"),
      Query.limit(QUERY_LIMIT),
    ],
  );

  return response.documents.filter(
    (checkout) => checkout.equipmentId === equipmentId && checkout.status === "active",
  );
};

const getActiveEquipmentCheckout = async (
  equipmentId: string,
  userId: string,
): Promise<EquipmentCheckoutRecord | null> => {
  const activeCheckouts = await getActiveEquipmentCheckouts(equipmentId);

  return (
    activeCheckouts.find((checkout) => checkout.userId === userId) ?? null
  );
};

export const fetchGymSnapshot = async (): Promise<GymSnapshot> => {
  const ids = getBackendIds();

  const [
    machineRecords,
    queueEntries,
    equipmentRecords,
    equipmentCheckouts,
    equipmentReports,
  ] = await Promise.all([
    databases.listDocuments<MachineRecord>(
      ids.databaseId,
      ids.collections.machines,
      [Query.limit(QUERY_LIMIT)],
    ),
    databases.listDocuments<MachineQueueEntryRecord>(
      ids.databaseId,
      ids.collections.machineQueueEntries,
      [
        Query.orderAsc("joinedAt"),
        Query.limit(QUERY_LIMIT),
      ],
    ),
    databases.listDocuments<EquipmentItemRecord>(
      ids.databaseId,
      ids.collections.equipmentItems,
      [Query.limit(QUERY_LIMIT)],
    ),
    databases.listDocuments<EquipmentCheckoutRecord>(
      ids.databaseId,
      ids.collections.equipmentCheckouts,
      [
        Query.orderAsc("checkedOutAt"),
        Query.limit(QUERY_LIMIT),
      ],
    ),
    databases.listDocuments<EquipmentConditionReportRecord>(
      ids.databaseId,
      ids.collections.equipmentReports,
      [
        Query.orderDesc("reportedAt"),
        Query.limit(QUERY_LIMIT),
      ],
    ),
  ]);

  return {
    machines: mapMachines(machineRecords.documents, queueEntries.documents),
    equipment: mapEquipment(
      equipmentRecords.documents,
      equipmentCheckouts.documents,
      equipmentReports.documents,
    ),
  };
};

export const joinMachineQueue = async (
  machineId: string,
  userId: string,
): Promise<void> => {
  const ids = getBackendIds();
  const existingEntry = await getActiveMachineQueueEntry(machineId, userId);

  if (existingEntry) {
    throw new Error("You are already in this queue.");
  }

  await databases.createDocument(
    ids.databaseId,
    ids.collections.machineQueueEntries,
    ID.unique(),
    {
      machineId,
      userId,
      status: "active",
      joinedAt: new Date().toISOString(),
    },
    getOwnedPermissions(userId),
  );
};

export const leaveMachineQueue = async (
  machineId: string,
  userId: string,
): Promise<void> => {
  const ids = getBackendIds();
  const existingEntry = await getActiveMachineQueueEntry(machineId, userId);

  if (!existingEntry) {
    throw new Error("You are not currently in this queue.");
  }

  await databases.updateDocument(
    ids.databaseId,
    ids.collections.machineQueueEntries,
    existingEntry.$id,
    {
      status: "left",
      leftAt: new Date().toISOString(),
    },
  );
};

export const checkoutEquipment = async (
  equipmentId: string,
  userId: string,
): Promise<void> => {
  const ids = getBackendIds();
  const existingCheckout = await getActiveEquipmentCheckout(equipmentId, userId);

  if (existingCheckout) {
    throw new Error("You already have this item checked out.");
  }

  const equipmentItem = await databases.getDocument<EquipmentItemRecord>(
    ids.databaseId,
    ids.collections.equipmentItems,
    equipmentId,
  );

  const activeCheckouts = await getActiveEquipmentCheckouts(equipmentId);

  if (activeCheckouts.length >= equipmentItem.totalQuantity) {
    throw new Error("This equipment is currently unavailable.");
  }

  await databases.createDocument(
    ids.databaseId,
    ids.collections.equipmentCheckouts,
    ID.unique(),
    {
      equipmentId,
      userId,
      status: "active",
      checkedOutAt: new Date().toISOString(),
    },
    getOwnedPermissions(userId),
  );
};

export const returnEquipment = async (
  equipmentId: string,
  userId: string,
): Promise<void> => {
  const ids = getBackendIds();
  const existingCheckout = await getActiveEquipmentCheckout(equipmentId, userId);

  if (!existingCheckout) {
    throw new Error("You do not have this item checked out.");
  }

  await databases.updateDocument(
    ids.databaseId,
    ids.collections.equipmentCheckouts,
    existingCheckout.$id,
    {
      status: "returned",
      returnedAt: new Date().toISOString(),
    },
  );
};

export const reportEquipmentCondition = async (
  equipmentId: string,
  condition: EquipmentCondition,
  maintenanceComment: string,
  userId: string,
): Promise<void> => {
  const ids = getBackendIds();

  await databases.createDocument(
    ids.databaseId,
    ids.collections.equipmentReports,
    ID.unique(),
    {
      equipmentId,
      userId,
      condition,
      maintenanceComment: maintenanceComment.trim() || undefined,
      reportedAt: new Date().toISOString(),
    },
  );
};
