import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppointments } from "../../src/state/AppointmentsContext";
import { useAuth } from "../../src/state/AuthContext";
import { useLanguage } from "../../src/state/LanguageContext";
import { useTheme } from "../../src/state/ThemeContext";
import { getAuthData } from "../../src/storage/authStorage";

type FilterStatus = 'pending' | 'accepted' | 'rejected' | 'all';
type FilterDate = 'all' | 'today' | 'this_week';

const getStatusText = (status: any) => {
    const s = String(status).toLowerCase();
    if (s === '0' || s === 'pending') return 'pending';
    if (s === '1' || s === 'accepted') return 'accepted';
    if (s === '2' || s === 'rejected') return 'rejected';
    return String(status) || 'unknown';
};

export default function AdminHome() {
    const { isDarkMode } = useTheme();
    const { appointments } = useAppointments();
    const { t } = useLanguage();
    const { logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
    const [dateFilter, setDateFilter] = useState<FilterDate>('all');
    const [adminEmail, setAdminEmail] = useState("");

    useEffect(() => {
        getAuthData().then(s => {
            if (s) setAdminEmail(s.email);
        });
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const totalCount = appointments.length;
    const pendingCount = appointments.filter(a => getStatusText(a.status) === 'pending').length;
    const acceptedCount = appointments.filter(a => getStatusText(a.status) === 'accepted').length;
    const rejectedCount = appointments.filter(a => getStatusText(a.status) === 'rejected').length;

    const filteredAppointments = appointments.filter(appt => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query ||
            (appt.barberEmail || "").toLowerCase().includes(query) ||
            (appt.customerEmail || "").toLowerCase().includes(query) ||
            (appt.serviceName || "").toLowerCase().includes(query);

        if (!matchesSearch) return false;

        const apptStatus = getStatusText(appt.status);
        if (statusFilter !== 'all' && apptStatus !== statusFilter) return false;

        if (dateFilter !== 'all') {
            const today = new Date();
            const apptDate = new Date(appt.appointmentDateISO || (appt as any).appointmentDate);
            if (dateFilter === 'today') {
                if (apptDate.toDateString() !== today.toDateString()) return false;
            } else if (dateFilter === 'this_week') {
                const diffTime = Math.abs(today.getTime() - apptDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 7) return false;
            }
        }
        return true;
    }).sort((a, b) => {
        const dateA = new Date(a.appointmentDateISO || a.createdAt || 0);
        const dateB = new Date(b.appointmentDateISO || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
    });

    const renderAppointment = ({ item }: { item: any }) => {
        const d = new Date(item.appointmentDateISO);
        const dateString = isNaN(d.getTime()) ? item.appointmentDateISO : d.toLocaleDateString();
        const timeString = isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const itemStatus = getStatusText(item.status);

        return (
            <View style={[styles.card, isDarkMode && styles.cardDark]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.serviceText, isDarkMode && styles.serviceTextDark]}>{item.serviceName}</Text>
                    <View style={[
                        styles.statusBadge,
                        itemStatus === 'pending' && (isDarkMode ? styles.statusPendingDark : styles.statusPending),
                        itemStatus === 'accepted' && (isDarkMode ? styles.statusAcceptedDark : styles.statusAccepted),
                        itemStatus === 'rejected' && (isDarkMode ? styles.statusRejectedDark : styles.statusRejected)
                    ]}>
                        <Text style={[
                            styles.statusText,
                            itemStatus === 'pending' && (isDarkMode ? styles.statusTextPendingDark : styles.statusTextPending),
                            itemStatus === 'accepted' && (isDarkMode ? styles.statusTextAcceptedDark : styles.statusTextAccepted),
                            itemStatus === 'rejected' && (isDarkMode ? styles.statusTextRejectedDark : styles.statusTextRejected)
                        ]}>
                            {itemStatus.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-circle-outline" size={16} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                        <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>{t('clientLabel')} {item.customerEmail}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="cut-outline" size={16} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                        <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>{t('barberLabel')} {item.barberEmail}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                        <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>{dateString} {timeString ? `${t('atSeparator')} ${timeString}` : ''}</Text>
                    </View>

                    {itemStatus === 'rejected' && item.rejectionReason && (
                        <View style={[styles.noteBox, isDarkMode && styles.noteBoxDark]}>
                            <Text style={[styles.noteLabel, isDarkMode && styles.noteLabelDark, !isDarkMode && { color: '#CF000F' }]}>{t('valReason')}</Text>
                            <Text style={[styles.noteText, isDarkMode && styles.noteTextDark, !isDarkMode && { color: '#CF000F' }]}>{item.rejectionReason}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: '#FFFFFF' }, isDarkMode && { backgroundColor: '#1A1A1A' }]}>
            <View style={[styles.header, isDarkMode && styles.headerDark]}>
                <View>
                    <Text style={[styles.title, isDarkMode && styles.titleDark]}>{t('adminDashboard')}</Text>
                    <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>{t('overview')}</Text>
                </View>
                <Pressable onPress={handleLogout} style={[styles.logoutBtn, isDarkMode && styles.logoutBtnDark]}>
                    <Ionicons name="log-out-outline" size={22} color={isDarkMode ? "#F2C27A" : "#2C1B10"} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { backgroundColor: isDarkMode ? '#121212' : '#FDF8E1' }]}>
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                        <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>{t('totalAppts')}</Text>
                        <Text style={[styles.statValue, isDarkMode && styles.statValueDark]}>{totalCount}</Text>
                    </View>
                    <View style={[styles.statCard, isDarkMode && styles.statCardDark, { borderLeftColor: '#E65100' }]}>
                        <Text style={[styles.statLabel, { color: '#E65100' }]}>{t('pending').toUpperCase()}</Text>
                        <Text style={[styles.statValue, isDarkMode && styles.statValueDark]}>{pendingCount}</Text>
                    </View>
                    <View style={[styles.statCard, isDarkMode && styles.statCardDark, { borderLeftColor: '#2E7D32' }]}>
                        <Text style={[styles.statLabel, { color: '#2E7D32' }]}>{t('accepted').toUpperCase()}</Text>
                        <Text style={[styles.statValue, isDarkMode && styles.statValueDark]}>{acceptedCount}</Text>
                    </View>
                </View>

                <View style={styles.filterSection}>
                    <View style={[styles.searchBar, isDarkMode && styles.searchBarDark]}>
                        <Ionicons name="search-outline" size={20} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                        <TextInput
                            style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
                            placeholder={t('searchPlaceholder')}
                            placeholderTextColor={isDarkMode ? "#555" : "#A0A0A0"}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
                        <Pressable onPress={() => setStatusFilter('all')} style={[styles.filterTab, isDarkMode && styles.filterTabDark, statusFilter === 'all' && styles.filterTabActive]}>
                            <Text style={[styles.filterTabText, statusFilter === 'all' && styles.filterTabTextActive]}>{t('allStatus')}</Text>
                        </Pressable>
                        <Pressable onPress={() => setStatusFilter('pending')} style={[styles.filterTab, isDarkMode && styles.filterTabDark, statusFilter === 'pending' && styles.filterTabActive]}>
                            <Text style={[styles.filterTabText, statusFilter === 'pending' && styles.filterTabTextActive]}>{t('pending')}</Text>
                        </Pressable>
                        <Pressable onPress={() => setStatusFilter('accepted')} style={[styles.filterTab, isDarkMode && styles.filterTabDark, statusFilter === 'accepted' && styles.filterTabActive]}>
                            <Text style={[styles.filterTabText, statusFilter === 'accepted' && styles.filterTabTextActive]}>{t('accepted')}</Text>
                        </Pressable>
                        <Pressable onPress={() => setStatusFilter('rejected')} style={[styles.filterTab, isDarkMode && styles.filterTabDark, statusFilter === 'rejected' && styles.filterTabActive]}>
                            <Text style={[styles.filterTabText, statusFilter === 'rejected' && styles.filterTabTextActive]}>{t('rejected')}</Text>
                        </Pressable>
                    </ScrollView>

                    <View style={styles.dateFilterRow}>
                        <Text style={[styles.dateFilterLabel, isDarkMode && styles.dateFilterLabelDark]}>{t('datePeriod')}</Text>
                        <View style={styles.dateFilterBtns}>
                            <Pressable onPress={() => setDateFilter('all')} style={[styles.dateBtn, isDarkMode && styles.dateBtnDark, dateFilter === 'all' && styles.dateBtnActive]}>
                                <Text style={[styles.dateBtnText, isDarkMode && styles.dateBtnTextDark, dateFilter === 'all' && styles.dateBtnTextActive]}>{t('allTime')}</Text>
                            </Pressable>
                            <Pressable onPress={() => setDateFilter('today')} style={[styles.dateBtn, isDarkMode && styles.dateBtnDark, dateFilter === 'today' && styles.dateBtnActive]}>
                                <Text style={[styles.dateBtnText, isDarkMode && styles.dateBtnTextDark, dateFilter === 'today' && styles.dateBtnTextActive]}>{t('today')}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={styles.listContainer}>
                    {filteredAppointments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={48} color={isDarkMode ? "#333" : "#E8DCCB"} />
                            <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>{t('noMatchAppts')}</Text>
                        </View>
                    ) : (
                        filteredAppointments.map(appt => (
                            <View key={appt.id}>{renderAppointment({ item: appt })}</View>
                        ))
                    )}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E8DCCB",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        fontFamily: "serif",
        color: "#2C1B10",
    },
    subtitle: {
        fontSize: 14,
        color: '#6D4C41',
        marginTop: 2,
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: "#F7F2EA",
        borderRadius: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 5,
        borderLeftColor: '#2C1B10',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#6D4C41',
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C1B10',
    },
    filterSection: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8DCCB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#2C1B10',
        paddingVertical: 0,
    },
    filterTabs: {
        marginBottom: 16,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F7F2EA',
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E8DCCB',
    },
    filterTabActive: {
        backgroundColor: '#2C1B10',
        borderColor: '#2C1B10',
    },
    filterTabText: {
        fontSize: 13,
        color: '#6D4C41',
        fontWeight: '600',
    },
    filterTabTextActive: {
        color: '#FFFFFF',
    },
    dateFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
    },
    dateFilterLabel: {
        fontSize: 13,
        color: '#6D4C41',
        marginRight: 10,
    },
    dateFilterBtns: {
        flexDirection: 'row',
        gap: 8,
    },
    dateBtn: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8DCCB',
    },
    dateBtnActive: {
        backgroundColor: '#6D4C41',
        borderColor: '#6D4C41',
    },
    dateBtnText: {
        fontSize: 11,
        color: '#6D4C41',
        fontWeight: '600',
    },
    dateBtnTextActive: {
        color: '#FFFFFF',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F2ECE4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    serviceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C1B10',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusPending: { backgroundColor: '#FFF3E0' },
    statusAccepted: { backgroundColor: '#E8F5E9' },
    statusRejected: { backgroundColor: '#FDECEA' },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    statusTextPending: { color: '#E65100' },
    statusTextAccepted: { color: '#2E7D32' },
    statusTextRejected: { color: '#CF000F' },
    cardBody: {
        gap: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#4E342E',
    },
    noteBox: {
        backgroundColor: '#F7F2EA',
        padding: 10,
        borderRadius: 8,
        marginTop: 6,
    },
    noteLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8C4004',
        marginBottom: 2,
    },
    noteText: {
        fontSize: 13,
        color: '#2C1B10',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        textAlign: 'center',
        paddingTop: 32,
        color: '#6D4C41',
        fontStyle: 'italic',
    },

    headerDark: {
        backgroundColor: '#1A1A1A',
        borderBottomColor: '#333',
    },
    titleDark: {
        color: '#FFFFFF',
    },
    subtitleDark: {
        color: '#A0A0A0',
    },
    logoutBtnDark: {
        backgroundColor: '#2A2A2A',
    },
    statCardDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    statLabelDark: {
        color: '#A0A0A0',
    },
    statValueDark: {
        color: '#FFFFFF',
    },
    searchBarDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    searchInputDark: {
        color: '#FFFFFF',
    },
    filterTabDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    dateFilterLabelDark: {
        color: '#A0A0A0',
    },
    dateBtnDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    dateBtnTextDark: {
        color: '#A0A0A0',
    },
    emptyTextDark: {
        color: '#555',
    },
    cardDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    serviceTextDark: {
        color: '#FFFFFF',
    },
    infoTextDark: {
        color: '#A0A0A0',
    },
    noteBoxDark: {
        backgroundColor: '#2A1A1A',
    },
    noteLabelDark: {
        color: '#FF5252',
    },
    noteTextDark: {
        color: '#FFCDD2',
    },
    statusPendingDark: { backgroundColor: '#332515' },
    statusAcceptedDark: { backgroundColor: '#152F17' },
    statusRejectedDark: { backgroundColor: '#3D1C1C' },
    statusTextPendingDark: { color: '#F2C27A' },
    statusTextAcceptedDark: { color: '#81C784' },
    statusTextRejectedDark: { color: '#FF5252' },
});
