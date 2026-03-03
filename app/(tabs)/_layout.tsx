import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/state/ThemeContext';

export default function TabLayout() {
    const { isDarkMode } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                    borderTopColor: isDarkMode ? '#333' : '#E8DCCB',
                    height: 70,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: '#F2C27A',
                tabBarInactiveTintColor: isDarkMode ? '#555' : '#6D4C41',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "bar-chart" : "bar-chart-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
