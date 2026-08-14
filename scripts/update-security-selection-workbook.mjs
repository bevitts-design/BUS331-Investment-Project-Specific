import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import JSZip from "jszip";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const model = JSON.parse(await fs.readFile(path.join(rootDir, "project-model.json"), "utf8"));
// Always regenerate from a stable, student-safe layout base. Reading the last
// generated deliverable here would allow package-level drift across reruns.
const workbookPath = process.env.BUS331_WORKBOOK_SOURCE || path.join(
  rootDir,
  "source-templates",
  "BUS331_InvProject_SecuritySelection_Layout_Base.xlsx"
);
const outputRoot = process.env.BUS331_WORKBOOK_OUTPUT || path.join(rootDir, "outputs", "security-selection-update");
const inspectOnly = process.argv.includes("--inspect");
const sheetNames = ["START HERE", "SUMMARY", "Client 1", "Client 2", "Client 3", "RESEARCH GUIDE", "FINAL SCORECARDS", "RISK & HEDGE"];

await fs.mkdir(outputRoot, { recursive: true });
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));

async function renderSheets(suffix, names) {
  for (const sheetName of names) {
    const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
    const safeName = sheetName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await fs.writeFile(path.join(outputRoot, `${safeName}-${suffix}.png`), new Uint8Array(await preview.arrayBuffer()));
  }
}

if (inspectOnly) {
  const overview = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 5000 });
  console.log(overview.ndjson);
  for (const sheetName of ["START HERE", "Client 1"]) {
    const region = await workbook.inspect({ kind: "region", sheetId: sheetName, range: "A1:K35", maxChars: 5000 });
    console.log(region.ndjson);
  }
  const boundaryLabels = await workbook.inspect({
    kind: "match",
    searchTerm: "INSTRUCTOR|SOLUTION|ANSWER KEY|BUS331-instructor",
    options: { useRegex: true, maxResults: 50 },
    summary: "public/private boundary labels"
  });
  console.log(boundaryLabels.ndjson);
  await renderSheets("before", sheetNames);
  console.log(`Rendered ${sheetNames.length} source sheets to ${outputRoot}.`);
  process.exit(0);
}

const issuerSheet = workbook.worksheets.getOrAdd("ISSUER CHECK");
issuerSheet.getRange("A1:W30").clear({ applyTo: "all" });
issuerSheet.showGridLines = false;

const startSheet = workbook.worksheets.getItem("START HERE");
startSheet.getRange("A2").values = [["BUS 331 — Phase 2: Security Analysis & Selection"]];
startSheet.getRange("B6").values = [["Use the client tabs for candidate work, FINAL SCORECARDS for the 8–10 final holdings per client, RISK & HEDGE for the residual-risk conclusion, ISSUER CHECK only where required, and EVIDENCE LOG for licensed-source research. Never exceed 10 holdings; do not fill a slot without a purpose."]];
startSheet.getRange("B8").values = [["  Before You Start — Complete Phase 1 First"]];
startSheet.getRange("B9").values = [["Your Phase 1 market view, client IPS, unresolved information gaps, and downstream guardrails must be approved before security research begins. Every candidate and Issuer Reality Check must trace to that mandate; the macro filter on each client tab must pass before selection."]];
startSheet.getRange("B11").values = [["  Section 1 — Candidate Research and Final Scorecards"]];
startSheet.getRange("B11").format.rowHeight = 34;
startSheet.getRange("B12").values = [["Use the client tabs for focused candidate research. Compare realistic alternatives concisely, then record only the 8–10 final holdings per client in FINAL SCORECARDS. Never exceed 10, do not fill an unused slot, keep funds and ETFs primary, and limit individual securities to two or three total."]];
startSheet.getRange("B14").values = [["  Section 2 — Residual Risk and Hedge / No-Hedge Decision"]];
startSheet.getRange("B14").format.rowHeight = 34;
startSheet.getRange("B15").values = [["Use RISK & HEDGE after portfolio-level stress testing. At most one targeted derivative hedge may be proposed when it solves an identified residual risk. A supported no-hedge conclusion is fully valid; do not add a derivative merely to fill a requirement."]];
startSheet.getRange("B17").values = [["  Section 3 — Final-Holding Evidence and Decision Log"]];
startSheet.getRange("B17").format.rowHeight = 34;
startSheet.getRange("B18").values = [["Complete one concise scorecard for every final holding and record the recommendation, strongest alternative rejected, and key trade-off in the Analyst Decision Log. Full analysis is not required for every screened candidate."]];
startSheet.getRange("B24").values = [["Reviewers will check: (1) each client has 8–10 final holdings and never more than 10, (2) funds and ETFs are primary and individual securities total no more than two or three, (3) every final holding has a concise scorecard and a purpose, (4) rejected alternatives are concise, (5) overlap and concentration are resolved, (6) sources and as-of dates are complete, and (7) residual risk supports one targeted hedge or a fully valid no-hedge conclusion."]];
startSheet.getRange("B27:B36").values = [["☐  Weights sum to 100% for each client"],["☐  Approved allocation and Phase 1 guardrails are visible"],["☐  8–10 final holdings per client; never more than 10; no unused slot filled"],["☐  Funds/ETFs are primary; individual securities total no more than two or three; individual bonds are not required"],["☐  Final scorecard complete for every final holding"],["☐  Individual-security rationale, idiosyncratic risk, and position size complete where applicable"],["☐  Realistic alternatives rejected concisely; key trade-off recorded"],["☐  Portfolio Manager resolved overlap, concentration, final selection, and weights"],["☐  Risk and Derivatives Analyst recorded residual risk and hedge/no-hedge evidence"],["☐  Sources/as-of dates complete; licensed evidence prepared for private Canvas submission"]];
startSheet.getRange("B27:B36").format.rowHeight = 58;
startSheet.getRange("B37:B41").values = [[null], [null], [null], [null], [null]];
startSheet.getRange("A1:K42").format.wrapText = true;

