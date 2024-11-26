'use client';

import OpenAI from 'openai';

export const createOpenAIClient = (apiKey: string | undefined) => {
  if (!apiKey) return null;
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

export const processImageForIngredients = async (
  openai: OpenAI | null,
  base64Image: string
): Promise<string[]> => {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please check your API key.');
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'List all the ingredients you can see in this image. Return them as a comma-separated list. If you don\'t see any food ingredients, return an empty list.',
          },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  const content = response.choices[0].message.content || '';
  return content.split(',').map(ingredient => ingredient.trim().toLowerCase()).filter(Boolean);
};