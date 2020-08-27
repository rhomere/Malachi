/// <reference path="leaflet/layer.js" />
/***
Metronic AngularJS App Main Script
***/

// Get File Version
var version = parseQuery("appjs").v;

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}();

window.QuoteNumber = QueryString.number;

/* Metronic App */
var MALACHIAPP = angular.module("MALACHIAPP", [
  "ui.router",
  "ui.bootstrap",
  'ui.sortable',
  "oc.lazyLoad",
  "ngSanitize",
  'LocalStorageModule',
  'angular-loading-bar',
  "ui.select",
  'ngAutocomplete',
  "checklist-model",
  'angular-jquery-maskedinput',
  'toaster',
  'ngFileUpload',
  'infinite-scroll',
  'ngCacheBuster'
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MALACHIAPP.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
  $ocLazyLoadProvider.config({
    // global configs go here
  });
}]);

// Configure Cache Buster
MALACHIAPP.config(function (httpRequestInterceptorCacheBusterProvider) {
  httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*typeahead.*/, /.*admin.*/, /.*company.*/, /.*contracts.*/, /.*settings.*/, /.*forms.*/, /.*company.*/, /.*bootstrap.*/, /.*tooltip.*/, /.*tabs.*/, /.*accordion.*/, /.*modal.*/, /.*pagination.*/, /.*timepicker.*/, /.*progressbas*./]);
});


MALACHIAPP.config(function ($provide) {
  $provide.decorator("$exceptionHandler", function ($delegate, $injector) {
    return function (exception, cause) {

      function download(data, filename, type) {
        var a = document.createElement("a"),
          file = new Blob([data], { type: type });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
          window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
          var url = URL.createObjectURL(file);
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 0);
        }
      }

      //download(exception, 'errors.txt', 'text/plain');

      $delegate(exception, cause);
    };
  });
});
// include validation languages
// if you want full localization add it in the suffix
// For example on Canadian French/English, we could replace the code by `suffix: '-CA.json'`
//MALACHIAPP.config(function ($translateProvider) {
//    $translateProvider.useStaticFilesLoader({
//        prefix: '/Plugins/locales/',
//        suffix: '.json'
//    });

//    // define translation maps you want to use on startup
//    $translateProvider.preferredLanguage('en');
//});

/* Setup global settings */
MALACHIAPP.factory('settings', ['$rootScope', 'organizationService', function ($rootScope, organizationService) {
  // supported languages
  var settings = {
    layout: {
      pageSidebarClosed: false, // sidebar menu state
      pageBodySolid: false, // solid body color state
      pageAutoScrollOnLoad: 10 // auto scroll to top on page load
    },
    layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
    layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
  };

  $rootScope.settings = settings;
  Metronic.$rootScope = $rootScope;

  return settings;
}]);

