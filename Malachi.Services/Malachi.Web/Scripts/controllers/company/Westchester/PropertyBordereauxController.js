'use strict';


MALACHIAPP.controller('PropertyBordereauxController', ['$rootScope', '$scope', '$http', '$timeout', '$location', '$modal', 'authService', 'policyService', 'ngAuthSettings', 'localStorageService', function ($rootScope, $scope, $http, $timeout, $location, $modal, authService, policyService, ngAuthSettings, localStorageService) {
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


  $scope.downloadReport = function () {
    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    var xhr = new XMLHttpRequest();
    xhr.open('POST', window.reportsAPI + 'api/export/PropertyBordereaux', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      Metronic.unblockUI();
      if (this.status === 200) {
        var filename = "PropertyBordereaux.xlsx";
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
    xhr.send(JSON.stringify({ Effective: $scope.Effective, To: $scope.To }));
  }

  // Call this after the whole page is loaded.
  $rootScope.$broadcast('$pageloaded');
}]);