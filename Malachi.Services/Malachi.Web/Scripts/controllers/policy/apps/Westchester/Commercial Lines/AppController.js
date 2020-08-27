'use strict'

// Get File Version
var version = parseQuery("appjs").v;

/* Setup general page controller */
MALACHIAPP.controller('test_Commercial_Lines_AppController', ['authService', '$rootScope', '$scope', '$sce', '$interval', '$timeout', '$location', '$modal', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$urlRouter', 'settings', 'ngAuthSettings', 'localStorageService', 'policyService', 'customPackageService', 'claimsService', function (authService, $rootScope, $scope, $sce, $interval, $timeout, $location, $modal, $stateParams, $ocLazyLoad, notificationsHub, $urlRouter, settings, ngAuthSettings, localStorageService, policyService, customPackageService, claimsService) {

    $scope.AppId = $stateParams.appId;
    $scope.PolicyId = $stateParams.policyId;
    $scope.policyMenuVisible = true;
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
    $scope.hasCanSeeBound = $.inArray("Can See Bound", authService.authentication.roles) > -1;
    $scope.canViewVersions = $.inArray("Policy Version View", authService.authentication.roles) > -1;
    $scope.Policy.PolicyTerm = 12;
    $scope.LoadingPage = true;
    $scope.AllClassCodes = [];
    $scope.UploadedDocuments = [];
    $scope.EligibilityQuestions = [];
    $scope.ElanyCoverage = {
        Coverages: [],
        Risks: []
    };
    $scope.Apps = [];
    $scope.Policy = {
        AgencyDetail: {},
        Insured: {},
        Versions: [{}]
    };

    $scope.Policy.CurrentVersion = $scope.Policy.Versions[0];


    $scope.getMgaSubmissionNumber = function () {
        var getMgaSubmissionNumber = function () {
            policyService.getAimSubmissionNumber($scope.PolicyId).then(function (data) {
                if (data.data) {
                    $scope.Policy.MGASubmissionNumber = data.data;
                    if ($scope.intervalPromise)
                        $interval.cancel($scope.intervalPromise);
                }
            }, function (error) {
            });
        };
        $scope.intervalPromise = $interval(getMgaSubmissionNumber, 10000, 0, true);
    };

    if ($scope.AppId != null) {
        policyService.getApp($scope.AppId).then(function (result) {
            $scope.App = result.data.App;
            // App HTML and JS Path
            var htmlpath = 'views/policy/apps/' + $scope.App.Url;
            var jspath = 'scripts/controllers/policy/apps/' + $scope.App.Url;
            var csspath = 'content/controllers/policy/apps/' + $scope.App.Url;

            var $state = $rootScope.$state;
            var getExistingState = $state.get('policy.' + $scope.App.Url + '.submission');
            if (getExistingState == null) {
                var controller = $scope.App.Url.replace("/", "_").replace(" - ", "_").replace(" ", "_");

                $stateProviderRef
                    .state('policy.' + $scope.App.Url + '.submission', {
                        url: "/" + $scope.App.Url + "/submission",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/submission.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " Submission" },
                        controller: controller + "_SubmissionController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',
                                        'plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,

                                        '/Scripts/services/company/test/policyService.js?v=' + version,
                                        '/Scripts/services/customPackageService.js?v=' + version,
                                        csspath + '/submission.css',
                                        jspath + '/pages/SubmissionController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

                    .state('policy.' + $scope.App.Url + '.agency', {
                        url: "/" + $scope.App.Url + "/agency",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/agency.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " agency" },
                        controller: controller + "_AgencyController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',
                                        'plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,

                                        csspath + '/agency.css',
                                        jspath + '/pages/AgencyController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

                    .state('policy.' + $scope.App.Url + '.locations', {
                        url: "/" + $scope.App.Url + "/locations",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/locations.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " Locations" },
                        controller: controller + "_LocationsController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',

                                        csspath + '/locations.css',
                                        jspath + '/pages/LocationsController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

                    .state('policy.' + $scope.App.Url + '.liability', {
                        url: "/" + $scope.App.Url + "/liability",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/liability.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " Liability" },
                        controller: controller + "_LiabilityController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',
                                        'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',

                                        'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                                        csspath + '/liability.css',
                                        jspath + '/pages/LiabilityController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

                    .state('policy.' + $scope.App.Url + '.eligibility', {
                        url: "/" + $scope.App.Url + "/eligibility",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/eligibility.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " Eligibility" },
                        controller: controller + "_EligibilityController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',
                                        'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',

                                        'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                                        csspath + '/eligibility.css',
                                        '/scripts/services/contractService.js?v=' + version,
                                        '/scripts/services/customPackageService.js?v=' + version,
                                        // Additional Coverages
                                        '/Scripts/controllers/policy/apps/test/Commercial Lines/pages/Coverages/RSUI Covington/Liquor Liability.js?v=' + version,
                                        '/Scripts/controllers/policy/apps/test/Commercial Lines/pages/Coverages/RSUI Covington/Equipment Breakdown.js?v=' + version,
                                        '/Scripts/controllers/policy/apps/test/Commercial Lines/pages/Coverages/RSUI Covington/Professional Liability.js?v=' + version,
                                        jspath + '/pages/EligibilityController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

                    .state('policy.' + $scope.App.Url + '.forms', {
                        url: "/" + $scope.App.Url + "/forms",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/forms.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " Forms" },
                        controller: controller + "_FormsController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',
                                        '/scripts/services/formsService.js?v=' + version,
                                        csspath + '/forms.css',
                                        jspath + '/pages/FormsController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

                    .state('policy.' + $scope.App.Url + '.finalize', {
                        url: "/" + $scope.App.Url + "/finalize",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/finalize.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " Finalize" },
                        controller: controller + "_FinalizeController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',
                                        'plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,

                                        '/Scripts/services/company/test/policyService.js?v=' + version,
                                        '/Scripts/services/agencyService.js?v=' + version,
                                        csspath + '/finalize.css',
                                        jspath + '/pages/FinalizeController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

                    .state('policy.' + $scope.App.Url + '.property', {
                        url: "/" + $scope.App.Url + "/property",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/property.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " Property" },
                        controller: controller + "_PropertyController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',
                                        'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',

                                        'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                                        csspath + '/property.css',
                                        jspath + '/pages/PropertyController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

                    .state('policy.' + $scope.App.Url + '.bind', {
                        url: "/" + $scope.App.Url + "/bind",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/bind.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " Bind" },
                        controller: controller + "_BindController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',
                                        'plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,
                                        '/Scripts/services/aimService.js?v=' + version,
                                        '/Scripts/services/elanyService.js?v=' + version,
                                        '/Scripts/services/company/test/policyService.js?v=' + version,
                                        '/Scripts/services/agencyService.js?v=' + version,
                                        csspath + '/bind.css',
                                        jspath + '/pages/BindController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

                    .state('policy.' + $scope.App.Url + '.bindendorsement', {
                        url: "/" + $scope.App.Url + "/bindendorsement",
                        params: { appId: null, policyId: null }, // Parameters must be defined
                        templateUrl: htmlpath + "/pages/bindendorsement.html?v=" + version,
                        data: { pageTitle: $scope.App.Name + " Bind Endorsement" },
                        controller: controller + "_BindEndorsementController",
                        resolve: {
                            deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                                return $ocLazyLoad.load({
                                    name: 'MALACHIAPP',
                                    insertBefore: '#ng_load_plugins_before',
                                    files: [
                                        'content/controllers/policy/nav.css',
                                        'content/controllers/policy/shared.css',
                                        'plugins/bootstrap-daterangepicker/daterangepicker.js?v=' + version,

                                        csspath + '/bind.css',
                                        jspath + '/pages/BindEndorsementController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    });
            }

            $state.transitionTo('policy.' + $scope.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });

        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    if ($scope.PolicyId) { // Existing Policy
        policyService.getPolicyNotes($scope.PolicyId).then(function (result) {
            if (result.data.Result.Success) {
                $scope.PolicyNotes = result.data.PolicyNotes;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page'];
        });

        getUploadedDocuments();
        getElanyCoverageInfo();
    }

    $scope.canSeeBound = function () {
        if ($scope.Policy.Issued) return true;
        if ($scope.hasCanSeeBound) return true;
        return false;
    }

    $scope.changeState = function (state, param) {
        // Remove URL property from state declarations for nice looking addressbar, but it will remove history. For now this feature is not used.
        if ($scope.PolicyId != null) {
            $rootScope.$state.transitionTo(state, param);
        }
    }

    $scope.updatePolicyTermToToday = function () {
        policyService.updatePolicyTermToToday($scope.PolicyId, $scope.Policy.PolicyTerm).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Policy.Effective = result.data.Effective;
                $scope.Policy.Expiration = result.data.Expiration;
                $scope.Policy.LateEffectiveDate = false;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.openPolicyNotes = function () {
        var modalInstance = $modal.open({
            templateUrl: 'policyNotes.html',
            controller: 'test_Commercial_Lines_policyNoteCtrl',
            backdrop: 'static',
            resolve: {
                policyId: function () {
                    return $scope.PolicyId;
                },
                policyNotes: function () {
                    return $scope.PolicyNotes;
                }
            }
        });


        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                var count = data.location.Properties.filter(function (x) { return x.PropertyType == 'Building' }).length;
                if (count > 0 || type === 'Building') {
                    data.property.PropertyType = type;
                    data.property.Id = null;
                    $scope.PropertyDeductibles.push({
                        PropertyId: null,
                        Name: 'Wind Deductible'
                    });
                    $scope.PropertyDeductibles.push({
                        PropertyId: null,
                        Name: 'AOP Deductible'
                    });
                    $scope.modify(data.location, data.property);
                }
                else {
                    BootstrapDialog.show({
                        title: 'Add Structure',
                        message: 'You must add at least one building to this location.',
                        buttons: [{
                            label: 'Ok',
                            action: function (dialogItself) {
                                dialogItself.close();
                            }
                        }]
                    });
                }
            }
        });
    }

    $scope.showClaimsSummary = function () {
        var modalInstance = $modal.open({
            templateUrl: 'policyClaims.html',
            controller: 'test_Commercial_Lines_policyClaimsCtrl',
            backdrop: 'static',
            windowClass: 'app-modal-window',
            resolve: {
                claims: function () {
                    return $scope.Policy.ClaimsSummary;
                },
                unableToGetClaims: function () {
                    return $scope.Policy.CantGetPolicyHistory;
                }
            }
        });

        // JACK'S + Add Ref to claimsService in state
        modalInstance.result.then(function (data) {
            if (data !== 'cancel') {
                $scope.Errors = [];
                claimsService.getClaimById(data).then(function (result) {
                    if (result.data.Success) {
                        $rootScope.$state.transitionTo("claimDetails", { claim: result.data.Data });
                    } else {
                        $scope.Errors = result.data.Errors;
                    }
                },
                    function (error) {
                        $scope.Errors = ["An unexpected error has occured. Please refresh the page."];
                    });
            };
        });
        // END OF JACK'S
    }

    $scope.Coverages = [];
    //$scope.parent = {};
    //$scope.parent.Policy = {};

    $scope.showAimSubmissionModal = function () {

        var modalInstance = $modal.open({
            templateUrl: 'test_Commercial_Lines_aimSubmission.html',
            controller: 'test_Commercial_Lines_aimSubmissionCtrlB',
            backdrop: 'static',
            size: 'md',
            keyboard: false,
            resolve: {
                policy: function () {
                    return $scope.Policy;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data.Coverages.length == 0) {
                $scope.Coverages = [];
                for (var i = 0; i < data.SelectedCoverages.length; i++) {
                    $scope.Coverages.push(data.SelectedCoverages[i]);
                }
            }

            if (!data.SubmissionNumber || !data.Confirmed) {
                policyService.newAimSubmission($scope.Policy.Id).then(function (result) {
                    if (result.status == 200) {
                        $scope.getMgaSubmissionNumber();
                    } else {
                        $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
                    }
                }, function (error) {
                    $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
            else {
                policyService.updatePolicyMgaSubmissionNumber($scope.PolicyId, data.SubmissionNumber).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.Policy = result.data.Policy;
                        $scope.Policy.CurrentVersion = $scope.Policy.Versions[0];
                    } else {
                        $scope.ErrorList = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
                });
            }

            if (data.SelectedCoverages.length > 0) {
                policyService.updateSubmissionAndInsured($scope.PolicyId, $scope.Policy, data.SelectedCoverages).then(function (result) {
                    if (result.data.Result.Success) {

                        $scope.Policy = result.data.Policy;
                        $scope.Policy.CurrentVersion = $scope.Policy.Versions[0];
                        $scope.Coverages = result.data.Coverages;

                        $scope.getAppContracts();

                        notificationsHub.showSuccess('Quote', 'Quote ' + $scope.Policy.Number + ' is saved.');
                    } else {
                        $scope.ErrorList = result.data.Result.Errors;
                    }
                },
                    function (error) {
                        $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
                    });
            }
        });
    };

    $scope.showCoverages = function () {
        var modalInstance = $modal.open({
            templateUrl: 'test_Commercial_showPolicyCoverages.html',
            controller: 'test_Commercial_Lines_showPolicyCoveragesCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                coverages: () => ['Property', 'Liability'],
                selectedCoverages: () => [],
                isCommercialPortalQuote: () => false,
                appId: () => $scope.AppId
            }
        });


        modalInstance.result.then(function (data) {
            if (data.Coverages != null) {
                $scope.Coverages = [];
                for (var i = 0; i < data.Coverages.length; i++) {
                    $scope.Coverages.push(data.Coverages[i]);
                }
            }

            if (data.Data != null) {
                $scope.Policy.MGASubmissionNumber = data.SubmissionNumber;
                $scope.Policy.Insured = data.Data.Insured;
                $scope.Policy.AgencyDetail = data.Data.AgencyDetail;
                $scope.Policy.UnderwriterId = data.Data.UnderwriterId;
                $scope.Policy.OfficeId = data.Data.OfficeId;
                $scope.Policy.HomeStateCode = data.Data.HomeStateCode;
                $scope.Policy.BusinessDescription = data.Data.BusinessDescription;
                $scope.Policy.RenewalOf = data.Data.RenewalOf;
                $scope.Policy.Effective = data.Data.Effective;
                $scope.Policy.OriginalAgencyId = data.Data.AgencyId;
                $scope.Policy.OriginalAgencyContactId = data.Data.ContactId;
                $scope.setExpiration();
            }
            else if (data != 'cancel') {
                $scope.submissionClearance(data);
            }
        });

        $scope.setExpiration = function () {
            var termLength = $scope.Policy.PolicyTerm;

            // Policy Term Logic with MEP
            if (termLength == 0 || termLength == 3) {
                $scope.Policy.MinimumEarnedPremium = '100%';
            }
            else if (termLength == 6) {
                $scope.Policy.MinimumEarnedPremium = '50%';
            }
            else if (termLength >= 12) {
                $scope.Policy.MinimumEarnedPremium = '25%';
            }

            if ($scope.Policy.Effective == undefined || $scope.Policy.Effective === "") return;

            $scope.ErrorList = [];
            var checkDate = new Date($scope.Policy.Effective).toString();
            if (checkDate === "Invalid Date") {
                $scope.Policy.Expiration = "";
                $scope.Policy.Effective = "";
                $scope.ErrorList.push("The effective date entered is not valid");
                return;
            }

            var today = new Date($scope.Policy.Effective);

            // check to make sure that user cant go past three days if not late binder
            if (!$scope.lateBinder) {
                var threeDaysPast = new Date();
                threeDaysPast.setHours(0, 0, 0, 0);
                threeDaysPast.setDate(threeDaysPast.getDate() - 3);

                // check to make sure user did not enter a date past three days in the past
                if (today.getTime() < threeDaysPast.getTime()) {
                    $scope.Policy.Expiration = "";
                    $scope.Policy.Effective = "";
                    $scope.ErrorList.push("The effective date cannot be more than three days in the past");
                    return;
                }
            }

            // make a date that is 6 months in the furture
            var sixMonths = new Date();
            sixMonths.setHours(0, 0, 0, 0);
            sixMonths.setMonth(sixMonths.getMonth() + 6);

            // if effective is greater than six months in the future show error
            if (today.getTime() > sixMonths.getTime()) {
                $scope.Policy.Expiration = "";
                $scope.Policy.Effective = "";
                $scope.ErrorList.push("The effective date cannot be more than six months in the future");
                return;
            }

            var expirationDate = new Date(today.setMonth(today.getMonth() + termLength));

            if (termLength != 0 || expirationDate <= today) {
                var dd = expirationDate.getDate();
                var mm = expirationDate.getMonth() + 1;
                var yyyy = expirationDate.getFullYear();

                $scope.Policy.Expiration = mm + '/' + dd + '/' + yyyy;
            }

            // In case it is short term just set the expiration to the next day
            if (termLength == 0) {
                var dd = expirationDate.getDate() + 1;
                var mm = expirationDate.getMonth() + 1;
                var yyyy = expirationDate.getFullYear();

                $scope.Policy.Expiration = mm + '/' + dd + '/' + yyyy;
            }
        }
    }

    $scope.submissionClearance = function (data) {
        if (data.Data != null) {
            $scope.Policy.MGASubmissionNumber = data.SubmissionNumber;
            $scope.Policy.Insured = data.Data.Insured;
            $scope.Policy.AgencyDetail = data.Data.AgencyDetail;
            $scope.Policy.UnderwriterId = data.Data.UnderwriterId;
            $scope.Policy.OfficeId = data.Data.OfficeId;
            $scope.Policy.HomeStateCode = data.Data.HomeStateCode;
            $scope.Policy.BusinessDescription = data.Data.BusinessDescription;
            $scope.Policy.RenewalOf = data.Data.RenewalOf;
            $scope.Policy.Effective = data.Data.Effective;
            $scope.setExpiration();
        }
        var modalInstance = $modal.open({
            Data: data,
            templateUrl: 'test_Commercial_Lines_submissionClearanceModelContent.html',
            controller: 'test_Commercial_Lines_showPolicyCoveragesCtrl',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                coverages: () => ['Property', 'Liability'],
                selectedCoverages: () => [],
                isCommercialPortalQuote: () => false,
                appId: () => $scope.AppId
            }
        });

        modalInstance.result.then(function (data) {
            if (data != null) {
                if (data == 'back') {
                    $rootScope.$state.transitionTo('policyDashboard');
                }
                else {
                    $scope.Policy.Insured.Name = data.Insured.Name;
                    $scope.Policy.Insured.DBA = data.Insured.DBA;
                    $scope.Policy.MailingAddress = data.MailingAddress;
                    $scope.Policy.MailingCity = data.MailingCity;
                    $scope.Policy.MailingState = data.MailingState;
                    $scope.Policy.MailingZip = data.MailingZip;
                    $scope.Policy.PhysicalAddress = data.PhysicalAddress;
                    $scope.Policy.PhysicalCity = data.PhysicalCity;
                    $scope.Policy.PhysicalState = data.PhysicalState;
                    $scope.Policy.PhysicalZip = data.PhysicalZip;
                    //$scope.Policy.AccountExec = data.AccountExec;
                    //$scope.Policy.DateQuoted = data.DateQuoted;
                    //$scope.Policy.Effective = data.Effective;
                    //$scope.Policy.Product = data.Product;
                    //$scope.Policy.SubmitGrpId = data.SubmitGrpId;

                }

            }
        });

        $scope.setExpiration = function () {
            var termLength = $scope.Policy.PolicyTerm;

            // Policy Term Logic with MEP
            if (termLength == 0 || termLength == 3) {
                $scope.Policy.MinimumEarnedPremium = '100%';
            }
            else if (termLength == 6) {
                $scope.Policy.MinimumEarnedPremium = '50%';
            }
            else if (termLength >= 12) {
                $scope.Policy.MinimumEarnedPremium = '25%';
            }

            if ($scope.Policy.Effective == undefined || $scope.Policy.Effective === "") return;

            $scope.ErrorList = [];
            var checkDate = new Date($scope.Policy.Effective).toString();
            if (checkDate === "Invalid Date") {
                $scope.Policy.Expiration = "";
                $scope.Policy.Effective = "";
                $scope.ErrorList.push("The effective date entered is not valid");
                return;
            }

            var today = new Date($scope.Policy.Effective);

            // check to make sure that user cant go past three days if not late binder
            if (!$scope.lateBinder) {
                var threeDaysPast = new Date();
                threeDaysPast.setHours(0, 0, 0, 0);
                threeDaysPast.setDate(threeDaysPast.getDate() - 3);

                // check to make sure user did not enter a date past three days in the past
                if (today.getTime() < threeDaysPast.getTime()) {
                    $scope.Policy.Expiration = "";
                    $scope.Policy.Effective = "";
                    $scope.ErrorList.push("The effective date cannot be more than three days in the past");
                    return;
                }
            }

            // make a date that is 6 months in the furture
            var sixMonths = new Date();
            sixMonths.setHours(0, 0, 0, 0);
            sixMonths.setMonth(sixMonths.getMonth() + 6);

            // if effective is greater than six months in the future show error
            if (today.getTime() > sixMonths.getTime()) {
                $scope.Policy.Expiration = "";
                $scope.Policy.Effective = "";
                $scope.ErrorList.push("The effective date cannot be more than six months in the future");
                return;
            }

            var expirationDate = new Date(today.setMonth(today.getMonth() + termLength));

            if (termLength != 0 || expirationDate <= today) {
                var dd = expirationDate.getDate();
                var mm = expirationDate.getMonth() + 1;
                var yyyy = expirationDate.getFullYear();

                $scope.Policy.Expiration = mm + '/' + dd + '/' + yyyy;
            }

            // In case it is short term just set the expiration to the next day
            if (termLength == 0) {
                var dd = expirationDate.getDate() + 1;
                var mm = expirationDate.getMonth() + 1;
                var yyyy = expirationDate.getFullYear();

                $scope.Policy.Expiration = mm + '/' + dd + '/' + yyyy;
            }
        }
    }

    $scope.canRate = function () {
        if ($scope.Policy.CurrentVersion.Locations == null) return false;
        if ($scope.Policy.CurrentVersion.Locations.length == 0) return false;

        for (var i = 0; i < $scope.Coverages.length; i++) {
            switch ($scope.Coverages[i]) {
                case "Property":
                    var properties = [];

                    for (var j = 0; j < $scope.Policy.CurrentVersion.Locations.length; j++) {
                        var location = $scope.Policy.CurrentVersion.Locations[j];
                        properties = properties.concat(location.Properties);
                    }

                    if (properties.length == 0) return false;
                    break;
                case "Liability":
                    if ($scope.Policy.CurrentVersion.ClassCodes.length == 0) return false;
                    break;
            }
        }

        return true;
    }

    $scope.checkForQuoteErrors = function () {
        var errorList = [];
        if ($scope.Policy.CurrentVersion.FocusedRiskCompanyId == null) {
            return errorList.push("No risk company has been selected");
        }
        var riskCompanyId = $scope.Policy.CurrentVersion.FocusedRiskCompanyId;

        if ($scope.Policy.ValidateQuoteByCompany.length > 0) {
            for (var i = 0; i < $scope.Policy.ValidateQuoteByCompany.length; i++) {
                if ($scope.Policy.ValidateQuoteByCompany[i].AppRiskCompanyId == riskCompanyId && $scope.Policy.ValidateQuoteByCompany[i].ValidationErrors.length > 0) {
                    for (var j = 0; j < $scope.Policy.ValidateQuoteByCompany[i].ValidationErrors.length; j++) {
                        errorList.push($scope.Policy.ValidateQuoteByCompany[i].ValidationErrors[j]);
                    }
                }
            }
        }
        return errorList;
    }

    $scope.showDocumentsDropdown = function () {
        return $scope.canDownloadRatesheet() ||
            $scope.canDownloadQuoteDoc() ||
            $scope.canDownloadAcordDoc() ||
            $scope.canDownloadSOV() ||
            $scope.canDownloadQuoteDocWithFinance() ||
            $scope.canDownloadBinder() ||
            $scope.canDownloadPolicy() ||
            $scope.canDownloadInvoice();
    };

    $scope.canDownloadRatesheet = function () {
        return !$scope.invalidRiskCompanySelected() && !$scope.Policy.CurrentVersion.RequiresFormUpdate && $scope.Policy.CurrentVersion.FocusedRiskCompanyId && $scope.checkForQuoteErrors().length == 0;
    };

    $scope.canDownloadSOV = function () {
      return $scope.Policy.Id != null;
    };

    $scope.questionsReviewed = function () {
        var version = $scope.Policy.CurrentVersion;
        if (version == null) return false;
        return version.QuestionReviewConfirmations.some(x => x.RiskCompanyId == version.FocusedRiskCompanyId) || version.UserConfirmsQuestionReview;
    }

    $scope.canDownloadQuoteDoc = function () {
        return ($scope.Policy.AgencyDetail != null && $scope.Policy.AgencyDetail.IsFinanceAgreementDisabled) &&
            !$scope.invalidRiskCompanySelected() &&
            !$scope.Policy.CurrentVersion.RequiresFormUpdate &&
            $scope.checkForQuoteErrors().length == 0 &&
            (($scope.Policy.Bound && $scope.canSeeBound()) || !$scope.Policy.Bound) &&
            (!$scope.SubmitRequired($scope.Policy.CurrentVersion.FocusedRiskCompanyId) ||
                $scope.SubmitApproved($scope.Policy.CurrentVersion.FocusedRiskCompanyId) ||
                $scope.submitReviewer) &&
            allQuestionsAnswered($scope.Policy.CurrentVersion.FocusedRiskCompanyId) && $scope.questionsReviewed();
    };

    $scope.canDownloadAcordDoc = function () {
      return $scope.Policy.Id != null && $scope.Policy.CurrentVersion.Locations != null && $scope.Policy.CurrentVersion.Locations.length != 0;
    };

    $scope.canDownloadQuoteDocWithFinance = function () {
        return !$scope.invalidRiskCompanySelected() && !$scope.Policy.CurrentVersion.RequiresFormUpdate && $scope.checkForQuoteErrors().length == 0 && ((($scope.Policy.Bound && $scope.canSeeBound()) || !$scope.Policy.Bound) && (!$scope.SubmitRequired($scope.Policy.CurrentVersion.FocusedRiskCompanyId) || $scope.SubmitApproved($scope.Policy.CurrentVersion.FocusedRiskCompanyId) || $scope.submitReviewer)) &&
            allQuestionsAnswered($scope.Policy.CurrentVersion.FocusedRiskCompanyId) && $scope.questionsReviewed();
    };

    $scope.canDownloadBinder = function () {
        return !$scope.invalidRiskCompanySelected() && !$scope.Policy.CurrentVersion.RequiresFormUpdate && $scope.checkForQuoteErrors().length == 0 && $scope.Policy.Bound && $scope.canSeeBound();
    };

    $scope.canDownloadPolicy = function () {
        return !$scope.invalidRiskCompanySelected() && !$scope.Policy.CurrentVersion.RequiresFormUpdate && $scope.checkForQuoteErrors().length == 0 && $scope.Policy.Issued;
    };

    $scope.canDownloadInvoice = function () {
        if ($scope.invalidRiskCompanySelected() || $scope.Policy.CurrentVersion.RequiresFormUpdate || $scope.checkForQuoteErrors().length != 0) {
            return false;
        }

        if ($scope.Policy.Issued) {
            if ($scope.Policy.Endorsement != null) {
                var endorsement = $scope.Policy.Endorsement;
                var premium = endorsement.Premium;
                if (premium == null) premium = endorsement.DevelopedPremium;
                if (premium == 0) return false;
            }
            return true;
        }
        return false;
    };

    $scope.isWindOnlyQuote = function () {
        var version = $scope.Policy.CurrentVersion;
        if (version != null) {
            var riskCompanyId = version.RiskCompanyId != null ? version.RiskCompanyId : version.FocusedRiskCompanyId;
            if (riskCompanyId != null) {
                var isSafety = riskCompanyId == "f20153c2-7b31-42f0-b3cb-26c6bc82eaf0";
                if (isSafety) {
                    for (var i = 0; i < version.Locations.length; i++) {
                        var hasWindOnlyProperties = version.Locations[i].Properties.some(function (x) { return x.IsWindOnly; });
                        if (hasWindOnlyProperties) return true;
                    }
                }
            }
        }
        return false;
    }

    $scope.downloadInvoice = function (riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.documentServiceBase + 'api/document/DownloadInvoice', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var contentType = xhr.getResponseHeader('Content-Type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    var response = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(this.response)));
                    notificationsHub.showError({
                        title: 'Download Invoice',
                        body: response.Errors.join(' '),
                        timeout: 25000,
                        clickHandler: function (toaster, isCloseButton) { return isCloseButton; },
                        showCloseButton: true
                    });
                    $scope.$apply();
                    return;
                }
                var filename = "Invoice.pdf";
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
        xhr.send(JSON.stringify({ PolicyId: $scope.Policy.Id }));
    }


    $scope.downloadRateSheet = function (riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.documentServiceBase + 'api/document/DownloadRateSheet', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "RateSheet.pdf";
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
        xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId, RiskCompanyId: riskCompanyId }));
    }

    $scope.downloadSOV = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.documentServiceBase + 'api/document/DownloadSOV', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = $scope.Policy.Number + ".xlsx";
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

    $scope.downloadQuoteDocument = function (riskCompanyId, downloadFinance) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.documentServiceBase + 'api/document/DownloadQuoteDocument', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "QuoteDocument.pdf";
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
        xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId, RiskCompanyId: riskCompanyId, DownloadFinance: downloadFinance }));
    }

    // Download Acord Document //
    $scope.downloadAcordDocument = function (riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });

        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.documentServiceBase + "api/document/DownloadAcordDocument", true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "AcordDocument.pdf";
                var disposition = xhr.getResponseHeader('Content-Disposition');

                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }

                var type = xhr.getResponseHeader('Content-Type');
                var blob = new Blob([this.response], { type: type });
                if (typeof (window.navigator.msSaveBlob) !== 'undefined') {
                    // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. 
                    // These URLs will no longer resolve as the data backing the URL has been freed."
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
        xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId, RiskCompanyId: riskCompanyId }));
    }

    $scope.downloadBinderDocument = function (riskCompanyId) {

        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.documentServiceBase + 'api/document/DownloadBinderDocument');
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "PolicyBinder.pdf";
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
        xhr.send(JSON.stringify({ PolicyId: $scope.Policy.OriginalPolicyId, RiskCompanyId: riskCompanyId }));
    }

    $scope.downloadPolicy = function (riskCompanyId) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.documentServiceBase + 'api/document/DownloadPolicy', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var contentType = xhr.getResponseHeader('Content-Type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    var response = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(this.response)));
                    notificationsHub.showError({
                        title: 'Download Policy',
                        body: response.Errors.join(' '),
                        timeout: 25000,
                        clickHandler: function (toaster, isCloseButton) { return isCloseButton; },
                        showCloseButton: true
                    });
                    $scope.$apply();
                    return;
                }
                var filename = "Policy.pdf";
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
        xhr.send(JSON.stringify({ PolicyId: $scope.Policy.OriginalPolicyId, RiskCompanyId: riskCompanyId }));
    }

    $scope.emailQuoteDocument = function (riskCompanyId, includeFinance) {
        policyService.emailQuoteDocToAgent($scope.PolicyId, riskCompanyId, includeFinance).then(
            function (result) {
                if (!result.data.Result.Success) {
                    $scope.Errors = result.data.Result.Errors;
                }
            },
            function (error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page'];
            }
        );
    }

    $scope.emailDocument = function (riskCompanyId, documentTypes, downloadFinance = false) {
        var modalInstance = $modal.open({
            templateUrl: 'commercial_emailDocument.html',
            controller: 'test_Commercial_Lines_emailDocumentCtrl',
            windowClass: 'email-modal',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                riskCompanyId: function () { return riskCompanyId; },
                documentTypes: function () { return documentTypes; },
                downloadFinance: function () { return downloadFinance; },
                policyId: function () { return $scope.PolicyId; },
                policy: function () { return $scope.Policy; },
                username: function () { return authService.authentication.userName; }
            }
        });
        modalInstance.result.then(function (data) {
            if (data !== 'cancel') {

            }
        });
    }

    $scope.getAppContracts = function () {
        policyService.getAppContracts($scope.AppId, ($scope.Policy != null ? $scope.Policy.Effective : $scope.getTodaysDate()), $scope.Policy.CurrentVersion.Coverages, ($scope.Policy != null ? $scope.Policy.Attributes.map(x => x.Name) : []), $scope.Policy.HomeStateCode).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Contracts = result.data.Contracts;
            } else {
                $scope.Contracts = [];
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Contracts = [];
            $scope.Errors = ['An unexpected error has occured. Please refresh the page'];
        });


        policyService.getRiskCompanies($scope.Policy).then(function (result) {
            if (result.data.Result.Success) {
                $scope.RiskCompanies = result.data.RiskCompanies;

                if ($scope.RiskCompanies.length == 0 && !$scope.showAimSubmissionModal) {
                    alert('Unexpected error: No contracts attached to this app. Please contact support.');
                    $rootScope.$state.transitionTo('policyDashboard');
                    return;
                }

                if ($scope.RiskCompanies.length == 1 || $scope.RiskCompanyId == null) $scope.RiskCompanyId = $scope.RiskCompanies[0].Id;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

    }

    $scope.getAllClassCodesForApp = function () {
        policyService.getAllClassCodesForApp($scope.PolicyId).then(function (result) {
            if (result.data.Result.Success) {
                $scope.AllClassCodes = result.data.ClassCodes;
            } else {
                $scope.AllClassCodes = [];
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.AllClassCodes = [];
            $scope.Errors = ['An unexpected error has occured. Please refresh the page'];
        });
    }

    $scope.getTodaysDate = function () {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        return mm + '/' + dd + '/' + yyyy;
    }

    $scope.CanBindSubmitQuote = function (riskCompanyId) {
        if (!riskCompanyId)
            return false;

        if ($scope.SubmitRequired(riskCompanyId) && !$scope.SubmitApproved(riskCompanyId))
            return false;
        return true;
    };

    $scope.SubmitApproved = function (riskCompanyId) {
        if (riskCompanyId == null || $scope.Policy == null)
            return false;

        var foundInSubmits = $scope.Policy.Submits != null &&
            $scope.Policy.Submits.length > 0 &&
            $.grep($scope.Policy.Submits,
                function (x) {
                    return x.RiskCompanyId == riskCompanyId &&
                        x.VersionNumber == $scope.Policy.VersionNumber &&
                        x.Approved;
                }).length > 0;

        var foundInWebServiceApprovedSubmits = $scope.Policy.WebServiceApprovedSubmits != null &&
            $scope.Policy.WebServiceApprovedSubmits.length > 0 &&
            $.grep($scope.Policy.WebServiceApprovedSubmits,
                function (x) {
                    return x.RiskCompanyId == riskCompanyId;
                }).length > 0;

        return foundInSubmits || foundInWebServiceApprovedSubmits;
    }

    $scope.SubmitRequested = function (riskCompanyId) {
        if (riskCompanyId != null && $scope.Policy != null && $scope.Policy.Submits != null && $scope.Policy.Submits.length > 0) {
            var dateLastRequested = $.grep($scope.Policy.Submits, function (x) {
                return x.RiskCompanyId == riskCompanyId && x.VersionNumber == $scope.Policy.VersionNumber && x.DateLastRequested != null;
            });
            return (dateLastRequested.length > 0);
        }
        else if ($scope.Policy.WebServiceSubmitted != null && $scope.Policy.WebServiceSubmitted.length > 0) {
            return $.grep($scope.Policy.WebServiceSubmitted, function (x) {
                return x.RiskCompanyId == riskCompanyId;
            }).length > 0;
        }
        return false;
    }

    $scope.HasSubmitRequest = function (riskCompanyId) {
        if (riskCompanyId != null && $scope.Policy != null) {
            if ($scope.Policy.Submits != null && $scope.Policy.Submits.length > 0) {
                var hasSubmitRequest = $scope.Policy.Submits.some(x => x.RiskCompanyId == riskCompanyId && x.VersionNumber == $scope.Policy.VersionNumber &&
                    x.DateLastRequested != null && x.DateLastApproved == null && x.DateLastDenied == null);
                return hasSubmitRequest;
            }
            else if ($scope.Policy.WebServiceSubmitted != null && $scope.Policy.WebServiceSubmitted.length > 0) {
                return $scope.Policy.WebServiceSubmitted.some(x => x.RiskCompanyId == riskCompanyId)
            }
        }
        return false;
    }

    $scope.SubmitForBind = function (riskCompanyId) {
        if (riskCompanyId != null && $scope.Policy != null && $scope.Policy.Submits != null) {
            return $.grep($scope.Policy.Submits, function (x) {
                return x.RiskCompanyId == riskCompanyId && x.VersionNumber == $scope.Policy.VersionNumber && x.DateBindRequest != null;;
            }).length > 0;
        }
        return false;
    }

    $scope.PolicyInWorkflow = function () {
        if ($scope.Policy.Attributes)
            return $scope.Policy.Attributes.some(x => x.Name == 'Workflow Bind Task Submitted');
        return false;
    };

    $scope.IsCommercialPortalQuote = function () {
        if ($scope.Policy.Attributes)
            return $scope.Policy.Attributes.some(x => x.Name == 'Commercial Portal Quote') && !$scope.Policy.Attributes.some(x => x.Name == 'AGP Enabled All Carriers');
        return false;
    };

    $scope.IsRequestedToBind = function () {
        var attributes = $scope.Policy.Attributes;
        return attributes != null && $scope.IsCommercialPortalQuote() && attributes.some(x => x.Name == "Agent Requested To Bind");
    }

    $scope.IsRequestedToBindDeclined = function () {
        var attributes = $scope.Policy.Attributes;
        return attributes != null && $scope.IsCommercialPortalQuote() && attributes.some(x => x.Name == "Agent Requested To Bind Declined");
    }

    $scope.PolicyInElany = function () {
        if ($scope.Policy.Attributes)
            return $scope.Policy.Attributes.some(x => x.Name == 'Elany Request Submitted');
        return false;
    };

    $scope.DateBindRequest = function (riskCompanyId) {
        if (riskCompanyId != null && $scope.Policy != null && $scope.Policy.Submits != null) {
            var dateBindRequest = $.grep($scope.Policy.Submits, function (x) {
                return x.RiskCompanyId == riskCompanyId && x.VersionNumber == $scope.Policy.VersionNumber && x.DateBindRequest != null;;
            });

            if (dateBindRequest.length > 0) {
                return dateBindRequest[0];
            }
        }
        return null;
    }

    $scope.SubmitRequired = function (riskCompanyId) {
        if (riskCompanyId != null && $scope.Policy != null && $scope.Policy.CurrentVersion != null) {
            for (var i = 0; i < $scope.Policy.CurrentVersion.ContractSubmits.length; i++) {
                var submit = $scope.Policy.CurrentVersion.ContractSubmits[i];
                if (submit.RiskCompanyId == riskCompanyId) {
                    return true;
                }
            }
        }
        return false;
    }

    $scope.displayFullName = function (name) {
        var html = '<label style="margin-top: 10px; margin-bottom: 10px;">';
        html += name;
        html += '</label>';
        return $sce.trustAsHtml(html);
    };

    $scope.getClassCodesCount = function () {
        var liabilityCoverage = $.grep($scope.Coverages, function (x) { return x == "Liability" }).length;
        if (liabilityCoverage > 0) {
            var count = $scope.Policy.CurrentVersion.ClassCodes.length;
            return count;
        }
        else
            return 1;
    }

    $scope.getPropertiesCount = function () {
        var propertyCoverage = $.grep($scope.Coverages, function (x) { return x == "Property" }).length;
        if (propertyCoverage > 0) {
            var count = 0;
            for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                count += $scope.Policy.CurrentVersion.Locations[i].Properties.length;
            }
            return count;
        }
        else
            return 1;
    }

    $scope.getAssignedContracts = function (riskCompanyId) {
        var contracts = [];

        var version = $scope.Policy.CurrentVersion;
        version.Locations.forEach(function (location) {
            location.Properties.forEach(function (property) {
                property.AssignedContracts.forEach(function (contract) {
                    if (contract.RiskCompanyId == riskCompanyId && contract.Final) {
                        contracts.push(contract.ContractId);
                    }
                });
            });
        });

        // Return distinct contract IDs
        return contracts.filter(function (x, i) { return contracts.indexOf(x) === i });
    }

    function getFormattedRatingQuestions() {
        var ratingQuestions = [];
        var version = $scope.Policy.CurrentVersion;

        for (var i = 0; i < version.Locations.length; i++) {
            var location = version.Locations[i];
            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];
                for (var k = 0; k < property.AssignedContracts.length; k++) {
                    var contract = property.AssignedContracts[k];
                    for (var q = 0; q < contract.Questions.length; q++) {
                        var question = contract.Questions[q];
                        var existingQuestion = ratingQuestions.find(function (x) { return x.Question == question.Question });

                        if (existingQuestion == null) {
                            ratingQuestions.push({
                                Question: question.Question,
                                Answer: question.UserAnswer != null ? question.UserAnswer : question.Answer,
                                AppliesTo: [question],
                                RiskCompanies: [contract.RiskCompanyId]
                            });
                        } else {
                            existingQuestion.AppliesTo.push(question);

                            var riskCompany = existingQuestion.RiskCompanies.find(function (x) { return x == contract.RiskCompanyId });
                            if (riskCompany != null) existingQuestion.RiskCompanies.push(contract.RiskCompanyId);
                        }
                    }
                }
            }
        }

        return ratingQuestions;
    }

    function allQuestionsAnswered(riskCompanyId) {
        if (customPackageService.isCustomPackage(riskCompanyId))
            return customPackageService.allEligibilityQuestionsAnswered($scope.Policy, riskCompanyId);

        var version = $scope.Policy.CurrentVersion;
        var isRli = riskCompanyId == "b216d262-52f0-4864-aec9-3411acf7c218";

        // Get eligibility questions.
        var questions = version.Questions.filter(function (x) { return x.RiskCompanyId == riskCompanyId });

        // Get rating questions.
        questions = questions.concat(getFormattedRatingQuestions().filter(function (x) { return x.RiskCompanyId == riskCompanyId }));

        // Check if every questions has an answer.
        return questions.every(function (x) {
            var answer = isRli && !$scope.Policy.Bound && !$scope.Policy.IsEndorsement ? x.SelectedAnswer : x.Answer;
            return answer != null && answer.length > 0;
        });
    }

    $scope.invalidRiskCompanySelected = function (checkQuestions) {
        // Don't check for questions by default.
        if (checkQuestions == null)
            checkQuestions = false;

        var version = $scope.Policy.CurrentVersion;
        if (version == null || jQuery.isEmptyObject(version)) return true;
        var riskCompanyId = version.FocusedRiskCompanyId;
        var questionsReviewed = version.QuestionReviewConfirmations.some(x => x.RiskCompanyId == riskCompanyId) || version.UserConfirmsQuestionReview;

        // Backwards compatibility to allow access past the Rate tab.
        if (questionsReviewed == null)
            return riskCompanyId == null || $scope.isRiskCompanyDeclined(riskCompanyId);

        return riskCompanyId == null || $scope.isRiskCompanyDeclined(riskCompanyId) || checkQuestions && !(allQuestionsAnswered(riskCompanyId) && questionsReviewed);
    }

    $scope.isRiskCompanyDeclined = function (riskCompanyId) {
        if (customPackageService.isCustomPackage(riskCompanyId))
            return customPackageService.isDeclined($scope.Policy, riskCompanyId);

        if (riskCompanyId == null || $scope.Policy == null || $scope.Policy.CurrentVersion == null) return true;
        if (!$scope.Policy.CurrentVersion.Premiums) return true;
        var premiums = $.grep($scope.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompanyId; });
        if (premiums.length == 0) return true;
        if (premiums[0].Premium == 0) return true;
        if (premiums[0].Breakdown.length == 0) return true;
        var riskCompany = $.grep($scope.RiskCompanies, function (x) { return x.Id == riskCompanyId })[0];
	
		// If Policy is not null and FocusRiskCompany is IFG
		if ($scope.Policy != null && $scope.Policy.CurrentVersion.FocusedRiskCompanyId == '5328469D-F3FE-4D09-9294-7898FEA47ADC') {
			$scope.EligibilityQuestions = $scope.Policy.CurrentVersion.Questions;

			var riskCompanyEligibilityQuestions = $scope.getEligibilityQuestions(riskCompanyId);

			if (riskCompanyEligibilityQuestions.length == 0) return true;
		}
    
        for (var c = 0; c < $scope.Policy.CurrentVersion.Coverages.length; c++) {
            var coverage = $scope.Policy.CurrentVersion.Coverages[c];

            if (coverage.Name == "Equipment Breakdown") {
                var coveragesGrep = $.grep(riskCompany.Coverages, function (x) { return x == coverage.Name });
                if (coveragesGrep.length > 0) {
                    var coverage = $scope.Policy.CurrentVersion.EquipmentBreakdownCoverages.find(function (x) { return x.RiskCompanyId == riskCompany.Id && x.ContractId });
                    if (coverage) {
                        var declines = $scope.Policy.CurrentVersion.ContractDeclines.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == "Equipment Breakdown" && x.ContractId == coverage.ContractId; });
                        if (declines.length > 0)
                            return true;
                    }
                    else {
                        var declines = $scope.Policy.CurrentVersion.ContractDeclines.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == "Equipment Breakdown"; });
                        if (declines.length > 0)
                            return true;
                    }
                    continue;
                }
                else {
                    return true;
                }
            }

            // TODO: Hardcode that does not decline other risk companies because of inland marine
            if (coverage.Name == "Inland Marine" && riskCompanyId.toUpperCase() == "6D719A07-B422-4C38-9A7C-E9DF837F3010") {
                var contractDeclinesGrep = $.grep($scope.Policy.CurrentVersion.ContractDeclines, function (x) { return x.RiskCompanyId == riskCompanyId && x.Group == "Inland Marine" });
                if (contractDeclinesGrep.length > 0)
                    return true;
            }
            else if (coverage.Name == "Inland Marine" && riskCompanyId.toUpperCase() != "6D719A07-B422-4C38-9A7C-E9DF837F3010")
                continue;

            var coverageBreakdown = $.grep(premiums[0].Breakdown, function (x) { return x.Coverage == coverage.Name; });

            if (coverageBreakdown.length == 0) return true;

            for (var i = 0; i < premiums[0].Breakdown.length; i++) {
                var breakdown = premiums[0].Breakdown[i];

                if (breakdown.Coverage != 'Tax' && breakdown.Coverage != 'Fee')
                    if (breakdown.DevelopedAmount == 0 || breakdown.Amount <= 0)
                        return true;
            }

            if (coverage.Name == "Property") {
                var version = $scope.Policy.CurrentVersion;
                var declines = version.ContractDeclines.filter(function (x) { return x.RiskCompanyId == riskCompanyId && x.CoverageName == coverage.Name; });
                var overrides = version.ContractDeclineOverrides.filter(function (x) { return x.RiskCompanyId == riskCompanyId && x.CoverageName == coverage.Name; });
                var declineWithOverrides = declines.filter(function (x) {
                    return overrides.some(function (y) {
                        return x.ContractId == y.ContractId && x.Reason == y.Reason;
                    });
                });

                if (declineWithOverrides.length < declines.length) {
                    var assignedContracts = $scope.getAssignedContracts(riskCompany.Id);
                    if (assignedContracts.length == 0)
                        return true;
                }
            }

            if (coverage.Name == "Liability") {
                var contracts = $.grep($scope.Policy.CurrentVersion.Liability.RiskCompanyContracts, function (x) { return x.RiskCompanyId == riskCompanyId });
                if (contracts.length == 0) return true;
                var contractId = contracts[0].ContractId;

                var contractDeclinesGrep = $.grep($scope.Policy.CurrentVersion.ContractDeclines, function (x) { return x.ContractId == contractId && x.CoverageId == coverage.CoverageId });
                if (contractDeclinesGrep.length > 0) {
                    return true;
                }

                var version = $scope.Policy.CurrentVersion;

                for (var j = 0; j < $scope.Policy.CurrentVersion.ClassCodes.length; j++) {
                    var hasRateInfo = version.ClassCodes[j].ClassCodeRateInfo.find(x => x.ContractId == contractId) != null;
                    if (!hasRateInfo) continue;

                    if ($scope.Policy.CurrentVersion.ClassCodes[j].ClassCodeRatingResults.length != 0 && $scope.Policy.CurrentVersion.ClassCodes[j].ClassCodeRatingInputs.length != 0) {
                        var classCodesFound = $.grep($scope.Policy.CurrentVersion.ClassCodes[j].ClassCodeRatingResults, function (x) { return x.ContractId == contractId }).length;
                        var classcodeInput = $.grep($scope.Policy.CurrentVersion.ClassCodes[j].ClassCodeRatingInputs, function (x) { return x.ContractId == contractId })[0];
                        if (classcodeInput == null) return true;
                        if (classCodesFound == 0 && classcodeInput.RateBy != "If Any" && !classcodeInput.IsIgnored) return true;
                    }
                }
            }
        }

        return false;
    }

    $scope.getEligibilityQuestions = function (riskCompanyId) {
        return $scope.EligibilityQuestions.filter(function (x) {
        return x.RiskCompanyId == riskCompanyId;
        });
    }

    $scope.getQuestionCount = function (riskCompanyId) {
        var eligibilityQuestions = $scope.getEligibilityQuestions(riskCompanyId);
        var ratingQuestions = $scope.getRatingQuestions(riskCompanyId);
        return eligibilityQuestions.length + ratingQuestions.length;
    }

    $scope.isCustomPackage = function () {
        var riskCompanyId = $scope.Policy.CurrentVersion.FocusedRiskCompanyId;

        if (riskCompanyId == 'f1a73156-b097-474d-9949-fd1933e806ee') return true;
        return false;
    }

    $scope.canModify = function () {
        if ($scope.Policy == null) return true;

        //if ($scope.Policy.Attributes != null && $scope.Policy.Attributes.some(x => x.Name == "Carrier Web Service Issued"))
        //  return false;
        if ($scope.Policy.Bound && $scope.Policy.CurrentVersion.RiskCompanyId == "5328469d-f3fe-4d09-9294-7898fea47adc") {
            return false;
        }

        if ($scope.Policy.Issued || ($scope.SubmitForBind() && $scope.submitReviewer == false)) {
            return false;
        }

        if ($scope.PolicyInWorkflow()) {
            return false;
        }

        if ($scope.Policy.CurrentVersion.Number > 0 && $scope.Policy.EndorsementNumber == null) {
            return false;
        }

        return true;
    }

    $scope.changeVersion = function (versionNumber) {
        policyService.changePolicyVersion($scope.PolicyId, versionNumber).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Policy = result.data.Policy;
                $scope.Policy.CurrentVersion = $scope.Policy.Versions[0];
                $scope.RiskCompanyId = $scope.Policy.CurrentVersion.RiskCompanyId;

                if ($scope.Policy.RenewalOf === '')
                    $scope.Policy.RenewalOf = null;
            } else {
                $scope.ErrorList = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.copyPolicy = function () {
        if ($scope.Policy != null) {
            // Get coverage from existing coverage.
            var hasPropertyCoverage = $scope.Policy.CurrentVersion.Coverages.some(x => x.Name == "Property");
            var hasLiabilityCoverage = $scope.Policy.CurrentVersion.Coverages.some(x => x.Name == "Liability");

            var selectedCoverages = [];
            if (hasPropertyCoverage) selectedCoverages.push("Property");
            if (hasLiabilityCoverage) selectedCoverages.push("Liability");

            // Open the policy coverage dialog.
            var modalInstance = $modal.open({
                templateUrl: 'test_Commercial_showPolicyCoverages.html',
                controller: 'test_Commercial_Lines_showPolicyCoveragesCtrl',
                size: 'md',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    coverages: () => ['Property', 'Liability'],
                    selectedCoverages: () => selectedCoverages,
                    isCommercialPortalQuote: () => $scope.IsCommercialPortalQuote(),
                    appId: () => $scope.Policy.AppId
                }
            });

            // Upon closing the modal, create a copy of the submission and redirect the page.
            modalInstance.result.then((data) => {
                if (data != "cancel") {
                    var policy = $scope.Policy;
                    policyService.copyPolicy(policy.Id, data.Coverages, data.SubmissionNumber, data.Data).then((result) => {
                        $rootScope.$state.transitionTo("policy", {
                            appId: policy.AppId,
                            policyId: result.data.PolicyId
                        });
                    }, (error) => {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }
            });
        }
    }

    function getUploadedDocuments() {
        $scope.UploadedDocuments = [];

        var policyId = $scope.PolicyId;

        policyService.getUploadedDocuments(policyId).then(function (result) {
            if (result.data.Result.Success) {
                $scope.UploadedDocuments = result.data.UploadedDocuments;

                // Convert Base64 string to an array for each document.
                for (var i = 0; i < $scope.UploadedDocuments.length; i++) {
                    var doc = $scope.UploadedDocuments[i];
                    var byteArray = base64ToArray(doc.Data);

                    doc.Data = byteArray;
                }
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            console.log(error);
            $scope.Errors = ["An unexpected error has occured. Please refresh the page."];
        });
    }

    function base64ToArray(str) {
        var decoded = window.atob(str);
        var byteArray = new Array(decoded.length);

        for (var i = 0; i < decoded.length; i++)
            byteArray[i] = decoded.charCodeAt(i);

        return byteArray;
    }

    function getElanyCoverageInfo() {
        policyService.getElanyCoverageInfo().then(function (result) {
            if (result.data.Result.Success) {
                $scope.ElanyCoverage.Coverages = result.data.Coverages;
                $scope.ElanyCoverage.Risks = result.data.Risks;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            console.log(error);
            // $scope.Errors = ["An unexpected error has occured. Please refresh the page."];
        });

    }

    function getDefaultElanyCoverageRiskCodes() {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        policyService.getElanyRiskAndCoverageCodes($scope.PolicyId).then(function (result) {
            Metronic.unblockUI();
            if (result.data.Result.Success) {
                if (!result.data.RiskCodes[0] && !result.data.CoverageCodes[0]) {
                    $scope.DefaultElanyRisk = "";
                    $scope.DefaultElanyCoverage = "";
                    $scope.DefaultElanyCoverage2 = "";
                    $scope.DefaultElanyRisk2 = "";
                }
                else if (!result.data.RiskCodes[0] && result.data.CoverageCodes[0]) {
                    $scope.DefaultElanyRisk = "";
                    $scope.DefaultElanyCoverage = result.data.CoverageCodes[0];
                    $scope.DefaultElanyCoverage2 = "";
                    $scope.DefaultElanyRisk2 = "";
                }
                else if (result.data.RiskCodes[0] && !result.data.CoverageCodes[0]) {
                    $scope.DefaultElanyRisk = result.data.RiskCodes[0];
                    $scope.DefaultElanyCoverage = "";
                    $scope.DefaultElanyCoverage2 = "";
                    $scope.DefaultElanyRisk2 = "";
                }
                else {
                    $scope.DefaultElanyCoverage = result.data.CoverageCodes[0];
                    $scope.DefaultElanyCoverage2 = result.data.CoverageCodes[1];
                    $scope.DefaultElanyRisk = result.data.RiskCodes[0];
                    $scope.DefaultElanyRisk2 = result.data.RiskCodes[1];
                }

                $scope.Policy.CoverageCode = $scope.DefaultElanyCoverage;
                $scope.Policy.RiskCode = $scope.DefaultElanyRisk;
                $scope.Policy.CoverageCode2 = $scope.DefaultElanyCoverage2;
                $scope.Policy.RiskCode2 = $scope.DefaultElanyRisk2;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            console.log(error);
            $scope.Errors = ["An unexpected error has occured. Please refresh the page."];
        });
    };

    $scope.getDefaultElanyCoverageRiskCodes = getDefaultElanyCoverageRiskCodes;
    $scope.getElanyCoverageInfo = getElanyCoverageInfo;
}]);

MALACHIAPP.controller('test_Commercial_Lines_policyNoteCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policyId', 'policyNotes', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policyId, policyNotes) {
    $scope.PolicyId = policyId;
    $scope.PolicyNotes = policyNotes;
    if ($scope.PolicyNotes === undefined) $scope.PolicyNotes = [];
    $scope.ErrorList = [];


    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {
        validateInputs();
        if ($scope.ErrorList.length > 0) return;


        policyService.addPolicyNote($scope.PolicyId, $scope.noteToAdd).then(function (result) {
            if (result.data.Result.Success) {
                $scope.PolicyNotes.push(result.data.PolicyNote);
                $scope.noteToAdd = '';
            }
        });
    }

    function validateInputs() {
        $scope.ErrorList = [];
        if ($scope.noteToAdd == '' || $scope.noteToAdd == undefined) {
            $scope.ErrorList.push('Note cannot be blank.');
        }
    }

}]);