/* Setup App Main Controller */
MALACHIAPP.controller('AppController', ['$scope', '$rootScope', '$interval', '$http', 'authService', 'organizationService', 'adminService', '$location', 'ngAuthSettings', function ($scope, $rootScope, $interval, $http, authService, organizationService, adminService, $location, ngAuthSettings) {
  $scope.$on('$viewContentLoaded', function () {
    Metronic.initComponents(); // init core components
  });

  $scope.refreshAlertShown = false;
  $interval(function () {
    $http.get(ngAuthSettings.apiServiceBaseUri + 'api/versionchecker/GetClientVersion', { cache: false, timeout: 3000 }).then(function (result) {
      if (result.data != window.CLIENTVERSION) {
        setTimeout(function () { location.reload(true); }, 15000);

        if (!$scope.refreshAlertShown) {
          $scope.refreshAlertShown = true;
          alert('Your client is out of date. The website will refresh in 15 seconds to the correct version. Please save your work.');
        }
      }
    });
  }, 300000, 0, false);

  $scope.authentication = authService.authentication;
  $scope.rootScope = $rootScope;
  $scope.Organization = $rootScope.Organization = null;
  organizationService.getOrganization().then(function (result) {
    if (result.data.Result.Success) {
      $scope.Organization = $rootScope.Organization = result.data.Organization;
      $stateProviderRef
        // Dashboard
        .state('dashboard', {
          url: "/dashboard",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/dashboard.html?v=" + version,
          data: { pageTitle: 'Dashboard' },
          controller: "DashboardController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/dashboard.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/services/announcementService.js?v=' + version,
                    '/scripts/services/company/gps/gpsDashboardService.js?v=' + version,
                    '/scripts/services/settingsService.js?v=' + version,
                    '/scripts/services/toolsService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/DashboardController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Manual
        .state('Manual', {
          url: "/Manual",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/Manual.html?v=" + version,
          data: { pageTitle: 'Manual' },
          controller: "ManualController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/ManualController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Reports
        .state('Reports', {
          url: "/Reports",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/Reports.html?v=" + version,
          data: { pageTitle: 'Reports' },
          controller: "ReportsController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/ReportsController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Guidelines / FAQ
        .state('Guidelines', {
          url: "/Guidelines",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/Guidelines.html?v=" + version,
          data: { pageTitle: 'Guidelines' },
          controller: "GuidelinesController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/plugins/jstree3.3.5/themes/proton/style.css',
                    '/plugins/jstree3.3.5/jstree.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/guidelinesService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/GuidelinesController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Reports
        .state('PremiumBordereaux', {
          url: "/PremiumBordereaux",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/PremiumBordereaux.html?v=" + version,
          data: { pageTitle: 'PremiumBordereaux' },
          controller: "PremiumBordereauxController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/PremiumBordereauxController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Reports
        .state('LiabilityBordereaux', {
          url: "/LiabilityBordereaux",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/LiabilityBordereaux.html?v=" + version,
          data: { pageTitle: 'LiabilityBordereaux' },
          controller: "LiabilityBordereauxController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/LiabilityBordereauxController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Reports
        .state('PropertyBordereaux', {
          url: "/PropertyBordereaux",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/PropertyBordereaux.html?v=" + version,
          data: { pageTitle: 'PropertyBordereaux' },
          controller: "PropertyBordereauxController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/PropertyBordereauxController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        .state('AgentActivity', {
          url: "/AgentActivity",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/AgentActivity.html?v=" + version,
          data: { pageTitle: 'AgentActivity' },
          controller: "AgentActivityController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/AgentActivityController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Reports
        .state('PersonalLinesBordereaux', {
          url: "/PersonalLinesBordereaux",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/PersonalLinesBordereaux.html?v=" + version,
          data: { pageTitle: 'PropertyBordereaux' },
          controller: "PersonalLinesBordereauxController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/PersonalLinesBordereauxController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Reports
        .state('RiskBordereaux', {
          url: "/RiskBordereaux",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/RiskBordereaux.html?v=" + version,
          data: { pageTitle: 'RiskBordereaux' },
          controller: "RiskBordereauxController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/services/company/' + $rootScope.Organization['UniqueUrl'] + '/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/RiskBordereauxController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // EDM Risk Report
        .state('EdmRiskReport', {
          url: "/EdmRiskReport",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/EdmRiskReport.html?v=" + version,
          data: { pageTitle: 'EdmRiskReport' },
          controller: "EdmRiskReportController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/services/company/' + $rootScope.Organization['UniqueUrl'] + '/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/EdmRiskReportController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Credit Audit Report
        .state('CreditAudit', {
          url: "/CreditAudit",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/CreditAudit.html?v=" + version,
          data: { pageTitle: 'CreditAudit' },
          controller: "CreditAuditController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/CreditAuditController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Production Reports
        .state('ProductionReports', {
          url: "/ProductionReports",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/ProductionReports.html?v=" + version,
          data: { pageTitle: 'ProductionReports' },
          controller: "ProductionReportsController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Manual.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/ProductionReportsController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // Contact
        .state('Contact', {
          url: "/Contact",
          templateUrl: "/views/company/" + $rootScope.Organization['UniqueUrl'] + "/Contact.html?v=" + version,
          data: { pageTitle: 'Contact' },
          controller: "ContactController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/morris/morris.css',
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/Contact.css',
                    '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                    '/plugins/morris/morris.min.js?v=' + version,
                    '/plugins/morris/raphael-min.js?v=' + version,
                    '/plugins/jquery.sparkline.min.js?v=' + version,
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/example.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/controllers/company/' + $rootScope.Organization['UniqueUrl'] + '/ContactController.js?v=' + version
                  ]
                });
              }
            ]
          }
        })
        // PolicyDashboard
        .state('policyDashboard', {
          url: "/policyDashboard",
          templateUrl: '/views/policy/' + $rootScope.Organization['UniqueUrl'] + '/index.html?v=' + version,
          data: { pageTitle: 'Quotes' },
          controller: "PolicyController",
          resolve: {
            deps: [
              '$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                  name: 'MALACHIAPP',
                  insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                  files: [
                    '/plugins/slick/slick-theme.css',
                    '/plugins/slick/slick.css',
                    '/Content/controllers/policy/index.css',
                    '/plugins/slick/slick.min.js?v=' + version,
                    '/scripts/services/policyService.js?v=' + version,
                    '/scripts/services/claimsService.js?v=' + version,
                    '/scripts/services/company/' + $rootScope.Organization['UniqueUrl'] + '/policyService.js?v=' + version,
                    '/scripts/services/agencyService.js?v=' + version,
                    '/scripts/Controllers/Policy/' + $rootScope.Organization['UniqueUrl'] + '/PolicyController.js?v=' + version
                  ]
                });
              }
            ]
          }
        });

    }
  }, function (error) {
    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
  });


  adminService.getZones().then(function (result) {
    if (result.data.Result.Success) {
      $rootScope.Zones = result.data.Zones;
      $rootScope.AllZones = [];
      var zoneTree = [];

      function getAllZones(zones) {
        for (var i = 0; i < zones.length; i++) {
          $rootScope.AllZones.push(zones[i]);
          if (zones[i].Children != null && zones[i].Children.length > 0) {
            getAllZones(zones[i].Children);
          }
        }
      }

      // Setup Zone Tree
      function getZoneTree(zones, list) {
        for (var i = 0; i < zones.length; i++) {
          var treeItem = {
            id: zones[i].Id,
            text: zones[i].Name,
            icon: "fa fa-folder",
            children: []
          }
          list.push(treeItem);
          if (zones[i].Children != null && zones[i].Children.length > 0) {
            getZoneTree(zones[i].Children, treeItem.children);
          }
        }
      }

      getAllZones($rootScope.Zones);
      getZoneTree($rootScope.Zones, zoneTree);
      $rootScope.ZoneTree = $.extend(true, [], zoneTree);
      $rootScope.ConditionZoneTree = $.extend(true, [], zoneTree);
    }
  }, function (error) {
  });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MALACHIAPP.controller('HeaderController', ['$scope', '$rootScope', '$location', '$interval', 'notificationsHub', 'authService', function ($scope, $rootScope, $location, $interval, notificationsHub, authService) {
  $scope.$on('$includeContentLoaded', function () {
    Layout.initHeader(); // init header
  });
  $scope.User = {};
  $scope.logOut = function () {
    authService.logOut();
    $location.path('/login');
    if ($rootScope.ChatLogout != null) $rootScope.ChatLogout();
  };

  $scope.GoToHomeScreen = function () {
    if ($rootScope.GoToHomeScreen != null) {
      $rootScope.GoToHomeScreen();
    }
  }

  $scope.User.FirstName = authService.authentication.firstName;
  $rootScope.UnreadMessages = { Count: 0 };
  $scope.UnreadMessages = $rootScope.UnreadMessages;
  $scope.ShowChat = window.serviceBase.includes('malachibol') || window.serviceBase.includes('localhost');

  if (authService.authentication.firstName !== null)
    $scope.User.Initials = authService.authentication.firstName.charAt(0) + authService.authentication.lastName.charAt(0);

  $scope.notifications = notificationsHub.getNotifications();

  // Change Password //
  $scope.changePassword = function () {
    $location.path("/changepassword");
  }

  $scope.isBassOnline = function () {
    var organization = $rootScope.Organization;
    if (organization == null) return false;
    return organization['Name'] === 'Bass Online';
  }

  $scope.clearHistory = function () {
    $rootScope.$broadcast("clear-history");
  };

  $interval(function () {
    $scope.notifications = notificationsHub.getNotifications();
  }, 1000, 0, false);

  $scope.rootScope = $rootScope;

  $scope.getApps = function () {
    var value = localStorage.getItem("ls.authorizationData");
    var appList = JSON.parse(value);
    return appList.claims;
  }
  $scope.apps = $scope.getApps();
}]);

/* Setup Layout Part - Sidebar */
MALACHIAPP.controller('SidebarController', ['$rootScope', '$scope', '$interval', '$http', 'ngAuthSettings', 'authService', function ($rootScope, $scope, $interval, $http, ngAuthSettings, authService) {
  $scope.$on('$includeContentLoaded', function () {
    Layout.initSidebar(); // init sidebar
  });

  $scope.isInRole = function (role) {
    return $.inArray(role, authService.authentication.roles) > -1;
  }

  $scope.settings = $rootScope.settings;
  $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
  $scope.submitCount = -1;
  $scope.agentRequestCount = 0;

  $scope.isUnderwriter = false;
  $scope.isUnderwriterCheck = function () {
    $http.get(ngAuthSettings.commissionApi + 'api/commissionuw/canseecommission').then(function (result) {
      $scope.isUnderwriter = result.data ? result.data.data : false;
    },
      function () {
        // Default value or if http call has failed
        $scope.isUnderwriter = false;
        console.log("Error checking if user can see commission page.");
      });
  };

  $scope.isUnderwriterCheck();

  // get the amount of unapproved submits
  var getSubmitCount = function () {
    // if the user is not submit reviewer exit
    if (!$scope.submitReviewer) return;

    $http.get(ngAuthSettings.apiServiceBaseUri + 'api/policy/GetSubmitCount', { cache: false, timeout: 3000 }).then(function (result) {
      if (result.status == 200) {
        $scope.submitCount = result.data;
      }
      else {
        $scope.submitCount = -1;
        console.log("Error getting submit count!");
      }
    });
  }

  // Call function.
  getSubmitCount();

  // Run the function every 15 seconds.
  $interval(getSubmitCount, 600000, 0, false);

  // Set both function in root scope.
  $rootScope._getSubmitCount = getSubmitCount;
}]);

/* Setup Layout Part - Quick Sidebar */
MALACHIAPP.controller('QuickSidebarController', ['$rootScope', '$scope', 'authService', function ($rootScope, $scope, authService) {
  if (!window.serviceBase.includes("malachibol") && !window.serviceBase.includes("localhost")) return;
  if (authService.authentication.isAuth == false) {
    $location.path('/login');
    return;
  }
  $scope.$on('$includeContentLoaded', function () {
    setTimeout(function () {
      QuickSidebar.init(); // init quick sidebar        
    }, 1000);
  });
}]);

/* Setup Layout Part - Theme Panel */
MALACHIAPP.controller('ThemePanelController', ['$scope', function ($scope) {
  $scope.$on('$includeContentLoaded', function () {
    Demo.init(); // init theme panel
  });
}]);

/* Setup Layout Part - Footer */
MALACHIAPP.controller('FooterController', ['$scope', function ($scope) {
  $scope.$on('$includeContentLoaded', function () {
    Layout.initFooter(); // init footer
  });
}]);

var $stateProviderRef;
var $urlRouterProviderRef;
/* Setup Rounting For All Pages */
MALACHIAPP.config(['$urlMatcherFactoryProvider', '$stateProvider', '$urlRouterProvider', function ($urlMatcherFactory, $stateProvider, $urlRouterProvider) {
  $stateProviderRef = $stateProvider;
  $urlRouterProviderRef = $urlRouterProvider;
  // Redirect any unmatched url
  $urlMatcherFactory.caseInsensitive(true);

  $urlRouterProvider.otherwise("/login");

  $stateProvider

    // Login
    .state('login', {
      url: "/login",
      templateUrl: "/views/account/login.html?v=" + version,
      data: { pageTitle: 'Login' },
      controller: "LoginController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/content/plugins/login3.css',
                '/plugins/select2/select2.min.js?v=' + version,
                '/plugins/jquery-validation/js/jquery.validate.js?v=' + version,
                '/scripts/controllers/LoginController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // Register
    .state('register', {
      url: "/register",
      templateUrl: "/views/account/register.html?v=" + version,
      data: { pageTitle: 'Register' },
      controller: "RegisterController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/content/plugins/login3.css',
                '/plugins/select2/select2.min.js?v=' + version,
                '/plugins/jquery-validation/js/jquery.validate.js?v=' + version,
                '/scripts/controllers/RegisterController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // forgotpassword
    .state('forgotpassword', {
      url: "/forgotpassword",
      templateUrl: "/views/account/forgotpassword.html?v=" + version,
      data: { pageTitle: 'Forgot Password' },
      controller: "ForgotPasswordController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/content/plugins/login3.css',
                '/plugins/select2/select2.min.js?v=' + version,
                '/plugins/jquery-validation/js/jquery.validate.js?v=' + version,
                '/scripts/controllers/ForgotPasswordController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // resetpassword
    .state('resetpassword', {
      url: "/resetpassword",
      templateUrl: "/views/account/resetpassword.html?v=" + version,
      data: { pageTitle: 'Reset Password' },
      controller: "ResetPasswordController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/content/plugins/login3.css',
                '/plugins/select2/select2.min.js?v=' + version,
                '/plugins/jquery-validation/js/jquery.validate.js?v=' + version,
                '/scripts/controllers/ResetPasswordController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // changepassword
    .state('changepassword', {
      url: "/changepassword",
      templateUrl: "/views/account/changepassword.html?v=" + version,
      data: { pageTitle: 'Change Password' },
      controller: "ChangePasswordController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/content/plugins/login3.css',
                '/plugins/select2/select2.min.js?v=' + version,
                '/plugins/jquery-validation/js/jquery.validate.js?v=' + version,
                '/scripts/controllers/ChangePasswordController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // 
    .state('contracts', {
      url: "/contracts",
      templateUrl: "/views/contracts/index.html?v=" + version,
      data: { pageTitle: 'Contracts' },
      controller: "ContractsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/plugins/slick/slick.min.js?v=' + version,
                '/plugins/datatables/media/css/jquery.dataTables.min.css',
                '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                '/scripts/services/contractService.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/accountService.js?v=' + version,
                '/scripts/services/settingsService.js?v=' + version,
                '/scripts/services/insurerService.js?v=' + version,
                '/scripts/services/riskCompanyService.js?v=' + version,
                '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                '/scripts/Controllers/Contracts/ContractController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // 
    .state('coverages', {
      url: "/coverages",
      templateUrl: "/views/contracts/coverages.html?v=" + version,
      params: { Contract: null }, // Parameters must be defined
      data: { pageTitle: 'Coverages' },
      controller: "CoveragesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/scripts/services/contractService.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/accountService.js?v=' + version,
                '/scripts/services/settingsService.js?v=' + version,
                '/scripts/Controllers/Contracts/CoveragesController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // 
    .state('minimumpremiums', {
      url: "/minimumpremiums",
      templateUrl: "/views/contracts/minimumpremiums.html?v=" + version,
      params: { Contract: null, Coverage: null }, // Parameters must be defined
      data: { pageTitle: 'Minimum Premiums' },
      controller: "MinimumPremiumsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/Contracts/MinimumPremiumsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // zones 
    .state('zones', {
      url: "/zones",
      templateUrl: "/views/settings/zones.html?v=" + version,
      params: { ZoneGroup: null }, // Parameters must be defined
      data: { pageTitle: 'Zones' },
      controller: "ZonesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',

              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/plugins/slick/slick.min.js?v=' + version,
                '/plugins/datatables/media/css/jquery.dataTables.min.css',
                '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                '/Plugins/leaflet/leaflet.css',
                '/Plugins/leaflet/draw/leaflet.draw.css',
                '/Plugins/leaflet/measureControl/leaflet.measurecontrol.css',
                '/Plugins/leaflet/shpfile/leaflet.shpfile.css',
                '/Plugins/leaflet/markercluster/MarkerCluster.Default.css',
                '/Plugins/leaflet/leaflet-extended.css',
                '/Content/Controllers/settings/Zones.css',
                '/Plugins/leaflet/heatmap/HeatLayer.js?v=' + version,
                '/Plugins/leaflet/draw/leaflet.draw.js?v=' + version,
                '/Plugins/leaflet/heatmap/simpleheat.js?v=' + version,
                '/Plugins/leaflet/spin/leaflet-spin.js?v=' + version,
                '/Plugins/shp/shp.js?v=' + version,
                '/Plugins/catiline/catiline.js?v=' + version,
                '/Plugins/leaflet/shpfile/leaflet.shpfile.js?v=' + version,
                '/Plugins/leaflet/markercluster/leaflet.markercluster-src.js?v=' + version,
                'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                '/Scripts/leaflet/map.js?v=' + version,
                '/Scripts/leaflet/layer.js?v=' + version,
                '/Scripts/leaflet/shape.js?v=' + version,
                '/scripts/services/insurerService.js?v=' + version,
                '/scripts/services/contractService.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/accountService.js?v=' + version,
                '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                '/scripts/Controllers/settings/ZonesController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // ratesheet 
    .state('ratesheet', {
      url: "/ratesheet",
      templateUrl: "/views/contracts/ratesheet.html?v=" + version,
      params: { Contract: null }, // Parameters must be defined
      data: { pageTitle: 'Rate Sheet' },
      controller: "RatesheetController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngHandsontable',
                files: [
                  '/plugins/handsontable/handsontable.full.css',
                  '/plugins/handsontable/handsontable.full.js?v=' + version,
                  '/plugins/handsontable/ngHandsontable.js?v=' + version
                ],
                serie: true
              }, {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/Contracts/ratesheet.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/Contracts/RatesheetController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // question 
    .state('eligibilityquestions', {
      url: "/eligibilityquestions",
      templateUrl: "/views/contracts/eligibilityquestions.html?v=" + version,
      params: { Contract: null, AllContracts: null }, // Parameters must be defined
      data: { pageTitle: 'Eligibility Questions' },
      controller: "EligibilityQuestionsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/Contracts/eligibilityquestions.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/Contracts/EligibilityQuestionsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // question 
    .state('ratingquestions', {
      url: "/ratingquestions",
      templateUrl: "/views/contracts/ratingquestions.html?v=" + version,
      params: { Contract: null }, // Parameters must be defined
      data: { pageTitle: 'Rating Questions' },
      controller: "RatingQuestionsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/Contracts/RatingQuestionsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    //  
    .state('classcodes', {
      url: "/classcodes",
      templateUrl: "/views/contracts/classcodes.html?v=" + version,
      params: { Contract: null }, // Parameters must be defined
      data: { pageTitle: 'Class Code' },
      controller: "ClassCodesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/Contracts/classcodes.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/Contracts/ClassCodesController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    //
    .state('contractnotes', {
      url: "/contractnotes",
      templateUrl: "/views/contracts/contractnotes.html?v=" + version,
      params: { Contract: null }, // Parameters must be defined
      data: { pageTitle: 'ContractNotes' },
      controller: "ContractNotesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/Contracts/contractnotes.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/Contracts/ContractNotesController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    .state('aggregate', {
      url: "/aggregate",
      templateUrl: "/views/settings/aggregate.html?v=" + version,
      params: { ZoneGroup: null }, // Parameters must be defined
      data: { pageTitle: 'Aggregate' },
      controller: "AggregateController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/Plugins/leaflet/leaflet.css',
                  '/Plugins/leaflet/draw/leaflet.draw.css',
                  '/Plugins/leaflet/measureControl/leaflet.measurecontrol.css',
                  '/Plugins/leaflet/shpfile/leaflet.shpfile.css',
                  '/Plugins/leaflet/markercluster/MarkerCluster.Default.css',
                  '/Plugins/leaflet/leaflet-extended.css',
                  '/Content/Controllers/settings/Zones.css',
                  '/Plugins/leaflet/heatmap/HeatLayer.js?v=' + version,
                  '/Plugins/leaflet/draw/leaflet.draw.js?v=' + version,
                  '/Plugins/leaflet/heatmap/simpleheat.js?v=' + version,
                  '/Plugins/leaflet/spin/leaflet-spin.js?v=' + version,
                  '/Plugins/shp/shp.js?v=' + version,
                  '/Plugins/catiline/catiline.js?v=' + version,
                  '/Plugins/leaflet/shpfile/leaflet.shpfile.js?v=' + version,
                  '/Plugins/leaflet/markercluster/leaflet.markercluster-src.js?v=' + version,
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/Scripts/leaflet/map.js?v=' + version,
                  '/Scripts/leaflet/layer.js?v=' + version,
                  '/Scripts/leaflet/shape.js?v=' + version,
                  '/scripts/services/insurerService.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/Content/Controllers/Contracts/contractaggregate.css',
                  '/scripts/Controllers/Settings/AggregateController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })


    .state('contractcommissions', {
      url: "/contractcommissions",
      templateUrl: "/views/contracts/contractcommissions.html?v=" + version,
      params: { Contract: null }, // Parameters must be defined
      data: { pageTitle: 'ContractCommissions' },
      controller: "ContractCommissionsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/Contracts/contractcommissions.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/Contracts/ContractCommissionsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    .state('contracttotalInsuredValues', {
      url: "/contracttotalInsuredValues",
      templateUrl: "/views/contracts/contracttotalInsuredValues.html?v=" + version,
      params: { Contract: null, Coverage: null }, // Parameters must be defined
      data: { pageTitle: 'ContractTotalInsuredValues' },
      controller: "ContractTotalInsuredValuesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/Contracts/contractTotalinsuredvalue.css',
                  '/scripts/Controllers/Contracts/ContractTotalInsuredValuesController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // submits 
    .state('eligibility', {
      url: "/eligibility",
      templateUrl: "/views/contracts/eligibility.html?v=" + version,
      params: { Contract: null, AllContracts: null }, // Parameters must be defined
      data: { pageTitle: 'Eligibility' },
      controller: "EligibilityController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/Contracts/eligibility.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/Contracts/EligibilityController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // contract forms 
    .state('riskCompanyForms', {
      url: "/riskCompanyForms",
      templateUrl: "/views/Settings/riskCompanyForms.html?v=" + version,
      params: { RiskCompany: null }, // Parameters must be defined
      data: { pageTitle: 'Contract Forms' },
      controller: "RiskCompanyFormsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'ngJsTree',
                files: [
                  '/plugins/jstree/dist/jstree.min.js?v=' + version,
                  '/plugins/jstree/dist/ngJsTree.min.js?v=' + version,
                ],
                serie: true
              }, {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/formsService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/riskCompanyService.js?v=' + version,
                  '/Content/Controllers/Settings/riskCompanyForms.css',
                  '/scripts/Controllers/Settings/RiskCompanyFormsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // fees
    .state('fees', {
      url: "/fees",
      params: { ManagingGeneralAgent: null }, // Parameters must be defined
      templateUrl: "/views/settings/fees.html?v=" + version,
      data: { pageTitle: 'Fees' },
      controller: "FeesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/riskCompanyService.js?v=' + version,
                  '/Content/Controllers/settings/fees.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/FeesController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    .state('statetaxes', {
      url: "/statetaxes",
      params: { ManagingGeneralAgent: null }, // Parameters must be defined
      templateUrl: "/views/settings/statetaxes.html?v=" + version,
      data: { pageTitle: 'Taxes' },
      controller: "StateTaxesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/Content/Controllers/settings/statetaxes.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/StateTaxesController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })
    // Agents
    .state('agents', {
      url: "/agents",
      params: { Agency: null }, // Parameters must be defined
      templateUrl: "/views/settings/agents.html?v=" + version,
      data: { pageTitle: 'agents' },
      controller: "AgentsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/settings/agents.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/AgentsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // offices
    .state('offices', {
      url: "/offices",
      params: { ManagingGeneralAgent: null }, // Parameters must be defined
      templateUrl: "/views/settings/offices.html?v=" + version,
      data: { pageTitle: 'offices' },
      controller: "OfficesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/settings/offices.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/OfficesController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // mgaStateSignatures
    .state('mgaStateSignatures', {
      url: "/mgaStateSignatures",
      params: { ManagingGeneralAgent: null }, // Parameters must be defined
      templateUrl: "/views/settings/mgaStateSignatures.html?v=" + version,
      data: { pageTitle: 'MGA State Signatures' },
      controller: "MgaStateSignaturesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/MgaStateSignaturesController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // forms
    .state('forms', {
      url: "/forms",
      templateUrl: "/views/forms/forms.html?v=" + version,
      data: { pageTitle: 'Forms' },
      controller: "FormsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/formsService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/Content/Controllers/forms/forms.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/forms/FormsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // submits
    .state('submits', {
      url: "/submits",
      templateUrl: "/views/admin/submits.html?v=" + version,
      data: { pageTitle: 'Submits' },
      controller: "SubmitsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/admin/SubmitsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // Agent Requests
    .state('agentrequests', {
      url: "/agentrequests",
      templateUrl: "/views/admin/agentrequests.html?v=" + version,
      data: { pageTitle: 'Agent Requests' },
      controller: "AgentRequestsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before',
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  '/plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  '/plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/policyService.js?v=' + version,
                  '/scripts/services/company/' + $rootScope.Organization['UniqueUrl'] + '/policyService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/admin/AgentRequestsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // riskcompanies
    .state('riskcompanies', {
      url: "/riskcompanies",
      templateUrl: "/views/settings/riskcompanies.html?v=" + version,
      data: { pageTitle: 'Risk Companies' },
      controller: "RiskCompaniesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/riskCompanyService.js?v=' + version,
                  '/Content/Controllers/settings/riskcompanies.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/RiskCompaniesController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // insurers
    .state('insurers', {
      url: "/insurers",
      templateUrl: "/views/settings/insurers.html?v=" + version,
      data: { pageTitle: 'Insurers' },
      controller: "InsurersController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/insurerService.js?v=' + version,
                  '/scripts/services/riskCompanyService.js?v=' + version,
                  '/Content/Controllers/settings/insurers.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/InsurersController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // zoneGroups
    .state('zoneGroups', {
      url: "/zoneGroups",
      templateUrl: "/views/settings/zoneGroups.html?v=" + version,
      params: { Insurer: null }, // Parameters must be defined
      data: { pageTitle: 'ZoneGroups' },
      controller: "ZoneGroupsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/insurerService.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/ZoneGroupsController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // policyregisters
    .state('policyregisters', {
      url: "/policyregisters",
      templateUrl: "/views/settings/policyregisters.html?v=" + version,
      params: { RiskCompany: null }, // Parameters must be defined
      data: { pageTitle: 'PolicyRegisters' },
      controller: "PolicyRegistersController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/riskCompanyService.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/PolicyRegistersController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // brokers
    .state('brokers', {
      url: "/brokers",
      templateUrl: "/views/settings/brokers.html?v=" + version,
      data: { pageTitle: 'Brokers' },
      controller: "BrokersController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/insurerService.js?v=' + version,
                  '/Content/Controllers/settings/brokers.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/BrokersController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // mga
    .state('mga', {
      url: "/mga",
      templateUrl: "/views/settings/mga.html?v=" + version,
      data: { pageTitle: 'Managing General Agency' },
      controller: "MGAController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/scripts/services/insurerService.js?v=' + version,
                  '/Content/Controllers/settings/mga.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/MGAController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // users
    .state('users', {
      url: "/users",
      templateUrl: "/views/settings/users.html?v=" + version,
      data: { pageTitle: 'Users' },
      controller: "UsersController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/settings/users.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/UsersController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // retailagencies
    .state('retailagencies', {
      url: "/retailagencies",
      params: { ManagingGeneralAgent: null }, // Parameters must be defined
      templateUrl: "/views/settings/retailagencies.html?v=" + version,
      data: { pageTitle: 'Retail Agencies' },
      controller: "RetailAgenciesController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/scripts/services/contractService.js?v=' + version,
                  '/scripts/services/toolsService.js?v=' + version,
                  '/scripts/services/accountService.js?v=' + version,
                  '/scripts/services/settingsService.js?v=' + version,
                  '/Content/Controllers/settings/retailagencies.css',
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/settings/RetailAgenciesController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // Policy
    .state('policy', {
      url: "/policy",
      params: { appId: null, policyId: null }, // Parameters must be defined
      templateUrl: "/views/policy/apps/index.html?v=" + version,
      data: { pageTitle: 'Policy' },
      controller: "PolicyAppController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/policyService.js?v=' + version,
                '/scripts/Controllers/Policy/apps/PolicyAppController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // Fee Endorsement
    .state('feeendorsement', {
      url: "/feeendorsement",
      params: { policyId: null }, // Parameters must be defined
      templateUrl: "/views/policy/apps/feeendorsement.html?v=" + version,
      data: { pageTitle: 'Fee Endorsement' },
      controller: "FeeEndorsementController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                'content/controllers/policy/shared.css',
                'content/controllers/policy/cancellation.css',
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/policyService.js?v=' + version,
                '/scripts/Controllers/Policy/apps/FeeEndorsementController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // Cancellation
    .state('cancellation', {
      url: "/cancellation",
      params: { policyId: null }, // Parameters must be defined
      templateUrl: "/views/policy/apps/cancellation.html?v=" + version,
      data: { pageTitle: 'Cancellation' },
      controller: "CancellationController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                'content/controllers/policy/shared.css',
                'content/controllers/policy/cancellation.css',
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/policyService.js?v=' + version,
                '/scripts/Controllers/Policy/apps/CancellationController.js?v=' + version
              ]
            });
          }
        ]
      }
    })
    // PayEndorsement
    .state('payEndorsement', {
      url: "/payEndorsement",
      params: { policyId: null }, // Parameters must be defined
      templateUrl: "/views/policy/apps/payEndorsement.html?v=" + version,
      data: { pageTitle: 'Pay Endorsement' },
      controller: "PayEndorsementController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                'content/controllers/policy/shared.css',
                'content/controllers/policy/payEndorsement.css',
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/policyService.js?v=' + version,
                '/scripts/Controllers/Policy/apps/PayEndorsementController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // ExtensionEndorsement
    .state('extensionEndorsement', {
      url: "/extensionEndorsement",
      params: { policyId: null }, // Parameters must be defined
      templateUrl: "/views/policy/apps/extensionEndorsement.html?v=" + version,
      data: { pageTitle: 'Extend Policy' },
      controller: "ExtensionEndorsementController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                'content/controllers/policy/shared.css',
                'content/controllers/policy/extension.css',
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/policyService.js?v=' + version,
                '/scripts/Controllers/Policy/apps/ExtensionEndorsementController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // TriaEndorsement
    .state('triaEndorsement', {
      url: "/triaEndorsement",
      params: { policyId: null }, // Parameters must be defined
      templateUrl: "/views/policy/apps/triaEndorsement.html?v=" + version,
      data: { pageTitle: 'TRIA Endorsement' },
      controller: "TriaEndorsementController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                'content/controllers/policy/shared.css',
                'content/controllers/policy/tria.css',
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/policyService.js?v=' + version,
                '/scripts/Controllers/Policy/apps/TriaEndorsementController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // organization
    .state('organization', {
      url: "/organization",
      templateUrl: "/views/Company/organization.html?v=" + version,
      data: { pageTitle: 'Organization Info' },
      controller: "OrganizationController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/Controllers/Company/OrganizationController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // appmanager
    .state('appmanager', {
      url: "/appmanager",
      templateUrl: "/views/Company/appmanager.html?v=" + version,
      data: { pageTitle: 'App Manager' },
      controller: "AppManagerController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                name: 'MALACHIAPP',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                  '/plugins/slick/slick-theme.css',
                  '/plugins/slick/slick.css',
                  '/plugins/slick/slick.min.js?v=' + version,
                  '/plugins/datatables/media/css/jquery.dataTables.min.css',
                  '/plugins/datatables/examples/resources/bootstrap/3/dataTables.bootstrap.css',
                  '/plugins/jstree/dist/themes/default/style.min.css',
                  'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                  'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                  '/plugins/datatables/media/js/jquery.dataTables.min.js?v=' + version,
                  '/scripts/services/appService.js?v=' + version,
                  '/scripts/Controllers/Company/AppManagerController.js?v=' + version
                ]
              }
            ]);
          }
        ]
      }
    })

    // Claims Dashboard
    .state('claims', {
      url: "/Claims",
      templateUrl: "/views/Claims/claims.html?v=" + version,
      data: { pageTitle: 'Claims' },
      controller: "ClaimsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Claims/claims.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/scripts/services/claimsService.js?v=' + version,
                '/scripts/controllers/claims/ClaimsController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // Adjusters Dashboard
    .state('adjusters', {
      url: "/Adjusters",
      templateUrl: "/views/Claims/Adjusters.html?v=" + version,
      data: { pageTitle: 'Adjusters Dashboard' },
      controller: "AdjustersController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Claims/claims.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/scripts/services/adjustersService.js?v=' + version,
                '/scripts/controllers/claims/AdjustersController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // Public Adjusters Dashboard
    .state('publicadjusters', {
      url: "/PublicAdjusters",
      templateUrl: "/views/Claims/PublicAdjusters.html?v=" + version,
      data: { pageTitle: 'Public Adjusters Dashboard' },
      controller: "PublicAdjustersController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Claims/claims.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/scripts/services/adjustersService.js?v=' + version,
                '/scripts/controllers/claims/PublicAdjustersController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // Policy Datails Page
    .state("policyDetails", {
      url: "/PolicyDetails",
      params: { policy: null }, // Parameters must be defined
      templateUrl: "/views/Claims/PolicyDetails.html?v=" + version,
      data: { pageTitle: "Policy Details" },
      controller: "PolicyDetailsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Claims/claims.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/scripts/services/claimsService.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/controllers/claims/PolicyDetailsController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // Add Claim
    .state("addClaim", {
      url: "/AddClaim",
      params: { claim: null, hasAddress: false }, // Parameters must be defined
      templateUrl: "/views/Claims/AddClaim.html?v=" + version,
      data: { pageTitle: "Add Claim" },
      controller: "AddClaimController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Claims/claims.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,
                '/scripts/services/claimsService.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/adjustersService.js?v=' + version,
                '/scripts/controllers/claims/AddClaimController.js?v=' + version
              ]
            });
          }
        ]
      }
    })
    // Claim Details
    .state("claimDetails", {
      url: "/ClaimDetails",
      params: { claim: null }, // Parameters must be defined
      templateUrl: "/views/Claims/ClaimDetails.html?v=" + version,
      data: { pageTitle: "Add Claim" },
      controller: "ClaimDetailsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Claims/claims.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,
                '/scripts/services/claimsService.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/controllers/claims/ClaimDetailsController.js?v=' + version
              ]
            });
          }
        ]
      }
    })

    // Add Claim
    .state("updateClaim", {
      url: "/UpdateClaim",
      params: { claim: null }, // Parameters must be defined
      templateUrl: "/views/Claims/UpdateClaim.html?v=" + version,
      data: { pageTitle: "Update Claim" },
      controller: "UpdateClaimController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Claims/claims.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,
                '/scripts/services/claimsService.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/services/adjustersService.js?v=' + version,
                '/scripts/controllers/claims/UpdateClaimController.js?v=' + version
              ]
            });
          }
        ]
      }
    })
    // Add Claim
    .state("claimsReports", {
      url: "/ClaimsReports",
      params: { id: null }, // Parameters must be defined
      templateUrl: "/views/Claims/ClaimsReports.html?v=" + version,
      data: { pageTitle: "Claims Reports" },
      controller: "ClaimsReportsController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Claims/claims.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,
                '/scripts/services/claimsService.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/controllers/claims/ClaimsReportsController.js?v=' + version
              ]
            });
          }
        ]
      }
    })
    // Import Claims
    .state("claimsImport", {
      url: "/ClaimsImport",
      params: { id: null }, // Parameters must be defined
      templateUrl: "/views/Claims/ClaimsImport.html?v=" + version,
      data: { pageTitle: "Claims Import" },
      controller: "ClaimsImportController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Claims/claims.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,
                '/scripts/services/claimsService.js?v=' + version,
                '/scripts/services/toolsService.js?v=' + version,
                '/scripts/controllers/claims/ClaimsImportController.js?v=' + version
              ]
            });
          }
        ]
      }
    })
    // Add Claim
    .state("commissionHistory", {
      url: "/CommissionHistory",
      templateUrl: "/views/Commission/CommissionHistory.html?v=" + version,
      data: { pageTitle: "Commission History" },
      controller: "CommissionHistoryController",
      resolve: {
        deps: [
          '$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              name: 'MALACHIAPP',
              insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
              files: [
                '/plugins/morris/morris.css',
                '/plugins/slick/slick-theme.css',
                '/plugins/slick/slick.css',
                '/Content/controllers/Commission/Commission.css',
                '/plugins/flot/jquery.flot.all.min.js?v=' + version,
                '/plugins/morris/morris.min.js?v=' + version,
                '/plugins/morris/raphael-min.js?v=' + version,
                '/plugins/jquery.sparkline.min.js?v=' + version,
                '/plugins/slick/slick.min.js?v=' + version,
                '/scripts/example.js?v=' + version,
                '/scripts/services/commissionService.js?v=' + version,
                '/scripts/controllers/commission/CommissionHistoryController.js?v=' + version
              ]
            });
          }
        ]
      }
    });


}]);

/* Init global settings and run the app */
MALACHIAPP.run(["$rootScope", "settings", "$state", function ($rootScope, settings, $state) {
  $rootScope.$state = $state; // state to be accessed from view
}]);

MALACHIAPP.constant('ngAuthSettings', {
  commissionApi: window.commissionUri,
  apiServiceBaseUri: window.serviceBase,
  clientId: 'ngAuthApp'
});

MALACHIAPP.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptorService');
});

MALACHIAPP.run(['authService', function (authService) {
  authService.fillAuthData();
}]);

function getTodaysDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  return mm + '/' + dd + '/' + yyyy;
}

// ReSharper disable once NativeTypePrototypeExtending
Date.prototype.addDays = function (days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}
