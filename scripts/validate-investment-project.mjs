import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const releaseMode = process.argv.includes("--release");
const model = JSON.parse(await fs.readFile(path.join(rootDir, "project-model.json"), "utf8"));
const errors = [];
const warnings = [];
const execFileAsync = promisify(execFile);

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

const extractPdfText = async (pdfPath) => {
  const candidates = ["pdftotext"];
  if (process.env.HOME) {
    candidates.push(path.join(process.env.HOME, ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "native", "poppler", "poppler", "bin", "pdftotext"));
  }
  let lastError;
  for (const command of candidates) {
    try {
      const { stdout } = await execFileAsync(command, [pdfPath, "-"], { maxBuffer: 4 * 1024 * 1024 });
      return stdout;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const phasePath = (phase) => `project/${phase.id}-${phase.title.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.html`;
const roadmapPath = "project/roadmap.html";

if (model.schemaVersion < 4) fail("Project model schema must include the five-role focused-selection and derivative-risk contract.");

const roadmap = model.studentRoadmap;
if (!roadmap) {
  fail("Missing student roadmap in the public model.");
} else {
  if (!/structured Excel workbooks/i.test(roadmap.boundary || "") || !/PowerPoint presentation/i.test(roadmap.boundary || "")) {
    fail("Student roadmap must preserve the provided-Excel and student-created-PowerPoint boundary.");
  }
  if (!roadmap.visual?.path || !roadmap.visual?.alt || !(await exists(path.join(rootDir, roadmap.visual.path)))) {
    fail("Student roadmap must include its public visual asset and alt text.");
  }
  for (const phaseId of ["phase-1", "phase-2", "phase-3"]) {
    if (roadmap.phaseSequences?.[phaseId]?.length < 4) fail(`Student roadmap needs a complete sequence for ${phaseId}.`);
    if (roadmap.definitionOfDone?.[phaseId]?.length < 3) fail(`Student roadmap needs a definition of done for ${phaseId}.`);
  }
  const phaseOneText = JSON.stringify(roadmap.phaseSequences?.["phase-1"] || []);
  for (const required of ["historical", "human-first", "FactSet", "FRED", "bull", "base", "bear", "100%", "macro", "mandate"]) {
    if (!new RegExp(required, "i").test(phaseOneText)) fail(`Phase 1 roadmap sequence is missing its detailed macro-analysis requirement: ${required}.`);
  }
}

if (model.phases.length !== 3) fail(`Expected exactly 3 phases; found ${model.phases.length}.`);
if (model.roles.length !== 5) fail(`Expected exactly 5 committee roles; found ${model.roles.length}.`);

const requiredRoleTitles = [
  "Client and Macro Strategist",
  "Fixed-Income Analyst",
  "Equity Analyst",
  "Portfolio Manager",
  "Risk and Derivatives Analyst"
];
if (model.roles.map((role) => role.title).join("|") !== requiredRoleTitles.join("|")) {
  fail("The five committee roles must match the Client/Macro, Fixed-Income, Equity, Portfolio Manager, and Risk/Derivatives contract in order.");
}

const phase2Experience = model.phase2Experience;
if (!phase2Experience) {
  fail("Missing phase2Experience in the public model.");
} else {
  if (!/Phase 1/i.test(phase2Experience.handoffRule || "") || !/guardrail/i.test(phase2Experience.handoffRule || "")) fail("Phase 2 must require a Phase 1 client-guardrail handoff.");
  if (phase2Experience.securityWorkflow?.length < 5) fail("Security analysis must define a complete compare, challenge, verify, and decide workflow.");
  if (phase2Experience.portfolioWorkflow?.length < 6) fail("Portfolio management must define allocation, IPS, stress, correction, re-test, and vote steps.");
  const instrumentText = JSON.stringify(phase2Experience.instrumentStandards || []);
  for (const required of ["fixed-income fund", "Equity fund", "individual equity", "duration", "credit", "benchmark", "style", "diversification", "cost", "liquidity", "client fit"]) {
    if (!new RegExp(required, "i").test(instrumentText)) fail(`Phase 2 instrument analysis is missing ${required}.`);
  }
  const issuerCheck = phase2Experience.issuerRealityCheck;
  if (!issuerCheck || !/yield or recent return alone/i.test(issuerCheck.decisionRule || "")) fail("Issuer Reality Check must prohibit yield or recent return as the sole recommendation basis.");
  const issuerText = JSON.stringify(issuerCheck || {});
  for (const required of ["business model", "revenue drivers", "macro sensitivity", "margin", "cash-flow", "liquidity", "leverage", "interest coverage", "debt-maturity", "issuer-specific risk", "client fit"]) {
    if (!new RegExp(required, "i").test(issuerText)) fail(`Issuer Reality Check is missing ${required}.`);
  }
  if (issuerCheck?.roleResponsibilities?.length !== 5) fail("Issuer Reality Check must assign all five committee roles.");
  const issuerRoleIds = new Set(issuerCheck?.roleResponsibilities?.map((item) => item.roleId));
  for (const role of model.roles) if (!issuerRoleIds.has(role.id)) fail(`Issuer Reality Check is missing ${role.title}.`);
  const factSetWorkflow = phase2Experience.factSetWorkflow;
  const factSetText = JSON.stringify(factSetWorkflow || {});
  if (!factSetWorkflow || !/licensed FactSet access/i.test(factSetText) || !/public repository/i.test(factSetText)) fail("Phase 2 must define the licensed FactSet workflow and public-repository boundary.");
  for (const required of ["retrieved", "retrieval date", "metric", "source", "document reference", "interpretation", "effect on the recommendation", "canvas submission item"]) {
    if (!new RegExp(required, "i").test(factSetText)) fail(`FactSet evidence contract is missing ${required}.`);
  }
  for (const required of ["Issuer Reality Check", "Credit and fixed income", "Mutual funds and ETFs", "Corporate issuer analysis", "Portfolio risk inputs"]) {
    if (!factSetWorkflow?.connections?.some((item) => item.workstream === required)) fail(`FactSet workflow is missing the ${required} connection.`);
  }
  const selectionContractText = JSON.stringify(phase2Experience.selectionContract || {});
  for (const required of ["8–10", "never exceed 10", "Funds and ETFs", "two or three", "Individual bonds are not required", "Cost and trading expenses", "overlap", "Diversification contribution", "idiosyncratic risk", "position-size", "Full scorecards are required for final holdings"]) {
    if (!new RegExp(required, "i").test(selectionContractText)) fail(`Focused selection contract is missing ${required}.`);
  }
  const hedgeText = JSON.stringify(phase2Experience.derivativeHedge || {});
  for (const required of ["at most one", "residual risk", "no-hedge", "instrument", "size", "cost", "liquidity", "trade-offs", "removal"]) {
    if (!new RegExp(required, "i").test(hedgeText)) fail(`Derivative hedge contract is missing ${required}.`);
  }
  if (phase2Experience.roleIntegration?.length !== 5) fail("Phase 2 must define security and portfolio ownership for all five roles.");
  if (!phase2Experience.securityQualityGate?.some((item) => /AI/i.test(item) && /evidence/i.test(item))) fail("Security quality gate must preserve AI challenge and human evidence verification.");
  if (!phase2Experience.portfolioQualityGate?.some((item) => /breach/i.test(item) && /re-test/i.test(item))) fail("Portfolio quality gate must require breach correction and re-testing.");
}

const experience = model.phase1Experience;
if (!experience) {
  fail("Missing phase1Experience in the public model.");
} else {
  if (experience.clientSets?.length !== 5) fail("Phase 1 must present five fictional-client team sets.");
  if (experience.clientSets?.some((set) => set.clients?.length !== 3)) fail("Every fictional-client team set must contain three clients.");
  if (!experience.structuredRolePlay?.clientRule || !experience.structuredRolePlay?.analystRule || !experience.structuredRolePlay?.recordRule) {
    fail("Phase 1 must define the structured human role-play rules.");
  }
  if (!experience.instructorDemo?.name || !experience.instructorDemo?.clientCue) fail("Phase 1 must define an instructor-led client-discovery demonstration.");
  if (experience.rolePlayProfiles?.length !== 15) fail("Phase 1 must define one structured role-play profile for each fictional client.");
  if (experience.rolePlaySequence?.length !== 5) fail("Phase 1 must define the classroom demo and team role-play sequence.");
  if (experience.decisionCycle?.map((item) => item.stage).join("|") !== "Prepare|Observe the model|Interview your client|Challenge and verify|Set the mandate") {
    fail("Phase 1 decision cycle must preserve the preparation, classroom model, team interview, verification, and mandate sequence.");
  }
  if (experience.interviewRounds?.length !== 5) fail("Phase 1 must define one interview round for each of the five roles.");
  const roundRoleIds = new Set(experience.interviewRounds?.map((round) => round.roleId));
  for (const role of model.roles) {
    if (!roundRoleIds.has(role.id)) fail(`Phase 1 is missing an interview round for ${role.title}.`);
  }
  if (!/not established/i.test(experience.structuredRolePlay?.clientRule || "") || !/do not invent/i.test(experience.structuredRolePlay?.clientRule || "") || !/recommend/i.test(experience.structuredRolePlay?.clientRule || "")) fail("The human role-play contract must prohibit invented facts and recommendations.");
  if (!experience.approvedSources?.length) fail("Phase 1 must define approved verification sources.");
  if (!experience.qualityGate?.some((item) => /human-first/i.test(item))) fail("Phase 1 quality gate must require a human-first judgment.");
  if (!experience.qualityGate?.some((item) => /guardrail/i.test(item))) fail("Phase 1 quality gate must connect final reasoning to later investment guardrails.");
}

const phaseIds = new Set(model.phases.map((phase) => phase.id));
const roleIds = new Set(model.roles.map((role) => role.id));
if (phaseIds.size !== model.phases.length) fail("Phase IDs must be unique.");
if (roleIds.size !== model.roles.length) fail("Role IDs must be unique.");
if (model.phases.map((phase) => phase.number).join(",") !== "1,2,3") fail("Phase numbers must be 1, 2, and 3 in order.");

if (model.canvasSubmissions?.assignments?.map((item) => item.phaseId).join(",") !== "phase-1,phase-2,phase-3") {
  fail("Canvas submission workflow must define one assignment for each phase in order.");
} else {
  const submissionNames = new Set();
  for (const assignment of model.canvasSubmissions.assignments) {
    if (!assignment.requiredFiles?.length || !assignment.preflight?.length || !assignment.submissionProcess || typeof assignment.includePrivateEvidenceBoundary !== "boolean") fail(`${assignment.phaseId} Canvas submission is incomplete.`);
    for (const file of assignment.requiredFiles || []) {
      if (!/^BUS331_Team##_/i.test(file.name)) fail(`${assignment.phaseId} Canvas filename must use the BUS331_Team##_ convention: ${file.name}.`);
      if (submissionNames.has(file.name)) fail(`Duplicate Canvas submission filename: ${file.name}.`);
      submissionNames.add(file.name);
      const extension = file.name.split(".").pop().toLowerCase();
      if (!assignment.allowedExtensions?.includes(extension)) fail(`${assignment.phaseId} allowed extensions must include .${extension} for ${file.name}.`);
    }
  }
  const phase2Submission = model.canvasSubmissions.assignments.find((assignment) => assignment.phaseId === "phase-2");
  if (!/two checkpoints/i.test(phase2Submission.submissionProcess) || !/Baseline Snapshot/i.test(phase2Submission.submissionProcess) || !/Scenario Reveal/i.test(phase2Submission.submissionProcess)) fail("Phase 2 Canvas submission must explain the baseline and Scenario Reveal checkpoints.");
  const submissionBoundary = `${model.canvasSubmissions.authority} ${(model.canvasSubmissions.sharedRules || []).join(" ")}`;
  if (!/one designated submitter/i.test(submissionBoundary) || !/Canvas submission receipt/i.test(submissionBoundary)) fail("Canvas workflow must define one submitter and a receipt check.");
  if (!/licensed FactSet evidence/i.test(submissionBoundary) || !/private evidence ZIP/i.test(submissionBoundary)) fail("Canvas workflow must define the private licensed-evidence bundle.");
}

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
  roadmapPath,
  "project/guide.html",
  "project/client-discovery-ai-protocol.html",
  "project/security-analysis-selection.html",
  "project/portfolio-management-stress-testing.html",
  "project/canvas-submission-guide.html",
  ...model.phases.map(phasePath),
  "project/assessment.html"
];

const canvasFragments = model.canvasSubmissions.assignments.map((assignment) => {
  const phase = model.phases.find((item) => item.id === assignment.phaseId);
  return `canvas/phase-${phase.number}-assignment.html`;
});

const supportingHtmlFiles = [
  "project/BUS331_InvProject_Bridge_CME_Guide.html",
  "project/BUS331_InvProject_SecuritySelection_Guide.html",
  "project/BUS331_InvProject_StressTest_Guide.html",
  "project/BUS331_InvProject_FinalPitch_Guide.html"
];

const hrefPattern = /href="([^"]+)"/g;
const oldPhasePattern = /\bPhase\s+(?:0?[4-6])\b/i;
const forbiddenPublicPattern = /Fund and ETF Analyst|Portfolio Manager and Risk Analyst|four-person|all four|at least 10 securities|every client needs at least one derivative|mandatory.{0,30}hedge|required.{0,20}compare to at least 1 alternative|complete one thesis block per security|completed exemplar|worked example|Priya Mehta/i;

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
  if (forbiddenPublicPattern.test(html)) fail(`${relative} contains a retired role, obsolete portfolio rule, or completed-example marker.`);

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

for (const [index, relative] of canvasFragments.entries()) {
  const absolute = path.join(rootDir, relative);
  if (!(await exists(absolute))) {
    fail(`Missing Canvas assignment fragment: ${relative}.`);
    continue;
  }
  const html = await fs.readFile(absolute, "utf8");
  if (/<(?:html|head|body|script|style)\b/i.test(html)) fail(`${relative} contains markup that is unsafe or unnecessary for a Canvas fragment.`);
  if ((html.match(/<h1\b/gi) || []).length !== 1) fail(`${relative} must contain exactly one h1.`);
  if (!/style="/i.test(html)) fail(`${relative} must use inline Canvas-safe styling.`);
  if (!/Canvas receipt/i.test(html)) fail(`${relative} is missing the Canvas receipt check.`);
  if (model.canvasSubmissions.assignments[index].includePrivateEvidenceBoundary && !/Submit through Canvas/i.test(html)) fail(`${relative} is missing its Canvas submission boundary.`);
  if (!model.canvasSubmissions.assignments[index].includePrivateEvidenceBoundary && /Submit through Canvas/i.test(html)) fail(`${relative} should not include the Canvas submission boundary.`);
  if (/public repository|private repository/i.test(html)) fail(`${relative} should direct students to Canvas without repository terminology.`);
  if (forbiddenPublicPattern.test(html)) fail(`${relative} contains a retired role, obsolete portfolio rule, or completed-example marker.`);
  if (!/Submission process/i.test(html)) fail(`${relative} is missing its submission process.`);
  for (const file of model.canvasSubmissions.assignments[index].requiredFiles) {
    if (!html.includes(file.name)) fail(`${relative} is missing required filename ${file.name}.`);
  }
}

for (const relative of supportingHtmlFiles) {
  const absolute = path.join(rootDir, relative);
  if (!(await exists(absolute))) {
    fail(`Missing supporting student guide: ${relative}.`);
    continue;
  }
  const html = await fs.readFile(absolute, "utf8");
  if (!/<html\b[^>]*lang="en"/i.test(html)) fail(`${relative} is missing lang="en".`);
  if ((html.match(/<h1\b/gi) || []).length !== 1) fail(`${relative} must contain exactly one h1.`);
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(`${relative} is missing a non-empty title.`);
  if (oldPhasePattern.test(html)) fail(`${relative} contains retired phase language.`);
  if (/Spring 2026/i.test(html)) fail(`${relative} contains a retired course term.`);
  if (forbiddenPublicPattern.test(html)) fail(`${relative} contains a retired role, obsolete portfolio rule, or completed-example marker.`);

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

async function extractOfficeText(relative) {
  const absolute = path.join(rootDir, relative);
  const { stdout: listing } = await execFileAsync("unzip", ["-Z1", absolute], { maxBuffer: 4 * 1024 * 1024 });
  const entries = listing
    .split(/\r?\n/)
    .filter((entry) => entry.endsWith(".xml") && !entry.startsWith("[") && !entry.includes("/theme/") && !entry.includes("/styles"));
  if (!entries.length) return "";
  const { stdout } = await execFileAsync("unzip", ["-p", absolute, ...entries], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  return stdout
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

const officeArtifacts = [
  ...new Set(
    [
      ...model.resources.map((resource) => resource.path),
      "source-templates/BUS331_InvProject_SecuritySelection_Layout_Base.xlsx"
    ]
      .filter((resourcePath) => /\.(?:xlsx|pptx|docx)$/i.test(resourcePath))
  )
];

for (const relative of officeArtifacts) {
  try {
    const text = await extractOfficeText(relative);
    if (oldPhasePattern.test(text)) fail(`${relative} contains retired phase language inside the Office package.`);
    if (/Spring 2026/i.test(text)) fail(`${relative} contains a retired course term inside the Office package.`);
    if (forbiddenPublicPattern.test(text)) fail(`${relative} contains a retired role, obsolete portfolio rule, or completed-example marker inside the Office package.`);
    if (/SecuritySelection_(?:Template|Layout_Base)/i.test(relative)) {
      for (const required of ["FINAL SCORECARDS", "RISK & HEDGE", "8–10", "no-hedge", "Cost and trading expenses", "Risk and Derivatives Analyst"]) {
        if (!text.toLowerCase().includes(required.toLowerCase())) fail(`${relative} is missing current focused-selection workbook content: ${required}.`);
      }
    }
    if (/Decision_Record/i.test(relative)) {
      for (const required of ["Equity Analyst", "Risk and Derivatives Analyst", "Alternative(s) rejected", "Key trade-off", "15"]) {
        if (!text.toLowerCase().includes(required.toLowerCase())) fail(`${relative} is missing current five-role decision-log content: ${required}.`);
      }
    }
  } catch (error) {
    fail(`Could not inspect public Office artifact ${relative}: ${error.message}`);
  }
}

const publicPdfArtifacts = [
  { relative: "files/final-rubric.pdf", required: ["Investment Project Rubrics", "Role-specific committee", "Decision Log"] },
  { relative: "files/BUS331_Investment_Committee_Simulation_Project_Guide.pdf", required: ["five committee roles", "8-10 final holdings", "no-hedge"] }
];
for (const pdf of publicPdfArtifacts) {
  const pdfPath = path.join(rootDir, pdf.relative);
  if (!(await exists(pdfPath))) {
    fail(`Missing public PDF artifact: ${pdf.relative}.`);
    continue;
  }
  try {
    const pdfText = await extractPdfText(pdfPath);
    if (oldPhasePattern.test(pdfText)) fail(`${pdf.relative} contains retired phase language.`);
    if (/Spring 2026/i.test(pdfText)) fail(`${pdf.relative} contains a retired course term.`);
    if (forbiddenPublicPattern.test(pdfText)) fail(`${pdf.relative} contains a retired role, obsolete portfolio rule, or completed-example marker.`);
    for (const required of pdf.required) {
      if (!pdfText.toLowerCase().includes(required.toLowerCase())) fail(`${pdf.relative} is missing current generated content: ${required}.`);
    }
  } catch (error) {
    fail(`Could not inspect public PDF ${pdf.relative}: ${error.message}`);
  }
}

if (!(await exists(path.join(rootDir, "styles", "bus331-investment-project.css")))) {
  fail("Missing shared project stylesheet.");
}

const indexHtml = await fs.readFile(path.join(rootDir, "index.html"), "utf8");
if (!indexHtml.includes("Open your roadmap")) fail("Portal is missing the student roadmap entry point.");
const roadmapHtml = await fs.readFile(path.join(rootDir, roadmapPath), "utf8");
for (const requiredText of ["What BUS331 provides—and what your committee creates", "structured Excel workbooks", "PowerPoint presentation", "Complete the detailed macro analysis", "Definition of done", "This visual is an orientation tool"]) {
  if (!roadmapHtml.includes(requiredText)) fail(`Student roadmap is missing required student-navigation content: ${requiredText}.`);
}
for (const phase of model.phases) {
  if (!indexHtml.includes(phase.title.replaceAll("&", "&amp;")) && !indexHtml.includes(phase.title)) {
    fail(`Portal does not show phase title: ${phase.title}.`);
  }
}

for (const phase of model.phases) {
  const html = await fs.readFile(path.join(rootDir, phasePath(phase)), "utf8");
  if (!html.includes(`Your Phase ${phase.number} sequence`) || !html.includes("Definition of done")) {
    fail(`Phase ${phase.number} page is missing its ordered sequence or definition of done.`);
  }
}
for (const role of model.roles) {
  const encoded = role.title.replaceAll("&", "&amp;");
  if (!indexHtml.includes(encoded) && !indexHtml.includes(role.title)) fail(`Portal does not show role: ${role.title}.`);
}

const discoveryHtml = await fs.readFile(path.join(rootDir, "project", "client-discovery-ai-protocol.html"), "utf8");
for (const requiredText of [
  "Prepare",
  "Observe the model",
  "Interview your client",
  "Challenge and verify",
  "Set the mandate",
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
for (const requiredText of ["Start here", "Open your team role-play instructions", "Classroom model", "See the process, then do it with your team", "Committee challenge round"]) {
  if (!discoveryHtml.includes(requiredText)) fail(`Client discovery protocol is missing role-play content: ${requiredText}.`);
}
if (/Start live interview|client-interview-simulator|Bounded role-play|Start with this prompt/.test(discoveryHtml)) fail("Client discovery protocol retains retired AI interview or prompt content.");

const securityHtml = await fs.readFile(path.join(rootDir, "project", "security-analysis-selection.html"), "utf8");
for (const requiredText of [
  "Phase 1 is the decision filter",
  "Build a focused candidate set",
  "8–10 holdings",
  "Funds and ETFs are the primary",
  "Fixed-income fund, ETF, or limited direct exposure",
  "Equity fund or ETF",
  "Limited individual equity",
  "Use one concise scorecard",
  "Rejected alternatives",
  "Candidate comparison and decision record",
  "Issuer Reality Check",
  "Yield or recent return alone cannot support a recommendation",
  "Business model and principal revenue drivers",
  "Interest coverage and debt-maturity considerations",
  "FactSet Research and Evidence Record",
  "Public/private data boundary",
  "Data as-of period and retrieval date",
  "licensed-source evidence",
  "AI challenge-and-verification checkpoint",
  "Accept, Modify, or Reject"
]) {
  if (!securityHtml.includes(requiredText)) fail(`Security Analysis page is missing required student workflow content: ${requiredText}.`);
}
for (const roleTitle of requiredRoleTitles) {
  if (!securityHtml.includes(roleTitle)) fail(`Security Analysis page is missing role ownership for ${roleTitle}.`);
}

const portfolioHtml = await fs.readFile(path.join(rootDir, "project", "portfolio-management-stress-testing.html"), "utf8");
for (const requiredText of [
  "Integrated allocation record",
  "Test the whole mandate",
  "Bear-case stress template",
  "Document the adjustment and re-test",
  "Pass · Warning · Breach",
  "Weights total 100%",
  "Conclude hedge or no hedge",
  "One targeted hedge at most",
  "No hedge is a valid conclusion",
  "AI boundary"
]) {
  if (!portfolioHtml.includes(requiredText)) fail(`Portfolio and Stress Testing page is missing required student workflow content: ${requiredText}.`);
}
if (!portfolioHtml.includes("FactSet input record") || !portfolioHtml.includes("privately through Canvas") || !portfolioHtml.includes("do not place proprietary exports or student work in the public repository")) {
  fail("Portfolio and Stress Testing page is missing the FactSet input and proprietary-data boundary.");
}
for (const roleTitle of requiredRoleTitles) {
  if (!portfolioHtml.includes(roleTitle)) fail(`Portfolio and Stress Testing page is missing role ownership for ${roleTitle}.`);
}

const assessmentHtml = await fs.readFile(path.join(rootDir, "project", "assessment.html"), "utf8");
const writtenTotal = model.assessment.writtenCriteria.reduce((total, item) => total + item.weight, 0);
const oralTotal = model.assessment.oralCriteria.reduce((total, item) => total + item.weight, 0);
if (writtenTotal !== model.assessment.submissionPoints || oralTotal !== model.assessment.presentationPoints) fail(`Submission and presentation rubric weights must match their point totals; found ${writtenTotal} and ${oralTotal}.`);
if (!model.assessment.submissionRubricName || !model.assessment.presentationRubricName) fail("Assessment must define the two Canvas rubric names.");
const canvasRubricImports = [
  {file: "canvas/BUS331_Investment_Project_Submission_Rubric.csv", name: model.assessment.submissionRubricName, criteria: model.assessment.writtenCriteria},
  {file: "canvas/BUS331_Investment_Project_Presentation_Rubric.csv", name: model.assessment.presentationRubricName, criteria: model.assessment.oralCriteria}
];
const canvasRubricHeader = "Rubric Name,Criteria Name,Criteria Description,Criteria Enable Range,Rating Name,Rating Description,Rating Points,Rating Name,Rating Description,Rating Points,Rating Name,Rating Description,Rating Points";
for (const rubric of canvasRubricImports) {
  const absolute = path.join(rootDir, rubric.file);
  if (!(await exists(absolute))) {
    fail(`Missing Canvas rubric import: ${rubric.file}.`);
    continue;
  }
  const csv = await fs.readFile(absolute, "utf8");
  if (!csv.startsWith(`${canvasRubricHeader}\n`)) fail(`${rubric.file} does not use the Canvas rubric-template header.`);
  for (const criterion of rubric.criteria) {
    if (!csv.includes(criterion.criterion) || !csv.includes(criterion.standard)) fail(`${rubric.file} is missing criterion content: ${criterion.criterion}.`);
  }
  if (!csv.includes(rubric.name) || !csv.includes("Complete") || !csv.includes("Developing") || !csv.includes("Not demonstrated")) fail(`${rubric.file} is missing Canvas rating data.`);
}
for (const requiredText of ["Evidence quality", "Focused security selection", "Client suitability", "Shared portfolio quality", "Individual role evidence", "Role-specific committee defense", "Decision Log contribution", "Issuer Reality Check"]) {
  if (!assessmentHtml.includes(requiredText)) fail(`Assessment page is missing updated rubric or committee-defense content: ${requiredText}.`);
}
if (model.assessment.committeeQuestions?.length < 6) fail("Assessment must define all five role-specific and cross-committee defense questions.");

for (const relative of ["project/security-analysis-selection.html", "project/portfolio-management-stress-testing.html", "project/assessment.html"]) {
  const html = await fs.readFile(path.join(rootDir, relative), "utf8");
  if (/OPENAI_API_KEY|eleanor-vance-scenario|approvedFacts|progressiveDisclosure|grading key|completed exemplar/i.test(html)) {
    fail(`${relative} exposes private configuration, a key, or completed-answer language.`);
  }
}

const simulatorRuntimePath = path.join(rootDir, "scripts", "client-interview-simulator.js");
if (!(await exists(simulatorRuntimePath))) {
  fail("Missing maintained client interview simulator runtime.");
} else {
  const simulatorRuntime = await fs.readFile(simulatorRuntimePath, "utf8");
  for (const marker of ["MediaRecorder", "getUserMedia", "transcriptionEndpoint", "responseEndpoint", "data-start-interview", "data-record-question", "data-interview-transcript", "data-download-session"]) {
    if (!simulatorRuntime.includes(marker)) fail(`Client interview simulator runtime is missing required control: ${marker}.`);
  }
  if (!/audioBase64|SpeechSynthesisUtterance/.test(simulatorRuntime)) fail("Client interview simulator runtime must expose an accessible spoken-response path when supported.");
  if (/OPENAI_API_KEY|api\.openai\.com|scenarioFacts|dialoguePaths|riskAversionScore/.test(simulatorRuntime)) {
    fail("Public client interview runtime exposes an API credential surface or instructor-only scenario control.");
  }
  if (!/fetch\s*\(url/.test(simulatorRuntime)) fail("Public voice runtime must call only the instructor-hosted endpoint supplied by the public model.");
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
  for (const marker of ["ROLE × CLIENT COVERAGE", "minimumDecisionLogEntries", "COUNTIFS($C$8:$C$37", "Alternative(s) rejected", "Key trade-off", "Risk and Derivatives entries"]) {
    if (!workbookBuilder.includes(marker)) fail(`Committee-workbook builder is missing the role-by-client readiness control: ${marker}.`);
  }
}

const securityWorkbookUpdaterPath = path.join(rootDir, "scripts", "update-security-selection-workbook.mjs");
if (!(await exists(securityWorkbookUpdaterPath))) {
  fail("Missing maintained security-selection workbook updater.");
} else {
  const updater = await fs.readFile(securityWorkbookUpdaterPath, "utf8");
  for (const marker of ["source-templates", "BUS331_InvProject_SecuritySelection_Layout_Base.xlsx", "FINAL SCORECARDS", "RISK & HEDGE", "8–10 final holdings", "Cost & Trading Expenses", "Hedge / No-Hedge", "JSZip", "ISSUER CHECK", "EVIDENCE LOG", "Yield or recent return alone cannot support a recommendation", "Business Model", "Interest Coverage / Debt Maturities", "Fund/ETF look-through", "Client-Fit Conclusion", "FactSet Data / Research Retrieved", "Effect on Recommendation", "Canvas Submission Item / Evidence-File Reference"]) {
    if (!updater.includes(marker)) fail(`Security-selection workbook updater is missing Issuer Reality Check control: ${marker}.`);
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
