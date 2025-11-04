import { GoogleGenAI } from "@google/genai";
import { Property } from '../types';

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const fetchPropertiesFromGemini = async (zipCode: string): Promise<Property[]> => {
  const now = Date.now();
  const cacheKey = `gemini-cache-${zipCode}`;
  const cachedJSON = sessionStorage.getItem(cacheKey);

  // If a valid, non-expired cache entry exists, return it immediately.
  if (cachedJSON) {
    const cachedEntry = JSON.parse(cachedJSON);
    if (now - cachedEntry.timestamp < CACHE_DURATION_MS) {
      console.log(`Returning cached results for ZIP code: ${zipCode}`);
      return cachedEntry.data;
    } else {
      // Cache expired, remove it.
      sessionStorage.removeItem(cacheKey);
      console.log(`Removed expired cache for ZIP code: ${zipCode}`);
    }
  }

  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // The schema description helps structure the prompt for the model.
  const propertySchemaDescription = `
  {
    "id": "string (Unique identifier)",
    "address": "string (Street address)",
    "city": "string",
    "state": "string (State abbreviation)",
    "zipCode": "string (5-digit ZIP code)",
    "propertyType": "string (e.g., 'Residential', 'Commercial', 'Vacant Land')",
    "listingPrice": "number (Current asking price in USD)",
    "marketValue": "number (Estimated fair market value, must be higher than listing price)",
    "bedrooms": "integer (Can be 0 for commercial or land)",
    "bathrooms": "number (Can be 0 for commercial or land)",
    "livingAreaSqft": "integer (Interior square footage of the building. Should be 0 for vacant land.)",
    "lotSizeSqft": "integer (Total lot size in square feet.)",
    "imageUrl": "string (A valid URL for a property image)",
    "investmentScore": "integer (1-100, based on Graham's principles)",
    "priceHistory": [ { "date": "string (YYYY-MM-DD)", "price": "number" } ],
    "philosophy": "string (2-3 sentences on why it's a good value investment)",
    "isActive": "boolean (Must be true for all results)"
  }
  `;
  
  const prompt = `
Primary task: Use Google Search to find 10-15 undervalued real estate listings in ZIP code ${zipCode}. If you cannot find 10, return as many as possible.
Property types: Include residential, commercial, and vacant land.
CRITICAL RULE 1: All properties MUST be actively "For Sale" on public websites (Zillow, Redfin, etc.). Set "isActive" to true for all.
CRITICAL RULE 2: DATA ACCURACY IS THE #1 PRIORITY. You must extract all numerical data with 100% precision from the source listing. There is no room for error.
- LATEST PRICE ERROR EXAMPLE TO AVOID: A property listed at $360,000 must have \`listingPrice\`: 360000. It must NOT be a different number like 328160. You must verify the current price from the source.
- Price Error Example to Avoid: A listing for $11,999,000 must be \`listingPrice\`: 11999000, NOT 1100000.
- Lot Size Error Example to Avoid: A 4-acre lot must be \`lotSizeSqft\`: 174240, NOT 43560.
CRITICAL RULE 3: You MUST find the price history for each property from the source listing. This is a non-negotiable requirement. Find as many recent entries as you can, up to 5. If, after exhaustive searching of the source, no history is available, you may return an empty array for \`priceHistory\`.
Data requirements:
- For vacant land, \`livingAreaSqft\` must be 0. Always provide \`lotSizeSqft\`.
- Focus on properties where the listing price appears to be below the general market value for similar properties in the area (this is your basis for the 'margin of safety').
Output format: Your entire response must be ONLY a single JSON object: { "properties": [...] }.
The array items must strictly follow this structure: ${propertySchemaDescription}. Do not include markdown or extra text.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0.2, // Lower temperature for more deterministic output
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster response
        // System instruction to reinforce JSON output
        systemInstruction: "You are a real estate data API. Your entire response must be a single, valid JSON object. Do not wrap it in markdown or add any other text."
      },
    });

    const jsonText = response.text.trim();
    
    // Gracefully handle cases where the model returns a non-JSON string (e.g., an apology).
    if (!jsonText.startsWith('{')) {
      console.warn("Model returned a non-JSON response, treating as no results:", jsonText);
      return []; // Return an empty array to signify no properties were found.
    }

    // Clean the response in case the model wraps it in markdown code fences
    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '');
    const data = JSON.parse(cleanedJsonText);
    
    if (!data.properties || !Array.isArray(data.properties)) {
        console.error("Unexpected JSON structure:", data);
        return [];
    }

    const properties = data.properties as Property[];
    
    // Store the new result in the cache.
    const newCacheEntry = { timestamp: now, data: properties };
    sessionStorage.setItem(cacheKey, JSON.stringify(newCacheEntry));
    console.log(`Fetched and cached new results for ZIP code: ${zipCode}`);

    return properties;
  } catch (error) {
    console.error("Error fetching data from Gemini API with grounding:", error);
    if (error instanceof SyntaxError) {
        throw new Error("The model returned an invalid data format. Please try your search again.");
    }
    throw new Error("Failed to fetch real estate data. The model may be unable to find listings for this area, or there might be a network issue.");
  }
};

export { fetchPropertiesFromGemini };