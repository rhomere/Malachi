'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Commercial_Lines_Coverages_RSUI_Covington_Liquor_Liability', ['authService', '$rootScope', '$scope', '$timeout', '$location', '$stateParams', '$ocLazyLoad', '$filter', 'notificationsHub', 'settings', 'policyService', 'toolsService', function (authService, $rootScope, $scope, $timeout, $location, $stateParams, $ocLazyLoad, $filter, notificationsHub, settings, policyService, toolsService) {
    $scope.parent = $scope.$parent;

    $scope.toggleManaulAddressEntry = false;
    $scope.Policy = $scope.parent.Policy;
    $scope.RiskCompanies = $scope.parent.RiskCompanies;
    $scope.ErrorMessage = '';
    $scope.WarningMessage = '';
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
    $scope.RiskCompanyId = $.grep($scope.RiskCompanies, function (x) { return (x.Name == 'RSUI Covington'); })[0].Id;

    $scope.loadCoverage = function () {
        policyService.getLiquorLiability($scope.Policy.Id, $scope.RiskCompanyId).then(function (result) {
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

    $scope.ClassCodes = [{
        Number: '16910',
        Description: 'Restaurant 35% liquor sales'
    },
    {
        Number: '16915',
        Description: 'Restaurant 35%-50% liquor sales'
    },
    {
        Number: '70412',
        Description: 'Private Clubs'
    },
    {
        Number: '59211',
        Description: 'Package store/retail'
    },
    {
        Number: '58168',
        Description: 'Special Event'
    }];

    $scope.EachCommonCauseLimits = ['$100,000', '$300,000', '$500,000', '$1,000,000'];
    $scope.AggregateLimits = ['$100,000','$200,000', '$300,000', '$500,000', '$600,000', '$1,000,000', '$2,000,000'];
    $scope.NumberOfDays = ['1-2', '3-5'];


    // Load Coverage
    $scope.loadCoverage();
}]);
