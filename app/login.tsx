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
import { isNonEmpty, isValidEmail } from "@/utils/validation";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { status, login, authError, clearAuthError } = useAuth();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  if (status === "loading") {
    return <LoadingScreen text="Loading login..." />;
  }

  if (status === "authenticated") {
    return <Redirect href="./home" />;
  }

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof LoginForm, string>> = {};

    if (!isValidEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!isNonEmpty(form.password)) {
      nextErrors.password = "Password is required.";
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
      await login({ email: form.email, password: form.password });
      router.replace("./home");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      title="Log In"
      subtitle="Access your gym dashboard, machine queues, and equipment tools."
    >
      {authError ? <StatusBanner type="warning" message={authError} /> : null}
      {submitError ? <StatusBanner type="error" message={submitError} /> : null}

      <View style={styles.form}>
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
          label="Password"
          value={form.password}
          onChangeText={(password) => setForm((current) => ({ ...current, password }))}
          placeholder="********"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          error={errors.password}
        />
      </View>

      <AppButton
        label={isSubmitting ? "Logging in..." : "Log In"}
        loading={isSubmitting}
        onPress={handleSubmit}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Need an account?</Text>
        <Pressable onPress={() => router.push("./signup")}>
          <Text style={styles.footerLink}>Sign up</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.sm,
    justifyContent: "center",
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
