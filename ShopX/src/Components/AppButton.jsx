import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/theme';

/**
 * Standardized Button component for all screens.
 * 
 * @param {Object} props
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Press handler
 * @param {'primary' | 'dark' | 'danger' | 'success' | 'warning' | 'outline'} [props.variant='primary']
 * @param {boolean} [props.loading=false] - Show loading indicator
 * @param {boolean} [props.disabled=false] - Disable button
 * @param {Object} [props.style] - Container style
 * @param {Object} [props.textStyle] - Text style
 */
const AppButton = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle
}) => {
    const isOutline = variant === 'outline';
    const gradientColors = GRADIENTS[variant] || GRADIENTS.primary;

    const Content = () => (
        <View style={[styles.content, isOutline && styles.outlineContent]}>
            {loading ? (
                <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.white} size="small" />
            ) : (
                <Text style={[
                    styles.text,
                    isOutline && styles.outlineText,
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </View>
    );

    if (isOutline) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                activeOpacity={0.7}
                style={[styles.container, styles.outlineContainer, disabled && styles.disabled, style]}
            >
                <Content />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[styles.container, disabled && styles.disabled, style]}
        >
            <LinearGradient
                colors={disabled ? [COLORS.gray[300], COLORS.gray[400]] : gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <Content />
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default AppButton;

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    gradient: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING[3],
        paddingHorizontal: SPACING[4],
    },
    text: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    outlineContainer: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
    },
    outlineContent: {
        // Outline content already has padding from 'content' style, no need to redefine here unless different
    },
    outlineText: {
        color: COLORS.primary,
    },
    disabled: {
        opacity: 0.7,
        elevation: 0,
        shadowOpacity: 0,
    },
});
