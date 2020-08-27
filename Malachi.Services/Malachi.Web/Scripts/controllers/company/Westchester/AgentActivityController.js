'use strict';


MALACHIAPP.controller('AgentActivityController', ['$rootScope', '$scope', '$http', '$timeout', '$location', '$modal', 'authService', 'policyService', 'notificationsHub', 'ngAuthSettings', 'localStorageService', function ($rootScope, $scope, $http, $timeout, $location, $modal, authService, policyService, notificationsHub, ngAuthSettings, localStorageService) {
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

    $scope.requestReport = function () {
        var params = {
            Effective: $scope.Effective,
            To: $scope.To
        };

        Metronic.blockUI({ animate: true, overlayColor: "none" });
        $http.post(window.reportsAPI + "api/export/RequestAgentActivity", params).then(result => {
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
        xhr.open('POST', ngAuthSettings.apiServiceBaseUri + 'api/bassuw/reporting/DownloadAgentActivity', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "AgentActivity.xlsx";
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