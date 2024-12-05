"use client";

import React from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Home, Mail, Heart, LogIn, LogOut, ChefHat } from "lucide-react";
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleFavoritesClick = (e: any) => {
    if (!session) {
      e.preventDefault();
      alert("You need to be logged in to view your favorites.");
    }
  };

  return (
    <nav className="w-full bg-white/60 backdrop-blur-md shadow-sm border-b border-indigo-100 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-4 flex h-16 items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-xl font-bold"
        >
          <ChefHat className="h-6 w-6 text-indigo-600" />
          <span className="text-indigo-600">PantryPal</span>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-gray-700 hover:bg-blur-md hover:text-indigo-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Recipe Generator
            </Button>
          </Link>
          <Link href="/saved-recipes" onClick={handleFavoritesClick}>
            <Button
              variant="ghost"
              className="text-gray-700 hover:bg-blur-md hover:text-indigo-600"
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </Button>
          </Link>

          <Link href="/contact">
            <Button
              variant="ghost"
              className="text-gray-700 hover:bg-blur-md hover:text-indigo-600"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </Link>

          {session ? (
            <Button
              onClick={() =>
                signOut({ callbackUrl: '/' }).then(() => router.push('/'))
              }
              variant="ghost"
              className="text-gray-700 hover:bg-blur-md hover:text-indigo-600 ml-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button
              onClick={() => signIn()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white ml-2"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;