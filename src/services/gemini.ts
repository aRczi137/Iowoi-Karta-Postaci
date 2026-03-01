import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiModel = "gemini-2.5-flash";
export const imageModel = "gemini-2.5-flash-image";

export async function generateCharacterAvatar(
  description: string,
  referenceImageBase64?: string,
  race?: string,
  profession?: string,
  age?: string,
  weight?: string,
  height?: string,
  additionalImages?: string[]
) {
  let characterDetails = [];
  if (race) characterDetails.push(`Race: ${race}`);
  if (profession) characterDetails.push(`Profession/Rank: ${profession}`);
  if (age) characterDetails.push(`Age: ${age}`);
  if (weight) characterDetails.push(`Weight: ${weight}kg`);
  if (height) characterDetails.push(`Height: ${height}cm`);

  const detailsString = characterDetails.length > 0 ? `\nCharacter Details: ${characterDetails.join(', ')}.` : '';

  const prompt = `Anime style avatar of a character from the Bleach universe. 
  Description: ${description}.${detailsString}
  Style: Tite Kubo's art style, clean lines, high contrast. 
  Focus on a clear headshot/portrait.`;

  const parts: any[] = [{ text: prompt }];

  const allImages = [];
  if (referenceImageBase64) allImages.push(referenceImageBase64);
  if (additionalImages && additionalImages.length > 0) {
    allImages.push(...additionalImages);
  }

  for (const imgBase64 of allImages) {
    const base64Data = imgBase64.includes(',')
      ? imgBase64.split(',')[1]
      : imgBase64;

    parts.unshift({
      inlineData: {
        mimeType: "image/png",
        data: base64Data
      }
    });
  }

  const response = await ai.models.generateContent({
    model: imageModel,
    contents: { parts },
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generateMangaPanel(postContent: string, characterDescriptions: string[]) {
  const prompt = `A high-quality manga panel in the style of Bleach (Tite Kubo). 
  Scene: ${postContent}. 
  Characters involved: ${characterDescriptions.join(", ")}. 
  Style: Black and white manga panel, dynamic angles, heavy ink work, speed lines, dramatic shading. 
  Make it look like a page from the Bleach manga.`;

  const response = await ai.models.generateContent({
    model: imageModel,
    contents: { parts: [{ text: prompt }] },
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
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
