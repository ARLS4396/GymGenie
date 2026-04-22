import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
};

const SettingsRow = ({ label, value, onPress, variant = "default", disabled }: SettingsRowProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || !onPress}
    style={({ pressed }) => [
      styles.row,
      pressed && onPress && styles.rowPressed,
    ]}
  >
    <Text style={[styles.rowLabel, variant === "danger" && styles.rowLabelDanger]}>
      {label}
    </Text>
    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    {onPress ? <Text style={styles.rowChevron}>›</Text> : null}
  </Pressable>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              router.replace("../login");
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer title="Settings" subtitle="Manage your account and app preferences.">

      {/* Account */}
      <SectionCard style={styles.card}>
        <Text style={styles.sectionLabel}>Account</Text>
        <SettingsRow label="Full Name" value={user?.fullName ?? "—"} />
        <View style={styles.separator} />
        <SettingsRow label="Email" value={user?.email ?? "—"} />
        <View style={styles.separator} />
        <SettingsRow label="Username" value={user?.username ?? "—"} />
        <View style={styles.separator} />
        <SettingsRow
          label="Membership"
          value={user?.membershipTier ?? "None selected"}
          onPress={() => router.push("./membership")}
        />
      </SectionCard>

      {/* Preferences */}
      <SectionCard style={styles.card}>
        <Text style={styles.sectionLabel}>Preferences</Text>
        <SettingsRow
          label="Edit Profile"
          onPress={() => router.push("./profile")}
        />
        <View style={styles.separator} />
        <SettingsRow
          label="Fitness Goal"
          value={user?.fitnessGoal ? formatGoal(user.fitnessGoal) : "Not set"}
          onPress={() => router.push("./profile")}
        />
        <View style={styles.separator} />
        <SettingsRow
          label="Activity Level"
          value={user?.activityLevel ? formatActivity(user.activityLevel) : "Not set"}
          onPress={() => router.push("./profile")}
        />
      </SectionCard>

      {/* About */}
      <SectionCard style={styles.card}>
        <Text style={styles.sectionLabel}>About</Text>
        <SettingsRow label="App Version" value="1.0.0" />
        <View style={styles.separator} />
        <SettingsRow label="Built with" value="Expo + Appwrite" />
      </SectionCard>

      {/* Sign Out */}
      <SectionCard style={styles.card}>
        <SettingsRow
          label={isLoggingOut ? "Signing out…" : "Sign Out"}
          variant="danger"
          onPress={handleSignOut}
          disabled={isLoggingOut}
        />
      </SectionCard>

    </ScreenContainer>
  );
}

function formatGoal(goal: string): string {
  const map: Record<string, string> = {
    lose_weight: "Lose Weight",
    build_muscle: "Build Muscle",
    maintain: "Maintain",
    endurance: "Endurance",
    general_health: "General Health",
  };
  return map[goal] ?? goal;
}

function formatActivity(level: string): string {
  const map: Record<string, string> = {
    sedentary: "Sedentary",
    light: "Light",
    moderate: "Moderate",
    very_active: "Very Active",
    athlete: "Athlete",
  };
  return map[level] ?? level;
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
    gap: 0,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    gap: theme.spacing.sm,
  },
  rowPressed: {
    backgroundColor: theme.colors.secondary,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  rowLabelDanger: {
    color: theme.colors.danger,
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    maxWidth: "50%",
    textAlign: "right",
  },
  rowChevron: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.md,
  },
});
