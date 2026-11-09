import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {FileBlob, SpreadsheetFile} from '@oai/artifact-tool';
import {applyCmeBaseline} from './phase3-cme-layout.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const model=JSON.parse(await fs.readFile(path.join(root,'project-model.json'),'utf8'));
const target=path.join(root,'files/BUS331_Phase3_Portfolio_Student_Template.xlsx');
const workbook=await SpreadsheetFile.importXlsx(await FileBlob.load(target));
applyCmeBaseline(workbook,model.phase3Experience.cmeBaseline);
workbook.recalculate();
const output=await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${target}.tmp.xlsx`);
await fs.rename(`${target}.tmp.xlsx`,target);
await fs.rm(`${target}.tmp.xlsx.inspect.ndjson`,{force:true});
console.log('Updated the public Phase 3 student workbook from the shared CME layout and project-model.json.');
