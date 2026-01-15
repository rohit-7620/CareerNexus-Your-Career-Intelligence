const API_KEY = 'AIzaSyCalMwTP7RMFC-0iCaPIREOfqzTLlTwfZk';

async function testDirectAPI() {
  try {
    console.log('Testing direct API call...');
    
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    const body = {
      contents: [{
        parts: [{
          text: 'Generate a JSON with one job match: {"role": "Software Engineer", "salary": "10L"}'
        }]
      }]
    };
    
    console.log('Making request to:', url.replace(API_KEY, 'API_KEY'));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (data.candidates && data.candidates[0]) {
        const text = data.candidates[0].content.parts[0].text;
        console.log('\nGenerated text:', text);
      }
    } else {
      console.log('❌ ERROR:', data);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testDirectAPI();
