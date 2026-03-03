import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAuthData } from '../src/storage/authStorage';

export default function NotAllowedScreen() {
    const handleLogout = async () => {
        await clearAuthData();
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.message}>
                    Only customers can access this app for now.
                </Text>

                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F2EA',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    message: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C1B10',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 26,
    },
    logoutButton: {
        backgroundColor: '#B35A12',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        shadowColor: '#B35A12',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
