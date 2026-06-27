import { Alert, Modal, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View, Dimensions, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const OrderAddress = ({ isVisible, onClose, onSubmit }) => {
    const [userName, setUserName] = useState('');
    const [MobileNo, setMobileNo] = useState('');
    const [Address, setAddress] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');

    const Data = [
        { label: 'Cash on Delivery (COD)', value: 'COD' },
        { label: 'Online Payment (UPI/Card)', value: 'Online Payment' }
    ]

    const onChangeDropDownMode = (item) => {
        setPaymentMode(item);

        if (item === 'COD') {
            setPaymentStatus('UNPAID');
        } else {
            setPaymentStatus('PAID');
        }
    }

    const onHandleSubmit = () => {
        if (userName === '' || MobileNo === '' || Address === '' || paymentMode === '' || paymentStatus === '') {
            ToastAndroid.show('Please fill all details', ToastAndroid.SHORT);
            return;
        }
        if (MobileNo.length !== 10) {
            ToastAndroid.show('Enter valid 10-digit mobile number', ToastAndroid.SHORT);
            return;
        }

        onSubmit({ userName, MobileNo, Address, paymentMode, paymentStatus });
        // Reset fields
        setUserName('');
        setMobileNo('');
        setAddress('');
        setPaymentMode('');
        setPaymentStatus('')
        onClose();
    }

    return (
        <Modal visible={isVisible} animationType='slide' transparent={true} onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                    <View style={styles.dragHandle} />

                    <Text style={styles.headerTitle}>Shipping Details</Text>
                    <Text style={styles.headerSubtitle}>Where should we deliver your order?</Text>

                    <View style={styles.formContainer}>
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                value={userName}
                                placeholder='Eg. John Doe'
                                placeholderTextColor="#9CA3AF"
                                onChangeText={setUserName}
                                style={styles.input}
                            />
                        </View>

                        {/* Mobile Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <TextInput
                                value={MobileNo}
                                placeholder='Eg. 9876543210'
                                placeholderTextColor="#9CA3AF"
                                onChangeText={setMobileNo}
                                style={styles.input}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>

                        {/* Address Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Delivery Address</Text>
                            <TextInput
                                value={Address}
                                placeholder='House No, Street, City, Pincode'
                                placeholderTextColor="#9CA3AF"
                                onChangeText={setAddress}
                                style={[styles.input, styles.textArea]}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Payment Mode */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Payment Method</Text>
                            <Dropdown
                                data={Data}
                                labelField='label'
                                valueField='value'
                                placeholder='Select Payment Mode'
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                value={paymentMode}
                                onChange={item => onChangeDropDownMode(item.value)}
                                style={styles.dropdown}
                                itemTextStyle={styles.itemTextStyle}
                            />
                        </View>

                        {/* Payment Status (Auto-filled) */}
                        {paymentMode !== '' && (
                            <View style={styles.statusContainer}>
                                <Text style={styles.statusLabel}>Payment Status:</Text>
                                <View style={[styles.statusBadge, { backgroundColor: paymentStatus === 'PAID' ? '#ECFDF5' : '#FEF2F2' }]}>
                                    <Text style={[styles.statusText, { color: paymentStatus === 'PAID' ? '#059669' : '#DC2626' }]}>
                                        {paymentStatus}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveBtn} onPress={onHandleSubmit}>
                            <LinearGradient colors={['#4F46E5', '#4338ca']} style={styles.gradientBtn}>
                                <Text style={styles.saveBtnText}>Place Order</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

export default OrderAddress

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        width: '100%',
        maxHeight: '90%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E5E7EB',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    formContainer: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    textArea: {
        height: 80,
    },
    dropdown: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        height: 50,
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#1F2937',
    },
    itemTextStyle: {
        fontSize: 16,
        color: '#374151',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 12,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        gap: 16,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#6B7280',
    },
    saveBtn: {
        flex: 2,
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradientBtn: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    }
})