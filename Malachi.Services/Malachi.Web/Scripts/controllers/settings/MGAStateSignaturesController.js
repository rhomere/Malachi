MALACHIAPP.controller('MgaStateSignaturesController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'Upload', 'settingsService', 'accountService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, Upload, settingsService, accountService, toolsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.ManagingGeneralAgent = $stateParams.ManagingGeneralAgent;
    if ($scope.ManagingGeneralAgent == null) {
        $state.transitionTo('mga');
        return;
    }

    $scope.MGAStateSignatures = [];
    $scope.MGAStateSignature = null;
    $scope.newMGAStateSignature = false;
    $scope.ErrorMessage = null;


    settingsService.getMGAStateSignatures($scope.ManagingGeneralAgent.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.MGAStateSignatures = result.data.MGAStateSignatures;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.addNewMGAStateSignature = function () {
        $scope.newMGAStateSignature = true;
        $scope.MGAStateSignature = new sateSignature($scope.ManagingGeneralAgent.Id);
    }

    $scope.selectMGAStateSignature = function (sateSignature) {
        $scope.newMGAStateSignature = true;
        $scope.MGAStateSignature = $.extend(true, {}, sateSignature);
    }

    $scope.deleteMGAStateSignature = function (sateSignature) {
        settingsService.deleteMGAStateSignature(sateSignature.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.MGAStateSignatures.splice($.inArray(sateSignature, $scope.MGAStateSignatures), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelMGAStateSignature = function () {
        $scope.newMGAStateSignature = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveMGAStateSignature = function () {
        var isNew = $scope.MGAStateSignature.Id == null;
        settingsService.updateMGAStateSignature($scope.MGAStateSignature).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.MGAStateSignatures.push(result.data.MGAStateSignature);
                }
                else {
                    for (var i = 0; i < $scope.MGAStateSignatures.length; i++) {
                        if ($scope.MGAStateSignatures[i].Id == result.data.MGAStateSignature.Id) {
                            $scope.MGAStateSignatures[i] = result.data.MGAStateSignature;
                        }
                    }
                }

                if ($scope.signatureFile != null) {
                    Upload.upload({
                        url: serviceBase + 'api/Settings/UploadStateSignature',
                        data: { file: $scope.signatureFile, 'MGAStateSignatureId': result.data.MGAStateSignature.Id }
                    })
                    $scope.signatureFile = null;
                }
                // Clean up
                $scope.cancelMGAStateSignature();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    //---------------------------------
    // Load States
    //---------------------------------
    toolsService.getStatesAndCounties().then(function (result) {
        if (result.data.Result.Success) {
            $scope.States = result.data.States;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


}]);


function sateSignature(mgaId) {
    return {
        "ManagingGeneralAgentId": mgaId
    };
}

function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}
