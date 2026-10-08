# BUS331 Investment Project proposed source of truth

## Design goal

Maintain one public project model that generates the student overview, phase working pages, submission guidance, and compatibility entry pages, while keeping instructor-only evaluation content in the separate `BUS331-instructor` repository. The public model describes the simulation, roles, phases, deliverables, committee gates, resources, and AI rules. It must not contain answers, completed assigned-client work, grading keys, instructor diagnostics, or proprietary captures.

## Three-phase simulation

### Phase 1 - Frame the Mandate

The committee establishes one defensible 12-month market view and converts each assigned client profile into an approved investment mandate.

The student Phase 1 page presents two ordered assignments: **Macroeconomic Analysis / Macro Forecast** submits the workbook first; **Client Submissions / Client Analysis** uses that submitted forecast and submits only one combined PDF containing three abbreviated IPS statements. The macro workbook is not uploaded twice. `studentRoadmap.phase1Parts` groups the maintained sequence, readiness, evidence, deliverables, and resources without changing the three-phase approval model. Four or five people cover five official roles; a dual-role member casts one vote.

Required evidence:

- Client reasoning recorded in each abbreviated IPS
- Assigned team profile slides and client-data rows for each of three fictional clients, with supplied facts separated from reasoned, labeled assumptions
- Continuing project-wide decision and audit trail in the Analyst Decision Log, with student access on the overview and current phase pages
- Human-first macro read using the historical dataset
- FRED historical observations plus comparable source-dated external forecasts or consensus where available
- Bull/base/bear scenarios and probabilities totaling 100%
- Completed RRTTLLU analysis and explicit drawdown tripwire for each client
- Brief explanation of how risk, return, utility, and risk aversion influence asset allocation

Phase 1 handoff: complete and review the three client IPS statements before portfolio construction. Part 2 requires no separate mandate memo, detailed Decision Log, or Gate 1 vote.

### Phase 2 - Build and Challenge

The committee translates the Phase 1 view into capital-market expectations, constructs client portfolios, selects securities, designs risk mitigation, and subjects each recommendation to a bear-case challenge.

The maintained `phase2Experience` contract in `project-model.json` requires two cumulative student workflows. Security Analysis and Selection translates the approved allocation and mandate into a candidate set, then narrows it to 8–10 purposeful holdings, never more than 10, with funds and ETFs as the primary vehicles and no more than two or three individual securities. Fixed Income owns fixed-income funds and ETFs, Equity owns equity funds and ETFs plus limited individual equities, the Portfolio Manager resolves overlap and weights, and Risk and Derivatives owns portfolio stress and the hedge/no-hedge conclusion. Portfolio Management and Stress Testing integrates approved holdings, checks every relevant IPS objective and constraint, applies the unchanged Phase 1 bear assumptions, and requires specific corrections plus a full re-test before approval.

The Holding & Exposure Reality Check sits inside security analysis rather than as another course unit. Students complete one concise row for every proposed final holding. For funds and ETFs, it focuses on exposure and strategy; holdings, sector, and style overlap or concentration; costs and liquidity where relevant; key risk; client-mandate fit; allocation implication; current sources and dates; peer review; and status. It does not require company-style issuer financial-health analysis for funds or ETFs. Only when the team selects one of the limited direct individual securities does it add concise business or issuer-specific risk and a position-size rationale. Individual bonds are not required, and recent return or headline yield never substitutes for exposure, fit, and risk analysis.

FactSet is a required licensed research source in Phase 2, not a public data dependency. Students research and download evidence inside their own licensed access, then record the item retrieved, retrieval date, relevant metrics, entity/security, as-of period, source or document reference as appropriate, interpretation, and effect on the recommendation. Students submit their final work and any required licensed-source supporting evidence privately through Canvas. No student work, FactSet capture, export, credential, or completed proprietary dataset belongs in this public repository, and public guidance must remain tool-neutral because layouts and entitlements can differ.

Required evidence:

