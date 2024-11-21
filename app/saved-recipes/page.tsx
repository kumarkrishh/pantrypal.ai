"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Navbar from '../../components/Navbar';
import { IRecipe } from '@/models/Recipe'; 

function SavedRecipesPage() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<IRecipe[]>([]);

  const handleDelete = async (recipeId: string) => {
    if (!session) {
      alert('You need to be logged in to delete recipes.');
      return;
    }

    try {
      const response = await axios.delete('/api/deleteRecipe', {
        data: { recipeId },
      });
      if (response.status === 200) {
        // Remove the deleted recipe from the state
        setRecipes(recipes.filter((recipe) => recipe._id !== recipeId));
        alert('Recipe deleted successfully!');
      } else {
        alert('Failed to delete recipe.');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe.');
    }
  };

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
            {/* Delete Button */}
            <button
              style={styles.deleteButton}
              onClick={() => handleDelete(recipe._id)}
            >
              Delete Recipe
            </button>
          </div>
        ))
      ) : (
        <p>No saved recipes found.</p>
      )}
    </div>
  );
}

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
  deleteButton: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default SavedRecipesPage;