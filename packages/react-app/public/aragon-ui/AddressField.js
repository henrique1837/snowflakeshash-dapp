'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var objectWithoutProperties = require('./objectWithoutProperties-5d2c0728.js');
var _styled = require('styled-components');
var React = require('react');
var index = require('./index-37353731.js');
var TextCopy = require('./TextCopy.js');
var EthIdenticon = require('./EthIdenticon.js');
var constants = require('./constants.js');
require('./_commonjsHelpers-1b94f6bc.js');
require('./extends-5150c1f4.js');
require('./TextInput.js');
require('./defineProperty-fdbd3c46.js');
require('./Theme.js');
require('./slicedToArray-bb07ac16.js');
require('./unsupportedIterableToArray-d5a3ce67.js');
require('./theme-dark.js');
require('./theme-light.js');
require('./environment.js');
require('./miscellaneous.js');
require('./color.js');
require('./getPrototypeOf-e2e819f3.js');
require('./toConsumableArray-0f2dcfe0.js');
require('./text-styles.js');
require('./font.js');
require('./ButtonIcon.js');
require('./Button.js');
require('./index-c33eeeef.js');
require('./Layout.js');
require('./Viewport-d2dce1b4.js');
require('./_baseGetTag-6ec23aaa.js');
require('./breakpoints.js');
require('./css.js');
require('./ButtonBase.js');
require('./FocusVisible.js');
require('./keycodes.js');
require('./ToastHub.js');
require('./web-7e5f0d11.js');
require('./objectWithoutPropertiesLoose-34dfcdd4.js');
require('react-dom');
require('./RootPortal.js');
require('./Root-ffe1134e.js');
require('./components.js');
require('./springs.js');
require('./IconCopy.js');
require('./IconPropTypes-f5b14dc5.js');
require('./web3-3474f303.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _styled__default = /*#__PURE__*/_interopDefaultLegacy(_styled);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var HEIGHT = 5 * constants.GU;
var IDENTICON_SIZE = 6 * constants.GU;

var _StyledEthIdenticon = _styled__default['default'](EthIdenticon['default']).withConfig({
  displayName: "AddressField___StyledEthIdenticon",
  componentId: "m75adw-0"
})(["transform:scale(", ");transform-origin:50% 50%;"], function (p) {
  return p._css;
});

var AddressField = /*#__PURE__*/React__default['default'].forwardRef(function AddressField(_ref, ref) {
  var address = _ref.address,
      autofocus = _ref.autofocus,
      icon = _ref.icon,
      onCopy = _ref.onCopy;
      objectWithoutProperties._objectWithoutProperties(_ref, ["address", "autofocus", "icon", "onCopy"]);

  return /*#__PURE__*/React__default['default'].createElement(TextCopy['default'], {
    ref: ref,
    adornment: icon || /*#__PURE__*/React__default['default'].createElement("div", null, /*#__PURE__*/React__default['default'].createElement(_StyledEthIdenticon, {
      address: address,
      onCopy: onCopy,
      scale: 2,
      _css: (HEIGHT - 2) / IDENTICON_SIZE
    })),
    autofocus: autofocus,
    value: address
  });
});
AddressField.propTypes = {
  address: index.propTypes.string.isRequired,
  autofocus: index.propTypes.bool,
  icon: index.propTypes.node,
  onCopy: index.propTypes.func
};
AddressField.defaultProps = {
  autofocus: true
};

exports.default = AddressField;
//# sourceMappingURL=AddressField.js.map
