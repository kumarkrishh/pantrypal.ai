'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Loader2 } from 'lucide-react';
import OpenAI from 'openai';
import Navbar from '@/components/Navbar';

const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
let openai: OpenAI;
if (openaiKey) {
  openai = new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
} else {
  console.warn('OpenAI API key not found. Some features may not work.');
}

interface EditRecipeCardProps {
  recipe: any;
  onSave: (editedRecipe: any) => void;
  onCancel: () => void;
}

export default function EditRecipeCard({
  recipe,
  onSave,
  onCancel,
}: EditRecipeCardProps) {
  const [editedRecipe, setEditedRecipe] = useState({
    ...recipe,
    instructions: recipe.instructions || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Remove duplicates and initialize ingredients with 'selected' property and unique id
  const uniqueIngredients = () => {
    const seen = new Set();
    const result = [];
    for (const ing of recipe.extendedIngredients) {
      const original = ing.original.trim().toLowerCase();
      if (!seen.has(original)) {
        seen.add(original);
        result.push({
          ...ing,
          selected: ing.selected !== undefined ? ing.selected : true,
          id: Date.now() + Math.random(), // unique id for this ingredient
        });
      }
    }
    return result;
  };

  const [ingredients, setIngredients] = useState(uniqueIngredients());

  const handleIngredientToggle = (index: number) => {
    setIngredients((prevIngredients: any) => {
      const updatedIngredients = [...prevIngredients];
      updatedIngredients[index].selected = !updatedIngredients[index].selected;
      return updatedIngredients;
    });
  };

  const handleIngredientEdit = (index: number, newValue: string) => {
    setIngredients((prevIngredients: any) => {
      const updatedIngredients = [...prevIngredients];
      updatedIngredients[index].original = newValue;
      return updatedIngredients;
    });
  };

  const handleAddIngredient = () => {
    setIngredients((prevIngredients: any) => [
      ...prevIngredients,
      { id: Date.now() + Math.random(), original: '', selected: true },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prevIngredients: any) => {
      const updatedIngredients = [...prevIngredients];
      updatedIngredients.splice(index, 1);
      return updatedIngredients;
    });
  };

  const handleUpdateRecipe = async () => {
    setIsUpdating(true);
    const selectedIngredients = ingredients.filter((ingredient: any) => ingredient.selected);
    console.log('Allowed ingredients:', selectedIngredients.map((ing: any) => ing.original));

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a culinary expert tasked with updating recipes based on a strict set of allowed ingredients.'
          },
          {
            role: 'user',
            content: `Here is the original recipe: ${editedRecipe.instructions}.
            Here are the only ingredients we have: ${selectedIngredients
              .map((ing: any) => ing.original)
              .join(', ')}.
            Edit the recipe as little as possible with these new ingredients. Make sure not to include any ingredient not in the list.
            Strictly include the ingredient amount values and only use the new ingredients in the instructions.
            Strictly just write out the instructions very descriptively, nothing else.`,
          },
        ],      
        temperature: 0.7,
        max_tokens: 500,
      });

      console.log('API response:', response);
      const updatedRecipe = response.choices[0].message.content || '';
      console.log(updatedRecipe);

      setEditedRecipe((prevRecipe: any) => ({
        ...prevRecipe,
        instructions: updatedRecipe,
      }));
    } catch (error) {
      console.error('Error updating recipe:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditedRecipe((prev: any) => ({ ...prev, [name]: value }));
    },
    [setEditedRecipe]
  );

  const handleSave = async () => {
    setIsSaving(true);
    const { _id, ...recipeToUpdate } = editedRecipe; // Exclude _id
    const updatedRecipe = {
      ...recipeToUpdate,
      extendedIngredients: ingredients,
    };

    try {
      const response = await fetch('/api/updateRecipe', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRecipe),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Recipe updated successfully:', data);
        onSave(updatedRecipe);
      } else {
        alert("You must be signed in to save edits")
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    
    <Card className="fixed inset-0 z-50 overflow-auto bg-white">
      <Navbar />
      <div className="text-center">
        <CardHeader>
          <CardTitle className="font-semibold text-4xl mb-2 bg-gradient-to-r from-purple-600 to-indigo-800 text-transparent bg-clip-text">
            Recipe for {editedRecipe.title}
          </CardTitle>
        </CardHeader>
      </div>
      <CardContent className="flex">
        <div className="w-1/2 pr-4">
          {/* Left side: The recipe details */}
          <div className="border-2 border-indigo-300 rounded-lg p-4 bg-indigo-50 shadow-md relative">
            {isUpdating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-indigo-600 font-medium">Updating Recipe...</p>
                </div>
              </div>
            )}
            {/* Display the updated ingredients list */}
            <h4 className="font-semibold text-xl mb-2 text-indigo-700">Ingredients:</h4>
            <ul className="list-disc list-inside mb-4">
              {ingredients.map((ingredient: any) => (
                <li
                  key={ingredient.id}
                  className={`${
                    !ingredient.selected ? 'line-through text-gray-400' : ''
                  }`}
                >
                  {ingredient.original}
                </li>
              ))}
            </ul>
            {/* Display the updated instructions */}
            <h4 className="font-semibold text-xl mb-2 text-indigo-700">Instructions:</h4>
            <div className="text-base leading-relaxed">
              {editedRecipe.instructions
                .split('\n')
                .map((line: string, index: number) => (
                  <div key={index}>{line}</div>
                ))}
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-4 flex flex-col">
          <div className="w-full max-w-md">
          <h4 className="font-semibold text-xl mb-3 text-indigo-700 text-center">Edit Ingredients:</h4>
          {ingredients.map((ingredient: any, index: number) => (
            <div key={ingredient.id} className="flex items-center mb-2">
              <Input
                value={ingredient.original}
                onChange={(e) => handleIngredientEdit(index, e.target.value)}
                className={`ml-2 flex-grow ${
                  !ingredient.selected ? 'text-gray-400' : ''
                }`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveIngredient(index)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ))}
          {/* Wrap Add Ingredient and Update Recipe buttons in a single flex container */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <Button
              onClick={handleAddIngredient}
              className="bg-indigo-600 bg-gradient-to-r from-purple-600 to-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Ingredient
            </Button>
            <Button
              onClick={handleUpdateRecipe}
              className="bg-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 hover:bg-indigo-700 text-white w-full"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                </>
              ) : (
                'Update Recipe'
              )}
            </Button>
          </div>
          </div>
          <div className="fixed bottom-4 right-4">
            <Button onClick={onCancel} variant="outline" className="mr-2 bg-white text-indigo-600 hover:bg-indigo-100 border-indigo-600">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600  bg-gradient-to-r bg-gradient-to-r from-indigo-600 to-purple-600 hover:bg-indigo-700 text-white">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
}