import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import JS from './external/YourJS.min';
import * as Chart from './external/Chart.bundle.min';
import * as ChartDataLabels from './external/Chart.datalabels.plugin';
import './external/Chart.funnel';
import config from 'app/core/config';
import {Color} from './external/CWest-Color.min';

const PANEL_DEFAULTS = {
  chartType: null
};

const BAR_DEFAULTS = {
  orientation: 'vertical',
  categoryColumnName: null,
  seriesColumnName: null,
  stackColumnName: null,
  measureColumnName: null,
  drilldownLinks: [],
  colorSource: 'auto',
  colorColumnName: null,
  seriesColors: [],
  isStacked: false,
  dataBgColorAlpha: 0.75,
  dataBorderColorAlpha: 1,
  legend: {
    isShowing: true,
    position: 'top',
    isFullWidth: false,
    isReverse: false
  },
  scales: {
    xAxes: {
      ticks: {
        autoSkip: true,
        minRotation: 0,
        maxRotation: 90
      },
      gridLineOpacity: 0.15
    },
    yAxes: {
      ticks: {
        autoSkip: true,
        minRotation: 0,
        maxRotation: 90
      },
      gridLineOpacity: 0.15
    }
  }
};
const BAR_OPTIONS = Object.keys(JS.flattenKeys(BAR_DEFAULTS, true));

const FUNNEL_DEFAULTS = {
  hAlign: 'center',
  sortOrder: 'asc',
  categoryColumnName: null,
  measureColumnName: null,
  drilldownLinks: [],
  colorSource: 'auto',
  colorColumnName: null,
  seriesColors: [],
  dataBgColorAlpha: 0.75,
  dataBorderColorAlpha: 1,
  gap: 1,
  legend: {
    isShowing: true,
    position: 'top',
    isFullWidth: false,
    isReverse: false
  }
};
const FUNNEL_OPTIONS = Object.keys(JS.flattenKeys(FUNNEL_DEFAULTS, true));

const OPTIONS_BY_TYPE = {
  bar: BAR_OPTIONS,
  funnel: FUNNEL_OPTIONS
};

