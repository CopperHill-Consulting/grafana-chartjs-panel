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

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var RGX_CELL_PLACEHOLDER = /\$\{(time)(?:-(to|from))?\}|\$\{(col|var):((?:[^\}:\\]*|\\.)+)(?::(?:(raw)|(param)(?::((?:[^\}:\\]*|\\.)+))?))?\}/g;
var RGX_OLD_VAR_WORKAROUND = /([\?&])var-(\$\{var:(?:[^\}:\\]*|\\.)+:param\})/g;
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
  numberFormat: 'none',
  numberFormatDecimals: 0,
  tooltip: {
    isCustom: false,
    titleFormat: null,
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
var BAR_OPTIONS = Object.keys(_YourJS.default.flattenKeys(BAR_DEFAULTS, true));
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
var FUNNEL_OPTIONS = Object.keys(_YourJS.default.flattenKeys(FUNNEL_DEFAULTS, true));
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
var PIE_OPTIONS = Object.keys(_YourJS.default.flattenKeys(PIE_DEFAULTS, true));
var OPTIONS_BY_TYPE = {
  bar: BAR_OPTIONS,
  pie: PIE_OPTIONS,
  funnel: FUNNEL_OPTIONS
};

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
    key: "formatTooltipText",
    value: function formatTooltipText(strFormat, rowsByColName, series, category, measure) {
      return strFormat.replace(/(\\\$)|\$\{(?:(series)|(category)|measure|col:((?:[^\\\}:]+|\\.)+)(?::([\-\w]+))?)\}/g, function (match, isEscapedDollar, isSeries, isCategory, colName, colFnName) {
        if (isEscapedDollar) {
          match = '$';
        } else if (colName) {
          colName = colName.replace(/\\(.)/g, '$1');

          if (_lodash.default.has(rowsByColName[0], colName)) {
            match = rowsByColName.map(function (row) {
              return row[colName];
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
        var data = dataList[0];
        var type = data.type,
            columns = data.columns,
            rows = data.rows;
        var columnTexts = columns.map(function (col) {
          return 'string' === typeof col ? col : col.text;
        });
        var colIndexesByText = columnTexts.reduceRight(function (indexes, colText, index) {
          return Object.assign(indexes, _defineProperty({}, colText, index));
        }, {});
        var rowsByColName = rows.map(function (cells, rowIndex) {
          return cells.reduce(function (carry, cellValue, cellIndex) {
            return Object.assign(carry, _defineProperty({}, columnTexts[cellIndex], cellValue));
          }, {});
        });
        this.data = {
          type: type,
          columns: columns,
          rows: rows,
          columnTexts: columnTexts,
          colIndexesByText: colIndexesByText,
          rowsByColName: rowsByColName
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
    key: "drawPieChart",
    value: function drawPieChart(canvas) {
      var ctrl = this;
      var data = ctrl.data;
      var rows = data.rows,
          colIndexesByText = data.colIndexesByText;
      var fullPanel = ctrl.panel;
      var panel = fullPanel.pie;
      var categoryColIndex = ctrl.getColIndex('category', panel);
      var seriesColIndex = panel.pieType === 'polar' ? -1 : ctrl.getColIndex('series', panel, true);
      var measureColIndex = ctrl.getColIndex('measure', panel);
      var labelColIndex = ctrl.getColIndex('label', panel, true);
      var colorColIndex = ctrl.getColIndex('color', panel, true);
      var ignoreSeries = seriesColIndex < 0;

      var categories = _lodash.default.uniq(rows.map(function (row) {
        return row[categoryColIndex];
      })).reverse();

      var series = _lodash.default.uniq(rows.map(function (row) {
        return row[seriesColIndex];
      })).reverse();

      var categoryCount = categories.length;
      var seriesCount = series.length;
      var measureCount = categoryCount * seriesCount;

      var _rows$reduce = rows.reduce(function (carry, row, rowIndex) {
        var category = row[categoryColIndex];
        var categoryIndex = categories.indexOf(category);
        var seriesName = row[seriesColIndex];
        var seriesIndex = series.indexOf(seriesName);
        var index = categoryIndex + seriesIndex * categoryCount;
        carry.measures[index] = (carry.measures[index] || 0) + row[measureColIndex];
        carry.labels[index] = carry.labels[index] || row[labelColIndex];
        carry.colors[index] = carry.colors[index] || row[colorColIndex];
        return carry;
      }, {
        measures: [],
        labels: [],
        colors: []
      }),
          measures = _rows$reduce.measures,
          labels = _rows$reduce.labels,
          colors = _rows$reduce.colors;

      var baseColors;
      var colorSource = panel.colorSource,
          seriesColors = panel.seriesColors,
          colorColumnName = panel.colorColumnName,
          colorBy = panel.colorBy,
          sortOrder = panel.sortOrder;
      var seriesColorCount = seriesColors.length;
      var isLightTheme = _config.default.theme.type === 'light';

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
      }

      function testChartEvent(e, callback) {
        var elem = this.getElementAtEvent(e)[0];
        var isOpen;

        if (elem) {
          var category = categories[elem._index];
          isOpen = panel.drilldownLinks.some(function (drilldownLink, drilldownLinkIndex) {
            // Check this link to see if it matches...
            var url = drilldownLink.url,
                rgxCategory = drilldownLink.category;

            if (url) {
              rgxCategory = (0, _helperFunctions.parseRegExp)(rgxCategory);

              if (rgxCategory.test(category)) {
                callback(drilldownLinkIndex, rows.filter(function (row) {
                  return row[categoryColIndex] === category;
                }));
                return true;
              }
            }
          });
        }

        if (!isOpen) {
          callback(-1, []);
        }
      } // Derive the background and border colors from the base colors.


      var bgColors = baseColors.map(function (color) {
        return color.a(panel.dataBgColorAlpha).rgba();
      });
      var borderColors = baseColors.map(function (color) {
        return color.l(panel.dataBorderBrightness).a(panel.dataBorderColorAlpha).rgba();
      });
      var datasets = series.map(function (seriesName, seriesIndex) {
        return {
          label: categories,
          data: measures.filter(function (measure, measureIndex) {
            return ~~(measureIndex / categoryCount) === seriesIndex;
          }),
          borderWidth: panel.borderWidth,
          borderColor: borderColors.filter(function (measure, measureIndex) {
            return ~~(measureIndex / categoryCount) === seriesIndex;
          }),
          backgroundColor: bgColors.filter(function (measure, measureIndex) {
            return ~~(measureIndex / categoryCount) === seriesIndex;
          }),
          datalabels: {
            anchor: 'center',
            display: 'auto',
            backgroundColor: (0, _CWestColor.Color)(panel.labels.isBlackText ? 'white' : 'black').a(0.75).rgba(),
            color: (0, _CWestColor.Color)(panel.labels.isBlackText ? 'black' : 'white').rgb(),
            borderRadius: 5,
            formatter: function formatter(value, _ref) {
              var dataIndex = _ref.dataIndex,
                  datasetIndex = _ref.datasetIndex;
              var result = labels[dataIndex + datasetIndex * categoryCount];

              if (labelColIndex < 0) {
                var numberFormat = panel.numberFormat,
                    numberFormatDecimals = panel.numberFormatDecimals;
                result = !['none', null, void 0].includes(numberFormat) && 'number' === typeof value ? (0, _ui.getValueFormat)(numberFormat)(value, numberFormatDecimals, null) : value;
              }

              return (0, _helperFunctions.wrapText)("".concat(result), panel.labels.wrapAfter);
            },
            textAlign: 'center'
          }
        };
      });
      var chartConfig = {
        responsive: true,
        data: {
          datasets: datasets,
          labels: 'string' === typeof datasets[0].label ? datasets[0].data.map(function (x, i) {
            return "".concat(datasets[0].label, " #").concat(i + 1);
          }) : datasets[0].label
        },
        options: {
          circumference: (panel.isSemiCircle ? 1 : 2) * Math.PI,
          rotation: -Math.PI / (panel.isSemiCircle ? 1 : 2),
          elements: {
            borderWidth: panel.borderWidth
          },
          tooltips: {
            callbacks: {
              title: function title(_ref2, data) {
                var _ref3 = _slicedToArray(_ref2, 1),
                    tooltipItem = _ref3[0];

                return series[tooltipItem.datasetIndex];
              },
              label: function label(tooltipItem, data) {
                var numberFormat = panel.numberFormat,
                    numberFormatDecimals = panel.numberFormatDecimals;
                var label = data.datasets[tooltipItem.datasetIndex].label[tooltipItem.index];
                var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                value = !['none', null, void 0].includes(numberFormat) && 'number' === typeof value ? (0, _ui.getValueFormat)(numberFormat)(value, numberFormatDecimals, null) : value;
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
              fontColor: isLightTheme ? '#333' : '#CCC'
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
      var ctrl = this;
      var data = ctrl.data;
      var rows = data.rows,
          rowsByColName = data.rowsByColName,
          colIndexesByText = data.colIndexesByText;
      var fullPanel = ctrl.panel;
      var panel = fullPanel.bar;
      var categoryColIndex = ctrl.getColIndex('category', panel);
      var seriesColIndex = ctrl.getColIndex('series', panel, true);
      var stackColIndex = ctrl.getColIndex('stack', panel, true);
      var measureColIndex = ctrl.getColIndex('measure', panel);
      var ignoreSeries = seriesColIndex < 0;

      var categories = _lodash.default.uniq(rows.map(function (row) {
        return row[categoryColIndex];
      }));

      var _rows$reduce2 = rows.reduce(function (carry, row) {
        var seriesName = row[seriesColIndex];

        if (!carry.series.includes(seriesName)) {
          carry.series.push(seriesName);
          carry.seriesStacks.push(row[stackColIndex]);
        }

        return carry;
      }, {
        series: [],
        seriesStacks: []
      }),
          series = _rows$reduce2.series,
          seriesStacks = _rows$reduce2.seriesStacks;

      series = series.map(function (name) {
        return name === undefined ? 'Series' : name;
      });
      seriesStacks = seriesStacks.map(function (name) {
        return name === undefined ? 'Stack' : name;
      }); // If legacy bar chart colors exist convert them to new color setup

      if (_lodash.default.has(panel, ['seriesColors', 0, 'text'])) {
        panel.seriesColors = panel.seriesColors.map(function (color) {
          return color.color;
        });
        panel.colorSource = 'custom';
      }

      var colorSource = panel.colorSource,
          seriesColors = panel.seriesColors,
          colorColumnName = panel.colorColumnName,
          colorBy = panel.colorBy;
      var colorColIndex;

      if (colorSource === 'column') {
        colorColIndex = ctrl.getColIndex('color', panel);
      }

      var rowCount = rows.length;
      var colorCount = colorBy === 'category' ? categories.length : colorBy === 'both' ? categories.length * series.length : series.length;
      var baseColors = series.map(function (seriesName, seriesIndex) {
        return categories.map(function (catName, catIndex) {
          if (colorSource === 'column' && colorColIndex >= 0) {
            // column
            for (var row, rowIndex = 0; rowIndex < rowCount; rowIndex++) {
              row = rows[rowIndex];

              if ((seriesColIndex < 0 || row[seriesColIndex] === seriesName) && row[categoryColIndex] === catName) {
                return (0, _CWestColor.Color)(row[colorColIndex]);
              }
            }
          } else {
            var index = colorBy === 'category' ? catIndex : colorBy === 'both' ? catIndex + categories.length * seriesIndex : seriesIndex;

            if (colorSource === 'custom') {
              // user-defined
              return (0, _CWestColor.Color)(seriesColors[index % seriesColors.length]);
            } else {
              // rainbow (default)
              return _CWestColor.Color.hsl(~~(360 * index / colorCount), 1, 0.5);
            }
          }
        });
      });

      function testChartEvent(e, callback) {
        var target = this.getElementAtEvent(e)[0];
        var model = target && target._model;
        var isOpen;

        if (model) {
          var category = model.label;
          var seriesName = model.datasetLabel;
          isOpen = panel.drilldownLinks.some(function (drilldownLink, drilldownLinkIndex) {
            // Check this link to see if it matches...
            var url = drilldownLink.url,
                rgxCategory = drilldownLink.category,
                rgxSeries = drilldownLink.series;

            if (url) {
              rgxCategory = (0, _helperFunctions.parseRegExp)(rgxCategory);
              rgxSeries = !ignoreSeries && (0, _helperFunctions.parseRegExp)(rgxSeries);

              if (rgxCategory.test(category) && (ignoreSeries || rgxSeries.test(seriesName))) {
                callback(drilldownLinkIndex, rows.filter(function (row) {
                  return row[categoryColIndex] === category && (ignoreSeries || row[seriesColIndex] === seriesName);
                }));
                return true;
              }
            }
          });
        }

        if (!isOpen) {
          callback(-1, []);
        }
      }

      var isLightTheme = _config.default.theme.type === 'light';
      var measures = {};
      var chartConfig = {
        type: panel.orientation === 'horizontal' ? 'horizontalBar' : 'bar',
        data: {
          labels: categories,
          datasets: series.map(function (seriesName, seriesNameIndex) {
            return {
              label: seriesName,
              backgroundColor: baseColors[seriesNameIndex].map(function (color) {
                return color.a(panel.dataBgColorAlpha).rgba();
              }),
              borderColor: baseColors[seriesNameIndex].map(function (color) {
                return color.l(panel.dataBorderBrightness).a(panel.dataBorderColorAlpha).rgba();
              }),
              borderWidth: panel.borderWidth,
              stack: panel.isStacked ? seriesStacks[seriesNameIndex] : seriesNameIndex,
              filteredRows: categories.map(function (category) {
                return rows.reduce(function (carry, row, rowIndex) {
                  if (row[categoryColIndex] === category && (seriesColIndex < 0 || row[seriesColIndex] === seriesName)) {
                    carry.push(rowsByColName[rowIndex]);
                  }

                  return carry;
                }, []);
              }),
              data: categories.map(function (category) {
                var sum = rows.reduce(function (sum, row) {
                  var isMatch = row[categoryColIndex] === category && (seriesColIndex < 0 || row[seriesColIndex] === seriesName);
                  return sum + (isMatch ? +row[measureColIndex] || 0 : 0);
                }, 0);
                return (measures[category] = measures[category] || {})[seriesName] = sum;
              })
            };
          })
        },
        //plugins: [ChartDataLabels],
        options: {
          responsive: true,
          tooltips: {
            mode: 'point',
            callbacks: {
              title: function title(_ref4, data) {
                var _ref5 = _slicedToArray(_ref4, 1),
                    tooltipItem = _ref5[0];

                if (!ignoreSeries) {
                  var datasets = data.datasets,
                      labels = data.labels;
                  var dataset = datasets[tooltipItem.datasetIndex];
                  var catName = labels[tooltipItem.index];
                  var seriesName = dataset.label;
                  var value = tooltipItem[panel.orientation === 'horizontal' ? 'xLabel' : 'yLabel'];
                  var filteredRows = dataset.filteredRows[tooltipItem.index];
                  var _panel$tooltip = panel.tooltip,
                      isCustom = _panel$tooltip.isCustom,
                      titleFormat = _panel$tooltip.titleFormat;
                  return isCustom ? titleFormat ? ctrl.formatTooltipText(titleFormat, filteredRows, seriesName, catName, value) : null : tooltipItem[panel.orientation === 'horizontal' ? 'yLabel' : 'xLabel'];
                }
              },
              label: function label(tooltipItem, data) {
                var datasets = data.datasets,
                    labels = data.labels;
                var dataset = datasets[tooltipItem.datasetIndex];
                var catName = labels[tooltipItem.index];
                var seriesName = dataset.label;
                var numberFormat = panel.numberFormat,
                    numberFormatDecimals = panel.numberFormatDecimals;
                var _panel$tooltip2 = panel.tooltip,
                    isCustom = _panel$tooltip2.isCustom,
                    labelFormat = _panel$tooltip2.labelFormat;
                var label = ignoreSeries ? tooltipItem[panel.orientation === 'horizontal' ? 'yLabel' : 'xLabel'] : seriesName;
                var value = tooltipItem[panel.orientation === 'horizontal' ? 'xLabel' : 'yLabel'];
                var strValue = !['none', null, void 0].includes(numberFormat) && 'number' === typeof value ? (0, _ui.getValueFormat)(numberFormat)(value, numberFormatDecimals, null) : value;
                var filteredRows = dataset.filteredRows[tooltipItem.index];
                return isCustom && labelFormat ? ctrl.formatTooltipText(labelFormat, filteredRows, seriesName, catName, value) : label + ': ' + strValue;
              }
            }
          },
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
            xAxes: [{
              ticks: {
                autoSkip: panel.scales.xAxes.ticks.autoSkip,
                minRotation: panel.scales.xAxes.ticks.minRotation,
                maxRotation: panel.scales.xAxes.ticks.maxRotation,
                fontColor: isLightTheme ? '#333' : '#CCC',
                userCallback: function userCallback(value, index, values) {
                  var numberFormat = panel.numberFormat,
                      numberFormatDecimals = panel.numberFormatDecimals;
                  return !['none', null, void 0].includes(numberFormat) && 'number' === typeof value ? (0, _ui.getValueFormat)(numberFormat)(value, numberFormatDecimals, null) : value;
                }
              },
              stacked: true,
              gridLines: {
                display: !!panel.scales.xAxes.gridLineOpacity,
                color: isLightTheme ? "rgba(0,0,0,".concat(+panel.scales.xAxes.gridLineOpacity, ")") : "rgba(255,255,255,".concat(+panel.scales.xAxes.gridLineOpacity, ")")
              }
            }],
            yAxes: [{
              ticks: {
                autoSkip: panel.scales.yAxes.ticks.autoSkip,
                minRotation: panel.scales.yAxes.ticks.minRotation,
                maxRotation: panel.scales.yAxes.ticks.maxRotation,
                fontColor: isLightTheme ? '#333' : '#CCC',
                userCallback: function userCallback(value, index, values) {
                  var numberFormat = panel.numberFormat,
                      numberFormatDecimals = panel.numberFormatDecimals;
                  return !['none', null, void 0].includes(numberFormat) && 'number' === typeof value ? (0, _ui.getValueFormat)(numberFormat)(value, numberFormatDecimals, null) : value;
                }
              },
              stacked: true,
              gridLines: {
                display: !!panel.scales.yAxes.gridLineOpacity,
                color: isLightTheme ? "rgba(0,0,0,".concat(+panel.scales.yAxes.gridLineOpacity, ")") : "rgba(255,255,255,".concat(+panel.scales.yAxes.gridLineOpacity, ")")
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
      var myChart = new Chart(canvas.getContext('2d'), chartConfig);
    }
  }, {
    key: "drawFunnelChart",
    value: function drawFunnelChart(canvas) {
      var ctrl = this;
      var data = ctrl.data;
      var rows = data.rows,
          colIndexesByText = data.colIndexesByText;
      var fullPanel = ctrl.panel;
      var panel = fullPanel.funnel;
      var categoryColIndex = ctrl.getColIndex('category', panel);
      var measureColIndex = ctrl.getColIndex('measure', panel);

      var categories = _lodash.default.uniq(rows.map(function (row) {
        return row[categoryColIndex];
      }));

      var measures = rows.reduce(function (measures, row, rowIndex) {
        var measureIndex = categories.indexOf(row[categoryColIndex]);
        measures[measureIndex] = (measures[measureIndex] || 0) + row[measureColIndex];
        return measures;
      }, []);
      var baseColors;
      var colorSource = panel.colorSource,
          seriesColors = panel.seriesColors,
          colorColumnName = panel.colorColumnName,
          sortOrder = panel.sortOrder;
      var isLightTheme = _config.default.theme.type === 'light';

      if (colorSource === 'column') {
        if (!_lodash.default.has(colIndexesByText, colorColumnName)) {
          throw new Error('Invalid color column.');
        }

        baseColors = categories.map(function (category) {
          return (0, _CWestColor.Color)(rows.find(function (row) {
            return row[categoryColIndex] === category;
          })[colIndexesByText[colorColumnName]]);
        });
      } else if (colorSource === 'custom') {
        baseColors = categories.map(function (category, index, categories) {
          return (0, _CWestColor.Color)(seriesColors[index % seriesColors.length]);
        });
      } else {
        baseColors = categories.map(function (category, index, categories) {
          return _CWestColor.Color.hsl(~~(360 * index / categories.length), 1, 0.5);
        });
      } // Sort the measures and then the categories accordingly.


      var altBaseColors;
      measures = measures.map(function (value, index) {
        return {
          index: index,
          value: value
        };
      });
      measures.sort(sortOrder === 'desc' ? function (a, b) {
        return b.value - a.value;
      } : function (a, b) {
        return a.value - b.value;
      });

      var _measures$reduce = measures.reduce(function (carry, measure, index) {
        var _carry = _slicedToArray(carry, 3),
            altBaseColors = _carry[0],
            newCategories = _carry[1],
            newMeasures = _carry[2];

        altBaseColors.push(baseColors[measure.index]);
        newCategories.push(categories[measure.index]);
        newMeasures.push(measure.value);
        return carry;
      }, [[], [], []]);

      var _measures$reduce2 = _slicedToArray(_measures$reduce, 3);

      altBaseColors = _measures$reduce2[0];
      categories = _measures$reduce2[1];
      measures = _measures$reduce2[2];

      // If using a column as the source of the colors make sure to order them according to the categories.
      if (colorSource === 'column') {
        baseColors = altBaseColors;
      }

      function testChartEvent(e, callback) {
        var elem = this.getElementAtEvent(e)[0];
        var isOpen;

        if (elem) {
          var category = categories[elem._index];
          isOpen = panel.drilldownLinks.some(function (drilldownLink, drilldownLinkIndex) {
            // Check this link to see if it matches...
            var url = drilldownLink.url,
                rgxCategory = drilldownLink.category;

            if (url) {
              rgxCategory = (0, _helperFunctions.parseRegExp)(rgxCategory);

              if (rgxCategory.test(category)) {
                callback(drilldownLinkIndex, rows.filter(function (row) {
                  return row[categoryColIndex] === category;
                }));
                return true;
              }
            }
          });
        }

        if (!isOpen) {
          callback(-1, []);
        }
      } // Derive the background and border colors from the base colors.


      var bgColors = baseColors.map(function (color) {
        return color.a(panel.dataBgColorAlpha).rgba();
      });
      var borderColors = baseColors.map(function (color) {
        return color.l(panel.dataBorderBrightness).a(panel.dataBorderColorAlpha).rgba();
      });
      var dataset = {
        label: categories,
        data: measures,
        borderWidth: 1,
        borderColor: borderColors,
        backgroundColor: bgColors
      };
      var chartConfig = {
        type: 'funnel',
        // plugins: [ChartDataLabels],
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
            callbacks: {
              label: function label(tooltipItem, data) {
                var numberFormat = panel.numberFormat,
                    numberFormatDecimals = panel.numberFormatDecimals;
                var label = data.datasets[tooltipItem.datasetIndex].label[tooltipItem.index];
                var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                value = !['none', null, void 0].includes(numberFormat) && 'number' === typeof value ? (0, _ui.getValueFormat)(numberFormat)(value, numberFormatDecimals, null) : value;
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
              fontColor: isLightTheme ? '#333' : '#CCC'
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
      var myChart = new Chart(canvas.getContext('2d'), chartConfig);
    }
  }, {
    key: "openDrilldownLink",
    value: function openDrilldownLink(drilldownLink, matchingRows) {
      var colIndexesByText = this.data.colIndexesByText,
          variables = this.templateSrv.variables,
          timeVars = this.timeSrv.time;
      var url = drilldownLink.url,
          openInBlank = drilldownLink.openInBlank;
      url = url.replace(RGX_OLD_VAR_WORKAROUND, '$1$2').replace(RGX_CELL_PLACEHOLDER, function (match, isTime, opt_timePart, type, name, isRaw, isParam, paramName) {
        if (isTime) {
          return (opt_timePart != 'to' ? 'from=' + encodeURIComponent(timeVars.from) : '') + (opt_timePart ? '' : '&') + (opt_timePart != 'from' ? 'to=' + encodeURIComponent(timeVars.to) : '');
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
