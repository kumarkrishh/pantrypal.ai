import React, { CSSProperties } from 'react';
import Link from 'next/link';

const Navbar = () => {
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
          <Link href="/login">
            <button style={styles.loginButton}>Login</button>
          </Link>
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
    justifyContent: 'space-between', 
    alignItems: 'center', 
    margin: 0,
    padding: 0,
    width: '100%',
    maxWidth: '800px',
  },
  navItem: {
    margin: '0 1rem',
    flex: 1, 
    textAlign: 'center', 
  },
  navLink: {
    color: '#333', 
    textDecoration: 'none',
    fontSize: '1.2rem',
  },
  loginButton: {
    backgroundColor: '#007bff', 
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '1rem',
    borderRadius: '4px', 
  },
};

export default Navbar;