function renderChart({canvas, data: { type: dataType, columns, rows, columnTexts, colIndexesByText }, panel: fullPanel, variables}) {
  if (!columnTexts) {
    throw new Error('No source data has been specified.');
  }

  if (dataType !== 'table') {
    throw new Error('Data type must be "table".');
  }

  let panel = fullPanel.bar;

  if (!_.has(colIndexesByText, panel.categoryColumnName)) {
    throw new Error('Invalid category column.');
  }
  let categoryIndex = colIndexesByText[panel.categoryColumnName];

  if (panel.seriesColumnName != undefined && !_.has(colIndexesByText, panel.seriesColumnName)) {
    throw new Error('Invalid series column.');
  }
  let seriesIndex = panel.seriesColumnName != undefined
    ? colIndexesByText[panel.seriesColumnName]
    : -1;

  if (panel.stackColumnName != undefined && !_.has(colIndexesByText, panel.stackColumnName)) {
    throw new Error('Invalid stack column.');
  }
  let stackIndex = panel.stackColumnName != undefined
    ? colIndexesByText[panel.stackColumnName]
    : -1;

  if (!_.has(colIndexesByText, panel.measureColumnName)) {
    throw new Error('Invalid measure column.');
  }
  let measureIndex = colIndexesByText[panel.measureColumnName];

  let colRows = rows.map(
    row =>
      row.reduceRight(
        (colRow, value, index) =>
          Object.assign(colRow, { [columnTexts[index]]: value }),
        {}
      )
  );

  let categories = [...new Set(rows.map(row => row[categoryIndex]))];
  let { series, seriesStacks } = rows.reduce(
    (carry, row) => {
      let seriesName = row[seriesIndex];
      if (!carry.series.includes(seriesName)) {
        carry.series.push(seriesName);
        carry.seriesStacks.push(row[stackIndex]);
      }
      return carry;
    },
    { series: [], seriesStacks: [] }
  );

  let oldColors = panel.seriesColors.slice();
  let newColors = series.map((seriesName, index, series) => {
    let oldIndex = oldColors.findIndex(c => c.text === seriesName);
    return {
      text: seriesName,
      color: oldIndex < 0
        ? Color.hsl(~~(360 * index / series.length), 1, 0.5) + ''
        : oldColors[oldIndex].color
    };
  });
  panel.seriesColors = newColors;

  // Defined with barChartData.data is defined...
  let measures = {};

  let barChartData = {
    labels: categories,
    datasets: series.map((seriesName, seriesNameIndex) => ({
      label: seriesName == undefined ? 'Series ' + (seriesNameIndex + 1) : seriesName,
      backgroundColor: Color(newColors[seriesNameIndex].color).a(panel.dataBgColorAlpha).rgba(),
      borderColor: Color(newColors[seriesNameIndex].color).a(panel.dataBorderColorAlpha).rgba(),
      borderWidth: 1,
      stack: panel.isStacked ? seriesStacks[seriesNameIndex] : seriesNameIndex,
      data: categories.map(category => {
        let sum = rows.reduce((sum, row) => {
          let isMatch = row[categoryIndex] === category
            && (seriesIndex < 0 || row[seriesIndex] === seriesName);
          return sum + (isMatch ? +row[measureIndex] || 0 : 0);
        }, 0);
        return (measures[category] = measures[category] || {})[seriesName] = sum;
      })
    }))
  };

  let isLightTheme = config.theme.type === 'light';

  let myChart = new Chart(canvas, {
    type: panel.orientation === 'horizontal' ? 'horizontalBar': 'bar',
    data: barChartData,
    //plugins: [ChartDataLabels],
    options: {
      responsive: true,
      legend: {
        display: panel.legend.isShowing,
        position: panel.legend.position,
        fullWidth: panel.legend.isFullWidth,
        reverse: panel.legend.isReverse,
        labels: {
          fontColor: isLightTheme ? '#333' : '#CCC'
        }
      },
      scales: {
        xAxes: [
          {
            ticks: {
              autoSkip: panel.scales.xAxes.ticks.autoSkip,
              minRotation: panel.scales.xAxes.ticks.minRotation,
              maxRotation: panel.scales.xAxes.ticks.maxRotation,
              fontColor: isLightTheme ? '#333' : '#CCC'
            },
            stacked: true,
            gridLines: {
              display: !!panel.scales.xAxes.gridLineOpacity,
              color: isLightTheme ? `rgba(0,0,0,${+panel.scales.xAxes.gridLineOpacity})` : `rgba(255,255,255,${+panel.scales.xAxes.gridLineOpacity})`
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              autoSkip: panel.scales.yAxes.ticks.autoSkip,
              minRotation: panel.scales.yAxes.ticks.minRotation,
              maxRotation: panel.scales.yAxes.ticks.maxRotation,
              fontColor: isLightTheme ? '#333' : '#CCC'
            },
            stacked: true,
            gridLines: {
              display: !!panel.scales.yAxes.gridLineOpacity,
              color: isLightTheme ? `rgba(0,0,0,${+panel.scales.yAxes.gridLineOpacity})` : `rgba(255,255,255,${+panel.scales.yAxes.gridLineOpacity})`
            }
          }
        ]
      },
      onClick: function(e) {
        let target = myChart.getElementAtEvent(e)[0],
            model = target && target._model;
        if (model) {
          let category = model.label;
          let series = model.datasetLabel;

          panel.drilldownLinks.reduce(function (isDone, drilldownLink) {
            // If a link has already been opened dont check the other links.
            if (isDone) {
              return isDone;
            }

            // Check this link to see if it matches...
            let url = drilldownLink.url;
            if (url) {
              let rgxCategory = parseRegExp(drilldownLink.category);
              let rgxSeries = parseRegExp(drilldownLink.series);
              if (rgxCategory.test(category) && (series == undefined || rgxSeries.test(series))) {
                url = url.replace(
                  /\${(col|var):((?:[^\}:\\]*|\\.)+)(?::(?:(raw)|(param)(?::((?:[^\}:\\]*|\\.)+))?))?}/g,
                  function(match, type, name, isRaw, isParam, paramName) {
                    let result = [...new Set(
                      type == 'col'
                        ? getColValuesFor(colIndexesByText[name], category, series, categoryIndex, seriesIndex, rows)
                        : getVarValuesFor(name, variables)
                    )];
                    return result.length < 1
                      ? match
                      : isRaw
                        ? result.join(',')
                        : isParam
                          ? result.map(v => encodeURIComponent(paramName == undefined ? name : paramName) + '=' + encodeURIComponent(v)).join('&')
                          : encodeURIComponent(result.join(','));
                  }
                );
                window.open(url, drilldownLink.openInBlank ? '_blank' : '_self');
                return true;
              }
            }
          }, false);
        }
      }
    }
  });
}

function getColValuesFor(colIndex, category, series, catColIndex, seriesColIndex, rows) {
  if (colIndex >= 0) {
    return rows.reduce((values, row) => {
      if (category === row[catColIndex] && (seriesColIndex < 0 || row[seriesColIndex] === series)) {
        values.push(row[colIndex]);
      }
      return values;
    }, []);
  }
  return [];
}

