import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Permission, Role } from "appwrite";

const readDotEnv = () => {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return {};
  }

  return fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .reduce((env, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return env;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        return env;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      let value = trimmedLine.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
      return env;
    }, {});
};

const envFromFile = readDotEnv();

const getEnv = (key, fallbackKey) =>
  process.env[key] ??
  envFromFile[key] ??
  (fallbackKey ? process.env[fallbackKey] ?? envFromFile[fallbackKey] : undefined) ??
  "";

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const endpoint = stripTrailingSlash(
  getEnv("APPWRITE_ENDPOINT", "EXPO_PUBLIC_APPWRITE_ENDPOINT"),
);
const projectId = getEnv("APPWRITE_PROJECT_ID", "EXPO_PUBLIC_APPWRITE_PROJECT_ID");
const apiKey = getEnv("APPWRITE_API_KEY");

const databaseId = getEnv("EXPO_PUBLIC_APPWRITE_DATABASE_ID") || "gym_genie";
const collectionIds = {
  machines: getEnv("EXPO_PUBLIC_APPWRITE_MACHINES_COLLECTION_ID") || "machines",
  machineQueueEntries:
    getEnv("EXPO_PUBLIC_APPWRITE_MACHINE_QUEUE_COLLECTION_ID") ||
    "machine_queue_entries",
  profiles: getEnv("EXPO_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID") || "profiles",
  equipmentItems:
    getEnv("EXPO_PUBLIC_APPWRITE_EQUIPMENT_ITEMS_COLLECTION_ID") ||
    "equipment_items",
  equipmentCheckouts:
    getEnv("EXPO_PUBLIC_APPWRITE_EQUIPMENT_CHECKOUTS_COLLECTION_ID") ||
    "equipment_checkouts",
  equipmentReports:
    getEnv("EXPO_PUBLIC_APPWRITE_EQUIPMENT_REPORTS_COLLECTION_ID") ||
    "equipment_condition_reports",
};

if (!endpoint || !projectId || !apiKey) {
  throw new Error(
    [
      "Missing Appwrite backend setup configuration.",
      "Required values: APPWRITE_API_KEY, EXPO_PUBLIC_APPWRITE_ENDPOINT, EXPO_PUBLIC_APPWRITE_PROJECT_ID.",
    ].join(" "),
  );
}

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Key": apiKey,
  "X-Appwrite-Project": projectId,
};

