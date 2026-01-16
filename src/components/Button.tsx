// CV Master - Reusable Button Component
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, gradients, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle,
}) => {
    const isDisabled = disabled || loading;

    const sizeStyles = {
        sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
        md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
        lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
    };

    const textSizeStyles = {
        sm: { fontSize: fontSize.sm },
        md: { fontSize: fontSize.md },
        lg: { fontSize: fontSize.lg },
    };

    const renderContent = () => (
        <>
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
                    size="small"
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && icon}
                    <Text
                        style={[
                            styles.text,
                            textSizeStyles[size],
                            variant === 'outline' ? styles.outlineText : null,
                            variant === 'ghost' ? styles.ghostText : null,
                            icon && iconPosition === 'left' ? { marginLeft: spacing.sm } : null,
                            icon && iconPosition === 'right' ? { marginRight: spacing.sm } : null,
                            isDisabled ? styles.disabledText : null,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && icon}
                </>
            )}
        </>
    );

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[fullWidth && styles.fullWidth, style]}
            >
                <LinearGradient
                    colors={isDisabled ? [colors.surfaceLight, colors.surface] : gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.button,
                        sizeStyles[size],
                        fullWidth && styles.fullWidth,
                    ]}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (variant === 'secondary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[fullWidth && styles.fullWidth, style]}
            >
                <LinearGradient
                    colors={isDisabled ? [colors.surfaceLight, colors.surface] : gradients.secondary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.button,
                        sizeStyles[size],
                        fullWidth && styles.fullWidth,
                    ]}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
                styles.button,
                sizeStyles[size],
                variant === 'outline' && styles.outlineButton,
                variant === 'ghost' && styles.ghostButton,
                isDisabled && styles.disabledButton,
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
    },
    fullWidth: {
        width: '100%',
    },
    text: {
        color: colors.white,
        fontWeight: fontWeight.semibold,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    outlineText: {
        color: colors.primary,
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: colors.primary,
    },
    disabledButton: {
        backgroundColor: colors.surfaceLight,
        borderColor: colors.surfaceLight,
    },
    disabledText: {
        color: colors.textMuted,
    },
});

export default Button;