const summarySheet = workbook.worksheets.getItem("SUMMARY");
summarySheet.getRange("A2").values = [["Phase 2 Security Selection Summary — All Clients"]];
for (const clientNumber of [1, 2, 3]) {
  const clientSheet = workbook.worksheets.getItem(`Client ${clientNumber}`);
  clientSheet.getRange("A2").values = [[`Phase 2 — Security Analysis & Selection  |  Client ${clientNumber}`]];
  clientSheet.getRange("A3").values = [["BUS 331 Investments  |  Endicott College  |  Phase 2: Security Analysis & Selection"]];
  clientSheet.getRange("A9").values = [["  SECTION 1 — FOCUSED CANDIDATE RESEARCH TABLE"]];
  clientSheet.getRange("A10").values = [["Use this tab for candidate research and calculations. Record the 8–10 final holdings in FINAL SCORECARDS; never exceed 10, do not fill every slot, keep funds/ETFs primary, and limit individual securities to two or three total."]];
  clientSheet.getRange("K11").values = [["Candidate Note\nRef #"]];
  clientSheet.getRange("A25").values = [["  SECTION 2 — OPTIONAL PRELIMINARY HEDGE RESEARCH"]];
  clientSheet.getRange("A26").values = [["A derivative is optional. Use these fields only to support the RISK & HEDGE tab. At most one targeted hedge may be proposed when it solves an identified residual risk; a supported no-hedge conclusion is fully valid."]];
  clientSheet.getRange("B27:B35").values = [["Identified Residual Risk"], ["Preliminary Conclusion"], ["Candidate Instrument (if any)"], ["Preliminary Size"], ["Cost / Liquidity / Trade-Offs"], ["Residual / Basis / Execution Risk"], ["Adjustment / Removal Condition"], ["Owner / Peer Review"], ["Source & As-of Date"]];
  clientSheet.getRange("J27:J35").values = Array.from({ length: 9 }, () => [null]);
  clientSheet.getRange("B37").values = [["    Optional Alternative Considered (concise; complete only if it informed the hedge / no-hedge conclusion)"]];
  clientSheet.getRange("A42").values = [["  SECTION 3 — CANDIDATE NOTES (NOT FINAL SCORECARDS)"]];
  clientSheet.getRange("A43").values = [["Use a brief candidate note only when it materially supports a final Select or Reject decision. Do not complete one block for every screened name. FINAL SCORECARDS and the Analyst Decision Log are the authoritative final records."]];
  for (const [row, noteNumber] of [[44, 1], [53, 2], [62, 3], [71, 4], [80, 5]]) {
    clientSheet.getRange(`A${row}`).values = [[`  Candidate Note #${noteNumber}`]];
  }
  clientSheet.getRange("A89").values = [["  ▲ Do not add a note block unless it materially supports a final Select or Reject decision. Full analysis is not required for every screened candidate."]];
}

const researchGuide = workbook.worksheets.getOrAdd("RESEARCH GUIDE");
researchGuide.getRange("A1:F42").clear({ applyTo: "all" });
researchGuide.showGridLines = false;
researchGuide.mergeCells("A1:F1");
researchGuide.getRange("A1").values = [["BUS331 - How to Research an Investment Candidate"]];
researchGuide.getRange("A1:F1").format = { fill: "#0B1F35", font: { bold: true, color: "#FFFFFF", size: 18 }, verticalAlignment: "center" };
researchGuide.getRange("A1:F1").format.rowHeight = 34;
researchGuide.mergeCells("A2:F2");
researchGuide.getRange("A2").values = [["Use this guide before completing the client tabs, Issuer Reality Check, and FactSet Research and Evidence Log. It tells you what to investigate; your committee supplies the research, calculations, judgment, and select/reject decision."]];
researchGuide.getRange("A2:F2").format = { fill: "#E9EFF4", font: { bold: true, color: "#102238" }, wrapText: true, verticalAlignment: "center" };
researchGuide.getRange("A2:F2").format.rowHeight = 42;

