'use server';
/**
 * @fileOverview An AI tool that suggests optimal selling prices for agricultural products.
 *
 * - suggestMarketPriceForFarmer - A function that handles the market price suggestion process.
 * - SuggestMarketPriceForFarmerInput - The input type for the suggestMarketPriceForFarmer function.
 * - SuggestMarketPriceForFarmerOutput - The return type for the suggestMarketPriceForFarmer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMarketPriceForFarmerInputSchema = z.object({
  productName: z.string().describe('The specific agricultural product (e.g., "Dinorado Rice", "Jasmine Rice").'),
  quantityKg: z.number().positive().describe('The quantity of the product available for sale in kilograms.'),
  location: z.string().describe('The farmer\'s location, which can influence local market prices.'),
  harvestDate: z.string().datetime().describe('The date when the product was harvested, in YYYY-MM-DD format.'),
  historicalAveragePricePerKg: z.number().optional().describe('Optional: The farmer\'s historical average selling price per kilogram for this product.'),
  currentMarketDemand: z.string().optional().describe('Optional: A brief description of the current market demand for this product (e.g., "high", "moderate", "low").'),
});
export type SuggestMarketPriceForFarmerInput = z.infer<typeof SuggestMarketPriceForFarmerInputSchema>;

const SuggestMarketPriceForFarmerOutputSchema = z.object({
  suggestedPricePerKg: z.number().positive().describe('The AI-suggested optimal selling price per kilogram for the product.'),
  reasoning: z.string().describe('A detailed explanation of why this price was suggested, considering market data, demand, and other provided factors.'),
});
export type SuggestMarketPriceForFarmerOutput = z.infer<typeof SuggestMarketPriceForFarmerOutputSchema>;

export async function suggestMarketPriceForFarmer(input: SuggestMarketPriceForFarmerInput): Promise<SuggestMarketPriceForFarmerOutput> {
  return suggestMarketPriceForFarmerFlow(input);
}

const suggestMarketPriceForFarmerPrompt = ai.definePrompt({
  name: 'suggestMarketPriceForFarmerPrompt',
  input: {schema: SuggestMarketPriceForFarmerInputSchema},
  output: {schema: SuggestMarketPriceForFarmerOutputSchema},
  prompt: `You are an expert agricultural market analyst specializing in rice pricing. Your task is to suggest an optimal selling price per kilogram for a farmer's product and provide detailed reasoning for your recommendation.

Consider the following information:
Product Name: {{{productName}}}
Quantity Available (kg): {{{quantityKg}}}
Farmer's Location: {{{location}}}
Harvest Date: {{{harvestDate}}}
{{#if historicalAveragePricePerKg}}Historical Average Price per Kg: {{{historicalAveragePricePerKg}}} PHP
{{/if}}{{#if currentMarketDemand}}Current Market Demand: {{{currentMarketDemand}}}
{{/if}}

Based on these details, historical market trends, and typical supply chain dynamics, provide a competitive and profitable selling price per kilogram for the farmer. Also, explain the factors that influenced your suggested price. Assume the current Philippine Peso (PHP) as the currency.

Your output MUST be a JSON object with two fields: 'suggestedPricePerKg' (a positive number) and 'reasoning' (a string).`,
});

const suggestMarketPriceForFarmerFlow = ai.defineFlow(
  {
    name: 'suggestMarketPriceForFarmerFlow',
    inputSchema: SuggestMarketPriceForFarmerInputSchema,
    outputSchema: SuggestMarketPriceForFarmerOutputSchema,
  },
  async (input) => {
    const {output} = await suggestMarketPriceForFarmerPrompt(input);
    return output!;
  }
);
