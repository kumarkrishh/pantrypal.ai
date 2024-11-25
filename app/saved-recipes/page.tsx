"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Navbar from '../../components/Navbar';
import { IRecipe } from '@/models/Recipe';
import { AiFillHeart } from "react-icons/ai";
import RecipeCard from '../../components/RecipeCard';

function SavedRecipesPage() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [hoveredRecipeId, setHoveredRecipeId] = useState<string | null>(null);

  const handleUnfavorite = async (recipeId: string) => {
    if (!session) {
      alert('You need to be logged in to remove recipes from favorites.');
      return;
    }

    const confirmUnfavorite = confirm('Are you sure you want to remove this recipe from your favorites?');

    if (!confirmUnfavorite) {
      return;
    }

    try {
      const response = await axios.delete('/api/deleteRecipe', {
        data: { recipeId },
      });
      if (response.status === 200) {
        // Remove the unfavorited recipe from the state
        setRecipes(recipes.filter((recipe) => recipe._id !== recipeId));
        alert('Recipe removed from favorites successfully!');
      } else {
        alert('Failed to remove recipe from favorites.');
      }
    } catch (error) {
      console.error('Error removing recipe:', error);
      alert('Failed to remove recipe from favorites.');
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
      <h1 style={styles.pageTitle}>Favorite Recipes</h1>
      <div style={styles.recipesContainer}>
        {recipes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' } as React.CSSProperties}>
            <ul style={styles.recipeListContainer}>
              {recipes.map((recipe) => (
                <li key={recipe._id} style={styles.recipeCard}>
                  {/* Recipe Title */}
                  <h4 style={styles.recipeTitle}>{recipe.title}</h4>
                  
                  {/* Image Container with Heart Icon */}
                  <div style={styles.imageWrapper}>
                    {recipe.image && (
                      <Image
                        src={recipe.image}
                        alt={recipe.title}
                        width={600}
                        height={200}
                        style={{ borderRadius: '8px' }}
                      />
                    )}
                    {/* Heart Icon */}
                    <AiFillHeart
                      style={{
                        ...styles.heartIcon,
                        transform: hoveredRecipeId === recipe._id ? 'scale(1.2)' : 'scale(1)',
                      }}
                      onClick={() => handleUnfavorite(recipe._id)}
                      onMouseEnter={() => setHoveredRecipeId(recipe._id)}
                      onMouseLeave={() => setHoveredRecipeId(null)}
                      title="Remove from favorites"
                    />
                  </div>

                  {/* Preparation Time and Servings */}
                  <p>Preparation time: {recipe.readyInMinutes} minutes</p>
                  <p>Serves: {recipe.servings} people</p>

                  {/* Nutrition Facts */}
                  {recipe.nutrition && (
                    <div style={styles.section}>
                      <h5 style={styles.sectionHeader}>Nutrition Facts:</h5>
                      <p>Calories: {recipe.nutrition.calories}</p>
                      <p>Carbohydrates: {recipe.nutrition.carbs}</p>
                      <p>Protein: {recipe.nutrition.protein}</p>
                      <p>Fat: {recipe.nutrition.fat}</p>
                    </div>
                  )}

                  {/* Ingredients */}
                  {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
                    <div style={styles.section}>
                      <h5 style={styles.sectionHeader}>Ingredients:</h5>
                      <ul style={styles.ingredientsList}>
                        {recipe.extendedIngredients.map((ingredient: any, index: number) => {
                          return (
                            <li key={`${recipe._id}-${ingredient.id}-${index}`}>
                              {ingredient.original}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Instructions */}
                  {recipe.instructions && (
                    <div style={styles.section}>
                      <h5 style={styles.sectionHeader}>Instructions:</h5>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: recipe.instructions,
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No saved recipes found.</p>
        )}
      </div>
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
  recipesContainer: {
    width: '100%',
    maxWidth: '800px',
  },
  recipeListContainer: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  recipeCard: {
    width: '100%',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    position: 'relative',
  },
  recipeTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center' as 'center',
  },
  imageWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  heartIcon: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    color: 'red',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  section: {
    marginBottom: '15px',
  },
  sectionHeader: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '5px',
  },
  ingredientsList: {
    listStyleType: 'disc',
    paddingLeft: '20px',
  },
};

export default SavedRecipesPage;
