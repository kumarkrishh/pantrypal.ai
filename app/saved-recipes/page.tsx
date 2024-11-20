"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Navbar from '../../components/Navbar'; 

function SavedRecipesPage() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState([]);

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
                  style={styles.image}
                />
              </div>
            )}
            {/* Recipe Details */}
            <div style={styles.detailsContainer}>
              <h2 style={styles.recipeTitle}>{recipe.title}</h2>
              <p style={styles.infoText}>
                <strong>Ready in:</strong> {recipe.readyInMinutes} minutes
              </p>
              <p style={styles.infoText}>
                <strong>Servings:</strong> {recipe.servings}
              </p>
              {/* Nutrition Info */}
              {recipe.nutrition && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Nutrition Info</h3>
                  <ul style={styles.list}>
                    <li>Calories: {recipe.nutrition.calories}</li>
                    <li>Fat: {recipe.nutrition.fat}g</li>
                    <li>Carbs: {recipe.nutrition.carbs}g</li>
                    <li>Protein: {recipe.nutrition.protein}g</li>
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
          </div>
        ))
      ) : (
        <p>No recipes found.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    color: "#333",
  },
  pageTitle: {
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "2rem",
  },
  recipeCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "2rem",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  imageContainer: {
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: "1rem", 
  },
  image: {
    width: "80%", 
    maxWidth: "500px", 
    height: "auto", 
    borderRadius: "8px", 
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", 
  },
  detailsContainer: {
    padding: "1.5rem",
  },
  recipeTitle: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  infoText: {
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  section: {
    marginTop: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "0.8rem",
    textTransform: "uppercase",
    color: "#555",
  },
  list: {
    listStyleType: "disc",
    paddingLeft: "1.5rem",
  },
  instructions: {
    fontSize: "1rem",
    lineHeight: "1.6",
  },
};

export default SavedRecipesPage;