const guideRows = [
  ["1. Translate the mandate", "Turn the approved allocation and client guardrails into a focused candidate set. Funds and ETFs are primary; individual securities are limited, and individual bonds are not required."],
  ["2. Apply inclusion boundaries", "Keep only candidates with a distinct portfolio purpose, appropriate liquidity, client-mandate fit, and no unnecessary duplicate exposure or concentration."],
  ["3. Score final holdings", "Complete the concise scorecard for each final holding: exposure/role, cost and trading expenses, liquidity, holdings/sector/style overlap, diversification contribution, key risks, and fit."],
  ["4. Reject alternatives concisely", "Compare the strongest realistic alternative and record why it lost. Do not complete a full scorecard for every screened name."],
  ["5. Integrate and test", "The Portfolio Manager resolves overlap, concentration, final selection, weights, and trade-offs. The Risk and Derivatives Analyst tests residual risk and documents one targeted hedge or a supported no-hedge conclusion."]
];
researchGuide.getRange("A4:B8").values = guideRows;
researchGuide.getRange("A4:A8").format = { fill: "#1F7A78", font: { bold: true, color: "#FFFFFF" }, wrapText: true, verticalAlignment: "top" };
researchGuide.getRange("B4:B8").format = { fill: "#F2F6FA", font: { color: "#102238" }, wrapText: true, verticalAlignment: "top" };
researchGuide.getRange("A4:B8").format.rowHeight = 58;

const instrumentRows = [
  ["Fixed-income fund/ETF", "Income, yield, duration, credit quality, rate and spread risk, holdings, costs, liquidity, overlap, taxes, client fit, and source/as-of date.", "Fixed-Income Analyst owns the recommendation, alternative rejected, and trade-off. A direct bond may be used but is not required."],
  ["Equity fund/ETF", "Exposure, benchmark/style/sector, holdings, concentration and overlap, costs and trading expenses, liquidity, diversification, taxes, client fit, and source/as-of date.", "Equity Analyst owns the recommendation, alternative rejected, and trade-off."],
  ["Limited individual equity", "Distinct purpose versus a fund/ETF, business and return drivers, liquidity, key risks, client fit, idiosyncratic risk, position-size rationale, concentration limit, and source/as-of date.", "Complete the scorecard, Issuer Reality Check, and Evidence Log. Individual securities total no more than two or three per portfolio."],
  ["Derivative hedge (optional)", "Identified residual risk, instrument, size, cost, liquidity, trade-offs, basis/execution risk, residual risk, and adjustment/removal condition.", "Risk and Derivatives Analyst may propose at most one targeted hedge. A supported no-hedge conclusion is equally complete."]
];
researchGuide.getRange("A11:C11").values = [["Instrument", "Research before you decide", "What you must complete in this workbook"]];
researchGuide.getRange("A11:C11").format = { fill: "#122B49", font: { bold: true, color: "#FFFFFF" }, wrapText: true, horizontalAlignment: "center", verticalAlignment: "center" };
researchGuide.getRange("A12:C15").values = instrumentRows;
researchGuide.getRange("A12:C15").format = { fill: "#FFF9D9", font: { color: "#0000FF" }, wrapText: true, verticalAlignment: "top", borders: { preset: "inside", style: "thin", color: "#D9E2EA" } };
researchGuide.getRange("A12:C15").format.rowHeight = 104;
researchGuide.getRange("A4:A15").format.columnWidth = 24;
researchGuide.getRange("B4:B15").format.columnWidth = 62;
researchGuide.getRange("C4:C15").format.columnWidth = 62;
researchGuide.mergeCells("A18:C18");
researchGuide.getRange("A18").values = [["FINAL CANDIDATE CHECK - before the team selects or rejects"]];
researchGuide.getRange("A18:C18").format = { fill: "#D4A052", font: { bold: true, color: "#071626" }, horizontalAlignment: "center" };
researchGuide.unmergeCells("A19:C26");
researchGuide.getRange("A19:A26").values = [["[ ] Approved allocation sleeve and Phase 1 guardrail identified"],["[ ] Distinct portfolio purpose and mandate fit stated"],["[ ] Cost/trading expenses and liquidity assessed"],["[ ] Holdings, sector, and style overlap assessed"],["[ ] Diversification contribution and key risks assessed"],["[ ] Individual-security rationale, idiosyncratic risk, and size added if applicable"],["[ ] Alternative rejected and key trade-off recorded"],["[ ] Final Select or Reject conclusion and monitoring trigger entered"]];
for (let row = 19; row <= 26; row += 1) researchGuide.mergeCells(`A${row}:C${row}`);
researchGuide.getRange("A19:C26").format = { fill: "#F2F6FA", font: { color: "#102238" }, wrapText: true, verticalAlignment: "top" };
researchGuide.getRange("A19:A26").format.rowHeight = 24;
researchGuide.freezePanes.freezeRows(3);

