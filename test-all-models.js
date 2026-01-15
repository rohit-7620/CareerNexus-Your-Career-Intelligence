// Test available Gemini models and try all possible model names
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCalMwTP7RMFC-0iCaPIREOfqzTLlTwfZk';

async function testAllModels() {
  console.log('🔍 Testing all possible Gemini model names');
  console.log('🔑 API Key:', API_KEY.substring(0, 15) + '...');
  console.log('='.repeat(60));

  const genAI = new GoogleGenerativeAI(API_KEY);

  // All possible model names to try
  const modelNames = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-pro-latest',
    'gemini-1.0-pro',
    'gemini-1.0-pro-latest',
    'models/gemini-pro',
    'models/gemini-1.5-flash',
    'text-bison-001',
    'chat-bison-001'
  ];

  const testPrompt = 'Say hello in 5 words';

  for (const modelName of modelNames) {
    try {
      console.log(`\n🔄 Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(testPrompt);
      const text = result.response.text();
      console.log(`✅ SUCCESS: ${modelName}`);
      console.log(`   Response: ${text}`);
      return modelName; // Return first working model
    } catch (error) {
      const shortError = error.message.split('\n')[0].substring(0, 80);
      console.log(`❌ Failed: ${shortError}...`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('❌ NO MODELS WORK - API KEY IS INVALID OR EXPIRED');
  console.log('='.repeat(60));
  console.log('\n💡 To fix this:');
  console.log('   1. Go to https://aistudio.google.com/apikey');
  console.log('   2. Create a new API key');
  console.log('   3. Make sure Gemini API is enabled in your Google Cloud project');
  console.log('   4. Update the API key in directGeminiService.js');
  
  return null;
}

testAllModels();
