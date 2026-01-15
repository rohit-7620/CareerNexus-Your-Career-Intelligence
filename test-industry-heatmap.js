// Test script for Industry Heatmap API
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCXXAd_0sLg_papduWQ_RFXDoDPg-JSDaA';

async function testIndustryHeatmapAPI() {
  console.log('🔑 Testing Industry Heatmap API with key:', API_KEY.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an expert career analyst. Generate industry heatmap data for a software developer with skills in JavaScript, React, Python.

Return a JSON object with:
{
  "industries": [
    {
      "rank": 1,
      "name": "Industry Name",
      "description": "Brief description",
      "demandLevel": "High|Medium|Low",
      "demandScore": 85,
      "salaryGrowth": {
        "india": { "2024": 12, "2025": 15, "2026": 18, "2027": 22, "2028": 25 },
        "global": { "2024": 14, "2025": 17, "2026": 20, "2027": 24, "2028": 28 }
      },
      "avgSalary": { "india": "₹12-25 LPA", "global": "$80,000-$150,000" },
      "skillSaturation": "Low|Medium|High",
      "saturationPercent": 35,
      "entryBarrier": 3,
      "entryBarrierDescription": "What makes entry easy/hard",
      "topSkillsRequired": ["skill1", "skill2"],
      "topCompanies": { "india": ["Company1"], "global": ["Company1"] },
      "jobGrowthRate": "+25%",
      "futureOutlook": "Future prospects"
    }
  ],
  "insights": {
    "topRecommendation": "Best industry recommendation",
    "emergingTrend": "Key trend",
    "marketWarning": "Saturated markets",
    "salaryInsight": "Salary observation",
    "skillGapAlert": "Skills to develop"
  },
  "summary": "Overall summary"
}

Generate TOP 3 industries only. Return ONLY valid JSON.`;

    console.log('📡 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ RAW RESPONSE:');
    console.log(text.substring(0, 500) + '...');
    
    // Try to parse JSON
    const cleanedResponse = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleanedResponse);
    
    console.log('\n✅ PARSED DATA:');
    console.log('Industries found:', data.industries?.length || 0);
    
    if (data.industries) {
      data.industries.forEach((ind, i) => {
        console.log(`\n--- Industry ${i + 1}: ${ind.name} ---`);
        console.log(`  Rank: ${ind.rank}`);
        console.log(`  Description: ${ind.description?.substring(0, 100)}...`);
        console.log(`  Demand: ${ind.demandLevel} (Score: ${ind.demandScore})`);
        console.log(`  Salary Growth India 2024-2028: ${ind.salaryGrowth?.india?.['2024']}% → ${ind.salaryGrowth?.india?.['2028']}%`);
        console.log(`  Skill Saturation: ${ind.skillSaturation} (${ind.saturationPercent}%)`);
        console.log(`  Entry Barrier: ${ind.entryBarrier}/5`);
        console.log(`  Avg Salary India: ${ind.avgSalary?.india}`);
        console.log(`  Top Skills: ${ind.topSkillsRequired?.join(', ')}`);
      });
    }
    
    if (data.insights) {
      console.log('\n=== INSIGHTS ===');
      console.log('Top Recommendation:', data.insights.topRecommendation);
      console.log('Emerging Trend:', data.insights.emergingTrend);
      console.log('Market Warning:', data.insights.marketWarning);
    }
    
    console.log('\n🎉 Industry Heatmap API test SUCCESSFUL!');
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.message.includes('404')) {
      console.log('🔴 Model not found - trying different model...');
    }
  }
}

testIndustryHeatmapAPI();
