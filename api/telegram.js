export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { botType, chatId, text } = req.body;

  const TOKENS = {
    admin: '8995301700:AAHIYK6ei30dgELRh3w2YZb31hcGfXdvxTo',
    otp: '8843164809:AAEdmjeVckjhfdpVNEsV5B1fanMyuorqrLA',
    buykey: '8899402629:AAFnNM6lxJPc1aQg6kXbG_f79PEvdoTb6sk'
  };

  const token = TOKENS[botType];
  if (!token) return res.status(400).json({ error: 'Invalid bot' });

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId || '7757046138', text, parse_mode: 'HTML' })
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
