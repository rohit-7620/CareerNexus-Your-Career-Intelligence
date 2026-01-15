import directGeminiService from './directGeminiService';

const API_BASE_URL = '/api';

export const advancedAIService = {
  // Mock Interview
  getMockInterviewQuestion: async (jobRole, difficulty, questionNumber) => {
    try {
      const result = await directGeminiService.generateMockQuestion(jobRole, difficulty);
      if (result) {
        return {
          question: result.question,
          keyPoints: result.expectedPoints,
          type: result.type
        };
      }
      throw new Error('No result from Gemini');
    } catch (error) {
      console.error('Mock interview question error:', error);
      return {
        question: `Tell me about a challenging project you worked on as a ${jobRole}?`,
        keyPoints: [
          'Problem identification and analysis',
          'Solution approach and technical decisions',
          'Results and impact',
          'Lessons learned',
        ],
      };
    }
  },

  evaluateInterview: async (question, answer, role) => {
    try {
      const result = await directGeminiService.evaluateInterview(question, answer);
      if (result) {
        return {
          overallScore: result.overallScore,
          scores: result.scores,
          feedback: result.improvements.join(' '),
          strengths: result.strengths.join(', '),
          modelAnswer: result.betterAnswer,
        };
      }
      throw new Error('No result from Gemini');
    } catch (error) {
      console.error('Interview evaluation error:', error);
      return {
        overallScore: 75,
        scores: {
          confidence: 80,
          clarity: 75,
          relevance: 70,
          structure: 75,
          impact: 72,
        },
        feedback: 'Good answer with clear structure. Work on providing more specific examples.',
        modelAnswer: 'A great answer would include specific metrics, challenges faced, and measurable outcomes.',
      };
    }
  },

  // Career Prediction
  predictCareerPath: async (currentRole, yearsExperience, skills) => {
    try {
      const result = await directGeminiService.predictCareerPath({
        currentRole,
        yearsOfExperience: yearsExperience,
        skills,
        goals: 'Career advancement'
      });
      
      if (result && result.trajectory) {
        return {
          trajectoryData: result.trajectory.map(t => ({
            year: `Year ${t.year}`,
            salary: t.salary,
            role: t.role
          })),
          careerPath: result.trajectory.map(t => ({
            year: t.year,
            title: t.role,
            skillsToDevelop: t.skills,
            salary: t.salary,
          })),
          growthOpportunities: result.opportunities.map(opp => ({
            role: opp,
            description: `Opportunity to grow into ${opp}`,
            requirements: result.milestones
          })),
          milestones: result.milestones
        };
      }
      throw new Error('No result from Gemini');
    } catch (error) {
      console.error('Career prediction error:', error);
      return {
        trajectoryData: [
          { year: 'Year 1', salary: 75000, role: 'Current Role' },
          { year: 'Year 2', salary: 85000, role: 'Senior Role' },
          { year: 'Year 3', salary: 100000, role: 'Lead Role' },
          { year: 'Year 4', salary: 120000, role: 'Manager Role' },
          { year: 'Year 5', salary: 150000, role: 'Director Role' },
        ],
        careerPath: [
          {
            year: 1,
            title: 'Senior Engineer',
            skillsToDevelop: ['System Design', 'Mentoring', 'Architecture'],
            salary: 85000,
          },
          {
            year: 3,
            title: 'Tech Lead',
            skillsToDevelop: ['Leadership', 'Project Management', 'Strategy'],
            salary: 110000,
          },
          {
            year: 5,
            title: 'Engineering Manager',
            skillsToDevelop: ['Team Building', 'Budget Management', 'Strategic Planning'],
            salary: 150000,
          },
        ],
        growthOpportunities: [
          {
            role: 'Staff Engineer',
            description: 'Deep expertise in system architecture',
            requirements: ['15+ years experience', 'Expert-level coding', 'Mentoring others'],
          },
          {
            role: 'Engineering Director',
            description: 'Lead multiple teams and drive product strategy',
            requirements: ['People management', 'Strategic thinking', 'Business acumen'],
          },
        ],
      };
    }
  },

  // Skill Gap Analysis
  analyzeSkillGap: async (currentRole, targetRole, currentSkills) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-skill-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentRole, targetRole, currentSkills }),
      });
      return await response.json();
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      return {
        skillComparison: [
          { skill: 'Technical Depth', current: 65, target: 90 },
          { skill: 'Problem Solving', current: 75, target: 90 },
          { skill: 'Communication', current: 70, target: 85 },
          { skill: 'Leadership', current: 50, target: 80 },
        ],
        mustHaveSkills: [
          { name: 'Advanced System Design', description: 'Scale systems to millions of users', priority: 'CRITICAL' },
          { name: 'Cloud Architecture', description: 'AWS/GCP/Azure expertise', priority: 'CRITICAL' },
        ],
        goodToHaveSkills: [
          { name: 'Team Leadership', description: 'Managing engineers', timeline: '6-12 months' },
          { name: 'Data Structures & Algorithms', description: 'Advanced optimization', timeline: '3-6 months' },
        ],
        futureSkills: [
          { name: 'AI/ML Integration', description: 'Future industry standard' },
          { name: 'Distributed Systems', description: 'Scalability expertise' },
        ],
        learningPath: [
          {
            phase: 'Foundation (Weeks 1-4)',
            duration: '4 weeks',
            difficulty: 'Intermediate',
            activities: [
              'Complete 2-3 online courses',
              'Build 2 side projects',
              'Read industry blogs',
            ],
            resources: [
              { name: 'Udemy Course', description: 'Advanced React Patterns', type: 'Video' },
              { name: 'Dev.to Articles', description: 'System Design', type: 'Blog' },
            ],
            milestone: 'Complete foundation projects',
          },
          {
            phase: 'Practice (Weeks 5-12)',
            duration: '8 weeks',
            difficulty: 'Advanced',
            activities: [
              'Contribute to open source',
              'Build production projects',
              'Write technical articles',
            ],
            resources: [
              { name: 'GitHub Projects', description: 'Real-world applications', type: 'Code' },
            ],
            milestone: 'Launch production application',
          },
        ],
      };
    }
  },

  // Salary Negotiation
  negotiateSalary: async (jobTitle, location, yearsExperience, offeredSalary) => {
    try {
      const response = await fetch(`${API_BASE_URL}/negotiate-salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, location, yearsExperience, offeredSalary }),
      });
      return await response.json();
    } catch (error) {
      console.error('Salary negotiation error:', error);
      return {
        marketBenchmarks: [
          { percentile: '25th', salary: 70000 },
          { percentile: '50th', salary: 85000 },
          { percentile: '75th', salary: 110000 },
          { percentile: '90th', salary: 135000 },
        ],
        recommendedSalary: 115000,
        offeredSalary: 100000,
        potentialIncrease: 15000,
        emailTemplate: `Dear Hiring Manager,

Thank you for the offer. I'm excited about this opportunity. Based on my research of market rates for this role in ${location}, with my ${yearsExperience} years of experience, I'd like to discuss a salary of $115,000.

I bring [specific achievements] which I believe add significant value.

Best regards`,
        phoneScript: `Thank you for the offer. I'm very interested. Based on market research and my experience level, I was expecting closer to $115,000. Is there flexibility on the offer?`,
        strategies: [
          { name: 'Delay Acceptance', description: 'Take time to consider', effectiveness: '85%' },
          { name: 'Provide Market Data', description: 'Reference Glassdoor/Levels.fyi', effectiveness: '90%' },
          { name: 'Non-Salary Benefits', description: 'Negotiate equity, remote work', effectiveness: '95%' },
        ],
        talkingPoints: [
          'I have $yearsExperience years of proven experience',
          'Market data shows higher range for this role in this location',
          'My skills directly align with team needs',
        ],
      };
    }
  },

  // JD Intelligence
  analyzeJobDescription: async (jobDescription) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });
      return await response.json();
    } catch (error) {
      console.error('JD analysis error:', error);
      return {
        requiredSkills: [
          { name: 'React', importance: 95, frequency: 12 },
          { name: 'TypeScript', importance: 85, frequency: 10 },
          { name: 'System Design', importance: 80, frequency: 8 },
        ],
        atsKeywords: [
          'React', 'JavaScript', 'TypeScript', 'REST API', 'Git',
          'Agile', 'Problem-solving', 'Communication', 'Team player',
        ],
        softSkills: [
          {
            name: 'Communication',
            description: 'Clear articulation of ideas',
            examples: ['Present in team meetings', 'Write clear documentation'],
          },
          {
            name: 'Leadership',
            description: 'Ability to guide and mentor',
            examples: ['Mentor junior developers', 'Lead project initiatives'],
          },
        ],
        hiddenRequirements: [
          { name: 'System Design Knowledge', description: 'Building scalable systems', why: 'Senior level role' },
          { name: 'Open Source Contribution', description: 'Community involvement', why: 'Company values' },
        ],
        experienceLevel: 'Senior',
        yearsRequired: 5,
        experienceDescription: 'Requires 5+ years of relevant experience with proven track record',
        customizationTips: [
          'Use exact keywords from JD in resume',
          'Highlight specific achievements with metrics',
          'Match skills order to JD requirements',
          'Include relevant certifications',
        ],
      };
    }
  },

  // Learning Roadmap
  generateLearningRoadmap: async (targetSkill, currentLevel, targetLevel, hoursPerWeek) => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-learning-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetSkill, currentLevel, targetLevel, hoursPerWeek }),
      });
      return await response.json();
    } catch (error) {
      console.error('Learning roadmap error:', error);
      return {
        duration: '12 weeks',
        totalHours: 120,
        phases: [
          {
            title: 'Foundation (Weeks 1-4)',
            duration: '4 weeks',
            hoursPerWeek: 10,
            description: 'Master core concepts and fundamentals',
            topics: ['Basics', 'Core Concepts', 'Best Practices'],
            activities: [
              'Complete Udemy course',
              'Read documentation',
              'Build first project',
            ],
            resources: [
              { name: 'Udemy', description: 'Complete course', type: 'Video Course' },
              { name: 'Documentation', description: 'Official docs', type: 'Reading' },
            ],
            milestone: 'Build first working project',
          },
          {
            title: 'Practice (Weeks 5-8)',
            duration: '4 weeks',
            hoursPerWeek: 12,
            description: 'Build projects and gain practical experience',
            topics: ['Projects', 'Real-world scenarios', 'Optimization'],
            activities: [
              'Build 2-3 projects',
              'Contribute to open source',
              'Write blog posts',
            ],
            resources: [
              { name: 'GitHub', description: 'Real projects', type: 'Hands-on' },
              { name: 'Dev.to', description: 'Learning resources', type: 'Blog' },
            ],
            milestone: 'Complete production-ready project',
          },
          {
            title: 'Mastery (Weeks 9-12)',
            duration: '4 weeks',
            hoursPerWeek: 15,
            description: 'Advanced topics and specialization',
            topics: ['Advanced patterns', 'Performance', 'Architecture'],
            activities: [
              'Advanced tutorials',
              'Mentor others',
              'Build advanced projects',
            ],
            resources: [
              { name: 'Advanced Courses', description: 'Deep dives', type: 'Video Course' },
            ],
            milestone: 'Achieve expertise level',
          },
        ],
        certifications: [
          {
            name: 'Professional Certificate',
            description: 'Industry-recognized certification',
            difficulty: 'Intermediate',
            duration: '8 weeks',
            cost: '$199',
          },
        ],
        successTips: [
          'Practice consistently every day',
          'Build real projects not just tutorials',
          'Join community and get feedback',
          'Track progress with milestones',
        ],
      };
    }
  },
};

export default advancedAIService;
