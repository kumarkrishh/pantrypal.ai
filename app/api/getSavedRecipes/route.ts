import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getClientPromise } from '@/lib/mongodb';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await getClientPromise();
    const db = client.db();

    const recipes = await db
      .collection('recipes')
      .find({ userId: session.user.id })
      .toArray();

    return NextResponse.json(recipes, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}
