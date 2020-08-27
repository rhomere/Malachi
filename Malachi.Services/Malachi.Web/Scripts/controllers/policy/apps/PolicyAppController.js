'use strict'
// Get File Version
var version = parseQuery("appjs").v;

/* Setup general page controller */
MALACHIAPP.controller('PolicyAppController', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$urlRouter', 'settings', 'policyService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $urlRouter, settings, policyService) {
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

    var appId = $stateParams.appId;
    var policyId = $stateParams.policyId;

    $scope.Policy = {};
    $scope.Insured = {};

    if (appId) {
        policyService.getApp(appId).then(function (result) {
            $scope.App = result.data.App;
            // App HTML and JS Path
            var htmlpath = 'views/policy/apps/' + $scope.App.Url;
            var jspath = 'scripts/controllers/policy/apps/' + $scope.App.Url;
            var controller = $scope.App.Url.replace("/", "_").replace(" - ", "_").replace(" ", "_") + "_AppController";

            var $state = $rootScope.$state;
            var getExistingState = $state.get('policy.' + $scope.App.Url)
            if (getExistingState == null) {
                $stateProviderRef.state('policy.' + $scope.App.Url, {
                    url: "/" + $scope.App.Url,
                    params: { appId: null, policyId: null },  // Parameters must be defined
                    templateUrl: htmlpath + "/app.html?v=" + version,
                    data: { pageTitle: $scope.App.Name },
                    controller: controller,
                    resolve: {
                        deps: ['$ocLazyLoad', 'notificationsHub', function ($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'MALACHIAPP',
                                insertBefore: '#ng_load_plugins_before',
                                files: [
                                    '/scripts/services/authService.js?v=' + version,
									'/scripts/services/policyService.js?v=' + version,
	                                '/scripts/services/claimsService.js?v=' + version,
                                    'Plugins/bootstrap-dialog/css/bootstrap-dialog.min.css',
                                    'Plugins/bootstrap-dialog/js/bootstrap-dialog.min.js?v=' + version,
                                    jspath + '/AppController.js?v=' + version,
                                    'Plugins/bootstrap3-wysihtml5/bootstrap3-wysihtml5.min.css',
                                    'Plugins/bootstrap3-wysihtml5/bootstrap3-wysihtml5.all.min.js',
                                    '/scripts/services/company/test/policyService.js?v=' + version
                                ]
                            });
                        }]
                    }
                });
            }

            $state.transitionTo('policy.' + $scope.App.Url, { appId: appId, policyId: policyId });

        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    if (policyId) { // Existing Policy


    }
}]);
