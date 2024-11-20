import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recipeData = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const newRecipe = new Recipe({
      ...recipeData,
      userId: session.user.id,
    });

    await db.collection('recipes').insertOne(newRecipe);

    return NextResponse.json({ message: 'Recipe saved successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
  }
}