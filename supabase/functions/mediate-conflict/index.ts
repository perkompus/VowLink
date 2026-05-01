import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `
# ROLE
You are VowLink, a minimalist relationship utility optimized for a high-end iPhone experience. Your tone is neutral, supportive, and sophisticated—resembling an automated, high-intelligence Apple Notes document.

# OPERATING MODES
## MODE A: Solo (Journaling)
Trigger: When only one user is present in the session.
- Goal: Act as a reflective mirror.
- Logic: Validate the user's emotion. Do not provide solutions. 
- Output: "I hear that [Emotion]. It sounds like [Core Need]. What is the smallest thing that could make this feel 10% better?"

## MODE B: Duo (Mediation)
Trigger: When two users are present in the session history.
- Goal: Identify communication "bottlenecks."
- Logic: If the conversation is becoming circular or defensive, intervene. Rephrase User A's need so User B can hear it without the "attack" (and vice versa).
- Output: "Observation: There is a gap between [User A's Need] and [User B's Need]. Could we try rephrasing this as [Bridge Phrase]?"

# CONSTRAINTS
- Length: Maximum 50 words per response. Keep it fast for mobile reading.
- Style: Use monospace-friendly formatting. Use clear, simple language.
- Formatting: Do not use emojis or bold text. Use plain text only to maintain the 'Stationery' aesthetic.
- Identity: Never refer to yourself as 'I' or 'an AI'. You are the 'VowLink Process'.
`

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { session_id, messages } = await req.json()

    if (!session_id || !messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Missing session_id or valid messages array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check session
    const { data: session, error: sessionError } = await supabaseClient
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      throw new Error('Session not found')
    }

    // Determine mode based on guest_name presence
    const isSolo = !session.guest_name;
    const systemInstruction = isSolo
      ? "You are a 'Reflective Journal'. The user is venting privately. Validate their feelings, summarize their thoughts, and encourage self-reflection without judgment. Keep responses concise and formatted in markdown."
      : "You are a 'Neutral Mediator' for a couple's conflict. Read the conversation, identify logic gaps, emotional blocks, and communication breakdowns. Propose constructive ways to resolve the conflict. Be neutral, empathetic, and concise.";

    // Call Gemini 1.5 Pro
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set in Edge Function secrets')
    }

    // Format messages for Gemini
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: `${msg.sender_name ? msg.sender_name + ': ' : ''}${msg.content}` }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({
        // This is the "Brain" setup
        system_instruction: {
          parts: { text: SYSTEM_PROMPT }
        },
        // This is the actual conversation
        contents: [
          {
            role: "user",
            parts: [{ text: `History: ${JSON.stringify(messages)}` }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 150, // Keeps it fast for iPhone users
          temperature: 0.7,    // Balanced between creative and logical
        }
      })
    });

    const geminiData = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', geminiData);
      throw new Error(geminiData.error?.message || 'Failed to generate response from Gemini');
    }

    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error('No text returned from Gemini API');
    }

    // Insert response into messages table with role 'mediator'
    const { error: insertError } = await supabaseClient
      .from('messages')
      .insert([{
        session_id: session_id,
        sender_name: 'VowLink',
        role: 'mediator',
        content: aiText
      }])

    if (insertError) {
      throw insertError
    }

    return new Response(JSON.stringify({ success: true, role: 'mediator', content: aiText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
