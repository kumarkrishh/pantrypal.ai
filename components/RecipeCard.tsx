import React from 'react';
import Image from 'next/image';
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

interface RecipeCardProps {
  recipe: any;
  isFavorited: boolean;
  onFavoriteToggle: (recipe: any) => void;
  ingredientVariants: string[];
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isFavorited, onFavoriteToggle, ingredientVariants }) => {
  if (!recipe) {
    return null; 
  }
  return (
    <li key={recipe.id} style={styles.recipeCard}>
      {/* Recipe Title */}
      <h4 style={styles.recipeTitle}>{recipe.title}</h4>
      
      {/* Image Container with Heart Icon */}
      <div style={styles.imageWrapper}>
        {recipe.image && (
          <Image
            src={recipe.image}
            alt={recipe.title}
            width={600}
            height={200}
            style={styles.recipeImage}
          />
        )}
        {/* Heart Icon */}
        <div
          style={styles.heartIcon}
          onClick={() => onFavoriteToggle(recipe)}
          title={isFavorited ? "Favorited" : "Add to favorites"}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onFavoriteToggle(recipe);
            }
          }}
          aria-label={isFavorited ? "Favorited" : "Add to favorites"}
        >
          {isFavorited ? (
            <AiFillHeart color="red" size={24} />
          ) : (
            <AiOutlineHeart color="gray" size={24} />
          )}
        </div>
      </div>

      {/* Preparation Time and Servings */}
      <p>Preparation time: {recipe.readyInMinutes} minutes</p>
      <p>Serves: {recipe.servings} people</p>

      {/* Nutrition Facts */}
      {recipe.nutrition && (
        <div style={styles.section}>
          <h5 style={styles.sectionHeader}>Nutrition Facts:</h5>
          <p>Calories: {recipe.nutrition.calories}</p>
          <p>Carbohydrates: {recipe.nutrition.carbs}</p>
          <p>Protein: {recipe.nutrition.protein}</p>
          <p>Fat: {recipe.nutrition.fat}</p>
        </div>
      )}

      {/* Ingredients */}
      {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
        <div style={styles.section}>
          <h5 style={styles.sectionHeader}>Ingredients:</h5>
          <ul style={styles.ingredientsList}>
            {recipe.extendedIngredients
              .sort((a: any, b: any) => {
                const isAInputIngredient = ingredientVariants.some((variant) =>
                  a.name.toLowerCase().includes(variant)
                );
                const isBInputIngredient = ingredientVariants.some((variant) =>
                  b.name.toLowerCase().includes(variant)
                );
                return Number(isAInputIngredient) - Number(isBInputIngredient);
              })
              .map((ingredient: any, index: number) => {
                const isInputIngredient = ingredientVariants.some((variant) =>
                  ingredient.name.toLowerCase().includes(variant)
                );
                return (
                  <li
                    key={`${recipe.id}-${ingredient.id}-${index}`}
                    style={{
                      color: isInputIngredient ? 'green' : 'red',
                    }}
                  >
                    {ingredient.original}
                  </li>
                );
              })}
          </ul>
        </div>
      )}


      {/* Instructions */}
      {recipe.instructions && (
        <div style={styles.section}>
          <h5 style={styles.sectionHeader}>Instructions:</h5>
          <div
            dangerouslySetInnerHTML={{
              __html: recipe.instructions,
            }}
          />
        </div>
      )}
    </li>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
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
  section: {
    marginBottom: '15px',
  },
};

export default RecipeCard;
