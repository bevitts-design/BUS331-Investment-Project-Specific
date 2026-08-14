import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const workbookPath = path.join(rootDir, "files", "BUS331_InvProject_SecuritySelection_Template.xlsx");
const outputRoot = process.env.BUS331_WORKBOOK_OUTPUT || path.join(rootDir, "outputs", "security-selection-update");
const inspectOnly = process.argv.includes("--inspect");
const sheetNames = ["START HERE", "SUMMARY", "Client 1", "Client 2", "Client 3", "RESEARCH GUIDE"];

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
startSheet.getRange("B6").values = [["This workbook has seven tabs: START HERE, SUMMARY, Client 1, Client 2, Client 3, ISSUER CHECK, and EVIDENCE LOG. Complete one client tab per assigned client, the required Issuer Reality Check rows, and one FactSet retrieval record for each recommendation and material portfolio-risk input."]];
startSheet.getRange("B8").values = [["  Before You Start — Complete Phase 1 First"]];
startSheet.getRange("B9").values = [["Your Phase 1 market view, client IPS, unresolved information gaps, and downstream guardrails must be approved before security research begins. Every candidate and Issuer Reality Check must trace to that mandate; the macro filter on each client tab must pass before selection."]];
startSheet.getRange("B24").values = [["Reviewers will check: (1) weights sum to 100%, (2) macro filters pass, (3) each selected security has a completed thesis and candidate comparison, (4) every required direct or look-through exposure has an Issuer Reality Check, (5) yield or recent return is not the sole rationale, (6) sources and as-of dates are complete, and (7) the final mix satisfies the IPS and bear-case tripwire."]];
startSheet.getRange("B37").copyTo(startSheet.getRange("B38"), "all");
startSheet.getRange("B37").copyTo(startSheet.getRange("B39"), "all");
startSheet.getRange("B38").values = [["☐  Issuer Reality Check completed for each required direct and look-through exposure"]];
startSheet.getRange("B39").values = [["☐  No recommendation relies on yield or recent return without evidenced issuer health and outlook"]];
startSheet.getRange("B37").copyTo(startSheet.getRange("B40"), "all");
startSheet.getRange("B37").copyTo(startSheet.getRange("B41"), "all");
startSheet.getRange("B40").values = [["☐  FactSet retrieval record completed for each recommendation and material portfolio-risk input"]];
startSheet.getRange("B41").values = [["☐  Final work and required licensed-source evidence prepared for private Canvas submission; nothing placed in the public repository"]];
startSheet.getRange("B38:B41").format.rowHeight = 60;
startSheet.getRange("A1:K42").format.wrapText = true;

const summarySheet = workbook.worksheets.getItem("SUMMARY");
summarySheet.getRange("A2").values = [["Phase 2 Security Selection Summary — All Clients"]];
for (const clientNumber of [1, 2, 3]) {
  const clientSheet = workbook.worksheets.getItem(`Client ${clientNumber}`);
  clientSheet.getRange("A2").values = [[`Phase 2 — Security Analysis & Selection  |  Client ${clientNumber}`]];
  clientSheet.getRange("A3").values = [["BUS 331 Investments  |  Endicott College  |  Phase 2: Security Analysis & Selection"]];
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
  ["1. Start with the mandate", "Before researching any product, record the client need, Phase 1 guardrail, unresolved question, and portfolio job the candidate would serve. Do not choose a security first and build a rationale afterward."],
  ["2. Use comparable evidence", "For every serious candidate, record the source, retrieval date, as-of date, metric definition and units, your interpretation, and the effect on the recommendation. Keep periods and units comparable."],
  ["3. Research the instrument that you actually own", "Use the appropriate section below. A fund or ETF needs product-level due diligence and a look-through review of material holdings; a direct bond or equity needs issuer-level research."],
  ["4. Make and challenge a provisional judgment", "State Select, Modify, or Reject before asking AI for a counterargument. Verify all material factual or numerical claims with approved evidence. AI is not a source and does not choose the investment."],
  ["5. Finish the portfolio test", "A candidate is not approved until the committee can explain client fit, diversification or overlap, costs, liquidity, bear-case sensitivity, monitoring trigger, and its effect on the integrated portfolio."]
];
researchGuide.getRange("A4:B8").values = guideRows;
researchGuide.getRange("A4:A8").format = { fill: "#1F7A78", font: { bold: true, color: "#FFFFFF" }, wrapText: true, verticalAlignment: "top" };
researchGuide.getRange("B4:B8").format = { fill: "#F2F6FA", font: { color: "#102238" }, wrapText: true, verticalAlignment: "top" };
researchGuide.getRange("A4:B8").format.rowHeight = 58;

