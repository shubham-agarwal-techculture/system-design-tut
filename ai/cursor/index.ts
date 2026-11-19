import { aiConfig } from "../../ai.config.ts";

export interface CursorRunOptions {
  prompt: string;
  cwd?: string;
  /** When true, attempt a cloud agent that opens a PR */
  openPr?: boolean;
  repoUrl?: string;
}

/**
 * Thin wrapper around the Cursor SDK.
 * The SDK is optional — if @cursor/sdk is not installed or CURSOR_API_KEY
 * is missing, we return a dry-run result so pipelines still work offline.
 */
export async function runCursorAgent(opts: CursorRunOptions): Promise<{
  status: "finished" | "dry-run" | "error";
  result?: string;
  agentId?: string;
  error?: string;
}> {
  if (!process.env.CURSOR_API_KEY) {
    return {
      status: "dry-run",
      result: `[dry-run] Would run Cursor agent:\n${opts.prompt.slice(0, 500)}…`,
    };
  }

  try {
    const mod = await import("@cursor/sdk").catch(() => null);
    if (!mod?.Agent) {
      return {
        status: "dry-run",
        result:
          "[dry-run] @cursor/sdk not installed. npm install @cursor/sdk to enable.",
      };
    }

    const { Agent } = mod;
    const model = { id: aiConfig.routes.cursorAgent.model };

    if (opts.openPr && opts.repoUrl) {
      const result = await Agent.prompt(opts.prompt, {
        apiKey: process.env.CURSOR_API_KEY,
        model,
        cloud: {
          repos: [{ url: opts.repoUrl }],
          autoCreatePR: true,
        },
      });
      return { status: result.status ?? "finished", result: result.result, agentId: result.id };
    }

    const result = await Agent.prompt(opts.prompt, {
      apiKey: process.env.CURSOR_API_KEY,
      model,
      local: { cwd: opts.cwd ?? process.cwd() },
    });
    return { status: result.status ?? "finished", result: result.result, agentId: result.id };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
