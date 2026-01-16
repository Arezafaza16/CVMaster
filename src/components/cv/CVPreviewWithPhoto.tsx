// Optimized CV Preview Component - With Photo Template
import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { PersonalInfo, Skill, Experience, Education } from '../../types';

interface CVPreviewWithPhotoProps {
    personalInfo: PersonalInfo;
    summary: string;
    skills: Skill[];
    experience: Experience[];
    education: Education[];
    photoUri: string | null;
}

const CVPreviewWithPhoto: React.FC<CVPreviewWithPhotoProps> = memo(({
    personalInfo,
    summary,
    skills,
    experience,
    education,
    photoUri,
}) => {
    return (
        <View style={styles.cvContainer}>
            {/* TOP HEADER - Tan/Beige with Photo Left, Name Right */}
            <View style={styles.cvTopHeader}>
                {/* Photo on Left */}
                <View style={styles.cvHeaderPhoto}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.cvPhoto} />
                    ) : (
                        <View style={styles.cvPhotoEmpty}>
                            <Icon name="person" size={50} color="#d4a373" />
                        </View>
                    )}
                </View>
                {/* Name and Title on Right */}
                <View style={styles.cvHeaderInfo}>
                    <Text style={styles.cvNameBig}>{personalInfo.fullName?.toUpperCase() || 'NAMA LENGKAP'}</Text>
                    <Text style={styles.cvTitleBig}>{personalInfo.profession?.toUpperCase() || 'PROFESIONAL'}</Text>
                </View>
            </View>

            {/* BODY - Two Columns */}
            <View style={styles.cvBody}>
                {/* LEFT SIDEBAR - Tan */}
                <View style={styles.cvSidebar}>
                    {/* CONTACT */}
                    <View style={styles.cvSideSection}>
                        <Text style={styles.cvSideTitle}>CONTACT</Text>
                        <View style={styles.cvContactItem}>
                            <Icon name="call" size={12} color="#000" />
                            <Text style={styles.cvContactLabel}>{personalInfo.phone || '+123-456-7890'}</Text>
                        </View>
                        <View style={styles.cvContactItem}>
                            <Icon name="mail" size={12} color="#000" />
                            <Text style={styles.cvContactLabel}>{personalInfo.email || 'email@example.com'}</Text>
                        </View>
                        <View style={styles.cvContactItem}>
                            <Icon name="location" size={12} color="#000" />
                            <Text style={styles.cvContactLabel}>{personalInfo.address || '123 Street, City'}</Text>
                        </View>
                    </View>

                    {/* EXPERTISE */}
                    <View style={styles.cvSideSection}>
                        <Text style={styles.cvSideTitle}>EXPERTISE</Text>
                        {skills.length > 0 ? skills.map((skill, i) => (
                            <View key={i} style={styles.cvSkillItem}>
                                <View style={styles.cvDot} />
                                <Text style={styles.cvSkillLabel}>{skill.name}</Text>
                            </View>
                        )) : (
                            <>
                                <View style={styles.cvSkillItem}><View style={styles.cvDot} /><Text style={styles.cvSkillLabel}>Graphic Design</Text></View>
                                <View style={styles.cvSkillItem}><View style={styles.cvDot} /><Text style={styles.cvSkillLabel}>Visual Design</Text></View>
                            </>
                        )}
                    </View>
                </View>

                {/* RIGHT MAIN */}
                <View style={styles.cvMain}>
                    {/* PERSONAL INFO */}
                    <View style={styles.cvSection}>
                        <View style={styles.cvSectionHead}>
                            <View style={styles.cvBullet} />
                            <Text style={styles.cvSectionTitle}>PERSONAL INFO</Text>
                        </View>
                        <Text style={styles.cvText}>{summary || 'I am a passionate professional.'}</Text>
                    </View>

                    {/* EDUCATION */}
                    <View style={styles.cvSection}>
                        <View style={styles.cvSectionHead}>
                            <View style={styles.cvBullet} />
                            <Text style={styles.cvSectionTitle}>EDUCATION</Text>
                        </View>
                        {education.length > 0 ? education.map((edu, i) => (
                            <View key={i} style={styles.cvEntry}>
                                <View style={styles.cvEntryHead}>
                                    <View style={styles.cvDotSmall} />
                                    <Text style={styles.cvEntryName}>{edu.degree} in {edu.field}</Text>
                                    <Text style={styles.cvEntryYear}>{edu.startYear}-{edu.endYear}</Text>
                                </View>
                                <Text style={styles.cvEntryDetail}>{edu.institution}</Text>
                            </View>
                        )) : (
                            <View style={styles.cvEntry}>
                                <View style={styles.cvEntryHead}>
                                    <View style={styles.cvDotSmall} />
                                    <Text style={styles.cvEntryName}>Bachelor in Design</Text>
                                    <Text style={styles.cvEntryYear}>2012-2016</Text>
                                </View>
                                <Text style={styles.cvEntryDetail}>University Name</Text>
                            </View>
                        )}
                    </View>

                    {/* EXPERIENCE */}
                    <View style={styles.cvSection}>
                        <View style={styles.cvSectionHead}>
                            <View style={styles.cvBullet} />
                            <Text style={styles.cvSectionTitle}>EXPERIENCE</Text>
                        </View>
                        {experience.length > 0 ? experience.map((exp, i) => (
                            <View key={i} style={styles.cvEntry}>
                                <View style={styles.cvEntryHead}>
                                    <View style={styles.cvDotSmall} />
                                    <Text style={styles.cvEntryName}>{exp.position}</Text>
                                    <Text style={styles.cvEntryYear}>{exp.startDate}-{exp.endDate}</Text>
                                </View>
                                <Text style={styles.cvEntryDetail}>{exp.company}</Text>
                                {exp.description && <Text style={styles.cvExpItem}>• {exp.description}</Text>}
                            </View>
                        )) : (
                            <View style={styles.cvEntry}>
                                <View style={styles.cvEntryHead}>
                                    <View style={styles.cvDotSmall} />
                                    <Text style={styles.cvEntryName}>Graphic Designer</Text>
                                    <Text style={styles.cvEntryYear}>2020-Present</Text>
                                </View>
                                <Text style={styles.cvEntryDetail}>Company Name</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    cvContainer: {
        backgroundColor: '#ffffff',
        width: '100%',
    },
    cvTopHeader: {
        backgroundColor: '#d4a373',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    cvHeaderPhoto: {
        marginRight: 12,
    },
    cvPhoto: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#fff',
    },
    cvPhotoEmpty: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e8c9a8',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    cvHeaderInfo: {
        flex: 1,
    },
    cvNameBig: {
        color: '#3d2b1f',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cvTitleBig: {
        color: '#5d4635',
        fontSize: 11,
        marginTop: 4,
        letterSpacing: 2,
    },
    cvBody: {
        flexDirection: 'row',
    },
    cvSidebar: {
        width: '40%',
        backgroundColor: '#f5e6d3',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    cvSideSection: {
        marginBottom: 12,
    },
    cvSideTitle: {
        color: '#3d2b1f',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#d4a373',
        paddingBottom: 4,
    },
    cvContactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cvContactLabel: {
        color: '#3d2b1f',
        fontSize: 8,
        marginLeft: 6,
        flex: 1,
    },
    cvSkillItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cvDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#3d2b1f',
        marginRight: 6,
    },
    cvSkillLabel: {
        color: '#3d2b1f',
        fontSize: 9,
    },
    cvToolBox: {
        marginBottom: 10,
    },
    cvToolTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    cvToolText: {
        color: '#3d2b1f',
        fontSize: 9,
        flex: 1,
    },
    cvToolPct: {
        color: '#5d4635',
        fontSize: 8,
    },
    cvBarBg: {
        height: 6,
        backgroundColor: '#e8ddd4',
        borderRadius: 3,
        marginLeft: 11,
    },
    cvBarFill: {
        height: '100%',
        backgroundColor: '#d4a373',
        borderRadius: 3,
    },
    cvMain: {
        width: '60%',
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    cvSection: {
        marginBottom: 12,
    },
    cvSectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cvBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d4a373',
        marginRight: 8,
    },
    cvSectionTitle: {
        color: '#3d2b1f',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cvText: {
        color: '#3d2b1f',
        fontSize: 9,
        lineHeight: 14,
        marginLeft: 15000000,
    },
    cvEntry: {
        marginBottom: 10,
    },
    cvEntryHead: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cvDotSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#d4a373',
        marginRight: 6,
    },
    cvEntryName: {
        color: '#3d2b1f',
        fontSize: 10,
        fontWeight: '600',
        flex: 1,
    },
    cvEntryYear: {
        color: '#5d4635',
        fontSize: 8,
    },
    cvEntryDetail: {
        color: '#5d4635',
        fontSize: 9,
        fontStyle: 'italic',
        marginLeft: 12,
    },
    cvExpItem: {
        color: '#3d2b1f',
        fontSize: 8,
        lineHeight: 12,
        marginLeft: 12,
        marginTop: 4,
    },
});

export default CVPreviewWithPhoto;