- Base and bear CME assumptions with cited rationale
- Solver output and constraint checks for each client
- Concise final-holding scorecards covering role/exposure, cost and trading expenses, liquidity, overlap, diversification, key risks, and client fit
- Added rationale, idiosyncratic-risk, and position-size analysis for each limited individual security
- Concise comparison and rejection of plausible alternatives without full analysis of every screened name
- Required Holding & Exposure Reality Checks, conditional direct-security add-ons, and role-to-allocation handoffs
- One targeted derivative hedge only when it addresses an identified residual risk, or a fully supported no-hedge conclusion
- Stress-test result against the client's approved tripwire
- Corrective trades when a portfolio breaches its mandate
- AI audit entries tied to human verification and FactSet retrieval records tied to student interpretation

Committee gate: approve, revise, or reject each client portfolio. A failed tripwire cannot receive approval without a documented correction.

### Phase 3 - Defend the Recommendation

The committee integrates the work into a concise decision package and defends its recommendations before an investment-committee panel.

Required evidence:

- Executive recommendation and decision memo
- Technical exhibit book linking macro, mandate, allocation, securities, and risk
- Client-specific recommendation for all assigned clients
- Final decision record with vote, reservations, and implementation actions
- Visual oral presentation and cross-functional Q&A readiness

Committee gate: issue the final recommendation and defend the evidence. Every member must answer questions outside the workstream they led.

## Maintained public structure

```text
BUS331-Investment-Project-Specific/
  project-model.json                    # canonical public content and resource manifest
  scripts/
    build-investment-project.mjs        # generates overview, phase pages, submission guidance, and compatibility entry pages
    build-macro-guide-canvas.py          # derives a Canvas page fragment from the maintained macro guide
    build-client-guide-canvas.py         # derives a Canvas page fragment from the maintained client guide
    build-project-guide-pdf.py          # generates printable phase checklists and the legacy PDF alias
    build-final-rubric-pdf.py           # generates the public Phase 3 rubric from project-model.json
    client-interview-simulator.js       # unlinked prototype; not part of the current student assignment
    build-investment-committee-decision-record.mjs
                                        # generates the student committee record workbook
    update-security-selection-workbook.mjs
                                        # regenerates the student Security Selection workbook
    validate-investment-project.mjs     # phase, role, link, accessibility, and privacy checks
  styles/
    bus331-investment-project.css       # shared public visual system
  assets/
    clients/
      eleanor-vance-fictional-portrait.jpg
                                        # rights-safe fictional simulator portrait
  source-templates/
    BUS331_InvProject_SecuritySelection_Layout_Base.xlsx
                                        # stable, student-safe workbook layout base
  index.html                            # generated student overview and roadmap visual
  project/
    guide.html                          # generated compatibility entry for older Project Guide links
    roadmap.html                        # generated compatibility entry for older Roadmap links
    canvas-submission-guide.html        # generated student submission contract
    macro-analysis.html                  # maintained workbook-mapped Part 1 student guide
    client-analysis.html                 # maintained client criteria and abbreviated IPS student guide
    client-discovery-ai-protocol.html   # generated scenario-analysis workflow at a retained URL
    security-analysis-selection.html    # generated Phase 2 security workflow and templates
    portfolio-management-stress-testing.html
                                        # generated Phase 2 allocation, IPS, and stress workflow
    phase-1-frame-the-mandate.html      # generated two-part Phase 1 working page
    phase-2-build-and-challenge.html    # generated Phase 2 guide
    phase-3-defend-the-recommendation.html
                                        # generated Phase 3 guide
    assessment.html                     # generated student-facing assessment guide
    supporting references              # static technical guides aligned to the current phase model
  canvas/
    phase-1-macro-assignment.html       # generated Part 1 Canvas assignment fragment
    phase-1-macro-step-by-step-page.html # generated Canvas page body for the maintained macro guide
    phase-1-client-step-by-step-page.html # generated Canvas page body for the maintained client guide
    phase-1-client-assignment.html      # generated Part 2 Canvas assignment fragment
    phase-2-assignment.html             # generated inline-styled Canvas assignment fragment
    phase-3-assignment.html             # generated inline-styled Canvas assignment fragment
  files/
    BUS331_Investment_Committee_Phase_Checklists.pdf
                                        # generated printable phase checklist reference
    BUS331_Investment_Committee_Simulation_Project_Guide.pdf
                                        # current-content alias for older PDF links
    ...Student...                       # blank student templates and public scenario data only
  docs/
    project-materials-inventory.md      # historical inventory with current navigation update
    project-source-of-truth.md          # architecture and boundary decisions
```

