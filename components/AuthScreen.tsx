import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser, registerUser } from '../src/api/auth';
import { useTheme } from '../src/state/ThemeContext';
import { useAuth } from '../src/state/AuthContext';
import { useLanguage } from '../src/state/LanguageContext';

function decodeJWT(token: string) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT:", e);
        return null;
    }
}

export default function AuthScreen() {
    const { isDarkMode } = useTheme();
    const { login } = useAuth();
    const { t } = useLanguage();

    const [isSignIn, setIsSignIn] = useState(true);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const switchMode = (signInMode: boolean) => {
        setIsSignIn(signInMode);
        setErrorMsg(null);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMsg(t('emailDesc')); // or custom "Please fill in fields" localized string
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        try {
            const response: any = await loginUser({ email, password });

            const receivedToken = response?.data?.token || response?.token;

            if (!receivedToken) {
                throw new Error("Server returned invalid token");
            }

            const payload = decodeJWT(receivedToken);
            let extractedUserType = null;

            if (payload) {
                // Try different possible claim names where .NET might hide the role
                extractedUserType = payload.userType ?? payload.UserType ?? payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

                if (typeof extractedUserType === 'string') {
                    const lowered = extractedUserType.toLowerCase();
                    if (lowered === 'customer' || lowered === '3') extractedUserType = 3;
                    else if (lowered === 'barber' || lowered === '2') extractedUserType = 2;
                    else if (lowered === 'admin' || lowered === '1') extractedUserType = 1;
                    else extractedUserType = parseInt(extractedUserType, 10);
                }
            }

            if (extractedUserType === null || isNaN(extractedUserType)) {
                extractedUserType = response?.data?.userType ?? response?.userType ?? 3;
            }

            await login({
                token: receivedToken,
                email: email,
                userType: extractedUserType,
                createdAt: Date.now(),
            });

        } catch (err: any) {
            setErrorMsg(err.message || "Failed to string login");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setErrorMsg("Please fill in all required fields (*).");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }
        if (!acceptTerms) {
            setErrorMsg("You must accept the terms and conditions.");
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);
        try {
            const ageNumber = age ? parseInt(age, 10) : 0;
            await registerUser({
                firstName,
                lastName,
                email,
                password,
                phoneNumber: phone,
                age: isNaN(ageNumber) ? 0 : ageNumber,
                userType: 3 // Default customer type
            });
            Alert.alert("Success", "Account created successfully! You can now sign in.");
            switchMode(true);
        } catch (err: any) {
            setErrorMsg(err.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, isDarkMode && styles.scrollContentDark]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Segmented Toggle */}
                    <View style={[styles.toggleContainer, isDarkMode && styles.toggleContainerDark]}>
                        <Pressable
                            style={[styles.toggleBtn, isSignIn && styles.activeToggleBtn]}
                            onPress={() => switchMode(true)}
                            disabled={isLoading}
                        >
                            <Text style={[styles.toggleText, isSignIn && styles.activeToggleText, !isSignIn && isDarkMode && styles.toggleTextDark]}>
                                {t('signIn')}
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.toggleBtn, !isSignIn && styles.activeToggleBtn]}
                            onPress={() => switchMode(false)}
                            disabled={isLoading}
                        >
                            <Text style={[styles.toggleText, !isSignIn && styles.activeToggleText, isSignIn && isDarkMode && styles.toggleTextDark]}>
                                {t('signUp')}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Lock Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed" size={50} color="#BB4D00" />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, isDarkMode && styles.titleDark]}>
                        {isSignIn ? t('welcomeBack') : t('createAccountMsg')}
                    </Text>

                    {/* Form Fields container */}
                    <View style={styles.formContainer}>
                        {/* Error Message Space */}
                        {errorMsg ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        ) : null}

                        {isSignIn ? (
                            // --- SIGN IN FORM ---
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('emailLabel')} <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={[styles.input, isDarkMode && styles.inputDark]}
                                        placeholder={t('emailDesc')}
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('passwordLabel')} <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={[styles.input, isDarkMode && styles.inputDark]}
                                        placeholder={t('passDesc')}
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.buttonContainer}>
                                    <Pressable
                                        style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                                        onPress={handleLogin}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.primaryButtonText}>{t('signIn')}</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            // --- SIGN UP FORM ---
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('firstName')} <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={[styles.input, isDarkMode && styles.inputDark]}
                                        placeholder={t('fNameDesc')}
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('lastName')} <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={[styles.input, isDarkMode && styles.inputDark]}
                                        placeholder={t('lNameDesc')}
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        value={lastName}
                                        onChangeText={setLastName}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('emailLabel')} <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={[styles.input, isDarkMode && styles.inputDark]}
                                        placeholder={t('emailDesc')}
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('phoneNum')}</Text>
                                    <TextInput
                                        style={[styles.input, isDarkMode && styles.inputDark]}
                                        placeholder={t('phoneDesc')}
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        keyboardType="phone-pad"
                                        value={phone}
                                        onChangeText={setPhone}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('ageLabel')}</Text>
                                    <TextInput
                                        style={[styles.input, isDarkMode && styles.inputDark]}
                                        placeholder={t('ageDesc')}
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        keyboardType="number-pad"
                                        value={age}
                                        onChangeText={setAge}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('passwordLabel')} <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={[styles.input, isDarkMode && styles.inputDark]}
                                        placeholder={t('passMinDesc')}
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('confirmPassLabel')} <Text style={styles.asterisk}>*</Text></Text>
                                    <TextInput
                                        style={[styles.input, isDarkMode && styles.inputDark]}
                                        placeholder={t('confirmDesc')}
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        secureTextEntry
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        editable={!isLoading}
                                    />
                                </View>

                                {/* Terms and conditions checkbox */}
                                <View style={styles.termsRow}>
                                    <Pressable
                                        style={[styles.checkbox, isDarkMode && styles.checkboxDark, acceptTerms && styles.checkboxActive]}
                                        onPress={() => !isLoading && setAcceptTerms(!acceptTerms)}
                                        disabled={isLoading}
                                    >
                                        {acceptTerms && <View style={styles.checkboxInner} />}
                                    </Pressable>
                                    <Text style={[styles.termsText, isDarkMode && styles.termsTextDark]}>
                                        {t('agreeTerms')} <Text style={styles.asterisk}>*</Text>
                                    </Text>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <Pressable
                                        style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                                        onPress={handleRegister}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.primaryButtonText}>{t('createAccountMsg')}</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F2EA',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 4,
        width: '100%',
        maxWidth: 400,
        marginBottom: 70,
        borderWidth: 1,
        borderColor: '#E8DCCB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeToggleBtn: {
        backgroundColor: '#B35A12', // Primary warm brown
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#B35A12',
    },
    activeToggleText: {
        color: '#FFFFFF',
    },
    // Header / Title styles
    iconContainer: {
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockIcon: {
        width: 32,
        height: 32,
        tintColor: '#B35A12',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 32,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
    },
    errorContainer: {
        marginBottom: 16,
        padding: 10,
        backgroundColor: '#FDECEA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F1A9A0',
    },
    errorText: {
        color: '#CF000F',
        fontSize: 14,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8C4004',
        marginBottom: 8,
        marginLeft: 2,
    },
    asterisk: {
        color: '#B35A12',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F2C27A',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        fontSize: 15,
        color: '#1A1A1A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1.5,
        borderColor: '#B35A12',
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxActive: {
        backgroundColor: '#B35A12',
    },
    checkboxInner: {
        width: 10,
        height: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    termsText: {
        fontSize: 14,
        color: '#8C4004',
        fontWeight: '500',
    },
    // Button Styles
    buttonContainer: {
        marginTop: 16,
    },
    primaryButton: {
        backgroundColor: '#B35A12',
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#B35A12',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonDisabled: {
        backgroundColor: '#B35A12AA',
        shadowOpacity: 0.1,
        elevation: 1,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    safeAreaDark: {
        backgroundColor: '#121212',
    },
    scrollContentDark: {
        backgroundColor: '#121212',
    },
    toggleContainerDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    toggleTextDark: {
        color: '#A0A0A0',
    },
    titleDark: {
        color: '#FFFFFF',
    },
    labelDark: {
        color: '#F2C27A',
    },
    inputDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
        color: '#FFFFFF',
    },
    checkboxDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#B35A12',
    },
    termsTextDark: {
        color: '#A0A0A0',
    },
});
