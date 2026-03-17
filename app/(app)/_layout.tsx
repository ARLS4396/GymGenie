import { Redirect, Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppNav } from "@/components/AppNav";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/styles/theme";

export default function ProtectedLayout() {
  const { status } = useAuth();

  if (status === "loading") {
    return <LoadingScreen text="Checking your session..." />;
  }

  if (status !== "authenticated") {
    return <Redirect href="../login" />;
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <AppNav />
      <View style={styles.content}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
});
