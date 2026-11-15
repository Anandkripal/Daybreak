import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await fs.readFile(path.join(here, '../exports/workbook-data.json'), 'utf8'));
const out = process.argv[2] || path.join(here, '../../outputs/m5');
await fs.mkdir(out, {recursive: true});
const wb = Workbook.create();
const names = ['Summary','Cashflow','Rates','Assistance','Audit'];
const sheets = Object.fromEntries(names.map(name => [name,wb.worksheets.add(name)]));
for(const s of Object.values(sheets)) {
  s.showGridLines=false;
  s.getRange('A1:Q65').format.font={name:'Arial',size:10,color:'#152238'};
  s.getRange('A1:Q65').format.rowHeight=23;
  s.getRange('A1:Q65').format.columnWidth=17;
  s.getRange('A2').format.font={name:'Arial',size:15,bold:true,color:'#152238'};
}
const header=(s,range)=>{s.getRange(range).format={fill:'#243B53',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,rowHeight:34};};
const money='#,##0.00;(#,##0.00);"–"';
const date=v=>new Date(v+'T00:00:00Z');
const src=sheets.Cashflow;
src.getRange('A2').values=[['Synthetic budget inputs']];
src.getRange('A4').values=[['Invented calendar-2025 example. No real person or user transactions. Amounts in nominal AUD.']];
src.getRange('A6:F6').values=[['Month','Category','Kind','Amount AUD','Recurring','Data class']];
src.getRange('A7:F54').values=data.cashflow.map(r=>[date(r.month),r.category,r.kind,r.cents/100,r.recurring?'yes':'no',r.data_class]);
src.getRange('A7:A54').setNumberFormat('mmm-yy');
src.getRange('D7:D54').setNumberFormat(money);
src.getRange('B6:B54').format.columnWidth=23;
header(src,'A6:F6'); src.tables.add('A6:F54',true,'SyntheticCashflow');src.freezePanes.freezeRows(6);
src.getRange('H6:I9').values=[['Category','Annual budget AUD'],['Housing',14400],['Essentials',8400],['Utilities',3000]];
header(src,'H6:I6');src.getRange('H6:I9').format.columnWidth=22;src.getRange('I7:I9').setNumberFormat(money);
src.getRange('I7:I9').format.font.color='#0000FF';
src.getRange('H11').values=[['Invented budgets, editable.']];

