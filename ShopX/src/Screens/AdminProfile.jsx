import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import UserService from '../database/UserService'
import ProductService from '../database/ProductService'
import OrderService from '../database/OrderService'
import { CommonActions, useFocusEffect } from '@react-navigation/native'
import RNFS from 'react-native-fs'
import AppHeader from '../Components/AppHeader'
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, GRADIENTS } from '../utils/theme'

const AdminProfile = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        users: 0
    });

    useFocusEffect(
        useCallback(() => {
            loadUser();
            loadDashboardStats();
        }, [])
    );

    const loadUser = async () => {
        const u = await UserService.getLoggedInUser();
        setUser(u);
    }

    const loadDashboardStats = async () => {
        try {
            const products = await ProductService.getAllProducts();
            const ordersResult = await OrderService.GetAllOrders();
            let totalOrders = 0;
            if (ordersResult && ordersResult[0] && ordersResult[0].rows && ordersResult[0].rows.length > 0) {
                totalOrders = ordersResult[0].rows.item(0).total_products;
            }
            const users = await UserService.getTotalUsers();

            setStats({
                products: products.length,
                orders: totalOrders,
                users: users.length
            });
        } catch (error) {
            console.error("Error loading admin stats:", error);
        }
    }

    const onHandleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await UserService.logoutUser();
                    navigation.dispatch(
                        CommonActions.reset({ index: 0, routes: [{ name: 'LoginPage' }] })
                    )
                }
            }
        ]);
    }

    const exportDatabase = async () => {
        try {
            const dbPath = `/data/data/com.shopx/databases/smart_Shop.db`;
            const destPath = `${RNFS.DownloadDirectoryPath}/mydb_backup.db`;
            await RNFS.copyFile(dbPath, destPath);
            Alert.alert('Success', `Backup saved to ${destPath}`);
        } catch (err) {
            console.log(err)
            Alert.alert('Error', 'Failed to backup database');
        }
    }

    const QuickAction = ({ icon, title, subtitle, onPress, gradient }) => (
        <TouchableOpacity style={styles.actionCardContainer} onPress={onPress}>
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionCard}
            >
                <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>{icon}</Text>
                </View>
                <View>
                    <Text style={styles.actionTitle}>{title}</Text>
                    <Text style={styles.actionSubtitle}>{subtitle}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const MenuOption = ({ icon, title, onPress, showArrow = true, isDestructive = false }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[
                styles.menuIconContainer,
                isDestructive ? styles.menuIconDestructive : styles.menuIconDefault
            ]}>
                <Text style={styles.menuIcon}>{icon}</Text>
            </View>
            <Text style={[styles.menuText, isDestructive && styles.textDestructive]}>{title}</Text>
            {showArrow && <Text style={styles.menuArrow}>›</Text>}
        </TouchableOpacity>
    );

    if (!user) return null;

    return (
        <View style={styles.container}>
            <AppHeader
                title="Admin Portal"
                showBack={false}
                gradient={GRADIENTS.admin}
            >
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{user?.username || 'Admin'}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>MASTER ADMIN</Text>
                        </View>
                    </View>
                </View>
            </AppHeader>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Stats Section */}
                <View style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.products}</Text>
                            <Text style={styles.statLabel}>Products</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.orders}</Text>
                            <Text style={styles.statLabel}>Orders</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.users}</Text>
                            <Text style={styles.statLabel}>Users</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionHeader}>Quick Actions</Text>
                    <View style={styles.grid}>
                        <QuickAction
                            icon="➕"
                            title="Add Product"
                            subtitle="New inventory"
                            gradient={['#6366F1', '#4F46E5']}
                            onPress={() => navigation.navigate('AddProduct')}
                        />
                        <QuickAction
                            icon="👥"
                            title="Users"
                            subtitle="Manage roles"
                            gradient={['#F59E0B', '#D97706']}
                            onPress={() => navigation.navigate('AdminUsers')}
                        />
                        <QuickAction
                            icon="📦"
                            title="Orders"
                            subtitle="Track sales"
                            gradient={['#10B981', '#059669']}
                            onPress={() => navigation.navigate('AdminOrdersPage')}
                        />
                        <QuickAction
                            icon="📊"
                            title="Inventory"
                            subtitle="View stock"
                            gradient={['#3B82F6', '#2563EB']}
                            onPress={() => navigation.navigate('ProductList')}
                        />
                    </View>

                    <Text style={styles.sectionHeader}>System Tools</Text>
                    <View style={styles.menuGroup}>
                        <MenuOption
                            icon="💾"
                            title="Database Backup"
                            onPress={exportDatabase}
                        />
                        <MenuOption
                            icon="🔔"
                            title="Notifications"
                            onPress={() => { }}
                        />
                    </View>

                    <View style={[styles.menuGroup, { marginTop: SPACING[6] }]}>
                        <MenuOption
                            icon="🚪"
                            title="Logout"
                            isDestructive
                            showArrow={false}
                            onPress={onHandleLogout}
                        />
                    </View>

                    <Text style={styles.versionText}>ShopX Admin Enterprise v2.5.0</Text>
                </View>
            </ScrollView>
        </View>
    )
}

export default AdminProfile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING[2],
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING[4],
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.white,
    },
    userName: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: 4,
    },
    roleBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.5)',
    },
    roleText: {
        color: '#A5B4FC',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    statsCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING[5],
        marginTop: -10,
        borderRadius: BORDER_RADIUS['2xl'],
        padding: SPACING[4],
        ...SHADOWS.md,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING[2],
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.gray[900],
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.gray[500],
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.gray[100],
    },
    content: {
        padding: SPACING[5],
        marginTop: SPACING[2],
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.gray[900],
        marginBottom: SPACING[4],
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING[6],
    },
    actionCardContainer: {
        width: '48%',
        marginBottom: SPACING[4],
    },
    actionCard: {
        padding: SPACING[4],
        borderRadius: BORDER_RADIUS['2xl'],
        height: 130,
        justifyContent: 'space-between',
        ...SHADOWS.sm,
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 20,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    menuGroup: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS['2xl'],
        overflow: 'hidden',
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING[4],
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING[4],
    },
    menuIconDefault: {
        backgroundColor: COLORS.gray[50],
    },
    menuIconDestructive: {
        backgroundColor: COLORS.danger + '10',
    },
    menuIcon: {
        fontSize: 18,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.gray[800],
    },
    textDestructive: {
        color: COLORS.danger,
    },
    menuArrow: {
        fontSize: 24,
        color: COLORS.gray[300],
    },
    versionText: {
        textAlign: 'center',
        marginTop: SPACING[10],
        color: COLORS.gray[300],
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
})
