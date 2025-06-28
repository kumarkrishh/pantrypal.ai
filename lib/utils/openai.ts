'use client';

export const createOpenAIClient = () => null; // Stubbed for compatibility

export const processImageForIngredients = async (
  _unused: any,
  base64Image: string
): Promise<string[]> => {
  console.log('[processImageForIngredients] Starting image analysis...');

  try {
    const response = await fetch('/api/detectIngredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image }),
    });

    console.log('[processImageForIngredients] Response status:', response.status);

    const json = await response.json();
    console.log('[processImageForIngredients] Response JSON:', json);

    if (!response.ok) {
      throw new Error(json.error || 'Image processing failed');
    }

    const { ingredients } = json;
    console.log('[processImageForIngredients] Extracted ingredients:', ingredients);

    return ingredients;
  } catch (err) {
    console.error('[processImageForIngredients] Error:', err);
    throw err;
  }
};
