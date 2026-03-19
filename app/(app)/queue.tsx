import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { theme } from "@/styles/theme";

type BannerState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

export default function QueueScreen() {
  const { user } = useAuth();
  const {
    machines,
    isLoading,
    error,
    refreshGymData,
    joinMachineQueue,
    leaveMachineQueue,
  } = useGymData();
  const [banner, setBanner] = useState<BannerState>(null);
  const [pendingMachineId, setPendingMachineId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const activeQueues = machines.filter((machine) => machine.queueUserIds.length > 0).length;
    const totalPeopleWaiting = machines.reduce(
      (sum, machine) => sum + machine.queueUserIds.length,
      0,
    );
    const joinedQueues = user
      ? machines.filter((machine) => machine.queueUserIds.includes(user.id)).length
      : 0;

    return {
      machinesTracked: machines.length,
      activeQueues,
      totalPeopleWaiting,
      joinedQueues,
    };
  }, [machines, user]);

  const handleQueueAction = async (machineId: string, inQueue: boolean, machineName: string) => {
    if (!user) {
      return;
    }

    try {
      setPendingMachineId(machineId);
      setBanner(null);

      if (inQueue) {
        await leaveMachineQueue(machineId, user.id);
        setBanner({
          type: "success",
          message: `You left the ${machineName} queue successfully.`,
        });
        return;
      }

      await joinMachineQueue(machineId, user.id);
      setBanner({
        type: "success",
        message: `You joined the ${machineName} queue successfully.`,
      });
    } catch (nextError) {
      setBanner({
        type: "error",
        message: nextError instanceof Error ? nextError.message : "Unable to update queue.",
      });
    } finally {
      setPendingMachineId(null);
    }
  };

  return (
    <ScreenContainer
      title="Queue"
      subtitle="Track machine waitlists, join a spot, and leave when your turn changes."
    >
      {banner ? <StatusBanner type={banner.type} message={banner.message} /> : null}
      {error ? <StatusBanner type="error" message={error} /> : null}

      <SectionCard>
        <Text style={styles.summaryTitle}>Queue Overview</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{summary.machinesTracked}</Text>
            <Text style={styles.summaryLabel}>Machines</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{summary.activeQueues}</Text>
            <Text style={styles.summaryLabel}>Active Queues</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{summary.totalPeopleWaiting}</Text>
            <Text style={styles.summaryLabel}>Members Waiting</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{summary.joinedQueues}</Text>
            <Text style={styles.summaryLabel}>Your Queues</Text>
          </View>
        </View>
        <AppButton
          label="Refresh Queue"
          variant="secondary"
          onPress={() => {
            void refreshGymData();
          }}
          loading={isLoading && machines.length === 0}
        />
      </SectionCard>

      {isLoading && machines.length === 0 ? (
        <SectionCard>
          <Text style={styles.emptyText}>Loading machine queues...</Text>
        </SectionCard>
      ) : null}

      {!isLoading && machines.length === 0 ? (
        <SectionCard>
          <Text style={styles.emptyText}>
            No machines are available yet. Run the backend setup script to seed the
            queue data.
          </Text>
        </SectionCard>
      ) : null}

      {machines.map((machine) => {
        const currentUserId = user?.id ?? "";
        const position = machine.queueUserIds.indexOf(currentUserId);
        const inQueue = position >= 0;
        const queueLength = machine.queueUserIds.length;

        return (
          <SectionCard key={machine.id}>
            <View style={styles.machineHeader}>
              <View style={styles.machineHeaderCopy}>
                <Text style={styles.machineName}>{machine.name}</Text>
                <Text style={styles.machineMeta}>Location: {machine.location}</Text>
              </View>
              <View style={styles.queueCountPill}>
                <Text style={styles.queueCountValue}>{queueLength}</Text>
                <Text style={styles.queueCountLabel}>waiting</Text>
              </View>
            </View>

            {inQueue ? (
              <Text style={styles.queueStatus}>
                Your position: {position + 1}
                {position === 0 ? " • You are next" : ""}
              </Text>
            ) : (
              <Text style={styles.machineMeta}>You are not currently in this queue.</Text>
            )}

            <View style={styles.queuePreview}>
              <Text style={styles.previewTitle}>Active Queue</Text>
              {queueLength === 0 ? (
                <Text style={styles.machineMeta}>No one is waiting right now.</Text>
              ) : (
                machine.queueUserIds.map((queuedUserId, index) => {
                  const isCurrentUser = queuedUserId === currentUserId;

                  return (
                    <View key={`${machine.id}:${queuedUserId}:${index}`} style={styles.queueRow}>
                      <Text style={styles.queueRowPosition}>#{index + 1}</Text>
                      <Text
                        style={[
                          styles.queueRowLabel,
                          isCurrentUser ? styles.queueRowLabelCurrent : null,
                        ]}
                      >
                        {isCurrentUser ? "You" : `Member ${index + 1}`}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>

            <AppButton
              label={inQueue ? "Leave Queue" : "Join Queue"}
              variant={inQueue ? "danger" : "primary"}
              onPress={() => {
                void handleQueueAction(machine.id, inQueue, machine.name);
              }}
              loading={pendingMachineId === machine.id}
              disabled={!user || isLoading}
            />
          </SectionCard>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  summaryStat: {
    flexGrow: 1,
    minWidth: 92,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.sm,
    gap: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  machineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  machineHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  machineName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  machineMeta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  queueCountPill: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    minWidth: 72,
  },
  queueCountValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  queueCountLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  queueStatus: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  queuePreview: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  queueRowPosition: {
    width: 28,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  queueRowLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  queueRowLabelCurrent: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
});
