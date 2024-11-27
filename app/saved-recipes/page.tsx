"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Navbar from '../../components/Navbar';
import RecipeCard from '../../components/RecipeCard';

function SavedRecipesPage() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [favoritedRecipes, setFavoritedRecipes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session) {
      axios
        .get("/api/getSavedRecipes")
        .then((res) => {
          const fetchedRecipes = res.data.map((recipe: any) => ({
            ...recipe,
            id: recipe._id,
          }));
          setRecipes(fetchedRecipes);
          setFavoritedRecipes(new Set(fetchedRecipes.map((recipe: any) => recipe.id)));
        })
        .catch((err) => console.error(err));
    }
  }, [session]);

  const handleFavoriteToggle = async (recipe: any) => {
    if (!session) {
      alert('You need to be logged in to modify your favorites.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to remove this recipe from your favorites?'
    );
    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`/api/deleteRecipe?recipeId=${recipe.id}`);

      setRecipes((prevRecipes) =>
        prevRecipes.filter((r) => r.id !== recipe.id)
      );

      setFavoritedRecipes((prev) => {
        const updated = new Set(prev);
        updated.delete(recipe.id);
        return updated;
      });

      alert('Recipe removed from your favorites!');
    } catch (error) {
      console.error('Error removing recipe from favorites:', error);
      alert('Failed to remove recipe from favorites.');
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>You need to be logged in to view this page.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Favorite Recipes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
                ingredientVariants={[]}
                disableIngredientColor={true}
              />
            ))
          ) : (
            <p className="text-center">No saved recipes found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavedRecipesPage;
