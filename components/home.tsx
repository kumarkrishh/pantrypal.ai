

'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import pluralize from 'pluralize';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Image from 'next/image';
import Navbar from './Navbar';
import React from 'react';
import { useSession } from 'next-auth/react';
import OpenAI from 'openai';
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"; 
import RecipeCard from './RecipeCard';

export default function RecipeGenerator() {
  const { data: session, status } = useSession();
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecipeGenerated, setIsRecipeGenerated] = useState(false);
  const [maxAdditionalIngredients, setMaxAdditionalIngredients] = useState(5);
  const [numRecipes, setNumRecipes] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [favoritedRecipes, setFavoritedRecipes] = useState<Set<string>>(new Set());

  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  let openai: OpenAI;
  if (openaiKey) {
    openai = new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
  } else {
    console.warn('OpenAI API key not found. Some features may not work.');
  }

  useEffect(() => {
    if (session) {
      axios
        .get("/api/getSavedRecipes")
        .then((res) => {
          const savedRecipeIds = res.data.map((recipe: any) => recipe.id); 
          setFavoritedRecipes(new Set(savedRecipeIds));
        })
        .catch((err) => console.error(err));
    }
  }, [session]);

  const fileToGenerativePart = async (file: File) => {
    const buffer = await file.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(buffer).toString('base64'),
        mimeType: file.type
      }
    };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      try {
        setLoading(true);
        const base64Image = await fileToBase64(file);
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "List all the ingredients you can see in this image. Return them as a comma-separated list. If you don't see any food ingredients, return an empty list." },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ],
            },
          ],
        });
        setIngredients(response.choices[0].message.content || '');
      } catch (err: any) {
        if (err instanceof Error) {
          setError(`Error processing image: ${err.message}`);
        } else {
          setError('An unknown error occurred while processing the image');
        }
        console.error(err);
      } finally {
        //setSelectedImage(null);
        setImagePreview(null);
        e.target.value = ''; // Reset the input value
        setLoading(false);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };
  
  const parseIngredientsWithOpenAI = async (text: string) => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that parses ingredient lists." },
        { role: "user", content: `Parse this text into a comma-separated list of ingredients: ${text}` }
      ],
    });
    return response.choices[0].message.content?.split(',').map(i => i.trim()) || [];
  };
  
  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      alert('No ingredients detected. Please provide some ingredients to generate a recipe.');
    }
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const parsedIngredients = await parseIngredientsWithOpenAI(ingredients);
      const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
        params: {
          ingredients: parsedIngredients.join(','),
          number: numRecipes,
          ranking: 1,
          apiKey: apiKey,
        },
      });
        
        const availableRecipes = response.data.length;
        const recipesToShow = availableRecipes < numRecipes ? availableRecipes : numRecipes; // Adjust the number of recipes to display
  
        if(availableRecipes > 0){
          const recipeDetailsPromises = response.data.map((recipe: any) =>
            axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
              params: { apiKey: apiKey },
            })
          );
  
          const nutritionPromises = response.data.map((recipe: any) =>
            axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json`, {
              params: { apiKey: apiKey },
            })
          );
  
          const [recipeDetailsResponses, nutritionResponses] = await Promise.all([
            Promise.all(recipeDetailsPromises),
            Promise.all(nutritionPromises),
          ]);
  
          const detailedRecipes = recipeDetailsResponses.map((res, index) => ({
            ...res.data,
            nutrition: nutritionResponses[index].data,
          }));
  
          const filteredRecipes = detailedRecipes.filter((recipe) => {
            const additionalIngredients = recipe.extendedIngredients.filter((ingredient: any) => {
              const isInputIngredient = ingredientVariants.some((variant) =>
                ingredient.name.toLowerCase().includes(variant)
              );
              return !isInputIngredient;
            });
            return additionalIngredients.length <= maxAdditionalIngredients;
          });
  
          setRecipes(filteredRecipes.slice(0, recipesToShow)); // Show only the adjusted number of recipes
          setIsRecipeGenerated(true);
        }else{
            alert('No recipes found with the given ingredients. Please try generating a new recipe.'); 
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
    setImagePreview(null)
    setSelectedImage(null)
    setIsRecipeGenerated(false);
  };

  const inputIngredientsArray = ingredients
    .split(',')
    .map((ingredient) => ingredient.trim().toLowerCase());
  const ingredientVariants = inputIngredientsArray.flatMap((ingredient) => [
    pluralize.singular(ingredient),
    pluralize.plural(ingredient),
  ]);

  const handleFavoriteToggle = async (recipe: any) => {
    if (!session) {
      alert('You need to be logged in to manage favorites.');
      return;
    }

    if (favoritedRecipes.has(recipe.id)) {
      // Implement unfavorite functionality: fix here
      const confirmUnfavorite = confirm('Are you sure you want to remove this recipe from your favorites?');
      if (!confirmUnfavorite) return;

      try {
        const response = await axios.delete('/api/deleteRecipe', { data: { recipeId: recipe.id } });
        if (response.status === 200) {
          const updatedFavorites = new Set(favoritedRecipes);
          updatedFavorites.delete(recipe.id);
          setFavoritedRecipes(updatedFavorites);
          alert('Recipe removed from favorites.');
        } else {
          alert('Failed to remove recipe from favorites.');
        }
      } catch (error) {
        console.error(error);
        alert('Failed to remove recipe from favorites.');
      }
    } else {
      // Implement favorite functionality
      try {
        const response = await axios.post('/api/saveRecipe', recipe);
        if (response.status === 200) {
          const updatedFavorites = new Set(favoritedRecipes);
          updatedFavorites.add(recipe.id);
          setFavoritedRecipes(updatedFavorites);
          alert('Recipe saved as favorite!');
        } else {
          alert('Failed to save recipe.');
        }
      } catch (error) {
        console.error(error);
        alert('Failed to save recipe.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <h2 style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center' }}>Pantry Pal</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' } as React.CSSProperties}>
        {/* Image upload section */}
        <div style={styles.imageUploadContainer}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isRecipeGenerated}
            style={styles.fileInput}
          />
          {imagePreview && (
            <div style={styles.imagePreviewContainer}>
              <Image
                src={imagePreview}
                alt="Uploaded ingredients"
                width={200}
                height={200}
                style={styles.imagePreview}
              />
            </div>
          )}
        </div>

        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (comma separated) or upload an image"
          style={styles.input}
          disabled={isRecipeGenerated}
        />
        
        {/* Slider for max additional ingredients */}
        <div style={styles.sliderContainer}>
          <label style={styles.sliderLabel}>Max Additional Ingredients</label>
          <input
            type="range"
            min="0"
            max="10"
            value={maxAdditionalIngredients}
            onChange={(e) =>
              setMaxAdditionalIngredients(Math.abs(Number(e.target.value)))
            }
            disabled={isRecipeGenerated}
            style={styles.slider}
          />
          <span>{maxAdditionalIngredients}</span>
        </div>

        {/* Slider for number of recipes */}
        <div style={styles.sliderContainer}>
          <label style={styles.sliderLabel}>Number of Recipes</label>
          <input
            type="range"
            min="1"
            max="5"
            value={numRecipes}
            onChange={(e) => setNumRecipes(Math.abs(Number(e.target.value)))}
            disabled={isRecipeGenerated}
            style={styles.slider}
          />
          <span>{numRecipes}</span>
        </div>

        {/* Show Generate Recipe button only if there are no errors or recipes generated */}
        {!error && !isRecipeGenerated && (
          <button
            onClick={handleGenerateRecipe}
            disabled={loading || isRecipeGenerated}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? (imagePreview ? 'Analyzing Image...' : 'Generating Recipe...') : 'Generate Recipe'}
          </button>
        )}

        {/* Show New Recipe button after generating a recipe */}
        {!error && isRecipeGenerated && (
          <button
            onClick={handleNewRecipe}
            style={styles.resetButton}
          >
            New Recipe
          </button>
        )}
      </div>

      {/* Show error message if no recipes are found */}
      {error && !isRecipeGenerated && (
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <p>No recipes were found.</p>
          <button onClick={() => setError('')} style={styles.closeButton}>Close</button>
        </div>
      </div>
    )}


      <div style={styles.recipesContainer}>
        {recipes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' } as React.CSSProperties}>
            <ul style={styles.recipeListContainer}>
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorited={favoritedRecipes.has(recipe.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  ingredientVariants={ingredientVariants}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sliderLabel: {
    fontSize: '16px',
  },
  slider: {
    width: '150px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#ccc',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
  },
  resetButton: {
    padding: '10px 20px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: '10px',
  },
  recipesContainer: {
    marginTop: '20px',
  },
  recipeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  recipeListContainer: {
    listStyle: 'none',
    padding: '0',
  },
  recipeCard: {
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    position: 'relative', 
  },
  recipeTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center' as 'center',
  },
  recipeImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    objectFit: 'cover' as const,
  },
  sectionHeader: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  ingredientsList: {
    listStyle: 'disc',
    paddingLeft: '20px',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  imageUploadContainer: {
    marginBottom: '20px',
  },
  fileInput: {
    marginBottom: '10px',
  },
  imagePreviewContainer: {
    maxWidth: '200px',
    marginTop: '10px',
  },
  imagePreview: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover' as const,
    borderRadius: '8px',
  },
  heartIcon: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s, color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
};