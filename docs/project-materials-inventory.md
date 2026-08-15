# BUS331 Investment Project materials inventory

Inventory date: 2026-07-29  
Repository: `BUS331-Investment-Project-Specific`  
Working status at inventory: clean `main`; no changes committed or published

## Executive findings

The repository contains a visually coherent, three-phase investment-committee simulation with a maintained content model, shared builder, and validator. Public materials are organized around Phase 1 client and macro framing, Phase 2 portfolio construction and challenge, and Phase 3 committee defense.

The original inventory found two broken portal links:

- `files/Macroeconomic_Forecast_Instructions_Student.pdf` does not exist.
- `files/BUS331_InvProject_ThesisTemplate_Phase4.xlsx` was deleted; the current security-selection workbook already includes thesis blocks, so a separate link is unnecessary.

The redesigned generated pages no longer link to either retired path.

One critical public/private boundary issue was identified during inventory:

- `files/MACROE~2.PDF` identifies itself as an instructor master guide and contains instructor scorecards, grading red flags, formula anchors, and a worked high-quality submission. It is not a student resource. On 2026-07-29, after explicit approval, it was moved to `BUS331-instructor/Investment_Project/source/Macroeconomic_Forecast_Instructor_Master_Guide.pdf`. It is not linked from the redesigned portal.

## Current artifact inventory

