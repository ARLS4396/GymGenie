import type { ProfileUpdateInput, UserProfile } from "@/types/profile";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  username: string;
  fitnessGoal: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  authError: string | null;
  login: (input: LoginInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearAuthError: () => void;
}

