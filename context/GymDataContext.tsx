import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  checkoutEquipment as checkoutEquipmentDocument,
  fetchGymSnapshot,
  joinMachineQueue as joinMachineQueueDocument,
  leaveMachineQueue as leaveMachineQueueDocument,
  reportEquipmentCondition as reportEquipmentConditionDocument,
  returnEquipment as returnEquipmentDocument,
} from "@/lib/gymBackend";
import type {
  EquipmentCondition,
  EquipmentItem,
  MachineQueue,
} from "@/types/gym";
import { getErrorMessage } from "@/utils/appwriteError";

interface GymDataContextValue {
  machines: MachineQueue[];
  equipment: EquipmentItem[];
  isLoading: boolean;
  error: string | null;
  refreshGymData: () => Promise<void>;
  joinMachineQueue: (machineId: string, userId: string) => Promise<void>;
  leaveMachineQueue: (machineId: string, userId: string) => Promise<void>;
  checkoutEquipment: (equipmentId: string, userId: string) => Promise<void>;
  returnEquipment: (equipmentId: string, userId: string) => Promise<void>;
  reportEquipmentCondition: (
    equipmentId: string,
    condition: EquipmentCondition,
    userId: string,
  ) => Promise<void>;
}

const GymDataContext = createContext<GymDataContextValue | undefined>(undefined);

export const GymDataProvider = ({ children }: PropsWithChildren) => {
  const { status, user } = useAuth();
  const [machines, setMachines] = useState<MachineQueue[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncGymData = useCallback(async () => {
    const nextSnapshot = await fetchGymSnapshot();
    setMachines(nextSnapshot.machines);
    setEquipment(nextSnapshot.equipment);
  }, []);

  const refreshGymData = useCallback(async () => {
    if (status !== "authenticated" || !user) {
      setMachines([]);
      setEquipment([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      setError(null);
      await syncGymData();
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsLoading(false);
    }
  }, [status, syncGymData, user]);

  useEffect(() => {
    void refreshGymData();
  }, [refreshGymData]);

  const runMutation = useCallback(
    async (operation: () => Promise<void>) => {
      if (!user) {
        const message = "You need to be logged in to use gym features.";
        setError(message);
        throw new Error(message);
      }

      setIsLoading(true);

      try {
        setError(null);
        await operation();
        await syncGymData();
      } catch (nextError) {
        const message = getErrorMessage(nextError);
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [syncGymData, user],
  );

  const joinMachineQueue = useCallback(
    async (machineId: string, userId: string) => {
      await runMutation(() => joinMachineQueueDocument(machineId, userId));
    },
    [runMutation],
  );

  const leaveMachineQueue = useCallback(
    async (machineId: string, userId: string) => {
      await runMutation(() => leaveMachineQueueDocument(machineId, userId));
    },
    [runMutation],
  );

  const checkoutEquipment = useCallback(
    async (equipmentId: string, userId: string) => {
      await runMutation(() => checkoutEquipmentDocument(equipmentId, userId));
    },
    [runMutation],
  );

  const returnEquipment = useCallback(
    async (equipmentId: string, userId: string) => {
      await runMutation(() => returnEquipmentDocument(equipmentId, userId));
    },
    [runMutation],
  );

  const reportEquipmentCondition = useCallback(
    async (equipmentId: string, condition: EquipmentCondition, userId: string) => {
      await runMutation(() =>
        reportEquipmentConditionDocument(equipmentId, condition, userId),
      );
    },
    [runMutation],
  );

  const contextValue = useMemo<GymDataContextValue>(
    () => ({
      machines,
      equipment,
      isLoading,
      error,
      refreshGymData,
      joinMachineQueue,
      leaveMachineQueue,
      checkoutEquipment,
      returnEquipment,
      reportEquipmentCondition,
    }),
    [
      machines,
      equipment,
      isLoading,
      error,
      refreshGymData,
      joinMachineQueue,
      leaveMachineQueue,
      checkoutEquipment,
      returnEquipment,
      reportEquipmentCondition,
    ],
  );

  return (
    <GymDataContext.Provider value={contextValue}>{children}</GymDataContext.Provider>
  );
};

export const useGymData = (): GymDataContextValue => {
  const context = useContext(GymDataContext);

  if (!context) {
    throw new Error("useGymData must be used within GymDataProvider");
  }

  return context;
};
