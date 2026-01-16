// CV Master - Scanner Screen
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, gradients, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { useSubscription } from '../../context/SubscriptionContext';
import { scoreCv } from '../../services/gemini';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ScannerScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { canScanWithoutAds, isPremium } = useSubscription();
    const [scanning, setScanning] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ name: string; type: string } | null>(null);

    const showAdAndProceed = async (callback: () => void) => {
        if (canScanWithoutAds) {
            callback();
            return;
        }

        // TODO: Show rewarded ad
        Alert.alert(
            'Iklan',
            'Tonton iklan singkat untuk melanjutkan scan CV (Free Plan)',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Tonton Iklan',
                    onPress: () => {
                        // Simulate ad watching
                        setTimeout(callback, 1000);
                    }
                },
                {
                    text: 'Upgrade Premium',
                    onPress: () => navigation.navigate('Subscription'),
                },
            ]
        );
    };

    const handlePickDocument = async () => {
        try {
            const result = await pick({
                type: [types.pdf, types.doc, types.docx],
            });

            if (result[0]) {
                setSelectedFile({
                    name: result[0].name || 'Document',
                    type: result[0].type || 'unknown',
                });
            }
        } catch (err: any) {
            // Ignore if user cancelled
            if (err?.message !== 'canceled') {
                Alert.alert('Error', 'Gagal memilih dokumen');
            }
        }
    };

    const handleTakePhoto = async () => {
        const result = await launchCamera({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (result.assets && result.assets[0]) {
            setSelectedFile({
                name: 'Photo CV',
                type: 'image',
            });
        }
    };

    const handlePickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (result.assets && result.assets[0]) {
            setSelectedFile({
                name: 'Image CV',
                type: 'image',
            });
        }
    };

    const handleScan = () => {
        if (!selectedFile) {
            Alert.alert('Pilih CV', 'Silakan pilih file CV terlebih dahulu');
            return;
        }

        showAdAndProceed(async () => {
            setScanning(true);

            try {
                // TODO: Extract text from document/image using ML Kit OCR
                const mockCvText = `
          John Doe
          Software Engineer
          john.doe@email.com | +62 812 3456 7890
          
          SUMMARY
          Experienced software engineer with 5 years of experience in mobile and web development.
          
          SKILLS
          React Native, JavaScript, TypeScript, Node.js, Python
          
          EXPERIENCE
          Senior Software Engineer at Tech Company (2020 - Present)
          - Led development of mobile applications
          - Improved app performance by 40%
          
          EDUCATION
          Bachelor of Computer Science
          University of Technology (2015 - 2019)
        `;

                const score = await scoreCv(mockCvText);

                // Show ad after scan for free users
                if (!canScanWithoutAds) {
                    Alert.alert(
                        'Scan Selesai!',
                        'Tonton iklan untuk melihat hasil score CV Anda',
                        [
                            {
                                text: 'Tonton Iklan',
                                onPress: () => {
                                    // Navigate to results
                                    // TODO: Save scan to Firestore and navigate with scanId
                                    Alert.alert('Score CV', `Skor ATS Anda: ${score.overallScore}/100`);
                                },
                            },
                        ]
                    );
                } else {
                    // Premium users go directly to results
                    Alert.alert('Score CV', `Skor ATS Anda: ${score.overallScore}/100\n\nATS Compatibility: ${score.atsCompatibility}`);
                }
            } catch (error) {
                Alert.alert('Error', 'Gagal menganalisis CV. Silakan coba lagi.');
            } finally {
                setScanning(false);
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <Text style={styles.title}>Scan CV</Text>
                <Text style={styles.subtitle}>
                    Upload CV Anda untuk analisis ATS dan dapatkan skor
                </Text>

                {/* Upload Area */}
                <View style={styles.uploadArea}>
                    {selectedFile ? (
                        <View style={styles.selectedFile}>
                            <Icon
                                name={selectedFile.type === 'image' ? 'image' : 'document-text'}
                                size={48}
                                color={colors.primary}
                            />
                            <Text style={styles.fileName}>{selectedFile.name}</Text>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => setSelectedFile(null)}
                            >
                                <Icon name="close-circle" size={24} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.uploadPlaceholder}>
                            <LinearGradient
                                colors={[colors.primary + '20', colors.secondary + '20']}
                                style={styles.uploadIcon}
                            >
                                <Icon name="cloud-upload" size={48} color={colors.primary} />
                            </LinearGradient>
                            <Text style={styles.uploadText}>Upload CV Anda</Text>
                            <Text style={styles.uploadHint}>PDF, DOC, DOCX, atau Gambar</Text>
                        </View>
                    )}
                </View>

                {/* Upload Options */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity style={styles.optionCard} onPress={handlePickDocument}>
                        <LinearGradient colors={gradients.primary} style={styles.optionIcon}>
                            <Icon name="document-text" size={24} color={colors.white} />
                        </LinearGradient>
                        <Text style={styles.optionLabel}>Dokumen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard} onPress={handleTakePhoto}>
                        <LinearGradient colors={gradients.secondary} style={styles.optionIcon}>
                            <Icon name="camera" size={24} color={colors.white} />
                        </LinearGradient>
                        <Text style={styles.optionLabel}>Kamera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard} onPress={handlePickImage}>
                        <LinearGradient colors={['#10B981', '#34D399']} style={styles.optionIcon}>
                            <Icon name="images" size={24} color={colors.white} />
                        </LinearGradient>
                        <Text style={styles.optionLabel}>Galeri</Text>
                    </TouchableOpacity>
                </View>

                {/* Scan Button */}
                <Button
                    title={scanning ? 'Menganalisis...' : 'Scan CV Sekarang'}
                    onPress={handleScan}
                    disabled={!selectedFile || scanning}
                    loading={scanning}
                    fullWidth
                    size="lg"
                />
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
    uploadArea: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.border,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        marginBottom: spacing.lg,
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    uploadText: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    uploadHint: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    selectedFile: {
        alignItems: 'center',
        position: 'relative',
        width: '100%',
    },
    fileName: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        marginTop: spacing.md,
    },
    removeButton: {
        position: 'absolute',
        top: -10,
        right: 0,
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    optionCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        ...shadows.sm,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    optionLabel: {
        color: colors.text,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    scanButton: {
        marginBottom: spacing.lg,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.info + '20',
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    infoText: {
        flex: 1,
        color: colors.info,
        fontSize: fontSize.sm,
    },
});

export default ScannerScreen;
