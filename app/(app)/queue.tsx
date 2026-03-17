import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { theme } from "@/styles/theme";

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pendingMachineId, setPendingMachineId] = useState<string | null>(null);

  const handleQueueAction = async (machineId: string, inQueue: boolean) => {
    if (!user) {
      return;
    }

    try {
      setPendingMachineId(machineId);
      setStatusMessage(null);

      if (inQueue) {
        await leaveMachineQueue(machineId, user.id);
        setStatusMessage("You left the queue successfully.");
        return;
      }

      await joinMachineQueue(machineId, user.id);
      setStatusMessage("You joined the queue successfully.");
    } finally {
      setPendingMachineId(null);
    }
  };

  return (
    <ScreenContainer
      title="Machine Queue"
      subtitle="Join and leave queues for popular gym machines."
    >
      {statusMessage ? <StatusBanner type="success" message={statusMessage} /> : null}
      {error ? <StatusBanner type="error" message={error} /> : null}

      <SectionCard>
        <Text style={styles.machineMeta}>
          Queue state is loaded from Appwrite and will persist across app reloads.
        </Text>
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
          <Text style={styles.machineMeta}>Loading machine queues...</Text>
        </SectionCard>
      ) : null}

      {!isLoading && machines.length === 0 ? (
        <SectionCard>
          <Text style={styles.machineMeta}>
            No machines are available yet. Seed the Appwrite `machines` collection to get
            started.
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
            <Text style={styles.machineName}>{machine.name}</Text>
            <Text style={styles.machineMeta}>Location: {machine.location}</Text>
            <Text style={styles.machineMeta}>Queue Length: {queueLength}</Text>

            {inQueue ? (
              <Text style={styles.queueStatus}>
                Your position: {position + 1} {position === 0 ? "(You are next)" : ""}
              </Text>
            ) : (
              <Text style={styles.machineMeta}>You are not currently in this queue.</Text>
            )}

            <AppButton
              label={inQueue ? "Leave Queue" : "Join Queue"}
              variant={inQueue ? "danger" : "primary"}
              onPress={() => {
                void handleQueueAction(machine.id, inQueue);
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
  machineName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  machineMeta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  queueStatus: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
