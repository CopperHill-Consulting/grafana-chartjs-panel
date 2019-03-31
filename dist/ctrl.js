"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChartJsPanelCtrl = void 0;

var _sdk = require("app/plugins/sdk");

var _lodash = _interopRequireDefault(require("lodash"));

var _YourJS = _interopRequireDefault(require("./external/YourJS.min"));

var Chart = _interopRequireWildcard(require("./external/Chart.bundle.min"));

var _CWestColor = require("./external/CWest-Color.min");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var panelDefaults = {
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
      }
    },
    yAxes: {
      ticks: {
        autoSkip: true,
        minRotation: 0,
        maxRotation: 90
      }
    }
  }
};

function renderChart(_ref) {
  var canvas = _ref.canvas,
      _ref$data = _ref.data,
      dataType = _ref$data.type,
      columns = _ref$data.columns,
      rows = _ref$data.rows,
      columnTexts = _ref$data.columnTexts,
      panel = _ref.panel,
      variables = _ref.variables;

  if (dataType !== 'table') {
    throw new Error('Data type must be "table".');
  }

  var colIndexesByText = columnTexts.reduceRight(function (indexes, colText, index) {
    return Object.assign(indexes, _defineProperty({}, colText, index));
  }, {});

  if (!_lodash.default.has(colIndexesByText, panel.categoryColumnName)) {
    throw new Error('Invalid category column.');
  }

  var categoryIndex = colIndexesByText[panel.categoryColumnName];

  if (panel.seriesColumnName != undefined && !_lodash.default.has(colIndexesByText, panel.seriesColumnName)) {
    throw new Error('Invalid series column.');
  }

  var seriesIndex = panel.seriesColumnName != undefined ? colIndexesByText[panel.seriesColumnName] : -1;

  if (!_lodash.default.has(colIndexesByText, panel.measureColumnName)) {
    throw new Error('Invalid measure column.');
  }

  var measureIndex = colIndexesByText[panel.measureColumnName];
  var colRows = rows.map(function (row) {
    return row.reduceRight(function (colRow, value, index) {
      return Object.assign(colRow, _defineProperty({}, columnTexts[index], value));
    }, {});
  });

  var categories = _toConsumableArray(new Set(rows.map(function (row) {
    return row[categoryIndex];
  })));

  var series = _toConsumableArray(new Set(rows.map(function (row) {
    return row[seriesIndex];
  })));

  var oldColors = panel.seriesColors.slice();
  var newColors = series.map(function (seriesName, index, series) {
    var oldIndex = oldColors.findIndex(function (c) {
      return c.text === seriesName;
    });
    return {
      text: seriesName,
      color: oldIndex < 0 ? _CWestColor.Color.hsl(~~(360 * index / series.length), 1, 0.5) + '' : oldColors[oldIndex].color
    };
  });
  panel.seriesColors = newColors; // Defined with barChartData.data is defined...

  var measures = {};
  var barChartData = {
    labels: categories,
    datasets: series.map(function (seriesName, seriesNameIndex) {
      return {
        label: seriesName == undefined ? 'Series ' + (seriesNameIndex + 1) : seriesName,
        backgroundColor: (0, _CWestColor.Color)(newColors[seriesNameIndex].color).a(panel.dataBgColorAlpha).rgba(),
        borderColor: (0, _CWestColor.Color)(newColors[seriesNameIndex].color).a(panel.dataBorderColorAlpha).rgba(),
        borderWidth: 1,
        stack: 'Stack ' + (panel.isStacked ? 0 : seriesNameIndex),
        data: categories.map(function (category) {
          var sum = rows.reduce(function (sum, row) {
            var isMatch = row[categoryIndex] === category && (seriesIndex < 0 || row[seriesIndex] === seriesName);
            return sum + (isMatch ? +row[measureIndex] || 0 : 0);
          }, 0);
          return (measures[category] = measures[category] || {})[seriesName] = sum;
        })
      };
    })
  };
  var myChart = new Chart(canvas, {
    type: panel.chartType,
    data: barChartData,
    options: {
      responsive: true,
      legend: {
        display: panel.legend.isShowing,
        position: panel.legend.position,
        fullWidth: panel.legend.isFullWidth,
        reverse: panel.legend.isReverse
      },
      scales: {
        xAxes: [{
          ticks: {
            autoSkip: panel.scales.xAxes.ticks.autoSkip,
            minRotation: panel.scales.xAxes.ticks.minRotation,
            maxRotation: panel.scales.xAxes.ticks.maxRotation
          },
          stacked: true
        }],
        yAxes: [{
          ticks: {
            autoSkip: panel.scales.yAxes.ticks.autoSkip,
            minRotation: panel.scales.yAxes.ticks.minRotation,
            maxRotation: panel.scales.yAxes.ticks.maxRotation
          },
          stacked: true
        }]
      },
      onClick: function onClick(e) {
        var target = myChart.getElementAtEvent(e)[0],
            model = target && target._model;

        if (model) {
          var category = model.label;
          var _series = model.datasetLabel;
          panel.drilldownLinks.forEach(function (drilldownLink) {
            var url = drilldownLink.url;

            if (url) {
              var rgxCategory = parseRegExp(drilldownLink.category);
              var rgxSeries = parseRegExp(drilldownLink.series);

              if (rgxCategory.test(category) && (_series == undefined || rgxSeries.test(_series))) {
                url = url.replace(/\${(col|var):((?:[^\}:\\]*|\\.)+)(?::(?:(raw)|(param)(?::((?:[^\}:\\]*|\\.)+))?))?}/g, function (match, type, name, isRaw, isParam, paramName) {
                  var result = _toConsumableArray(new Set(type == 'col' ? getColValuesFor(colIndexesByText[name], category, _series, categoryIndex, seriesIndex, rows) : getVarValuesFor(name, variables)));

                  return result.length < 1 ? match : isRaw ? result.join(',') : isParam ? result.map(function (v) {
                    return encodeURIComponent(paramName == undefined ? name : paramName) + '=' + encodeURIComponent(v);
                  }).join('&') : encodeURIComponent(result.join(','));
                });
                window.open(url, drilldownLink.openInBlank ? '_blank' : '_self');
              }
            }
          });
        }
      }
    }
  });
}

