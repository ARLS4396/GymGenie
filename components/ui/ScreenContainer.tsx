import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { theme } from "@/styles/theme";

interface ScreenContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export const ScreenContainer = ({
  title,
  subtitle,
  children,
  scroll = true,
  contentStyle,
}: ScreenContainerProps) => {
  const content = (
    <View style={[styles.content, contentStyle]}>
      {/* GLOBAL BRAND HEADER */}
      <View style={styles.brandHeader}>
        <Text style={styles.brandText}>Gym Genie</Text>
      </View>

      {/* PAGE TITLE */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.children}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  /* 🔥 NEW BRAND HEADER */
  brandHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 1,
  },

  header: {
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  children: {
    gap: theme.spacing.md,
  },
});