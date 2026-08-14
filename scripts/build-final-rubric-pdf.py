#!/usr/bin/env python3
"""Build the public BUS331 Phase 3 rubric from project-model.json."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


NAVY = colors.HexColor("#0B1F35")
GOLD = colors.HexColor("#D4A052")
TEAL = colors.HexColor("#1F7A78")
ICE = colors.HexColor("#F2F6FA")
STEEL = colors.HexColor("#56687A")
LINE = colors.HexColor("#D9E1E8")


def parse_args() -> argparse.Namespace:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=root / "files" / "final-rubric.pdf",
        help="Destination PDF path.",
    )
    return parser.parse_args()


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleWhite",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=21,
            leading=25,
            textColor=colors.white,
            alignment=TA_LEFT,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubtitleWhite",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.white,
            spaceAfter=0,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Section",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=NAVY,
            spaceBefore=6,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyCompact",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=12.3,
            textColor=NAVY,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Small",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.8,
            leading=10.2,
            textColor=NAVY,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallBold",
            parent=styles["Small"],
            fontName="Helvetica-Bold",
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableHead",
            parent=styles["SmallBold"],
            textColor=colors.white,
            alignment=TA_CENTER,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Question",
            parent=styles["BodyCompact"],
            leftIndent=10,
            bulletIndent=0,
            spaceAfter=4,
        )
    )
    return styles


def paragraph(text: str, style):
    escaped = (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    return Paragraph(escaped, style)


def rubric_table(criteria, styles):
    rows = [
        [
            Paragraph("Criterion", styles["TableHead"]),
            Paragraph("Weight", styles["TableHead"]),
            Paragraph("Decision-ready standard", styles["TableHead"]),
        ]
    ]
    for item in criteria:
        rows.append(
            [
                paragraph(item["criterion"], styles["SmallBold"]),
                Paragraph(f'{item["weight"]}%', styles["SmallBold"]),
                paragraph(item["standard"], styles["Small"]),
            ]
        )
    table = Table(rows, colWidths=[1.55 * inch, 0.62 * inch, 4.78 * inch], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (1, 1), (1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ICE]),
                ("GRID", (0, 0), (-1, -1), 0.45, LINE),
                ("BOX", (0, 0), (-1, -1), 0.8, STEEL),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return table


def checklist_table(items, styles):
    table = Table(
        [[Paragraph(f"[ ] {item}", styles["BodyCompact"])] for item in items],
        colWidths=[7.0 * inch],
    )
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return table


def banner(title: str, subtitle: str, styles):
    content = [
        Paragraph(title, styles["TitleWhite"]),
        Paragraph(subtitle, styles["SubtitleWhite"]),
    ]
    box = Table([[content]], colWidths=[7.0 * inch])
    box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NAVY),
                ("LEFTPADDING", (0, 0), (-1, -1), 18),
                ("RIGHTPADDING", (0, 0), (-1, -1), 18),
                ("TOPPADDING", (0, 0), (-1, -1), 15),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 15),
            ]
        )
    )
    return box


def footer(canvas, document, term: str):
    canvas.saveState()
    canvas.setStrokeColor(GOLD)
    canvas.setLineWidth(1.2)
    canvas.line(document.leftMargin, 0.53 * inch, letter[0] - document.rightMargin, 0.53 * inch)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(STEEL)
    canvas.drawString(document.leftMargin, 0.34 * inch, f"BUS331 Investments | {term} | Investment Committee Simulation")
    canvas.drawRightString(letter[0] - document.rightMargin, 0.34 * inch, f"Page {document.page}")
    canvas.restoreState()


def main() -> None:
    args = parse_args()
    root = Path(__file__).resolve().parents[1]
    model = json.loads((root / "project-model.json").read_text(encoding="utf-8"))
    assessment = model["assessment"]
    term = model["course"]["term"]
    styles = build_styles()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(args.output),
        pagesize=letter,
        rightMargin=0.62 * inch,
        leftMargin=0.62 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.88 * inch,
        title="BUS331 Investment Project Rubrics",
        author="BUS331 Investments",
        subject="Student-facing written and oral assessment criteria",
        pageCompression=1,
        invariant=1,
    )

    story = [
        banner(
            "Investment Project Rubrics",
            "BUS331 Investment Committee Simulation | Written submission and live presentation defense",
            styles,
        ),
        Spacer(1, 12),
        Paragraph("How the assessment works", styles["Section"]),
        paragraph(assessment["note"], styles["BodyCompact"]),
    ]

    summary = Table(
        [
            [
                Paragraph("Project submission", styles["TableHead"]),
                Paragraph("Presentation and defense", styles["TableHead"]),
                Paragraph("Submission authority", styles["TableHead"]),
            ],
            [
                Paragraph(f'{assessment["submissionPoints"]}-point Canvas rubric', styles["SmallBold"]),
                Paragraph(f'{assessment["presentationPoints"]}-point Canvas rubric', styles["SmallBold"]),
                Paragraph("Canvas controls due dates, file requirements, and the project course-grade weight.", styles["Small"]),
            ],
        ],
        colWidths=[2.0 * inch, 2.0 * inch, 3.0 * inch],
    )
    summary.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), TEAL),
                ("BACKGROUND", (0, 1), (-1, 1), ICE),
                ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (1, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.extend(
        [
            summary,
            Spacer(1, 14),
            Paragraph("Evidence chain the committee must defend", styles["Section"]),
            paragraph(
                "Phase 1 client discovery and macro evidence must visibly control Phase 2 security selection, allocation, IPS compliance, stress results, corrections, and the Phase 3 recommendation. Role ownership is individual; the final decision is collective.",
                styles["BodyCompact"],
            ),
            paragraph(
                "AI may challenge a judgment or help debug a process, but it is not evidence. Material claims must be verified with approved sources, including properly documented FactSet retrievals where required.",
                styles["BodyCompact"],
            ),
            Spacer(1, 8),
            Paragraph("Written decision package", styles["Section"]),
            rubric_table(assessment["writtenCriteria"], styles),
            PageBreak(),
            banner(
                "Oral Committee Defense",
                "Compact defense within the final presentation | Every member owns role evidence and the integrated recommendation",
                styles,
            ),
            Spacer(1, 12),
            rubric_table(assessment["oralCriteria"], styles),
            Spacer(1, 14),
            Paragraph("Defense standard", styles["Section"]),
            paragraph(
                "The compact investment-committee defense is part of the final presentation. Each member answers targeted role questions, uses the relevant evidence or calculation, explains their Decision Log contribution, alternative rejected, and key trade-off, acknowledges uncertainty, and states whether the challenge changes the decision.",
                styles["BodyCompact"],
            ),
            PageBreak(),
            banner(
                "Committee Question Bank",
                "Prepare across roles - not only for the section you present",
                styles,
            ),
            Spacer(1, 12),
        ]
    )

    for group in assessment["committeeQuestions"]:
        block = [Paragraph(group["audience"], styles["Section"])]
        for question in group["questions"]:
            block.append(Paragraph(f"- {question}", styles["Question"]))
        story.append(KeepTogether(block))
        story.append(Spacer(1, 4))

    story.extend(
        [
            PageBreak(),
            banner(
                "Submission Readiness",
                "Use this checklist before the Phase 3 committee decision and Canvas submission",
                styles,
            ),
            Spacer(1, 12),
            Paragraph("Written package", styles["Section"]),
        ]
    )
    written_checks = [
        "The recommendation is stated clearly for all assigned clients.",
        "Every material claim, input, calculation, and as-of date is traceable.",
        "Bond, mutual-fund, and ETF decisions show real comparison and instrument-specific evidence.",
        "Required Issuer Reality Checks and FactSet retrieval records are complete.",
        "Each holding traces to a Phase 1 client guardrail and has a portfolio job and monitoring trigger.",
        "The full IPS scorecard and bear-case test are complete; every breach is corrected and re-tested.",
        "The Analyst Decision Log records initial judgment, AI challenge, verification, and final reasoning.",
        "Required licensed-source evidence and final student work are prepared for private Canvas submission.",
    ]
    story.append(checklist_table(written_checks, styles))

    story.append(Paragraph("Oral defense", styles["Section"]))
    oral_checks = [
        "Each member can defend owned work and explain the complete decision chain.",
        "The committee can show where a client need or constraint changed the final portfolio.",
        "The team can explain the strongest bear case, closest warning or breach, and corrective action.",
        "Every member can identify the most decision-useful source, calculation, limitation, and monitoring trigger.",
        "Visual exhibits are legible and make the recommendation, trade-offs, and evidence visible.",
    ]
    story.append(checklist_table(oral_checks, styles))

    document.build(
        story,
        onFirstPage=lambda canvas, doc: footer(canvas, doc, term),
        onLaterPages=lambda canvas, doc: footer(canvas, doc, term),
    )


if __name__ == "__main__":
    main()
