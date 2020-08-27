'use strict'
// Get File Version
var version = parseQuery("appjs").v;

/* Setup general page controller */
MALACHIAPP.controller('ExtensionEndorsementController', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', '$modal', 'notificationsHub', '$urlRouter', 'ngAuthSettings', 'localStorageService', 'settings', 'policyService', 'authService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, $modal, notificationsHub, $urlRouter, ngAuthSettings, localStorageService, settings, policyService, authService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;

        setTimeout(function () {
            $('body').addClass("page-sidebar-closed");
            $('.page-sidebar-menu').addClass("page-sidebar-menu-closed");
            $(window).trigger('resize');
        }, 10);
    });

    $scope.Bound = false;
    $scope.PolicyId = $stateParams.policyId;
    $scope.Errors = [];
    $scope.parentPolicy = {};
    $scope.MakeNonPremium = $.inArray("Non-Premium Extension Endorsement", authService.authentication.roles) > -1;

    $scope.getParentPolicy = function () {
        policyService.getPolicy($scope.PolicyId).then(function (result) {
            if (result.data.Result.Success) {
                $scope.parentPolicy = result.data.Policy;
            } else {
                $scope.ErrorList = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    if ($scope.PolicyId == null) {
        $location.path('/policyDashboard');
        return;
    }

    $scope.backToDashboard = function () {
        $location.path('/policyDashboard');
    }

    $scope.confirmBindEndorsementContact = function () {
        var modalInstance = $modal.open({
            templateUrl: 'confirmBindContact.html',
            controller: 'Extension_confirmBindContactCtrl',
            backdrop: 'static',
            resolve: {
                Policy: function () {
                    return $scope.parentPolicy;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data !== 'cancel') {
                var splitData = data.split('|');
                $scope.bindExtensionEndorsement(true, splitData[0], splitData[1]);
            }
        });
    }

    $scope.bindExtensionEndorsement = function (emailToAgent, contactEmail, contactName) {
        $scope.ErrorList = [];
        if (!$scope.Bound) {
            policyService.bindExtensionEndorsement($scope.PolicyId, emailToAgent, contactEmail, contactName, $scope.Policy).then(function(result) {
                if (result.data.Result.Success) {
                    $scope.PolicyId = result.data.PolicyId;
                    $scope.Bound = true;
                } else {
                    $scope.ErrorList = result.data.Result.Errors;
                }
            }, function(error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
        }
    }


    $scope.calculateExtension = function (info, override) {
        if (!$scope.effectiveDateIsOpen || override) {
            $scope.ErrorList = [];
            if (!$scope.Bound) {
                policyService.calculateExtension($scope.PolicyId, info).then(function(result) {
                    if (result.data.Result.Success) {
                        $scope.Policy = result.data.ExtensionEndorsement;
                        setDate();
                    } else {
                        $scope.ErrorList = result.data.Result.Errors;
                    }
                }, function(error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
        }
    }
     
    $scope.effectiveDateBeforeShow = function () {
        $scope.effectiveDateIsOpen = true;
    }

    $scope.effectiveDateClosed = function () {
        $scope.effectiveDateIsOpen = false;
    }

    $scope.updatePremiumAfterFeesAndTaxes = function () {
        $scope.Policy.PremiumAfterFeesAndTaxes = parseFloat($scope.Policy.Premium);

        for (var i = 0; i < $scope.Policy.PremiumBreakdown.length; i++) {
            if ($scope.Policy.PremiumBreakdown[i].Amount) {
                $scope.Policy.PremiumAfterFeesAndTaxes += parseFloat($scope.Policy.PremiumBreakdown[i].Amount);
            }
        }
    }

    function setDate() {
        if ($scope.Policy.EndorsementEffective.indexOf('T'))
        {
            $scope.Policy.EndorsementEffective = $scope.Policy.EndorsementEffective.split('T')[0];
        }
        if ($scope.Policy.EndorsementEffective.indexOf("-") > -1) {
            var date = moment($scope.Policy.EndorsementEffective, "YYYY-MM-DD").toDate();
            var day = date.getUTCDate();
            var monthIndex = date.getMonth() + 1;
            var year = date.getFullYear();

            $scope.Policy.EndorsementEffective = monthIndex + '/' + day + '/' + year;

            var time = moment($scope.Policy.EndorsementTime, "HH:mm:ss").toDate();
            $scope.Policy.EndorsementTime = time;
        }
    }

    $scope.canDownloadEndorsement = function () {
        var policy = $scope.Policy;
        if (policy == null) return false;

        var isAgencyPortalApp = policy.AppId == "001d0418-a168-4be3-84a8-0168eda970fd";

        // Hide button if the quote is based in New York and is not issued.
        if (isAgencyPortalApp) {
            if (policy.HomeStateCode == "NY" && !policy.Issued) {
                return false;
            }
        }

        return true;
    }

    $scope.downloadEndorsement = function () {
        if ($scope.Bound) {
            Metronic.blockUI({ animate: true, overlayColor: 'none' });
            var xhr = new XMLHttpRequest();
            xhr.open('POST',window.documentServiceBase + 'api/document/DownloadEndorsementDocument', true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function () {
                Metronic.unblockUI();
                if (this.status === 200) {
                    var filename = "Endorsement.pdf";
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
            xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId }));
        }
    }

    $scope.calculateExtension(null);
    $scope.getParentPolicy();
}]);

MALACHIAPP.controller('Extension_confirmBindContactCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'Policy', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, Policy) {

    $scope.policy = Policy;
    $scope.contactEmail = $scope.policy.AgencyDetail.ContactEmail;
    $scope.emailTo = $scope.contactEmail;
    $scope.contactName = $scope.policy.AgencyDetail.ContactName;
    $scope.finalContactName = $scope.contactName;
    $scope.Errors = [];

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {
        $scope.Errors = [];
        if (!validateEmail($scope.emailTo)) {
            $scope.Errors.push('The current email is not valid');
        }
        if ($scope.finalContactName == null || $scope.finalContactName == "") {
            $scope.Errors.push('Please enter a name into the field');
        }

        if ($scope.Errors.length == 0) {
            $modalInstance.close($scope.emailTo + '|' + $scope.name);
        }
    }

    function validateEmail(email) {
        if (email === null || email === "" || email === undefined) return false;

        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w+)+$/;
        if (email.match(mailformat)) {
            return true;
        }
        else {
            return false;
        }
    }

}]);