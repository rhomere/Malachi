'use strict';

MALACHIAPP.controller('CreditAuditController', ['$rootScope', '$scope', '$http', '$timeout', '$location', '$modal', 'authService', 'policyService', 'notificationsHub', 'ngAuthSettings', 'localStorageService', function ($rootScope, $scope, $http, $timeout, $location, $modal, authService, policyService, notificationsHub, ngAuthSettings, localStorageService) {
  $scope.$on('$viewContentLoaded', function () {
    // initialize core components
    Metronic.initAjax();
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;
  });

  $scope.DateType = {
    THIS_WEEK: 0,
    THIS_MONTH: 1,
    THIS_QUARTER: 2,
    THIS_YEAR: 3
  }

  if (!authService.authentication.isAuth) {
    $location.path('/login');
  }

  $scope.setDates = function (dateType) {
    var fromDate = null;
    var toDate = null;

    var todaysDate = new Date();
    var fullYear = todaysDate.getFullYear();
    var month = todaysDate.getMonth();
    var day = todaysDate.getDate();
    var dayOfWeek = todaysDate.getDay();
    var quarter = Math.floor((month + 1) / 3);

    switch (dateType) {
      case $scope.DateType.THIS_WEEK:
        fromDate = new Date(fullYear, month, day - dayOfWeek);
        toDate = new Date(fullYear, month, day + (6 - dayOfWeek));
        break;
      case $scope.DateType.THIS_MONTH:
        fromDate = new Date(fullYear, month, 1);
        toDate = new Date(new Date(fullYear, month + 1, 1) - 1);
        break;
      case $scope.DateType.THIS_QUARTER:
        fromDate = new Date(fullYear, quarter * 3, 1);
        toDate = new Date(new Date(fullYear, (quarter + 1) * 3, 1) - 1);
        break;
      case $scope.DateType.THIS_YEAR:
        fromDate = new Date(fullYear, 0, 1);
        toDate = new Date(new Date(fullYear, 12, 1) - 1);
        break;
      default:
        break;
    }

    $scope.EffectiveFrom = formatDate(fromDate);
    $scope.EffectiveTo = formatDate(toDate);
  }

  function formatDate(date) {
    if (date == null) return null;

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var monthAsString = (month < 10 ? '0' : '') + month.toString();
    var dayAsString = (day < 10 ? '0' : '') + day.toString();

    return monthAsString + "/" + dayAsString + "/" + year;
  }

  $scope.areDatesPicked = function () {
    return $scope.EffectiveFrom != null && $scope.EffectiveTo != null;
  }

  $scope.requestReport = function () {
    var params = {
      EffectiveFrom: $scope.EffectiveFrom,
      EffectiveTo: $scope.EffectiveTo
    };

    Metronic.blockUI({ animate: true, overlayColor: "none" });
    $http.post(window.reportsAPI + "api/export/RequestCreditAudit", params).then(result => {
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
    Metronic.blockUI({ animate: true, overlayColor: 'none' });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.reportsAPI + 'api/export/CreditAudit', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      Metronic.unblockUI();

      if (this.status === 200) {
        var filename = 'CreditAudit.xlsx';
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }
        var type = xhr.getResponseHeader('Content-Type');

        var blob = new Blob([this.response], { type: type });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. 
          // These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement('a');

            // safari doesn't support this yet
            if (typeof (a.download) === 'undefined') {
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
    xhr.send(JSON.stringify({
      EffectiveFrom: $scope.EffectiveFrom,
      EffectiveTo: $scope.EffectiveTo
    }));
  }

  // Call this after the whole page is loaded.
  $rootScope.$broadcast('$pageloaded');
}]);