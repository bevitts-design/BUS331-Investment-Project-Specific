# BUS331 Investment Project materials inventory

Inventory date: 2026-07-29  
Repository: `BUS331-Investment-Project-Specific`  
Working status at inventory: clean `main`; no changes committed or published

## Executive findings

The repository contains a visually coherent student portal and substantial project content, but it currently presents six sequential phases rather than one three-phase investment-committee simulation. The same requirements are repeated across the portal, comprehensive guide, phase pages, and workbook labels without a maintained content manifest or builder.

Two portal links are broken:

- `files/Macroeconomic_Forecast_Instructions_Student.pdf` does not exist.
- `files/BUS331_InvProject_ThesisTemplate_Phase4.xlsx` was deleted; the current security-selection workbook already includes thesis blocks, so a separate link is unnecessary.

One critical public/private boundary issue was identified during inventory:

- `files/MACROE~2.PDF` identifies itself as an instructor master guide and contains instructor scorecards, grading red flags, formula anchors, and a worked high-quality submission. It is not a student resource. On 2026-07-29, after explicit approval, it was moved to `BUS331-instructor/Investment_Project/source/Macroeconomic_Forecast_Instructor_Master_Guide.pdf`. It is not linked from the redesigned portal.

## Current artifact inventory

| Current artifact | Intended audience | Useful content to preserve | Required disposition |
| --- | --- | --- | --- |
| `index.html` | Student/public | Navy-gold identity, concise cards, resource access, AI traffic-light rules | Rebuild from the project manifest as a three-phase committee dashboard |
| `BUS331_InvProject_Requirements_AllPhases.html` | Student/public | Scenario, client mandate, four roles, technical expectations, checklists | Replace with a generated three-phase project guide; retain the path only as a compatibility entry point |
| `project/macro-analysis.html` | Student/public | Macro objective, indicator list, starter-workbook link | Fold into Phase 1; replace broken PDF dependency with public-safe instructions |
| `project/ips-client-profiles.html` | Student/public | RRTTLLU framing and links to client resources | Fold into Phase 1 as the client-mandate workstream |
| `project/client-discovery-ai-protocol.html` | Student/public | Five fictional-client team sets, bounded AI role-play, a Client Option 1 voice interview with a clearly fictional portrait, four analyst interview rounds, source verification, and guardrail handoff | Generate from `project-model.json`; keep only the recording/transcript interface and instructor endpoint contract public, with no API key or complete Eleanor scenario prompt |
| `project/BUS331_InvProject_Bridge_CME_Guide.html` | Student/public | CME logic, scenario translation, Solver workflow | Preserve as Phase 2 Workstream A |
| `project/BUS331_InvProject_SecuritySelection_Guide.html` | Student/public | Macro filter, security thesis, derivative hedge comparison | Preserve as Phase 2 Workstream B; keep exemplars clearly separate from assigned clients |
| `project/security-analysis-selection.html` | Student/public | Phase 1 guardrail handoff, bond/fund/ETF due diligence, candidate comparison, Issuer Reality Check, AI challenge and verification | Generated current Phase 2 student workflow; use before the legacy technical reference |
| `project/BUS331_InvProject_StressTest_Guide.html` | Student/public | Base/bear metrics, tripwire logic, reallocation decision, AI audit | Preserve as Phase 2 Workstream C |
| `project/BUS331_InvProject_FinalPitch_Guide.html` | Student/public | Two-audience framing, dossier structure, pitch timing, Q&A preparation | Reframe as Phase 3 committee decision and defense |
| `files/Macro_Starter_Template_Student.xlsx` | Student/public | Historical data, human-first analysis, consensus comparison, scenarios, sensitivity matrix | Preserve; align visible role and phase language with Phase 1 |
| `files/Client_Scenarios_Profiles.pptx` | Student/public | Five team sets with three clients each | Preserve; align term and committee framing |
| `files/Client_Scenarios_Data_File.xlsx` | Student/public | Fifteen client records and formula-based risk classifications | Preserve as the client-data source; no hidden sheets or external links found |
| `files/Investment_Policy_Statement_Template_Client_Analysis_Framework.docx` | Student/public | Detailed IPS framework, constraints, allocation, monitoring, acknowledgment | Preserve; distinguish its internal implementation timeline from project phases |
| `files/BUS331_InvProject_CMEMatrix_Template.xlsx` | Student/public | Base/bear cases, correlations, optimization, client constraints | Preserve; relabel from old Phase 3 to Phase 2 Workstream A |
| `files/BUS331_InvProject_SecuritySelection_Template.xlsx` | Student/public | Three client tabs, weight checks, thesis blocks, hedge comparison | Preserve; relabel from old Phase 4 to Phase 2 Workstream B |
| `files/BUS331_InvProject_StressTest_Template.xlsx` | Student/public | Three client stress tests, summary, tripwire status, corrective-action logic | Preserve; relabel from old Phase 5 to Phase 2 Workstream C |
| `project/portfolio-management-stress-testing.html` | Student/public | Integrated allocation, full IPS scorecard, bear-case test, breach correction, re-test, role handoffs | Generated current Phase 2 student workflow; use before the legacy technical reference |
| `files/final-rubric.pdf` | Student/public | Written/oral criteria, Q&A expectations, cohesion, visual standards | Preserve the criteria; replace old Phase 6 labeling with Phase 3 assessment language in the maintained source |
| `files/MACROE~2.PDF` | Instructor only | Instructor scorecards, grading diagnostics, model anchors, worked submission | Resolved: moved to `BUS331-instructor/Investment_Project/source/Macroeconomic_Forecast_Instructor_Master_Guide.pdf` after explicit approval |

