import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';

const CustomDatePicker = ({ visible, onClose, onConfirm, title, initialDate }) => {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');

    useEffect(() => {
        if (visible) {
            const date = initialDate ? new Date(initialDate) : new Date();
            setDay(date.getDate().toString());
            setMonth((date.getMonth() + 1).toString());
            setYear(date.getFullYear().toString());
            setHour(date.getHours().toString().padStart(2, '0'));
            setMinute(date.getMinutes().toString().padStart(2, '0'));
        }
    }, [visible, initialDate]);

    const handleConfirm = () => {
        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);
        const h = parseInt(hour);
        const min = parseInt(minute);

        // Basic validation
        if (!day || !month || !year || !hour || !minute) {
            Alert.alert('Invalid Date', 'Please fill all fields');
            return;
        }

        const newDate = new Date(y, m - 1, d, h, min);

        if (isNaN(newDate.getTime()) || newDate.getMonth() !== m - 1) {
            Alert.alert('Invalid Date', 'Please enter a valid date');
            return;
        }

        onConfirm(newDate);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalBackdrop}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity activeOpacity={1}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={onClose}>
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>{title || 'Select Date'}</Text>
                                <TouchableOpacity onPress={handleConfirm}>
                                    <Text style={styles.modalConfirmText}>Done</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.pickerScrollView} keyboardShouldPersistTaps="handled">
                                {/* Date Section */}
                                <View style={styles.pickerSection}>
                                    <Text style={styles.pickerSectionTitle}>📅 Date</Text>
                                    <View style={styles.dateInputRow}>
                                        <View style={styles.dateInputWrapper}>
                                            <Text style={styles.dateInputLabel}>Day</Text>
                                            <TextInput
                                                style={styles.dateInput}
                                                value={day}
                                                onChangeText={(text) => {
                                                    const num = text.replace(/[^0-9]/g, '');
                                                    if (num === '' || (parseInt(num) >= 1 && parseInt(num) <= 31)) {
                                                        setDay(num);
                                                    }
                                                }}
                                                keyboardType="number-pad"
                                                maxLength={2}
                                                placeholder="DD"
                                            />
                                        </View>

                                        <View style={styles.dateInputWrapper}>
                                            <Text style={styles.dateInputLabel}>Month</Text>
                                            <TextInput
                                                style={styles.dateInput}
                                                value={month}
                                                onChangeText={(text) => {
                                                    const num = text.replace(/[^0-9]/g, '');
                                                    if (num === '' || (parseInt(num) >= 1 && parseInt(num) <= 12)) {
                                                        setMonth(num);
                                                    }
                                                }}
                                                keyboardType="number-pad"
                                                maxLength={2}
                                                placeholder="MM"
                                            />
                                        </View>

                                        <View style={[styles.dateInputWrapper, { flex: 1.5 }]}>
                                            <Text style={styles.dateInputLabel}>Year</Text>
                                            <TextInput
                                                style={styles.dateInput}
                                                value={year}
                                                onChangeText={(text) => {
                                                    const num = text.replace(/[^0-9]/g, '');
                                                    if (num.length <= 4) {
                                                        setYear(num);
                                                    }
                                                }}
                                                keyboardType="number-pad"
                                                maxLength={4}
                                                placeholder="YYYY"
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Time Section */}
                                <View style={styles.pickerSection}>
                                    <Text style={styles.pickerSectionTitle}>🕐 Time</Text>
                                    <View style={styles.dateInputRow}>
                                        <View style={styles.dateInputWrapper}>
                                            <Text style={styles.dateInputLabel}>Hour (24h)</Text>
                                            <TextInput
                                                style={styles.dateInput}
                                                value={hour}
                                                onChangeText={(text) => {
                                                    const num = text.replace(/[^0-9]/g, '');
                                                    if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 23)) {
                                                        setHour(num);
                                                    }
                                                }}
                                                keyboardType="number-pad"
                                                maxLength={2}
                                                placeholder="HH"
                                            />
                                        </View>

                                        <View style={styles.dateInputWrapper}>
                                            <Text style={styles.dateInputLabel}>Minute</Text>
                                            <TextInput
                                                style={styles.dateInput}
                                                value={minute}
                                                onChangeText={(text) => {
                                                    const num = text.replace(/[^0-9]/g, '');
                                                    if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 59)) {
                                                        setMinute(num);
                                                    }
                                                }}
                                                keyboardType="number-pad"
                                                maxLength={2}
                                                placeholder="MM"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalCancelText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
    modalConfirmText: {
        color: '#6366F1',
        fontSize: 16,
        fontWeight: '700',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    pickerScrollView: {
        padding: 24,
    },
    pickerSection: {
        marginBottom: 24,
    },
    pickerSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 16,
    },
    dateInputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateInputWrapper: {
        flex: 1,
    },
    dateInputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    dateInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
    },
});

export default CustomDatePicker;
