import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getClientPromise } from '@/lib/mongodb';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recipeData = await request.json();
    const client = await getClientPromise();
    const db = client.db();

    // Ensure the 'id' field exists and is a string
    if (!recipeData.id) {
      return NextResponse.json({ error: 'Recipe ID is missing' }, { status: 400 });
    }

    recipeData.id = recipeData.id.toString();

    // Remove '_id' field if it exists to prevent immutable field update error
    if (recipeData._id) {
      delete recipeData._id;
    }

    // Update the recipe in the database
    const result = await db.collection('recipes').updateOne(
      { id: recipeData.id, userId: session.user.id },
      { $set: recipeData },
      { upsert: true } 
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      return NextResponse.json({ message: 'Recipe updated successfully!' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}
