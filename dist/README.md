## Chart.js Panel Plugin for Grafana

Create bar graphs, funnel graphs, pie graphs, doughnut graphs and polar area graphs in Grafana using Chart.js.

## Installation

clone this repository into your plugin directory

```
git clone https://github.com/CopperHill-Consulting/grafana-chartjs-panel.git
brew services restart grafana
```

## Drilldown Links
You can add drilldown links to segments.  In addition there are meta groups that can be used to pass time ranges and variables to the drilldown links.

### Time Specific
If you want to copy the same time range values into the drilldown link you can use one of the following:

- `${time}`
   
  This will evaluate to the URL search parameters for `from` and `to`.  For example, if the user selects "Last 5 years" as the time range then `https://example.com/d/ASDFghjkl/test?${time}` will evaluate to `https://example.com/d/ASDFghjkl/test?from=now-5y&to=now`.

- `${time-from}`

  This will evaluate to the URL search parameter for `from`.  For example, if the user selects "Last 6 months" as the time range then `https://example.com/d/ASDFghjkl/test?${time-from}` will evaluate to `https://example.com/d/ASDFghjkl/test?$from=now-5M`.
  
- `${time-to}`

  This will evaluate to the URL search parameter for `from`.  For example, if the user selects "This day last week" as the time range then `https://example.com/d/ASDFghjkl/test?${time-to}` will evaluate to `https://example.com/d/ASDFghjkl/test?$to=now-7d%2Fd`.
  
### Variables
If you want to use the value of variables in drilldown links you can use any of the following meta groups:

- `${var:name_of_variable}`

  Using this format gives you the ability to simply take the value(s) of the specified variable and put it into the drilldown link.  For example if you have a variable called `age` and the value is `25` you can use `https://example.com/d/ASDFghjkl/test?var-age=${var:age}` and `https://example.com/d/ASDFghjkl/test?var-age=25` will be the result.  Another example would be that the `age` variable has the values `25` and `34`.  If you use the same drilldown URL as before the result will be `https://example.com/d/ASDFghjkl/test?var-age=25%2C34` because both values will simply be concatenated by a comma.

- `${var:name_of_variable:param}`

  Using this format gives you the ability to simply take the value(s) of the specified variable and put it into the drilldown link with the name of the variable included.  For example if you have a variable called `age` and the value is `25` you can use `https://example.com/d/ASDFghjkl/test?${var:age:param}` and `https://example.com/d/ASDFghjkl/test?var-age=25` will be the result.  Another example would be that the `age` variable has the values `25` and `34`.  If you use the same drilldown URL as before the result will be `https://example.com/d/ASDFghjkl/test?var-age=25&var-age=34` because it passes each value in separately.
  
  **NOTE:**  If you prefix this meta group with "`var-`" these 4 characters will be ignored.  For example `https://example.com/d/ASDFghjkl/test?var-${var:age:param}` will still evaluate to `https://example.com/d/ASDFghjkl/test?var-age=25` in the case that `age` is `25`.  On the other hand, if you used `https://example.com/d/ASDFghjkl/test?svar-${var:age:param}` it would be evaluated to `https://example.com/d/ASDFghjkl/test?svar-var-age=25`.

- `${var:name_of_variable:param:name-of-url-param}`

  Using this format gives you the ability to simply take the value(s) of the specified variable and put it into the drilldown link with the name of the variable included as you specify.  For example if you have a variable called `age` and the value is `25` you can use `https://example.com/d/ASDFghjkl/test?${var:age:param:edad}` and `https://example.com/d/ASDFghjkl/test?edad=25` will be the result.  Another example would be that the `age` variable has the values `25` and `34`.  If you use the same drilldown URL as before the result will be `https://example.com/d/ASDFghjkl/test?edad=25&edad=34` because it passes each value in separately.
  
### Custom Tooltips
If the custom tooltips section is available, you can use any of the following meta groups:

- `${series}`

   This will be replaced with the name of the series of the segment that is being hovered.
   
- `${category}`

   This will be replaced with the name of the category of the segment that is being hovered.
   
- `${measure}`

   This will be replaced with the value of the measure that is being hovered.
   
- `${col:a_column_name}`

   This will be replaced with the value(s) of the column named "`a_column_name`".  If there are multiple values they will be concatenated by a comma.
   
- `${col:anotherColumnName:functionName}`

   This will be replaced with the value(s) of the column named "`anotherColumnName`" and will be processed according to the specified "`functionName`".  The function (specified by "`functionName`") will be used on the values that represent the hovered segment only.  Any of the following can be used as "`functionName`":

   - **`sum`** (eg. `${col:score:sum}`):  This will add all of the values for the specified column and use that sum as the value of the meta group.  If the specified column is a string the values will simply be concatenated without any spacing or any other characters.

   - **`avg`** (eg. `${col:score:avg}`):  This will add all of the values for the specified column, divide the result by the number of values and use that resulting average as the value of the meta group.

   - **`min`** (eg. `${col:grade:min}`):  This will find the minimum value of the values for the specified column and use that as the value of the meta group.

   - **`max`** (eg. `${col:grade:max}`):  This will find the maximum value of the values for the specified column and use that as the value of the meta group.

   - **`first`** (eg. `${col:zip_code:first}`):  This will use the first value of the specified column as the value of the meta group.

   - **`last`** (eg. `${col:zip_code:last}`):  This will use the last value of the specified column as the value of the meta group.

   - **`count`** (eg. `${col:section:count}`):  This will use the number of values for this segment as the value of the meta group.

   - **`unique-count`** (eg. `${col:section:unique-count}`):  This will use the number of unique values in the specified column as the value of the meta group.

   - **`list`** (eg. `${col:positionOrStage:list}`):  This will concatenate all of the (sorted) values of the specified column with a comma and a space with the exception of the last value being concatenated to the values with the word "and" surrounded by spaces.  The concatenated list will serve as the value of the meta group.

   - **`unique-list`** (eg. `${col:positionOrStage:unique-list}`):  This will concatenate all of the unique (sorted) values of the specified column with a comma and a space with the exception of the last value being concatenated to the values with the word "and" surrounded by spaces.  The concatenated list will serve as the value of the meta group.

## License
MIT
