import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";

type MembershipTier = "Basic" | "Standard" | "Premium";

export default function MembershipScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectTier = async (tier: MembershipTier) => {
    if (!user) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSuccessMessage(null);

      await updateProfile({
        fullName: user.fullName,
        username: user.username,
        fitnessGoal: user.fitnessGoal,
        profileImage: user.profileImage,
        age: user.age,
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetWeight,
        activityLevel: user.activityLevel,
        membershipTier: tier,
      });

      setSuccessMessage(`You successfully selected the ${tier} membership.`);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save membership tier.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer
      title="Membership Plans"
      subtitle="Choose the membership tier that fits your goals."
    >
      {saveError ? <StatusBanner type="error" message={saveError} /> : null}
      {successMessage ? <StatusBanner type="success" message={successMessage} /> : null}

      <SectionCard>
        <Text style={styles.tierTitle}>Basic</Text>
        <Text style={styles.price}>$20/month</Text>
        <Text style={styles.benefit}>• Gym access during regular hours</Text>
        <Text style={styles.benefit}>• Locker room access</Text>
        <Text style={styles.benefit}>• Access to standard equipment</Text>
        <AppButton
          label={isSaving ? "Saving..." : "Choose Basic"}
          onPress={() => handleSelectTier("Basic")}
          loading={isSaving}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.tierTitle}>Standard</Text>
        <Text style={styles.price}>$35/month</Text>
        <Text style={styles.benefit}>• Everything in Basic</Text>
        <Text style={styles.benefit}>• Access to group classes</Text>
        <Text style={styles.benefit}>• Priority equipment reservations</Text>
        <AppButton
          label={isSaving ? "Saving..." : "Choose Standard"}
          onPress={() => handleSelectTier("Standard")}
          loading={isSaving}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.tierTitle}>Premium</Text>
        <Text style={styles.price}>$50/month</Text>
        <Text style={styles.benefit}>• Everything in Standard</Text>
        <Text style={styles.benefit}>• Personal trainer consultation</Text>
        <Text style={styles.benefit}>• Full premium feature access</Text>
        <AppButton
          label={isSaving ? "Saving..." : "Choose Premium"}
          onPress={() => handleSelectTier("Premium")}
          loading={isSaving}
        />
      </SectionCard>

      <AppButton
        label="Back to Dashboard"
        variant="secondary"
        onPress={() => router.push("./home")}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tierTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  benefit: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});