MALACHIAPP.controller('test_Commercial_Lines_policyClaimsCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'claims', 'claimsService', 'unableToGetClaims', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, claims, claimsService, unableToGetClaims) {
    $scope.claims = claims;
    $scope.unableToGetClaims = unableToGetClaims;
    $scope.ErrorList = [];

    // JACK'S
    $scope.close = function (data) {
        if (data !== 'cancel') {
            $modalInstance.close(data);
        } else {
            $modalInstance.dismiss('cancel');
        }
    }

    // Returns Status color, depends on the status code
    $scope.getStatusColor = claimsService.getStatusColor;

    // Returns status name, depends on the status code
    $scope.getStatus = claimsService.getStatus;
    // END OF JACK'S

}]);

MALACHIAPP.controller('test_Commercial_Lines_showPolicyCoveragesCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'test_policyService', 'settings', 'coverages', 'selectedCoverages', 'isCommercialPortalQuote', 'appId', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, test_policyService, settings, coverages, selectedCoverages, isCommercialPortalQuote, appId) {

    $scope.Coverages = coverages;
    $scope.SelectedCoverages = [];
    $scope.IsCommercialPortalQuote = false;

    $scope.submission = { Number: '', Confirmed: false, noExistingSubmission: false };
    $scope.AppId = appId;

    if (selectedCoverages != null) $scope.SelectedCoverages = selectedCoverages;
    if (isCommercialPortalQuote != null) $scope.IsCommercialPortalQuote = isCommercialPortalQuote;

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.getSubmissions = function () {
        if ($scope.searchTerm != null && $scope.searchTerm.length > 0) $scope.searched = true;
        $scope.ErrorList = [];
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        test_policyService.getSubmissions($scope.searchTerm).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                $scope.submissions = result.data.Submissions;
                if ($scope.submissions.length == 0) {
                    $scope.ErrorList = ['No results found.'];
                }
            }
            else {
                $scope.ErrorList = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.CheckPhysicalAddress = function (data) {
        if (data.PhysicalAddress == null && data.PhysicalCity == null && data.PhysicalState == null && data.PhysicalZip == null)
            return "No Physical Address";
        else if (data.PhysicalAddress != null && data.PhysicalCity != null && data.PhysicalState != null && data.PhysicalZip != null)
            return data.PhysicalAddress + ", " + data.PhysicalCity + ", " + data.PhysicalState + ", " + data.PhysicalZip;
    }

    $scope.CheckMailingAddress = function (data) {
        if (data.MailingAddress == null && data.MailingCity == null && data.MailingState == null && data.MailingZip == null)
            return "No Mailing Address";
        else if (data.MailingAddress != null && data.MailingCity != null && data.MailingState != null && data.MailingZip != null)
            return data.MailingAddress + ", " + data.MailingCity + ", " + data.MailingState + ", " + data.MailingZip;
    }

    $scope.CheckProduct = function (data) {
        if (data == null)
            return "No Coverage";
        else if (data == "Property W-Wind - Commercial")
            return "Prop. W-Wind Cml";
        else if (data == "Package W-Wind - Commercial")
            return "Pkg W-Wind Cml";
        else if (data == "Property X-Wind - Commercial")
            return "Prop. X-Wind Cml";
        else if (data == "General Liability - Commercial")
            return "Gen Liab Cml";
        else if (data == "Package X - Wind - Commercial")
            return "Pkg X-Wind Cml";
        else if (data == "Homeowners Admitted Brokered")
            return "Hmeowrs Adm. Brkg";
        else if (data == "Owners' & Contractors' Protective Liability")
            return "Ownrs' & Ctrct.' Pro. Liab";
        else if (data == "Package X-Wind - Commercial")
            return "Pkg X-Wind Cml";
        else
            return data;
    }

    $scope.CheckStatus = function (data) {
        if (data == null)
            return "Unavailable";
        else
            return data;
    }

    $scope.goBack = function () {
        $modalInstance.close();
        $rootScope.$state.transitionTo('policyDashboard');
    }

    $scope.newInsured = function () {
        if ($scope.searchTerm != null && $scope.searchTerm.length > 0) {
            $scope.Policy = {};
            $scope.Policy.Insured = {};
            $scope.Policy.Insured.Name = $scope.searchTerm;
        }
        $modalInstance.close($scope.Policy);
    }

    $scope.newSubmit = function () {
        if ($scope.selectedSubmission != null) {

            $scope.Policy = {};
            $scope.Policy.Insured = {};
            $scope.Policy.Insured.Name = $scope.selectedSubmission.Name;
            $scope.Policy.MGASubmissionNumber = $scope.selectedSubmission.SubmissionNumber;
            $scope.Policy.AccountExec = $scope.selectedSubmission.AccountExec;
            $scope.Policy.Insured.DBA = $scope.selectedSubmission.DBA;
            $scope.Policy.DateQuoted = $scope.selectedSubmission.DateQuoted;
            $scope.Policy.Effective = $scope.selectedSubmission.Effective;
            $scope.Policy.MailingAddress = $scope.selectedSubmission.MailingAddress;
            $scope.Policy.MailingCity = $scope.selectedSubmission.MailingCity;
            $scope.Policy.MailingState = $scope.selectedSubmission.MailingState;
            $scope.Policy.MailingZip = $scope.selectedSubmission.MailingZip;
            $scope.Policy.Product = $scope.selectedSubmission.Product;
            $scope.Policy.SubmitGrpId = $scope.selectedSubmission.SubmitGrpId;

            $modalInstance.close($scope.Policy);
        } else {
            $scope.ErrorList = ['Please select a submission.'];
        }
    }

    $scope.submissionClicked = function (submission) {
        if ($scope.selectedSubmission != null) $scope.selectedSubmission.isSelected = false;
        $scope.selectedSubmission = submission;
        $scope.selectedSubmission.isSelected = true;
    }

    $scope.save = function () {
        $scope.Errors = [];
        if ($scope.SelectedCoverages.length > 0) {
            if ($scope.SubmissionNumber != null && $scope.SubmissionNumber != '') {
                if ($scope.submission.Confirmed) {
                    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
                    test_policyService.importFromAIM($scope.SubmissionNumber, $scope.AppId).then(function (result) {
                        Metronic.unblockUI('.modal-dialog');
                        if (result.data.Success) {
                            $modalInstance.close({
                                Coverages: $scope.SelectedCoverages,
                                Data: result.data,
                                SubmissionNumber: $scope.SubmissionNumber
                            });
                        }
                        else {
                            $scope.ErrorList = result.data.Errors;
                        }
                    }, function (error) {
                        Metronic.unblockUI('.modal-dialog');
                        $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
                    });
                } else {
                    $scope.Errors = ['Please search and confirm the submission is correct and is not already bound.'];
                }
            } else {
                $modalInstance.close({
                    Coverages: $scope.SelectedCoverages
                });
            }
        }
        else {
            $scope.Errors = ['You must pick at least one coverage.'];
        }
    }


    $scope.search = function () {
        $scope.submissionInfo = null;
        $scope.submission.Confirmed = false;

        test_policyService.getExternalSubmission($scope.SubmissionNumber).then(function (result) {
            if (result.data.Result.Success) {
                $scope.submissionInfo = result.data;
            } else {
            }
        }, function (error) {
        });
    }
}]);

