'use strict'
// Get File Version
var version = parseQuery("appjs").v;
var lastFCB = 0;

/* Setup general page controller */
MALACHIAPP.controller('CancellationController', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', '$modal', 'notificationsHub', '$urlRouter', 'settings', 'policyService', 'ngAuthSettings', 'localStorageService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, $modal, notificationsHub, $urlRouter, settings, policyService, ngAuthSettings, localStorageService) {
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

    $scope.isRated = false;
    $scope.Bound = false;
    $scope.PolicyId = $stateParams.policyId;
    $scope.parentPolicy = {};
    $scope.Errors = [];

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
    $scope.getParentPolicy();

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
            controller: 'Cancellation_confirmBindContactCtrl',
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
                $scope.bindCancellationEndorsement(true, splitData[0], splitData[1]);
            }
        });
    }

    $scope.bindCancellationEndorsement = function (emailToAgent, contactEmail, contactName) {
        $scope.validate();
        if ($scope.Errors.length > 0)
            return;

        if ($scope.Policy.Reason != 'Other') {
            $scope.Policy.Summary = $scope.Policy.Reason;
        }

        if (!$scope.Bound) {
            policyService.bindCancellationEndorsement($scope.PolicyId, emailToAgent, contactEmail, contactName, $scope.Policy).then(function (result) {
                if (result.data.Result.Success) {
                    $scope.PolicyId = result.data.PolicyId;
                    $scope.Policy.Reason = $scope.Policy.Summary;
                    $scope.Bound = true;
                } else {
                    $scope.Errors = result.data.Result.Errors;
                }
            }, function (error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
        }
    }

    $scope.validate = function () {
        $scope.Errors = [];

        if (!$scope.Policy.EndorsementEffective)
            $scope.Errors.push("Cancellation Effective Date must not be empty");
        else
            $scope.validateCancellationDate();

        if (!$scope.Policy.EndorsementNumber)
            $scope.Errors.push("Endorsement Number must not be empty");

        if (Math.floor(Number($scope.Policy.EndorsementNumber)) != $scope.Policy.EndorsementNumber || Number($scope.Policy.EndorsementNumber) <= 0)
            $scope.Errors.push("Endorsement Number must be valid");

        if (!$scope.Policy.Reason)
            $scope.Errors.push("Cancellation Reason must not be empty");

        if (!$scope.Policy.RequestedBy)
            $scope.Errors.push("Cancellation Requested By must not be empty");

        if (!$scope.Policy.IsFinanceChargeBack == null)
            $scope.Errors.push("Is finance charge back quention unanswered")     
    }

    $scope.calculateCancellation = function (info, override) {
        if (!$scope.effectiveDateIsOpen || override) {
            $scope.ErrorList = [];

            // if the Endorsement effective date is not set the second time around show error
            if ($scope.Policy != null && !$scope.Policy.EndorsementEffective) {
                $scope.ErrorList.push("Cancellation Effective must not be empty");
                return;
            }

            if (info != null && info.Reason != 'Other') {
                info.Summary = info.Reason;
            }

            if (!$scope.Bound) {
                policyService.calculateCancellation($scope.PolicyId, info).then(function (result) {
                    if (result.data.Result.Success) {
                        // first time request to the server should unset EndorsementEffective date
                        if (!$scope.Policy) result.data.CancellationEndorsement.EndorsementEffective = null;

                        $scope.Policy = result.data.CancellationEndorsement;
                        $scope.Policy.Reason = $scope.Policy.Summary;

                        var userInput = $scope.Policy.FinanceChargeBackPremium;

                        if ($scope.Policy.IsFinanceChargeBack)
                        {
                            //if user input is the same at the finance chargeback amount
                            if (userInput != lastFCB && userInput > 0) {
                                $scope.Policy.FinanceChargeBackPremium = userInput;
                            } else {
                                //premium after fees and taxes is negative and so is premium so the double negative is adding it to finance chargeback)
                                $scope.Policy.FinanceChargeBackPremium = $scope.Policy.PremiumAfterFeesAndTaxes - ($scope.Policy.Premium * $scope.Policy.RetailAgentCommission * 0.01);
                            }
                        }
                        else
                        {
                            $scope.Policy.FinanceChargeBackPremium = 0;
                        }

                        $scope.isRated = $scope.Policy.EndorsementEffective != null;
                        lastFCB = $scope.Policy.FinanceChargeBackPremium;

                    } else {
                        $scope.ErrorList = result.data.Result.Errors;
						
						// Add each error in ErrorList to $scope.Errors
						for (var i = 0; i < $scope.ErrorList.length; i++) {
							$scope.Errors.push($scope.ErrorList[i]);
						}
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
        }
    }

    $scope.calculateCancellation();

    $scope.effectiveDateBeforeShow = function () {
        $scope.effectiveDateIsOpen = true;
    }

    $scope.effectiveDateClosed = function () {
        if ($scope.validateCancellationDate())
            return;

        $scope.effectiveDateIsOpen = false;
    }

    $scope.validateCancellationDate = function () {
        // validate date
        var effective = new Date($scope.Policy.PolicyEffective);
        var canceleffective = new Date($scope.Policy.EndorsementEffective);

        // make sure cancel date is not before effective
        //if (canceleffective.getTime() < effective.getTime()) {
        //    // clear cancel date
        //    $scope.Policy.EndorsementEffective = '';

        //    // push error
        //    $scope.Errors.push("Cancellation Date cannot be earlier than effective date");

        //    // exit
        //    return true;
        //}

        // success
        return false;
    }

    $scope.updatePremiumAfterFeesAndTaxes = function () {
        $scope.Policy.PremiumAfterFeesAndTaxes = parseFloat($scope.Policy.Premium);

        for (var i = 0; i < $scope.Policy.PremiumBreakdown.length; i++) {
            if ($scope.Policy.PremiumBreakdown[i].Amount) {
                $scope.Policy.PremiumAfterFeesAndTaxes += parseFloat($scope.Policy.PremiumBreakdown[i].Amount);
            }
        }
    }

    $scope.downloadCancellationEndorsement = function () {
        $scope.validate();

        if ($scope.ErrorList.length > 0)
            return;

        if ($scope.Policy.Reason != 'Other') {
            $scope.Policy.Summary = $scope.Policy.Reason;
        }

        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST',window.documentServiceBase + 'api/document/DownloadCancellationEndorsementInProgressDocument', true);
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
        xhr.send(JSON.stringify({ CancellationEndorsement: $scope.Policy, PolicyId: $scope.PolicyId }));
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
        $scope.validate();

        if ($scope.ErrorList.length > 0)
            return;

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
     
}]);

MALACHIAPP.controller('Cancellation_confirmBindContactCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'Policy', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, Policy) {

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