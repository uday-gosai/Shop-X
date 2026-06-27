import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import UserService from '../database/UserService'
import OrderService from '../database/OrderService'
import { CommonActions, useFocusEffect } from '@react-navigation/native'
import AppHeader from '../Components/AppHeader'
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, GRADIENTS } from '../utils/theme'

const Profile = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [orderCount, setOrderCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadUser();
        }, [])
    );

    const loadUser = async () => {
        const u = await UserService.getLoggedInUser();
        setUser(u);
        if (u?.id) {
            const orders = await OrderService.getOrdersByUser(u.id);
            setOrderCount(orders.length);
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
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'LoginPage' }],
                        })
                    );
                }
            }
        ]);
    }

    const MenuOption = ({ icon, title, subtitle, onPress, showArrow = true, isDestructive = false }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[
                styles.menuIconContainer,
                isDestructive ? styles.menuIconDestructive : styles.menuIconDefault
            ]}>
                <Text style={styles.menuIcon}>{icon}</Text>
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, isDestructive && styles.textDestructive]}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            {showArrow && <Text style={styles.menuArrow}>›</Text>}
        </TouchableOpacity>
    );

    if (!user) return null;

    return (
        <View style={styles.container}>
            <AppHeader
                title="Profile"
                showBack={false}
                gradient={GRADIENTS.header}
            >
                <View style={styles.profileRow}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.userName}>{user?.username || 'User'}</Text>
                        <View style={styles.membershipBadge}>
                            <Text style={styles.membershipText}>PLATINUM MEMBER</Text>
                        </View>
                    </View>
                </View>
            </AppHeader>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Stats Section */}
                <View style={styles.statsCard}>
                    <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('OrderHistory')}>
                        <Text style={styles.statIcon}>🛍️</Text>
                        <Text style={styles.statValue}>{orderCount}</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Section */}
                <View style={styles.content}>
                    <Text style={styles.sectionHeader}>My Account</Text>
                    <View style={styles.menuGroup}>
                        <MenuOption
                            icon="📦"
                            title="My Orders"
                            subtitle="View order history & tracking"
                            onPress={() => navigation.navigate('OrderHistory')}
                        />
                        <MenuOption
                            icon="👤"
                            title="Edit Profile"
                            subtitle="Update name & security"
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                    </View>

                    <View style={[styles.menuGroup, { marginTop: SPACING[6] }]}>
                        <MenuOption
                            icon="🚪"
                            title="Logout"
                            subtitle="Sign out from your account"
                            isDestructive
                            showArrow={false}
                            onPress={onHandleLogout}
                        />
                    </View>

                    <Text style={styles.versionText}>ShopX Premium v2.1.0</Text>
                </View>
            </ScrollView>
        </View>
    )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING[2],
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING[4],
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.white,
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    userName: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: 4,
    },
    membershipBadge: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
        alignSelf: 'flex-start',
    },
    membershipText: {
        color: '#FFD700',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    statsCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING[5],
        marginTop: -25,
        borderRadius: BORDER_RADIUS['2xl'],
        padding: SPACING[5],
        ...SHADOWS.md,
    },
    statItem: {
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.gray[900],
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.gray[500],
        fontWeight: '700',
    },
    content: {
        padding: SPACING[5],
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.gray[900],
        marginBottom: SPACING[4],
        marginTop: SPACING[2],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
        width: 44,
        height: 44,
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
        fontSize: 20,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.gray[800],
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.gray[400],
        marginTop: 2,
        fontWeight: '500',
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