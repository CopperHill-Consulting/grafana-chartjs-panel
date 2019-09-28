import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { getValueFormat, getValueFormats } from '@grafana/ui';
import config from 'app/core/config';
import _ from 'lodash';

import JS from './external/YourJS.min';
import * as Chart from './external/Chart.bundle.min';
import * as ChartDataLabels from './external/Chart.datalabels.plugin';
import './external/Chart.funnel';
import { Color } from './external/CWest-Color.min';

import { parseRegExp, wrapText } from './helper-functions';

const IS_LIGHT_THEME = config.theme.type === 'light'

const RGX_CELL_PLACEHOLDER = /\$\{(time)(?:-(to|from))?\}|\$\{(col|var):((?:[^\}:\\]*|\\.)+)(?::(?:(raw)|(param)(?::((?:[^\}:\\]*|\\.)+))?))?\}/g;
const RGX_OLD_VAR_WORKAROUND = /([\?&])var-(\$\{var:(?:[^\}:\\]*|\\.)+:param\})/g;

const COUNT_TYPE_MAP = {
  sum: _.sum,
  avg: _.mean,
  min: _.min,
  max: _.max,
  count: arr => arr.length,
  first: arr => arr[0],
  last: arr => arr[arr.length - 1],
};

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
  borderWidth: 1,
  colorBy: 'series',
  colorSource: 'auto',
  colorColumnName: null,
  seriesColors: [],
  isStacked: false,
  dataBgColorAlpha: 0.75,
  dataBorderColorAlpha: 1,
  dataBorderBrightness: 0.5,
  countType: 'sum',
  numberFormat: 'none',
  numberFormatDecimals: 0,
  tooltip: {
    isCustom: false,
    titleFormat:  null,
    labelFormat: null
  },
  labels: {
    isShowing: false,
    format: '${measure}',
    isBlackText: IS_LIGHT_THEME,
    wrapAfter: 25
  },
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

const FUNNEL_DEFAULTS = {
  hAlign: 'center',
  sortOrder: 'desc',
  categoryColumnName: null,
  measureColumnName: null,
  drilldownLinks: [],
  borderWidth: 1,
  colorSource: 'auto',
  colorColumnName: null,
  seriesColors: [],
  dataBgColorAlpha: 0.75,
  dataBorderColorAlpha: 1,
  dataBorderBrightness: 0.5,
  countType: 'sum',
  numberFormat: 'none',
  numberFormatDecimals: 0,
  tooltip: {
    isCustom: false,
    titleFormat:  null,
    labelFormat: null
  },
  // labels: {
  //   isShowing: false,
  //   format: '${measure}',
  //   isBlackText: IS_LIGHT_THEME,
  //   wrapAfter: 25
  // },
  gap: 1,
  startWidthPct: 0.5,
  legend: {
    isShowing: true,
    position: 'top',
    isFullWidth: false,
    isReverse: false
  }
};

const PIE_DEFAULTS = {
  pieType: 'pie',
  isSemiCircle: false,
  categoryColumnName: null,
  seriesColumnName: null,
  measureColumnName: null,
  labelColumnName: null,
  drilldownLinks: [],
  borderWidth: 1,
  colorBy: 'both',
  colorSource: 'auto',
  colorColumnName: null,
  seriesColors: [],
  dataBgColorAlpha: 0.75,
  dataBorderBrightness: 0.5,
  dataBorderColorAlpha: 1,
  countType: 'sum',
  numberFormat: 'none',
  numberFormatDecimals: 0,
  tooltip: {
    isCustom: false,
    titleFormat:  null,
    labelFormat: null
  },
  labels: {
    isShowing: false,
    format: '${measure}',
    isBlackText: IS_LIGHT_THEME,
    wrapAfter: 25
  },
  legend: {
    isShowing: true,
    position: 'top',
    isFullWidth: false,
    isReverse: false
  }
};

const OPTIONS_BY_TYPE = {
  bar: Object.keys(JS.flattenKeys(BAR_DEFAULTS, true)),
  pie: Object.keys(JS.flattenKeys(PIE_DEFAULTS, true)),
  funnel: Object.keys(JS.flattenKeys(FUNNEL_DEFAULTS, true))
};

const DISABLE_ANIMATIONS = !/^(0|[Ff]alse|[Oo]ff|[Nn]o|)$/.test([JS.parseQS(location.href).__noanimation] + '');

