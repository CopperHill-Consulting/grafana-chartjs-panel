"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChartJsPanelCtrl = void 0;

var _sdk = require("app/plugins/sdk");

var _ui = require("@grafana/ui");

var _config = _interopRequireDefault(require("app/core/config"));

var _lodash = _interopRequireDefault(require("lodash"));

var _YourJS = _interopRequireDefault(require("./external/YourJS.min"));

var Chart = _interopRequireWildcard(require("./external/Chart.bundle.min"));

var ChartDataLabels = _interopRequireWildcard(require("./external/Chart.datalabels.plugin"));

require("./external/Chart.funnel");

var _CWestColor = require("./external/CWest-Color.min");

var _helperFunctions = require("./helper-functions");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var IS_LIGHT_THEME = _config.default.theme.type === 'light';
var RGX_CELL_PLACEHOLDER = /\$\{(time)(?:-(to|from))?\}|\$\{(col|var):((?:[^\}:\\]*|\\.)+)(?::(?:(raw)|(param)(?::((?:[^\}:\\]*|\\.)+))?))?\}/g;
var RGX_OLD_VAR_WORKAROUND = /([\?&])var-(\$\{var:(?:[^\}:\\]*|\\.)+:param\})/g;
var COUNT_TYPE_MAP = {
  sum: _lodash.default.sum,
  avg: _lodash.default.mean,
  min: _lodash.default.min,
  max: _lodash.default.max,
  count: function count(arr) {
    return arr.length;
  },
  first: function first(arr) {
    return arr[0];
  },
  last: function last(arr) {
    return arr[arr.length - 1];
  }
};
var PANEL_DEFAULTS = {
  chartType: null
};
var BAR_DEFAULTS = {
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
    titleFormat: null,
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
var FUNNEL_DEFAULTS = {
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
    titleFormat: null,
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
var PIE_DEFAULTS = {
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
    titleFormat: null,
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
var OPTIONS_BY_TYPE = {
  bar: Object.keys(_YourJS.default.flattenKeys(BAR_DEFAULTS, true)),
  pie: Object.keys(_YourJS.default.flattenKeys(PIE_DEFAULTS, true)),
  funnel: Object.keys(_YourJS.default.flattenKeys(FUNNEL_DEFAULTS, true))
};
var DISABLE_ANIMATIONS = !/^(0|[Ff]alse|[Oo]ff|[Nn]o|)$/.test([_YourJS.default.parseQS(location.href).__noanimation] + '');

var ChartJsPanelCtrl =
/*#__PURE__*/
function (_MetricsPanelCtrl) {
  _inherits(ChartJsPanelCtrl, _MetricsPanelCtrl);

  function ChartJsPanelCtrl($scope, $injector, $rootScope) {
    var _this;

    _classCallCheck(this, ChartJsPanelCtrl);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ChartJsPanelCtrl).call(this, $scope, $injector));
    _this.UNIT_FORMATS = (0, _ui.getValueFormats)();
    _this.GRID_LINE_OPACITIES = [{
      value: false,
      text: 'None'
    }, {
      value: 0.15,
      text: 'Light'
    }, {
      value: 0.65,
      text: 'Dark'
    }];
    _this.CHART_START_WIDTH_PERCENTAGES = [{
      value: 0,
      text: '0% (Point)'
    }, {
      value: 0.25,
      text: '25%'
    }, {
      value: 0.5,
      text: '50% (Half)'
    }, {
      value: 0.75,
      text: '75%'
    }, {
      value: 1,
      text: '100% (Full)'
    }];
    _this.CHART_BORDER_WIDTHS = [{
      value: 0,
      text: '0px (NO BORDER)'
    }, {
      value: 1,
      text: '1px'
    }, {
      value: 2,
      text: '2px'
    }, {
      value: 3,
      text: '3px'
    }];
    _this.CHART_GAP_SIZES = [{
      value: 0,
      text: '0px (NO GAP)'
    }, {
      value: 1,
      text: '1px'
    }, {
      value: 2,
      text: '2px'
    }, {
      value: 3,
      text: '3px'
    }, {
      value: 4,
      text: '4px'
    }, {
      value: 5,
      text: '5px'
    }];
    _this.CHART_COLOR_BY = [{
      value: 'series',
      text: 'Series'
    }, {
      value: 'category',
      text: 'Category'
    }, {
      value: 'both',
      text: 'Series & Category'
    }];
    _this.CHART_COLOR_SOURCES = [{
      value: 'column',
      text: 'Column'
    }, {
      value: 'auto',
      text: 'Rainbow'
    }, {
      value: 'custom',
      text: 'User-defined'
    }];
    _this.CHART_LABEL_SOURCES = [{
      value: null,
      text: 'None'
    }, {
      value: 'column',
      text: 'Column'
    }, {
      value: 'custom',
      text: 'User-defined'
    }];
    _this.CHART_TYPES = [{
      value: null,
      'text': '--- PICK ONE ---'
    }, {
      value: 'bar',
      text: 'Bar'
    }, {
      value: 'funnel',
      text: 'Funnel'
    }, {
      value: 'pie',
      text: 'Pie'
    }];
    _this.PIE_TYPES = [{
      value: null,
      'text': '--- PICK ONE ---'
    }, {
      value: 'pie',
      text: 'Default'
    }, {
      value: 'polar',
      text: 'Polar'
    }, {
      value: 'doughnut',
      text: 'Doughnut'
    }];
    _this.COUNT_TYPES = [{
      value: null,
      text: '--- PICK ONE ---'
    }].concat(Object.keys(COUNT_TYPE_MAP).map(function (t) {
      return {
        value: t,
        text: _YourJS.default.titleCase(t)
      };
    }));
    _this.CHART_ORIENTATIONS = [{
      value: 'horizontal',
      text: "Horizontal (\u2194)"
    }, {
      value: 'vertical',
      text: "Vertical (\u2195)"
    }];
    _this.CHART_H_ALIGNMENTS = [{
      value: 'left',
      text: 'Left'
    }, {
      value: 'center',
      text: 'Center'
    }, {
      value: 'right',
      text: 'Right'
    }];
    _this.SORT_ORDERS = [{
      value: 'asc',
      text: 'Ascending'
    }, {
      value: 'desc',
      text: 'Descending'
    }];
    _this.COLOR_ALPHAS = _lodash.default.range(0, 101, 5).map(function (x) {
      return {
        value: x / 100,
        text: "".concat(x, "%") + (x ? x === 100 ? ' (Solid)' : '' : ' (Invisible)')
      };
    });
    _this.BRIGHTNESSES = _lodash.default.range(0, 101, 5).map(function (x) {
      return {
        value: x / 100,
        text: "".concat(x, "%") + (x ? x === 100 ? ' (White)' : '' : ' (Black)')
      };
    });
    _this.TICK_ROTATIONS = _lodash.default.range(0, 91, 5).map(function (x) {
      return {
        value: x,
        text: "".concat(x, "\xB0") + (x ? x === 90 ? ' (Vertical)' : '' : ' (Horizontal)')
      };
    });
    _this.$rootScope = $rootScope;
    _this.data = null;

    _this.setPanelDefaults();

    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_assertThisInitialized(_this)));

    _this.events.on('data-received', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('data-error', _this.onDataError.bind(_assertThisInitialized(_this)));

    return _this;
  } // Setup the appropriate defaults and make sure that any old bar chart data
  // is migrated to the new structure.


  _createClass(ChartJsPanelCtrl, [{
    key: "setPanelDefaults",
    value: function setPanelDefaults() {
      var panel = this.panel;

      _lodash.default.defaultsDeep(panel, PANEL_DEFAULTS);

      switch (panel.chartType) {
        case 'horizontalBar':
          panel.chartType = 'bar';
          panel.orientation = 'horizontal';

        case 'bar':
          if (!panel.bar) {
            panel.bar = {};
          }

          _lodash.default.defaultsDeep(panel.bar, BAR_DEFAULTS);

          Object.keys(BAR_DEFAULTS).forEach(function (key) {
            if (_lodash.default.has(panel, key)) {
              panel.bar[key] = panel[key];
              delete panel[key];
            }
          });
          break;

        case 'funnel':
          _lodash.default.defaultsDeep(panel.funnel = panel.funnel || {}, FUNNEL_DEFAULTS);

          break;

        case 'pie':
          _lodash.default.defaultsDeep(panel.pie = panel.pie || {}, PIE_DEFAULTS);

          break;
      }
    }
  }, {
    key: "addSeriesColor",
    value: function addSeriesColor(opt_index) {
      var panel = this.panel;
      var colors = panel[panel.chartType].seriesColors;
      colors.splice(opt_index == null ? colors.length : opt_index, 0, (0, _CWestColor.Color)('black') + '');
      this.renderNow();
    }
  }, {
    key: "moveSeriesColor",
    value: function moveSeriesColor(fromIndex, toIndex) {
      var colors = this.getChartPanel().seriesColors;
      colors.splice(toIndex, 0, colors.splice(fromIndex, 1)[0]);
      this.renderNow();
    }
  }, {
    key: "removeSeriesColor",
    value: function removeSeriesColor(opt_index) {
      var panel = this.panel;
      var colors = panel[panel.chartType].seriesColors;
      var count = colors.length;

      if (count) {
        colors.splice(opt_index == null ? count - 1 : opt_index, 1);
        this.renderNow();
      }
    }
  }, {
    key: "addDrilldownLink",
    value: function addDrilldownLink() {
      var drilldownLink = {
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
  }, {
    key: "removeDrilldownLink",
    value: function removeDrilldownLink(drilldownLink) {
      var links = this.getChartPanel().drilldownLinks;
      links.splice(links.indexOf(drilldownLink), 1);
    }
  }, {
    key: "onInitEditMode",
    value: function onInitEditMode() {
      var path = 'public/plugins/westc-chartjs-panel/partials/';
      this.addEditorTab('Options', "".concat(path, "editor.html"), 2);
      this.addEditorTab('Series Colors', "".concat(path, "series-colors.html"), 3);
      this.addEditorTab('Drill-down Links', "".concat(path, "drilldown-links.html"), 4);
    }
  }, {
    key: "onDataError",
    value: function onDataError() {
      this.renderNow();
    }
  }, {
    key: "onDataReceived",
    value: function onDataReceived(dataList) {
      if (dataList && dataList.length) {
        var _dataList$ = dataList[0],
            type = _dataList$.type,
            columns = _dataList$.columns,
            rows = _dataList$.rows;
        var columnTexts = columns.map(function (col) {
          return 'string' === typeof col ? col : col.text;
        });
        rows.map(function (row) {
          return Object.assign(row, {
            byColName: row.reduce(function (carry, cellValue, cellIndex) {
              return Object.assign(carry, _defineProperty({}, columnTexts[cellIndex], cellValue));
            }, {})
          });
        });
        this.data = {
          type: type,
          columns: columns,
          rows: rows,
          columnTexts: columnTexts,
          colIndexesByText: columnTexts.reduceRight(function (indexes, colText, index) {
            return Object.assign(indexes, _defineProperty({}, colText, index));
          }, {})
        };
      } else {
        this.data = {};
      }

      this.renderNow();
    }
  }, {
    key: "onChangeCallback",
    value: function onChangeCallback(obj, key) {
      var _this2 = this;

      return function (newValue) {
        obj[key] = newValue;

        _this2.renderNow();
      };
    }
  }, {
    key: "renderNow",
    value: function renderNow() {
      this.events.emit('renderNow');
    }
  }, {
    key: "isActiveOption",
    value: function isActiveOption() {
      var _this3 = this;

      for (var _len = arguments.length, paths = new Array(_len), _key = 0; _key < _len; _key++) {
        paths[_key] = arguments[_key];
      }

      return paths.every(function (path) {
        return (OPTIONS_BY_TYPE[_this3.panel.chartType] || []).includes(path);
      });
    }
  }, {
    key: "setActiveOption",
    value: function setActiveOption(path, value) {
      var panel = this.getChartPanel();

      if (_lodash.default.has(panel, path)) {
        _lodash.default.set(panel, path, value);

        this.renderNow();
      }
    }
  }, {
    key: "getChartPanel",
    value: function getChartPanel() {
      return this.panel[this.panel.chartType];
    }
  }, {
    key: "getColIndex",
    value: function getColIndex(name, panel, opt_isOptional) {
      var colIndexesByText = this.data.colIndexesByText;
      var key = name + 'ColumnName';
      var isRequired = !opt_isOptional || panel[key] != undefined;

      if (isRequired && !_lodash.default.has(colIndexesByText, panel[key])) {
        throw new Error("Invalid ".concat(name, " column."));
      }

      return isRequired ? colIndexesByText[panel[key]] : -1;
    }
  }, {
    key: "drawChart",
    value: function drawChart(e, jElem) {
      var error,
          isValid = false,
          ctrl = this,
          chartType = ctrl.panel.chartType,
          data = ctrl.data,
          jContent = jElem.find('.panel-content').css('position', 'relative').html(''),
          elemContent = jContent[0],
          jCanvas = jQuery('<canvas>').appendTo(jContent),
          canvas = jCanvas[0];

      if (data && data.rows && data.rows.length) {
        jCanvas.prop({
          width: jContent.width(),
          height: jContent.height()
        });

        try {
          if (!data.columnTexts) {
            throw new Error('No source data has been specified.');
          }

          if (data.type !== 'table') {
            throw new Error('Data type must be "table".');
          }

          if ('bar' === chartType) {
            ctrl.drawBarChart(canvas);
          } else if ('funnel' === chartType) {
            ctrl.drawFunnelChart(canvas);
          } else if ('pie' === chartType) {
            ctrl.drawPieChart(canvas);
          }

          isValid = true;
        } catch (e) {
          console.error('drawChart:', error = e);
        }
      }

      if (!isValid) {
        var msg = 'No data' + (error ? ':  \r\n' + error.message : '.');

        var elemMsg = _YourJS.default.dom({
          _: 'div',
          style: {
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            height: '100%'
          },
          $: [{
            _: 'div',
            cls: 'alert alert-error',
            style: {
              margin: '0px auto'
            },
            text: msg
          }]
        });

        jContent.html('').append(elemMsg);
      }
    }
  }, {
    key: "getChartOptions",
    value: function getChartOptions(chartType) {
      var ctrl = this;
      var data = ctrl.data;
      var rows = data.rows,
          colIndexesByText = data.colIndexesByText;
      var fullPanel = ctrl.panel;
      var panel = fullPanel[chartType];
      var colorSource = panel.colorSource,
          seriesColors = panel.seriesColors,
          colorColumnName = panel.colorColumnName,
          colorBy = panel.colorBy,
          sortOrder = panel.sortOrder,
          countType = panel.countType,
          labelOptions = panel.labels;
      var categoryColIndex = ctrl.getColIndex('category', panel);
      var seriesColIndex = panel.pieType === 'polar' ? -1 : ctrl.getColIndex('series', panel, true);
      var measureColIndex = ctrl.getColIndex('measure', panel);
      var labelColIndex = ctrl.getColIndex('label', panel, true);
      var colorColIndex = colorSource === 'column' ? ctrl.getColIndex('color', panel, true) : -1;
      var stackColIndex = ctrl.getColIndex('stack', panel, true);
      var ignoreSeries = seriesColIndex < 0;

      var categories = _lodash.default.uniq(rows.map(function (row) {
        return row[categoryColIndex];
      }));

      var series = _lodash.default.uniq(rows.map(function (row) {
        return row[seriesColIndex];
      }));

      if (chartType === 'pie') {
        categories.reverse();
        series.reverse();
      }

      var categoryCount = categories.length;
      var seriesCount = series.length;
      var measureCount = categoryCount * seriesCount;

      var _rows$reduce = rows.reduce(function (carry, row, rowIndex) {
        var seriesIndex = series.indexOf(row[seriesColIndex]);
        var measureIndex = categories.indexOf(row[categoryColIndex]) + seriesIndex * categoryCount;
        (carry.measures[measureIndex] = carry.measures[measureIndex] || []).push(row[measureColIndex]);
        (carry.rowGroups[measureIndex] = carry.rowGroups[measureIndex] || []).push(row);
        carry.labels[measureIndex] = carry.labels[measureIndex] || row[labelColIndex];
        carry.colors[measureIndex] = carry.colors[measureIndex] || row[colorColIndex];
        carry.seriesStacks[seriesIndex] = carry.seriesStacks[seriesIndex] || row[stackColIndex];
        return carry;
      }, {
        measures: [],
        labels: [],
        colors: [],
        rowGroups: [],
        seriesStacks: []
      }),
          measures = _rows$reduce.measures,
          labels = _rows$reduce.labels,
          colors = _rows$reduce.colors,
          rowGroups = _rows$reduce.rowGroups,
          seriesStacks = _rows$reduce.seriesStacks;

      var countMeasures = COUNT_TYPE_MAP[countType];

      if (!countMeasures) {
        throw new Error("Unknown count type:\t".concat(countType));
      }

      for (var i = measureCount; i--;) {
        measures[i] = countMeasures(measures[i] || [0]);
        rowGroups[i] = rowGroups[i] || [];
      }

      if (chartType === 'funnel') {
        var sortMap = measures.map(function (v, i) {
          return {
            v: v,
            i: i
          };
        }).sort(sortOrder === 'desc' ? function (a, b) {
          return b.v - a.v;
        } : function (a, b) {
          return a.v - b.v;
        }).map(function (_ref) {
          var i = _ref.i;
          return i;
        });

        var remap = function remap(v, i, a) {
          return a[sortMap[i]];
        };

        measures = measures.map(remap);
        labels = labels.map(remap);
        colors = colors.map(remap);
        rowGroups = rowGroups.map(remap);
      }

      var baseColors;
      var seriesColorCount = seriesColors.length;

      if (colorSource === 'column') {
        if (!_lodash.default.has(colIndexesByText, colorColumnName)) {
          throw new Error('Invalid color column.');
        }

        baseColors = colors.map(function (x) {
          return (0, _CWestColor.Color)(x);
        });
      } else {
        baseColors = [];

        if (colorSource === 'custom') {
          if (!seriesColorCount) {
            throw new Error('No base colors have been added.');
          }

          seriesColors = seriesColors.map(function (x) {
            return (0, _CWestColor.Color)(x);
          });
          series.forEach(function (seriesName, seriesIndex) {
            categories.forEach(function (category, categoryIndex) {
              var index = categoryIndex + seriesIndex * categoryCount;
              var colorIndex = colorBy === 'series' ? seriesIndex : colorBy === 'both' ? index : categoryIndex;
              baseColors[index] = seriesColors[colorIndex % seriesColorCount];
            });
          });
        } else {
          series.forEach(function (seriesName, seriesIndex) {
            categories.forEach(function (category, categoryIndex) {
              var index = categoryIndex + seriesIndex * categoryCount;
              var colorIndex = colorBy === 'series' ? seriesIndex : colorBy === 'both' ? index : categoryIndex;
              var colorCount = colorBy === 'series' ? seriesCount : colorBy === 'both' ? measureCount : categoryCount;
              baseColors[index] = _CWestColor.Color.hsl(Math.round(360 * colorIndex / colorCount), 1, 0.5);
            });
          });
        }
      } // Derive the background and border colors from the base colors.


      var bgColors = baseColors.map(function (color) {
        return (0, _CWestColor.Color)(color).a(panel.dataBgColorAlpha).rgba();
      });
      var borderColors = baseColors.map(function (color) {
        return (0, _CWestColor.Color)(color).l(panel.dataBorderBrightness).a(panel.dataBorderColorAlpha).rgba();
      });

      function formatLabelText(strFormat, rows, series, category, measure) {
        return strFormat.replace(/(\\\$)|\$\{(?:(series)|(category)|measure|col:((?:[^\\\}:]+|\\.)+)(?::([\-\w]+))?)\}/g, function (match, isEscapedDollar, isSeries, isCategory, colName, colFnName) {
          if (isEscapedDollar) {
            match = '$';
          } else if (colName) {
            colName = colName.replace(/\\(.)/g, '$1');

            if (_lodash.default.has(rows[0].byColName, colName)) {
              match = rows.map(function (row) {
                return row.byColName[colName];
              });
              match = colFnName === 'sum' ? match.reduce(function (a, b) {
                return a + b;
              }) : colFnName === 'avg' ? match.reduce(function (a, b) {
                return a + b;
              }) / match.length : colFnName === 'max' ? match.reduce(function (a, b) {
                return a > b ? a : b;
              }) : colFnName === 'min' ? match.reduce(function (a, b) {
                return a < b ? a : b;
              }) : colFnName === 'first' ? match[0] : colFnName === 'last' ? match[match.length - 1] : colFnName === 'count' ? match.length : colFnName === 'unique-count' ? new Set(match).size : colFnName === 'list' ? match.sort().reduce(function (a, b, c, d) {
                return a + (c + 1 === d.length ? ' and ' : ', ') + b;
              }) : colFnName === 'unique-list' ? Array.from(new Set(match)).sort().reduce(function (a, b, c, d) {
                return a + (c + 1 === d.length ? ' and ' : ', ') + b;
              }) : match.join(',');
            }
          } else {
            match = isSeries ? series : isCategory ? category : measure;
          }

          return 'number' === typeof match ? +match.toFixed(5) : match;
        });
      }

      function getLabelFormatter(defaultFormat) {
        var labelType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'tooltip';
        labelType = labelType.toLowerCase();
        var isForChart = labelType === 'chart';
        var isForTooltip = labelType === 'tooltip';

        if (!(isForChart || isForTooltip)) {
          throw new Error("Unknown label format:\t".concat(labelType));
        }

        return function () {
          if (isForTooltip) {
            var tooltipItems = arguments[0];
            var isForTitle = Array.isArray(tooltipItems);

            var _ref2 = isForTitle ? tooltipItems[0] : tooltipItems,
                seriesIndex = _ref2.datasetIndex,
                categoryIndex = _ref2.index;
          } else {
            var labelItem = arguments[1];
            var isForTitle = false;
            var seriesIndex = labelItem.datasetIndex,
                categoryIndex = labelItem.dataIndex;
          }

          var category = categories[categoryIndex];
          var seriesName = series[seriesIndex];
          var measureIndex = categoryIndex + seriesIndex * categoryCount;
          var measure = measures[measureIndex];
          var rows = rowGroups[measureIndex];
          var numberFormat = panel.numberFormat,
              numberFormatDecimals = panel.numberFormatDecimals;
          var _panel$tooltip = panel.tooltip,
              isCustom = _panel$tooltip.isCustom,
              titleFormat = _panel$tooltip.titleFormat,
              labelFormat = _panel$tooltip.labelFormat;
          var strMeasure = !['none', null, void 0].includes(numberFormat) && 'number' === typeof measure ? (0, _ui.getValueFormat)(numberFormat)(measure, numberFormatDecimals, null) : measure;
          var strFormat = (isForTooltip ? isCustom && (isForTitle ? titleFormat : labelFormat) : labelOptions.format) || defaultFormat;
          var strResult = strFormat.replace(/(\\\$)|\$\{(?:(series)|(category)|measure|col:((?:[^\\\}:]+|\\.)+)(?::([\-\w]+))?)\}/g, function (match, isEscapedDollar, isSeries, isCategory, colName, colFnName) {
            if (isEscapedDollar) {
              match = '$';
            } else if (colName) {
              colName = colName.replace(/\\(.)/g, '$1');

              if (_lodash.default.has(rows[0].byColName, colName)) {
                match = rows.map(function (row) {
                  return row.byColName[colName];
                });
                match = colFnName === 'sum' ? match.reduce(function (a, b) {
                  return a + b;
                }) : colFnName === 'avg' ? match.reduce(function (a, b) {
                  return a + b;
                }) / match.length : colFnName === 'max' ? match.reduce(function (a, b) {
                  return a > b ? a : b;
                }) : colFnName === 'min' ? match.reduce(function (a, b) {
                  return a < b ? a : b;
                }) : colFnName === 'first' ? match[0] : colFnName === 'last' ? match[match.length - 1] : colFnName === 'count' ? match.length : colFnName === 'unique-count' ? new Set(match).size : colFnName === 'list' ? match.sort().reduce(function (a, b, c, d) {
                  return a + (c + 1 === d.length ? ' and ' : ', ') + b;
                }) : colFnName === 'unique-list' ? Array.from(new Set(match)).sort().reduce(function (a, b, c, d) {
                  return a + (c + 1 === d.length ? ' and ' : ', ') + b;
                }) : colFnName === 'titlecase' ? _YourJS.default.titleCase(match[0] + '') : colFnName === 'uppercase' ? (match[0] + '').toUpperCase() : colFnName === 'lowercase' ? (match[0] + '').toLowerCase() : match.join(',');
              }
            } else {
              // coerces to strings while making sure that undefined and null become empty strings
              match = [] + [isSeries ? seriesName : isCategory ? category : strMeasure];
            }

            return 'number' === typeof match ? +match.toFixed(5) : match;
          }) || '';
          return isForChart ? (0, _helperFunctions.wrapText)(strResult, labelOptions.wrapAfter) : strResult;
        };
      }

      return {
        ctrl: ctrl,
        data: data,
        rows: rows,
        colIndexesByText: colIndexesByText,
        fullPanel: fullPanel,
        panel: panel,
        countType: countType,
        categoryColIndex: categoryColIndex,
        seriesColIndex: seriesColIndex,
        measureColIndex: measureColIndex,
        labelColIndex: labelColIndex,
        colorColIndex: colorColIndex,
        stackColIndex: stackColIndex,
        seriesStacks: seriesStacks,
        ignoreSeries: ignoreSeries,
        categories: categories,
        series: series,
        categoryCount: categoryCount,
        seriesCount: seriesCount,
        measures: measures,
        measureCount: measureCount,
        labels: labels,
        rowGroups: rowGroups,
        baseColors: baseColors,
        bgColors: bgColors,
        borderColors: borderColors,
        sortOrder: sortOrder,
        formatLabel: getLabelFormatter('${category}: ${measure}', 'chart'),
        tooltipCallbacks: {
          title: getLabelFormatter('${series}'),
          label: getLabelFormatter('${category}: ${measure}')
        },
        testChartEvent: function testChartEvent(e, callback) {
          var elem = this.getElementAtEvent(e)[0];
          var isOpen;

          if (elem) {
            var seriesIndex = elem._datasetIndex,
                categoryIndex = elem._index;
            var category = categories[categoryIndex];
            var seriesName = series[seriesIndex];
            isOpen = panel.drilldownLinks.some(function (drilldownLink, drilldownLinkIndex) {
              // Check this link to see if it matches...
              var url = drilldownLink.url,
                  rgxCategory = drilldownLink.category,
                  rgxSeries = drilldownLink.series;

              if (url) {
                if ((0, _helperFunctions.parseRegExp)(rgxCategory).test(category) && (ignoreSeries || (0, _helperFunctions.parseRegExp)(rgxSeries).test(seriesName))) {
                  callback(drilldownLinkIndex, rowGroups[categoryIndex + seriesIndex * categoryCount]);
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
  }, {
    key: "drawPieChart",
    value: function drawPieChart(canvas) {
      var _this$getChartOptions = this.getChartOptions('pie'),
          ctrl = _this$getChartOptions.ctrl,
          panel = _this$getChartOptions.panel,
          labelColIndex = _this$getChartOptions.labelColIndex,
          colorColIndex = _this$getChartOptions.colorColIndex,
          categories = _this$getChartOptions.categories,
          series = _this$getChartOptions.series,
          categoryCount = _this$getChartOptions.categoryCount,
          measures = _this$getChartOptions.measures,
          bgColors = _this$getChartOptions.bgColors,
          borderColors = _this$getChartOptions.borderColors,
          tooltipCallbacks = _this$getChartOptions.tooltipCallbacks,
          formatLabel = _this$getChartOptions.formatLabel,
          testChartEvent = _this$getChartOptions.testChartEvent;

      var datasets = series.map(function (seriesName, seriesIndex) {
        var fnFilter = function fnFilter(measure, measureIndex) {
          return ~~(measureIndex / categoryCount) === seriesIndex;
        };

        return {
          label: categories,
          data: measures.filter(fnFilter),
          borderWidth: panel.borderWidth,
          borderColor: borderColors.filter(fnFilter),
          backgroundColor: bgColors.filter(fnFilter),
          datalabels: {
            anchor: 'center',
            display: 'auto',
            backgroundColor: (0, _CWestColor.Color)(panel.labels.isBlackText ? 'white' : 'black').a(0.75).rgba(),
            color: (0, _CWestColor.Color)(panel.labels.isBlackText ? 'black' : 'white').rgb(),
            borderRadius: 5,
            formatter: formatLabel,
            textAlign: 'center'
          }
        };
      });
      var chartConfig = {
        responsive: true,
        data: {
          datasets: datasets,
          labels: datasets[0].label
        },
        options: {
          circumference: (panel.isSemiCircle ? 1 : 2) * Math.PI,
          rotation: -Math.PI / (panel.isSemiCircle ? 1 : 2),
          elements: {
            borderWidth: panel.borderWidth
          },
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
          onClick: function onClick(e) {
            testChartEvent.call(this, e, function (drilldownLinkIndex, matchingRows) {
              if (drilldownLinkIndex >= 0) {
                ctrl.openDrilldownLink(panel.drilldownLinks[drilldownLinkIndex], matchingRows);
              }
            });
          },
          hover: {
            onHover: function onHover(e) {
              testChartEvent.call(this, e, function (drilldownLinkIndex, matchingRows) {
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

      var ctx = canvas.getContext('2d');

      if (panel.pieType === 'polar') {
        Chart.PolarArea(ctx, chartConfig);
      } else {
        chartConfig.type = panel.pieType === 'doughnut' ? 'doughnut' : 'pie';
        new Chart(ctx, chartConfig);
      }
    }
  }, {
    key: "drawBarChart",
    value: function drawBarChart(canvas) {
      var _this$getChartOptions2 = this.getChartOptions('bar'),
          ctrl = _this$getChartOptions2.ctrl,
          panel = _this$getChartOptions2.panel,
          seriesStacks = _this$getChartOptions2.seriesStacks,
          ignoreSeries = _this$getChartOptions2.ignoreSeries,
          categories = _this$getChartOptions2.categories,
          series = _this$getChartOptions2.series,
          categoryCount = _this$getChartOptions2.categoryCount,
          measures = _this$getChartOptions2.measures,
          rowGroups = _this$getChartOptions2.rowGroups,
          bgColors = _this$getChartOptions2.bgColors,
          borderColors = _this$getChartOptions2.borderColors,
          tooltipCallbacks = _this$getChartOptions2.tooltipCallbacks,
          formatLabel = _this$getChartOptions2.formatLabel,
          testChartEvent = _this$getChartOptions2.testChartEvent; // If legacy bar chart colors exist convert them to new color setup


      if (_lodash.default.has(panel, ['seriesColors', 0, 'text'])) {
        panel.seriesColors = panel.seriesColors.map(function (color) {
          return color.color;
        });
        panel.colorSource = 'custom';
      }

      var datasets = series.map(function (seriesName, seriesIndex) {
        var fnFilter = function fnFilter(measure, measureIndex) {
          return ~~(measureIndex / categoryCount) === seriesIndex;
        };

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
            backgroundColor: (0, _CWestColor.Color)(panel.labels.isBlackText ? 'white' : 'black').a(0.75).rgba(),
            color: (0, _CWestColor.Color)(panel.labels.isBlackText ? 'black' : 'white').rgb(),
            borderRadius: 5,
            formatter: formatLabel,
            textAlign: 'center'
          }
        };
      });
      var chartConfig = {
        type: panel.orientation === 'horizontal' ? 'horizontalBar' : 'bar',
        data: {
          datasets: datasets,
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
            xAxes: [{
              ticks: {
                autoSkip: panel.scales.xAxes.ticks.autoSkip,
                minRotation: panel.scales.xAxes.ticks.minRotation,
                maxRotation: panel.scales.xAxes.ticks.maxRotation,
                fontColor: IS_LIGHT_THEME ? '#333' : '#CCC',
                userCallback: function userCallback(value, index, values) {
                  var numberFormat = panel.numberFormat,
                      numberFormatDecimals = panel.numberFormatDecimals;
                  return !['none', null, void 0].includes(numberFormat) && 'number' === typeof value ? (0, _ui.getValueFormat)(numberFormat)(value, numberFormatDecimals, null) : value;
                }
              },
              stacked: true,
              gridLines: {
                display: !!panel.scales.xAxes.gridLineOpacity,
                color: IS_LIGHT_THEME ? "rgba(0,0,0,".concat(+panel.scales.xAxes.gridLineOpacity, ")") : "rgba(255,255,255,".concat(+panel.scales.xAxes.gridLineOpacity, ")")
              }
            }],
            yAxes: [{
              ticks: {
                autoSkip: panel.scales.yAxes.ticks.autoSkip,
                minRotation: panel.scales.yAxes.ticks.minRotation,
                maxRotation: panel.scales.yAxes.ticks.maxRotation,
                fontColor: IS_LIGHT_THEME ? '#333' : '#CCC',
                userCallback: function userCallback(value, index, values) {
                  var numberFormat = panel.numberFormat,
                      numberFormatDecimals = panel.numberFormatDecimals;
                  return !['none', null, void 0].includes(numberFormat) && 'number' === typeof value ? (0, _ui.getValueFormat)(numberFormat)(value, numberFormatDecimals, null) : value;
                }
              },
              stacked: true,
              gridLines: {
                display: !!panel.scales.yAxes.gridLineOpacity,
                color: IS_LIGHT_THEME ? "rgba(0,0,0,".concat(+panel.scales.yAxes.gridLineOpacity, ")") : "rgba(255,255,255,".concat(+panel.scales.yAxes.gridLineOpacity, ")")
              }
            }]
          },
          onClick: function onClick(e) {
            testChartEvent.call(this, e, function (drilldownLinkIndex, matchingRows) {
              if (drilldownLinkIndex >= 0) {
                ctrl.openDrilldownLink(panel.drilldownLinks[drilldownLinkIndex], matchingRows);
              }
            });
          },
          hover: {
            onHover: function onHover(e) {
              testChartEvent.call(this, e, function (drilldownLinkIndex, matchingRows) {
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

      var myChart = new Chart(canvas.getContext('2d'), chartConfig);
    }
  }, {
    key: "drawFunnelChart",
    value: function drawFunnelChart(canvas) {
      var _this$getChartOptions3 = this.getChartOptions('funnel'),
          ctrl = _this$getChartOptions3.ctrl,
          panel = _this$getChartOptions3.panel,
          ignoreSeries = _this$getChartOptions3.ignoreSeries,
          categories = _this$getChartOptions3.categories,
          series = _this$getChartOptions3.series,
          categoryCount = _this$getChartOptions3.categoryCount,
          measures = _this$getChartOptions3.measures,
          rowGroups = _this$getChartOptions3.rowGroups,
          bgColors = _this$getChartOptions3.bgColors,
          borderColors = _this$getChartOptions3.borderColors,
          tooltipCallbacks = _this$getChartOptions3.tooltipCallbacks,
          formatLabel = _this$getChartOptions3.formatLabel,
          testChartEvent = _this$getChartOptions3.testChartEvent;

      var dataset = {
        label: categories,
        data: measures,
        borderWidth: 1,
        borderColor: borderColors,
        backgroundColor: bgColors,
        datalabels: panel.labels ? {
          anchor: 'center',
          display: 'auto',
          backgroundColor: (0, _CWestColor.Color)(panel.labels.isBlackText ? 'white' : 'black').a(0.75).rgba(),
          color: (0, _CWestColor.Color)(panel.labels.isBlackText ? 'black' : 'white').rgb(),
          borderRadius: 5,
          formatter: formatLabel,
          textAlign: 'center'
        } : null
      };
      var chartConfig = {
        type: 'funnel',
        responsive: true,
        data: {
          datasets: [dataset],
          labels: 'string' === typeof dataset.label ? dataset.data.map(function (x, i) {
            return "".concat(dataset.label, " #").concat(i + 1);
          }) : dataset.label
        },
        options: {
          startWidthPercent: panel.startWidthPct,
          sort: panel.sortOrder,
          elements: {
            borderWidth: panel.borderWidth
          },
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
          onClick: function onClick(e) {
            testChartEvent.call(this, e, function (drilldownLinkIndex, matchingRows) {
              if (drilldownLinkIndex >= 0) {
                ctrl.openDrilldownLink(panel.drilldownLinks[drilldownLinkIndex], matchingRows);
              }
            });
          },
          hover: {
            onHover: function onHover(e) {
              testChartEvent.call(this, e, function (drilldownLinkIndex, matchingRows) {
                e.target.style.cursor = drilldownLinkIndex >= 0 ? 'pointer' : 'default';
              });
            }
          }
        }
      };

      if (DISABLE_ANIMATIONS) {
        chartConfig.options.animation = false;
      } // if (panel.labels.isShowing) {
      //   chartConfig.plugins = [ChartDataLabels];
      // }


      var myChart = new Chart(canvas.getContext('2d'), chartConfig);
    }
  }, {
    key: "openDrilldownLink",
    value: function openDrilldownLink(drilldownLink, matchingRows) {
      var colIndexesByText = this.data.colIndexesByText,
          variables = this.templateSrv.variables,
          timeSrv = this.timeSrv;
      var url = drilldownLink.url,
          openInBlank = drilldownLink.openInBlank;
      url = url.replace(RGX_OLD_VAR_WORKAROUND, '$1$2').replace(RGX_CELL_PLACEHOLDER, function (match, isTime, opt_timePart, type, name, isRaw, isParam, paramName) {
        if (isTime) {
          var _timeSrv$timeRangeFor = timeSrv.timeRangeForUrl(),
              from = _timeSrv$timeRangeFor.from,
              to = _timeSrv$timeRangeFor.to;

          return (opt_timePart != 'to' ? 'from=' + encodeURIComponent(from) : '') + (opt_timePart ? '' : '&') + (opt_timePart != 'from' ? 'to=' + encodeURIComponent(to) : '');
        }

        name = name && name.replace(/\\(.)/g, '$1');
        paramName = paramName && paramName.replace(/\\(.)/g, '$1');

        var result = _lodash.default.uniq(type == 'col' ? matchingRows.map(function (row) {
          return row[colIndexesByText[name]];
        }) : variables.reduce(function (values, variable) {
          // At times current.value is a string and at times it is an array.
          var varValues = _YourJS.default.toArray(variable.current.value);

          var isAll = variable.includeAll && varValues.length === 1 && varValues[0] === '$__all';
          return variable.name === name ? values.concat(isAll ? [variable.current.text] : varValues) : values;
        }, []));

        return result.length < 1 ? match : isRaw ? result.join(',') : isParam ? result.map(function (v) {
          return encodeURIComponent(paramName == undefined ? type === 'var' ? "var-".concat(name) : name : paramName) + '=' + encodeURIComponent(v);
        }).join('&') : encodeURIComponent(result.join(','));
      });
      window.open(url, drilldownLink.openInBlank ? '_blank' : '_self');
    }
  }, {
    key: "getRange",
    value: function getRange() {
      return _lodash.default.range.apply(this, arguments);
    }
  }, {
    key: "link",
    value: function link(scope, elem, attrs, ctrl) {
      var _this4 = this;

      this.events.on('renderNow', function (e) {
        return _this4.drawChart.call(_this4, e, elem);
      });
      this.events.on('render', _lodash.default.debounce(function (e) {
        return _this4.drawChart.call(_this4, e, elem);
      }, 250));
    }
  }]);

  return ChartJsPanelCtrl;
}(_sdk.MetricsPanelCtrl); // Dont add ChartDataLabels unless user requests this.


exports.ChartJsPanelCtrl = ChartJsPanelCtrl;
Chart.plugins.unregister(ChartDataLabels);
ChartJsPanelCtrl.templateUrl = 'partials/module.html';
//# sourceMappingURL=ctrl.js.map
