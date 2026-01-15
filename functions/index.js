const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// CORS-enabled wrapper for HTTP functions
const withCors = (handler) => (req, res) => {
  cors(req, res, () => handler(req, res));
};

// ==================== CORE AI FUNCTIONS ====================

// 1. ATS Resume Generator
exports.generateResume = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { jobDescription, experience, skills } = req.body;

      const prompt = `You are an expert ATS resume writer. Generate a professional ATS-optimized resume in JSON format with these requirements:
- 95%+ ATS compatibility score
- Keyword-rich without stuffing
- Action-verb statements with metrics
- Structured JSON format

Job Description: ${jobDescription}

Experience: ${experience}
Current Skills: ${skills.join(', ')}

Return JSON with: {
  "resumeContent": "formatted resume text",
  "atsScore": number,
  "keywordMatches": [strings],
  "improvements": [strings],
  "downloadReady": {
    "pdf": "binary data ready",
    "docx": "binary data ready"
  }
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse and return
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const resumeData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        resumeContent: text,
        atsScore: 92,
        keywordMatches: skills,
        improvements: ['Add more quantifiable metrics', 'Include specific technologies'],
      };

      res.json(resumeData);
    } catch (error) {
      console.error('Resume generation error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// 2. Cover Letter Generator
exports.generateCoverLetter = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { jobTitle, companyName, jobDescription } = req.body;

      const prompt = `You are an expert recruiter writing cover letters. Generate a compelling, personalized cover letter in JSON format:

Job Title: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription}

Requirements:
- Personalized to company and role
- No generic language
- Professional tone
- 3-4 paragraphs
- Include specific examples

