import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";
import { theme } from "@/styles/theme";

type ButtonVariant = "primary" | "secondary" | "danger";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<
  ButtonVariant,
  {
    container: ViewStyle;
    containerPressed: ViewStyle;
    textColor: string;
  }
> = {
  primary: {
    container: { backgroundColor: theme.colors.primary },
    containerPressed: { backgroundColor: theme.colors.primaryPressed },
    textColor: "#FFFFFF",
  },
  secondary: {
    container: {
      backgroundColor: theme.colors.secondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    containerPressed: { backgroundColor: theme.colors.secondaryPressed },
    textColor: theme.colors.textPrimary,
  },
  danger: {
    container: { backgroundColor: theme.colors.danger },
    containerPressed: { backgroundColor: theme.colors.dangerPressed },
    textColor: "#FFFFFF",
  },
};

export const AppButton = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) => {
  const buttonVariant = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        buttonVariant.container,
        pressed ? buttonVariant.containerPressed : null,
        disabled || loading ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={buttonVariant.textColor} />
      ) : (
        <Text style={[styles.label, { color: buttonVariant.textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.65,
  },
});

