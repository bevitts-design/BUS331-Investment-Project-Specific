import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const releaseMode = process.argv.includes("--release");
const model = JSON.parse(await fs.readFile(path.join(rootDir, "project-model.json"), "utf8"));
const errors = [];
const warnings = [];

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);
const exists = async (target) => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

const phasePath = (phase) => `project/${phase.id}-${phase.title.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.html`;

if (model.phases.length !== 3) fail(`Expected exactly 3 phases; found ${model.phases.length}.`);
if (model.roles.length !== 4) fail(`Expected exactly 4 committee roles; found ${model.roles.length}.`);

const phaseIds = new Set(model.phases.map((phase) => phase.id));
const roleIds = new Set(model.roles.map((role) => role.id));
if (phaseIds.size !== model.phases.length) fail("Phase IDs must be unique.");
if (roleIds.size !== model.roles.length) fail("Role IDs must be unique.");
if (model.phases.map((phase) => phase.number).join(",") !== "1,2,3") fail("Phase numbers must be 1, 2, and 3 in order.");

for (const role of model.roles) {
  for (const phase of model.phases) {
    if (!role.phaseResponsibilities?.[phase.id]) fail(`${role.id} is missing a responsibility for ${phase.id}.`);
  }
}

const resourceIds = new Set();
for (const resource of model.resources) {
  if (resourceIds.has(resource.id)) fail(`Duplicate resource id: ${resource.id}.`);
  resourceIds.add(resource.id);
  if (resource.audience !== "student") fail(`Public manifest resource ${resource.id} must be student-facing.`);
  if (/instructor|solution|answer[ _-]?key/i.test(`${resource.label} ${resource.path}`)) {
    fail(`Private-looking resource found in public manifest: ${resource.id}.`);
  }
  if (!(await exists(path.join(rootDir, resource.path)))) fail(`Missing resource file: ${resource.path}.`);
}

for (const phase of model.phases) {
  for (const id of phase.resources) {
    if (!resourceIds.has(id)) fail(`${phase.id} references unknown resource ${id}.`);
  }
}

const generatedFiles = [
  "index.html",
  "BUS331_InvProject_Requirements_AllPhases.html",
  "project/guide.html",
  ...model.phases.map(phasePath),
  "project/assessment.html"
];

const hrefPattern = /href="([^"]+)"/g;
const oldPhasePattern = /\bPhase\s+(?:0?[4-6])\b/i;

for (const relative of generatedFiles) {
  const absolute = path.join(rootDir, relative);
  if (!(await exists(absolute))) {
    fail(`Missing generated page: ${relative}.`);
    continue;
  }
  const html = await fs.readFile(absolute, "utf8");
  if (!/<html lang="en">/i.test(html)) fail(`${relative} is missing lang="en".`);
  if ((html.match(/<h1\b/gi) || []).length !== 1) fail(`${relative} must contain exactly one h1.`);
  if (!html.includes('href="#main-content"')) fail(`${relative} is missing a skip link.`);
  if (!html.includes('id="main-content"')) fail(`${relative} is missing the main-content target.`);
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(`${relative} is missing a non-empty title.`);
  if (oldPhasePattern.test(html)) fail(`${relative} contains retired Phase 4-6 language.`);
  if (/Spring 2026/i.test(html)) fail(`${relative} contains the retired Spring 2026 term.`);

  for (const match of html.matchAll(hrefPattern)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|#)/i.test(href)) continue;
    const cleanHref = href.split("#")[0].split("?")[0];
    if (!cleanHref) continue;
    const target = path.resolve(path.dirname(absolute), cleanHref);
    if (!target.startsWith(rootDir)) {
      fail(`${relative} links outside the public repository: ${href}.`);
      continue;
    }
    if (!(await exists(target))) fail(`${relative} has a broken local link: ${href}.`);
  }
}

if (!(await exists(path.join(rootDir, "styles", "bus331-investment-project.css")))) {
  fail("Missing shared project stylesheet.");
}

const indexHtml = await fs.readFile(path.join(rootDir, "index.html"), "utf8");
for (const phase of model.phases) {
  if (!indexHtml.includes(phase.title.replaceAll("&", "&amp;")) && !indexHtml.includes(phase.title)) {
    fail(`Portal does not show phase title: ${phase.title}.`);
  }
}
for (const role of model.roles) {
  const encoded = role.title.replaceAll("&", "&amp;");
  if (!indexHtml.includes(encoded) && !indexHtml.includes(role.title)) fail(`Portal does not show role: ${role.title}.`);
}

const privateArtifact = path.join(rootDir, "files", "MACROE~2.PDF");
if (await exists(privateArtifact)) {
  const message = "Instructor-only files/MACROE~2.PDF remains in the student staging repository; release is blocked until it is preserved privately and removed or replaced with explicit approval.";
  if (releaseMode) fail(message);
  else warn(message);
}

for (const message of warnings) console.warn(`WARN: ${message}`);
for (const message of errors) console.error(`ERROR: ${message}`);

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exitCode = 1;
} else {
  console.log(`Validation passed for ${generatedFiles.length} generated pages, ${model.phases.length} phases, ${model.roles.length} roles, and ${model.resources.length} public resources.`);
  if (warnings.length) console.log(`Staging has ${warnings.length} release warning(s).`);
}
