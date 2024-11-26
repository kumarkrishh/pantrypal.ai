'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface IngredientInputProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  disabled?: boolean;
}

export function IngredientInput({ ingredients, onIngredientsChange, disabled }: IngredientInputProps) {
  const [currentIngredient, setCurrentIngredient] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentIngredient.trim()) {
      e.preventDefault();
      addIngredient();
    }
  };

  const addIngredient = () => {
    const trimmedIngredient = currentIngredient.trim().toLowerCase();
    if (trimmedIngredient && !ingredients.includes(trimmedIngredient)) {
      onIngredientsChange([...ingredients, trimmedIngredient]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (indexToRemove: number) => {
    onIngredientsChange(ingredients.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-gray-700">Available Ingredients</Label>
      <Input
        value={currentIngredient}
        onChange={(e) => setCurrentIngredient(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type an ingredient and press Enter"
        disabled={disabled}
        className="border-indigo-100 focus-visible:ring-indigo-600 h-12 text-base"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {ingredients.map((ingredient, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-sm py-1 px-3"
            onRemove={() => removeIngredient(index)}
          >
            {ingredient}
          </Badge>
        ))}
      </div>
      <p className="text-sm text-gray-500">Press Enter after each ingredient to add it to the list</p>
    </div>
  );
}