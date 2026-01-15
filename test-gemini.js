import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCalMwTP7RMFC-0iCaPIREOfqzTLlTwfZk';

async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key:', API_KEY.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try different model names
    const models = [
      'gemini-1.5-pro',
      'gemini-1.5-flash-latest', 
      'gemini-1.0-pro',
      'models/gemini-pro'
    ];
    
    for (const modelName of models) {
      try {
        console.log(`\nTrying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello in JSON: {"message": "hello"}');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}!`);
        console.log('Response:', text);
        break;
      } catch (err) {
        console.log(`❌ ${modelName} failed:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testGemini();
