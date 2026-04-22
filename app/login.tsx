import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { FormField } from "@/components/ui/FormField";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";
import { isNonEmpty, isValidEmail } from "@/utils/validation";

const logo = require("@/assets/images/logo.png");

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { status, login, clearAuthError } = useAuth();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  if (status === "loading") return <LoadingScreen text="Loading login..." />;
  if (status === "authenticated") return <Redirect href="./home" />;

  const validate = (): boolean => {
    const e: Partial<Record<keyof LoginForm, string>> = {};
    if (!isValidEmail(form.email)) e.email = "Enter a valid email address.";
    if (!isNonEmpty(form.password)) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
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
      subtitle="Access your Gym Genie dashboard, queues, and tools."
      safeAreaTop
    >
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brandText}>Gym Genie</Text>
      </View>

      {submitError ? <StatusBanner type="error" message={submitError} /> : null}

      <View style={styles.form}>
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
          label="Password"
          value={form.password}
          onChangeText={(password) => setForm((c) => ({ ...c, password }))}
          placeholder="Enter your password"
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
  logoContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandText: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
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
