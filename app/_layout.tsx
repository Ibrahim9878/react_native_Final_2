import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import "../global.css";
import { ThemeProvider } from "../src/state/ThemeContext";
import { AuthProvider, useAuth } from "../src/state/AuthContext";
import { LanguageProvider } from "../src/state/LanguageContext";
import { AppointmentsProvider } from "../src/state/AppointmentsContext";

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    // If user is not logged in and trying to access a secure area
    if (!session && inTabsGroup) {
      router.replace('/');
    }
    // If user is logged in and sitting on the login screen
    else if (session && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF8E1' }}>
        <ActivityIndicator size="large" color="#B35A12" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
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
