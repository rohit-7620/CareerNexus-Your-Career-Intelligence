import { GoogleGenerativeAI } from '@google/generative-ai';

class IndustryHeatmapService {
  constructor() {
    // Dedicated API key for Industry Heatmap feature
    this.apiKey = 'AIzaSyCXXAd_0sLg_papduWQ_RFXDoDPg-JSDaA';
    this.genAI = null;
    this.model = null;
    this.initializeAPI();
  }

  initializeAPI() {
    try {
      console.log('🔑 Initializing Industry Heatmap API with key:', this.apiKey.substring(0, 10) + '...');
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      console.log('✅ Industry Heatmap API initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Industry Heatmap API:', error.message);
      this.model = null;
    }
  }

  async callGemini(prompt) {
    try {
      if (!this.model) {
        throw new Error('API not initialized');
      }
      console.log('📡 Calling Gemini API for Industry Heatmap...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Industry Heatmap response received');
      return text;
    } catch (error) {
      console.error('❌ Industry Heatmap API error:', error.message);
      throw error;
    }
  }

  async generateIndustryHeatmap(userProfile) {
    const skills = userProfile?.skills?.join(', ') || 'general tech skills';
    const experience = userProfile?.experience || '2-5 years';
    const interests = userProfile?.interests?.join(', ') || 'technology, software development';
    const location = userProfile?.location || 'India';

    const prompt = `You are an expert career analyst and industry researcher. Analyze the top 10 most relevant industries for a professional with this profile:

=== CANDIDATE PROFILE ===
• Skills: ${skills}
• Experience: ${experience}
• Interests: ${interests}
• Location: ${location}

=== GENERATE INDUSTRY HEATMAP DATA ===

Provide a comprehensive JSON analysis with the following structure. Be VERY specific with real industry data and trends for both India and Global markets.

{
  "industries": [
    {
      "rank": 1,
      "name": "Industry Name (e.g., 'Artificial Intelligence & Machine Learning')",
      "description": "2-3 sentences describing the industry and why it's relevant to this candidate",
      "demandLevel": "High|Medium|Low",
      "demandScore": 85,
      "salaryGrowth": {
        "india": {
          "2024": 12,
          "2025": 18,
          "2026": 22,
          "2027": 25,
          "2028": 28
        },
        "global": {
          "2024": 15,
          "2025": 20,
          "2026": 24,
          "2027": 27,
          "2028": 30
        }
      },
      "avgSalary": {
        "india": "₹12-25 LPA",
        "global": "$80,000-$150,000"
      },
      "skillSaturation": "Low|Medium|High",
      "saturationPercent": 35,
      "entryBarrier": 3,
      "entryBarrierDescription": "What makes entry easy/hard",
      "topSkillsRequired": ["skill1", "skill2", "skill3"],
      "topCompanies": {
        "india": ["Company1", "Company2", "Company3"],
        "global": ["Company1", "Company2", "Company3"]
      },
      "jobGrowthRate": "+25%",
      "futureOutlook": "1-2 sentences about future prospects"
    }
  ],
  "insights": {
    "topRecommendation": "Based on your profile, which industry is best and why",
    "emergingTrend": "Key emerging trend across industries",
    "marketWarning": "Any saturated markets to avoid",
    "salaryInsight": "Key salary trend observation",
    "skillGapAlert": "Skills the candidate should develop"
  },
  "regionComparison": {
    "india": {
      "hotIndustries": ["Industry1", "Industry2", "Industry3"],
      "avgSalaryGrowth": "18%",
      "marketMaturity": "Growing rapidly"
    },
    "global": {
      "hotIndustries": ["Industry1", "Industry2", "Industry3"],
      "avgSalaryGrowth": "15%",
      "marketMaturity": "Mature with steady growth"
    }
  },
  "summary": "A comprehensive 3-4 sentence summary of the overall industry landscape for this candidate"
}

Generate exactly 10 industries ranked by relevance to the candidate's profile. Use realistic 2024-2028 salary growth percentages (not absolute values). Entry barrier should be 1-5 scale (1=easy entry, 5=very difficult). Make all data realistic and insightful.

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`;

    try {
      const response = await this.callGemini(prompt);
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleanedResponse);
      console.log('✅ Industry Heatmap data parsed successfully');
      return data;
    } catch (error) {
      console.error('❌ Failed to parse Industry Heatmap response:', error.message);
      return this.getFallbackData();
    }
  }

  getFallbackData() {
    return {
      industries: [
        {
          rank: 1,
          name: "Artificial Intelligence & Machine Learning",
          description: "Leading the tech revolution with applications across all sectors. High demand for AI engineers, data scientists, and ML specialists.",
          demandLevel: "High",
          demandScore: 95,
          salaryGrowth: {
            india: { 2024: 15, 2025: 22, 2026: 28, 2027: 32, 2028: 35 },
            global: { 2024: 18, 2025: 25, 2026: 30, 2027: 33, 2028: 36 }
          },
          avgSalary: { india: "₹15-45 LPA", global: "$120,000-$250,000" },
          skillSaturation: "Low",
          saturationPercent: 25,
          entryBarrier: 4,
          entryBarrierDescription: "Requires strong math, programming, and domain expertise",
          topSkillsRequired: ["Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP"],
          topCompanies: {
            india: ["Google India", "Microsoft", "Amazon", "Flipkart", "Zomato"],
            global: ["OpenAI", "Google", "Meta", "Microsoft", "NVIDIA"]
          },
          jobGrowthRate: "+40%",
          futureOutlook: "Explosive growth expected with AGI research and enterprise AI adoption"
        },
        {
          rank: 2,
          name: "Cloud Computing & DevOps",
          description: "Essential infrastructure for digital transformation. Growing demand for cloud architects and DevOps engineers.",
          demandLevel: "High",
          demandScore: 90,
          salaryGrowth: {
            india: { 2024: 12, 2025: 18, 2026: 22, 2027: 25, 2028: 28 },
            global: { 2024: 14, 2025: 20, 2026: 24, 2027: 27, 2028: 30 }
          },
          avgSalary: { india: "₹12-35 LPA", global: "$100,000-$200,000" },
          skillSaturation: "Medium",
          saturationPercent: 45,
          entryBarrier: 3,
          entryBarrierDescription: "Certifications highly valued, practical experience essential",
          topSkillsRequired: ["AWS", "Azure", "Kubernetes", "Docker", "Terraform"],
          topCompanies: {
            india: ["TCS", "Infosys", "Wipro", "HCL", "Tech Mahindra"],
            global: ["AWS", "Microsoft Azure", "Google Cloud", "IBM", "Oracle"]
          },
          jobGrowthRate: "+32%",
          futureOutlook: "Multi-cloud and serverless architectures driving sustained growth"
        },
        {
          rank: 3,
          name: "Cybersecurity",
          description: "Critical for protecting digital assets. Severe talent shortage globally with premium compensation.",
          demandLevel: "High",
          demandScore: 88,
          salaryGrowth: {
            india: { 2024: 14, 2025: 20, 2026: 25, 2027: 28, 2028: 32 },
            global: { 2024: 16, 2025: 22, 2026: 27, 2027: 30, 2028: 34 }
          },
          avgSalary: { india: "₹10-40 LPA", global: "$90,000-$180,000" },
          skillSaturation: "Low",
          saturationPercent: 20,
          entryBarrier: 3,
          entryBarrierDescription: "Certifications like CISSP, CEH highly valued",
          topSkillsRequired: ["Network Security", "Penetration Testing", "SIEM", "Incident Response", "Cloud Security"],
          topCompanies: {
            india: ["Deloitte", "EY", "KPMG", "Wipro", "HCL"],
            global: ["Palo Alto", "CrowdStrike", "Fortinet", "Cisco", "IBM Security"]
          },
          jobGrowthRate: "+35%",
          futureOutlook: "Zero-trust and AI-powered security driving massive demand"
        },
        {
          rank: 4,
          name: "Data Science & Analytics",
          description: "Transforming business decisions with data-driven insights. Strong demand across all industries.",
          demandLevel: "High",
          demandScore: 85,
          salaryGrowth: {
            india: { 2024: 10, 2025: 15, 2026: 20, 2027: 24, 2028: 27 },
            global: { 2024: 12, 2025: 17, 2026: 22, 2027: 26, 2028: 29 }
          },
          avgSalary: { india: "₹10-30 LPA", global: "$85,000-$160,000" },
          skillSaturation: "Medium",
          saturationPercent: 50,
          entryBarrier: 3,
          entryBarrierDescription: "Statistical knowledge and business acumen required",
          topSkillsRequired: ["Python", "SQL", "Machine Learning", "Tableau", "Statistics"],
          topCompanies: {
            india: ["Mu Sigma", "Fractal", "Tiger Analytics", "LatentView", "AbsolutData"],
            global: ["McKinsey", "BCG", "Bain", "Deloitte", "Accenture"]
          },
          jobGrowthRate: "+28%",
          futureOutlook: "Real-time analytics and AI integration expanding opportunities"
        },
        {
          rank: 5,
          name: "FinTech & Digital Payments",
          description: "Revolutionizing financial services with technology. Booming sector in India with UPI leadership.",
          demandLevel: "High",
          demandScore: 82,
          salaryGrowth: {
            india: { 2024: 18, 2025: 24, 2026: 28, 2027: 32, 2028: 35 },
            global: { 2024: 15, 2025: 20, 2026: 25, 2027: 28, 2028: 31 }
          },
          avgSalary: { india: "₹12-35 LPA", global: "$95,000-$180,000" },
          skillSaturation: "Medium",
          saturationPercent: 40,
          entryBarrier: 3,
          entryBarrierDescription: "Domain knowledge in finance/banking helpful",
          topSkillsRequired: ["Java", "Python", "Blockchain", "API Development", "Security"],
          topCompanies: {
            india: ["Paytm", "PhonePe", "Razorpay", "CRED", "BharatPe"],
            global: ["Stripe", "Square", "PayPal", "Adyen", "Revolut"]
          },
          jobGrowthRate: "+30%",
          futureOutlook: "Digital lending, BNPL, and embedded finance driving growth"
        },
        {
          rank: 6,
          name: "Full Stack Development",
          description: "Core technology role with consistent demand. Essential for digital product development.",
          demandLevel: "High",
          demandScore: 80,
          salaryGrowth: {
            india: { 2024: 8, 2025: 12, 2026: 15, 2027: 18, 2028: 20 },
            global: { 2024: 10, 2025: 14, 2026: 17, 2027: 20, 2028: 22 }
          },
          avgSalary: { india: "₹8-25 LPA", global: "$70,000-$150,000" },
          skillSaturation: "High",
          saturationPercent: 65,
          entryBarrier: 2,
          entryBarrierDescription: "Many entry points, bootcamps available",
          topSkillsRequired: ["React", "Node.js", "TypeScript", "MongoDB", "REST APIs"],
          topCompanies: {
            india: ["TCS", "Infosys", "Wipro", "Cognizant", "HCL"],
            global: ["Google", "Meta", "Amazon", "Microsoft", "Netflix"]
          },
          jobGrowthRate: "+22%",
          futureOutlook: "AI-assisted development changing the landscape"
        },
        {
          rank: 7,
          name: "Healthcare Technology",
          description: "Digital health solutions transforming patient care. Growing rapidly post-pandemic.",
          demandLevel: "Medium",
          demandScore: 75,
          salaryGrowth: {
            india: { 2024: 12, 2025: 18, 2026: 22, 2027: 26, 2028: 30 },
            global: { 2024: 14, 2025: 20, 2026: 25, 2027: 29, 2028: 33 }
          },
          avgSalary: { india: "₹10-28 LPA", global: "$80,000-$160,000" },
          skillSaturation: "Low",
          saturationPercent: 30,
          entryBarrier: 4,
          entryBarrierDescription: "Healthcare domain knowledge essential",
          topSkillsRequired: ["Python", "HIPAA Compliance", "ML/AI", "Cloud", "HL7/FHIR"],
          topCompanies: {
            india: ["Practo", "1mg", "PharmEasy", "Healthify", "Cult.fit"],
            global: ["Epic Systems", "Cerner", "Teladoc", "Veeva", "Moderna"]
          },
          jobGrowthRate: "+26%",
          futureOutlook: "Telemedicine and AI diagnostics driving innovation"
        },
        {
          rank: 8,
          name: "E-Commerce & Retail Tech",
          description: "Digital commerce platforms and retail technology. Strong in India with growing D2C brands.",
          demandLevel: "Medium",
          demandScore: 72,
          salaryGrowth: {
            india: { 2024: 10, 2025: 14, 2026: 18, 2027: 21, 2028: 24 },
            global: { 2024: 8, 2025: 12, 2026: 15, 2027: 18, 2028: 20 }
          },
          avgSalary: { india: "₹8-22 LPA", global: "$65,000-$130,000" },
          skillSaturation: "High",
          saturationPercent: 60,
          entryBarrier: 2,
          entryBarrierDescription: "Accessible entry, fast-paced environment",
          topSkillsRequired: ["React", "Node.js", "Python", "Analytics", "AWS"],
          topCompanies: {
            india: ["Flipkart", "Amazon India", "Myntra", "Meesho", "Nykaa"],
            global: ["Amazon", "Shopify", "Alibaba", "eBay", "Walmart"]
          },
          jobGrowthRate: "+18%",
          futureOutlook: "Quick commerce and personalization driving growth"
        },
        {
          rank: 9,
          name: "Gaming & Entertainment Tech",
          description: "Interactive entertainment and gaming platforms. Emerging strongly in India.",
          demandLevel: "Medium",
          demandScore: 68,
          salaryGrowth: {
            india: { 2024: 15, 2025: 22, 2026: 28, 2027: 32, 2028: 36 },
            global: { 2024: 12, 2025: 18, 2026: 23, 2027: 27, 2028: 30 }
          },
          avgSalary: { india: "₹8-25 LPA", global: "$70,000-$150,000" },
          skillSaturation: "Low",
          saturationPercent: 35,
          entryBarrier: 3,
          entryBarrierDescription: "Creative skills and game engines knowledge needed",
          topSkillsRequired: ["Unity", "Unreal Engine", "C++", "3D Modeling", "Game Design"],
          topCompanies: {
            india: ["Dream11", "MPL", "Nazara", "Games24x7", "Zynga India"],
            global: ["EA", "Activision", "Ubisoft", "Epic Games", "Riot Games"]
          },
          jobGrowthRate: "+24%",
          futureOutlook: "Mobile gaming and metaverse integration accelerating"
        },
        {
          rank: 10,
          name: "EdTech & Online Learning",
          description: "Digital education platforms and learning technology. Major growth in India's education sector.",
          demandLevel: "Medium",
          demandScore: 65,
          salaryGrowth: {
            india: { 2024: 8, 2025: 12, 2026: 16, 2027: 19, 2028: 22 },
            global: { 2024: 10, 2025: 14, 2026: 18, 2027: 21, 2028: 24 }
          },
          avgSalary: { india: "₹7-20 LPA", global: "$60,000-$120,000" },
          skillSaturation: "High",
          saturationPercent: 55,
          entryBarrier: 2,
          entryBarrierDescription: "Accessible entry with tech skills",
          topSkillsRequired: ["React", "Node.js", "Video Streaming", "LMS", "Analytics"],
          topCompanies: {
            india: ["BYJU'S", "Unacademy", "upGrad", "Vedantu", "Physics Wallah"],
            global: ["Coursera", "Udemy", "LinkedIn Learning", "Khan Academy", "Duolingo"]
          },
          jobGrowthRate: "+15%",
          futureOutlook: "AI tutoring and skill-based learning expanding market"
        }
      ],
      insights: {
        topRecommendation: "AI/ML sector offers the best combination of high demand, salary growth, and future potential for tech professionals",
        emergingTrend: "Generative AI and LLMs are creating new roles across all industries",
        marketWarning: "Web development and basic data analytics markets are becoming saturated",
        salaryInsight: "AI and cybersecurity roles command 40-60% premium over traditional tech roles",
        skillGapAlert: "Focus on cloud certifications and AI/ML skills to stay competitive"
      },
      regionComparison: {
        india: {
          hotIndustries: ["AI/ML", "FinTech", "Cloud Computing"],
          avgSalaryGrowth: "22%",
          marketMaturity: "Rapidly growing with startup ecosystem"
        },
        global: {
          hotIndustries: ["AI/ML", "Cybersecurity", "Healthcare Tech"],
          avgSalaryGrowth: "18%",
          marketMaturity: "Mature with steady growth"
        }
      },
      summary: "The technology industry landscape shows strong demand for AI/ML, Cloud, and Cybersecurity professionals. India's market is growing faster than global averages, with FinTech leading. Traditional development roles face saturation, making specialization crucial for career growth."
    };
  }
}

const industryHeatmapService = new IndustryHeatmapService();
export default industryHeatmapService;
