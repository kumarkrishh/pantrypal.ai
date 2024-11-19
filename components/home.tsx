'use client';

import { useState } from 'react';
import axios from 'axios';
import pluralize from 'pluralize';
import Image from 'next/image';

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecipeGenerated, setIsRecipeGenerated] = useState(false);
  const [maxAdditionalIngredients, setMaxAdditionalIngredients] = useState(5);
  const [prompt, setPrompt] = useState('');
  const [processedRecipe, setProcessedRecipe] = useState('');
  const [processing, setProcessing] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || 'e533c17590524ce8abdc04abfbf4c499';

  const handleGenerateRecipe = async () => {
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
        params: {
          ingredients: ingredients,
          number: 3,
          ranking: 1,
          apiKey: apiKey,
        },
      });

      if (response.data.length === 0) {
        setError('No recipes found with the given ingredients.');
      } else {
        const recipeDetailsPromises = response.data.map((recipe: any) =>
          axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
            params: { apiKey: apiKey },
          })
        );

        const recipeDetailsResponses = await Promise.all(recipeDetailsPromises);
        const detailedRecipes = recipeDetailsResponses.map((res) => res.data);

        const filteredRecipes = detailedRecipes.filter((recipe) => {
          const additionalIngredients = recipe.extendedIngredients.filter((ingredient: any) => {
            const isInputIngredient = ingredientVariants.some((variant) =>
              ingredient.name.toLowerCase().includes(variant)
            );
            return !isInputIngredient;
          });
          return additionalIngredients.length <= maxAdditionalIngredients;
        });

        setRecipes(filteredRecipes);
        setIsRecipeGenerated(true);
      }
    } catch (err) {
      setError('An error occurred while fetching the recipes.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecipe = () => {
    setIngredients('');
    setRecipes([]);
    setError('');
    setIsRecipeGenerated(false);
  };

  const inputIngredientsArray = ingredients
    .split(',')
    .map((ingredient) => ingredient.trim().toLowerCase());
  const ingredientVariants = inputIngredientsArray.flatMap((ingredient) => [
    pluralize.singular(ingredient),
    pluralize.plural(ingredient),
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Enter Ingredients</h2>
      <div>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (comma separated)"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          disabled={isRecipeGenerated}
        />
        <input
          type="number"
          value={maxAdditionalIngredients}
          onChange={(e) =>
            setMaxAdditionalIngredients(Math.abs(Number(e.target.value)))
          }
          placeholder="Max additional ingredients"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          disabled={isRecipeGenerated}
        />
        <button
          onClick={handleGenerateRecipe}
          disabled={loading || isRecipeGenerated}
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
        {isRecipeGenerated && (
          <button
            onClick={handleNewRecipe}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              marginLeft: '10px',
            }}
          >
            New Recipe
          </button>
        )}
      </div>
    {/* Prompt stuff */}
    {isRecipeGenerated && (
       
       <div style={{
            marginTop: '20px'  
        }}>
            <h3>Modify this Recipe</h3>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here"
                style={{
                    width: '100%',
                    padding: '8px',
                    height: '100px',
                    marginBottom: '10px'
                }}
                />
                </div>
    )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginTop: '20px' }}>
        {recipes.length > 0 && (
          <div>
            <h3>Recipes Found:</h3>
            <ul>
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                    <h4>{recipe.title}</h4>
                    <Image
                    src={recipe.image}
                    alt={recipe.title}
                    width={500}
                    height={300}
                    />
                    <p>Preparation time: {recipe.readyInMinutes} minutes</p>
                    <p>Serves: {recipe.servings} people</p>
                    <h5>Ingredients:</h5>
                    <ul>
                    {recipe.extendedIngredients.map((ingredient: any, index: number) => {
                        const isInputIngredient = ingredientVariants.some((variant) =>
                        ingredient.name.toLowerCase().includes(variant)
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
                    <button
                    onClick={async () => {
                        try {
                        const response = await axios.post('/api/saveRecipe', recipe);
                        alert(response.data.message);
                        } catch (error) {
                        console.error(error);
                        alert('Failed to save recipe.');
                        }
                    }}
                    style={{
                        marginTop: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    >
                    Save Recipe
                    </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}