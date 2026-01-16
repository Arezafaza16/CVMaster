// CV Master - CV Form Screen
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ViewShot from 'react-native-view-shot';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../constants/theme';
import { RootStackParamList, PersonalInfo, Skill, Experience, Education } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { saveCv, uploadCvImage, updateCv, getCvById } from '../../services/firebase';
import { launchImageLibrary } from 'react-native-image-picker';
import Input from '../../components/Input';
import Button from '../../components/Button';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CVFormRouteProp = RouteProp<RootStackParamList, 'CVForm'>;

const CVFormScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<CVFormRouteProp>();
    const { user } = useAuth();
    const viewShotRef = useRef<ViewShot>(null);

    // Check if we're editing an existing CV
    const cvId = route.params?.cvId;
    const isEditMode = !!cvId;

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfFileName, setPdfFileName] = useState('');
    const [savedCvId, setSavedCvId] = useState<string | null>(cvId || null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Form state
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        portfolio: '',
    });

    const [summary, setSummary] = useState('');

    const [skills, setSkills] = useState<Skill[]>([]);
    const [newSkill, setNewSkill] = useState('');

    const [experience, setExperience] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);

    // Photo states
    const [withPhoto, setWithPhoto] = useState<boolean | null>(null);
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    const steps = withPhoto === null ? [
        'Pilih Template',
    ] : withPhoto ? [
        'Upload Foto',
        'Info Pribadi',
        'Skills',
        'Pengalaman',
        'Pendidikan',
        'Preview',
    ] : [
        'Info Pribadi',
        'Skills',
        'Pengalaman',
        'Pendidikan',
        'Preview',
    ];

    const [stepErrors, setStepErrors] = useState<string[]>([]);

    // Load existing CV data when editing
    useEffect(() => {
        const loadCvData = async () => {
            if (!cvId) {
                setInitialLoading(false);
                return;
            }

            try {
                const { data, error } = await getCvById(cvId);
                if (data && !error) {
                    // Populate form with existing data
                    const cvData = data as any;
                    if (cvData.personalInfo) setPersonalInfo(cvData.personalInfo);
                    if (cvData.summary) setSummary(cvData.summary);
                    if (cvData.skills) setSkills(cvData.skills);
                    if (cvData.experience) setExperience(cvData.experience);
                    if (cvData.education) setEducation(cvData.education);
                }
            } catch (error) {
                console.error('Error loading CV:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        loadCvData();
    }, [cvId]);

    // Computed validation state for current step
    const isCurrentStepValid = (): boolean => {
        // Template choice doesn't need validation (handled by buttons)
        if (withPhoto === null) return true;

        // With photo flow
        if (withPhoto) {
            if (currentStep === 0) {
                // Photo upload step - photo is optional, always valid
                return true;
            }
            if (currentStep === 1) {
                // Personal info step
                return !!(personalInfo.fullName.trim() &&
                    personalInfo.email.trim() &&
                    personalInfo.phone.trim() &&
                    personalInfo.address.trim());
            }
        } else {
            // Without photo flow
            if (currentStep === 0) {
                // Personal info step
                return !!(personalInfo.fullName.trim() &&
                    personalInfo.email.trim() &&
                    personalInfo.phone.trim() &&
                    personalInfo.address.trim());
            }
        }
        return true; // Other steps are optional
    };

    // Helper for 4-digit year input
    const handleYearInput = (text: string, callback: (value: string) => void) => {
        // Only allow digits and max 4 characters
        const cleaned = text.replace(/[^0-9]/g, '').substring(0, 4);
        callback(cleaned);
    };

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            setSkills([...skills, { name: newSkill.trim(), level: 'Intermediate' }]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const handleAddExperience = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: '',
        };
        setExperience([...experience, newExp]);
    };

    const handleUpdateExperience = (id: string, field: keyof Experience, value: any) => {
        setExperience(experience.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    const handleRemoveExperience = (id: string) => {
        setExperience(experience.filter(exp => exp.id !== id));
    };

    const handleAddEducation = () => {
        const newEdu: Education = {
            id: Date.now().toString(),
            institution: '',
            degree: '',
            field: '',
            startYear: '',
            endYear: '',
            gpa: '',
        };
        setEducation([...education, newEdu]);
    };

    const handleUpdateEducation = (id: string, field: keyof Education, value: string) => {
        setEducation(education.map(edu =>
            edu.id === id ? { ...edu, [field]: value } : edu
        ));
    };

    const handleRemoveEducation = (id: string) => {
        setEducation(education.filter(edu => edu.id !== id));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Error', 'Silakan login terlebih dahulu');
            return;
        }

        setLoading(true);
        try {
            // 1. Capture preview as PNG
            let base64Image = '';
            if (viewShotRef.current) {
                const uri = await (viewShotRef.current as any).capture();
                // Read file as base64
                base64Image = await ReactNativeBlobUtil.fs.readFile(uri, 'base64');
            }

            // 2. Prepare CV data
            const cvData = {
                personalInfo,
                summary,
                skills,
                experience,
                education,
                title: personalInfo.fullName ? `CV - ${personalInfo.fullName}` : 'Untitled CV',
            };

            let finalCvId: string;

            // 3. Save or Update CV to Firestore
            if (isEditMode && cvId) {
                // Update existing CV
                const { error } = await updateCv(cvId, cvData);
                if (error) {
                    Alert.alert('Error', error);
                    return;
                }
                finalCvId = cvId;
            } else {
                // Create new CV
                const { id, error } = await saveCv(user.uid, cvData);
                if (error || !id) {
                    Alert.alert('Error', error || 'Gagal menyimpan CV');
                    return;
                }
                finalCvId = id;
            }

            // 4. Upload PNG to Firebase Storage (update image for both new and edit)
            if (base64Image) {
                const { url, error: uploadError } = await uploadCvImage(user.uid, finalCvId, base64Image);

                if (!uploadError && url) {
                    // Update CV with image URL
                    await updateCv(finalCvId, { imageUrl: url });
                }
            }

            // 5. Show PDF filename modal
            setSavedCvId(finalCvId);
            setCapturedImage(base64Image);
            setPdfFileName(personalInfo.fullName || 'CV');
            setShowPdfModal(true);

        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Gagal menyimpan CV');
        } finally {
            setLoading(false);
        }
    };

    // Generate HTML for PDF
    const generateCvHtml = () => {
        const skillsList = skills.map(s => s.name).join(', ');
        const experienceHtml = experience.map(exp => `
            <div style="margin-bottom: 10px;">
                <strong>${exp.position}</strong> - ${exp.company}<br/>
                <span style="color: #666; font-size: 12px;">${exp.startDate} - ${exp.endDate}</span>
                ${exp.description ? `<p style="margin: 5px 0;">${exp.description}</p>` : ''}
            </div>
        `).join('');
        const educationHtml = education.map(edu => `
            <div style="margin-bottom: 10px;">
                <strong>${edu.degree}</strong> - ${edu.field}<br/>
                <span>${edu.institution}</span><br/>
                <span style="color: #666; font-size: 12px;">${edu.startYear} - ${edu.endYear}</span>
            </div>
        `).join('');

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
                <h1>${personalInfo.fullName || 'Nama Lengkap'}</h1>
                <div class="contact">
                    ${personalInfo.email} | ${personalInfo.phone}<br/>
                    ${personalInfo.address}
                    ${personalInfo.linkedin ? `<br/>LinkedIn: ${personalInfo.linkedin}` : ''}
                </div>

                ${summary ? `
                <div class="section">
                    <div class="section-title">Ringkasan Profesional</div>
                    <p>${summary}</p>
                </div>
                ` : ''}

                ${skills.length > 0 ? `
                <div class="section">
                    <div class="section-title">Keahlian</div>
                    <p>${skillsList}</p>
                </div>
                ` : ''}

                ${experience.length > 0 ? `
                <div class="section">
                    <div class="section-title">Pengalaman Kerja</div>
                    ${experienceHtml}
                </div>
                ` : ''}

                ${education.length > 0 ? `
                <div class="section">
                    <div class="section-title">Pendidikan</div>
                    ${educationHtml}
                </div>
                ` : ''}
            </body>
            </html>
        `;
    };

    const handleSavePdf = async () => {
        if (!pdfFileName.trim()) {
            Alert.alert('Error', 'Nama file tidak boleh kosong');
            return;
        }

        try {
            const html = generateCvHtml();

            const options = {
                html,
                fileName: pdfFileName.trim(),
                directory: 'Download',
            };

            const file = await generatePDF(options);
            console.log('PDF created at:', file.filePath);

            setShowPdfModal(false);
            Alert.alert(
                'Sukses',
                `CV berhasil disimpan!\\n\\nFile tersimpan sebagai ${pdfFileName.trim()}.pdf di folder Download`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('PDF save error:', error);
            Alert.alert('Error', 'Gagal menyimpan file PDF');
        }
    };

    const handleSkipPdf = () => {
        setShowPdfModal(false);
        Alert.alert('Sukses', 'CV berhasil disimpan!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    const renderPersonalInfo = () => (
        <View>
            <Input
                label="Nama Lengkap *"
                placeholder="Masukkan nama lengkap"
                value={personalInfo.fullName}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, fullName: text })}
                leftIcon="person-outline"
            />
            <Input
                label="Profesi *"
                placeholder="Posisi yang ingin Anda lamar, contoh: Desain Grafis"
                value={personalInfo.profession || ''}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, profession: text })}
                leftIcon="briefcase-outline"
            />
            <Input
                label="Email *"
                placeholder="email@example.com"
                value={personalInfo.email}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
            />
            <Input
                label="Nomor Telepon *"
                placeholder="+62 812 3456 7890"
                value={personalInfo.phone}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, phone: text })}
                keyboardType="phone-pad"
                leftIcon="call-outline"
            />
            <Input
                label="Alamat *"
                placeholder="Kota, Negara"
                value={personalInfo.address}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, address: text })}
                leftIcon="location-outline"
            />
            <Input
                label="LinkedIn (opsional)"
                placeholder="linkedin.com/in/username"
                value={personalInfo.linkedin || ''}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, linkedin: text })}
                autoCapitalize="none"
                leftIcon="logo-linkedin"
            />
            <Input
                label="Portfolio (opsional)"
                placeholder="portfolio.com"
                value={personalInfo.portfolio || ''}
                onChangeText={(text) => setPersonalInfo({ ...personalInfo, portfolio: text })}
                autoCapitalize="none"
                leftIcon="globe-outline"
            />
            <Input
                label="Ringkasan Profesional"
                placeholder="Deskripsikan diri Anda secara singkat..."
                value={summary}
                onChangeText={setSummary}
                multiline
                numberOfLines={4}
                maxLength={500}
            />
        </View>
    );

    const renderSkills = () => (
        <View>
            <Text style={styles.sectionDescription}>
                Tambahkan skill yang relevan dengan posisi yang Anda incar
            </Text>

            <View style={styles.addSkillRow}>
                <View style={{ flex: 1 }}>
                    <Input
                        placeholder="Tambah skill baru..."
                        value={newSkill}
                        onChangeText={setNewSkill}
                        containerStyle={{ marginBottom: 0 }}
                    />
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddSkill}>
                    <Icon name="add" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.skillsContainer}>
                {skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill.name}</Text>
                        <TouchableOpacity onPress={() => handleRemoveSkill(index)}>
                            <Icon name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {skills.length === 0 && (
                <Text style={styles.emptyText}>Belum ada skill ditambahkan</Text>
            )}
        </View>
    );

    const renderExperience = () => (
        <View>
            <Text style={styles.sectionDescription}>
                Tambahkan pengalaman kerja Anda
            </Text>

            {experience.map((exp, index) => (
                <View key={exp.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>Pengalaman #{index + 1}</Text>
                        <TouchableOpacity onPress={() => handleRemoveExperience(exp.id)}>
                            <Icon name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                    <Input
                        label="Perusahaan"
                        placeholder="Nama perusahaan"
                        value={exp.company}
                        onChangeText={(text) => handleUpdateExperience(exp.id, 'company', text)}
                    />
                    <Input
                        label="Posisi"
                        placeholder="Jabatan Anda"
                        value={exp.position}
                        onChangeText={(text) => handleUpdateExperience(exp.id, 'position', text)}
                    />
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Mulai (Tahun)"
                                placeholder="2020"
                                value={exp.startDate}
                                onChangeText={(text) => handleYearInput(text, (val) => handleUpdateExperience(exp.id, 'startDate', val))}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Selesai (Tahun)"
                                placeholder="2023"
                                value={exp.endDate}
                                onChangeText={(text) => handleYearInput(text, (val) => handleUpdateExperience(exp.id, 'endDate', val))}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                        </View>
                    </View>
                    <Input
                        label="Deskripsi"
                        placeholder="Jelaskan tanggung jawab dan pencapaian..."
                        value={exp.description}
                        onChangeText={(text) => handleUpdateExperience(exp.id, 'description', text)}
                        multiline
                        numberOfLines={3}
                    />
                </View>
            ))}

            <Button
                title="+ Tambah Pengalaman"
                onPress={handleAddExperience}
                variant="outline"
                fullWidth
            />
        </View>
    );

    const renderEducation = () => (
        <View>
            <Text style={styles.sectionDescription}>
                Tambahkan riwayat pendidikan Anda
            </Text>

            {education.map((edu, index) => (
                <View key={edu.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                        <Text style={styles.entryTitle}>Pendidikan #{index + 1}</Text>
                        <TouchableOpacity onPress={() => handleRemoveEducation(edu.id)}>
                            <Icon name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                    <Input
                        label="Institusi"
                        placeholder="Nama universitas/sekolah"
                        value={edu.institution}
                        onChangeText={(text) => handleUpdateEducation(edu.id, 'institution', text)}
                    />
                    <Input
                        label="Gelar"
                        placeholder="S1, D3, SMA, dll"
                        value={edu.degree}
                        onChangeText={(text) => handleUpdateEducation(edu.id, 'degree', text)}
                    />
                    <Input
                        label="Jurusan"
                        placeholder="Teknik Informatika"
                        value={edu.field}
                        onChangeText={(text) => handleUpdateEducation(edu.id, 'field', text)}
                    />
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Tahun Mulai"
                                placeholder="2015"
                                value={edu.startYear}
                                onChangeText={(text) => handleYearInput(text, (val) => handleUpdateEducation(edu.id, 'startYear', val))}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="Tahun Lulus"
                                placeholder="2019"
                                value={edu.endYear}
                                onChangeText={(text) => handleYearInput(text, (val) => handleUpdateEducation(edu.id, 'endYear', val))}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                        </View>
                    </View>
                    <Input
                        label="IPK (opsional)"
                        placeholder="3.75"
                        value={edu.gpa || ''}
                        onChangeText={(text) => handleUpdateEducation(edu.id, 'gpa', text)}
                        keyboardType="numeric"
                    />
                </View>
            ))}

            <Button
                title="+ Tambah Pendidikan"
                onPress={handleAddEducation}
                variant="outline"
                fullWidth
            />
        </View>
    );

    const renderPreview = () => {
        // Template WITH Photo - Warm colorful design
        if (withPhoto) {
            return (
                <View style={styles.previewContainer}>
                    <Text style={styles.previewTitle}>Preview CV</Text>

                    <ViewShot
                        ref={viewShotRef}
                        options={{ format: 'png', quality: 1.0 }}
                        style={styles.viewShotContainer}
                    >
                        <View style={styles.cvWrap}>
                            {/* LEFT SIDEBAR - 35% */}
                            <View style={styles.cvLeftSide}>
                                {/* Dark Brown Strip */}
                                <View style={styles.cvDarkStrip} />

                                {/* Terracotta Header with Photo */}
                                <View style={styles.cvPhotoHeader}>
                                    <View style={styles.cvPhotoCircle}>
                                        {photoUri ? (
                                            <Image source={{ uri: photoUri }} style={styles.cvPhotoImg} />
                                        ) : (
                                            <View style={styles.cvPhotoPlaceholder}>
                                                <Icon name="person" size={60} color="#C18F76" />
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Sidebar Content */}
                                <View style={styles.cvSideContent}>
                                    {/* CONTACT */}
                                    <View style={styles.cvSideBlock}>
                                        <Text style={styles.cvSideHeading}>CONTACT</Text>
                                        <View style={styles.cvContactRow}>
                                            <View style={styles.cvIconCircle}>
                                                <Icon name="call" size={10} color="#fff" />
                                            </View>
                                            <Text style={styles.cvContactText}>{personalInfo.phone || '+123-456-7890'}</Text>
                                        </View>
                                        <View style={styles.cvContactRow}>
                                            <View style={styles.cvIconCircle}>
                                                <Icon name="mail" size={10} color="#fff" />
                                            </View>
                                            <Text style={styles.cvContactText}>{personalInfo.email || 'hello@reallygreatsite.com'}</Text>
                                        </View>
                                        <View style={styles.cvContactRow}>
                                            <View style={styles.cvIconCircle}>
                                                <Icon name="location" size={10} color="#fff" />
                                            </View>
                                            <Text style={styles.cvContactText}>{personalInfo.address || '123 Anywhere St., Any City'}</Text>
                                        </View>
                                    </View>

                                    {/* SKILLS */}
                                    <View style={styles.cvSideBlock}>
                                        <Text style={styles.cvSideHeading}>SKILLS</Text>
                                        {skills.length > 0 ? skills.map((skill, i) => (
                                            <View key={i} style={styles.cvSkillRow}>
                                                <Text style={styles.cvBulletChar}>•</Text>
                                                <Text style={styles.cvSkillText}>{skill.name}</Text>
                                            </View>
                                        )) : (
                                            <>
                                                <View style={styles.cvSkillRow}><Text style={styles.cvBulletChar}>•</Text><Text style={styles.cvSkillText}>Graphic Design</Text></View>
                                                <View style={styles.cvSkillRow}><Text style={styles.cvBulletChar}>•</Text><Text style={styles.cvSkillText}>Visual Design</Text></View>
                                                <View style={styles.cvSkillRow}><Text style={styles.cvBulletChar}>•</Text><Text style={styles.cvSkillText}>Branding Design</Text></View>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* RIGHT MAIN CONTENT - 65% */}
                            <View style={styles.cvRightSide}>
                                {/* Header with Name & Title */}
                                <View style={styles.cvNameHeader}>
                                    <Text style={styles.cvMainName}>{personalInfo.fullName?.toUpperCase() || 'RADHIKA KUMARI'}</Text>
                                    <Text style={styles.cvMainTitle}>{personalInfo.profession?.toUpperCase() || 'GRAPHIC DESIGNER'}</Text>
                                </View>

                                {/* PERSONAL INFO */}
                                <View style={styles.cvMainSection}>
                                    <Text style={styles.cvMainHeading}>PERSONAL INFO</Text>
                                    <Text style={styles.cvMainPara}>{summary || 'I am a passionate Graphic & Branding Designer having expertise of 5+ years. I work closely with my clients in developing strong brand identities.'}</Text>
                                </View>

                                {/* EDUCATION */}
                                <View style={styles.cvMainSection}>
                                    <Text style={styles.cvMainHeading}>EDUCATION</Text>
                                    {education.length > 0 ? education.map((edu, i) => (
                                        <View key={i} style={styles.cvMainEntry}>
                                            <View style={styles.cvEntryRow}>
                                                <Icon name="arrow-forward-circle" size={14} color="#3E2723" />
                                                <View style={styles.cvEntryInfo}>
                                                    <View style={styles.cvEntryTitleRow}>
                                                        <Text style={styles.cvEntryTitle}>{edu.degree} in {edu.field}</Text>
                                                        <Text style={styles.cvEntryDate}>{edu.startYear}-{edu.endYear}</Text>
                                                    </View>
                                                    <Text style={styles.cvEntrySubtitle}>{edu.institution}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )) : (
                                        <View style={styles.cvMainEntry}>
                                            <View style={styles.cvEntryRow}>
                                                <Icon name="arrow-forward-circle" size={14} color="#3E2723" />
                                                <View style={styles.cvEntryInfo}>
                                                    <View style={styles.cvEntryTitleRow}>
                                                        <Text style={styles.cvEntryTitle}>Advance Diploma in Graphic Design</Text>
                                                        <Text style={styles.cvEntryDate}>2015-2017</Text>
                                                    </View>
                                                    <Text style={styles.cvEntrySubtitle}>University Name</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* EXPERIENCE */}
                                <View style={styles.cvMainSection}>
                                    <Text style={styles.cvMainHeading}>EXPERIENCE</Text>
                                    {experience.length > 0 ? experience.map((exp, i) => (
                                        <View key={i} style={styles.cvMainEntry}>
                                            <View style={styles.cvEntryRow}>
                                                <Icon name="arrow-forward-circle" size={14} color="#3E2723" />
                                                <View style={styles.cvEntryInfo}>
                                                    <View style={styles.cvEntryTitleRow}>
                                                        <Text style={styles.cvEntryTitle}>{exp.position}</Text>
                                                        <Text style={styles.cvEntryDate}>{exp.startDate}-{exp.endDate || 'Present'}</Text>
                                                    </View>
                                                    <Text style={styles.cvEntrySubtitle}>{exp.company}</Text>
                                                    {exp.description && (
                                                        <View style={styles.cvExpBullets}>
                                                            <Text style={styles.cvExpBullet}>â€¢ {exp.description}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    )) : (
                                        <View style={styles.cvMainEntry}>
                                            <View style={styles.cvEntryRow}>
                                                <Icon name="arrow-forward-circle" size={14} color="#3E2723" />
                                                <View style={styles.cvEntryInfo}>
                                                    <View style={styles.cvEntryTitleRow}>
                                                        <Text style={styles.cvEntryTitle}>Social Media Manager</Text>
                                                        <Text style={styles.cvEntryDate}>2020-Present</Text>
                                                    </View>
                                                    <Text style={styles.cvEntrySubtitle}>Studio Shodwe</Text>
                                                    <View style={styles.cvExpBullets}>
                                                        <Text style={styles.cvExpBullet}>â€¢ Led a team of 3 designers to develop digital media resources.</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>


                            </View>
                        </View>
                    </ViewShot>
                </View>
            );
        }

        // Template WITHOUT Photo - Professional Navy Blue design
        return (
            <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Preview CV</Text>

                <ViewShot
                    ref={viewShotRef}
                    options={{ format: 'png', quality: 1.0 }}
                    style={styles.viewShotContainer}
                >
                    <View style={styles.cvTemplateNoPhoto}>
                        {/* Navy Header */}
                        <View style={styles.cvHeaderNavy}>
                            <Text style={styles.cvNameNavy}>{personalInfo.fullName?.toUpperCase() || 'NAMA LENGKAP'}</Text>
                            <View style={styles.cvHeaderLine} />
                            <Text style={styles.cvSubtitleNavy}>{personalInfo.profession?.toUpperCase() || 'PROFESIONAL'}</Text>
                        </View>

                        <View style={styles.cvBodyTwoColumn}>
                            {/* Left Column */}
                            <View style={styles.cvLeftColumn}>
                                <View style={styles.cvSectionNavy}>
                                    <Text style={styles.cvSectionTitleNavy}>KONTAK</Text>
                                    <Text style={styles.cvContactNavy}>📱 {personalInfo.phone}</Text>
                                    <Text style={styles.cvContactNavy}>📧 {personalInfo.email}</Text>
                                    <Text style={styles.cvContactNavy}>📍 {personalInfo.address}</Text>
                                </View>

                                {education.length > 0 && (
                                    <View style={styles.cvSectionNavy}>
                                        <Text style={styles.cvSectionTitleNavy}>PENDIDIKAN</Text>
                                        {education.map((edu, i) => (
                                            <View key={i} style={{ marginBottom: 8 }}>
                                                <Text style={styles.cvEduDegreeNavy}>{edu.degree}</Text>
                                                <Text style={styles.cvEduSchoolNavy}>{edu.institution}</Text>
                                                <Text style={styles.cvEduYearNavy}>{edu.startYear} - {edu.endYear}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {skills.length > 0 && (
                                    <View style={styles.cvSectionNavy}>
                                        <Text style={styles.cvSectionTitleNavy}>KEAHLIAN</Text>
                                        {skills.map((skill, i) => (
                                            <Text key={i} style={styles.cvSkillNavy}>{skill.name}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Right Column */}
                            <View style={styles.cvRightColumn}>
                                {summary && (
                                    <View style={styles.cvSectionNavy}>
                                        <Text style={styles.cvSectionTitleNavyDark}>PROFIL</Text>
                                        <Text style={styles.cvProfileText}>{summary}</Text>
                                    </View>
                                )}

                                {experience.length > 0 && (
                                    <View style={styles.cvSectionNavy}>
                                        <Text style={styles.cvSectionTitleNavyDark}>PENGALAMAN KERJA</Text>
                                        {experience.map((exp, i) => (
                                            <View key={i} style={{ marginBottom: 10 }}>
                                                <Text style={styles.cvExpTitleNavy}>{exp.position}</Text>
                                                <Text style={styles.cvExpCompanyNavy}>{exp.company} | {exp.startDate} - {exp.endDate}</Text>
                                                {exp.description && (
                                                    <Text style={styles.cvExpDescNavy}>{exp.description}</Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </ViewShot>
            </View>
        );
    };

    // Template choice screen
    const renderTemplateChoice = () => (
        <View style={styles.templateChoiceContainer}>
            <Text style={styles.templateChoiceTitle}>Pilih Template CV</Text>
            <Text style={styles.templateChoiceSubtitle}>
                Apakah Anda ingin menambahkan foto ke CV?
            </Text>

            <TouchableOpacity
                style={styles.templateOption}
                onPress={() => {
                    setWithPhoto(true);
                    setCurrentStep(0);
                }}
            >
                <View style={styles.templateIconContainer}>
                    <Icon name="person-circle" size={48} color={colors.primary} />
                </View>
                <View style={styles.templateOptionContent}>
                    <Text style={styles.templateOptionTitle}>Dengan Foto</Text>
                    <Text style={styles.templateOptionDesc}>
                        Template profesional dengan foto profil di bagian header
                    </Text>
                </View>
                <Icon name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.templateOption}
                onPress={() => {
                    setWithPhoto(false);
                    setCurrentStep(0);
                }}
            >
                <View style={styles.templateIconContainer}>
                    <Icon name="document-text" size={48} color={colors.secondary} />
                </View>
                <View style={styles.templateOptionContent}>
                    <Text style={styles.templateOptionTitle}>Tanpa Foto</Text>
                    <Text style={styles.templateOptionDesc}>
                        Template minimalis dan profesional tanpa foto
                    </Text>
                </View>
                <Icon name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>
        </View>
    );

    // Photo upload screen
    const handleSelectPhoto = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 500,
            maxHeight: 500,
        });

        if (result.assets && result.assets[0]?.uri) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const renderPhotoUpload = () => (
        <View style={styles.photoUploadContainer}>
            <Text style={styles.photoUploadTitle}>Upload Foto Profil</Text>
            <Text style={styles.photoUploadSubtitle}>
                Tambahkan foto profesional untuk CV Anda
            </Text>

            <TouchableOpacity
                style={styles.photoUploadArea}
                onPress={handleSelectPhoto}
            >
                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.uploadedPhoto} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Icon name="camera" size={48} color={colors.textMuted} />
                        <Text style={styles.photoPlaceholderText}>Tap untuk pilih foto</Text>
                    </View>
                )}
            </TouchableOpacity>

            {photoUri && (
                <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={handleSelectPhoto}
                >
                    <Icon name="refresh" size={20} color={colors.primary} />
                    <Text style={styles.changePhotoText}>Ganti Foto</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderStepContent = () => {
        // Template choice screen (before selecting)
        if (withPhoto === null) {
            return renderTemplateChoice();
        }

        // With photo flow
        if (withPhoto) {
            switch (currentStep) {
                case 0: return renderPhotoUpload();
                case 1: return renderPersonalInfo();
                case 2: return renderSkills();
                case 3: return renderExperience();
                case 4: return renderEducation();
                case 5: return renderPreview();
                default: return null;
            }
        }

        // Without photo flow
        switch (currentStep) {
            case 0: return renderPersonalInfo();
            case 1: return renderSkills();
            case 2: return renderExperience();
            case 3: return renderEducation();
            case 4: return renderPreview();
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Icon name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {currentStep === 4 ? 'Preview CV' : 'Buat CV'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Steps */}
            <View style={styles.stepsContainer}>
                {steps.map((step, index) => (
                    <View key={index} style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                index <= currentStep && styles.stepCircleActive,
                            ]}
                        >
                            {index < currentStep ? (
                                <Icon name="checkmark" size={14} color={colors.white} />
                            ) : (
                                <Text style={[
                                    styles.stepNumber,
                                    index <= currentStep && styles.stepNumberActive,
                                ]}>
                                    {index + 1}
                                </Text>
                            )}
                        </View>
                        <Text style={[
                            styles.stepLabel,
                            index === currentStep && styles.stepLabelActive,
                        ]}>
                            {step}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                {renderStepContent()}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                {currentStep < steps.length - 1 ? (
                    <Button
                        title="Lanjut"
                        onPress={handleNext}
                        fullWidth
                        size="lg"
                        disabled={!isCurrentStepValid()}
                    />
                ) : (
                    <Button
                        title="Simpan CV"
                        onPress={handleSave}
                        loading={loading}
                        fullWidth
                        size="lg"
                    />
                )}
            </View>

            {/* PDF Filename Modal */}
            <Modal
                visible={showPdfModal}
                transparent
                animationType="fade"
                onRequestClose={handleSkipPdf}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Simpan CV ke Perangkat</Text>
                        <Text style={styles.modalSubtitle}>
                            Masukkan nama file untuk menyimpan CV Anda
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            value={pdfFileName}
                            onChangeText={setPdfFileName}
                            placeholder="Nama file"
                            placeholderTextColor={colors.textMuted}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={handleSkipPdf}
                            >
                                <Text style={styles.modalCancelText}>Lewati</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalConfirmButton]}
                                onPress={handleSavePdf}
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
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
    },
    stepItem: {
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    stepCircleActive: {
        backgroundColor: colors.primary,
    },
    stepNumber: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    stepNumberActive: {
        color: colors.white,
    },
    stepLabel: {
        color: colors.textMuted,
        fontSize: fontSize.xs,
        textAlign: 'center',
    },
    stepLabelActive: {
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.lg,
    },
    sectionDescription: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        marginBottom: spacing.lg,
    },
    addSkillRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    addButton: {
        backgroundColor: colors.primary,
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    skillTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    skillText: {
        color: colors.text,
        fontSize: fontSize.sm,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: fontSize.md,
        textAlign: 'center',
        marginTop: spacing.lg,
    },
    entryCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    entryTitle: {
        color: colors.text,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    bottomActions: {
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    previewContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    previewTitle: {
        color: colors.black,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    previewSection: {
        marginBottom: spacing.lg,
    },
    previewName: {
        color: colors.black,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        textAlign: 'center',
    },
    previewContact: {
        color: colors.textMuted,
        fontSize: fontSize.sm,
        textAlign: 'center',
    },
    previewSectionTitle: {
        color: colors.black,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: spacing.xs,
        marginBottom: spacing.sm,
    },
    previewText: {
        color: colors.black,
        fontSize: fontSize.sm,
    },
    previewSubtitle: {
        color: colors.black,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    previewDate: {
        color: colors.textMuted,
        fontSize: fontSize.xs,
    },
    viewShotContainer: {
        backgroundColor: colors.white,
    },
    cvTemplate: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        minHeight: 500,
    },
    cvHeader: {
        marginBottom: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
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
    modalButton: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    modalCancelButton: {
        backgroundColor: colors.background,
    },
    modalConfirmButton: {
        backgroundColor: colors.primary,
    },
    modalCancelText: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    modalConfirmText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    // Template Choice Styles
    templateChoiceContainer: {
        padding: spacing.lg,
    },
    templateChoiceTitle: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    templateChoiceSubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    templateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    templateIconContainer: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    templateOptionContent: {
        flex: 1,
    },
    templateOptionTitle: {
        color: colors.text,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.xs,
    },
    templateOptionDesc: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
    },
    // Photo Upload Styles
    photoUploadContainer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    photoUploadTitle: {
        color: colors.text,
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    photoUploadSubtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.md,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    photoUploadArea: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    uploadedPhoto: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
    },
    photoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoPlaceholderText: {
        color: colors.textMuted,
        fontSize: fontSize.sm,
        marginTop: spacing.sm,
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.lg,
        padding: spacing.md,
    },
    changePhotoText: {
        color: colors.primary,
        fontSize: fontSize.md,
        marginLeft: spacing.xs,
    },
    // CV Template WITH Photo Styles
    cvTemplateWithPhoto: {
        backgroundColor: '#fff',
        padding: spacing.md,
    },
    cvHeaderWithPhoto: {
        flexDirection: 'row',
        backgroundColor: '#d4a373',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    photoSection: {
        marginRight: spacing.md,
    },
    cvPhotoOld: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#fff',
    },
    cvPhotoPlaceholder_old: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameSection: {
        flex: 1,
        justifyContent: 'center',
    },
    cvNameWithPhoto: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    cvJobTitle: {
        color: '#fff',
        fontSize: 12,
        marginTop: 4,
    },
    cvBodyOld: {
        paddingHorizontal: spacing.sm,
    },
    cvContactSection: {
        marginBottom: spacing.md,
    },
    cvSectionOld: {
        marginBottom: spacing.md,
    },
    cvSectionTitleWithPhoto: {
        color: '#d4a373',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#d4a373',
        paddingBottom: 4,
    },
    cvContactItemOld: {
        color: '#333',
        fontSize: 11,
        marginBottom: 2,
    },
    cvSkillItemOld: {
        color: '#333',
        fontSize: 11,
        marginBottom: 2,
    },
    cvExperienceItem: {
        marginBottom: 8,
    },
    cvExpTitle: {
        color: '#333',
        fontSize: 12,
        fontWeight: '600',
    },
    cvExpCompany: {
        color: '#666',
        fontSize: 11,
    },
    cvExpDate: {
        color: '#888',
        fontSize: 10,
    },
    cvEducationItem: {
        marginBottom: 6,
    },
    cvEduDegree: {
        color: '#333',
        fontSize: 11,
        fontWeight: '600',
    },
    cvEduSchool: {
        color: '#666',
        fontSize: 10,
    },
    cvEduYear: {
        color: '#888',
        fontSize: 10,
    },
    // CV Template WITHOUT Photo - Navy Blue Styles
    cvTemplateNoPhoto: {
        backgroundColor: '#fff',
    },
    cvHeaderNavy: {
        backgroundColor: '#1E3A5F',
        padding: spacing.md,
        alignItems: 'center',
    },
    cvNameNavy: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'normal',
        letterSpacing: 3,
        textTransform: 'uppercase',
        fontFamily: 'Cinzel_500Medium',
        textAlign: 'center',
    },
    cvSubtitleNavy: {
        color: '#a0aec0',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
        fontFamily: 'Cinzel_400Regular',
    },
    cvBodyTwoColumn: {
        flexDirection: 'row',
        padding: spacing.md,
    },
    cvLeftColumn: {
        width: '35%',
        paddingRight: spacing.md,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    cvRightColumn: {
        width: '65%',
        paddingLeft: spacing.md,
    },
    cvSectionNavy: {
        marginBottom: spacing.md,
    },
    cvSectionTitleNavy: {
        color: '#1E3A5F',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cvSectionTitleNavyDark: {
        color: '#1E3A5F',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#1E3A5F',
        paddingBottom: 4,
    },
    cvContactNavy: {
        color: '#333',
        fontSize: 8,
        marginBottom: 3,
    },
    cvEduDegreeNavy: {
        color: '#333',
        fontSize: 10,
        fontWeight: '600',
    },
    cvEduSchoolNavy: {
        color: '#666',
        fontSize: 9,
    },
    cvEduYearNavy: {
        color: '#888',
        fontSize: 9,
    },
    cvSkillNavy: {
        color: '#333',
        fontSize: 8,
        marginBottom: 2,
        textAlign: 'left',
    },
    cvProfileText: {
        color: '#333',
        fontSize: 8,
        lineHeight: 12,
    },
    cvExpTitleNavy: {
        color: '#333',
        fontSize: 11,
        fontWeight: '600',
    },
    cvExpCompanyNavy: {
        color: '#666',
        fontSize: 10,
    },
    cvExpDescNavy: {
        color: '#555',
        fontSize: 9,
        marginTop: 4,
        lineHeight: 13,
    },
    // Navy Header White Line
    cvHeaderLine: {
        width: '100%',
        height: 2,
        backgroundColor: '#fff',
        marginVertical: 8,
    },
    // With Photo Template - Tan Sidebar Design
    cvHeaderTan: {
        backgroundColor: '#d4a373',
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cvPhotoWrapper: {
        marginRight: spacing.md,
    },
    cvPhotoLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
    },
    cvPhotoPlaceholderLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    cvNameWrapper: {
        flex: 1,
    },
    cvNameTan: {
        color: '#d4a373',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    cvNameUnderline: {
        height: 3,
        backgroundColor: '#d4a373',
        marginVertical: 6,
    },
    cvTitleTan: {
        color: '#fff',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cvBodyWithSidebar: {
        flexDirection: 'row',
    },
    cvSidebarTan: {
        width: '35%',
        backgroundColor: '#fae8d4',
        padding: spacing.md,
    },
    cvSidebarSection: {
        marginBottom: spacing.md,
    },
    cvSidebarTitle: {
        color: '#333',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#d4a373',
        paddingBottom: 4,
    },
    cvSidebarItem: {
        color: '#333',
        fontSize: 9,
        marginBottom: 3,
    },
    cvMainContent: {
        width: '65%',
        backgroundColor: '#fff',
        padding: spacing.md,
    },
    cvMainSection_old: {
        marginBottom: spacing.md,
    },
    cvMainSectionTitle: {
        color: '#333',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#d4a373',
        paddingBottom: 4,
    },
    cvMainText: {
        color: '#333',
        fontSize: 9,
        lineHeight: 13,
    },
    cvMainItem: {
        marginBottom: 8,
    },
    cvMainItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cvMainItemTitle: {
        color: '#333',
        fontSize: 10,
        fontWeight: '600',
        flex: 1,
    },
    cvMainItemDate: {
        color: '#666',
        fontSize: 9,
    },
    cvMainItemSub: {
        color: '#666',
        fontSize: 9,
        fontStyle: 'italic',
    },
    cvMainItemDesc: {
        color: '#555',
        fontSize: 8,
        marginTop: 3,
        lineHeight: 11,
    },
    // NEW TEMPLATE STYLES - With Photo (Beige/Brown Theme)
    cvTwoColumnLayout: {
        flexDirection: 'row',
    },
    cvLeftSidebar: {
        width: '30%',
        backgroundColor: '#E8DDD4',
        padding: spacing.md,
        alignItems: 'center',
    },
    cvPhotoContainer: {
        marginBottom: spacing.md,
    },
    cvPhotoCircle_old: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
    },
    cvPhotoCirclePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#D4C8BE',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    cvSidebarName: {
        color: '#5D4E37',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    cvSidebarJobTitle: {
        color: '#8B7355',
        fontSize: 9,
        textAlign: 'center',
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cvSidebarSectionNew: {
        width: '100%',
        marginBottom: spacing.md,
    },
    cvSidebarSectionTitle: {
        color: '#5D4E37',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cvContactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cvContactText_old: {
        color: '#5D4E37',
        fontSize: 8,
        marginLeft: 6,
        flex: 1,
    },
    cvSkillBullet: {
        color: '#5D4E37',
        fontSize: 9,
        marginBottom: 3,
    },
    cvToolItem: {
        marginBottom: 8,
    },
    cvToolHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    cvToolName_old: {
        color: '#5D4E37',
        fontSize: 8,
    },
    cvToolPercent: {
        color: '#8B7355',
        fontSize: 7,
    },
    cvProgressBar: {
        height: 4,
        backgroundColor: '#D4C8BE',
        borderRadius: 2,
    },
    cvProgressFill: {
        height: '100%',
        backgroundColor: '#8B7355',
        borderRadius: 2,
    },
    cvRightMain: {
        width: '70%',
        backgroundColor: '#FAFAFA',
        padding: spacing.md,
    },
    cvRightSection: {
        marginBottom: spacing.md,
    },
    cvRightSectionTitle: {
        color: '#5D4E37',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        borderBottomWidth: 1,
        borderBottomColor: '#D4C8BE',
        paddingBottom: 4,
    },
    cvProfileParagraph: {
        color: '#333',
        fontSize: 9,
        lineHeight: 14,
        textAlign: 'justify',
    },
    cvTimelineItem: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    cvTimelineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#8B7355',
        marginRight: 8,
        marginTop: 2,
    },
    cvTimelineContent: {
        flex: 1,
    },
    cvTimelineRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cvTimelineTitle: {
        color: '#333',
        fontSize: 10,
        fontWeight: '600',
        flex: 1,
    },
    cvTimelineDate: {
        color: '#8B7355',
        fontSize: 8,
    },
    cvTimelineSub: {
        color: '#666',
        fontSize: 9,
        fontStyle: 'italic',
    },
    cvExpBullets_old: {
        marginTop: 4,
    },
    cvExpBullet_old: {
        color: '#444',
        fontSize: 8,
        lineHeight: 12,
    },
    cvReferenceText: {
        color: '#666',
        fontSize: 9,
        fontStyle: 'italic',
    },
    // === NEW CV WITH PHOTO TEMPLATE STYLES ===
    cvWrap: {
        flexDirection: 'row' as const,
        backgroundColor: '#FAF9F6',
    },
    cvLeftSide: {
        width: '35%',
        backgroundColor: '#FAF9F6',
        position: 'relative' as const,
    },
    cvDarkStrip: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        bottom: 0,
        width: 12,
        backgroundColor: '#3E2723',
    },
    cvPhotoHeader: {
        backgroundColor: '#C18F76',
        paddingVertical: 20,
        paddingHorizontal: 16,
        paddingLeft: 24,
        alignItems: 'center' as const,
    },
    cvPhotoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#fff',
        overflow: 'hidden' as const,
    },
    cvPhotoImg: {
        width: '100%',
        height: '100%',
    },
    cvPhotoPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e8c9a8',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    cvSideContent: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        paddingLeft: 20,
    },
    cvSideBlock: {
        marginBottom: 16,
    },
    cvSideHeading: {
        color: '#3E2723',
        fontSize: 12,
        fontWeight: 'bold' as const,
        letterSpacing: 2,
        marginBottom: 10,
        textTransform: 'uppercase' as const,
    },
    cvContactRow_old: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: 6,
    },
    cvIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#3E2723',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginRight: 8,
    },
    cvContactText: {
        color: '#333',
        fontSize: 8,
        flex: 1,
    },
    cvSkillRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: 4,
    },
    cvBulletChar: {
        color: '#3E2723',
        fontSize: 12,
        marginRight: 6,
    },
    cvSkillText: {
        color: '#333',
        fontSize: 9,
    },
    cvToolRow: {
        marginBottom: 8,
    },
    cvToolInfo: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        marginBottom: 3,
    },
    cvToolName: {
        color: '#333',
        fontSize: 8,
    },
    cvToolPct: {
        color: '#333',
        fontSize: 8,
        fontWeight: 'bold' as const,
    },
    cvToolBarBg: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
    },
    cvToolBarFill: {
        height: '100%',
        backgroundColor: '#C18F76',
        borderRadius: 3,
    },
    cvRightSide: {
        width: '65%',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    cvNameHeader: {
        borderBottomWidth: 3,
        borderBottomColor: '#3E2723',
        paddingBottom: 12,
        marginBottom: 12,
    },
    cvMainName: {
        color: '#78350F',
        fontSize: 20,
        fontWeight: 'bold' as const,
        letterSpacing: 3,
        fontFamily: 'serif',
    },
    cvMainTitle: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold' as const,
        letterSpacing: 3,
        marginTop: 4,
    },
    cvMainSection: {
        marginBottom: 12,
    },
    cvMainHeading: {
        color: '#000',
        fontSize: 11,
        fontWeight: 'bold' as const,
        letterSpacing: 2,
        marginBottom: 8,
        textTransform: 'uppercase' as const,
    },
    cvMainPara: {
        color: '#444',
        fontSize: 8,
        lineHeight: 12,
        textAlign: 'justify' as const,
    },
    cvMainEntry: {
        marginBottom: 10,
    },
    cvEntryRow: {
        flexDirection: 'row' as const,
        alignItems: 'flex-start' as const,
    },
    cvEntryInfo: {
        flex: 1,
        marginLeft: 8,
    },
    cvEntryTitleRow: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'baseline' as const,
    },
    cvEntryTitle: {
        color: '#333',
        fontSize: 9,
        fontWeight: 'bold' as const,
        flex: 1,
    },
    cvEntryDate: {
        color: '#666',
        fontSize: 8,
        fontWeight: '600' as const,
    },
    cvEntrySubtitle: {
        color: '#666',
        fontSize: 8,
        fontStyle: 'italic' as const,
        marginTop: 2,
    },
    cvExpBullets: {
        marginTop: 4,
        marginLeft: 4,
    },
    cvExpBullet: {
        color: '#555',
        fontSize: 7,
        lineHeight: 10,
        marginBottom: 2,
    },
    cvRefText: {
        color: '#555',
        fontSize: 8,
    },
});

export default CVFormScreen;

