const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { brand, model } = JSON.parse(event.body);

        if (!brand || !model) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Brand and model are required' })
            };
        }

        // API key stored in Netlify Environment Variables
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        const prompt = `Provide one very interesting, short fact or a brief history about the sneaker model: ${brand} ${model}. Be concise (max 3-4 sentences). Answer in English.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://footography.netlify.app'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]?.message?.content) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    fact: data.choices[0].message.content.trim()
                })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to get AI response' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
