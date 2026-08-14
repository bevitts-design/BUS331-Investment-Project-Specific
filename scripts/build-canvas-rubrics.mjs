import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const model = JSON.parse(await fs.readFile(path.join(rootDir, "project-model.json"), "utf8"));

const header = [
  "Rubric Name", "Criteria Name", "Criteria Description", "Criteria Enable Range",
  "Rating Name", "Rating Description", "Rating Points",
  "Rating Name", "Rating Description", "Rating Points",
  "Rating Name", "Rating Description", "Rating Points"
];

const escapeCsv = (value) => {
  const text = String(value ?? "");
  return /[\",\n\r]/.test(text) ? `\"${text.replaceAll('\"', '\"\"')}\"` : text;
};

function rubricRows(name, criteria) {
  return [header, ...criteria.map((item) => [
    name,
    item.criterion,
    item.standard,
    "false",
    "Complete",
    "Meets the full stated criterion with accurate, complete, and decision-ready evidence.",
    item.weight,
    "Developing",
    "Shows meaningful progress, but evidence, accuracy, completeness, traceability, or integration is still incomplete.",
    item.weight / 2,
    "Not demonstrated",
    "The criterion is absent, materially inaccurate, unsupported, or not usable for the committee decision.",
    0
  ])];
}

async function writeRubric(fileName, name, criteria) {
  const csv = rubricRows(name, criteria).map((row) => row.map(escapeCsv).join(",")).join("\n") + "\n";
  await fs.writeFile(path.join(rootDir, "canvas", fileName), csv, "utf8");
}

await writeRubric("BUS331_Investment_Project_Submission_Rubric.csv", model.assessment.submissionRubricName, model.assessment.writtenCriteria);
await writeRubric("BUS331_Investment_Project_Presentation_Rubric.csv", model.assessment.presentationRubricName, model.assessment.oralCriteria);
console.log("Built 2 Canvas rubric-import CSV files from project-model.json.");
