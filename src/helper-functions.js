import moment from 'moment';
import _ from 'lodash';

function dateTime(input, formatInput) {
  return moment(input, formatInput);
}

function parseRegExp(strPattern) {
  var parts = /^\/(.+)\/(\w*)$/.exec(strPattern);
  return parts ? new RegExp(parts[1], parts[2]) : new RegExp('^' + _.escapeRegExp(strPattern) + '$', 'i');
}

module.exports = { dateTime, parseRegExp };