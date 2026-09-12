# BUS331 Investment Project

These instructions apply to this repository. They supplement the user's global instructions; authorization requirements and paired-workbook alignment rules remain in effect.

## Scope and maintained sources

- This repository owns the investment-project portal and public project materials. The separate `BUS331-Investment_Class` repository owns the broader course materials; do not expand changes into it unless required by the request.
- For read-only audits, inspect and report without editing files or running generators.
- Start with `docs/project-source-of-truth.md` for ownership and generation boundaries. Use `docs/project-materials-inventory.md` to locate materials, but verify its status claims against current files.
- `project-model.json` is the canonical public content and resource manifest. Change the relevant model fields or generator before rebuilding affected generated materials.
- `scripts/build-investment-project.mjs` generates the portal, project guide, phase and workflow pages, and Canvas assignment fragments. Check the generator's output list before treating an HTML file as generated; supporting guides may be maintained directly.
- Shared portal styling lives in `styles/bus331-investment-project.css`.
- For PDFs and workbooks, identify the applicable script in `scripts/` before editing an output. Some binary templates are maintained in their native formats. The Security Selection workbook uses `source-templates/BUS331_InvProject_SecuritySelection_Layout_Base.xlsx` with `scripts/update-security-selection-workbook.mjs`; the layout base is not an alternate source for project content.

## Public and private materials

- Keep instructor solutions, sealed client cards, scenario reveals, grading diagnostics, and completed assigned-client work in the separate `BUS331-instructor` repository. Public builders must not import private materials, and public pages must not link to private paths.
- Do not place student submissions, credentials, or proprietary FactSet captures and exports in this public repository. Public instructions may describe licensed research and private Canvas submission requirements.
- When a requested workbook change affects a student/key pair, locate the private counterpart and apply the global alignment and saved-output verification rules. If the counterpart is unavailable, report the limitation explicitly.

## Build and verification

- Run commands from the repository root. For changes to generated web content, run `node scripts/build-investment-project.mjs`, then `node scripts/validate-investment-project.mjs`.
- Rebuild affected PDFs or workbooks with their own maintained scripts when the change reaches those artifacts; the HTML build does not establish that binary outputs are current.
- For an authorized release, also run `node scripts/validate-investment-project.mjs --release`. Passing validation does not itself authorize committing, pushing, or publishing.
- Inspect affected rendered pages or saved documents when layout or interaction changes. Distinguish structural validation from visual checks and native Excel calculation checks.
- For instruction-only or documentation-only edits with no generated dependencies, review the diff and referenced paths; no material rebuild is needed.
- Before reporting completion, review the changed-file list for unintended generated changes and unrelated work. State whether results are local, pushed, or verified live. Generated Canvas fragments remain local artifacts until separately installed in Canvas.