| Current artifact | Intended audience | Useful content to preserve | Required disposition |
| --- | --- | --- | --- |
| `index.html` | Student/public | Navy-gold identity, concise cards, resource access, AI traffic-light rules | Rebuild from the project manifest as a three-phase committee dashboard |
| `BUS331_InvProject_Requirements_AllPhases.html` | Student/public | Scenario, client mandate, five roles, technical expectations, checklists | Replace with a generated three-phase project guide; retain the path only as a compatibility entry point |
| `project/macro-analysis.html` | Student/public | Macro objective, indicator list, starter-workbook link | Fold into Phase 1; replace broken PDF dependency with public-safe instructions |
| `project/ips-client-profiles.html` | Student/public | RRTTLLU framing and links to client resources | Fold into Phase 1 as the client-mandate workstream |
| `project/client-discovery-ai-protocol.html` | Student/public | Instructor-led demonstration, five team-specific structured role-play launches, five analyst interview rounds, source verification, and guardrail handoff | Generate from `project-model.json`; do not expose sealed role cards, Scenario Reveal packets, or instructor release controls |
| `project/BUS331_InvProject_Bridge_CME_Guide.html` | Student/public | CME logic, scenario translation, Solver workflow | Preserve as Phase 2 Workstream A |
| `project/BUS331_InvProject_SecuritySelection_Guide.html` | Student/public | Focused candidate workflow, funds/ETFs-first selection, final-holding scorecard, concise alternatives, and optional hedge/no-hedge boundary | Preserve as the clean Phase 2 Workstream B technical reference; do not add completed examples |
| `project/security-analysis-selection.html` | Student/public | 8–10 holding boundary, final-holding scorecards, concise alternatives, fixed-income/equity ownership, and Holding & Exposure Reality Check | Generated Phase 2 workflow; use with the supporting security-selection technical reference; project-wide Decision Log access belongs on the Roadmap and Project Guide |
| `project/BUS331_InvProject_StressTest_Guide.html` | Student/public | Base/bear metrics, tripwire logic, reallocation decision, AI audit | Preserve as Phase 2 Workstream C |
| `project/BUS331_InvProject_FinalPitch_Guide.html` | Student/public | Final presentation structure, compact investment-committee defense, role-specific questions, and Q&A preparation | Preserve as the Phase 3 committee decision and defense guide |
| `files/Macro_Starter_Template_Student.xlsx` | Student/public | Historical data, human-first analysis, consensus comparison, scenarios, sensitivity matrix | Preserve; align visible role and phase language with Phase 1 |
| `files/Client_Scenarios_Profiles.pptx` | Student/public | Five team sets with three clients each | Preserve; align term and committee framing |
| `files/Client_Scenarios_Data_File.xlsx` | Student/public | Fifteen client records and formula-based risk classifications | Preserve as the client-data source; no hidden sheets or external links found |
| `files/Investment_Policy_Statement_Template_Client_Analysis_Framework.docx` | Student/public | Detailed IPS framework, constraints, allocation, monitoring, acknowledgment | Preserve; distinguish its internal implementation timeline from project phases |
| `files/BUS331_InvProject_CMEMatrix_Template.xlsx` | Student/public | Base/bear cases, correlations, optimization, client constraints | Maintain as Phase 2 Workstream A |
| `files/BUS331_InvProject_SecuritySelection_Template.xlsx` | Student/public | Three client tabs for proposed 8–10 holding portfolios and optional consequential decision notes, authoritative Phase 2 Final Scorecards, residual-risk and hedge/no-hedge record, Holding & Exposure Reality Check with conditional direct-security add-on, and reusable FactSet Evidence Log | Updated student edition; maintain with `scripts/update-security-selection-workbook.mjs`; never store completed FactSet data in the public repository |
| `source-templates/BUS331_InvProject_SecuritySelection_Layout_Base.xlsx` | Maintained student-safe source | Stable blank layout base for Security Selection workbook regeneration | Keep free of completed work and proprietary data; the builder applies the current `project-model.json` contract on every run |
| `files/BUS331_InvProject_StressTest_Template.xlsx` | Student/public | Three client stress tests, summary, tripwire status, corrective-action logic | Maintain as Phase 2 Workstream C |
| `project/portfolio-management-stress-testing.html` | Student/public | Integrated allocation, full IPS scorecard, bear-case test, breach correction, re-test, role handoffs | Generated Phase 2 workflow; use with the supporting stress-test technical reference |
| `project/canvas-submission-guide.html` | Student/public | One team submission per phase, exact filenames, private licensed-evidence rules, preflight checks, and receipt retention | Generate from `project-model.json`; treat its contract as authoritative |
| `canvas/phase-1-assignment.html`, `phase-2-assignment.html`, `phase-3-assignment.html` | Canvas-ready/public | Accessible inline-styled assignment instructions with exact upload packages | Generate from `project-model.json`; paste into Canvas only after instructor review |
| `files/final-rubric.pdf` | Student/public | Written/oral criteria, Q&A expectations, cohesion, visual standards | Generate from `project-model.json` with `scripts/build-final-rubric-pdf.py` |
| `files/MACROE~2.PDF` | Instructor only | Instructor scorecards, grading diagnostics, model anchors, worked submission | Resolved: moved to `BUS331-instructor/Investment_Project/source/Macroeconomic_Forecast_Instructor_Master_Guide.pdf` after explicit approval |

## Workbook and package checks

- All five current `.xlsx` files use visible sheets only.
- No workbook external links or VBA parts were found.
- The CME, security-selection, and stress-test workbooks contain formulas and explanatory comments but no hidden answer-key sheet.
- The client profile deck contains five team assignments with three clients per team.
- The public client-data workbook and profile deck agree on the fifteen client records reviewed.
- The redesign now has a project builder, shared project stylesheet, content manifest, link validator, Canvas-fragment validator, and privacy-boundary validator.
- Current student-facing artifacts use the Fall 2026 term. Generated pages take the term from `project-model.json`; binary resources are checked during release validation.

## Content consolidation map

| Phase | Integrated content | Committee gate |
| --- | --- | --- |
| Phase 1 - Frame the Mandate | Macro thesis, client discovery, RRTTLLU, IPS, return targets, risk limits | Approve the common market view and each client's mandate before portfolio construction |
| Phase 2 - Build and Challenge | CME matrix, Solver, security selection, risk-mitigation comparison, stress test, reallocation, AI audit | Vote approve/revise/reject for each client after the risk challenge |
| Phase 3 - Defend the Recommendation | Technical dossier, committee memo, oral pitch, Q&A | Issue the final recommendation, record dissent, and defend the integrated decision |