## Workbook and package checks

- All five current `.xlsx` files use visible sheets only.
- No workbook external links or VBA parts were found.
- The CME, security-selection, and stress-test workbooks contain formulas and explanatory comments but no hidden answer-key sheet.
- The client profile deck contains five team assignments with three clients per team.
- The public client-data workbook and profile deck agree on the fifteen client records reviewed.
- The repository has no project builder, shared project stylesheet, content manifest, link validator, or privacy-boundary validator.
- Current student-facing artifacts use Spring 2026 labels while the active BUS331 course repository is framed for Fall 2026; term text should come from one configuration value.

## Content consolidation map

| New phase | Existing content absorbed | Committee gate |
| --- | --- | --- |
| Phase 1 - Frame the Mandate | Old Phases 1-2: macro thesis, client profiles, RRTTLLU, IPS, return targets, risk limits | Approve the common market view and each client's mandate before portfolio construction |
| Phase 2 - Build and Challenge | Old Phases 3-5: CME matrix, Solver, security selection, hedge comparison, stress test, reallocation, AI audit | Vote approve/revise/reject for each client after the risk challenge |
| Phase 3 - Defend the Recommendation | Old Phase 6: technical dossier, committee memo, oral pitch, Q&A | Issue the final recommendation, record dissent, and defend the integrated decision |

## Four-person committee roles

1. **Client and Macro Strategist** - owns client discovery, the market view, IPS objectives and constraints, and the handoff from client needs to investment criteria.
2. **Fixed-Income Analyst** - owns income, preservation, maturity, duration, credit, liquidity, and tax questions for the fixed-income sleeve.
3. **Fund and ETF Analyst** - owns pooled-vehicle due diligence, diversification, benchmark fit, fees, liquidity, taxes, and active/passive implementation.
4. **Portfolio Manager and Risk Analyst** - owns portfolio integration, risk capacity versus willingness, decision-log quality, stress testing, and mandate-breach escalation.

All four members vote in every phase, sign the decision record, and must be able to defend any section. A recommendation is not approved until the committee records the motion, evidence reviewed, vote, dissent or reservation, and action items.

## Publication blockers

- Supporting legacy workbooks and technical guides still retain some old six-phase labels. The generated portal and current phase guides explicitly remap them, but the binary templates should receive student-safe three-phase editions before release.
- Spring 2026 references remain inside preserved legacy files; generated pages now take Fall 2026 from the central project model.

## Redesign implementation status

- `project-model.json` now defines the three phases, four committee seats, approval gates, deliverables, resource manifest, AI rules, and public assessment language.
- `project-model.json` now also defines the Phase 2 bond/fund/ETF comparison, Issuer Reality Check, integrated allocation, IPS compliance, bear-case, breach-correction, and re-test requirements.
- The Phase 1 public model defines the existing five fictional-client team sets, the human-first decision cycle, one interview round per analyst role, bounded role-play and challenge prompts, approved-source rules, CFA Level I foundation links, the intentionally incomplete Client Option 1 intake card, and the public voice-service endpoint contract. Eleanor's complete facts, progressive-disclosure rules, complication, information gaps, and recommendation refusal are maintained only in `BUS331-instructor/Investment_Project/client-interview/`.
- The shared builder now generates the portal, comprehensive guide, three phase guides, compatibility guide, and assessment page.
- The shared builder now also generates the student-facing Client Discovery and AI Decision Protocol and integrates it into the portal, project guide, and Phase 1 guide.
- The generated pages no longer link to either missing legacy resource.
- The validator checks phase and role counts, local links, accessibility landmarks, retired phase language, public resource names, and the known instructor-only PDF.
- The validator also checks the Phase 1-to-Phase 2 handoff, instrument-specific evidence, all four Issuer Reality Check responsibilities, portfolio/IPS/stress contracts, rubric weight totals, committee questions, and public/private boundaries.
- The student committee decision-record workbook now provides an Analyst Decision Log with a 12-cell role-by-client coverage gate, plus the role charter, gate-by-gate evidence review, four-person votes, dissent, action items, and AI audit log.
- Release-mode validation now passes after the instructor-only PDF was moved to the private workspace.

Nothing was deleted, committed, pushed, or published during this inventory. The instructor-only PDF was moved only after explicit approval in the follow-up task.
