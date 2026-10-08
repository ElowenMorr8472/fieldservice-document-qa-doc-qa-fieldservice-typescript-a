import assert from "node:assert/strict";
import { answerQuestion } from "./fieldservice_qa.js";

await assert.rejects(answerQuestion({ question: "", technicianId: "tech-17", workOrderId: "wo-2048" }), /Too small/);
console.log("request boundary rejects an empty field-service question");
