import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionCard } from "@/components/ui/SectionCard";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";


export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScreenContainer
      title="Dashboard"
      subtitle="Your workout operations hub for profile, queues, and equipment checkout."
    >
      <SectionCard>
        <Text style={styles.sectionTitle}>Welcome back, {user?.fullName ?? "Athlete"}</Text>
        <Text style={styles.sectionBody}>
          Track your gym flow with fast queue actions, 
          equipment checkouts, and gym updates.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Gym Hours</Text>

        <Text style={[styles.hoursBody,
          {marginTop: theme.spacing.sm}, 
          { fontWeight: 'bold'}]}>Regular Hours</Text>
        <Text style={styles.hoursBody}>Monday - Friday: 5:00 AM - 11:00 PM</Text>
        <Text style={styles.hoursBody}>Saturday - Sunday: 7:00 AM - 9:00 PM</Text>

        <Text style={[
          styles.hoursBody, 
          {marginTop: theme.spacing.sm}, 
          { fontWeight: 'bold'}]}>Holiday Hours</Text>
        <Text style={styles.hoursBody}>Memorial Day: 8:00 AM - 3:00 PM</Text>
        <Text style={styles.hoursBody}>4th of July: 8:00 AM - 3:00 PM</Text>
        <Text style={styles.hoursBody}>Thanksgiving: Closed</Text>
        <Text style={styles.hoursBody}>Christmas Eve: Closes at 4:00 PM</Text>
        <Text style={styles.hoursBody}>Christmas: Closed</Text>
        <Text style={styles.hoursBody}>New Years Eve: Closes at 4:00 PM</Text>


      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <AppButton
            label="Open Profile"
            variant="secondary"
            onPress={() => router.push("./profile")}
          />
          <AppButton
            label="Open Queue"
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

      <AppButton
      label="View Membership Plans"
      variant="secondary"
      onPress={() => router.push("./membership")}
      />

      <SectionCard>
        <Text style={styles.sectionTitle}>Sprint 1 Ready</Text>
        <Text style={styles.sectionBody}>
          Authentication, profile management, route protection, and Appwrite-backed
          queue and equipment flows are now available.
        </Text>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionBody: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  hoursBody: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  quickActions: {
    gap: theme.spacing.sm,
  },
});
