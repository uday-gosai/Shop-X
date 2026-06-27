import { FlatList, StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import AdminOrderService from '../database/AdminOrderService'
import AppHeader from '../Components/AppHeader'
import AppButton from '../Components/AppButton'
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme'
import { ORDER_STATUS } from '../utils/constants'
import { formatPrice } from '../utils/formatters'

const AdminOrdersPage = () => {
    const [AdminOrders, setAdminOrders] = useState([])

    useFocusEffect(
        useCallback(() => {
            LoadOrderData();
        }, [])
    )

    const updateStatus = async (orderId) => {
        const status = await AdminOrderService.getOrderStatus(orderId);

        if (status.order_status == 'PLACED') {
            await AdminOrderService.UpdateOrderStatus(orderId, "SHIPPED", status.payment_status);
        }
        else if (status.order_status == 'SHIPPED') {
            await AdminOrderService.UpdateOrderStatus(orderId, "DELIVERED", "PAID")
        }

        LoadOrderData();
    };

    const LoadOrderData = async () => {
        const orderList = await AdminOrderService.getAllOrderData();

        for (let order of orderList) {
            order.items = await AdminOrderService.getOrderItems(order.id)
        }

        setAdminOrders(orderList)
    }

    const renderOrder = ({ item }) => {
        const status = ORDER_STATUS[item.order_status] || ORDER_STATUS.PLACED;

        return (
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.orderId}>Order #{item.id}</Text>
                            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border, borderWidth: 1 }]}>
                            <Text style={[styles.statusText, { color: status.color }]}>
                                {status.icon} {status.label}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Customer Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Customer Details</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Name:</Text>
                            <Text style={styles.value}>{item.username}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Mobile:</Text>
                            <Text style={styles.value}>{item.mobile}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Address:</Text>
                            <Text style={styles.value}>{item.address}</Text>
                        </View>
                    </View>

                    {/* Order Items */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Items ({item.total_items})</Text>
                        {item.items.map((p, index) => (
                            <View key={index} style={styles.itemRow}>
                                <Text style={styles.itemName}>• {p.product_name} <Text style={styles.itemQty}>(x{p.qty})</Text></Text>
                                <Text style={styles.itemPrice}>{formatPrice(p.total)}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Payment & Total */}
                    <View style={styles.footerRow}>
                        <View>
                            <Text style={styles.footerLabel}>Payment Mode</Text>
                            <Text style={styles.paymentMode}>{item.payment_mode}</Text>
                            <Text style={[styles.paymentStatus, { color: item.payment_status === 'PAID' ? COLORS.success : COLORS.warning }]}>
                                ● {item.payment_status}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.footerLabel}>Total Amount</Text>
                            <Text style={styles.totalAmount}>{formatPrice(item.total_amount)}</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    {item.order_status === "CANCELLED" || item.order_status === "DELIVERED" ? null :
                        <AppButton
                            title={item.order_status === 'PLACED' ? 'Mark as SHIPPED' : 'Mark as DELIVERED'}
                            onPress={() => updateStatus(item.id)}
                            variant={item.order_status === 'PLACED' ? 'primary' : 'success'}
                            style={styles.actionButton}
                        />
                    }
                </View>
            </View>
        );
    }

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>When customers place orders, they will appear here for management.</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <AppHeader
                title="Orders"
                subtitle="Manage Customer Orders"
                showBack={false}
                rightComponent={<View style={styles.headerIconContainer}><Text style={styles.headerIcon}>📦</Text></View>}
            />

            <FlatList
                data={AdminOrders}
                keyExtractor={item => item.id.toString()}
                renderItem={renderOrder}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={[styles.listContent, AdminOrders.length === 0 && { flex: 1, justifyContent: 'center' }]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default AdminOrdersPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerIcon: {
        fontSize: 20,
    },
    listContent: {
        padding: SPACING[4],
        paddingBottom: 100,
    },
    cardContainer: {
        marginBottom: SPACING[4],
        ...SHADOWS.md,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS['2xl'],
        padding: SPACING[5],
        overflow: 'hidden',
        elevation:5
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING[3],
    },
    orderId: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.gray[900],
    },
    date: {
        fontSize: 12,
        color: COLORS.gray[500],
        marginTop: 2,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray[100],
        marginVertical: SPACING[4],
    },
    section: {
        marginBottom: SPACING[4],
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.gray[400],
        textTransform: 'uppercase',
        marginBottom: SPACING[2],
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 80,
        fontSize: 13,
        color: COLORS.gray[500],
        fontWeight: '600',
    },
    value: {
        flex: 1,
        fontSize: 13,
        color: COLORS.gray[800],
        fontWeight: '600',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    itemName: {
        fontSize: 14,
        color: COLORS.gray[700],
        flex: 1,
        fontWeight: '500',
    },
    itemQty: {
        color: COLORS.gray[400],
        fontSize: 12,
        fontWeight: '600',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.gray[900],
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    footerLabel: {
        fontSize: 10,
        color: COLORS.gray[400],
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    paymentMode: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.gray[800],
    },
    paymentStatus: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 2,
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.primary,
    },
    actionButton: {
        marginTop: SPACING[5],
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: SPACING[10],
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: SPACING[4],
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.gray[800],
        marginBottom: SPACING[2],
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.gray[500],
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
    },
})