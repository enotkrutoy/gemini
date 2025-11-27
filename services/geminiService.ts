
import { GoogleGenAI } from "@google/genai";
import { HairstyleConfig } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

// Mappings for translation to ensure model quality
const GENDER_MAP: Record<string, string> = {
  'Женский': 'Female',
  'Мужской': 'Male',
  'Не указано': 'Person'
};

const STYLE_MAP: Record<string, string> = {
  // --- Existing Styles ---
  "Длинные волнистые": "Long Wavy Hair, soft natural flow, touching shoulders",
  "Боб-каре": "Classic Chin-Length Bob, sleek and professional",
  "Пикси": "Short Pixie Cut, textured, neat edges",
  "Базз кат (Стрижка под машинку)": "Buzz Cut, military style, very short stubble",
  "Прямые с чёлкой": "Long Straight Hair with soft bangs",
  "Кудрявое афро": "Textured 4C Afro with defined coils, neat and controlled volume",
  "Небрежный пучок": "Low messy bun, casual look",
  "Андеркат": "Undercut with short textured top, clean sides",
  "Косы": "Simple Braided Hairstyle, neat",
  "Афро": "Round Afro, medium volume, natural texture",
  "Маллет": "Modern Mullet, short sides, longer back",
  "Шегги": "Shag Cut, medium length, layered",
  "Волф кат (Wolf Cut)": "Trendy Wolf Cut, shaggy heavily layered mullet hybrid, messy texture",
  "Шторки (Curtain Bangs)": "Medium length hair with prominent Curtain Bangs framing the face",
  "Кроп (Цезарь)": "French Crop / Caesar Cut, short textured top with straight fringe and faded sides",
  "Дреды": "Medium length Dreadlocks, well-maintained and detailed texture",
  "Зачёс назад": "Slicked Back Hair, mafia style, wet look, clean forehead",
  "Ирокез": "Punk Mohawk with faded/shaved sides, edgy look",
  "Налысо": "Completely Bald Head, smooth skin texture, realistic lighting on scalp",
  "Высокий хвост": "High Ponytail, sleek pulled back hair, sharp look",
  "Химическая завивка": "Perm / Curly Perm, tight ringlets, high volume",
  "Боковой пробор": "Classic Side Part, gentleman/professional cut, neat",

  // --- New Diverse Styles ---
  "Каскад": "Long Layered Haircut (Cascade), face-framing layers, voluminous and dynamic",
  "Удлинённое каре (Лоб)": "Long Bob (Lob), shoulder-grazing length, blunt cut, modern and sleek",
  "Пляжные локоны": "Messy Beach Waves, textured salt-spray look, medium length, effortless vibe",
  "Афрокосички (Box Braids)": "Long Box Braids, protective style, neat parting, detailed braiding texture",
  "Помпадур": "Classic Pompadour, high volume swept-back top, short tapered sides, rockabilly style",
  "Фейд (Fade)": "Skin Fade Haircut, gradient from bald to short hair on top, sharp clean hairline",
  "Гарсон": "Short French Garçon cut, boyish but feminine, textured top, short nape",
  "Два пучка (Space Buns)": "Double Space Buns (high buns), playful style, messy texture",
  "Голливудская волна": "Glamorous Old Hollywood Waves, glossy, deep side part, vintage elegance",
  "Андеркат с узором": "Undercut with shaved geometric hair tattoo design on sides",
  "Стрижка 'Горшок'": "Modern Bowl Cut, high fashion, heavy straight fringe, undercut sides",
  "Топ Кнот (Man Bun)": "Man Bun / Top Knot with shaved sides, hipster style",
  "Коса 'Рыбий хвост'": "Bohemian Fishtail Braid, intricate weaving, slightly messy texture",
  "Гладкий пучок": "Tight Sleek Low Bun, middle part, 'clean girl' aesthetic, glossy finish",
  "Дреды (Короткие)": "Short Dreadlocks, styled upwards or messy, urban look",
  "Косы (Cornrows)": "Tight Cornrow Braids close to the scalp, intricate patterns",
  "Асимметрия": "Asymmetrical Bob Haircut, one side significantly longer than the other, modern and edgy",
  "Кудрявое каре": "Curly Bob, chin length, tight defined ringlets, high volume",
  "Коса 'Колосок'": "French Braid, single neat braid running down the back, classic style"
};

