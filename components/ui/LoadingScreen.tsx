import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { theme } from "@/styles/theme";

interface LoadingScreenProps {
  text?: string;
}

export const LoadingScreen = ({ text = "Loading..." }: LoadingScreenProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});