## Five-person committee roles

1. **Client and Macro Strategist** - owns client discovery, the market view, IPS objectives and constraints, and the handoff from client needs to investment criteria.
2. **Fixed-Income Analyst** - owns income, preservation, maturity, duration, credit, liquidity, and tax questions for the fixed-income sleeve.
3. **Equity Analyst** - owns equity funds and ETFs plus the limited use of individual equities, including overlap, idiosyncratic risk, and position size.
4. **Portfolio Manager** - owns final selection and weights, resolves overlap and concentration, and records explicit integration trade-offs.
5. **Risk and Derivatives Analyst** - owns portfolio-level stress tests, residual-risk evidence, and one targeted hedge or a fully supported no-hedge conclusion.

All five members vote in every phase, sign the decision record, and must be able to defend any section. A recommendation is not approved until the committee records the motion, evidence reviewed, vote, dissent or reservation, and action items.

## Release readiness

- Supporting technical guides and binary templates use the same three-phase language as the generated portal.
- The public rubric is generated from the assessment criteria in `project-model.json`.
- Release validation scans generated pages, supporting guides, and extractable public artifact text for retired phase and term language.

## Redesign implementation status

- `project-model.json` now defines the three phases, five committee seats, approval gates, deliverables, resource manifest, AI rules, and public assessment language.
- `project-model.json` now also defines the Phase 2 8–10 holding contract, funds/ETFs-first implementation, limited individual securities, final-holding scorecards, concise alternatives, optional one-hedge/no-hedge decision, integrated allocation, IPS compliance, bear-case, breach-correction, and re-test requirements.
- FactSet is required through a tool-neutral retrieval-and-interpretation record that connects issuer, credit, fund/ETF, corporate-financial, and portfolio-risk research without embedding proprietary captures or exports.
- The Phase 1 public model defines the five fictional-client team sets, the instructor-led demonstration, the human-first decision cycle, team-specific role-play pages, one interview round per analyst role, committee challenge questions, approved-source rules, and CFA Level I foundation links. Sealed client cards, the instructor demonstration card, Scenario Reveal packets, and the release log are maintained only in `BUS331-instructor/Investment_Project/instructor-control-center/`.
- The shared builder now generates the portal, comprehensive guide, three phase guides, compatibility guide, assessment page, Canvas submission guide, and three Canvas-ready assignment fragments.
- The shared builder now also generates the student-facing Client Discovery and AI Decision Protocol and integrates it into the portal, project guide, and Phase 1 guide.
- The generated pages no longer link to either missing retired resource.
- The validator checks phase and role counts, local links, accessibility landmarks, retired phase language, public resource names, and the known instructor-only PDF.
- The validator also checks the Phase 1-to-Phase 2 handoff, focused-selection and derivative-risk contracts, the Holding & Exposure Reality Check and conditional direct-security add-on, Decision Log placement and guidance, portfolio/IPS/stress contracts, rubric weight totals, committee questions, and public/private boundaries.
- The student committee decision-record workbook now provides an Analyst Decision Log with a 15-cell role-by-client coverage gate, recommendations, alternatives rejected, key trade-offs, PM integration and residual-risk evidence, plus five-person votes, dissent, action items, and AI audit log.
- Release-mode validation now passes after the instructor-only PDF was moved to the private workspace.
- The private instructor workspace now contains a clearly fictional three-phase worked exemplar and a bounded pilot harness. Neither is linked or copied into generated student materials.
- The paused Eleanor voice pilot is outside the dependency path for the current prompt-free workflow.

Nothing was deleted, committed, pushed, or published during this inventory. The instructor-only PDF was moved only after explicit approval in the follow-up task.