const scorecardSheet = workbook.worksheets.getOrAdd("FINAL SCORECARDS");
scorecardSheet.getRange("A1:R40").clear({ applyTo: "all" });
scorecardSheet.showGridLines = false;
scorecardSheet.mergeCells("A1:R1");
scorecardSheet.getRange("A1").values = [["BUS331 — Final Holding Scorecards"]];
scorecardSheet.getRange("A1:R1").format = { fill: "#0B1F35", font: { bold: true, color: "#FFFFFF", size: 18 }, verticalAlignment: "center" };
scorecardSheet.getRange("A1:R1").format.rowHeight = 34;
scorecardSheet.mergeCells("A2:R2");
scorecardSheet.getRange("A2").values = [["Complete 8–10 final holdings per client and never more than 10. Eight is complete. Funds and ETFs are primary; individual securities total no more than two or three. Do not fill a slot without a distinct purpose."]];
scorecardSheet.getRange("A2:R2").format = { fill: "#D4A052", font: { bold: true, color: "#071626" }, wrapText: true, verticalAlignment: "center" };
scorecardSheet.getRange("A2:R2").format.rowHeight = 42;
const scorecardHeaders = [["Client", "Slot", "Final Holding", "Type", "Role Owner", "Portfolio Purpose / Exposure", "Weight", "Cost & Trading Expenses", "Liquidity", "Holdings / Sector / Style Overlap", "Diversification Contribution", "Key Risks", "Client-Mandate Fit", "Individual-Security Rationale / Idiosyncratic Risk / Position Size", "Alternative Rejected", "Why Rejected", "Key Trade-Off", "Source & As-of Date"]];
scorecardSheet.getRange("A5:R5").values = scorecardHeaders;
scorecardSheet.getRange("A5:R5").format = { fill: "#122B49", font: { bold: true, color: "#FFFFFF", size: 9 }, wrapText: true, horizontalAlignment: "center", verticalAlignment: "center" };
scorecardSheet.getRange("A5:R5").format.rowHeight = 64;
const scorecardRows = [];
for (let client = 1; client <= model.project.clientCount; client += 1) {
  for (let slot = 1; slot <= 10; slot += 1) scorecardRows.push([`Client ${client}`, slot, ...Array(16).fill(null)]);
}
scorecardSheet.getRange("A6:R35").values = scorecardRows;
scorecardSheet.getRange("A6:R35").format = { fill: "#FFF9D9", font: { color: "#0000FF", size: 9 }, wrapText: true, verticalAlignment: "top", borders: { preset: "inside", style: "thin", color: "#D9E2EA" } };
scorecardSheet.getRange("A6:B35").format = { fill: "#F2F6FA", font: { bold: true, color: "#102238" }, verticalAlignment: "center" };
scorecardSheet.getRange("A6:R35").format.rowHeight = 70;
scorecardSheet.getRange("G6:G35").format.numberFormat = "0.0%";
scorecardSheet.getRange("D6:D35").dataValidation = { rule: { type: "list", values: ["Fixed-income fund/ETF", "Equity fund/ETF", "Individual equity", "Other fund/ETF"] } };
scorecardSheet.getRange("E6:E35").dataValidation = { rule: { type: "list", values: model.roles.map((role) => role.title) } };
const scorecardWidths = [14, 8, 19, 20, 22, 25, 11, 22, 18, 28, 24, 26, 25, 34, 20, 25, 23, 24];
scorecardWidths.forEach((width, index) => scorecardSheet.getRangeByIndexes(0, index, 35, 1).format.columnWidth = width);
scorecardSheet.freezePanes.freezeRows(5);
scorecardSheet.freezePanes.freezeColumns(3);

