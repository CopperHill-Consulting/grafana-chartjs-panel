import moment from 'moment';
import _ from 'lodash';

function dateTime(input, formatInput) {
  return moment(input, formatInput);
}

function parseRegExp(strPattern) {
  let parts = /^\/(.+)\/(\w*)$/.exec(strPattern);
  return parts ? new RegExp(parts[1], parts[2]) : new RegExp(`^${_.escapeRegExp(strPattern)}$`, 'i');
}

/**
 * {@link https://gist.github.com/westc/d9230bf447a551d2b21d2c595fcde46d}
 */
function wrapText(str, opt_max) {
  opt_max = Math.min(Math.max(1, ~~opt_max || 80), 200);
  let rgx = new RegExp(`\\S{1,${opt_max}}|\\s{1,${opt_max}}`, 'g');
  let lastPart, wasNotWS;
  return str.match(rgx).reduce(function (lines, part, partIndex, parts) {
    let isNotWS = /\S/.test(part);
    if (isNotWS) {
      let lineCount = lines.length;
      let lastLine = lines[lineCount - 1];
      let newLastLine;
      if (partIndex > 0 && (newLastLine = lastLine + (wasNotWS ? '' : lastPart) + part).length <= opt_max) {
        lines[lineCount - 1] = newLastLine;
      }
      else {
        lines[lineCount] = part;
      }
    }
    lastPart = part;
    wasNotWS = isNotWS;

    return lines;
  }, []).join('\r\n');
}

module.exports = { dateTime, parseRegExp, wrapText };