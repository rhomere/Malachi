MALACHIAPP.controller('RatesheetController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', '$modal', 'notificationsHub', 'settings', 'contractService', 'accountService', 'toolsService', 'settingsService', function ($rootScope, $scope, $location, $stateParams, $state, $modal, notificationsHub, settings, contractService, accountService, toolsService, settingsService) {
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

    $scope.RateSheets = [];


    $scope.Zones = $rootScope.Zones;
    $scope.ZoneTree = $rootScope.ZoneTree;
    $scope.AllZones = $rootScope.AllZones;
    $scope.ConditionZoneTree = $rootScope.ConditionZoneTree;
    $scope.ActiveConditionZoneTree = null;
    var Characteristics = [];
    $scope.HorizontalCharacteristics = [];
    $scope.VerticalCharacteristics = [];
    $scope.Characteristics = [];
    $scope.rateChanges = {
        Max: 0,
        Current: 0
    };
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


    contractService.getRatesheets($scope.Contract.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.RateSheets = result.data.RateSheets;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });



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
            Characteristics = result.data.Characteristics;
            $scope.HorizontalCharacteristics = $.extend(true, [], Characteristics);
            Characteristics.splice(0, 0, { Id: null, Name: "None" });
            $scope.VerticalCharacteristics = Characteristics;
            $scope.Characteristics = Characteristics;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.rateSheetZones = [];
    $scope.newRateSheet = false;
    $scope.windTable = false;
    $scope.markAsSubmit = false;

    $scope.addSelectedZone = function () {
        var selectedItems = $scope.treeInstance.jstree(true).get_selected();

        for (var i = 0; i < selectedItems.length; i++) {
            var zone = getModel($scope.AllZones, selectedItems[i]);

            if (zoneIsIncluded(zone)) {
                alert('This zone is already in the list, either by it self, or due to a parent zone.');
            }
            else {
                $scope.rateSheetZones.push({
                    Id: zone.Id,
                    Name: zone.NameTree
                });

            }
        }

        // Save Changes
        contractService.updateRateSheetZones($scope.RateSheet.Id, $scope.rateSheetZones).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                notificationsHub.showErrors('Rate Sheet ' + $scope.RateSheet.Name, result.data.Result.Errors);
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    };

    $scope.addSelectedConditionZone = function (condition) {
        var selectedItems = condition.treeInstance.jstree(true).get_selected();
        if (condition.AssignedZones == null) condition.AssignedZones = [];
        for (var i = 0; i < selectedItems.length; i++) {
            var zone = getModel($scope.AllZones, selectedItems[i]);

            var zoneAlreadyIncluded = condition.AssignedZones.some(function (x) { return x.Id === selectedItems[i]; });
            if (zoneAlreadyIncluded) continue;

            condition.AssignedZones.push({
                Id: zone.Id,
                Name: zone.NameTree
            });
        }
    };

    $scope.showRates = function (wind, last) {
        $scope.WindRates = wind;
        $scope.RateSheetTables = [];

        for (var i = 0; i < $scope.RateSheet.RateSheetTables.length; i++) {
            if ($scope.RateSheet.RateSheetTables[i].Wind == wind) {
                if (last == true) {
                    if ($scope.RateSheet.RateSheetTables.length - 1 == i) {
                        $scope.RateSheet.RateSheetTables[i].active = true;
                    }
                    else {
                        $scope.RateSheet.RateSheetTables[i].active = false;
                    }
                }
                else {
                    if (i == 0) {
                        $scope.RateSheet.RateSheetTables[i].active = true;
                    }
                    else
                        $scope.RateSheet.RateSheetTables[i].active = false;
                }
                $scope.RateSheetTables.push($scope.RateSheet.RateSheetTables[i]);

                setupTableConditionGroups($scope.RateSheet.RateSheetTables[i]);
            }
        }

        if (last != true) {
            setTimeout(function () {
                var table = null;
                for (var i = 0; i < $scope.RateSheet.RateSheetTables.length; i++) {
                    if ($scope.RateSheet.RateSheetTables[i].Wind == wind) {
                        columnChange($scope.RateSheet.RateSheetTables[i], true);
                        if (table == null) table = $scope.RateSheet.RateSheetTables[i];
                    }
                }
                $scope.CurrentRateSheetTable = table;
            }, 500);
        }
    }

    $scope.closeRates = function () {
        $scope.RateSheetTables = null;
    }

    $scope.deleteSelectedZones = function () {
        for (var i = 0; i < $scope.selectedRatesheetZones.length; i++) {
            var zone = $scope.selectedRatesheetZones[i];
            $scope.rateSheetZones.splice($.inArray(zone, $scope.rateSheetZones), 1);

            var z = getModel($scope.AllZones, zone.Id);
        }


        // Save Changes
        contractService.updateRateSheetZones($scope.RateSheet.Id, $scope.rateSheetZones).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                notificationsHub.showErrors('Rate Sheet ' + $scope.RateSheet.Name, result.data.Result.Errors);
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }


    $scope.selectConditionZoneTree = function (condition) {
        $scope.ActiveConditionZoneTree = condition;
    }

    $scope.deleteSelectedConditionZones = function (condition) {
        var selectedZones = condition.SelectedZones;
        condition.AssignedZones = condition.AssignedZones.filter(function (x) {
            return !selectedZones.some(function (y) {
                return y.Id === x.Id;
            });
        });
    }

    function zoneIsIncluded(zone) {
        // Each zone can only have one ratesheet!
        return false;
    }

    $scope.getCharacteristicName = function (id) {
        if (id == null) return "None";
        return getModel(Characteristics, id).Name;
    }

    $scope.getCharacteristic = function (id) {
        if (id == null) return {};
        return getModel(Characteristics, id);
    }
    //---------------------------------
    // Rate Sheet
    //---------------------------------   
    $scope.cancelRateSheet = function (ratesheet, dialog) {
        $scope.RateSheet = null;
        $scope.newRateSheet = false;
        $scope.rateSheetZones = [];
        $scope.closeRates();
    }

    $scope.selectRateSheet = function (ratesheet) {
        $scope.RateSheet = ratesheet;
        $scope.newRateSheet = true;
        $scope.rateSheetZones = [];

        contractService.getRateSheet($scope.RateSheet.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.RateSheet = result.data.RateSheet;

                $scope.rateSheetZones = result.data.RateSheet.RateSheetZones;

                for (var i = 0; i < $scope.RateSheet.RateSheetTables.length; i++) {
                    $scope.RateSheet.RateSheetTables[i].RateTable = null;
                    if ($scope.RateSheet.RateSheetTables[i].Wind) $scope.windTable = true;
                }

                setTimeout(function () {
                    for (var i = 0; i < $scope.RateSheet.RateSheetTables.length; i++) {
                        columnChange($scope.RateSheet.RateSheetTables[i]);
                    }
                    $scope.CurrentRateSheetTable = $scope.RateSheet.RateSheetTables[0];
                }, 100);

                setupConditionGroups();
                setupExclusionConditionGroups();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.deleteRateSheet = function (ratesheet) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete ratesheet ' + ratesheet.Name + ' ?',
            buttons: [{
                label: 'Cancel',
                action: function (dialog) {
                    dialog.close();
                }
            }, {
                label: 'Yes',
                cssClass: 'btn-primary',
                action: function (dialog) {
                    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
                    contractService.deleteRateSheet(ratesheet.Id).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.RateSheets.splice($.inArray(ratesheet, $scope.RateSheets), 1);
                            notificationsHub.showSuccess('Rate Sheet', 'Rate Sheet ' + ratesheet.Name + ' is deleted.');
                            $scope.cancelRateSheet();
                        }
                        else {
                            notificationsHub.showError('Rate Sheet Delete', $scope.Errors);
                        }
                        Metronic.unblockUI('.modal-dialog');
                        dialog.close();
                    }, function (error) {
                        notificationsHub.showError('Rate Sheet Delete', 'An unexpected error has occured. Please refresh the page and try again.');
                        Metronic.unblockUI('.modal-dialog');
                        dialog.close();
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }
            }]
        });
    }

    $scope.addNewRateSheet = function () {
        var modalInstance = $modal.open({
            templateUrl: 'newSheetModelContent.html',
            controller: 'newSheetModelCtrl',
            backdrop: 'static',
            size: 'md'
        });

        modalInstance.result.then(function (name) {
            if (name != 'cancel') {
                contractService.newRateSheet($scope.Contract.Id, name).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.RateSheet = result.data.RateSheet;
                        $scope.RateSheet.RateSheetTables = [];
                        $scope.RateSheet.Conditions = [];
                        $scope.RateSheet.Exclusions = [];
                        $scope.newRateSheet = true;

                        setupConditionGroups();
                        setupExclusionConditionGroups();

                        $scope.RateSheets.push(result.data.RateSheet);
                    }
                    else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
        });
    }

    $scope.copyTableTo = function (table, $event) {
        var modalInstance = $modal.open({
            templateUrl: 'copyToRateSheetModel.html',
            controller: 'copyToRateSheetCtrl',
            backdrop: 'static',
            size: 'md',
            resolve: {
                ratesheet: function () {
                    return $scope.RateSheet;
                },
                contract: function () {
                    return $scope.Contract;
                },
                type: function () {
                    return table;
                },
                group: function () {
                    return null;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data.copyTo != null && data.type != null) {
                contractService.copyRateSheetTableTo($scope.RateSheet.Id, data.copyTo.Id, data.type.Id).then(function (result) {
                    // Show the ratesheet table if it is copied onto the ratesheet being modified.
                    if ($scope.RateSheet.Id == data.copyTo.Id) {
                        var table = result.data.Table;

                        // Set up condition groups with zones conditions.
                        var groups = table.Conditions;
                        for (var g = 0; g < groups.length; g++) {
                            var conditions = groups[g].Conditions;
                            for (var c = 0; c < conditions.length; c++) {
                                var condition = conditions[c];
                                setupConditionZones(condition);
                            }
                        }

                        $scope.RateSheet.RateSheetTables.push(table);
                        $scope.RateSheetTables.push(table);
                    }

                    notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Table ' + data.type.Name + ' copied to Rate Sheet ' + data.copyTo.Name);
                }, function (error) {
                    notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
                });
            }
        });

        //$event.stopPropagation();
    }

    $scope.copyGroupTo = function (type, group, $event) {
        var modalInstance = $modal.open({
            templateUrl: 'copyToRateSheetModel.html',
            controller: 'copyToRateSheetCtrl',
            backdrop: 'static',
            size: 'md',
            resolve: {
                ratesheet: function () {
                    return $scope.RateSheet;
                },
                contract: function () {
                    return $scope.Contract;
                },
                type: function () {
                    return type;
                },
                group: function () {
                    return group;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data.copyTo != null && data.type != null) {
                if (type == 'ConditionalRate') {
                    contractService.copyRateSheetConditionTo($scope.RateSheet.Id, data.copyTo.Id, data.group.Id).then(function (result) {
                        if ($scope.RateSheet.Id == data.copyTo.Id) {
                            // Make sure to set up the zone conditions after they have been copied.
                            var conditions = result.data.Group.Conditions;
                            for (var c = 0; c < conditions.length; c++) {
                                var condition = conditions[c];
                                setupConditionZones(condition);
                            }

                            $scope.RateSheet.Conditions.push(result.data.Group);
                        }
                        notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Conditional Rate copied to Rate Sheet ' + data.copyTo.Name);
                    }, function (error) {
                        notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
                    });
                }
                else if (data.type == 'Exclusion') {
                    contractService.copyRateSheetExclusionTo($scope.RateSheet.Id, data.copyTo.Id, data.group.Id).then(function (result) {
                        if ($scope.RateSheet.Id == data.copyTo.Id) {
                            // Make sure to set up the zone conditions after they have been copied.
                            var conditions = result.data.Group.Conditions;
                            for (var c = 0; c < conditions.length; c++) {
                                var condition = conditions[c];
                                setupConditionZones(condition);
                            }

                            $scope.RateSheet.Exclusions.push(result.data.Group);
                        }
                        notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Exclusion copied to Rate Sheet ' + data.copyTo.Name);
                    }, function (error) {
                        notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
                    });
                }
            }
        });
        //$event.stopPropagation();
    }

    $scope.copyTo = function (type, $event) {
        var modalInstance = $modal.open({
            templateUrl: 'copyToRateSheetModel.html',
            controller: 'copyToRateSheetCtrl',
            backdrop: 'static',
            size: 'md',
            resolve: {
                ratesheet: function () {
                    return $scope.RateSheet;
                },
                contract: function () {
                    return $scope.Contract;
                },
                type: function () {
                    return type;
                },
                group: function () {
                    return null;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data.copyTo != null && data.type != null) {
                if (type == 'ConditionalRates') {
                    contractService.copyRateSheetConditionsTo($scope.RateSheet.Id, data.copyTo.Id).then(function (result) {
                        if ($scope.RateSheet.Id === data.copyTo.Id) {
                            var groups = result.data.Groups;
                            for (var i = 0; i < groups.length; i++) {
                                var group = groups[i];
                                $scope.RateSheet.Conditions.push(group);
                            }
                        }
                        notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Conditional Rates copied to Rate Sheet ' + data.copyTo.Name);
                    }, function (error) {
                        notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
                    });
                }
                else if (data.type == 'Exclusions') {
                    contractService.copyRateSheetExclusionsTo($scope.RateSheet.Id, data.copyTo.Id).then(function (result) {
                        if ($scope.RateSheet.Id === data.copyTo.Id) {
                            var groups = result.data.Groups;
                            for (var i = 0; i < groups.length; i++) {
                                var group = groups[i];
                                $scope.RateSheet.Conditions.push(group);
                            }
                        }
                        notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Exclusions copied to Rate Sheet ' + data.copyTo.Name);
                    }, function (error) {
                        notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
                    });
                }
            }
        });
        //$event.stopPropagation();
    }

    $scope.addWindTable = function () {
        var ratesheettable = new rateSheetTable($scope.RateSheet.RateSheetTables, $scope.RateSheet, true);
        ratesheettable.Wind = true;
        ratesheettable.Base = true;
        $scope.windTable = true;
        $scope.RateSheet.RateSheetTables.push(ratesheettable);
    }

    $scope.addTable = function (base, wind) {
        var table = new rateSheetTable($scope.RateSheet.RateSheetTables, $scope.RateSheet, wind);
        table.Base = base;
        table.Wind = wind;


        var modalInstance = $modal.open({
            templateUrl: 'tableModelContent.html',
            controller: 'tableModelCtrl',
            backdrop: 'static',
            size: 'lg',
            resolve: {
                table: function () {
                    return table;
                },
                HorizontalCharacteristics: function () {
                    return $scope.HorizontalCharacteristics;
                },
                VerticalCharacteristics: function () {
                    return $scope.VerticalCharacteristics;
                },
                Characteristics: function () {
                    return Characteristics;
                }
            }
        });

        modalInstance.result.then(function (table) {
            if (table != 'cancel') {
                // Save Changes
                contractService.newRateSheetTable($scope.RateSheet.Id, table).then(function (result) {
                    if (result.data.Result.Success) {
                        result.data.Table.RateSheetTableRates = [];
                        $scope.RateSheet.RateSheetTables.push(result.data.Table);
                        $scope.showRates(wind, true);

                        setTimeout(function () {
                            columnChange(result.data.Table, true);
                        }, 10);
                    }
                    else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
        });
    }

    $scope.copyTable = function (table) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        // Save Changes
        contractService.newRateSheetTable($scope.RateSheet.Id, getRateSheetTable(table)).then(function (result) {
            if (result.data.Result.Success) {
                result.data.Table.RateSheetTableRates = [];
                $scope.RateSheet.RateSheetTables.push(result.data.Table);
                $scope.showRates(result.data.Table.Wind, true);

                setTimeout(function () {
                    columnChange(result.data.Table, true);
                }, 10);
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
            Metronic.unblockUI();
        }, function (error) {
            Metronic.unblockUI();
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }


    $scope.deleteTable = function (table) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this table?',
            buttons: [{
                label: 'Cancel',
                action: function (dialog) {
                    dialog.close();
                }
            }, {
                label: 'Yes',
                cssClass: 'btn-primary',
                action: function (dialog) {
                    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
                    contractService.deleteRateSheetTable(table.Id).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.RateSheet.RateSheetTables.splice($.inArray(table, $scope.RateSheet.RateSheetTables), 1);
                            $scope.RateSheetTables = [];

                            for (var i = 0; i < $scope.RateSheet.RateSheetTables.length; i++) {
                                if ($scope.RateSheet.RateSheetTables[i].Wind == table.Wind) {
                                    if ($scope.RateSheet.RateSheetTables.length - 1 == i) {
                                        $scope.RateSheet.RateSheetTables[i].active = true;
                                    }
                                    else {
                                        $scope.RateSheet.RateSheetTables[i].active = false;
                                    }
                                    $scope.RateSheetTables.push($scope.RateSheet.RateSheetTables[i]);

                                    setupTableConditionGroups($scope.RateSheet.RateSheetTables[i]);
                                }
                            }

                            notificationsHub.showSuccess('Rate Sheet', 'Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name + ' deleted.');
                        }
                        else {
                            notificationsHub.showError('Rate Sheet Table Delete', $scope.Errors);
                        }
                        Metronic.unblockUI('.modal-dialog');
                        dialog.close();
                    }, function (error) {
                        notificationsHub.showError('Rate Sheet Table Delete', 'An unexpected error has occured. Please refresh the page and try again.');
                        Metronic.unblockUI('.modal-dialog');
                        dialog.close();
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }
            }]
        });
    }

    $scope.changeTable = function (table) {
        columnChange(table, true);
    }
    //---------------------------------
    // Rate Sheet Tables
    //---------------------------------
    $scope.fitTable = function (rateSheetTable) {

    }

    $scope.rateTableColumnChange = function (rateSheetTable, oldHorizontalValue, oldVerticalValue) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'By changing the characteristic, you will lose all rates you have entered. Are you sure?',
            buttons: [{
                label: 'Cancel',
                action: function (dialog) {
                    rateSheetTable.HorizontalCharacteristicId = oldHorizontalValue;
                    rateSheetTable.VerticalCharacteristicId = oldVerticalValue;
                    $scope.$apply();
                    dialog.close();
                }
            }, {
                label: 'Yes',
                cssClass: 'btn-primary',
                action: function (dialog) {
                    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
                    contractService.updateRateSheetTable(getRateSheetTable(rateSheetTable)).then(function (result) {
                        if (result.data.Result.Success) {
                            rateSheetTable.RateSheetTableRates = [];
                            columnChange(rateSheetTable);
                        }
                        else {
                            $scope.Errors = result.data.Result.Errors;
                        }
                        Metronic.unblockUI('.modal-dialog');
                        dialog.close();
                    }, function (error) {
                        Metronic.unblockUI('.modal-dialog');
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }
            }]
        });
    }

    function columnChange(rateSheetTable, override) {

        var startRows = 1, startCols = 1, endRows = 1, endCols = 1;

        var data = [];

        // Set horizontal column
        if (rateSheetTable.HorizontalCharacteristicId != null) {
            rateSheetTable.HorizontalCharacteristicId = rateSheetTable.HorizontalCharacteristicId;
            rateSheetTable.HorizontalCharacteristic = getModel($scope.HorizontalCharacteristics, rateSheetTable.HorizontalCharacteristicId);
            startCols = rateSheetTable.HorizontalCharacteristic.Values.length + 1;

            var columns = [''];
            // Add Horizontal Columns
            for (var i = 0; i < rateSheetTable.HorizontalCharacteristic.Values.length; i++) {
                if (rateSheetTable.HorizontalHeaders.indexOf(rateSheetTable.HorizontalCharacteristic.Values[i].Id) >= 0) {
                    columns.push(rateSheetTable.HorizontalCharacteristic.Values[i].Name);
                    endCols++;
                }
            }
            data.push(columns);

            if (rateSheetTable.VerticalCharacteristicId == null) {
                rateSheetTable.VerticalCharacteristic = null;

                columns = [''];
                var l = 0;
                for (var i = 0; i < rateSheetTable.HorizontalCharacteristic.Values.length; i++) {
                    if (rateSheetTable.HorizontalHeaders.indexOf(rateSheetTable.HorizontalCharacteristic.Values[i].Id) >= 0) {
                        columns.push('');
                        for (var k = 0; k < rateSheetTable.RateSheetTableRates.length; k++) {
                            if (rateSheetTable.RateSheetTableRates[k].HorizontalCharacteristicValueId == rateSheetTable.HorizontalCharacteristic.Values[i].Id) {
                                value = rateSheetTable.RateSheetTableRates[k].Rate;
                                columns[l + 1] = value;
                            }
                        }
                        l++;
                    }
                }
                data.push(columns);
            }
        }
        // Set vertical column
        if (rateSheetTable.VerticalCharacteristicId != null) {
            rateSheetTable.VerticalCharacteristicId = rateSheetTable.VerticalCharacteristicId;
            rateSheetTable.VerticalCharacteristic = getModel($scope.VerticalCharacteristics, rateSheetTable.VerticalCharacteristicId);

            startRows = rateSheetTable.VerticalCharacteristic.Values.length + 1;


            // Add Vertical Columns
            for (var i = 0; i < rateSheetTable.VerticalCharacteristic.Values.length; i++) {
                if (rateSheetTable.VerticalHeaders.indexOf(rateSheetTable.VerticalCharacteristic.Values[i].Id) >= 0) {
                    var columns = [rateSheetTable.VerticalCharacteristic.Values[i].Name];

                    for (var j = 0; j < rateSheetTable.HorizontalCharacteristic.Values.length; j++) {
                        if (rateSheetTable.HorizontalHeaders.indexOf(rateSheetTable.HorizontalCharacteristic.Values[j].Id) >= 0) {
                            var value = '';
                            for (var k = 0; k < rateSheetTable.RateSheetTableRates.length; k++) {
                                if (rateSheetTable.RateSheetTableRates[k].HorizontalCharacteristicValueId == rateSheetTable.HorizontalCharacteristic.Values[j].Id &&
                                    rateSheetTable.RateSheetTableRates[k].VerticalCharacteristicValueId == rateSheetTable.VerticalCharacteristic.Values[i].Id) {
                                    value = rateSheetTable.RateSheetTableRates[k].Rate;
                                }
                            }
                            columns.push(value);
                        }
                    }
                    data.push(columns);

                    endRows++;
                }
            }
        }


        if (startRows == 1) startRows++;
        if (endRows == 1) endRows++;

        container = document.getElementById('rateSheetTable_' + rateSheetTable.Id);
        if (container) {
            if (override || rateSheetTable.DOMTable == null)
                rateSheetTable.DOMTable = new Handsontable(container, {});

            rateSheetTable.RateTable = {
                countCols: function () {
                    return this.data[0].length;
                },
                countRows: function () {
                    return this.data.length;
                }
            };

            rateSheetTable.DOMTable.updateSettings({
                data: data,
                rateSheetTable: rateSheetTable,
                fixedRowsTop: 1,
                contextMenu: false,
                startRows: startRows,
                startCols: startCols,
                minRows: endRows,
                maxRows: endRows,
                minCols: endCols,
                maxCols: endCols,
                autoColumnSize: true,
                currentRowClassName: 'currentHandsontableRow',
                currentColClassName: 'currentHandsontableCol',
                height: window.innerHeight - 70,
                cells: function (row, col, prop) {
                    var cellProperties = {};

                    if (row === 0 || col == 0) {
                        cellProperties.renderer = columnRenderer;
                        cellProperties.readOnly = true;
                    }

                    return cellProperties;
                },
                afterChange: function (changes, source) {
                    if (!changes) {
                        return;
                    }
                    var instance = this;
                    $scope.rateChanges.Max += changes.length;

                    var rateSheetTable = $scope.CurrentRateSheetTable;

                    notificationsHub.clear();
                    notificationsHub.showProgress('Rate Update', 'inprogress.html', $scope.rateChanges);


                    $.each(changes, function (index, element) {
                        var change = element;
                        var rowIndex = change[0];
                        var columnIndex = change[1];
                        var oldValue = change[2];
                        var newValue = change[3];
                        var cell = instance.getCell(rowIndex, columnIndex);
                        var hValues = [];

                        for (var i = 0; i < rateSheetTable.HorizontalCharacteristic.Values.length; i++) {
                            if (rateSheetTable.HorizontalHeaders.indexOf(rateSheetTable.HorizontalCharacteristic.Values[i].Id) >= 0) {
                                hValues.push(rateSheetTable.HorizontalCharacteristic.Values[i]);
                            }
                        }

                        var column = hValues[columnIndex - 1];
                        var row = null;
                        if (rateSheetTable.VerticalCharacteristicId != null) {
                            var vValues = [];
                            for (var i = 0; i < rateSheetTable.VerticalCharacteristic.Values.length; i++) {
                                if (rateSheetTable.VerticalHeaders.indexOf(rateSheetTable.VerticalCharacteristic.Values[i].Id) >= 0) {
                                    vValues.push(rateSheetTable.VerticalCharacteristic.Values[i]);
                                }
                            }

                            row = vValues[rowIndex - 1];
                            for (var k = 0; k < rateSheetTable.RateSheetTableRates.length; k++) {
                                if (column.Id == rateSheetTable.RateSheetTableRates[k].HorizontalCharacteristicValueId &&
                                    row.Id == rateSheetTable.RateSheetTableRates[k].VerticalCharacteristicValueId) {
                                    rateModel = rateSheetTable.RateSheetTableRates[k];
                                    break;
                                }
                            }
                        }
                        else {
                            var rateModel = null;
                            for (var k = 0; k < rateSheetTable.RateSheetTableRates.length; k++) {
                                if (column.Id == rateSheetTable.RateSheetTableRates[k].HorizontalCharacteristicValueId) {
                                    rateModel = rateSheetTable.RateSheetTableRates[k];
                                    break;
                                }
                            }
                        }

                        if (rateModel == null) {
                            rateModel = {
                                Id: null,
                                RateSheetTableId: rateSheetTable.Id,
                                HorizontalCharacteristicValueId: column.Id,
                                VerticalCharacteristicValueId: row == null ? null : row.Id
                            }
                        }

                        rateModel.Rate = newValue;

                        if ((newValue == '' || newValue == null) && (oldValue != '' && oldValue != null)) {
                            if (rateModel.Id != null) {
                                // Delete
                                contractService.deleteRateSheetRate(rateModel.Id).then(function (result) {
                                    if (result.data.Result.Success) {
                                        $scope.rateChanges.Current++;
                                    }
                                    else {
                                        $scope.rateChanges.Current++;
                                        $scope.Errors = result.data.Result.Errors;
                                    }
                                    if ($scope.rateChanges.Current == $scope.rateChanges.Max) {
                                        $scope.rateChanges.Current = $scope.rateChanges.Max = 0;
                                        notificationsHub.clear();
                                        notificationsHub.showSuccess('Rate Sheet ' + rateSheetTable.Name, 'Rates Saved');
                                    }
                                }, function (error) {
                                    if ($scope.rateChanges.Current == $scope.rateChanges.Max) {
                                        $scope.rateChanges.Current = $scope.rateChanges.Max = 0;
                                        notificationsHub.clear();
                                    }
                                    $scope.rateChanges.Current++;
                                    notificationsHub.showError('An unexpected error has occured. Please refresh the page.');
                                });
                            }
                        } else {
                            // Save Changes
                            contractService.saveRateSheetRate(rateSheetTable.Id, rateModel).then(function (result) {
                                if (result.data.Result.Success) {
                                    $scope.rateChanges.Current++;

                                    if (result.data.Rate != null) {
                                        if (rateModel.Id == null) {
                                            rateSheetTable.RateSheetTableRates.push(rateModel);
                                        }
                                        rateModel.Id = result.data.Rate.Id;
                                    } else {
                                        if (rateModel.Id != null) {
                                            rateSheetTable.RateSheetTableRates.splice($.inArray(rateModel, rateSheetTable.RateSheetTableRates), 1); 
                                        }
                                    }
                                }
                                else {
                                    $scope.rateChanges.Current++;
                                    $scope.Errors = result.data.Result.Errors;
                                    notificationsHub.showError('Rates did not save.');
                                }

                                if ($scope.rateChanges.Current == $scope.rateChanges.Max) {
                                    $scope.rateChanges.Current = $scope.rateChanges.Max = 0;
                                    notificationsHub.clear();
                                    notificationsHub.showSuccess('Rate Sheet ' + rateSheetTable.Name, 'Rates Saved');
                                }
                            }, function (error) {
                                $scope.rateChanges.Current++;
                                if ($scope.rateChanges.Current == $scope.rateChanges.Max) {
                                    $scope.rateChanges.Current = $scope.rateChanges.Max = 0;
                                    notificationsHub.clear();
                                }
                                notificationsHub.showError('An unexpected error has occured. Please refresh the page.');
                            });
                        }

                    });
                }
            });

            rateSheetTable.RateTable.data = data;
        }

        $scope.RateTable = rateSheetTable.RateTable;
        $scope.CurrentRateSheetTable = rateSheetTable;

    }

    function allowedRenderer(instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        td.style.background = '#fff';
    }

    function submitRenderer(instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        td.style.background = '#f7ad85';
    }

    function columnRenderer(instance, td, row, col, prop, value, cellProperties) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        td.style.fontWeight = 'bold';
        td.style.background = '#EEE';
    }

    function getRateSheetTable(table) {

        if (table.Conditions != null) {
            for (var i = 0; i < table.Conditions.length; i++) {
                for (var j = 0; j < table.Conditions[i].Conditions.length; j++) {
                    var c = table.Conditions[i].Conditions[j];
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
        }

        return {
            Id: table.Id,
            Name: table.Name,
            Base: table.Base,
            Wind: table.Wind,
            RateTerm: table.RateTerm,
            FlatCharge: table.FlatCharge,
            WindIncludedInRate: table.WindIncludedInRate,
            RateSheetId: table.RateSheetId,
            HorizontalCharacteristicId: table.HorizontalCharacteristicId,
            VerticalCharacteristicId: table.VerticalCharacteristicId,
            IsVerticalMinMax: table.IsVerticalMinMax,
            IsHorizontalMinMax: table.IsHorizontalMinMax,
            VerticalHeaders: table.VerticalHeaders,
            HorizontalHeaders: table.HorizontalHeaders,
            Limits: table.Limits,
            Conditions: table.Conditions,
            FactorType: table.FactorType
        };
    }

    function getRateSheet(ratesheet) {
        return {
            Id: ratesheet.Id,
            Limits: ratesheet.Limits
        };
    }

    //---------------------------------
    // Exclusion Conditions
    //---------------------------------
    $scope.CharacteristicValues = function (characteristicId) {
        var c = getModel($scope.Characteristics, characteristicId);
        if (c == null) return [];
        return c.Values;
    }

    $scope.newConditionalGroup = function (wind) {
        var group = new ratesheet_group_condition($scope.RateSheet.Conditions, wind);
        contractService.newRateSheetConditionRateGroup($scope.RateSheet.Id, group).then(function (result) {
            if (result.data.Result.Success) {
                $scope.RateSheet.Conditions.push(result.data.Group);
                setupConditionGroups();
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.newCondition = function (group) {
        var c = new ratesheet_condition(group.GroupIndex, group.Wind);

        contractService.newRateSheetConditionRateCondition(group.Id, c).then(function (result) {
            if (result.data.Result.Success) {
                group.Conditions.push(result.data.Condition);

                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.newTableConditionalGroup = function (table) {
        if (table.Conditions == null) table.Conditions = [];
        var group = new ratesheet_group_table_condition(table.Conditions);

        contractService.newRateSheetTableConditionGroup(table.Id, group).then(function (result) {
            if (result.data.Result.Success) {
                table.Conditions.push(result.data.Group);
                setupTableConditionGroups(table);
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'Rate Sheet Table Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.newTableCondition = function (table, group) {
        var c = new ratesheet_table_condition(group.GroupIndex);

        contractService.newRateSheetTableCondition(group.Id, c).then(function (result) {
            if (result.data.Result.Success) {
                group.Conditions.push(result.data.Condition);

                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'Rate Sheet Table Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.newExclusionGroup = function (wind) {
        var group = new ratesheet_exclusion_group_condition($scope.RateSheet.Exclusions, wind);
        $scope.RateSheet.Exclusions.push();

        contractService.newRateSheetExclusionGroup($scope.RateSheet.Id, group).then(function (result) {
            if (result.data.Result.Success) {
                $scope.RateSheet.Exclusions.push(result.data.Group);
                setupExclusionConditionGroups();
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.newExclusion = function (group) {
        var c = new ratesheet_exclusion(group.GroupIndex, group.Wind);

        contractService.newRateSheetExclusion(group.Id, c).then(function (result) {
            if (result.data.Result.Success) {
                group.Conditions.push(result.data.Condition);

                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }


    $scope.updateConditionGroup = function (group) {
        var g = $.extend(true, {}, group);
        for (var i = 0; i < g.Conditions.length; i++) {
            var c = g.Conditions[i];
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
        contractService.updateRateSheetConditionRateGroup(g).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }


    $scope.updateCondition = function (condition) {
        var c = $.extend(true, {}, condition);
        if (c.States != null && typeof c.States != 'string') {
            c.States = c.States.join(",");
        }
        if (c.Apps != null && typeof c.Apps != 'string') {
            c.Apps = c.Apps.join(",");
        }
        c.Zones = [];
        if (c.AssignedZones != null) {
            for (var z = 0; z < c.AssignedZones.length; z++) {
                c.Zones.push({ ConditionId: c.Id, ZoneId: c.AssignedZones[z].Id });
            }
        }
        contractService.updateRateSheetConditionRate(c).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.updateExclusionGroup = function (group) {
        contractService.updateRateSheetExclusionGroup(group).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.updateExclusion = function (condition) {
        var c = $.extend(true, {}, condition);
        if (c.States != null && typeof c.States != 'string') {
            c.States = c.States.join(",");
        }
        if (c.Apps != null && typeof c.Apps != 'string') {
            c.Apps = c.Apps.join(",");
        }
        c.Zones = [];
        if (c.AssignedZones != null) {
            for (var z = 0; z < c.AssignedZones.length; z++) {
                c.Zones.push({ ConditionId: c.Id, ZoneId: c.AssignedZones[z].Id });
            }
        }
        contractService.updateRateSheetExclusion(c).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }


    $scope.updateTableConditionGroup = function (group) {
        contractService.updateRateSheetTableConditionGroup(group).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.updateTableCondition = function (condition) {
        var c = $.extend(true, {}, condition);
        if (c.States != null && typeof c.States != 'string') {
            c.States = c.States.join(",");
        }
        if (c.Apps != null && typeof c.Apps != 'string') {
            c.Apps = c.Apps.join(",");
        }
        c.Zones = [];
        if (c.AssignedZones != null) {
            for (var z = 0; z < c.AssignedZones.length; z++) {
                c.Zones.push({ ConditionId: c.Id, ZoneId: c.AssignedZones[z].Id });
            }
        }
        contractService.updateRateSheetTableCondition(c).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }


    $scope.deleteCondition = function (condition, group) {
        contractService.deleteRateSheetConditionRate(condition.Id).then(function (result) {
            if (result.data.Result.Success) {
                group.Conditions.splice($.inArray(condition, group.Conditions), 1);

                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.deleteGroup = function (group, list) {
        contractService.deleteRateSheetConditionRateGroup(group.Id).then(function (result) {
            if (result.data.Result.Success) {
                list.splice($.inArray(group, list), 1);

                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.deleteExclusion = function (condition, group) {
        contractService.deleteRateSheetExclusion(condition.Id).then(function (result) {
            if (result.data.Result.Success) {
                group.Conditions.splice($.inArray(condition, group.Conditions), 1);

                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.deleteExclusionGroup = function (group, list) {
        contractService.deleteRateSheetExclusionGroup(group.Id).then(function (result) {
            if (result.data.Result.Success) {
                list.splice($.inArray(group, list), 1);

                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.deleteTableCondition = function (condition, group, table) {
        contractService.deleteRateSheetTableCondition(condition.Id).then(function (result) {
            if (result.data.Result.Success) {
                group.Conditions.splice($.inArray(condition, group.Conditions), 1);
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'Rate Sheet Table Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.deleteTableConditionGroup = function (group, list, table) {

        contractService.deleteRateSheetTableConditionGroup(group.Id).then(function (result) {
            if (result.data.Result.Success) {
                list.splice($.inArray(group, list), 1);
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'Rate Sheet Table Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }


    function setupExclusionConditionGroups() {
        if ($scope.RateSheet.Exclusions != null) {
            for (var i = 0; i < $scope.RateSheet.Exclusions.length; i++) {
                for (var j = 0; j < $scope.RateSheet.Exclusions[i].Conditions.length; j++) {
                    var c = $scope.RateSheet.Exclusions[i].Conditions[j];

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

    function setupConditionGroups() {
        if ($scope.RateSheet.Conditions != null) {
            for (var i = 0; i < $scope.RateSheet.Conditions.length; i++) {
                for (var j = 0; j < $scope.RateSheet.Conditions[i].Conditions.length; j++) {
                    var c = $scope.RateSheet.Conditions[i].Conditions[j];

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

    function setupTableConditionGroups(table) {
        if (table.Conditions != null) {
            for (var i = 0; i < table.Conditions.length; i++) {
                for (var j = 0; j < table.Conditions[i].Conditions.length; j++) {
                    var c = table.Conditions[i].Conditions[j];

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

    $scope.hoverParent = function (event, hovering) {
        if (hovering) {
            $(event.target).parent().parent().parent().parent().addClass('hovering');
        }
        else {
            $(event.target).parent().parent().parent().parent().removeClass('hovering');
        }
    }

    $scope.updateTable = function (table) {
        contractService.updateRateSheetTable(getRateSheetTable(table)).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'Rate Sheet Table Updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name + ' Table ' + table.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.updateRateSheet = function (rateSheet) {
        contractService.updateRateSheet(getRateSheet(rateSheet)).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }

    $scope.updateRateSheetName = function (rateSheet) {
        contractService.updateRateSheetName(rateSheet.Id, rateSheet.Name).then(function (result) {
            if (result.data.Result.Success) {
                notificationsHub.showSuccess('Rate Sheet ' + $scope.RateSheet.Name, 'Rate Sheet Updated.');
            }
            else {
                notificationsHub.showErrors('Rate Sheet ' + $scope.RateSheet.Name, result.data.Result.Errors);
            }
        }, function (error) {
            notificationsHub.showError('Rate Sheet ' + $scope.RateSheet.Name, 'An unexpected error has occured. Please refresh the page.');
        });
    }
    //---------------------------------
    // jS Tree
    //---------------------------------
    function refreshjsTree() {
        $scope.reCreateTree();
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

    $scope.ZoneTreeConfig = {
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

    refreshjsTree();
}]);


MALACHIAPP.controller('copyToRateSheetCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'contractService', 'notificationsHub', '$modalInstance', '$http', 'settings', 'ratesheet', 'contract', 'type', 'group', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, contractService, notificationsHub, $modalInstance, $http, settings, ratesheet, contract, type, group) {
    $scope.RateSheets = [];
    $scope.Contracts = [];
    $scope.Type = type;
    $scope.group = group;
    $scope.copyTo = {};

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.copy = function () {
        if ($scope.copyTo.RateSheet != null && $scope.copyTo.RateSheet.Id != null) {
            $modalInstance.close({ copyTo: $scope.copyTo.RateSheet, type: $scope.Type, group: $scope.group });
        }
    }

    contractService.getContractsWithRateSheets().then(function (result) {
        if (result.data.Result.Success) {
            $scope.Contracts = result.data.Contracts;

            for (var i = 0; i < $scope.Contracts.length; i++) {
                if ($scope.Contracts[i].Id == contract.Id) {
                    $scope.copyTo.Contract = $scope.Contracts[i];
                    return;
                }
            }
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


}]);

MALACHIAPP.directive('rateChanges',
[
    function() {
        return {
            template:
                "<progressbar class='progress-striped active' max='directiveData.rateChanges.' value='directiveData.rateChanges.Current' type='warning'><i>{{directiveData.rateChanges.Current}}/{{directiveData.rateChanges.Max}} Rate Changes</i></progressbar> "
        };
    }
]);



MALACHIAPP.controller('newSheetModelCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings) {
    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.save = function () {
        $modalInstance.close($scope.name);
    }
}]);

MALACHIAPP.controller('tableModelCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'table', 'HorizontalCharacteristics', 'VerticalCharacteristics', 'Characteristics', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, table, HorizontalCharacteristics, VerticalCharacteristics, Characteristics) {
    $scope.table = table;
    $scope.HorizontalCharacteristics = HorizontalCharacteristics;
    $scope.VerticalCharacteristics = VerticalCharacteristics;
    $scope.checkAllH = false;
    $scope.checkAllV = false;

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.save = function () {
        $modalInstance.close($scope.table);
    }


    $scope.getCharacteristic = function (id) {
        if (id == null) return {};
        return getModel(Characteristics, id);
    }

    $scope.checkAllHorizontal = function () {
        $scope.table.HorizontalHeaders = $scope.HorizontalCharacteristicValues.map(function (item) { return item.Id; });
    }


    $scope.checkAllVertical = function () {
        $scope.table.VerticalHeaders = $scope.VerticalCharacteristicValues.map(function (item) { return item.Id; });
    }

    $scope.UpdateHorizontalCharacteristics = function () {
        $scope.table.HorizontalHeaders = [];
        if ($scope.table.HorizontalCharacteristicId != null) {
            var horizontalCharacteristic = getModel($scope.HorizontalCharacteristics, $scope.table.HorizontalCharacteristicId);
            $scope.HorizontalCharacteristicValues = [];
            // Add Horizontal Columns
            for (var i = 0; i < horizontalCharacteristic.Values.length; i++) {
                $scope.HorizontalCharacteristicValues.push(horizontalCharacteristic.Values[i]);
            }
        }
    }

    $scope.UpdateVerticalCharacteristics = function () {
        $scope.table.VerticalHeaders = [];
        if ($scope.table.VerticalCharacteristicId != null) {
            var verticalCharacteristic = getModel($scope.VerticalCharacteristics, $scope.table.VerticalCharacteristicId);
            $scope.VerticalCharacteristicValues = [];
            // Add Vertical Columns
            for (var i = 0; i < verticalCharacteristic.Values.length; i++) {
                $scope.VerticalCharacteristicValues.push(verticalCharacteristic.Values[i]);
            }
        }
    }
}]);

    
function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}

function rateSheet(ratesheets, contract) {
    return {
        "ContractId": contract.Id,
        "Name": "",
        "RateSheetTables": [],
        "Conditions": [],
        "Exclusions": []
    };
}

function rateSheetTable(rateSheetTables, rateSheet) {
    return {
        "RateSheetId": rateSheet.Id,
        "Wind": false,
        "Base": rateSheetTables.length == 0,
        "HorizontalCharacteristicId": null,
        "VerticalCharacteristicId": null,
        "RateSheetTableRates": [],
        "Limits": ["Building", "BPP & Content", "Business Income", "IMP/BETT"],
    };
}

function rateSheetTableRate(rateSheetTableRates, rateSheetTable) {
    return {
        "RateSheetTableId": rateSheetTable.Id,
        "HorizontalCharacteristicValueId": 1,
        "VerticalCharacteristicValueId": null,
        "Submit": false,
        "Rate": 0
    };
}

function ratesheet_exclusion_group_condition(conditions, wind) {
    var groupIndex = 0;
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i].GroupIndex > groupIndex) groupIndex = conditions[i].GroupIndex;
    }


    return {
        "Name": "Condition " + (groupIndex + 1),
        "GroupIndex": groupIndex + 1,
        "Conditions": [],
        "Wind": wind,
        "Zones": []
    };
}

function ratesheet_exclusion(index, wind) {
    return {
        "GroupIndex": index,
        "Wind": wind,
        "Zones": []
    };
}


function ratesheet_group_condition(conditions, wind) {
    var groupIndex = 0;
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i].GroupIndex > groupIndex) groupIndex = conditions[i].GroupIndex;
    }

    return {
        "Name": "Condition " + (groupIndex + 1),
        "GroupIndex": groupIndex + 1,
        "Conditions": [],
        "Wind": wind,
        "RateType": 0,
        "Limits": ["Building", "BPP & Content", "Business Income", "IMP/BETT"],
        "Zones": []
    };
}

function ratesheet_condition(index, wind) {
    return {
        "GroupIndex": index,
        "Wind": wind,
        "RateType": 0,
        "Zones": []
    };
}

function ratesheet_group_table_condition(conditions) {
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

function ratesheet_table_condition(index) {
    return {
        "GroupIndex": index,
        "RateType": 0,
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
