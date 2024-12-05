'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Loader2 } from 'lucide-react';
import OpenAI from 'openai';

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
        console.error('Failed to update recipe:', data.error);
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="fixed inset-0 z-50 overflow-auto bg-white">
      <CardHeader>
        <CardTitle className="text-2xl">{editedRecipe.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex">
        <div className="w-1/2 pr-4">
          {/* Left side: The recipe details */}
          <h3 className="text-xl font-semibold mb-2">Recipe</h3>
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
            <h4 className="font-medium text-lg mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside mb-4">
              {ingredients.map((ingredient: any) => (
                <li
                  key={ingredient.id}
                  className={`${!ingredient.selected ? 'line-through text-gray-400' : ''}`}
                >
                  {ingredient.original}
                </li>
              ))}
            </ul>
            {/* Display the updated instructions */}
            <h4 className="font-medium text-lg mb-2">Instructions:</h4>
            <div className="text-base leading-relaxed">
              {editedRecipe.instructions
                .split('\n')
                .map((line: string, index: number) => (
                  <div key={index}>{line}</div>
                ))}
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-4">
          <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
          {ingredients.map((ingredient: any, index: number) => (
            <div key={ingredient.id} className="flex items-center mb-2">
              <Checkbox
                checked={ingredient.selected}
                onCheckedChange={() => handleIngredientToggle(index)}
              />
              <Input
                value={ingredient.original}
                onChange={(e) => handleIngredientEdit(index, e.target.value)}
                className={`ml-2 flex-grow ${
                  !ingredient.selected ? 'text-gray-400' : ''
                }`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveIngredient(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleAddIngredient} className="mt-2">
            <Plus className="h-4 w-4 mr-2" /> Add Ingredient
          </Button>
          <Button 
            onClick={handleUpdateRecipe} 
            className="mt-4 w-full"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating Recipe...
              </>
            ) : (
              'Update Recipe'
            )}
          </Button>
        </div>
      </CardContent>
      <div className="fixed bottom-4 right-4">
        <Button onClick={onCancel} variant="outline" className="mr-2">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
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
    </Card>
  );
}