const riskSheet = workbook.worksheets.getOrAdd("RISK & HEDGE");
riskSheet.getRange("A1:I18").clear({ applyTo: "all" });
riskSheet.showGridLines = false;
riskSheet.mergeCells("A1:I1");
riskSheet.getRange("A1").values = [["BUS331 — Residual Risk and Hedge / No-Hedge Decision"]];
riskSheet.getRange("A1:I1").format = { fill: "#0B1F35", font: { bold: true, color: "#FFFFFF", size: 18 }, verticalAlignment: "center" };
riskSheet.getRange("A1:I1").format.rowHeight = 34;
riskSheet.mergeCells("A2:I2");
riskSheet.getRange("A2").values = [[model.phase2Experience.derivativeHedge.decisionRule]];
riskSheet.getRange("A2:I2").format = { fill: "#D4A052", font: { bold: true, color: "#071626" }, wrapText: true, verticalAlignment: "center" };
riskSheet.getRange("A2:I2").format.rowHeight = 48;
riskSheet.mergeCells("A3:I3");
riskSheet.getRange("A3").values = [[model.phase2Experience.derivativeHedge.noHedgeStandard]];
riskSheet.getRange("A3:I3").format = { fill: "#EEF7F6", font: { bold: true, color: "#143B45" }, wrapText: true, verticalAlignment: "center" };
riskSheet.getRange("A3:I3").format.rowHeight = 52;
riskSheet.getRange("A6:I6").values = [["Client", "Conclusion", "Residual Risk & Stress Evidence", "Instrument & Targeting Rationale", "Size & Sizing Rationale", "Cost / Liquidity / Trade-Offs", "Residual / Basis / Execution Risk", "Adjustment / Removal Condition", "Owner / Peer Review"]];
riskSheet.getRange("A6:I6").format = { fill: "#122B49", font: { bold: true, color: "#FFFFFF", size: 9 }, wrapText: true, horizontalAlignment: "center", verticalAlignment: "center" };
riskSheet.getRange("A6:I6").format.rowHeight = 62;
riskSheet.getRange("A7:I9").values = [["Client 1", "", "", "", "", "", "", "", ""], ["Client 2", "", "", "", "", "", "", "", ""], ["Client 3", "", "", "", "", "", "", "", ""]];
riskSheet.getRange("A7:I9").format = { fill: "#FFF9D9", font: { color: "#0000FF", size: 10 }, wrapText: true, verticalAlignment: "top", borders: { preset: "inside", style: "thin", color: "#D9E2EA" } };
riskSheet.getRange("A7:A9").format = { fill: "#F2F6FA", font: { bold: true, color: "#102238" } };
riskSheet.getRange("A7:I9").format.rowHeight = 90;
riskSheet.getRange("B7:B9").dataValidation = { rule: { type: "list", values: ["No hedge", "One targeted hedge"] } };
const riskWidths = [14, 18, 30, 30, 24, 30, 30, 28, 24];
riskWidths.forEach((width, index) => riskSheet.getRangeByIndexes(0, index, 9, 1).format.columnWidth = width);
riskSheet.freezePanes.freezeRows(6);

issuerSheet.mergeCells("A1:W1");
issuerSheet.getRange("A1").values = [["BUS 331 — Issuer Reality Check"]];
issuerSheet.getRange("A1:W1").format = {
  fill: "#0B1F35",
  font: { bold: true, color: "#FFFFFF", size: 18 },
  verticalAlignment: "center"
};
issuerSheet.getRange("A1:W1").format.rowHeight = 34;

issuerSheet.mergeCells("A2:W2");
issuerSheet.getRange("A2").values = [["Required inside Security Analysis and Selection — not a separate accounting unit"]];
issuerSheet.getRange("A2:W2").format = {
  fill: "#D4A052",
  font: { bold: true, color: "#071626" },
  verticalAlignment: "center"
};

issuerSheet.mergeCells("A4:W4");
issuerSheet.getRange("A4").values = [["DECISION RULE — Yield or recent return alone cannot support a recommendation. Evidence the issuer's financial health, operating outlook, and relevance to the client's mandate."]];
issuerSheet.getRange("A4:W4").format = {
  fill: "#F8E8E2",
  font: { bold: true, color: "#7B2F22" },
  wrapText: true,
  verticalAlignment: "center"
};
issuerSheet.getRange("A4:W4").format.rowHeight = 40;

issuerSheet.mergeCells("A5:W5");
issuerSheet.getRange("A5").values = [["APPLIES TO — Every direct individual security. For a selected fund or ETF, complete look-through issuer analysis only when one holding is material to the exposure, concentration, or risk conclusion; do not duplicate the final-holding scorecard."]];
issuerSheet.getRange("A5:W5").format = {
  fill: "#EEF7F6",
  font: { bold: true, color: "#143B45" },
  wrapText: true,
  verticalAlignment: "center"
};
issuerSheet.getRange("A5:W5").format.rowHeight = 34;

issuerSheet.mergeCells("A7:W7");
issuerSheet.getRange("A7").values = [["ROLE HANDOFF — Fixed-Income: duration/credit/income  |  Equity: equity funds/ETFs and limited individual equities  |  Client & Macro: mandate/scenario fit  |  Portfolio Manager: final selection/weights/trade-offs  |  Risk & Derivatives: stress and residual risk"]];
issuerSheet.getRange("A7:W7").format = {
  fill: "#E9EFF4",
  font: { bold: true, color: "#102238" },
  wrapText: true,
  verticalAlignment: "center"
};
issuerSheet.getRange("A7:W7").format.rowHeight = 38;

