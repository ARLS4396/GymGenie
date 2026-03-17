export interface ProfilePrefs {
  username?: string;
  fitnessGoal?: string;
  profileImage?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  fitnessGoal: string;
  profileImage?: string;
}

export interface ProfileUpdateInput {
  fullName: string;
  username: string;
  fitnessGoal: string;
  profileImage?: string;
}