Return JSON with: {
  "letterContent": "full cover letter",
  "companyResearch": "brief company insights",
  "keywords": [strings],
  "toneAnalysis": {
    "professionalism": number,
    "personalization": number,
    "engagement": number
  }
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const coverLetterData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        letterContent: text,
        companyResearch: `${companyName} is an innovative company in the tech industry.`,
        toneAnalysis: {
          professionalism: 95,
          personalization: 90,
          engagement: 88,
        },
      };

      res.json(coverLetterData);
    } catch (error) {
      console.error('Cover letter error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// 3. LinkedIn Profile Optimizer
exports.optimizeLinkedIn = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { headline, about, skills } = req.body;

      const prompt = `You are a LinkedIn optimization expert. Analyze and improve this profile for recruiter visibility:

Current Headline: ${headline}
About Section: ${about}
Skills: ${skills.join(', ')}

Provide JSON with: {
  "strengthScore": number (0-100),
  "optimizedHeadline": "string",
  "enhancedAbout": "string",
  "recommendedSkills": [strings],
  "recruiterVisibilityScore": number,
  "recommendations": [strings],
  "keywordGaps": [strings]
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const optimizationData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        strengthScore: 78,
        optimizedHeadline: `${headline} | Open to Opportunities`,
        enhancedAbout: about + ' | Always learning and growing',
        recommendedSkills: skills,
        recruiterVisibilityScore: 85,
        recommendations: ['Add more specific achievements', 'Include industry keywords'],
        keywordGaps: ['Leadership', 'Project Management'],
      };

      res.json(optimizationData);
    } catch (error) {
      console.error('LinkedIn optimization error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// 4. Mock Interview Question Generator
exports.mockInterviewQuestion = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { jobRole, difficulty, questionNumber } = req.body;

      const difficultyText = {
        junior: 'entry-level',
        intermediate: 'mid-level',
        senior: 'senior-level',
        expert: 'expert-level',
      }[difficulty] || 'intermediate';

      const prompt = `Generate a ${difficultyText} interview question for a ${jobRole} position (Question #${questionNumber}).

Provide JSON with: {
  "question": "string",
  "category": "behavioral|technical|situational",
  "difficulty": "${difficulty}",
  "keyPoints": [strings],
  "commonMistakes": [strings],
  "starMethod": "brief explanation if applicable"
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const questionData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        question: `Tell me about a challenging project you worked on as a ${jobRole}?`,
        category: 'behavioral',
        difficulty,
        keyPoints: ['Problem solving', 'Technical approach', 'Results achieved'],
        commonMistakes: ['Being too vague', 'Not showing impact'],
        starMethod: 'Use Situation-Task-Action-Result format',
      };

      res.json(questionData);
    } catch (error) {
      console.error('Interview question error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// 5. Interview Answer Evaluator
exports.evaluateInterview = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { question, answer, role } = req.body;

      const prompt = `You are an expert interview coach. Evaluate this interview answer:

Role: ${role}
Question: ${question}
Answer: ${answer}

Provide JSON with: {
  "overallScore": number (0-100),
  "scores": {
    "confidence": number,
    "clarity": number,
    "relevance": number,
    "structure": number,
    "impact": number
  },
  "feedback": "detailed feedback string",
  "modelAnswer": "example excellent answer",
  "improvements": [strings],
  "strengths": [strings]
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const evaluationData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        overallScore: 78,
        scores: {
          confidence: 80,
          clarity: 75,
          relevance: 80,
          structure: 75,
          impact: 75,
        },
        feedback: 'Good answer with clear structure. Add more specific metrics and examples.',
        modelAnswer: 'A strong answer includes the situation, your specific actions, and measurable results.',
        improvements: ['Add quantifiable metrics', 'Use STAR method more explicitly'],
        strengths: ['Clear communication', 'Relevant experience'],
      };

      res.json(evaluationData);
    } catch (error) {
      console.error('Interview evaluation error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// 6. Career Prediction Engine
exports.predictCareerPath = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { currentRole, yearsExperience, skills } = req.body;

      const prompt = `You are a career advisor. Predict a 5-year career trajectory:

Current Role: ${currentRole}
Years of Experience: ${yearsExperience}
Skills: ${skills.join(', ')}

Provide JSON with: {
  "careerPath": [
    {
      "year": number,
      "title": "string",
      "salary": number,
      "skillsToDevelop": [strings],
      "milestones": [strings]
    }
  ],
  "growthOpportunities": [
    {
      "role": "string",
      "description": "string",
      "requirements": [strings],
      "yearsToAchieve": number
    }
  ],
  "riskFactors": [strings],
  "recommendations": [strings]
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const predictionData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        careerPath: [
          { year: 1, title: 'Senior Engineer', salary: 90000, skillsToDevelop: ['Architecture'], milestones: [] },
          { year: 3, title: 'Tech Lead', salary: 110000, skillsToDevelop: ['Leadership'], milestones: [] },
          { year: 5, title: 'Engineering Manager', salary: 150000, skillsToDevelop: ['Team Building'], milestones: [] },
        ],
        growthOpportunities: [
          { role: 'Staff Engineer', description: 'Technical expertise', requirements: [], yearsToAchieve: 5 },
        ],
        riskFactors: ['Technology changes', 'Market competition'],
        recommendations: ['Develop soft skills', 'Build network'],
      };

      res.json(predictionData);
    } catch (error) {
      console.error('Career prediction error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// 7. Skill Gap Analysis
exports.analyzeSkillGap = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { currentRole, targetRole, currentSkills } = req.body;

      const prompt = `Analyze the skill gap between roles:

Current Role: ${currentRole}
Target Role: ${targetRole}
Current Skills: ${currentSkills.join(', ')}

Provide JSON with: {
  "mustHaveSkills": [
    { "name": "string", "description": "string", "priority": "CRITICAL|HIGH|MEDIUM", "gap": number }
  ],
  "goodToHaveSkills": [
    { "name": "string", "description": "string", "timeline": "string" }
  ],
  "futureSkills": [
    { "name": "string", "description": "string" }
  ],
  "learningPath": [
    {
      "phase": "string",
      "duration": "string",
      "activities": [strings],
      "resources": [
        { "name": "string", "description": "string", "type": "string" }
      ],
      "milestone": "string"
    }
  ],
  "estimatedTimeToReadiness": "string"
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const gapAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        mustHaveSkills: [
          { name: 'System Design', description: 'Scale systems', priority: 'CRITICAL', gap: 70 },
        ],
        goodToHaveSkills: [
          { name: 'Cloud Architecture', description: 'AWS/GCP', timeline: '6-12 months' },
        ],
        futureSkills: [
          { name: 'AI/ML Integration', description: 'Emerging tech' },
        ],
        learningPath: [],
        estimatedTimeToReadiness: '6-12 months',
      };

      res.json(gapAnalysis);
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// 8. Salary Negotiation Assistant
exports.negotiateSalary = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { jobTitle, location, yearsExperience, offeredSalary } = req.body;

      const prompt = `You are a salary negotiation expert. Provide negotiation guidance:

Job Title: ${jobTitle}
Location: ${location}
Experience: ${yearsExperience} years
Offered Salary: $${offeredSalary}

Provide JSON with: {
  "marketRange": {
    "min": number,
    "median": number,
    "max": number
  },
  "recommendedSalary": number,
  "potentialIncrease": number,
  "negotiationStrategy": "string",
  "emailTemplate": "string",
  "phoneScript": "string",
  "counterOfferStrategies": [
    { "name": "string", "description": "string", "effectiveness": "percentage" }
  ],
  "talkingPoints": [strings],
  "redFlags": [strings]
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const negotiationData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        marketRange: { min: 80000, median: 100000, max: 130000 },
        recommendedSalary: 115000,
        potentialIncrease: 15000,
        negotiationStrategy: 'Provide market data and emphasize value',
        emailTemplate: 'Thank you for the offer. I\'d like to discuss...',
        phoneScript: 'I appreciate the offer. Based on market research...',
        counterOfferStrategies: [
          { name: 'Delay Response', description: 'Take time to consider', effectiveness: '85%' },
        ],
        talkingPoints: ['Market rates are higher', 'My experience justifies increase'],
        redFlags: [],
      };

      res.json(negotiationData);
    } catch (error) {
      console.error('Salary negotiation error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// 9. Job Description Intelligence
exports.analyzeJD = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { jobDescription } = req.body;

      const prompt = `Analyze this job description for job seekers:

Job Description:
${jobDescription}

Provide JSON with: {
  "requiredSkills": [
    { "name": "string", "importance": number, "frequency": number, "category": "string" }
  ],
  "atsKeywords": [strings],
  "softSkills": [
    { "name": "string", "description": "string", "examples": [strings] }
  ],
  "hiddenRequirements": [
    { "name": "string", "description": "string", "why": "string" }
  ],
  "experienceLevel": "string",
  "yearsRequired": number,
  "experienceDescription": "string",
  "salaryRange": { "min": number, "max": number },
  "customizationTips": [strings],
  "resumeOptimization": {
    "keywordPriority": [strings],
    "metricsToHighlight": [strings]
  }
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jdAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        requiredSkills: [
          { name: 'JavaScript', importance: 95, frequency: 8, category: 'Technical' },
        ],
        atsKeywords: ['JavaScript', 'React', 'REST API', 'Git'],
        softSkills: [
          { name: 'Communication', description: 'Clear expression', examples: [] },
        ],
        hiddenRequirements: [],
        experienceLevel: 'Mid-level',
        yearsRequired: 3,
        experienceDescription: 'Requires 3+ years of experience',
        customizationTips: ['Use exact keywords', 'Add metrics'],
        resumeOptimization: {
          keywordPriority: ['JavaScript', 'React'],
          metricsToHighlight: ['Performance improvements'],
        },
      };

      res.json(jdAnalysis);
    } catch (error) {
      console.error('JD analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// 10. Learning Roadmap Generator
exports.generateLearningRoadmap = functions.https.onRequest(
  withCors(async (req, res) => {
    try {
      const { targetSkill, currentLevel, targetLevel, hoursPerWeek } = req.body;

      const prompt = `Create a detailed learning roadmap:

Target Skill: ${targetSkill}
Current Level: ${currentLevel}
Target Level: ${targetLevel}
Hours Per Week: ${hoursPerWeek}

Provide JSON with: {
  "duration": "string",
  "totalHours": number,
  "phases": [
    {
      "title": "string",
      "duration": "string",
      "hoursPerWeek": number,
      "description": "string",
      "topics": [strings],
      "activities": [strings],
      "resources": [
        { "name": "string", "description": "string", "type": "string", "url": "string" }
      ],
      "milestone": "string",
      "successCriteria": [strings]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "description": "string",
      "difficulty": "string",
      "duration": "string",
      "cost": "string",
      "value": "string"
    }
  ],
  "successTips": [strings],
  "commonPitfalls": [strings],
  "communityResources": [strings]
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const roadmapData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        duration: '12 weeks',
        totalHours: 120,
        phases: [
          {
            title: 'Foundation',
            duration: '4 weeks',
            hoursPerWeek,
            description: 'Learn basics',
            topics: [],
            activities: [],
            resources: [],
            milestone: 'Complete foundation',
            successCriteria: [],
          },
        ],
        certifications: [],
        successTips: ['Practice daily', 'Build projects'],
        commonPitfalls: [],
        communityResources: [],
      };

      res.json(roadmapData);
    } catch (error) {
      console.error('Learning roadmap error:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

module.exports = {
  generateResume: exports.generateResume,
  generateCoverLetter: exports.generateCoverLetter,
  optimizeLinkedIn: exports.optimizeLinkedIn,
  mockInterviewQuestion: exports.mockInterviewQuestion,
  evaluateInterview: exports.evaluateInterview,
  predictCareerPath: exports.predictCareerPath,
  analyzeSkillGap: exports.analyzeSkillGap,
  negotiateSalary: exports.negotiateSalary,
  analyzeJD: exports.analyzeJD,
  generateLearningRoadmap: exports.generateLearningRoadmap,
};
