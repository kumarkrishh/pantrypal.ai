import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from "@/models/User";
import { connectToDB } from "@/utils/database";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate required fields
    if (!name || !email || !password) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Connect to the database
    await connectToDB();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return new NextResponse('User already exists', { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Respond with the user details (excluding password)
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
