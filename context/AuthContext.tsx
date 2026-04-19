import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { AppwriteException, type Models } from "react-native-appwrite";
import {
  account,
  APPWRITE_CONFIG_ERROR,
  ID,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import type {
  AuthContextValue,
  AuthStatus,
  LoginInput,
  SignUpInput,
} from "@/types/auth";
import type {
  ProfilePrefs,
  ProfileUpdateInput,
  UserProfile,
} from "@/types/profile";
import { getErrorMessage } from "@/utils/appwriteError";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const mapUserToProfile = (user: Models.User<ProfilePrefs>): UserProfile => {
  const username = user.prefs?.username?.trim();
  const fitnessGoal = user.prefs?.fitnessGoal?.trim();
  const profileImage = user.prefs?.profileImage?.trim();
  const membershipTier = user.prefs?.membershipTier?.trim();
  //health stats
  const age = user.prefs?.age?.trim();
  const height = user.prefs?.height?.trim();
  const weight = user.prefs?.weight?.trim();
  const targetWeight = user.prefs?.targetWeight?.trim();
  const activityLevel = user.prefs?.activityLevel?.trim();
  

  return {
    id: user.$id,
    fullName: user.name,
    email: user.email,
    username: username && username.length > 0 ? username : user.email.split("@")[0],
    fitnessGoal:
      fitnessGoal && fitnessGoal.length > 0 ? fitnessGoal : "General fitness",
    profileImage: profileImage && profileImage.length > 0 ? profileImage : undefined,
    membershipTier:
      membershipTier && membershipTier.length > 0 ? membershipTier : undefined,
    //health stats
    age: age && age.length > 0 ? age : undefined,
    height: height && height.length > 0 ? height : undefined,
    weight: weight && weight.length > 0 ? weight : undefined,
    targetWeight: targetWeight && targetWeight.length > 0 ? targetWeight : undefined,
    activityLevel:
      activityLevel && activityLevel.length > 0 ? activityLevel : undefined,
  };
};

const isUnauthorized = (error: unknown): boolean =>
  error instanceof AppwriteException && error.code === 401;

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const bootstrapSession = useCallback(async () => {
    if (!isAppwriteConfigured()) {
      setAuthError(APPWRITE_CONFIG_ERROR);
      setStatus("unauthenticated");
      return;
    }

    try {
      const currentUser = await account.get<ProfilePrefs>();
      setUser(mapUserToProfile(currentUser));
      setStatus("authenticated");
    } catch (error) {
      if (isUnauthorized(error)) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      setAuthError(getErrorMessage(error));
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  const refreshUser = useCallback(async () => {
    if (!isAppwriteConfigured()) {
      throw new Error(APPWRITE_CONFIG_ERROR);
    }

    const currentUser = await account.get<ProfilePrefs>();
    setUser(mapUserToProfile(currentUser));
    setStatus("authenticated");
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    if (!isAppwriteConfigured()) {
      const message = APPWRITE_CONFIG_ERROR;
      setAuthError(message);
      throw new Error(message);
    }

    const email = normalizeEmail(input.email);

    try {
      setAuthError(null);

      await account.create(ID.unique(), email, input.password, input.fullName.trim());
      await account.createEmailPasswordSession(email, input.password);
      await account.updatePrefs<ProfilePrefs>({
        username: input.username.trim(),
        fitnessGoal: input.fitnessGoal.trim(),
        membershipTier: "",
        age: "",
        height: "",
        weight: "",
        targetWeight: "",
        activityLevel: ""
      });

      const currentUser = await account.get<ProfilePrefs>();
      setUser(mapUserToProfile(currentUser));
      setStatus("authenticated");
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthError(message);
      setUser(null);
      setStatus("unauthenticated");
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    if (!isAppwriteConfigured()) {
      const message = APPWRITE_CONFIG_ERROR;
      setAuthError(message);
      throw new Error(message);
    }

    const email = normalizeEmail(input.email);

    try {
      setAuthError(null);

      await account.createEmailPasswordSession(email, input.password);
      const currentUser = await account.get<ProfilePrefs>();
      setUser(mapUserToProfile(currentUser));
      setStatus("authenticated");
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthError(message);
      setUser(null);
      setStatus("unauthenticated");
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    if (!isAppwriteConfigured()) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      await account.deleteSession("current");
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw new Error(getErrorMessage(error));
      }
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const updateProfile = useCallback(async (input: ProfileUpdateInput) => {
    if (!isAppwriteConfigured()) {
      const message = APPWRITE_CONFIG_ERROR;
      setAuthError(message);
      throw new Error(message);
    }

    try {
      setAuthError(null);

      const nextProfileImage = input.profileImage?.trim();
      const currentPrefs = await account.getPrefs<ProfilePrefs>();

      await account.updateName(input.fullName.trim());
      await account.updatePrefs<ProfilePrefs>({
        ...currentPrefs,
        username: input.username.trim(),
        fitnessGoal: input.fitnessGoal.trim(),
        profileImage:
          nextProfileImage && nextProfileImage.length > 0
            ? nextProfileImage
            : undefined,
        membershipTier: input.membershipTier?.trim() || "",
        age: input.age?.trim() || "",
        height: input.height?.trim() || "",
        weight: input.weight?.trim() || "",
        targetWeight: input.targetWeight?.trim() || "",
        activityLevel: input.activityLevel?.trim() || "",
      });

      const currentUser = await account.get<ProfilePrefs>();
      setUser(mapUserToProfile(currentUser));
      setStatus("authenticated");
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      authError,
      login,
      signUp,
      logout,
      updateProfile,
      refreshUser,
      clearAuthError,
    }),
    [
      status,
      user,
      authError,
      login,
      signUp,
      logout,
      updateProfile,
      refreshUser,
      clearAuthError,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

