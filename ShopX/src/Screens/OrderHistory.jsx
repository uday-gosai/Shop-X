import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import UserContext from '../context/UserContext'
import OrderService from '../database/OrderService';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../Components/AppHeader'
import EmptyState from '../Components/EmptyState'
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme'
import { ORDER_STATUS } from '../utils/constants'
import { formatPrice } from '../utils/formatters'

const OrderHistory = ({ navigation }) => {
    const { userId } = useContext(UserContext);
    const [orders, setOrders] = useState([])

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [])
    );

    const loadOrders = async () => {
        const data = await OrderService.getOrdersByUser(userId);
        const sortedData = data.sort((a, b) => b.id - a.id);
        setOrders(sortedData);
    }

    const clearHistory = async () => {
        Alert.alert("Clear History", "Remove completed/cancelled orders from view?", [
            { text: "Cancel" },
            {
                text: "Clear",
                style: 'destructive',
                onPress: async () => {
                    await OrderService.clearHistory();
                    loadOrders();
                }
            }
        ])
    }

    const cancelOrder = (orderId) => {
        Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
            { text: "No" },
            {
                text: "Yes, Cancel",
                style: 'destructive',
                onPress: async () => {
                    await OrderService.cancelOrder(orderId);
                    loadOrders();
                }
            }
        ])
    }

    const renderOrderCard = ({ item }) => {
        const status = ORDER_STATUS[item.order_status] || ORDER_STATUS.PLACED;
        const canCancel = item.order_status === 'PLACED';
        const canViewInvoice = ['PLACED', 'SHIPPED', 'DELIVERED'].includes(item.order_status);
        const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent';

        return (
            <TouchableOpacity
                activeOpacity={canViewInvoice ? 0.9 : 1}
                onPress={() => {
                    if (canViewInvoice) {
                        navigation.navigate("Invoice", {
                            orderId: item.id,
                            username: item.username,
                            Address: item.address,
                            Mobile: item.mobile,
                            paymentStatus: item.payment_status,
                            orderDate: item.order_date
                        })
                    }
                }}
                style={styles.card}
            >
                <View style={[styles.statusStrip, { backgroundColor: status.color }]} />

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.orderIdLabel}>ORDER #{item.id}</Text>
                            <Text style={styles.orderDate}>{date}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
                            <Text style={[styles.statusText, { color: status.color }]}>
                                {status.icon} {status.label}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>ITEMS</Text>
                            <Text style={styles.detailValue}>{item.total_items}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>TOTAL</Text>
                            <Text style={styles.amountValue}>{formatPrice(item.total_amount)}</Text>
                        </View>
                        <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
                            <Text style={styles.detailLabel}>PAYMENT</Text>
                            <Text style={[styles.paymentValue, { color: item.payment_status === 'PAID' ? COLORS.success : COLORS.warning }]}>
                                {item.payment_mode === 'COD' ? 'Cash' : 'Online'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.addressContainer}>
                        <Text style={styles.addressLabel}>📍 Deliver to:</Text>
                        <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                    </View>

                    {canCancel && (
                        <View style={styles.actionFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => cancelOrder(item.id)}
                            >
                                <Text style={styles.cancelText}>Cancel Order</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (orders.length === 0) {
        return (
            <View style={styles.container}>
                <AppHeader title="My Orders" showBack={true} />
                <EmptyState
                    title="No Orders Yet"
                    subtitle="It looks like you haven't placed any orders yet. Start shopping now!"
                    buttonTitle="Start Shopping"
                    onButtonPress={() => navigation.navigate('Homepage')}
                    icon="📦"
                />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <AppHeader
                title="My Orders"
                subtitle={`${orders.length} Orders`}
                showBack={true}
                rightComponent={
                    <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
                        <Text style={styles.clearText}>Clear History</Text>
                    </TouchableOpacity>
                }
            />

            <FlatList
                data={orders}
                keyExtractor={item => item.id.toString()}
                renderItem={renderOrderCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default OrderHistory

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    clearBtn: {
        paddingHorizontal: SPACING[3],
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    clearText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
        textTransform: 'uppercase',
    },
    listContent: {
        padding: SPACING[4],
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING[4],
        ...SHADOWS.md,
        overflow: 'hidden',
    },
    statusStrip: {
        height: 6,
        width: '100%',
    },
    cardContent: {
        padding: SPACING[4],
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING[3],
    },
    orderIdLabel: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.gray[900],
        letterSpacing: 0.5,
    },
    orderDate: {
        fontSize: 12,
        color: COLORS.gray[400],
        marginTop: 2,
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray[100],
        marginBottom: SPACING[4],
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING[4],
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        color: COLORS.gray[400],
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.gray[700],
        fontWeight: '700',
    },
    amountValue: {
        fontSize: 16,
        color: COLORS.gray[900],
        fontWeight: '800',
    },
    paymentValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    addressContainer: {
        backgroundColor: COLORS.gray[50],
        padding: SPACING[3],
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    addressLabel: {
        fontSize: 10,
        color: COLORS.gray[500],
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: 12,
        color: COLORS.gray[700],
        fontWeight: '500',
    },
    actionFooter: {
        marginTop: SPACING[2],
        paddingTop: SPACING[3],
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[50],
        alignItems: 'center',
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    cancelText: {
        color: COLORS.danger,
        fontSize: 13,
        fontWeight: '800',
    }
});