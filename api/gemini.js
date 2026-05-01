export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ error: 'Missing or invalid messages array' });
    }
    
    // If client requests a Groq model, route directly to Groq
    const groqModels = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    if (model && groqModels.some(m => model.includes(m))) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: req.body.temperature || 0.7
          })
        });

        const groqData = await groqResponse.json();
        
        if (groqData.error) {
          console.error('Groq error:', groqData.error);
          // Fall through to Gemini
        } else {
          console.log('Success with Groq model:', model);
          return res.status(200).json(groqData);
        }
      } catch (groqError) {
        console.error('Groq exception:', groqError.message);
        // Fall through to Gemini
      }
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

    // All Gemini models failed, try Groq as fallback
    console.error('All Gemini models failed, trying Groq fallback');
    
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: messages,
          temperature: 0.7
        })
      });

      const groqData = await groqResponse.json();
      
      if (groqData.error) {
        console.error('Groq fallback also failed:', groqData.error);
        return res.status(503).json({ 
          error: 'All AI models are currently unavailable. Please try again in a few moments.',
          lastError: lastError?.message
        });
      }

      console.log('Success with Groq fallback');
      return res.status(200).json(groqData);
      
    } catch (groqError) {
      console.error('Groq fallback exception:', groqError.message);
      return res.status(503).json({ 
        error: 'All AI models are currently unavailable. Please try again in a few moments.',
        lastError: lastError?.message
      });
    }
    
  } catch (error) {
    console.error('Gemini API handler error:', error);
    res.status(500).json({ error: 'Failed to fetch from Gemini API' });
  }
}
