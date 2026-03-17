import { useEffect, useState } from "react";
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

      setSaveSuccess("Profile saved successfully.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer title="Profile" subtitle="View and edit your account details.">
      {authError ? <StatusBanner type="warning" message={authError} /> : null}
      {saveError ? <StatusBanner type="error" message={saveError} /> : null}
      {saveSuccess ? <StatusBanner type="success" message={saveSuccess} /> : null}

      <SectionCard>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </SectionCard>

      <SectionCard>
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
            label="Fitness Goal"
            value={form.fitnessGoal}
            onChangeText={(fitnessGoal) =>
              setForm((current) => ({ ...current, fitnessGoal }))
            }
            error={errors.fitnessGoal}
            placeholder="Build strength and consistency"
          />
          <FormField
            label="Profile Image URL (optional)"
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
