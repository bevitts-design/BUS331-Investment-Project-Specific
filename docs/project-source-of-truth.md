# BUS331 Investment Project proposed source of truth

## Design goal

Maintain one public project model that generates the student portal and project guide, while keeping instructor-only evaluation content in the separate `BUS331-instructor` repository. The public model describes the simulation, roles, phases, deliverables, committee gates, resources, and AI rules. It must not contain answers, completed assigned-client work, grading keys, instructor diagnostics, or proprietary captures.

## Three-phase simulation

### Phase 1 - Frame the Mandate

The committee establishes one defensible 12-month market view and converts each assigned client profile into an approved investment mandate.

Required evidence:

- Human-first client judgment recorded before AI use
- Bounded AI client interview and adversarial challenge for each assigned client
- Human verification trail and final reasoning in the Analyst Decision Log
- Human-first macro read using the historical dataset
- FactSet/FRED consensus comparison with source dates
- Bull/base/bear scenarios and probabilities totaling 100%
- Completed RRTTLLU analysis and explicit drawdown tripwire for each client
- Conflict register documenting tensions among return, risk, liquidity, tax, legal, and unique constraints

Committee gate: approve or revise the macro view and all client mandates. No portfolio construction begins until the vote and action items are recorded.

### Phase 2 - Build and Challenge

The committee translates the Phase 1 view into capital-market expectations, constructs client portfolios, selects securities, designs risk mitigation, and subjects each recommendation to a bear-case challenge.

The maintained `phase2Experience` contract in `project-model.json` requires two cumulative student workflows. Security Analysis and Selection compares bonds, mutual funds, and ETFs against Phase 1 client guardrails and records instrument-specific evidence, an AI challenge, human verification, and the select/reject rationale. Portfolio Management and Stress Testing integrates approved securities, checks every relevant IPS objective and constraint, applies the unchanged Phase 1 bear assumptions, and requires specific corrections plus a full re-test before approval.

The Issuer Reality Check sits inside security analysis rather than as another course unit. It is required for every direct bond or equity exposure and the most material relevant issuer or holding inside each selected mutual fund or ETF. Yield or recent return alone is never sufficient evidence; the snapshot covers the business and revenue drivers, macro and industry sensitivity, financial trend, liquidity and leverage, coverage and maturities where relevant, issuer-specific risk, client fit, allocation implication, and monitoring trigger.

FactSet is a required licensed research source in Phase 2, not a public data dependency. Students research and download evidence inside their own licensed access, then record the item retrieved, retrieval date, relevant metrics, entity/security, as-of period, source or document reference as appropriate, interpretation, and effect on the recommendation. Students submit their final work and any required licensed-source supporting evidence privately through Canvas. No student work, FactSet capture, export, credential, or completed proprietary dataset belongs in this public repository, and public guidance must remain tool-neutral because layouts and entitlements can differ.

Required evidence:

- Base and bear CME assumptions with cited rationale
- Solver output and constraint checks for each client
- Bond, mutual-fund, and ETF comparison with instrument-specific evidence, client fit, costs, diversification, and sources
- Required Issuer Reality Checks and role-to-allocation handoffs
- Derivative or other risk-mitigation comparison with cost and trade-off
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
    client-interview-simulator.js       # voice recording, typed fallback, transcript, and notes client
    build-investment-committee-decision-record.mjs
                                        # generates the student committee record workbook
    update-security-selection-workbook.mjs
                                        # refreshes the student Issuer Reality Check sheet
    validate-investment-project.mjs     # phase, role, link, accessibility, and privacy checks
  styles/
    bus331-investment-project.css       # shared public visual system
  assets/
    clients/
      eleanor-vance-fictional-portrait.jpg
                                        # rights-safe fictional simulator portrait
  index.html                            # generated student portal
  project/
    guide.html                          # generated comprehensive project guide
    client-discovery-ai-protocol.html   # generated Phase 1 launch experience
    security-analysis-selection.html    # generated Phase 2 security workflow and templates
    portfolio-management-stress-testing.html
                                        # generated Phase 2 allocation, IPS, and stress workflow
    phase-1-frame-the-mandate.html      # generated Phase 1 guide
    phase-2-build-and-challenge.html    # generated Phase 2 guide
    phase-3-defend-the-recommendation.html
                                        # generated Phase 3 guide
    assessment.html                     # generated student-facing assessment guide
    legacy/                             # proposed future location; no files moved without approval
  files/
    ...Student...                       # blank student templates and public scenario data only
  docs/
    project-materials-inventory.md      # internal migration inventory
    project-source-of-truth.md          # architecture and boundary decisions
