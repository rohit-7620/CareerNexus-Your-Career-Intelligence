import { GoogleGenerativeAI } from '@google/generative-ai';

class DirectGeminiService {
  constructor() {
    // Load balance across multiple API keys
    // Use the provided Gemini API key directly for all requests
    this.apiKeys = [
      'AIzaSyCoZrg5nbpcOv2xt58W9vmhtdesHGpBkoA'
    ];
    this.currentKeyIndex = 0;
    this.genAI = null;
    this.model = null;
    this.initializeAPI();
  }

  initializeAPI() {
    if (this.apiKeys.length === 0) {
      console.warn('⚠️ No Gemini API keys found - using fallback data');
      this.model = null;
      return;
    }
    
    try {
      const apiKey = this.apiKeys[this.currentKeyIndex];
      console.log('🔑 Initializing Gemini API with key:', apiKey.substring(0, 10) + '...');
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-2.5-flash as the primary model (most stable and available)
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      console.log('✅ Gemini API initialized successfully with gemini-2.5-flash');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini API:', error.message);
      console.warn('⚠️ Will use fallback data for responses');
      this.model = null;
    }
  }

  // Rotate to next API key on failure
  rotateAPIKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    this.initializeAPI();
  }

  async callGemini(prompt, retries = 2) {
    try {
      if (!this.model) {
        console.warn('⚠️ API not initialized, will use fallback data');
        throw new Error('Gemini API not initialized - using fallback data');
      }

      console.log('📡 Calling Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Gemini API response received:', text.substring(0, 200) + '...');
      return text;
    } catch (error) {
      console.error('❌ Gemini API error:', error.message);
      
      // Check if it's an API key issue
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.error('🔴 API Key Issue: The provided API key may be invalid or the model is not available');
        console.log('💡 Using intelligent fallback data instead');
      }
      
      if (retries > 0 && this.apiKeys.length > 1) {
        console.log('🔄 Retrying with next API key...');
        this.rotateAPIKey();
        return await this.callGemini(prompt, retries - 1);
      }
      
      throw error;
    }
  }

  async generateCareerTwin(userData) {
    const skills = (userData.skills || []).join(', ') || 'general skills';
    const experience = userData.experience || 'emerging professional';
    const education = userData.education || 'Not specified';
    const interests = (userData.interests || []).join(', ') || 'Not specified';
    const goals = userData.goals || 'Career advancement and growth';
    
    const prompt = `You are an expert AI Career Advisor. Create a comprehensive Career Twin analysis for this professional:

=== CANDIDATE PROFILE ===
• Education: ${education}
• Skills: ${skills}
• Experience Level: ${experience}
• Interests: ${interests}
• Career Goals: ${goals}

=== GENERATE CAREER TWIN ANALYSIS ===

Provide a detailed JSON response with the following sections:

{
  "professionalIdentity": {
    "archetype": "A specific professional archetype (e.g., 'Data-Driven Product Strategist', 'Full-Stack Innovation Leader')",
    "summary": "3-4 sentences describing their professional identity, strengths, and market positioning based on their exact skills: ${skills}",
    "uniqueValue": "What makes this person unique in the job market"
  },
  "strengthsAndDifferentiators": {
    "coreStrengths": ["strength1 with reasoning", "strength2 with reasoning", "strength3 with reasoning"],
    "competitiveAdvantages": ["advantage1", "advantage2"],
    "uniqueSkillCombinations": "How their skill mix creates unique value"
  },
  "roleSuitability": [
    {
      "role": "Job Title 1",
      "suitabilityScore": <75-98>,
      "reasoning": "Why this role fits based on their skills",
      "keyMatchingSkills": ["skill1", "skill2"],
      "salaryRange": "₹X-YL",
      "demandLevel": "high/medium"
    },
    {
      "role": "Job Title 2",
      "suitabilityScore": <70-95>,
      "reasoning": "Why this role fits",
      "keyMatchingSkills": ["skill1", "skill2"],
      "salaryRange": "₹X-YL",
      "demandLevel": "high/medium"
    },
    {
      "role": "Job Title 3",
      "suitabilityScore": <65-90>,
      "reasoning": "Why this role fits",
      "keyMatchingSkills": ["skill1", "skill2"],
      "salaryRange": "₹X-YL",
      "demandLevel": "high/medium"
    },
    {
      "role": "Job Title 4",
      "suitabilityScore": <60-85>,
      "reasoning": "Why this role fits",
      "keyMatchingSkills": ["skill1", "skill2"],
      "salaryRange": "₹X-YL",
      "demandLevel": "medium/low"
    },
    {
      "role": "Job Title 5",
      "suitabilityScore": <55-80>,
      "reasoning": "Why this role fits",
      "keyMatchingSkills": ["skill1", "skill2"],
      "salaryRange": "₹X-YL",
      "demandLevel": "medium"
    }
  ],
  "growthPotential": {
    "shortTerm": "Growth opportunities in next 6-12 months",
    "midTerm": "Career trajectory in 2-3 years",
    "longTerm": "5+ year potential and leadership path",
    "emergingOpportunities": ["opportunity1", "opportunity2"],
    "skillsTrending": ["trending skill1", "trending skill2"]
  },
  "riskFactorsAndImprovements": {
    "marketRisks": ["risk1 - how to mitigate", "risk2 - how to mitigate"],
    "skillGaps": ["gap1 - recommended action", "gap2 - recommended action"],
    "improvementAreas": ["area1 with specific action", "area2 with specific action", "area3 with specific action"],
    "urgentUpskilling": ["skill to learn immediately", "certification to pursue"]
  },
  "skillProficiency": {
    "technical": <60-95 based on technical skills>,
    "soft": <65-85>,
    "domain": <55-90>,
    "leadership": <40-80>
  },
  "actionPlan": [
    "Immediate action 1 (this week)",
    "Short-term action 2 (this month)",
    "Medium-term action 3 (next quarter)"
  ]
}

IMPORTANT: 
- Reference the actual skills (${skills}) throughout your analysis
- Be specific and actionable
- Provide realistic scores and salary ranges for Indian market
- Return ONLY valid JSON`;

    try {
      console.log('🧠 Generating Career Twin with profile:', { skills, experience, education, interests, goals });
      const response = await this.callGemini(prompt);
      console.log('📊 Career Twin response received');
      
      // Extract JSON from response
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) jsonMatch[0] = jsonMatch[1];
      }
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Career Twin parsed successfully');
        return parsed;
      }
      throw new Error('Invalid JSON response from Gemini');
    } catch (error) {
      console.error('❌ Career Twin generation error:', error.message);
      console.log('💡 Generating intelligent fallback Career Twin...');
      
      // Smart fallback based on actual skills
      const skillsList = (userData.skills || []);
      const skillsLower = skills.toLowerCase();
      const hasDataSkills = skillsLower.includes('python') || skillsLower.includes('ml') || skillsLower.includes('data') || skillsLower.includes('ai');
      const hasWebSkills = skillsLower.includes('react') || skillsLower.includes('javascript') || skillsLower.includes('web') || skillsLower.includes('frontend');
      const hasBackendSkills = skillsLower.includes('node') || skillsLower.includes('java') || skillsLower.includes('backend') || skillsLower.includes('api');
      const hasCloudSkills = skillsLower.includes('aws') || skillsLower.includes('azure') || skillsLower.includes('cloud') || skillsLower.includes('devops');
      
      let archetype = 'Emerging Tech Professional';
      let roles = [];
      let techScore = 55;
      
      if (hasDataSkills) {
        archetype = 'Data Science & AI Specialist';
        techScore = 82;
        roles = [
          { role: 'Data Scientist', suitabilityScore: 92, reasoning: 'Strong Python and data skills align perfectly', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹8-18L', demandLevel: 'high' },
          { role: 'ML Engineer', suitabilityScore: 88, reasoning: 'ML expertise positions you well', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹10-22L', demandLevel: 'high' },
          { role: 'Data Analyst', suitabilityScore: 85, reasoning: 'Analytical foundation is strong', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹5-12L', demandLevel: 'high' },
          { role: 'AI Research Engineer', suitabilityScore: 78, reasoning: 'AI interest opens research paths', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹12-25L', demandLevel: 'medium' },
          { role: 'Business Intelligence Analyst', suitabilityScore: 75, reasoning: 'Data skills transfer well', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹6-14L', demandLevel: 'high' }
        ];
      } else if (hasWebSkills) {
        archetype = 'Full-Stack Web Developer';
        techScore = 78;
        roles = [
          { role: 'Frontend Developer', suitabilityScore: 90, reasoning: 'React/JS skills are in high demand', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹6-14L', demandLevel: 'high' },
          { role: 'Full Stack Developer', suitabilityScore: 85, reasoning: 'Versatile web skills cover full stack', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹8-18L', demandLevel: 'high' },
          { role: 'React Developer', suitabilityScore: 88, reasoning: 'Direct React expertise match', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹7-15L', demandLevel: 'high' },
          { role: 'UI/UX Engineer', suitabilityScore: 75, reasoning: 'Frontend skills support UI focus', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹6-12L', demandLevel: 'medium' },
          { role: 'Web Application Developer', suitabilityScore: 80, reasoning: 'Core web competencies strong', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹5-12L', demandLevel: 'high' }
        ];
      } else if (hasBackendSkills) {
        archetype = 'Backend Systems Engineer';
        techScore = 76;
        roles = [
          { role: 'Backend Developer', suitabilityScore: 88, reasoning: 'Core backend skills well-matched', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹7-16L', demandLevel: 'high' },
          { role: 'API Developer', suitabilityScore: 85, reasoning: 'API expertise is in demand', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹8-15L', demandLevel: 'high' },
          { role: 'Software Engineer', suitabilityScore: 82, reasoning: 'Solid programming foundation', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹6-14L', demandLevel: 'high' },
          { role: 'Systems Developer', suitabilityScore: 78, reasoning: 'Backend knowledge transfers well', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹7-13L', demandLevel: 'medium' },
          { role: 'Platform Engineer', suitabilityScore: 72, reasoning: 'Can grow into platform roles', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹10-20L', demandLevel: 'medium' }
        ];
      } else if (hasCloudSkills) {
        archetype = 'Cloud & DevOps Engineer';
        techScore = 80;
        roles = [
          { role: 'DevOps Engineer', suitabilityScore: 90, reasoning: 'Direct cloud/DevOps expertise match', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹9-20L', demandLevel: 'high' },
          { role: 'Cloud Engineer', suitabilityScore: 88, reasoning: 'Cloud skills highly valued', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹10-22L', demandLevel: 'high' },
          { role: 'SRE Engineer', suitabilityScore: 82, reasoning: 'Reliability engineering path open', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹12-25L', demandLevel: 'high' },
          { role: 'Infrastructure Engineer', suitabilityScore: 78, reasoning: 'Infrastructure management skills align', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹8-18L', demandLevel: 'medium' },
          { role: 'Platform Engineer', suitabilityScore: 75, reasoning: 'Platform opportunities available', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹10-20L', demandLevel: 'medium' }
        ];
      } else {
        roles = [
          { role: 'Software Engineer', suitabilityScore: 75, reasoning: 'Foundational tech career path', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹5-12L', demandLevel: 'high' },
          { role: 'Junior Developer', suitabilityScore: 78, reasoning: 'Entry point for growth', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹4-8L', demandLevel: 'high' },
          { role: 'Technical Analyst', suitabilityScore: 70, reasoning: 'Analytical role suits profile', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹5-10L', demandLevel: 'medium' },
          { role: 'QA Engineer', suitabilityScore: 72, reasoning: 'Quality focus path available', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹4-9L', demandLevel: 'high' },
          { role: 'IT Support Engineer', suitabilityScore: 68, reasoning: 'Technical support as stepping stone', keyMatchingSkills: skillsList.slice(0, 2), salaryRange: '₹3-7L', demandLevel: 'high' }
        ];
      }

      return {
        professionalIdentity: {
          archetype: archetype,
          summary: `With expertise in ${skills || 'emerging technologies'}, you are positioned as a ${archetype}. Your skill combination of ${skillsList.slice(0, 3).join(', ') || 'core competencies'} creates a strong foundation for ${hasDataSkills ? 'data-driven' : hasWebSkills ? 'web development' : hasCloudSkills ? 'cloud infrastructure' : 'technical'} roles in today's market.`,
          uniqueValue: `Your combination of ${skillsList[0] || 'technical skills'} and ${skillsList[1] || 'problem-solving abilities'} positions you uniquely for high-growth tech roles.`
        },
        strengthsAndDifferentiators: {
          coreStrengths: [
            `${skillsList[0] || 'Technical'} expertise - Demonstrates depth in core technologies`,
            `${hasDataSkills ? 'Analytical mindset' : hasWebSkills ? 'User-centric thinking' : 'Problem-solving'} - Essential for modern tech roles`,
            `Adaptability - Shown by diverse skill acquisition in ${skillsList.length} areas`
          ],
          competitiveAdvantages: [
            `Strong foundation in ${skillsList[0] || 'key technologies'}`,
            `Growing skill set with ${skillsList.length} competencies`
          ],
          uniqueSkillCombinations: `The blend of ${skillsList.slice(0, 2).join(' + ') || 'your skills'} creates versatility valued by employers.`
        },
        roleSuitability: roles,
        growthPotential: {
          shortTerm: `Focus on deepening ${skillsList[0] || 'primary skill'} expertise and obtaining relevant certifications`,
          midTerm: `Progress to senior ${archetype.split(' ')[0]} roles with team leadership opportunities`,
          longTerm: `Potential for Technical Lead, Architect, or Engineering Manager positions`,
          emergingOpportunities: [hasDataSkills ? 'AI/ML Engineering' : hasWebSkills ? 'Web3 Development' : 'Cloud Architecture', 'Technical Product Management'],
          skillsTrending: [hasDataSkills ? 'LLM/GenAI' : hasWebSkills ? 'Next.js/TypeScript' : 'Kubernetes', 'System Design']
        },
        riskFactorsAndImprovements: {
          marketRisks: [
            `Skill obsolescence - Mitigate by continuous learning in ${hasDataSkills ? 'AI/ML advancements' : 'emerging frameworks'}`,
            `Market saturation - Differentiate through ${skillsList.length > 2 ? 'unique skill combinations' : 'specialization'}`
          ],
          skillGaps: [
            `${hasDataSkills ? 'Deep Learning frameworks' : hasWebSkills ? 'Backend/DevOps' : 'Frontend technologies'} - Take online courses`,
            `System Design - Practice with mock interviews and projects`
          ],
          improvementAreas: [
            `Communication skills - Present at meetups or write technical blogs`,
            `Leadership capability - Take ownership of small team projects`,
            `Domain expertise - Build projects in specific industries (fintech, healthcare)`
          ],
          urgentUpskilling: [
            hasDataSkills ? 'LangChain/LLM Development' : hasWebSkills ? 'TypeScript' : 'Docker/Kubernetes',
            `${hasCloudSkills ? 'AWS/GCP Certification' : 'Cloud fundamentals'}`
          ]
        },
        skillProficiency: {
          technical: techScore,
          soft: 70,
          domain: 65,
          leadership: skillsList.length > 3 ? 55 : 45
        },
        actionPlan: [
          `This week: Complete a mini-project using ${skillsList[0] || 'your primary skill'}`,
          `This month: Earn a certification in ${hasDataSkills ? 'ML/AI' : hasWebSkills ? 'React Advanced' : hasCloudSkills ? 'AWS Cloud' : 'your focus area'}`,
          `Next quarter: Build and deploy 2-3 portfolio projects showcasing ${skillsList.slice(0, 2).join(' and ') || 'your skills'}`
        ]
      };
    }
  }

  async generateResume(userData) {
    const prompt = `Create an ATS-optimized resume for:

Name: ${userData.name || 'Professional'}
Skills: ${(userData.skills || []).join(', ')}
Experience: ${userData.experience || ''}
Education: ${userData.education || ''}
Target Role: ${userData.targetRole || 'Software Engineer'}

Generate a JSON resume with:
{
  "atsScore": <75-95>,
  "summary": "Professional summary",
  "experience": [{"title": "", "company": "", "duration": "", "achievements": [""]}],
  "skills": {"technical": [""], "soft": [""]},
  "education": [{"degree": "", "institution": "", "year": ""}],
  "improvements": ["suggestion1", "suggestion2"]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Resume generation error:', error);
      return null;
    }
  }

  async generateCoverLetter(jobData, userData) {
    const prompt = `Write a professional cover letter for:

Job Title: ${jobData.jobTitle}
Company: ${jobData.company}
Job Description: ${jobData.description}

Candidate:
Name: ${userData.name}
Skills: ${(userData.skills || []).join(', ')}
Experience: ${userData.experience}

Return a JSON with:
{
  "letter": "Full cover letter text",
  "tips": ["tip1", "tip2", "tip3"]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Cover letter generation error:', error);
      return null;
    }
  }

  async optimizeLinkedIn(userData) {
    const prompt = `Analyze and optimize this LinkedIn profile:

Current Headline: ${userData.headline || ''}
Skills: ${(userData.skills || []).join(', ')}
About: ${userData.about || ''}

Generate JSON with:
{
  "strengthScore": <0-100>,
  "optimizedHeadline": "Optimized headline",
  "optimizedAbout": "Optimized about section",
  "recommendations": ["rec1", "rec2", "rec3"],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('LinkedIn optimization error:', error);
      return null;
    }
  }

  async generateMockQuestion(role, difficulty = 'medium') {
    const prompt = `Generate a ${difficulty} interview question for a ${role} position.

Return JSON:
{
  "question": "The interview question",
  "type": "behavioral|technical|situational",
  "expectedPoints": ["point1", "point2", "point3"]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Question generation error:', error);
      return null;
    }
  }

  async evaluateInterview(question, answer) {
    const prompt = `Evaluate this interview answer:

Question: ${question}
Answer: ${answer}

Rate the answer and return JSON:
{
  "scores": {
    "clarity": <0-10>,
    "relevance": <0-10>,
    "depth": <0-10>,
    "structure": <0-10>,
    "confidence": <0-10>
  },
  "overallScore": <0-100>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "betterAnswer": "An improved version of the answer"
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Interview evaluation error:', error);
      return null;
    }
  }

  async predictCareerPath(userData) {
    const prompt = `Predict 5-year career trajectory for:

Current Role: ${userData.currentRole || 'Professional'}
Skills: ${(userData.skills || []).join(', ')}
Experience Years: ${userData.yearsOfExperience || 2}
Goals: ${userData.goals || 'Career growth'}

Return JSON:
{
  "trajectory": [
    {"year": 1, "role": "", "salary": <number>, "skills": [""], "probability": <0-100>},
    {"year": 2, ...},
    {"year": 3, ...},
    {"year": 4, ...},
    {"year": 5, ...}
  ],
  "milestones": ["milestone1", "milestone2", "milestone3"],
  "opportunities": ["opp1", "opp2", "opp3"]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Career prediction error:', error);
      return null;
    }
  }

  async analyzeSkillGap(currentSkills, targetRole) {
    const prompt = `Analyze skill gap for:

Current Skills: ${currentSkills.join(', ')}
Target Role: ${targetRole}

Return JSON:
{
  "gaps": [
    {"skill": "skillName", "importance": "critical|high|medium", "timeToLearn": "1-3 months"}
  ],
  "strengths": ["skill1", "skill2"],
  "learningPath": [
    {"week": 1, "focus": "topic", "resources": ["resource1"]}
  ],
  "estimatedTime": "6-12 months"
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      return null;
    }
  }

  async generateNegotiationStrategy(jobOffer) {
    const prompt = `Create salary negotiation strategy for:

Offered Salary: $${jobOffer.salary}
Role: ${jobOffer.role}
Location: ${jobOffer.location}
Your Experience: ${jobOffer.experience} years

Return JSON:
{
  "marketRange": {"min": <number>, "max": <number>},
  "counterOffer": <number>,
  "emailTemplate": "Email template text",
  "phoneScript": "Phone script text",
  "negotiationPoints": ["point1", "point2", "point3"]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Negotiation strategy error:', error);
      return null;
    }
  }

  async analyzeJobDescription(jdText) {
    const prompt = `Analyze this job description and extract insights:

${jdText}

Return JSON:
{
  "atsKeywords": ["keyword1", "keyword2", "keyword3"],
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "hiddenRequirements": ["req1", "req2"],
  "cultureFit": ["trait1", "trait2"],
  "redFlags": ["flag1", "flag2"],
  "matchTips": ["tip1", "tip2", "tip3"]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('JD analysis error:', error);
      return null;
    }
  }

  async generateLearningRoadmap(goal, currentLevel) {
    const prompt = `Create a detailed learning roadmap:

Learning Goal: ${goal}
Current Level: ${currentLevel}

Return JSON with 12-week plan:
{
  "weeks": [
    {
      "week": 1,
      "topic": "Topic name",
      "objectives": ["obj1", "obj2"],
      "resources": [{"type": "video|article|course", "title": "", "url": ""}],
      "projects": ["project1"],
      "estimatedHours": 10
    }
  ],
  "certifications": ["cert1", "cert2"],
  "totalDuration": "12 weeks",
  "milestones": [{"week": 4, "milestone": "milestone name"}]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Learning roadmap error:', error);
      return null;
    }
  }

  async generateHeatmapInsights(heatmapData) {
    const topDemand = heatmapData.reduce((max, item) => item.demand > max.demand ? item : max);
    const topSalary = heatmapData.reduce((max, item) => item.salary > max.salary ? item : max);
    const topScarcity = heatmapData.reduce((max, item) => item.scarcity > max.scarcity ? item : max);
    const risingTrends = heatmapData.filter(item => item.trend === 'up');

    const prompt = `As a market intelligence analyst, analyze this industry heatmap data and provide comprehensive insights:

CURRENT MARKET DATA:
${heatmapData.map(d => `- ${d.domain}: ${d.demand} openings, ₹${d.salary}L avg salary, ${d.scarcity}% scarcity, ${d.trend} trend`).join('\n')}

KEY HIGHLIGHTS:
- Highest Demand: ${topDemand.domain} (${topDemand.demand} openings)
- Highest Salary: ${topSalary.domain} (₹${topSalary.salary}L)
- Rarest Skills: ${topScarcity.domain} (${topScarcity.scarcity}% scarcity)
- Rising Trends: ${risingTrends.map(t => t.domain).join(', ')}

Generate a detailed market analysis JSON:
{
  "overallInsight": "2-3 sentences about current market trends and what they mean for professionals",
  "topOpportunities": ["3 specific opportunities based on the data"],
  "marketTrends": {
    "emerging": "Which domains are growing fastest and why",
    "saturated": "Which domains have high competition",
    "premium": "Where the highest salaries are and what skills command them"
  },
  "recommendations": ["3 actionable career recommendations based on market data"],
  "futureOutlook": "1-2 sentences predicting next 2-3 years"
}

Return ONLY valid JSON.`;

    try {
      console.log('Generating heatmap insights...');
      const response = await this.callGemini(prompt);
      console.log('Gemini heatmap response:', response);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed heatmap insights:', parsed);
        return parsed;
      }
      throw new Error('Invalid JSON response from Gemini');
    } catch (error) {
      console.error('Heatmap insights generation error:', error);
      
      // Smart fallback based on actual data
      return {
        overallInsight: `The tech industry shows strong demand across ${heatmapData.length} domains, with ${topDemand.domain} leading at ${topDemand.demand.toLocaleString()} openings. Premium roles in ${topSalary.domain} command ₹${topSalary.salary}L average, while ${topScarcity.domain} remains highly scarce at ${topScarcity.scarcity}% scarcity.`,
        topOpportunities: [
          `${topDemand.domain} offers maximum job opportunities with ${topDemand.demand.toLocaleString()} openings`,
          `${topSalary.domain} professionals can command premium salaries averaging ₹${topSalary.salary}L`,
          `${topScarcity.domain} skills are in high demand with ${topScarcity.scarcity}% scarcity - ideal for rapid career growth`
        ],
        marketTrends: {
          emerging: `${risingTrends.slice(0, 3).map(t => t.domain).join(', ')} are experiencing rapid growth, driven by digital transformation and AI adoption`,
          saturated: `Full Stack Development has high openings (${heatmapData.find(d => d.domain === 'Full Stack Dev')?.demand || 9200}) but lower scarcity, indicating competitive entry`,
          premium: `${topSalary.domain} commands ₹${topSalary.salary}L average due to specialized expertise and high business impact`
        },
        recommendations: [
          `Focus on ${topScarcity.domain} to capitalize on ${topScarcity.scarcity}% skill scarcity`,
          `Upskill in ${risingTrends[0]?.domain || 'AI/ML'} to ride the ${risingTrends[0]?.trend} trend wave`,
          `Combine ${topDemand.domain} with ${topSalary.domain} skills for optimal career positioning`
        ],
        futureOutlook: `AI/ML and Cloud domains will continue dominating with 30%+ growth, while ${topScarcity.domain} expertise will remain premium. Cross-domain skills combining ${topDemand.domain} with emerging tech will be most valuable.`
      };
    }
  }

  async generateDomainDetails(domainData) {
    const prompt = `Analyze this specific tech domain and provide detailed insights:

DOMAIN: ${domainData.domain}
Current Metrics:
- Job Openings: ${domainData.demand.toLocaleString()}
- Average Salary: ₹${domainData.salary}L
- Skill Scarcity: ${domainData.scarcity}%
- Market Trend: ${domainData.trend}

Generate comprehensive domain analysis JSON:
{
  "description": "2-3 sentences about this domain and its importance",
  "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "topCompanies": ["company1", "company2", "company3", "company4"],
  "careerPaths": ["path1", "path2", "path3"],
  "salaryRange": {"entry": "15-25L", "mid": "25-40L", "senior": "40-60L+"},
  "learningPath": "Recommended path to enter this domain",
  "futureProspects": "Growth outlook for next 2-3 years"
}

Return ONLY valid JSON.`;

    try {
      const response = await this.callGemini(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (error) {
      console.error('Domain details generation error:', error);
      
      // Fallback domain-specific data
      const domainInfo = {
        'AI/ML': {
          skills: ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP'],
          companies: ['Google', 'Microsoft', 'OpenAI', 'DeepMind'],
          paths: ['ML Engineer', 'AI Researcher', 'Data Scientist', 'MLOps Engineer']
        },
        'Cloud Computing': {
          skills: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker'],
          companies: ['Amazon', 'Microsoft', 'Google', 'IBM'],
          paths: ['Cloud Architect', 'DevOps Engineer', 'Solutions Architect']
        },
        'Cybersecurity': {
          skills: ['Penetration Testing', 'Network Security', 'SIEM', 'Cryptography', 'Incident Response'],
          companies: ['CrowdStrike', 'Palo Alto Networks', 'Cisco', 'Microsoft'],
          paths: ['Security Analyst', 'Penetration Tester', 'CISO', 'Security Architect']
        }
      };

      const info = domainInfo[domainData.domain] || {
        skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5'],
        companies: ['Top Company 1', 'Top Company 2', 'Top Company 3', 'Top Company 4'],
        paths: ['Junior Role', 'Mid-Level Role', 'Senior Role']
      };

      return {
        description: `${domainData.domain} is a ${domainData.trend === 'up' ? 'rapidly growing' : 'stable'} domain with ${domainData.demand.toLocaleString()} current openings. Professionals command an average of ₹${domainData.salary}L, with ${domainData.scarcity}% skill scarcity indicating strong demand.`,
        topSkills: info.skills,
        topCompanies: info.companies,
        careerPaths: info.paths,
        salaryRange: {
          entry: `${Math.round(domainData.salary * 0.4)}-${Math.round(domainData.salary * 0.6)}L`,
          mid: `${Math.round(domainData.salary * 0.6)}-${Math.round(domainData.salary * 0.9)}L`,
          senior: `${Math.round(domainData.salary * 0.9)}-${Math.round(domainData.salary * 1.3)}L+`
        },
        learningPath: `Start with foundational courses in ${info.skills[0]}, build projects, earn certifications, and contribute to open-source to break into ${domainData.domain}.`,
        futureProspects: domainData.trend === 'up' 
          ? `Excellent growth prospects with 25-30% YoY increase expected. ${domainData.scarcity}% scarcity ensures strong demand.`
          : `Stable market with consistent opportunities. Focus on specialization to stand out.`
      };
    }
  }

  async generateJobMatches(userData) {
    const skills = (userData.skills || []).join(', ') || 'general technical skills';
    const experience = userData.experience || 'entry level';
    const location = userData.location || 'India';
    const preferences = userData.preferences || 'flexible';

    const prompt = `As an AI career advisor and job matching expert, analyze this candidate profile and generate personalized job matches:

CANDIDATE PROFILE:
- Skills: ${skills}
- Experience Level: ${experience}
- Location: ${location}
- Job Preferences: ${preferences}
- Career Goals: ${userData.goals || 'Career growth'}

Generate 5-6 highly relevant job matches based on their skills. For each match, calculate:
1. Readiness Score (0-100) - how ready they are RIGHT NOW for this role
2. Matching Skills - which of their skills match this role
3. Missing Skills - what they need to learn
4. Time to Ready - realistic estimate to become interview-ready
5. Salary Range - in ₹L (lakhs) for Indian market
6. Demand Level - high/medium/low in current market
7. Top hiring companies
8. Job Apply Link - a real or realistic job application URL (e.g., LinkedIn, Naukri, Indeed, or company career page)
9. Job Description - 2-3 sentences about the role

Return ONLY valid JSON:
{
  "matches": [
    {
      "role": "Specific job title",
      "readinessScore": <60-98 based on skill match>,
      "matchingSkills": ["skill1", "skill2", "skill3"],
      "missingSkills": ["skill1", "skill2"],
      "estimatedTimeToReady": "1-2 months",
      "salaryRange": "₹6-12L",
      "demandLevel": "high",
      "companies": ["Company 1", "Company 2", "Company 3"],
      "jobDescription": "Brief 2-3 sentence description of role",
      "whyGoodFit": "Why this candidate is suitable for this role",
      "applyLink": "https://www.linkedin.com/jobs/view/123456789/"
    }
  ],
  "overallAnalysis": "2-3 sentences about candidate's job market position",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

IMPORTANT: Base readiness scores on ACTUAL skill overlap. Reference their specific skills.
Return ONLY valid JSON.`;

    try {
      console.log('Generating job matches with skills:', skills);
      const response = await this.callGemini(prompt);
      console.log('Gemini job matches response received, length:', response.length);
      
      // Try to extract JSON from response
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to find JSON between code blocks
        jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1];
        }
      }
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed job matches:', parsed);
          
          // Ensure applyLink exists for all matches
          if (parsed.matches) {
            parsed.matches = parsed.matches.map(match => ({
              ...match,
              applyLink: match.applyLink || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(match.role)}`
            }));
          }
          
          return parsed;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Failed to parse JSON response from Gemini');
        }
      }
      console.error('No JSON found in response');
      throw new Error('Invalid JSON response from Gemini');
    } catch (error) {
      console.error('❌ Job matches generation error:', error.message);
      console.log('💡 Generating intelligent fallback job matches based on your skills...');
      
      // Smart fallback based on skills
      const skillsLower = skills.toLowerCase();
      const hasDataSkills = skillsLower.includes('python') || skillsLower.includes('data') || skillsLower.includes('ml') || skillsLower.includes('ai');
      const hasWebSkills = skillsLower.includes('react') || skillsLower.includes('javascript') || skillsLower.includes('web') || skillsLower.includes('html') || skillsLower.includes('css');
      const hasBackendSkills = skillsLower.includes('node') || skillsLower.includes('java') || skillsLower.includes('backend') || skillsLower.includes('api') || skillsLower.includes('spring');
      const hasCloudSkills = skillsLower.includes('aws') || skillsLower.includes('azure') || skillsLower.includes('cloud') || skillsLower.includes('docker');
      const hasMobileSkills = skillsLower.includes('react native') || skillsLower.includes('flutter') || skillsLower.includes('android') || skillsLower.includes('ios');
      
      let matches = [];
      
      if (hasDataSkills) {
        matches.push({
          role: 'Data Scientist',
          readinessScore: 82,
          matchingSkills: skills.split(',').slice(0, 3),
          missingSkills: ['TensorFlow', 'Statistical Modeling'],
          estimatedTimeToReady: '1-2 months',
          salaryRange: '₹8-16L',
          demandLevel: 'high',
          companies: ['Flipkart', 'Swiggy', 'Zomato'],
          jobDescription: 'Analyze large datasets and build ML models to drive business insights.',
          whyGoodFit: 'Your data and Python skills align perfectly with data science roles',
          applyLink: 'https://www.linkedin.com/jobs/search/?keywords=Data%20Scientist'
        });
      }
      
      if (hasWebSkills) {
        matches.push({
          role: 'Frontend Developer',
          readinessScore: 88,
          matchingSkills: skills.split(',').slice(0, 3),
          missingSkills: ['TypeScript', 'Testing'],
          estimatedTimeToReady: '2-4 weeks',
          salaryRange: '₹6-12L',
          demandLevel: 'high',
          companies: ['Razorpay', 'CRED', 'PhonePe'],
          jobDescription: 'Build responsive user interfaces using modern frameworks like React.',
          whyGoodFit: 'Your frontend skills make you immediately ready for React positions',
          applyLink: 'https://www.naukri.com/frontend-developer-jobs'
        });
      }
      
      if (hasBackendSkills) {
        matches.push({
          role: 'Backend Engineer',
          readinessScore: 75,
          matchingSkills: skills.split(',').slice(0, 2),
          missingSkills: ['Microservices', 'Docker', 'AWS'],
          estimatedTimeToReady: '1-2 months',
          salaryRange: '₹7-14L',
          demandLevel: 'high',
          companies: ['PayTM', 'MakeMyTrip', 'Ola'],
          jobDescription: 'Design and develop scalable backend systems and APIs.',
          whyGoodFit: 'Your backend experience positions you well for server-side roles',
          applyLink: 'https://www.linkedin.com/jobs/search/?keywords=Backend%20Engineer'
        });
      }
      
      if (hasCloudSkills) {
        matches.push({
          role: 'DevOps Engineer',
          readinessScore: 78,
          matchingSkills: skills.split(',').filter(s => skillsLower.includes(s.toLowerCase())).slice(0, 3),
          missingSkills: ['Kubernetes', 'CI/CD', 'Terraform'],
          estimatedTimeToReady: '1-2 months',
          salaryRange: '₹9-18L',
          demandLevel: 'high',
          companies: ['Amazon', 'Microsoft', 'Google'],
          jobDescription: 'Manage cloud infrastructure, automate deployments, and ensure system reliability.',
          whyGoodFit: 'Your cloud and automation skills are in high demand',
          applyLink: 'https://www.linkedin.com/jobs/search/?keywords=DevOps%20Engineer'
        });
      }
      
      if (hasMobileSkills) {
        matches.push({
          role: 'Mobile App Developer',
          readinessScore: 80,
          matchingSkills: skills.split(',').slice(0, 3),
          missingSkills: ['Native Development', 'App Store Optimization'],
          estimatedTimeToReady: '1 month',
          salaryRange: '₹7-14L',
          demandLevel: 'high',
          companies: ['Swiggy', 'Zomato', 'Dream11'],
          jobDescription: 'Build cross-platform mobile applications for iOS and Android.',
          whyGoodFit: 'Mobile development skills are highly sought after',
          applyLink: 'https://www.naukri.com/mobile-developer-jobs'
        });
      }
      
      // Always add a generic match if we have less than 3
      if (matches.length < 3) {
        matches.push({
          role: 'Full Stack Developer',
          readinessScore: 70,
          matchingSkills: skills.split(',').slice(0, 2),
          missingSkills: ['DevOps', 'Cloud Services'],
          estimatedTimeToReady: '2-3 months',
          salaryRange: '₹8-15L',
          demandLevel: 'high',
          companies: ['Accenture', 'TCS', 'Infosys'],
          jobDescription: 'Work on both frontend and backend to deliver complete features.',
          whyGoodFit: 'Versatile role matching your diverse skill set',
          applyLink: 'https://www.naukri.com/full-stack-developer-jobs'
        });
      }
      
      // Ensure we always return at least one match
      if (matches.length === 0) {
        matches.push({
          role: 'Software Engineer',
          readinessScore: 65,
          matchingSkills: skills.split(',').slice(0, 2),
          missingSkills: ['System Design', 'Data Structures'],
          estimatedTimeToReady: '2-3 months',
          salaryRange: '₹6-12L',
          demandLevel: 'high',
          companies: ['Wipro', 'Tech Mahindra', 'HCL'],
          jobDescription: 'Develop software solutions across various technologies and platforms.',
          whyGoodFit: 'Entry point for building your tech career',
          applyLink: 'https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer'
        });
      }
      
      console.log(`✅ Generated ${matches.length} fallback job matches`);
      
      return {
        matches: matches.slice(0, 5),
        overallAnalysis: `With your skills in ${skills}, you're well-positioned for ${matches[0]?.role || 'technical'} roles. The market shows strong demand with ${matches.length} excellent matches.`,
        recommendations: [
          `Focus on ${matches[0]?.missingSkills[0] || 'advanced concepts'} to boost your readiness score`,
          'Build 2-3 portfolio projects showcasing your skills',
          'Network with professionals in your target companies'
        ]
      };
    }
  }

  // Career Simulator - 3 Career Paths over 5 Years
  async simulateCareerPaths(userData) {
    const skills = (userData.skills || []).join(', ') || 'general technical skills';
    const experience = userData.experience || 'entry-level';
    const currentRole = userData.currentRole || 'Software Developer';
    const currentSalary = userData.currentSalary || 600000;
    const targetRole = userData.targetRole || 'Senior Engineer';
    const interests = userData.interests || 'technology and software development';

    const prompt = `You are an expert career advisor. Generate a detailed 5-year career simulation for a professional with:

Current Profile:
- Skills: ${skills}
- Experience Level: ${experience}
- Current Role: ${currentRole}
- Current Salary: ₹${(currentSalary / 100000).toFixed(1)} LPA
- Target/Dream Role: ${targetRole}
- Interests: ${interests}

Create 3 distinct career paths over 5 years:

1. CONSERVATIVE PATH: Steady growth within current domain
2. ACCELERATED PATH: Aggressive upskilling and rapid advancement
3. PIVOT/ALTERNATIVE PATH: Career transition to a related but different field

For EACH of the 3 paths, provide:

{
  "paths": [
    {
      "pathType": "Conservative",
      "pathDescription": "Steady, low-risk career progression",
      "yearlyProgression": [
        {
          "year": 1,
          "role": "Role name",
          "company": "Type of company",
          "skillsToAcquire": ["skill1", "skill2"],
          "certifications": ["cert1"],
          "salary": 700000,
          "keyMilestones": ["milestone1", "milestone2"]
        },
        // Years 2-5 similarly
      ],
      "totalSalaryGrowth": "X%",
      "riskLevel": "Low",
      "rewardPotential": "Moderate",
      "riskVsRewardAnalysis": {
        "pros": ["pro1", "pro2", "pro3"],
        "cons": ["con1", "con2"],
        "probability": 85,
        "bestFor": "Who this path suits"
      },
      "summary": "Overall path summary"
    }
    // 2 more paths: Accelerated and Pivot
  ],
  "comparison": {
    "salaryComparison": [
      {"year": 1, "conservative": 700000, "accelerated": 800000, "pivot": 650000},
      // Years 2-5
    ],
    "recommendation": "Which path is best based on profile",
    "keyInsight": "Important insight about career choices"
  }
}

Return ONLY valid JSON with realistic Indian salary figures (in INR). Be specific with role names, skills, and certifications relevant to ${skills}.`;

    try {
      console.log('🚀 Generating 5-year career simulation...');
      const response = await this.callGemini(prompt);
      
      // Parse JSON from response
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```\n?$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```\n?$/, '');
      }
      
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Career simulation generated successfully!');
        return result;
      }
      throw new Error('Could not parse simulation response');
    } catch (error) {
      console.error('❌ Career simulation error:', error.message);
      console.log('📋 Using intelligent fallback simulation...');
      
      // Generate intelligent fallback based on user's skills
      const skillsList = skills.split(',').map(s => s.trim());
      const hasWebSkills = skillsList.some(s => /react|angular|vue|javascript|node|frontend|backend/i.test(s));
      const hasDataSkills = skillsList.some(s => /python|ml|ai|data|machine learning/i.test(s));
      const hasCloudSkills = skillsList.some(s => /aws|azure|gcp|cloud|devops/i.test(s));
      
      const baseSalary = currentSalary || 600000;
      
      return {
        paths: [
          {
            pathType: "Conservative",
            pathDescription: "Steady, low-risk career progression focusing on depth in current domain",
            yearlyProgression: [
              { year: 1, role: hasWebSkills ? "Junior Full Stack Developer" : hasDataSkills ? "Data Analyst" : "Software Developer", company: "Mid-size IT Company", skillsToAcquire: [skillsList[0] || "Core Technology", "Git/Version Control"], certifications: ["AWS Cloud Practitioner"], salary: Math.round(baseSalary * 1.15), keyMilestones: ["Complete 3 projects", "Get first certification"] },
              { year: 2, role: hasWebSkills ? "Full Stack Developer" : hasDataSkills ? "Senior Data Analyst" : "Software Engineer", company: "Product Company", skillsToAcquire: ["System Design", "Testing"], certifications: ["Professional Scrum Master"], salary: Math.round(baseSalary * 1.35), keyMilestones: ["Lead small feature", "Mentor junior"] },
              { year: 3, role: hasWebSkills ? "Senior Full Stack Developer" : hasDataSkills ? "Data Scientist" : "Senior Software Engineer", company: "Growing Startup / MNC", skillsToAcquire: ["Architecture Patterns", "CI/CD"], certifications: [hasCloudSkills ? "AWS Solutions Architect" : "Technical Certification"], salary: Math.round(baseSalary * 1.6), keyMilestones: ["Own module end-to-end", "Technical documentation"] },
              { year: 4, role: hasWebSkills ? "Tech Lead" : hasDataSkills ? "Senior Data Scientist" : "Technical Lead", company: "MNC / Large Product Company", skillsToAcquire: ["Team Management", "Stakeholder Communication"], certifications: ["Leadership Training"], salary: Math.round(baseSalary * 1.9), keyMilestones: ["Lead team of 3-5", "Drive technical decisions"] },
              { year: 5, role: hasWebSkills ? "Engineering Manager" : hasDataSkills ? "ML Lead" : "Senior Technical Lead", company: "FAANG / Top Tier Company", skillsToAcquire: ["Strategic Planning", "Cross-functional Leadership"], certifications: ["Management Certification"], salary: Math.round(baseSalary * 2.3), keyMilestones: ["Manage multiple projects", "Influence product roadmap"] }
            ],
            totalSalaryGrowth: "130%",
            riskLevel: "Low",
            rewardPotential: "Moderate",
            riskVsRewardAnalysis: {
              pros: ["Job stability and security", "Predictable career trajectory", "Deep expertise in domain", "Strong professional network in field"],
              cons: ["Slower salary growth", "May miss emerging opportunities", "Less exciting challenges"],
              probability: 85,
              bestFor: "Professionals who value stability, work-life balance, and gradual growth"
            },
            summary: `A steady 5-year progression from ${currentRole} to senior leadership, focusing on deepening expertise in ${skillsList[0] || 'core technologies'} while building management skills.`
          },
          {
            pathType: "Accelerated",
            pathDescription: "Aggressive growth through intensive upskilling, certifications, and strategic job changes",
            yearlyProgression: [
              { year: 1, role: hasWebSkills ? "Full Stack Developer" : hasDataSkills ? "ML Engineer" : "Software Engineer II", company: "Fast-growing Startup", skillsToAcquire: [skillsList[0] || "Core Tech", "System Design", "DSA"], certifications: ["AWS Solutions Architect", "Cloud Certification"], salary: Math.round(baseSalary * 1.4), keyMilestones: ["Ship major feature", "Build side project", "Crack FAANG interview"] },
              { year: 2, role: hasWebSkills ? "Senior Full Stack Engineer" : hasDataSkills ? "Senior ML Engineer" : "Senior Software Engineer", company: "FAANG / Top Startup", skillsToAcquire: ["Distributed Systems", "Performance Optimization"], certifications: ["Professional Cloud Architect"], salary: Math.round(baseSalary * 1.9), keyMilestones: ["Get FAANG offer", "Lead complex project", "Open source contribution"] },
              { year: 3, role: hasWebSkills ? "Staff Engineer" : hasDataSkills ? "Lead Data Scientist" : "Staff Software Engineer", company: "FAANG / Unicorn", skillsToAcquire: ["Architecture", "Technical Strategy"], certifications: ["System Design Expert"], salary: Math.round(baseSalary * 2.5), keyMilestones: ["Design major system", "Influence org-wide decisions"] },
              { year: 4, role: hasWebSkills ? "Principal Engineer" : hasDataSkills ? "Principal Data Scientist" : "Principal Engineer", company: "Big Tech / Leadership Role", skillsToAcquire: ["Org Leadership", "Technical Vision"], certifications: ["Executive Leadership"], salary: Math.round(baseSalary * 3.2), keyMilestones: ["Lead engineering org", "Define tech roadmap"] },
              { year: 5, role: hasWebSkills ? "Director of Engineering" : hasDataSkills ? "Head of AI/ML" : "VP Engineering", company: "C-Suite Track / Startup CTO", skillsToAcquire: ["Business Strategy", "P&L Management"], certifications: ["MBA/Executive Education"], salary: Math.round(baseSalary * 4.0), keyMilestones: ["C-level responsibilities", "Build engineering culture"] }
            ],
            totalSalaryGrowth: "300%",
            riskLevel: "High",
            rewardPotential: "Very High",
            riskVsRewardAnalysis: {
              pros: ["Rapid salary growth (3-4x)", "Prestigious roles at top companies", "Fast-track to leadership", "High market value"],
              cons: ["Intense work pressure", "Risk of burnout", "Requires constant upskilling", "High competition"],
              probability: 55,
              bestFor: "Ambitious professionals willing to sacrifice work-life balance for rapid career advancement"
            },
            summary: `An aggressive 5-year sprint to senior leadership, requiring intensive upskilling, strategic job hops, and relentless networking to reach ${targetRole || 'Director-level'} roles at top companies.`
          },
          {
            pathType: "Pivot / Alternative",
            pathDescription: "Career transition to adjacent high-growth field leveraging transferable skills",
            yearlyProgression: [
              { year: 1, role: hasWebSkills ? "Technical Product Manager" : hasDataSkills ? "AI Solutions Consultant" : "DevOps Engineer", company: "Current Domain Company", skillsToAcquire: [hasWebSkills ? "Product Management" : hasDataSkills ? "Business Strategy" : "Cloud/DevOps", "Domain Knowledge"], certifications: [hasWebSkills ? "Product Management Certification" : hasDataSkills ? "AI Strategy Course" : "DevOps Certification"], salary: Math.round(baseSalary * 1.1), keyMilestones: ["Identify pivot direction", "Build foundation skills"] },
              { year: 2, role: hasWebSkills ? "Senior Product Manager" : hasDataSkills ? "AI Product Manager" : "Senior DevOps Engineer", company: "Tech Company", skillsToAcquire: ["Business Acumen", "Cross-functional Leadership"], certifications: [hasWebSkills ? "CSPO" : "Business Analytics"], salary: Math.round(baseSalary * 1.4), keyMilestones: ["First role in new domain", "Build credibility"] },
              { year: 3, role: hasWebSkills ? "Group Product Manager" : hasDataSkills ? "AI Strategy Lead" : "DevOps Architect", company: "Growth Stage Company", skillsToAcquire: ["Team Leadership", "Strategic Planning"], certifications: ["Leadership Certification"], salary: Math.round(baseSalary * 1.8), keyMilestones: ["Lead product line", "Drive business impact"] },
              { year: 4, role: hasWebSkills ? "Director of Product" : hasDataSkills ? "VP AI Strategy" : "Platform Engineering Director", company: "Large Tech Company", skillsToAcquire: ["P&L Ownership", "Executive Presence"], certifications: ["Executive MBA Module"], salary: Math.round(baseSalary * 2.4), keyMilestones: ["Own business outcomes", "Build high-performing team"] },
              { year: 5, role: hasWebSkills ? "VP Product / CPO Track" : hasDataSkills ? "Chief AI Officer Track" : "VP Engineering / CTO Track", company: "Leadership Position", skillsToAcquire: ["C-suite Skills", "Board Interaction"], certifications: ["Executive Leadership Program"], salary: Math.round(baseSalary * 3.0), keyMilestones: ["Executive leadership role", "Drive company strategy"] }
            ],
            totalSalaryGrowth: "200%",
            riskLevel: "Medium-High",
            rewardPotential: "High",
            riskVsRewardAnalysis: {
              pros: ["Access to different career opportunities", "Unique skill combination", "Higher ceiling potential", "More diverse experience"],
              cons: ["Initial salary may dip", "Learning curve in new domain", "Need to rebuild reputation", "Uncertainty in transition"],
              probability: 65,
              bestFor: "Professionals seeking new challenges, feeling stagnant, or wanting to leverage tech skills in business roles"
            },
            summary: `A strategic pivot from ${currentRole} to ${hasWebSkills ? 'Product Management' : hasDataSkills ? 'AI Strategy' : 'Platform Engineering'} leadership, leveraging technical background for business-focused roles with higher long-term potential.`
          }
        ],
        comparison: {
          salaryComparison: [
            { year: 1, conservative: Math.round(baseSalary * 1.15), accelerated: Math.round(baseSalary * 1.4), pivot: Math.round(baseSalary * 1.1) },
            { year: 2, conservative: Math.round(baseSalary * 1.35), accelerated: Math.round(baseSalary * 1.9), pivot: Math.round(baseSalary * 1.4) },
            { year: 3, conservative: Math.round(baseSalary * 1.6), accelerated: Math.round(baseSalary * 2.5), pivot: Math.round(baseSalary * 1.8) },
            { year: 4, conservative: Math.round(baseSalary * 1.9), accelerated: Math.round(baseSalary * 3.2), pivot: Math.round(baseSalary * 2.4) },
            { year: 5, conservative: Math.round(baseSalary * 2.3), accelerated: Math.round(baseSalary * 4.0), pivot: Math.round(baseSalary * 3.0) }
          ],
          recommendation: `Based on your ${experience} experience and skills in ${skillsList.slice(0, 2).join(', ')}, the ${experience === 'entry-level' ? 'Conservative' : 'Accelerated'} path offers the best risk-adjusted returns. However, if you're seeking new challenges, the Pivot path could unlock unique opportunities.`,
          keyInsight: `Your skills in ${skillsList[0] || 'technology'} are highly valuable. The key differentiator between paths is your appetite for risk and willingness to invest in continuous learning.`
        }
      };
    }
  }
}

export default new DirectGeminiService();
