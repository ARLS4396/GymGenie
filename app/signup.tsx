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
}

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

    if (!isNonEmpty(form.fullName)) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!isValidEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!isNonEmpty(form.username)) {
      nextErrors.username = "Username is required.";
    }

    if (!isNonEmpty(form.fitnessGoal)) {
      nextErrors.fitnessGoal = "Fitness goal is required.";
    }

    if (!isValidPassword(form.password)) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

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
      subtitle="Set up your gym profile to unlock queues and equipment checkouts."
    >
      {authError ? <StatusBanner type="warning" message={authError} /> : null}
      {submitError ? <StatusBanner type="error" message={submitError} /> : null}

      <View style={styles.form}>
        <FormField
          label="Full Name"
          value={form.fullName}
          onChangeText={(fullName) => setForm((current) => ({ ...current, fullName }))}
          placeholder="Jane Doe"
          autoCapitalize="words"
          autoComplete="name"
          error={errors.fullName}
        />
        <FormField
          label="Email"
          value={form.email}
          onChangeText={(email) => setForm((current) => ({ ...current, email }))}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />
        <FormField
          label="Username"
          value={form.username}
          onChangeText={(username) => setForm((current) => ({ ...current, username }))}
          placeholder="gymgoals99"
          autoCapitalize="none"
          autoComplete="username"
          error={errors.username}
        />
        <FormField
          label="Fitness Goal"
          value={form.fitnessGoal}
          onChangeText={(fitnessGoal) =>
            setForm((current) => ({ ...current, fitnessGoal }))
          }
          placeholder="Build strength and consistency"
          autoCapitalize="sentences"
          error={errors.fitnessGoal}
        />
        <FormField
          label="Password"
          value={form.password}
          onChangeText={(password) => setForm((current) => ({ ...current, password }))}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
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
});