for (const [range, label, fill] of [
  ["A9:H9", "EXPOSURE & EVIDENCE", "#1B3B60"],
  ["I9:Q9", "ISSUER HEALTH & OUTLOOK", "#2F7E7B"],
  ["R9:U9", "RISK, CLIENT FIT & ALLOCATION", "#A4523A"],
  ["V9:W9", "REVIEW", "#566F86"]
]) {
  issuerSheet.mergeCells(range);
  issuerSheet.getRange(range.split(":")[0]).values = [[label]];
  issuerSheet.getRange(range).format = {
    fill,
    font: { bold: true, color: "#FFFFFF", size: 10 },
    horizontalAlignment: "center",
    verticalAlignment: "center"
  };
}

const headers = [[
  "Client",
  "Exposure Type",
  "Security / Fund",
  "Issuer / Look-Through Holding",
  "Portfolio Weight",
  "Primary Owner",
  "Source / URL",
  "As-of Date",
  "Business Model",
  "Revenue Drivers",
  "Industry / Macro Sensitivity",
  "Revenue Trend",
  "Margin Trend",
  "Cash-Flow Trend",
  "Liquidity",
  "Leverage",
  "Interest Coverage / Debt Maturities (if relevant)",
  "Issuer-Specific Risk",
  "Client-Fit Conclusion",
  "Allocation Implication",
  "Monitoring Trigger",
  "Peer Reviewer",
  "Status"
]];
issuerSheet.getRange("A10:W10").values = headers;
issuerSheet.getRange("A10:W10").format = {
  fill: "#122B49",
  font: { bold: true, color: "#FFFFFF", size: 10 },
  wrapText: true,
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "inside", style: "thin", color: "#6F8FAB" }
};
issuerSheet.getRange("A10:W10").format.rowHeight = 58;

const blankRows = Array.from({ length: 12 }, () => Array(23).fill(null));
issuerSheet.getRange("A11:W22").values = blankRows;
issuerSheet.getRange("A11:W22").format = {
  fill: "#FFF9D9",
  font: { color: "#0000FF", size: 10 },
  wrapText: true,
  verticalAlignment: "top",
  borders: {
    insideHorizontal: { style: "thin", color: "#D9E2EA" },
    insideVertical: { style: "thin", color: "#E6EDF2" },
    bottom: { style: "thin", color: "#9BAFC0" }
  }
};
issuerSheet.getRange("A11:H22").format.fill = "#F2F6FA";
issuerSheet.getRange("V11:W22").format.fill = "#EEF1F4";
issuerSheet.getRange("A11:W22").format.rowHeight = 64;
issuerSheet.getRange("E11:E22").format.numberFormat = "0.0%";
issuerSheet.getRange("H11:H22").format.numberFormat = "yyyy-mm-dd";
issuerSheet.getRange("B11:B22").dataValidation = { rule: { type: "list", values: ["Direct bond", "Direct equity", "Fund/ETF look-through"] } };
issuerSheet.getRange("F11:F22").dataValidation = { rule: { type: "list", values: model.roles.map((role) => role.title) } };
issuerSheet.getRange("W11:W22").dataValidation = { rule: { type: "list", values: ["Not started", "Ready for peer review", "Complete", "Revise"] } };

issuerSheet.mergeCells("A24:W24");
issuerSheet.getRange("A24").values = [["COMPLETION STANDARD — Concise and cited. Show consistent financial periods, label missing information, and end with a client-fit and allocation conclusion. A second team member reviews each row before committee approval."]];
issuerSheet.getRange("A24:W24").format = {
  fill: "#FFF5DE",
  font: { bold: true, color: "#5B4314" },
  wrapText: true,
  verticalAlignment: "center"
};
issuerSheet.getRange("A24:W24").format.rowHeight = 40;

const widths = [16, 18, 18, 24, 14, 24, 28, 13, 24, 24, 26, 18, 18, 20, 18, 18, 28, 24, 26, 22, 22, 20, 17];
widths.forEach((width, index) => {
  issuerSheet.getRangeByIndexes(0, index, 24, 1).format.columnWidth = width;
});
issuerSheet.freezePanes.freezeRows(10);
issuerSheet.freezePanes.freezeColumns(4);

