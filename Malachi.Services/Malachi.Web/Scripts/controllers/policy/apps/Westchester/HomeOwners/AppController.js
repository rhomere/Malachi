'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Homeowners_AppController', ['$rootScope', '$scope', '$sce', '$interval', '$timeout', '$location', '$modal', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$urlRouter', 'settings', 'ngAuthSettings', 'localStorageService', 'policyService', 'authService', 'claimsService', function ($rootScope, $scope, $sce, $interval, $timeout, $location, $modal, $stateParams, $ocLazyLoad, notificationsHub, $urlRouter, settings, ngAuthSettings, localStorageService, policyService, authService, claimsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = true;
    });

    $scope.AppId = $stateParams.appId;
    $scope.PolicyId = $stateParams.policyId;
    $scope.policyMenuVisible = true;
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
    $scope.policyNotePerson = $.inArray("Policy Notes", authService.authentication.roles) > -1;
    $scope.hasCanSeeBound = $.inArray("Can See Bound", authService.authentication.roles) > -1;
    $scope.Policy.PolicyTerm = 12;
    $scope.LoadingPage = true;
    $scope.AllClassCodes = [];
    $scope.UploadedDocuments = [];
    $scope.UploadedDocumentTypes = [];
    $scope.DocumentsFlag = false; 
    $scope.Policy = {
        AgencyDetail: {},
        Insured: {},
        Versions: [{}]
    };
    $scope.Policy.CurrentVersion = $scope.Policy.Versions[0];
    $scope.isAgencyPortal = $scope.AppId != null && $scope.AppId == "001d0418-a168-4be3-84a8-0168eda970fd";

    $scope.getMgaSubmissionNumber = function () {
        // REMOVED
    };

    if ($scope.AppId != null) {
        policyService.getApp($scope.AppId).then(function (result) {
            $scope.App = result.data.App;
            // App HTML and JS Path
            var htmlpath = 'views/policy/apps/' + $scope.App.Url;
            var jspath = 'scripts/controllers/policy/apps/' + $scope.App.Url;
            var csspath = 'content/controllers/policy/apps/' + $scope.App.Url;

            var $state = $rootScope.$state;
            var getExistingState = $state.get('policy.' + $scope.App.Url + '.submission')
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
                                        'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                                        'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,

                                        csspath + '/locations.css',
                                        jspath + '/pages/LocationsController.js?v=' + version
                                    ]
                                });
                            }]
                        }
                    })

					.state('policy.' + $scope.App.Url + '.claims', {
						url: "/" + $scope.App.Url + "/claims",
						params: { appId: null, policyId: null }, // Parameters must be defined
						templateUrl: htmlpath + "/pages/claims.html?v=" + version,
						data: { pageTitle: $scope.App.Name + " Claims" },
						controller: controller + "_ClaimsController",
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

										csspath + '/locations.css',
										jspath + '/pages/ClaimsController.js?v=' + version
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
                                        '/Scripts/services/company/test/policyService.js?v=' + version,
                                        '/Scripts/services/aimService.js?v=' + version,
                                        '/Scripts/services/elanyService.js?v=' + version,
                                        '/Scripts/services/agencyService.js?v=' + version,
                                        csspath + '/bind.css',
                                        jspath + '/pages/BindController.js?v=' + version
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
                                        jspath + '/stateProfiles/StateProfileHelper.js?v=' + version,
                                        jspath + '/stateProfiles/NewJerseyProfile.js?v=' + version,
                                        jspath + '/stateProfiles/NewYorkProfile.js?v=' + version,
                                        jspath + '/stateProfiles/FloridaProfile.js?v=' + version,
                                        jspath + '/stateProfiles/TexasProfile.js?v=' + version,
                                        jspath + '/stateProfiles/AlabamaProfile.js?v=' + version,
                                        jspath + '/stateProfiles/MississippiProfile.js?v=' + version,
                                        jspath + '/stateProfiles/SouthCarolinaProfile.js?v=' + version,
                                        jspath + '/stateProfiles/NorthCarolinaProfile.js?v=' + version,
                                        jspath + '/stateProfiles/VirginiaProfile.js?v=' + version,
                                        jspath + '/stateProfiles/GeorgiaProfile.js?v=' + version,
                                        jspath + '/stateProfiles/LouisianaProfile.js?v=' + version,
                                        jspath + '/pages/PropertyController.js?v=' + version
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

        $scope.prevTab = function () {
            if ($scope.$state.includes('policy.' + $scope.App.Url + '.finalize')) {
                $timeout(function () { $('#lnkForms').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.forms')) {
                $timeout(function () { $('#lnkEligibility').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.eligibility')) {
                $timeout(function () { $('#lnkClaims').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.property')) {
                $timeout(function () { $('#lnkLocations').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.bind')) {
                $timeout(function () { $('#lnkFinalize').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.bindEndorsement')) {
                $timeout(function () { $('#lnkFinalize').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.locations')) {
                $timeout(function () { $('#lnkSubmission').click(); }, 0, false);
			} else if ($scope.$state.includes('policy.' + $scope.App.Url + '.claims')) {
				$timeout(function () { $('#lnkProperty').click(); }, 0, false);
			}
        }

        $scope.nextTab = function () {
            if ($scope.$state.includes('policy.' + $scope.App.Url + '.forms')) {
                $timeout(function () { $('#lnkFinalize').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.eligibility')) {
                $timeout(function () { $('#lnkForms').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.property')) {
                $timeout(function () { $('#lnkClaims').click(); }, 0, false);
			} else if ($scope.$state.includes('policy.' + $scope.App.Url + '.claims')) {
				$timeout(function () { $('#lnkEligibility').click(); }, 0, false);
			} else if ($scope.$state.includes('policy.' + $scope.App.Url + '.finalize')) {
                if ($scope.Policy.Endorsement == null)
                    $timeout(function () { $('#lnkBind').click(); }, 0, false);
                else
                    $timeout(function () { $('#lnkBindEndorsement').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.locations')) {
                $timeout(function () { $('#lnkProperty').click(); }, 0, false);
            } else if ($scope.$state.includes('policy.' + $scope.App.Url + '.submission')) {
                $timeout(function () { $('#lnkLocations').click(); }, 0, false);
            }
        }


        $scope.showPropertyGuidelines = function () {
            BootstrapDialog.show({
                title: 'Property Guidelines',
                message: `<div  style="overflow-y:scroll;height:700px;> 
 <ul style="margin-bottom:-10px;">
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>All Properties subject to inspection</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Updates to roofing, plumbing, wiring and HVAC must have been completed within the last 35 years</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Roof older than 25 years will be ACV</span></b><span></span></li></ul><ul style="margin-bottom:0in">
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -10px; font-family:Calibri, sans-serif"><b><span>Exclude Short Term Rentals – Less than 12 months</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Exclude risks with Insured criteria</span></b><span></span></li></ul>
 <ul style="margin-bottom:0in; margin-bottom: -20px;">
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -40px; font-family:Calibri, sans-serif"><span>High profile occupations</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Insureds with bankruptcies or foreclosures within last 36 months</span></li>
 </ul>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Exclude risks with any of the following Electrical criteria</span></b><span></span></li>
 <ul style="margin-bottom:0in; margin-bottom: -20px;">
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -40px; font-family:Calibri, sans-serif"><span>Aluminum wiring</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Knob and tube wiring</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Cloth wiring</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Homes with Fuses instead of Circuit Breakers</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Circuit Breakers below 200mp</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>FPE</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Stab-Lok</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Zinco Breakers</span></li>
 </ul>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Exclude risks with Polybutylene/Galvanized plumbing</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Exclude risks with Occupancy types</span></b><span></span></li>
 <ul style="margin-bottom:0in; margin-bottom: -20px;">
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -40px; font-family:Calibri, sans-serif"><span>Farms</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Day-Care</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Assisted Living Operations</span></li>
 </ul>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>HO3 &amp; HO8 must be owner occupied only</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Exclude risks with Unfenced Pools/Trampolines</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Exclude risks with Construction types</span></b><span></span></li>
 <ul style="margin-bottom:0in; margin-bottom: -20px;">
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -40px; font-family:Calibri, sans-serif"><span>EIFS exterior</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Mobile/Manufactured/Pre-fabricated</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Yurt homes</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Balloon Frame</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Underground/Earth homes</span></li>
  <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><span>Log construction</span></li>
 </ul>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Risks with more than 2 mortgages/lienholders</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Risks with unrepaired damage</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Buildings condemned to be razed</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Wood Shake roofs</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Dwellings with wood stove as primary heat</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Dwellings on more than 5 acres</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Submit risk to your underwriter if prior claims exist.</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Wind Excluded in Tri-County if less than a 1 mile to the coast (FL only)</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Wind Excluded in Monroe County (FL only)</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Wind Excluded on Barrier Islands (FL,TX,SC only)</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Builders Risk only New Construction &amp; Major remodeling/renovations of existing structures</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Exclude risks with Trampolines</span></b><span></span></li>
 <li style="margin:0in 0in 0.0001pt; font-size:11pt; margin-top: -20px; font-family:Calibri, sans-serif"><b><span>Exclude risks with Unfenced Pools</span></b><span></span></li>
</ul></div>`,
                buttons: [{
                    label: 'Ok',
                    cssClass: 'btn-primary',
                    action: function (dialogItself) {
                        dialogItself.close();
                    }
                }]
            });
        }
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
            controller: 'test_Personal_Lines_policyNoteCtrl',
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

    $scope.openUploadDocuments = function () {
        var modalInstance = $modal.open({
            templateUrl: 'uploadDocuments.html',
            controller: 'test_HomeOwners_uploadDocumentsCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () { return $scope.Policy; },
                uploadedDocumentTypes: function () { return $scope.UploadedDocumentTypes; },
                documentFlag: function () { return $scope.DocumentsFlag; }
            }
        });

        modalInstance.result.then(function (data) {
            if (data.Action != 'cancel') {
            }
            else {
                $scope.UploadedDocumentTypes = data.Documents;
                $scope.DocumentsFlag = data.Updated;
            }
        });
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
                        title: 'Download Policy',
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
        xhr.send(JSON.stringify({ PolicyId: $scope.Policy.OriginalPolicyId }));
    }

    $scope.downloadRateSheet = function () {
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
        xhr.send(JSON.stringify({ PolicyId: $scope.PolicyId, RiskCompanyId: $scope.Policy.CurrentVersion.FocusedRiskCompanyId }));
    }

    $scope.downloadQuoteDocument = function (downloadFinance) {
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
        xhr.send(JSON.stringify({ PolicyId: $scope.Policy.Id, RiskCompanyId: $scope.Policy.CurrentVersion.FocusedRiskCompanyId, DownloadFinance: downloadFinance }));
    }

    $scope.downloadBinder = function () {
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
        xhr.send(JSON.stringify({ PolicyId: $scope.Policy.Id, RiskCompanyId: $scope.Policy.CurrentVersion.FocusedRiskCompanyId }));
    }

    $scope.downloadPolicy = function () {
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
        xhr.send(JSON.stringify({ PolicyId: $scope.Policy.Id, RiskCompanyId: $scope.Policy.CurrentVersion.FocusedRiskCompanyId }));
    }

    $scope.getApplication = function () {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.documentServiceBase + 'api/document/GetApplication', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "ApplicationDocument.pdf";
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
        xhr.send(JSON.stringify({ PolicyId: $scope.Policy.Id, RiskCompanyId: $scope.Policy.CurrentVersion.FocusedRiskCompanyId }));
    }

    $scope.emailDocument = function (riskCompanyId, documentTypes, downloadFinance = false) {
        var modalInstance = $modal.open({
            templateUrl: 'homeowners_emailDocument.html',
            controller: 'test_Homeowners_emailDocumentCtrl',
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
        $scope.Contracts = [];
        policyService.getAppContracts($scope.AppId, ($scope.Policy != null ? $scope.Policy.Effective : $scope.getTodaysDate()), $scope.Policy.CurrentVersion.Coverages, ($scope.Policy != null ? $scope.Policy.Attributes.map(x => x.Name) : []), $scope.Policy.HomeStateCode).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Contracts = result.data.Contracts;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page'];
        });

        policyService.getRiskCompanies($scope.Policy).then(function (result) {
            if (result.data.Result.Success) {
                $scope.RiskCompanies = result.data.RiskCompanies;

                if ($scope.RiskCompanies.length == 0) {
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
        $scope.AllClassCodes = [];
        policyService.getAllClassCodesForApp($scope.PolicyId).then(function (result) {
            if (result.data.Result.Success) {
                $scope.AllClassCodes = result.data.ClassCodes;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page'];
        });
    }

    $scope.getPropertiesCount = function () {
        return $scope.Policy.CurrentVersion &&
            $scope.Policy.CurrentVersion.Locations &&
            $scope.Policy.CurrentVersion.Locations.length > 0 &&
            $scope.Policy.CurrentVersion.Locations[0].Properties &&
            $scope.Policy.CurrentVersion.Locations[0].Properties.length > 0;
    }

    $scope.windDeductibleWithoutAmount = function () {
        return $scope.getPropertiesCount() &&
            !$scope.Policy.CurrentVersion.Locations[0].Properties[0].ExcludeWindHail &&
            $scope.Policy.CurrentVersion.Locations[0].Properties[0].Deductibles &&
            $scope.Policy.CurrentVersion.Locations[0].Properties[0].Deductibles.length > 0 &&
            !$scope.Policy.CurrentVersion.Locations[0].Properties[0].Deductibles.filter(x => x.Name == "Named Storm Deductible")[0].Amount;
    }

    $scope.hasClaimsandNotAdded = function () {
        if ($scope.Policy.AnyLossesInFiveYears == null) {
            return true;
        }
        else if ($scope.Policy.AnyLossesInFiveYears) {
            return $scope.Policy.CurrentVersion.PolicyVersionClaims.length == 0;
        }
        else if (!$scope.Policy.AnyLossesInFiveYears) {
            return $scope.Policy.CurrentVersion.PolicyVersionClaims.length != 0;
        }
        return true; 
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
        if (riskCompanyId != null && $scope.Policy != null && $scope.Policy.Submits != null && $scope.Policy.Submits.length > 0) {
            return $.grep($scope.Policy.Submits, function (x) {
                return x.RiskCompanyId == riskCompanyId && x.VersionNumber == $scope.Policy.VersionNumber && x.Approved;
            }).length > 0;
        }
        else if ($scope.Policy.WebServiceApprovedSubmits != null && $scope.Policy.WebServiceApprovedSubmits.length > 0) {
            return $.grep($scope.Policy.WebServiceApprovedSubmits, function (x) {
                return x.RiskCompanyId == riskCompanyId;
            }).length > 0;
        }

        return false;
    }

    $scope.SubmitRequested = function (riskCompanyId) {
        if (riskCompanyId != null && $scope.Policy != null && $scope.Policy.Submits != null && $scope.Policy.Submits.length > 0) {
            var dateLastRequested = $.grep($scope.Policy.Submits, function (x) {
                return x.RiskCompanyId == riskCompanyId && x.VersionNumber == $scope.Policy.VersionNumber && x.DateLastRequested != null;;
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

    // Will check whether or not a quote is on hold due to claims
    $scope.OnHoldForClaims = function () {
        if ($scope.Policy.Attributes)
            return ($scope.Policy.Attributes.some(x => x.Name == 'On Hold Due To Claim') && !$scope.Policy.Attributes.some(x => x.Name == 'Quote Released To Agent'));
        return false;
    };

    // Will open a dialog to ask the UW if they are sure they want to release the quote to the agent
    $scope.confirmRelease = function () {
        var modalInstance = $modal.open({
            templateUrl: 'releaseQuote.html',
            controller: 'test_Homeowners_releaseQuoteCtrl',
            backdrop: 'static',
            windowClass: 'app-modal-window',
            resolve: {}
        });

        modalInstance.result.then(function (data) {
            if (data !== 'cancel') {
                $scope.Errors = [];
                policyService.releaseQuoteToAgent($scope.Policy.Id).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.Policy.Attributes.push(result.data.PolicyAttribute);
                    } else {
                        $scope.Errors = result.data.Errors;
                    }
                },
                    function (error) {
                        $scope.Errors = ["An unexpected error has occured. Please refresh the page."];
                    });
            };
        });
    }


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

    $scope.PolicyInWorkflow = function () {
        if ($scope.Policy.Attributes)
            return $scope.Policy.Attributes.some(x => x.Name == 'Workflow Bind Task Submitted');
        return false;
    };

    $scope.PolicyInElany = function () {
        if ($scope.Policy.Attributes)
            return $scope.Policy.Attributes.some(x => x.Name == 'Elany Request Submitted');
        return false;
    };

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

    $scope.canSeeBound = function () {
        if ($scope.Policy.Issued) return true;
        if ($scope.hasCanSeeBound) return true;
        return false;
    }

    $scope.showClaimsSummary = function () {
        var modalInstance = $modal.open({
            templateUrl: 'policyClaims.html',
            controller: 'test_Homeowners_policyClaimsCtrl',
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

    $scope.displayFullName = function (name) {
        var html = '<label style="border-collapse: collapse; border: 1px solid white;">';
        html += name;
        html += '</label>';
        return $sce.trustAsHtml(html);
    };

    $scope.Coverages = [];
    //$scope.parent = {};
    //$scope.parent.Policy = {};

    $scope.canModify = function (checkSubmitForBind) {
        var policy = $scope.Policy;

        if (checkSubmitForBind == null)
            checkSubmitForBind = true;

        if (policy != null) {
            if (policy.Bound || (checkSubmitForBind && $scope.SubmitForBind() && !submitReviewer))
                return false;

            if ($scope.PolicyInWorkflow())
                return false;
        }

        return true;
    }

    function getRatingQuestions() {
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
        var version = $scope.Policy.CurrentVersion;

        // Get eligibility questions.
        var questions = version.Questions.filter(function (x) { return x.RiskCompanyId == riskCompanyId });

        // Get rating questions.
        questions = questions.concat(getRatingQuestions().filter(function (x) { return x.RiskCompanyId == riskCompanyId }));

        // Check if every questions has an answer.
        return questions.every(function (x) {
            return x.Answer != null && x.Answer.length > 0;
        });
    }

    $scope.isRiskCompanyDeclined = function (riskCompanyId) {
        if (riskCompanyId == null || $scope.Policy == null || $scope.Policy.CurrentVersion == null) return true;

        var version = $scope.Policy.CurrentVersion;
        if (version.Premiums == null || version.Premiums.length == 0) return true;

        var premium = version.Premiums.find(function (x) { return x.RiskCompanyId == riskCompanyId });
        if (premium == null || premium.Premium == 0 || premium.Breakdown.length == 0) return true;

        var declinesGrep = $.grep(version.Declines, function (x) { return x.RiskCompanyId == riskCompanyId; });
        if (declinesGrep.length != 0) return true;

        var coverages = version.Coverages.filter(x => x.Name != 'Earthquake');
        for (var i = 0; i < coverages.length; i++) {
            var coverage = coverages[i];
            var coverageBreakdown = premium.Breakdown.find(function (x) { return x.Coverage == coverage.Name });
            if (coverageBreakdown == null) return true;
        }

        for (var i = 0; i < premium.Breakdown.length; i++) {
            var breakdown = premium.Breakdown[i];
            if (breakdown.Coverage != 'Tax' && breakdown.Coverage != 'Fee')
                if (breakdown.DevelopedAmount == 0 || breakdown.Amount <= 0)
                    return true;
        }

        return false;
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
        if ($scope.isAgencyPortal || questionsReviewed == null)
            return riskCompanyId == null || $scope.isRiskCompanyDeclined(riskCompanyId);

        return riskCompanyId == null || $scope.isRiskCompanyDeclined(riskCompanyId) || checkQuestions && !(allQuestionsAnswered(riskCompanyId) && questionsReviewed);
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
        if (!$scope.Policy || $.isEmptyObject($scope.Policy.CurrentVersion)) return false;

			var r1 = !$scope.invalidRiskCompanySelected();
			var r2 = $scope.checkForQuoteErrors().length == 0;
			var r3 = !$scope.Policy.CurrentVersion.RequiresFormUpdate;
			var r4 = $scope.canDownloadRatesheet();
			var r5 = $scope.canDownloadQuoteDoc();
			var r6 = $scope.canDownloadPolicy();
			var r7 = $scope.canDownloadApplication();
			var r8 = !$scope.ProposalTabIncomplete();

        return !$scope.invalidRiskCompanySelected() && $scope.checkForQuoteErrors().length == 0 && !$scope.Policy.CurrentVersion.RequiresFormUpdate
            && ($scope.canDownloadRatesheet() ||
                $scope.canDownloadQuoteDoc() ||
                $scope.canDownloadPolicy() ||
                $scope.canDownloadApplication()) &&
								!$scope.ProposalTabIncomplete();
    };

    $scope.canDownloadApplication = function () {
        if (!$scope.Policy || $.isEmptyObject($scope.Policy.CurrentVersion)) return false;

        return $scope.Policy.CurrentVersion.Locations.length > 0;
    };

    $scope.canDownloadRatesheet = function () {
        return false;
        if (!$scope.Policy || $.isEmptyObject($scope.Policy.CurrentVersion)) return false;

        if ($scope.isAgencyPortal)
        {
            return $scope.Policy.CurrentVersion.FocusedRiskCompanyId
                && $scope.checkForQuoteErrors().length == 0;
        }
        else
        {
            var riskCompanyId = $scope.Policy.CurrentVersion.FocusedRiskCompanyId;
            return $scope.Policy.CurrentVersion.FocusedRiskCompanyId
                && $scope.checkForQuoteErrors().length == 0
                && $scope.Policy.CurrentVersion.QuestionReviewConfirmations.some(x => x.RiskCompanyId == riskCompanyId);
        }
    };

    $scope.canDownloadQuoteDoc = function () {
        if (!$scope.Policy || $.isEmptyObject($scope.Policy.CurrentVersion)) return false;

        if ($scope.Policy.Bound || $scope.Policy.Issued) {
            return true;
        }

        return (($scope.Policy.Bound && $scope.canSeeBound()) || !$scope.Policy.Bound) && (!$scope.SubmitRequired($scope.Policy.CurrentVersion.FocusedRiskCompanyId) || $scope.SubmitApproved($scope.Policy.CurrentVersion.FocusedRiskCompanyId) || $scope.submitReviewer) && ($scope.Policy.CurrentVersion.QuestionReviewConfirmations.length > 0 || $scope.isAgencyPortal);
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

    $scope.canDownloadPolicy = function () {
        return $scope.Policy.Issued;
    };

    $scope.canSeeBound = function () {
        if ($scope.Policy.Issued) return true;
        if ($scope.hasCanSeeBound) return true;
        return false;
    }

		$scope.ProposalTabIncomplete = function () {
			if (checkInput($scope.Policy.MinimumEarnedPremium) || checkInput($scope.Policy.AgencyDetail.AgencyName) || checkInput($scope.Policy.AgencyDetail.ContactName) ||
				checkInput($scope.Policy.AgencyDetail.Address.ShortAddress) || checkInput($scope.Policy.AgencyDetail.AgencyCode) || checkInput($scope.Policy.ProducingAgencyCommission) ||
				checkInput($scope.Policy.Commission)){
				return true;
			} 

			return false;
		}

		function checkInput(input) {
			if (input === '' || input === undefined || input === null) {
				return true;
			}
			else {
				return false;
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
}]);

MALACHIAPP.controller('test_Personal_Lines_policyNoteCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policyId', 'policyNotes', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policyId, policyNotes) {
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

MALACHIAPP.controller('test_HomeOwners_uploadDocumentsCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'uploadedDocumentTypes', 'documentFlag', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, uploadedDocumentTypes, documentFlag) {
    $scope.UploadedDocumentTypes = uploadedDocumentTypes;
    $scope.Policy = policy;
    $scope.Errors = [];
    $scope.DocumentsFlag = documentFlag;
    $scope.Documents = [];
    $scope.TypeSelected = {};
    $scope.Types = ['Central alarm certificate', 'Flood certificate', 'Flood policy declarations', 'Inspection report', 'Supplementary questionnaire', 'Lost policy release (LPR)', 'No prior loss letter', 'Signed application', 'Other', 'BOR letter (for WSG ops to use)'];

    if ($scope.Policy.Id && !$scope.DocumentsFlag) {
        getUploadedDocumentTypes();
    }

    function getUploadedDocumentTypes() {
        $scope.UploadedDocumentTypes = [];

        var policyId = $scope.Policy.Id;

        policyService.getUploadedDocumentList(policyId).then(function (result) {
            if (result.data.Result.Success) {
                $scope.UploadedDocumentTypes = result.data.UploadedDocumentTypes;
                $scope.DocumentsFlag = true;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            console.log(error);
            $scope.Errors = ["An unexpected error has occured. Please refresh the page."];
        });
    }

    $scope.onFileUploaded = function (element) {
        var file = element.files[0];
        var doc = {};
        doc.Name = file.name;
        var reader = new FileReader();
        reader.onload = function () {
            var buffer = new Uint8Array(this.result);
            doc.Data = Array.from(buffer);
        }
        reader.readAsArrayBuffer(file);

        doc.Type = $scope.TypeSelected.Name;

        if (!$scope.Documents.length > 0)
            $scope.Documents = [];
        $scope.Documents.push(doc);
        $scope.TypeSelected = {};
        $scope.$apply();
    }

    $scope.deleteDoc = function (doc) {
        var index = $scope.Documents.indexOf(doc);
        $scope.Documents.splice(index, 1);
    }

    $scope.downloadDoc = function (doc) {
        var file = base64ToArray(doc.Data);
        var byteArray = new Uint8Array(file);
        var a = window.document.createElement('a');

        a.href = window.URL.createObjectURL(new Blob([byteArray], { type: 'application/octet-stream' }));
        a.download = doc.Name;

        // Append anchor to body.
        document.body.appendChild(a)
        a.click();

        // Remove anchor from body
        document.body.removeChild(a)
    }

    $scope.close = function () {
        var returnObject = { Action: 'cancel', Documents: $scope.UploadedDocumentTypes, Updated: $scope.DocumentsFlag};
        $modalInstance.close(returnObject);
    }

    $scope.validateInputs = function () {
        $scope.Errors = [];
        if ($scope.Documents.length == 0)
            $scope.Errors.push('There were no documents selected to upload.');
    }

    $scope.confirm = function () {
        $scope.validateInputs();
        if ($scope.Errors.length > 0) {
            return;
        }
        Metronic.blockUI({ target: ".modal-dialog", animate: true, overlayColor: "none" });
        policyService.uploadDocumentsToBlob($scope.Policy.Id, $scope.Documents).then(
            function (result) {
                if (result.data.Result.Success) {
                    policyService.getUploadedDocumentList($scope.Policy.Id).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.UploadedDocumentTypes = result.data.UploadedDocumentTypes;
                            $scope.Documents = [];
                            Metronic.unblockUI(".modal-dialog");
                            notificationsHub.showSuccess('Documents', 'Documents uploaded.');
                        } else {
                            Metronic.unblockUI(".modal-dialog");
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) {
                        Metronic.unblockUI(".modal-dialog");
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }
                else {
                    Metronic.unblockUI(".modal-dialog");
                    $scope.Errors = result.data.Result.Errors;
                }
            },
            function (error) {
                Metronic.unblockUI(".modal-dialog");
                $scope.Errors = ['An unexpected error occurred. Please refresh the page.'];
            });
    }

    function base64ToArray(str) {
        var decoded = window.atob(str);
        var byteArray = new Array(decoded.length);

        for (var i = 0; i < decoded.length; i++)
            byteArray[i] = decoded.charCodeAt(i);

        return byteArray;
    }
}]);

MALACHIAPP.controller('test_Homeowners_releaseQuoteCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService) {

    $scope.close = function (data) {
        if (data !== 'cancel') {
            $modalInstance.close(data);
        } else {
            $modalInstance.dismiss('cancel');
        }
    }
}]);

MALACHIAPP.controller('test_Homeowners_policyClaimsCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'claims', 'claimsService', 'unableToGetClaims', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, claims, claimsService, unableToGetClaims) {
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
    $scope.getStatusColor = function (status) {
        switch (status) {
            case 0:
            case 3:
                return "#e23b30"; //red
            case 1:
                return "limegreen";
            case 2:
                return "#ef8200"; //orange
            case 4:
                return "blue";
            case 5:
                return "#673bb8";//purple
            default:
                return "black";
        }
    }

    // Returns status name, depends on the status code
    $scope.getStatus = function (status) {
        switch (status) {
            case 0:
                return "OPEN";
            case 1:
                return "CLOSED";
            case 2:
                return "DENIED";
            case 3:
                return "REOPENED";
            case 4:
                return "WITHDRAWN";
            case 5:
                return "LITIGATION";
            case 6:
                return "RES. Of RIGHTS";
            default:
                return "NOT FOUND";
        }
    }
    // END OF JACK'S
}]);

MALACHIAPP.controller('test_Homeowners_emailDocumentCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'authService', 'settings', 'policyService', 'riskCompanyId', 'documentTypes', 'downloadFinance', 'policyId', 'policy', 'username', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, authService, settings, policyService, riskCompanyId, documentTypes, downloadFinance, policyId, policy, username) {
    $scope.EmailTo = policy.AgencyDetail.ContactEmail;
    $scope.EmailCc = '';
    $scope.Subject = `test Quote ${policy.MGASubmissionNumber ? `[${policy.MGASubmissionNumber}] ` : ''}- ${policy.Insured.Name}`;
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
        minimumFractionDigits: 2
        // the default value for minimumFractionDigits depends on the currency
        // and is usually already 2
    });

    $scope.Body = 'Hey ' + policy.AgencyDetail.ContactName.split(' ')[0] + ',<br><br>' +
        'Please see your attached ' + coverage + ' quote for ' + policy.Insured.Name + '. The total premium is ' + formatter.format(premium) + '.<br><br>' +
        'If you have any questions please contact:<br>' +
        sendername + ' ' + email + '<br><br>' +
        'We appreciate all you do for test.'

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