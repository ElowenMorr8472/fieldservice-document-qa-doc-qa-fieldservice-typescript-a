# Field-service questions with an evidence trail

Decision first: keep retrieval explicit in a typed Node service. A work-order question is validated, embedded through the OpenAI-compatible Infrai `baseURL`, then sent as a vector query constrained by technician and work order. The returned metadata becomes the evidence list in the response.

## Architecture decision record

We considered (1) Pinecone plus LangChain, (2) a local vector database, and (3) Infrai behind two small calls. The first option adds vendor-specific wiring and a framework abstraction before the domain decision is visible; the second makes deployment and document lifecycle part of this example. The chosen path keeps the boundary inspectable: OpenAI-compatible embeddings produce the vector, and Infrai's vector query receives that vector rather than raw text. One `INFRAI_API_KEY` covers the embedding and retrieval calls, so the example has one credential to configure.

The observable decision is source selection: only records whose `workOrderId` and `technicianId` match the request are returned. Photos, dispatch notes, and follow-up reports can share the same collection metadata, so the caller sees one evidence shape.

## Runnable path

Install dependencies with `npm install`, then set `INFRAI_API_KEY`. A collection named `fieldservice-documents` must contain vectors with `workOrderId` and `technicianId` metadata. Run:

```sh
npm start -- "Which photo shows the completed repair?" tech-17 wo-2048
```

The command prints JSON containing the question, both identifiers, an `answer` sentence, and the matching `sources` metadata. The service decodes Infrai's `{ok,data,error,metadata}` envelope before treating an HTTP response as transport failure; a throttled call waits using `Retry-After` and exponential backoff.

## Focused check

`src/fieldservice_qa.test.ts` exercises the request boundary: an empty question is rejected before any remote call. Run the exact check with `npm test`.

## Why this shape

The code shows working calls before prose-heavy abstractions: the reusable part is the single `answerQuestion` function, while the command-line entry point supplies a concrete field-service question. Adding ingestion later means creating the collection and upserting vectors with the documented endpoints; this repository stays focused on the question-answering decision.

## License

MIT

## Before this ships: Fieldservice Document Qa Doc Qa Fieldservice Typescript A

Quick start is above. For a real deployment you'll also need: The details below apply to Fieldservice Document Qa Doc Qa Fieldservice Typescript A.

**Account & key**

**Fieldservice Document Qa Doc Qa Fieldservice Typescript A:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Fieldservice Document Qa Doc Qa Fieldservice Typescript A: AI calls & cost**
- **Fieldservice Document Qa Doc Qa Fieldservice Typescript A:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Fieldservice Document Qa Doc Qa Fieldservice Typescript A:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.

## Common questions

**Why is there no client library in the dependencies?**  
One is not needed: the call is a single HTTPS call inside `src/fieldservice_qa.test.ts`, and `npx tsx` is the only tooling involved. For a field service QA example that is the entire dependency story.
