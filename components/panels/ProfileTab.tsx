import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LanguageCode, translations } from '../../src/i18n/translations';
import { useAuth } from '../../src/state/AuthContext';
import { useLanguage } from '../../src/state/LanguageContext';
import { useTheme } from '../../src/state/ThemeContext';

export default function ProfileTab() {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { session } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const router = useRouter();

    const [isLangModalVisible, setIsLangModalVisible] = useState(false);
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

    const blurActiveElement = () => {
        if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    };

    const openInfoModal = () => {
        blurActiveElement();
        setIsInfoModalVisible(true);
    };

    const openLangModal = () => {
        blurActiveElement();
        setIsLangModalVisible(true);
    };

    const userEmail = session?.email ?? '';
    const userType = session?.userType ?? null;


    const getRoleInfo = () => {
        if (userType === 1) return { initials: 'AD', name: t('globalAdministrator'), badge: t('systemController'), icon: 'shield-checkmark' };
        if (userType === 2) return { initials: userEmail ? userEmail.charAt(0).toUpperCase() : 'B', name: t('masterBarber'), badge: t('topRated'), icon: 'star' };
        return { initials: userEmail ? userEmail.charAt(0).toUpperCase() : 'U', name: t('premiumCustomer'), badge: t('goldMember'), icon: 'shield-checkmark' };
    };

    const info = getRoleInfo();

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={[styles.profileContainer, isDarkMode && styles.profileContainerDark]} contentContainerStyle={styles.profileContent}>
                <View style={[styles.profileHeader, isDarkMode && styles.headerDark]}>
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileImagePlaceholder}>
                            <Text style={styles.profileImageInitials}>{info.initials}</Text>
                        </View>
                        <Pressable style={styles.editImageBtn}>
                            <Ionicons name="camera" size={18} color="#FFFFFF" />
                        </Pressable>
                    </View>
                    <Text style={[styles.profileName, isDarkMode && styles.profileNameDark]}>{info.name}</Text>
                    <Text style={[styles.profileEmail, isDarkMode && { color: '#A0A0A0' }]}>{userEmail}</Text>

                    <View style={styles.profileBadge}>
                        <Ionicons name={info.icon as any} size={14} color="#F2C27A" />
                        <Text style={styles.profileBadgeText}>{info.badge}</Text>
                    </View>
                </View>

                <View style={styles.profileMenu}>
                    <Text style={styles.menuTitle}>{t('profileTitle')}</Text>

                    <Pressable style={styles.menuItem} onPress={openInfoModal}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="person-outline" size={20} color="#F2C27A" />
                        </View>
                        <Text style={[styles.menuText, isDarkMode && styles.menuTextDark]}>{t('personalInfo')}</Text>
                        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#A0A0A0" : "#4A3428"} />
                    </Pressable>

                    {userType === 1 && (
                        <Pressable style={styles.menuItem}>
                            <View style={styles.menuIconContainer}>
                                <Ionicons name="people-outline" size={20} color="#F2C27A" />
                            </View>
                            <Text style={[styles.menuText, isDarkMode && styles.menuTextDark]}>{t('userManagement')}</Text>
                            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#A0A0A0" : "#4A3428"} />
                        </Pressable>
                    )}

                    <Text style={[styles.menuTitle, { marginTop: 24 }]}>{t('preferences')}</Text>

                    <Pressable style={styles.menuItem} onPress={toggleDarkMode}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={20} color="#F2C27A" />
                        </View>
                        <Text style={[styles.menuText, isDarkMode && styles.menuTextDark]}>{isDarkMode ? t('lightMode') : t('darkMode')}</Text>
                        <View style={[styles.toggleBackground, isDarkMode && styles.toggleBackgroundActive]}>
                            <View style={[styles.toggleCircle, isDarkMode && styles.toggleCircleActive]} />
                        </View>
                    </Pressable>

                    <Pressable style={styles.menuItem} onPress={openLangModal}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="language-outline" size={20} color="#F2C27A" />
                        </View>
                        <Text style={[styles.menuText, isDarkMode && styles.menuTextDark]}>{t('language')}</Text>
                        <Text style={styles.menuValueText}>{translations[language].languageNames[language]}</Text>
                    </Pressable>


                    <Text style={[styles.menuTitle, { marginTop: 24 }]}>Hesab</Text>

                    <Pressable
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={() => router.push('/logout')}
                    >
                        <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                            <Ionicons name="log-out-outline" size={20} color="#FF6B35" />
                        </View>
                        <Text style={[styles.menuText, styles.logoutText]}>Çıxış et</Text>
                        <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
                    </Pressable>

                </View>

                <Text style={[styles.versionText, isDarkMode && styles.versionTextDark]}>TrioCut v1.2.0</Text>
            </ScrollView>

            { }
            <Modal
                visible={isLangModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsLangModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsLangModalVisible(false)}>
                    <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
                        <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>{t('language')}</Text>

                        {(['en', 'az', 'tr'] as LanguageCode[]).map((lang) => (
                            <Pressable
                                key={lang}
                                style={[styles.langOption, isDarkMode && styles.langOptionDark, language === lang && styles.langOptionActive]}
                                onPress={() => {
                                    setLanguage(lang);
                                    setIsLangModalVisible(false);
                                }}
                            >
                                <Text style={[
                                    styles.langText,
                                    isDarkMode && styles.langTextDark,
                                    language === lang && styles.langTextActive
                                ]}>
                                    {translations[language].languageNames[lang]}
                                </Text>
                                {language === lang && (
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                )}
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            { }
            <Modal
                visible={isInfoModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsInfoModalVisible(false)}
            >
                <SafeAreaView style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
                    <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
                        <Pressable onPress={() => setIsInfoModalVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={isDarkMode ? "#FFFFFF" : "#2C1B10"} />
                        </Pressable>
                        <Text style={[styles.modalHeaderText, isDarkMode && styles.modalHeaderTextDark]}>{t('personalInfo')}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.infoScrollContent}>
                        <View style={[styles.infoCard, isDarkMode && styles.infoCardDark]}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('firstName')}</Text>
                                <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>{session?.firstName || '---'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('lastName')}</Text>
                                <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>{session?.lastName || '---'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('emailLabel')}</Text>
                                <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>{userEmail}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('phoneNum')}</Text>
                                <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>{session?.phoneNumber || '---'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t('ageLabel')}</Text>
                                <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>{session?.age || '---'}</Text>
                            </View>
                            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.infoLabel}>Member Since</Text>
                                <Text style={[styles.infoValue, isDarkMode && styles.infoValueDark]}>
                                    {session?.createdAt ? new Date(session.createdAt).toLocaleDateString() : '---'}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    profileContainer: { flex: 1 },
    profileContent: { paddingBottom: 100 },
    profileHeader: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#F7F2EA' },
    profileImageContainer: { position: 'relative', marginBottom: 16 },
    profileImagePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2C1B10', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F2C27A' },
    profileImageInitials: { color: '#F2C27A', fontSize: 36, fontWeight: 'bold', fontFamily: 'serif' },
    editImageBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#B24700', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F7F2EA' },
    profileName: { fontSize: 24, fontWeight: 'bold', color: '#2C1B10', fontFamily: 'serif' },
    profileEmail: { fontSize: 14, color: '#6D4C41', marginTop: 4 },
    profileBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C1B10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 16 },
    profileBadgeText: { color: '#F2C27A', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
    profileMenu: { padding: 20 },
    menuTitle: { fontSize: 14, fontWeight: 'bold', color: '#F2C27A', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2ECE4' },
    menuIconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F7F2EA', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuText: { flex: 1, fontSize: 16, color: '#2C1B10', fontWeight: '500' },
    menuValueText: { fontSize: 14, color: '#6D4C41', marginRight: 8 },
    versionText: { textAlign: 'center', color: '#444', fontSize: 12, marginTop: 20 },

    profileContainerDark: { backgroundColor: '#121212' },
    headerDark: { backgroundColor: '#1A1A1A', borderBottomColor: '#2A2A2A' },
    profileNameDark: { color: '#FFFFFF' },
    menuTextDark: { color: '#E0E0E0' },
    versionTextDark: { color: '#555' },
    toggleBackground: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#2A2A2A', padding: 2, justifyContent: 'center' },
    toggleBackgroundActive: { backgroundColor: '#B24700' },
    toggleCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F2C27A' },
    toggleCircleActive: { transform: [{ translateX: 20 }], backgroundColor: '#FFFFFF' },
    logoutItem: { borderBottomWidth: 0 },
    logoutIconContainer: { backgroundColor: '#FFF0EB' },
    logoutText: { color: '#FF6B35' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFFFFF', width: '80%', borderRadius: 16, padding: 20 },
    modalContentDark: { backgroundColor: '#1A1A1A' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C1B10', marginBottom: 16, textAlign: 'center' },
    modalTitleDark: { color: '#FFFFFF' },
    langOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#F7F2EA' },
    langOptionDark: { backgroundColor: '#2A2A2A' },
    langOptionActive: { backgroundColor: '#B35A12' },
    langText: { fontSize: 16, color: '#2C1B10', fontWeight: '500' },
    langTextDark: { color: '#E0E0E0' },
    langTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

    modalContainer: { flex: 1, backgroundColor: '#FAF7F2' },
    modalContainerDark: { backgroundColor: '#121212' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E8DCCB' },
    modalHeaderDark: { borderBottomColor: '#2A2A2A', backgroundColor: '#1A1A1A' },
    modalHeaderText: { fontSize: 18, fontWeight: 'bold', color: '#2C1B10', fontFamily: 'serif' },
    modalHeaderTextDark: { color: '#FFFFFF' },
    closeBtn: { padding: 8 },
    infoScrollContent: { padding: 20 },
    infoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F2ECE4' },
    infoCardDark: { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F7F2EA' },
    infoLabel: { fontSize: 14, color: '#F2C27A', fontWeight: 'bold' },
    infoValue: { fontSize: 16, color: '#2C1B10', fontWeight: '500' },
    infoValueDark: { color: '#FFFFFF' },
});
