import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase, insertRecipe } from 'lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectToDatabase();

  if (req.method === 'POST') {
    const recipe = req.body;
    try {
      const result = await insertRecipe(recipe);
      res.status(201).json({ message: 'Recipe inserted', recipeId: result.insertedId });
    } catch (error) {
      res.status(500).json({ message: 'Failed to insert recipe', error });
    }
  } else if (req.method === 'GET') {
    try {
      const recipes = await db.collection('recipes').find({}).toArray();
      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recipes', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}