import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, FlatList, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuthData } from '../../src/storage/authStorage';
import AppointmentWizardModal from '../../src/components/AppointmentWizardModal';
import { useAppointments } from '../../src/state/AppointmentsContext';
import { ServiceItem, BarberItem, ServiceCategory, CATEGORIES, SERVICES, BARBERS } from '../../src/mock/servicesAndBarbers';
import { useTheme } from '../../src/state/ThemeContext';
import { useLanguage } from '../../src/state/LanguageContext';

export default function CustomerHome() {
    const { appointments } = useAppointments();
    const { t } = useLanguage();
    const [isWizardVisible, setIsWizardVisible] = useState(false);
    const [wizardInitialBarber, setWizardInitialBarber] = useState<BarberItem | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('All Services');
    const [customerEmail, setCustomerEmail] = useState<string>('');
    const { isDarkMode } = useTheme();

    React.useEffect(() => {
        getAuthData().then(s => {
            if (s) setCustomerEmail(s.email);
        });
    }, []);

    const myAppointments = appointments.filter(a => a.customerEmail === customerEmail).sort((a, b) => b.createdAt - a.createdAt);

    const filteredServices = SERVICES.filter(service =>
        service.category.includes(selectedCategory)
    );

    const renderServiceCard = (item: ServiceItem) => (
        <SafeAreaView key={item.id} style={[styles.serviceCard, isDarkMode && styles.serviceCardDark]}>
            <View style={styles.serviceHeader}>
                <View>
                    <Text style={[styles.serviceTitle, isDarkMode && styles.serviceTitleDark]}>{item.title}</Text>
                    {item.isPopular && (
                        <View style={styles.popularTag}>
                            <Text style={styles.popularText}>{t('popular')}</Text>
                        </View>
                    )}
                </View>
                <Pressable hitSlop={10}>
                    <Ionicons name="heart-outline" size={24} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                </Pressable>
            </View>
            <Text style={[styles.serviceDesc, isDarkMode && styles.serviceDescDark]}>{item.description}</Text>
            <View style={[styles.serviceFooter, isDarkMode && styles.serviceFooterDark]}>
                <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={16} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                    <Text style={[styles.durationText, isDarkMode && styles.durationTextDark]}>{item.duration}</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={[styles.priceText, isDarkMode && styles.priceTextDark]}>${item.price}</Text>
                    <Pressable style={[styles.bookNowBtn, isDarkMode && styles.bookNowBtnDark]} onPress={() => {
                        setWizardInitialBarber(null);
                        setIsWizardVisible(true);
                    }}>
                        <Text style={[styles.bookNowText, isDarkMode && styles.bookNowTextDark]}>{t('bookNow')}</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );

    const renderBarberCard = (item: BarberItem) => (
        <View key={item.id} style={[styles.barberCard, isDarkMode && styles.barberCardDark]}>
            <View style={styles.barberImageContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.barberImage} />
                {item.isAvailable && (
                    <View style={styles.availableTag}>
                        <Text style={styles.availableText}>{t('available')}</Text>
                    </View>
                )}
            </View>
            <View style={styles.barberInfo}>
                <Text style={[styles.barberName, isDarkMode && styles.barberNameDark]}>{item.name}</Text>
                <Text style={[styles.barberRole, isDarkMode && styles.barberRoleDark]}>{item.role}</Text>
                <View style={styles.barberStats}>
                    <Ionicons name="star" size={14} color="#F2C27A" />
                    <Text style={[styles.ratingText, isDarkMode && styles.ratingTextDark]}>{item.rating} ({item.reviews} {t('reviews')})</Text>
                </View>
                <Text style={[styles.experienceText, isDarkMode && styles.experienceTextDark]}>{item.experience}</Text>
                <Pressable
                    style={[styles.bookBarberBtn, isDarkMode && styles.bookBarberBtnDark]}
                    onPress={() => {
                        setWizardInitialBarber(item);
                        setIsWizardVisible(true);
                    }}
                >
                    <Text style={[styles.bookBarberText, isDarkMode && styles.bookBarberTextDark]}>{t('bookNow')}</Text>
                </Pressable>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }}>
            <View style={[styles.header, isDarkMode && styles.headerDark]}>
                <View>
                    <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>{t('shopName')}</Text>
                    <View style={styles.headerInfoRow}>
                        <Ionicons name="location" size={12} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                        <Text style={[styles.headerInfoText, isDarkMode && styles.headerInfoTextDark]}>{t('shopLocation')}</Text>
                        <Text style={[styles.headerDot, isDarkMode && styles.headerDotDark]}>•</Text>
                        <Ionicons name="time" size={12} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                        <Text style={[styles.headerInfoText, isDarkMode && styles.headerInfoTextDark]}>{t('shopHours')}</Text>
                    </View>
                </View>
                <Pressable style={[styles.notificationBtn, isDarkMode && styles.notificationBtnDark]}>
                    <Ionicons name="notifications-outline" size={24} color={isDarkMode ? "#F2C27A" : "#2C1B10"} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { backgroundColor: isDarkMode ? '#121212' : '#FDF8E1' }]}>
                <View style={styles.heroSection}>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Ionicons key={i} name="star" size={16} color="#F2C27A" style={{ marginRight: 2 }} />
                        ))}
                        <Text style={[styles.reviewsTotalText, isDarkMode && styles.reviewsTotalTextDark]}>5.0 (2.5k+ {t('reviews')})</Text>
                    </View>
                    <Text style={[styles.heroTitle, isDarkMode && styles.heroTitleDark]}>{t('heroTitle')}</Text>
                    <Text style={[styles.heroSubtitle, isDarkMode && styles.heroSubtitleDark]}>{t('heroSubtitle')}</Text>
                    <View style={styles.statsRow}>
                        {['15k+ Clients', '10+ Years', '7 Days/Week'].map((t, idx) => (
                            <View key={idx} style={[styles.statBox, isDarkMode && styles.statBoxDark]}>
                                <Text style={[styles.statText, isDarkMode && styles.statTextDark]}>{t}</Text>
                            </View>
                        ))}
                    </View>
                    <Pressable style={styles.primaryCta} onPress={() => { setWizardInitialBarber(null); setIsWizardVisible(true); }}>
                        <Text style={styles.primaryCtaText}>{t('bookCta')}</Text>
                    </Pressable>
                </View>

                {myAppointments.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('myAppointments')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.appointmentsScroll}>
                            {myAppointments.map(item => {
                                const d = new Date(item.appointmentDateISO);
                                const dateString = d.toLocaleDateString();
                                const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const barberName = BARBERS.find(b => b.email === item.barberEmail)?.name || item.barberEmail;
                                return (
                                    <View key={item.id} style={[styles.appointmentCard, isDarkMode && styles.appointmentCardDark]}>
                                        <View style={styles.appointmentHeader}>
                                            <Text style={[styles.appointmentService, isDarkMode && styles.appointmentServiceDark]}>{item.serviceName}</Text>
                                            <View style={[styles.statusBadge, item.status === 'rejected' && { backgroundColor: isDarkMode ? '#3D1C1C' : '#FDECEA' }, item.status === 'pending' && { backgroundColor: isDarkMode ? '#2C1B10' : '#FFF3E0' }]}>
                                                <Text style={[styles.statusText, item.status === 'rejected' && { color: '#FF5252' }, item.status === 'pending' && { color: '#F2C27A' }]}>
                                                    {item.status === 'pending' ? t('pending') : item.status === 'accepted' ? t('accepted') : t('rejected')}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.appointmentBarber, isDarkMode && styles.appointmentBarberDark]}>{t('with')} {barberName}</Text>
                                        <View style={[styles.appointmentTimeRow, isDarkMode && styles.appointmentTimeRowDark]}>
                                            <Ionicons name="calendar-outline" size={14} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                                            <Text style={[styles.appointmentTime, isDarkMode && styles.appointmentTimeDark]}>{dateString} at {timeString}</Text>
                                        </View>
                                        {item.status === 'rejected' && item.rejectionReason && (
                                            <Text style={{ color: '#FF5252', fontSize: 12, marginTop: 8 }}>Reason: {item.rejectionReason}</Text>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('services')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll} style={styles.categoriesContainer}>
                        {CATEGORIES.map(category => {
                            const isSelected = selectedCategory === category;
                            return (
                                <Pressable key={category} style={[styles.categoryBtn, isDarkMode && styles.categoryBtnDark, isSelected && styles.categoryBtnActive, isSelected && isDarkMode && styles.categoryBtnActiveDark]} onPress={() => setSelectedCategory(category)}>
                                    <Text style={[styles.categoryText, isDarkMode && styles.categoryTextDark, isSelected && styles.categoryTextActive]}>{category}</Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                    <View style={styles.filterRow}>
                        <Text style={[styles.filterText, isDarkMode && styles.filterTextDark]}>{t('sortByPopular')}</Text>
                        <Ionicons name="chevron-down" size={16} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                    </View>
                    {filteredServices.map(service => renderServiceCard(service))}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>{t('meetTeam')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barbersScroll}>
                        {BARBERS.map(barber => renderBarberCard(barber))}
                    </ScrollView>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <AppointmentWizardModal visible={isWizardVisible} initialBarber={wizardInitialBarber} onClose={() => setIsWizardVisible(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8DCCB',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C1B10',
        fontFamily: 'serif',
        marginBottom: 4,
    },
    headerInfoRow: { flexDirection: 'row', alignItems: 'center' },
    headerInfoText: { fontSize: 12, color: '#6D4C41', marginLeft: 4, fontWeight: '500' },
    headerDot: { fontSize: 12, color: '#6D4C41', marginHorizontal: 6 },
    notificationBtn: { padding: 8, backgroundColor: '#F7F2EA', borderRadius: 8 },
    scrollContent: { paddingBottom: 40 },
    heroSection: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24, alignItems: 'center' },
    starsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    reviewsTotalText: { fontSize: 13, color: '#6D4C41', marginLeft: 6, fontWeight: '600' },
    heroTitle: { fontSize: 32, fontFamily: 'serif', fontWeight: 'bold', color: '#2C1B10', textAlign: 'center', lineHeight: 38, marginBottom: 12 },
    heroSubtitle: { fontSize: 16, color: '#6D4C41', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32, gap: 8 },
    statBox: { borderWidth: 1, borderColor: '#E8DCCB', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#FFFFFF' },
    statText: { fontSize: 12, color: '#2C1B10', fontWeight: '600' },
    primaryCta: { backgroundColor: '#B24700', width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center', elevation: 4 },
    primaryCtaText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    sectionContainer: { paddingTop: 24 },
    sectionTitle: { fontSize: 22, fontFamily: 'serif', fontWeight: 'bold', color: '#2C1B10', paddingHorizontal: 20, marginBottom: 16 },
    appointmentsScroll: { paddingHorizontal: 20, gap: 16 },
    appointmentCard: { backgroundColor: '#FFFFFF', borderRadius: 16, width: 200, padding: 16, borderWidth: 1, borderColor: '#F2ECE4' },
    appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    appointmentService: { fontSize: 15, fontWeight: 'bold', color: '#2C1B10', flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    appointmentBarber: { fontSize: 13, color: '#6D4C41', marginBottom: 12 },
    appointmentTimeRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F2ECE4' },
    appointmentTime: { fontSize: 12, color: '#6D4C41', marginLeft: 4, fontWeight: '500' },
    categoriesContainer: { marginBottom: 16 },
    categoriesScroll: { paddingHorizontal: 20, gap: 8 },
    categoryBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E8DCCB' },
    categoryBtnActive: { backgroundColor: '#2C1B10', borderColor: '#2C1B10' },
    categoryText: { fontSize: 14, color: '#6D4C41', fontWeight: '600' },
    categoryTextActive: { color: '#FFFFFF' },
    filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
    filterText: { fontSize: 14, color: '#6D4C41', fontWeight: '500', marginRight: 4 },
    serviceCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F2ECE4' },
    serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    serviceTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C1B10', marginBottom: 6 },
    popularTag: { backgroundColor: '#B24700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    popularText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    serviceDesc: { fontSize: 14, color: '#6D4C41', lineHeight: 20, marginBottom: 16 },
    serviceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F2ECE4', paddingTop: 16 },
    durationRow: { flexDirection: 'row', alignItems: 'center' },
    durationText: { fontSize: 13, color: '#6D4C41', marginLeft: 6, fontWeight: '500' },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    priceText: { fontSize: 18, fontWeight: 'bold', color: '#2C1B10' },
    bookNowBtn: { backgroundColor: '#2C1B10', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    bookNowText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    barbersScroll: { paddingHorizontal: 20, gap: 16 },
    barberCard: { backgroundColor: '#FFFFFF', borderRadius: 16, width: 220, borderWidth: 1, borderColor: '#F2ECE4', overflow: 'hidden' },
    barberImageContainer: { height: 140, width: '100%', position: 'relative' },
    barberImage: { height: '100%', width: '100%' },
    availableTag: { position: 'absolute', top: 12, left: 12, backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    availableText: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold' },
    barberInfo: { padding: 12 },
    barberName: { fontSize: 16, fontWeight: 'bold', color: '#2C1B10', marginBottom: 4 },
    barberRole: { fontSize: 12, color: '#6D4C41', marginBottom: 8 },
    barberStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    ratingText: { fontSize: 12, color: '#2C1B10', fontWeight: '600', marginLeft: 4 },
    experienceText: { fontSize: 11, color: '#6D4C41', fontStyle: 'italic', marginBottom: 12 },
    bookBarberBtn: { backgroundColor: '#F7F2EA', borderWidth: 1, borderColor: '#E8DCCB', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    bookBarberText: { color: '#2C1B10', fontSize: 12, fontWeight: 'bold' },

    headerDark: { backgroundColor: '#1A1A1A', borderBottomColor: '#2A2A2A' },
    headerTitleDark: { color: '#FFFFFF' },
    headerInfoTextDark: { color: '#A0A0A0' },
    headerDotDark: { color: '#A0A0A0' },
    notificationBtnDark: { backgroundColor: '#2A2A2A' },
    reviewsTotalTextDark: { color: '#A0A0A0' },
    heroTitleDark: { color: '#FFFFFF' },
    heroSubtitleDark: { color: '#A0A0A0' },
    statBoxDark: { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' },
    statTextDark: { color: '#FFFFFF' },
    sectionTitleDark: { color: '#FFFFFF' },
    appointmentCardDark: { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' },
    appointmentServiceDark: { color: '#FFFFFF' },
    appointmentBarberDark: { color: '#A0A0A0' },
    appointmentTimeRowDark: { borderTopColor: '#2A2A2A' },
    appointmentTimeDark: { color: '#A0A0A0' },
    categoryBtnDark: { borderColor: '#2A2A2A' },
    categoryBtnActiveDark: { backgroundColor: '#F2C27A', borderColor: '#F2C27A' },
    categoryTextDark: { color: '#A0A0A0' },
    filterTextDark: { color: '#A0A0A0' },
    serviceCardDark: { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' },
    serviceTitleDark: { color: '#FFFFFF' },
    serviceDescDark: { color: '#A0A0A0' },
    serviceFooterDark: { borderTopColor: '#2A2A2A' },
    durationTextDark: { color: '#A0A0A0' },
    priceTextDark: { color: '#FFFFFF' },
    bookNowBtnDark: { backgroundColor: '#F2C27A' },
    bookNowTextDark: { color: '#2C1B10' },
    barberCardDark: { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' },
    barberNameDark: { color: '#FFFFFF' },
    barberRoleDark: { color: '#A0A0A0' },
    ratingTextDark: { color: '#FFFFFF' },
    experienceTextDark: { color: '#A0A0A0' },
    bookBarberBtnDark: { backgroundColor: '#2A2A2A', borderColor: '#2A2A2A' },
    bookBarberTextDark: { color: '#F2C27A' },
});
