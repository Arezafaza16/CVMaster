// CV Master - Home Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, gradients, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../constants/theme';
import { RootStackParamList, CVData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { getUserCvs } from '../../services/firebase';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user, userData } = useAuth();
    const { isPremium, maxFreeCvs } = useSubscription();
    const [refreshing, setRefreshing] = useState(false);
    const [cvList, setCvList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCvs = useCallback(async () => {
        if (!user) {
            console.log('No user, skipping CV fetch');
            setLoading(false);
            return;
        }
        console.log('Fetching CVs for user:', user.uid);
        try {
            const { data, error } = await getUserCvs(user.uid);
            console.log('Fetch result:', { data, error, count: data?.length });
            if (!error && data) {
                setCvList(data);
            }
        } catch (error) {
            console.error('Error fetching CVs:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch CVs when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log('HomeScreen focused, fetching CVs...');
            fetchCvs();
        }, [fetchCvs])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCvs();
        setRefreshing(false);
    };

    const canCreateNewCv = isPremium || cvList.length < maxFreeCvs;
    console.log('CV count:', cvList.length, 'maxFreeCvs:', maxFreeCvs, 'canCreate:', canCreateNewCv);

    const handleCreateCv = () => {
        if (!canCreateNewCv) {
            Alert.alert(
                'Batas CV Tercapai',
                'Upgrade ke Premium untuk membuat lebih dari 1 CV.',
                [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') }
                ]
            );
            return;
        }
        navigation.navigate('CVForm', {});
    };

    const handleCvPress = (cv: any) => {
        Alert.alert(
            cv.title || 'CV',
            'Pilih aksi untuk CV ini',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Lihat CV',
                    onPress: () => {
                        if (cv.imageUrl) {
                            navigation.navigate('CVView', {
                                cvId: cv.id,
                                imageUrl: cv.imageUrl,
                                title: cv.title || 'CV'
                            });
                        } else {
                            Alert.alert('Info', 'CV belum memiliki gambar preview');
                        }
                    }
                },
                {
                    text: 'Edit CV',
                    onPress: () => navigation.navigate('CVForm', { cvId: cv.id })
                },
            ]
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/* Gradient Header Background */}
            <LinearGradient
                colors={[colors.primaryDark, colors.primary]}
                style={styles.headerGradient}
            />

            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.white}
                        />
                    }
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>Selamat Datang,</Text>
                            <Text style={styles.userName}>{userData?.displayName || 'User'}</Text>
                        </View>
                        {isPremium ? (
                            <LinearGradient
                                colors={gradients.secondary}
                                style={styles.premiumBadge}
                            >
                                <Icon name="diamond" size={14} color={colors.white} />
                                <Text style={styles.premiumText}>Premium</Text>
                            </LinearGradient>
                        ) : (
                            <TouchableOpacity
                                style={styles.upgradeBadge}
                                onPress={() => navigation.navigate('Subscription')}
                            >
                                <Text style={styles.upgradeText}>Upgrade</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Scanner' as any)}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: '#dcfce7' }]}>
                                <Icon name="scan" size={28} color={colors.accent} />
                            </View>
                            <Text style={styles.actionTitle}>Scan CV</Text>
                            <Text style={styles.actionSubtitle}>Analisis ATS Score</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={handleCreateCv}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: '#dbeafe' }]}>
                                <Icon name="add-circle" size={28} color={colors.primary} />
                            </View>
                            <Text style={styles.actionTitle}>Buat CV</Text>
                            <Text style={styles.actionSubtitle}>
                                {isPremium ? 'Unlimited' : `${cvList.length}/${maxFreeCvs} CV`}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Card */}
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Statistik Anda</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{cvList.length}</Text>
                                <Text style={styles.statLabel}>CV Dibuat</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{userData?.scansToday || 0}</Text>
                                <Text style={styles.statLabel}>Scan Hari Ini</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.scoreHigh }]}>-</Text>
                                <Text style={styles.statLabel}>Skor Tertinggi</Text>
                            </View>
                        </View>
                    </View>

                    {/* My CVs Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>CV Saya</Text>
                            {cvList.length > 0 && (
                                <TouchableOpacity>
                                    <Text style={styles.seeAll}>Lihat Semua</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {cvList.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Icon name="document-text-outline" size={48} color={colors.textMuted} />
                                <Text style={styles.emptyTitle}>Belum Ada CV</Text>
                                <Text style={styles.emptySubtitle}>
                                    Buat CV pertama Anda atau scan CV yang sudah ada
                                </Text>
                                <Button
                                    title="Buat CV Sekarang"
                                    onPress={handleCreateCv}
                                    variant="primary"
                                    style={{ marginTop: spacing.md }}
                                />
                            </View>
                        ) : (
                            <View style={styles.cvList}>
                                {cvList.map((cv) => (
                                    <TouchableOpacity
                                        key={cv.id}
                                        style={styles.cvCard}
                                        onPress={() => handleCvPress(cv)}
                                    >
                                        {cv.imageUrl ? (
                                            <Image
                                                source={{ uri: cv.imageUrl }}
                                                style={styles.cvThumbnail}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={styles.cvCardIcon}>
                                                <Icon name="document-text" size={24} color={colors.primary} />
                                            </View>
                                        )}
                                        <View style={styles.cvCardContent}>
                                            <Text style={styles.cvCardTitle}>{cv.title || 'Untitled CV'}</Text>
                                            <Text style={styles.cvCardSubtitle}>
                                                {cv.personalInfo?.fullName || 'Tidak ada nama'}
                                            </Text>
                                        </View>
                                        <Icon name="chevron-forward" size={20} color={colors.textMuted} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Premium Promo - Only show to free users */}
                    {!isPremium && (
                        <TouchableOpacity
                            style={styles.promoCard}
                            onPress={() => navigation.navigate('Subscription')}
                        >
                            <LinearGradient
                                colors={['#0f172a', '#1e293b']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.promoGradient}
                            >
                                <View style={styles.promoContent}>
                                    <LinearGradient
                                        colors={[colors.accentAlt, '#fb923c']}
                                        style={styles.promoIconBg}
                                    >
                                        <Icon name="diamond" size={20} color={colors.white} />
                                    </LinearGradient>
                                    <View style={styles.promoText}>
                                        <Text style={styles.promoTitle}>Upgrade ke Premium</Text>
                                        <Text style={styles.promoSubtitle}>
                                            Scan tanpa iklan, AI Fix, Job Matching
                                        </Text>
                                    </View>
                                    <Icon name="arrow-forward" size={24} color="rgba(255,255,255,0.7)" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
        marginTop: spacing.md,
    },
    greeting: {
        color: '#bfdbfe',
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        marginBottom: 4,
    },
    userName: {
        color: colors.white,
        fontSize: 28,
        fontWeight: fontWeight.bold,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    premiumText: {
        color: colors.accentAlt,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },
    upgradeBadge: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.3)',
    },
    upgradeText: {
        color: colors.accentAlt,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    quickActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
        marginTop: -spacing.md,
    },
    actionCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        ...shadows.lg,
    },
    actionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    actionTitle: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        marginBottom: 4,
    },
    actionSubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.xs,
    },
    statsCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    statsTitle: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
    },
    statLabel: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    seeAll: {
        color: colors.primary,
        fontSize: fontSize.md,
    },
    emptyState: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyTitle: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        marginTop: spacing.md,
    },
    emptySubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    promoCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(71,85,105,0.5)',
    },
    promoGradient: {
        padding: spacing.lg,
    },
    promoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    promoIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    promoText: {
        flex: 1,
    },
    promoTitle: {
        color: colors.white,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        marginBottom: 2,
    },
    promoSubtitle: {
        color: '#d1d5db',
        fontSize: 10,
    },
    cvList: {
        gap: spacing.sm,
    },
    cvCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    cvCardIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    cvCardContent: {
        flex: 1,
    },
    cvCardTitle: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    cvCardSubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    cvThumbnail: {
        width: 48,
        height: 68,
        borderRadius: borderRadius.sm,
        marginRight: spacing.md,
        backgroundColor: colors.surfaceLight,
    },
});

export default HomeScreen;
