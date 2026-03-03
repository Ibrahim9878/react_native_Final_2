import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
    Alert,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceItem, BarberItem, SERVICES, BARBERS, generateAvailableSlots } from '../mock/servicesAndBarbers';
import { getAuthData } from '../storage/authStorage';
import { useAppointments } from '../state/AppointmentsContext';
import { useTheme } from '../state/ThemeContext';
import { useLanguage } from '../state/LanguageContext';

type AppointmentWizardModalProps = {
    visible: boolean;
    onClose: () => void;
    initialBarber?: BarberItem | null;
    onAppointmentAdded?: () => void;
};

export default function AppointmentWizardModal({ visible, onClose, initialBarber, onAppointmentAdded }: AppointmentWizardModalProps) {
    const { addAppointment } = useAppointments();
    const { isDarkMode } = useTheme();
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<BarberItem | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [note, setNote] = useState('');

    React.useEffect(() => {
        if (visible) {
            if (initialBarber) {
                setSelectedBarber(initialBarber);
            } else {
                setSelectedBarber(null);
            }
        }
    }, [visible, initialBarber]);

    const resetWizard = () => {
        setStep(1);
        setSelectedService(null);
        setSelectedBarber(initialBarber || null);
        setSelectedDate(null);
        setSelectedTime(null);
        setNote('');
    };

    const handleClose = () => {
        resetWizard();
        onClose();
    };

    const handleNext = () => {
        if (step === 1 && initialBarber) {
            setStep(3); // Skip step 2 if barber was preselected
        } else {
            setStep(s => s + 1);
        }
    };
    const handleBack = () => {
        if (step === 3 && initialBarber) {
            setStep(1); // Go back straight to step 1
        } else {
            setStep(s => s - 1);
        }
    };

    const handleConfirm = async () => {
        if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;

        try {
            setIsLoading(true);
            const session = await getAuthData();
            if (!session || !session.token) {
                Alert.alert("Session Error", "Could not verify your customer email / token.");
                return;
            }

            const [timePart, modifier] = selectedTime.split(' ');
            let [hours, minutes] = timePart.split(':');
            let hoursInt = parseInt(hours, 10);
            if (hoursInt === 12) {
                hoursInt = modifier === 'PM' ? 12 : 0;
            } else if (modifier === 'PM') {
                hoursInt += 12;
            }
            const hh = hoursInt.toString().padStart(2, '0');
            const mm = minutes.padStart(2, '0');

            const appointmentDate = `${selectedDate}T${hh}:${mm}:00.000Z`; 

            await addAppointment({
                appointmentDateISO: appointmentDate,
                barberEmail: "barber@gmail.com", 
                customerEmail: session.email,
                serviceName: selectedService.title,
                note: note.trim()
            });

            setStep(6);
            if (onAppointmentAdded) onAppointmentAdded();
        } catch (e: any) {
            Alert.alert("Error handling appointment", e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const isNextDisabled = () => {
        if (step === 1 && !selectedService) return true;
        if (step === 2 && !selectedBarber) return true;
        if (step === 3 && (!selectedDate || !selectedTime)) return true;
        return false;
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return t('stepService');
            case 2: return initialBarber ? t('stepBarberPreset') : t('stepBarber');
            case 3: return t('stepDateTime');
            case 4: return t('stepNote');
            case 5: return t('stepConfirm');
            case 6: return t('stepSuccess');
            default: return '';
        }
    };

    const renderStep1 = () => (
        <ScrollView contentContainerStyle={styles.stepContent}>
            {SERVICES.map(service => (
                <Pressable
                    key={service.id}
                    style={[
                        styles.card,
                        isDarkMode && styles.cardDark,
                        selectedService?.id === service.id && styles.cardActive
                    ]}
                    onPress={() => setSelectedService(service)}
                >
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, isDarkMode && styles.textDark, selectedService?.id === service.id && styles.textActive]}>{service.title}</Text>
                        <Text style={[styles.cardPrice, isDarkMode && styles.textDark, selectedService?.id === service.id && styles.textActive]}>${service.price}</Text>
                    </View>
                    <Text style={[styles.cardSubtitle, isDarkMode && styles.textMutatedDark, selectedService?.id === service.id && styles.textActive]}>{service.duration}</Text>
                </Pressable>
            ))}
        </ScrollView>
    );

    const renderStep2 = () => {
        const availableBarbers = BARBERS.filter(b => selectedService ? b.specialties.includes(selectedService.id) : true);

        return (
            <ScrollView contentContainerStyle={styles.stepContent}>
                {availableBarbers.map(barber => (
                    <Pressable
                        key={barber.id}
                        style={[
                            styles.card,
                            isDarkMode && styles.cardDark,
                            selectedBarber?.id === barber.id && styles.cardActive
                        ]}
                        onPress={() => setSelectedBarber(barber)}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, isDarkMode && styles.textDark, selectedBarber?.id === barber.id && styles.textActive]}>{barber.name}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color={selectedBarber?.id === barber.id ? "#FFFFFF" : "#F2C27A"} />
                                <Text style={[styles.cardPrice, { marginLeft: 4 }, isDarkMode && styles.textDark, selectedBarber?.id === barber.id && styles.textActive]}>{barber.rating}</Text>
                            </View>
                        </View>
                    </Pressable>
                ))}
                {availableBarbers.length === 0 && (
                    <Text style={[styles.emptyText, isDarkMode && styles.textMutatedDark]}>{t('noBarbersForService')}</Text>
                )}
            </ScrollView>
        );
    };

    const renderStep3 = () => {
        const dates = Array.from({ length: 14 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return d.toISOString().split('T')[0];
        });

        const availableSlots = selectedDate && selectedBarber ? generateAvailableSlots(selectedDate, selectedBarber.id) : [];

        return (
            <View style={styles.stepContentFlex}>
                <Text style={[styles.label, isDarkMode && styles.textDark]}>{t('selectDate')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateStrip} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {dates.map(date => {
                        const d = new Date(date);
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = d.getDate();
                        const isSelected = selectedDate === date;

                        return (
                            <Pressable
                                key={date}
                                style={[styles.dateCard, isDarkMode && styles.cardDark, isSelected && styles.cardActive]}
                                onPress={() => {
                                    setSelectedDate(date);
                                    setSelectedTime(null);
                                }}
                            >
                                <Text style={[styles.dateDayName, isDarkMode && styles.textMutatedDark, isSelected && styles.textActive]}>{dayName}</Text>
                                <Text style={[styles.dateDayNum, isDarkMode && styles.textDark, isSelected && styles.textActive]}>{dayNum}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {selectedDate && (
                    <>
                        <Text style={[styles.label, { marginTop: 20 }, isDarkMode && styles.textDark]}>{t('selectTime')}</Text>
                        <ScrollView contentContainerStyle={styles.timeGrid}>
                            {availableSlots.map(time => {
                                const isSelected = selectedTime === time;
                                return (
                                    <Pressable
                                        key={time}
                                        style={[styles.timeChip, isDarkMode && styles.cardDark, isSelected && styles.cardActive]}
                                        onPress={() => setSelectedTime(time)}
                                    >
                                        <Text style={[styles.timeText, isDarkMode && styles.textDark, isSelected && styles.textActive]}>{time}</Text>
                                    </Pressable>
                                );
                            })}
                            {availableSlots.length === 0 && (
                                <Text style={[styles.emptyText, isDarkMode && styles.textMutatedDark]}>{t('noSlotsForDate')}</Text>
                            )}
                        </ScrollView>
                    </>
                )}
            </View>
        );
    };

    const renderStep4 = () => (
        <ScrollView contentContainerStyle={styles.stepContent}>
            <Text style={[styles.label, isDarkMode && styles.textDark]}>{t('specialRequests')}</Text>
            <TextInput
                style={[styles.textInput, isDarkMode && styles.textInputDark]}
                multiline
                numberOfLines={4}
                placeholder={t('notePlaceholder')}
                placeholderTextColor={isDarkMode ? "#666" : "#A0968C"}
                value={note}
                onChangeText={setNote}
            />
        </ScrollView>
    );

    const renderStep5 = () => (
        <ScrollView contentContainerStyle={styles.stepContent}>
            <View style={[styles.summaryCard, isDarkMode && styles.cardDark]}>
                <Text style={[styles.summaryTitle, isDarkMode && styles.summaryTitleDark, isDarkMode && styles.textDark]}>{t('appointmentSummary')}</Text>

                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, isDarkMode && styles.textMutatedDark]}>{t('serviceLabel')}</Text>
                    <Text style={[styles.summaryValue, isDarkMode && styles.textDark]}>{selectedService?.title}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, isDarkMode && styles.textMutatedDark]}>{t('barberLabel')}</Text>
                    <Text style={[styles.summaryValue, isDarkMode && styles.textDark]}>{selectedBarber?.name}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, isDarkMode && styles.textMutatedDark]}>{t('dateLabel')}</Text>
                    <Text style={[styles.summaryValue, isDarkMode && styles.textDark]}>{selectedDate}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, isDarkMode && styles.textMutatedDark]}>{t('timeLabel')}</Text>
                    <Text style={[styles.summaryValue, isDarkMode && styles.textDark]}>{selectedTime}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, isDarkMode && styles.textMutatedDark]}>{t('totalPriceLabel')}</Text>
                    <Text style={[styles.summaryValue, isDarkMode && styles.textDark]}>${selectedService?.price}</Text>
                </View>

                {note ? (
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, isDarkMode && styles.textMutatedDark]}>{t('noteLabel')}</Text>
                        <Text style={[styles.summaryValue, isDarkMode && styles.textDark]}>{note}</Text>
                    </View>
                ) : null}
            </View>

            <Pressable
                style={[styles.primaryCta, isLoading && { opacity: 0.7 }]}
                onPress={handleConfirm}
                disabled={isLoading}
            >
                <Text style={styles.primaryCtaText}>{isLoading ? t('booking') : t('addAppointment')}</Text>
            </Pressable>
        </ScrollView>
    );

    const renderStep6 = () => (
        <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={80} color={isDarkMode ? "#81C784" : "#2E7D32"} />
            <Text style={[styles.successTitle, isDarkMode && styles.textDark]}>{t('bookingConfirmed')}</Text>
            <Text style={[styles.successSubtitle, isDarkMode && styles.textMutatedDark]}>{t('bookingSuccessMsg')}</Text>

            <Pressable style={styles.primaryCta} onPress={handleClose}>
                <Text style={styles.primaryCtaText}>{t('backToPanel')}</Text>
            </Pressable>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
                <View style={[styles.header, isDarkMode && styles.headerDark]}>
                    <Pressable onPress={handleClose} style={styles.iconBtn}>
                        <Ionicons name="close" size={24} color={isDarkMode ? "#A0A0A0" : "#2C1B10"} />
                    </Pressable>
                    <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>{getStepTitle()}</Text>
                    <View style={styles.iconBtnPlaceholder} />
                </View>

                <View style={[styles.content, isDarkMode && styles.contentDark]}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                    {step === 6 && renderStep6()}
                </View>

                {step !== 6 && (
                    <View style={[styles.footer, isDarkMode && styles.footerDark]}>
                        {step > 1 ? (
                            <Pressable style={[styles.footerBtnOutline, isDarkMode && styles.footerBtnOutlineDark]} onPress={handleBack}>
                                <Text style={[styles.footerBtnOutlineText, isDarkMode && styles.footerBtnOutlineTextDark]}>{t('back')}</Text>
                            </Pressable>
                        ) : <View style={{ flex: 1 }} />}

                        {step < 5 ? (
                            <Pressable
                                style={[styles.footerBtn, isDarkMode && styles.footerBtnDark, isNextDisabled() && styles.footerBtnDisabled]}
                                onPress={handleNext}
                                disabled={isNextDisabled()}
                            >
                                <Text style={[styles.footerBtnText, isDarkMode && styles.footerBtnTextDark]}>{t('next')}</Text>
                            </Pressable>
                        ) : <View style={{ flex: 1 }} />}
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF8E1',
    },
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C1B10',
        fontFamily: 'serif',
    },
    iconBtn: {
        padding: 4,
    },
    iconBtnPlaceholder: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    stepContent: {
        padding: 20,
    },
    stepContentFlex: {
        flex: 1,
        paddingVertical: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C1B10',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F2ECE4',
    },
    cardActive: {
        backgroundColor: '#B24700',
        borderColor: '#B24700',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C1B10',
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C1B10',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6D4C41',
    },
    textActive: {
        color: '#FFFFFF',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateStrip: {
        maxHeight: 80,
    },
    dateCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2ECE4',
        minWidth: 70,
    },
    dateDayName: {
        fontSize: 14,
        color: '#6D4C41',
        marginBottom: 4,
    },
    dateDayNum: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C1B10',
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 10,
    },
    timeChip: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F2ECE4',
        minWidth: 80,
        alignItems: 'center',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2C1B10',
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F2ECE4',
        fontSize: 16,
        color: '#2C1B10',
        minHeight: 120,
        textAlignVertical: 'top',
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F2ECE4',
        marginBottom: 24,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C1B10',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2ECE4',
        paddingBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6D4C41',
        flex: 1,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C1B10',
        flex: 2,
        textAlign: 'right',
    },
    primaryCta: {
        backgroundColor: '#B24700',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    primaryCtaText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E8DCCB',
        gap: 12,
    },
    footerBtnOutline: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2C1B10',
        alignItems: 'center',
    },
    footerBtnOutlineText: {
        color: '#2C1B10',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerBtn: {
        flex: 1,
        backgroundColor: '#2C1B10',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    footerBtnDisabled: {
        backgroundColor: '#A0968C',
    },
    footerBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 14,
        color: '#6D4C41',
        fontStyle: 'italic',
        marginTop: 10,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C1B10',
        marginTop: 20,
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#6D4C41',
        textAlign: 'center',
        marginBottom: 40,
    },
    
    containerDark: { backgroundColor: '#121212' },
    headerDark: { backgroundColor: '#1A1A1A', borderBottomColor: '#2A2A2A' },
    contentDark: { backgroundColor: '#121212' },
    cardDark: { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' },
    textDark: { color: '#FFFFFF' },
    textMutatedDark: { color: '#A0A0A0' },
    textInputDark: { backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#FFFFFF' },
    summaryTitleDark: { borderBottomColor: '#2A2A2A' },
    footerDark: { backgroundColor: '#1A1A1A', borderTopColor: '#2A2A2A' },
    footerBtnOutlineDark: { borderColor: '#A0A0A0' },
    footerBtnOutlineTextDark: { color: '#A0A0A0' },
    footerBtnDark: { backgroundColor: '#B24700' },
    footerBtnTextDark: { color: '#FFFFFF' },
});
