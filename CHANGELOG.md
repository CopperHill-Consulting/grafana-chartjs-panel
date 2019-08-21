# Changelog

- **v2.3.0**
  - Added bar pie graphs
  - Added doughnut graphs
  - Added polar area graphs

- **v2.2.0**
  - Added custom tooltips for bar charts.
  - Make "Descending" the default sort order for funnel charts.
  - Make 50% the default minimum width for funnel charts.

- **v2.1.3**
  - Added some documentation for drilldown links.
  - Fixed `${var:nameOfVar:param}` so that it will evaluate to `var-nameOfVar=...`.

- **v2.1.2**
  - Fixed descending minimum width for funnel chart.

- **v2.1.1**
  - Changed "Starting Width" to "Minimum Width".
  - Fixed bug where the minimum width didn't work in ascending order.

- **v2.1.0**
  - Added `${time}`, `${time-from}` and `${time-to}` as meta groups for adding the time variables into drilldown links.
  - Added the pointer cursor to linked segments.
  - Made number formatting global for ticks and for numbers displayed in tooltis.
  - Fixed issue where series at times would be represented by black in the legend but would have a color in bar charts.
  - Fixed issue preventing the color source from being changed for funnel charts.

- **v2.0.0**
  - Added funnel chart.
  - Allowing colors to be specified by column, by selecting them or by generating them (rainbow colors).
  - Added the ability to specify units on the axes.


- **v1.0.**
  - First version
