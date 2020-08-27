'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Homeowners_BindEndorsementController', ['authService', '$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', '$modal', 'notificationsHub', 'settings', 'policyService', 'ngAuthSettings', 'localStorageService', function (authService, $rootScope, $scope, $location, $stateParams, $ocLazyLoad, $modal, notificationsHub, settings, policyService, ngAuthSettings, localStorageService) {
    $scope.parent = $scope.$parent;

    $scope.toggleManaulAddressEntry = false;
    $scope.AppId = $scope.parent.AppId;
    $scope.PolicyId = $scope.parent.PolicyId;
    $scope.ErrorMessage = '';
    $scope.WarningMessage = '';
    $scope.toggleReturnPremium = false;
    $scope.toggleAdditionalPremium = false;

    $scope.PremiumBreakdowns = [];
    $scope.canBind = $.inArray("Bind Authority", authService.authentication.roles) > -1;
    $scope.canUnbindPolicy = $.inArray("Unbind Authority", authService.authentication.roles) > -1;
    $scope.IsInsuranceHero = $rootScope.Organization['Name'] == 'Insurance Hero';

    if ($scope.AppId == null) {
        $rootScope.$state.transitionTo('policyDashboard');
    }

    if ($scope.PolicyId) { // Existing Policy
        loadPolicy();
    }
    else {
        $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
    }


    function loadPolicy() {
        $scope.EffectiveDate = $scope.parent.Policy.Effective;
        $scope.PremiumBreakdowns = $scope.parent.Policy.PremiumBreakdowns;

        $scope.RiskCompanies = $scope.parent.RiskCompanies;
        if ($scope.RiskCompanies.length == 1 || $scope.parent.RiskCompanyId == null) $scope.parent.RiskCompanyId = $scope.RiskCompanies[0].Id;

        if ($scope.parent.canModify()) {
            policyService.getGeneralEndorsementChangeRecord($scope.PolicyId).then(function (result) {
                if (result.data.Result.Success) {
                    $scope.EndorsementRecord = result.data.EndorsementRecord;
                } else {
                    $scope.Errors = result.data.Result.Errors;
                }
            }, function (error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
        } else {
            $scope.EndorsementRecord = $scope.parent.Policy.Endorsement;
        }
    }

    $scope.effectiveDateBeforeShow = function () {
        $scope.effectiveDateIsOpen = true;
    }

    $scope.effectiveDateClosed = function () {
        $scope.effectiveDateIsOpen = false;
    }

    $scope.effectiveDateChangedTimeOut = null;

    $scope.endorsementEffectiveDateChanged = function (override) {
        var today = new Date($scope.EndorsementRecord.EndorsementEffective);
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        $scope.EndorsementRecord.EndorsementEffective = mm + '/' + dd + '/' + yyyy;

        if (!$scope.effectiveDateIsOpen || override) {
            $scope.updateEndorsementPremium();
        }
    }

    $scope.updateEndorsementPremium = function () {
        if ($scope.effectiveDateChangedTimeOut != null) {
            clearTimeout($scope.effectiveDateChangedTimeOut);
            $scope.effectiveDateChangedTimeOut = null;
        }

        $scope.effectiveDateChangedTimeOut = setTimeout(function () {
            $scope.effectiveDateChangedTimeOut = null;
            policyService.updateGeneralEndorsementRecordPremium(
                    $scope.PolicyId,
                    $scope.EndorsementRecord,
                    $.grep($scope.EndorsementRecord.PremiumBreakdowns, function (x) { return x.IsAddedByUser == true; })
                ).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.EndorsementRecord = result.data.EndorsementRecord;
                    }
                    else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
        }, 500);
    }

    $scope.addEndorsementFee = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addEndorsementFee.html',
            controller: 'RLI_Commercial_Lines_addEndorsementFee',
            backdrop: 'static',
            resolve: {
                endorsementRecord: function () {
                    return $scope.EndorsementRecord;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                $scope.updateEndorsementPremium();
            }
        });
    }

    $scope.removeEndorsementFee = function (fee) {
        var allFeesByName = $.grep($scope.EndorsementRecord.PremiumBreakdowns, function (x) { return x.Name == fee.Name; });
        for (var i = 0; i < allFeesByName.length; i++) {
            $scope.EndorsementRecord.PremiumBreakdowns.splice($scope.EndorsementRecord.PremiumBreakdowns.indexOf(allFeesByName[i]), 1);
        }
        $scope.updateEndorsementPremium();
    }

    $scope.confirmBindEndorsementContact = function () {
        var modalInstance = $modal.open({
            templateUrl: 'confirmBindContact.html',
            controller: 'test_Homeowners_confirmBindContactCtrl',
            backdrop: 'static',
            resolve: {
                Parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data !== 'cancel') {
                var splitData = data.split('|');
                $scope.bindEndorsement(true, splitData[0], splitData[1]);
            }
        });
    }

    $scope.confirmBindEndorsement = function () {
        var modalInstance = $modal.open({
            templateUrl: 'confirmBind.html',
            controller: 'RLI_Commercial_Lines_confirmBindCtrl',
            backdrop: 'static'
        });

        modalInstance.result.then(function (data) {
            if (data !== 'cancel') {
                $scope.bindEndorsement();
            }
        });
    }

    $scope.deleteForm = function (form) {
        policyService.deleteForm($scope.parent.Policy.Id, form.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy.CurrentVersion.Forms.splice($scope.parent.Policy.CurrentVersion.Forms.indexOf(form), 1);
                notificationsHub.showSuccess('Quote', 'Quote ' + $scope.parent.Policy.Number + ' is saved.');

                loadPolicy();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.bindEndorsement = function (emailToAgent, contactEmail, contactName) {
        $scope.Errors = [];
        policyService.bindGeneralEndorsement(
                $scope.PolicyId,
                emailToAgent,
                contactEmail,
                contactName,
                $scope.EndorsementRecord,
                $.grep($scope.EndorsementRecord.PremiumBreakdowns, function (x) { return x.IsAddedByUser == true; })
            ).then(function (result) {
                if (result.data.Result.Success) {
                    $scope.parent.Policy = result.data.Policy;
                    $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                }
                else {
                    $scope.Errors = result.data.Result.Errors;
                }
            }, function (error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
    }

    $scope.downloadEndorsement = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        if ($scope.parent.canModify())
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
        };

        xhr.setRequestHeader("Content-Type", "application/json");
        var authData = localStorageService.get('authorizationData');
        xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
        if ($scope.parent.canModify())
            xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId, EndorsementRecord: $scope.EndorsementRecord, CustomFees: $.grep($scope.EndorsementRecord.PremiumBreakdowns, function (x) { return x.IsAddedByUser == true; }) }));
        else
            xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId }));

    }
     
    $scope.requestApproval = function () {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to request approval?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }, {
                label: 'Request Approval',
                cssClass: 'btn-primary',
                action: function (dialogItself) {

                    policyService.requestApprovalForEndorsement(
                            $scope.PolicyId,
                            $scope.EndorsementRecord,
                            $.grep($scope.EndorsementRecord.PremiumBreakdowns, function (x) { return x.IsAddedByUser == true; })
                        ).then(function (result) {
                            if (result.data.Result.Success) {
                                $scope.parent.Policy = result.data.Policy;
                                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                                $scope.EndorsementRecord = $scope.parent.Policy.Endorsement;
                            }
                            else {
                                $scope.Errors = result.data.Result.Errors;
                            }
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });

                    dialogItself.close();
                }
            }]
        });
    }
     
    $scope.approveEndorsement = function () {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to <strong>APPROVE</strong> this endorsement?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }, {
                label: 'Approve',
                cssClass: 'btn-primary',
                action: function (dialogItself) {

                    policyService.approveEndorsement(
                            $scope.PolicyId,
                            $scope.EndorsementRecord,
                            $.grep($scope.EndorsementRecord.PremiumBreakdowns, function (x) { return x.IsAddedByUser == true; })
                        ).then(function (result) {
                            if (result.data.Result.Success) {
                                $scope.parent.Policy = result.data.Policy;
                                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                                $scope.EndorsementRecord = $scope.parent.Policy.Endorsement;
                            }
                            else {
                                $scope.Errors = result.data.Result.Errors;
                            }
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });

                    dialogItself.close();
                }
            }]
        });
    }
     
    $scope.denyEndorsement = function () {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to <strong>DENY</strong> this endorsement?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }, {
                label: 'Deny',
                cssClass: 'btn-primary',
                action: function (dialogItself) {

                    policyService.denyEndorsement(
                            $scope.PolicyId,
                            $scope.EndorsementRecord,
                            $.grep($scope.EndorsementRecord.PremiumBreakdowns, function (x) { return x.IsAddedByUser == true; })
                        ).then(function (result) {
                            if (result.data.Result.Success) {
                                $rootScope.$state.transitionTo('policyDashboard');
                            }
                            else {
                                $scope.Errors = result.data.Result.Errors;
                            }
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });

                    dialogItself.close();
                }
            }]
        });
    }
}]);

