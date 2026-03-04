import React from 'react';
import { Redirect } from 'expo-router';
import AdminHome from '../../components/panels/AdminHome';
import BarberHome from '../../components/panels/BarberHome';
import CustomerHome from '../../components/panels/CustomerHome';
import { useAuth } from '../../src/state/AuthContext';

export default function HomeTab() {
    const { session } = useAuth();

    if (!session) return <Redirect href="/" />;

    if (session.userType === 1) return <AdminHome />;
    if (session.userType === 2) return <BarberHome />;
    return <CustomerHome />;
}
