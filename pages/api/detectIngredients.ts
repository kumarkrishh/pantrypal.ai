// pages/api/detectIngredients.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[detectIngredients] Received request');

  if (req.method !== 'POST') {
    console.warn('[detectIngredients] Invalid request method:', req.method);
    return res.status(405).end();
  }

  const { base64Image } = req.body;

  if (!base64Image || !GEMINI_API_KEY) {
    console.error('[detectIngredients] Missing base64Image or GEMINI_API_KEY');
    return res.status(400).json({ error: 'Missing image or API key' });
  }

  console.log('[detectIngredients] Making request to Gemini Vision...');

  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              text: 'List only the visible food ingredients in this image. Respond with just a comma-separated list of ingredient names.',
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
          ],
        },
      ],
    };

    console.log('[detectIngredients] Payload prepared. Sending to Gemini API...');

    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }
);



    const data = await response.json();
    console.log('[detectIngredients] Gemini API response:', JSON.stringify(data, null, 2));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const ingredients = text
      .split(/[,.\n]+/)
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);

    console.log('[detectIngredients] Parsed ingredients:', ingredients);

    return res.status(200).json({ ingredients, raw: text });
  } catch (err) {
    console.error('[detectIngredients] Gemini Vision error:', err);
    return res.status(500).json({ error: 'Failed to process image with Gemini' });
  }
}
