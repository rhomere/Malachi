'use strict';


MALACHIAPP.controller('PremiumBordereauxController', ['$rootScope', '$scope', '$http', '$timeout', '$location', '$modal', 'authService', 'policyService', 'notificationsHub', 'ngAuthSettings', 'localStorageService', function ($rootScope, $scope, $http, $timeout, $location, $modal, authService, policyService, notificationsHub, ngAuthSettings, localStorageService) {
  $scope.$on('$viewContentLoaded', function () {
    // initialize core components
    Metronic.initAjax();
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;
  });

  if (authService.authentication.isAuth == false) {
    $location.path('/login');
  }

  // Variable to hold the brokers to be selected
  $scope.PremiumBordereaux = {};
  $scope.brokers = [];
  $scope.markets = [];
  $scope.errorList = [];

  $scope.states = [
    { Id: 1, Name: 'Alabama', Code: 'AL ' },
    { Id: 2, Name: 'Alaska', Code: 'AK ' },
    { Id: 3, Name: 'Arizona', Code: 'AZ ' },
    { Id: 4, Name: 'Arkansas', Code: 'AR ' },
    { Id: 5, Name: 'California', Code: 'CA ' },
    { Id: 6, Name: 'Colorado', Code: 'CO ' },
    { Id: 7, Name: 'Connecticut', Code: 'CT ' },
    { Id: 8, Name: 'District of Columbia', Code: 'DC ' },
    { Id: 9, Name: 'Delaware', Code: 'DE ' },
    { Id: 10, Name: 'Florida', Code: 'FL ' },
    { Id: 11, Name: 'Georgia', Code: 'GA ' },
    { Id: 12, Name: 'Hawaii', Code: 'HI ' },
    { Id: 13, Name: 'Idaho', Code: 'ID ' },
    { Id: 14, Name: 'Illinois', Code: 'IL ' },
    { Id: 15, Name: 'Indiana', Code: 'IN ' },
    { Id: 16, Name: 'Iowa', Code: 'IA ' },
    { Id: 17, Name: 'Kansas', Code: 'KS ' },
    { Id: 18, Name: 'Kentucky', Code: 'KY ' },
    { Id: 19, Name: 'Louisiana', Code: 'LA ' },
    { Id: 20, Name: 'Maine', Code: 'ME ' },
    { Id: 21, Name: 'Maryland', Code: 'MD ' },
    { Id: 22, Name: 'Massachusetts', Code: 'MA ' },
    { Id: 23, Name: 'Michigan', Code: 'MI ' },
    { Id: 24, Name: 'Minnesota', Code: 'MN ' },
    { Id: 25, Name: 'Mississippi', Code: 'MS ' },
    { Id: 26, Name: 'Missouri', Code: 'MO ' },
    { Id: 27, Name: 'Montana', Code: 'MT ' },
    { Id: 28, Name: 'Nebraska', Code: 'NE ' },
    { Id: 29, Name: 'Nevada', Code: 'NV ' },
    { Id: 30, Name: 'New Hampshire', Code: 'NH ' },
    { Id: 31, Name: 'New Jersey', Code: 'NJ ' },
    { Id: 32, Name: 'New Mexico', Code: 'NM ' },
    { Id: 33, Name: 'New York', Code: 'NY ' },
    { Id: 34, Name: 'North Carolina', Code: 'NC ' },
    { Id: 35, Name: 'North Dakota', Code: 'ND ' },
    { Id: 36, Name: 'Ohio', Code: 'OH ' },
    { Id: 37, Name: 'Oklahoma', Code: 'OK ' },
    { Id: 38, Name: 'Oregon', Code: 'OR ' },
    { Id: 39, Name: 'Pennsylvania', Code: 'PA ' },
    { Id: 40, Name: 'Rhode Island', Code: 'RI ' },
    { Id: 41, Name: 'South Carolina', Code: 'SC ' },
    { Id: 42, Name: 'South Dakota', Code: 'SD ' },
    { Id: 43, Name: 'Tennessee', Code: 'TN ' },
    { Id: 44, Name: 'Texas', Code: 'TX ' },
    { Id: 45, Name: 'Utah', Code: 'UT ' },
    { Id: 46, Name: 'Vermont', Code: 'VT ' },
    { Id: 47, Name: 'Virginia', Code: 'VA ' },
    { Id: 48, Name: 'Washington', Code: 'WA ' },
    { Id: 49, Name: 'West Virginia', Code: 'WV ' },
    { Id: 50, Name: 'Wisconsin', Code: 'WI ' },
    { Id: 51, Name: 'Wyoming', Code: 'WY ' },
    { Id: 52, Name: 'Puerto Rico', Code: 'PR ' },
    { Id: 53, Name: 'Alberta', Code: 'AB ' },
    { Id: 54, Name: 'British Columbia', Code: 'BC ' },
    { Id: 55, Name: 'Manitoba', Code: 'MB ' },
    { Id: 56, Name: 'New Brunswick', Code: 'NB ' },
    { Id: 57, Name: 'New Foundland', Code: 'NL ' },
    { Id: 58, Name: 'Northwest Territories', Code: 'NT ' },
    { Id: 59, Name: 'Nova Scotia', Code: 'NS ' },
    { Id: 60, Name: 'Ontario', Code: 'ON ' },
    { Id: 61, Name: 'Prince Edward Island', Code: 'PE ' },
    { Id: 62, Name: 'Quebec', Code: 'QC ' },
    { Id: 63, Name: 'Saskatchewan', Code: 'SK ' },
    { Id: 64, Name: 'Yukon Territories', Code: 'YT ' }
  ];

  $scope.getBrokers = function () {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    $http.post(ngAuthSettings.apiServiceBaseUri + 'api/bassuw/policy/GetLegacyBrokers').then(function (result) {
      Metronic.unblockUI();
      $scope.brokers = result.data;
    }), function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    };
  }

  $scope.getMarkets = function () {
    if ($scope.PremiumBordereaux.Brokers.length == 0) return;
    // Reset the selected contracts
    $scope.PremiumBordereaux.Markets = [];

    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    var params = { Brokers: $scope.PremiumBordereaux.Brokers };
    $http.post(ngAuthSettings.apiServiceBaseUri + 'api/bassuw/policy/GetLegacyMarkets', params).then(function (result) {
      Metronic.unblockUI();
      $scope.markets = result.data;
    }), function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    };
  }

  $scope.selectStates = function (selectAll) {
    if (selectAll == true) {
      $scope.PremiumBordereaux.States = [];

      $scope.states.forEach(function (state) {
        $scope.PremiumBordereaux.States.push(state.Code);
      });

    } else {
      $scope.PremiumBordereaux.States = [];
    }
  }

  $scope.selectMarkets = function (selectAll) {
    if (selectAll == true) {
      $scope.PremiumBordereaux.Markets = [];

      $scope.markets.forEach(function (market) {
        $scope.PremiumBordereaux.Markets.push(market.Contract);
      });

    } else {
      $scope.PremiumBordereaux.Markets = [];
    }
  }

  $scope.getBrokers();

  $scope.validatePremiumBordereaux = function () {

    var premiumbrdx = $scope.PremiumBordereaux;

    if (premiumbrdx.States == undefined || premiumbrdx.States.length == 0) {
      $scope.errorList.push('Please select at least one state in order to run the report');
    }

    if (premiumbrdx.Markets == undefined || premiumbrdx.Markets.length == 0) {
      $scope.errorList.push('Please select at least one market in order to run the report');
    }
  }

  $scope.requestReport = function () {
    $scope.errorList = [];
    $scope.validatePremiumBordereaux();
    if ($scope.errorList.length > 0) return;

    var params = { BordereauxRequest: $scope.PremiumBordereaux };

    Metronic.blockUI({ animate: true, overlayColor: "none" });
    $http.post(window.reportsAPI + "api/export/RequestPremiumBordereaux", params).then(result => {
      Metronic.unblockUI();
      if (result.data.Success) {
        notificationsHub.showSuccess("Request Successful", "Your request has been acknowledged and your report is being prepared. "
          + "You will receive an email with the report attached and summary details in a few minutes.");
      }
      else {
        notificationsHub.showError("Request Failed", "A problem has occurred with sending your request. Please contact support.");
      }
    }), error => {
      Metronic.unblockUI();
      $scope.errorList = ["An unexpected error has occurred. Please refresh the page."];
    };
  }

  $scope.downloadReport = function () {
    $scope.errorList = [];
    $scope.validatePremiumBordereaux();
    if ($scope.errorList.length > 0) return;


    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.reportsAPI + 'api/export/LegacyPremiumBordereaux', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      Metronic.unblockUI();
      if (this.status === 200) {
        var filename = "LegacyPremiumBordereaux.xlsx";
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        var type = xhr.getResponseHeader('Content-Type');

        var blob = new Blob([this.response], { type: type });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === 'undefined') {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          } else {
            window.location = downloadUrl;
          }

          setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        }
      }
    };

    xhr.setRequestHeader("Content-Type", "application/json");
    var authData = localStorageService.get('authorizationData');
    xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
    xhr.send(JSON.stringify({ BordereauxRequest: $scope.PremiumBordereaux }));
  }

  // Call this after the whole page is loaded.
  $rootScope.$broadcast('$pageloaded');
}]);