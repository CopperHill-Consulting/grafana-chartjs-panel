"use strict";

var _moment = _interopRequireDefault(require("moment"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dateTime(input, formatInput) {
  return (0, _moment.default)(input, formatInput);
}

function parseRegExp(strPattern) {
  var parts = /^\/(.+)\/(\w*)$/.exec(strPattern);
  return parts ? new RegExp(parts[1], parts[2]) : new RegExp("^".concat(_lodash.default.escapeRegExp(strPattern), "$"), 'i');
}
/**
 * {@link https://gist.github.com/westc/d9230bf447a551d2b21d2c595fcde46d}
 */


function wrapText(str, opt_max) {
  opt_max = Math.min(Math.max(1, ~~opt_max || 80), 200);
  var rgx = new RegExp("\\S{1,".concat(opt_max, "}|\\s{1,").concat(opt_max, "}"), 'g');
  var lastPart, wasNotWS;
  return (str.match(rgx) || []).reduce(function (lines, part, partIndex, parts) {
    var isNotWS = /\S/.test(part);

    if (isNotWS) {
      var lineCount = lines.length;
      var lastLine = lines[lineCount - 1];
      var newLastLine;

      if (partIndex > 0 && (newLastLine = lastLine + (wasNotWS ? '' : lastPart) + part).length <= opt_max) {
        lines[lineCount - 1] = newLastLine;
      } else {
        lines[lineCount] = part;
      }
    }

    lastPart = part;
    wasNotWS = isNotWS;
    return lines;
  }, []).join('\r\n');
}

module.exports = {
  dateTime: dateTime,
  parseRegExp: parseRegExp,
  wrapText: wrapText
};
//# sourceMappingURL=helper-functions.js.map
