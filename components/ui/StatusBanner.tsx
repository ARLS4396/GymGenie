import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/styles/theme";

type BannerType = "success" | "error" | "warning";

interface StatusBannerProps {
  message: string;
  type: BannerType;
}

const bannerStyles = {
  success: {
    backgroundColor: theme.colors.successBg,
    color: theme.colors.successText,
  },
  error: {
    backgroundColor: theme.colors.errorBg,
    color: theme.colors.errorText,
  },
  warning: {
    backgroundColor: theme.colors.warningBg,
    color: theme.colors.warningText,
  },
};

export const StatusBanner = ({ message, type }: StatusBannerProps) => {
  const selected = bannerStyles[type];

  return (
    <View style={[styles.container, { backgroundColor: selected.backgroundColor }]}>
      <Text style={[styles.text, { color: selected.color }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});
