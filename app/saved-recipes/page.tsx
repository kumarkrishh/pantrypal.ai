"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Navbar from '../../components/Navbar';
import { IRecipe } from '@/models/Recipe'; 

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  pageTitle: {
    textAlign: 'center' as 'center', 
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  recipeCard: {
    width: '100%',
    maxWidth: '600px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
  },
  imageContainer: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  list: {
    listStyleType: 'disc',
    paddingLeft: '20px',
  },
  instructions: {
    whiteSpace: 'pre-line',
  },
  recipeName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginTop: '10px',
    marginBottom: '10px',
    textAlign: 'center' as 'center',
  },
};

function SavedRecipesPage() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<IRecipe[]>([]);

  useEffect(() => {
    if (session) {
      axios
        .get("/api/getSavedRecipes")
        .then((res) => setRecipes(res.data))
        .catch((err) => console.error(err));
    }
  }, [session]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>You need to be logged in to view this page.</p>;

  return (
    <div style={styles.container}>
      <Navbar />
      <h1 style={styles.pageTitle}>Your Saved Recipes</h1>
      {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <div key={recipe._id} style={styles.recipeCard}>
            {/* Image */}
            {recipe.image && (
              <div style={styles.imageContainer}>
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  width={400}
                  height={300}
                />
              </div>
            )}
            {/* Recipe Name */}
            <h2 style={styles.recipeName}>{recipe.title}</h2>
            {/* Nutrition Information */}
            {recipe.nutrition && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Nutrition Information</h3>
                <ul style={styles.list}>
                  {Object.entries(recipe.nutrition).map(([key, value]) => (
                    <li key={key}>{`${key}: ${value}`}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Ingredients */}
            {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Ingredients</h3>
                <ul style={styles.list}>
                  {recipe.extendedIngredients.map((ingredient, index) => (
                    <li key={index}>{ingredient.original}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Instructions */}
            {recipe.instructions && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Instructions</h3>
                <p style={styles.instructions}>{recipe.instructions}</p>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No saved recipes found.</p>
      )}
    </div>
  );
}

export default SavedRecipesPage;