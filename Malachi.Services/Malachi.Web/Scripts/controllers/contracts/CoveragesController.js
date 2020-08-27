MALACHIAPP.controller('CoveragesController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'settingsService', 'contractService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, settingsService, contractService, accountService, toolsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.Contract = $stateParams.Contract;
    if ($scope.Contract == null) {
        $state.transitionTo('contracts');
        return;
    }

    $scope.Coverages = [];

    contractService.getLimits().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Limits = result.data.Limits;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
    

    settingsService.getCoverages().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Coverages = result.data.Coverages;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


    $scope.goTo = function (contract, url, coverage) {
        $state.transitionTo(url, { Contract: contract, Coverage: coverage });
    }

    $scope.updateContractCoverages = function () {
        contractService.updateContractCoverages($scope.Contract.Id, $scope.Contract.Coverages).then(function (result) {
            if (result.data.Result.Success) {

            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }
}]);
