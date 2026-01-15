// Test Career Simulator with Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCoZrg5nbpcOv2xt58W9vmhtdesHGpBkoA';

async function testCareerSimulator() {
  console.log('🚀 Testing Career Simulator with Gemini API');
  console.log('🔑 API Key:', API_KEY.substring(0, 15) + '...');
  console.log('='.repeat(70));

  // Test data
  const testData = {
    skills: 'React, Python, AWS, Machine Learning, Node.js',
    currentRole: 'Software Developer',
    experience: 'mid',
    currentSalary: 800000,
    targetRole: 'Senior Engineer'
  };

  console.log('\n📋 Test Profile:');
  console.log('   Skills:', testData.skills);
  console.log('   Current Role:', testData.currentRole);
  console.log('   Experience:', testData.experience);
  console.log('   Current Salary: ₹', (testData.currentSalary / 100000).toFixed(1), 'LPA');
  console.log('   Target Role:', testData.targetRole);
  console.log('='.repeat(70));

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert career advisor. Generate a detailed 5-year career simulation for a professional with:

Current Profile:
- Skills: ${testData.skills}
- Experience Level: ${testData.experience}
- Current Role: ${testData.currentRole}
- Current Salary: ₹${(testData.currentSalary / 100000).toFixed(1)} LPA
- Target/Dream Role: ${testData.targetRole}

Create 3 distinct career paths over 5 years:

1. CONSERVATIVE PATH: Steady growth within current domain
2. ACCELERATED PATH: Aggressive upskilling and rapid advancement
3. PIVOT/ALTERNATIVE PATH: Career transition to a related but different field

For EACH path, include year-wise: Role, Skills to acquire, Certifications, Salary, Key milestones.
Also include: Risk level, Reward potential, Pros/Cons analysis.

Return ONLY valid JSON in this format:
{
  "paths": [
    {
      "pathType": "Conservative",
      "pathDescription": "description",
      "yearlyProgression": [
        {"year": 1, "role": "...", "company": "...", "skillsToAcquire": ["..."], "certifications": ["..."], "salary": 900000, "keyMilestones": ["..."]}
      ],
      "totalSalaryGrowth": "130%",
      "riskLevel": "Low",
      "rewardPotential": "Moderate",
      "riskVsRewardAnalysis": {"pros": ["..."], "cons": ["..."], "probability": 85, "bestFor": "..."},
      "summary": "..."
    }
  ],
  "comparison": {
    "salaryComparison": [{"year": 1, "conservative": 900000, "accelerated": 1000000, "pivot": 850000}],
    "recommendation": "...",
    "keyInsight": "..."
  }
}`;

    console.log('\n📡 Sending request to Gemini API (gemini-2.5-flash)...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! Response received');
    console.log('='.repeat(70));
    
    // Clean and parse JSON
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }
    
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const simulation = JSON.parse(jsonMatch[0]);
      
      console.log('\n🎯 CAREER SIMULATION RESULTS');
      console.log('='.repeat(70));
      
      simulation.paths?.forEach((path, idx) => {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`📌 PATH ${idx + 1}: ${path.pathType.toUpperCase()}`);
        console.log(`${'='.repeat(70)}`);
        console.log(`📝 Description: ${path.pathDescription}`);
        console.log(`📈 Total Growth: ${path.totalSalaryGrowth}`);
        console.log(`⚠️ Risk Level: ${path.riskLevel}`);
        console.log(`🎁 Reward: ${path.rewardPotential}`);
        console.log(`📊 Success Probability: ${path.riskVsRewardAnalysis?.probability || 'N/A'}%`);
        
        console.log('\n📅 YEAR-WISE PROGRESSION:');
        console.log('-'.repeat(70));
        console.log('Year | Role                              | Salary    | Skills');
        console.log('-'.repeat(70));
        
        path.yearlyProgression?.forEach(year => {
          const role = (year.role || '').padEnd(33).substring(0, 33);
          const salary = `₹${(year.salary / 100000).toFixed(1)}L`.padEnd(9);
          const skills = (year.skillsToAcquire || []).slice(0, 2).join(', ');
          console.log(`  ${year.year}  | ${role} | ${salary} | ${skills}`);
        });
        
        console.log('\n✅ PROS:');
        path.riskVsRewardAnalysis?.pros?.forEach(pro => console.log(`   • ${pro}`));
        
        console.log('\n❌ CONS:');
        path.riskVsRewardAnalysis?.cons?.forEach(con => console.log(`   • ${con}`));
        
        console.log(`\n👤 Best For: ${path.riskVsRewardAnalysis?.bestFor || 'N/A'}`);
      });
      
      console.log('\n' + '='.repeat(70));
      console.log('💡 AI RECOMMENDATION');
      console.log('='.repeat(70));
      console.log(simulation.comparison?.recommendation || 'N/A');
      console.log('\n🔑 Key Insight:', simulation.comparison?.keyInsight || 'N/A');
      
      console.log('\n' + '='.repeat(70));
      console.log('🎉 CAREER SIMULATOR TEST PASSED!');
      console.log('='.repeat(70));
      
    } else {
      console.log('\n⚠️ Could not parse JSON, raw response:');
      console.log(text.substring(0, 1000));
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.message.includes('429')) {
      console.log('   → Rate limit exceeded. Wait a moment and try again.');
    } else if (error.message.includes('404')) {
      console.log('   → Model not available. Check API key permissions.');
    }
  }
}

testCareerSimulator();