```

`project-model.json` is authoritative for:

- course/project title and term
- simulation premise and client scope
- the three stable phase IDs
- the four stable role IDs
- phase objectives, evidence, committee gates, and deliverables
- fictional-client team sets, four-role interview rounds, bounded AI prompts, the Phase 1 decision cycle, and the public endpoint/privacy contract for the Client Option 1 voice interview
- Phase 2 security-analysis, Issuer Reality Check, FactSet evidence-log, portfolio-integration, IPS-compliance, bear-case, correction, and re-test contracts
- the Analyst Decision Log contract, including evidence-ready fields and complete four-role-by-three-client coverage before the Phase 1 gate
- resource labels and relative paths
- AI rules and verification requirements
- public assessment language

Generated HTML must not be edited by hand as the final source. Existing binary templates remain maintained in their native formats; the manifest records their public name, audience, phase/workstream, and status.

The Client Option 1 experience is a turn-based, instructor-hosted voice scaffold. Students record their own question or type it, confirm the speech transcript, hear Eleanor's generated response, and retain a text process record and analyst notes. The public `project-model.json` supplies only the intentionally incomplete intake dossier, fictional voice disclosure, endpoint contract, limits, and optional opening ideas. `scripts/client-interview-simulator.js` records one question at a time, sends it only to the configured instructor service, plays returned audio, and keeps the visible transcript in the browser session. It contains no OpenAI key, complete scenario facts, hidden prompt, or recommendation logic. A continuous Realtime conversation upgrade is intentionally deferred; no service has been deployed or configured with a real key.

The private source of truth is `BUS331-instructor/Investment_Project/client-interview/eleanor-vance-scenario.json`. It maintains the approved facts, information gaps, progressive-disclosure rules, required goal-versus-medical-liquidity complication, and recommendation-refusal boundary. `server.mjs` constructs the private prompt, transcribes audio, generates the bounded text-and-voice response, and intentionally writes neither audio nor transcripts to disk. Deployment credentials, logs, rate controls, and instructor scenario changes remain private.

## Instructor-only structure

```text
BUS331-instructor/
  Investment_Project/
    client-interview/
      eleanor-vance-scenario.json
      eleanor-vance-controlled-prototype-archive.json
      server.mjs
      validate-voice-interview.mjs
      README.md
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

The private workspace may share stable phase and role IDs for coordination, but it must not be imported by the public builder. Public files must never link to private paths. Instructor exemplars should use a clearly fictional practice client unless the assignment deliberately reveals that example.

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
- a role count other than four in the committee roster;
- committee roles that do not match the Client/Macro, Fixed-Income, Fund/ETF, and Portfolio/Risk contract;
- a Phase 1 protocol that skips the initial-judgment, AI-challenge, verification, or final-reasoning stage;
- references to old project Phases 4, 5, or 6 in generated student pages;
- missing local resources;
- filenames or visible text marked `INSTRUCTOR`, `Solution`, `Answer Key`, or similar in the public manifest;
- private-repository paths or non-public resources linked from generated pages.

## Migration policy for this redesign

- Add the new model, builder, validator, shared style, and generated pages first.
- Preserve current files in place until the new outputs pass validation.
- Create student-safe replacements or aliases before retiring legacy links.
- Instructor PDF boundary resolved on 2026-07-29 after explicit approval: the file now resides at `BUS331-instructor/Investment_Project/source/Macroeconomic_Forecast_Instructor_Master_Guide.pdf` and is absent from the public staging repository.
- Do not commit, push, publish, or alter Canvas as part of staging work.