function getVarValuesFor(varName, variables) {
  return variables.reduce(
    (values, variable) => {
      // At times current.value is a string and at times it is an array.
      let varValues = JS.toArray(variable.current.value);
      let isAll = variable.includeAll && varValues.length === 1 && varValues[0] === '$__all';
      return variable.name === varName
        ? values.concat(isAll ? [variable.current.text] : varValues)
        : values;
    },
    []
  );
}

function parseRegExp(strPattern) {
  var parts = /^\/(.+)\/(\w*)$/.exec(strPattern);
  return parts ? new RegExp(parts[1], parts[2]) : new RegExp('^' + _.escapeRegExp(strPattern) + '$', 'i');
}

function renderNow(e, jElem) {
  let error,
      isValid = false,
      ctrl = this,
      chartType = ctrl.panel.chartType,
      data = ctrl.data,
      jContent = jElem.find('.panel-content').css('position', 'relative').html(''),
      elemContent = jContent[0],
      jCanvas = jQuery('<canvas>').appendTo(jContent),
      canvas = jCanvas[0];
  
  if (data && data.rows && data.rows.length) {
    if (data.type === 'table') {
      jCanvas.prop({ width: jContent.width(), height: jContent.height() });
      try {
        if ('bar' === chartType) {
          ctrl.drawBarChart(canvas);
        }
        else if ('funnel' === chartType) {
          ctrl.drawFunnelChart(canvas);
        }
        isValid = true;
      }
      catch(e) {
        console.error('renderChart:', error = e);
      }
    }
  }
  if (!isValid) {
    let msg = 'No data' + (error ? ':  \r\n' + error.message : '.');
    let elemMsg = JS.dom({ _: 'div', style: { display: 'flex', alignItems: 'center', textAlign: 'center', height: '100%' }, $: [
      { _: 'div', cls: 'alert alert-error', style: { margin: '0px auto' }, text: msg }
    ]});
    jContent.html('').append(elemMsg);
  }
}

