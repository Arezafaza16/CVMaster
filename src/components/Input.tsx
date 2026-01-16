// CV Master - Reusable Input Component
import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
    editable?: boolean;
    leftIcon?: string;
    rightIcon?: string;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
    numberOfLines = 1,
    maxLength,
    editable = true,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    inputStyle,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const toggleSecure = () => setIsSecure(!isSecure);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    error && styles.inputContainerError,
                    !editable && styles.inputContainerDisabled,
                ]}
            >
                {leftIcon && (
                    <Icon
                        name={leftIcon}
                        size={20}
                        color={isFocused ? colors.primary : colors.textSecondary}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multilineInput,
                        leftIcon && { paddingLeft: 0 },
                        inputStyle,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isSecure}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    maxLength={maxLength}
                    editable={editable}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />

                {secureTextEntry && (
                    <TouchableOpacity onPress={toggleSecure} style={styles.rightIcon}>
                        <Icon
                            name={isSecure ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIcon}
                        disabled={!onRightIconPress}
                    >
                        <Icon
                            name={rightIcon}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {maxLength && (
                <Text style={styles.charCount}>
                    {value.length}/{maxLength}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        color: colors.text,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
    },
    inputContainerFocused: {
        borderColor: colors.primary,
        backgroundColor: colors.surfaceLight,
    },
    inputContainerError: {
        borderColor: colors.error,
    },
    inputContainerDisabled: {
        backgroundColor: colors.surface,
        opacity: 0.6,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: fontSize.md,
        paddingVertical: spacing.md,
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIcon: {
        marginLeft: spacing.sm,
        padding: spacing.xs,
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    charCount: {
        color: colors.textMuted,
        fontSize: fontSize.xs,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
});

export default Input;
