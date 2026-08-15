# BUS331 Investment Project proposed source of truth

## Design goal

Maintain one public project model that generates the student portal and project guide, while keeping instructor-only evaluation content in the separate `BUS331-instructor` repository. The public model describes the simulation, roles, phases, deliverables, committee gates, resources, and AI rules. It must not contain answers, completed assigned-client work, grading keys, instructor diagnostics, or proprietary captures.

## Three-phase simulation

### Phase 1 - Frame the Mandate

The committee establishes one defensible 12-month market view and converts each assigned client profile into an approved investment mandate.

Required evidence:

- Human-first client judgment recorded before AI use
- Instructor-led demonstration and structured human client role-play for each assigned client
- Continuing project-wide decision and audit trail in the Analyst Decision Log, with student access on the Project Roadmap and Project Guide
- Human-first macro read using the historical dataset
- FactSet/FRED consensus comparison with source dates
- Bull/base/bear scenarios and probabilities totaling 100%
- Completed RRTTLLU analysis and explicit drawdown tripwire for each client
- Conflict register documenting tensions among return, risk, liquidity, tax, legal, and unique constraints

Committee gate: approve or revise the macro view and all client mandates. No portfolio construction begins until the vote and action items are recorded.

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
    build-investment-project.mjs        # generates portal and public guide pages
    build-final-rubric-pdf.py           # generates the public Phase 3 rubric from project-model.json
    client-interview-simulator.js       # voice recording, typed fallback, transcript, and notes client
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
  index.html                            # generated student portal
  project/
    guide.html                          # generated comprehensive project guide
    canvas-submission-guide.html        # generated student submission contract
    client-discovery-ai-protocol.html   # generated Phase 1 launch experience
    security-analysis-selection.html    # generated Phase 2 security workflow and templates
    portfolio-management-stress-testing.html
                                        # generated Phase 2 allocation, IPS, and stress workflow
    phase-1-frame-the-mandate.html      # generated Phase 1 guide
    phase-2-build-and-challenge.html    # generated Phase 2 guide
    phase-3-defend-the-recommendation.html
                                        # generated Phase 3 guide
    assessment.html                     # generated student-facing assessment guide
    supporting references              # static technical guides aligned to the current phase model
  canvas/
    phase-1-assignment.html             # generated inline-styled Canvas assignment fragment
    phase-2-assignment.html             # generated inline-styled Canvas assignment fragment
    phase-3-assignment.html             # generated inline-styled Canvas assignment fragment
  files/
    ...Student...                       # blank student templates and public scenario data only
  docs/
    project-materials-inventory.md      # current material inventory
    project-source-of-truth.md          # architecture and boundary decisions
```

`project-model.json` is authoritative for:

- course/project title and term
- simulation premise and client scope
- the three stable phase IDs
- the five stable role IDs
- phase objectives, evidence, committee gates, and deliverables
- fictional-client team sets, team-specific structured role-play pages, five-role interview rounds, the Phase 1 decision cycle, and the public student-facing activity instructions
- Phase 2 8–10 holding boundaries, funds/ETFs-first implementation, limited individual securities, final-holding scorecards, optional consequential decision notes, Holding & Exposure Reality Check, conditional direct-security add-on, FactSet evidence-log, portfolio-integration, IPS-compliance, bear-case, residual-risk, one-hedge/no-hedge, correction, and re-test contracts
- the Analyst Decision Log contract, including recommendations, alternatives rejected, key trade-offs, PM integration and residual-risk evidence, and complete five-role-by-three-client coverage before the Phase 1 gate
- the three Canvas assignment contracts, including exact filenames, allowed file types, preflight checks, private licensed-evidence handling, and receipt retention
- resource labels and relative paths
- AI rules and verification requirements

The workbook layout base is not an alternate content source. `scripts/update-security-selection-workbook.mjs` applies the current `project-model.json` contract and workbook-specific structure to that stable base on every build, so the public workbook can be regenerated without reading its prior generated version.
- public assessment language

Generated HTML must not be edited by hand as the final source. Existing binary templates remain maintained in their native formats; the manifest records their public name, audience, phase/workstream, and status.

`canvasSubmissions` is the authoritative team-submission contract. The builder turns it into the public student guide and three inline-styled fragments ready to paste into Canvas. Those generated fragments do not change the live Canvas course. An instructor must separately configure each assignment as a group file-upload assignment, choose the correct group set, preserve the course's approved points and dates, and confirm the contract in Student View.

Phase 1 uses no AI interview service or copied student prompts. The student site explains the instructor-led Sally Hart demonstration and gives each team a separate activity page. The designated client-role student receives a sealed instructor-controlled card; the other committee members ask their own neutral questions, record a concise summary, mark information gaps, and translate the findings into guardrails. The sealed cards, demonstration materials, Scenario Reveal packets, and release log are maintained only in `BUS331-instructor/Investment_Project/instructor-control-center/`.

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
- a Phase 1 protocol that skips the recommendation, alternative/trade-off, verification, or final-reasoning stage;
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
