import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const targetRoot = process.argv[2];
if (!targetRoot) throw new Error("Usage: node build-decision-record.mjs <target-repository-root>");

const model = JSON.parse(await fs.readFile(path.join(targetRoot, "project-model.json"), "utf8"));
const outputPath = path.join(targetRoot, "files", "BUS331_Investment_Committee_Decision_Record_Student.xlsx");
const previewDir = path.join(path.dirname(new URL(import.meta.url).pathname), "previews");

const COLORS = {
  navy: "#0B1F35",
  navy2: "#122B49",
  gold: "#D4A052",
  goldLight: "#FFF4DE",
  teal: "#2F9E9B",
  steel: "#6F8FAB",
  terra: "#C96F4F",
  white: "#FFFFFF",
  ink: "#102238",
  slate: "#4B6073",
  mist: "#E9EFF4",
  inputBlue: "#0000FF",
  green: "#DDF4E8",
  greenText: "#17623E",
  yellow: "#FFF1C7",
  yellowText: "#7A5600",
  red: "#FBE3DF",
  redText: "#8A3027"
};

const workbook = Workbook.create();
const start = workbook.worksheets.add("START HERE");
const roster = workbook.worksheets.add("COMMITTEE ROSTER");
const decisionSheets = [
  workbook.worksheets.add("PHASE 1"),
  workbook.worksheets.add("PHASE 2 CLIENT 1"),
  workbook.worksheets.add("PHASE 2 CLIENT 2"),
  workbook.worksheets.add("PHASE 2 CLIENT 3"),
  workbook.worksheets.add("PHASE 3")
];
const aiLog = workbook.worksheets.add("AI AUDIT LOG");

function setColumnWidths(sheet, widths) {
  for (const [column, width] of Object.entries(widths)) {
    sheet.getRange(`${column}1:${column}60`).format.columnWidth = width;
  }
}

