'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
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
  onEditRecipe,
}: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!recipe) return null;

  const handleShare = async () => {
    const shareData = {
      title: recipe.title,
      text: `Check out this recipe for ${recipe.title}!`,
      url: recipe.sourceUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
    }
  };

  return (
    <Card className="w-auto overflow-hidden transition-all hover:shadow-lg">
      {/* Recipe Image and Action Buttons */}
      <div className="relative aspect-video">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white/90 transition-colors"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white/90 transition-colors"
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
                  {disableIngredientColor || ingredientVariants.length === 0 ? (
                    // Display all ingredients together
                    <ul className="space-y-1.5">
                      {recipe.extendedIngredients?.map((ingredient: any) => (
                        <li
                          key={ingredient.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span>•</span>
                          <span>{ingredient.original}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    // Separate ingredients into Available and Missing
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-md font-semibold mb-2">
                          Available Ingredients
                        </h3>
                        <ul className="space-y-1.5">
                          {recipe.extendedIngredients
                            ?.filter((ingredient: any) =>
                              ingredientVariants.some((variant) =>
                                ingredient.name?.toLowerCase().includes(variant)
                              )
                            )
                            .map((ingredient: any) => (
                              <li
                                key={ingredient.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span>•</span>
                                <span>{ingredient.original}</span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-md font-semibold mb-2">
                          Missing Ingredients
                        </h3>
                        <ul className="space-y-1.5">
                          {recipe.extendedIngredients
                            ?.filter((ingredient: any) =>
                              !ingredientVariants.some((variant) =>
                                ingredient.name?.toLowerCase().includes(variant)
                              )
                            )
                            .map((ingredient: any) => (
                              <li
                                key={ingredient.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span>•</span>
                                <span>{ingredient.original}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="instructions">
                <AccordionTrigger>Instructions</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {recipe.instructions
                      ?.split('\n')
                      .map((step: string, index: number) => (
                        <p key={index} className="text-sm">
                          {step.trim()}
                        </p>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>
        )}
      </CardContent>
    </Card>
  );
}