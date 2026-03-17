import "react-native-url-polyfill/auto";
import { Account, Client, Databases, ID } from "react-native-appwrite";
import { Platform } from "react-native";
import * as Application from "expo-application";

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "";
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ?? "";
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? "";
const machinesCollectionId =
  process.env.EXPO_PUBLIC_APPWRITE_MACHINES_COLLECTION_ID ?? "";
const machineQueueCollectionId =
  process.env.EXPO_PUBLIC_APPWRITE_MACHINE_QUEUE_COLLECTION_ID ?? "";
const equipmentItemsCollectionId =
  process.env.EXPO_PUBLIC_APPWRITE_EQUIPMENT_ITEMS_COLLECTION_ID ?? "";
const equipmentCheckoutsCollectionId =
  process.env.EXPO_PUBLIC_APPWRITE_EQUIPMENT_CHECKOUTS_COLLECTION_ID ?? "";
const equipmentReportsCollectionId =
  process.env.EXPO_PUBLIC_APPWRITE_EQUIPMENT_REPORTS_COLLECTION_ID ?? "";

const isConfigured = endpoint.length > 0 && projectId.length > 0;
const isGymBackendReady =
  isConfigured &&
  databaseId.length > 0 &&
  machinesCollectionId.length > 0 &&
  machineQueueCollectionId.length > 0 &&
  equipmentItemsCollectionId.length > 0 &&
  equipmentCheckoutsCollectionId.length > 0 &&
  equipmentReportsCollectionId.length > 0;

const client = new Client();

if (isConfigured) {
  client.setEndpoint(endpoint).setProject(projectId);

  if (Platform.OS !== "web") {
    client.setPlatform(Application.applicationId ?? "com.gymgenie.mobile");
  }
}

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };

export const gymBackendIds = {
  databaseId,
  collections: {
    machines: machinesCollectionId,
    machineQueueEntries: machineQueueCollectionId,
    equipmentItems: equipmentItemsCollectionId,
    equipmentCheckouts: equipmentCheckoutsCollectionId,
    equipmentReports: equipmentReportsCollectionId,
  },
} as const;

export const isAppwriteConfigured = (): boolean => isConfigured;
export const isGymBackendConfigured = (): boolean => isGymBackendReady;

const getMissingKeys = (keys: string[]): string[] =>
  keys.filter((key) => !(process.env[key] ?? "").trim());

const formatConfigError = (missingKeys: string[], label: string): string => {
  if (missingKeys.length === 0) {
    return `${label} is not configured.`;
  }

  return `${label} is not configured. Set ${missingKeys.join(", ")}.`;
};

export const APPWRITE_CONFIG_ERROR =
  formatConfigError(
    getMissingKeys([
      "EXPO_PUBLIC_APPWRITE_ENDPOINT",
      "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
    ]),
    "Appwrite",
  );

export const GYM_BACKEND_CONFIG_ERROR = formatConfigError(
  getMissingKeys([
    "EXPO_PUBLIC_APPWRITE_ENDPOINT",
    "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
    "EXPO_PUBLIC_APPWRITE_DATABASE_ID",
    "EXPO_PUBLIC_APPWRITE_MACHINES_COLLECTION_ID",
    "EXPO_PUBLIC_APPWRITE_MACHINE_QUEUE_COLLECTION_ID",
    "EXPO_PUBLIC_APPWRITE_EQUIPMENT_ITEMS_COLLECTION_ID",
    "EXPO_PUBLIC_APPWRITE_EQUIPMENT_CHECKOUTS_COLLECTION_ID",
    "EXPO_PUBLIC_APPWRITE_EQUIPMENT_REPORTS_COLLECTION_ID",
  ]),
  "Gym backend",
);
