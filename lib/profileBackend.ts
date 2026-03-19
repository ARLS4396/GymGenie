import {
  AppwriteException,
  Permission,
  Role,
} from "react-native-appwrite";
import {
  databases,
  gymBackendIds,
  isGymBackendConfigured,
} from "@/lib/appwrite";
import type { ProfileRecord } from "@/types/profile";

export interface StoredProfileInput {
  userId: string;
  fullName: string;
  email: string;
  username: string;
  fitnessGoal: string;
  profileImage?: string;
}

const getProfilePermissions = (userId: string): string[] => [
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
];

const buildProfilePayload = (input: StoredProfileInput) => ({
  userId: input.userId,
  fullName: input.fullName.trim(),
  email: input.email.trim().toLowerCase(),
  username: input.username.trim(),
  fitnessGoal: input.fitnessGoal.trim(),
  profileImage: input.profileImage?.trim() || undefined,
});

export const fetchStoredProfile = async (
  userId: string,
): Promise<ProfileRecord | null> => {
  if (!isGymBackendConfigured()) {
    return null;
  }

  try {
    return await databases.getDocument<ProfileRecord>(
      gymBackendIds.databaseId,
      gymBackendIds.collections.profiles,
      userId,
    );
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return null;
    }

    throw error;
  }
};

export const upsertStoredProfile = async (
  input: StoredProfileInput,
): Promise<ProfileRecord | null> => {
  if (!isGymBackendConfigured()) {
    return null;
  }

  const payload = buildProfilePayload(input);

  try {
    await databases.getDocument<ProfileRecord>(
      gymBackendIds.databaseId,
      gymBackendIds.collections.profiles,
      input.userId,
    );

    return await databases.updateDocument<ProfileRecord>(
      gymBackendIds.databaseId,
      gymBackendIds.collections.profiles,
      input.userId,
      payload,
    );
  } catch (error) {
    if (!(error instanceof AppwriteException) || error.code !== 404) {
      throw error;
    }
  }

  try {
    return await databases.createDocument<ProfileRecord>(
      gymBackendIds.databaseId,
      gymBackendIds.collections.profiles,
      input.userId,
      payload,
      getProfilePermissions(input.userId),
    );
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      return null;
    }

    throw error;
  }
};
