export default function handler(req, res) {
  if (req.method === 'POST') {
    const { token } = req.body;
    console.log('Access token from client:', token);
    return res.status(200).json({ message: 'Token logged on server' });
  }
  return res.status(405).json({ error: 'Method not allowed' });
} 