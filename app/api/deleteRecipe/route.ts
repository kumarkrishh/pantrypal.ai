import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getClientPromise } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const recipeId = url.searchParams.get('recipeId');

    if (!recipeId || !ObjectId.isValid(recipeId)) {
      return NextResponse.json({ error: 'Invalid Recipe ID' }, { status: 400 });
    }

    const client = await getClientPromise();
    const db = client.db();

    const result = await db.collection('recipes').deleteOne({
      _id: new ObjectId(recipeId),
      userId: session.user.id,
    });

    if (result.deletedCount === 1) {
      return NextResponse.json(
        { message: 'Recipe deleted successfully!' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Recipe not found or unauthorized' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
