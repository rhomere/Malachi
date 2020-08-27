MALACHIAPP.controller('InsurersController', ['$rootScope', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'settingsService', 'insurerService', 'accountService', 'toolsService', 'riskCompanyService', 'InsurerScroller', function ($rootScope, $scope, $location, $timeout, $stateParams, $state, settings, settingsService, insurerService, accountService, toolsService, riskCompanyService, InsurerScroller) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.Insurers = [];
    $scope.Insurer = null;
    $scope.newInsurer = false;
    $scope.ErrorMessage = null;
    $scope.RiskCompanies = [];


    $scope.insurerscroller = new InsurerScroller($scope);
    $scope.insurerscroller.nextPage();

    $scope.currentTimeout = null;
    $scope.searchNameChanged = function () {
        if ($scope.currentTimeout != null) {
            $timeout.cancel($scope.currentTimeout);
        }
        $scope.currentTimeout = $timeout(function () { $scope.insurerscroller.search($scope.searchName); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchForms('', $scope.currentPage, 10);
    };

    riskCompanyService.getRiskCompanies().then(function (result) {
        if (result.data.Result.Success) {
            $scope.RiskCompanies = result.data.RiskCompanies;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.addNewInsurer = function () {
        $scope.newInsurer = true;
        $scope.Insurer = new insurer();
    }

    $scope.selectInsurer = function (insurer) {
        $scope.newInsurer = true;
        $scope.Insurer = $.extend(true, {}, insurer);
    }

    $scope.deleteInsurer = function (insurer) {
        insurerService.deleteInsurer(insurer.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Insurers.splice($.inArray(insurer, $scope.Insurers), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelInsurer = function () {
        $scope.newInsurer = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveInsurer = function () {

        var isNew = $scope.Insurer.Id == null;
        insurerService.updateInsurer($scope.Insurer).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Insurers.push(result.data.Insurer);
                }
                else {
                    for (var i = 0; i < $scope.Insurers.length; i++) {
                        if ($scope.Insurers[i].Id == result.data.Insurer.Id) {
                            $scope.Insurers[i] = result.data.Insurer;
                        }
                    }
                }
                // Clean up
                $scope.cancelInsurer();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }


    $scope.goTo = function (insurer, url) {
        $state.transitionTo(url, { Insurer: insurer });
    }

}]);


function insurer() {
    return {
        Enabled: true
    };
}


// Scroller constructor function to encapsulate HTTP and pagination logic
MALACHIAPP.factory('InsurerScroller', function ($http, insurerService) {
    var InsurerScroller = function (scope) {
        this.items = [];
        this.busy = false;
        this.after = 1;
        this.totalInsurers = 0;
        this.Scope = scope;

    };

    InsurerScroller.prototype.nextPage = function () {
        if (this.items.length > 0 && this.items.length == this.totalInsurers) return;
        if (this.busy) return;
        this.busy = true;


        insurerService.searchInsurers('', this.after, 15).then(function (result) {
            var objects = result.data.Insurers;
            this.totalInsurers = result.data.Count;
            if (objects.length > 0) {
                for (var i = 0; i < objects.length; i++) {
                    this.items.push(objects[i]);
                }
                this.after++;
                this.busy = false;
            }
            this.Scope.Insurers = this.items;
        }.bind(this), function (error) {
            //$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

    };

    InsurerScroller.prototype.search = function (message) {
        this.after = 1
        this.items = [];
        if (message == '') {
            this.nextPage()
            return;
        }
        this.busy = true;

        insurerService.searchInsurers(message, this.after, 15).then(function (result) {
            var objects = result.data.Insurers;
            this.totalInsurers = result.data.Count;
            if (objects.length > 0) {
                for (var i = 0; i < objects.length; i++) {
                    this.items.push(objects[i]);
                }
                this.after++;
                this.busy = false;
            }
            this.Scope.Insurers = this.items;
        }.bind(this), function (error) {
            //$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

    };

    return InsurerScroller;
});
