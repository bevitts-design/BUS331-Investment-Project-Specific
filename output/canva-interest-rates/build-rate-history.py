"""Rebuild the standalone Canva chart from the saved official data snapshot."""
from pathlib import Path
import csv, json
from datetime import datetime
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.patches import FancyBboxPatch
from matplotlib.lines import Line2D

ROOT = Path(__file__).resolve().parent
dt = lambda s: datetime.strptime(s, '%Y-%m-%d')
rows = list(csv.DictReader((ROOT/'history-data/treasury-yields.csv').open()))
rows = [r for r in rows if '2023-07-01' <= r['observation_date'] <= '2026-09-18']
valid = [r for r in rows if r['DGS10'] and r['DFII10']]
assert valid[-1] == {'observation_date':'2026-09-18','DGS10':'5.01','DFII10':'2.68'}
base = next(r for r in valid if r['observation_date']=='2025-12-31')
assert round((float(valid[-1]['DGS10'])-float(base['DGS10']))*100)==83
assert round((float(valid[-1]['DFII10'])-float(base['DFII10']))*100)==75
# Effective dates and target bounds from the Federal Reserve Open Market Operations table.
policy = [('2023-07-03',5.00,5.25),('2023-07-27',5.25,5.50),
          ('2024-09-19',4.75,5.00),('2024-11-08',4.50,4.75),
          ('2024-12-19',4.25,4.50),('2025-09-18',4.00,4.25),
          ('2025-10-30',3.75,4.00),('2025-12-11',3.50,3.75),
          ('2026-09-17',3.75,4.00),('2026-09-18',3.75,4.00)]
with (ROOT/'history-data/plotted-yields.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=['observation_date','DGS10','DFII10']);w.writeheader();w.writerows(rows)
with (ROOT/'history-data/fed-target-range.csv').open('w') as f:
    w=csv.writer(f);w.writerow(['effective_date','lower_percent','upper_percent']);w.writerows(policy)

NAVY='#07345B'; TEAL='#008C87'; GOLD='#AF760B'; INK='#19344A'; MUTED='#526777'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'text.color':INK,'svg.fonttype':'none'})
fig=plt.figure(figsize=(16,9),facecolor='white')
def text(x,y,s,size=14,color=INK,weight='normal',**kw):
    return fig.text(x,y,s,fontsize=size,color=color,fontweight=weight,**kw)
text(.055,.927,'10-year Treasury yields & the Fed',31,NAVY,'bold')
text(.055,.881,'July 2023–September 2026  |  Daily yields and the federal funds target midpoint',14,MUTED)
text(.055,.839,'Updated September 22, 2026 • Latest available FRED yields: September 18, 2026',11,MUTED)

ax=fig.add_axes([.062,.295,.56,.455])
ax.set_axisbelow(True);ax.grid(axis='y',color='#DCE4EA',linewidth=.8)
for k in ['top','right']: ax.spines[k].set_visible(False)
for k in ['bottom','left']: ax.spines[k].set_color('#A7B6C2')
for series,color,style in [('DGS10',NAVY,'-'),('DFII10',TEAL,'-')]:
    data=[r for r in rows if r[series]]
    x=[dt(r['observation_date']) for r in data]; y=[float(r[series]) for r in data]
    ax.plot(x,y,color=color,lw=1.8,linestyle=style,zorder=3)
    ax.scatter(x[-1],y[-1],s=38,color=color,zorder=5)
pd=[dt(p[0]) for p in policy]; pm=[(p[1]+p[2])/2 for p in policy]
ax.step(pd,pm,where='post',color=GOLD,lw=2.2,linestyle='--',zorder=4)
ax.scatter(pd[-1],pm[-1],s=38,color=GOLD,zorder=5)
ax.set_ylim(0,6); ax.set_yticks(range(0,7));ax.set_yticklabels([f'{n}%' for n in range(7)])
ax.set_xlim(dt('2023-07-03'),dt('2026-11-30'))
ticks=['2023-07-03','2024-01-01','2024-07-01','2025-01-01','2025-07-01','2026-01-01','2026-09-18']
ax.set_xticks([dt(d) for d in ticks]);ax.set_xticklabels(['Jul\n2023','Jan\n2024','Jul\n2024','Jan\n2025','Jul\n2025','Jan\n2026','Sep 18\n2026'],fontsize=10)
ax.tick_params(axis='both',length=0,pad=8,colors=MUTED)
for value,label,color in [(5.01,'5.01%',NAVY),(2.68,'2.68%',TEAL),(3.875,'3.88%',GOLD)]:
    ax.annotate(label,(dt('2026-09-18'),value),xytext=(8,0),textcoords='offset points',va='center',fontsize=11,fontweight='bold',color=color)
handles=[Line2D([0],[0],color=NAVY,lw=2),Line2D([0],[0],color=TEAL,lw=2),Line2D([0],[0],color=GOLD,lw=2,ls='--')]
ax.legend(handles,['10-year nominal','10-year real (TIPS)','Fed target midpoint'],loc='lower left',bbox_to_anchor=(-.012,1.025),ncol=3,frameon=False,fontsize=10.5,handlelength=2,columnspacing=1.3)

def card(y,title,value,note,color):
    p=FancyBboxPatch((.663,y),.287,.139,boxstyle='round,pad=0.009,rounding_size=0.012',transform=fig.transFigure,facecolor='#F3F7FA',edgecolor='none')
    fig.add_artist(p)
    text(.679,y+.105,title,13,color,'bold')
    text(.679,y+.056,value,28,color,'bold')
    text(.679,y+.017,note,11,MUTED)
card(.621,'10-YEAR NOMINAL YIELD','5.01%','+83 basis points since Dec. 31, 2025',NAVY)
card(.455,'10-YEAR REAL YIELD','2.68%','+75 basis points since Dec. 31, 2025',TEAL)
card(.289,'FED TARGET RANGE','3.75–4.00%','Raised 25 bp; effective Sept. 17, 2026',GOLD)
text(.062,.237,'Policy path',12,NAVY,'bold')
text(.15,.237,'2024: −100 bp (Sept.–Dec.)   →   2025: −75 bp   →   Sept. 2026: +25 bp',12,INK)
p=FancyBboxPatch((.055,.119),.895,.082,boxstyle='round,pad=0.009,rounding_size=0.012',transform=fig.transFigure,facecolor='#EAF4F5',edgecolor='none')
fig.add_artist(p)
text(.071,.167,'Teaching takeaway',13,NAVY,'bold')
text(.071,.135,'The Fed sets an overnight target; market-determined 10-year yields can follow a different path.',13,INK)
text(.055,.077,'Real yield = inflation-indexed Treasury (TIPS) yield. Fed line = target-range midpoint, not the effective funds rate.',9.5,MUTED)
text(.055,.052,'Sources: Federal Reserve / FRED, DGS10 and DFII10; Federal Reserve, Open Market Operations. 1 basis point = 0.01 percentage point.',9.2,MUTED)
text(.055,.029,'fred.stlouisfed.org/series/DGS10  •  fred.stlouisfed.org/series/DFII10  •  federalreserve.gov/monetarypolicy/openmarket.htm',9,MUTED)
fig.savefig(ROOT/'treasury-yields-and-fed-through-2026-09.png',dpi=200,facecolor='white')
fig.savefig(ROOT/'treasury-yields-and-fed-through-2026-09.svg',facecolor='white')
print(json.dumps({'observations':len(valid),'latest':valid[-1],'baseline':base,'png_size':[3200,1800]},indent=2))
