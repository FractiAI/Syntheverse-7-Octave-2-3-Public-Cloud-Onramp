/**
 * Test Groq API Connection
 * 
 * This script tests the Groq API connection with the configured API key
 * and verifies that evaluations can be performed.
 */

// Check for API key in environment
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_GROK_API_KEY;

if (!GROQ_API_KEY) {
  console.error('❌ FATAL: GROQ API KEY NOT FOUND');
  console.error('');
  console.error('Environment variables checked:');
  console.error('  - NEXT_PUBLIC_GROQ_API_KEY:', process.env.NEXT_PUBLIC_GROQ_API_KEY ? '✅ SET' : '❌ NOT SET');
  console.error('  - NEXT_PUBLIC_GROK_API_KEY:', process.env.NEXT_PUBLIC_GROK_API_KEY ? '✅ SET' : '❌ NOT SET');
  console.error('');
  console.error('Please set one of these environment variables in Vercel:');
  console.error('  NEXT_PUBLIC_GROQ_API_KEY=gsk_...');
  console.error('');
  process.exit(1);
}

console.log('✅ Groq API key found');
console.log('Key preview:', GROQ_API_KEY.substring(0, 20) + '...');

async function testGroqConnection() {
  console.log('\n📡 Testing Groq API connection...\n');

  const testPrompt = `
Test submission for diagnostic purposes.

Title: Test Contribution - Quantum Computing Error Correction
Content: This paper explores novel quantum error correction codes using topological qubits. 
We demonstrate a new stabilizer code that achieves better error rates than surface codes 
under realistic noise conditions.
  `.trim();

  const systemPrompt = `You are an AI evaluator for Proof-of-Contribution (PoC) submissions.
Evaluate the submission on 4 dimensions (0-2500 each):
1. Novelty: How new/original is the contribution?
2. Density: How much value per unit content?
3. Coherence: How well-structured and clear?
4. Alignment: How well does it align with project goals?

Return ONLY valid JSON:
{
  "novelty": <number 0-2500>,
  "density": <number 0-2500>,
  "coherence": <number 0-2500>,
  "alignment": <number 0-2500>,
  "pod_score": <number 0-10000>,
  "metals": ["gold"|"silver"|"copper"],
  "classification": ["Research"|"Development"|"Alignment"],
  "redundancy": <number 0-100>
}`;

  try {
    const startTime = Date.now();
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: testPrompt },
        ],
        temperature: 0.0,
        max_tokens: 1500,
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Groq API Error (${response.status}):`, errorText);
      console.error('\nPossible issues:');
      console.error('  1. Invalid API key');
      console.error('  2. Rate limit exceeded');
      console.error('  3. Groq service down');
      console.error('  4. Network connectivity issues');
      process.exit(1);
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || '';

    console.log(`✅ Groq API connection successful (${elapsed}ms)`);
    console.log('');
    console.log('='.repeat(80));
    console.log('RAW RESPONSE:');
    console.log('='.repeat(80));
    console.log(answer);
    console.log('');
    console.log('='.repeat(80));
    console.log('');

    // Try to parse JSON
    let evaluation: any = null;
    try {
      evaluation = JSON.parse(answer.trim());
    } catch {
      // Try extracting from markdown code block
      const match = answer.match(/```json\s*([\s\S]*?)\s*```/i);
      if (match) {
        evaluation = JSON.parse(match[1].trim());
      }
    }

    if (evaluation) {
      console.log('✅ Parsed evaluation:');
      console.log(JSON.stringify(evaluation, null, 2));
      console.log('');
      console.log('Scores:');
      console.log(`  Novelty: ${evaluation.novelty || 0}/2500`);
      console.log(`  Density: ${evaluation.density || 0}/2500`);
      console.log(`  Coherence: ${evaluation.coherence || 0}/2500`);
      console.log(`  Alignment: ${evaluation.alignment || 0}/2500`);
      console.log(`  PoD Score: ${evaluation.pod_score || 0}/10000`);
      console.log('');

      if (evaluation.pod_score > 0) {
        console.log('✅ Groq API is working correctly!');
        console.log('');
        console.log('The issue is likely:');
        console.log('  1. Environment variable not set in Vercel production');
        console.log('  2. Database connection issues');
        console.log('  3. Payment flow not triggering evaluation');
      } else {
        console.log('⚠️  WARNING: Scores are 0!');
        console.log('This indicates the AI evaluation may not be working properly.');
      }
    } else {
      console.log('❌ Failed to parse JSON from response');
      console.log('Raw response does not contain valid JSON');
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('NEXT STEPS:');
    console.log('='.repeat(80));
    console.log('1. Verify NEXT_PUBLIC_GROQ_API_KEY is set in Vercel:');
    console.log('   https://vercel.com/[your-project]/settings/environment-variables');
    console.log('');
    console.log('2. Ensure key is set for all environments:');
    console.log('   ☐ Production');
    console.log('   ☐ Preview');
    console.log('   ☐ Development');
    console.log('');
    console.log('3. Redeploy after setting environment variables');
    console.log('');
    console.log('4. Run diagnostic SQL query in Supabase:');
    console.log('   Execute scripts/diagnose-submissions.sql');
    console.log('');

  } catch (error) {
    console.error('❌ Groq API connection failed:', error);
    console.error('');
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testGroqConnection();

