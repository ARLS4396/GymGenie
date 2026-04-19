import { Stack } from "expo-router";
import { Platform, View } from "react-native";
import Head from "expo-router/head";
import { Poppins_300Light, useFonts } from "@expo-google-fonts/poppins";
import { Inter_300Light, Inter_400Regular } from "@expo-google-fonts/inter";
import { AuthProvider } from "@/context/AuthContext";
import { GymDataProvider } from "@/context/GymDataContext";
import { theme } from "@/styles/theme";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Inter_300Light,
    Inter_400Regular,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <GymDataProvider>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {Platform.OS === "web" ? (
            <Head>
              <title>Gym Genie</title>
            </Head>
          ) : null}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="(app)" />
          </Stack>
        </View>
      </GymDataProvider>
    </AuthProvider>
  );
}