`project-model.json` is authoritative for:

- course/project title and term
- simulation premise and client scope
- the three stable phase IDs
- the five stable role IDs
- phase objectives, evidence, committee gates, and deliverables
- fictional-client team sets, team-specific scenario pages, five analyst lenses, the Phase 1 decision cycle, and fact-versus-assumption rules
- Phase 2 8–10 holding boundaries, funds/ETFs-first implementation, limited individual securities, final-holding scorecards, optional consequential decision notes, Holding & Exposure Reality Check, conditional direct-security add-on, FactSet evidence-log, portfolio-integration, IPS-compliance, bear-case, residual-risk, one-hedge/no-hedge, correction, and re-test contracts
- the Analyst Decision Log contract, including recommendations, alternatives rejected, key trade-offs, PM integration and residual-risk evidence, and consequential decisions beginning in Phase 2
- the four Canvas assignment contracts, including separate Phase 1 packages, exact filenames, allowed file types, preflight checks, private licensed-evidence handling, and receipt retention
- resource labels and relative paths
- AI rules and verification requirements
- public assessment language

The workbook layout base is not an alternate content source. `scripts/update-security-selection-workbook.mjs` applies the current `project-model.json` contract and workbook-specific structure to that stable base on every build, so the public workbook can be regenerated without reading its prior generated version.

The overview is the project orientation and phase selector. Each phase page owns its ordered steps, definition of done, evidence, and resource links. `project/macro-analysis.html` is the maintained supporting guide for Phase 1 Part 1, mapped to the current macro workbook tabs. `project/client-analysis.html` is the maintained Part 2 guide, mapped to client criteria and the abbreviated IPS. Their navigation entries and resource labels live in `project-model.json`. The Canvas Submission Workflow lists exact files and filenames; the Canvas assignment controls dates, points, and the actual upload. The Guide and Roadmap URLs remain short compatibility entry pages for existing links. Generated HTML must not be edited by hand as the final source. Existing binary templates remain maintained in their native formats; the manifest records their public name, audience, phase/workstream, and status.

`canvas/phase-1-macro-step-by-step-page.html` is a body-only, inline-styled Canvas page fragment derived from `project/macro-analysis.html` by `python3 scripts/build-macro-guide-canvas.py`. It uses absolute public resource links and omits the later client-analysis and Decision Record handoffs so the Canvas page covers only the Macro Starter assignment. Update the maintained guide first, then rebuild this fragment; the assignment fragment remains a separate file. Generating the fragment does not install or publish a Canvas page.

`canvas/phase-1-client-step-by-step-page.html` is the corresponding body-only, inline-styled Part 2 Canvas page fragment, derived from `project/client-analysis.html` by `python3 scripts/build-client-guide-canvas.py`. It covers client criteria, risk, return, utility and risk aversion, broad allocation, three abbreviated IPS statements, and the single-PDF Part 2 submission. It uses absolute public resource links and does not reassign the Part 1 macro workbook for upload. Update the maintained guide before rebuilding this fragment; installation in Canvas is separate.

`canvasSubmissions` is the authoritative team-submission contract. The builder turns it into the public student guide and four inline-styled fragments ready to paste into Canvas. Those generated fragments do not change the live Canvas course. An instructor must separately configure each assignment as a group file-upload assignment, choose the correct group set, set approved points and dates, and confirm the contract in Student View.

The submission contract uses `BUS331_[TeamName]_` for every required filename. `canvasSubmissions.fileNamingRule` explains how students derive the filename from the team name recorded in the macro workbook; the builder displays this rule in the submission guide and every Canvas-ready assignment fragment.

`files/Macro_Starter_Template_Student.xlsx` is the maintained native student workbook for Phase 1 Part 1 in this repository. The copy in Downloads is not a source. Its Historical Data tab contains a dated FRED snapshot with GDP quarterly observations and monthly CPI, yield spread, sentiment, and effective fed funds observations; do not silently extend or interpolate missing observations. The separate private instructor repository does not currently provide a matching macro answer key. The separate `files/BUS331_Investment_Committee_Decision_Record_Student.xlsx` is used for consequential decisions and formal approvals beginning in Phase 2. Its legacy Phase 1 sheet and role-by-client readiness checks are not Part 2 requirements. Only the Macro Starter workbook is submitted in Part 1; only the three abbreviated IPS statements, combined into one PDF, are submitted in Part 2.

