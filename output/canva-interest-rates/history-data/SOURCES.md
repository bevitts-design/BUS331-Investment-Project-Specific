# Historical Treasury yields and Fed policy

Retrieved September 22, 2026. Latest available FRED observation: September 18, 2026. The chart preserves the reference slide's recent-history scope; 10-year refers to security maturity, not the plotted time span.

- Nominal yield: https://fred.stlouisfed.org/series/DGS10
- Real (TIPS) yield: https://fred.stlouisfed.org/series/DFII10
- Download: https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10,DFII10&cosd=2023-07-01&coed=2026-09-21
- Federal funds target changes and effective dates: https://www.federalreserve.gov/monetarypolicy/openmarket.htm
- Latest decision: https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm
- Effective date: https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a1.htm

The full downloaded response is retained as treasury-yields.csv; plotted-yields.csv is the date-filtered snapshot. Non-observation days have blank values and are omitted from each plotted yield line. All valid daily observations are plotted, without smoothing or averaging. Policy values are stepwise target-range midpoints; the first row is the level already in force at the chart's start, not a policy change on that date. The last row extends the current level to the yield endpoint.

Latest yields are 5.01% nominal and 2.68% real. December 31, 2025 values are 4.18% and 1.93%; differences are +83 and +75 basis points. Current target range is 3.75–4.00%, midpoint 3.875%, displayed rounded to 3.88%.

Corrections to reference image: 2024's cumulative 100-basis-point cuts began in September, not solely Q4; actual real yields replace the illustrative decline; 2025 cuts and September 2026 increase are included. No claim about policy restrictiveness is inferred solely from the real yield.

Renderer: matplotlib. Run ../build-rate-history.py in a Python environment with matplotlib installed. This is a new data chart, not an AI-rendered approximation of quantitative marks.
