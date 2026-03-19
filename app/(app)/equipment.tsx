import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { useGymData } from "@/context/GymDataContext";
import { theme } from "@/styles/theme";
import type { EquipmentCondition } from "@/types/gym";
import { isNonEmpty } from "@/utils/validation";

const conditionOptions: EquipmentCondition[] = ["good", "needs attention", "damaged"];

type BannerState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

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

  const [banner, setBanner] = useState<BannerState>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [reportComments, setReportComments] = useState<Record<string, string>>({});
  const [selectedConditions, setSelectedConditions] = useState<
    Record<string, EquipmentCondition>
  >({});

  const summary = useMemo(() => {
    const totalUnits = equipment.reduce((sum, item) => sum + item.totalQuantity, 0);
    const checkedOutUnits = equipment.reduce(
      (sum, item) => sum + item.checkedOutBy.length,
      0,
    );

    return {
      totalItems: equipment.length,
      totalUnits,
      checkedOutUnits,
      availableUnits: totalUnits - checkedOutUnits,
    };
  }, [equipment]);

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
      setBanner(null);

      if (checkedOutByUser) {
        await returnEquipment(equipmentId, user.id);
        setBanner({ type: "success", message: `${itemName} returned successfully.` });
        return;
      }

      await checkoutEquipment(equipmentId, user.id);
      setBanner({ type: "success", message: `${itemName} checked out successfully.` });
    } catch (nextError) {
      setBanner({
        type: "error",
        message:
          nextError instanceof Error ? nextError.message : "Unable to update checkout.",
      });
    } finally {
      setPendingKey(null);
    }
  };

  const handleConditionReport = async (equipmentId: string, itemName: string) => {
    if (!user) {
      return;
    }

    const selectedCondition = selectedConditions[equipmentId] ?? "good";
    const maintenanceComment = reportComments[equipmentId]?.trim() ?? "";

    if (selectedCondition !== "good" && !isNonEmpty(maintenanceComment)) {
      setBanner({
        type: "error",
        message: `Add a maintenance comment before marking ${itemName} as ${selectedCondition}.`,
      });
      return;
    }

    try {
      setPendingKey(`condition:${equipmentId}`);
      setBanner(null);

      await reportEquipmentCondition(
        equipmentId,
        selectedCondition,
        maintenanceComment,
        user.id,
      );

      setReportComments((current) => ({ ...current, [equipmentId]: "" }));
      setBanner({
        type: "success",
        message: `${itemName} condition report saved as ${selectedCondition}.`,
      });
    } catch (nextError) {
      setBanner({
        type: "error",
        message:
          nextError instanceof Error
            ? nextError.message
            : "Unable to save the condition report.",
      });
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <ScreenContainer
      title="Equipment"
      subtitle="Review availability, check items in or out, and submit a simple maintenance report."
    >
      {banner ? <StatusBanner type={banner.type} message={banner.message} /> : null}
      {error ? <StatusBanner type="error" message={error} /> : null}

      <SectionCard>
        <Text style={styles.summaryTitle}>Equipment Overview</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{summary.totalItems}</Text>
            <Text style={styles.summaryLabel}>Item Types</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{summary.availableUnits}</Text>
            <Text style={styles.summaryLabel}>Units Available</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{summary.checkedOutUnits}</Text>
            <Text style={styles.summaryLabel}>Checked Out</Text>
          </View>
        </View>
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
          <Text style={styles.emptyText}>Loading equipment inventory...</Text>
        </SectionCard>
      ) : null}

      {!isLoading && equipment.length === 0 ? (
        <SectionCard>
          <Text style={styles.emptyText}>
            No equipment items are available yet. Run the backend setup script to seed
            the inventory collection.
          </Text>
        </SectionCard>
      ) : null}

      {equipment.map((item) => {
        const currentUserId = user?.id ?? "";
        const checkedOutByUser = item.checkedOutBy.includes(currentUserId);
        const availableCount = item.totalQuantity - item.checkedOutBy.length;
        const selectedCondition = selectedConditions[item.id] ?? item.condition;
        const comment = reportComments[item.id] ?? item.lastMaintenanceComment ?? "";
        const isConditionPending = pendingKey === `condition:${item.id}`;
        const isCheckoutPending = pendingKey === `checkout:${item.id}`;

        return (
          <SectionCard key={item.id}>
            <View style={styles.itemHeader}>
              <View style={styles.itemHeaderCopy}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {availableCount > 0
                    ? `${availableCount} of ${item.totalQuantity} ready to use`
                    : "Currently unavailable"}
                </Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  availableCount > 0 ? styles.statusAvailable : styles.statusUnavailable,
                ]}
              >
                <Text
                  style={[
                    styles.statusPillText,
                    availableCount > 0
                      ? styles.statusAvailableText
                      : styles.statusUnavailableText,
                  ]}
                >
                  {availableCount > 0 ? "Available" : "Full"}
                </Text>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <Text style={styles.detailText}>Checked out now: {item.checkedOutBy.length}</Text>
              <Text style={styles.detailText}>Current condition: {item.condition}</Text>
              <Text style={styles.detailText}>
                Your status: {checkedOutByUser ? "Checked out by you" : "Not checked out"}
              </Text>
            </View>

            {item.lastMaintenanceComment ? (
              <View style={styles.noteBlock}>
                <Text style={styles.noteLabel}>Latest maintenance note</Text>
                <Text style={styles.noteText}>{item.lastMaintenanceComment}</Text>
              </View>
            ) : null}

            <AppButton
              label={checkedOutByUser ? "Return Item" : "Check Out Item"}
              variant={checkedOutByUser ? "danger" : "primary"}
              onPress={() => {
                void handleCheckoutToggle(item.id, checkedOutByUser, item.name);
              }}
              loading={isCheckoutPending}
              disabled={!user || isLoading || (!checkedOutByUser && availableCount <= 0)}
            />

            <View style={styles.reportSection}>
              <Text style={styles.reportTitle}>Condition Report</Text>
              <Text style={styles.reportSubtitle}>
                Choose a status and add a note if the item needs attention.
              </Text>

              <View style={styles.conditionButtons}>
                {conditionOptions.map((condition) => {
                  const isSelected = selectedCondition === condition;

                  return (
                    <Pressable
                      key={condition}
                      onPress={() =>
                        setSelectedConditions((current) => ({
                          ...current,
                          [item.id]: condition,
                        }))
                      }
                      style={[
                        styles.conditionButton,
                        isSelected ? styles.conditionButtonActive : null,
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

              <FormField
                label="Maintenance Comment"
                value={comment}
                onChangeText={(value) =>
                  setReportComments((current) => ({ ...current, [item.id]: value }))
                }
                placeholder="Describe the issue or maintenance note"
                multiline
                numberOfLines={3}
              />

              <AppButton
                label="Submit Condition Report"
                variant="secondary"
                onPress={() => {
                  void handleConditionReport(item.id, item.name);
                }}
                loading={isConditionPending}
                disabled={!user || isLoading}
              />
            </View>
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
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  itemHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  itemMeta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  statusAvailable: {
    backgroundColor: theme.colors.successBg,
  },
  statusUnavailable: {
    backgroundColor: theme.colors.errorBg,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusAvailableText: {
    color: theme.colors.successText,
  },
  statusUnavailableText: {
    color: theme.colors.errorText,
  },
  detailGrid: {
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  noteBlock: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.sm,
    gap: 4,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  reportSection: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  reportSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
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
    paddingVertical: 8,
  },
  conditionButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
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
