import { ScrollView, StyleSheet, Text, View, Dimensions, RefreshControl, TouchableOpacity, Animated } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import UserService from '../database/UserService'
import ProductService from '../database/ProductService'
import AdminOrderService from '../database/AdminOrderService'
import AppHeader from '../Components/AppHeader'
import { COLORS, GRADIENTS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme'
import { formatPrice } from '../utils/formatters'

const { width } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);
    const [stats, setStats] = useState({
        totalUser: 0,
        totalProduct: 0,
        totalOrders: 0,
        todayOrders: 0,
        activeFlash: 0,
        lowStock: 0,
        todayRevenue: 0,
    });
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useFocusEffect(
        useCallback(() => {
            loadData();
            startPulse();
        }, [])
    );

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }

    const loadData = async () => {
        try {
            const [dashboardStats, todayOrdersList, activeFlash] = await Promise.all([
                ProductService.getDashboardStats(),
                AdminOrderService.getTodayOrders(),
                ProductService.getFlashSaleProducts(),
            ]);

            setStats({
                totalUser: dashboardStats.totalUsers,
                totalProduct: dashboardStats.totalProducts,
                totalOrders: dashboardStats.totalOrders,
                todayOrders: dashboardStats.todayOrdersCount, // Using the new specific count
                activeFlash: activeFlash.length,
                lowStock: dashboardStats.lowStockCount,
                todayRevenue: dashboardStats.todayRevenue,
            });

            // Get recent today orders
            const sortedOrders = [...todayOrdersList].sort((a, b) => b.id - a.id).slice(0, 5);
            setRecentOrders(sortedOrders);
        } catch (error) {
            console.error("Dashboard Load Error:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }

    const StatCard = ({ title, value, icon, colors, onPress }) => (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.85}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.cardIcon}>{icon}</Text>
                    </View>
                    <Text
                        style={styles.cardValue}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                    >
                        {value}
                    </Text>
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
                <View style={styles.decorativeCircle} />
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <AppHeader
                title="Dashboard"
                subtitle="Overview & Statistics"
                showBack={false}
                rightComponent={<View style={styles.headerEmojiContainer}><Text style={styles.headerEmoji}>📊</Text></View>}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                <View style={styles.grid}>
                    <StatCard
                        title="Today's Revenue"
                        value={formatPrice(stats.todayRevenue)}
                        icon="💰"
                        colors={['#8B5CF6', '#6D28D9']}
                        onPress={() => navigation.navigate('AdminOrdersPage')}
                    />
                    <StatCard
                        title="Products"
                        value={stats.totalProduct}
                        icon="📦"
                        colors={['#10B981', '#065F46']}
                        onPress={() => navigation.navigate('ProductList')}
                    />
                    <StatCard
                        title="Today's Orders"
                        value={stats.todayOrders}
                        icon="📅"
                        colors={['#F59E0B', '#92400E']}
                        onPress={() => navigation.navigate('AdminOrdersPage')}
                    />
                    <StatCard
                        title="Total Users"
                        value={stats.totalUser}
                        icon="👥"
                        colors={['#4F46E5', '#3730A3']}
                        onPress={() => navigation.navigate('AdminUsers')}
                    />
                </View>

                <View style={styles.secondaryGrid}>
                    <Animated.View style={{ flex: 1, transform: [{ scale: stats.lowStock > 0 ? pulseAnim : 1 }] }}>
                        <TouchableOpacity
                            style={[
                                styles.alertCard,
                                {
                                    backgroundColor: stats.lowStock > 0 ? '#FEF2F2' : '#F9FAFB',
                                    borderColor: stats.lowStock > 0 ? COLORS.danger : COLORS.gray[200]
                                }
                            ]}
                            onPress={() => navigation.navigate('ProductList')}
                        >
                            <View style={styles.alertHeader}>
                                <Text style={styles.alertTitle}>⚠️ Low Stock</Text>
                                <Text style={[styles.alertValue, { color: stats.lowStock > 0 ? COLORS.danger : COLORS.gray[800] }]}>
                                    {stats.lowStock}
                                </Text>
                            </View>
                            <Text style={styles.alertSubtitle}>Items need restock</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={[styles.alertCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}
                        onPress={() => navigation.navigate('ProductList')}
                    >
                        <View style={styles.alertHeader}>
                            <Text style={styles.alertTitle}>🔥 Flash Sale</Text>
                            <Text style={[styles.alertValue, { color: '#0369A1' }]}>{stats.activeFlash}</Text>
                        </View>
                        <Text style={styles.alertSubtitle}>Active promotions</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Today activity</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AdminOrdersPage')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentOrders.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No activity for today yet</Text>
                        </View>
                    ) : (
                        recentOrders.map((order, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.recentItem}
                                onPress={() => navigation.navigate('AdminOrdersPage')}
                            >
                                <View style={styles.recentIcon}>
                                    <Text>🛍️</Text>
                                </View>
                                <View style={styles.recentInfo}>
                                    <View style={styles.row}>
                                        <Text style={styles.recentId}>Order #{order.id}</Text>
                                        <Text
                                            style={styles.amountText}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                            minimumFontScale={0.8}
                                        >
                                            {formatPrice(order.total_amount)}
                                        </Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.recentUser}>{order.username}</Text>
                                        <Text style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor: order.payment_status === 'PAID' ? '#D1FAE5' : '#FEF3C7',
                                                color: order.payment_status === 'PAID' ? '#065F46' : '#92400E'
                                            }
                                        ]}>
                                            {order.payment_status}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default Dashboard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    scrollContent: {
        paddingTop: SPACING[6],
        paddingBottom: SPACING[10],
    },
    headerEmojiContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerEmoji: {
        fontSize: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING[4],
    },
    cardContainer: {
        width: '48%',
        marginBottom: SPACING[4],
        ...SHADOWS.md,
    },
    card: {
        borderRadius: BORDER_RADIUS['2xl'],
        padding: SPACING[4],
        height: 130,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING[2],
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING[2],
    },
    cardIcon: {
        fontSize: 20,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.white,
        flex: 1,
        textAlign: 'right',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginTop: SPACING[2],
    },
    decorativeCircle: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    secondaryGrid: {
        flexDirection: 'row',
        paddingHorizontal: SPACING[4],
        gap: SPACING[3],
        marginVertical: SPACING[6],
    },
    alertCard: {
        flex: 1,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING[4],
        ...SHADOWS.sm,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING[1],
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.gray[700],
    },
    alertValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    alertSubtitle: {
        fontSize: 12,
        color: COLORS.gray[500],
        fontWeight: '500',
    },
    recentSection: {
        paddingHorizontal: SPACING[4],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING[4],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.gray[800],
    },
    seeAllText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING[4],
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING[3],
        ...SHADOWS.sm,
    },
    recentIcon: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.gray[50],
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING[4],
    },
    recentInfo: {
        flex: 1,
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recentId: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.gray[800],
    },
    recentUser: {
        fontSize: 13,
        color: COLORS.gray[500],
        fontWeight: '500',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
    },
    statusBadge: {
        fontSize: 10,
        fontWeight: '800',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
    },
    emptyCard: {
        padding: SPACING[10],
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        borderStyle: 'dashed',
    },
    emptyText: {
        color: COLORS.gray[400],
        fontSize: 14,
        fontWeight: '500',
    }
})
