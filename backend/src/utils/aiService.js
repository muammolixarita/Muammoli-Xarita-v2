import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CATEGORIES = {
  garbage:     'Axlat / Chiqindi',
  road:        "Yo'l / Infratuzilma",
  electricity: 'Elektr / Chiroq',
  water:       'Suv / Kanalizatsiya',
  parks:       "Park / Ko'kalamzor",
  safety:      'Xavfsizlik',
  other:       'Boshqa',
};

export const categorizeAndAnalyzeProblem = async (title, description, imageUrl = null) => {
  try {
    const systemPrompt = `Sen O'zbekistondagi shahar muammolarini tahlil qiluvchi AI yordamchisisan.
Fuqarolar bildirgan muammolarni toifalab, muhimligini aniqla.

Mavjud toifalar: ${Object.entries(CATEGORIES).map(([k, v]) => `"${k}" (${v})`).join(', ')}

FAQAT quyidagi JSON formatida javob ber, boshqa hech narsa yozma:
{
  "category": "<toifa kaliti>",
  "priority": "<low|medium|high|critical>",
  "confidence": <0.0-1.0>,
  "summary": "<1-2 jumlali xulosa>",
  "tags": ["teg1", "teg2", "teg3"],
  "estimatedResolutionDays": <kun soni>,
  "reasoning": "<qisqa izoh>"
}`;

    const response = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      max_tokens:  500,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role:    'user',
          content: `Muammo sarlavhasi: ${title}\n\nTavsif: ${description}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('AI javob bermadi');

    // JSON ni ajratib olish
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Noto'g'ri JSON format");

    const analysis = JSON.parse(jsonMatch[0]);

    // Toifani tekshirish
    if (!CATEGORIES[analysis.category]) {
      analysis.category = 'other';
    }

    return analysis;
  } catch (error) {
    console.error('AI tahlil xatosi:', error.message);
    // Fallback — AI ishlamasa ham muammo saqlanadi
    return {
      category:               'other',
      priority:               'medium',
      confidence:             0,
      summary:                'AI tahlil mavjud emas. Muammo qo\'lda ko\'rib chiqiladi.',
      tags:                   [],
      estimatedResolutionDays: 7,
      reasoning:              'Avtomatik toifalash muvaffaqiyatsiz',
      error:                  error.message,
    };
  }
};

export const CATEGORY_LABELS = CATEGORIES;
