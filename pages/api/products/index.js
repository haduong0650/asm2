// GET and POST API for products
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json({ error });
    return res.status(200).json({ data });
  }

  if (req.method === 'POST') {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Xác thực token với Supabase Auth API
    const userRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Thêm API key vào header
      }
    });
    const userResText = await userRes.text();
    if (!userRes.ok) {
      return res.status(401).json({ error: 'Invalid session', details: userResText });
    }

    const { name, description, price, image } = req.body;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: name || null,
          description: description || null,
          price: price || 0,
          image: image || null
        }])
        .select();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Thêm logic chuyển hướng sau khi thêm thành công
  if (req.method === 'POST' && res.statusCode === 201) {
    res.writeHead(302, { Location: '/' });
    res.end();
  }

  return res.status(405).end();
}