import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

/**
 * Standardized Header component for all screens.
 * 
 * @param {Object} props
 * @param {string} props.title - Main title text
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {boolean} [props.showBack=true] - Whether to show the back button
 * @param {Array<string>} [props.gradient=GRADIENTS.header] - Custom gradient colors
 * @param {React.ReactNode} [props.rightComponent] - Optional component on the right
 */
const AppHeader = ({
    title,
    subtitle,
    showBack = true,
    gradient = GRADIENTS.header,
    rightComponent,
    children
}) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={gradient[0]} />
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <SafeAreaView edges={['top']} style={styles.safeArea}>
                    <View style={styles.content}>
                        <View style={styles.leftSection}>
                            {showBack && (
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={styles.backButton}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.backIcon}>←</Text>
                                </TouchableOpacity>
                            )}
                            <View style={styles.titleContainer}>
                                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                                {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
                            </View>
                        </View>
                        <View style={styles.rightSection}>
                            {rightComponent}
                        </View>
                    </View>
                    {children && <View style={styles.childrenContainer}>{children}</View>}
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
};

export default AppHeader;

const styles = StyleSheet.create({
    container: {
        ...SHADOWS.md,
    },
    gradient: {
        borderBottomLeftRadius: BORDER_RADIUS['3xl'],
        borderBottomRightRadius: BORDER_RADIUS['3xl'],
        paddingBottom: SPACING[4],
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING[6],
        height: 60,
    },
    safeArea: {
        paddingBottom: SPACING[2],
    },
    childrenContainer: {
        paddingHorizontal: SPACING[6],
        paddingBottom: SPACING[4],
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING[4],
    },
    backIcon: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '900',
        lineHeight: 22,
        textAlign: 'center',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.white,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    rightSection: {
        justifyContent: 'center',
    },
});
