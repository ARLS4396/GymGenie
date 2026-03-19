import type { Models } from "react-native-appwrite";

export interface MachineQueue {
  id: string;
  name: string;
  location: string;
  queueUserIds: string[];
}

export type EquipmentCondition = "good" | "needs attention" | "damaged";
export type MachineQueueEntryStatus = "active" | "left" | "served";
export type EquipmentCheckoutStatus = "active" | "returned";

export interface EquipmentItem {
  id: string;
  name: string;
  totalQuantity: number;
  checkedOutBy: string[];
  condition: EquipmentCondition;
  lastReportedAt?: string;
  lastReportedBy?: string;
  lastMaintenanceComment?: string;
}

export interface MachineRecord extends Models.Document {
  name: string;
  location: string;
  isActive: boolean;
}

export interface MachineQueueEntryRecord extends Models.Document {
  machineId: string;
  userId: string;
  status: MachineQueueEntryStatus;
  joinedAt: string;
  leftAt?: string;
}

export interface EquipmentItemRecord extends Models.Document {
  name: string;
  totalQuantity: number;
  isActive: boolean;
  defaultCondition: EquipmentCondition;
}

export interface EquipmentCheckoutRecord extends Models.Document {
  equipmentId: string;
  userId: string;
  status: EquipmentCheckoutStatus;
  checkedOutAt: string;
  returnedAt?: string;
}

export interface EquipmentConditionReportRecord extends Models.Document {
  equipmentId: string;
  userId: string;
  condition: EquipmentCondition;
  maintenanceComment?: string;
  reportedAt: string;
}
