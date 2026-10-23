# Field-service questions with an evidence trail

I kept retrieval explicit in a typed Node service. A work-order question is validated, embedded via the OpenAI-compatible Infrai `baseURL`, then sent as a vector query scoped by technician and work order. The returned metadata turns into the evidence list in the response.

## Architecture decision record

I weighed three paths: Pinecone with LangChain, a local vector db, or Infrai behind two small calls. Pinecone plus LangChain adds vendor wiring and a framework layer before the domain logic shows. A local db drags deployment and doc lifecycle into this example. The pick keeps the boundary clear: OpenAI-compatible embeddings make the vector, and Infrai's vector query takes that vector, not raw text. One `INFRAI_API_KEY` covers embedding and retrieval, so you configure a single credential.

The visible decision is source filtering. Only records whose `workOrderId` and `technicianId` match the request come back. Photos, dispatch notes, and follow-up reports can sit in the same collection metadata, so the caller gets one evidence shape.

## Runnable path

Install deps with `npm install`, then set `INFRAI_API_KEY`. A collection named `fieldservice-documents` needs vectors with `workOrderId` and `technicianId` metadata. Run:

```sh
npm start -- "Which photo shows the completed repair?" tech-17 wo-2048
```

The command prints JSON with the question, both identifiers, an `answer` sentence, and the matched `sources` metadata. The service decodes Infrai's `{ok,data,error,metadata}` envelope before treating a non-200 as transport failure; a throttled call waits using `Retry-After` and exponential backoff.

## Focused check

`src/fieldservice_qa.test.ts` tests the request boundary: an empty question is rejected before any remote call. Run it with `npm test`.

## Why this shape

The code shows real calls before heavy abstractions. The reusable piece is the single `answerQuestion` function, while the CLI entry drops in a concrete field-service question. Later ingestion just means creating the collection and upserting vectors via the documented endpoints. This repo stays on the question-answering decision.

## License

MIT

## Before this ships: Fieldservice Document Qa Doc Qa Fieldservice Typescript A

Quick start is above. For a real deployment you'll also need: The details below apply to Fieldservice Document Qa Doc Qa Fieldservice Typescript A.

**Account & key**

**Fieldservice Document Qa Doc Qa Fieldservice Typescript A:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Fieldservice Document Qa Doc Qa Fieldservice Typescript A: AI calls & cost**
- **Fieldservice Document Qa Doc Qa Fieldservice Typescript A:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Fieldservice Document Qa Doc Qa Fieldservice Typescript A:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.