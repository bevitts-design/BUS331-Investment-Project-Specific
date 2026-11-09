// One student-safe layout shared with the private worked counterpart outside this repository.
export function applyCmeBaseline(workbook, config) {
  const s=workbook.worksheets.getItem('CME');
  const updated=s.getRange('F8').values[0][0]==='Asset-class adjustment (pp)';
  const oldValues=s.getRange('D9:I11').values,oldFormulas=s.getRange('G9:H11').formulas;
  const color={navy:'#16324F',ink:'#172C3B',yellow:'#FFF2CC',purple:'#ECE7F6',source:'#E8EFF3'};
  const percent='0.00%;(0.00%);0.00%';
  let ref;
  try{ref=workbook.worksheets.getItem(config.referenceSheet);}catch{}
  const newReference=!ref;
  if(newReference)ref=workbook.worksheets.add(config.referenceSheet);
  const val=(sheet,a,v)=>{sheet.getRange(a).values=[[v]];};
  const fx=(sheet,a,f)=>{sheet.getRange(a).formulas=[[f]];};
  const note=(sheet,r,text,height=42,merge=false)=>{
    if(merge)sheet.mergeCells(`B${r}:J${r}`);
    val(sheet,`B${r}`,text);sheet.getRange(`B${r}:J${r}`).format={font:{name:'Arial',size:11,color:color.ink},wrapText:true,rowHeight:height,verticalAlignment:'center'};
  };
  const header=(sheet,r,last,labels)=>{sheet.getRange(`B${r}:${last}${r}`).values=[labels];sheet.getRange(`B${r}:${last}${r}`).format={fill:color.navy,font:{name:'Arial',size:11,color:'#FFFFFF',bold:true},wrapText:true,rowHeight:54,horizontalAlignment:'center',verticalAlignment:'center'};};
  const stats=config.referenceData.map(a=>{
    const mean=a.annualReturns.reduce((x,y)=>x+y,0)/a.annualReturns.length;
    const sd=Math.sqrt(a.annualReturns.reduce((x,y)=>x+(y-mean)**2,0)/(a.annualReturns.length-1));
    return {...a,mean,sd};
  });
  ref.showGridLines=false;ref.tabColor='#B88A2B';
  ref.getRange('A:A').format.columnWidth=3;
  ref.getRange('B2:J55').format={font:{name:'Arial',size:11,color:color.ink},verticalAlignment:'center',rowHeight:25};
  for(const [c,w]of [['B',33],['C',15],['D',13],['E',18],['F',18],['G',20],['H',16],['I',53],['J',48]])ref.getRange(`${c}:${c}`).format.columnWidth=w;
  val(ref,'B2','Historical sector and bond-category reference');ref.getRange('B2:J2').format={font:{size:16,bold:true,color:color.navy},rowHeight:34};
  note(ref,4,'Provided data only: no student forecasts or input cells. Historical mean and SD use the same five calendar-year NAV total returns (2021–2025), including reinvested distributions. These are ETF proxies, not exact forecasts for every security.',48,newReference);
  note(ref,6,'Five annual observations form a short classroom sample. SD is the sample SD of these annual returns, not the issuer’s separate 3-year risk metric. Annual values need no ×12 or SQRT(12) scaling. Factsheet dates can differ; all rows use the same 2021–2025 calendar years.',48,newReference);
  header(ref,8,'J',['Sector / category','Asset class','Proxy ETF','Historical annual mean','Historical annual SD','History window','Factsheet date','Public source','Proxy scope / limitation']);
  stats.forEach((a,i)=>{
    const r=9+i;
    ref.getRange(`B${r}:J${r}`).values=[[a.category,a.assetClass,a.ticker,a.mean,a.sd,'2021–2025 (5 annual returns)',new Date(a.reportDate+' 00:00:00 UTC'),a.sourceUrl,a.scope]];
    ref.getRange(`B${r}:J${r}`).format={fill:color.source,wrapText:true,rowHeight:100};
  });
  ref.getRange('E9:F27').setNumberFormat(percent);ref.getRange('H9:H27').setNumberFormat('yyyy-mm-dd');
  ref.getRange('D9:F27').format.horizontalAlignment='center';ref.getRange('H9:H27').format.horizontalAlignment='center';
  note(ref,29,'Means and sample SDs were calculated from the published calendar-year NAV rows in the linked iShares/BlackRock factsheets, retrieved '+config.retrieved+'. No third-party forecasts or fictional returns are used in this reference.',44,newReference);
  note(ref,31,'Apply the team’s Equity change to every equity category, Bond change to every bond category, and Cash change to Cash equivalent. Change expected returns only; retain each category’s reference SD. The selected ticker can differ from its proxy, so explain fit and limitations.',44,newReference);
  note(ref,33,'Underlying published annual total returns (provided for traceability)',28,newReference);ref.getRange('B33:J33').format={fill:color.navy,font:{color:'#FFFFFF',bold:true}};
  header(ref,36,'H',['Sector / category','Proxy',...config.referenceYears.map(String)]);
  stats.forEach((a,i)=>{ref.getRange(`B${37+i}:H${37+i}`).values=[[a.category,a.ticker,...a.annualReturns]];});
  ref.getRange('B37:H55').format={fill:color.source,wrapText:true,rowHeight:30};ref.getRange('D37:H55').setNumberFormat(percent);
  ref.freezePanes.freezeRows(8);
  if(!updated){
    for(const a of ['B4:J4','D6:J6','B13:J13','B15:J15','B17:J17','B19:J19','B21:J21','B23:J23','B24:J24','B25:J25','B27:J27'])s.getRange(a).unmerge();
    s.getRange('B2:M85').clear({applyTo:'all'});s.getRange('B2:M85').conditionalFormats.deleteAll();
  }
  s.getRange('B2:J27').format={font:{name:'Arial',size:11,color:color.ink},rowHeight:25,verticalAlignment:'center'};
  for(const[c,w]of [['B',20],['C',29],['D',18],['E',18],['F',19],['G',19],['H',19],['I',48],['J',23]])s.getRange(`${c}:${c}`).format.columnWidth=w;
  val(s,'B2','CME — one change per asset class');s.getRange('B2:J2').format={font:{size:16,bold:true,color:color.navy},rowHeight:34};
  note(s,4,'Enter one percentage-point change for Equity, Bond and Cash. Each selected sector or bond category uses its own historical mean on Reference plus the matching asset-class change. Do not enter a separate outlook for every sector.',48,!updated);
  val(s,'B6','Downside factor (SDs)');val(s,'C6',config.downsideSdMultiplier);s.getRange('B6:C6').format={fill:color.source,wrapText:true,rowHeight:42};s.getRange('C6').setNumberFormat('0.0');s.getRange('C6').format.horizontalAlignment='center';
  if(!updated)s.mergeCells('D6:J6');val(s,'D6','Downside = adjusted category return − 2 × that category’s historical SD. A return shift leaves SD unchanged.');s.getRange('D6:J6').format={wrapText:true,rowHeight:42};
  header(s,8,'J',['Asset class','Broad reference proxy','Historical annual mean','Historical annual SD','Asset-class adjustment (pp)','Adjusted broad reference return','Broad reference downside','Reason for the class change','CME status']);
  for(let i=0;i<3;i++){
    const a=config.assetClasses[i],r=9+i,j=stats.findIndex(x=>x.category===a.referenceCategory),sourceRow=9+j;
    val(s,`B${r}`,a.name);val(s,`C${r}`,`${a.referenceCategory} (${stats[j].ticker})`);
    for(const [dest,col]of [['D','E'],['E','F']])fx(s,`${dest}${r}`,`=IF(ISNUMBER('Reference'!${col}${sourceRow}),'Reference'!${col}${sourceRow},"")`);
    if(!updated){
      val(s,`F${r}`,typeof oldValues[i][2]==='number'&&typeof oldValues[i][0]==='number'?oldValues[i][2]-oldValues[i][0]:null);
      val(s,`I${r}`,oldValues[i][5]||null);
      if(oldFormulas[i][0])fx(s,`G${r}`,`=IF(AND(ISNUMBER(D${r}),ISNUMBER(F${r})),D${r}+F${r},"")`);
      if(oldFormulas[i][1])fx(s,`H${r}`,`=IF(AND(ISNUMBER(G${r}),ISNUMBER(E${r})),G${r}-$C$6*E${r},"")`);
    }
    s.getRange(`B${r}:J${r}`).format={rowHeight:105,wrapText:true};s.getRange(`C${r}:E${r}`).format.fill=color.source;
    s.getRange(`F${r}`).format={fill:color.yellow,font:{color:'#0000CC'}};s.getRange(`G${r}:H${r}`).format={fill:color.purple,font:{color:'#0000CC'}};s.getRange(`I${r}`).format={fill:color.yellow,font:{color:'#0000CC'}};
    fx(s,`J${r}`,`=IF(AND(COUNT(D${r}:H${r})=5,I${r}<>""),"Complete","Missing CME")`);
  }
  s.getRange('D9:H11').setNumberFormat(percent);s.getRange('J9:J11').conditionalFormats.deleteAll();s.getRange('J9:J11').conditionalFormats.add('containsText',{text:'Missing',format:{fill:color.yellow,font:{color:'#805000'}}});
  note(s,13,'Yellow: enter the three class changes in F9:F11 (0% = no change) and explain them in I9:I11. Purple: calculate broad reference expected returns in G9:G11 and downside in H9:H11. Sector and bond-category results flow automatically to the Client sheets.',48,!updated);
  note(s,15,'Use percentage points: −2% means two points below each matching category’s own average. It does not mean multiplying the historical return by 98%. Sector mean + class change = adjusted expectation; adjusted expectation − 2 × sector SD = downside.',48,!updated);
  note(s,17,'Reference is the separate, provided data tab. The broad proxy rows above illustrate your class changes; they do not replace the distinct sector/category baselines used for selected securities. Keep all Reference data unchanged.',44,!updated);
  note(s,19,'All expectations are TOTAL returns including income; do not add another yield. The Reference statistics use 2021–2025 annual observations. The separate security covariance exercises use 60 monthly PRICE returns. Keep these measures distinct.',44,!updated);
  note(s,21,'The two-SD downside is a simplified stress rule, not a confidence level, maximum drawdown or guaranteed loss bound. Applying it to all categories together does not establish a joint probability. A negative cash result can reflect a limitation of this symmetric rule.',44,!updated);
  note(s,23,'In each Client sheet, classify the holding by asset class and sector/category. G/H show the selected category’s historical return/SD. The allocation table uses that return plus the matching class change; downside uses that category’s own SD.',44,!updated);
  note(s,25,'Example only: a category averaging 10% with an Equity change of −2% has an adjusted expectation of 8%. If its historical SD is 15%, its two-SD downside is −22%. These example numbers are illustrative, not additional inputs.',44,!updated);
  s.freezePanes.freezeRows(8);
  for(let i=1;i<=3;i++){
    const c=workbook.worksheets.getItem(`Client ${i}`);
    val(c,'B4','Select 10 distinct securities. Each category keeps its Reference historical return and SD, and receives the team’s matching Equity, Bond or Cash adjustment. Explain client fit and proxy limitations.');
    c.getRange('G16:H16').values=[['Category historical return','Category historical SD']];c.getRange('G17:H26').format={fill:color.source,font:{color:color.ink}};
    c.getRange('D17:D26').dataValidation={rule:{type:'list',values:['Equity','Bond','Cash']}};c.getRange('E17:E26').dataValidation={rule:{type:'list',formula1:`INDIRECT("'Reference'!$B$9:$B$27")`}};
    c.getRange('K31:L31').values=[['Adjusted category total return','Category downside total return']];
    for(let j=0;j<10;j++){
      const a=17+j,r=32+j;
      for(const [dest,col]of [['G','E'],['H','F']]){
        const x=`INDEX('Reference'!$${col}$9:$${col}$27,MATCH(E${a},'Reference'!$B$9:$B$27,0))`;
        fx(c,`${dest}${a}`,`=IF(AND(COUNTIFS('Reference'!$B$9:$B$27,E${a},'Reference'!$C$9:$C$27,D${a})=1,COUNTIFS('Reference'!$B$9:$B$27,E${a},'Reference'!$${col}$9:$${col}$27,"<>")=1),IF(ISNUMBER(${x}),${x},""),"")`);
      }
      fx(c,`L${a}`,`=IF(COUNTA(B${a}:F${a})<5,"Missing selection",IF(COUNTIF($K$17:$K$26,K${a})<>1,"Duplicate ticker",IF(COUNTIFS('Reference'!$B$9:$B$27,E${a},'Reference'!$C$9:$C$27,D${a})<>1,"Revise category",IF(COUNTIFS('CME'!$B$9:$B$11,D${a},'CME'!$J$9:$J$11,"Complete")<>1,"Missing CME",IF(OR(I${a}="",NOT(ISNUMBER(J${a}))),"Missing evidence","Complete")))))`);
      const adj=`INDEX('CME'!$F$9:$F$11,MATCH(D${a},'CME'!$B$9:$B$11,0))`;
      fx(c,`K${r}`,`=IF(AND(ISNUMBER(G${a}),COUNTIFS('CME'!$B$9:$B$11,D${a},'CME'!$F$9:$F$11,"<>")=1),IF(ISNUMBER(${adj}),G${a}+${adj},""),"")`);
      fx(c,`L${r}`,`=IF(AND(ISNUMBER(K${r}),ISNUMBER(H${a}),ISNUMBER('CME'!$C$6)),K${r}-'CME'!$C$6*H${a},"")`);
      fx(c,`I${r}`,`=IF(ISNUMBER(K${r}),K${r},"")`);fx(c,`J${r}`,`=IF(ISNUMBER(L${r}),L${r},"")`);
    }
    val(c,'B28','G/H link to the selected sector or bond category on Reference. Expected return = that category’s historical mean + its asset-class change. Downside subtracts two of that category’s SDs. Income is included; do not add a separate yield.');c.getRange('B28:L28').format.rowHeight=48;
  }
  const summary=workbook.worksheets.getItem('Summary');
  val(summary,'B18','Review the provided Reference tab. Enter one change for Equity, Bond and Cash; apply it to each category’s own historical return, retaining its own SD. Complete the broad examples and class reasoning.');
  val(summary,'B21','Choose 10 securities per client. Assign the correct asset class and sector/category so its Reference baseline and the matching team adjustment flow to the portfolio.');
  val(summary,'B40','61 closes produce 60 monthly PRICE returns for portfolio-risk estimates. CME expectations use category TOTAL-return baselines plus class adjustments; the downside uses category SD. Do not add income twice.');
  val(workbook.worksheets.getItem('Stress Test'),'B4','Apply each holding’s adjusted category downside TOTAL return to initial and final weights. The common class change shifts the historical category mean; each category retains its own reference SD. Compare client consequences and tripwires.');
}
