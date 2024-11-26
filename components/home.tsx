'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import pluralize from 'pluralize';
import { useSession } from 'next-auth/react';
import OpenAI from 'openai';
import { Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RecipeCard from './RecipeCard';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Navbar from './Navbar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ChefHat, Loader2, Utensils, Settings2 } from 'lucide-react';

export default function RecipeGenerator() {
  const { data: session } = useSession();
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
  const [isImageProcessing, setIsImageProcessing] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const openai = openaiKey ? new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true }) : null;

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
    if (!ingredients.trim()) {
      setError('Please enter ingredients or upload an image');
      return;
    }
    setLoading(true);
    setError('');
    setRecipes([]);
  
    try {
      const parsedIngredients = ingredients.split(',').map((i) => i.trim());
      const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
        params: {
          ingredients: parsedIngredients.join(','),
          number: numRecipes,
          ranking: 1,
          apiKey: apiKey,
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
              params: { apiKey: apiKey },
            }),
            axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json`, {
              params: { apiKey: apiKey },
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
    } catch (err) {
      setError('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecipe = () => {
    setIngredients('');
    setRecipes([]);
    setError('');
    setImagePreview(null);
    setSelectedImage(null);
    setIsRecipeGenerated(false);
    setIsImageProcessing(false);
  };

  const handleFavoriteToggle = async () => {
    // Placeholder for favorite toggle logic
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setIsImageProcessing(true);
  
      try {
        if (!openai) {
          setError('OpenAI is not configured. Please check your API key.');
          return;
        }
  
        const base64Image = await fileToBase64(file);
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { 
                  type: 'text', 
                  text: 'List all the ingredients you can see in this image. Return them as a comma-separated list. If you don\'t see any food ingredients, return an empty list.' 
                },
                { 
                  type: 'image_url', 
                  image_url: { url: `data:image/jpeg;base64,${base64Image}` } 
                },
              ],
            },
          ],
        });
  
        // Append new ingredients to existing ingredients
        const newIngredients = response.choices[0].message.content || '';
        setIngredients(prevIngredients => 
          prevIngredients 
            ? `${prevIngredients}, ${newIngredients}` 
            : newIngredients
        );
      } catch (err: any) {
        if (err instanceof Error) {
          setError(`Error processing image: ${err.message}`);
        } else {
          setError('An unknown error occurred while processing the image');
        }
        console.error(err);
      } finally {
        setIsImageProcessing(false);
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
      reader.onerror = (error) => reject(error);
    });
  };

  const parseIngredientsWithOpenAI = async (text: string) => {
    if (!openai) {
      setError('OpenAI is not configured. Please check your API key.');
      return;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that parses ingredient lists.' },
        { role: 'user', content: `Parse this text into a comma-separated list of ingredients: ${text}` },
      ],
    });

    return response.choices[0].message.content?.split(',').map((i) => i.trim()) || [];
  };

  const inputIngredientsArray = ingredients.split(',').map((ingredient) => ingredient.trim().toLowerCase());
  const ingredientVariants = inputIngredientsArray.flatMap((ingredient) => [
    pluralize.singular(ingredient),
    pluralize.plural(ingredient),
  ]);

  const formatInstructions = async (instructions: string) => {
    if (!openai) {
      return instructions;
    }
  
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
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
                  <div
                    className={cn(
                      "rounded-xl border-2 border-dashed p-8 transition-all bg-gradient-to-br",
                      "hover:border-indigo-300 hover:from-indigo-50/30 hover:to-purple-50/30",
                      isRecipeGenerated ? "border-gray-200 from-gray-50 to-gray-50/50" : "border-indigo-200 from-white to-white"
                    )}
                  >
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-indigo-600" />
                      </div>
                      <span className="text-base font-medium text-gray-700">
                        {imagePreview ? 'Change Image' : 'Upload Ingredient Image'}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">Click or drag and drop</span>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isRecipeGenerated}
                      className="hidden"
                    />
                    {imagePreview && (
                      <div className="mt-6 relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                        <Image src={imagePreview} alt="Uploaded ingredients" fill className="object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Ingredients Input Section */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium text-gray-700">Available Ingredients</Label>
                    <Input
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="Enter ingredients (comma separated)"
                      disabled={isRecipeGenerated}
                      className="border-indigo-100 focus-visible:ring-indigo-600 h-12 text-base"
                    />
                    <p className="text-sm text-gray-500">Add your available ingredients, separated by commas</p>
                  </div>
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
                    disabled={loading || isImageProcessing} // Disable button during image processing or loading
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
                onFavoriteToggle={handleFavoriteToggle}
                ingredientVariants={ingredientVariants}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  imageUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #0070f3',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
    transition: 'border-color 0.3s, background-color 0.3s',
    textAlign: 'center',
  },
  fileInput: {
    display: 'none',
  },
  imageUploadLabel: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  imagePreviewContainer: {
    maxWidth: '200px',
    marginTop: '16px',
  },
  imagePreview: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    objectFit: 'cover',
  },
};
