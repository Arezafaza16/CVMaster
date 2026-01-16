// CV Master - Job Match Screen (Premium Feature)
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, gradients, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import { RootStackParamList, JobMatch } from '../../types';
import { useSubscription } from '../../context/SubscriptionContext';
import { matchJob } from '../../services/gemini';
import Input from '../../components/Input';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const JobMatchScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { canUseJobMatching, isPremium } = useSubscription();
    const [jobRequirement, setJobRequirement] = useState('');
    const [loading, setLoading] = useState(false);
    const [matchResult, setMatchResult] = useState<JobMatch | null>(null);

    const handleMatch = async () => {
        if (!jobRequirement.trim()) {
            Alert.alert('Error', 'Silakan masukkan requirement lowongan');
            return;
        }

        if (!canUseJobMatching) {
            navigation.navigate('Subscription');
            return;
        }

        setLoading(true);
        try {
            // TODO: Get user's CV text from Firestore
            const mockCvText = `
        Software Engineer with 5 years experience
        Skills: React Native, TypeScript, Node.js, Python
        Experience: Senior Developer at Tech Corp
      `;

            const result = await matchJob(mockCvText, jobRequirement);
            setMatchResult(result);
        } catch (error) {
            Alert.alert('Error', 'Gagal menganalisis kecocokan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return colors.scoreHigh;
        if (score >= 50) return colors.scoreMedium;
        return colors.scoreLow;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Header */}
                <Text style={styles.title}>Job Matching</Text>
                <Text style={styles.subtitle}>
                    Bandingkan CV Anda dengan requirement lowongan kerja
                </Text>

                {/* Input Section - Available for all users */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Paste Job Requirement</Text>
                    <Input
                        placeholder="Salin dan tempel deskripsi pekerjaan / requirement dari lowongan yang Anda inginkan..."
                        value={jobRequirement}
                        onChangeText={setJobRequirement}
                        multiline
                        numberOfLines={8}
                        maxLength={2000}
                    />

                    <Button
                        title={loading ? 'Menganalisis...' : 'Analisis Kecocokan'}
                        onPress={handleMatch}
                        loading={loading}
                        fullWidth
                        size="lg"
                        disabled={!jobRequirement.trim()}
                    />
                </View>

                {/* Results - Only shown for premium users after analysis */}
                {matchResult && isPremium && (
                    <View style={styles.resultSection}>
                        {/* Match Score */}
                        <View style={styles.scoreCard}>
                            <Text style={styles.scoreLabel}>Match Score</Text>
                            <Text style={[
                                styles.scoreValue,
                                { color: getMatchScoreColor(matchResult.matchScore) }
                            ]}>
                                {matchResult.matchScore}%
                            </Text>
                        </View>

                        {/* Matching Skills */}
                        {matchResult.matchingSkills.length > 0 && (
                            <View style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <Icon name="checkmark-circle" size={20} color={colors.scoreHigh} />
                                    <Text style={styles.resultTitle}>Skills yang Cocok</Text>
                                </View>
                                <View style={styles.skillsContainer}>
                                    {matchResult.matchingSkills.map((skill, index) => (
                                        <View key={index} style={[styles.skillTag, styles.matchTag]}>
                                            <Text style={styles.matchTagText}>{skill}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Missing Skills */}
                        {matchResult.missingSkills.length > 0 && (
                            <View style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <Icon name="close-circle" size={20} color={colors.scoreLow} />
                                    <Text style={styles.resultTitle}>Skills yang Kurang</Text>
                                </View>
                                <View style={styles.skillsContainer}>
                                    {matchResult.missingSkills.map((skill, index) => (
                                        <View key={index} style={[styles.skillTag, styles.missingTag]}>
                                            <Text style={styles.missingTagText}>{skill}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Recommendations */}
                        {matchResult.recommendations.length > 0 && (
                            <View style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <Icon name="bulb" size={20} color={colors.warning} />
                                    <Text style={styles.resultTitle}>Rekomendasi</Text>
                                </View>
                                {matchResult.recommendations.map((rec, index) => (
                                    <View key={index} style={styles.recommendationItem}>
                                        <Icon name="arrow-forward" size={16} color={colors.primary} />
                                        <Text style={styles.recommendationText}>{rec}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}
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
    title: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        marginBottom: spacing.xl,
    },
    premiumLock: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    lockGradient: {
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.secondary + '40',
        borderRadius: borderRadius.xl,
    },
    lockTitle: {
        color: colors.text,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.semibold,
        marginTop: spacing.md,
    },
    lockSubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    inputSection: {
        marginBottom: spacing.xl,
    },
    inputLabel: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.md,
    },
    resultSection: {
        gap: spacing.md,
    },
    scoreCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
    },
    scoreLabel: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: fontWeight.bold,
        marginTop: spacing.sm,
    },
    resultCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    resultTitle: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    skillTag: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    matchTag: {
        backgroundColor: colors.scoreHigh + '20',
    },
    matchTagText: {
        color: colors.scoreHigh,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    missingTag: {
        backgroundColor: colors.scoreLow + '20',
    },
    missingTagText: {
        color: colors.scoreLow,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginVertical: spacing.xs,
    },
    recommendationText: {
        flex: 1,
        color: colors.text,
        fontSize: fontSize.md,
        lineHeight: 22,
    },
});

export default JobMatchScreen;
