import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
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
    activityLevel: "",
    profileImage: "",
    age: "",
    height: "",
    weight: "",
    targetWeight: "",
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
    const fullName = form.fullName.trim() || user?.fullName || "GG";

    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [form.fullName, user?.fullName]);

  const selectedProfileImage = profileImageOptions.find(
    (option) => option.key === form.profileImage
  );

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof ProfileForm, string>> = {};

    if (!isNonEmpty(form.fullName)) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!isNonEmpty(form.username)) {
      nextErrors.username = "Username is required.";
    }

    if (!form.fitnessGoal) {
      nextErrors.fitnessGoal = "Fitness goal is required.";
    }

    if (!form.activityLevel) {
      nextErrors.activityLevel = "Activity level is required.";
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
        age: form.age,
        height: form.height,
        weight: form.weight,
        targetWeight: form.targetWeight,
        membershipTier: user?.membershipTier,
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
        <View style={styles.avatarWrapper}>
          {selectedProfileImage ? (
            <Image
              source={selectedProfileImage.source}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "GG"}</Text>
            </View>
          )}
        </View>

        <View style={styles.identityCopy}>
          <Text style={styles.identityName}>{form.fullName || user?.fullName}</Text>
          <Text style={styles.identityMeta}>{user?.email}</Text>
          <Text style={styles.identityMeta}>
            Goal: {form.fitnessGoal || "Not set"}
          </Text>
          <Text style={styles.identityMeta}>
            Activity: {form.activityLevel || "Not set"}
          </Text>
          <Text style={styles.identityMeta}>
            Membership: {user?.membershipTier ?? "No membership selected"}
          </Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Choose a Profile Picture</Text>

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
            <Text style={styles.label}>Membership Tier</Text>
            <Text style={styles.value}>
              {user?.membershipTier ?? "No membership selected"}
            </Text>
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
        </View>

        <Text style={styles.label}>Fitness Goal</Text>
          <View style={styles.dropdown}>
            <Picker
              selectedValue={form.fitnessGoal}
              onValueChange={(value: FitnessGoal) =>
                setForm((current) => ({ ...current, fitnessGoal: value }))
              }
              style={styles.picker}
              itemStyle={styles.pickerItem}
              mode="dropdown"
            >
              <Picker.Item label="Select a goal..." value="" color="#888888" />
              <Picker.Item label="Lose weight" value="lose_weight" color="#000000" />
              <Picker.Item label="Build muscle" value="build_muscle" color="#000000" />
              <Picker.Item label="Maintain fitness" value="maintain" color="#000000" />
              <Picker.Item label="Improve endurance" value="endurance" color="#000000" />
              <Picker.Item label="General health" value="general_health" color="#000000" />
            </Picker>
          </View>
          {errors.fitnessGoal ? (
            <Text style={styles.errorText}>{errors.fitnessGoal}</Text>
          ) : null}

          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.dropdown}>
            <Picker
              selectedValue={form.activityLevel}
              onValueChange={(value: ActivityLevel) =>
                setForm((current) => ({ ...current, activityLevel: value }))
              }
              style={styles.picker}
              itemStyle={styles.pickerItem}
              mode="dropdown"
            >
              <Picker.Item label="Select activity level..." value="" color="#888888" />
              <Picker.Item label="Sedentary" value="sedentary" color="#000000" />
              <Picker.Item label="Lightly active" value="light" color="#000000" />
              <Picker.Item label="Moderately active" value="moderate" color="#000000" />
              <Picker.Item label="Very active" value="very_active" color="#000000" />
              <Picker.Item label="Athlete" value="athlete" color="#000000" />
            </Picker>
          </View>
          {errors.activityLevel ? (
            <Text style={styles.errorText}>{errors.activityLevel}</Text>
          ) : null}
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
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  avatarWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#D9D9D9",
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
    fontWeight: "600",
    marginTop: 10,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  form: {
    gap: theme.spacing.md,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    marginTop: 0,
    height: 160,
    width: "100%",
    justifyContent: "center",
  },
  picker: {
    color: theme.colors.textPrimary,
    width: "100%",
    height: 150,
    overflow: "hidden"
  },
  pickerItem: {
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.errorText,
  },
  imageOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  imageOptionWrapper: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 24,
    padding: 2,
  },
  imageOptionSelected: {
    borderColor: theme.colors.primary,
  },
  imageOption: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D9D9D9",
  },
  buttonGroup: {
    gap: theme.spacing.sm,
  },
});
