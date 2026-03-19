import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";
import { isNonEmpty } from "@/utils/validation";

interface ProfileForm {
  fullName: string;
  username: string;
  fitnessGoal: string;
  profileImage: string;
}

export default function ProfileScreen() {
  const { user, updateProfile, authError } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    username: "",
    fitnessGoal: "",
    profileImage: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      fullName: user.fullName,
      username: user.username,
      fitnessGoal: user.fitnessGoal,
      profileImage: user.profileImage ?? "",
    });
  }, [user]);

  const initials = useMemo(() => {
    const fullName = form.fullName.trim() || user?.fullName || "Gym Genie";

    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [form.fullName, user?.fullName]);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof ProfileForm, string>> = {};

    if (!isNonEmpty(form.fullName)) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!isNonEmpty(form.username)) {
      nextErrors.username = "Username is required.";
    }

    if (!isNonEmpty(form.fitnessGoal)) {
      nextErrors.fitnessGoal = "Fitness goal is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      await updateProfile({
        fullName: form.fullName,
        username: form.username,
        fitnessGoal: form.fitnessGoal,
        profileImage: form.profileImage,
      });

      setSaveSuccess("Profile information saved successfully.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer
      title="Profile"
      subtitle="Review your member information and update the stored profile record."
    >
      {authError ? <StatusBanner type="warning" message={authError} /> : null}
      {saveError ? <StatusBanner type="error" message={saveError} /> : null}
      {saveSuccess ? <StatusBanner type="success" message={saveSuccess} /> : null}

      <SectionCard style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "GG"}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.identityName}>{user?.fullName}</Text>
          <Text style={styles.identityMeta}>{user?.email}</Text>
          <Text style={styles.identityMeta}>Workout focus: {user?.fitnessGoal}</Text>
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
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Edit Profile</Text>
        <View style={styles.form}>
          <FormField
            label="Full Name"
            value={form.fullName}
            onChangeText={(fullName) => setForm((current) => ({ ...current, fullName }))}
            error={errors.fullName}
            placeholder="Jane Doe"
          />
          <FormField
            label="Username"
            value={form.username}
            onChangeText={(username) => setForm((current) => ({ ...current, username }))}
            error={errors.username}
            autoCapitalize="none"
            autoComplete="username"
            placeholder="gymgoals99"
          />
          <FormField
            label="Workout Focus / Goal"
            value={form.fitnessGoal}
            onChangeText={(fitnessGoal) =>
              setForm((current) => ({ ...current, fitnessGoal }))
            }
            error={errors.fitnessGoal}
            placeholder="Build strength and consistency"
            multiline
            numberOfLines={2}
          />
          <FormField
            label="Profile Image Placeholder URL (optional)"
            value={form.profileImage}
            onChangeText={(profileImage) =>
              setForm((current) => ({ ...current, profileImage }))
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
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  infoGrid: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  value: {
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  form: {
    gap: theme.spacing.sm,
  },
});
