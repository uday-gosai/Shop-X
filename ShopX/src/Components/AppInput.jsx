import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';

/**
 * Standardized Input component with floating label support.
 * 
 * @param {Object} props
 * @param {string} props.label - Floating label text
 * @param {string} [props.error] - Error message
 * @param {string} [props.icon] - Emoji icon
 * @param {Object} [props.containerStyle]
 */
const AppInput = ({ label, error, icon, containerStyle, placeholder, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== null && props.value.toString().length > 0;
    const isActive = isFocused || hasValue;
    const isMultiline = props.multiline;

    const handleFocus = (e) => {
        setIsFocused(true);
        if (props.onFocus) props.onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (props.onBlur) props.onBlur(e);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={[
                styles.wrapper,
                isFocused && styles.wrapperFocused,
                error && styles.wrapperError,
                isMultiline && styles.wrapperMultiline,
            ]}>
                {icon && <Text style={[styles.icon, isMultiline && styles.iconMultiline]}>{icon}</Text>}
                <View style={[styles.inputContent, isMultiline && styles.inputContentMultiline]}>
                    <Text style={[
                        styles.label,
                        isActive && styles.labelActive,
                        isActive && { backgroundColor: isFocused ? COLORS.white : (error ? '#FFF5F5' : COLORS.gray[50]) },
                        isMultiline && !isActive && styles.labelMultiline
                    ]}>
                        {label}
                    </Text>
                    <TextInput
                        {...props}
                        style={[styles.input, isMultiline && styles.inputMultiline]}
                        placeholder={isActive ? placeholder : ''}
                        placeholderTextColor={COLORS.gray[400]}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        autoCapitalize="none"
                        textAlignVertical={isMultiline ? 'top' : 'center'}
                    />
                </View>
            </View>
            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}
        </View>
    );
};

export default AppInput;

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING[4],
    },
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1.5,
        borderColor: COLORS.gray[200],
        paddingHorizontal: SPACING[4],
        height: 60,
    },
    wrapperMultiline: {
        height: undefined,
        minHeight: 100,
        alignItems: 'flex-start',
        paddingVertical: SPACING[3],
    },
    wrapperFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    wrapperError: {
        borderColor: COLORS.danger,
        backgroundColor: '#FFF5F5',
    },
    icon: {
        fontSize: 20,
        marginRight: SPACING[3],
    },
    iconMultiline: {
        marginTop: 10,
    },
    inputContent: {
        flex: 1,
        justifyContent: 'center',
    },
    inputContentMultiline: {
        justifyContent: 'flex-start',
    },
    label: {
        position: 'absolute',
        left: 0,
        top: 14,
        fontSize: 16,
        color: COLORS.gray[500],
        zIndex: 1, // Ensure label stays on top
    },
    labelMultiline: {
        top: 10,
    },
    labelActive: {
        top: -12,
        fontSize: 11,
        fontWeight: '900',
        color: COLORS.primary,
        backgroundColor: COLORS.white,
        paddingHorizontal: 4,
        left: -4,
        position: 'absolute',
        zIndex: 2,
    },
    input: {
        fontSize: 16,
        color: COLORS.gray[800],
        padding: 0,
        height: 30,
        marginTop: 8,
    },
    inputMultiline: {
        minHeight: 120, // Increased slightly for better multiline view
        height: undefined,
        marginTop: 15, // More space for the floating label
        paddingTop: 0,
        paddingBottom: 5,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING[1],
        marginLeft: SPACING[1],
    },
    errorIcon: {
        fontSize: 12,
        marginRight: SPACING[1],
    },
    errorText: {
        fontSize: 12,
        color: COLORS.danger,
        fontWeight: '600',
    },
});
