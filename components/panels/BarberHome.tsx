import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppointments } from "../../src/state/AppointmentsContext";
import { useAuth } from "../../src/state/AuthContext";
import { useLanguage } from "../../src/state/LanguageContext";
import { useTheme } from "../../src/state/ThemeContext";
import { Appointment, AppointmentStatus } from "../../src/storage/appointmentsStorage";
import { getAuthData } from "../../src/storage/authStorage";

const getStatusText = (status: any) => {
    const s = String(status).toLowerCase();
    if (s === '0' || s === 'pending') return 'pending';
    if (s === '1' || s === 'accepted') return 'accepted';
    if (s === '2' || s === 'rejected') return 'rejected';
    return s;
};

const getId = (item: any) => item.id || item.appointmentId;

type FilterType = AppointmentStatus | 'All';

export default function BarberHome() {
    const { isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { logout, session } = useAuth();
    const { appointments, loading: isLoading, refresh: refreshAppointments, acceptAppointment, rejectAppointment } = useAppointments();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('All');
    const [actionLoadingIds, setActionLoadingIds] = useState<Record<string, boolean>>({});
    const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

    const barberEmail = session?.email || '';

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshAppointments();
        setIsRefreshing(false);
    };

    useEffect(() => {
        refreshAppointments();
    }, [refreshAppointments]);

    const handleLogout = async () => {
        await logout();
    };

    const handleAction = async (item: Appointment, isAccept: boolean) => {
        const id = item.id;
        if (!id) return;
        setActionLoadingIds(prev => ({ ...prev, [id]: true }));
        setActionErrors(prev => ({ ...prev, [id]: '' }));
        try {
            if (isAccept) {
                await acceptAppointment(id);
            } else {
                await rejectAppointment(id, t('rejectedByBarber'));
            }
        } catch (e: any) {
            setActionErrors(prev => ({ ...prev, [id]: e.message || `Failed to ${isAccept ? 'accept' : 'reject'}` }));
        } finally {
            setActionLoadingIds(prev => ({ ...prev, [id]: false }));
        }
    };

    // Removed filtering by email to show all barber appointments as requested
    const myAppointments = appointments;

    const filteredAppointments = myAppointments.filter(a => {
        const itemStatus = getStatusText(a.status);
        if (filter === 'All') return true;
        return itemStatus === filter.toLowerCase();
    }).sort((a, b) => b.createdAt - a.createdAt);

    const pendingCount = myAppointments.filter(a => getStatusText(a.status) === 'pending').length;
    const acceptedCount = myAppointments.filter(a => getStatusText(a.status) === 'accepted').length;
    const todayString = new Date().toDateString();
    const todayCount = myAppointments.filter(a => new Date(a.appointmentDateISO).toDateString() === todayString).length;

    const renderFilterChips = () => {
        const filters: FilterType[] = ['All', 'pending', 'accepted', 'rejected'];
        return (
            <SafeAreaView style={styles.chipsContainer}>
                {filters.map(f => (
                    <Pressable
                        key={f}
                        style={[
                            styles.chip,
                            isDarkMode && styles.chipDark,
                            filter === f && styles.chipActive,
                            isDarkMode && filter === f && styles.chipActiveDark
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.chipText,
                            isDarkMode && styles.chipTextDark,
                            filter === f && styles.chipTextActive
                        ]}>
                            {f === 'All' ? t('tabAppointments') : f === 'pending' ? t('pending') : f === 'accepted' ? t('accepted') : t('rejected')}
                        </Text>
                    </Pressable>
                ))}
            </SafeAreaView>
        );
    };

    const renderAppointment = ({ item }: { item: Appointment }) => {
        const d = new Date(item.appointmentDateISO);
        const dateString = d.toLocaleDateString();
        const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const id = item.id;
        const isActionLoading = id ? actionLoadingIds[id] : false;
        const errorText = id ? actionErrors[id] : null;

        return (
            <View style={[styles.card, isDarkMode && styles.cardDark]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.serviceText, isDarkMode && styles.serviceTextDark]}>{item.serviceName}</Text>
                    <View style={[
                        styles.statusBadge,
                        getStatusText(item.status) === 'pending' && styles.statusPending,
                        getStatusText(item.status) === 'accepted' && styles.statusAccepted,
                        getStatusText(item.status) === 'rejected' && styles.statusRejected,
                        isDarkMode && styles.statusBadgeDark
                    ]}>
                        <Text style={[
                            styles.statusText,
                            getStatusText(item.status) === 'pending' && styles.statusTextPending,
                            getStatusText(item.status) === 'accepted' && styles.statusTextAccepted,
                            getStatusText(item.status) === 'rejected' && styles.statusTextRejected,
                            isDarkMode && { fontWeight: 'bold' }
                        ]}>
                            {getStatusText(item.status).toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={[styles.customerText, isDarkMode && styles.customerTextDark]}>{t('clientLabel')} {item.customerEmail}</Text>
                    <Text style={[styles.customerText, { fontSize: 12, marginTop: -4, marginBottom: 8 }, isDarkMode && styles.customerTextDark]}>To: {item.barberEmail}</Text>
                    <View style={styles.timeRow}>
                        <Ionicons name="calendar-outline" size={16} color={isDarkMode ? "#A0A0A0" : "#6D4C41"} />
                        <Text style={[styles.timeText, isDarkMode && styles.timeTextDark]}>{dateString} {t('atSeparator')} {timeString}</Text>
                    </View>

                    {errorText && (
                        <Text style={styles.errorInlineText}>{errorText}</Text>
                    )}

                    {item.status === 'pending' && (
                        <View style={styles.actionRow}>
                            {isActionLoading ? (
                                <ActivityIndicator color={isDarkMode ? "#F2C27A" : "#2C1B10"} />
                            ) : (
                                <>
                                    <Pressable
                                        style={[styles.actionBtn, styles.rejectBtn]}
                                        onPress={() => handleAction(item, false)}
                                    >
                                        <Text style={styles.rejectBtnText}>{t('reject')}</Text>
                                    </Pressable>
                                    <Pressable
                                        style={[styles.actionBtn, styles.acceptBtn]}
                                        onPress={() => handleAction(item, true)}
                                    >
                                        <Text style={styles.acceptBtnText}>{t('accept')}</Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    )}
                </View>
            </View >
        );
    };

    return (
        <SafeAreaView style={[{ flex: 1, backgroundColor: '#F7F2EA' }, isDarkMode && { backgroundColor: '#121212' }]}>
            <View style={[styles.header, isDarkMode && styles.headerDark]}>
                <View>
                    <Text style={[styles.title, isDarkMode && styles.titleDark]}>{t('barberPanel')}</Text>
                    <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>{barberEmail}</Text>
                </View>
                <Pressable onPress={handleLogout} style={[styles.logoutBtn, isDarkMode && styles.logoutBtnDark]}>
                    <Ionicons name="log-out-outline" size={22} color={isDarkMode ? "#F2C27A" : "#2C1B10"} />
                </Pressable>
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statBox, isDarkMode && styles.statBoxDark]}>
                    <Text style={[styles.statNumber, isDarkMode && styles.statNumberDark]}>{pendingCount}</Text>
                    <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>{t('pending')}</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxAlt, isDarkMode && styles.statBoxAltDark]}>
                    <Text style={[styles.statNumber, { color: isDarkMode ? '#F2C27A' : '#B35A12' }]}>{todayCount}</Text>
                    <Text style={[styles.statLabel, { color: isDarkMode ? '#A0A0A0' : '#8C4004' }]}>{t('today')}</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxSuccess, isDarkMode && styles.statBoxSuccessDark]}>
                    <Text style={[styles.statNumber, { color: isDarkMode ? '#81C784' : '#2E7D32' }]}>{acceptedCount}</Text>
                    <Text style={[styles.statLabel, { color: isDarkMode ? '#C8E6C9' : '#1B5E20' }]}>{t('accepted')}</Text>
                </View>
            </View>

            {renderFilterChips()}

            <View style={styles.listContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={isDarkMode ? "#F2C27A" : "#2C1B10"} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredAppointments}
                        keyExtractor={item => getId(item)}
                        renderItem={renderAppointment}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor={isDarkMode ? "#F2C27A" : "#2C1B10"}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="calendar-outline" size={60} color={isDarkMode ? "#333" : "#E8DCCB"} />
                                <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>{t('noAppointments')}</Text>
                            </View>
                        }
                    />
                )}
            </View>
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
        fontSize: 12,
        color: "#6D4C41",
        marginTop: 4,
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: "#F7F2EA",
        borderRadius: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2ECE4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statBoxAlt: {
        backgroundColor: '#FFF8E1',
        borderColor: '#FFE082',
    },
    statBoxSuccess: {
        backgroundColor: '#E8F5E9',
        borderColor: '#C8E6C9',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C1B10',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6D4C41',
        fontWeight: '500',
    },
    chipsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 12,
        gap: 8,
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8DCCB',
    },
    chipActive: {
        backgroundColor: '#2C1B10',
        borderColor: '#2C1B10',
    },
    chipText: {
        fontSize: 12,
        color: '#6D4C41',
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    listContent: {
        paddingBottom: 40,
        gap: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
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
        marginBottom: 16,
    },
    customerText: {
        fontSize: 14,
        color: '#6D4C41',
        marginBottom: 8,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#6D4C41',
        fontWeight: '500',
    },
    errorInlineText: {
        color: '#CF000F',
        fontSize: 12,
        marginBottom: 8,
        textAlign: 'right',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F2ECE4',
    },
    actionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    rejectBtn: {
        backgroundColor: '#F7F2EA',
        borderWidth: 1,
        borderColor: '#E8DCCB',
    },
    rejectBtnText: {
        color: '#CF000F',
        fontWeight: 'bold',
    },
    acceptBtn: {
        backgroundColor: '#2E7D32',
    },
    acceptBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    headerDark: {
        backgroundColor: '#1A1A1A',
        borderBottomColor: '#2A2A2A',
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
    statBoxDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#2A2A2A',
    },
    statBoxAltDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#2A2A2A',
    },
    statBoxSuccessDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#2A2A2A',
    },
    statNumberDark: {
        color: '#FFFFFF',
    },
    statLabelDark: {
        color: '#A0A0A0',
    },
    chipDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#2A2A2A',
    },
    chipActiveDark: {
        backgroundColor: '#B24700',
        borderColor: '#B24700',
    },
    chipTextDark: {
        color: '#A0A0A0',
    },
    cardDark: {
        backgroundColor: '#1A1A1A',
        borderColor: '#2A2A2A',
    },
    serviceTextDark: {
        color: '#FFFFFF',
    },
    customerTextDark: {
        color: '#A0A0A0',
    },
    timeTextDark: {
        color: '#A0A0A0',
    },
    statusBadgeDark: {
        opacity: 0.9,
    },
    emptyText: {
        textAlign: 'center',
        paddingTop: 32,
        color: '#6D4C41',
        fontStyle: 'italic',
    },
    emptyTextDark: {
        color: '#555',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
});
