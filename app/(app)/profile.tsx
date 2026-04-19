import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";
import { isNonEmpty } from "@/utils/validation";

type ProfileImageKey =
  | "profile1"
  | "profile2"
  | "profile3"

interface ProfileForm {
  fullName: string;
  username: string;
  fitnessGoal: string;
  profileImage: string;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  activityLevel: string;
}

const profileImageOptions: { key: ProfileImageKey; source: any }[] = [
  {
    key: "profile1",
    source: require("@/assets/profile-options/profile1.png"),
  },
  {
    key: "profile2",
    source: require("@/assets/profile-options/profile2.png"),
  },
  {
    key: "profile3",
    source: require("@/assets/profile-options/profile3.png"),
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, authError } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    username: "",
    fitnessGoal: "",
    profileImage: "",
    age: "",
    height: "",
    weight: "",
    targetWeight: "",
    activityLevel: "",
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
      age: user.age ?? "",
      height: user.height ?? "",
      weight: user.weight ?? "",
      targetWeight: user.targetWeight ?? "",
      activityLevel: user.activityLevel ?? "",
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

    if (!isNonEmpty(form.age)) {
      nextErrors.age = "Age is required.";
    }

    if (!isNonEmpty(form.height)) {
      nextErrors.height = "Height is required.";
    }

    if (!isNonEmpty(form.weight)) {
      nextErrors.weight = "Weight is required.";
    }

    if (!isNonEmpty(form.targetWeight)) {
      nextErrors.targetWeight = "Target weight is required.";
    }

    if (!isNonEmpty(form.activityLevel)) {
      nextErrors.activityLevel = "Activity level is required.";
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
        age: form.age,
        height: form.height,
        weight: form.weight,
        targetWeight: form.targetWeight,
        activityLevel: form.activityLevel,
        membershipTier: user?.membershipTier,
      });

      setSaveSuccess("Profile saved successfully.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProfileImage = profileImageOptions.find(
    (option) => option.key === form.profileImage,
  );

  return (
    <ScreenContainer title="Profile" subtitle="View and edit your account details.">
      {authError ? <StatusBanner type="warning" message={authError} /> : null}
      {saveError ? <StatusBanner type="error" message={saveError} /> : null}
      {saveSuccess ? <StatusBanner type="success" message={saveSuccess} /> : null}

      <SectionCard>
        <View style={styles.headerRow}>
          <View style={styles.emailTextContainer}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>

            <Text style={[styles.label, styles.membershipLabel, {marginTop: theme.spacing.lg}]}>Membership Tier</Text>
            <Text style={[styles.value, {fontWeight: 'bold'}]}>
              {user?.membershipTier ?? "No membership selected"}
            </Text>
          </View>

          <View style={styles.profileArea}>
            {selectedProfileImage ? (
              <Image
                source={selectedProfileImage.source}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>No Image</Text>
              </View>
            )}

            <Text style={styles.choosePictureLabel}>Choose a Profile Picture</Text>

            <View style={styles.imageOptionsRow}>
              {profileImageOptions.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() =>
                    setForm((current) => ({ ...current, profileImage: option.key }))
                  }
                  style={[
                    styles.imageOptionWrapper,
                    form.profileImage === option.key ? styles.imageOptionSelected : null,
                  ]}
                >
                  <Image source={option.source} style={styles.imageOption} />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
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
            label="Age"
            value={form.age}
            onChangeText={(age) => setForm((current) => ({ ...current, age }))}
            error={errors.age}
            placeholder="30"
            keyboardType="numeric"
          />

          <FormField
            label="Height"
            value={form.height}
            onChangeText={(height) => setForm((current) => ({ ...current, height }))}
            error={errors.height}
            placeholder={`5'10"`}
          />

          <FormField
            label="Weight"
            value={form.weight}
            onChangeText={(weight) => setForm((current) => ({ ...current, weight }))}
            error={errors.weight}
            placeholder="170"
            keyboardType="numeric"
          />

          <FormField
            label="Target Weight"
            value={form.targetWeight}
            onChangeText={(targetWeight) =>
              setForm((current) => ({ ...current, targetWeight }))
            }
            error={errors.targetWeight}
            placeholder="160"
            keyboardType="numeric"
          />

          <FormField
            label="Activity Level"
            value={form.activityLevel}
            onChangeText={(activityLevel) =>
              setForm((current) => ({ ...current, activityLevel }))
            }
            error={errors.activityLevel}
            placeholder="Moderately active"
          />
        </View>
      </SectionCard>

      <View style={styles.buttonGroup}>
        <AppButton
          label={isSaving ? "Saving..." : "Save Profile"}
          loading={isSaving}
          onPress={handleSave}
        />
        <AppButton
          label="View Membership Plans"
          variant="secondary"
          onPress={() => router.push("./membership")}
        />
      </View>
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
  membershipLabel: {
    marginTop: theme.spacing.sm,
  },
  form: {
    gap: theme.spacing.sm,
  },
  buttonGroup: {
    gap: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  emailTextContainer: {
    flex: 1,
  },
  profileArea: {
    alignItems: "center",
    maxWidth: 180,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D9D9D9",
    marginBottom: theme.spacing.xs,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  imagePlaceholderText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  choosePictureLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  imageOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  imageOptionWrapper: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 22,
    padding: 2,
  },
  imageOptionSelected: {
    borderColor: theme.colors.primary,
  },
  imageOption: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#D9D9D9",
  },
});
