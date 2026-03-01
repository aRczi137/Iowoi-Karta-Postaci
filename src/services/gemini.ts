import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Character } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiModel = "gemini-3-flash-preview";
export const imageModel = "gemini-3.1-flash-image-preview";

export async function generateCharacterAvatar(
  description: string,
  referenceImageBase64?: string,
  race?: string,
  profession?: string,
  age?: string,
  weight?: string,
  height?: string,
  additionalImages?: string[],
  personality?: string,
  name?: string,
  gender?: string,
) {
  // Use Gemini text to convert Polish description to an English image generation prompt
  let imagePrompt: string;
  try {
    const contextParts = [
      name && `Name: ${name}`,
      gender && `Gender: ${gender}`,
      race && `Race/Type: ${race}`,
      profession && `Rank/Profession: ${profession}`,
      age && `Age: ${age}`,
      weight && `Weight: ${weight}kg`,
      height && `Height: ${height}cm`,
    ].filter(Boolean).join('\n');

    const hasRefImages = referenceImageBase64 || (additionalImages && additionalImages.length > 0);

    const systemText = `You are an expert Stable Diffusion prompt engineer specializing in the manga series BLEACH by Tite Kubo.

Task: Convert the Polish character description below into a detailed English image generation prompt.
${hasRefImages ? '\nIMPORTANT: Reference images are attached. Study the character\'s exact visual traits (hair, eyes, face shape, clothing, colors) from them and prioritize these in the prompt.' : ''}

GLOBAL STYLE REQUIREMENTS:
- Art style: Tite Kubo manga style, Bleach anime style
- Linework: bold black ink outlines, clean precise lines, strong neck/collarbone shadows
- Shading: high contrast cel shading with selective color accents
- Character design: angular facial features, sharp jawline, clean symmetric anime eyes (no artifacts), dynamic manga hair
- Composition: VARY the framing — choose whichever fits the character's personality and story:
  * Full-body dynamic action pose with zanpakuto/weapon drawn (for fighters, shinigami, hollow)
  * Full-body standing pose in their environment (training ground, Rukongai street, Hueco Mundo desert)
  * Half-body or waist-up with expressive gesture or dramatic lighting
  * Scene/moment: character in a meaningful setting from their backstory (academy courtyard, battle aftermath, quiet meditation, sparring)
  * Avoid generic "neutral bust portrait" — make it feel alive and cinematic

RACE/PROFESSION-SPECIFIC APPEARANCE GUIDE (choose based on Character info):
- Shinigami (low rank / unseated): black shikahusho kimono with white obi sash, katana zanpakuto at hip, Soul Society background (stone corridors, cherry blossoms)
- Shinigami (captain): black shikahusho + white captain's haori cloak with division symbol, commanding pose
- Shinigami (lieutenant): black shikahusho + lieutenant badge on arm
- Academy Student (Shinigami Academy): male → white uniform with blue trim and coloring; female → white uniform with red/pink trim — NOT a black robe
- Hollow: bone white mask (full or partial), dark corrupted energy, monstrous features, Hueco Mundo white sand desert background
- Arrancar: white military uniform (Espada-style), hollow mask fragment on body, cold elegant appearance, Las Noches palace background
- Quincy: white European-style combat uniform with cross motifs, reishi bow weapon, blue spiritual energy particles
- Fullbringer: modern casual or stylish streetwear, no spiritual uniform, contemporary Japanese city background
- Bount: gothic elegant Victorian or European clothing, doll companion nearby, dark atmospheric setting
- Rukongai Soul / Dusza: simple peasant robes, worn fabric, Rukongai district wooden slums background
- Kami / Divine being: ethereal robes, divine glow, celestial background
- Hollow/Human hybrid (Visored): black shikahusho + hollow mask half-materialized on face

RULES:
- Base clothing and background on the character's race and rank — NEVER use black shinigami robes for Academy Students or non-shinigami characters
- Output ONLY a comma-separated English prompt, no labels or commentary, under 150 words
- CRITICAL — order elements like this (most important first for SD1.5):
  1. Gender + age tag (e.g. "1boy, young male teenager" or "1girl, young female")
  2. Hair details (color, style, length)
  3. Eye color and expression
  4. Skin, scars, distinctive marks
  5. Clothing (race-specific — be very literal, e.g. "white kimono with blue trim" NOT just "uniform")
  6. Weapon/accessories
  7. Pose and scene
  8. Background atmosphere

Character info:
${contextParts}

Appearance (Polish): ${description}

Personality/Character traits (Polish — use to decide pose, expression, energy):
${personality || '(not provided)'}`;

    // Build multimodal parts: text + optional reference images
    const imageParts: any[] = [];
    if (referenceImageBase64) {
      const [header, rawData] = referenceImageBase64.includes(',')
        ? referenceImageBase64.split(',')
        : ['data:image/jpeg;base64', referenceImageBase64];
      const mimeType = header.replace('data:', '').replace(';base64', '') || 'image/jpeg';
      imageParts.push({ inlineData: { mimeType, data: rawData } });
    }
    if (additionalImages && additionalImages.length > 0) {
      for (const img of additionalImages.slice(0, 3)) {
        const base64data = img.includes(',') ? img.split(',')[1] : img;
        imageParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64data } });
      }
    }

    // Always use array format — more reliable with @google/genai SDK
    const parts: any[] = [{ text: systemText }, ...imageParts];
    const contents = [{ role: 'user', parts }];

    const geminiResponse = await ai.models.generateContent({
      model: geminiModel,
      contents: contents as any,
    });

    // response.text may be undefined with array-format contents — extract explicitly
    const extracted = (
      geminiResponse.text ||
      (geminiResponse as any).candidates?.[0]?.content?.parts?.[0]?.text ||
      ''
    ).trim();
    console.log('[Avatar] Gemini extracted prompt:', extracted || '(empty)');
    // animagine-xl-3.1 prefix (SDXL anime model, danbooru-style tags)
    imagePrompt = [
      `masterpiece, best quality, very aesthetic, absurdres, highres`,
      extracted,
    ].join(', ');
  } catch (err: any) {
    // Log the actual Gemini error so we can debug
    console.error('[Avatar] Gemini prompt generation failed:', err?.message || err);
    // Fallback if Gemini fails
    const parts = [age && `${age} years old`, race, profession].filter(Boolean).join(', ');
    imagePrompt = `masterpiece, best quality, Bleach anime art style, Tite Kubo character design, ${parts ? parts + ', ' : ''}${description}, black shinigami shikahusho robe, bold black ink outlines, high contrast manga inking, angular facial features, expressive eyes, dramatic lighting, Soul Society atmosphere`;
  }

  // dreamlike-anime-1.0 is trained on 768px — use 768x768 for best results
  const res = await fetch('/api/generate-avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: imagePrompt, width: 768, height: 768 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Server error: ${res.status}`);
  }
  const data = await res.json();
  return data.image as string;
}

