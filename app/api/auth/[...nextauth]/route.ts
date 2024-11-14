import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from '@/utils/database'; // Adjust path as necessary
import User from '@/models/user'; // Adjust path as necessary

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      await connectToDB(); // Ensure MongoDB is connected

      try {
        // Find or create user in MongoDB
        const result = await User.findOneAndUpdate(
          { email: user.email }, // Find by email
          {
            email: user.email,
            username: profile.name ?? user.name, // Use profile info if available
          },
          { upsert: true, new: true, setDefaultsOnInsert: true } // Options to upsert (update existing, insert if not exists)
        );

        console.log('User logged in:', result);
        return true; // Return true to confirm successful sign in
      } catch (error) {
        console.error('Error updating user in MongoDB:', error);
        return false; // Return false to deny sign in
      }
    },
  },
  pages: {
    signIn: "/", // Custom sign-in page if necessary
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
