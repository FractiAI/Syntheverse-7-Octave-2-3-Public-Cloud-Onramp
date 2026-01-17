/**
 * Diagnostic endpoint to test Groq API connectivity and response
 * This helps debug the "zero scores after 6th submission" issue
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_GROK_API_KEY;
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
    environmentVariables: {
      NEXT_PUBLIC_GROQ_API_KEY: !!process.env.NEXT_PUBLIC_GROQ_API_KEY,
      NEXT_PUBLIC_GROK_API_KEY: !!process.env.NEXT_PUBLIC_GROK_API_KEY,
    },
  };

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Groq API key not configured',
      diagnostics,
    }, { status: 500 });
  }

  // Test simple Groq API call
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a test assistant. Respond with a simple JSON object.' },
          { role: 'user', content: 'Return this JSON: {"test": "success", "value": 100}' }
        ],
        temperature: 0.0,
        max_tokens: 100,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Groq API returned error',
        status: response.status,
        statusText: response.statusText,
        responseData,
        diagnostics,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Groq API is working correctly',
      groqResponse: responseData,
      diagnostics,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      errorType: error.name,
      errorStack: error.stack,
      diagnostics,
    }, { status: 500 });
  }
}

