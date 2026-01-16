// CV Master - CV Preview Screen (Placeholder)
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '../../constants/theme';

const CVPreviewScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>CV Preview</Text>
                <Text style={styles.subtitle}>Full CV preview with template selection coming soon...</Text>
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
        textAlign: 'center',
    },
});

export default CVPreviewScreen;