export class ChartJsPanelCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);

    this.GRID_LINE_OPACITIES = [
      { value: false, text: 'None' },
      { value: 0.15, text: 'Light' },
      { value: 0.65, text: 'Dark' }
    ];
    this.CHART_COLOR_SOURCES = [
      { value: 'column', text: 'Column' },
      { value: 'auto', text: 'Rainbow' },
      { value: 'custom', text: 'User-defined' }
    ];
    this.CHART_TYPES = [
      { value: null, 'text': '--- PICK ONE ---' },
      { value: 'bar', text: 'Bar' },
      { value: 'funnel', text: 'Funnel' }
    ];
    this.CHART_ORIENTATIONS = [
      { value: 'horizontal', text: 'Horizontal (\u2194)' },
      { value: 'vertical', text: 'Vertical (\u2195)' }
    ];
    this.CHART_H_ALIGNMENTS = [
      { value: 'left', text: 'Left' },
      { value: 'center', text: 'Center' },
      { value: 'right', text: 'Right' }
    ];
    this.SORT_ORDERS = [
      { value: 'asc', text: 'Ascending' },
      { value: 'desc', text: 'Descending' }
    ];
    this.COLOR_ALPHAS = _.range(0, 101, 5).map(x => ({
      value: x / 100, text: `${x}%` + (x ? x === 100 ? ' (Solid)' : '' : ' (Invisible)')
    }));
    this.TICK_ROTATIONS = _.range(0, 91, 5).map(x => ({
      value: x, text: `${x}\xB0` + (x ? x === 90 ? ' (Vertical)' : '' : ' (Horizontal)')
    }));

    this.$rootScope = $rootScope;
    this.data = null;

    this.setPanelDefaults();

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
  }

  // Setup the appropriate defaults and make sure that any old bar chart data
  // is migrated to the new structure.
  setPanelDefaults() {
    let panel = this.panel;
    _.defaultsDeep(panel, PANEL_DEFAULTS);
    switch (panel.chartType) {
      case 'horizontalBar':
        panel.chartType = 'bar';
        panel.orientation = 'horizontal';
      case 'bar':
        if (!panel.bar) {
          panel.bar = {};
        }
        _.defaultsDeep(panel.bar, BAR_DEFAULTS);
        Object.keys(BAR_DEFAULTS).forEach(key => {
          if (_.has(panel, key)) {
            panel.bar[key] = panel[key];
            delete panel[key];
          }
        });
        break;

      case 'funnel':
        _.defaultsDeep(panel.funnel = panel.funnel || {}, FUNNEL_DEFAULTS);
        break;
    }
  }

  addSeriesColor(opt_index) {
    let panel = this.panel;
    let colors = panel[panel.chartType].seriesColors;
    colors.splice(opt_index == null ? colors.length : opt_index, 0, Color('black') + '');
    this.renderNow();
  }

  removeSeriesColor(opt_index) {
    let panel = this.panel;
    let seriesColors = panel[panel.chartType].seriesColors;
    let count = seriesColors.length;
    if (count) {
      seriesColors.splice(opt_index == null ? count - 1 : opt_index, 1);
      this.renderNow();
    }
  }

  addDrilldownLink() {
    let drilldownLink = {
      url: '',
      openInBlank: true
    };

    if (this.isActiveOption('categoryColumnName')) {
      drilldownLink.category = '/[^]*/';
    }
    if (this.isActiveOption('seriesColumnName')) {
      drilldownLink.series = '/[^]*/';
    }

    this.getChartPanel().drilldownLinks.push(drilldownLink);
  }

  removeDrilldownLink(drilldownLink) {
    let links = this.getChartPanel().drilldownLinks;
    links.splice(links.indexOf(drilldownLink), 1);
  }

  onInitEditMode() {
    let path = 'public/plugins/westc-chartjs-panel/partials/';
    this.addEditorTab('Options', `${path}editor.html`, 2);
    this.addEditorTab('Series Colors', `${path}series-colors.html`, 3);
    this.addEditorTab('Drill-down Links', `${path}drilldown-links.html`, 4);
  }

  onDataError() {
    this.renderNow();
  }

  onDataReceived(dataList) {
    if (dataList && dataList.length) {
      let data = dataList[0];
      let { type, columns, rows } = data;
      let columnTexts = columns.map(col => 'string' === typeof col ? col : col.text);
      let colIndexesByText = columnTexts.reduceRight(
        (indexes, colText, index) =>
          Object.assign(indexes, { [colText]: index }),
        {}
      );
      this.data = { type, columns, rows, columnTexts, colIndexesByText };
    }
    else {
      this.data = {};
    }

    this.renderNow();
  }

  onChangeCallback(obj, key) {
    return newValue => {
      obj[key] = newValue;
      this.renderNow();
    };
  }

  renderNow() {
    this.events.emit('renderNow');
  }

  isActiveOption(...keys) {
    return keys.every(key => (OPTIONS_BY_TYPE[this.panel.chartType] || []).includes(key));
  }

  getChartPanel() {
    return this.panel[this.panel.chartType];
  }

  drawBarChart(canvas) {
    renderChart({
      canvas,
      data: this.data,
      panel: this.panel,
      variables: this.templateSrv.variables
    });
  }

  drawFunnelChart(canvas) {
    let ctrl = this;
    let data = ctrl.data;
    let { rows, colIndexesByText } = data;
    let fullPanel = ctrl.panel;
    let panel = fullPanel.funnel;

    if (!_.has(colIndexesByText, panel.categoryColumnName)) {
      throw new Error('Invalid category column.');
    }
    let categoryColIndex = colIndexesByText[panel.categoryColumnName];

    if (!_.has(colIndexesByText, panel.measureColumnName)) {
      throw new Error('Invalid measure column.');
    }
    let measureColIndex = colIndexesByText[panel.measureColumnName];

    let categories = _.uniq(rows.map(row => row[categoryColIndex]));
    let measures = rows.reduce((measures, row, rowIndex) => {
      let measureIndex = categories.indexOf(row[categoryColIndex]);
      measures[measureIndex] = (measures[measureIndex] || 0) + row[measureColIndex];
      return measures;
    }, []);

    let baseColors;
    let { colorSource, seriesColors, colorColumnName, sortOrder } = panel;
    console.log({ colorSource, seriesColors, colorColumnName, sortOrder });
    if (colorSource === 'column') {
      if (!_.has(colIndexesByText, colorColumnName)) {
        throw new Error('Invalid color column.');
      }
      let colorColIndex = colIndexesByText[colorColumnName];
      baseColors = categories.map(category => Color(rows.find(row => row[categoryColIndex] === category)[colorColIndex]));
    }
    else if (colorSource === 'custom') {
      baseColors = categories.map((category, index, categories) => {
        return Color(seriesColors[index % seriesColors.length]);
      });
    }
    else {
      baseColors = categories.map((category, index, categories) => {
        return Color.hsl(~~(360 * index / categories.length), 1, 0.5);
      });
    }

    let isLightTheme = config.theme.type === 'light';

    // Sort the measures and then the categories accordingly.
    let altBaseColors;
    measures = measures.map((value, index) => ({ index, value }));
    measures.sort(sortOrder === 'desc' ? (a, b) => b.value - a.value : (a, b) => a.value - b.value);
    [altBaseColors, categories, measures] = measures.reduce((carry, measure, index) => {
      let [altBaseColors, newCategories, newMeasures] = carry;
      altBaseColors.push(baseColors[measure.index]);
      newCategories.push(categories[measure.index]);
      newMeasures.push(measure.value);
      return carry;
    }, [[], [], []]);

    // If using a column as the source of the colors make sure to order them according to the categories.
    if (colorSource === 'column') {
      baseColors = altBaseColors;
    }

    // Derive the background and border colors from the base colors.
    let bgColors = baseColors.map(color => color.a(panel.dataBgColorAlpha).rgba());
    let borderColors = baseColors.map(color => color.a(panel.dataBorderColorAlpha).rgba());

    let dataset = {
      label: categories,
      data: measures,
      borderWidth: 1,
      borderColor: borderColors,
      backgroundColor: bgColors
    };

    let chartConfig = {
      type: 'funnel',
      // plugins: [ChartDataLabels],
      responsive: true,
      data: {
        datasets: [ dataset ],
        labels: 'string' === typeof dataset.label
          ? dataset.data.map((x, i) => `${dataset.label} #${i + 1}`)
          : dataset.label
      },
      options: {
        sort: panel.sortOrder,
        elements: { borderWidth: 1 },
        gap: panel.gap,
        keep: /^(left|right)$/.test(panel.hAlign || '') ? panel.hAlign : 'auto',
        legend: {
          display: panel.legend.isShowing,
          position: panel.legend.position,
          fullWidth: panel.legend.isFullWidth,
          reverse: panel.legend.isReverse,
          labels: {
            fontColor: isLightTheme ? '#333' : '#CCC'
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        },
        onClick (e) {
          let elem = this.getElementAtEvent(e)[0];
          if (elem) {
            let category = categories[elem._index];
            let isOpen = panel.drilldownLinks.some(drilldownLink => {
              // Check this link to see if it matches...
              let { url, category: rgxCategory } = drilldownLink;
              if (url) {
                rgxCategory = parseRegExp(rgxCategory);
                if (rgxCategory.test(category)) {
                  let matchingRows = rows.filter(row => row[categoryColIndex] === category);
                  ctrl.openDrilldownLink(drilldownLink, matchingRows);
                  return true;
                }
              }
            });

            if (!isOpen) {
              console.log('No matching drilldown link was found for category:', category, rows);
            }
          }
        }
      }
    };

    let myChart = new Chart(canvas.getContext('2d'), chartConfig);
  }

  openDrilldownLink(drilldownLink, matchingRows) {
    let { data: { colIndexesByText }, templateSrv: { variables } } = this;
    let { url, openInBlank } = drilldownLink;
    url = url.replace(
      /\${(col|var):((?:[^\}:\\]*|\\.)+)(?::(?:(raw)|(param)(?::((?:[^\}:\\]*|\\.)+))?))?}/g,
      function (match, type, name, isRaw, isParam, paramName) {
        name = name && name.replace(/\\(.)/g, '$1');
        paramName = paramName && paramName.replace(/\\(.)/g, '$1');
        let result = _.uniq(
          type == 'col'
            ? matchingRows.map(row => row[colIndexesByText[name]])
            : variables.reduce(
              (values, variable) => {
                // At times current.value is a string and at times it is an array.
                let varValues = JS.toArray(variable.current.value);
                let isAll = variable.includeAll && varValues.length === 1 && varValues[0] === '$__all';
                return variable.name === name
                  ? values.concat(isAll ? [variable.current.text] : varValues)
                  : values;
              },
              []
            )
        );
        return result.length < 1
          ? match
          : isRaw
            ? result.join(',')
            : isParam
              ? result.map(v => encodeURIComponent(paramName == undefined ? name : paramName) + '=' + encodeURIComponent(v)).join('&')
              : encodeURIComponent(result.join(','));
      }
    );
    window.open(url, drilldownLink.openInBlank ? '_blank' : '_self');    
  }

  link(scope, elem, attrs, ctrl) {
    this.events.on('renderNow', e => renderNow.call(this, e, elem));
    this.events.on('render', _.debounce(e => renderNow.call(this, e, elem), 250));
  }
}

// Dont add ChartDataLabels unless user requests this.
Chart.plugins.unregister(ChartDataLabels);

ChartJsPanelCtrl.templateUrl = 'partials/module.html';
