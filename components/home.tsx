// 'use client';

// import { useState } from 'react';
// import axios from 'axios';
// import pluralize from 'pluralize';
// import Image from 'next/image';

// export default function RecipeGenerator() {
//   const [ingredients, setIngredients] = useState('');
//   const [recipes, setRecipes] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [isRecipeGenerated, setIsRecipeGenerated] = useState(false);
//   const [maxAdditionalIngredients, setMaxAdditionalIngredients] = useState(5);
//   const [numRecipes, setNumRecipes] = useState(1);

//   const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

//   const handleGenerateRecipe = async () => {
//     setLoading(true);
//     setError('');
//     setRecipes([]);
//     try {
//       const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
//         params: {
//           ingredients: ingredients,
//           number: numRecipes, 
//           ranking: 1,
//           apiKey: apiKey,
//         },
//       });
  
//       const availableRecipes = response.data.length;
//       const recipesToShow = availableRecipes < numRecipes ? availableRecipes : numRecipes; // Adjust the number of recipes to display
  
//       if (availableRecipes === 0) {
//         setError('No recipes found with the given ingredients.');
//       } else {
//         const recipeDetailsPromises = response.data.map((recipe: any) =>
//           axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
//             params: { apiKey: apiKey },
//           })
//         );
  
//         const nutritionPromises = response.data.map((recipe: any) =>
//           axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json`, {
//             params: { apiKey: apiKey },
//           })
//         );
  
//         const [recipeDetailsResponses, nutritionResponses] = await Promise.all([
//           Promise.all(recipeDetailsPromises),
//           Promise.all(nutritionPromises),
//         ]);
  
//         const detailedRecipes = recipeDetailsResponses.map((res, index) => ({
//           ...res.data,
//           nutrition: nutritionResponses[index].data,
//         }));
  
//         const filteredRecipes = detailedRecipes.filter((recipe) => {
//           const additionalIngredients = recipe.extendedIngredients.filter((ingredient: any) => {
//             const isInputIngredient = ingredientVariants.some((variant) =>
//               ingredient.name.toLowerCase().includes(variant)
//             );
//             return !isInputIngredient;
//           });
//           return additionalIngredients.length <= maxAdditionalIngredients;
//         });

//         setRecipes(filteredRecipes.slice(0, recipesToShow)); // Show only the adjusted number of recipes
//         setIsRecipeGenerated(true);
//       }
//     } catch (err) {
//       setError('An error occurred while fetching the recipes.');
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   const handleNewRecipe = () => {
//     setIngredients('');
//     setRecipes([]);
//     setError('');
//     setIsRecipeGenerated(false);
//   };

//   const inputIngredientsArray = ingredients
//     .split(',')
//     .map((ingredient) => ingredient.trim().toLowerCase());
//   const ingredientVariants = inputIngredientsArray.flatMap((ingredient) => [
//     pluralize.singular(ingredient),
//     pluralize.plural(ingredient),
//   ]);

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.title}>Pantry Pal</h2>
//       <div style={styles.inputContainer}>
//         <input
//           type="text"
//           value={ingredients}
//           onChange={(e) => setIngredients(e.target.value)}
//           placeholder="Enter ingredients (comma separated)"
//           style={styles.input}
//           disabled={isRecipeGenerated}
//         />
        
//         {/* Slider for max additional ingredients */}
//         <div style={styles.sliderContainer}>
//           <label style={styles.sliderLabel}>Max Additional Ingredients</label>
//           <input
//             type="range"
//             min="0"
//             max="10"
//             value={maxAdditionalIngredients}
//             onChange={(e) =>
//               setMaxAdditionalIngredients(Math.abs(Number(e.target.value)))
//             }
//             disabled={isRecipeGenerated}
//             style={styles.slider}
//           />
//           <span>{maxAdditionalIngredients}</span>
//         </div>

//         {}
//         <div style={styles.sliderContainer}>
//           <label style={styles.sliderLabel}>Number of Recipes</label>
//           <input
//             type="range"
//             min="1"
//             max="5"
//             value={numRecipes}
//             onChange={(e) => setNumRecipes(Math.abs(Number(e.target.value)))}
//             disabled={isRecipeGenerated}
//             style={styles.slider}
//           />
//           <span>{numRecipes}</span>
//         </div>

