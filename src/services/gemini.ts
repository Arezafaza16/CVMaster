// CV Master - Google Gemini AI Service
import { CVScore, CVScoreBreakdown, JobMatch } from '../types';

// Gemini API configuration
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{ text: string }>;
        };
    }>;
}

// Helper to call Gemini API
const callGemini = async (prompt: string): Promise<string> => {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
};

// Parse JSON from Gemini response (handles markdown code blocks)
const parseJsonResponse = <T>(text: string): T => {
    // Remove markdown code blocks if present
    let cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    return JSON.parse(cleanText);
};

// Score a CV for ATS compatibility
export const scoreCv = async (cvText: string): Promise<CVScore> => {
    const prompt = `
Analyze the following CV/Resume for ATS (Applicant Tracking System) compatibility.
Provide a detailed score breakdown and suggestions for improvement.

CV Content:
${cvText}

Respond ONLY with a valid JSON object in this exact format (no additional text):
{
  "overallScore": <number 0-100>,
  "breakdown": {
    "formatStructure": <number 0-100>,
    "keywordsSkills": <number 0-100>,
    "experienceDescription": <number 0-100>,
    "education": <number 0-100>,
    "contactInfo": <number 0-100>
  },
  "suggestions": [
    "<specific improvement suggestion 1>",
    "<specific improvement suggestion 2>",
    "<specific improvement suggestion 3>",
    "<specific improvement suggestion 4>",
    "<specific improvement suggestion 5>"
  ],
  "atsCompatibility": "<Low|Medium|High>"
}

Scoring criteria:
- formatStructure (20%): Clean layout, proper sections, readable fonts, no complex formatting
- keywordsSkills (25%): Relevant industry keywords, technical skills listed clearly
- experienceDescription (25%): Action verbs, quantified achievements, relevant details
- education (15%): Proper degree listing, institution names, graduation dates
- contactInfo (15%): Complete contact details (email, phone, location)

Calculate overallScore as weighted average of breakdown scores.
`;

    try {
        const response = await callGemini(prompt);
        const score = parseJsonResponse<CVScore>(response);
        return score;
    } catch (error) {
        console.error('Error scoring CV:', error);
        // Return default low score on error
        return {
            overallScore: 0,
            breakdown: {
                formatStructure: 0,
                keywordsSkills: 0,
                experienceDescription: 0,
                education: 0,
                contactInfo: 0,
            },
            suggestions: ['Unable to analyze CV. Please try again.'],
            atsCompatibility: 'Low',
        };
    }
};

// Improve CV based on low scores (Premium feature)
export const improveCv = async (cvText: string, score: CVScore): Promise<string> => {
    const lowScoreAreas = Object.entries(score.breakdown)
        .filter(([_, value]) => value < 70)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

    const prompt = `
You are a professional CV/Resume writer. Improve the following CV focusing on these low-scoring areas: ${lowScoreAreas}

Current Suggestions from analysis:
${score.suggestions.join('\n')}

Original CV:
${cvText}

Provide an improved version of the CV that:
1. Maintains the original information but enhances presentation
2. Uses strong action verbs
3. Quantifies achievements where possible
4. Optimizes for ATS with relevant keywords
5. Improves formatting and structure

Respond with the improved CV text only, no additional commentary.
`;

    try {
        const improvedCv = await callGemini(prompt);
        return improvedCv;
    } catch (error) {
        console.error('Error improving CV:', error);
        throw new Error('Gagal memperbaiki CV. Silakan coba lagi.');
    }
};

// Match CV with job requirements (Premium feature)
export const matchJob = async (cvText: string, jobRequirement: string): Promise<JobMatch> => {
    const prompt = `
Compare the following CV with the job requirements and provide a match analysis.

CV Content:
${cvText}

Job Requirements:
${jobRequirement}

Respond ONLY with a valid JSON object in this exact format (no additional text):
{
  "matchScore": <number 0-100>,
  "matchingSkills": [
    "<skill that matches job requirement 1>",
    "<skill that matches job requirement 2>"
  ],
  "missingSkills": [
    "<required skill not found in CV 1>",
    "<required skill not found in CV 2>"
  ],
  "recommendations": [
    "<specific recommendation to improve match 1>",
    "<specific recommendation to improve match 2>",
    "<specific recommendation to improve match 3>"
  ]
}

Consider:
- Technical skills match
- Experience level requirements
- Education requirements
- Soft skills mentioned
- Industry-specific keywords
`;

    try {
        const response = await callGemini(prompt);
        const match = parseJsonResponse<JobMatch>(response);
        return match;
    } catch (error) {
        console.error('Error matching job:', error);
        return {
            matchScore: 0,
            matchingSkills: [],
            missingSkills: [],
            recommendations: ['Gagal menganalisis kecocokan. Silakan coba lagi.'],
        };
    }
};

// Generate CV content from form data
export const generateCvContent = async (formData: any): Promise<string> => {
    const prompt = `
Create a professional CV/Resume content based on the following information:

Personal Information:
- Name: ${formData.personalInfo.fullName}
- Email: ${formData.personalInfo.email}
- Phone: ${formData.personalInfo.phone}
- Address: ${formData.personalInfo.address}
${formData.personalInfo.linkedin ? `- LinkedIn: ${formData.personalInfo.linkedin}` : ''}
${formData.personalInfo.portfolio ? `- Portfolio: ${formData.personalInfo.portfolio}` : ''}

Professional Summary:
${formData.summary}

Skills:
${formData.skills.map((s: any) => `- ${s.name} (${s.level})`).join('\n')}

Work Experience:
${formData.experience.map((e: any) =>
        `- ${e.position} at ${e.company} (${e.startDate} - ${e.isCurrent ? 'Present' : e.endDate})\n  ${e.description}`
    ).join('\n')}

Education:
${formData.education.map((e: any) =>
        `- ${e.degree} in ${e.field} from ${e.institution} (${e.startYear} - ${e.endYear})${e.gpa ? ` - GPA: ${e.gpa}` : ''}`
    ).join('\n')}

${formData.certifications.length > 0 ? `Certifications:
${formData.certifications.map((c: any) => `- ${c.name} by ${c.issuer} (${c.year})`).join('\n')}` : ''}

${formData.languages.length > 0 ? `Languages:
${formData.languages.map((l: any) => `- ${l.name} (${l.proficiency})`).join('\n')}` : ''}

Generate a well-formatted, ATS-optimized CV content. Use bullet points for experience and skills.
Focus on action verbs and quantifiable achievements.
`;

    try {
        const cvContent = await callGemini(prompt);
        return cvContent;
    } catch (error) {
        console.error('Error generating CV:', error);
        throw new Error('Gagal membuat CV. Silakan coba lagi.');
    }
};

export default {
    scoreCv,
    improveCv,
    matchJob,
    generateCvContent,
};
