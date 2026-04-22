export interface ProfilePrefs {
  username?: string;
  fitnessGoal?: string;
  profileImage?: string;
  age?: string;
  height?: string;
  weight?: string;
  targetWeight?: string;
  activityLevel?: string;
  membershipTier?: string;
}

export interface ProfileUpdateInput {
  fullName: string;
  username: string;
  fitnessGoal: string;
  profileImage?: string;
  age?: string;
  height?: string;
  weight?: string;
  targetWeight?: string;
  activityLevel?: string;
  membershipTier?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  fitnessGoal: string;
  profileImage?: string;
  age?: string;
  height?: string;
  weight?: string;
  targetWeight?: string;
  activityLevel?: string;
  membershipTier?: string;
}