//         <button
//           onClick={handleGenerateRecipe}
//           disabled={loading || isRecipeGenerated}
//           style={loading ? styles.buttonDisabled : styles.button}
//         >
//           {loading ? 'Generating...' : 'Generate Recipe'}
//         </button>
//         {isRecipeGenerated && (
//           <button
//             onClick={handleNewRecipe}
//             style={styles.resetButton}
//           >
//             New Recipe
//           </button>
//         )}
//       </div>
//       {error && <p style={styles.error}>{error}</p>}
//       <div style={styles.recipesContainer}>
//         {recipes.length > 0 && (
//           <div style={styles.recipeList}>
//             <ul style={styles.recipeListContainer}>
//               {recipes.map((recipe) => (
//                 <li key={recipe.id} style={styles.recipeCard}>
//                   <h4 style={styles.recipeTitle}>{recipe.title}</h4>
//                   <Image
//                     src={recipe.image}
//                     alt={recipe.title}
//                     width={600}
//                     height={200}
//                   />
//                   <p>Preparation time: {recipe.readyInMinutes} minutes</p>
//                   <p>Serves: {recipe.servings} people</p>
//                   <h5 style={styles.sectionHeader}>Nutrition Facts:</h5>
//                   <p>Calories: {recipe.nutrition.calories}</p>
//                   <p>Carbohydrates: {recipe.nutrition.carbs}</p>
//                   <p>Protein: {recipe.nutrition.protein}</p>
//                   <p>Fat: {recipe.nutrition.fat}</p>
//                   <h5 style={styles.sectionHeader}>Ingredients:</h5>
//                   <ul style={styles.ingredientsList}>
//                     {recipe.extendedIngredients.map((ingredient: any, index: number) => {
//                       const isInputIngredient = ingredientVariants.some((variant) =>
//                         ingredient.name.toLowerCase().includes(variant)
//                       );
//                       return (
//                         <li
//                           key={`${recipe.id}-${ingredient.id}-${index}`}
//                           style={{
//                             color: isInputIngredient ? 'green' : 'red',
//                           }}
//                         >
//                           {ingredient.original}
//                         </li>
//                       );
//                     })}
//                   </ul>
//                   <h5 style={styles.sectionHeader}>Instructions:</h5>
//                   <div
//                     dangerouslySetInnerHTML={{
//                       __html: recipe.instructions,
//                     }}
//                   />
//                   <button
//                     onClick={async () => {
//                       try {
//                         const response = await axios.post('/api/saveRecipe', recipe);
//                         alert(response.data.message);
//                       } catch (error) {
//                         console.error(error);
//                         alert('Failed to save recipe.');
//                       }
//                     }}
//                     style={styles.saveButton}
//                   >
//                     Save Recipe
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// const styles = {
//     container: {
//       padding: '20px',
//       maxWidth: '800px',
//       margin: '0 auto',
//       fontFamily: 'Arial, sans-serif',
//     },
//     title: {
//       textAlign: 'center' as 'center',  // Type cast to 'center' to match the expected value
//       fontSize: '24px',
//       fontWeight: 'bold',
//     },
//     inputContainer: {
//       display: 'flex' as 'flex',  // Ensure it's recognized as a valid flex type
//       flexDirection: 'column' as 'column',  // Correct type casting for flexDirection
//       gap: '10px',
//     },
//     input: {
//       width: '100%',
//       padding: '10px',
//       border: '1px solid #ccc',
//       borderRadius: '5px',
//     },
//     sliderContainer: {
//       display: 'flex' as 'flex',  // Ensure flex is recognized
//       alignItems: 'center',
//       gap: '10px',
//     },
//     sliderLabel: {
//       fontSize: '16px',
//     },
//     slider: {
//       width: '150px',
//     },
//     button: {
//       padding: '10px 20px',
//       backgroundColor: '#0070f3',
//       color: 'white',
//       border: 'none',
//       borderRadius: '5px',
//       cursor: 'pointer',
//     },
//     buttonDisabled: {
//       padding: '10px 20px',
//       backgroundColor: '#ccc',
//       color: 'white',
//       border: 'none',
//       borderRadius: '5px',
//       cursor: 'not-allowed',
//     },
//     resetButton: {
//       padding: '10px 20px',
//       backgroundColor: '#ff4d4f',
//       color: 'white',
//       border: 'none',
//       borderRadius: '5px',
//       cursor: 'pointer',
//     },
//     error: {
//       color: 'red',
//       textAlign: 'center' as 'center',  // Cast 'textAlign' to 'center'
//     },
//     recipesContainer: {
//       marginTop: '20px',
//     },
//     recipeList: {
//       display: 'flex' as 'flex',  // Ensure flex is recognized
//       flexDirection: 'column' as 'column',  // Correct type casting for flexDirection
//       gap: '20px',
//     },
//     recipeListContainer: {
//       listStyle: 'none',
//       padding: '0',
//     },
//     recipeCard: {
//       padding: '20px',
//       border: '1px solid #ccc',
//       borderRadius: '10px',
//       boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//       backgroundColor: 'white',
//     },
//     recipeTitle: {
//       fontSize: '18px',
//       fontWeight: 'bold',
//       marginBottom: '10px',
//     },
//     recipeImage: {
//       width: '100%',
//       height: 'auto',
//       borderRadius: '8px',
//       objectFit: 'cover',
//     },
//     sectionHeader: {
//       fontSize: '16px',
//       fontWeight: 'bold',
//       marginTop: '10px',
//     },
//     ingredientsList: {
//       listStyle: 'disc',
//       paddingLeft: '20px',
//     },
//     saveButton: {
//       padding: '10px 20px',
//       backgroundColor: '#28a745',
//       color: 'white',
//       border: 'none',
//       borderRadius: '5px',
//       cursor: 'pointer',
//     },
//   };
  
