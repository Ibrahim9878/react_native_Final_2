import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
    Appointment,
    loadAppointments,
    saveAppointments,
    AppointmentStatus
} from "../storage/appointmentsStorage";

export type AddAppointmentInput = {
    appointmentDateISO: string;
    barberEmail: string;
    customerEmail: string;
    serviceName: string;
    note?: string;
};

type AppointmentsContextType = {
    appointments: Appointment[];
    loading: boolean;
    refresh: () => Promise<void>;
    addAppointment: (input: AddAppointmentInput) => Promise<void>;
    acceptAppointment: (id: string) => Promise<void>;
    rejectAppointment: (id: string, reason: string) => Promise<void>;
};

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const AppointmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        const data = await loadAppointments();
        setAppointments(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addAppointment = async (input: AddAppointmentInput) => {
        const newAppointment: Appointment = {
            id: Date.now().toString(),
            appointmentDateISO: input.appointmentDateISO,
            status: "pending",
            barberEmail: input.barberEmail,
            customerEmail: input.customerEmail,
            serviceName: input.serviceName,
            note: input.note,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const updated = [newAppointment, ...appointments];
        setAppointments(updated);
        await saveAppointments(updated);
    };

    const acceptAppointment = async (id: string) => {
        const updated = appointments.map(appt => {
            if (appt.id === id) {
                return {
                    ...appt,
                    status: "accepted" as AppointmentStatus,
                    rejectionReason: undefined,
                    updatedAt: Date.now()
                };
            }
            return appt;
        });
        setAppointments(updated);
        await saveAppointments(updated);
    };

    const rejectAppointment = async (id: string, reason: string) => {
        const updated = appointments.map(appt => {
            if (appt.id === id) {
                return {
                    ...appt,
                    status: "rejected" as AppointmentStatus,
                    rejectionReason: reason,
                    updatedAt: Date.now()
                };
            }
            return appt;
        });
        setAppointments(updated);
        await saveAppointments(updated);
    };

    return (
        <AppointmentsContext.Provider
            value={{
                appointments,
                loading,
                refresh,
                addAppointment,
                acceptAppointment,
                rejectAppointment
            }}
        >
            {children}
        </AppointmentsContext.Provider>
    );
};

export const useAppointments = () => {
    const context = useContext(AppointmentsContext);
    if (!context) {
        throw new Error("useAppointments must be used within an AppointmentsProvider");
    }
    return context;
};
