import OpenAI from "openai";

// Lazy singleton — instantiated only at call time, never at build time
let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export interface PropertyRecommendationInput {
  city?: string;
  budget?: number;
  bhk?: number;
  propertyType?: string;
  listingType?: string;
  preferences?: string[];
}

export async function getAIRecommendations(
  input: PropertyRecommendationInput,
  availableProperties: any[]
): Promise<{ propertyIds: string[]; reasoning: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return { propertyIds: [], reasoning: "AI recommendations not configured." };
  }

  const prompt = `You are a real estate advisor. A buyer is looking for properties with these preferences:
- City: ${input.city ?? "any"}
- Budget: ₹${input.budget ? (input.budget / 100000).toFixed(1) + " Lakhs" : "flexible"}
- BHK: ${input.bhk ?? "any"}
- Type: ${input.propertyType ?? "any"}
- For: ${input.listingType ?? "any"}
- Additional preferences: ${input.preferences?.join(", ") ?? "none"}

Available properties (JSON):
${JSON.stringify(
  availableProperties.slice(0, 20).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    city: p.city,
    bhk: p.bhk,
    area: p.area,
    type: p.propertyType,
    listing: p.listingType,
    amenities: p.amenities,
  })),
  null,
  2
)}

Return a JSON object with:
- "propertyIds": array of up to 5 property IDs that best match, ordered by relevance
- "reasoning": brief explanation of why these were selected

Respond with only valid JSON.`;

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 500,
  });

  const result = JSON.parse(response.choices[0].message.content ?? "{}");
  return {
    propertyIds: result.propertyIds ?? [],
    reasoning: result.reasoning ?? "",
  };
}

export async function generatePropertyDescription(data: {
  title: string;
  bhk: number;
  area: number;
  city: string;
  amenities: string[];
  price: number;
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return "";

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Write a compelling 3-4 sentence real estate listing description for:
Title: ${data.title}
BHK: ${data.bhk}
Area: ${data.area} sqft
City: ${data.city}
Price: ₹${(data.price / 100000).toFixed(1)} Lakhs
Amenities: ${data.amenities.join(", ")}

Keep it professional, highlight key features, and end with a call to action.`,
      },
    ],
    max_tokens: 200,
  });

  return response.choices[0].message.content ?? "";
}

export async function generateProductDescription(data: {
  title: string;
  category: string;
  condition: string;
  brand?: string | null;
  price: number;
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return "";

  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Write a compelling 3-4 sentence product listing description for an e-commerce marketplace.
Title: ${data.title}
Category: ${data.category.replace(/_/g, " ")}
Condition: ${data.condition}
Brand: ${data.brand ?? "N/A"}
Price: ₹${data.price.toLocaleString("en-IN")}

Keep it engaging, highlight key benefits, and end with a call to action for buyers to contact the seller.`,
      },
    ],
    max_tokens: 200,
  });

  return response.choices[0].message.content ?? "";
}
