# Changelog

- **v4.0.0**
  - Upgraded to make it work in version 7.2.1 of Grafana.

- **v3.1.0**
  - Added an option to allow or prevent data label overlapping.

- **v3.0.1**
  - Fixed `${time}`, `${time-from}` and `${time-to}` so that if they contain custom dates the dates will display correctly in the URL.

- **v3.0.0**
  - Added custom tooltips to all chart types.
  - Added count types for all chart types.  The default is `sum` but other options are available.
  - Added custom labels to pie charts and bar charts.
  - Added series to pie charts and doughnut charts.
  - Added ability to make borders darker and lighter for all chart types.
  - Added ability to wrap labels on pie charts.
  - Added ability to `titlecase`, `uppercase` and `lowercase` values in tooltips.
  - Restructured most of the code for building out the charts.

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
