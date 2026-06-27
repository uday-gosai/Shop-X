import { Alert, FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import UserService from '../database/UserService';
import AppHeader from '../Components/AppHeader';
import AppButton from '../Components/AppButton';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        LoadUserData();
    }, [])

    const LoadUserData = async () => {
        const allUsers = await UserService.getAllUsers();
        const currentUser = await UserService.getLoggedInUser();
        setUsers(allUsers);
        setLoggedInUser(currentUser);
    }

    const changeRole = (user) => {
        if (user.id === loggedInUser.id) {
            Alert.alert('Not Allowed', 'You cannot change your own role');
            return;
        }

        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

        Alert.alert('Confirm Role Change',
            `Change ${user.username} to ${newRole}?`,
            [
                { text: 'Cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        await UserService.updateUserRole(user.id, newRole);
                        LoadUserData();
                    }
                }
            ]
        )
    }

    const deleteUser = async (user) => {
        if (user.id === loggedInUser.id) {
            Alert.alert('Error', 'You cannot delete yourself');
            return;
        }

        const adminCount = await UserService.getAdminCount();
        if (user.role === 'ADMIN' && adminCount === 1) {
            Alert.alert('Error', 'Cannot delete last Admin');
            return;
        }

        Alert.alert(
            'Confirm Delete',
            `Delete ${user.username}?`,
            [
                { text: 'Cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await UserService.deleteUser(user.id);
                        LoadUserData();
                    }
                }
            ]
        )
    }

    const renderUser = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: item.role === 'ADMIN' ? COLORS.danger + '10' : COLORS.primary + '10' }]}>
                    <Text style={[styles.avatarText, { color: item.role === 'ADMIN' ? COLORS.danger : COLORS.primary }]}>
                        {item.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.name}>{item.username}</Text>
                    <Text style={styles.mobile}>{item.mobile}</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: item.role === 'ADMIN' ? COLORS.danger + '15' : COLORS.primary + '15' }]}>
                    <Text style={[styles.roleText, { color: item.role === 'ADMIN' ? COLORS.danger : COLORS.primary }]}>
                        {item.role}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionRow}>
                <AppButton
                    title={item.role === 'ADMIN' ? 'Make USER' : 'Make ADMIN'}
                    onPress={() => changeRole(item)}
                    variant="outline"
                    style={styles.actionButton}
                    textStyle={styles.actionButtonText}
                />

                <AppButton
                    title="Delete"
                    onPress={() => deleteUser(item)}
                    variant="danger"
                    style={styles.actionButton}
                    textStyle={styles.actionButtonText}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <AppHeader
                title="Users"
                subtitle="Manage Application Users"
                showBack={false}
            />

            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUser}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default AdminUsers

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    listContent: {
        padding: SPACING[4],
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS['2xl'],
        padding: SPACING[4],
        marginBottom: SPACING[4],
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING[3],
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING[3],
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '900',
    },
    userDetails: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.gray[900],
    },
    mobile: {
        fontSize: 12,
        color: COLORS.gray[500],
        marginTop: 2,
        fontWeight: '500',
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray[50],
        marginBottom: SPACING[3],
    },
    actionRow: {
        flexDirection: 'row',
        gap: SPACING[3],
    },
    actionButton: {
        flex: 1,
        height: 40,
        borderRadius: BORDER_RADIUS.lg,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '700',
    }
})