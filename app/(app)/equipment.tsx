import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { theme } from "@/styles/theme";
import type { EquipmentCondition } from "@/types/gym";

const conditionOptions: EquipmentCondition[] = ["good", "needs attention", "damaged"];

export default function EquipmentScreen() {
  const { user } = useAuth();
  const {
    equipment,
    isLoading,
    error,
    refreshGymData,
    checkoutEquipment,
    returnEquipment,
    reportEquipmentCondition,
  } = useGymData();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const handleCheckoutToggle = async (
    equipmentId: string,
    checkedOutByUser: boolean,
    itemName: string,
  ) => {
    if (!user) {
      return;
    }

    try {
      setPendingKey(`checkout:${equipmentId}`);
      setStatusMessage(null);

      if (checkedOutByUser) {
        await returnEquipment(equipmentId, user.id);
        setStatusMessage(`${itemName} returned.`);
        return;
      }

      await checkoutEquipment(equipmentId, user.id);
      setStatusMessage(`${itemName} checked out.`);
    } finally {
      setPendingKey(null);
    }
  };

  const handleConditionReport = async (
    equipmentId: string,
    condition: EquipmentCondition,
    itemName: string,
  ) => {
    if (!user) {
      return;
    }

    try {
      setPendingKey(`condition:${equipmentId}`);
      setStatusMessage(null);
      await reportEquipmentCondition(equipmentId, condition, "", user.id);
      setStatusMessage(`${itemName} marked as ${condition}.`);
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <ScreenContainer
      title="Equipment Checkout"
      subtitle="Check out shared equipment and report item condition."
    >
      {statusMessage ? <StatusBanner type="success" message={statusMessage} /> : null}
      {error ? <StatusBanner type="error" message={error} /> : null}

      <SectionCard>
        <AppButton
          label="Refresh Equipment"
          variant="secondary"
          onPress={() => {
            void refreshGymData();
          }}
          loading={isLoading && equipment.length === 0}
        />
      </SectionCard>

      {isLoading && equipment.length === 0 ? (
        <SectionCard>
          <Text style={styles.itemMeta}>Loading equipment inventory...</Text>
        </SectionCard>
      ) : null}

      {!isLoading && equipment.length === 0 ? (
        <SectionCard>
          <Text style={styles.itemMeta}>
            No equipment items are available yet. Seed the Appwrite
            `equipment_items` collection to get started.
          </Text>
        </SectionCard>
      ) : null}

      {equipment.map((item) => {
        const currentUserId = user?.id ?? "";
        const checkedOutByUser = item.checkedOutBy.includes(currentUserId);
        const availableCount = item.totalQuantity - item.checkedOutBy.length;

        return (
          <SectionCard key={item.id}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>Available: {availableCount}</Text>
            <Text style={styles.itemMeta}>Checked Out: {item.checkedOutBy.length}</Text>
            <Text style={styles.itemMeta}>Condition: {item.condition}</Text>

            <View style={styles.actions}>
              <AppButton
                label={checkedOutByUser ? "Return" : "Check Out"}
                variant={checkedOutByUser ? "danger" : "primary"}
                onPress={() => {
                  void handleCheckoutToggle(item.id, checkedOutByUser, item.name);
                }}
                loading={pendingKey === `checkout:${item.id}`}
                disabled={!user || isLoading || (!checkedOutByUser && availableCount <= 0)}
              />
            </View>

            <View style={styles.conditionContainer}>
              <Text style={styles.conditionLabel}>Report Condition</Text>
              <View style={styles.conditionButtons}>
                {conditionOptions.map((condition) => {
                  const isSelected = item.condition === condition;

                  return (
                    <Pressable
                      key={condition}
                      onPress={() => {
                        void handleConditionReport(item.id, condition, item.name);
                      }}
                      style={[
                        styles.conditionButton,
                        isSelected ? styles.conditionButtonActive : null,
                        pendingKey === `condition:${item.id}`
                          ? styles.conditionButtonDisabled
                          : null,
                      ]}
                      disabled={!user || isLoading}
                    >
                      <Text
                        style={[
                          styles.conditionButtonText,
                          isSelected ? styles.conditionButtonTextActive : null,
                        ]}
                      >
                        {condition}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </SectionCard>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  itemMeta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actions: {
    marginTop: theme.spacing.xs,
  },
  conditionContainer: {
    gap: theme.spacing.xs,
  },
  conditionLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  conditionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  conditionButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  conditionButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  conditionButtonDisabled: {
    opacity: 0.6,
  },
  conditionButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  conditionButtonTextActive: {
    color: "#FFFFFF",
  },
});
