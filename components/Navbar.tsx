"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Home, Mail, Heart, LogIn, LogOut, ChefHat, Menu, X } from "lucide-react";
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFavoritesClick = (e: any) => {
    if (!session) {
      e.preventDefault();
      alert("You need to be logged in to view your favorites.");
    }
  };

  const NavLinks = () => (
    <>
      <Link href="/">
        <Button
          variant="ghost"
          className="text-gray-700 hover:text-indigo-600 w-full md:w-auto justify-start"
        >
          <Home className="w-4 h-4 mr-2" />
          Recipe Generator
        </Button>
      </Link>
      <Link href="/saved-recipes" onClick={handleFavoritesClick}>
        <Button
          variant="ghost"
          className="text-gray-700 hover:text-indigo-600 w-full md:w-auto justify-start"
        >
          <Heart className="w-4 h-4 mr-2" />
          Favorites
        </Button>
      </Link>
      <Link href="/contact">
        <Button
          variant="ghost"
          className="text-gray-700 hover:text-indigo-600 w-full md:w-auto justify-start"
        >
          <Mail className="w-4 h-4 mr-2" />
          Contact
        </Button>
      </Link>
      {session ? (
        <Button
          onClick={() => signOut({ callbackUrl: '/' }).then(() => router.push('/'))}
          variant="ghost"
          className="text-gray-700 hover:text-indigo-600 w-full md:w-auto justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      ) : (
        <Button
          onClick={() => signIn()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white w-full md:w-auto justify-start"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      )}
    </>
  );

  return (
    <nav className="w-full bg-white/60 backdrop-blur-md shadow-sm border-b border-indigo-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
          <ChefHat className="h-6 w-6 text-indigo-600" />
          <span className="text-indigo-600">PantryPal</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-2">
          <NavLinks />
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="flex flex-col px-4 pb-4 space-y-2 md:hidden bg-white/80 backdrop-blur-sm">
          <NavLinks />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
