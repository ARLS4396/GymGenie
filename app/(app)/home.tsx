import { useMemo } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { theme } from "@/styles/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { machines, equipment } = useGymData();

  const dashboardStats = useMemo(() => {
    const activeQueues = machines.filter((machine) => machine.queueUserIds.length > 0).length;
    const joinedQueues = user
      ? machines.filter((machine) => machine.queueUserIds.includes(user.id)).length
      : 0;
    const totalAvailableEquipment = equipment.reduce(
      (sum, item) => sum + item.totalQuantity - item.checkedOutBy.length,
      0,
    );
    const equipmentCheckedOutByUser = user
      ? equipment.filter((item) => item.checkedOutBy.includes(user.id)).length
      : 0;

    return {
      activeQueues,
      joinedQueues,
      totalAvailableEquipment,
      equipmentCheckedOutByUser,
    };
  }, [equipment, machines, user]);

  return (
    <ScreenContainer
      title="Dashboard"
      subtitle="Gym Genie prototype overview for profile management, machine queues, and equipment tracking."
    >
      <SectionCard style={styles.heroCard}>
        <Text style={styles.eyebrow}>Member Snapshot</Text>
        <Text style={styles.heroTitle}>Welcome back, {user?.fullName ?? "Athlete"}</Text>
        <Text style={styles.heroBody}>
          Use this dashboard to move through the main Sprint 1 flows quickly during a
          demo.
        </Text>
      </SectionCard>

      <View style={styles.statsGrid}>
        <SectionCard style={styles.statCard}>
          <Text style={styles.statValue}>{dashboardStats.joinedQueues}</Text>
          <Text style={styles.statLabel}>Queues You Joined</Text>
        </SectionCard>
        <SectionCard style={styles.statCard}>
          <Text style={styles.statValue}>{dashboardStats.activeQueues}</Text>
          <Text style={styles.statLabel}>Active Machine Queues</Text>
        </SectionCard>
        <SectionCard style={styles.statCard}>
          <Text style={styles.statValue}>{dashboardStats.totalAvailableEquipment}</Text>
          <Text style={styles.statLabel}>Equipment Units Available</Text>
        </SectionCard>
        <SectionCard style={styles.statCard}>
          <Text style={styles.statValue}>{dashboardStats.equipmentCheckedOutByUser}</Text>
          <Text style={styles.statLabel}>Items Checked Out By You</Text>
        </SectionCard>
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>Primary Prototype Flows</Text>
        <View style={styles.quickActions}>
          <AppButton
            label="View Profile"
            variant="secondary"
            onPress={() => router.push("./profile")}
          />
          <AppButton
            label="Manage Queue"
            variant="secondary"
            onPress={() => router.push("./queue")}
          />
          <AppButton
            label="Open Equipment"
            variant="secondary"
            onPress={() => router.push("./equipment")}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Sprint Scope Coverage</Text>
        <Text style={styles.sectionBody}>
          This prototype demonstrates authenticated access, profile storage and
          updates, Appwrite-backed machine queue actions, equipment checkout and
          return, and equipment condition reporting.
        </Text>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  statCard: {
    flexGrow: 1,
    minWidth: 140,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionBody: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  quickActions: {
    gap: theme.spacing.sm,
  },
});
