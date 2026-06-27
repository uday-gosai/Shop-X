import { Alert, Dimensions, StyleSheet, Text, View, Animated, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ImageBackground } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import UserService from '../database/UserService'
import LinearGradient from 'react-native-linear-gradient'
import { COLORS, GRADIENTS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme'
import AppInput from '../Components/AppInput'
import AppButton from '../Components/AppButton'

const bgImage = require('../../Assets/Images/auth_bg.png');

const { width, height } = Dimensions.get('window')

const Register = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const register = async () => {
        if (!username || !mobileNumber || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const result = await UserService.registerUser(username, mobileNumber, password);
            if (result.success) {
                Alert.alert('Success', result.message, [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={bgImage}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(156, 155, 172, 0.4)', 'rgba(148, 133, 174, 0.4)']}
                style={styles.overlay}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            <View style={styles.headerContainer}>
                                <LinearGradient
                                    colors={GRADIENTS.primary}
                                    style={styles.iconContainer}
                                >
                                    <Text style={styles.iconText}>📝</Text>
                                </LinearGradient>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subTitle}>Join ShopX Today</Text>
                            </View>

                            <AppInput
                                label="Username"
                                icon="👤"
                                placeholder="Choose a username"
                                value={username}
                                onChangeText={setUsername}
                            />

                            <AppInput
                                label="Mobile Number"
                                icon="📱"
                                placeholder="Enter 10-digit mobile"
                                value={mobileNumber}
                                onChangeText={(text) => setMobileNumber(text.replace(/[^0-9]/g, ''))}
                                keyboardType="number-pad"
                                maxLength={10}
                            />

                            <AppInput
                                label="Password"
                                icon="🔒"
                                placeholder="Strong password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={true}
                            />

                            <AppInput
                                label="Confirm Password"
                                icon="🔐"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={true}
                            />

                            <AppButton
                                title="Register"
                                onPress={register}
                                loading={loading}
                                style={styles.btn}
                            />

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account?</Text>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <Text style={styles.footerLink}>Login</Text>
                                </TouchableOpacity>
                            </View>

                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </ImageBackground>
    );
};

export default Register

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING[5],
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: BORDER_RADIUS['3xl'],
        padding: SPACING[6],
        ...SHADOWS.lg,
        marginVertical: SPACING[5],
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING[6],
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING[4],
        ...SHADOWS.md,
    },
    iconText: {
        fontSize: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.gray[800],
        marginBottom: SPACING[1],
    },
    subTitle: {
        fontSize: 14,
        color: COLORS.gray[500],
        fontWeight: '500',
    },
    btn: {
        marginTop: SPACING[2],
        marginBottom: SPACING[5],
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING[1],
    },
    footerText: {
        color: COLORS.gray[500],
        fontSize: 14,
        fontWeight: '500',
    },
    footerLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
})
