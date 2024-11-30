'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: any;
  isFavorited: boolean;
  onFavoriteToggle: (recipe: any) => void;
  ingredientVariants?: string[];
  disableIngredientColor?: boolean;
  onEditRecipe?: (recipe: any) => void;
}

export default function RecipeCard({
  recipe,
  isFavorited,
  onFavoriteToggle,
  ingredientVariants = [],
  disableIngredientColor = false, 
  onEditRecipe
}: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!recipe) return null;

  return (
    <Card className="w-auto overflow-hidden transition-all hover:shadow-lg">
      {/* Recipe Image and Favorite Button */}
      <div className="relative aspect-video">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 transition-colors"
          onClick={() => onFavoriteToggle(recipe)}
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-colors',
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'
            )}
          />
        </Button>
      </div>

      {/* Recipe Title and Basic Info */}
      <CardHeader>
        <CardTitle className="text-xl">{recipe.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm">
          <span>🕒 {recipe.readyInMinutes} mins</span>
          <span>•</span>
          <span>👥 Serves {recipe.servings}</span>
        </CardDescription>
        {recipe.diets?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.diets.slice(0, 2).map((diet: string) => (
              <Badge key={diet} variant="secondary" className="capitalize">
                {diet}
              </Badge>
            ))}
            {recipe.diets.length > 2 && (
              <Badge variant="secondary">+{recipe.diets.length - 2}</Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Nutrition Facts */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
          {recipe.nutrition?.calories && (
            <div>
              <span className="text-muted-foreground">Calories: </span>
              <span className="font-medium">{recipe.nutrition.calories}</span>
            </div>
          )}
          {recipe.nutrition?.protein && (
            <div>
              <span className="text-muted-foreground">Protein: </span>
              <span className="font-medium">{recipe.nutrition.protein}</span>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center gap-2">
            {isExpanded ? 'Show Less' : 'Show More'}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </Button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4">
            <Separator />

            {/* Detailed Nutrition */}
            {recipe.nutrition && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                {recipe.nutrition.carbs && (
                  <div>
                    <span className="text-muted-foreground">Carbs: </span>
                    <span className="font-medium">{recipe.nutrition.carbs}</span>
                  </div>
                )}
                {recipe.nutrition.fat && (
                  <div>
                    <span className="text-muted-foreground">Fat: </span>
                    <span className="font-medium">{recipe.nutrition.fat}</span>
                  </div>
                )}
              </div>
            )}

            {/* All Diet Types */}
            {recipe.diets?.length > 2 && (
              <div className="flex flex-wrap gap-1.5">
                {recipe.diets.map((diet: string) => (
                  <Badge key={diet} variant="secondary" className="capitalize">
                    {diet}
                  </Badge>
                ))}
              </div>
            )}

            {/* Ingredients and Instructions */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ingredients">
                <AccordionTrigger>Ingredients</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5">
                    {recipe.extendedIngredients
                      ?.sort((a: any, b: any) => {
                        const isAInput = ingredientVariants.some((variant) =>
                          a.name.toLowerCase().includes(variant)
                        );
                        const isBInput = ingredientVariants.some((variant) =>
                          b.name.toLowerCase().includes(variant)
                        );
                        return isAInput === isBInput ? 0 : isAInput ? -1 : 1;
                      })
                      .map((ingredient: any, index: number) => {
                        if (disableIngredientColor) {
                          return (
                            <li
                              key={`${ingredient.id}-${index}`}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <span>•</span>
                              <span>{ingredient.original}</span>
                            </li>
                          );
                        }

                        const isInputIngredient = ingredientVariants.some(
                          (variant) =>
                            ingredient.name.toLowerCase().includes(variant)
                        );

                        return (
                          <li
                            key={ingredient.id}
                            className={cn(
                              'flex items-center gap-2 text-sm',
                              isInputIngredient
                                ? 'text-green-600'
                                : 'text-red-600'
                            )}
                          >
                            <span>•</span>
                            <span>{ingredient.original}</span>
                          </li>
                        );
                      })}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="instructions">
                <AccordionTrigger>Instructions</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {recipe.instructions?.split('\n').map((step: string, index: number) => (
                      <p key={index} className="text-sm">
                        {step.trim()}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Edit Recipe Button */}
            <Button
              variant="default"
              className="w-full"
              onClick={() => onEditRecipe?.(recipe)}
            >
              Edit Recipe
            </Button>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
