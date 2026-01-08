/**
 * Diagnostic script to test Groq API connection
 * Run with: npx tsx scripts/test-groq-api.ts
 */

async function testGroqAPI() {
  console.log('🔍 Testing Groq API Connection...\n');

  // 1. Check if API key exists
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ NEXT_PUBLIC_GROQ_API_KEY not found in environment');
    console.log('\nSet it in .env.local:');
    console.log('NEXT_PUBLIC_GROQ_API_KEY=your_key_here\n');
    process.exit(1);
  }

  console.log('✅ API key found:', apiKey.substring(0, 10) + '...' + apiKey.slice(-5));

  // 2. Test simple API call
  console.log('\n🚀 Testing simple API call...\n');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "API connection successful" if you receive this message.' },
        ],
        temperature: 0.0,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:', response.status);
      console.error('Error:', errorText);
      process.exit(1);
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || '';

    console.log('✅ API Response:', answer);
    console.log('\n📊 API Metadata:');
    console.log('  Model:', data.model);
    console.log('  Tokens used:', data.usage?.total_tokens || 'unknown');
    console.log('  Response length:', answer.length, 'characters');

    // 3. Test evaluation-like call
    console.log('\n🧪 Testing evaluation-style call...\n');

    const evalResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI evaluator. Return a JSON object with scores for novelty, density, coherence, and alignment (0-10 scale).',
          },
          {
            role: 'user',
            content:
              'Evaluate this contribution: "A new approach to hydrogen storage using fractal geometries."',
          },
        ],
        temperature: 0.0,
        max_tokens: 500,
      }),
    });

    if (!evalResponse.ok) {
      const errorText = await evalResponse.text();
      console.error('❌ Evaluation test failed:', evalResponse.status);
      console.error('Error:', errorText);
      process.exit(1);
    }

    const evalData = await evalResponse.json();
    const evalAnswer = evalData.choices[0]?.message?.content || '';

    console.log('✅ Evaluation Response:');
    console.log(evalAnswer);
    console.log('\n📊 Evaluation Metadata:');
    console.log('  Tokens used:', evalData.usage?.total_tokens || 'unknown');
    console.log('  Response length:', evalAnswer.length, 'characters');

    console.log('\n✅ All tests passed! Groq API is working correctly.\n');
  } catch (error) {
    console.error('❌ Error during API test:', error);
    process.exit(1);
  }
}

// Run the test
testGroqAPI();

