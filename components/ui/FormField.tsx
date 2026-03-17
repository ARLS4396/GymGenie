import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import { theme } from "@/styles/theme";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  autoComplete?:
    | "name"
    | "email"
    | "username"
    | "password"
    | "new-password"
    | "off";
  error?: string;
  editable?: boolean;
}

export const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = "sentences",
  keyboardType,
  autoComplete,
  error,
  editable = true,
}: FormFieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        style={[styles.input, error ? styles.inputError : null]}
        editable={editable}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
  inputError: {
    borderColor: theme.colors.errorText,
  },
  errorText: {
    color: theme.colors.errorText,
    fontSize: 12,
  },
});