function getColValuesFor(colIndex, category, series, catColIndex, seriesColIndex, rows) {
  if (colIndex >= 0) {
    return rows.reduce(function (values, row) {
      if (category === row[catColIndex] && (seriesColIndex < 0 || row[seriesColIndex] === series)) {
        values.push(row[colIndex]);
      }

      return values;
    }, []);
  }

  return [];
}

function getVarValuesFor(varName, variables) {
  return variables.reduce(function (values, variable) {
    // At times current.value is a string and at times it is an array.
    var varValues = _YourJS.default.toArray(variable.current.value);

    var isAll = variable.includeAll && varValues.length === 1 && varValues[0] === '$__all';
    return variable.name === varName ? values.concat(isAll ? [variable.current.text] : varValues) : values;
  }, []);
}

function parseRegExp(strPattern) {
  var parts = /^\/(.+)\/(\w*)$/.exec(strPattern);
  return parts ? new RegExp(parts[1], parts[2]) : new RegExp('^' + _lodash.default.escapeRegExp(strPattern) + '$', 'i');
}

function renderNow(e, jElem) {
  var error,
      isValid = false,
      ctrl = this,
      data = ctrl.data,
      jContent = jElem.find('.panel-content').css('position', 'relative').html(''),
      elemContent = jContent[0],
      jCanvas = jQuery('<canvas>').appendTo(jContent);

  if (data && data.rows.length) {
    if (data.type === 'table') {
      jCanvas.prop({
        width: jContent.width(),
        height: jContent.height()
      });

      try {
        renderChart({
          canvas: jCanvas[0],
          data: data,
          panel: ctrl.panel,
          variables: ctrl.templateSrv.variables
        });
        isValid = true;
      } catch (e) {
        console.error('renderChart:', error = e);
      }
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

var ChartJsPanelCtrl =
/*#__PURE__*/
function (_MetricsPanelCtrl) {
  _inherits(ChartJsPanelCtrl, _MetricsPanelCtrl);

  function ChartJsPanelCtrl($scope, $injector, $rootScope) {
    var _this;

    _classCallCheck(this, ChartJsPanelCtrl);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ChartJsPanelCtrl).call(this, $scope, $injector));
    _this.CHART_TYPES = [{
      value: 'horizontalBar',
      text: 'Horizontal Bar'
    }, {
      value: 'bar',
      text: 'Vertical Bar'
    }];
    _this.COLOR_ALPHAS = _lodash.default.range(0, 101, 5).map(function (x) {
      return {
        value: x / 100,
        text: "".concat(x, "%") + (x ? x === 100 ? ' (Solid)' : '' : ' (Invisible)')
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

    _lodash.default.defaults(_this.panel, panelDefaults);

    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_assertThisInitialized(_this)));

    _this.events.on('data-received', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('data-error', _this.onDataError.bind(_assertThisInitialized(_this)));

    return _this;
  }

  _createClass(ChartJsPanelCtrl, [{
    key: "addDrilldownLink",
    value: function addDrilldownLink() {
      this.panel.drilldownLinks.push({
        category: '/[^]*/',
        series: '/[^]*/',
        url: '',
        openInBlank: true
      });
    }
  }, {
    key: "removeDrilldownLink",
    value: function removeDrilldownLink(drilldownLink) {
      var links = this.panel.drilldownLinks;
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
        this.data = {
          isReal: true,
          type: data.type,
          columns: data.columns,
          rows: data.rows,
          columnTexts: data.columns.map(function (col) {
            return 'string' === typeof col ? col : col.text;
          })
        };
      } else {
        this.data = {
          isReal: false,
          type: 'table',
          columns: [{
            text: "Off"
          }, {
            text: "Down"
          }, {
            text: "Run"
          }, {
            text: "Idle"
          }],
          rows: [[15, 50, 0, 40], [15, 5, 40, 15], [15, 30, 40, 15], [15, 30, 80, 15]]
        };
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
    key: "link",
    value: function link(scope, elem, attrs, ctrl) {
      var _this3 = this;

      this.events.on('renderNow', function (e) {
        return renderNow.call(_this3, e, elem);
      });
      this.events.on('render', _lodash.default.debounce(function (e) {
        return renderNow.call(_this3, e, elem);
      }, 250));
    }
  }]);

  return ChartJsPanelCtrl;
}(_sdk.MetricsPanelCtrl);

exports.ChartJsPanelCtrl = ChartJsPanelCtrl;
ChartJsPanelCtrl.templateUrl = 'partials/module.html';
//# sourceMappingURL=ctrl.js.map
