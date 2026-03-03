import { apiRequest } from './client';

export type AddAppointmentRequest = {
    appointmentDate: string;
    status: number;
    barberEmail: string;
    customerEmail: string;
    serviceName: string;
};

export type IdRequest = { id: string };

export async function addAppointment(dto: AddAppointmentRequest) {
    return apiRequest<any>('/api/Appointment/AddAppointment', {
        method: 'POST',
        body: JSON.stringify(dto)
    }, true);
}

export async function getByBarberEmail(barberEmail: string) {
    return apiRequest<any[]>(`/api/Appointment/GetByBarberEmail?barberEmail=${encodeURIComponent(barberEmail)}`, {
        method: 'GET'
    }, true);
}

export async function takeAppointment(req: IdRequest) {
    return apiRequest<any>('/api/Appointment/TakeAppointment', {
        method: 'POST',
        body: JSON.stringify(req)
    }, true);
}

export async function declineAppointment(req: IdRequest) {
    return apiRequest<any>('/api/Appointment/DeclineAppointment', {
        method: 'POST',
        body: JSON.stringify(req)
    }, true);
}
