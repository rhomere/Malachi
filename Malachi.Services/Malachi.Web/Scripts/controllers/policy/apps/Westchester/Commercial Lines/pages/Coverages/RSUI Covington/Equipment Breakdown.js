'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Commercial_Lines_Coverages_RSUI_Covington_Equipment_Breakdown', ['authService', '$rootScope', '$scope', '$timeout', '$location', '$stateParams', '$ocLazyLoad', '$filter', 'notificationsHub', 'settings', 'policyService', 'toolsService', function (authService, $rootScope, $scope, $timeout, $location, $stateParams, $ocLazyLoad, $filter, notificationsHub, settings, policyService, toolsService) {
    $scope.parent = $scope.$parent;

    $scope.toggleManaulAddressEntry = false;
    $scope.Policy = $scope.parent.Policy;
    $scope.RiskCompanies = [];
    $scope.ErrorMessage = '';
    $scope.WarningMessage = '';
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;

    $scope.loadCoverage = function () {
        policyService.getRiskCompanies($scope.Policy).then(function (result) {
            if (result.data.Result.Success) {
                $scope.RiskCompanies = result.data.RiskCompanies;
                $scope.RiskCompanyId = $.grep($scope.RiskCompanies, function (x) { return (x.Name == 'RSUI Covington'); })[0].Id;

                policyService.getEquipmentBreakdown($scope.Policy.Id, $scope.RiskCompanyId).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.Coverage = result.data.Coverage;
                    }
                    else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    // Load Coverage
    $scope.loadCoverage();
}]);
