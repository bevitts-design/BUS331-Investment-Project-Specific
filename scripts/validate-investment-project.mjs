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

const requiredRoleTitles = [
  "Client and Macro Strategist",
  "Fixed-Income Analyst",
  "Fund and ETF Analyst",
  "Portfolio Manager and Risk Analyst"
];
if (model.roles.map((role) => role.title).join("|") !== requiredRoleTitles.join("|")) {
  fail("The four committee roles must match the Client/Macro, Fixed-Income, Fund/ETF, and Portfolio/Risk milestone contract in order.");
}

const experience = model.phase1Experience;
if (!experience) {
  fail("Missing phase1Experience in the public model.");
} else {
  if (experience.clientSets?.length !== 5) fail("Phase 1 must present five fictional-client team sets.");
  if (experience.clientSets?.some((set) => set.clients?.length !== 3)) fail("Every fictional-client team set must contain three clients.");
  const interviewPrototype = experience.interviewPrototype;
  if (!interviewPrototype) {
    fail("Phase 1 must include the controlled Client Option 1 interview prototype.");
  } else {
    if (!experience.clientSets?.[0]?.clients?.includes(interviewPrototype.clientName)) fail("The interview prototype client must remain in Team One's existing client set.");
    if (!interviewPrototype.visibleDossier?.length || !interviewPrototype.dialoguePaths?.length) fail("The interview prototype must define an intentionally incomplete dossier and controlled dialogue paths.");
    if (interviewPrototype.openingQuestions?.length < 3) fail("The interview prototype must provide suggested opening questions.");
    const boundaryText = `${interviewPrototype.boundary} ${(interviewPrototype.recommendationResponses || []).join(" ")} ${(interviewPrototype.unknownResponses || []).join(" ")}`;
    if (!/instructor-approved paths/i.test(boundaryText) || !/cannot (?:choose|tell)/i.test(boundaryText) || !/information gap/i.test(boundaryText)) {
      fail("The interview prototype must prohibit invented facts and recommendations and label unknowns as information gaps.");
    }
    const expectedScenarioFacts = {
      annualIncome: "$30,000 in annual pension income",
      netWorth: "$1.2 million",
      goal: "capital preservation and income",
      liquidityNeed: "high liquidity needs for medical expenses",
      horizon: "2–5 years",
      expectedReturn: "4.5%",
      standardDeviation: "6.0%",
      riskAversionScore: "8.0",
      riskClassification: "risk averse"
    };
    if (JSON.stringify(interviewPrototype.scenarioFacts) !== JSON.stringify(expectedScenarioFacts)) fail("The Eleanor prototype facts must match the approved public scenario record exactly.");
    const requiredPaths = ["goals", "liquidity", "cashFlow", "horizon", "resources", "riskWillingness", "riskCapacity", "caseMetrics", "taxes", "holdings", "family", "values"];
    const dialoguePathIds = new Set(interviewPrototype.dialoguePaths?.map((item) => item.id));
    for (const id of requiredPaths) if (!dialoguePathIds.has(id)) fail(`The interview prototype is missing the ${id} dialogue path.`);
    if (!interviewPrototype.complication?.requires?.includes("goal") || !interviewPrototype.complication?.requires?.includes("liquidityNeed")) fail("The interview complication must be triggered by the approved goal-versus-liquidity tension.");
    if (!interviewPrototype.greeting || !interviewPrototype.voiceCue || !interviewPrototype.clarificationResponses?.risk) fail("The interview prototype must include a greeting, text voice cue, and clarification behavior.");
    if (!interviewPrototype.portrait?.path || !/fictional/i.test(`${interviewPrototype.portrait.alt} ${interviewPrototype.portrait.caption}`)) fail("The interview prototype portrait must be clearly labeled fictional and have alt text.");
    if (interviewPrototype.portrait?.path && !(await exists(path.join(rootDir, interviewPrototype.portrait.path)))) fail(`Missing interview prototype portrait: ${interviewPrototype.portrait.path}.`);
  }
  if (experience.decisionCycle?.map((item) => item.stage).join("|") !== "Initial judgment|AI client interview|AI challenge|Human verification|Final reasoning") {
    fail("Phase 1 decision cycle must preserve the human-first, AI-challenge, verification, and final-reasoning sequence.");
  }
  if (experience.interviewRounds?.length !== 4) fail("Phase 1 must define one interview round for each of the four roles.");
  const roundRoleIds = new Set(experience.interviewRounds?.map((round) => round.roleId));
  for (const role of model.roles) {
    if (!roundRoleIds.has(role.id)) fail(`Phase 1 is missing an interview round for ${role.title}.`);
  }
  const promptText = (experience.rolePlayPrompt || []).join(" ");
  if (!/use only the facts/i.test(promptText) || !/do not invent/i.test(promptText) || !/do not recommend/i.test(promptText)) {
    fail("The public AI role-play prompt must prohibit invented facts and AI-generated recommendations.");
  }
  if (!experience.approvedSources?.length) fail("Phase 1 must define approved verification sources.");
  if (!experience.qualityGate?.some((item) => /human-first/i.test(item))) fail("Phase 1 quality gate must require a human-first judgment.");
  if (!experience.qualityGate?.some((item) => /guardrail/i.test(item))) fail("Phase 1 quality gate must connect final reasoning to later investment guardrails.");
}

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
  "project/client-discovery-ai-protocol.html",
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

