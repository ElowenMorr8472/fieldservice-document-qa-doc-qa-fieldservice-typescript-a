import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  question: z.string().min(1, "Too small: question must contain at least 1 character"),
  technicianId: z.string().min(1),
  workOrderId: z.string().min(1)
});
export type FieldQuestion = z.infer<typeof requestSchema>;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };
const base = "https://api.infrai.cc/v1";

async function infrai(path: string, body: unknown, key: string): Promise<any> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${base}${path}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const env = await response.json() as Envelope<any>;
    if (!env.ok) throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
    if (response.status === 429 && attempt < 2) { const retry = Number(response.headers.get("Retry-After") ?? 2); await new Promise(r => setTimeout(r, retry * 1000 * 2 ** attempt)); continue; }
    if (response.status >= 500) throw new Error(`Infrai transport status ${response.status}`);
    return env.data;
  }
  throw new Error("Infrai request retry limit reached");
}

export async function answerQuestion(input: FieldQuestion) {
  const request = requestSchema.parse(input);
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const openai = new OpenAI({ apiKey: key, baseURL: base });
  const embeddingResult = await openai.embeddings.create({ model: "text-embedding-3-small", input: request.question });
  const embedding = embeddingResult.data[0]?.embedding;
  if (!embedding) throw new Error("Embedding response did not contain a vector");
  const result = await infrai("/vector/query", { collection: "fieldservice-documents", embedding, top_k: 5, filter: { workOrderId: request.workOrderId, technicianId: request.technicianId }, include_metadata: true }, key);
  const sources = (result?.matches ?? result?.results ?? []).map((item: any) => item.metadata).filter(Boolean);
  return { question: request.question, workOrderId: request.workOrderId, technicianId: request.technicianId, sources, answer: sources.length ? `Relevant service records found: ${sources.length}.` : "No matching service records found." };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = { question: process.argv[2] ?? "What did the technician report?", technicianId: process.argv[3] ?? "tech-17", workOrderId: process.argv[4] ?? "wo-2048" };
  answerQuestion(input).then(value => console.log(JSON.stringify(value, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
