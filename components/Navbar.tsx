"use client";

import React, { CSSProperties } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

const Navbar = () => {
  const { data: session } = useSession();
  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <Link href="/" style={styles.navLink}>Home</Link>
        </li>
        <li style={styles.navItem}>
          <Link href="/about" style={styles.navLink}>About</Link>
        </li>
        <li style={styles.navItem}>
          <Link href="/contact" style={styles.navLink}>Contact</Link>
        </li>
        <li style={styles.navItem}>
          <Link href="/saved-recipes" style={styles.navLink}>Saved</Link>
        </li>
        <li style={styles.navItem}>
          {session ? (
            <button 
              style={styles.navButton} 
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          ) : (
            <button 
              style={styles.navButton} 
              onClick={() => signIn()}
            >
              Sign In
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
};

const styles: { [key: string]: CSSProperties } = {
  navbar: {
    backgroundColor: '#f8f9fa', 
    padding: '0.5rem 1rem', 
    display: 'flex',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', 
    margin: 0,
    padding: 0,
    width: '100%',
    maxWidth: '800px',
    gap: '1rem',
  },
  navItem: {
    display: 'inline', 
  },
  navLink: {
    color: '#333', 
    textDecoration: 'none',
    fontSize: '1.2rem',
    padding: '0.5rem 1rem',
    display: 'inline-block', 
    borderRadius: '4px', 
  },
  navButton: {
    backgroundColor: '#007bff', 
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '1rem',
    borderRadius: '4px',
    textAlign: 'center',
    display: 'inline-block',
    whiteSpace: 'nowrap', 
  },
};

export default Navbar;
