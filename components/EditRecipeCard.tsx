'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Plus } from 'lucide-react';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';


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
    onCancel
}: EditRecipeCardProps) {
    const [editedRecipe, setEditedRecipe] = useState({
      ...recipe,
      instructions: recipe.instructions || ''
    });
    const [ingredients, setIngredients] = useState(recipe.extendedIngredients);

    const handleIngredientToggle = (index: number) => {
      const updatedIngredients = [...ingredients];
      updatedIngredients[index].selected = !updatedIngredients[index].selected;
      setIngredients(updatedIngredients);
    };
  
    const handleIngredientEdit = (index: number, newValue: string) => {
      setIngredients((prevIngredients: any) => {
        const updatedIngredients = [...prevIngredients];
        updatedIngredients[index].original = newValue;
        return updatedIngredients;
      });
    };
  
    const handleAddIngredient = () => {
      setIngredients([...ingredients, { id: Date.now(), original: '', selected: true }]);
    };

    const handleUpdateRecipe = async () => {
      // console.log('Updating recipe...');
      // console.log('Ingredients:', ingredients);
      const selectedIngredients = ingredients.filter((ingredient: { selected: any; }) => ingredient.selected);
      // console.log('Updated Ingredients:', updatedIngredients);
      // console.log('Original Recipe:', editedRecipe.instructions);
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a culinary expert tasked with updating recipes based on ingredient changes."
            },
            {
              role: "user",
              content: `Update the following recipe with these new ingredients: ${selectedIngredients.map((ing: { original: any; }) => ing.original).join(', ')}. Original recipe: ${editedRecipe.instructions}. Strictly include the ingredient amount values and only use the new ingredients in the instructions. Stricly just write out the instructions very descriptively, nothing else.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
        console.log('API response:', response);
        const updatedRecipe = response.choices[0].message.content || '';
        console.log(updatedRecipe);

        setEditedRecipe((prevRecipe: any) => ({
          ...prevRecipe,
          instructions: updatedRecipe
        }));
      } catch (error) {
        console.error('Error updating recipe:', error);
      }
    };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedRecipe((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedRecipe);
  };

  return (
    <Card className="fixed inset-0 z-50 overflow-auto bg-white">
      <CardHeader>
        <CardTitle className="text-2xl">{recipe.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex">
        <div className="w-1/2 pr-4">
          {/* Left side: The recipe details (it's not directly editable) */}
          <h3 className="text-xl font-semibold mb-2">Recipe</h3>
          {/* Initial ingredients here */}
          <div className="border-2 border-indigo-300 rounded-lg p-4 bg-indigo-50 shadow-md">
          {/*  <h4 className="font-medium text-lg mb-2">Instructions:</h4> */}
            <div className="space-y-2">
            <div className="text-base leading-relaxed mb-4">
              {editedRecipe.instructions.split('\n').map((line: any, index: any) => (
                <div key={index}>{line}</div>
              ))}
            </div>
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-4">
          <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
          {ingredients.map((ingredient: any, index: any) => (
            <div key={`${ingredient.id}-${uuidv4()}`} className="flex items-center mb-2">
              <Checkbox
                checked={ingredient.selected}
                onCheckedChange={() => handleIngredientToggle(index)}
              />
              <Input
                value={ingredient.original}
                onChange={(e) => handleIngredientEdit(index, e.target.value)}
                className={`ml-2 flex-grow ${!ingredient.selected ? 'text-gray-400' : ''}`}
              />
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleAddIngredient} className="mt-2">
            <Plus className="h-4 w-4 mr-2" /> Add Ingredient
          </Button>
          <Button onClick={handleUpdateRecipe} className="mt-4 w-full">
            Update Recipe
          </Button>
        </div>
      </CardContent>
      <div className="fixed bottom-4 right-4">
        <Button onClick={onCancel} variant="outline" className="mr-2">
          Cancel
        </Button>
        <Button onClick={() => onSave(editedRecipe)}>Save Changes</Button>
      </div>
    </Card>
  );
}