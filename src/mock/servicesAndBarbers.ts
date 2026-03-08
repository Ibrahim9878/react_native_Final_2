export type ServiceCategory = 'All Services' | 'Haircuts' | 'Beard' | 'Shaves' | 'Combos';

export interface ServiceItem {
    id: string;
    title: string;
    description: string;
    duration: string;
    price: number;
    isPopular?: boolean;
    category: ServiceCategory[];
}

export interface BarberItem {
    id: string;
    name: string;
    email: string;
    role: string;
    rating: number;
    reviews: number;
    experience: string;
    imageUrl: string;
    isAvailable: boolean;
    specialties: string[];
}

export const CATEGORIES: ServiceCategory[] = ['All Services', 'Haircuts', 'Beard', 'Shaves', 'Combos'];

export const SERVICES: ServiceItem[] = [
    {
        id: 's1',
        title: 'Signature Haircut',
        description: 'Classic cut with clipper and scissor work, hot towel finish, and styling.',
        duration: '45 mins',
        price: 35,
        isPopular: true,
        category: ['All Services', 'Haircuts']
    },
    {
        id: 's2',
        title: 'Beard Trim & Shape',
        description: 'Detailed beard shaping with straight razor line up and conditioning oil.',
        duration: '30 mins',
        price: 25,
        category: ['All Services', 'Beard']
    },
    {
        id: 's3',
        title: 'The Royal Combo',
        description: 'Premium haircut combined with a full hot lather straight razor shave.',
        duration: '75 mins',
        price: 55,
        isPopular: true,
        category: ['All Services', 'Haircuts', 'Shaves', 'Combos']
    }
];

export const BARBERS: BarberItem[] = [
    {
        id: 'b3',
        name: 'Test Barber (Barber Panel)',
        email: 'barber@gmail.com',
        role: 'Master Barber',
        rating: 4.9,
        reviews: 45,
        experience: '5 years experience',
        imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
        isAvailable: true,
        specialties: ['s1', 's2', 's3']
    },
    {
        id: 'b1',
        name: 'Mike Johnson',
        email: 'mike@triocut.com',
        role: 'Master Barber',
        rating: 5.0,
        reviews: 124,
        experience: '12 years experience',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
        isAvailable: true,
        specialties: ['s1', 's2', 's3']
    },
    {
        id: 'b2',
        name: 'David Smith',
        email: 'david@triocut.com',
        role: 'Senior Barber',
        rating: 4.8,
        reviews: 89,
        experience: '8 years experience',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
        isAvailable: true,
        specialties: ['s1', 's2']
    }
];


export const ALL_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'
];

export function generateAvailableSlots(dateString: string, barberId: string, takenSlots: string[] = []): string[] {
    // Return all slots, filtering will be handled by UI (graying out)
    return ALL_SLOTS;
}
