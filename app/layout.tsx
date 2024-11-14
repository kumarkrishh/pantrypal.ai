'use client';
import { ReactNode, useState } from 'react';
import axios from 'axios';
import pluralize from 'pluralize';
import './globals.css';
import { Inter } from 'next/font/google';
import { NextAuthProvider } from '@/components/NextAuthProvider';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || 'e533c17590524ce8abdc04abfbf4c499';

  const handleGenerateRecipe = async () => {
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
        params: {
          ingredients: ingredients,
          number: 2,
          ranking: 1,
          apiKey: apiKey,
        },
      });

      if (response.data.length === 0) {
        setError('No recipes found with the given ingredients.');
      } else {
        const recipeDetailsPromises = response.data.map((recipe: any) =>
          axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
            params: {
              apiKey: apiKey,
            },
          })
        );

        const recipeDetailsResponses = await Promise.all(recipeDetailsPromises);
        const detailedRecipes = recipeDetailsResponses.map((res) => res.data);
        setRecipes(detailedRecipes);
      }
    } catch (err) {
      setError('An error occurred while fetching the recipes.');
    } finally {
      setLoading(false);
    }
  };

  // Split the input ingredients into an array for easy comparison
  const inputIngredientsArray = ingredients
    .split(',')
    .map((ingredient) => ingredient.trim().toLowerCase());
  const ingredientVariants = inputIngredientsArray.flatMap((ingredient) => [
    pluralize.singular(ingredient),
    pluralize.plural(ingredient),
  ]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <header>
            <h1>Pantry Pal</h1>
          </header>

          {/* Main content section */}
          <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Enter Ingredients</h2>
            <div>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Enter ingredients (comma separated)"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <button
                onClick={handleGenerateRecipe}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Generating...' : 'Generate Recipe'}
              </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ marginTop: '20px' }}>
              {recipes.length > 0 && (
                <div>
                  <h3>Recipes Found:</h3>
                  <ul>
                    {recipes.map((recipe) => (
                      <li key={recipe.id}>
                        <h4>{recipe.title}</h4>
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          style={{ width: '50%' }}
                        />
                        <p>Preparation time: {recipe.readyInMinutes} minutes</p>
                        <p>Serves: {recipe.servings} people</p>

                        <h5>Ingredients:</h5>
                        <ul>
                          {recipe.extendedIngredients.map((ingredient: any, index: number) => {
                            const isInputIngredient = inputIngredientsArray.some((inputIngredient) =>
                               ingredient.name.toLowerCase().includes(inputIngredient)
                            );

                            return (
                              <li
                                key={`${recipe.id}-${ingredient.id}-${index}`}
                                style={{ color: isInputIngredient ? 'green' : 'red' }}
                              >
                                {ingredient.original}
                              </li>
                            );
                          })}
                        </ul>

                        <h5>Instructions:</h5>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: recipe.instructions,
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </main>

          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}
