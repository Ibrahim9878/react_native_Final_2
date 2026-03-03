import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

interface RejectReasonModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export default function RejectReasonModal({ visible, onClose, onConfirm }: RejectReasonModalProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (reason.trim().length < 3) {
            setError('Please provide a reason (min 3 characters).');
            return;
        }
        onConfirm(reason.trim());
        setReason('');
        setError('');
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Reject Appointment</Text>
                    <Text style={styles.subtitle}>Please provide a reason for rejecting this appointment.</Text>

                    <TextInput
                        style={[styles.input, error ? styles.inputError : null]}
                        multiline
                        numberOfLines={4}
                        placeholder="Enter reason..."
                        placeholderTextColor="#A0968C"
                        value={reason}
                        onChangeText={(text) => {
                            setReason(text);
                            if (error) setError('');
                        }}
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.footer}>
                        <Pressable style={styles.cancelBtn} onPress={handleClose}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
                            <Text style={styles.confirmBtnText}>Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C1B10',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6D4C41',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#F7F2EA',
        borderWidth: 1,
        borderColor: '#E8DCCB',
        borderRadius: 12,
        padding: 16,
        color: '#2C1B10',
        fontSize: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 8,
    },
    inputError: {
        borderColor: '#CF000F',
    },
    errorText: {
        color: '#CF000F',
        fontSize: 12,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 16,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    cancelBtnText: {
        color: '#6D4C41',
        fontSize: 15,
        fontWeight: '600',
    },
    confirmBtn: {
        backgroundColor: '#CF000F',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
