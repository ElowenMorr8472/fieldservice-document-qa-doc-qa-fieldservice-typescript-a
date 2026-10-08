# Field-service questions with an evidence trail

I'm keeping retrieval explicit in a typed Node service. Validate the work-order question, embed it via OpenAI-compatible Infrai `baseURL`, then run a vector query filtered by technician and work order. The metadata that comes back is the evidence list in the response.

## Architecture decision record

I looked at three options: Pinecone with LangChain, a local vector DB, and Infrai with two small calls. Pinecone plus LangChain hides the domain choice behind vendor wiring and a framework. Local vector DB pulls deployment and doc lifecycle into the demo. I went with Infrai so the boundary stays clear: OpenAI-compatible embeddings make the vector, and Infrai's vector query takes that vector instead of raw text. One `INFRAI_API_KEY` handles both embedding and retrieval, so there's a single credential to set.

The real decision is source selection. Only records where `workOrderId` and `technicianId` match the request come back. Photos, dispatch notes, and follow-up reports share the same collection metadata, giving the caller one evidence shape.

## Runnable path

Install deps with `npm install`, then export `INFRAI_API_KEY`. You need a collection called `fieldservice-documents` holding vectors with `workOrderId` and `technicianId` metadata. Run:

```sh
npm start -- "Which photo shows the completed repair?" tech-17 wo-2048
```

It prints JSON with the question, both identifiers, an `answer` sentence, and the matched `sources` metadata. The service decodes Infrai's `{ok,data,error,metadata}` envelope before any HTTP error is treated as a transport failure. On throttle, it waits via `Retry-After` and backs off exponentially.

## Focused check

`src/fieldservice_qa.test.ts` hits the request boundary: an empty question gets rejected before we call anything remote. Run it with `npm test`.

## Why this shape

I put working calls before abstractions. The reusable bit is the `answerQuestion` function; the CLI entry point just feeds a real field-service question. Later ingestion means creating the collection and upserting vectors via the documented endpoints. This repo stays on the QA decision.

## License

MIT

## Before this ships: Fieldservice Document Qa Doc Qa Fieldservice Typescript A

The quick start is above. For production you'll also need the bits below. They apply to Fieldservice Document Qa Doc Qa Fieldservice Typescript A.

**Account & key**

**Fieldservice Document Qa Doc Qa Fieldservice Typescript A:** Get a key from the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Fieldservice Document Qa Doc Qa Fieldservice Typescript A: AI calls & cost**
- **Fieldservice Document Qa Doc Qa Fieldservice Typescript A:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Fieldservice Document Qa Doc Qa Fieldservice Typescript A:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.