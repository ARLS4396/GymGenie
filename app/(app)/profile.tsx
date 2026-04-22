import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";
import { isNonEmpty } from "@/utils/validation";

type FitnessGoal = "lose_weight" | "build_muscle" | "maintain" | "endurance" | "general_health" | "";
type ActivityLevel = "sedentary" | "light" | "moderate" | "very_active" | "athlete" | "";
type ProfileImageKey = "profile1" | "profile2" | "profile3" | "";

interface ProfileForm {
  fullName: string;
  username: string;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  profileImage: ProfileImageKey;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
}

const profileImageOptions: { key: Exclude<ProfileImageKey, "">; source: any }[] = [
  { key: "profile1", source: require("@/assets/profile-options/profile1.png") },
  { key: "profile2", source: require("@/assets/profile-options/profile2.png") },
  { key: "profile3", source: require("@/assets/profile-options/profile3.png") },
];

const fitnessGoals: { label: string; value: FitnessGoal }[] = [
  { label: "Lose Weight", value: "lose_weight" },
  { label: "Build Muscle", value: "build_muscle" },
  { label: "Maintain", value: "maintain" },
  { label: "Endurance", value: "endurance" },
  { label: "General Health", value: "general_health" },
];

const activityLevels: { label: string; value: ActivityLevel }[] = [
  { label: "Sedentary", value: "sedentary" },
  { label: "Light", value: "light" },
  { label: "Moderate", value: "moderate" },
  { label: "Very Active", value: "very_active" },
  { label: "Athlete", value: "athlete" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, authError } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    fullName: "", username: "", fitnessGoal: "", activityLevel: "",
    profileImage: "", age: "", height: "", weight: "", targetWeight: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName ?? "",
      username: user.username ?? "",
      fitnessGoal: (user.fitnessGoal as FitnessGoal) ?? "",
      activityLevel: (user.activityLevel as ActivityLevel) ?? "",
      profileImage: (user.profileImage as ProfileImageKey) ?? "",
      age: user.age ?? "",
      height: user.height ?? "",
      weight: user.weight ?? "",
      targetWeight: user.targetWeight ?? "",
    });
  }, [user]);

  const initials = useMemo(() => {
    const name = form.fullName.trim() || user?.fullName || "GG";
    return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  }, [form.fullName, user?.fullName]);

  const selectedProfileImage = profileImageOptions.find((o) => o.key === form.profileImage);

  const validate = (): boolean => {
    const e: Partial<Record<keyof ProfileForm, string>> = {};
    if (!isNonEmpty(form.fullName)) e.fullName = "Full name is required.";
    if (!isNonEmpty(form.username)) e.username = "Username is required.";
    if (!form.fitnessGoal) e.fitnessGoal = "Select a fitness goal.";
    if (!form.activityLevel) e.activityLevel = "Select an activity level.";
    if (!isNonEmpty(form.age)) e.age = "Age is required.";
    if (!isNonEmpty(form.height)) e.height = "Height is required.";
    if (!isNonEmpty(form.weight)) e.weight = "Weight is required.";
    if (!isNonEmpty(form.targetWeight)) e.targetWeight = "Target weight is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(null);
      await updateProfile({
        fullName: form.fullName, username: form.username,
        fitnessGoal: form.fitnessGoal, activityLevel: form.activityLevel,
        profileImage: form.profileImage, age: form.age,
        height: form.height, weight: form.weight,
        targetWeight: form.targetWeight, membershipTier: user?.membershipTier,
      });
      setSaveSuccess("Profile saved successfully.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer title="Profile" subtitle="Manage your info and fitness preferences.">
      {authError && <StatusBanner type="warning" message={authError} />}
      {saveError && <StatusBanner type="error" message={saveError} />}
      {saveSuccess && <StatusBanner type="success" message={saveSuccess} />}

      {/* Identity card */}
      <SectionCard style={styles.identityCard}>
        <View style={styles.avatarWrapper}>
          {selectedProfileImage ? (
            <Image source={selectedProfileImage.source} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{initials || "GG"}</Text>
            </View>
          )}
        </View>
        <View style={styles.identityInfo}>
          <Text style={styles.identityName}>{form.fullName || user?.fullName || "—"}</Text>
          <Text style={styles.identityMeta}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            {user?.membershipTier ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user.membershipTier}</Text>
              </View>
            ) : null}
            {form.fitnessGoal ? (
              <View style={[styles.badge, styles.badgeSecondary]}>
                <Text style={[styles.badgeText, styles.badgeTextSecondary]}>
                  {fitnessGoals.find((g) => g.value === form.fitnessGoal)?.label ?? form.fitnessGoal}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </SectionCard>

      {/* Profile picture */}
      <SectionCard>
        <Text style={styles.sectionTitle}>Profile Picture</Text>
        <View style={styles.avatarOptionsRow}>
          {profileImageOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setForm((c) => ({ ...c, profileImage: option.key }))}
              style={[
                styles.avatarOption,
                form.profileImage === option.key && styles.avatarOptionSelected,
              ]}
            >
              <Image source={option.source} style={styles.avatarOptionImg} />
            </Pressable>
          ))}
        </View>
      </SectionCard>

      {/* Account info (read-only) */}
      <SectionCard>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoGrid}>
          {[
            { label: "Email", value: user?.email },
            { label: "Username", value: user?.username },
            { label: "Membership", value: user?.membershipTier ?? "None selected" },
          ].map(({ label, value }) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value ?? "—"}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Personal info form */}
      <SectionCard>
        <Text style={styles.sectionTitle}>Personal Info</Text>
        <FormField
          label="Full Name"
          value={form.fullName}
          onChangeText={(v) => setForm((c) => ({ ...c, fullName: v }))}
          error={errors.fullName}
          placeholder="Jane Doe"
        />
        <FormField
          label="Username"
          value={form.username}
          onChangeText={(v) => setForm((c) => ({ ...c, username: v }))}
          error={errors.username}
          autoCapitalize="none"
          autoComplete="username"
          placeholder="gymgoals99"
        />
        <View style={styles.row}>
          <View style={styles.rowField}>
            <FormField
              label="Age"
              value={form.age}
              onChangeText={(v) => setForm((c) => ({ ...c, age: v }))}
              error={errors.age}
              placeholder="30"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.rowField}>
            <FormField
              label="Height"
              value={form.height}
              onChangeText={(v) => setForm((c) => ({ ...c, height: v }))}
              error={errors.height}
              placeholder={`5'10"`}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.rowField}>
            <FormField
              label="Weight (lbs)"
              value={form.weight}
              onChangeText={(v) => setForm((c) => ({ ...c, weight: v }))}
              error={errors.weight}
              placeholder="170"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.rowField}>
            <FormField
              label="Target Weight"
              value={form.targetWeight}
              onChangeText={(v) => setForm((c) => ({ ...c, targetWeight: v }))}
              error={errors.targetWeight}
              placeholder="160"
              keyboardType="numeric"
            />
          </View>
        </View>
      </SectionCard>

      {/* Fitness Goal chips */}
      <SectionCard>
        <Text style={styles.sectionTitle}>Fitness Goal</Text>
        <View style={styles.chipGrid}>
          {fitnessGoals.map((goal) => {
            const isActive = form.fitnessGoal === goal.value;
            return (
              <Pressable
                key={goal.value}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setForm((c) => ({ ...c, fitnessGoal: goal.value }))}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {goal.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {errors.fitnessGoal ? <Text style={styles.errorText}>{errors.fitnessGoal}</Text> : null}
      </SectionCard>

      {/* Activity Level chips */}
      <SectionCard>
        <Text style={styles.sectionTitle}>Activity Level</Text>
        <View style={styles.chipGrid}>
          {activityLevels.map((level) => {
            const isActive = form.activityLevel === level.value;
            return (
              <Pressable
                key={level.value}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setForm((c) => ({ ...c, activityLevel: level.value }))}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {level.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {errors.activityLevel ? <Text style={styles.errorText}>{errors.activityLevel}</Text> : null}
      </SectionCard>

      <View style={styles.buttonGroup}>
        <AppButton label={isSaving ? "Saving..." : "Save Profile"} loading={isSaving} onPress={handleSave} />
        <AppButton label="View Membership Plans" variant="secondary" onPress={() => router.push("./membership")} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatarWrapper: {
    flexShrink: 0,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  identityInfo: {
    flex: 1,
    gap: 4,
  },
  identityName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  identityMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeSecondary: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  badgeTextSecondary: {
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  avatarOptionsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "center",
    paddingVertical: theme.spacing.xs,
  },
  avatarOption: {
    borderWidth: 2.5,
    borderColor: "transparent",
    borderRadius: 34,
    padding: 3,
  },
  avatarOptionSelected: {
    borderColor: theme.colors.primary,
  },
  avatarOptionImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.secondary,
  },
  infoGrid: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  rowField: {
    flex: 1,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.errorText,
    marginTop: 4,
  },
  buttonGroup: {
    gap: theme.spacing.sm,
  },
});
