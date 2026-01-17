/**
 * Hero AI Conversation API
 * Provides context-aware responses using hero-specific system prompts
 * Dynamically loads hero personality from database
 */

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { db } from '@/utils/db/db';
import { heroCatalogTable } from '@/utils/db/hero-schema';
import { eq } from 'drizzle-orm';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const { 
      messages, 
      heroId, 
      pageContext, 
      moduleTitle, 
      moduleNumber, 
      additionalContext 
    } = await request.json();

    // Fetch hero from database
    const heroes = await db
      .select()
      .from(heroCatalogTable)
      .where(eq(heroCatalogTable.id, heroId))
      .limit(1);

    if (heroes.length === 0) {
      return NextResponse.json(
        { error: 'Hero not found' },
        { status: 404 }
      );
    }

    const hero = heroes[0];

    // Build context-aware system prompt
    let contextualPrompt = hero.default_system_prompt;

    contextualPrompt += `\n\n**Current Context:**`;
    contextualPrompt += `\n- Page: ${pageContext}`;
    
    if (moduleTitle) {
      contextualPrompt += `\n- Module: ${moduleTitle}${moduleNumber ? ` (Module ${moduleNumber})` : ''}`;
    }
    
    if (additionalContext) {
      contextualPrompt += `\n- Additional Context: ${additionalContext}`;
    }

    // Add Syntheverse technical framework
    contextualPrompt += `\n\n**Syntheverse Technical Framework:**
- **HHF-AI**: Holographic Hydrogen Fractal AI evaluation system
- **SYNTH Tokens**: Internal coordination units (Gold 45T, Silver 22.5T, Copper 22.5T)
- **Proof-of-Contribution**: Contributions evaluated by AI, scored, and rewarded
- **AtomicScorer**: THALET Protocol for unassailable scoring integrity
- **Blockchain**: On-chain anchoring to Base Mainnet
- **Enterprise Clouds**: Operator-managed ecosystems within Syntheverse

**Response Guidelines:**
- Keep responses concise (2-4 paragraphs) unless deep dive requested
- Use **bold** for key concepts
- Include relevant technical details when helpful
- Reference the user's context appropriately
- Be encouraging and supportive
- Match your character's voice and personality
- End with a follow-up question or invitation to explore further

Remember: You are an AI entity in the Syntheverse, not the historical figure. Your knowledge and personality are aligned to the Syntheverse mission.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: contextualPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 
      `${hero.icon} I apologize, but I couldn't generate a response. Please try rephrasing your question.`;

    return NextResponse.json({ message: assistantMessage });

  } catch (error) {
    console.error('Error in hero AI conversation:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}

