// Test script for AI Career Twin API
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCu0QIih5YT8M8GsyhiZ2maqjtdii3zbkk';

async function testCareerTwinAPI() {
  console.log('🔑 Testing Career Twin API with key:', API_KEY.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an expert AI Career Advisor. Create a Career Twin analysis for:
- Education: B.Tech Computer Science
- Skills: JavaScript, React, Python, Node.js, MongoDB
- Experience: 2 years
- Interests: AI/ML, Web Development
- Goals: Become a senior full-stack developer

Return JSON with:
{
  "professionalIdentity": { "archetype": "...", "summary": "...", "uniqueValue": "..." },
  "strengthsAndDifferentiators": {
    "coreStrengths": ["str1", "str2"],
    "competitiveAdvantages": ["adv1"],
    "strengthScores": { "technical": 75, "softSkills": 70, "domainExpertise": 65, "leadership": 55, "innovation": 70, "communication": 68 }
  },
  "roleSuitability": [
    { "rank": 1, "role": "Role Name", "suitabilityScore": 85, "salaryRange": "₹X-Y LPA", "demandLevel": "high", "reasoning": "...", "keyMatchingSkills": ["skill1"] }
  ],
  "growthPotential": {
    "shortTerm": "...", "midTerm": "...", "longTerm": "...",
    "marketDemandForecast": { "current": 70, "sixMonths": 75, "oneYear": 80, "twoYears": 85, "fiveYears": 88 }
  },
  "riskFactorsAndImprovements": {
    "marketRisks": ["risk1"],
    "skillGaps": ["gap1"],
    "riskScores": { "automationRisk": 30, "marketSaturation": 45, "skillObsolescence": 35, "competitionLevel": 50 }
  }
}

Generate TOP 3 roles only. Return ONLY valid JSON.`;

    console.log('📡 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ RAW RESPONSE:');
    console.log(text.substring(0, 600) + '...');
    
    // Parse JSON
    const cleanedResponse = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleanedResponse);
    
    console.log('\n✅ PARSED DATA:');
    
    console.log('\n=== PROFESSIONAL IDENTITY ===');
    console.log('Archetype:', data.professionalIdentity?.archetype);
    console.log('Summary:', data.professionalIdentity?.summary?.substring(0, 150) + '...');
    
    console.log('\n=== STRENGTHS ===');
    console.log('Core Strengths:', data.strengthsAndDifferentiators?.coreStrengths?.join(', '));
    console.log('Strength Scores:', JSON.stringify(data.strengthsAndDifferentiators?.strengthScores));
    
    console.log('\n=== ROLE SUITABILITY (Top 5) ===');
    data.roleSuitability?.forEach((role, i) => {
      console.log(`  ${role.rank}. ${role.role} - ${role.suitabilityScore}% (${role.demandLevel})`);
      console.log(`     Salary: ${role.salaryRange}`);
      console.log(`     Reasoning: ${role.reasoning?.substring(0, 100)}...`);
    });
    
    console.log('\n=== GROWTH POTENTIAL ===');
    console.log('Short Term:', data.growthPotential?.shortTerm?.substring(0, 100) + '...');
    console.log('Market Forecast:', JSON.stringify(data.growthPotential?.marketDemandForecast));
    
    console.log('\n=== RISK FACTORS ===');
    console.log('Market Risks:', data.riskFactorsAndImprovements?.marketRisks?.join(', '));
    console.log('Risk Scores:', JSON.stringify(data.riskFactorsAndImprovements?.riskScores));
    
    console.log('\n🎉 Career Twin API test SUCCESSFUL!');
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

testCareerTwinAPI();
