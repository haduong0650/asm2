// import connectMongo from '../../../lib/mongodb';
// import Product from '../../../models/Product';

// export default async function handler(req, res) {
//   try {
//     await connectMongo();

//     if (req.method === 'GET') {
//       const products = await Product.find();
//       return res.status(200).json(products);
//     }

//     if (req.method === 'POST') {
//       const newProduct = await Product.create(req.body);
//       return res.status(201).json(newProduct);
//     }
//   } catch (error) {
//     console.error('API Error:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }