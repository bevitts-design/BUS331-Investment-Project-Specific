// Run from the repository root with the bundled @oai/artifact-tool runtime.
// Existing native files are stable layout bases; new Team Six facts live in the model.
import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile, PresentationFile } from '@oai/artifact-tool';
import JSZip from 'jszip';

const root = process.cwd();
const previewDir = process.env.BUS331_CLIENT_PREVIEWS || '/private/tmp/bus331-team-six';
await fs.mkdir(previewDir, { recursive: true });
const model = JSON.parse(await fs.readFile(path.join(root, 'project-model.json'), 'utf8'));
const clients = model.phase1Experience.clientProfiles.filter(c => c.team === 'Team Six');
if (clients.length !== 3) throw new Error('Team Six requires three clients.');
const classification = a => a > 4.5 ? 'Risk Averse' : a <= 2.5 ? 'Risk Seeking' : 'Risk Neutral';
for (const c of clients) if (classification(c.riskAversion) !== c.riskClassification) throw new Error(`Invalid classification: ${c.name}`);

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root, 'source-templates/Client_Scenarios_Data_Base.xlsx')));
const sheet = workbook.worksheets.getItem('Sheet1');
sheet.getRange('C1').format.columnWidth = 30;
sheet.getRange('E1').format.columnWidth = 36;
for (const table of sheet.tables.items) table.rows.add(null, clients.map(c => [6,c.case,c.name,c.age,c.occupation,c.income,c.netWorth,c.goal,c.constraints,c.targetReturn,c.stdDev,c.riskAversion,null]));
for (let i = 0; i < clients.length; i++) {
  const c = clients[i], row = 17 + i;
  sheet.getRange(`A${row}:M${row}`).copyFrom(sheet.getRange('A16:M16'), 'all');
  sheet.getRange(`A${row}:L${row}`).values = [[6, c.case, c.name, c.age, c.occupation, c.income, c.netWorth, c.goal, c.constraints, c.targetReturn, c.stdDev, c.riskAversion]];
  sheet.getRange(`F${row}:G${row}`).setNumberFormat('$#,##0');
  sheet.getRange(`J${row}:K${row}`).setNumberFormat('0.00%');
  sheet.getRange(`M${row}`).formulas = [[`=IF(L${row}>4.5,"Risk Averse",IF(L${row}<=2.5,"Risk Seeking","Risk Neutral"))`]];
}
workbook.recalculate();
console.log((await workbook.inspect({kind:'table',range:'Sheet1!J17:M19',include:'values,formulas',tableMaxRows:3,tableMaxCols:4,maxChars:2500})).ndjson);
await fs.writeFile(path.join(previewDir, 'client-data.png'), new Uint8Array(await (await workbook.render({sheetName:'Sheet1',range:'A16:M19',scale:1.5,format:'png'})).arrayBuffer()));
await (await SpreadsheetFile.exportXlsx(workbook)).save(path.join(previewDir, 'client-data-draft.xlsx'));
// Artifact Tool does not preserve this workbook's native AutoFilter or all row
// styles. Transfer the authored values/formulas into its original native package.
const zip = await JSZip.loadAsync(await fs.readFile(path.join(root,'source-templates/Client_Scenarios_Data_Base.xlsx')));
let xml = await zip.file('xl/worksheets/sheet1.xml').async('string');
const escapeXml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const templateRow = xml.match(/<row r="16"[\s\S]*?<\/row>/)[0];
for (let row=17;row<=19;row++) {
  const values=sheet.getRange(`A${row}:M${row}`).values[0];
  const nativeRow=templateRow.replace('r="16"',`r="${row}"`).replace(/<c r="([A-M])16"([^>]*)>[\s\S]*?<\/c>/g,(_,col,attrs)=>{
    const value=values[col.charCodeAt(0)-65], style=attrs.match(/s="\d+"/)?.[0] || '';
    const prefix=`<c r="${col}${row}" ${style}`;
    if(col==='M') return `${prefix} t="str"><f>${escapeXml(sheet.getRange(`M${row}`).formulas[0][0].slice(1))}</f><v>${classification(clients[row-17].riskAversion)}</v></c>`;
    return typeof value==='number' ? `${prefix}><v>${value}</v></c>` : `${prefix} t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
  });
  const rowPattern=new RegExp(`<row r="${row}"[\\s\\S]*?<\\/row>`);
  if(rowPattern.test(xml)) xml=xml.replace(rowPattern,nativeRow);
  else {
    const next=[...xml.matchAll(/<row r="(\d+)"/g)].find(match=>Number(match[1])>row);
    xml=next ? xml.slice(0,next.index)+nativeRow+xml.slice(next.index) : xml.replace('</sheetData>',nativeRow+'</sheetData>');
  }
}
xml=xml.replace('<autoFilter ref="A1:M16"','<autoFilter ref="A1:M19"');
for(const [col,width] of [[3,30],[5,36]]) xml=xml.replace(new RegExp(`<col min="${col}" max="${col}"[^>]*/>`),tag=>tag.replace(/width="[^"]*"/,`width="${width}"`));
zip.file('xl/worksheets/sheet1.xml',xml);
await fs.writeFile(path.join(root,'files/Client_Scenarios_Data_File.xlsx'),await zip.generateAsync({type:'nodebuffer'}));

const money = n => '$' + n.toLocaleString('en-US');
const pct = n => (100 * n).toFixed(1) + '%';
function replacementMap() {
  const values = new Map([[1,'06'],[2,'TEAM SIX'],[3,'Team Six · Client Profiles'],[4,'6 / 6'],[99,'BUS331 Investments  ·  Endicott College  ·  Team Six']]);
  clients.forEach((c,i) => {
    const offset = 31 * i;
    const entries = [[8,c.initials],[9,`CASE #${c.case}`],[10,c.name],[11,`Age ${c.age}  ·  ${c.occupation}`],[14,c.riskClassification.toUpperCase()],[17,money(c.income)],[19,money(c.netWorth)],[23,c.goal],[26,c.constraints],[29,pct(c.targetReturn)],[32,pct(c.stdDev)],[35,c.riskAversion.toFixed(1)]];
    for (const [index,text] of entries) values.set(index+offset,text);
  });
  return values;
}
async function fillSlide(presentation, slideNumber) {
  const snapshot = await presentation.inspect({kind:'textbox',maxChars:100000});
  const map = replacementMap();
  for (const record of snapshot.ndjson.split('\n').filter(Boolean).map(s => JSON.parse(s))) {
    if (record.slide !== slideNumber || record.kind !== 'textbox') continue;
    const index = Number(record.name?.replace('Text ',''));
    if (map.has(index)) {
      const target=presentation.resolve(record.id);
      target.text.replace(record.text,map.get(index));
    }
  }
}
const team = await PresentationFile.importPptx(await FileBlob.load(path.join(root,'source-templates/Client_Scenarios_Team_Layout_Base.pptx')));
await fillSlide(team,1);
const notes = 'Fictional classroom cases. Annual target returns and standard deviations are supplied scenario inputs, not forecasts or guarantees. Risk classification follows the supplied workbook thresholds: A > 4.5 Risk Averse; A <= 2.5 Risk Seeking; otherwise Risk Neutral.\n\n'+clients.map(c=>`${c.name}: ${c.caseBackground}`).join('\n\n');
team.slides.getItem(0).speakerNotes.textFrame.setText(notes);
await (await PresentationFile.exportPptx(team)).save(path.join(root,'files/Client_Scenarios_Team_Six.pptx'));
await fs.writeFile(path.join(previewDir,'team-six.png'),new Uint8Array(await (await team.export({slide:team.slides.getItem(0),format:'png',scale:1.5})).arrayBuffer()));
const combined = await PresentationFile.importPptx(await FileBlob.load(path.join(root,'source-templates/Client_Scenarios_Profiles_Base.pptx')));
combined.slides.getItem(5).duplicate();
await fillSlide(combined,7);
const combinedSnapshot=await combined.inspect({kind:'textbox',maxChars:100000});
for(const rec of combinedSnapshot.ndjson.split('\n').filter(Boolean).map(s=>JSON.parse(s))) {
  if(rec.kind!=='textbox') continue;
  if(/^\d \/ 5$/.test(rec.text)) combined.resolve(rec.id).text.replace(rec.text,rec.text.replace('/ 5','/ 6'));
  if(rec.slide===1 && rec.text==='Team 5') combined.resolve(rec.id).text.replace('Team 5','Teams 5–6');
}
combined.slides.getItem(6).speakerNotes.textFrame.setText(notes);
await (await PresentationFile.exportPptx(combined)).save(path.join(root,'files/Client_Scenarios_Profiles.pptx'));
// Existing individual team decks are maintained native documents. Update only
// their team-count marker, preserving every other package part byte-for-byte.
for (const word of ['One','Two','Three','Four','Five']) {
  const file=path.join(root,`files/Client_Scenarios_Team_${word}.pptx`);
  const existing=await JSZip.loadAsync(await fs.readFile(file));
  const slideXml=await existing.file('ppt/slides/slide1.xml').async('string');
  const updated=slideXml.replace(/(<a:t>\d \/ )5(<\/a:t>)/g,'$16$2');
  if(updated!==slideXml) {
    existing.file('ppt/slides/slide1.xml',updated);
    await fs.writeFile(file,await existing.generateAsync({type:'nodebuffer'}));
  }
}
// Keep renderer diagnostics out of student downloads.
for(const name of ['Client_Scenarios_Team_Six.pptx','Client_Scenarios_Profiles.pptx']) {
  try { await fs.rename(path.join(root,'files',name+'.inspect.ndjson'),path.join(previewDir,name+'.inspect.ndjson')); } catch(error) { if(error.code!=='ENOENT') throw error; }
}
console.log('Built Team Six deck, combined deck, and 18-client workbook.');
