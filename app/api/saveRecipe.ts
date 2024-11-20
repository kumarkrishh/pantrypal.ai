import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const client = await clientPromise;
    const db = client.db('recipeApp');
    const collection = db.collection('recipes');

    const recipe = req.body;
    const userId = session.user.id;

    await collection.insertOne({ ...recipe, userId });

    return res.status(200).json({ message: 'Recipe saved successfully!' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