const request = async (method, route, body, { allowConflict = false } = {}) => {
  const response = await fetch(`${endpoint}${route}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  let payload = {};

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { message: raw };
    }
  }

  if (response.ok) {
    return payload;
  }

  if (allowConflict && response.status === 409) {
    return payload;
  }

  throw new Error(
    `${method} ${route} failed (${response.status}): ${
      payload.message ?? JSON.stringify(payload)
    }`,
  );
};

const ensureResource = async (label, callback) => {
  process.stdout.write(`- ${label}\n`);
  await callback();
};

const retry = async (label, callback, attempts = 8, delayMs = 1500) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await callback();
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        break;
      }

      process.stdout.write(
        `  waiting for ${label} to become available (${attempt}/${attempts - 1})\n`,
      );
      await sleep(delayMs);
    }
  }

  throw lastError;
};

const authenticatedReadPermissions = [Permission.read(Role.users())];
const authenticatedCreatePermissions = [
  Permission.read(Role.users()),
  Permission.create(Role.users()),
];

const ensureDatabase = async () => {
  try {
    await request("GET", `/databases/${databaseId}`);
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes("(404)")) {
      throw error;
    }
  }

  await request("POST", "/databases", {
    databaseId,
    name: "Gym Genie",
    enabled: true,
  });
};

const ensureCollection = async (collectionId, name, permissions) => {
  await request(
    "POST",
    `/databases/${databaseId}/collections`,
    {
      collectionId,
      name,
      permissions,
      documentSecurity: true,
      enabled: true,
    },
    { allowConflict: true },
  );
};

const ensureStringAttribute = async (collectionId, key, size, required) => {
  await request(
    "POST",
    `/databases/${databaseId}/collections/${collectionId}/attributes/string`,
    {
      key,
      size,
      required,
      array: false,
    },
    { allowConflict: true },
  );
  await sleep(500);
};

const ensureBooleanAttribute = async (collectionId, key, required, defaultValue) => {
  const payload = {
    key,
    required,
    array: false,
  };

  if (defaultValue !== undefined && !required) {
    payload.default = defaultValue;
  }

  await request(
    "POST",
    `/databases/${databaseId}/collections/${collectionId}/attributes/boolean`,
    payload,
    { allowConflict: true },
  );
  await sleep(500);
};

const ensureIntegerAttribute = async (
  collectionId,
  key,
  required,
  defaultValue,
  min,
  max,
) => {
  const payload = {
    key,
    required,
    min,
    max,
    array: false,
  };

  if (defaultValue !== undefined && !required) {
    payload.default = defaultValue;
  }

  await request(
    "POST",
    `/databases/${databaseId}/collections/${collectionId}/attributes/integer`,
    payload,
    { allowConflict: true },
  );
  await sleep(500);
};

const ensureDatetimeAttribute = async (collectionId, key, required) => {
  await request(
    "POST",
    `/databases/${databaseId}/collections/${collectionId}/attributes/datetime`,
    {
      key,
      required,
      array: false,
    },
    { allowConflict: true },
  );
  await sleep(500);
};

const ensureEnumAttribute = async (
  collectionId,
  key,
  elements,
  required,
  defaultValue,
) => {
  const payload = {
    key,
    elements,
    required,
    array: false,
  };

  if (defaultValue !== undefined && !required) {
    payload.default = defaultValue;
  }

  await request(
    "POST",
    `/databases/${databaseId}/collections/${collectionId}/attributes/enum`,
    payload,
    { allowConflict: true },
  );
  await sleep(500);
};

const ensureIndex = async (collectionId, key, attributes, orders) => {
  await request(
    "POST",
    `/databases/${databaseId}/collections/${collectionId}/indexes`,
    {
      key,
      type: "key",
      attributes,
      orders,
    },
    { allowConflict: true },
  );
};

const ensureDocument = async (collectionId, documentId, data) => {
  await request(
    "POST",
    `/databases/${databaseId}/collections/${collectionId}/documents`,
    {
      documentId,
      data,
      permissions: authenticatedReadPermissions,
    },
    { allowConflict: true },
  );
};

const createMachinesCollection = async () => {
  const collectionId = collectionIds.machines;

  await ensureCollection(collectionId, "Machines", authenticatedReadPermissions);
  await ensureStringAttribute(collectionId, "name", 255, true);
  await ensureStringAttribute(collectionId, "location", 255, true);
  await ensureBooleanAttribute(collectionId, "isActive", true, true);

  await retry("machine indexes", async () => {
    await ensureIndex(collectionId, "machines_isActive", ["isActive"], ["ASC"]);
  });
};

const createMachineQueueCollection = async () => {
  const collectionId = collectionIds.machineQueueEntries;

  await ensureCollection(
    collectionId,
    "Machine Queue Entries",
    authenticatedCreatePermissions,
  );
  await ensureStringAttribute(collectionId, "machineId", 255, true);
  await ensureStringAttribute(collectionId, "userId", 255, true);
  await ensureEnumAttribute(collectionId, "status", ["active", "left", "served"], true);
  await ensureDatetimeAttribute(collectionId, "joinedAt", true);
  await ensureDatetimeAttribute(collectionId, "leftAt", false);

  await retry("machine queue indexes", async () => {
    await ensureIndex(collectionId, "machine_queue_machineId", ["machineId"], ["ASC"]);
    await ensureIndex(collectionId, "machine_queue_userId", ["userId"], ["ASC"]);
    await ensureIndex(collectionId, "machine_queue_status", ["status"], ["ASC"]);
    await ensureIndex(collectionId, "machine_queue_joinedAt", ["joinedAt"], ["ASC"]);
  });
};

const createEquipmentItemsCollection = async () => {
  const collectionId = collectionIds.equipmentItems;

  await ensureCollection(
    collectionId,
    "Equipment Items",
    authenticatedReadPermissions,
  );
  await ensureStringAttribute(collectionId, "name", 255, true);
  await ensureIntegerAttribute(collectionId, "totalQuantity", true, 1, 0, 1000);
  await ensureBooleanAttribute(collectionId, "isActive", true, true);
  await ensureEnumAttribute(
    collectionId,
    "defaultCondition",
    ["good", "needs attention", "damaged"],
    true,
    "good",
  );

  await retry("equipment item indexes", async () => {
    await ensureIndex(collectionId, "equipment_items_isActive", ["isActive"], ["ASC"]);
  });
};

const createProfilesCollection = async () => {
  const collectionId = collectionIds.profiles;

  await ensureCollection(collectionId, "Profiles", authenticatedCreatePermissions);
  await ensureStringAttribute(collectionId, "userId", 255, true);
  await ensureStringAttribute(collectionId, "fullName", 255, true);
  await ensureStringAttribute(collectionId, "email", 255, true);
  await ensureStringAttribute(collectionId, "username", 255, true);
  await ensureStringAttribute(collectionId, "fitnessGoal", 255, true);
  await ensureStringAttribute(collectionId, "profileImage", 500, false);

  await retry("profile indexes", async () => {
    await ensureIndex(collectionId, "profiles_userId", ["userId"], ["ASC"]);
    await ensureIndex(collectionId, "profiles_email", ["email"], ["ASC"]);
  });
};

const createEquipmentCheckoutsCollection = async () => {
  const collectionId = collectionIds.equipmentCheckouts;

  await ensureCollection(
    collectionId,
    "Equipment Checkouts",
    authenticatedCreatePermissions,
  );
  await ensureStringAttribute(collectionId, "equipmentId", 255, true);
  await ensureStringAttribute(collectionId, "userId", 255, true);
  await ensureEnumAttribute(collectionId, "status", ["active", "returned"], true);
  await ensureDatetimeAttribute(collectionId, "checkedOutAt", true);
  await ensureDatetimeAttribute(collectionId, "returnedAt", false);

  await retry("equipment checkout indexes", async () => {
    await ensureIndex(collectionId, "equipment_checkouts_equipmentId", ["equipmentId"], ["ASC"]);
    await ensureIndex(collectionId, "equipment_checkouts_userId", ["userId"], ["ASC"]);
    await ensureIndex(collectionId, "equipment_checkouts_status", ["status"], ["ASC"]);
    await ensureIndex(
      collectionId,
      "equipment_checkouts_checkedOutAt",
      ["checkedOutAt"],
      ["ASC"],
    );
  });
};

const createEquipmentReportsCollection = async () => {
  const collectionId = collectionIds.equipmentReports;

  await ensureCollection(
    collectionId,
    "Equipment Condition Reports",
    authenticatedCreatePermissions,
  );
  await ensureStringAttribute(collectionId, "equipmentId", 255, true);
  await ensureStringAttribute(collectionId, "userId", 255, true);
  await ensureEnumAttribute(
    collectionId,
    "condition",
    ["good", "needs attention", "damaged"],
    true,
  );
  await ensureStringAttribute(collectionId, "maintenanceComment", 500, false);
  await ensureDatetimeAttribute(collectionId, "reportedAt", true);

  await retry("equipment report indexes", async () => {
    await ensureIndex(collectionId, "equipment_reports_equipmentId", ["equipmentId"], ["ASC"]);
    await ensureIndex(collectionId, "equipment_reports_reportedAt", ["reportedAt"], ["DESC"]);
  });
};

const seedDocuments = async () => {
  await ensureDocument(collectionIds.machines, "lat-pulldown", {
    name: "Lat Pulldown",
    location: "Zone A",
    isActive: true,
  });
  await ensureDocument(collectionIds.machines, "bench-press", {
    name: "Bench Press",
    location: "Zone B",
    isActive: true,
  });
  await ensureDocument(collectionIds.machines, "squat-rack", {
    name: "Squat Rack",
    location: "Zone C",
    isActive: true,
  });
  await ensureDocument(collectionIds.machines, "leg-press", {
    name: "Leg Press",
    location: "Zone C",
    isActive: true,
  });

  await ensureDocument(collectionIds.equipmentItems, "basketball", {
    name: "Basketballs",
    totalQuantity: 8,
    isActive: true,
    defaultCondition: "good",
  });
  await ensureDocument(collectionIds.equipmentItems, "jump-rope", {
    name: "Jump Ropes",
    totalQuantity: 12,
    isActive: true,
    defaultCondition: "good",
  });
  await ensureDocument(collectionIds.equipmentItems, "yoga-mat", {
    name: "Yoga Mats",
    totalQuantity: 20,
    isActive: true,
    defaultCondition: "good",
  });
};

const main = async () => {
  process.stdout.write("Setting up Appwrite backend for Gym Genie\n");

  await ensureResource("database", ensureDatabase);
  await ensureResource("machines collection", createMachinesCollection);
  await ensureResource("machine queue collection", createMachineQueueCollection);
  await ensureResource("profiles collection", createProfilesCollection);
  await ensureResource("equipment items collection", createEquipmentItemsCollection);
  await ensureResource("equipment checkouts collection", createEquipmentCheckoutsCollection);
  await ensureResource("equipment reports collection", createEquipmentReportsCollection);
  await ensureResource("seed documents", seedDocuments);

  process.stdout.write("Appwrite backend setup complete.\n");
};

await main();
