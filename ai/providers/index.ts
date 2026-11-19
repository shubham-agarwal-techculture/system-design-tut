import * as ai from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { z } from "zod";
import { aiConfig, type ModelRoute, type ProviderId } from "../../ai.config.ts";

function getModel(route: ModelRoute) {
  switch (route.provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      return openai(route.model);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      return anthropic(route.model);
    }
    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });
      return google(route.model);
    }
    case "cursor":
      throw new Error("Use ai/cursor for Cursor SDK agent runs");
    default:
      throw new Error(`Unknown provider: ${(route as ModelRoute).provider}`);
  }
}

export function hasProviderKey(provider: ProviderId): boolean {
  switch (provider) {
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY);
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY);
    case "google":
      return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    case "cursor":
      return Boolean(process.env.CURSOR_API_KEY);
  }
}

export async function generatePlain(
  prompt: string,
  route: ModelRoute = aiConfig.routes.generate,
): Promise<string> {
  if (!hasProviderKey(route.provider)) {
    throw new Error(
      `Missing API key for ${route.provider}. Set the env var and retry.`,
    );
  }
  const result = await ai.generateText({
    model: getModel(route),
    prompt,
  });
  return result.text;
}

export async function generateStructured<T>(
  schema: z.ZodType<T>,
  prompt: string,
  route: ModelRoute = aiConfig.routes.generate,
): Promise<T> {
  if (!hasProviderKey(route.provider)) {
    throw new Error(
      `Missing API key for ${route.provider}. Set the env var and retry.`,
    );
  }
  const result = await ai.generateObject({
    model: getModel(route),
    schema,
    prompt,
  });
  return result.object as T;
}

export async function streamPlain(
  prompt: string,
  route: ModelRoute = aiConfig.routes.tutor,
) {
  if (!hasProviderKey(route.provider)) {
    throw new Error(
      `Missing API key for ${route.provider}. Set the env var and retry.`,
    );
  }
  return ai.streamText({
    model: getModel(route),
    prompt,
  });
}

export async function embedText(text: string): Promise<number[]> {
  const route = aiConfig.routes.embed;
  if (!hasProviderKey(route.provider)) {
    return localHashEmbed(text, 64);
  }
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await ai.embed({
    model: openai.embedding(route.model),
    value: text,
  });
  return result.embedding;
}

/** Cheap deterministic embedding used when no API key is present. */
export function localHashEmbed(text: string, dims = 64): number[] {
  const vec = new Array(dims).fill(0);
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  for (const t of tokens) {
    let h = 2166136261;
    for (let i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = Math.abs(h) % dims;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / ((Math.sqrt(na) || 1) * (Math.sqrt(nb) || 1));
}
