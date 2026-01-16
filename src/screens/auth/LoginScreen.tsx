// CV Master - Login Screen
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, gradients, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { signIn, signInWithGoogle } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Mohon isi semua field.');
            return;
        }

        setLoading(true);
        setError('');

        const result = await signIn(email, password);

        if (result.error) {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError('');

        const result = await signInWithGoogle();

        if (result.error) {
            setError(result.error);
        }

        setGoogleLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <LinearGradient
                            colors={gradients.primary}
                            style={styles.logoContainer}
                        >
                            <Text style={styles.logoText}>CV</Text>
                        </LinearGradient>
                        <Text style={styles.title}>CV Master</Text>
                        <Text style={styles.subtitle}>
                            Scan, Analyze & Create ATS-Friendly CV
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.form}>
                        <Text style={styles.formTitle}>Masuk ke Akun Anda</Text>

                        <Input
                            label="Email"
                            placeholder="Masukkan email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                        />

                        <Input
                            label="Password"
                            placeholder="Masukkan password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Button
                            title="Masuk"
                            onPress={handleLogin}
                            loading={loading}
                            fullWidth
                            size="lg"
                            style={styles.loginButton}
                        />

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>atau</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google Sign In */}
                        <TouchableOpacity
                            style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
                            onPress={handleGoogleSignIn}
                            disabled={googleLoading}
                        >
                            <Text style={styles.googleButtonText}>
                                {googleLoading ? 'Memproses...' : 'Lanjutkan dengan Google'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Register Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Belum punya akun? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.footerLink}>Daftar Sekarang</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    logoText: {
        color: colors.white,
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
    },
    title: {
        color: colors.text,
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        textAlign: 'center',
    },
    form: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    formTitle: {
        color: colors.text,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.sm,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    loginButton: {
        marginTop: spacing.sm,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        marginHorizontal: spacing.md,
    },
    googleButton: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    googleButtonDisabled: {
        opacity: 0.6,
    },
    googleButtonText: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
    },
    footerLink: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
});

export default LoginScreen;
