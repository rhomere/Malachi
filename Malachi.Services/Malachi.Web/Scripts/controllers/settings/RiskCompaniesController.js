MALACHIAPP.controller('RiskCompaniesController', ['$rootScope', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'settingsService', 'riskCompanyService', 'accountService', 'toolsService', 'RiskCompanyScroller', function ($rootScope, $scope, $location, $timeout, $stateParams, $state, settings, settingsService, riskCompanyService, accountService, toolsService, RiskCompanyScroller) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.RiskCompanies = [];
    $scope.RiskCompany = null;
    $scope.newRiskCompany = false;
    $scope.ErrorMessage = null;

    $scope.riskcompanyscroller = new RiskCompanyScroller($scope);
    $scope.riskcompanyscroller.nextPage();

    

    $scope.currentTimeout = null;
    $scope.searchNameChanged = function () {
        if ($scope.currentTimeout != null) {
            $timeout.cancel($scope.currentTimeout);
        }
        $scope.currentTimeout = $timeout(function () { $scope.riskcompanyscroller.search($scope.searchName); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchForms('', $scope.currentPage, 10);
    };

    $scope.addNewRiskCompany = function () {
        $scope.newRiskCompany = true;
        $scope.RiskCompany = new riskCompany();
    }

    $scope.selectRiskCompany = function (riskCompany) {
        $scope.newRiskCompany = true;
        $scope.RiskCompany = $.extend(true, {}, riskCompany);
    }

    $scope.deleteRiskCompany = function (riskCompany) {
        riskCompanyService.deleteRiskCompany(riskCompany.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.RiskCompanies.splice($.inArray(riskCompany, $scope.RiskCompanies), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelRiskCompany = function () {
        $scope.newRiskCompany = false;
        $scope.ErrorMessage = null;
    }

    $scope.GoTo = function (url, riskCompany) {
        $state.transitionTo(url, { RiskCompany: riskCompany });
    }

    $scope.saveRiskCompany = function () {

        var isNew = $scope.RiskCompany.Id == null;
        riskCompanyService.updateRiskCompany($scope.RiskCompany).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.RiskCompanies.push(result.data.RiskCompany);
                }
                else {
                    for (var i = 0; i < $scope.RiskCompanies.length; i++) {
                        if ($scope.RiskCompanies[i].Id == result.data.RiskCompany.Id) {
                            $scope.RiskCompanies[i] = result.data.RiskCompany;
                        }
                    }
                }
                // Clean up
                $scope.cancelRiskCompany();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }
}]);


function riskCompany() {
    return {
        Enabled: true
    };
}


// Scroller constructor function to encapsulate HTTP and pagination logic
MALACHIAPP.factory('RiskCompanyScroller', function ($http, riskCompanyService) {
    var RiskCompanyScroller = function (scope) {
        this.items = [];
        this.busy = false;
        this.after = 1;
        this.TotalRiskCompanies = 0;
        this.Scope = scope;
    };

    RiskCompanyScroller.prototype.nextPage = function () {
        if (this.items.length > 0 && this.items.length == this.TotalRiskCompanies) return;
        if (this.busy) return;
        this.busy = true;

        riskCompanyService.searchRiskCompanies('', this.after, 15).then(function (result) {
            var objects = result.data.RiskCompanies;
            this.TotalRiskCompanies = result.data.Count;
            if (objects.length > 0) {
                for (var i = 0; i < objects.length; i++) {
                    this.items.push(objects[i]);
                }
                this.after++;
                this.busy = false;
            }
            this.Scope.RiskCompanies = this.items;
        }.bind(this), function (error) {
            //$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    };

    RiskCompanyScroller.prototype.search = function (message) {
        // if model is not yet defined set it to an empty string
        if (message == undefined)
            message = "";

        this.after = 1
        this.items = [];
        if (message == '') {
            this.nextPage()
            return;
        }
        this.busy = true;

        riskCompanyService.searchRiskCompanies(message, this.after, 15).then(function (result) {
            var objects = result.data.RiskCompanies;
            this.TotalRiskCompanies = result.data.Count;
            if (objects.length > 0) {
                for (var i = 0; i < objects.length; i++) {
                    this.items.push(objects[i]);
                }
                this.after++;
                this.busy = false;
            }
            this.Scope.RiskCompanies = this.items;
        }.bind(this), function (error) {
            // $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

    };

    return RiskCompanyScroller;
});


