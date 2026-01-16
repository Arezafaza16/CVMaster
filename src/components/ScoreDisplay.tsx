// CV Master - Score Display Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../constants/theme';
import { CVScore } from '../types';

interface ScoreDisplayProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export const ScoreCircle: React.FC<ScoreDisplayProps> = ({
    score,
    size = 'md',
    showLabel = true,
}) => {
    const sizes = {
        sm: { container: 80, stroke: 6, font: fontSize.lg },
        md: { container: 120, stroke: 8, font: fontSize.xxl },
        lg: { container: 180, stroke: 12, font: fontSize.display },
    };

    const { container, stroke, font } = sizes[size];
    const radius = (container - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = ((100 - score) / 100) * circumference;

    const getScoreColor = () => {
        if (score >= 80) return colors.scoreHigh;
        if (score >= 50) return colors.scoreMedium;
        return colors.scoreLow;
    };

    const getScoreLabel = () => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Work';
    };

    return (
        <View style={styles.scoreContainer}>
            <View style={{ width: container, height: container }}>
                <Svg width={container} height={container}>
                    <Defs>
                        <SvgLinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={getScoreColor()} stopOpacity="1" />
                            <Stop offset="100%" stopColor={colors.primary} stopOpacity="1" />
                        </SvgLinearGradient>
                    </Defs>

                    {/* Background circle */}
                    <Circle
                        cx={container / 2}
                        cy={container / 2}
                        r={radius}
                        stroke={colors.surfaceLight}
                        strokeWidth={stroke}
                        fill="transparent"
                    />

                    {/* Progress circle */}
                    <Circle
                        cx={container / 2}
                        cy={container / 2}
                        r={radius}
                        stroke="url(#scoreGradient)"
                        strokeWidth={stroke}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={progress}
                        rotation="-90"
                        origin={`${container / 2}, ${container / 2}`}
                    />
                </Svg>

                <View style={[styles.scoreTextContainer, { width: container, height: container }]}>
                    <Text style={[styles.scoreValue, { fontSize: font, color: getScoreColor() }]}>
                        {score}
                    </Text>
                    {showLabel && (
                        <Text style={styles.scoreLabel}>{getScoreLabel()}</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

interface ScoreBreakdownProps {
    breakdown: CVScore['breakdown'];
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown }) => {
    const categories = [
        { key: 'formatStructure', label: 'Format & Structure', weight: '20%' },
        { key: 'keywordsSkills', label: 'Keywords & Skills', weight: '25%' },
        { key: 'experienceDescription', label: 'Experience', weight: '25%' },
        { key: 'education', label: 'Education', weight: '15%' },
        { key: 'contactInfo', label: 'Contact Info', weight: '15%' },
    ];

    const getBarColor = (score: number) => {
        if (score >= 80) return colors.scoreHigh;
        if (score >= 50) return colors.scoreMedium;
        return colors.scoreLow;
    };

    return (
        <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Score Breakdown</Text>

            {categories.map((cat) => {
                const score = breakdown[cat.key as keyof typeof breakdown];
                return (
                    <View key={cat.key} style={styles.categoryRow}>
                        <View style={styles.categoryHeader}>
                            <Text style={styles.categoryLabel}>{cat.label}</Text>
                            <Text style={styles.categoryScore}>{score}/100</Text>
                        </View>
                        <View style={styles.barContainer}>
                            <View
                                style={[
                                    styles.barFill,
                                    { width: `${score}%`, backgroundColor: getBarColor(score) },
                                ]}
                            />
                        </View>
                        <Text style={styles.weightLabel}>Weight: {cat.weight}</Text>
                    </View>
                );
            })}
        </View>
    );
};

interface ATSBadgeProps {
    compatibility: 'Low' | 'Medium' | 'High';
}

export const ATSBadge: React.FC<ATSBadgeProps> = ({ compatibility }) => {
    const getBadgeStyle = () => {
        switch (compatibility) {
            case 'High':
                return { bg: colors.scoreHigh + '20', text: colors.scoreHigh };
            case 'Medium':
                return { bg: colors.scoreMedium + '20', text: colors.scoreMedium };
            default:
                return { bg: colors.scoreLow + '20', text: colors.scoreLow };
        }
    };

    const style = getBadgeStyle();

    return (
        <View style={[styles.badge, { backgroundColor: style.bg }]}>
            <Text style={[styles.badgeText, { color: style.text }]}>
                ATS: {compatibility}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    scoreContainer: {
        alignItems: 'center',
    },
    scoreTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreValue: {
        fontWeight: fontWeight.bold,
    },
    scoreLabel: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    breakdownContainer: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginTop: spacing.lg,
    },
    breakdownTitle: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.md,
    },
    categoryRow: {
        marginBottom: spacing.md,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    categoryLabel: {
        color: colors.text,
        fontSize: fontSize.md,
    },
    categoryScore: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    barContainer: {
        height: 8,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    weightLabel: {
        color: colors.textMuted,
        fontSize: fontSize.xs,
        marginTop: spacing.xs,
    },
    badge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
});

export default { ScoreCircle, ScoreBreakdown, ATSBadge };
