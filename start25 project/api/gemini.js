export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ error: 'Missing or invalid messages array' });
    }
    
    // Convert OpenAI-style messages to Gemini format
    const fullPrompt = messages.map(m => {
      if (m.role === 'system') return `System: ${m.content}`;
      if (m.role === 'user') return `User: ${m.content}`;
      if (m.role === 'assistant') return `Assistant: ${m.content}`;
      return m.content;
    }).join('\n\n');
    
    console.log('Gemini prompt length:', fullPrompt.length);

    // Try models in order: flash-lite -> flash -> pro
    const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];
    let lastError = null;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }]
            })
          }
        );

        const data = await response.json();
        
        if (data.error) {
          console.error(`Model ${model} error:`, data.error.message);
          lastError = data.error;
          // If model unavailable (503) or not found (404), try next model
          if (data.error.code === 503 || data.error.code === 404) {
            continue;
          }
          // For other errors, return immediately
          return res.status(400).json({ 
            error: data.error.message,
            details: data.error
          });
        }

        const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        console.log(`Success with model: ${model}`);
        
        return res.status(200).json({
          choices: [{
            message: {
              role: 'assistant',
              content: result
            }
          }],
          model: model
        });
        
      } catch (modelError) {
        console.error(`Model ${model} exception:`, modelError.message);
        lastError = modelError;
        continue; // Try next model
      }
    }

    // All models failed
    console.error('All Gemini models failed');
    return res.status(503).json({ 
      error: 'All AI models are currently unavailable. Please try again in a few moments.',
      lastError: lastError?.message
    });
    
  } catch (error) {
    console.error('Gemini API handler error:', error);
    res.status(500).json({ error: 'Failed to fetch from Gemini API' });
  }
}
