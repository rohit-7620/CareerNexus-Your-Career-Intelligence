import { GoogleGenerativeAI } from '@google/generative-ai';

class CareerTwinService {
  constructor() {
    // Dedicated API key for Career Twin feature
    this.apiKey = 'AIzaSyCu0QIih5YT8M8GsyhiZ2maqjtdii3zbkk';
    this.genAI = null;
    this.model = null;
    this.initializeAPI();
  }

  initializeAPI() {
    try {
      console.log('🔑 Initializing Career Twin API with key:', this.apiKey.substring(0, 10) + '...');
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      console.log('✅ Career Twin API initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Career Twin API:', error.message);
      this.model = null;
    }
  }

  async callGemini(prompt) {
    try {
      if (!this.model) {
        throw new Error('API not initialized');
      }
      console.log('📡 Calling Gemini API for Career Twin...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Career Twin response received');
      return text;
    } catch (error) {
      console.error('❌ Career Twin API error:', error.message);
      throw error;
    }
  }

  async generateCareerTwin(userData) {
    const education = userData?.education || 'Not specified';
    const skills = (userData?.skills || []).join(', ') || 'general skills';
    const experience = userData?.experience || '0-2 years';
    const interests = (userData?.interests || []).join(', ') || 'technology';
    const goals = userData?.goals || 'Career growth and skill development';

    const prompt = `You are an expert AI Career Advisor and Professional Identity Analyst. Create a comprehensive Career Twin analysis for this professional:

=== CANDIDATE PROFILE ===
• Education: ${education}
• Skills: ${skills}
• Experience Level: ${experience}
• Interests: ${interests}
• Career Goals: ${goals}

=== GENERATE COMPREHENSIVE CAREER TWIN ANALYSIS ===

Provide a detailed JSON response with ALL the following sections. Be specific and actionable.

{
  "professionalIdentity": {
    "archetype": "A specific professional archetype (e.g., 'Full-Stack Innovation Leader', 'Data-Driven Product Strategist', 'Cloud Architecture Specialist')",
    "summary": "3-4 sentences describing their professional identity based on their exact skills (${skills}), positioning them uniquely in the market",
    "uniqueValue": "What makes this person unique - their specific combination of skills and potential"
  },
  
  "strengthsAndDifferentiators": {
    "coreStrengths": [
      "Strength 1 - specific to their skills (${skills})",
      "Strength 2 - based on skill combinations",
      "Strength 3 - market positioning strength",
      "Strength 4 - competitive advantage"
    ],
    "competitiveAdvantages": [
      "Advantage 1 - what sets them apart",
      "Advantage 2 - unique positioning",
      "Advantage 3 - market differentiation"
    ],
    "uniqueSkillCombinations": "Description of how their specific skills combine uniquely (reference: ${skills})",
    "strengthScores": {
      "technical": 0-100,
      "softSkills": 0-100,
      "domainExpertise": 0-100,
      "leadership": 0-100,
      "innovation": 0-100,
      "communication": 0-100
    }
  },
  
  "roleSuitability": [
    {
      "rank": 1,
      "role": "Most suitable role title",
      "suitabilityScore": 85-95,
      "salaryRange": "₹X-Y LPA (India) / $X-Y (Global)",
      "demandLevel": "high|medium|low",
      "reasoning": "2-3 sentences explaining WHY this role fits based on their exact skills: ${skills}",
      "keyMatchingSkills": ["skill1", "skill2", "skill3"],
      "alignmentFactors": ["factor1", "factor2", "factor3"],
      "careerPath": "Where this role leads in 3-5 years"
    },
    {
      "rank": 2,
      "role": "Second best role",
      "suitabilityScore": 75-88,
      "salaryRange": "₹X-Y LPA / $X-Y",
      "demandLevel": "high|medium|low",
      "reasoning": "Clear reasoning for this role fit",
      "keyMatchingSkills": ["skill1", "skill2"],
      "alignmentFactors": ["factor1", "factor2"],
      "careerPath": "Future trajectory"
    },
    {
      "rank": 3,
      "role": "Third best role",
      "suitabilityScore": 70-82,
      "salaryRange": "₹X-Y LPA / $X-Y",
      "demandLevel": "high|medium|low",
      "reasoning": "Clear reasoning",
      "keyMatchingSkills": ["skill1", "skill2"],
      "alignmentFactors": ["factor1", "factor2"],
      "careerPath": "Future trajectory"
    },
    {
      "rank": 4,
      "role": "Fourth role option",
      "suitabilityScore": 65-78,
      "salaryRange": "₹X-Y LPA / $X-Y",
      "demandLevel": "high|medium|low",
      "reasoning": "Clear reasoning",
      "keyMatchingSkills": ["skill1", "skill2"],
      "alignmentFactors": ["factor1"],
      "careerPath": "Future trajectory"
    },
    {
      "rank": 5,
      "role": "Fifth role option",
      "suitabilityScore": 60-75,
      "salaryRange": "₹X-Y LPA / $X-Y",
      "demandLevel": "high|medium|low",
      "reasoning": "Clear reasoning",
      "keyMatchingSkills": ["skill1", "skill2"],
      "alignmentFactors": ["factor1"],
      "careerPath": "Future trajectory"
    }
  ],
  
  "growthPotential": {
    "overallScore": 0-100,
    "shortTerm": "Specific 6-12 month growth opportunities based on current skills",
    "midTerm": "2-3 year potential with skill development path",
    "longTerm": "5+ year career ceiling and possibilities",
    "emergingOpportunities": ["opportunity1", "opportunity2", "opportunity3", "opportunity4"],
    "skillsTrending": ["trending skill 1", "trending skill 2", "trending skill 3"],
    "marketDemandForecast": {
      "current": 0-100,
      "sixMonths": 0-100,
      "oneYear": 0-100,
      "twoYears": 0-100,
      "fiveYears": 0-100
    },
    "salaryGrowthPotential": {
      "currentRange": "₹X-Y LPA",
      "potentialIn2Years": "₹X-Y LPA",
      "potentialIn5Years": "₹X-Y LPA"
    }
  },
  
  "riskFactorsAndImprovements": {
    "marketRisks": [
      "Risk 1 - specific market risk for their skill set",
      "Risk 2 - automation/AI displacement risk",
      "Risk 3 - market saturation concern"
    ],
    "skillGaps": [
      "Gap 1 - critical missing skill",
      "Gap 2 - skill that would increase marketability",
      "Gap 3 - emerging tech gap"
    ],
    "improvementAreas": [
      "Area 1 - specific improvement recommendation",
      "Area 2 - skill to develop",
      "Area 3 - soft skill to enhance"
    ],
    "urgentUpskilling": ["Urgent skill 1", "Urgent skill 2", "Urgent skill 3"],
    "riskScores": {
      "automationRisk": 0-100,
      "marketSaturation": 0-100,
      "skillObsolescence": 0-100,
      "competitionLevel": 0-100
    }
  },
  
  "skillProficiency": {
    "technical": 0-100,
    "soft": 0-100,
    "domain": 0-100,
    "leadership": 0-100
  },
  
  "actionPlan": [
    "Immediate action (this week): specific, actionable step",
    "Short-term (1-3 months): skill development focus",
    "Medium-term (6-12 months): career positioning strategy"
  ]
}

IMPORTANT GUIDELINES:
1. Base ALL analysis on their ACTUAL skills: ${skills}
2. Role suitability must have CLEAR reasoning connecting their skills to the role
3. Scores should be realistic and differentiated (not all 80-90)
4. Risk factors should be specific and actionable
5. Use Indian salary ranges (₹ LPA) primarily with global $ ranges

Return ONLY valid JSON, no markdown formatting or code blocks.`;

    try {
      const response = await this.callGemini(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleanedResponse);
      console.log('✅ Career Twin data parsed successfully');
      return data;
    } catch (error) {
      console.error('❌ Failed to parse Career Twin response:', error.message);
      return this.getFallbackData(userData);
    }
  }

