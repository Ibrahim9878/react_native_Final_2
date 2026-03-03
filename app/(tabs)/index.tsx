import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import AdminHome from '../../components/panels/AdminHome';
import BarberHome from '../../components/panels/BarberHome';
import CustomerHome from '../../components/panels/CustomerHome';
import { useTheme } from '../../src/state/ThemeContext';
import { useAuth } from '../../src/state/AuthContext';

export default function HomeTab() {
    const { session, isLoading } = useAuth();
    const { isDarkMode } = useTheme();

    if (!session) return null;

    if (session.userType === 1) return <AdminHome />;
    if (session.userType === 2) return <BarberHome />;
    return <CustomerHome />;
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