'use client';

import { useState } from 'react';
import axios from 'axios';
import pluralize from 'pluralize';
import Image from 'next/image';

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecipeGenerated, setIsRecipeGenerated] = useState(false);
  const [maxAdditionalIngredients, setMaxAdditionalIngredients] = useState(5);
  const [numRecipes, setNumRecipes] = useState(1);

  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

  const handleGenerateRecipe = async () => {
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
        params: {
          ingredients: ingredients,
          number: numRecipes,
          ranking: 1,
          apiKey: apiKey,
        },
      });

      const availableRecipes = response.data.length;
      const recipesToShow = availableRecipes < numRecipes ? availableRecipes : numRecipes; // Adjust the number of recipes to display

      if (availableRecipes === 0) {
        setError('No recipes found with the given ingredients. Please try generating a new recipe.');
      } else {
        const recipeDetailsPromises = response.data.map((recipe: any) =>
          axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
            params: { apiKey: apiKey },
          })
        );

        const nutritionPromises = response.data.map((recipe: any) =>
          axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json`, {
            params: { apiKey: apiKey },
          })
        );

        const [recipeDetailsResponses, nutritionResponses] = await Promise.all([
          Promise.all(recipeDetailsPromises),
          Promise.all(nutritionPromises),
        ]);

        const detailedRecipes = recipeDetailsResponses.map((res, index) => ({
          ...res.data,
          nutrition: nutritionResponses[index].data,
        }));

        const filteredRecipes = detailedRecipes.filter((recipe) => {
          const additionalIngredients = recipe.extendedIngredients.filter((ingredient: any) => {
            const isInputIngredient = ingredientVariants.some((variant) =>
              ingredient.name.toLowerCase().includes(variant)
            );
            return !isInputIngredient;
          });
          return additionalIngredients.length <= maxAdditionalIngredients;
        });

        setRecipes(filteredRecipes.slice(0, recipesToShow)); // Show only the adjusted number of recipes
        setIsRecipeGenerated(true);
      }
    } catch (err) {
      setError('An error occurred while fetching the recipes.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecipe = () => {
    setIngredients('');
    setRecipes([]);
    setError('');
    setIsRecipeGenerated(false);
  };

  const inputIngredientsArray = ingredients
    .split(',')
    .map((ingredient) => ingredient.trim().toLowerCase());
  const ingredientVariants = inputIngredientsArray.flatMap((ingredient) => [
    pluralize.singular(ingredient),
    pluralize.plural(ingredient),
  ]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Pantry Pal</h2>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (comma separated)"
          style={styles.input}
          disabled={isRecipeGenerated}
        />
        
        {/* Slider for max additional ingredients */}
        <div style={styles.sliderContainer}>
          <label style={styles.sliderLabel}>Max Additional Ingredients</label>
          <input
            type="range"
            min="0"
            max="10"
            value={maxAdditionalIngredients}
            onChange={(e) =>
              setMaxAdditionalIngredients(Math.abs(Number(e.target.value)))
            }
            disabled={isRecipeGenerated}
            style={styles.slider}
          />
          <span>{maxAdditionalIngredients}</span>
        </div>

        {/* Slider for number of recipes */}
        <div style={styles.sliderContainer}>
          <label style={styles.sliderLabel}>Number of Recipes</label>
          <input
            type="range"
            min="1"
            max="5"
            value={numRecipes}
            onChange={(e) => setNumRecipes(Math.abs(Number(e.target.value)))}
            disabled={isRecipeGenerated}
            style={styles.slider}
          />
          <span>{numRecipes}</span>
        </div>

        {/* Show Generate Recipe button only if there are no errors or recipes generated */}
        {!error && !isRecipeGenerated && (
          <button
            onClick={handleGenerateRecipe}
            disabled={loading || isRecipeGenerated}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? 'Generating...' : 'Generate Recipe'}
          </button>
        )}

        {/* Show New Recipe button after generating a recipe */}
        {isRecipeGenerated && (
          <button
            onClick={handleNewRecipe}
            style={styles.resetButton}
          >
            New Recipe
          </button>
        )}
      </div>

      {/* Show error if no recipes found */}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.recipesContainer}>
        {recipes.length > 0 && (
          <div style={styles.recipeList}>
            <ul style={styles.recipeListContainer}>
              {recipes.map((recipe) => (
                <li key={recipe.id} style={styles.recipeCard}>
                  <h4 style={styles.recipeTitle}>{recipe.title}</h4>
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    width={600}
                    height={200}
                  />
                  <p>Preparation time: {recipe.readyInMinutes} minutes</p>
                  <p>Serves: {recipe.servings} people</p>
                  <h5 style={styles.sectionHeader}>Nutrition Facts:</h5>
                  <p>Calories: {recipe.nutrition.calories}</p>
                  <p>Carbohydrates: {recipe.nutrition.carbs}</p>
                  <p>Protein: {recipe.nutrition.protein}</p>
                  <p>Fat: {recipe.nutrition.fat}</p>
                  <h5 style={styles.sectionHeader}>Ingredients:</h5>
                  <ul style={styles.ingredientsList}>
                    {recipe.extendedIngredients.map((ingredient: any, index: number) => {
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
                  <h5 style={styles.sectionHeader}>Instructions:</h5>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: recipe.instructions,
                    }}
                  />
                  <button
                    onClick={async () => {
                      try {
                        const response = await axios.post('/api/saveRecipe', recipe);
                        alert(response.data.message);
                      } catch (error) {
                        console.error(error);
                        alert('Failed to save recipe.');
                      }
                    }}
                    style={styles.saveButton}
                  >
                    Save Recipe
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
    container: {
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
    },
    inputContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
    },
    sliderContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    sliderLabel: {
      fontSize: '16px',
    },
    slider: {
      width: '150px',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#0070f3',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    buttonDisabled: {
      padding: '10px 20px',
      backgroundColor: '#ccc',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'not-allowed',
    },
    resetButton: {
      padding: '10px 20px',
      backgroundColor: '#ff4d4f',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    error: {
      color: 'red',
      textAlign: 'center',
    },
    recipesContainer: {
      marginTop: '20px',
    },
    recipeList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    recipeListContainer: {
      listStyle: 'none',
      padding: '0',
    },
    recipeCard: {
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
    },
    recipeTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    recipeImage: {
      width: '100%',
      height: 'auto',
      borderRadius: '8px',
      objectFit: 'cover',
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
    saveButton: {
      padding: '10px 20px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
};
