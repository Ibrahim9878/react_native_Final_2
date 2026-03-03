import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppointmentStatus = "pending" | "accepted" | "rejected";

export type Appointment = {
    id: string;
    appointmentDateISO: string; 
    status: AppointmentStatus;  
    barberEmail: string;
    customerEmail: string;
    serviceName: string;
    note?: string;
    rejectionReason?: string;
    createdAt: number;
    updatedAt: number;
};

const APPOINTMENTS_KEY = "local_appointments";

export async function loadAppointments(): Promise<Appointment[]> {
    try {
        const data = await AsyncStorage.getItem(APPOINTMENTS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed as Appointment[] : [];
        }
    } catch (error) {
        console.error("Error loading appointments from storage", error);
    }
    return [];
}

export async function saveAppointments(items: Appointment[]): Promise<void> {
    try {
        await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(items));
    } catch (error) {
        console.error("Error saving appointments to storage", error);
    }
}
