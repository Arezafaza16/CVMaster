// CV Master - Register Screen
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { signUp, signInWithGoogle } = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        // Validation
        if (!displayName || !email || !password || !confirmPassword) {
            setError('Mohon isi semua field.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password tidak cocok.');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        setLoading(true);
        setError('');

        const result = await signUp(email, password, displayName);

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
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <LinearGradient
                            colors={gradients.secondary}
                            style={styles.logoContainer}
                        >
                            <Icon name="person-add" size={36} color={colors.white} />
                        </LinearGradient>
                        <Text style={styles.title}>Buat Akun Baru</Text>
                        <Text style={styles.subtitle}>
                            Daftar gratis dan mulai optimalkan CV Anda
                        </Text>
                    </View>

                    {/* Register Form */}
                    <View style={styles.form}>
                        <Input
                            label="Nama Lengkap"
                            placeholder="Masukkan nama lengkap"
                            value={displayName}
                            onChangeText={setDisplayName}
                            autoCapitalize="words"
                            leftIcon="person-outline"
                        />

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
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                        />

                        <Input
                            label="Konfirmasi Password"
                            placeholder="Ulangi password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Button
                            title="Daftar Sekarang"
                            onPress={handleRegister}
                            loading={loading}
                            fullWidth
                            size="lg"
                            variant="secondary"
                            style={styles.registerButton}
                        />

                        {/* Features Preview */}
                        <View style={styles.features}>
                            <Text style={styles.featuresTitle}>Fitur Gratis:</Text>
                            {['Scan CV dengan AI', 'Lihat ATS Score', 'Buat 1 CV Gratis'].map((feature, index) => (
                                <View key={index} style={styles.featureRow}>
                                    <Icon name="checkmark-circle" size={18} color={colors.scoreHigh} />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>

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
                                {googleLoading ? 'Memproses...' : 'Daftar dengan Google'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Sudah punya akun? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.footerLink}>Masuk</Text>
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
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: spacing.sm,
        marginBottom: spacing.md,
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
    title: {
        color: colors.text,
        fontSize: fontSize.xxl,
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
    errorText: {
        color: colors.error,
        fontSize: fontSize.sm,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    registerButton: {
        marginTop: spacing.sm,
    },
    features: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    featuresTitle: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        marginBottom: spacing.sm,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xs,
    },
    featureText: {
        color: colors.text,
        fontSize: fontSize.md,
        marginLeft: spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
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
});

export default RegisterScreen;
