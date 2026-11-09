// Shared student-safe layout. The same function is applied to the private counterpart outside this repository.
export function applyCmeBaseline(workbook, config) {
  const sheet = workbook.worksheets.getItem('CME');
  const alreadyUpdated = sheet.getRange('D8').values[0][0] === 'Provided baseline price change';
  const old = sheet.getRange('B9:J27').values;
  const colors = {navy:'#16324F', ink:'#172C3B', yellow:'#FFF2CC', source:'#E8EFF3', green:'#087543'};
  const percent = '0.0%;(0.0%);0.0%';
  const value = (a,v) => {sheet.getRange(a).values=[[v]];};
  const formula = (a,f) => {sheet.getRange(a).formulas=[[f]];};
  const note = (r,text,height=40) => {
    const target=`B${r}:K${r}`;
    if (!alreadyUpdated) sheet.mergeCells(target);
    value(`B${r}`,text);
    sheet.getRange(target).format={font:{name:'Arial',size:11,color:colors.ink},wrapText:true,rowHeight:height,verticalAlignment:'center'};
  };
  const header = (r,labels) => {
    sheet.getRange(`B${r}:K${r}`).values=[labels];
    sheet.getRange(`B${r}:K${r}`).format={fill:colors.navy,font:{name:'Arial',size:11,color:'#FFFFFF',bold:true},wrapText:true,rowHeight:60,verticalAlignment:'center',horizontalAlignment:'center'};
  };
  sheet.getRange('B2:K64').format.font.name='Arial';
  sheet.getRange('B4').values=[['One shared 12-month outlook. Review baseline D, enter adjustment E (0% to keep), and explain the macro reasoning in H. F calculates the team price forecast; income stays on each Client sheet.']];
  sheet.getRange('B4:I4').format.rowHeight=48;
  note(6,'Use percentage points: enter -2% to reduce a baseline by 2 points. Complete each category you use. Equity downside forecasts in G are your own; bond downside starters link to the classroom table below.',44);
  header(8,['Sector / category','Asset class','Provided baseline price change','Team adjustment (pp)','Team expected price change','Team downside price change','Keep / adjust explanation + macro driver','Team source / reference','Team as-of date','CME status']);
  for (let j=0;j<19;j++) {
    const r=9+j, category=old[j][0], bondIndex=config.bonds.rows.findIndex(x=>x.category===category);
    sheet.getRange(`B${r}:K${r}`).format={font:{name:'Arial',size:11,color:colors.ink},wrapText:true,rowHeight:72,verticalAlignment:'center'};
    sheet.getRange(`E${r}`).format={fill:colors.yellow,font:{color:'#0000CC'}};
    sheet.getRange(`F${r}`).format.fill='#FFFFFF';
    sheet.getRange(`G${r}:J${r}`).format={fill:colors.yellow,font:{color:'#0000CC'}};
    sheet.getRange(`D${r}`).format.fill=colors.source;
    if (bondIndex < 0) value(`D${r}`,config.factset.values[category]);
    else formula(`D${r}`,`=IF(ISNUMBER(H${48+bondIndex}),H${48+bondIndex},"")`);
    if (!alreadyUpdated) {
      value(`E${r}`,typeof old[j][3]==='number' ? old[j][3]-(bondIndex<0?config.factset.values[category]:-config.bonds.rows[bondIndex].duration*(config.bonds.rows[bondIndex].baseRateChange+config.bonds.rows[bondIndex].baseSpreadChange)) : null);
      if (bondIndex>=0) formula(`G${r}`,`=IF(ISNUMBER(I${48+bondIndex}),I${48+bondIndex},"")`);
      else if (typeof old[j][4]==='number') value(`G${r}`,old[j][4]);
      else value(`G${r}`,null);
      value(`H${r}`,old[j][5] ? `${old[j][2] ? old[j][2]+'. ' : ''}${old[j][5]}` : null);
      value(`I${r}`,old[j][6] || null);
      value(`J${r}`,old[j][7] || null);
    }
    formula(`F${r}`,`=IF(AND(ISNUMBER(D${r}),ISNUMBER(E${r})),D${r}+E${r},"")`);
    formula(`K${r}`,`=IF(AND(COUNT(D${r}:G${r})=4,H${r}<>"",I${r}<>"",ISNUMBER(J${r}),J${r}>0),"Complete","Missing CME")`);
  }
  sheet.getRange('D9:G27').setNumberFormat(percent);
  sheet.getRange('J9:J27').setNumberFormat('mm/dd/yyyy');
  // Old conditional rules belonged to the prior status column, now the date column.
  sheet.getRange('J9:J27').conditionalFormats.deleteAll();
  sheet.getRange('K9:K27').conditionalFormats.deleteAll();
  sheet.getRange('K9:K27').conditionalFormats.add('containsText',{text:'Missing',format:{fill:colors.yellow,font:{color:'#805000'}}});
  for (const [col,width] of [['B',33],['C',16],['D',17],['E',16],['F',18],['G',18],['H',36],['I',32],['J',16],['K',22]]) sheet.getRange(`${col}:${col}`).format.columnWidth=width;
  note(39,'Provided baseline sources and scope',28);
  sheet.getRange('B39:K39').format={fill:colors.navy,font:{color:'#FFFFFF',bold:true}};
  note(40,`Equity: FactSet Earnings Insight, ${config.factset.reportDate}, p. ${config.factset.page}; closing-price reference ${config.factset.asOfDate}. Analyst target upside is a dated starting point, not a probability-weighted forecast. Broad equity uses the S&P 500 as a U.S. large-cap proxy.`,48);
  note(41,config.factset.url,34);
  note(42,'Preserve the provided equity baseline. Enter 0% in E to retain it or a signed percentage-point adjustment to revise it. Explain either decision in H, cite team evidence in I and date the team outlook in J. Reassess proxy fit for non-U.S., small-cap or materially different exposures.',48);
  note(44,'Classroom bond scenario inputs (illustrative; not FactSet forecasts)',28);
  sheet.getRange('B44:K44').format={fill:colors.navy,font:{color:'#FFFFFF',bold:true}};
  note(45,`Provided starting scenarios (before team edits). Base: ${config.bonds.baseScenario} Downside: ${config.bonds.downsideScenario}`,54);
  header(47,['Category','Modified duration (years)','Base yield change','Base spread change','Downside yield change','Downside spread change','Base price change','Downside price change','Scope / limitation','']);
  for (let j=0;j<config.bonds.rows.length;j++) {
    const a=config.bonds.rows[j], r=48+j;
    sheet.getRange(`B${r}:K${r}`).format={font:{name:'Arial',size:11,color:colors.ink},rowHeight:58,wrapText:true,verticalAlignment:'center'};
    // On refresh retain the editable classroom assumptions already in the native workbook.
    value(`B${r}`,a.category);
    if (!alreadyUpdated) {
      sheet.getRange(`C${r}:G${r}`).values=[[a.duration,a.baseRateChange,a.baseSpreadChange,a.downsideRateChange,a.downsideSpreadChange]];
      const prior = old.find(x=>x[0]===a.category);
      // Preserve a previously completed team downside forecast through the new scenario inputs.
      if (typeof prior?.[4]==='number' && a.duration>0) {
        const yieldChange=-prior[4]/a.duration;
        if (a.category==='Government bonds') value(`F${r}`,yieldChange);
        else value(`G${r}`,yieldChange-a.downsideRateChange);
      }
    }
    sheet.getRange(`C${r}:G${r}`).format={fill:colors.yellow,font:{color:'#0000CC'}};
    formula(`H${r}`,`=IF(AND(COUNT(C${r}:E${r})=3,C${r}>=0),-C${r}*(D${r}+E${r}),"")`);
    formula(`I${r}`,`=IF(AND(ISNUMBER(C${r}),COUNT(F${r}:G${r})=2,C${r}>=0),-C${r}*(F${r}+G${r}),"")`);
    if (!alreadyUpdated) sheet.mergeCells(`J${r}:K${r}`);
    value(`J${r}`,a.scope);
  }
  sheet.getRange('C48:C54').setNumberFormat('0.0');
  sheet.getRange('D48:I54').setNumberFormat('0.00%;(0.00%);0.00%');
  sheet.getRange('H48:I54').format.horizontalAlignment='center';
  note(56,'Price change ≈ -modified duration × (yield change + spread change). Enter 25 basis points as 0.25% (0.0025). Negative changes mean falling yields/spreads. The table excludes income, convexity, defaults and currency effects. Cash uses a stable-price proxy; income can change.',52);
  note(58,'Use the classroom bond assumptions or revise C:G with an explanation in H9:H27 and supporting evidence. H48:H54 feeds baseline D21:D27. Bond downside starters in G21:G27 link to I48:I54; replace them with a justified team estimate when needed. Keep a consistent adverse scenario.',52);
  note(60,'Equity baseline data are publicly reported facts transcribed from FactSet, not an instructor forecast. The classroom bond assumptions are illustrative teaching inputs. Neither source supplies your team explanation or final judgment.',44);
  sheet.freezePanes.freezeRows(8);
  {
    for (let i=1;i<=3;i++) {
      const client=workbook.worksheets.getItem(`Client ${i}`);
      for (let j=0;j<10;j++) {
        const a=17+j,r=32+j;
        let f=client.getRange(`L${a}`).formulas[0][0];
        client.getRange(`L${a}`).formulas=[[f.replaceAll("'CME'!$J$9:$J$27","'CME'!$K$9:$K$27")]];
        for (const [dest,source] of [['K','F'],['L','G']]) {
          const selected=`INDEX('CME'!$${source}$9:$${source}$27,MATCH(E${a},'CME'!$B$9:$B$27,0))`;
          client.getRange(`${dest}${r}`).formulas=[[`=IF(COUNTIF('CME'!$B$9:$B$27,E${a})<>1,"",IF(ISNUMBER(${selected}),${selected},""))`]];
        }
      }
    }
  }
  const summary=workbook.worksheets.getItem('Summary');
  summary.getRange('B18').values=[['Review the dated FactSet sector baseline and classroom bond scenarios. Enter team adjustments (0% to keep), explain the macro reasoning, and complete team downside price forecasts.']];
}