const VOLUME_MAP: Record<string, string> = {
  'natural': "Natural/Low hair volume, lying flat against head, realistic gravity, no added root lift",
  'medium': "Medium hair volume, healthy density, standard daily look, slight bounce",
  'high': "High volume, voluminous, airy, lifted roots, thick glam appearance, fluffy"
};

// Colors updated for MAXIMUM REALISM. 
const COLOR_MAP: Record<string, string> = {
  "Блонд": "Natural Dirty Blonde with subtle lowlights",
  "Каштановый": "Dark Chocolate Brown",
  "Чёрный": "Natural Soft Black (not jet black)",
  "Рыжий": "Dark Auburn / Natural Copper (realistic red hair)", 
  "Пепельный": "Ash Grey / Silver with natural aging look",
  "Розовый": "Muted Pastel Pink (hair dye style), not neon",
  "Синий": "Dark Midnight Blue (hair dye style)",
  "Зелёный": "Dark Forest Green (hair dye style)",
  "Платиновый": "Platinum Blonde with realistic sheen"
};

// Retry helper function for robustness
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isNetworkError = error.message?.includes('xhr') || error.message?.includes('fetch') || error.status === 500;
    if (retries > 0 && isNetworkError) {
      console.warn(`Retrying operation... Attempts left: ${retries}. Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Image processing to reduce payload size and fix format issues
async function processImageForApi(base64Str: string, maxWidth = 1024, quality = 0.95): Promise<{ data: string, mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      // Ensure dimensions are even (multiple of 2)
      width = width % 2 === 0 ? width : width - 1;
      height = height % 2 === 0 ? height : height - 1;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const cleanData = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
        resolve({ data: cleanData, mimeType: 'image/png' }); 
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // High quality JPEG for input
      const newBase64 = canvas.toDataURL('image/jpeg', quality);
      const data = newBase64.split(',')[1];
      resolve({ data, mimeType: 'image/jpeg' });
    };

    img.onerror = (e) => {
      console.warn("Image processing failed, using original.");
      const cleanData = base64Str.includes(',') ? base64Str.split(',')[1] : base64Str;
      resolve({ data: cleanData, mimeType: 'image/png' });
    };
  });
}

/**
 * Pre-processes the image to enhance quality, remove noise, and fix artifacts.
 * Uses a strict restoration prompt.
 */
export const enhanceImage = async (originalImageBase64: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { data: cleanBase64, mimeType } = await processImageForApi(originalImageBase64, 1536, 0.98); // Higher quality for enhancement

  const prompt = `
    Проанализируй входное изображение и сначала создай краткое, точное и нейтральное описание изображения, 
    основанное только на визуальных фактах.

    На основе созданного тобой описания выполни высокоточную реставрацию изображения.

    Требования к улучшению:
    • Убрать пикселизацию, шумы, блоки сжатия.
    • Повысить чёткость и естественность.
    • ВАЖНО: CRITICAL IDENTITY LOCK. Сохранить текстуру кожи, форму глаз, губ, носа и другие особенности без изменений. Не менять лицо.
    • ВАЖНО: CRITICAL HEADWEAR PRESERVATION. Сохранять любые головные уборы (шапки, кепки, платки), очки и аксессуары в неизменном виде. Это жесткое требование.
    • Не менять освещение, цветовую температуру и ракурс.
    • Улучшать только то, что логично восстанавливается из оригинальных пикселей.

    Результат должен выглядеть как тот же самый снимок, но технически улучшенный: 
    чёткий, чистый, без искажений.
  `;

  return retryOperation(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: cleanBase64 } },
          { text: prompt }
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const responseMime = part.inlineData.mimeType || 'image/png';
        return `data:${responseMime};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Не удалось улучшить изображение.");
  });
};

