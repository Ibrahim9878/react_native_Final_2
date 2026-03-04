import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";
import { AppointmentsProvider } from "../src/state/AppointmentsContext";
import { AuthProvider, useAuth } from "../src/state/AuthContext";
import { LanguageProvider } from "../src/state/LanguageContext";
import { ThemeProvider } from "../src/state/ThemeContext";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const onLogoutScreen = segments[0] === 'logout';

    // Logout screen-i avtomatik yönləndirmədən qoru
    if (onLogoutScreen) return;

    if (!session && inTabsGroup) {
      router.replace('/login');
      return;
    }

    if (session && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF8E1' }}>
        <ActivityIndicator size="large" color="#B35A12" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="logout" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppointmentsProvider>
            <RootLayoutNav />
          </AppointmentsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
