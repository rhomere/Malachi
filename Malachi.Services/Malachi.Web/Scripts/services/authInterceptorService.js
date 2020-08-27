'use strict';
MALACHIAPP.factory('authInterceptorService', ['$q', '$injector', '$location', 'localStorageService', function ($q, $injector, $location, localStorageService) {

    var authInterceptorServiceFactory = {};


    var _request = function (config) {
        if (config.url.indexOf('googleapis') > -1) {
            return config;
        }

        config.headers = config.headers || {};

        var authData = localStorageService.get('authorizationData');
        if (config.url.toLowerCase().indexOf('upload') > -1) {
            if (authData) {
                config.headers.Authorization = 'Bearer ' + authData.token;
                //config.headers['Content-Type'] = 'multipart/form-data';
            }
        } else {
            if (authData) {
                config.headers.Authorization = 'Bearer ' + authData.token;
                config.headers['Content-Type'] = 'application/json';
            }
        }

        return config;
    }

    var _response = function (response) {
        return response;
    }

    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            var authService = $injector.get('authService');
            var authData = localStorageService.get('authorizationData');

            if (authData) {
                if (authData.useRefreshTokens) {
                    $location.path('/refresh');
                    return $q.reject(rejection);
                }
            }

            authService.redirectToLogin = true;
            authService.logOut();
            $location.path('/login');
        }
        Metronic.unblockUI();
        return $q.reject(rejection);
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.response = _response;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);