const discoveryHtml = await fs.readFile(path.join(rootDir, "project", "client-discovery-ai-protocol.html"), "utf8");
for (const requiredText of [
  "Initial judgment",
  "AI client interview",
  "AI challenge",
  "Human verification",
  "Final reasoning",
  "Analyst Decision Log"
]) {
  if (!discoveryHtml.includes(requiredText)) fail(`Client discovery protocol is missing required stage or artifact: ${requiredText}.`);
}
for (const roleTitle of requiredRoleTitles) {
  if (!discoveryHtml.includes(roleTitle)) fail(`Client discovery protocol is missing role: ${roleTitle}.`);
}
if (/Committee Chair|Markets &amp; Economic Strategist|Portfolio Construction Lead|Risk, Controls/i.test(discoveryHtml)) {
  fail("Client discovery protocol contains a retired committee-role title.");
}
for (const requiredText of ["Client Option 1", "Practice a bounded client interview", "Suggested opening questions", "Interview transcript", "Analyst notes for the Decision Record", "Personality and voice cue", "AI-generated fictional portrait"]) {
  if (!discoveryHtml.includes(requiredText)) fail(`Client discovery protocol is missing interview-prototype content: ${requiredText}.`);
}
if (!discoveryHtml.includes('../scripts/client-interview-simulator.js')) fail("Client discovery protocol is missing the local simulator runtime.");

const simulatorRuntimePath = path.join(rootDir, "scripts", "client-interview-simulator.js");
if (!(await exists(simulatorRuntimePath))) {
  fail("Missing maintained client interview simulator runtime.");
} else {
  const simulatorRuntime = await fs.readFile(simulatorRuntimePath, "utf8");
  for (const marker of ["recommendationPattern", "dialoguePaths", "complicationDelivered", "clarificationResponses", "appendGreeting", "data-interview-transcript", "data-download-session"]) {
    if (!simulatorRuntime.includes(marker)) fail(`Client interview simulator runtime is missing required control: ${marker}.`);
  }
  if (/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource/.test(simulatorRuntime)) fail("Client interview simulator runtime must not call an external service.");
}

const decisionRecordResource = model.resources.find((resource) => resource.id === "decision-record");
if (!decisionRecordResource || !/Analyst Decision Log/i.test(`${decisionRecordResource.label} ${decisionRecordResource.description}`)) {
  fail("The public committee workbook resource must identify the Analyst Decision Log.");
}

const workbookBuilderPath = path.join(rootDir, "scripts", "build-investment-committee-decision-record.mjs");
if (!(await exists(workbookBuilderPath))) {
  fail("Missing maintained committee-workbook builder.");
} else {
  const workbookBuilder = await fs.readFile(workbookBuilderPath, "utf8");
  for (const marker of ["ROLE × CLIENT COVERAGE", "minimumDecisionLogEntries", "COUNTIFS($C$8:$C$37"]) {
    if (!workbookBuilder.includes(marker)) fail(`Committee-workbook builder is missing the role-by-client readiness control: ${marker}.`);
  }
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
