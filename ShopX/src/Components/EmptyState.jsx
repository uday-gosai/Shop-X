import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppButton from './AppButton';
import { COLORS, SPACING } from '../utils/theme';

/**
 * Standardized Empty State component.
 * 
 * @param {Object} props
 * @param {string} props.icon - Emoji icon
 * @param {string} props.title - Main title
 * @param {string} [props.subtitle] - Optional subtitle
 * @param {string} [props.buttonTitle] - Optional action button title
 * @param {Function} [props.onButtonPress] - Optional action button press handler
 */
const EmptyState = ({
    icon = '🔍',
    title,
    subtitle,
    buttonTitle,
    onButtonPress
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {buttonTitle && (
                <AppButton
                    title={buttonTitle}
                    onPress={onButtonPress}
                    style={styles.button}
                />
            )}
        </View>
    );
};

export default EmptyState;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING[10],
    },
    icon: {
        fontSize: 64,
        marginBottom: SPACING[4],
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.gray[800],
        textAlign: 'center',
        marginBottom: SPACING[2],
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.gray[500],
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING[8],
    },
    button: {
        width: '60%',
        maxWidth: 240,
    },
});
