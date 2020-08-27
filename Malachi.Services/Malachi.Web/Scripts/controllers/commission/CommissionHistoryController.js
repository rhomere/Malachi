MALACHIAPP.controller("CommissionHistoryController", function($rootScope, ngAuthSettings, $scope, commissionService) {

    $scope.$on("$viewContentLoaded", function() {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
    });

    $scope.isCurrentReleased = false;
    $scope.months = commissionService.months;
    $scope.reports = [];
    $scope.currentMonth = 0;
    $scope.Errors = [];

    $scope.getReports = function () {

        //$scope.reports = commissionService.getCommissionReports();
        $scope.currentMonth = new Date().getMonth();
        
        // Get Actual Reports
        commissionService.getCommissionReports().then(function (result) {
            if (result.data.success && result.data.data) {

                $scope.reports = result.data.data;

                // Add date as string with month name
                $scope.reports.forEach(x => {
                    var date = new Date(x.reportDate);
                    x.date = $scope.months[date.getMonth() + 1] + ', ' + date.getFullYear();
                });

                // Check if the last month report is released
                var mostRecentReportMonth = new Date($scope.reports[0].reportDate).getMonth() + 1;
                $scope.isCurrentReleased =
                    $scope.currentMonth !== 0 ?
                    mostRecentReportMonth === $scope.currentMonth :
                        mostRecentReportMonth === 11;

                // Apply green header if it is current month
                if ($scope.isCurrentReleased) $scope.reports[0].isReleased = true;
            }
            else {
                $scope.Errors = result.data.errors;
            }
        },
        function () {
           $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.download = function (report) {
        $scope.Errors = commissionService.downloadReport(report);
    }

    $scope.getReports();

});