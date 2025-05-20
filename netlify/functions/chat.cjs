const fetch = require('node-fetch');
const Busboy = require('busboy');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'OpenAI API key not set.' }) };
  }

  // Helper: parse multipart/form-data
  function parseFormData(event) {
    return new Promise((resolve, reject) => {
      const busboy = new Busboy({ headers: event.headers });
      const fields = {};
      let fileBuffer = null;
      let fileMime = null;

      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        fileMime = mimetype;
        const buffers = [];
        file.on('data', (data) => buffers.push(data));
        file.on('end', () => {
          fileBuffer = Buffer.concat(buffers);
        });
      });

      busboy.on('field', (fieldname, value) => {
        fields[fieldname] = value;
      });

      busboy.on('finish', () => {
        resolve({ fields, fileBuffer, fileMime });
      });

      busboy.on('error', reject);

      busboy.end(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
    });
  }

  // Detect content type
  const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
  let userMessage = null;
  let aiResponse = null;

  try {
    if (contentType.startsWith('multipart/form-data')) {
      // Handle image + text
      const { fields, fileBuffer, fileMime } = await parseFormData(event);

      if (!fileBuffer || !fileMime.startsWith('image/')) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No valid image uploaded.' }) };
      }

      // Prepare OpenAI vision message
      const base64Image = fileBuffer.toString('base64');
      const imageUrl = `data:${fileMime};base64,${base64Image}`;
      const userText = fields.content || '';
      const systemPrompt = fields.systemPrompt || '';
      const messages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        {
          role: 'user',
          content: [
            ...(userText ? [{ type: 'text', text: userText }] : []),
            { type: 'image_url', image_url: imageUrl }
          ]
        }
      ];

      // Call OpenAI GPT-4 Turbo with vision
      const openaiPayload = {
        model: 'gpt-4-vision-preview', // or 'gpt-4-turbo' if available
        messages,
        max_tokens: 1024
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(openaiPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { statusCode: response.status, body: JSON.stringify({ error: errorText }) };
      }

      const data = await response.json();
      aiResponse = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';

      // Return both user message and AI response
      return {
        statusCode: 200,
        body: JSON.stringify({
          userMessage: {
            id: Date.now().toString(),
            content: userText,
            sender: 'user',
            created_at: new Date().toISOString()
          },
          aiResponse
        })
      };
    } else {
      // Handle JSON (text-only)
      const body = JSON.parse(event.body);
      const { messages, systemPrompt } = body;
      if (!messages || !Array.isArray(messages)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid messages array.' }) };
      }

      const openaiPayload = {
        model: 'gpt-3.5-turbo',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages
        ],
        temperature: 0.7
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(openaiPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { statusCode: response.status, body: JSON.stringify({ error: errorText }) };
      }

      const data = await response.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}; 