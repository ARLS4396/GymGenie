import { StyleSheet, View, type ViewProps } from "react-native";
import { theme } from "@/styles/theme";

export const SectionCard = ({ style, children, ...rest }: ViewProps) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
});
