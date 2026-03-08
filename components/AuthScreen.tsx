import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser, registerUser } from '../src/api/auth';
import { useAuth } from '../src/state/AuthContext';
import { useLanguage } from '../src/state/LanguageContext';
import { useTheme } from '../src/state/ThemeContext';

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Format phone digits into (XX) XXX XX XX pattern
    const formatPhone = (digits: string): string => {
        if (digits.length === 0) return '';
        if (digits.length <= 2) return `(${digits}`;
        if (digits.length <= 5) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)} ${digits.slice(5)}`;
        if (digits.length <= 9) return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
    };

    const switchMode = (signInMode: boolean) => {
        setIsSignIn(signInMode);
        setErrorMsg(null);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMsg(t('fillFields'));
            return;
        }
        if (!email.includes('@')) {
            setErrorMsg(t('invalidEmail'));
            return;
        }
        if (password.length < 6) {
            setErrorMsg(t('passMinLengthErr'));
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
            setErrorMsg(err.message || t('loginFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setErrorMsg(t('fillFields'));
            return;
        }
        if (firstName.trim().length < 3) {
            setErrorMsg(t('firstNameMinErr'));
            return;
        }
        if (lastName.trim().length < 3) {
            setErrorMsg(t('lastNameMinErr'));
            return;
        }
        if (!email.includes('@')) {
            setErrorMsg(t('invalidEmail'));
            return;
        }
        if (phone && (!/^\d+$/.test(phone) || phone.length > 9)) {
            setErrorMsg(t('phoneErr'));
            return;
        }
        if (password.length < 6) {
            setErrorMsg(t('passMinLengthErr'));
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg(t('passMismatch'));
            return;
        }
        if (!acceptTerms) {
            setErrorMsg(t('acceptTermsErr'));
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
            Alert.alert(t('success'), t('regSuccess'));
            switchMode(true);
        } catch (err: any) {
            setErrorMsg(err.message || t('regFailed'));
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
                                    <View style={[styles.passwordContainer, isDarkMode && styles.passwordContainerDark]}>
                                        <TextInput
                                            style={[styles.inputInner, isDarkMode && styles.inputDark]}
                                            placeholder={t('passDesc')}
                                            placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={setPassword}
                                            editable={!isLoading}
                                        />
                                        <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={isDarkMode ? '#A0A0A0' : '#B35A12'} />
                                        </Pressable>
                                    </View>
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
                                        placeholder="(12) 345 67 89"
                                        placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                        keyboardType="phone-pad"
                                        value={formatPhone(phone)}
                                        onChangeText={(text) => {
                                            // Strip formatting to get raw digits only
                                            const digitsOnly = text.replace(/\D/g, '').slice(0, 9);
                                            setPhone(digitsOnly);
                                        }}
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
                                    <View style={[styles.passwordContainer, isDarkMode && styles.passwordContainerDark]}>
                                        <TextInput
                                            style={[styles.inputInner, isDarkMode && styles.inputDark]}
                                            placeholder={t('passMinDesc')}
                                            placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={setPassword}
                                            editable={!isLoading}
                                        />
                                        <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={isDarkMode ? '#A0A0A0' : '#B35A12'} />
                                        </Pressable>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('confirmPassLabel')} <Text style={styles.asterisk}>*</Text></Text>
                                    <View style={[styles.passwordContainer, isDarkMode && styles.passwordContainerDark]}>
                                        <TextInput
                                            style={[styles.inputInner, isDarkMode && styles.inputDark]}
                                            placeholder={t('confirmDesc')}
                                            placeholderTextColor={isDarkMode ? "#666" : "#B0A89C"}
                                            secureTextEntry={!showConfirmPassword}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            editable={!isLoading}
                                        />
                                        <Pressable style={styles.eyeBtn} onPress={() => setShowConfirmPassword(v => !v)}>
                                            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={isDarkMode ? '#A0A0A0' : '#B35A12'} />
                                        </Pressable>
                                    </View>
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
    // Password field with eye icon inside
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F2C27A',
        borderRadius: 12,
        height: 52,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    inputInner: {
        flex: 1,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#1A1A1A',
        height: 52,
    },
    eyeBtn: {
        paddingHorizontal: 14,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
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
    passwordContainerDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    checkboxDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#B35A12',
    },
    termsTextDark: {
        color: '#A0A0A0',
    },
});