const sum=sheets.Summary;
sum.getRange('A2').values=[['Daybreak analyst review']];
sum.getRange('A4').values=[['Synthetic cash flow for calendar 2025. RBA history is separate on Rates. No observed impact claims.']];
sum.getRange('A6:G6').values=[['Month','Income AUD','Expenses AUD','Net AUD','Expense share','Recurring AUD','Net change AUD']];
for(let i=0;i<12;i++){
 const r=i+7;
 sum.getRange(`A${r}`).values=[[date(data.monthly_finance[i].month)]];
 sum.getRange(`B${r}:G${r}`).formulas=[[
  `=SUMIFS('Cashflow'!$D$7:$D$54,'Cashflow'!$A$7:$A$54,A${r},'Cashflow'!$C$7:$C$54,"income")`,
  `=SUMIFS('Cashflow'!$D$7:$D$54,'Cashflow'!$A$7:$A$54,A${r},'Cashflow'!$C$7:$C$54,"expense")`,
  `=B${r}-C${r}`,`=IF(B${r}=0,"n.a.",C${r}/B${r})`,
  `=SUMIFS('Cashflow'!$D$7:$D$54,'Cashflow'!$A$7:$A$54,A${r},'Cashflow'!$C$7:$C$54,"expense",'Cashflow'!$E$7:$E$54,"yes")`,
  i===0?'="n.a."':`=D${r}-D${r-1}`]];
}
header(sum,'A6:G6');sum.getRange('A7:A18').setNumberFormat('mmm-yy');sum.getRange('B7:G23').setNumberFormat(money);sum.getRange('E7:E18').setNumberFormat('0.0%');
sum.getRange('A21:E21').values=[['Calendar 2025','Income AUD','Expenses AUD','Net AUD','Expense share']];header(sum,'A21:E21');
sum.getRange('B22:E22').formulas=[['=SUM(B7:B18)','=SUM(C7:C18)','=SUM(D7:D18)','=IF(B22=0,"n.a.",C22/B22)']];sum.getRange('E22').setNumberFormat('0.0%');
sum.getRange('A25:E25').values=[['Budget review','Category','Actual AUD','Budget AUD','Over budget AUD']];header(sum,'A25:E25');
sum.getRange('B26').values=[['Housing']];sum.getRange('B26').dataValidation={rule:{type:'list',values:['Housing','Essentials','Utilities']}};sum.getRange('B26').format.fill='#FFF2CC';
sum.getRange('C26:E26').formulas=[['=SUMIFS(\'Cashflow\'!$D$7:$D$54,\'Cashflow\'!$B$7:$B$54,B26)', '= _xlfn.XLOOKUP(B26,\'Cashflow\'!$H$7:$H$9,\'Cashflow\'!$I$7:$I$9,"Unmapped",0)', '=C26-D26']];
sum.getRange('C26:E26').setNumberFormat(money);sum.getRange('A29').values=[['Choose a category in the amber cell. Positive variance means over the invented budget.']];
sum.getRange('A31').values=[['Excel desktop refresh, native PivotTable and Power Query remain manual verification steps.']];
sum.getRange('I22:J34').values=[['Month','Net AUD'],...data.monthly_finance.map(r=>[r.month.slice(0,7),null])];
sum.getRange('J23:J34').formulas=data.monthly_finance.map((_,i)=>[`=D${i+7}`]);
const chart=sum.charts.add('line',sum.getRange('I22:J34'));chart.title='Synthetic monthly net cash flow (AUD)';chart.setPosition('I6','Q20');chart.hasLegend=false;chart.series.items[0].line={fill:'#19647E',style:'solid',width:2};chart.xAxis={axisType:'textAxis',textStyle:{typeface:'Arial',fontSize:10}};chart.yAxis={numberFormatCode:'#,##0',numberFormatSourceLinked:false,textStyle:{typeface:'Arial',fontSize:10}};

const rates=sheets.Rates;
rates.getRange('A2').values=[['Historical RBA housing rate']];
rates.getRange('A4').values=[[data.manifest.rba_provenance.source_url]];
rates.getRange('A5').values=[['FILRSAVR. Per cent per annum. June 2015–January 2020. Historical revised data, not current rates.']];
rates.getRange('A7:C7').values=[['Period','Rate % p.a.','Change pp']];
rates.getRange('A8:B63').values=data.rba_rates.map(r=>[date(r.period),Number(r.rate_percent_pa)]);
rates.getRange('C8').values=[['n.a.']];rates.getRange('C9:C63').formulas=data.rba_rates.slice(1).map((_,i)=>[`=B${i+9}-B${i+8}`]);
rates.getRange('A8:A63').setNumberFormat('mmm-yy');rates.getRange('B8:C63').setNumberFormat('0.00');header(rates,'A7:C7');rates.freezePanes.freezeRows(7);
rates.getRange('E7').values=[['Source: Reserve Bank of Australia; Securitisation System.']];
rates.getRange('E9').values=[['Source CSV SHA-256:']];rates.getRange('E10').values=[[data.manifest.rba_provenance.source_sha256]];
rates.getRange('E12').values=[['Copyright and third-party restrictions:']];rates.getRange('E13').values=[[data.manifest.rba_provenance.copyright_url]];
rates.getRange('E15').values=[['Do not sum rates or join this history to the 2025 synthetic budget.']];

