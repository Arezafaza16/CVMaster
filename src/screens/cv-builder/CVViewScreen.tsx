// CV Master - CV View Screen
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Share from 'react-native-share';
import { generatePDF } from 'react-native-html-to-pdf';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { getCvById } from '../../services/firebase';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CVViewRouteProp = RouteProp<RootStackParamList, 'CVView'>;

const CVViewScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<CVViewRouteProp>();
    const { cvId, imageUrl, title } = route.params;

    const [cvData, setCvData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showNameModal, setShowNameModal] = useState(false);
    const [pdfName, setPdfName] = useState(title.replace('CV - ', ''));
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchCv = async () => {
            const { data, error } = await getCvById(cvId);
            if (data) {
                setCvData(data);
            }
            setLoading(false);
        };
        fetchCv();
    }, [cvId]);

    const generateCvHtml = () => {
        if (!cvData) return '';

        const { personalInfo, summary, skills, experience, education } = cvData;
        const skillsList = skills?.map((s: any) => s.name).join(', ') || '';
        const experienceHtml = experience?.map((exp: any) => `
            <div style="margin-bottom: 10px;">
                <strong>${exp.position}</strong> - ${exp.company}<br/>
                <span style="color: #666; font-size: 12px;">${exp.startDate} - ${exp.endDate}</span>
                ${exp.description ? `<p style="margin: 5px 0;">${exp.description}</p>` : ''}
            </div>
        `).join('') || '';
        const educationHtml = education?.map((edu: any) => `
            <div style="margin-bottom: 10px;">
                <strong>${edu.degree}</strong> - ${edu.field}<br/>
                <span>${edu.institution}</span><br/>
                <span style="color: #666; font-size: 12px;">${edu.startYear} - ${edu.endYear}</span>
            </div>
        `).join('') || '';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                    h1 { color: #333; margin-bottom: 5px; }
                    .contact { color: #666; margin-bottom: 20px; }
                    .section { margin-bottom: 20px; }
                    .section-title { color: #333; font-size: 16px; font-weight: bold; border-bottom: 2px solid #6366f1; padding-bottom: 5px; margin-bottom: 10px; }
                    p { margin: 5px 0; }
                </style>
            </head>
            <body>
                <h1>${personalInfo?.fullName || 'Nama'}</h1>
                <div class="contact">
                    ${personalInfo?.email || ''} | ${personalInfo?.phone || ''}<br/>
                    ${personalInfo?.address || ''}
                </div>
                ${summary ? `<div class="section"><div class="section-title">Ringkasan</div><p>${summary}</p></div>` : ''}
                ${skills?.length > 0 ? `<div class="section"><div class="section-title">Keahlian</div><p>${skillsList}</p></div>` : ''}
                ${experience?.length > 0 ? `<div class="section"><div class="section-title">Pengalaman</div>${experienceHtml}</div>` : ''}
                ${education?.length > 0 ? `<div class="section"><div class="section-title">Pendidikan</div>${educationHtml}</div>` : ''}
            </body>
            </html>
        `;
    };

    const handleDownloadPDF = async () => {
        setShowNameModal(true);
    };

    const confirmDownload = async () => {
        if (!pdfName.trim()) {
            Alert.alert('Error', 'Nama file tidak boleh kosong');
            return;
        }

        setShowNameModal(false);
        setDownloading(true);

        try {
            const html = generateCvHtml();

            const options = {
                html,
                fileName: pdfName.trim(),
                directory: 'Download',
            };

            const file = await generatePDF(options);
            console.log('PDF created at:', file.filePath);

            Alert.alert(
                'Berhasil',
                `CV berhasil disimpan sebagai ${pdfName.trim()}.pdf di folder Download`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Gagal mengunduh CV sebagai PDF');
        } finally {
            setDownloading(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.open({
                url: imageUrl,
                title: title,
                message: `CV - ${title}`,
            });
        } catch (error) {
            console.log('Share cancelled or error:', error);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                    <Icon name="share-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* CV Image */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.cvImage}
                        resizeMode="contain"
                    />
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <Button
                    title={downloading ? 'Mengunduh...' : 'Download CV'}
                    onPress={handleDownloadPDF}
                    fullWidth
                    size="lg"
                    loading={downloading}
                />
            </View>

            {/* File Name Modal */}
            <Modal
                visible={showNameModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowNameModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nama File</Text>
                        <Text style={styles.modalSubtitle}>
                            Masukkan nama untuk file CV Anda
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            value={pdfName}
                            onChangeText={setPdfName}
                            placeholder="Nama file"
                            placeholderTextColor={colors.textMuted}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowNameModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmButton}
                                onPress={confirmDownload}
                            >
                                <Text style={styles.modalConfirmText}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        flex: 1,
        textAlign: 'center',
    },
    shareButton: {
        padding: spacing.xs,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.md,
    },
    imageContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cvImage: {
        width: '100%',
        aspectRatio: 0.707, // A4 ratio (210/297)
    },
    bottomActions: {
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        color: colors.text,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    modalSubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        marginBottom: spacing.lg,
    },
    modalInput: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        color: colors.text,
        fontSize: fontSize.md,
        marginBottom: spacing.lg,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    modalCancelButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        alignItems: 'center',
    },
    modalCancelText: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    modalConfirmButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    modalConfirmText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CVViewScreen;
