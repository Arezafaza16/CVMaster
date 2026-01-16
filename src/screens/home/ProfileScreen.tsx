// CV Master - Profile Screen
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, gradients, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import { RootStackParamList, SUBSCRIPTION_PRICE } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSubscription, subscriptionPlan } from '../../context/SubscriptionContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user, userData, signOut } = useAuth();
    const { isPremium, subscriptionExpiry } = useSubscription();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Keluar',
            'Apakah Anda yakin ingin keluar dari akun?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Keluar',
                    style: 'destructive',
                    onPress: async () => {
                        setLoggingOut(true);
                        await signOut();
                    },
                },
            ]
        );
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const menuItems = [
        {
            icon: 'person-outline',
            label: 'Edit Profil',
            onPress: () => { },
        },
        {
            icon: 'notifications-outline',
            label: 'Notifikasi',
            onPress: () => { },
        },
        {
            icon: 'help-circle-outline',
            label: 'Bantuan & FAQ',
            onPress: () => { },
        },
        {
            icon: 'document-text-outline',
            label: 'Syarat & Ketentuan',
            onPress: () => { },
        },
        {
            icon: 'shield-checkmark-outline',
            label: 'Kebijakan Privasi',
            onPress: () => { },
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <Text style={styles.headerTitle}>Profil</Text>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={gradients.primary}
                            style={styles.avatar}
                        >
                            <Text style={styles.avatarText}>
                                {userData?.displayName?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </LinearGradient>
                        {isPremium && (
                            <View style={styles.premiumIcon}>
                                <Icon name="diamond" size={12} color={colors.secondary} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.profileName}>{userData?.displayName || 'User'}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                {/* Subscription Card */}
                <TouchableOpacity
                    style={styles.subscriptionCard}
                    onPress={() => !isPremium && navigation.navigate('Subscription')}
                >
                    {isPremium ? (
                        <LinearGradient
                            colors={gradients.secondary}
                            style={styles.subscriptionGradient}
                        >
                            <View style={styles.subscriptionContent}>
                                <View style={styles.subscriptionInfo}>
                                    <View style={styles.subscriptionHeader}>
                                        <Icon name="diamond" size={24} color={colors.white} />
                                        <Text style={styles.subscriptionTitle}>Premium Active</Text>
                                    </View>
                                    <Text style={styles.subscriptionExpiry}>
                                        Berlaku hingga: {formatDate(subscriptionExpiry)}
                                    </Text>
                                </View>
                                <Icon name="checkmark-circle" size={28} color={colors.white} />
                            </View>
                        </LinearGradient>
                    ) : (
                        <View style={styles.freeSubscription}>
                            <View style={styles.subscriptionInfo}>
                                <View style={styles.subscriptionHeader}>
                                    <Icon name="person" size={24} color={colors.textSecondary} />
                                    <Text style={styles.freeTitle}>Free Plan</Text>
                                </View>
                                <Text style={styles.upgradeHint}>
                                    Upgrade ke Premium hanya {formatPrice(SUBSCRIPTION_PRICE)}/bulan
                                </Text>
                            </View>
                            <Icon name="chevron-forward" size={24} color={colors.primary} />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Menu Items */}
                <View style={styles.menuCard}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuItemLeft}>
                                <Icon name={item.icon} size={22} color={colors.textSecondary} />
                                <Text style={styles.menuItemLabel}>{item.label}</Text>
                            </View>
                            <Icon name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={loggingOut}
                >
                    <Icon name="log-out-outline" size={22} color={colors.error} />
                    <Text style={styles.logoutText}>
                        {loggingOut ? 'Logging out...' : 'Keluar'}
                    </Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.version}>CV Master v1.0.0</Text>
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
    scrollContent: {
        padding: spacing.lg,
    },
    headerTitle: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.lg,
    },
    profileCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: colors.white,
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
    },
    premiumIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.xs,
    },
    profileName: {
        color: colors.text,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
    },
    profileEmail: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        marginTop: spacing.xs,
    },
    subscriptionCard: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    subscriptionGradient: {
        padding: spacing.lg,
    },
    subscriptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    subscriptionInfo: {
        flex: 1,
    },
    subscriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    subscriptionTitle: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    subscriptionExpiry: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    freeSubscription: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    freeTitle: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    upgradeHint: {
        color: colors.primary,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    featuresCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    featuresTitle: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.md,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginVertical: spacing.xs,
    },
    featureText: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
    },
    menuCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    menuItemLabel: {
        color: colors.text,
        fontSize: fontSize.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    logoutText: {
        color: colors.error,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    version: {
        color: colors.textMuted,
        fontSize: fontSize.sm,
        textAlign: 'center',
    },
});

export default ProfileScreen;
