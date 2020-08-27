MALACHIAPP.controller('RatingQuestionsController', ['$rootScope', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'contractService', 'accountService', 'toolsService', 'settingsService', function ($rootScope, $scope, $location, $timeout, $stateParams, $state, settings, contractService, accountService, toolsService, settingsService) {
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

    $scope.RatingQuestions = [];
    $scope.Characteristics = [];
    $scope.Zones = $rootScope.Zones;
    $scope.ZoneTree = $rootScope.ZoneTree;
    $scope.AllZones = $rootScope.AllZones;
    $scope.ConditionZoneTree = $rootScope.ConditionZoneTree;
    $scope.States = [];
    $scope.Forms = [];
    $scope.RatingQuestion = null;
    $scope.newRatingQuestion = false;
    $scope.ErrorMessage = null;
    $scope.Limits = ['Building', 'BPP & Content', 'Business Income', 'IMP/BETT'];


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

    contractService.getCharacteristics().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Characteristics = result.data.Characteristics;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


    contractService.getRatingQuestions($scope.Contract.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.RatingQuestions = result.data.RatingQuestions;
            $scope.TotalRatingQuestions = result.data.Count;

            $scope.TotalPages = Math.ceil($scope.TotalRatingQuestions / 10);
            $scope.CurrentPage = 1;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.searchRatingQuestions = function (contractId, codeNumber, pageNumber, display) {
        contractService.searchRatingQuestions(contractId, codeNumber, pageNumber, display).then(function (result) {
            if (result.data.Result.Success) {
                $scope.RatingQuestions = result.data.RatingQuestions;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.currentTimeout = null;
    $scope.searchNameChanged = function () {
        if ($scope.currentTimeout != null) {
            $timeout.cancel($scope.currentTimeout);
        }
        $scope.currentTimeout = $timeout(function () { $scope.searchRatingQuestions($scope.Contract.Id, $scope.searchName, 0, 0); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchRatingQuestions($scope.Contract.Id, '', $scope.currentPage, 10);
    };



    $scope.addNewRatingQuestion = function () {
        $scope.newRatingQuestion = true;
        $scope.RatingQuestion = new ratingQuestion($scope.Contract.Id);
        $scope.RatingQuestion.AssignedForms = [];
        setupConditionGroups();
    }

    $scope.selectRatingQuestion = function (ratingQuestion) {
        $scope.newRatingQuestion = true;
        $scope.RatingQuestion = $.extend(true, {}, ratingQuestion);

        $scope.RatingQuestion.AssignedForms = [];
        if ($scope.RatingQuestion.Forms != null) {
            for (var i = 0; i < $scope.RatingQuestion.Forms.length; i++) {
                $scope.RatingQuestion.AssignedForms.push($scope.RatingQuestion.Forms[i].FormId);
            }
        }

        setupConditionGroups();
    }

    $scope.deleteRatingQuestion = function (ratingQuestion) {
        contractService.deleteRatingQuestion(ratingQuestion.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.RatingQuestions.splice($.inArray(ratingQuestion, $scope.RatingQuestions), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newConditionalGroup = function () {
        $scope.RatingQuestion.Conditions.push(new ratingQuestion_group_condition($scope.RatingQuestion.Conditions));

        setupConditionGroups();
    }

    $scope.newCondition = function (group) {
        var c = new ratingQuestion_condition(group.GroupIndex);
        group.Conditions.push(c);
    }

    $scope.cancelRatingQuestion = function () {
        $scope.newRatingQuestion = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveRatingQuestion = function () {
        for (var i = 0; i < $scope.RatingQuestion.Conditions.length; i++) {
            for (var j = 0; j < $scope.RatingQuestion.Conditions[i].Conditions.length; j++) {
                var c = $scope.RatingQuestion.Conditions[i].Conditions[j];
                if (c.States != null && typeof c.States != 'string') {
                    c.States = c.States.join(",");
                }

                c.Zones = [];
                if (c.AssignedZones != null) {
                    for (var z = 0; z < c.AssignedZones.length; z++) {
                        c.Zones.push({ ConditionId: c.Id, ZoneId: c.AssignedZones[z].Id });
                    }
                }
            }
        }

        $scope.RatingQuestion.Forms = [];
        for (var i = 0; i < $scope.RatingQuestion.AssignedForms.length; i++) {
            $scope.RatingQuestion.Forms.push({ RatingQuestionId: $scope.RatingQuestion.Id, FormId: $scope.RatingQuestion.AssignedForms[i] });
        }

        var isNew = $scope.RatingQuestion.Id == null;
        contractService.updateRatingQuestion($scope.RatingQuestion).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.RatingQuestions.push(result.data.RatingQuestion);
                }
                else {
                    for (var i = 0; i < $scope.RatingQuestions.length; i++) {
                        if ($scope.RatingQuestions[i].Id == result.data.RatingQuestion.Id) {
                            $scope.RatingQuestions[i] = result.data.RatingQuestion;
                        }
                    }
                }
                // Clean up
                $scope.cancelRatingQuestion();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    //---------------------------------
    // Conditions
    //---------------------------------
    $scope.CharacteristicValues = function (characteristicId) {
        var c = getModel($scope.Characteristics, characteristicId);
        if (c == null) return [];
        return c.Values;
    }


    function setupConditionZones(condition) {
        condition.AssignedZones = [];
        if (condition.Zones != null) {
            for (var i = 0; i < condition.Zones.length; i++) {
                var zone = getZone(condition.Zones[i].ZoneId, $scope.AllZones);

                condition.AssignedZones.push({
                    Id: zone.Id,
                    Name: zone.NameTree
                });
            }
        }
    }

    $scope.selectConditionZoneTree = function (condition) {
        $scope.ActiveConditionZoneTree = condition;
    }

    function setupConditionGroups() {
        if ($scope.RatingQuestion != null && $scope.RatingQuestion.Conditions != null) {
            for (var i = 0; i < $scope.RatingQuestion.Conditions.length; i++) {
                for (var j = 0; j < $scope.RatingQuestion.Conditions[i].Conditions.length; j++) {
                    var c = $scope.RatingQuestion.Conditions[i].Conditions[j];

                    if (c.States != null && typeof c.States == 'string') {
                        c.States = c.States.split(",");
                    }

                    if (c.Apps != null && typeof c.Apps == 'string') {
                        c.Apps = c.Apps.split(",");
                    }

                    setupConditionZones(c);
                }
            }
        }
    }

    $scope.deleteCondition = function (condition, group) {
        group.Conditions.splice($.inArray(condition, group.Conditions), 1);
    }

    $scope.deleteGroup = function (group, list) {
        list.splice($.inArray(group, list), 1);
    }

    $scope.hoverParent = function (event, hovering) {
        if (hovering) {
            $(event.target).parent().parent().parent().parent().addClass('hovering');
        }
        else {
            $(event.target).parent().parent().parent().parent().removeClass('hovering');
        }
    }


    $scope.addSelectedConditionZone = function (condition) {
        var selectedItems = condition.treeInstance.jstree(true).get_selected();

        for (var i = 0; i < selectedItems.length; i++) {
            var zone = getModel($scope.AllZones, selectedItems[i]);

            var parentName = [];
            var cZone = zone;
            while (true) {
                parentName.unshift(cZone.Name);
                cZone = getZoneParent($scope.Zones, cZone.ParentId);
                if (cZone == null) break;
                if (cZone.ParentId == null) {
                    parentName.unshift(cZone.Name); break;
                }
            }
            parentName.pop();
            if (condition.AssignedZones == null) condition.AssignedZones = [];

            var zoneAlreadyIncluded = condition.AssignedZones.some(function (x) { return x.Id === selectedItems[i]; });
            if (zoneAlreadyIncluded) continue;

            condition.AssignedZones.push({
                Id: zone.Id,
                Name: (parentName.length > 0 ? parentName.join(' > ') + ' > ' : '') + zone.Name
            });
        }
    };

    $scope.deleteSelectedConditionZones = function (condition) {
        var selectedZones = condition.SelectedZones;
        condition.AssignedZones = condition.AssignedZones.filter(function (x) {
            return !selectedZones.some(function (y) {
                return y.Id === x.Id;
            });
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

    $scope.ZoneConditionConfig = {
        core: {
            "core": {
                "themes": {
                    "responsive": false
                },
                // so that create works
                "check_callback": true
            },
            "types": {
                "default": {
                    "icon": "fa fa-folder icon-lg"
                },
                "file": {
                    "icon": "fa fa-file icon-lg"
                }
            },
            "plugins": ["state", "types", "wholerow"]
        },
        version: 1
    };

    $scope.reCreateTree = function () {
        $scope.ZoneTreeConfig.version++;
    }

}]);


function ratingQuestion(contractId) {
    return {
        "ContractId": contractId,
        "Conditions": [],
        "Answer": "Yes",
        "RateType": 1
    };
}

function ratingQuestion_group_condition(conditions) {
    var groupIndex = 0;
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i].GroupIndex > groupIndex) groupIndex = conditions[i].GroupIndex;
    }

    return {
        "Name": "Condition " + (groupIndex + 1),
        "GroupIndex": groupIndex + 1,
        "Conditions": [],
        "Zones": []
    };
}

function ratingQuestion_condition(index) {
    return {
        "GroupIndex": index,
        "Zones": []
    };
}




function getZoneParent(children, parentId) {
    var parent = null;

    for (var i = 0; i < children.length; i++) {
        if (parentId == children[i].Id) return children[i];

        if (children[i].Children.length > 0) {
            parent = getZoneParent(children[i].Children, parentId)
        }

        if (parent != null) return parent;
    }

    return parent;
}

function getZone(id, zones) {
    for (var i = 0; i < zones.length; i++) {
        if (id == zones[i].Id) return zones[i];
    }
}

function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}
