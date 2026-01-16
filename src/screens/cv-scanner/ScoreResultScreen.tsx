// CV Master - Score Result Screen (Placeholder)
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';

const ScoreResultScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Score Result</Text>
                <Text style={styles.subtitle}>Coming soon...</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    title: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        marginTop: spacing.sm,
    },
});

export default ScoreResultScreen;