export class ChartJsPanelCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    
    this.UNIT_FORMATS = getValueFormats();
    this.GRID_LINE_OPACITIES = [
      { value: false, text: 'None' },
      { value: 0.15, text: 'Light' },
      { value: 0.65, text: 'Dark' }
    ];
    this.CHART_START_WIDTH_PERCENTAGES = [
      { value: 0, text: '0% (Point)' },
      { value: 0.25, text: '25%' },
      { value: 0.5, text: '50% (Half)' },
      { value: 0.75, text: '75%' },
      { value: 1, text: '100% (Full)' }
    ];
    this.CHART_BORDER_WIDTHS = [
      { value: 0, text: '0px (NO BORDER)' },
      { value: 1, text: '1px' },
      { value: 2, text: '2px' },
      { value: 3, text: '3px' }
    ];
    this.CHART_GAP_SIZES = [
      { value: 0, text: '0px (NO GAP)' },
      { value: 1, text: '1px' },
      { value: 2, text: '2px' },
      { value: 3, text: '3px' },
      { value: 4, text: '4px' },
      { value: 5, text: '5px' }
    ];
    this.CHART_COLOR_BY = [
      { value: 'series', text: 'Series' },
      { value: 'category', text: 'Category' },
      { value: 'both', text: 'Series & Category' }
    ];
    this.CHART_COLOR_SOURCES = [
      { value: 'column', text: 'Column' },
      { value: 'auto', text: 'Rainbow' },
      { value: 'custom', text: 'User-defined' }
    ];
    this.CHART_LABEL_SOURCES = [
      { value: null, text: 'None' },
      { value: 'column', text: 'Column' },
      { value: 'custom', text: 'User-defined' }
    ];
    this.CHART_TYPES = [
      { value: null, 'text': '--- PICK ONE ---' },
      { value: 'bar', text: 'Bar' },
      { value: 'funnel', text: 'Funnel' },
      { value: 'pie', text: 'Pie' }
    ];
    this.PIE_TYPES = [
      { value: null, 'text': '--- PICK ONE ---' },
      { value: 'pie', text: 'Default' },
      { value: 'polar', text: 'Polar' },
      { value: 'doughnut', text: 'Doughnut' }
    ];
    this.COUNT_TYPES = [{ value: null, text: '--- PICK ONE ---' }].concat(
      Object.keys(COUNT_TYPE_MAP).map(t => ({ value: t, text: JS.titleCase(t) }))
    );
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
    this.BRIGHTNESSES = _.range(0, 101, 5).map(x => ({
      value: x / 100, text: `${x}%` + (x ? x === 100 ? ' (White)' : '' : ' (Black)')
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

      case 'pie':
        _.defaultsDeep(panel.pie = panel.pie || {}, PIE_DEFAULTS);
        break;
    }
  }

  addSeriesColor(opt_index) {
    let panel = this.panel;
    let colors = panel[panel.chartType].seriesColors;
    colors.splice(opt_index == null ? colors.length : opt_index, 0, Color('black') + '');
    this.renderNow();
  }

  moveSeriesColor(fromIndex, toIndex) {
    let colors = this.getChartPanel().seriesColors;
    colors.splice(toIndex, 0, colors.splice(fromIndex, 1)[0]);
    this.renderNow();
  }

  removeSeriesColor(opt_index) {
    let panel = this.panel;
    let colors = panel[panel.chartType].seriesColors;
    let count = colors.length;
    if (count) {
      colors.splice(opt_index == null ? count - 1 : opt_index, 1);
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
      let { type, columns, rows } = dataList[0];
      let columnTexts = columns.map(col => 'string' === typeof col ? col : col.text);
      rows.map(
        row => Object.assign(row, {
          byColName: row.reduce(
            (carry, cellValue, cellIndex) => Object.assign(carry, { [columnTexts[cellIndex]]: cellValue }),
            {}
          )
        })
      );
      this.data = {
        type,
        columns,
        rows,
        columnTexts,
        colIndexesByText: columnTexts.reduceRight(
          (indexes, colText, index) =>
            Object.assign(indexes, { [colText]: index }),
          {}
        )
      };
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

  isActiveOption(...paths) {
    return paths.every(path => (OPTIONS_BY_TYPE[this.panel.chartType] || []).includes(path));
  }

  setActiveOption(path, value) {
    let panel = this.getChartPanel();
    if (_.has(panel, path)) {
      _.set(panel, path, value);
      this.renderNow();
    }
  }

  getChartPanel() {
    return this.panel[this.panel.chartType];
  }

  getColIndex(name, panel, opt_isOptional) {
    let { colIndexesByText } = this.data;
    let key = name + 'ColumnName';
    let isRequired = !opt_isOptional || panel[key] != undefined;
    if (isRequired && !_.has(colIndexesByText, panel[key])) {
      throw new Error(`Invalid ${name} column.`);
    }
    return isRequired ? colIndexesByText[panel[key]] : -1;
  }

  drawChart(e, jElem) {
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
      jCanvas.prop({ width: jContent.width(), height: jContent.height() });
      try {
        if (!data.columnTexts) {
          throw new Error('No source data has been specified.');
        }

        if (data.type !== 'table') {
          throw new Error('Data type must be "table".');
        }

        if ('bar' === chartType) {
          ctrl.drawBarChart(canvas);
        }
        else if ('funnel' === chartType) {
          ctrl.drawFunnelChart(canvas);
        }
        else if ('pie' === chartType) {
          ctrl.drawPieChart(canvas);
        }
        isValid = true;
      }
      catch (e) {
        console.error('drawChart:', error = e);
      }
    }
    if (!isValid) {
      let msg = 'No data' + (error ? ':  \r\n' + error.message : '.');
      let elemMsg = JS.dom({
        _: 'div', style: { display: 'flex', alignItems: 'center', textAlign: 'center', height: '100%' }, $: [
          { _: 'div', cls: 'alert alert-error', style: { margin: '0px auto' }, text: msg }
        ]
      });
      jContent.html('').append(elemMsg);
    }
  }

  getChartOptions(chartType) {
    let ctrl = this;
    let { data } = ctrl;
    let { rows, colIndexesByText } = data;
    let fullPanel = ctrl.panel;
    let panel = fullPanel[chartType];
    let { colorSource, seriesColors, colorColumnName, colorBy, sortOrder, countType, labels: labelOptions } = panel;

    let categoryColIndex = ctrl.getColIndex('category', panel);
    let seriesColIndex = panel.pieType === 'polar' ? -1 : ctrl.getColIndex('series', panel, true);
    let measureColIndex = ctrl.getColIndex('measure', panel);
    let labelColIndex = ctrl.getColIndex('label', panel, true);
    let colorColIndex = colorSource === 'column' ? ctrl.getColIndex('color', panel, true) : -1;
    let stackColIndex = ctrl.getColIndex('stack', panel, true);
    let ignoreSeries = seriesColIndex < 0;

    let categories = _.uniq(rows.map(row => row[categoryColIndex]));
    let series = _.uniq(rows.map(row => row[seriesColIndex]));
    if (chartType === 'pie') {
      categories.reverse();
      series.reverse();
    }

    let categoryCount = categories.length;
    let seriesCount = series.length;
    let measureCount = categoryCount * seriesCount;
    let { measures, labels, colors, rowGroups, seriesStacks } = rows.reduce((carry, row, rowIndex) => {
      let seriesIndex = series.indexOf(row[seriesColIndex]);
      let measureIndex = categories.indexOf(row[categoryColIndex]) + seriesIndex * categoryCount;
      (carry.measures[measureIndex] = carry.measures[measureIndex] || []).push(row[measureColIndex]);
      (carry.rowGroups[measureIndex] = carry.rowGroups[measureIndex] || []).push(row);
      carry.labels[measureIndex] = carry.labels[measureIndex] || row[labelColIndex];
      carry.colors[measureIndex] = carry.colors[measureIndex] || row[colorColIndex];
      carry.seriesStacks[seriesIndex] = carry.seriesStacks[seriesIndex] || row[stackColIndex];
      return carry;
    }, { measures: [], labels: [], colors: [], rowGroups: [], seriesStacks: [] });

    let countMeasures = COUNT_TYPE_MAP[countType];
    if (!countMeasures) {
      throw new Error(`Unknown count type:\t${countType}`);
    }
    for (let i = measureCount; i--; ) {
      measures[i] = countMeasures(measures[i] || [0]);
      rowGroups[i] = rowGroups[i] || [];
    }

    if (chartType === 'funnel') {
      let sortMap = measures.map((v, i) => ({ v, i })).sort(sortOrder === 'desc' ? (a, b) => b.v - a.v : (a, b) => a.v - b.v).map(({ i }) => i);
      let remap = (v, i, a) => a[sortMap[i]];
      measures = measures.map(remap);
      labels = labels.map(remap);
      colors = colors.map(remap);
      rowGroups = rowGroups.map(remap);
    }

    let baseColors;
    let seriesColorCount = seriesColors.length;

    if (colorSource === 'column') {
      if (!_.has(colIndexesByText, colorColumnName)) {
        throw new Error('Invalid color column.');
      }
      baseColors = colors.map(x => Color(x));
    }
    else {
      baseColors = [];
      if (colorSource === 'custom') {
        if (!seriesColorCount) {
          throw new Error('No base colors have been added.');
        }
        seriesColors = seriesColors.map(x => Color(x));
        series.forEach(function(seriesName, seriesIndex) {
          categories.forEach(function(category, categoryIndex) {
            let index = categoryIndex + seriesIndex * categoryCount;
            let colorIndex = colorBy === 'series' ? seriesIndex : colorBy === 'both' ? index : categoryIndex;
            baseColors[index] = seriesColors[colorIndex % seriesColorCount];
          });
        });
      }
      else {
        series.forEach(function(seriesName, seriesIndex) {
          categories.forEach(function(category, categoryIndex) {
            let index = categoryIndex + seriesIndex * categoryCount;
            let colorIndex = colorBy === 'series' ? seriesIndex : colorBy === 'both' ? index : categoryIndex;
            let colorCount = colorBy === 'series' ? seriesCount : colorBy === 'both' ? measureCount : categoryCount;
            baseColors[index] = Color.hsl(Math.round(360 * colorIndex / colorCount), 1, 0.5);
          });
        });
      }
    }

    // Derive the background and border colors from the base colors.
    let bgColors = baseColors.map(color => Color(color).a(panel.dataBgColorAlpha).rgba());
    let borderColors = baseColors.map(color => Color(color).l(panel.dataBorderBrightness).a(panel.dataBorderColorAlpha).rgba());

    function formatLabelText(strFormat, rows, series, category, measure) {
      return strFormat.replace(
        /(\\\$)|\$\{(?:(series)|(category)|measure|col:((?:[^\\\}:]+|\\.)+)(?::([\-\w]+))?)\}/g,
        function (match, isEscapedDollar, isSeries, isCategory, colName, colFnName) {
          if (isEscapedDollar) {
            match = '$';
          }
          else if (colName) {
            colName = colName.replace(/\\(.)/g, '$1');
            if (_.has(rows[0].byColName, colName)) {
              match = rows.map(row => row.byColName[colName]);
              match = colFnName === 'sum'
                ? match.reduce((a, b) => a + b)
                : colFnName === 'avg'
                  ? match.reduce((a, b) => a + b) / match.length
                  : colFnName === 'max'
                    ? match.reduce((a, b) => a > b ? a : b)
                    : colFnName === 'min'
                      ? match.reduce((a, b) => a < b ? a : b)
                      : colFnName === 'first'
                        ? match[0]
                        : colFnName === 'last'
                          ? match[match.length - 1]
                          : colFnName === 'count'
                            ? match.length
                            : colFnName === 'unique-count'
                              ? new Set(match).size
                              : colFnName === 'list'
                                ? match.sort().reduce((a, b, c, d) => a + (c + 1 === d.length ? ' and ' : ', ') + b)
                                : colFnName === 'unique-list'
                                  ? Array.from(new Set(match)).sort().reduce((a, b, c, d) => a + (c + 1 === d.length ? ' and ' : ', ') + b)
                                  : match.join(',');
            }
          }
          else {
            match = isSeries ? series : isCategory ? category : measure;
          }
          return 'number' === typeof match
            ? +match.toFixed(5)
            : match;
        }
      )
    }

    function getLabelFormatter(defaultFormat, labelType = 'tooltip') {
      labelType = labelType.toLowerCase();
      let isForChart = labelType === 'chart';
      let isForTooltip = labelType === 'tooltip';
      if (!(isForChart || isForTooltip)) {
        throw new Error(`Unknown label format:\t${labelType}`);
      }
      return function () {
        if (isForTooltip) {
          let tooltipItems = arguments[0];
          var isForTitle = Array.isArray(tooltipItems);
          var { datasetIndex: seriesIndex, index: categoryIndex } = isForTitle ? tooltipItems[0] : tooltipItems;
        }
        else {
          let labelItem = arguments[1];
          var isForTitle = false;
          var { datasetIndex: seriesIndex, dataIndex: categoryIndex } = labelItem;
        }
        let category = categories[categoryIndex];
        let seriesName = series[seriesIndex];
        let measureIndex = categoryIndex + seriesIndex * categoryCount;

        let measure = measures[measureIndex];
        let rows = rowGroups[measureIndex];
        let { numberFormat, numberFormatDecimals } = panel;
        let { isCustom, titleFormat, labelFormat } = panel.tooltip;
        let strMeasure = (!['none', null, void 0].includes(numberFormat) && 'number' === typeof measure)
            ? getValueFormat(numberFormat)(measure, numberFormatDecimals, null)
            : measure;
        let strFormat = (
          isForTooltip
          ? (isCustom && (isForTitle ? titleFormat : labelFormat))
          : labelOptions.format
        ) || defaultFormat;

        let strResult = strFormat.replace(
          /(\\\$)|\$\{(?:(series)|(category)|measure|col:((?:[^\\\}:]+|\\.)+)(?::([\-\w]+))?)\}/g,
          function (match, isEscapedDollar, isSeries, isCategory, colName, colFnName) {
            if (isEscapedDollar) {
              match = '$';
            }
            else if (colName) {
              colName = colName.replace(/\\(.)/g, '$1');
              if (_.has(rows[0].byColName, colName)) {
                match = rows.map(row => row.byColName[colName]);
                match = colFnName === 'sum'
                  ? match.reduce((a, b) => a + b)
                  : colFnName === 'avg'
                    ? match.reduce((a, b) => a + b) / match.length
                    : colFnName === 'max'
                      ? match.reduce((a, b) => a > b ? a : b)
                      : colFnName === 'min'
                        ? match.reduce((a, b) => a < b ? a : b)
                        : colFnName === 'first'
                          ? match[0]
                          : colFnName === 'last'
                            ? match[match.length - 1]
                            : colFnName === 'count'
                              ? match.length
                              : colFnName === 'unique-count'
                                ? new Set(match).size
                                : colFnName === 'list'
                                  ? match.sort().reduce((a, b, c, d) => a + (c + 1 === d.length ? ' and ' : ', ') + b)
                                  : colFnName === 'unique-list'
                                    ? Array.from(new Set(match)).sort().reduce((a, b, c, d) => a + (c + 1 === d.length ? ' and ' : ', ') + b)
                                    : colFnName === 'titlecase'
                                      ? JS.titleCase(match[0] + '')
                                      : colFnName === 'uppercase'
                                        ? (match[0] + '').toUpperCase()
                                        : colFnName === 'lowercase'
                                          ? (match[0] + '').toLowerCase()
                                          : match.join(',');
              }
            }
            else {
              // coerces to strings while making sure that undefined and null become empty strings
              match = [] + [isSeries ? seriesName : isCategory ? category : strMeasure];
            }
            return 'number' === typeof match
              ? +match.toFixed(5)
              : match;
          }
        ) || '';
        
        return isForChart
          ? wrapText(strResult, labelOptions.wrapAfter)
          : strResult;
      }
    }

    return {
      ctrl,
      data,
      rows,
      colIndexesByText,
      fullPanel,
      panel,
      countType,
      categoryColIndex,
      seriesColIndex,
      measureColIndex,
      labelColIndex,
      colorColIndex,
      stackColIndex,
      seriesStacks,
      ignoreSeries,
      categories,
      series,
      categoryCount,
      seriesCount,
      measures,
      measureCount,
      labels,
      rowGroups,
      baseColors,
      bgColors,
      borderColors,
      sortOrder,
      formatLabel: getLabelFormatter('${category}: ${measure}', 'chart'),
      tooltipCallbacks: {
        title: getLabelFormatter('${series}'),
        label: getLabelFormatter('${category}: ${measure}')
      },
      testChartEvent(e, callback) {
        let elem = this.getElementAtEvent(e)[0];
        let isOpen;
        if (elem) {
          let { _datasetIndex: seriesIndex, _index: categoryIndex } = elem;
          let category = categories[categoryIndex];
          let seriesName = series[seriesIndex];
          isOpen = panel.drilldownLinks.some((drilldownLink, drilldownLinkIndex) => {
            // Check this link to see if it matches...
            let { url, category: rgxCategory, series: rgxSeries } = drilldownLink;
            if (url) {
              if (parseRegExp(rgxCategory).test(category) && (ignoreSeries || parseRegExp(rgxSeries).test(seriesName))) {
                callback(
                  drilldownLinkIndex,
                  rowGroups[categoryIndex + seriesIndex * categoryCount]
                );
                return true;
              }
            }
          });
        }

        if (!isOpen) {
          callback(-1, []);
        }
      }
    };
  }

  drawPieChart(canvas) {
    let {
      ctrl,
      panel,
      labelColIndex,
      colorColIndex,
      categories,
      series,
      categoryCount,
      measures,
      bgColors,
      borderColors,
      tooltipCallbacks,
      formatLabel,
      testChartEvent
    } = this.getChartOptions('pie');

    let datasets = series.map((seriesName, seriesIndex) => {
      let fnFilter = (measure, measureIndex) => ~~(measureIndex / categoryCount) === seriesIndex;
      return {
        label: categories,
        data: measures.filter(fnFilter),
        borderWidth: panel.borderWidth,
        borderColor: borderColors.filter(fnFilter),
        backgroundColor: bgColors.filter(fnFilter),
        datalabels: {
          anchor: 'center',
          display: 'auto',
          backgroundColor: Color(panel.labels.isBlackText ? 'white' : 'black').a(0.75).rgba(),
          color: Color(panel.labels.isBlackText ? 'black' : 'white').rgb(),
          borderRadius: 5,
          formatter: formatLabel,
          textAlign: 'center'
        }
      };
    });

    let chartConfig = {
      responsive: true,
      data: {
        datasets,
        labels: datasets[0].label
      },
      options: {
        circumference: (panel.isSemiCircle ? 1 : 2) * Math.PI,
        rotation: -Math.PI / (panel.isSemiCircle ? 1 : 2),
        elements: { borderWidth: panel.borderWidth },
        tooltips: {
          callbacks: tooltipCallbacks
        },
        legend: {
          display: panel.legend.isShowing,
          position: panel.legend.position,
          fullWidth: panel.legend.isFullWidth,
          reverse: panel.legend.isReverse,
          labels: {
            fontColor: IS_LIGHT_THEME ? '#333' : '#CCC'
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        },
        onClick: function (e) {
          testChartEvent.call(this, e, (drilldownLinkIndex, matchingRows) => {
            if (drilldownLinkIndex >= 0) {
              ctrl.openDrilldownLink(panel.drilldownLinks[drilldownLinkIndex], matchingRows);
            }
          });
        },
        hover: {
          onHover: function (e) {
            testChartEvent.call(this, e, (drilldownLinkIndex, matchingRows) => {
              e.target.style.cursor = drilldownLinkIndex >= 0 ? 'pointer' : 'default';
            });
          }
        }
      }
    };

    if (DISABLE_ANIMATIONS) {
      chartConfig.options.animation = false;
    }

    if (panel.labels.isShowing) {
      chartConfig.plugins = [ChartDataLabels];
    }

    let ctx = canvas.getContext('2d');
    if (panel.pieType === 'polar') {
      Chart.PolarArea(ctx, chartConfig);
    }
    else {
      chartConfig.type = panel.pieType === 'doughnut' ? 'doughnut' : 'pie';
      new Chart(ctx, chartConfig);
    }
  }

  drawBarChart(canvas) {
    let {
      ctrl,
      panel,
      seriesStacks,
      ignoreSeries,
      categories,
      series,
      categoryCount,
      measures,
      rowGroups,
      bgColors,
      borderColors,
      tooltipCallbacks,
      formatLabel,
      testChartEvent
    } = this.getChartOptions('bar');

    // If legacy bar chart colors exist convert them to new color setup
    if (_.has(panel, ['seriesColors', 0, 'text'])) {
      panel.seriesColors = panel.seriesColors.map(color => color.color);
      panel.colorSource = 'custom';
    }
    
    let datasets = series.map((seriesName, seriesIndex) => {
      let fnFilter = (measure, measureIndex) => ~~(measureIndex / categoryCount) === seriesIndex;
      return {
        label: seriesName,
        data: measures.filter(fnFilter),
        borderWidth: panel.borderWidth,
        borderColor: borderColors.filter(fnFilter),
        backgroundColor: bgColors.filter(fnFilter),
        stack: panel.isStacked ? seriesStacks[seriesIndex] : seriesIndex,
        datalabels: {
          anchor: 'center',
          display: 'auto',
          backgroundColor: Color(panel.labels.isBlackText ? 'white' : 'black').a(0.75).rgba(),
          color: Color(panel.labels.isBlackText ? 'black' : 'white').rgb(),
          borderRadius: 5,
          formatter: formatLabel,
          textAlign: 'center'
        }
      };
    });
    
    let chartConfig = {
      type: panel.orientation === 'horizontal' ? 'horizontalBar' : 'bar',
      data: {
        datasets,
        labels: categories
      },
      //plugins: [ChartDataLabels],
      options: {
        responsive: true,
        tooltips: {
          mode: 'point',
          callbacks: tooltipCallbacks
        },
        legend: {
          display: panel.legend.isShowing,
          position: panel.legend.position,
          fullWidth: panel.legend.isFullWidth,
          reverse: panel.legend.isReverse,
          labels: {
            fontColor: IS_LIGHT_THEME ? '#333' : '#CCC'
          }
        },
        scales: {
          xAxes: [
            {
              ticks: {
                autoSkip: panel.scales.xAxes.ticks.autoSkip,
                minRotation: panel.scales.xAxes.ticks.minRotation,
                maxRotation: panel.scales.xAxes.ticks.maxRotation,
                fontColor: IS_LIGHT_THEME ? '#333' : '#CCC',
                userCallback: function (value, index, values) {
                  let { numberFormat, numberFormatDecimals } = panel;
                  return (!['none', null, void 0].includes(numberFormat) && 'number' === typeof value)
                    ? getValueFormat(numberFormat)(value, numberFormatDecimals, null)
                    : value;
                }
              },
              stacked: true,
              gridLines: {
                display: !!panel.scales.xAxes.gridLineOpacity,
                color: IS_LIGHT_THEME ? `rgba(0,0,0,${+panel.scales.xAxes.gridLineOpacity})` : `rgba(255,255,255,${+panel.scales.xAxes.gridLineOpacity})`
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                autoSkip: panel.scales.yAxes.ticks.autoSkip,
                minRotation: panel.scales.yAxes.ticks.minRotation,
                maxRotation: panel.scales.yAxes.ticks.maxRotation,
                fontColor: IS_LIGHT_THEME ? '#333' : '#CCC',
                userCallback: function (value, index, values) {
                  let { numberFormat, numberFormatDecimals } = panel;
                  return (!['none', null, void 0].includes(numberFormat) && 'number' === typeof value)
                    ? getValueFormat(numberFormat)(value, numberFormatDecimals, null)
                    : value;
                }
              },
              stacked: true,
              gridLines: {
                display: !!panel.scales.yAxes.gridLineOpacity,
                color: IS_LIGHT_THEME ? `rgba(0,0,0,${+panel.scales.yAxes.gridLineOpacity})` : `rgba(255,255,255,${+panel.scales.yAxes.gridLineOpacity})`
              }
            }
          ]
        },
        onClick: function (e) {
          testChartEvent.call(this, e, (drilldownLinkIndex, matchingRows) => {
            if (drilldownLinkIndex >= 0) {
              ctrl.openDrilldownLink(panel.drilldownLinks[drilldownLinkIndex], matchingRows);
            }
          });
        },
        hover: {
          onHover: function (e) {
            testChartEvent.call(this, e, (drilldownLinkIndex, matchingRows) => {
              e.target.style.cursor = drilldownLinkIndex >= 0 ? 'pointer' : 'default';
            });
          }
        }
      }
    };

    if (DISABLE_ANIMATIONS) {
      chartConfig.options.animation = false;
    }

    if (panel.labels.isShowing) {
      chartConfig.plugins = [ChartDataLabels];
    }

    let myChart = new Chart(canvas.getContext('2d'), chartConfig);
  }

  drawFunnelChart(canvas) {
    let {
      ctrl,
      panel,
      ignoreSeries,
      categories,
      series,
      categoryCount,
      measures,
      rowGroups,
      bgColors,
      borderColors,
      tooltipCallbacks,
      formatLabel,
      testChartEvent
    } = this.getChartOptions('funnel');

    let dataset = {
      label: categories,
      data: measures,
      borderWidth: 1,
      borderColor: borderColors,
      backgroundColor: bgColors,
      datalabels: panel.labels
        ? {
          anchor: 'center',
          display: 'auto',
          backgroundColor: Color(panel.labels.isBlackText ? 'white' : 'black').a(0.75).rgba(),
          color: Color(panel.labels.isBlackText ? 'black' : 'white').rgb(),
          borderRadius: 5,
          formatter: formatLabel,
          textAlign: 'center'
        }
        : null
    };

    let chartConfig = {
      type: 'funnel',
      responsive: true,
      data: {
        datasets: [ dataset ],
        labels: 'string' === typeof dataset.label
          ? dataset.data.map((x, i) => `${dataset.label} #${i + 1}`)
          : dataset.label
      },
      options: {
        startWidthPercent: panel.startWidthPct,
        sort: panel.sortOrder,
        elements: { borderWidth: panel.borderWidth },
        gap: panel.gap,
        keep: /^(left|right)$/.test(panel.hAlign || '') ? panel.hAlign : 'auto',
        tooltips: {
          callbacks: tooltipCallbacks
        },
        legend: {
          display: panel.legend.isShowing,
          position: panel.legend.position,
          fullWidth: panel.legend.isFullWidth,
          reverse: panel.legend.isReverse,
          labels: {
            fontColor: IS_LIGHT_THEME ? '#333' : '#CCC'
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        },
        onClick: function (e) {
          testChartEvent.call(this, e, (drilldownLinkIndex, matchingRows) => {
            if (drilldownLinkIndex >= 0) {
              ctrl.openDrilldownLink(panel.drilldownLinks[drilldownLinkIndex], matchingRows);
            }
          });
        },
        hover: {
          onHover: function (e) {
            testChartEvent.call(this, e, (drilldownLinkIndex, matchingRows) => {
              e.target.style.cursor = drilldownLinkIndex >= 0 ? 'pointer' : 'default';
            });
          }
        }
      }
    };

    if (DISABLE_ANIMATIONS) {
      chartConfig.options.animation = false;
    }

    // if (panel.labels.isShowing) {
    //   chartConfig.plugins = [ChartDataLabels];
    // }

    let myChart = new Chart(canvas.getContext('2d'), chartConfig);
  }

  openDrilldownLink(drilldownLink, matchingRows) {
    let { data: { colIndexesByText }, templateSrv: { variables }, timeSrv } = this;
    let { url, openInBlank } = drilldownLink;
    url = url.replace(RGX_OLD_VAR_WORKAROUND, '$1$2').replace(
      RGX_CELL_PLACEHOLDER,
      function (match, isTime, opt_timePart, type, name, isRaw, isParam, paramName) {
        if (isTime) {
          let { from, to } = timeSrv.timeRangeForUrl();
          return (opt_timePart != 'to' ? 'from=' + encodeURIComponent(from) : '')
            + (opt_timePart ? '' : '&')
            + (opt_timePart != 'from' ? 'to=' + encodeURIComponent(to) : '');
        }

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
              ? result.map(v => encodeURIComponent(paramName == undefined ? type === 'var' ? `var-${name}` : name : paramName) + '=' + encodeURIComponent(v)).join('&')
              : encodeURIComponent(result.join(','));
      }
    );
    window.open(url, drilldownLink.openInBlank ? '_blank' : '_self');    
  }

  getRange() {
    return _.range.apply(this, arguments);
  }

  link(scope, elem, attrs, ctrl) {
    this.events.on('renderNow', e => this.drawChart.call(this, e, elem));
    this.events.on('render', _.debounce(e => this.drawChart.call(this, e, elem), 250));
  }
}

// Dont add ChartDataLabels unless user requests this.
Chart.plugins.unregister(ChartDataLabels);

ChartJsPanelCtrl.templateUrl = 'partials/module.html';
