import { Alert, StyleSheet, View, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import UserService from '../database/UserService'
import AppHeader from '../Components/AppHeader'
import AppInput from '../Components/AppInput'
import AppButton from '../Components/AppButton'
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme'

const EditProfile = ({ navigation }) => {
    const [userId, setUserId] = useState(null)
    const [username, setUsername] = useState('')
    const [mobile, setMobile] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadUser()
    }, [])

    const loadUser = async () => {
        const u = await UserService.getLoggedInUser();
        if (u) {
            setUserId(u.id);
            setUsername(u.username);
            setMobile(u.mobile);
        }
    }

    const handleUpdate = async () => {
        if (!username.trim() || !mobile.trim()) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (mobile.length !== 10) {
            Alert.alert('Error', 'Mobile number must be 10 digits');
            return;
        }

        setLoading(true);
        try {
            const result = await UserService.updateUser(userId, username, mobile);
            if (result.success) {
                Alert.alert('Success', 'Profile updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <AppHeader
                title="Edit Profile"
                subtitle="Update your contact info"
                showBack={true}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>
                    <AppInput
                        label="Username"
                        icon="👤"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter your username"
                    />

                    <AppInput
                        label="Mobile Number"
                        icon="📱"
                        value={mobile}
                        onChangeText={setMobile}
                        placeholder="Enter 10-digit mobile number"
                        keyboardType="numeric"
                        maxLength={10}
                    />

                    <AppButton
                        title="Save Changes"
                        onPress={handleUpdate}
                        loading={loading}
                        variant="primary"
                        style={styles.saveBtn}
                    />

                    <AppButton
                        title="Cancel"
                        onPress={() => navigation.goBack()}
                        variant="outline"
                        style={styles.cancelBtn}
                    />
                </View>
            </ScrollView>
        </View>
    )
}

export default EditProfile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    scrollContent: {
        padding: SPACING[5],
    },
    formCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS['2xl'],
        padding: SPACING[5],
        ...SHADOWS.md,
        marginTop: SPACING[2],
    },
    saveBtn: {
        marginTop: SPACING[6],
    },
    cancelBtn: {
        marginTop: SPACING[3],
        borderWidth: 0,
    }
})