MALACHIAPP.controller('test_Commercial_Lines_chooseRiskCompanyCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'riskCompanies', 'documentType', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, riskCompanies, documentType) {
    $scope.RiskCompanies = riskCompanies;
    $scope.SelectedRiskCompany = {};
    $scope.DocumentType = documentType;

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.save = function () {
        if ($scope.SelectedRiskCompany.Company.Name.length > 0) {
            $modalInstance.close({
                RiskCompanyId: $scope.SelectedRiskCompany.Company.Id,
                DocumentType: $scope.DocumentType
            });
        }
        else {
            $scope.Errors = ['You must pick at least one risk company.'];
        }
    }
}]);

MALACHIAPP.controller('test_Commercial_Lines_emailDocumentCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'authService', 'settings', 'policyService', 'riskCompanyId', 'documentTypes', 'downloadFinance', 'policyId', 'policy', 'username', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, authService, settings, policyService, riskCompanyId, documentTypes, downloadFinance, policyId, policy, username) {
    $scope.Errors = [];
    $scope.EmailTo = policy.AgencyDetail.ContactEmail;
    $scope.EmailCc = '';
    $scope.Subject = `Westchetser Quote ${policy.MGASubmissionNumber ? `[${policy.MGASubmissionNumber}] ` : ''}- ${policy.Insured.Name}`;
    var isPackage = policy.CurrentVersion.Coverages.filter(x => x.Name == "Property").length > 0 && policy.CurrentVersion.Coverages.filter(x => x.Name == "Liability").length > 0;
    var isProperty = policy.CurrentVersion.Coverages.filter(x => x.Name == "Property").length > 0;
    var isLiability = policy.CurrentVersion.Coverages.filter(x => x.Name == "Liability").length > 0;
    var isHomeowners = policy.CurrentVersion.Coverages.filter(x => x.Name == "Homeowners").length > 0;
    var coverage = isPackage ? "Property & Liability" : isProperty ? "Property" : isLiability ? "General Liability" : isHomeowners ? "Homeowners" : "";
    var premium = policy.CurrentVersion.Premiums.filter(x => x.RiskCompanyId == policy.CurrentVersion.FocusedRiskCompanyId)[0].PremiumAfterFeesAndTaxes;
    var sendername = authService.authentication.firstName + ' ' + authService.authentication.lastName;
    var email = authService.authentication.userName;
    // Create our number formatter.
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        // the default value for minimumFractionDigits depends on the currency
        // and is usually already 2
    });

    $scope.Body = 'Hey ' + policy.AgencyDetail.ContactName.split(' ')[0] + ',<br><br>' +
        'Please see your attached ' + coverage + ' quote for ' + policy.Insured.Name + '. The total premium is ' + formatter.format(premium) + '.<br><br>' +
        'If you have any questions please contact:<br>' +
        sendername + ' ' + email + '<br><br>' +
        'We appreciate all you do for test.';

    $scope.InitialAttachments = documentTypes.map(function (docType) {
        return {
            Name: policy.Number + ' ' + docType + '.pdf',
            Active: true,
            DocType: docType
        };
    });
    $scope.Attachments = [];

    setTimeout(function () {
        $('#body-editor').wysihtml5({
            toolbar: {
                'link': false,
                'image': false,
                'blockquote': false,
                'size': 'sm'
            }
        });
    },
        10);

    $scope.addAttachment = function (input) {
        for (let i = 0; i < input.files.length; i++) {
            let file = input.files[i];
            if (!file.name.includes('.pdf')) {
                $scope.Errors = ['File must be a .pdf.'];
                break;
            }
            $scope.Errors = [];
            let attachment = { FileName: file.name, Data: null };
            const reader = new FileReader();
            reader.onload = function () {
                let dataurl = reader.result;
                attachment.Data = dataurl.substr(dataurl.indexOf(',') + 1);
            }
            reader.readAsDataURL(input.files[i]);
            $scope.Attachments.push(attachment);
        }
        $scope.$apply();
    }

    $scope.removeAttachment = function (attachment) {
        $scope.Attachments = $scope.Attachments.filter(function (a) { return a !== attachment; });
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.send = function () {
        if ($scope.Errors.includes('File must be a .pdf.'))
            return;
        Metronic.blockUI({ target: '.email-modal', animate: true, overlayColor: 'none' });
        policyService.emailPolicyDocument(policyId,
            riskCompanyId,
            $scope.InitialAttachments.filter(a => a.Active).map(a => a.DocType),
            downloadFinance,
            $scope.EmailTo,
            $scope.EmailCc,
            username,
            $scope.Subject,
            $('#body-editor')[0].value,
            $scope.Attachments)
            .then(function (result) {
                Metronic.unblockUI('.email-modal');
                $modalInstance.dismiss('sent');
                notificationsHub.showSuccess('Email Document', 'Email sent.');
            },
                function (err) {
                    Metronic.unblockUI('.email-modal');
                    $modalInstance.dismiss('failed to send');
                    notificationsHub.showError('Email Document', 'Failed to send email.');
                });
    }
}]);

