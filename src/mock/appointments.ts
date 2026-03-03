export type Service = {
    id: string;
    name: string;
    durationMin: number;
    price: number;
};

export type Barber = {
    id: string;
    name: string;
    rating: number;
    specialties: string[];
};

export type Appointment = {
    id: string;
    serviceId: string;
    serviceName: string;
    barberId: string;
    barberName: string;
    dateISO: string;
    time: string;
    note?: string;
    createdAt: number;
    status: 'pending' | 'confirmed';
};

export const SERVICES: Service[] = [
    { id: 's1', name: 'Signature Haircut', durationMin: 45, price: 35 },
    { id: 's2', name: 'Beard Trim & Shape', durationMin: 30, price: 25 },
    { id: 's3', name: 'The Royal Combo', durationMin: 75, price: 55 },
];

export const BARBERS: Barber[] = [
    { id: 'b1', name: 'Mike Johnson', rating: 5.0, specialties: ['s1', 's2', 's3'] },
    { id: 'b2', name: 'David Smith', rating: 4.8, specialties: ['s1', 's2'] },
];

export const generateAvailableSlots = (dateISO: string, barberId: string): string[] => {
    const slots: string[] = [];
    let currentHour = 10;
    let currentMin = 0;

    while (currentHour < 19) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        slots.push(timeString);

        currentMin += 30;
        if (currentMin >= 60) {
            currentMin = 0;
            currentHour += 1;
        }
    }

    const seedStr = `${dateISO}-${barberId}`;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
        hash |= 0;
    }

    return slots.filter((_, index) => {
        const pseudoRandom = Math.abs(Math.sin(hash + index));
        return pseudoRandom > 0.3; 
    });
};