const instrumentRows = [
  ["Direct bond", "Issuer, seniority, coupon, maturity, call or structural features, price and yield measure, duration, credit quality, spread/default/downgrade risk, liquidity, taxes, cash-flow fit, and source/as-of date.", "Complete the client tab, Issuer Reality Check, and Evidence Log. State the income, capital-preservation, rate-risk, and credit-risk trade-off."],
  ["Direct equity", "Business model, revenue drivers, industry and macro sensitivity, revenue/margin/cash-flow trend, liquidity and leverage, key risks, valuation or return drivers, concentration, and source/as-of date.", "Complete the client tab, Issuer Reality Check, and Evidence Log. State the portfolio role, bear-case sensitivity, diversification effect, and monitoring trigger."],
  ["Mutual fund", "Objective, benchmark/style, holdings, manager/process where relevant, expense ratio, performance context, distributions/taxes, liquidity, active/passive fit, overlap, and the most material relevant holding.", "Complete the client tab, Fund/ETF candidate comparison, required look-through Issuer Reality Check, and Evidence Log. State why the vehicle improves implementation versus alternatives."],
  ["ETF", "Objective, benchmark/index methodology, holdings, expense ratio, tracking difference or risk, bid-ask spread/liquidity, tax efficiency, concentration/overlap, and the most material relevant holding.", "Complete the client tab, Fund/ETF candidate comparison, required look-through Issuer Reality Check, and Evidence Log. State why the ETF fits the mandate, cost, liquidity, and diversification needs."]
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
researchGuide.getRange("A19:A26").values = [["[ ] Client need and Phase 1 guardrail identified"],["[ ] Comparable source, retrieval date, and as-of date recorded"],["[ ] Instrument-specific research complete"],["[ ] Issuer or material holding reviewed where required"],["[ ] Costs, liquidity, taxes, diversification, and overlap considered"],["[ ] Base and bear-case implications explained"],["[ ] AI challenge verified by human evidence"],["[ ] Select, Modify, or Reject conclusion and monitoring trigger entered"]];
researchGuide.getRange("A19:C26").merge();
researchGuide.getRange("A19:C26").format = { fill: "#F2F6FA", font: { color: "#102238" }, wrapText: true, verticalAlignment: "top" };
researchGuide.getRange("A19:A26").format.rowHeight = 24;
researchGuide.freezePanes.freezeRows(3);

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
issuerSheet.getRange("A5").values = [["APPLIES TO — Every direct bond or equity exposure, plus the most material relevant issuer or holding within each selected mutual fund or ETF."]];
issuerSheet.getRange("A5:W5").format = {
  fill: "#EEF7F6",
  font: { bold: true, color: "#143B45" },
  wrapText: true,
  verticalAlignment: "center"
};
issuerSheet.getRange("A5:W5").format.rowHeight = 34;

issuerSheet.mergeCells("A7:W7");
issuerSheet.getRange("A7").values = [["ROLE HANDOFF — Fixed-Income: credit review  |  Fund & ETF: look-through holdings/concentration  |  Client & Macro: scenario impact  |  Portfolio & Risk: allocation, diversification, stress, and monitoring"]];
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
issuerSheet.getRange("F11:F22").dataValidation = { rule: { type: "list", values: ["Fixed-Income Analyst", "Fund and ETF Analyst", "Client and Macro Strategist", "Portfolio Manager and Risk Analyst"] } };
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
evidenceSheet.getRange("B9:B24").dataValidation = { rule: { type: "list", values: ["Issuer Reality Check", "Credit / fixed income", "Mutual fund / ETF", "Corporate issuer", "Portfolio risk input"] } };
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
console.log(`Exported updated workbook to ${outputPath}.`);
