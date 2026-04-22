import type { ReactNode } from "react";
import { useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/styles/theme";

const logo = require("@/assets/images/logo.png");

interface ScreenContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  safeAreaTop?: boolean;
}

export const ScreenContainer = ({
  title,
  subtitle,
  children,
  scroll = true,
  contentStyle,
  safeAreaTop = false,
}: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();
  const topPadding = safeAreaTop ? insets.top + theme.spacing.lg : theme.spacing.lg;
  const scrollY = useRef(new Animated.Value(0)).current;

  const logoTranslateY = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -120],
    extrapolate: "clamp",
  });

  const content = (
    <View style={[styles.content, { paddingTop: topPadding }, contentStyle]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.children}>{children}</View>
    </View>
  );

  if (scroll) {
    return (
      <View style={styles.root}>
        {/* Parallax watermark */}
        <Animated.View
          style={[styles.watermark, { transform: [{ translateY: logoTranslateY }] }]}
          pointerEvents="none"
        >
          <Image source={logo} style={styles.watermarkImage} resizeMode="contain" />
        </Animated.View>

        <Animated.ScrollView
          style={styles.fill}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
        >
          {content}
        </Animated.ScrollView>
      </View>
    );
  }

  return <View style={styles.root}>{content}</View>;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  watermark: {
    position: "absolute",
    alignSelf: "center",
    top: "25%",
    zIndex: 0,
    opacity: 0.055,
  },
  watermarkImage: {
    width: 320,
    height: 320,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    zIndex: 1,
  },
  header: {
    gap: 6,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  children: {
    gap: theme.spacing.md,
  },
});
