'use strict'
// Get File Version
var version = parseQuery("appjs").v;

/* Setup general page controller */
MALACHIAPP.controller('PayEndorsementController', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', '$modal', 'notificationsHub', '$urlRouter', 'settings', 'policyService', 'ngAuthSettings', 'localStorageService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, $modal, notificationsHub, $urlRouter, settings, policyService, ngAuthSettings, localStorageService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;

        setTimeout(function () {
            $('body').addClass("page-sidebar-closed");
            $('.page-sidebar-menu').addClass("page-sidebar-menu-closed");
            $(window).trigger('resize');
        }, 10);
    });

    // load policy
    var loadPolicy = function () {
        // block ui
        Metronic.blockUI({ animate: true, overlayColor: 'none' });

        // load policy
        policyService.getPolicy($scope.PolicyId).then(function (result) {

            // unblock ui
            Metronic.unblockUI();

            // success get info
            if (result.data.Result.Success) {
                $scope.Policy = result.data.Policy;
                $scope.Policy.CurrentVersion = $scope.Policy.Versions[0];
                $scope.Coverages = result.data.Coverages;
                $scope.RiskCompanies = $scope.RiskCompanies = result.data.RiskCompanies;
                $scope.RiskCompanyId = $scope.Policy.CurrentVersion.RiskCompanyId;

                if ($scope.RiskCompanies.length == 1 || $scope.RiskCompanyId == null)
                    $scope.RiskCompanyId = $scope.RiskCompanies[0].Id;

                $scope.EndorsementRecord = $scope.Policy.Endorsement;
            } else {
                $scope.PaymentErrors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.PaymentErrors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    // load policy
    $scope.PolicyId = $stateParams.policyId;
    loadPolicy();

    $scope.PaymentErrors = {};
    $scope.Payment = {
        PaymentType: 'Credit',
        Option: 'Insured Pay'
    };

    $scope.Years = [];
    var year = parseInt(new Date().getFullYear().toString().substr(2, 2));
    var lastYear = year + 20;

    for (var i = year; i < lastYear; i++) {
        $scope.Years.push(i.toString());
    }

    // Function that validates the payment fields
    $scope.validatePaymentFields = function () {
        $scope.PaymentErrors = [];
        var numberOnlyFormat = /^\d+$/;

        if ($scope.Payment.PaymentType === "Credit") {

            // Make sure they have filled in something to activate the object
            if ($scope.Payment.CreditCard === null || $scope.Payment.CreditCard === undefined) {
                $scope.PaymentErrors.push('Please enter the credit card account information');
                return;
            }

            // Card Number
            if (checkInput($scope.Payment.CreditCard.Number)) {
                $scope.PaymentErrors.push("Please enter a card number");
            }
            else {
                if (!$scope.Payment.CreditCard.Number.match(numberOnlyFormat)) {
                    $scope.PaymentErrors.push("Card Number must only contain numbers");
                }
            }

            // Card Code
            if (checkInput($scope.Payment.CreditCard.Code)) {
                $scope.PaymentErrors.push('Please enter a card CVV2 code');
            }
            else {
                if (!$scope.Payment.CreditCard.Code.match(numberOnlyFormat)) {
                    $scope.PaymentErrors.push("CVV2 code must only contain numbers");
                }
            }

            // Card Month
            if (checkInput($scope.Payment.CreditCard.ExpirationDateMonth)) {
                $scope.PaymentErrors.push('Please select a card expiration month');
            }

            // Card Year
            if (checkInput($scope.Payment.CreditCard.ExpirationDateYear)) {
                $scope.PaymentErrors.push('Please select a card expiration year');
            }

            // Card First Name
            if (checkInput($scope.Payment.FirstName)) {
                $scope.PaymentErrors.push('Please enter the first name for the card');
            }

            // Card Last Name
            if (checkInput($scope.Payment.LastName)) {
                $scope.PaymentErrors.push('Please enter the last name for the card');
            }

            // Card Street Address
            if (checkInput($scope.Payment.StreetAddress)) {
                $scope.PaymentErrors.push('Please enter the street address for the card');
            }

            // Card City
            if (checkInput($scope.Payment.City)) {
                $scope.PaymentErrors.push('Please enter the city for the card');
            }

            // Card Zip
            if (checkInput($scope.Payment.Zip)) {
                $scope.PaymentErrors.push('Please enter the zip for the card');
            }
            else {
                if (!$scope.Payment.Zip.match(numberOnlyFormat)) {
                    $scope.PaymentErrors.push("Card zip must only contain numbers");
                }
            }
        }
    }

    function checkInput(input) {
        if (input === '' || input === undefined) {
            return true;
        }
        else {
            return false;
        }
    }

    $scope.downloadEndorsement = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        if (!$scope.Policy.Issued)
            xhr.open('POST',window.documentServiceBase + 'api/document/DownloadEndorsementInProgressDocument', true);
        else
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
        }

        xhr.setRequestHeader("Content-Type", "application/json");
        var authData = localStorageService.get('authorizationData');
        xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
        if (!$scope.Policy.Issued)
            xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId, EndorsementRecord: $scope.EndorsementRecord, CustomFees: $.grep($scope.EndorsementRecord.PremiumBreakdowns, function (x) { return x.IsAddedByUser == true; }) }));
        else
            xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId }));
    }

    $scope.close = function() {
        $rootScope.$state.transitionTo("dashboard");
    }

    $scope.confirmBindEndorsementContact = function () {
        var modalInstance = $modal.open({
            templateUrl: 'confirmBindContact.html',
            controller: 'Pay_confirmBindContactCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.Policy;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data !== 'cancel') {
                var splitData = data.split('|');
                $scope.payAndBind(true, splitData[0], splitData[1]);
            }
        });
    }

    $scope.payAndBind = function (emailToAgent, contactEmail, contactName) {
        $scope.PaymentErrors = {};
        $scope.validatePaymentFields();

        if ($scope.PaymentErrors.length > 0)
            return;

        policyService.payGeneralEndorsement(
            $scope.PolicyId,
            emailToAgent,
            contactEmail,
            contactName,
            $scope.EndorsementRecord,
            $.grep($scope.EndorsementRecord.PremiumBreakdowns, function (x) { return x.IsAddedByUser == true; }),
            $scope.Payment
        ).then(function (result) {
            if (result.data.Result.Success) {
                $scope.success = true;
                $scope.Policy = result.data.Policy;
            }
            else {
                $scope.PaymentErrors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.PaymentErrors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }
}]);

MALACHIAPP.controller('Pay_confirmBindContactCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'Policy', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, Policy) {

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