'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _extends = require('./extends-5150c1f4.js');
var objectWithoutProperties = require('./objectWithoutProperties-5d2c0728.js');
var React = require('react');
var IconPropTypes = require('./IconPropTypes-f5b14dc5.js');
require('./_commonjsHelpers-1b94f6bc.js');
require('./slicedToArray-bb07ac16.js');
require('./unsupportedIterableToArray-d5a3ce67.js');
require('./index-c33eeeef.js');
require('./index-37353731.js');
require('./constants.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function IconHash(_ref) {
  var size = _ref.size,
      props = objectWithoutProperties._objectWithoutProperties(_ref, ["size"]);

  var sizeValue = IconPropTypes.useIconSize(size);
  return /*#__PURE__*/React__default['default'].createElement("svg", _extends._extends({
    width: sizeValue,
    height: sizeValue,
    fill: "none",
    viewBox: "0 0 24 24"
  }, props), /*#__PURE__*/React__default['default'].createElement("path", {
    fill: "currentColor",
    stroke: "currentColor",
    strokeWidth: 0.2,
    d: "M18.537 8.902H5.463a.646.646 0 000 1.293h13.074a.646.646 0 000-1.293zm0 4.903H5.463a.646.646 0 100 1.293h13.074a.646.646 0 000-1.293z"
  }), /*#__PURE__*/React__default['default'].createElement("path", {
    fill: "currentColor",
    stroke: "currentColor",
    strokeWidth: 0.2,
    d: "M10.437 4.004a.646.646 0 00-.714.571L8.09 19.283a.646.646 0 101.285.142l1.634-14.707a.646.646 0 00-.57-.714zm4.903 0a.646.646 0 00-.714.571l-1.634 14.707a.646.646 0 001.285.143L15.91 4.718a.646.646 0 00-.571-.714z"
  }));
}

IconHash.propTypes = IconPropTypes.IconPropTypes;

exports.default = IconHash;
//# sourceMappingURL=IconHash.js.map
