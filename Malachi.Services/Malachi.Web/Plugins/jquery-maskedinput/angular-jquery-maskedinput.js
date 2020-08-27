'use strict';
angular.module('angular-jquery-maskedinput', []).directive('mask', function () {
	return {
		restrict: 'A',
		link: function (scope, elem, attr, ctrl) {
			if (attr.mask === '#') {
				elem.autoNumeric('init', { mDec: 0 });
			} else if (attr.mask === 'money') {
				elem.autoNumeric('init', { mDec: 2 });
			} else if (attr.mask) {
				elem.mask(attr.mask, { placeholder: " " });
			}
		}
	};
});