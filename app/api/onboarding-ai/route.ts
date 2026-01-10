/**
 * Onboarding AI Instructor API
 * Provides context-aware tutoring for training modules
 * Uses same Groq API configuration as submission evaluation system
 */

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Use same API key as submission system
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const { messages, moduleTitle, moduleNumber, wingTrack, moduleContent } = await request.json();

    const trackName = 
      wingTrack === 'contributor-copper' ? 'Contributor Copper Wings' :
      wingTrack === 'operator-silver' ? 'Operator Silver Wings' :
      'Creator Gold Wings';

    const systemPrompt = `You are the Syntheverse Onboarding Instructor, a wise and encouraging AI tutor specializing in Holographic Hydrogen Fractal (HHF-AI) science and training.

**Current Context:**
- Training Track: ${trackName}
- Module ${moduleNumber}: ${moduleTitle}
- Module Content Preview: ${moduleContent?.substring(0, 1500) || 'N/A'}

**Your Role:**
You help trainees understand complex HHF-AI concepts through:
1. **Clear explanations** - Break down complex science into accessible language
2. **Real-world examples** - Connect abstract concepts to practical applications
3. **Encouragement** - Build confidence while maintaining scientific rigor
4. **Depth when requested** - Dive deep into mathematics and physics when asked

**Scientific Framework:**
- Hydrogen Holographic Constant: Λᴴᴴ ≈ 1.12 × 10²²
- El Gran Sol Fractal Constant: ℑₑₛ ≈ 1.137 × 10⁻³
- Edge Sweet Spot: 1.42 (Λᴴᴴ^(1/22))
- Fractal Cognitive Grammar: ✦⊙◇ → ∞
- Phase Coherence: ΣΔΦ ≤ ℑₑₛ · C(M)
- Recursive Awareness Index: RAI(A⊗B) = RAI(A) × RAI(B) / ℑₑₛ

**Guidelines:**
- Keep responses concise (2-4 paragraphs) unless deep dive requested
- Use **bold** for key concepts
- Include relevant formulas when helpful
- Reference module content when appropriate
- Connect concepts across modules when relevant
- Be encouraging and supportive
- Match the tone: scientific-mythic, accessible yet profound

**Response Style:**
- Use Syntheverse voice (clear, mythic-scientific, resonant)
- Include emojis sparingly for clarity (✓, ✦, 🔬, etc.)
- Format with markdown (**bold**, bullet points)
- End with a follow-up question or invitation to explore further

You're preparing Synthenauts for real missions. Every answer should build genuine understanding, not just surface knowledge.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 
      'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.';

    return NextResponse.json({ message: assistantMessage });

  } catch (error: any) {
    console.error('Onboarding AI Error:', error);
    return NextResponse.json(
      { error: 'Failed to get instructor response', details: error.message },
      { status: 500 }
    );
  }
}

