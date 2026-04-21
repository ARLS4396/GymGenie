import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  confirmPassword: string;
}

const FITNESS_GOALS = [
  { label: "Lose Weight", value: "lose_weight" },
  { label: "Build Muscle", value: "build_muscle" },
  { label: "Maintain", value: "maintain" },
  { label: "Endurance", value: "endurance" },
  { label: "General Health", value: "general_health" },
];

export default function SignUpScreen() {
  const router = useRouter();
  const { status, signUp, clearAuthError } = useAuth();

  const [form, setForm] = useState<SignUpForm>({
    fullName: "", email: "", username: "", fitnessGoal: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpForm, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  if (status === "loading") return <LoadingScreen text="Loading sign up..." />;
  if (status === "authenticated") return <Redirect href="./home" />;

  const validate = (): boolean => {
    const e: Partial<Record<keyof SignUpForm, string>> = {};
    if (!isNonEmpty(form.fullName)) e.fullName = "Full name is required.";
    if (!isValidEmail(form.email)) e.email = "Enter a valid email address.";
    if (!isNonEmpty(form.username)) e.username = "Username is required.";
    if (!isNonEmpty(form.fitnessGoal)) e.fitnessGoal = "Select a fitness goal.";
    if (!isValidPassword(form.password)) e.password = "Password must be at least 8 characters.";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
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
      safeAreaTop
    >
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
          autoComplete="email"
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

        {/* Fitness Goal chips */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Fitness Goal</Text>
          <View style={styles.chipGrid}>
            {FITNESS_GOALS.map((goal) => {
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
        </View>

        <FormField
          label="Password"
          value={form.password}
          onChangeText={(password) => setForm((c) => ({ ...c, password }))}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.password}
        />
        <FormField
          label="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(confirmPassword) => setForm((c) => ({ ...c, confirmPassword }))}
          placeholder="Re-enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.confirmPassword}
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
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
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
});
