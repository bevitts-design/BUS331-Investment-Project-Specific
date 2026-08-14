#!/usr/bin/env python3
"""Build the student-downloadable BUS331 project roadmap and checklist PDF."""
from __future__ import annotations
import json
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import CondPageBreak, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
NAVY, GOLD, TEAL, ICE, LINE = map(colors.HexColor, ["#0B1F35", "#D4A052", "#1F7A78", "#F2F6FA", "#D9E1E8"])

def p(text, style):
    return Paragraph(str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), style)

def styles():
    s = getSampleStyleSheet()
    s.add(ParagraphStyle(name="TitleWhite", parent=s["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.white))
    s.add(ParagraphStyle(name="SubWhite", parent=s["BodyText"], fontSize=10, leading=13, textColor=colors.white))
    s.add(ParagraphStyle(name="H", parent=s["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=18, textColor=NAVY, spaceBefore=8, spaceAfter=7))
    s.add(ParagraphStyle(name="H3x", parent=s["Heading3"], fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=TEAL, spaceBefore=5, spaceAfter=4, keepWithNext=True))
    s.add(ParagraphStyle(name="Bodyx", parent=s["BodyText"], fontSize=9.4, leading=12.5, textColor=NAVY, spaceAfter=5))
    s.add(ParagraphStyle(name="Smallx", parent=s["BodyText"], fontSize=8.2, leading=10.6, textColor=NAVY))
    return s

def box(items, width=7.0*inch, background=ICE):
    t=Table([[items]], colWidths=[width]); t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),background),("BOX",(0,0),(-1,-1),.6,LINE),("LEFTPADDING",(0,0),(-1,-1),14),("RIGHTPADDING",(0,0),(-1,-1),14),("TOPPADDING",(0,0),(-1,-1),11),("BOTTOMPADDING",(0,0),(-1,-1),11)])); return t

def footer(c, d):
    c.saveState(); c.setStrokeColor(GOLD); c.line(d.leftMargin,.5*inch,letter[0]-d.rightMargin,.5*inch); c.setFillColor(NAVY); c.setFont("Helvetica",7.5); c.drawString(d.leftMargin,.32*inch,"BUS331 Investments | Investment Committee Simulation"); c.drawRightString(letter[0]-d.rightMargin,.32*inch,f"Page {d.page}"); c.restoreState()

def main():
    model=json.loads((ROOT/"project-model.json").read_text())
    out=ROOT/"files"/"BUS331_Investment_Committee_Simulation_Project_Guide.pdf"; out.parent.mkdir(exist_ok=True)
    s=styles(); road=model["studentRoadmap"]
    doc=SimpleDocTemplate(str(out),pagesize=letter,leftMargin=.62*inch,rightMargin=.62*inch,topMargin=.55*inch,bottomMargin=.72*inch,title="BUS331 Investment Committee Simulation Project Guide",invariant=1)
    story=[box([Paragraph("Investment Committee Simulation",s["TitleWhite"]),Paragraph("Student roadmap, requirements, and approval-gate checklists",s["SubWhite"])],background=NAVY),Spacer(1,12),p("Use this PDF to organize your committee's work without scrolling through the website. Canvas remains the authority for due dates, points, and submission mechanics.",s["Bodyx"]),p("What BUS331 provides - and what your committee creates",s["H"]),box([p(road["boundary"],s["Bodyx"])],background=ICE),p("Before you begin",s["H"])]
    story += [p(f"[ ] {x}",s["Bodyx"]) for x in road["beforeYouBegin"]]
    for phase in model["phases"]:
        story += [PageBreak(),p(f"Phase {phase['number']} - {phase['title']}",s["H"]),p(phase["objective"],s["Bodyx"]),p("Do this in order",s["H3x"])]
        story += [p(f"{i}. {x}",s["Bodyx"]) for i,x in enumerate(road["phaseSequences"][phase["id"]],1)]
        story += [p("Definition of done",s["H3x"])] + [p(f"[ ] {x}",s["Bodyx"]) for x in road["definitionOfDone"][phase["id"]]]
        story += [p("Required evidence",s["H3x"])] + [p(f"- {x}",s["Smallx"]) for x in phase["evidence"]]
        story += [p("Team deliverables",s["H3x"])] + [p(f"- {x}",s["Smallx"]) for x in phase["deliverables"]]
        if phase["id"] == "phase-1":
            story += [
                p("Client-discovery activity",s["H3x"]),
                p("First observe the instructor-led practice interview. Then open only your team's role-play page. For each assigned client, one designated member receives a sealed client card while the other members ask their own neutral questions. Rotate the client role across the three cases.",s["Bodyx"]),
                p("The client reveals only what the sealed card establishes. If a fact is not established, record an information gap. After each interview, write a concise summary, the provisional guardrails, and the downstream decision each guardrail could affect in the Analyst Decision Log. No AI prompt or student AI account is required for this activity.",s["Bodyx"])
            ]
        if phase["id"] == "phase-2":
            story += [
                p("Worksheet research guide",s["H3x"]),
                p("Before you select or reject a candidate, open the Research Guide tab in the security-selection workbook. The workbook tells you what to investigate for direct bonds, equities, mutual funds, and ETFs; your committee supplies the research, calculations, judgment, and decision.",s["Bodyx"]),
                p("Translate the approved allocation and mandate into a candidate set. Build 8-10 final holdings per client and never more than 10; eight is complete. Funds and ETFs are primary, individual securities total no more than two or three, and individual bonds are not required.",s["Bodyx"]),
                p("Complete the concise scorecard for every final holding: exposure and role, cost and trading expenses, liquidity, holdings/sector/style overlap, diversification contribution, key risks, and client fit. Add rationale, idiosyncratic risk, and position-size evidence for individual securities. Reject realistic alternatives briefly rather than fully analyzing every screened name.",s["Bodyx"]),
                p("The Portfolio Manager resolves overlap, concentration, final selection, weights, and explicit trade-offs. The Risk and Derivatives Analyst runs portfolio-level stress tests and records residual risk plus either one targeted hedge or a supported no-hedge conclusion.",s["Bodyx"]),
                p("Scenario Reveal and required remediation",s["H3x"]),
                p("First submit the baseline allocation, IPS scorecard, and initial stress result at the instructor-designated checkpoint. Keep that baseline record unchanged after the Scenario Reveal is released.",s["Bodyx"]),
                p("After release, record the packet ID, date, named client condition tested, and exact inputs in the Scenario Reveal workbook tab. Apply the released inputs without changing the client mandate or tripwire; quantify the percentage and dollar impact and identify the exposed client goal or constraint.",s["Bodyx"]),
                p("For every Breach, make a real security, sleeve, or weight change, explain the trade-off, and re-run the complete scenario and IPS scorecard. If a released case unexpectedly passes, report it to the instructor rather than using the result to skip the checkpoint.",s["Bodyx"]),
            ]
        assignment=next(a for a in model["canvasSubmissions"]["assignments"] if a["phaseId"]==phase["id"])
        if phase["id"] == "phase-1":
            story += [CondPageBreak(1.15*inch)]
        story += [p("Canvas submission check",s["H3x"])] + [p(f"[ ] {x}",s["Smallx"]) for x in assignment["preflight"]]
    story += [PageBreak(),p("Committee roles and operating protocol",s["H"]),p(f"Roles identify distinct decision rights. All {model['project']['committeeSize']} members review the full evidence package, vote at every gate, and prepare to defend the complete recommendation.",s["Bodyx"])]
    for role in model["roles"]: story += [p(role["title"],s["H3x"]),p(role["mandate"],s["Bodyx"])]
    story += [p("AI rules of engagement",s["H"])]
    for rule in model["aiRules"]: story += [p(f"{rule['status']}: {rule['title']} - {rule['description']}",s["Bodyx"])]
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
if __name__=="__main__": main()
