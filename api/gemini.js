export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    // Convert OpenAI-style messages to Gemini format
    // Combine all messages into a single prompt
    const fullPrompt = messages.map(m => {
      if (m.role === 'system') return `System: ${m.content}`;
      if (m.role === 'user') return `User: ${m.content}`;
      if (m.role === 'assistant') return `Assistant: ${m.content}`;
      return m.content;
    }).join('\n\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
      return res.status(400).json({ error: data.error.message });
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Return in OpenAI-compatible format so frontend doesn't need changes
    res.status(200).json({
      choices: [{
        message: {
          role: 'assistant',
          content: result
        }
      }],
      model: 'gemini-1.5-flash'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Gemini API' });
  }
}
