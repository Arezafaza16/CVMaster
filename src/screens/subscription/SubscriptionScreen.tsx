// CV Master - Subscription Screen
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import { SUBSCRIPTION_PRICE } from '../../types';
import { useSubscription, subscriptionPlan } from '../../context/SubscriptionContext';
import Button from '../../components/Button';

const SubscriptionScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isPremium, subscriptionExpiry } = useSubscription();
    const [loading, setLoading] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            // TODO: Implement Google Play Billing
            Alert.alert(
                'Coming Soon',
                'Integrasi Google Play Billing akan segera tersedia. Untuk saat ini, hubungi kami untuk aktivasi manual.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert('Error', 'Gagal memproses pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const freeFeatures = [
        { feature: 'Scan CV dengan AI', available: true, note: 'dengan iklan' },
        { feature: 'Lihat ATS Score', available: true },
        { feature: 'Buat 1 CV', available: true },
        { feature: 'Template gratis', available: true },
        { feature: 'Scan tanpa iklan', available: false },
        { feature: 'Job Matching', available: false },
        { feature: 'AI CV Fix', available: false },
        { feature: 'Template premium', available: false },
        { feature: 'CV Unlimited', available: false },
    ];

    const premiumFeatures = [
        { feature: 'Scan CV tanpa iklan', available: true, highlight: true },
        { feature: 'Job Requirement Matching', available: true, highlight: true },
        { feature: 'AI CV Improvement', available: true, highlight: true },
        { feature: 'Template Premium', available: true },
        { feature: 'Buat CV Unlimited', available: true },
        { feature: 'Export ke PDF', available: true },
        { feature: 'Priority Support', available: true },
        { feature: 'Lihat ATS Score Detail', available: true },
        { feature: 'Riwayat Scan', available: true },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Header */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="close" size={28} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <LinearGradient
                        colors={gradients.secondary}
                        style={styles.iconContainer}
                    >
                        <Icon name="diamond" size={40} color={colors.white} />
                    </LinearGradient>
                    <Text style={styles.title}>CV Master Premium</Text>
                    <Text style={styles.subtitle}>
                        Unlock semua fitur premium untuk CV yang lebih profesional
                    </Text>
                </View>

                {/* Current Status */}
                {isPremium && (
                    <View style={styles.statusCard}>
                        <Icon name="checkmark-circle" size={24} color={colors.scoreHigh} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.statusTitle}>Premium Aktif</Text>
                            <Text style={styles.statusExpiry}>
                                Berlaku hingga: {formatDate(subscriptionExpiry)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Plan Comparison */}
                <View style={styles.plansContainer}>
                    {/* Free Plan */}
                    <View style={styles.planCard}>
                        <Text style={styles.planName}>Free</Text>
                        <Text style={styles.planPrice}>Rp 0</Text>
                        <Text style={styles.planPeriod}>Selamanya</Text>

                        <View style={styles.featuresContainer}>
                            {freeFeatures.map((item, index) => (
                                <View key={index} style={styles.featureRow}>
                                    <Icon
                                        name={item.available ? 'checkmark-circle' : 'close-circle'}
                                        size={18}
                                        color={item.available ? colors.scoreHigh : colors.textMuted}
                                    />
                                    <Text style={[
                                        styles.featureText,
                                        !item.available && styles.featureDisabled
                                    ]}>
                                        {item.feature}
                                        {item.note && <Text style={styles.featureNote}> ({item.note})</Text>}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Premium Plan */}
                    <View style={[styles.planCard, styles.premiumPlanCard]}>
                        <LinearGradient
                            colors={gradients.secondary}
                            style={styles.bestValueBadge}
                        >
                            <Text style={styles.bestValueText}>RECOMMENDED</Text>
                        </LinearGradient>

                        <Text style={[styles.planName, styles.premiumPlanName]}>Premium</Text>
                        <Text style={[styles.planPrice, styles.premiumPlanPrice]}>
                            {formatPrice(SUBSCRIPTION_PRICE)}
                        </Text>
                        <Text style={[styles.planPeriod, styles.premiumPlanPeriod]}>/bulan</Text>

                        <View style={styles.featuresContainer}>
                            {premiumFeatures.map((item, index) => (
                                <View key={index} style={styles.featureRow}>
                                    <Icon
                                        name="checkmark-circle"
                                        size={18}
                                        color={item.highlight ? colors.secondary : colors.scoreHigh}
                                    />
                                    <Text style={[
                                        styles.featureText,
                                        item.highlight && styles.featureHighlight
                                    ]}>
                                        {item.feature}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {!isPremium && (
                            <Button
                                title={loading ? 'Memproses...' : 'Berlangganan Sekarang'}
                                onPress={handleSubscribe}
                                loading={loading}
                                variant="secondary"
                                fullWidth
                                size="lg"
                                style={{ marginTop: spacing.lg }}
                            />
                        )}
                    </View>
                </View>

                {/* FAQ / Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Informasi</Text>

                    <View style={styles.infoItem}>
                        <Icon name="shield-checkmark" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>
                            Pembayaran aman melalui Google Play
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Icon name="refresh" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>
                            Berlangganan diperpanjang otomatis setiap bulan
                        </Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Icon name="close-circle" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>
                            Bisa batal kapan saja dari Play Store
                        </Text>
                    </View>
                </View>

                {/* Terms */}
                <Text style={styles.termsText}>
                    Dengan berlangganan, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
    },
    backButton: {
        alignSelf: 'flex-end',
        padding: spacing.sm,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
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
        paddingHorizontal: spacing.lg,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.scoreHigh + '20',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    statusTitle: {
        color: colors.scoreHigh,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    statusExpiry: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
    },
    plansContainer: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    planCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    premiumPlanCard: {
        borderColor: colors.secondary,
        borderWidth: 2,
        position: 'relative',
        overflow: 'hidden',
    },
    bestValueBadge: {
        position: 'absolute',
        top: 12,
        right: -30,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xs,
        transform: [{ rotate: '45deg' }],
    },
    bestValueText: {
        color: colors.white,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },
    planName: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    premiumPlanName: {
        color: colors.secondary,
    },
    planPrice: {
        color: colors.text,
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        marginTop: spacing.xs,
    },
    premiumPlanPrice: {
        color: colors.secondary,
    },
    planPeriod: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
    },
    premiumPlanPeriod: {
        color: colors.textSecondary,
    },
    featuresContainer: {
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    featureText: {
        flex: 1,
        color: colors.text,
        fontSize: fontSize.md,
    },
    featureDisabled: {
        color: colors.textMuted,
        textDecorationLine: 'line-through',
    },
    featureNote: {
        color: colors.textMuted,
        fontSize: fontSize.sm,
    },
    featureHighlight: {
        color: colors.secondary,
        fontWeight: fontWeight.medium,
    },
    infoSection: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    infoTitle: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.md,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginVertical: spacing.xs,
    },
    infoText: {
        flex: 1,
        color: colors.textSecondary,
        fontSize: fontSize.md,
    },
    termsText: {
        color: colors.textMuted,
        fontSize: fontSize.sm,
        textAlign: 'center',
    },
});

export default SubscriptionScreen;
