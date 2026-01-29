// api/contact.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // Recipient is kept strictly server-side
        const targetEmail = 'andrulogvin@gmail.com';

        // Silent proxy via Formspree
        const response = await fetch(`https://formspree.io/f/mqakvjzl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                _subject: `Footography Support: ${subject}`,
                message: `From: ${name} (${email})\n\nSubject: ${subject}\n\nMessage: ${message}`,
                _to: targetEmail
            })
        });

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            const errData = await response.json();
            return res.status(500).json({ error: 'Mailing service error', details: errData });
        }
    } catch (error) {
        console.error('Contact API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
