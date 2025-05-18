const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  console.log('Received request:', event.httpMethod, event.path);
  if (event.httpMethod !== 'POST') {
    console.error('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not set in environment variables.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OpenAI API key not set in environment variables.' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
    console.log('Parsed body:', body);
  } catch (err) {
    console.error('Invalid JSON:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const { messages, systemPrompt } = body;
  if (!messages || !Array.isArray(messages)) {
    console.error('Missing or invalid messages array:', messages);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing or invalid messages array.' })
    };
  }

  // Compose the OpenAI API request
  const openaiPayload = {
    model: 'gpt-3.5-turbo',
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages
    ],
    temperature: 0.7
  };

  try {
    console.log('Sending request to OpenAI API...');
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
      console.error('OpenAI API error:', response.status, errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorText })
      };
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}; 