const evidenceSheet = workbook.worksheets.getOrAdd("EVIDENCE LOG");
evidenceSheet.getRange("A1:Q30").clear({ applyTo: "all" });
evidenceSheet.showGridLines = false;
evidenceSheet.mergeCells("A1:Q1");
evidenceSheet.getRange("A1").values = [["BUS 331 — FactSet Research and Evidence Log"]];
evidenceSheet.getRange("A1:Q1").format = {
  fill: "#0B1F35",
  font: { bold: true, color: "#FFFFFF", size: 18 },
  verticalAlignment: "center"
};
evidenceSheet.getRange("A1:Q1").format.rowHeight = 34;
evidenceSheet.mergeCells("A2:Q2");
evidenceSheet.getRange("A2").values = [["Required licensed-source record — document the retrieval, interpret the evidence, and explain its effect on the recommendation"]];
evidenceSheet.getRange("A2:Q2").format = {
  fill: "#D4A052",
  font: { bold: true, color: "#071626" },
  verticalAlignment: "center"
};
evidenceSheet.mergeCells("A4:Q4");
evidenceSheet.getRange("A4").values = [["BOUNDARY — Use licensed FactSet access for course research. Submit final work and required licensed-source evidence privately through Canvas. Do not place FactSet captures, exports, credentials, completed proprietary data files, or student work in the public repository."]];
evidenceSheet.getRange("A4:Q4").format = {
  fill: "#F8E8E2",
  font: { bold: true, color: "#7B2F22" },
  wrapText: true,
  verticalAlignment: "center"
};
evidenceSheet.getRange("A4:Q4").format.rowHeight = 42;
evidenceSheet.mergeCells("A5:Q5");
evidenceSheet.getRange("A5").values = [["NAVIGATION NOTE — FactSet layouts, labels, and entitlements can differ. Follow course demonstrations and current FactSet support; this log defines evidence requirements, not a click path."]];
evidenceSheet.getRange("A5:Q5").format = {
  fill: "#EEF7F6",
  font: { bold: true, color: "#143B45" },
  wrapText: true,
  verticalAlignment: "center"
};
evidenceSheet.getRange("A5:Q5").format.rowHeight = 36;

const evidenceHeaders = [[
  "Client",
  "Workstream",
  "Security / Issuer / Fund / Benchmark / Input",
  "Research Question or Claim Tested",
  "FactSet Data / Research Retrieved",
  "Relevant Metrics & Units",
  "Entity / Security Identifier",
  "Source / Screen / Document Reference",
  "Data As-of Period",
  "Retrieval Date",
  "Interpretation & Limitations",
  "Result",
  "Effect on Recommendation / Portfolio Input",
  "Canvas Submission Item / Evidence-File Reference",
  "Analyst Owner",
  "Peer Reviewer",
  "Status"
]];
evidenceSheet.getRange("A8:Q8").values = evidenceHeaders;
evidenceSheet.getRange("A8:Q8").format = {
  fill: "#122B49",
  font: { bold: true, color: "#FFFFFF", size: 10 },
  wrapText: true,
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "inside", style: "thin", color: "#6F8FAB" }
};
evidenceSheet.getRange("A8:Q8").format.rowHeight = 60;
evidenceSheet.getRange("A9:Q24").values = Array.from({ length: 16 }, () => Array(17).fill(null));
evidenceSheet.getRange("A9:Q24").format = {
  fill: "#FFF9D9",
  font: { color: "#0000FF", size: 10 },
  wrapText: true,
  verticalAlignment: "top",
  borders: {
    insideHorizontal: { style: "thin", color: "#D9E2EA" },
    insideVertical: { style: "thin", color: "#E6EDF2" },
    bottom: { style: "thin", color: "#9BAFC0" }
  }
};
evidenceSheet.getRange("A9:Q24").format.rowHeight = 64;
evidenceSheet.getRange("A9:D24").format.fill = "#F2F6FA";
evidenceSheet.getRange("O9:Q24").format.fill = "#EEF1F4";
evidenceSheet.getRange("I9:J24").format.numberFormat = "yyyy-mm-dd";
evidenceSheet.getRange("B9:B24").dataValidation = { rule: { type: "list", values: ["Issuer Reality Check", "Credit / fixed income", "Equity fund / ETF", "Individual equity", "Portfolio integration", "Portfolio risk / hedge input"] } };
evidenceSheet.getRange("L9:L24").dataValidation = { rule: { type: "list", values: ["Confirmed", "Qualified", "Contradicted", "Changed", "Not verifiable"] } };
evidenceSheet.getRange("Q9:Q24").dataValidation = { rule: { type: "list", values: ["Not started", "Ready for peer review", "Complete", "Revise"] } };
const evidenceWidths = [16, 20, 26, 28, 28, 22, 20, 27, 16, 15, 30, 16, 30, 28, 22, 20, 17];
evidenceWidths.forEach((width, index) => {
  evidenceSheet.getRangeByIndexes(0, index, 24, 1).format.columnWidth = width;
});
evidenceSheet.freezePanes.freezeRows(8);
evidenceSheet.freezePanes.freezeColumns(4);

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "formula error scan after Issuer Reality Check update"
});
console.log(formulaErrors.ndjson);

await renderSheets("after", [...sheetNames, "ISSUER CHECK", "EVIDENCE LOG"]);
const issuerInspection = await workbook.inspect({ kind: "table", range: "ISSUER CHECK!A1:W24", include: "values,formulas", tableMaxRows: 24, tableMaxCols: 23 });
console.log(issuerInspection.ndjson);
const evidenceInspection = await workbook.inspect({ kind: "table", range: "EVIDENCE LOG!A1:Q24", include: "values,formulas", tableMaxRows: 24, tableMaxCols: 17 });
console.log(evidenceInspection.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputRoot, "BUS331_InvProject_SecuritySelection_Template.xlsx");
await output.save(outputPath);

