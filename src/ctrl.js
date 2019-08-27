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
  max: _.max
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
  numberFormat: 'none',
  numberFormatDecimals: 0,
  tooltip: {
    isCustom: false,
    titleFormat:  null,
    labelFormat: null
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
  numberFormat: 'none',
  numberFormatDecimals: 0,
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
  numberFormat: 'none',
  numberFormatDecimals: 0,
  labels: {
    isShowing: true,
    isBlackText: false,
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

  formatTooltipText(strFormat, rowsByColName, series, category, measure) {
    return strFormat.replace(
      /(\\\$)|\$\{(?:(series)|(category)|measure|col:((?:[^\\\}:]+|\\.)+)(?::([\-\w]+))?)\}/g,
      function (match, isEscapedDollar, isSeries, isCategory, colName, colFnName) {
        if (isEscapedDollar) {
          match = '$';
        }
        else if (colName) {
          colName = colName.replace(/\\(.)/g, '$1');
          if (_.has(rowsByColName[0], colName)) {
            match = rowsByColName.map(row => row[colName]);
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
      let data = dataList[0];
      let { type, columns, rows } = data;
      let columnTexts = columns.map(col => 'string' === typeof col ? col : col.text);
      let colIndexesByText = columnTexts.reduceRight(
        (indexes, colText, index) =>
          Object.assign(indexes, { [colText]: index }),
        {}
      );
      let rowsByColName = rows.map(
        (cells, rowIndex) =>
          cells.reduce(
            (carry, cellValue, cellIndex) => Object.assign(carry, { [columnTexts[cellIndex]]: cellValue }),
            {}
          )
      );
      this.data = { type, columns, rows, columnTexts, colIndexesByText, rowsByColName };
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
    let { colorSource, seriesColors, colorColumnName, colorBy, sortOrder } = panel;

    let countType = panel.countType || 'sum';

    let categoryColIndex = ctrl.getColIndex('category', panel);
    let seriesColIndex = panel.pieType === 'polar' ? -1 : ctrl.getColIndex('series', panel, true);
    let measureColIndex = ctrl.getColIndex('measure', panel);
    let labelColIndex = ctrl.getColIndex('label', panel, true);
    let colorColIndex = colorBy === 'column' ? ctrl.getColIndex('color', panel, true) : -1;
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
    let { measures, labels, colors, rowsByMeasure, seriesStacks } = rows.reduce((carry, row, rowIndex) => {
      let seriesIndex = series.indexOf(row[seriesColIndex]);
      let index = categories.indexOf(row[categoryColIndex]) + seriesIndex * categoryCount;
      (carry.measures[index] = carry.measures[index] || []).push(row[measureColIndex]);
      (carry.rowsByMeasure[index] = carry.rowsByMeasure[index] || []).push(row);
      carry.labels[index] = carry.labels[index] || row[labelColIndex];
      carry.colors[index] = carry.colors[index] || row[colorColIndex];
      carry.seriesStacks[seriesIndex] = carry.seriesStacks[seriesIndex] || row[stackColIndex];
      return carry;
    }, { measures: [], labels: [], colors: [], rowsByMeasure: [], seriesStacks: [] });

    let countMeasures = COUNT_TYPE_MAP[countType];
    if (!countMeasures) {
      throw new Error(`Unknown count type:\t${countType}`);
    }
    for (let i = measureCount; i--; ) {
      measures[i] = countMeasures(measures[i] || [0]);
      rowsByMeasure[i] = rowsByMeasure[i] || [];
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
      rowsByMeasure,
      baseColors,
      bgColors,
      borderColors,
      sortOrder,
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
                  rowsByMeasure[categoryIndex + seriesIndex * categoryCount]
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
      labels,
      bgColors,
      borderColors,
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
          formatter(value, { dataIndex, datasetIndex }) {
            let result = labels[dataIndex + datasetIndex * categoryCount];
            if (labelColIndex < 0) {
              let { numberFormat, numberFormatDecimals } = panel;
              result = (!['none', null, void 0].includes(numberFormat) && 'number' === typeof value)
                ? getValueFormat(numberFormat)(value, numberFormatDecimals, null)
                : value;
            }
            return wrapText(`${result}`, panel.labels.wrapAfter);
          },
          textAlign: 'center'
        }
      };
    });

    let chartConfig = {
      responsive: true,
      data: {
        datasets,
        labels: 'string' === typeof datasets[0].label
          ? datasets[0].data.map((x, i) => `${datasets[0].label} #${i + 1}`)
          : datasets[0].label
      },
      options: {
        circumference: (panel.isSemiCircle ? 1 : 2) * Math.PI,
        rotation: -Math.PI / (panel.isSemiCircle ? 1 : 2),
        elements: { borderWidth: panel.borderWidth },
        tooltips: {
          callbacks: {
            title: function ([tooltipItem], data) {
              return series[tooltipItem.datasetIndex];
            },
            label: function (tooltipItem, data) {
              let { numberFormat, numberFormatDecimals } = panel;
              let label = data.datasets[tooltipItem.datasetIndex].label[tooltipItem.index];
              let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
              value = (!['none', null, void 0].includes(numberFormat) && 'number' === typeof value)
                ? getValueFormat(numberFormat)(value, numberFormatDecimals, null)
                : value;
              return label + ': ' + value;
            }
          }
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
    // TODO: Remove unused variables
    let {
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
      rowsByMeasure,
      baseColors,
      bgColors,
      borderColors,
      sortOrder,
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
        stack: panel.isStacked ? seriesStacks[seriesIndex] : seriesIndex
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
          callbacks: {
            title: function ([tooltipItem], data) {
              if (!ignoreSeries) {
                let { datasets, labels } = data;
                let { datasetIndex: seriesIndex, index: categoryIndex } = tooltipItem;
                let category = categories[categoryIndex];
                let seriesName = series[seriesIndex];
                let measureIndex = categoryIndex + seriesIndex * categoryCount;
                let measure = measures[measureIndex];
                let rows = rowsByMeasure[measureIndex];
                let { isCustom, titleFormat } = panel.tooltip;

                return (isCustom)
                  ? titleFormat
                    ? ctrl.formatTooltipText(titleFormat, rows, seriesName, category, measure)
                    : null
                  : seriesName;
              }
            },
            label: function (tooltipItem, data) {
              let { datasets, labels } = data;
              let { datasetIndex: seriesIndex, index: categoryIndex } = tooltipItem;
              let category = categories[categoryIndex];
              let seriesName = series[seriesIndex];
              let measureIndex = categoryIndex + seriesIndex * categoryCount;
              let measure = measures[measureIndex];
              let rows = rowsByMeasure[measureIndex];
              let { numberFormat, numberFormatDecimals } = panel;
              let { isCustom, labelFormat } = panel.tooltip;
              let strMeasure = (!['none', null, void 0].includes(numberFormat) && 'number' === typeof measure)
                  ? getValueFormat(numberFormat)(measure, numberFormatDecimals, null)
                  : measure;
              
              return (isCustom && labelFormat)
                ? ctrl.formatTooltipText(labelFormat, rows, seriesName, category, measure)
                : (category + ': ' + strMeasure);
            }
          }
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

    let myChart = new Chart(canvas.getContext('2d'), chartConfig);
  }

  drawFunnelChart(canvas) {
    let ctrl = this;
    let data = ctrl.data;
    let { rows, colIndexesByText } = data;
    let fullPanel = ctrl.panel;
    let panel = fullPanel.funnel;

    let categoryColIndex = ctrl.getColIndex('category', panel);
    let measureColIndex = ctrl.getColIndex('measure', panel);

    let categories = _.uniq(rows.map(row => row[categoryColIndex]));
    let measures = rows.reduce((measures, row, rowIndex) => {
      let measureIndex = categories.indexOf(row[categoryColIndex]);
      measures[measureIndex] = (measures[measureIndex] || 0) + row[measureColIndex];
      return measures;
    }, []);

    let baseColors;
    let { colorSource, seriesColors, colorColumnName, sortOrder } = panel;

    if (colorSource === 'column') {
      if (!_.has(colIndexesByText, colorColumnName)) {
        throw new Error('Invalid color column.');
      }
      baseColors = categories.map(category => Color(rows.find(row => row[categoryColIndex] === category)[colIndexesByText[colorColumnName]]));
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

    function testChartEvent(e, callback) {
      let elem = this.getElementAtEvent(e)[0];
      let isOpen;
      if (elem) {
        let category = categories[elem._index];
        isOpen = panel.drilldownLinks.some((drilldownLink, drilldownLinkIndex) => {
          // Check this link to see if it matches...
          let { url, category: rgxCategory } = drilldownLink;
          if (url) {
            rgxCategory = parseRegExp(rgxCategory);
            if (rgxCategory.test(category)) {
              callback(
                drilldownLinkIndex,
                rows.filter(row => row[categoryColIndex] === category)
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

    // Derive the background and border colors from the base colors.
    let bgColors = baseColors.map(color => color.a(panel.dataBgColorAlpha).rgba());
    let borderColors = baseColors.map(color => color.l(panel.dataBorderBrightness).a(panel.dataBorderColorAlpha).rgba());

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
        startWidthPercent: panel.startWidthPct,
        sort: panel.sortOrder,
        elements: { borderWidth: panel.borderWidth },
        gap: panel.gap,
        keep: /^(left|right)$/.test(panel.hAlign || '') ? panel.hAlign : 'auto',
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              let { numberFormat, numberFormatDecimals } = panel;
              let label = data.datasets[tooltipItem.datasetIndex].label[tooltipItem.index];
              let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
              value = (!['none', null, void 0].includes(numberFormat) && 'number' === typeof value)
                ? getValueFormat(numberFormat)(value, numberFormatDecimals, null)
                : value;
              return label + ': ' + value;
            }
          }
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

    let myChart = new Chart(canvas.getContext('2d'), chartConfig);
  }

  openDrilldownLink(drilldownLink, matchingRows) {
    let { data: { colIndexesByText }, templateSrv: { variables }, timeSrv: { time: timeVars } } = this;
    let { url, openInBlank } = drilldownLink;
    url = url.replace(RGX_OLD_VAR_WORKAROUND, '$1$2').replace(
      RGX_CELL_PLACEHOLDER,
      function (match, isTime, opt_timePart, type, name, isRaw, isParam, paramName) {
        if (isTime) {
          return (opt_timePart != 'to' ? 'from=' + encodeURIComponent(timeVars.from) : '')
            + (opt_timePart ? '' : '&')
            + (opt_timePart != 'from' ? 'to=' + encodeURIComponent(timeVars.to) : '');
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