  getFallbackData(userData) {
    const skills = userData?.skills || ['General Skills'];
    return {
      professionalIdentity: {
        archetype: "Emerging Tech Professional",
        summary: `Based on your skills in ${skills.slice(0, 3).join(', ')}, you show strong potential as a versatile technology professional. Your combination of skills positions you for roles that require both technical depth and adaptability.`,
        uniqueValue: "Your diverse skill set allows you to bridge multiple domains and deliver integrated solutions."
      },
      strengthsAndDifferentiators: {
        coreStrengths: [
          "Strong foundation in core technologies",
          "Ability to learn and adapt quickly",
          "Cross-functional collaboration skills",
          "Problem-solving mindset"
        ],
        competitiveAdvantages: [
          "Versatile skill combination",
          "Modern tech stack familiarity",
          "Growth-oriented mindset"
        ],
        uniqueSkillCombinations: `Your combination of ${skills.slice(0, 2).join(' and ')} creates unique opportunities in the market.`,
        strengthScores: {
          technical: 70,
          softSkills: 65,
          domainExpertise: 55,
          leadership: 50,
          innovation: 60,
          communication: 65
        }
      },
      roleSuitability: [
        {
          rank: 1,
          role: "Software Developer",
          suitabilityScore: 85,
          salaryRange: "₹8-18 LPA / $70K-$120K",
          demandLevel: "high",
          reasoning: "Your technical skills align well with software development requirements. High market demand ensures job security.",
          keyMatchingSkills: skills.slice(0, 3),
          alignmentFactors: ["Technical skills match", "Market demand", "Growth potential"],
          careerPath: "Senior Developer → Tech Lead → Engineering Manager"
        },
        {
          rank: 2,
          role: "Full Stack Developer",
          suitabilityScore: 78,
          salaryRange: "₹10-22 LPA / $80K-$140K",
          demandLevel: "high",
          reasoning: "Versatile role that leverages your broad skill set across the development stack.",
          keyMatchingSkills: skills.slice(0, 2),
          alignmentFactors: ["Skill versatility", "End-to-end ownership"],
          careerPath: "Senior Full Stack → Principal Engineer → CTO"
        },
        {
          rank: 3,
          role: "DevOps Engineer",
          suitabilityScore: 72,
          salaryRange: "₹12-25 LPA / $90K-$150K",
          demandLevel: "high",
          reasoning: "Growing field with strong demand. Your technical foundation provides a good base.",
          keyMatchingSkills: ["Automation", "Cloud"],
          alignmentFactors: ["High demand", "Good salary growth"],
          careerPath: "Senior DevOps → Platform Engineer → Head of Infrastructure"
        },
        {
          rank: 4,
          role: "Technical Consultant",
          suitabilityScore: 68,
          salaryRange: "₹15-30 LPA / $100K-$180K",
          demandLevel: "medium",
          reasoning: "Combines technical expertise with client-facing skills. Good for experienced professionals.",
          keyMatchingSkills: skills.slice(0, 2),
          alignmentFactors: ["Technical depth", "Communication skills"],
          careerPath: "Senior Consultant → Practice Lead → Partner"
        },
        {
          rank: 5,
          role: "Product Engineer",
          suitabilityScore: 65,
          salaryRange: "₹10-20 LPA / $75K-$130K",
          demandLevel: "medium",
          reasoning: "Combines development with product thinking. Good for those interested in product ownership.",
          keyMatchingSkills: skills.slice(0, 2),
          alignmentFactors: ["Product mindset", "Technical skills"],
          careerPath: "Senior Product Engineer → Product Manager → Director of Product"
        }
      ],
      growthPotential: {
        overallScore: 72,
        shortTerm: "Focus on deepening expertise in your strongest skills and building a portfolio of projects.",
        midTerm: "Transition to senior roles with leadership responsibilities and specialized expertise.",
        longTerm: "Potential for technical leadership, architecture roles, or entrepreneurship.",
        emergingOpportunities: ["AI/ML Integration", "Cloud Architecture", "Platform Engineering", "Technical Leadership"],
        skillsTrending: ["AI/ML", "Cloud Native", "DevOps", "System Design"],
        marketDemandForecast: {
          current: 70,
          sixMonths: 75,
          oneYear: 78,
          twoYears: 82,
          fiveYears: 85
        },
        salaryGrowthPotential: {
          currentRange: "₹8-15 LPA",
          potentialIn2Years: "₹15-25 LPA",
          potentialIn5Years: "₹25-45 LPA"
        }
      },
      riskFactorsAndImprovements: {
        marketRisks: [
          "Rapid technology evolution may require continuous upskilling",
          "AI tools may automate some routine coding tasks",
          "Market competition from fresh graduates"
        ],
        skillGaps: [
          "Cloud platform certifications would strengthen profile",
          "System design and architecture skills",
          "Leadership and team management experience"
        ],
        improvementAreas: [
          "Build projects showcasing end-to-end solutions",
          "Contribute to open source for visibility",
          "Develop presentation and communication skills"
        ],
        urgentUpskilling: ["Cloud Platforms (AWS/Azure)", "AI/ML Basics", "System Design"],
        riskScores: {
          automationRisk: 35,
          marketSaturation: 45,
          skillObsolescence: 40,
          competitionLevel: 55
        }
      },
      skillProficiency: {
        technical: 70,
        soft: 65,
        domain: 55,
        leadership: 50
      },
      actionPlan: [
        "Immediate: Complete one cloud certification (AWS/Azure) within 4 weeks",
        "Short-term: Build 2-3 portfolio projects demonstrating your strongest skills",
        "Medium-term: Transition to senior role by leading a team project or initiative"
      ]
    };
  }
}

const careerTwinService = new CareerTwinService();
export default careerTwinService;
