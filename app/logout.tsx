import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../src/state/AuthContext';

export default function LogoutScreen() {
    const router = useRouter();
    const { logout } = useAuth();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Loop icon rotation
        Animated.loop(
            Animated.timing(iconRotate, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const iconSpin = iconRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handleConfirmLogout = async () => {
        await logout();          // AsyncStorage + React session state ikisi də sıfırlanır
        router.replace('/login'); // Login/Register ekranına apar
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Background gradient overlay */}
            <View style={styles.bgOverlay} />

            <Animated.View
                style={[
                    styles.card,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}
            >
                {/* Icon */}
                <View style={styles.iconWrapper}>
                    <Animated.View style={{ transform: [{ rotate: iconSpin }] }}>
                        <Ionicons name="log-out-outline" size={48} color="#F2C27A" />
                    </Animated.View>
                </View>

                {/* Title */}
                <Text style={styles.title}>Çıxış et</Text>
                <Text style={styles.subtitle}>
                    Hesabınızdan çıxmaq istədiyinizə əminsinizmi?
                </Text>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Buttons */}
                <TouchableOpacity
                    style={styles.btnConfirm}
                    onPress={handleConfirmLogout}
                    activeOpacity={0.85}
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.btnConfirmText}>Bəli, Çıxış et</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={handleCancel}
                    activeOpacity={0.75}
                >
                    <Ionicons name="arrow-back-outline" size={20} color="#F2C27A" />
                    <Text style={styles.btnCancelText}>Geri Qayıt</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#1A0A00',
        opacity: 0.9,
    },
    card: {
        width: '86%',
        backgroundColor: '#1C1008',
        borderRadius: 24,
        paddingVertical: 40,
        paddingHorizontal: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3A2010',
        shadowColor: '#F2C27A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
    },
    iconWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#2C1B10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#F2C27A',
        shadowColor: '#F2C27A',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#A08060',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#3A2010',
        marginVertical: 28,
    },
    btnConfirm: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#B24700',
        paddingVertical: 15,
        borderRadius: 14,
        marginBottom: 14,
        gap: 8,
        shadowColor: '#B24700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    btnConfirmText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    btnCancel: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 15,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#F2C27A',
        gap: 8,
    },
    btnCancelText: {
        color: '#F2C27A',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
