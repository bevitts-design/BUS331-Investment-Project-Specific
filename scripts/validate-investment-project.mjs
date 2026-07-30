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

if (model.schemaVersion < 3) fail("Project model schema must include the Phase 2 workflow contract.");

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

const phase2Experience = model.phase2Experience;
if (!phase2Experience) {
  fail("Missing phase2Experience in the public model.");
} else {
  if (!/Phase 1/i.test(phase2Experience.handoffRule || "") || !/guardrail/i.test(phase2Experience.handoffRule || "")) fail("Phase 2 must require a Phase 1 client-guardrail handoff.");
  if (phase2Experience.securityWorkflow?.length < 5) fail("Security analysis must define a complete compare, challenge, verify, and decide workflow.");
  if (phase2Experience.portfolioWorkflow?.length < 6) fail("Portfolio management must define allocation, IPS, stress, correction, re-test, and vote steps.");
  const instrumentText = JSON.stringify(phase2Experience.instrumentStandards || []);
  for (const required of ["Bond", "Mutual fund", "ETF", "duration", "credit", "benchmark", "style", "diversification", "cost", "liquidity", "client suitability"]) {
    if (!new RegExp(required, "i").test(instrumentText)) fail(`Phase 2 instrument analysis is missing ${required}.`);
  }
  const issuerCheck = phase2Experience.issuerRealityCheck;
  if (!issuerCheck || !/yield or recent return alone/i.test(issuerCheck.decisionRule || "")) fail("Issuer Reality Check must prohibit yield or recent return as the sole recommendation basis.");
  const issuerText = JSON.stringify(issuerCheck || {});
  for (const required of ["business model", "revenue drivers", "macro sensitivity", "margin", "cash-flow", "liquidity", "leverage", "interest coverage", "debt-maturity", "issuer-specific risk", "client fit"]) {
    if (!new RegExp(required, "i").test(issuerText)) fail(`Issuer Reality Check is missing ${required}.`);
  }
  if (issuerCheck?.roleResponsibilities?.length !== 4) fail("Issuer Reality Check must assign all four committee roles.");
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
  if (phase2Experience.roleIntegration?.length !== 4) fail("Phase 2 must define security and portfolio ownership for all four roles.");
  if (!phase2Experience.securityQualityGate?.some((item) => /AI/i.test(item) && /evidence/i.test(item))) fail("Security quality gate must preserve AI challenge and human evidence verification.");
  if (!phase2Experience.portfolioQualityGate?.some((item) => /breach/i.test(item) && /re-test/i.test(item))) fail("Portfolio quality gate must require breach correction and re-testing.");
}