// artifact-tool preserves unreferenced shared-string entries from the source
// workbook. Remove two retired instructions so an OOXML-level public-boundary
// scan cannot recover obsolete minimum-holding or mandatory-hedge language.
const archive = await JSZip.loadAsync(await fs.readFile(outputPath));
const sharedStringsPart = archive.file("xl/sharedStrings.xml");
if (sharedStringsPart) {
  const sharedStrings = await sharedStringsPart.async("string");
  const sanitizedSharedStrings = sharedStrings
    .replaceAll("Enter at least 10 securities per client", "Enter candidate securities for each client")
    .replaceAll("Every client needs at least one derivative hedge", "A derivative hedge is optional and must address an identified residual risk");
  archive.file("xl/sharedStrings.xml", sanitizedSharedStrings);
}

// The legacy source carried one empty white text box over each Client sheet,
// obscuring the cells in Excel and PDF renders. Remove only those three shape
// drawings; retain the separate VML drawing relationships used for comments.
for (let sheetNumber = 3; sheetNumber <= 5; sheetNumber += 1) {
  const sheetPartName = `xl/worksheets/sheet${sheetNumber}.xml`;
  const relationshipPartName = `xl/worksheets/_rels/sheet${sheetNumber}.xml.rels`;
  const drawingPartName = `xl/drawings/drawing${sheetNumber - 2}.xml`;
  const sheetPart = archive.file(sheetPartName);
  const relationshipPart = archive.file(relationshipPartName);
  if (sheetPart) {
    const sheetXml = await sheetPart.async("string");
    archive.file(sheetPartName, sheetXml.replace(/<x:drawing\b[^>]*\/>/g, ""));
  }
  if (relationshipPart) {
    const relationshipXml = await relationshipPart.async("string");
    archive.file(relationshipPartName, relationshipXml.replace(/<Relationship\b(?=[^>]*\/relationships\/drawing\b)[^>]*\/>/g, ""));
  }
  archive.remove(drawingPartName);
}
const contentTypesPart = archive.file("[Content_Types].xml");
if (contentTypesPart) {
  let contentTypesXml = await contentTypesPart.async("string");
  for (let drawingNumber = 1; drawingNumber <= 3; drawingNumber += 1) {
    contentTypesXml = contentTypesXml.replace(new RegExp(`<Override\\b(?=[^>]*PartName="/xl/drawings/drawing${drawingNumber}\\.xml")[^>]*/>`, "g"), "");
  }
  archive.file("[Content_Types].xml", contentTypesXml);
}

// artifact-tool assigns random relationship IDs and current ZIP timestamps.
// Canonicalize both so identical maintained inputs produce byte-identical XLSX
// deliverables, which makes release checks and review diffs meaningful.
const relationshipParts = Object.keys(archive.files)
  .filter((name) => name.endsWith(".rels"))
  .sort();
for (const relationshipPartName of relationshipParts) {
  const relationshipPart = archive.file(relationshipPartName);
  if (!relationshipPart) continue;
  let relationshipXml = await relationshipPart.async("string");
  const relationships = [...relationshipXml.matchAll(/<Relationship\b[^>]*\bId="([^"]+)"[^>]*\/>/g)]
    .map((match) => ({
      oldId: match[1],
      target: match[0].match(/\bTarget="([^"]*)"/)?.[1] || "",
      type: match[0].match(/\bType="([^"]*)"/)?.[1] || "",
      targetMode: match[0].match(/\bTargetMode="([^"]*)"/)?.[1] || ""
    }))
    .sort((a, b) => `${a.type}|${a.target}|${a.targetMode}`.localeCompare(`${b.type}|${b.target}|${b.targetMode}`));
  const idMap = new Map(relationships.map((relationship, index) => [relationship.oldId, `rId${index + 1}`]));
  for (const [oldId, newId] of idMap) relationshipXml = relationshipXml.replaceAll(oldId, newId);
  archive.file(relationshipPartName, relationshipXml);

  const relationshipDirectory = path.posix.dirname(relationshipPartName);
  if (relationshipDirectory !== "_rels") {
    const ownerDirectory = path.posix.dirname(relationshipDirectory);
    const ownerName = path.posix.basename(relationshipPartName, ".rels");
    const ownerPartName = path.posix.join(ownerDirectory, ownerName);
    const ownerPart = archive.file(ownerPartName);
    if (ownerPart) {
      let ownerXml = await ownerPart.async("string");
      for (const [oldId, newId] of idMap) ownerXml = ownerXml.replaceAll(oldId, newId);
      archive.file(ownerPartName, ownerXml);
    }
  }
}

const stableZipDate = new Date("2000-01-01T00:00:00Z");
for (const zipEntry of Object.values(archive.files)) zipEntry.date = stableZipDate;
await fs.writeFile(outputPath, await archive.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
console.log(`Exported updated workbook to ${outputPath}.`);
