'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import pluralize from 'pluralize';
import { useSession } from 'next-auth/react';
import { X, ChefHat, Loader2, Utensils, Settings2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from './ImageUpload';
import { IngredientInput } from '@/components/IngredientInput';
import RecipeCard from '@/components/RecipeCard';
import Navbar from '@/components/Navbar';
import { createOpenAIClient, processImageForIngredients } from '@/lib/utils/openai';
import { fileToBase64 } from '@/lib/utils/file';
import OpenAI from 'openai';
import EditRecipeCard from '@/components/EditRecipeCard';
import { signIn } from "next-auth/react";
import { Upload, Trash2 } from 'lucide-react';

export default function RecipeGenerator() {
  const { data: session } = useSession();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [isRecipeGenerated, setIsRecipeGenerated] = useState(false);
  const [maxAdditionalIngredients, setMaxAdditionalIngredients] = useState(5);
  const [numRecipes, setNumRecipes] = useState(3);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [favoritedRecipes, setFavoritedRecipes] = useState<Set<string>>(new Set());
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<any | null>(null);


  const apiKey = [
    process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY_1,
    process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY_2
  ];
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
        .get('/api/getSavedRecipes')
        .then((res) => {
          const favoriteIds = res.data.map((recipe: any) => recipe.id.toString());
          setFavoritedRecipes(new Set(favoriteIds));
        })
        .catch(() => {
          setError('Failed to fetch saved recipes');
        });
    }
  }, [session]);

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  const handleAddIngredient = () => {
    const trimmedIngredient = currentIngredient.trim().toLowerCase();
    
    const isDuplicate = ingredients.some(
      ingredient => ingredient.toLowerCase() === trimmedIngredient
    );
  
    setCurrentIngredient('');
  
    if (trimmedIngredient && !isDuplicate) {
      setIngredients(prev => [...prev, trimmedIngredient]);
    }
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      return;
    }
    setLoading(true);
    setError('');
    setRecipes([]);
  
    for (let i = 0; i < apiKey.length; i++) {
      try {
        const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
          params: {
            ingredients: ingredients.join(','),
            number: numRecipes,
            ranking: 1,
            apiKey: apiKey[i],
          },
        });
  
        if (response.data.length === 0) {
          alert('No recipes found, try a new recipe search');
          setRecipes([]);
          setLoading(false);
          setIsRecipeGenerated(false);
          return;
        }
  
        const recipeDetails = await Promise.all(
          response.data.map(async (recipe: any) => {
            const [details, nutrition] = await Promise.all([
              axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
                params: { apiKey: apiKey[i] },
              }),
              axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json`, {
                params: { apiKey: apiKey[i] },
              }),
            ]);
  
            const formattedInstructions = await formatInstructions(details.data.instructions);
  
            const additionalIngredients = recipe.usedIngredients.filter(
              (ingredient: any) => !ingredients.includes(ingredient.name)
            );
  
            if (additionalIngredients.length > maxAdditionalIngredients) {
              return null;
            }
  
            return {
              ...details.data,
              instructions: formattedInstructions,
              nutrition: nutrition.data,
            };
          })
        );
  
        const validRecipes = recipeDetails.filter((recipe) => recipe !== null);
  
        const sortedRecipes = validRecipes.sort((a, b) => {
          const aMissingIngredients = a.extendedIngredients.filter(
            (ingredient: any) => !ingredientVariants.some(
              (variant) => ingredient.name?.toLowerCase().includes(variant)
            )
          ).length;
          
          const bMissingIngredients = b.extendedIngredients.filter(
            (ingredient: any) => !ingredientVariants.some(
              (variant) => ingredient.name?.toLowerCase().includes(variant)
            )
          ).length;
          
          return aMissingIngredients - bMissingIngredients;
        });
  
        setRecipes(sortedRecipes);
        setIsRecipeGenerated(true);
        break;
      } catch (err) {
        console.log(`API Key #${i + 1} failed. Trying the next key...`);
      }
    }
    setLoading(false);
  };

  const handleNewRecipe = () => {
    setIngredients([]);
    setRecipes([]);
    setError('');
    setImageError(null);
    setImagePreview(null);
    setSelectedImage(null);
    setIsRecipeGenerated(false);
    setIsImageProcessing(false);
  };
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!session) {
    alert('You must be logged in to use image upload.');
    return;
  }

  const file = e.target.files?.[0];
  if (!file) return;

  setSelectedImage(file);
  setImagePreview(URL.createObjectURL(file));
  setIsImageProcessing(true);
  setImageError(null);

  try {
    const base64Image = await fileToBase64(file);
    const detectedIngredients = await processImageForIngredients(openai, base64Image);

    if (detectedIngredients.length === 0) {
      alert('No ingredients were found, try a new image.');
      setSelectedImage(null);
      setImagePreview(null);
      setImageError(null);
      setIsImageProcessing(false);
      setCurrentIngredient('');
    } else {
      setDetectedIngredients(detectedIngredients);
      setIngredients(prev => Array.from(new Set([...prev, ...detectedIngredients])));
    }
  } catch (err: any) {
    setImageError(err instanceof Error ? err.message : 'An unknown error occurred');
    console.error(err);
  } finally {
    setIsImageProcessing(false);
  }
};


  const handleImageRemove = () => {
  setSelectedImage(null);
  setImagePreview(null);
  setImageError(null);
  setIsImageProcessing(false);
  setCurrentIngredient('');

};


  const formatInstructions = async (instructions: string) => {
  // Disable GPT-based formatting if OpenAI is unavailable
  return instructions || 'The original recipe author has not provided detailed instructions for the recipe.';
};


  const ingredientVariants = ingredients.map(ingredient => [
    pluralize.singular(ingredient),
    pluralize.plural(ingredient),
  ]).flat();

  const handleFavoriteToggle = async (recipe: any) => {
    if (!session) {
      alert('You need to be logged in to favorite recipes.');
      return;
    }
  
    const isFavorited = favoritedRecipes.has(recipe.id);
  
    try {
      if (isFavorited) {
        await axios.delete(`/api/deleteRecipe?recipeId=${recipe.id}`);
        setFavoritedRecipes((prev) => {
          const updated = new Set(prev);
          updated.delete(recipe.id);
          return updated;
        });
      } else {
        await axios.post('/api/saveRecipe', recipe);
        setFavoritedRecipes((prev) => {
          const updated = new Set(prev);
          updated.add(recipe.id);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      alert('Failed to update favorite status.');
    }
  };

  const handleEditRecipe = (recipe: any) => {
    setEditingRecipe(recipe);
  };

  const handleSaveEditedRecipe = (editedRecipe: any) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === editedRecipe.id ? editedRecipe : recipe
      )
    );

    setEditingRecipe(null);
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
  };




  return (
  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div className="max-w-[90vw] sm:max-w-[80vw] mx-auto">
      <Card className="border-indigo-100 shadow-xl mb-12 overflow-hidden">
        <CardHeader className="border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <CardTitle className="text-2xl font-semibold text-gray-800">AI Recipe Generator</CardTitle>
          <CardDescription className="text-gray-600">
            Let&apos;s turn your available ingredients into amazing recipes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="ingredients" className="space-y-6">
            <TabsList className="flex justify-between gap-2 bg-indigo-50/50 p-1 rounded-md">
  <TabsTrigger 
    value="ingredients" 
    className="w-full text-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600"
  >
    <Utensils className="h-4 w-4 mr-2" />
    Ingredients
  </TabsTrigger>
  <TabsTrigger 
    value="preferences"
    className="w-full text-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600"
  >
    <Settings2 className="h-4 w-4 mr-2" />
    Preferences
  </TabsTrigger>
</TabsList>


            <TabsContent value="ingredients" className="space-y-6">
              <div className="grid gap-6">
  <div className="relative w-full">
  {!session ? (
  <div
    onClick={() => signIn()}
    className="rounded-xl border-2 border-dashed p-8 transition-all hover:border-indigo-300 hover:from-indigo-50/30 hover:to-purple-50/30 cursor-pointer"
  >
    <div className="flex flex-col items-center space-y-6">
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-indigo-600" />
        </div>
        <span className="text-base font-medium text-gray-700">
          Upload Ingredient Image
        </span>
       <p className="text-sm text-gray-500 mt-1 text-center">
  Sign in to unlock AI image ingredient detection
</p>

      </div>
    </div>
  </div>
) : (
  <ImageUpload
    imagePreview={imagePreview}
    isRecipeGenerated={isRecipeGenerated}
    isImageProcessing={isImageProcessing}
    error={imageError}
    onImageUpload={handleImageUpload}
    onImageRemove={handleImageRemove}
  />
)}

</div>



  <div className="w-full space-y-4">

                  <div className="flex flex-row gap-2">

                    <input
                      type="text"
                      value={currentIngredient}
                      onChange={(e) => setCurrentIngredient(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddIngredient();
                        }
                      }}
                      placeholder="Enter an ingredient"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={isRecipeGenerated}
                    />
                    <Button
                      onClick={handleAddIngredient}
                      disabled={isRecipeGenerated || !currentIngredient.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {ingredient}
                        <button
                          onClick={() => handleRemoveIngredient(index)}
                          className="ml-1 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                          disabled={isRecipeGenerated}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium text-gray-700">
                  Max Number of Recipes: {numRecipes}
                </Label>
                <Slider
                  value={[numRecipes]}
                  onValueChange={(value) => setNumRecipes(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  disabled={isRecipeGenerated}
                  className="py-4"
                />
                <p className="text-sm text-gray-500">
                  Choose up to how many recipe suggestions you&apos;d like to receive
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-6 border-t border-indigo-50">
            {!isRecipeGenerated ? (
              <Button
                onClick={handleGenerateRecipe}
                disabled={ingredients.length === 0 || loading || isImageProcessing}
                className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 transition-all"
              >
                {isImageProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Image...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Recipes...
                  </>
                ) : (
                  <>
                    <ChefHat className="mr-2 h-5 w-5" />
                    Generate Recipes
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNewRecipe}
                variant="outline"
                className="w-full h-12 text-base border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                Start New Recipe Search
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {editingRecipe ? (
        <EditRecipeCard
          recipe={editingRecipe}
          onSave={handleSaveEditedRecipe}
          onCancel={handleCancelEdit}
        />
      ) : (
        <div className="px-2 sm:px-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorited={favoritedRecipes.has(recipe.id)}
              onFavoriteToggle={handleFavoriteToggle}
              ingredientVariants={ingredientVariants}
              onEditRecipe={handleEditRecipe}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

            }  