MALACHIAPP.controller('test_Homeowners_confirmBindContactCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'Parent', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, Parent) {

    $scope.parent = Parent;
    $scope.contactEmail = $scope.parent.Policy.AgencyDetail.ContactEmail;
    $scope.emailTo = $scope.contactEmail;
    $scope.contactName = $scope.parent.Policy.AgencyDetail.ContactName;
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

MALACHIAPP.controller('test_Homeowners_addEndorsementFee', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', 'endorsementRecord', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService, endorsementRecord) {
    $scope.EndorsementRecord = endorsementRecord;
    $scope.selected = {};
    $scope.ErrorList = [];

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {
        $scope.ErrorList = [];
        if ($scope.selected.Fee != null && $scope.selected.Amount > 0) {

            $scope.EndorsementRecord.PremiumBreakdowns.push({
                Index: 1,
                Name: $scope.selected.Fee.Name,
                Code: $scope.selected.Fee.Code,
                Coverage: "Fee",
                Amount: $scope.selected.Amount,
                CalculateType: $scope.selected.Fee.CalculateType,
                TaxableFee: $scope.selected.Fee.TaxableFee,
                IsAddedByUser: true
            });

            $modalInstance.close();
        } else {
            $scope.ErrorList.push('Please select a fee and enter the charge amount.');
        }
    }

}]);

MALACHIAPP.controller('test_Homeowners_confirmBindCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$http', 'settings', 'policyService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $http, settings, policyService, toolsService) {

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {
        $modalInstance.close('bind');
    }

}]);