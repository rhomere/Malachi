'use strict';

MALACHIAPP.factory('aimService', ['$http', 'ngAuthSettings', function($http, ngAuthSettings) {
  const serviceUri = window.buwiis;

    let serviceFactory = {};

    serviceFactory.isBound = function(quoteId) {
        return $http.get(serviceUri + 'api/Quote/IsBound/' + quoteId, { cache: false }).then(results => results);
    }

    return serviceFactory;
}]);