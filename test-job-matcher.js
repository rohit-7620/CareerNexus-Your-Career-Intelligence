// Test Job Matcher with Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyA7k_K2nX2RIVqH-I1lb13288lPhug6Fog';

async function testJobMatcher() {
  console.log('🧪 Testing Job Matcher with Gemini API');
  console.log('🔑 API Key:', API_KEY.substring(0, 15) + '...');
  console.log('='.repeat(60));

  // Test data
  const testData = {
    skills: ['React', 'JavaScript', 'Node.js', 'Python', 'Machine Learning'],
    experience: 'mid',
    location: 'Bangalore, India',
    jobType: 'Full-time'
  };

  console.log('\n📋 Test Input:');
  console.log('   Skills:', testData.skills.join(', '));
  console.log('   Experience:', testData.experience);
  console.log('   Location:', testData.location);
  console.log('='.repeat(60));

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try different model names
    const modelNames = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
    
    for (const modelName of modelNames) {
      console.log(`\n🔄 Trying model: ${modelName}`);
      
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `You are a job matching AI. Based on the following profile, generate 5 relevant job matches.

Profile:
- Skills: ${testData.skills.join(', ')}
- Experience Level: ${testData.experience}
- Location: ${testData.location}
- Job Type: ${testData.jobType}

Return ONLY a valid JSON array with exactly 5 job objects. Each job must have:
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "City, Country",
  "salary": "₹XX - ₹XX LPA",
  "matchScore": 85,
  "description": "Brief job description",
  "requirements": ["req1", "req2", "req3"],
  "applyLink": "https://linkedin.com/jobs/view/xxxxx"
}

Return ONLY the JSON array, no markdown, no explanation.`;

        console.log('📡 Sending request to Gemini API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('\n✅ SUCCESS! Model:', modelName);
        console.log('='.repeat(60));
        console.log('📤 Raw Response:');
        console.log(text);
        console.log('='.repeat(60));
        
        // Try to parse the JSON
        try {
          // Clean the response
          let cleanedText = text.trim();
          if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/, '').replace(/```\n?$/, '');
          } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/, '').replace(/```\n?$/, '');
          }
          
          const jobs = JSON.parse(cleanedText);
          
          console.log('\n✅ PARSED SUCCESSFULLY!');
          console.log('='.repeat(60));
          console.log(`📊 Found ${jobs.length} jobs:\n`);
          
          jobs.forEach((job, idx) => {
            console.log(`\n🎯 Job #${idx + 1}: ${job.title}`);
            console.log(`   🏢 Company: ${job.company}`);
            console.log(`   📍 Location: ${job.location}`);
            console.log(`   💰 Salary: ${job.salary}`);
            console.log(`   📈 Match Score: ${job.matchScore}%`);
            console.log(`   📝 Description: ${job.description?.substring(0, 100)}...`);
            console.log(`   🔗 Apply: ${job.applyLink}`);
          });
          
          console.log('\n' + '='.repeat(60));
          console.log('🎉 JOB MATCHER TEST PASSED!');
          console.log('='.repeat(60));
          
        } catch (parseError) {
          console.log('\n⚠️ Could not parse as JSON:', parseError.message);
          console.log('Raw text returned successfully though!');
        }
        
        return; // Success, exit
        
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed:`, modelError.message);
        if (modelError.message.includes('404')) {
          console.log('   → Model not available with this API key');
        }
      }
    }
    
    console.log('\n❌ All models failed. The API key may not have access to any models.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

testJobMatcher();