Phase 1 Part 2 uses the supplied fictional client profiles and client-data workbook. The student resource is `files/BUS331_Abbreviated_IPS_Template.docx`, generated by `scripts/build-abbreviated-ips.py`. Its six sections retain the client mandate, RRTTLLU, numeric return and risk policies, broad allocation totaling 100%, and team review. Missing client facts may remain Not provided; students justify proposed policies and label only essential modeling assumptions. The original `files/Investment_Policy_Statement_Template_Client_Analysis_Framework.docx` is preserved as a longer reference and is no longer the linked assignment template. The generated team pages retain their existing URLs and point to assigned scenario files. Scenario Reveal packets remain in the private instructor repository.

## Instructor-only structure

```text
BUS331-instructor/
  Investment_Project/
    instructor-control-center/
      client-role-play/
      scenario-reveals/
      release-log.md
    exemplars/
      worked-practice-case.*
    pilot/
      bus331-redesign-pilot-test.md
      run-pilot-test.mjs
      pilot-test-report.md
    canvas/
      canvas-installation-checklist.md
    README.md
    source/
      instructor-guide.*
      grading-notes.*
      worked-exemplars.*
    solutions/
      ...Solution.xlsx
    rubrics/
      instructor-scoring-map.*
```

The private workspace may share stable phase and role IDs for coordination, but it must not be imported by the public builder. Public files must never link to private paths. Instructor exemplars should use a clearly fictional practice client unless the assignment deliberately reveals that example, and private exemplar identities should not appear in generated student files.

## Public/private release rules

A file is public only when all of the following are true:

- it is required for students to understand or complete the project;
- it contains no answer key, completed assigned-client solution, grading diagnostic, or student information;
- any licensed or proprietary data are distributable;
- its visible phase and role language matches the manifest;
- every local link resolves;
- its metadata and hidden content have been reviewed.

The validator should fail when it detects:

- a phase count other than three in generated pages;
- a role count other than five in the committee roster;
- committee roles that do not match the Client/Macro, Fixed-Income, Equity, Portfolio Manager, and Risk/Derivatives contract;
- a Part 2 workflow missing client criteria, risk and return preferences, utility and risk aversion, allocation rationale, or the three abbreviated IPS statements;
- phase numbering outside the current three-phase model in generated student pages;
- missing local resources;
- filenames or visible text marked `INSTRUCTOR`, `Solution`, `Answer Key`, or similar in the public manifest;
- private-repository paths or non-public resources linked from generated pages.

## Maintenance policy

- Update the model, builder, validator, and maintained binary sources before regenerating dependent pages and deliverables.
- Preserve current files in place until replacement outputs pass validation.
- Create student-safe replacements or aliases before retiring public links.
- Instructor PDF boundary resolved on 2026-07-29 after explicit approval: the file now resides at `BUS331-instructor/Investment_Project/source/Macroeconomic_Forecast_Instructor_Master_Guide.pdf` and is absent from the public staging repository.
- Do not commit, push, publish, or alter Canvas as part of staging work.

## Client scenario materials: six teams

`project-model.json` owns all team assignments and Team Six client facts, narratives, target returns, standard deviations, risk-aversion scores, and risk classifications. `scripts/build-client-scenario-materials.mjs` generates the 18-client data workbook, combined profile deck, and Team Six deck from those facts and these student-safe native layout bases:

- `source-templates/Client_Scenarios_Data_Base.xlsx`: original 15-client data and shared column layout.
- `source-templates/Client_Scenarios_Profiles_Base.pptx`: original cover and five team slides.
- `source-templates/Client_Scenarios_Team_Layout_Base.pptx`: existing three-client slide layout.

The existing Teams One through Five decks remain maintained native documents; the builder adjusts only their total-team marker. The new builder uses the bundled `@oai/artifact-tool` and `jszip` packages. Run it from the repository root with that runtime, then run the portal builder and validator. Native XLSX package repair preserves original styles, existing client rows, and AutoFilter while inserting authored rows 17–19 and extending the filter through row 19. The original Downloads workbook is a reference, not an output destination. Private instructor packets remain outside this build.