export async function generateSimplifiedNPC(
  gmNote: string,
  playerName: string = "Gracz",
  existingNpc?: Partial<Character> | null
) {
  // Step 1: Extract basic details from GM Note using Gemini
  const extractPrompt = `You are a Bleach RPG Game Master assistant. Read the GM's note about an NPC and extract their info into a structured JSON format.

CRITICAL CONTEXT:
- The player character's name is "${playerName}". DO NOT create an NPC profile for "${playerName}". Focus ONLY on NEW or OTHER characters mentioned in the text.
${existingNpc ? `- We are UPDATING an existing NPC named "${existingNpc.name}". Keep their core identity but expand their personality/history based on what's new in the text.` : ''}

RULES:
- Extract Name: ${existingNpc ? `Use exactly "${existingNpc.name}"` : 'Invent one fitting Bleach if missing (e.g. Japanese name or Arrancar Spanish-sounding name).'}.
- Extract Age/Race/Profession into a brief 1-2 word string.
- Extract/Infer Appearance: Write a 1-sentence physical description (hair, eyes, clothing, build) suitable for image generation context.
- Extract Personality/Relationship: Write a 2-3 sentence summary of how they act, their vibe, and their relationship/history with "${playerName}" based on the note.
- ALWAYS return ONLY valid JSON matching this structure:
{
  "name": "string",
  "race_profession": "string",
  "appearance": "string",
  "personality": "string"
}

GM Note: "${gmNote}"`;

  const extractResponse = await ai.models.generateContent({
    model: geminiModel,
    contents: extractPrompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  const rawJson = extractResponse.text?.trim() || "{}";
  let npcData: any = {};

  try {
    npcData = JSON.parse(rawJson);
  } catch (e) {
    console.error("Failed to parse NPC JSON", e);
    npcData = {
      name: "Nieznajomy",
      race_profession: "NPC",
      appearance: "Zakapturzona postać, twarz ukryta w cieniu.",
      personality: gmNote.slice(0, 100) + "..."
    };
  }

  // Step 2: Use the existing avatar generator to create their portrait
  // We ONLY generate a new avatar if it's a completely new NPC. 
  // If we are updating an existing one, we skip image generation to save quota and keep their face consistent.
  let avatarUrl = existingNpc?.avatar_url || "";

  if (!existingNpc) {
    avatarUrl = await generateCharacterAvatar(
      npcData.appearance || "Tajemnicza postać z zaświatów",
      undefined, // no reference image
      npcData.race_profession,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      npcData.personality,
      npcData.name
    );
  }

  return {
    ...npcData,
    avatarUrl
  };
}

export async function generateMangaPanel(postContent: string, characterDescriptions: string[]) {
  const prompt = `manga panel, Bleach manga style, Tite Kubo art style, black and white, ${postContent}, characters: ${characterDescriptions.join(", ")}, dynamic angles, heavy ink work, speed lines, dramatic shading, professional manga page`;

  const res = await fetch('/api/generate-avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, width: 768, height: 512 }),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return data.image as string;
}

export async function getPostAssistance(gmPost: string, characterInfo: string, userIntent: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `You are an assistant for a Bleach forum RPG player. 
    Game Master's Post: "${gmPost}"
    Player Character Info: "${characterInfo}"
    Player's Intent: "${userIntent}"
    
    Write a high-quality, atmospheric RPG post in Polish. 
    Focus on the character's internal thoughts, their unique abilities (Zanpakuto, Kido, etc.), and the dramatic flair typical of Bleach. 
    Maintain the tone of the original manga/anime.`,
  });

  return response.text;
}
