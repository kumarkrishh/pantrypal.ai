import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI || ''; // Ensure this is set in your .env.local file
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await client.connect();
      const database = client.db('recipeApp');
      const collection = database.collection('recipes');

      const recipe = req.body;
      await collection.insertOne(recipe);

      res.status(200).json({ message: 'Recipe saved successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to save the recipe.' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
