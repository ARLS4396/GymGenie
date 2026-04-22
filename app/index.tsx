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
      subtitle="A gym companion for members, queues, and equipment flows."
      contentStyle={styles.container}
    >
      {authError ? <StatusBanner type="warning" message={authError} /> : null}

      <SectionCard>
        <Text style={styles.cardTitle}>Current Session</Text>
        {isAuthenticated ? (
          <Text style={styles.cardBody}>
            Signed in as {user.fullName} ({user.email}).
          </Text>
        ) : (
          <Text style={styles.cardBody}>No active session. Sign up or log in to continue.</Text>
        )}
      </SectionCard>

      <View style={styles.actions}>
        {isAuthenticated ? (
          <>
            <AppButton
              label="Go To Dashboard"
              onPress={() => router.push("./home")}
            />
            <AppButton
              label="View Profile"
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
    alignItems: "center",
    textAlign: "center",
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  cardBody: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,

  },
  actions: {
    gap: theme.spacing.sm,
  },
});

