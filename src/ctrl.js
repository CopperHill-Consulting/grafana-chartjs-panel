import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { getValueFormat, getValueFormats } from '@grafana/ui';
import config from 'app/core/config';
import _ from 'lodash';

import JS from './external/YourJS.min';
import * as Chart from './external/Chart.bundle.min';
import * as ChartDataLabels from './external/Chart.datalabels.plugin';
import './external/Chart.funnel';
import { Color } from './external/CWest-Color.min';

import { parseRegExp } from './helper-functions';

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
        maxRotation: 90,
        numberFormat: 'none',
        numberFormatDecimals: 0
      },
      gridLineOpacity: 0.15
    },
    yAxes: {
      ticks: {
        autoSkip: true,
        minRotation: 0,
        maxRotation: 90,
        numberFormat: 'none',
        numberFormatDecimals: 0
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
  borderWidth: 1,
  colorSource: 'auto',
  colorColumnName: null,
  seriesColors: [],
  dataBgColorAlpha: 0.75,
  dataBorderColorAlpha: 1,
  gap: 1,
  startWidthPct: 0,
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

  drawBarChart(canvas) {
    let ctrl = this;
    let data = ctrl.data;
    let { rows, colIndexesByText } = data;
    let fullPanel = ctrl.panel;
    let panel = fullPanel.bar;

    let categoryColIndex = ctrl.getColIndex('category', panel);
    let seriesColIndex = ctrl.getColIndex('series', panel, true);
    let stackColIndex = ctrl.getColIndex('stack', panel, true);
    let measureColIndex = ctrl.getColIndex('measure', panel);
    let ignoreSeries = seriesColIndex < 0;

    let categories = _.uniq(rows.map(row => row[categoryColIndex]));
    let { series, seriesStacks } = rows.reduce(
      (carry, row) => {
        let seriesName = row[seriesColIndex];
        if (!carry.series.includes(seriesName)) {
          carry.series.push(seriesName);
          carry.seriesStacks.push(row[stackColIndex]);
        }
        return carry;
      },
      { series: [], seriesStacks: [] }
    );

    series = series.map(name => name === undefined ? 'Series' : name);
    seriesStacks = seriesStacks.map(name => name === undefined ? 'Stack' : name);

    // If legacy bar chart colors exist convert them to new color setup
    if (_.has(panel, ['seriesColors', 0, 'text'])) {
      panel.seriesColors = panel.seriesColors.map(color => color.color);
      panel.colorSource = 'custom';
    }

    let { colorSource, seriesColors, colorColumnName, colorBy } = panel;

    let colorColIndex;
    if (colorSource === 'column') {
       colorColIndex = ctrl.getColIndex('color', panel);
    }

    let baseColors = rows.reduce((colors, row) => {
      let color = colors.find(c => seriesColIndex >= 0 ? c.series === row[seriesColIndex] : true && c.category === row[categoryColIndex]);
      let rowSeries = ignoreSeries ? series[0] : row[seriesColIndex];
      let rowCategory = row[categoryColIndex];
      if (!colors.find(c => (ignoreSeries || c.series === rowSeries) && c.category === rowCategory)) {
        let color = { series: rowSeries, category: rowCategory };
        if (colorColIndex >= 0) {
          color.value = Color(row[colorColIndex]);
        }
        else {
          color.index = colorBy === 'both'
            ? colors.length
            : colorBy === 'category'
              ? categories.indexOf(rowCategory)
              : series.indexOf(rowSeries);
        }
        colors.push(color);
      }
      return colors;
    }, []);
    if (colorSource === 'custom') { // user-defined
      baseColors.forEach((c, i) => {
        c.value = Color(seriesColors[c.index % seriesColors.length]);
      });
    }
    else if (colorSource !== 'column') { // rainbow
      let colorIndexLimit = colorBy === 'both'
        ? baseColors.length
        : colorBy === 'category'
          ? categories.length
          : series.length;
      baseColors.forEach((c, i, a) => {
        c.value = Color.hsl(~~(360 * c.index / colorIndexLimit), 1, 0.5);
      });
    }
    
    let isLightTheme = config.theme.type === 'light';
    
    let measures = {};
    let chartConfig = {
      type: panel.orientation === 'horizontal' ? 'horizontalBar' : 'bar',
      data: {
        labels: categories,
        datasets: series.map((seriesName, seriesNameIndex) => ({
          label: seriesName,
          backgroundColor: categories.map(cat => Color((baseColors.find(color => color.category === cat && color.series === seriesName) || {}).value).a(panel.dataBgColorAlpha).rgba()),
          borderColor: categories.map(cat => Color((baseColors.find(color => color.category === cat && color.series === seriesName) || {}).value).a(panel.dataBorderColorAlpha).rgba()),
          borderWidth: panel.borderWidth,
          stack: panel.isStacked ? seriesStacks[seriesNameIndex] : seriesNameIndex,
          data: categories.map(category => {
            let sum = rows.reduce((sum, row) => {
              let isMatch = row[categoryColIndex] === category
                && (seriesColIndex < 0 || row[seriesColIndex] === seriesName);
              return sum + (isMatch ? +row[measureColIndex] || 0 : 0);
            }, 0);
            return (measures[category] = measures[category] || {})[seriesName] = sum;
          })
        }))
      },
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
                fontColor: isLightTheme ? '#333' : '#CCC',
                userCallback: function (value, index, values) {
                  let { ticks } = panel.scales.xAxes;
                  return (!['none', null, void 0].includes(ticks.numberFormat) && 'number' === typeof value)
                    ? getValueFormat(ticks.numberFormat)(value, ticks.numberFormatDecimals, null)
                    : value;
                }
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
                fontColor: isLightTheme ? '#333' : '#CCC',
                userCallback: function (value, index, values) {
                  let { ticks } = panel.scales.yAxes;
                  return (!['none', null, void 0].includes(ticks.numberFormat) && 'number' === typeof value)
                    ? getValueFormat(ticks.numberFormat)(value, ticks.numberFormatDecimals, null)
                    : value;
                }
              },
              stacked: true,
              gridLines: {
                display: !!panel.scales.yAxes.gridLineOpacity,
                color: isLightTheme ? `rgba(0,0,0,${+panel.scales.yAxes.gridLineOpacity})` : `rgba(255,255,255,${+panel.scales.yAxes.gridLineOpacity})`
              }
            }
          ]
        },
        onClick: function (e) {
          let target = myChart.getElementAtEvent(e)[0];
          let model = target && target._model;
          if (model) {
            let category = model.label;
            let seriesName = model.datasetLabel;
            let isOpen = panel.drilldownLinks.some(drilldownLink => {
              // Check this link to see if it matches...
              let { url, category: rgxCategory, series: rgxSeries } = drilldownLink;
              if (url) {
                rgxCategory = parseRegExp(rgxCategory);
                rgxSeries = !ignoreSeries && parseRegExp(rgxSeries);
                if (rgxCategory.test(category) && (ignoreSeries || rgxSeries.test(seriesName))) {
                  let matchingRows = rows.filter(row => row[categoryColIndex] === category && (ignoreSeries || row[seriesColIndex] === seriesName));
                  ctrl.openDrilldownLink(drilldownLink, matchingRows);
                  return true;
                }
              }
            });

            if (!isOpen) {
              console.log('No matching drilldown link was found:', { series: seriesName, category, rows });
            }
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
        startWidthPercent: panel.startWidthPct,
        sort: panel.sortOrder,
        elements: { borderWidth: panel.borderWidth },
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
