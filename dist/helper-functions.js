"use strict";

var _moment = _interopRequireDefault(require("moment"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dateTime(input, formatInput) {
  return (0, _moment.default)(input, formatInput);
}

function parseRegExp(strPattern) {
  var parts = /^\/(.+)\/(\w*)$/.exec(strPattern);
  return parts ? new RegExp(parts[1], parts[2]) : new RegExp('^' + _lodash.default.escapeRegExp(strPattern) + '$', 'i');
}

module.exports = {
  dateTime: dateTime,
  parseRegExp: parseRegExp
};
//# sourceMappingURL=helper-functions.js.map
