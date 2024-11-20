import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  _id: string; 
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  nutrition: {
    calories: string;
    carbs: string;
    protein: string;
    fat: string;
  };
  extendedIngredients: any[];
  instructions: string;
  userId: string;
}

const RecipeSchema: Schema = new Schema({
  title: { type: String, required: true },
  image: { type: String },
  readyInMinutes: { type: Number },
  servings: { type: Number },
  nutrition: {
    calories: { type: String },
    carbs: { type: String },
    protein: { type: String },
    fat: { type: String },
  },
  extendedIngredients: [{ type: Schema.Types.Mixed }],
  instructions: { type: String },
  userId: { type: String, required: true },
});

export default mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);