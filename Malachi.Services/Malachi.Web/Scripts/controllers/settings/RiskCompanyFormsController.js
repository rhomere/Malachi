MALACHIAPP.controller('RiskCompanyFormsController', ['$rootScope', '$scope', '$location', '$timeout', '$stateParams', '$state', 'settings', 'sharedService', 'riskCompanyService', 'contractService', 'formsService', 'accountService', 'toolsService', 'notificationsHub', 'settingsService', function ($rootScope, $scope, $location, $timeout, $stateParams, $state, settings, sharedService, riskCompanyService, contractService, formsService, accountService, toolsService, notificationsHub, settingsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.RiskCompany = $stateParams.RiskCompany;
    if ($scope.RiskCompany == null) {
        $state.transitionTo('riskcompanies');
        return;
    }

    $scope.Forms = [];
    $scope.Characteristics = [];
    $scope.Zones = $rootScope.Zones;
    $scope.ZoneTree = $rootScope.ZoneTree;
    $scope.AllZones = $rootScope.AllZones;
    $scope.ConditionZoneTree = $rootScope.ConditionZoneTree;
    $scope.States = [];
    $scope.Forms = [];
    $scope.Form = null;
    $scope.newForm = false;
    $scope.ErrorMessage = null;

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
            $scope.Coverages.unshift({ Id: null, Name: "Interline" });
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

    contractService.getAllContracts(true).then(function (result) {
        if (result.data.Result.Success) {
            $scope.Contracts = result.data.Contracts;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    riskCompanyService.getForms($scope.RiskCompany.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.Forms = result.data.Forms;
            $scope.TotalForms = result.data.Count;

            $scope.TotalPages = Math.ceil($scope.TotalForms / 10);
            $scope.CurrentPage = 1;
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.searchRiskCompanyForms = function (codeNumber, pageNumber, display) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        riskCompanyService.searchForms($scope.RiskCompany.Id, codeNumber, pageNumber, display).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Forms = result.data.Forms;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
            Metronic.unblockUI();
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.currentTimeout = null;
    $scope.searchNameChanged = function () {
        if ($scope.currentTimeout != null) {
            $timeout.cancel($scope.currentTimeout);
        }
        $scope.currentTimeout = $timeout(function () { $scope.searchRiskCompanyForms($scope.searchName, 1, 10); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchRiskCompanyForms('', $scope.currentPage, 10);
    };

    $scope.addNewForm = function () {
        $scope.Errors = [];
        $scope.newForm = true;
        $scope.Form = new form($scope.RiskCompany.Id);
        $scope.Form.AssignedForms = [];
        $scope.Form.Conditions = [];

        // default the Optional Property to True
        $scope.Form.Optional = true;

        setupConditionGroups();
    }

    $scope.selectForm = function (form) {
        $scope.Errors = [];
        $scope.newForm = true;
        $scope.Form = $.extend(true, {}, form);
        setDate($scope.Form);

        if ($scope.Form.Conditions == null) $scope.Form.Conditions = [];

        $scope.AllForms = [{
            Id: $scope.Form.FormId,
            Number: $scope.Form.Number,
            Edition: $scope.Form.Edition,
            Description: $scope.Form.Description
        }];

        setupConditionGroups();
    }

    $scope.deleteForm = function (form) {
        riskCompanyService.deleteForm(form.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Forms.splice($.inArray(form, $scope.Forms), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newConditionalGroup = function () {
        $scope.Form.Conditions.push(new form_group_condition($scope.Form.Conditions));

        setupConditionGroups();
    }

    $scope.newCondition = function (group) {
        var c = new form_condition(group.GroupIndex);
        group.Conditions.push(c);
    }

    $scope.cancelForm = function () {
        $scope.Errors = [];
        $scope.newForm = false;
        $scope.ErrorMessage = null;
    }

    $scope.saveForm = function () {
        $scope.Errors = [];
        // Check if dates are valid
        if (sharedService.validateDate($scope.Form.Effective) == false) {
            $scope.Errors = ['The effective date is not a valid date. Please check the calendar.'];
            return;
        }

        if (sharedService.validateDate($scope.Form.Expiration) == false) {
            $scope.Errors = ['The expiration date is not a valid date. Please check the calendar.'];
            return;
        }

        if ($scope.Form.Conditions != null) {
            for (var i = 0; i < $scope.Form.Conditions.length; i++) {
                for (var j = 0; j < $scope.Form.Conditions[i].Conditions.length; j++) {
                    var c = $scope.Form.Conditions[i].Conditions[j];
                    if (c.States != null && typeof c.States != 'string') {
                        c.States = c.States.join(",");
                    }

                    if (c.Apps != null && typeof c.Apps != 'string') {
                        c.Apps = c.Apps.join(",");
                    }

                    if (c.ConditionName == 'Insurance Score') {
                        if (c.ConditionValue && typeof c.ConditionValue != 'string') {
                            c.ConditionValue = c.ConditionValue.join(",");
                        }
                    }

                    if (c.AdditionalCoverages && typeof c.AdditionalCoverages != 'string') {
                        c.AdditionalCoverages = c.AdditionalCoverages.join(",");
                    }

                    c.Zones = [];
                    if (c.AssignedZones != null) {
                        for (var z = 0; z < c.AssignedZones.length; z++) {
                            c.Zones.push({ ConditionId: c.Id, ZoneId: c.AssignedZones[z].Id });
                        }
                    }
                }
            }
        }

        var isNew = $scope.Form.Id == null;
        riskCompanyService.updateForm($scope.Form).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Forms.push(result.data.Form);
                }
                else {
                    for (var i = 0; i < $scope.Forms.length; i++) {
                        if ($scope.Forms[i].Id == result.data.Form.Id) {
                            $scope.Forms[i] = result.data.Form;
                        }
                    }
                }
                // Clean up
                $scope.cancelForm();
            }
            else {
                notificationsHub.showErrors('Forms', result.data.Result.Errors);
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    function setDate(form) {
        if (form.Effective != null && form.Expiration != null) {
            if (form.Effective.indexOf("-") > -1) {
                var date = moment(form.Effective, "YYYY-MM-DD").toDate();
                var day = date.getUTCDate();
                var monthIndex = date.getMonth() + 1;
                var year = date.getFullYear();

                form.Effective = monthIndex + '/' + day + '/' + year;

                date = moment(form.Expiration, "YYYY-MM-DD").toDate();
                day = date.getUTCDate();
                monthIndex = date.getMonth() + 1;
                year = date.getFullYear();

                form.Expiration = monthIndex + '/' + day + '/' + year;
            }
        }
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
        if ($scope.Form != null && $scope.Form.Conditions != null) {
            for (var i = 0; i < $scope.Form.Conditions.length; i++) {
                for (var j = 0; j < $scope.Form.Conditions[i].Conditions.length; j++) {
                    var c = $scope.Form.Conditions[i].Conditions[j];

                    if (c.States != null && typeof c.States == 'string') {
                        c.States = c.States.split(",");
                    }

                    if (c.Apps != null && typeof c.Apps == 'string') {
                        c.Apps = c.Apps.split(",");
                    }

                    if (c.AdditionalCoverages != null && typeof c.AdditionalCoverages == 'string') {
                        c.AdditionalCoverages = c.AdditionalCoverages.split(",");
                    }

                    if (c.ConditionName == 'Insurance Score') {
                        if (c.ConditionValue != null && typeof c.ConditionValue == 'string') {
                            c.ConditionValue = c.ConditionValue.split(",");
                        }
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

    $scope.refreshForms = function (name) {
        return formsService.searchForms(name, 1, 10).then(function (result) {
            if (result.data.Result.Success) {
                $scope.AllForms = result.data.Forms;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    };
}]);


function form(riskCompanyId) {
    return {
        "RiskCompanyId": riskCompanyId,
        "Conditions": []
    };
}

function form_group_condition(conditions) {
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

function form_condition(index) {
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
