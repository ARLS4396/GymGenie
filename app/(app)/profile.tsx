import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { AppButton } from "@/components/ui/AppButton";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";
import { isNonEmpty } from "@/utils/validation";

type FitnessGoal =
  | "lose_weight"
  | "build_muscle"
  | "maintain"
  | "endurance"
  | "general_health"
  | "";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active"
  | "athlete"
  | "";

interface ProfileForm {
  fullName: string;
  username: string;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  profileImage: string;
}

export default function ProfileScreen() {
  const { user, updateProfile, authError } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    username: "",
    fitnessGoal: "",
    activityLevel: "",
    profileImage: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileForm, string>>
  >({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      fullName: user.fullName,
      username: user.username,
      fitnessGoal: user.fitnessGoal as FitnessGoal,
      activityLevel: user.activityLevel as ActivityLevel,
      profileImage: user.profileImage ?? "",
    });
  }, [user]);

  const initials = useMemo(() => {
    const fullName = form.fullName.trim() || user?.fullName || "GG";

    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }, [form.fullName, user?.fullName]);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof ProfileForm, string>> = {};

    if (!isNonEmpty(form.fullName)) nextErrors.fullName = "Full name is required.";
    if (!isNonEmpty(form.username)) nextErrors.username = "Username is required.";
    if (!form.fitnessGoal) nextErrors.fitnessGoal = "Fitness goal is required.";
    if (!form.activityLevel) nextErrors.activityLevel = "Activity level is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      await updateProfile({
        fullName: form.fullName,
        username: form.username,
        fitnessGoal: form.fitnessGoal,
        activityLevel: form.activityLevel,
        profileImage: form.profileImage,
      });

      setSaveSuccess("Profile information saved successfully.");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer
      title="Profile"
      subtitle="Review your member information and update your fitness preferences."
    >
      {authError && <StatusBanner type="warning" message={authError} />}
      {saveError && <StatusBanner type="error" message={saveError} />}
      {saveSuccess && <StatusBanner type="success" message={saveSuccess} />}

      <SectionCard style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "GG"}</Text>
        </View>

        <View style={styles.identityCopy}>
          <Text style={styles.identityName}>{user?.fullName}</Text>
          <Text style={styles.identityMeta}>{user?.email}</Text>
          <Text style={styles.identityMeta}>Goal: {user?.fitnessGoal}</Text>
          <Text style={styles.identityMeta}>Activity: {user?.activityLevel}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Stored Account Details</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user?.username}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Goal</Text>
            <Text style={styles.value}>{user?.fitnessGoal}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Activity Level</Text>
            <Text style={styles.value}>{user?.activityLevel}</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Edit Profile</Text>

        <View style={styles.form}>
          <FormField
            label="Full Name"
            value={form.fullName}
            onChangeText={(fullName) =>
              setForm((c) => ({ ...c, fullName }))
            }
            error={errors.fullName}
            placeholder="Jane Doe"
          />

          <FormField
            label="Username"
            value={form.username}
            onChangeText={(username) =>
              setForm((c) => ({ ...c, username }))
            }
            error={errors.username}
            autoCapitalize="none"
            placeholder="gymgoals99"
          />

          <Text style={styles.label}>Fitness Goal</Text>
          <View style={styles.dropdown}>
            <Picker
              selectedValue={form.fitnessGoal}
              onValueChange={(value: FitnessGoal) =>
                setForm((c) => ({ ...c, fitnessGoal: value }))
              }
            >
              <Picker.Item label="Select a goal..." value="" />
              <Picker.Item label="Lose weight" value="lose_weight" />
              <Picker.Item label="Build muscle" value="build_muscle" />
              <Picker.Item label="Maintain fitness" value="maintain" />
              <Picker.Item label="Improve endurance" value="endurance" />
              <Picker.Item label="General health" value="general_health" />
            </Picker>
          </View>

          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.dropdown}>
            <Picker
              selectedValue={form.activityLevel}
              onValueChange={(value: ActivityLevel) =>
                setForm((c) => ({ ...c, activityLevel: value }))
              }
            >
              <Picker.Item label="Select activity level..." value="" />
              <Picker.Item label="Sedentary" value="sedentary" />
              <Picker.Item label="Lightly active" value="light" />
              <Picker.Item label="Moderately active" value="moderate" />
              <Picker.Item label="Very active" value="very_active" />
              <Picker.Item label="Athlete" value="athlete" />
            </Picker>
          </View>

          <FormField
            label="Profile Image URL (optional)"
            value={form.profileImage}
            onChangeText={(profileImage) =>
              setForm((c) => ({ ...c, profileImage }))
            }
            autoCapitalize="none"
            placeholder="https://example.com/avatar.jpg"
          />
        </View>
      </SectionCard>

      <AppButton
        label={isSaving ? "Saving..." : "Save Profile"}
        loading={isSaving}
        onPress={handleSave}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  identityCopy: {
    flex: 1,
    gap: 4,
  },
  identityName: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  identityMeta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  infoGrid: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },
  value: {
    fontSize: 15,
  },
  form: {
    gap: theme.spacing.md,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginTop: 6,
    overflow: "hidden",
  },
});