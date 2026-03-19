import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";

export default function LandingScreen() {
  const router = useRouter();
  const { status, user, authError } = useAuth();

  if (status === "loading") {
    return <LoadingScreen text="Preparing Gym Genie..." />;
  }

  const isAuthenticated = status === "authenticated" && user;

  return (
    <ScreenContainer
      title="Gym Genie"
      subtitle="A clean mobile prototype for gym member profiles, equipment tracking, and machine queues."
      contentStyle={styles.container}
    >
      {authError ? <StatusBanner type="warning" message={authError} /> : null}

      <SectionCard style={styles.heroCard}>
        <Text style={styles.eyebrow}>Application Design Prototype</Text>
        <Text style={styles.heroTitle}>Operate the gym floor with simple member tools.</Text>
        <Text style={styles.heroBody}>
          Gym Genie demonstrates the core Sprint 1 flows from the SRS with Appwrite
          authentication, database reads and writes, and a presentation-ready mobile
          layout.
        </Text>
      </SectionCard>

      <View style={styles.featureGrid}>
        <SectionCard style={styles.featureCard}>
          <Text style={styles.featureTitle}>Auth</Text>
          <Text style={styles.featureBody}>Sign up, log in, persist a session, and log out.</Text>
        </SectionCard>
        <SectionCard style={styles.featureCard}>
          <Text style={styles.featureTitle}>Profile</Text>
          <Text style={styles.featureBody}>
            Store and update full name, email, username, goal, and profile image.
          </Text>
        </SectionCard>
        <SectionCard style={styles.featureCard}>
          <Text style={styles.featureTitle}>Equipment</Text>
          <Text style={styles.featureBody}>
            Check items out, return them, and submit condition notes.
          </Text>
        </SectionCard>
        <SectionCard style={styles.featureCard}>
          <Text style={styles.featureTitle}>Queue</Text>
          <Text style={styles.featureBody}>
            Join machine queues, view queue order, and leave your spot.
          </Text>
        </SectionCard>
      </View>

      <SectionCard>
        <Text style={styles.sessionTitle}>Current Session</Text>
        {isAuthenticated ? (
          <Text style={styles.sessionBody}>
            Signed in as {user.fullName} ({user.email}).
          </Text>
        ) : (
          <Text style={styles.sessionBody}>
            No active session yet. Sign up or log in to open the dashboard.
          </Text>
        )}
      </SectionCard>

      <View style={styles.actions}>
        {isAuthenticated ? (
          <>
            <AppButton label="Open Dashboard" onPress={() => router.push("./home")} />
            <AppButton
              label="Go To Profile"
              variant="secondary"
              onPress={() => router.push("./profile")}
            />
          </>
        ) : (
          <>
            <AppButton label="Log In" onPress={() => router.push("./login")} />
            <AppButton
              label="Create Account"
              variant="secondary"
              onPress={() => router.push("./signup")}
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#F8FCFA",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
  },
  heroBody: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  featureGrid: {
    gap: theme.spacing.sm,
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
  },
  featureTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  featureBody: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sessionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  sessionBody: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
