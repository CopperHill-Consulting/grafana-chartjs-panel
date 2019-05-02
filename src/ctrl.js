import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import JS from './external/YourJS.min';
import * as Chart from './external/Chart.bundle.min';
import config from 'app/core/config';
import {Color} from './external/CWest-Color.min';

const panelDefaults = {
  categoryColumnName: null,
  seriesColumnName: null,
  measureColumnName: null,
  chartType: 'bar',
  drilldownLinks: [],
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

function renderChart({canvas, data: { type: dataType, columns, rows, columnTexts }, panel, variables}) {
  if (dataType !== 'table') {
    throw new Error('Data type must be "table".');
  }

  let colIndexesByText = columnTexts.reduceRight(
    (indexes, colText, index) =>
      Object.assign(indexes, { [colText]: index }),
    {}
  );

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
  let series = [...new Set(rows.map(row => row[seriesIndex]))];

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
      stack: 'Stack ' + (panel.isStacked ? 0 : seriesNameIndex),
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
    type: panel.chartType,
    data: barChartData,
    options: {
      // plugins: {
      //   datalabels: {
      //     display: 'auto'
      //   }
      // },
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
      data = ctrl.data,
      jContent = jElem.find('.panel-content').css('position', 'relative').html(''),
      elemContent = jContent[0],
      jCanvas = jQuery('<canvas>').appendTo(jContent);
  
  if (data && data.rows.length) {
    if (data.type === 'table') {
      jCanvas.prop({ width: jContent.width(), height: jContent.height() });
      try {
        renderChart({
          canvas: jCanvas[0],
          data,
          panel: ctrl.panel,
          variables: ctrl.templateSrv.variables
        });
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
    this.CHART_TYPES = [
      { value: 'horizontalBar', text: 'Horizontal Bar' },
      { value: 'bar', text: 'Vertical Bar' }
    ];
    this.COLOR_ALPHAS = _.range(0, 101, 5).map(x => ({
      value: x / 100, text: `${x}%` + (x ? x === 100 ? ' (Solid)' : '' : ' (Invisible)')
    }));
    this.TICK_ROTATIONS = _.range(0, 91, 5).map(x => ({
      value: x, text: `${x}\xB0` + (x ? x === 90 ? ' (Vertical)' : '' : ' (Horizontal)')
    }));

    this.$rootScope = $rootScope;
    this.data = null;

    _.defaultsDeep(this.panel, panelDefaults);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
  }

  addDrilldownLink() {
    this.panel.drilldownLinks.push({
      category: '/[^]*/',
      series: '/[^]*/',
      url: '',
      openInBlank: true
    });
  }

  removeDrilldownLink(drilldownLink) {
    let links = this.panel.drilldownLinks;
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
      this.data = {
        isReal: true,
        type: data.type,
        columns: data.columns,
        rows: data.rows,
        columnTexts: data.columns.map(col => 'string' === typeof col ? col : col.text)
      };
    }
    else {
      this.data = {
        isReal: false,
        type: 'table',
        columns: [{text: "Off"}, {text: "Down"}, {text: "Run"}, {text: "Idle"}],
        rows: [
          [ 15, 50, 0, 40 ],
          [ 15, 5, 40, 15 ],
          [ 15, 30, 40, 15 ],
          [ 15, 30, 80, 15 ]
        ]
      };
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

  link(scope, elem, attrs, ctrl) {
    this.events.on('renderNow', e => renderNow.call(this, e, elem));
    this.events.on('render', _.debounce(e => renderNow.call(this, e, elem), 250));
  }
}

ChartJsPanelCtrl.templateUrl = 'partials/module.html';
