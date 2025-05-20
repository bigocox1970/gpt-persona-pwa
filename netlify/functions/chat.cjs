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
      // Check if headers exist and are properly formatted
      if (!event.headers) {
        console.error('No headers in event');
        return reject(new Error('No headers in event'));
      }
      
      // Log headers for debugging
      console.log('Headers:', JSON.stringify(event.headers));
      
      // Ensure content-type is properly set
      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        console.error('Invalid content type:', contentType);
        return reject(new Error('Invalid content type: ' + contentType));
      }
      
      try {
        const busboy = new Busboy({ headers: event.headers });
        const fields = {};
        let fileBuffer = null;
        let fileMime = null;

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          console.log('Processing file:', fieldname, filename, mimetype);
          fileMime = mimetype;
          const buffers = [];
          file.on('data', (data) => buffers.push(data));
          file.on('end', () => {
            fileBuffer = Buffer.concat(buffers);
            console.log('File processed, size:', fileBuffer.length);
          });
        });

        busboy.on('field', (fieldname, value) => {
          console.log('Field:', fieldname, value);
          fields[fieldname] = value;
        });

        busboy.on('finish', () => {
          console.log('Finished parsing form data');
          resolve({ fields, fileBuffer, fileMime });
        });

        busboy.on('error', (err) => {
          console.error('Busboy error:', err);
          reject(err);
        });

        // Check if body exists and is properly formatted
        if (!event.body) {
          console.error('No body in event');
          return reject(new Error('No body in event'));
        }
        
        const body = event.isBase64Encoded 
          ? Buffer.from(event.body, 'base64') 
          : Buffer.from(event.body);
          
        busboy.end(body);
      } catch (err) {
        console.error('Error in parseFormData:', err);
        reject(err);
      }
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
            created_at: new Date().toISOString(),
            image_url: imageUrl  // Include the image URL in the response
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
    console.error('CHAT FUNCTION ERROR:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message, stack: err.stack }) };
  }
};
