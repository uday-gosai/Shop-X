import { Alert, Dimensions, StyleSheet, Text, View, Animated, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, ImageBackground } from 'react-native'
import React, { useContext, useState, useEffect, useRef } from 'react'
import UserService from '../database/UserService'
import UserContext from '../context/UserContext'
import LinearGradient from 'react-native-linear-gradient'
import { COLORS, GRADIENTS, SPACING, SHADOWS, BORDER_RADIUS } from '../utils/theme'
import AppInput from '../Components/AppInput'
import AppButton from '../Components/AppButton'

const bgImage = require('../../Assets/Images/auth_bg.png');

const { height, width } = Dimensions.get('window')

const LoginPage = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUserId } = useContext(UserContext);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const login = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter both username and password.');
            return;
        }

        setLoading(true);
        try {
            const result = await UserService.loginUser(username, password);

            if (!result.success) {
                Alert.alert('Login Failed', result.message);
            } else {
                setUserId(result.user.id);
                navigation.navigate("AuthStack");
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }

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
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
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
                                    <Text style={styles.iconText}>🛍️</Text>
                                </LinearGradient>
                                <Text style={styles.title}>Welcome Back</Text>
                                <Text style={styles.subTitle}>Sign in to continue to ShopX</Text>
                            </View>

                            <AppInput
                                label="Username"
                                icon="👤"
                                placeholder='Enter your username'
                                value={username}
                                onChangeText={setUsername}
                            />

                            <AppInput
                                label="Password"
                                icon="🔒"
                                placeholder='Enter your password'
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={styles.forgotPassBtn}
                                onPress={() => Alert.alert('Info', 'Feature coming soon!')}
                            >
                                <Text style={styles.forgotPassText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <AppButton
                                title="Login"
                                onPress={login}
                                loading={loading}
                                style={styles.loginBtn}
                            />

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account?</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('RegisterPage')}>
                                    <Text style={styles.footerLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </ImageBackground>
    )
}

export default LoginPage

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
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING[8],
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
        marginBottom: SPACING[2],
    },
    subTitle: {
        fontSize: 14,
        color: COLORS.gray[500],
        fontWeight: '500',
    },
    forgotPassBtn: {
        alignSelf: 'flex-end',
        marginBottom: SPACING[6],
    },
    forgotPassText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    loginBtn: {
        marginBottom: SPACING[6],
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