const assist=sheets.Assistance;
assist.getRange('A2').values=[['Synthetic assistance outcomes']];assist.getRange('A4').values=[['Invented counts for dashboard practice. Categories are mutually exclusive within each month.']];
assist.getRange('A6:G6').values=[['Month','Category','Contacts','Received help','Awaiting reply','Not available','Help share']];
assist.getRange('A7:F42').values=data.assistance.map(r=>[date(r.month),r.category,r.contacts,r.received_help,r.awaiting_reply,r.not_available]);
assist.getRange('G7:G42').formulas=data.assistance.map((_,i)=>[`=IF(C${i+7}=0,"n.a.",D${i+7}/C${i+7})`]);
assist.getRange('A7:A42').setNumberFormat('mmm-yy');assist.getRange('G7:G42').setNumberFormat('0.0%');header(assist,'A6:G6');assist.freezePanes.freezeRows(6);assist.tables.add('A6:G42',true,'SyntheticAssistance');

const audit=sheets.Audit;
audit.getRange('A2').values=[['SQL to workbook reconciliation']];audit.getRange('A4').values=[['Frozen SQL controls versus live workbook calculations. Differences must be within AUD 0.005.']];
audit.getRange('A6:G6').values=[['Month','SQL income AUD','SQL expenses AUD','SQL net AUD','Income difference','Expense difference','Net difference']];
audit.getRange('A7:D18').values=data.monthly_finance.map(r=>[date(r.month),r.income_cents/100,r.expense_cents/100,r.net_cents/100]);
audit.getRange('E7:G18').formulas=data.monthly_finance.map((_,i)=>[`='Summary'!B${i+7}-B${i+7}`,`='Summary'!C${i+7}-C${i+7}`,`='Summary'!D${i+7}-D${i+7}`]);
audit.getRange('A7:A18').setNumberFormat('mmm-yy');audit.getRange('B7:G18').setNumberFormat('0.00');header(audit,'A6:G6');
audit.getRange('E7:G18').conditionalFormats.addCustom('ABS(E7)>0.005',{fill:'#FDE9E7',font:{color:'#9C0006',bold:true}});
audit.getRange('A21').values=[['Controls generated from analytics/sql/monthly_finance.sql and reconciled to integer-cent source totals.']];
audit.getRange('A23').values=[['Changing inputs is supported; it deliberately creates differences against the frozen SQL snapshot.']];

// Exercise real recalculation, restore every temporary change, then verify the final workbook.
wb.recalculate();
function assertClose(value, expected, label){if(typeof value!=='number'||Math.abs(value-expected)>1e-8)throw Error(`${label}: ${value} != ${expected}`);}
assertClose(sum.getRange('B22').values[0][0],43800,'income');assertClose(sum.getRange('C22').values[0][0],25380,'expenses');assertClose(sum.getRange('D22').values[0][0],18420,'net');
sum.getRange('B26').values=[['Essentials']];wb.recalculate();assertClose(sum.getRange('C26').values[0][0],7980,'SUMIFS selector');assertClose(sum.getRange('D26').values[0][0],8400,'XLOOKUP selector');
sum.getRange('B26').values=[['Housing']];src.getRange('D7').values=[[0]];wb.recalculate();if(sum.getRange('E7').values[0][0]!=='n.a.')throw Error('Zero income must remain undefined');
src.getRange('D7').values=[[3100]];wb.recalculate();
for(const row of audit.getRange('E7:G18').values)for(const value of row)assertClose(value,0,'SQL reconciliation');
const scan=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'final formula errors'});
await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({checks:['annual totals','all 36 SQL differences','SUMIFS selector','XLOOKUP selector','zero-income boundary','restored inputs'],formula_scan:scan.ndjson},null,2));
console.log(scan.ndjson);
for(const name of names){const preview=await wb.render({sheetName:name,range:name==='Summary'?'A1:Q34':name==='Rates'?'A1:M22':name==='Cashflow'?'A1:J19':'A1:H25',scale:1.5});await fs.writeFile(path.join(out,`${name}.png`),new Uint8Array(await preview.arrayBuffer()));}
const output=await SpreadsheetFile.exportXlsx(wb);await output.save(path.join(out,'daybreak-analyst-review.xlsx'));
console.log('Verified and exported workbook:',out);
