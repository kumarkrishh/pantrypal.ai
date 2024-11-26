'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import pluralize from 'pluralize';
import { useSession } from 'next-auth/react';
import { ChefHat, Loader2, Utensils, Settings2 } from 'lucide-react';
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

export default function RecipeGenerator() {
  const { data: session } = useSession();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [isRecipeGenerated, setIsRecipeGenerated] = useState(false);
  const [maxAdditionalIngredients, setMaxAdditionalIngredients] = useState(5);
  const [numRecipes, setNumRecipes] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [favoritedRecipes, setFavoritedRecipes] = useState<Set<string>>(new Set());
  const [isImageProcessing, setIsImageProcessing] = useState(false);

  const apiKey = [
    process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY_1,
    process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY_2
  ];
  const openai = createOpenAIClient(process.env.NEXT_PUBLIC_OPENAI_API_KEY);

  useEffect(() => {
    if (session) {
      axios
        .get('/api/getSavedRecipes')
        .then((res) => {
          setFavoritedRecipes(new Set(res.data.map((recipe: any) => recipe.id)));
        })
        .catch(() => {
          setError('Failed to fetch saved recipes');
        });
    }
  }, [session]);

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      setError('Please enter ingredients or upload an image');
      return;
    }
    setLoading(true);
    setError('');
    setRecipes([]);
  
    let successfulRequest = false;
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
          setError('No recipes found. Try different ingredients or increase the number of additional ingredients');
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
  
            return {
              ...details.data,
              instructions: formattedInstructions,
              nutrition: nutrition.data
            };
          })
        );
  
        setRecipes(recipeDetails);
        setIsRecipeGenerated(true);
        successfulRequest = true;
        break;
      } catch (err) {
        console.error(`API Key #${i + 1} failed. Trying the next key...`);
      }
    }
  
    if (!successfulRequest) {
      setError('Failed to fetch recipes after trying all available API keys');
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
        setImageError('No ingredients detected in the image. Try uploading a clearer image or manually enter your ingredients.');
      } else {
        setIngredients(prevIngredients => {
          const newIngredients = Array.from(new Set([...prevIngredients, ...detectedIngredients]));
          return newIngredients;
        });        
      }
    } catch (err: any) {
      setImageError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(err);
    } finally {
      setIsImageProcessing(false);
    }
  };

  const formatInstructions = async (instructions: string) => {
    if (!openai) return instructions;
  
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Format these cooking instructions into clear, numbered steps. Remove any ads or unnecessary text.'
          },
          {
            role: 'user',
            content: instructions
          }
        ]
      });
      
      return response.choices[0].message.content || instructions;
    } catch (err) {
      console.error('Failed to format instructions:', err);
      return instructions;
    }
  };

  const ingredientVariants = ingredients.flatMap(ingredient => [
    pluralize.singular(ingredient),
    pluralize.plural(ingredient),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="p-1 text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Pantry Pal
          </h1>
          <p className="text-lg text-gray-600">Transform your ingredients into delicious meals</p>
        </div>

        <div className="max-w-[1400px] mx-auto">
          <Card className="border-indigo-100 shadow-xl mb-12 overflow-hidden">
            <CardHeader className="border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
              <CardTitle className="text-2xl font-semibold text-gray-800">Recipe Generator</CardTitle>
              <CardDescription className="text-gray-600">
                Let&apos;s turn your available ingredients into amazing recipes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="ingredients" className="space-y-6">
                <TabsList className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-1">
                  <TabsTrigger 
                    value="ingredients" 
                    className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
                  >
                    <Utensils className="h-4 w-4 mr-2" />
                    Ingredients
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences"
                    className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Preferences
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ingredients" className="space-y-6">
                  <div className="grid gap-6">
                    <ImageUpload
                      imagePreview={imagePreview}
                      isRecipeGenerated={isRecipeGenerated}
                      isImageProcessing={isImageProcessing}
                      error={imageError}
                      onImageUpload={handleImageUpload}
                    />
                    <IngredientInput
                      ingredients={ingredients}
                      onIngredientsChange={setIngredients}
                      disabled={isRecipeGenerated}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-base font-medium text-gray-700">
                        Maximum Additional Ingredients: {maxAdditionalIngredients}
                      </Label>
                      <Slider
                        value={[maxAdditionalIngredients]}
                        onValueChange={(value) => setMaxAdditionalIngredients(value[0])}
                        min={0}
                        max={10}
                        step={1}
                        disabled={isRecipeGenerated}
                        className="py-4"
                      />
                      <p className="text-sm text-gray-500">
                        Limit the number of extra ingredients needed for recipes
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-medium text-gray-700">
                        Number of Recipes: {numRecipes}
                      </Label>
                      <Slider
                        value={[numRecipes]}
                        onValueChange={(value) => setNumRecipes(value[0])}
                        min={1}
                        max={5}
                        step={1}
                        disabled={isRecipeGenerated}
                        className="py-4"
                      />
                      <p className="text-sm text-gray-500">
                        Choose how many recipe suggestions you&apos;d like to receive
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 pt-6 border-t border-indigo-50">
                {!isRecipeGenerated ? (
                  <Button
                    onClick={handleGenerateRecipe}
                    disabled={loading || isImageProcessing}
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorited={favoritedRecipes.has(recipe.id)}
                onFavoriteToggle={() => {}}
                ingredientVariants={ingredientVariants}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}