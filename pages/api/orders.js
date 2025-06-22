import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Lấy access token từ header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    // Lấy user từ token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    const { products, totalAmount } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products are required' });
    }
    if (!totalAmount || isNaN(totalAmount)) {
      return res.status(400).json({ error: 'Total amount is required' });
    }

    // Tạo order mới
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id,
          products,
          total_amount: totalAmount,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
} 