const experience = model.phase1Experience;
if (!experience) {
  fail("Missing phase1Experience in the public model.");
} else {
  if (experience.clientSets?.length !== 5) fail("Phase 1 must present five fictional-client team sets.");
  if (experience.clientSets?.some((set) => set.clients?.length !== 3)) fail("Every fictional-client team set must contain three clients.");
  const interviewPrototype = experience.interviewPrototype;
  if (!interviewPrototype) {
    fail("Phase 1 must include the instructor-hosted Client Option 1 voice interview.");
  } else {
    if (!experience.clientSets?.[0]?.clients?.includes(interviewPrototype.clientName)) fail("The interview prototype client must remain in Team One's existing client set.");
    if (!interviewPrototype.visibleDossier?.length) fail("The voice interview must define an intentionally incomplete public dossier.");
    if (interviewPrototype.openingQuestions?.length < 3) fail("The interview prototype must provide suggested opening questions.");
    const boundaryText = `${interviewPrototype.boundary} ${interviewPrototype.liveMode?.privacyNotice || ""} ${interviewPrototype.liveMode?.availabilityNotice || ""}`;
    if (!/instructor-hosted/i.test(boundaryText) || !/never recommends/i.test(boundaryText) || !/information gap/i.test(boundaryText)) {
      fail("The public voice interview must identify the instructor-hosted boundary, information gaps, and recommendation refusal.");
    }
    for (const privateKey of ["scenarioFacts", "dialoguePaths", "complication", "recommendationResponses", "unknownResponses", "acknowledgements", "clarificationResponses"]) {
      if (Object.hasOwn(interviewPrototype, privateKey)) fail(`The public interview model exposes instructor-only scenario control: ${privateKey}.`);
    }
    if (!interviewPrototype.liveMode?.transcriptionEndpoint || !interviewPrototype.liveMode?.responseEndpoint || interviewPrototype.liveMode?.maximumTurns < 1) {
      fail("The public voice interview must define bounded transcription and response endpoint contracts.");
    }
    if (!interviewPrototype.voiceCue) fail("The interview prototype must include a student-facing fictional voice cue.");
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

if (model.canvasSubmissions?.assignments?.map((item) => item.phaseId).join(",") !== "phase-1,phase-2,phase-3") {
  fail("Canvas submission workflow must define one assignment for each phase in order.");
} else {
  const submissionNames = new Set();
  for (const assignment of model.canvasSubmissions.assignments) {
    if (!assignment.requiredFiles?.length || !assignment.preflight?.length) fail(`${assignment.phaseId} Canvas submission is incomplete.`);
    for (const file of assignment.requiredFiles || []) {
      if (!/^BUS331_Team##_/i.test(file.name)) fail(`${assignment.phaseId} Canvas filename must use the BUS331_Team##_ convention: ${file.name}.`);
      if (submissionNames.has(file.name)) fail(`Duplicate Canvas submission filename: ${file.name}.`);
      submissionNames.add(file.name);
    }
  }
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
  if (!/private Canvas assignment/i.test(html) || !/Canvas receipt/i.test(html)) fail(`${relative} is missing the private-submission or receipt boundary.`);
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
  return stdout.replace(/<[^>]+>/g, " ");
}

const officeArtifacts = [
  ...new Set(
    model.resources
      .map((resource) => resource.path)
      .filter((resourcePath) => /\.(?:xlsx|pptx|docx)$/i.test(resourcePath))
  )
];

for (const relative of officeArtifacts) {
  try {
    const text = await extractOfficeText(relative);
    if (oldPhasePattern.test(text)) fail(`${relative} contains retired phase language inside the Office package.`);
    if (/Spring 2026/i.test(text)) fail(`${relative} contains a retired course term inside the Office package.`);
  } catch (error) {
    fail(`Could not inspect public Office artifact ${relative}: ${error.message}`);
  }
}

const rubricPdfPath = path.join(rootDir, "files", "final-rubric.pdf");
if (!(await exists(rubricPdfPath))) {
  fail("Missing public Phase 3 rubric PDF.");
} else {
  try {
    const rubricPdfText = await extractPdfText(rubricPdfPath);
    if (oldPhasePattern.test(rubricPdfText)) fail("files/final-rubric.pdf contains retired phase language.");
    if (/Spring 2026/i.test(rubricPdfText)) fail("files/final-rubric.pdf contains a retired course term.");
    if (!rubricPdfText.includes("Phase 3 Assessment Rubric")) fail("files/final-rubric.pdf was not generated from the current Phase 3 rubric source.");
  } catch (error) {
    fail(`Could not inspect public rubric PDF: ${error.message}`);
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
for (const requiredText of ["Client Option 1", "Interview a fictional client in your own voice", "Start live interview", "Record your own question", "Optional opening ideas", "Interview transcript", "Analyst notes for the Decision Record", "Personality and voice cue", "AI-generated fictional portrait"]) {
  if (!discoveryHtml.includes(requiredText)) fail(`Client discovery protocol is missing interview-prototype content: ${requiredText}.`);
}
if (!discoveryHtml.includes('../scripts/client-interview-simulator.js')) fail("Client discovery protocol is missing the local simulator runtime.");
if (/\$30,000 in annual pension income|\$1\.2 million|riskAversionScore|dialoguePaths|recommendationResponses/.test(discoveryHtml)) {
  fail("Generated student page exposes instructor-only Eleanor scenario controls.");
}

const securityHtml = await fs.readFile(path.join(rootDir, "project", "security-analysis-selection.html"), "utf8");
for (const requiredText of [
  "Phase 1 is the decision filter",
  "Bond or fixed-income exposure",
  "Mutual fund",
  "ETF",
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
if (writtenTotal !== 100 || oralTotal !== 100) fail(`Written and oral rubric weights must each total 100; found ${writtenTotal} and ${oralTotal}.`);
for (const requiredText of ["Evidence quality", "Security analysis", "Client suitability", "Portfolio integration", "Role ownership", "Live defense", "Team integration", "Issuer Reality Check"]) {
  if (!assessmentHtml.includes(requiredText)) fail(`Assessment page is missing updated rubric or committee-defense content: ${requiredText}.`);
}
if (model.assessment.committeeQuestions?.length < 5) fail("Assessment must define role-specific and cross-committee defense questions.");

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
  for (const marker of ["ROLE × CLIENT COVERAGE", "minimumDecisionLogEntries", "COUNTIFS($C$8:$C$37"]) {
    if (!workbookBuilder.includes(marker)) fail(`Committee-workbook builder is missing the role-by-client readiness control: ${marker}.`);
  }
}

const securityWorkbookUpdaterPath = path.join(rootDir, "scripts", "update-security-selection-workbook.mjs");
if (!(await exists(securityWorkbookUpdaterPath))) {
  fail("Missing maintained security-selection workbook updater.");
} else {
  const updater = await fs.readFile(securityWorkbookUpdaterPath, "utf8");
  for (const marker of ["ISSUER CHECK", "EVIDENCE LOG", "Yield or recent return alone cannot support a recommendation", "Business Model", "Interest Coverage / Debt Maturities", "Fund/ETF look-through", "Client-Fit Conclusion", "FactSet Data / Research Retrieved", "Effect on Recommendation", "Canvas Submission Item / Evidence-File Reference"]) {
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
