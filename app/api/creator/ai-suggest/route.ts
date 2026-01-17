/**
 * AI-Assisted Content Suggestion API
 * Uses Groq to generate intelligent prefill suggestions for hero/story creation
 * Analyzes what the creator has already filled in and suggests remaining fields
 */

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const { 
      contentType, // 'hero' or 'story'
      currentData, // What the creator has filled in so far
      targetField, // Specific field to generate, or 'all' for all empty fields
    } = await request.json();

    if (!contentType || !currentData) {
      return NextResponse.json(
        { error: 'contentType and currentData are required' },
        { status: 400 }
      );
    }

    // Build context-aware prompt based on what's already filled in
    let systemPrompt = '';
    let userPrompt = '';

    if (contentType === 'hero') {
      systemPrompt = `You are an expert Syntheverse character designer. Your role is to suggest coherent, compelling content for hero character creation based on what the creator has already defined.

**Syntheverse Context:**
Heroes are AI guide entities that embody specific principles and expertise within the Syntheverse ecosystem. They help users navigate different aspects of the platform.

**Guidelines:**
- Maintain consistency with already-defined fields
- Create compelling, distinct personalities
- Align with Syntheverse mission (PoC, HHF-AI, tokenomics, contribution)
- Use professional, clear language
- Be specific and actionable
- System prompts should define voice, role, expertise, and interaction style

**Output Format:**
Return ONLY a valid JSON object with suggested values for the requested fields. No markdown, no explanations, just the JSON.`;

      // Analyze what's already filled
      const filledFields = Object.entries(currentData)
        .filter(([key, value]) => value && value !== '' && (Array.isArray(value) ? value.length > 0 : true))
        .map(([key, value]) => `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n');

      const emptyFields = Object.keys(currentData)
        .filter(key => !currentData[key] || currentData[key] === '' || (Array.isArray(currentData[key]) && currentData[key].length === 0));

      userPrompt = `**Already Filled:**
${filledFields || '(nothing yet)'}

**Fields Needing Suggestions:**
${emptyFields.join(', ') || 'none'}

${targetField && targetField !== 'all' ? `Focus on generating content specifically for: "${targetField}"` : 'Generate suggestions for ALL empty fields.'}

Return a JSON object with suggested values. For example:
{
  "name": "Suggested hero name",
  "tagline": "Short tagline",
  "description": "Detailed description",
  "default_system_prompt": "You are [name], a Syntheverse AI guide...",
  "metadata": {
    "personality": "Personality description",
    "tone": "Communication tone",
    "style": "Interaction style"
  }
}`;

    } else if (contentType === 'story') {
      systemPrompt = `You are an expert Syntheverse narrative designer. Your role is to suggest coherent, engaging story content based on what the creator has already defined.

**Syntheverse Context:**
Stories are guided interaction narratives that help users achieve specific goals (learning, setup, exploration, etc.). Each story is led by a hero character.

**Guidelines:**
- Maintain consistency with the hero character and existing content
- Create clear, actionable narratives
- Define specific interaction goals
- System prompts should set scene, define hero behavior, and guide interaction flow
- Stories should be immersive but goal-oriented

**Output Format:**
Return ONLY a valid JSON object with suggested values for the requested fields. No markdown, no explanations, just the JSON.`;

      const filledFields = Object.entries(currentData)
        .filter(([key, value]) => value && value !== '' && (Array.isArray(value) ? value.length > 0 : true))
        .map(([key, value]) => `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n');

      const emptyFields = Object.keys(currentData)
        .filter(key => !currentData[key] || currentData[key] === '' || (Array.isArray(currentData[key]) && currentData[key].length === 0));

      userPrompt = `**Already Filled:**
${filledFields || '(nothing yet)'}

**Fields Needing Suggestions:**
${emptyFields.join(', ') || 'none'}

${targetField && targetField !== 'all' ? `Focus on generating content specifically for: "${targetField}"` : 'Generate suggestions for ALL empty fields.'}

Return a JSON object with suggested values. For example:
{
  "title": "Story title",
  "description": "Story description",
  "system_prompt": "Story Context: [context]\\n\\nAs the hero guiding this story, you will...\\n1. [step]\\n2. [step]",
  "context": "Narrative context and goals",
  "tags": ["tag1", "tag2"],
  "interaction_style": "conversational|tutorial|guided|exploratory"
}`;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8, // Higher creativity for content generation
      max_tokens: 1500,
      response_format: { type: "json_object" }, // Force JSON output
    });

    const suggestedContent = completion.choices[0]?.message?.content || '{}';

    let parsedSuggestions;
    try {
      parsedSuggestions = JSON.parse(suggestedContent);
    } catch (parseError) {
      console.error('Failed to parse AI suggestions:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI suggestions', raw: suggestedContent },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      suggestions: parsedSuggestions,
      targetField,
      contentType
    });

  } catch (error) {
    console.error('Error in AI suggestion generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions' },
      { status: 500 }
    );
  }
}

