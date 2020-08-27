'use strict';
MALACHIAPP.factory('sharedService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var serviceFactory = {};

    // Assign Services

    //------------------------------------------
    // Expect input as m/d/yyyy
    //------------------------------------------
    serviceFactory.validateDate = function (s) {
        var bits = s.split('/');
        var d = new Date(bits[2], bits[0] - 1, bits[1]);
        return d && (d.getMonth() + 1) == bits[0] && d.getDate() == Number(bits[1]);
    };

    return serviceFactory;

}]);