export const generateHairstyle = async (
  originalImageBase64: string,
  config: HairstyleConfig
): Promise<{ generated: string; original: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Pre-process image 
  const { data: cleanBase64, mimeType } = await processImageForApi(originalImageBase64, 1536, 0.98);
  const processedOriginal = `data:${mimeType};base64,${cleanBase64}`;

  const engGender = GENDER_MAP[config.gender] || config.gender;
  const engStyle = STYLE_MAP[config.style] || config.style;
  const engColor = COLOR_MAP[config.color] || config.color;
  const engVolume = VOLUME_MAP[config.volume] || VOLUME_MAP['medium'];

  // VFX / GROOMING PROMPT - DIGITAL GROOMING SIMULATION
  const prompt = `
    ROLE: Senior VFX Grooming Artist & Compositor.
    TASK: Photorealistic Digital Hair Replacement on a ${config.resolution} plate.
    
    INPUT ANALYSIS:
    - Subject: ${engGender}
    - Lighting: Match input photo EXPOSURE, DIRECTION, HARDNESS, and COLOR TEMPERATURE exactly.
    - Grain/ISO: Match input photo sensor noise.
    
    OBJECTIVE:
    Apply "${engStyle}" hair in "${engColor}" color.
    
    HAIR VOLUME PARAMETER:
    ${engVolume}
    
    ${config.prompt ? `USER OVERRIDES (HIGHEST PRIORITY): ${config.prompt}` : ''}
    
    EXECUTION RULES (PHYSICS & REALISM):
    1. **Frequency Separation**: Preserve the high-frequency skin texture. Do not blur the skin where hair meets the face.
    2. **Hairline Logic**: 
       - Generate "vellus hair" (baby hairs) at the hairline transition. 
       - NEVER create a hard, straight line. It must be irregular and organic.
    3. **Volume & Weight**: Hair has mass. It must sit on the head, not float. It casts shadows on the forehead and ears. Respect the '${config.volume}' volume setting.
    4. **Subsurface Scattering**: Hair strands at the edges must be translucent.
    
    COMPOSITING RULES (INPAINTING):
    - **Background Protection**: The background pixels (walls, text, patterns) are LOCKED.
    - **Face Protection**: CRITICAL IDENTITY LOCK. The face landmarks (eyes, nose, mouth, chin, jawline, skin texture, features) are FROZEN. Do not perform "face swapping". Only the hair surrounding the face should change. Lighting on the face must match exactly.
    - **Headwear & Accessories Preservation**: CRITICAL. If the input image contains headwear (hat, beanie, cap, helmet, hijab, etc.) or eyewear, YOU MUST PRESERVE IT. Treat headwear as a solid, immutable object. The generated hairstyle must flow naturally from under the headwear (e.g., from sides and back) or around it. DO NOT remove the hat to show the top of the head unless explicitly requested by the user.
    
    OUTPUT:
    A composite image indistinguishable from a real photograph. No "AI gloss".
  `;

  return retryOperation(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: cleanBase64 } },
          { text: prompt }
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const responseMime = part.inlineData.mimeType || 'image/png';
        const generated = `data:${responseMime};base64,${part.inlineData.data}`;
        return { generated, original: processedOriginal };
      }
    }
    throw new Error("Не удалось сгенерировать изображение. Пустой ответ от ИИ.");
  });
};

export const generateCharacterImage = async (
  description: string,
  style: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Character Generation Task.
    Character Description: ${description}.
    Artistic Style: ${style}.
    
    Output a high-quality image of the character on a neutral or simple background to establish identity.
  `;

  return retryOperation(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
         const responseMime = part.inlineData.mimeType || 'image/png';
        return `data:${responseMime};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to generate character image.");
  });
};

export const generateSceneImage = async (
  characterBaseImage: string,
  characterDescription: string,
  scenePrompt: string,
  style: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const { data: cleanBase64, mimeType } = await processImageForApi(characterBaseImage);

  const prompt = `
    Scene Generation with Consistent Character.
    
    Character Description: ${characterDescription}.
    Target Scene: ${scenePrompt}.
    Artistic Style: ${style}.

    INSTRUCTIONS:
    1. Use the provided image as the REFERENCE for the character's appearance.
    2. Place this exact character into the scene described.
    3. Ensure the character looks consistent with the reference image.
    4. Apply the requested artistic style.
  `;

  return retryOperation(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: cleanBase64 } },
          { text: prompt }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const responseMime = part.inlineData.mimeType || 'image/png';
        return `data:${responseMime};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to generate scene image.");
  });
};
