import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getClientPromise } from '@/lib/mongodb';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recipeData = await request.json();
    const client = await getClientPromise();
    const db = client.db();

    // Ensure the 'id' field is included and is a string
    if (!recipeData.id) {
      return NextResponse.json({ error: 'Recipe ID is missing' }, { status: 400 });
    }

    // Optionally, convert 'id' to a string if it's not already
    recipeData.id = recipeData.id.toString();

    await db.collection('recipes').insertOne({
      ...recipeData,
      userId: session.user.id,
    });

    return NextResponse.json(
      { message: 'Recipe saved successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    );
  }
}
