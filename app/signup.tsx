import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { AppButton } from "@/components/ui/AppButton";
import { FormField } from "@/components/ui/FormField";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";
import { isNonEmpty, isValidEmail, isValidPassword } from "@/utils/validation";

interface SignUpForm {
  fullName: string;
  email: string;
  username: string;
  fitnessGoal: string;
  password: string;
}

const FITNESS_GOALS = [
  { label: "Lose weight", value: "lose_weight" },
  { label: "Build muscle", value: "build_muscle" },
  { label: "Maintain fitness", value: "maintain" },
  { label: "Improve endurance", value: "endurance" },
  { label: "General health", value: "general_health" },
];

export default function SignUpScreen() {
  const router = useRouter();
  const { status, signUp, authError, clearAuthError } = useAuth();

  const [form, setForm] = useState<SignUpForm>({
    fullName: "",
    email: "",
    username: "",
    fitnessGoal: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignUpForm, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  if (status === "loading") {
    return <LoadingScreen text="Loading sign up..." />;
  }

  if (status === "authenticated") {
    return <Redirect href="./home" />;
  }

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof SignUpForm, string>> = {};

    if (!isNonEmpty(form.fullName)) nextErrors.fullName = "Full name is required.";
    if (!isValidEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!isNonEmpty(form.username)) nextErrors.username = "Username is required.";
    if (!isNonEmpty(form.fitnessGoal)) nextErrors.fitnessGoal = "Select a fitness goal.";
    if (!isValidPassword(form.password)) nextErrors.password = "Password must be at least 8 characters.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await signUp(form);
      router.replace("./home");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      title="Create Account"
      subtitle="Set up your Gym Genie profile."
    >
      {authError ? <StatusBanner type="warning" message={authError} /> : null}
      {submitError ? <StatusBanner type="error" message={submitError} /> : null}

      <View style={styles.form}>
        <FormField
          label="Full Name"
          value={form.fullName}
          onChangeText={(fullName) => setForm((c) => ({ ...c, fullName }))}
          placeholder="Jane Doe"
          autoCapitalize="words"
          error={errors.fullName}
        />

        <FormField
          label="Email"
          value={form.email}
          onChangeText={(email) => setForm((c) => ({ ...c, email }))}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <FormField
          label="Username"
          value={form.username}
          onChangeText={(username) => setForm((c) => ({ ...c, username }))}
          placeholder="gymgoals99"
          autoCapitalize="none"
          error={errors.username}
        />

        {/* FITNESS GOAL DROPDOWN */}
        <View>
          <Text style={styles.label}>Fitness Goal</Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.fitnessGoal}
              onValueChange={(value: string) =>
                setForm((c) => ({ ...c, fitnessGoal: value }))
              }
            >
              <Picker.Item label="Select a goal..." value="" />
              {FITNESS_GOALS.map((goal) => (
                <Picker.Item
                  key={goal.value}
                  label={goal.label}
                  value={goal.value}
                />
              ))}
            </Picker>
          </View>

          {errors.fitnessGoal && (
            <Text style={styles.errorText}>{errors.fitnessGoal}</Text>
          )}
        </View>

        <FormField
          label="Password"
          value={form.password}
          onChangeText={(password) => setForm((c) => ({ ...c, password }))}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
        />
      </View>

      <AppButton
        label={isSubmitting ? "Creating account..." : "Sign Up"}
        loading={isSubmitting}
        onPress={handleSubmit}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={() => router.push("./login")}>
          <Text style={styles.footerLink}>Log in</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    justifyContent: "center",
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.colors.background,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});