function titleBand(sheet, title, subtitle, lastColumn = "H") {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${lastColumn}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${lastColumn}1`).format = {
    fill: COLORS.navy,
    font: { name: "Aptos Display", size: 20, bold: true, color: COLORS.white },
    verticalAlignment: "center",
    rowHeight: 34
  };
  sheet.getRange(`A2:${lastColumn}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${lastColumn}2`).format = {
    fill: COLORS.navy2,
    font: { name: "Aptos", size: 10, color: "#DCE6EF" },
    verticalAlignment: "center",
    rowHeight: 24
  };
}

function sectionBand(sheet, row, title, lastColumn = "H") {
  const range = sheet.getRange(`A${row}:${lastColumn}${row}`);
  range.merge();
  sheet.getRange(`A${row}`).values = [[title]];
  range.format = {
    fill: COLORS.navy2,
    font: { name: "Aptos", size: 10, bold: true, color: COLORS.white },
    verticalAlignment: "center",
    rowHeight: 23
  };
}

function styleHeaders(range) {
  range.format = {
    fill: COLORS.mist,
    font: { name: "Aptos", size: 10, bold: true, color: COLORS.ink },
    borders: { preset: "all", style: "thin", color: "#C9D5DF" },
    verticalAlignment: "center",
    wrapText: true
  };
}

function styleInputs(range) {
  range.format = {
    fill: COLORS.goldLight,
    font: { name: "Aptos", size: 10, color: COLORS.inputBlue },
    borders: { preset: "outside", style: "thin", color: "#D9B973" },
    verticalAlignment: "center",
    wrapText: true
  };
}

function addStatusFormatting(range) {
  range.conditionalFormats.add("containsText", {
    text: "APPROVED",
    format: { fill: COLORS.green, font: { bold: true, color: COLORS.greenText } }
  });
  range.conditionalFormats.add("containsText", {
    text: "REVISION",
    format: { fill: COLORS.red, font: { bold: true, color: COLORS.redText } }
  });
  range.conditionalFormats.add("containsText", {
    text: "INCOMPLETE",
    format: { fill: COLORS.yellow, font: { bold: true, color: COLORS.yellowText } }
  });
}

function configureDecisionSheet(sheet, { phaseNumber, phaseTitle, scopeLabel, gateLabel }) {
  titleBand(sheet, `BUS331 Investment Committee — Phase ${phaseNumber} Decision Record`, `${phaseTitle} | All four committee members review, vote, and sign this record.`);
  setColumnWidths(sheet, { A: 20, B: 22, C: 16, D: 24, E: 20, F: 18, G: 18, H: 4 });

  sheet.getRange("A4:A6").values = [["Team / Committee Name"], [scopeLabel], ["Meeting Date"]];
  sheet.getRange("D4:D6").values = [["Recorder"], ["Gate"], ["Meeting Chair"]];
  sheet.getRange("A4:A6").format.font = { bold: true, color: COLORS.ink };
  sheet.getRange("D4:D6").format.font = { bold: true, color: COLORS.ink };
  sheet.getRange("B4:C4").merge();
  sheet.getRange("B5:C5").merge();
  sheet.getRange("B6:C6").merge();
  sheet.getRange("E4:G4").merge();
  sheet.getRange("E5:G5").merge();
  sheet.getRange("E6:G6").merge();
  styleInputs(sheet.getRange("B4:C6"));
  styleInputs(sheet.getRange("E4:G4"));
  sheet.getRange("E5").values = [[gateLabel]];
  sheet.getRange("E5:G5").format = { fill: "#E7EEF5", font: { bold: true, color: COLORS.navy }, wrapText: true };
  styleInputs(sheet.getRange("E6:G6"));
  sheet.getRange("B6:C6").format.numberFormat = "mmm d, yyyy";

  sectionBand(sheet, 8, "EVIDENCE REVIEWED");
  sheet.getRange("A9:G9").values = [["Evidence item", "Location / file", "Source date", "Prepared by", "Reviewed by", "Key issue", "Review status"]];
  styleHeaders(sheet.getRange("A9:G9"));
  sheet.getRange("A10:G15").values = Array.from({ length: 6 }, () => ["", "", "", "", "", "", "Not reviewed"]);
  styleInputs(sheet.getRange("A10:G15"));
  sheet.getRange("C10:C15").format.numberFormat = "mmm d, yyyy";
  sheet.getRange("G10:G15").dataValidation = { rule: { type: "list", values: ["Not reviewed", "Reviewed", "Needs follow-up"] } };

  sheet.getRange("A17").values = [["Evidence status"]];
  sheet.getRange("A17").format.font = { bold: true, color: COLORS.ink };
  sheet.getRange("B17:C17").merge();
  sheet.getRange("B17").formulas = [["=IF(COUNTIF(G10:G15,\"Reviewed\")=6,\"EVIDENCE COMPLETE\",\"EVIDENCE INCOMPLETE\")"]];
  sheet.getRange("B17:C17").format = { font: { bold: true, color: COLORS.ink }, fill: COLORS.yellow };

  sectionBand(sheet, 19, "MOTION");
  sheet.getRange("A20:G20").merge();
  sheet.getRange("A20").values = [["Write the exact motion presented to the committee. It must name the recommendation, scope, and any conditions."]];
  sheet.getRange("A20:G20").format = { fill: "#F5F8FA", font: { italic: true, color: COLORS.slate }, wrapText: true, rowHeight: 30 };
  sheet.getRange("A21:G21").merge();
  styleInputs(sheet.getRange("A21:G21"));
  sheet.getRange("A21:G21").format.rowHeight = 42;

  sectionBand(sheet, 23, "COMMITTEE VOTE");
  sheet.getRange("A24:G24").values = [["Committee seat", "Member name", "Vote", "Reservation / condition", "Evidence cited", "Initials", "Follow-up owner"]];
  styleHeaders(sheet.getRange("A24:G24"));
  const seats = model.roles.map((role) => role.shortTitle);
  sheet.getRange("A25:G28").values = seats.map((seat) => [seat, "", "", "", "", "", ""]);
  sheet.getRange("A25:A28").format = { fill: "#F5F8FA", font: { bold: true, color: COLORS.navy }, wrapText: true };
  styleInputs(sheet.getRange("B25:G28"));
  sheet.getRange("C25:C28").dataValidation = { rule: { type: "list", values: ["Approve", "Revise", "Reject"] } };

  sheet.getRange("A30").values = [["Decision status"]];
  sheet.getRange("A30").format.font = { bold: true, color: COLORS.ink };
  sheet.getRange("B30:C30").merge();
  sheet.getRange("B30").formulas = [["=IF(COUNTIF(C25:C28,\"Revise\")+COUNTIF(C25:C28,\"Reject\")>0,\"REVISION REQUIRED\",IF(COUNTIF(C25:C28,\"Approve\")=4,\"APPROVED\",\"INCOMPLETE\"))"]];
  sheet.getRange("B30:C30").format = { font: { size: 12, bold: true, color: COLORS.ink }, fill: COLORS.yellow, borders: { preset: "outside", style: "medium", color: COLORS.navy } };
  addStatusFormatting(sheet.getRange("B30:C30"));

  sectionBand(sheet, 32, "DISSENT, RESERVATIONS & CONDITIONS");
  sheet.getRange("A33:G34").merge();
  styleInputs(sheet.getRange("A33:G34"));
  sheet.getRange("A33:G34").format.rowHeight = 34;

  sectionBand(sheet, 36, "ACTION ITEMS");
  sheet.getRange("A37:G37").values = [["Action required", "Owner", "Due date", "Evidence of completion", "Status", "Committee check", "Notes"]];
  styleHeaders(sheet.getRange("A37:G37"));
  sheet.getRange("A38:G42").values = Array.from({ length: 5 }, () => ["", "", "", "", "Open", "", ""]);
  styleInputs(sheet.getRange("A38:G42"));
  sheet.getRange("C38:C42").format.numberFormat = "mmm d, yyyy";
  sheet.getRange("E38:E42").dataValidation = { rule: { type: "list", values: ["Open", "Complete"] } };

  sheet.getRange("A44:G44").merge();
  sheet.getRange("A44").values = [["Approval requires four Approve votes. Any Revise or Reject vote produces REVISION REQUIRED; document the change and reconvene before the next gate."]];
  sheet.getRange("A44:G44").format = { fill: COLORS.goldLight, font: { italic: true, color: COLORS.slate }, wrapText: true, rowHeight: 32 };
  sheet.freezePanes.freezeRows(8);
}

titleBand(start, "BUS331 Investment Committee Decision Record", "One auditable record for every approval gate | Student template");
setColumnWidths(start, { A: 22, B: 30, C: 22, D: 22, E: 22, F: 18, G: 18, H: 4 });
start.getRange("A4:G4").merge();
start.getRange("A4").values = [["Use this workbook to show how analysis became a committee decision. Complete the roster first, then use one decision sheet at each gate. Phase 2 requires a separate vote for each assigned client."]];
start.getRange("A4:G4").format = { fill: COLORS.goldLight, font: { color: COLORS.ink, size: 11 }, wrapText: true, rowHeight: 42 };
sectionBand(start, 6, "WORKFLOW");
start.getRange("A7:G11").values = [
  ["Before the meeting", "Circulate the pre-read and complete the evidence table.", "", "", "", "", ""],
  ["During challenge", "Record the strongest counterargument, source, and unresolved issue.", "", "", "", "", ""],
  ["At the vote", "Each of the four committee members votes Approve, Revise, or Reject.", "", "", "", "", ""],
  ["After the vote", "Record dissent, conditions, action owners, due dates, and evidence of completion.", "", "", "", "", ""],
  ["Before the next gate", "Confirm revisions are complete and the decision status is APPROVED.", "", "", "", "", ""]
];
start.getRange("A7:A11").format = { fill: "#E7EEF5", font: { bold: true, color: COLORS.navy }, wrapText: true };
start.getRange("B7:G11").merge(true);
start.getRange("B7:G11").format = { font: { color: COLORS.slate }, wrapText: true };
sectionBand(start, 13, "GATE STATUS");
start.getRange("A14:C14").values = [["Approval gate", "Decision sheet", "Status"]];
styleHeaders(start.getRange("A14:C14"));
const statusRows = [
  ["Phase 1 · Frame the Mandate", "PHASE 1", "='PHASE 1'!B30"],
  ["Phase 2 · Client 1", "PHASE 2 CLIENT 1", "='PHASE 2 CLIENT 1'!B30"],
  ["Phase 2 · Client 2", "PHASE 2 CLIENT 2", "='PHASE 2 CLIENT 2'!B30"],
  ["Phase 2 · Client 3", "PHASE 2 CLIENT 3", "='PHASE 2 CLIENT 3'!B30"],
  ["Phase 3 · Defend the Recommendation", "PHASE 3", "='PHASE 3'!B30"]
];
start.getRange("A15:B19").values = statusRows.map((row) => row.slice(0, 2));
start.getRange("C15:C19").formulas = statusRows.map((row) => [row[2]]);
start.getRange("A15:C19").format = { borders: { preset: "all", style: "thin", color: "#D5DFE7" }, wrapText: true };
start.getRange("C15:C19").format.font = { color: "#008000", bold: true };
addStatusFormatting(start.getRange("C15:C19"));
start.getRange("A21").values = [["Overall readiness"]];
start.getRange("A21").format.font = { bold: true, color: COLORS.ink };
start.getRange("B21:C21").merge();
start.getRange("B21").formulas = [["=IF(COUNTIF(C15:C19,\"INCOMPLETE\")>0,\"INCOMPLETE\",IF(COUNTIF(C15:C19,\"REVISION REQUIRED\")>0,\"REVISION REQUIRED\",\"READY FOR FINAL DEFENSE\"))"]];
start.getRange("B21:C21").format = { fill: COLORS.yellow, font: { bold: true, size: 12, color: COLORS.ink }, borders: { preset: "outside", style: "medium", color: COLORS.navy } };
addStatusFormatting(start.getRange("B21:C21"));
start.getRange("A24:G24").merge();
start.getRange("A24").values = [[model.project.scopeNote]];
start.getRange("A24:G24").format = { fill: "#F5F8FA", font: { italic: true, color: COLORS.slate }, wrapText: true, rowHeight: 28 };
start.freezePanes.freezeRows(6);

titleBand(roster, "Committee Roster & Role Charter", "Assign one student to each committee seat. Roles define leadership; all members share the final decision.");
setColumnWidths(roster, { A: 25, B: 26, C: 34, D: 34, E: 34, F: 34, G: 4, H: 4 });
roster.getRange("A4:F4").values = [["Committee seat", "Member name", "Standing mandate", "Phase 1 responsibility", "Phase 2 responsibility", "Phase 3 responsibility"]];
styleHeaders(roster.getRange("A4:F4"));
roster.getRange("A5:F8").values = model.roles.map((role) => [
  role.title,
  "",
  role.mandate,
  role.phaseResponsibilities["phase-1"],
  role.phaseResponsibilities["phase-2"],
  role.phaseResponsibilities["phase-3"]
]);
roster.getRange("A5:A8").format = { fill: "#E7EEF5", font: { bold: true, color: COLORS.navy }, wrapText: true };
styleInputs(roster.getRange("B5:B8"));
roster.getRange("C5:F8").format = { font: { size: 9, color: COLORS.slate }, wrapText: true, verticalAlignment: "top" };
roster.getRange("A4:F8").format.borders = { preset: "all", style: "thin", color: "#D5DFE7" };
roster.getRange("A5:F8").format.rowHeight = 72;
sectionBand(roster, 10, "COMMITTEE NORMS", "F");
roster.getRange("A11:F15").values = [
  ["Evidence before opinion", "Every recommendation cites the workbook, source, or client constraint that supports it.", "", "", "", ""],
  ["Challenge the idea", "The independent challenge tests logic and risk; it is not a personal disagreement.", "", "", "", ""],
  ["No silent consent", "Every member votes and records a reservation when evidence remains incomplete.", "", "", "", ""],
  ["No mandate breach", "A client tripwire failure requires correction before approval.", "", "", "", ""],
  ["Shared defense", "Every member can explain the full recommendation, not only the workstream they led.", "", "", "", ""]
];
roster.getRange("A11:A15").format = { fill: COLORS.goldLight, font: { bold: true, color: COLORS.navy }, wrapText: true };
roster.getRange("B11:F15").merge(true);
roster.getRange("B11:F15").format = { font: { color: COLORS.slate }, wrapText: true };
roster.freezePanes.freezeRows(4);

configureDecisionSheet(decisionSheets[0], {
  phaseNumber: 1,
  phaseTitle: "Frame the Mandate",
  scopeLabel: "Scope: all three clients",
  gateLabel: "Approve market view and client mandates"
});
configureDecisionSheet(decisionSheets[1], {
  phaseNumber: 2,
  phaseTitle: "Build & Challenge",
  scopeLabel: "Client name / case",
  gateLabel: "Approve, revise, or reject Client 1 portfolio"
});
configureDecisionSheet(decisionSheets[2], {
  phaseNumber: 2,
  phaseTitle: "Build & Challenge",
  scopeLabel: "Client name / case",
  gateLabel: "Approve, revise, or reject Client 2 portfolio"
});
configureDecisionSheet(decisionSheets[3], {
  phaseNumber: 2,
  phaseTitle: "Build & Challenge",
  scopeLabel: "Client name / case",
  gateLabel: "Approve, revise, or reject Client 3 portfolio"
});
configureDecisionSheet(decisionSheets[4], {
  phaseNumber: 3,
  phaseTitle: "Defend the Recommendation",
  scopeLabel: "Scope: integrated recommendation",
  gateLabel: "Issue final recommendation and implementation plan"
});

titleBand(aiLog, "AI Audit Log", "Document material AI use, the human verification step, and the final committee decision.", "I");
setColumnWidths(aiLog, { A: 14, B: 13, C: 22, D: 18, E: 34, F: 24, G: 34, H: 34, I: 20 });
aiLog.getRange("A4:I4").values = [["Date", "Phase", "Workstream", "Tool / model", "Prompt purpose", "Output summary", "Human verification source", "Human decision / revision", "Owner"]];
styleHeaders(aiLog.getRange("A4:I4"));
aiLog.getRange("A5:I29").values = Array.from({ length: 25 }, () => ["", "", "", "", "", "", "", "", ""]);
styleInputs(aiLog.getRange("A5:I29"));
aiLog.getRange("A5:A29").format.numberFormat = "mmm d, yyyy";
aiLog.getRange("B5:B29").dataValidation = { rule: { type: "list", values: ["Phase 1", "Phase 2", "Phase 3"] } };
aiLog.getRange("A31:I31").merge();
aiLog.getRange("A31").values = [["Do not paste confidential client information or proprietary FactSet data into an AI tool. Every AI-assisted factual claim or number must be traceable to a human-verified source."]];
aiLog.getRange("A31:I31").format = { fill: COLORS.goldLight, font: { italic: true, color: COLORS.slate }, wrapText: true, rowHeight: 32 };
aiLog.freezePanes.freezeRows(4);

await fs.mkdir(previewDir, { recursive: true });
for (const sheet of workbook.worksheets.items) {
  const preview = await workbook.render({ sheetName: sheet.name, autoCrop: "all", scale: 1, format: "png" });
  const safeName = sheet.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await fs.writeFile(path.join(previewDir, `${safeName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 200 },
  summary: "decision record formula error scan"
});
console.log(formulaErrors.ndjson);

const summaryCheck = await workbook.inspect({
  kind: "table",
  range: "START HERE!A13:C21",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 5
});
console.log(summaryCheck.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`Saved ${outputPath}`);
