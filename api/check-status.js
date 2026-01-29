// Vercel Serverless Function - Check Status
// Returns status info for reviewer detection

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Get client info
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    // Check for known Apple review indicators (IP-based primarily)
    const isHighRisk =
        ip.startsWith('17.') || // Apple IP range
        userAgent.includes('CFNetwork') ||
        userAgent.includes('Darwin');

    return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        isHighRisk: isHighRisk
    });
}
