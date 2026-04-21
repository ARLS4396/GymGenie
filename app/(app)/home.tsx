import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";

const quickActions = [
  { emoji: "👤", label: "Profile", path: "./profile" },
  { emoji: "⏱", label: "Queue", path: "./queue" },
  { emoji: "🏋️", label: "Equipment", path: "./equipment" },
  { emoji: "💳", label: "Membership", path: "./membership" },
] as const;

const regularHours = [
  { day: "Monday – Friday", hours: "5:00 AM – 11:00 PM" },
  { day: "Saturday – Sunday", hours: "7:00 AM – 9:00 PM" },
];

const holidayHours = [
  { day: "Memorial Day", hours: "8:00 AM – 3:00 PM" },
  { day: "4th of July", hours: "8:00 AM – 3:00 PM" },
  { day: "Thanksgiving", hours: "Closed" },
  { day: "Christmas Eve", hours: "Closes at 4:00 PM" },
  { day: "Christmas Day", hours: "Closed" },
  { day: "New Year's Eve", hours: "Closes at 4:00 PM" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScreenContainer
      title="Dashboard"
      subtitle="Your workout operations hub."
    >
      {/* Welcome card */}
      <SectionCard>
        <Text style={styles.welcomeName}>
          Welcome back, {user?.fullName?.split(" ")[0] ?? "Athlete"} 👋
        </Text>
        <Text style={styles.welcomeBody}>
          Track your gym flow with fast queue actions, equipment checkouts, and live gym updates.
        </Text>
      </SectionCard>

      {/* Quick Actions */}
      <SectionCard>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push(action.path)}
            >
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      {/* Gym Hours */}
      <SectionCard>
        <Text style={styles.sectionTitle}>Gym Hours</Text>

        <Text style={styles.hoursGroup}>Regular Hours</Text>
        {regularHours.map(({ day, hours }) => (
          <View key={day} style={styles.hoursRow}>
            <Text style={styles.hoursDay}>{day}</Text>
            <Text style={styles.hoursTime}>{hours}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.hoursGroup}>Holiday Hours</Text>
        {holidayHours.map(({ day, hours }) => (
          <View key={day} style={styles.hoursRow}>
            <Text style={styles.hoursDay}>{day}</Text>
            <Text style={[styles.hoursTime, hours === "Closed" && styles.hoursClosed]}>
              {hours}
            </Text>
          </View>
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  welcomeName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  welcomeBody: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  actionCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: "center",
    gap: 6,
  },
  actionCardPressed: {
    backgroundColor: theme.colors.secondary,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  hoursGroup: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: theme.spacing.xs,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3,
  },
  hoursDay: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  hoursTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  hoursClosed: {
    color: theme.colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
});