MALACHIAPP.controller('test_Commercial_Lines_aimSubmissionCtrlB', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'ngAuthSettings', 'localStorageService', 'test_policyService', '$modal', 'authService', 'policy', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, ngAuthSettings, localStorageService, test_policyService, $modal, authService, policy) {
    $scope.Policy = policy;
    var coverages = [];
    for (let coverage of policy.CurrentVersion.Coverages) {
        coverages.push(coverage.Name);
    }
    $scope.Coverages = ['Property', 'Liability'];

    $scope.submission = {
        Policy: policy,
        Confirmed: false,
        SubmissionNumber: null,
        Coverages: coverages,
        SelectedCoverages: []
    };
    $scope.submissionInfo = null;

    $scope.save = function () {
        $modalInstance.close($scope.submission);
    }



    $scope.search = function () {
        test_policyService.getExternalSubmission($scope.submission.SubmissionNumber).then(function (result) {
            if (result.data.Result.Success) {
                $scope.submissionInfo = result.data;
            } else {
            }
        }, function (error) {
        });
    }

    $scope.okayButtonDisabled = function () {
        if ($scope.submission.Coverages.length == 0) {
            if ($scope.submission.SelectedCoverages.length == 0) return true;
        }
        if ($scope.submission.SubmissionNumber && !$scope.submission.Confirmed)
            return true;
    };
}]);