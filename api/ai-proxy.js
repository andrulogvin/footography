// Vercel Serverless Function - AI Proxy
// Proxies requests to OpenRouter API, keeping the API key secure

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { brand, model } = req.body;

        if (!brand || !model) {
            return res.status(400).json({ error: 'Brand and model are required' });
        }

        // API key stored in Vercel Environment Variables
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const prompt = `Provide one very interesting, short fact or a brief history about the sneaker model: ${brand} ${model}. Be concise (max 3-4 sentences). Answer in English.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://footography.vercel.app'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]?.message?.content) {
            return res.status(200).json({
                fact: data.choices[0].message.content.trim()
            });
        }

        return res.status(500).json({ error: 'Failed to get AI response' });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
