'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Homeowners_PropertyController', ['authService', '$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', 'settings', 'policyService', 'toolsService', '$filter', '$sce', function (authService, $rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, settings, policyService, toolsService, $filter, $sce) {
    $scope.parent = $scope.$parent;
    $scope.AppId = $scope.parent.AppId;
    $scope.PolicyId = $scope.parent.PolicyId;
    $scope.Policy = $scope.parent.Policy;
    $scope.Characteristics = [];
    $scope.Locations = [];
  $scope.Mortgagees = [];
  $scope.LossPayees = [];
    $scope.PropertyDeductibles = [];
    $scope.PropertyAdditionalCoverages = [];
    $scope.PropertySublimits = [];
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
    $scope.PropertyWindCoverageType = {};
    $scope.ErrorList = [];

    if ($scope.AppId == null) {
        $rootScope.$state.transitionTo('policyDashboard');
    }

    if ($scope.PolicyId) { // Existing Policy
        loadProperty();
    }
    else {
        $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
    }

    //Property
    function loadProperty() {
        $scope.Policy = $scope.parent.Policy;
        $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;

        $scope.Mortgagees = [];
        $scope.PropertyDeductibles = [];
        $scope.PropertyAdditionalCoverages = [];
        $scope.PropertySublimits = [];
        $scope.ErrorList = [];

        for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
            var location = $scope.Policy.CurrentVersion.Locations[i];
            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];
                for (var k = 0; k < property.Mortgagees.length; k++) {
                    $scope.Mortgagees.push(property.Mortgagees[k]);
                }

                for (var k = 0; k < property.Deductibles.length; k++) {
                    $scope.PropertyDeductibles.push(property.Deductibles[k]);
                }

                for (var k = 0; k < property.Sublimits.length; k++) {
                    $scope.PropertySublimits.push(property.Sublimits[k]);
                }

                for (var k = 0; k < property.AdditionalCoverages.length; k++) {
                    $scope.PropertyAdditionalCoverages.push(property.AdditionalCoverages[k]);
                }
            }
        }

        for (var j = 0; j < $scope.Locations.length; j++) {
            var loc = $scope.Locations[j];
            loc.TIV = 0;
            for (var i = 0; i < loc.Properties.length; i++) {
                loc.Properties[i].TIV = 0;

                for (var k = 0; k < loc.Properties[i].Limits.length; k++) {
                    if (loc.Properties[i].Limits[k].LimitName != 'Coverage E' && loc.Properties[i].Limits[k].LimitName != 'Coverage F') {
                        loc.Properties[i].TIV += loc.Properties[i].Limits[k].Amount;
                    }
                }

                loc.TIV += loc.Properties[i].TIV;
            }
        }

        $scope.parent.LoadingPage = false;

        $scope.Characteristics = {
            'Personal Liability': [
                0,
                100000,
                300000
            ],
            'Extended Liabiltiy': [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"
            ],
            'Medical Payments': [
                0,
                1000,
                2000,
                3000,
                4000,
                5000
            ],
            'Wind Deductible': [
                "Non Applicable",
                "1%",
                "2%",
                "3%",
                "5%",
                "10%"
            ],
            'Named Storm Deductible': [
                "Non Applicable",
                "1%",
                "2%",
                "3%",
                "5%",
                "10%"
            ],
            'All Other Wind Deductible': [
                "Non Applicable",
                "1%",
                "2%",
                "3%",
                "5%",
                "10%"
            ],
            'Wind Deductible Type': [
                "Hurricane",
                "Wind & Hail"
            ],
            'AOP Deductible': [
                "2500",
                "5000",
                "10000",
                "25000",
            ],
            'Occupied By': [
                "Owner Occupied",
                "Unknown"
            ],
            'Occupancy': [
                "Primary", "Secondary", "Seasonal"
            ],
            'Rented To Others': [
                "Yes", "No"
            ],
            'Construction': [
                "Frame",
                "Pole Frame",
                "Wood",
                "Metal",
                "Frame/Steel",
                "Concrete",
                "Concrete/Steel",
                "Brick/Concrete",
                "Concrete Block",
                "Brick",
                "Stone/Rock",
                "Adobe",
                "Log",
                "Manufactured/Modular",
                "Tilt-up Concrete",
                "Arched/Dome",
                "Combination",
                "Unknown"
            ],
            'Sprinklered': [
                "Yes",
                "No",
                "Unknown"
            ],
            'Fire Place': [
                "Yes",
                "No",
                "Unknown"
            ],
            'Protection Class': [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"
            ],
            'Central Station Alarm': [
                "Yes",
                "No",
                "Unknown"
            ],
            'Central Burglar Alarm': [
                "Yes",
                "No",
                "Unknown"
            ],
            'Fire Station Five Miles': [
                "Yes",
                "No"
            ],
            'Fire Hydrant Thousand Feet': [
                "Yes",
                "No"
            ],
            'Year Built': [],
            'Year Upgrade': [],
            'Year Refurbished': [],
            'Extended Replacement Costs': [
                "0%",
                "25%",
                "50%"
            ],
            'Ordinance And Law': [
                "Included",
                "Excluded"
            ],
            'Personal Property Replacement Costs': [
                "Excluded",
                "Included"
            ],
            'Personal Injury': [
                "Included",
                "Excluded"
            ],
            'Off Premises Theft Buyback': [
                "Included",
                "Excluded"
            ],
            'Increased Loss Assessment': [
                "$0",
                "$5,000",
                "$10,000"
            ],
            'Mold': [
                "Excluded",
                "$5,000",
                "$10,000"
            ],
            'Water Backup': [
                "Excluded",
                "$5,000",
                "$10,000",
                "$20,000",
                "$25,000"
            ],
            'Earthquake': [
                "Excluded", "Included"
            ],
            'LLC or Trust': [
                "No", "Yes"
            ],
            'Renovation': [
                "No", "Yes"
            ],
            'For Sale': [
                "No", "Yes"
            ],
            'Prior Insurance': [
                "No prior insurance",
                "Prior insurance",
                "Brand-new purchase"
            ],
            'Primary Flood': [
                "No", "Yes", "Unknown"
            ],
            'Number of Stories': [
                "1", "2", "3", "4", "Unknown"
            ],
            'Number of Bathrooms': [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10 +",
                "Unknown"
            ],
            'Roof Age': [
                "0-5 years",
                "11 years or more",
                "6-10 years",
                "Obvious signs of deterioration and distress",
                "Unknown"
            ],
            'Roof Shape': [
                "Flat",
                "Gable",
                "Gable/Hip",
                "Hip",
                "Gambrel",
                "Unknown"
            ],
            'Roof Anchor': [
                "Toe Nail/None",
                "Clips",
                "Single Wraps",
                "Double Wraps",
                "Structural",
                "Unknown"
            ],
            'Roof Cover': [
                "Metal Sheathing",
                "Built-Up/Single-Ply",
                "Concrete/Clay Tiles",
                "Wood Shakes",
                "Shingle",
                "Rated Shingle",
                "Unknown"
            ],
            'Roof Sheathing': [
                "6d Nails",
                "8d Nails",
                "10d Nails",
                "Dimensional Lumber/Tongue & Groove",
                "Unknown"
            ],
            'ACV Roof': [
                "Yes",
                "No"
            ],
            'Cladding': [
                "Brick Veneer",
                "Metal Sheathing",
                "Wood",
                "EIFS",
                "Vinyl Siding",
                "Stucco",
                "Unknown"
            ],
            'Flood Zone': [
                "A",
                "V",
                "NonSFHA",
                "Unknown"
            ],
            'Pressurized Water Damage': [
                "Yes",
                "No"
            ],
            'Property Pool': [
                "Yes",
                "No",
                "Unknown"
            ],
            'Vacant Home': [
                "Yes",
                "No"
            ],
            'Basement Type': [
                "None",
                "Finished",
                "Partially Finished",
                "Unfinished",
                "Unknown"
            ],
            'Opening Protection': [
                "Openings Designed for Large Missiles",
                "Windows Designed for Large Missiles",
                "None on Windows",
                "Plywood on Windows",
                "Unknown"
            ],
            'Loss History': [
                "No Claims",
                "Any # of Claims > $10,000"
            ],
            'Wind Losses': [
                "0", "1", "2+"
            ],
            'NonWind Losses': [
                "0", "1", "2+"
            ],
            'Coverage Form': [
                'Basic',
                'Special',
                'Special Excluding Theft'
            ],
            'Any Units Rented': [
                'Yes',
                'No'
            ],
            'Multi Family Dwelling': [
                'Single',
                'Duplex',
                'Triplex',
                'QuadPlex'
            ],
            'Elevation': [
                'Yes',
                'No'
            ],
            'Basement': [
                'Yes',
                'No'
            ],
            'Foundation Type': [
                {
                    id: 'FoundationWall',
                    name: 'Foundation Wall'
                },
                {
                    id: 'SlabOnGrade',
                    name: 'Slab On Grade'
                },
                {
                    id: 'SlabOnFill',
                    name: 'Slab On Fill'
                }
            ],
            'Completion Status': [
                'Finished',
                'Unfinished'
            ],
            'Elevation Detail': [
                'Garage',
                'Crawlspace',
                'Enclosure'
            ],
            'Property Wind Coverage Types': [
                'With Wind/Hail',
                'Exclude Wind/Hail'
            ]
        };

        $scope.CharacteristicsState = {};

        var cYear = new Date().getFullYear();
        $scope.Characteristics['Year Upgrade'].push("-");
        for (var year = cYear; year >= 1850; year--) {
            $scope.Characteristics['Year Built'].push(year.toString());
            $scope.Characteristics['Year Upgrade'].push(year.toString());
            $scope.Characteristics['Year Refurbished'].push(year.toString());
        }
    };

    $scope.add_property = function (type) {
        var modalInstance = $modal.open({
            templateUrl: 'addProperty.html',
            controller: 'test_Homeowners_addPropertyCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                locations: function () {
                    return $scope.Locations;
                },
                classCodes: function () {
                    return $scope.ClassCodes;
                }
            }
        });


        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                window.scrollTo(0, 0);
                data.property.Id = null;
                policyService.getPropertyCoverageInfo(data.location.Id, true).then(function (result) {
                    if (result.data.Result.Success) {

                        data.property.OccupiedBy = result.data.Property.OccupiedBy;
                        data.property.Construction = result.data.Property.Construction;
                        data.property.RoofCover = result.data.Property.RoofCover;
                        data.property.RoofShape = result.data.Property.RoofShape;
                        data.property.PropertyPool = result.data.Property.PropertyPool;
                        data.property.Sprinklered = result.data.Property.Sprinklered;
                        data.property.FirePlaceIndication = result.data.Property.FirePlaceIndication;
                        data.property.NumberOfStories = result.data.Property.NumberOfStories;
                        data.property.HVACUpdate = result.data.Property.HVACUpdate;
                        data.property.PlumbingUpdate = result.data.Property.PlumbingUpdate;
                        data.property.RoofAnchor = result.data.Property.RoofAnchor;
                        data.property.RoofUpdate = result.data.Property.RoofUpdate;
                        data.property.SquareFeet = result.data.Property.SquareFeet;
                        data.property.WiringUpdate = result.data.Property.WiringUpdate;
                        data.property.YearBuilt = result.data.Property.YearBuilt;
                        data.property.NumberOfBathrooms = result.data.Property.NumberOfBathrooms;
                        data.property.ParcelSize = result.data.Property.ParcelSize;
                        data.property.ExcludeWindHail = result.data.Property.ExcludeWindHail;
                        data.property.TheftExclusion = result.data.Property.TheftExclusion;
                        data.property.FloodZone = result.data.Property.FloodZone;

                        $scope.modify(data.location, data.property);
                    } else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                },
                    function (error) {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                loadProperty();
            }
        });

    }
    $scope.modify = function (location, property) {
        // Show Modify Property
        $('#listProperty').hide();

        property = $.extend(true, {}, property);

        var controllerElement = document.querySelector('[ng-controller=test_Homeowners_modifyPropertyCtrl]');
        var controllerScope = angular.element(controllerElement).scope();
        controllerScope.PolicyId = $scope.PolicyId;
        controllerScope.Policy = $scope.parent.Policy;
        controllerScope.Property = property;
        controllerScope.Location = location;
        controllerScope.ParentScope = $scope.parent;
        controllerScope.Characteristics = $scope.Characteristics;
        controllerScope.PropertyDeductibles = $scope.PropertyDeductibles;
        controllerScope.PropertySublimits = $scope.PropertySublimits;
        controllerScope.calculateTotalTIV();

        if (property.Limits == null || property.Limits.length == 0) {
            property.Limits = [];
            property.Limits.push({ LimitName: "Coverage A", DisplayName: "Dwelling Coverage", Amount: 0, Wind: 1, Index: 1 });
            property.Limits.push({ LimitName: "Coverage B", DisplayName: "Other Structures", Amount: 0, Wind: 1, Index: 2 });
            property.Limits.push({ LimitName: "Coverage C", DisplayName: "Personal Property", Amount: 0, Wind: 1, Index: 3 });
            property.Limits.push({ LimitName: "Coverage D", DisplayName: "Loss Of Use", Amount: 0, Wind: 1, Index: 4 });
            property.Limits.push({ LimitName: "Coverage E", DisplayName: "Personal Liability", Amount: 0, Wind: 1, Index: 5 });
            property.Limits.push({ LimitName: "Coverage F", DisplayName: "Medical Payments", Amount: 0, Wind: 1, Index: 6 });

        } else {
            for (var i = 0; i < property.Limits.length; i++) {
                switch (property.Limits[i].LimitName) {
                    case "Coverage A":
                        property.Limits[i].DisplayName = "Dwelling Coverage";
                        break;
                    case "Coverage B":
                        property.Limits[i].DisplayName = "Other Structures";
                        break;
                    case "Coverage C":
                        property.Limits[i].DisplayName = "Personal Property";
                        break;
                    case "Coverage D":
                        property.Limits[i].DisplayName = "Loss Of Use";
                        break;
                    case "Coverage E":
                        property.Limits[i].DisplayName = "Personal Liability";
                        break;
                    case "Coverage F":
                        property.Limits[i].DisplayName = "Medical Payments";
                        break;
                    default:
                }
            }
        }

        //for (var k = 0; k < property.Limits.length; k++) {
        //    property.Limits[k].Amount = property.Limits[k].Amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        //}

        $scope.parent.policyMenuVisible = false;
        $('#modifyProperty').show();

        updateMapAddress(location.Address.ShortAddress);
    }
    $scope.delete = function (location, property) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this property?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }, {
                label: 'Delete Property',
                cssClass: 'btn-primary',
                action: function (dialogItself) {
                    policyService.deleteProperty($scope.PolicyId, property.Id).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.parent.Policy = result.data.Policy;
                            $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                            loadProperty();

                            $scope.parent.Policy.CurrentVersion.RateProperty = true;

                            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Building ' + property.BuildingNumber + ' is deleted.');

                            dialogItself.close();
                        }
                        else {
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }
            }]
        });

    }

    //Property Deductibles
    $scope.deductibleDisabled = function (deductibleName) {
        return deductibleName == "Pressurized Water Damage Deductible" ||
            deductibleName == "Dollar Deductible" ||
            deductibleName == "Named Storm Deductible";
    }

    $scope.updateDeductibleDisabled = function (deductibles, deductibleName) {
        return deductibles.some(x => x.Name == "Wind Deductible") || deductibleName == "Named Storm Deductible";
    }

    $scope.addPropertyDeductible = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addPropertyDeductible.html',
            controller: 'test_Homeowners_addPropertyDeductibleCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                locations: function () {
                    return $scope.Locations;
                },
                propertyDeductible: function () {
                    return null;
                },
                isUpdate: function () {
                    return false;
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                var deductible = $scope.PropertyDeductibles.find(x => x.Name == data.deductiblesToAdd[0].Name);
                if (deductible) {
                    deductible.Amount = data.deductiblesToAdd[0].Amount;
                }
                else {
                    $scope.PropertyDeductibles.push(data.deductiblesToAdd[0]);
                }

                policyService.updatePropertyDeductibles($scope.parent.Policy.Id, data.PropertyId, $scope.PropertyDeductibles).then(function (result) {
                    if (result.data.Result.Success) {
                        console.log('Success on the property deductible front');
                        $scope.Policy.CurrentVersion.Locations[0].Properties[0].Deductibles = result.data.PropertyDeductibles;
                        $scope.PropertyDeductibles = result.data.PropertyDeductibles;
                        $scope.Policy.CurrentVersion.Locations[0].Properties[0].Sublimits = result.data.PropertySublimits;
                        $scope.PropertySublimits = result.data.PropertySublimits;

                        $scope.Policy.CurrentVersion.Locations[0].Properties[0].ExcludeWindHail = result.data.ExcludeWindHail;
                        $scope.Policy.CurrentVersion.Locations[0].Properties[0].TheftExclusion = result.data.TheftExclusion;

                        policyService.clearEligibility($scope.PolicyId).then(function (result) {
                            $scope.parent.Policy.CurrentVersion.RateProperty = true;
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });
                    }
                });
            }
        });
    }
    $scope.deletePropertyDeductible = function (propertyDeductible) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this property deductible?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }, {
                label: 'Delete Property Deductible',
                cssClass: 'btn-primary',
                action: function (dialogItself) {
                    $scope.deletePropertyDeductibleConfirmed(propertyDeductible, dialogItself);
                }
            }]
        });

    }
    $scope.deletePropertyDeductibleConfirmed = function (propertyDeductible, dialogItself) {
        policyService.deletePropertyDeductible($scope.parent.Policy.Id, propertyDeductible.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.PropertyDeductibles.splice($scope.PropertyDeductibles.indexOf(propertyDeductible), 1);

                $scope.parent.Policy.CurrentVersion.RateProperty = true;

                policyService.clearEligibility($scope.PolicyId).then(function (result) {
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });

                notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Property Deductible ' + propertyDeductible.Name + ' is deleted.');
                var location;
                var property;
                var i;
                var j;
                for (i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                    location = $scope.Policy.CurrentVersion.Locations[i];
                    for (j = 0; j < location.Properties.length; j++) {
                        property = location.Properties[j];
                        for (var k = 0; k < property.Deductibles.length; k++) {
                            if (property.Deductibles[k].Id == propertyDeductible.Id) {
                                property.Deductibles.splice(property.Deductibles.indexOf(property.Deductibles[k]), 1);
                            }
                        }
                    }
                }


                if (dialogItself != null) dialogItself.close();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }
    $scope.updatePropertyDeductible = function (propertyDeductible) {
        var modalInstance = $modal.open({
            templateUrl: 'addPropertyDeductible.html',
            controller: 'test_Homeowners_addPropertyDeductibleCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                locations: function () {
                    return $scope.Locations;
                },
                propertyDeductible: function () {
                    return $.extend({}, propertyDeductible);
                },
                isUpdate: function () {
                    return false;
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.updatePropertyDeductible($scope.parent.Policy.Id, data.propertyDeductible).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.Policy.CurrentVersion.Locations[0].Properties[0].Deductibles = result.data.PropertyDeductibles;
                        $scope.PropertyDeductibles = result.data.PropertyDeductibles;
                        $scope.Policy.CurrentVersion.Locations[0].Properties[0].Sublimits = result.data.PropertySublimits;
                        $scope.PropertySublimits = result.data.PropertySublimits;

                        $scope.parent.Policy.CurrentVersion.RateProperty = true;
                        policyService.clearEligibility($scope.PolicyId).then(function (result) {
                            $scope.parent.Policy.CurrentVersion.RateProperty = true;
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });
                        notificationsHub.showSuccess('Quote ' + $scope.Policy.Number + ' Property Deductible is updated.');
                        $scope.ErrorList = [];

                    }
                    else {
                        $scope.Errors = result.data.Result.Errors;
                        $scope.ErrorList = $scope.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
        });
    }

    //Property Additional Coverages
    $scope.addAdditionalCoverage = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addAdditionalCoverage.html',
            controller: 'test_Homeowners_addAdditionalCoverageCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                locations: function () {
                    return $scope.Locations;
                },
                additionalCoverage: function () {
                    return null;
                },
                isUpdate: function () {
                    return false;
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                var additionalCoverage = $scope.PropertyAdditionalCoverages.find(x => x.Name == data.Name && x.Type == data.Type);
                if (additionalCoverage) {
                    additionalCoverage.Amount = data.Amount;
                }
                else {
                    $scope.PropertyAdditionalCoverages.push(data);
                }

                policyService.updateAdditionalCoverages($scope.parent.Policy.Id, $scope.PropertyAdditionalCoverages).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.PropertyAdditionalCoverages = result.data.PropertyAdditionalCoverages;
                        $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].AdditionalCoverages = result.data.PropertyAdditionalCoverages;
                        $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].Limits = result.data.PropertyLimits;
                        policyService.clearEligibility($scope.PolicyId).then(function (result) {
                            $scope.parent.Policy.CurrentVersion.RateProperty = true;
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });
                    }
                    else {
                        $scope.PropertyAdditionalCoverages.splice($scope.PropertyAdditionalCoverages.indexOf(data), 1);
                        $scope.Errors = result.data.Result.Errors;
                        notificationsHub.showError("Request Failed", $scope.Errors[0]);
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    notificationsHub.showError("Request Failed", "A problem has occurred with sending your request. Please contact support.");
                });
            }
        });
    }
    $scope.deleteAdditionalCoverage = function (additionalCoverage) {
        var name = additionalCoverage.Type ? additionalCoverage.Type : additionalCoverage.Name;
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this additional coverage: ' + name + '?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }, {
                label: 'Delete Additional Coverage',
                cssClass: 'btn-primary',
                action: function (dialogItself) {
                    $scope.deletePropertyAdditionalCoverageConfirmed(additionalCoverage, dialogItself);
                }
            }]
        });
    }
    $scope.deletePropertyAdditionalCoverageConfirmed = function (additionalCoverage, dialogItself) {
        policyService.deletePropertyAdditionalCoverage($scope.parent.Policy.Id, additionalCoverage.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Policy.CurrentVersion.Locations[0].Properties[0].AdditionalCoverages = result.data.PropertyAdditionalCoverages;
                $scope.PropertyAdditionalCoverages = result.data.PropertyAdditionalCoverages;
                $scope.Policy.CurrentVersion.Locations[0].Properties[0].Limits = result.data.PropertyLimits;
                $scope.PropertyLimits = result.data.PropertyLimits;
                $scope.Policy.CurrentVersion.Locations[0].Properties[0].Deductibles = result.data.PropertyDeductibles;
                $scope.PropertyDeductibles = result.data.PropertyDeductibles;
                $scope.Policy.CurrentVersion.Locations[0].Properties[0].Sublimits = result.data.PropertySublimits;
                $scope.PropertySublimits = result.data.PropertySublimits;
                $scope.parent.Policy.CurrentVersion.RateProperty = true;

                policyService.clearEligibility($scope.PolicyId).then(function (result) {
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
                notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Additional Coverage ' + additionalCoverage.Name + ' is deleted.');
                if (dialogItself != null) dialogItself.close();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
                notificationsHub.showError("Request Failed", $scope.Errors[0]);
                if (dialogItself != null) dialogItself.close();
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            notificationsHub.showError("Request Failed", "A problem has occurred with sending your request. Please contact support.");
        });
    }
    $scope.updateIncreasedSpecialLimit = function (additionalCoverage) {
        var additionalCoverageTemp = {
            Amount: additionalCoverage.Amount,
        };
        var modalInstance = $modal.open({
            templateUrl: 'addAdditionalCoverage.html',
            controller: 'test_Homeowners_addAdditionalCoverageCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                locations: function () {
                    return $scope.Locations;
                },
                additionalCoverage: function () {
                    return additionalCoverage;
                },
                isUpdate: function () {
                    return false;
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.updateAdditionalCoverage($scope.parent.Policy.Id, additionalCoverage).then(function (result) {
                    if (result.data.Result.Success) {
                        additionalCoverage = result.data.PropertyAdditionalCoverage;
                        $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].Limits = result.data.PropertyLimits;

                        policyService.clearEligibility($scope.PolicyId).then(function (result) {
                            $scope.parent.Policy.CurrentVersion.RateProperty = true;
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });
                    }
                    else {
                        additionalCoverage.Amount = additionalCoverageTemp.Amount;
                        $scope.Errors = result.data.Result.Errors;
                        notificationsHub.showError("Request Failed", $scope.Errors[0]);
                    }
                }, function (error) {
                    additionalCoverage.Amount = additionalCoverageTemp.Amount;
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    notificationsHub.showError("Request Failed", "A problem has occurred with sending your request. Please contact support.");
                });
            }
        });
    }

    // property sublimits
    $scope.isSublimitDisabled = function () {
        var sublimits = [];
        var sublimitTypes = [
            "Pressurized Water Damage Sublimit",
            "Water Backup Sublimit",
            "Theft Sublimit",
            "Personal Injury Sublimit",
            "Mold Buyback Sublimit"
        ];

        if (!$scope.Locations[0].Properties[0].TheftExclusion) {
            sublimits.push("Theft Sublimit");
        }

        if (!$scope.Locations[0].Properties[0].PressurizedWaterDamageExclusion) {
            sublimits.push("Pressurized Water Damage Sublimit");
        }

        if ($scope.PropertyAdditionalCoverages && $scope.PropertyAdditionalCoverages.length > 0) {
            var coverageSublimits = sublimitTypes.filter(x => {
                return $scope.PropertyAdditionalCoverages.find(y => y.Name == x.replace(' Sublimit', '')) &&
                    x != "Pressurized Water Damage Sublimit" &&
                    x != "Theft Sublimit";
            });
            if (coverageSublimits.length > 0) sublimits = sublimits.concat(coverageSublimits);
        }

        return sublimits.length < 1;
    }

    $scope.addSublimit = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addSublimit.html',
            controller: 'test_Homeowners_addSublimitCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                locations: function () {
                    return $scope.Locations;
                },
                sublimit: function () {
                    return null;
                },
                isUpdate: function () {
                    return false;
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].TheftSublimit = data.Amount
                var sublimit = $scope.PropertySublimits.find(x => x.Name == data.Name);
                if (sublimit) {
                    sublimit.Amount = data.Amount;
                }
                else {
                    $scope.PropertySublimits.push(data);
                }

                policyService.updateSublimits($scope.parent.Policy.Id, data.PropertyId, $scope.PropertySublimits).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.PropertySublimits = result.data.PropertySublimits;
                        $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].Sublimits = result.data.PropertySublimits;
                        policyService.clearEligibility($scope.PolicyId).then(function (result) {
                            $scope.parent.Policy.CurrentVersion.RateProperty = true;
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });
                    }
                    else {
                        $scope.PropertySublimits.splice($scope.PropertySublimits.indexOf(data), 1);
                        $scope.Errors = result.data.Result.Errors;
                        notificationsHub.showError("Request Failed", $scope.Errors[0]);
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    notificationsHub.showError("Request Failed", "A problem has occurred with sending your request. Please contact support.");
                });
            }
        });
    }
    $scope.deleteSublimit = function (sublimit) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this additional coverage: ' + sublimit.Name + '?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }, {
                label: 'Delete Sublimit',
                cssClass: 'btn-primary',
                action: function (dialogItself) {
                    $scope.deletePropertySublimitConfirmed(sublimit, dialogItself);
                }
            }]
        });
    }
    $scope.deletePropertySublimitConfirmed = function (sublimit, dialogItself) {
        policyService.deletePropertySublimit($scope.parent.Policy.Id, sublimit.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Policy.CurrentVersion.Locations[0].Properties[0].Sublimits = result.data.PropertySublimits;
                $scope.Policy.CurrentVersion.Locations[0].Properties[0].ExcludeWindHail = result.data.ExcludeWindHail;
                $scope.Policy.CurrentVersion.Locations[0].Properties[0].TheftExclusion = result.data.TheftExclusion;
                $scope.PropertySublimits = result.data.PropertySublimits;
                $scope.parent.Policy.CurrentVersion.RateProperty = true;

                policyService.clearEligibility($scope.PolicyId).then(function (result) {
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });

                notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Sublimit ' + sublimit.Name + ' is deleted.');

                if (dialogItself != null) dialogItself.close();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
                notificationsHub.showError("Request Failed", $scope.Errors[0]);
                if (dialogItself != null) dialogItself.close();
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            notificationsHub.showError("Request Failed", "A problem has occurred with sending your request. Please contact support.");
        });
    }
    $scope.updateSublimit = function (sublimit) {
        var sublimitTemp = {
            Amount: sublimit.Amount,
        };
        var modalInstance = $modal.open({
            templateUrl: 'addSublimit.html',
            controller: 'test_Homeowners_addSublimitCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                locations: function () {
                    return $scope.Locations;
                },
                sublimit: function () {
                    return sublimit;
                },
                isUpdate: function () {
                    return false;
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].TheftSublimit = data.Amount
                policyService.updateSublimit($scope.parent.Policy.Id, sublimit).then(function (result) {
                    if (result.data.Result.Success) {
                        sublimit = result.data.PropertySublimit;

                        policyService.clearEligibility($scope.PolicyId).then(function (result) {
                            $scope.parent.Policy.CurrentVersion.RateProperty = true;
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });
                    }
                    else {
                        sublimit.Amount = sublimitTemp.Amount;
                        $scope.Errors = result.data.Result.Errors;
                        notificationsHub.showError("Request Failed", $scope.Errors[0]);
                    }
                }, function (error) {
                        sublimit.Amount = sublimitTemp.Amount;
                        $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].TheftSublimit = sublimitTemp.Amount;
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    notificationsHub.showError("Request Failed", "A problem has occurred with sending your request. Please contact support.");
                });
            }
        });
    }

  $scope.addAdditionalInsured = function () {
        var modalInstance = $modal.open({
          templateUrl: 'addAdditionalInsured.html',
          controller: 'test_Homeowners_addAdditionalInsuredCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                locations: function () {
                    return $scope.Locations;
                },
                additionalInsured: function () {
                    return null;
                },
                aiType: function () {
                    return 'Mortgagee';
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                if (data.AIType == 'Mortgagee') {
                    policyService.addMortgagee($scope.PolicyId, data.AI).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.Mortgagees = $scope.Mortgagees.concat(result.data.Mortgagees);

                            for (var m = 0; m < $scope.Mortgagees.length; m++) {
                                var mortgagee = $scope.Mortgagees[m];

                                for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                                    var location = $scope.Policy.CurrentVersion.Locations[i];
                                    for (var j = 0; j < location.Properties.length; j++) {
                                        var property = location.Properties[j];
                                        if (mortgagee.LocationNumber == location.LocationNumber && mortgagee.BuildingNumber == property.BuildingNumber) {
                                            property.Mortgagees.push(mortgagee);
                                        }
                                    }
                                }
                            }

                            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Mortgagee is added.');
                        }
                        else {
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                } else {
                  policyService.addLossPayee($scope.PolicyId, data.AI).then(function (result) {
                    if (result.data.Result.Success) {
                      $scope.Policy.CurrentVersion.RateProperty = true;
                      $scope.LossPayees = $scope.LossPayees.concat(result.data.LossPayees);

                      for (var m = 0; m < $scope.LossPayees.length; m++) {
                        var lossPayee = $scope.LossPayees[m];

                        for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                          var location = $scope.Policy.CurrentVersion.Locations[i];
                          for (var j = 0; j < location.Properties.length; j++) {
                            var property = location.Properties[j];
                            if (lossPayee.LocationNumber == location.LocationNumber && lossPayee.BuildingNumber == property.BuildingNumber) {
                              property.LossPayees.push(lossPayee);
                            }
                          }
                        }
                      }

                      notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Additional Insured is added.');
                    }
                    else {
                      $scope.Errors = result.data.Result.Errors;
                    }
                  }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                  });
                }
            }
        });
    }
    $scope.updateMortgagee = function (mortgagee) {
        var modalInstance = $modal.open({
            templateUrl: 'addMortgagee.html',
          controller: 'test_Homeowners_addAdditionalInsuredCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                locations: function () {
                    return $scope.Locations;
                },
                additionalInsured: function () {
                    return $.extend({}, mortgagee);
                },
                aiType: function () {
                    return 'Mortgagee';
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.updateMortgagee($scope.PolicyId, data.AI).then(function (result) {
                    if (result.data.Result.Success) {
                        for (var m = 0; m < $scope.Mortgagees.length; m++) {
                            if ($scope.Mortgagees[m].Id == result.data.Mortgagee.Id) {
                                $scope.Mortgagees[m] = result.data.Mortgagee;

                                for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                                    var location = $scope.Policy.CurrentVersion.Locations[i];
                                    for (var j = 0; j < location.Properties.length; j++) {
                                        var property = location.Properties[j];
                                        for (var k = 0; k < property.Mortgagees.length; k++) {
                                            if (property.Mortgagees[k].Id == result.data.Mortgagee.Id) {
                                                property.Mortgagees[k] = result.data.Mortgagee;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Mortgagee is updated.');
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
    $scope.deleteMortgagee = function (mortgagee) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this mortgagee: Loc. ' + mortgagee.LocationNumber + ' Bldg.' + mortgagee.BuildingNumber + ' ' + mortgagee.Name + '?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            },
            {
                label: 'Delete Mortgagee',
                cssClass: 'yellow-casablanca',
                action: function (dialogItself) {
                    policyService.deleteMortgagee($scope.PolicyId, mortgagee.Id).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.Mortgagees.splice($scope.Mortgagees.indexOf(mortgagee), 1);


                            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Mortgagee is deleted.');
                            dialogItself.close();

                            for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                                var location = $scope.Policy.CurrentVersion.Locations[i];
                                for (var j = 0; j < location.Properties.length; j++) {
                                    var property = location.Properties[j];
                                    for (var k = 0; k < property.Mortgagees.length; k++) {
                                        if (property.Mortgagees[k].Id == mortgagee.Id) {
                                            property.Mortgagees.splice(property.Mortgagees.indexOf(property.Mortgagees[k]), 1);
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }
            }]
        });
  }

  $scope.updateLossPayee = function (lossPayee) {
    var modalInstance = $modal.open({
      templateUrl: 'addAdditionalInsured.html',
      controller: 'test_Homeowners_addAdditionalInsuredCtrl',
      backdrop: 'static',
      resolve: {
        policy: function () {
          return $scope.parent.Policy;
        },
        policyId: function () {
          return $scope.PolicyId;
        },
        locations: function () {
          return $scope.Locations;
        },
        additionalInsured: function () {
          return $.extend({}, lossPayee);
        },
        aiType: function () {
          return 'Loss Payee';
        }
      }
    });

    modalInstance.result.then(function (data) {
      if (data != 'cancel') {
        policyService.updateLossPayee($scope.PolicyId, data.AI).then(function (result) {
          if (result.data.Result.Success) {
            $scope.Policy.CurrentVersion.RateProperty = true;
            for (var d = 0; d < $scope.LossPayees.length; d++) {
              if ($scope.LossPayees[d].Id == result.data.LossPayee.Id) {
                $scope.LossPayees[d] = result.data.LossPayee;

                for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                  var location = $scope.Policy.CurrentVersion.Locations[i];
                  for (var j = 0; j < location.Properties.length; j++) {
                    var property = location.Properties[j];
                    for (var k = 0; k < property.LossPayees.length; k++) {
                      if (property.LossPayees[k].Id == result.data.LossPayee.Id) {
                        property.LossPayees[k] = result.data.LossPayee;
                      }
                    }
                  }
                }
              }
            }
            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Loss Payee is update.');
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

  $scope.deleteLossPayee = function (lossPayee) {
    BootstrapDialog.show({
      title: 'Are you sure?',
      message: 'Are you sure you want to delete this additional insured: Loc. ' + lossPayee.LocationNumber + ' Bldg.' + lossPayee.BuildingNumber + ' ' + lossPayee.Name + '?',
      buttons: [{
        label: 'Cancel',
        action: function (dialogItself) {
          dialogItself.close();
        }
      }, {
        label: 'Delete Additional Insured',
        cssClass: 'yellow-casablanca',
        action: function (dialogItself) {
          policyService.deleteLossPayee($scope.PolicyId, lossPayee.Id).then(function (result) {
            if (result.data.Result.Success) {
              $scope.Policy.CurrentVersion.RateProperty = true;
              $scope.LossPayees.splice($scope.LossPayees.indexOf(lossPayee), 1);
              notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Additional Insured is deleted.');
              dialogItself.close();

              for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                var location = $scope.Policy.CurrentVersion.Locations[i];
                for (var j = 0; j < location.Properties.length; j++) {
                  var property = location.Properties[j];
                  for (var k = 0; k < property.LossPayees.length; k++) {
                    if (property.LossPayees[k].Id == lossPayeee.Id) {
                      property.LossPayees.splice(property.LossPayees.indexOf(property.LossPayees[k]), 1);
                      return;
                    }
                  }
                }
              }
            }
            else {
              $scope.Errors = result.data.Result.Errors;
            }
          }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
          });
        }
      }]
    });
  }

    //Property Characteristics
    $scope.GetCharacteristicValues = function (name) {
        return $scope.Characteristics[name];
    }

    //Helpers
    $scope.toCurrency = function (num) {
        return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    $scope.requireRerate = function () {
        $scope.requiresRate = true;
    }

    $rootScope.$broadcast('$pageloaded');
}]);

MALACHIAPP.controller('test_Homeowners_addPropertyDeductibleCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'propertyDeductible', 'isUpdate', 'parent', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, propertyDeductible, isUpdate, parent) {
    $scope.parent = parent;
    $scope.property = locations[0].Properties[0];
    $scope.propertyDeductible = propertyDeductible;
    $scope.isUpdating = $scope.propertyDeductible != null;
    $scope.errors = [];

    //settings
    $scope.deductibleTypes = [
        "Water Backup Deductible",
        "Wind Deductible",
        "Dollar Deductible",
        "Pressurized Water Damage Deductible",
        "Named Storm Deductible"
    ];

    $scope.deductibleOptions = {
        'Wind Deductible': [
            "2%",
            "3%",
            "5%",
            "10%"
        ],
        'Water Backup Deductible': [
            "5000",
            "10000",
            "25000"
        ],
        'Dollar Deductible': [
            "2500",
            "5000",
            "10000",
            "25000"
        ],
        'Pressurized Water Damage Deductible': [
            "2500",
            "5000",
            "10000",
            "25000"
        ],
        'Named Storm Deductible': [
            "2%",
            "3%",
            "5%",
            "10%"
        ]
    }

    $scope.deductibleTypesToShow = function () {
        var deductibles = $scope.deductibleTypes;

        if ($scope.property.Deductibles.length > 0) {
            deductibles = deductibles.filter(x => !$scope.property.Deductibles.find(y => y.Name == x));
        }

        if ($scope.property.TheftExclusion) {
            deductibles = deductibles.filter(x => x != "Theft Deductible");
        }

        if ($scope.property.PressurizedWaterDamageExclusion) {
            deductibles = deductibles.filter(x => x != "Pressurized Water Damage Deductible");
        }

        if ($scope.property.AdditionalCoverages.length < 1 || !$scope.property.AdditionalCoverages.find(x => x.Name == "Water Backup")) {
            deductibles = deductibles.filter(x => x != "Water Backup Deductible");
        }

        return deductibles;
    }

    $scope.hasOptions = function () {
        return $scope.deductibleOptions[$scope.propertyDeductible.Name];
    }

    $scope.getDeductibleOptions = function () {
        var options = $scope.deductibleOptions[$scope.propertyDeductible.Name];
        return options != null ? options : [];
    }

    $scope.deductibleTypeSelected = function () {
        if ($scope.hasOptions()) {
            var options = $scope.deductibleOptions[$scope.propertyDeductible.Name];
            $scope.propertyDeductible.Amount = options[0];
            $scope.propertyDeductible.SubjectToMinimumOf = null;
        } else {
            $scope.propertyDeductible.Amount = null;
        }
    }

    $scope.amountSelected = function () {
        if (!$scope.isAmountPercent()) {
            $scope.propertyDeductible.SubjectToMinimumOf = null;
        }
    }

    $scope.isAmountPercent = function () {
        return $scope.propertyDeductible.Amount != null && $scope.propertyDeductible.Amount.endsWith("%");
    }

    $scope.close = function () {
        $modalInstance.dismiss("cancel");
    }

    $scope.save = function () {
        $scope.validateInputs();
        if ($scope.errors.length > 0) return;

        if ($scope.isUpdating) {
            checkDeductiblesBeforeUpdate();
        } else {
            checkDeductiblesBeforeAdd();
        }
    }

    $scope.validateInputs = function () {
        $scope.errors = [];

        if (!$scope.propertyDeductible.Name) {
            $scope.errors.push("Please select an item from the property deductible list.");
        }

        if (!$scope.propertyDeductible.Amount) {
            $scope.errors.push("Please enter an amount for the deductible.");
        }

        if (!$scope.isUpdating) {
            var deductibleExists = $scope.property.Deductibles.find(function (x) {
                return x.Name == $scope.propertyDeductible.Name
            });
            if (deductibleExists) {
                $scope.errors.push("There is already a " + $scope.propertyDeductible.Name + " added on this property.");
            }
        }

        if (!$scope.property.ExcludeWindHail && !$scope.property.Deductibles.find(x => x.Name == 'Named Storm Deductible') && $scope.propertyDeductible.Name != 'Named Storm Deductible') {
            $scope.errors.push("Named Storm deductible must be included.");
        }

    }

    function isNullOrEmpty(text) {
        return text == null || text == "";
    }

    function toNumber(text) {
        return parseInt(text.replace(",", ""));
    }

    function isNumeric(text) {
        return !isNaN(toNumber(text));
    }

    function formatToCurrency() {
        if ($scope.hasOptions() && $scope.isAmountPercent()) {
            if (!isNullOrEmpty($scope.propertyDeductible.SubjectToMinimumOf)) {
                var amount = "$" + $scope.propertyDeductible.SubjectToMinimumOf;
                $scope.propertyDeductible.SubjectToMinimumOf = amount;
            }
        } else if (!$scope.hasOptions()) {
            var amount = "$" + $scope.propertyDeductible.Amount;
            $scope.propertyDeductible.Amount = amount;
        }
    }

    function checkDeductiblesBeforeAdd() {
        var deductible = $scope.propertyDeductible;
        var toAdd = [];

        // All Other Wind Deductible cannot be added w/o Named Storm deductible.
        if (deductible.Name.startsWith("All Other Wind Deductible")) {
            var namedStormExcluded = $scope.property.Deductibles.every(function (x) { return !x.Name.startsWith("Named Storm Deductible"); });
            if (namedStormExcluded) {
                $scope.errors.push("All Other Wind Deductible requires a Named Storm Deductible on the property.");
                return;
            }
        }

        // Prevent Wind Deductible (Flat Dollar) from getting added if the property excludes wind/hail.
        if (deductible.Name == 'Wind Deductible (Flat Dollar)') {
            if ($scope.property.ExcludeWindHail) {
                $scope.errors.push('Cannot add a wind deductible to a property with wind/hail excluded.');
                return;
            }
        }

        if (deductible.Name.startsWith("Named Storm Deductible") || deductible.Name == 'Wind Deductible (Flat Dollar)') {
            var windDed = $scope.property.Deductibles.find(function (x) { return x.Name == "Wind Deductible"; })
            if (windDed != null) {
                windDed.PropertyId = $scope.property.Id;
                windDed.Amount = "Non Applicable";
                windDed.SubjectToMinimumOf = null;

                toAdd.push(windDed);
            }
        }

        formatToCurrency();

        toAdd.push(deductible);

        $modalInstance.close({ PropertyId: $scope.property.Id, deductiblesToAdd: toAdd });
    }

    function checkDeductiblesBeforeUpdate() {
        var deductible = $scope.propertyDeductible;
        var toRemove = [];

        formatToCurrency();

        $modalInstance.close({
            propertyDeductible: deductible,
            deductiblesToRemove: toRemove,
            PropertyId: $scope.property.Id
        });
    }

    if (!$scope.propertyDeductible) {
        $scope.propertyDeductible = {
            PropertyId: $scope.property.Id,
            Name: $scope.deductibleTypesToShow()[0],
            Amount: null,
            SubjectToMinimumOf: null
        };

        if ($scope.hasOptions()) {
            var options = $scope.deductibleOptions[$scope.propertyDeductible.Name]
            $scope.propertyDeductible.Amount = options[0];
        }
    } else {
        $scope.propertyDeductible.PropertyId = $scope.property.Id;

        if ($scope.hasOptions() && $scope.isAmountPercent()) {
            if (!isNullOrEmpty($scope.propertyDeductible.SubjectToMinimumOf)) {
                var amount = $scope.propertyDeductible.SubjectToMinimumOf.replace("$", "");
                $scope.propertyDeductible.SubjectToMinimumOf = amount;
            }
        } else if (!$scope.hasOptions()) {
            var amount = $scope.propertyDeductible.Amount.replace("$", "");
            $scope.propertyDeductible.Amount = amount;
        }
    }
}]);

MALACHIAPP.controller('test_Homeowners_addAdditionalCoverageCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'additionalCoverage', 'isUpdate', 'parent', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, additionalCoverage, isUpdate, parent) {
    $scope.parent = parent;
    $scope.property = locations[0].Properties[0];
    $scope.additionalCoverage = additionalCoverage;
    $scope.isUpdating = $scope.additionalCoverage != null;
    $scope.errors = [];

    //Settings
    $scope.additionalCoverageTypes = [
        "Extended Replacement Cost",
        "Increased Special Contents Limits",
        "Mold Buyback",
        "Personal Injury",
        "Water Backup"
    ];

    $scope.additionalCoverageTypesToShow = function () {
        var additionalCoverages = $scope.additionalCoverageTypes;
        if ($scope.property.AdditionalCoverages.length > 0) {
            additionalCoverages = additionalCoverages.filter(x => !$scope.property.AdditionalCoverages.find(y => y.Name == x && y.Name != "Increased Special Contents Limits"));
        }

        return additionalCoverages;
    }
    $scope.coverageOptions = {
        'Increased Special Contents Limits': [
            "Increased Special Limit - D",
            "Increased Special Limit - E",
            "Increased Special Limit - F",
            "Increased Special Limit - L",
            "Increased Special Limit - P",
            "Increased Special Limit - Q"
        ]
    }
    $scope.hasOptions = function () {
        return $scope.additionalCoverage && $scope.additionalCoverage.Name === 'Increased Special Contents Limits';
    }
    $scope.getCoverageOptions = function () {
        var options = $scope.coverageOptions[$scope.additionalCoverage.Name];
        return options != null ? options : [];
    }
    $scope.increasedSpecialLimitSelected = function () {
        $scope.additionalCoverage.Amount = null;
    }
    $scope.isIncreasedSpecialLimit = function () {
        return $scope.additionalCoverage && $scope.additionalCoverage.Name === 'Increased Special Contents Limits';
    }
    if (!$scope.additionalCoverage) {
        $scope.additionalCoverage = {
            PropertyId: $scope.property.Id,
            Name: $scope.additionalCoverageTypesToShow()[0],
            Type: null,
            Amount: null
        };
    }

    //ModalInstance
    $scope.close = function () {
        $modalInstance.dismiss("cancel");
    }
    $scope.save = function () {
        $scope.validateInputs();
        if ($scope.errors.length > 0) return;

        if ($scope.additionalCoverage.Type) {
            var type = $scope.additionalCoverage.Type.replace("- ", "");
            $scope.additionalCoverage.Type = type;
        }

        $modalInstance.close($scope.additionalCoverage);
    }

    //Validations
    $scope.validateInputs = function () {
        $scope.errors = [];

        if (!$scope.additionalCoverage.Name) {
            $scope.errors.push("Please select an item from the Additional Coverage list.");
        }

        if (!$scope.additionalCoverage.Type && $scope.hasOptions()) {
            $scope.errors.push("Please select an item from the Increased Special Contents Limits list.");
        }

        if ((!$scope.additionalCoverage.Amount || $scope.additionalCoverage.Amount < 1) && $scope.hasOptions()) {
            $scope.errors.push("Please enter valid amount.");
        }
    }
}]);

MALACHIAPP.controller('test_Homeowners_addSublimitCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'sublimit', 'isUpdate', 'parent', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, sublimit, isUpdate, parent) {
    $scope.parent = parent;
    $scope.property = locations[0].Properties[0];
    $scope.sublimit = sublimit;
    $scope.isUpdating = $scope.sublimit != null;
    $scope.errors = [];

    // settings
    $scope.sublimitTypes = [
        "Pressurized Water Damage Sublimit",
        "Water Backup Sublimit",
        "Theft Sublimit",
        "Personal Injury Sublimit",
        "Mold Buyback Sublimit"
    ];

    $scope.sublimitOptions = {
        'Pressurized Water Damage Sublimit': [
            "5000",
            "10000",
            "25000"
        ],
        'Water Backup Sublimit': [
            "5000",
            "10000",
            "25000"
        ],
        'Theft Sublimit': [
            "5000",
            "10000",
            "25000"
        ],
        'Personal Injury Sublimit': [
            "100000",
            "300000"

        ],
        'Mold Buyback Sublimit': [
            "5000",
            "10000",
            "25000"
        ]
    }

    $scope.sublimitToShow = function () {
        var sublimits = [];

        if (!$scope.property.TheftExclusion) {
            sublimits.push("Theft Sublimit");
        }

        if (!$scope.property.PressurizedWaterDamageExclusion) {
            sublimits.push("Pressurized Water Damage Sublimit");
        }

        if ($scope.property.AdditionalCoverages && $scope.property.AdditionalCoverages.length > 0) {
            var coverageSublimits = $scope.sublimitTypes.filter(x => {
                return $scope.property.AdditionalCoverages.find(y => y.Name == x.replace(' Sublimit', '')) &&
                    x != "Pressurized Water Damage Sublimit" &&
                    x != "Theft Sublimit";
            });
            if (coverageSublimits.length > 0) sublimits = sublimits.concat(coverageSublimits);
        }

        return sublimits;
    }

    $scope.getSublimitOptions = function () {
        var options = $scope.sublimitOptions[$scope.sublimit.Name];

        if ($scope.sublimit.Name == "Pressurized Water Damage Sublimit" && !$scope.sublimit.Amount) {
            var coverageALimit = Number.parseInt($scope.property.Limits.find(x => x.LimitName == "Coverage A").Amount);
            if (coverageALimit < 1000000) {
                $scope.sublimit.Amount = "5000";
            }
            else {
                $scope.sublimit.Amount = "10000";
            }
        }

        return options != null ? options : [];
    }

    if (!$scope.sublimit) {
        $scope.sublimit = {
            PropertyId: $scope.property.Id,
            Name: $scope.sublimitToShow()[0],
            Amount: null
        };
    }

    //ModalInstance
    $scope.close = function () {
        $modalInstance.dismiss("cancel");
    }
    $scope.save = function () {
        $scope.validateInputs();
        if ($scope.errors.length > 0) return;

        $modalInstance.close($scope.sublimit);
    }

    //Validations
    $scope.validateInputs = function () {
        $scope.errors = [];

        if (!$scope.sublimit.Name) {
            $scope.errors.push("Please select an item from the Sublimit list.");
        }

        if ((!$scope.sublimit.Amount || $scope.sublimit.Amount < 1)) {
            $scope.errors.push("Please enter valid amount.");
        }
    }
}]);

MALACHIAPP.controller('test_Homeowners_addAdditionalInsuredCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'additionalInsured', 'aiType', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, additionalInsured, aiType) {
    $scope.PolicyId = policyId;
    $scope.Locations = locations;
    $scope.Policy = policy;
    $scope.AI = {
    };

    $scope.AIType = aiType || 'Mortgagee';
    if (additionalInsured != null) {
        $scope.AI = additionalInsured;
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {
        $scope.validateInputs();
        if ($scope.ErrorList.length > 0) return;
        $scope.AI.PropertyId = $scope.Locations[0].Properties[0].Id;
        $scope.AI.Properties = [$scope.Locations[0].Properties[0].Id];
        $scope.AI.LocationNumber = 1;
        $scope.AI.BuildingNumber = 1;
        $modalInstance.close({ AI: $scope.AI, AIType: $scope.AIType });

    }

    $scope.validateInputs = function () {
        $scope.ErrorList = [];

        if ($scope.AIType == 'Mortgagee') {

            if (checkInputs($scope.AI.Name)) {
                $scope.ErrorList.push('Name cannot be blank.');
            }

            // Loan number currently optional, just remove comments below to make mandatory again.
            //if (checkInputs($scope.AI.LoanNumber)) {
            //    $scope.ErrorList.push('Loan Number cannot be blank.');
            //}
        }
        else {
            if (checkInputs($scope.AI.Name)) {
                $scope.ErrorList.push('Name cannot be blank.');
            }

            if (checkInputs($scope.AI.LossPayeeType)) {
                $scope.ErrorList.push('Please select a loss payable type.');
            }
        }

        if (checkInputs($scope.AI.Address.StreetAddress1)) {
            $scope.ErrorList.push('Mailing street address cannot be blank.');
        }

        if (checkInputs($scope.AI.Address.Zip)) {
            $scope.ErrorList.push('Mailing zip cannot be blank.');
        }

        if (checkInputs($scope.AI.Address.City)) {
            $scope.ErrorList.push('Mailing city cannot be blank.');
        }

        if (checkInputs($scope.AI.Address.State)) {
            $scope.ErrorList.push('Mailing state cannot be blank.');
        }

        //if (checkInputs($scope.AI.Address.ShortAddress) && (checkInputs($scope.AI.Address.StreetAddress1) || checkInputs($scope.AI.Address.Zip) || checkInputs($scope.AI.Address.City) || checkInputs($scope.AI.Address.State))) {
        //    $scope.ErrorList.push('Mailing address cannot be blank.');
        //}


    }

    function checkInputs(input) {
        if (input == '' || input == undefined) {
            return true;
        }
        else {
            return false;
        }
    }


    $scope.placeset = function (result) {
        if (result) {
            $scope.AI.Address.StreetAddress1 = result.StreetAddress1;
            $scope.AI.Address.StreetAddress2 = result.StreetAddress2;
            $scope.AI.Address.City = result.City;
            $scope.AI.Address.State = result.State;
            $scope.AI.Address.Zip = result.Zip;
            $scope.AI.Address.Country = result.Country;
            $scope.AI.Address.County = result.County;
            $scope.AI.Address.ShortAddress = result.formatted_address;
        }
    }

    $scope.updateStateFromZip = function () {
        $scope.ErrorList = [];
        var zip = $scope.AI.Address.Zip;

        // Check the entered zip code to make sure it meets the minimum requirements
        if (zip == null || zip === "") {
            $scope.ErrorList.push("Please enter a valid zip code");
        } else {
            if (zip.length < 5) {
                $scope.ErrorList.push("Zip code must be 5 digits long");
                $scope.AI.Address.Zip = "";
                $scope.AI.Address.StateObject = null;
                $scope.AI.Address.State = "";
                $scope.AI.Address.County = "";
                $scope.AI.Address.City = "";
            }
        }

        if ($scope.ErrorList.length > 0) return;

        toolsService.getStateAndCountyByZip(zip).then(function (result) {
            if (result.data.Result.Success) {
                if (result.data.State != null) {
                    $scope.AI.Address.County = result.data.State.County;
                    $scope.AI.Address.StateObject = result.data.State;
                    $scope.AI.Address.State = result.data.State.Name;
                    $scope.AI.Address.StateCode = result.data.State.Code;
                    $scope.AI.Address.City = result.data.State.City;
                } else {
                    $scope.ErrorList.push("Could not find State and County for entered zip code: " + $scope.AI.Address.Zip);
                    $scope.AI.Address.Zip = "";
                    $scope.AI.Address.StateObject = null;
                    $scope.AI.Address.State = "";
                    $scope.AI.Address.StateCode = "";
                    $scope.AI.Address.County = "";
                    $scope.AI.Address.City = "";
                }
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

    }
}]);

MALACHIAPP.controller('test_Homeowners_addPropertyCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'classCodes', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, classCodes) {
    $scope.PolicyId = policyId;
    $scope.Locations = locations;
    $scope.Policy = policy;
    $scope.Policy = policy;
    $scope.ClassCodes = classCodes;
    if ($scope.Locations.length == 1) $scope.Location = $scope.Locations[0];

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {

        $modalInstance.close({
            location: $scope.Location, property: {
                LocationId: $scope.Location.Id
            }
        });

    }


    $scope.locationClassCodes = function (location) {
        var classcodes = [];

        if (location != null) {
            for (var i = 0; i < $scope.ClassCodes.length; i++) {
                var c = $scope.ClassCodes[i];
                if (c.LocationNumber == location.LocationNumber) {
                    classcodes.push(c);
                }
            }
        }
        return classcodes;
    }
}]);

MALACHIAPP.controller('test_Homeowners_modifyPropertyCtrl', ['$scope', 'policyService', 'notificationsHub', '$sce', '$modal', function ($scope, policyService, notificationsHub, $sce, $modal) {
    $scope.parent = $scope.$parent;
    $scope.disableSaveButton = false;
    $scope.TotalTIV = 0;
  	$scope.keys = '';

    $scope.close = function () {
        $('#modifyProperty').hide();
        $('#listProperty').show();
        window.onbeforeunload = null;
        $scope.disableSaveButton = false;
        $scope.ParentScope.policyMenuVisible = true;
	  		$scope.keys = '';
    }

    $scope.searchByBeginsWith = function (actual, expected) {
        var lowerSearchString = (actual + '').toLowerCase();
        return lowerSearchString.indexOf(expected.toLowerCase()) === 0;
    }

    $scope.showLimitName = function (limit) {
        return (limit.LimitName != "Coverage E" && limit.LimitName != "Coverage F") ? limit.LimitName : limit.DisplayName;
    }

    $scope.save = function () {
        $scope.disableSaveButton = true;
        $scope.validateInputs();
        $scope.resetOpeningProtection();
			$scope.keys = '';

        if ($scope.ErrorList.length > 0) {
            $scope.disableSaveButton = false;
            return;
        }

        for (var k = 0; k < $scope.Property.Limits.length; k++) {
            $scope.Property.Limits[k].CauseOfLoss = $scope.Property.CoverageForm;
        }

        if ($scope.Property.Id == null) {
            Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
            policyService.newProperty($scope.PolicyId, $scope.Property.LocationId).then(function (result) {
                Metronic.unblockUI('.modal-dialog');
                if (result.data.Result.Success) {
                    if ($scope.Location.Properties == null) $scope.Location.Properties = [];
                    $scope.Property.Id = result.data.Property.Id;
                    $scope.Property.BuildingNumber = result.data.Property.BuildingNumber;
                    $scope.Location.Properties.push($scope.Property);

                    $scope.updateProperty();

                    $scope.Policy.CurrentVersion.RateProperty = true;
                }
                else {
                    $scope.disableSaveButton = false;
                    $scope.Errors = result.data.Result.Errors;
                }
            }, function (error) {
                $scope.disableSaveButton = false;
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
        }
        else {
            $scope.updateProperty();
        }

    }

    $scope.updateProperty = function () { //set values of hidden fields to default in case Builders Risk, Vacant, HO-8 or DP-1 are selected
        policyService.updateProperty($scope.PolicyId, $scope.Property).then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy.CurrentVersion.RateProperty = true;
                $scope.Property = result.data.Property;
                $scope.Location.Properties = $scope.Location.Properties.filter(x => x.Id != $scope.Property.Id);
                $scope.Location.Properties.push($scope.Property);

                for (var j = 0; j < $scope.Locations.length; j++) {
                    var loc = $scope.Locations[j];
                    loc.TIV = 0;
                    for (var i = 0; i < loc.Properties.length; i++) {
                        loc.Properties[i].TIV = 0;

                        for (var k = 0; k < loc.Properties[i].Limits.length; k++) {
                            if (loc.Properties[i].Limits[k].LimitName != 'Coverage E' &&
                                loc.Properties[i].Limits[k].LimitName != 'Coverage F') {
                                loc.Properties[i].TIV += loc.Properties[i].Limits[k].Amount;
                            }
                        }

                        loc.TIV += loc.Properties[i].TIV;
                    }
                }

                // -----
                // Property Deductibles
                setWindDeductible();
                setPressurizedWaterDamageDeductible();
                setDollarDeductible();
                // Add deductibles without an assigned property.
                for (var deductible of $scope.PropertyDeductibles) {
                    if (deductible.PropertyId == null) deductible.PropertyId = $scope.Property.Id;
                }
                policyService.updatePropertyDeductibles($scope.Policy.Id, $scope.Property.Id, $scope.PropertyDeductibles).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].Deductibles = result.data.PropertyDeductibles;
                        $scope.parent.PropertyDeductibles = result.data.PropertyDeductibles;
                        $scope.PropertyDeductibles = result.data.PropertyDeductibles;
                        $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].Sublimits = result.data.PropertySublimits;
                        $scope.parent.PropertySublimits = result.data.PropertySublimits;
                        $scope.PropertySublimits = result.data.PropertySublimits;
                        $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].ExcludeWindHail = result.data.ExcludeWindHail;
                        $scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].TheftExclusion = result.data.TheftExclusion;

                        if (!$scope.parent.Policy.CurrentVersion.Locations[0].Properties[0].ExcludeWindHail && !$scope.PropertyDeductibles.filter(x => x.Name == "Named Storm Deductible")[0].Amount) {
                            $scope.parent.ErrorList.push("Wind Deductible Amount is required.")
                        }
                        else {
                            $scope.parent.ErrorList = [];
                        }

                        $scope.close();

                    } else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                },
                    function (error) {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });

                notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Building ' + $scope.Property.BuildingNumber + ' is saved.');
            }
            else {
                $scope.disableSaveButton = false;
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.disableSaveButton = false;
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.isSquareFeetInvalid = function () {
        var property = $scope.Property;
        if (property == undefined) return true;

        var squareFeet = property.SquareFeet;
        var isEmptyOrUndefined = checkInputs(squareFeet);
        if (isEmptyOrUndefined || isNaN(squareFeet)) return true;

        squareFeet = parseInt(squareFeet);
        return squareFeet <= 0;
    }

    $scope.isIncreaseLimit = function (name) {
        return name && name.includes("Increase");
    }

    $scope.defaultLimits = function (limit) {
        if (limit.LimitName == "Coverage A") {
            var limitCoverageB = $scope.Property.Limits.find(x => x.LimitName == "Coverage B");
            var limitCoverageC = $scope.Property.Limits.find(x => x.LimitName == "Coverage C");
            var limitCoverageD = $scope.Property.Limits.find(x => x.LimitName == "Coverage D");

            var limitA = Number.parseInt(limit.Amount);
            limitCoverageB.Amount = limitA * 0.1;
            limitCoverageC.Amount = limitA * 0.5;
            limitCoverageD.Amount = limitA * 0.2;
        }
        if (limit.LimitName == "Coverage E" && limit.Amount != 0) {
            var limitCoverageF = $scope.Property.Limits.find(x => x.LimitName == "Coverage F");
            
            if (limitCoverageF.Amount == 0) {
                limitCoverageF.Amount = 1000;
            }
        }
    };

    /* This will only allow numbers */
    $scope.filterCharValue = function ($event) {
        if (isNaN(String.fromCharCode($event.keyCode))) {
            $event.preventDefault();
        }
    };

    function setWindDeductible() {
        var windDeductible = $scope.Property.Deductibles ? $scope.Property.Deductibles.find(x => x.Name == "Named Storm Deductible") : null;
        var windPropertyDeductible = $scope.PropertyDeductibles.find(x => x.Name == "Named Storm Deductible");
        if (!windPropertyDeductible) {
            if (windDeductible) {
                $scope.PropertyDeductibles.push(windDeductible);
            }
            else {
                $scope.PropertyDeductibles.push({
                    PropertyId: $scope.Property.Id,
                    Name: 'Named Storm Deductible',
                    Amount: '5%'
                });
            }
        }
    }

    function setDollarDeductible() {
        var dollarDeductible = $scope.Property.Deductibles ? $scope.Property.Deductibles.find(x => x.Name == "Dollar Deductible") : null;
        var dollarPropertyDeductible = $scope.PropertyDeductibles.find(x => x.Name == "Dollar Deductible");
        if (!dollarPropertyDeductible) {
            if (dollarDeductible) {
                $scope.PropertyDeductibles.push(dollarDeductible);
            }
            else {
                $scope.PropertyDeductibles.push({
                    PropertyId: $scope.Property.Id,
                    Name: 'Dollar Deductible',
                    Amount: '5000'
                });
            }
        }
    }

    function setPressurizedWaterDamageDeductible() {
        if ($scope.Property.PressurizedWaterDamageExclusion) {
            if ($scope.PropertyDeductibles.some(x => x.Name == "Pressurized Water Damage Deductible"))
                $scope.PropertyDeductibles.splice($scope.PropertyDeductibles.findIndex(x => x.Name == "Pressurized Water Damage Deductible"), 1);
        } else {
            var nwwDeductible = $scope.Property.Deductibles ? $scope.Property.Deductibles.find(x => x.Name == "Pressurized Water Damage Deductible") : null;
            var nwwPropertyDeductible = $scope.PropertyDeductibles.find(x => x.Name == "Pressurized Water Damage Deductible");
            if (!nwwPropertyDeductible) {
                if (nwwDeductible) {
                    $scope.PropertyDeductibles.push(nwwDeductible);
                }
                else {
                    var coverageALimit = Number.parseInt($scope.Property.Limits.find(x => x.LimitName == "Coverage A").Amount);
                    if (coverageALimit < 1000000) {
                        $scope.PropertyDeductibles.push({
                            PropertyId: $scope.Property.Id,
                            Name: 'Pressurized Water Damage Deductible',
                            Amount: '10000'
                        });
                    }
                    else if (coverageALimit >= 1000000) {
                        $scope.PropertyDeductibles.push({
                            PropertyId: $scope.Property.Id,
                            Name: 'Pressurized Water Damage Deductible',
                            Amount: '10000'
                        });
                    }
                }
            }
        }
    }

    $scope.theftExclusionChecked = function () {
        $scope.Property.TheftExclusion != $scope.Property.TheftExclusion;
    }

    $scope.yearUpdateChanged = function () {
        if ($scope.Property.YearUpgrade == "-") {
            $scope.Property.RoofUpdate = $scope.Property.YearBuilt;
            $scope.Property.WiringUpdate = $scope.Property.YearBuilt;
            $scope.Property.PlumbingUpdate = $scope.Property.YearBuilt;
            $scope.Property.HVACUpdate = $scope.Property.YearBuilt;
        }
        $scope.requireRerate();
    }

    $scope.checkNumberOfStories = function () {
        var property = $scope.Property;
        if (property == undefined) return true;

        var numberOfStories = parseInt(property.NumberOfStories);
        return numberOfStories < 1;
    }

    $scope.windDeductibleInfo = function () {
        var html = '<table style="border-collapse: collapse; border: 1px solid white; width: 250px;">';
        html += '<tr>';
        html += '<td><ul style="list-style:none;margin-left:2px;padding-left:2px;padding-top:4px">';
        html += '<li>Within 2 miles from coast: 5%</li>';
        html += '<li>Over 2 & up to 5 miles from coast: 3%</li>';
        html += '<li>Over 5 miles from coast: 2%</li>';
        html += '</ul></td>';
        html += '</tr>';
        html += '</table>';

        return $sce.trustAsHtml(html);
    }

    $scope.showRoofShapeGuidelines = function () {
        BootstrapDialog.show({
            title: 'Roof Shapes',
            message: '' +
                '<img class="img-responsive" src="/Content/img/roofshapes.png" />',
            buttons: [{
                label: 'Ok',
                cssClass: 'btn-primary',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }]
        });
    }

    $scope.showRoofAnchorGuidelines = function () {
        BootstrapDialog.show({
            title: 'Roof Anchor',
            message: '' +
                '<div class="row">' +
                '<div class="col-sm-6"><img class="img-responsive" src="/Content/img/SINGLEWRAPtext 1.jpg" /></div>' +
                '<div class="col-sm-6"><img class="img-responsive" src="/Content/img/DOUBLEWRAPtext 1.jpg" /></div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-sm-3"></div>' +
                '<div class="col-sm-6"><img class="img-responsive" src="/Content/img/CLIPtext 1.jpg" /></div>' +
                '<div class="col-sm-3"></div>' +
                '</div>',
            buttons: [{
                label: 'Ok',
                cssClass: 'btn-primary',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }]
        });
    }

    $scope.yearUpdateInfo = function () {
        var html = '<table style="border-collapse: collapse; border: 1px solid white; width: 250px;">';
        html += '<tr>';
        html += '<td><ul style="list-style:none;margin-left:2px;padding-left:2px;padding-top:4px">';
        html += '<li>If property is older than 25 years with full updates less than 25 years, please have the older home supplemental app completed.</li>';
        html += '</ul></td>';
        html += '</tr>';
        html += '</table>';

        return $sce.trustAsHtml(html);
    }

    $scope.waterBackupInfo = function () {
        var html = '<table style="border-collapse: collapse; border: 1px solid white; width: 250px;">';
        html += '<tr>';
        html += '<td><ul style="list-style:none;margin-left:2px;padding-left:2px;padding-top:4px">';
        html += '<li>$5,000 limit A/P $100</li>';
        html += '<li>$10,000 limit A/P $150</li>';
        html += '<li>$25,000 limit A/P $250</li>';
        html += '</ul></td>';
        html += '</tr>';
        html += '</table>';

        return $sce.trustAsHtml(html);
    }

    $scope.getType = function (squareFeet) {
        if (squareFeet <= 2200) {
            return 1;
        } else if (squareFeet <= 3800) {
            return 2;
        } else if (squareFeet <= 4900) {
            return 3;
        } else if (squareFeet <= 7000) {
            return 4;
        } else {
            return 5;
        }
    }

    $scope.getEstimationAmount = function (type, area) {
        switch (type) {
            case 1:
                if (area == 3) {
                    return 95;
                } else if (area == 2) {
                    return 105;
                } else {
                    return 115;
                }
            case 2:
                if (area == 3) {
                    return 110;
                } else if (area == 2) {
                    return 120;
                } else {
                    return 130;
                }
            case 3:
                if (area == 3) {
                    return 130;
                } else if (area == 2) {
                    return 140;
                } else {
                    return 155;
                }
            case 4:
                if (area == 3) {
                    return 185;
                } else if (area == 2) {
                    return 195;
                } else {
                    return 200;
                }
            case 5:
                return 250;
            default:
                return 250;
        }
    }

    $scope.updateExtensionEndorsementOptions = function () {
        // Skip process if extension endorsement selection is hidden. Clear out the selected option if any.
        if (!$scope.showExtensionEndorsement) {
            if ($scope.Property.ExtensionEndorsementLimit != null && $scope.Property.ExtensionEndorsementLimit != "") {
                $scope.Property.ExtensionEndorsementLimit = null;
            }
            return;
        }

        var characteristic = $scope.Characteristics["Extension Endorsement"];
        var isWindOnly = $scope.PropertyWindCoverageType.Name == "Wind Only";

        if (!isWindOnly) {
            // Hide the 'Wind Only' option. If it was originally selected, choose the current last option.
            var option = characteristic.filter(x => x.Id != "Coverage Extension Endorsement D");
            $scope.Characteristics["Extension Endorsement"] = option;

            if ($scope.Property.ExtensionEndorsementLimit == "Coverage Extension Endorsement D") {
                var lastOption = characteristic[option.length - 1].Id;
                $scope.Property.ExtensionEndorsementLimit = lastOption;
            }
        } else {
            // Add the option back (if it does not exist).
            var exists = characteristic.some(x => x.Id == "Coverage Extension Endorsement D");
            if (!exists) {
                var option = { Id: "Coverage Extension Endorsement D", Name: "Endorsement Wind Only" };
                $scope.Characteristics["Extension Endorsement"].push(option);
            }
        }
    }

    $scope.calculateTotalTIV = function () {
        if ($scope.Property.Limits == undefined) {
            $scope.TotalTIV = 0;
            return;
        }

        if ($scope.Property == null || $scope.Property.Limits.length == 0) {
            $scope.TotalTIV = 0;
            return;
        }
        var coverageA = parseInt($.grep($scope.Property.Limits, function (n) { return n.LimitName == 'Coverage A' })[0].Amount.toString().replace(/,/g, ''));
        var coverageB = parseInt($.grep($scope.Property.Limits, function (n) { return n.LimitName == 'Coverage B' })[0].Amount.toString().replace(/,/g, ''));
        var coverageC = parseInt($.grep($scope.Property.Limits, function (n) { return n.LimitName == 'Coverage C' })[0].Amount.toString().replace(/,/g, ''));
        var coverageD = parseInt($.grep($scope.Property.Limits, function (n) { return n.LimitName == 'Coverage D' })[0].Amount.toString().replace(/,/g, ''));
        var totalTIV = coverageA + coverageB + coverageC + coverageD;

        $scope.TotalTIV = totalTIV;
    }

    $scope.validateInputs = function () {
        $scope.ErrorList = [];

        if (checkInputs($scope.Property.OccupiedBy)) {
            $scope.ErrorList.push('Please select a choice for Occupied By.');
        }

        //Checking Limits
        //$scope.Property.Limits.filter(x => x.LimitName != "Coverage E" && x.LimitName != "Coverage F").forEach(x => {
        //    var nameToShow = (x.LimitName == "Coverage E" || x.LimitName == "Coverage F") ? x.DisplayName : x.LimitName;
        //    if (x.Amount < 1) $scope.ErrorList.push('Please select an amount for ' + nameToShow + '.');
        //});

        if (checkInputs($scope.Property.Occupancy)) {
            $scope.ErrorList.push('Please select a choice for Occupancy.');
        }

        if (checkInputs($scope.Property.Construction)) {
            $scope.ErrorList.push('Please select a choice for Construction.');
        }

        if (checkInputs($scope.Property.FireStationFiveMiles)) {
            $scope.ErrorList.push('Please select an answer for: Station within 5 mi?');
        }

        if (checkInputs($scope.Property.FireHydrantThousandFeet)) {
            $scope.ErrorList.push('Please select an answer for: Hydrant within 1000 ft?');
        }

        if (checkInputs($scope.Property.YearBuilt)) {
            $scope.ErrorList.push('Please select a choice for Year Built.');
        }

        if (checkInputs($scope.Property.RoofUpdate)) {
            $scope.ErrorList.push('Please select a year for Roof Update.');
        }

        if (checkInputs($scope.Property.WiringUpdate)) {
            $scope.ErrorList.push('Please select a year for Wiring Update.');
        }

        if (checkInputs($scope.Property.PlumbingUpdate)) {
            $scope.ErrorList.push('Please select a year for Plumbing Update.');
        }

        if (checkInputs($scope.Property.HVACUpdate)) {
            $scope.ErrorList.push('Please select a year for HVAC Update.');
        }

        if (checkInputs($scope.Property.SquareFeet)) {
            $scope.ErrorList.push('Please enter the Floor Area.');
        }

        if (checkInputs($scope.Property.RoofShape)) {
            $scope.ErrorList.push('Please select choice for Roof Shape.');
        }

        if (checkInputs($scope.Property.NumberOfStories) || $scope.Property.NumberOfStories == "0") {
            $scope.ErrorList.push('Please select a choice for Number of Stories.');
        }

        if (checkInputs($scope.Property.NumberOfBathrooms) || $scope.Property.NumberOfBathrooms == "0") {
            $scope.ErrorList.push('Please select a choice for Number of Bathrooms.');
        }

        if (checkInputs($scope.Property.CentralStationAlarm)) {
            $scope.ErrorList.push('Please select choice for Fire Alarm.');
        }

        if (checkInputs($scope.Property.RoofAnchor)) {
            $scope.ErrorList.push('Please select a choice for Roof Anchor.');
        }

        if (checkInputs($scope.Property.RoofCover)) {
            $scope.ErrorList.push('Please select a choice for Roof Cover.');
        }

        if (checkInputs($scope.Property.ACVRoof)) {
            $scope.ErrorList.push('Please select a choice for Actual Cost Value Roof.');
        }

        if (!$scope.Property.ExcludeWindHail && checkInputs($scope.Property.OpeningProtection)) {
            $scope.ErrorList.push('Please select a choice for Opening Protection.');
        }

        if (isNaN($scope.Property.SquareFeet)) {
            $scope.ErrorList.push('Floor Area must be a number');
        }
    }

    $scope.resetOpeningProtection = function () {
        if ($scope.Property.ExcludeWindHail) {
            $scope.Property.OpeningProtection = $scope.Characteristics["Opening Protection"][0];
        }
    }

    function checkInputs(input) {
        if (input == '' || input == undefined) {
            return true;
        }
        else {
            return false;
        }
    }

    $scope.yearBuiltChanged = function (item, model) {
        if ($scope.Property.RoofUpdate == "" || $scope.Property.RoofUpdate == null || $scope.Property.RoofUpdate < $scope.Property.YearBuilt) {
            $scope.Property.RoofUpdate = $scope.Property.YearBuilt;
        }
        if ($scope.Property.WiringUpdate == "" || $scope.Property.WiringUpdate == null || $scope.Property.WiringUpdate < $scope.Property.YearBuilt) {
            $scope.Property.WiringUpdate = $scope.Property.YearBuilt;
        }
        if ($scope.Property.PlumbingUpdate == "" || $scope.Property.PlumbingUpdate == null || $scope.Property.PlumbingUpdate < $scope.Property.YearBuilt) {
            $scope.Property.PlumbingUpdate = $scope.Property.YearBuilt;
        }
        if ($scope.Property.HVACUpdate == "" || $scope.Property.HVACUpdate == null || $scope.Property.HVACUpdate < $scope.Property.YearBuilt) {
            $scope.Property.HVACUpdate = $scope.Property.YearBuilt;
        }
    }

    $scope.roofUpdateChanged = function (item, model) {
        if ($scope.Property.RoofUpdate == "" || $scope.Property.RoofUpdate == null || $scope.Property.RoofUpdate < $scope.Property.YearBuilt) {
            $scope.Property.RoofUpdate = $scope.Property.YearBuilt;
        }
    }

    $scope.wiringUpdateChanged = function (item, model) {
        if ($scope.Property.WiringUpdate == "" || $scope.Property.WiringUpdate == null || $scope.Property.WiringUpdate < $scope.Property.YearBuilt) {
            $scope.Property.WiringUpdate = $scope.Property.YearBuilt;
        }
    }

    $scope.plumbingUpdateChanged = function (item, model) {
        if ($scope.Property.PlumbingUpdate == "" || $scope.Property.PlumbingUpdate == null || $scope.Property.PlumbingUpdate < $scope.Property.YearBuilt) {
            $scope.Property.PlumbingUpdate = $scope.Property.YearBuilt;
        }
    }

    $scope.hvacUpdateChanged = function (item, model) {
        if ($scope.Property.HVACUpdate == "" || $scope.Property.HVACUpdate == null || $scope.Property.HVACUpdate < $scope.Property.YearBuilt) {
            $scope.Property.HVACUpdate = $scope.Property.YearBuilt;
        }
    }

    $scope.GetCharacteristicValues = function (name) {
        return $scope.Characteristics[name];
    }

    $scope.showGuidelines = function (guideline) {
        $modal.open({
            templateUrl: 'fieldDescription.html',
            controller: 'test_Homeowners_fieldDescription',
            backdrop: 'static',
            resolve: {
                guideline: function () { return guideline; }
            }
        });
    };

    $scope.showLocationToggle = true;

    $scope.toggleStreetView = function () {
        var toggle = panorama.getVisible();
        if (toggle == false) {
            panorama.setVisible(true);
        } else {
            panorama.setVisible(false);
        }
    }

	$scope.koonamiCode = function (event) {
		let b = '';
		$scope.keys += event.key;
		if ($scope.keys === "testingsucks") {
			alert("You're Awesome!");
			loadPropertyWithTestData();
		}
		else {
			return;
		}
	}

	function loadPropertyWithTestData() {
		$scope.Property.VacantHome = 'No';
		$scope.Property.OccupiedBy = 'Owner Occupied';
		$scope.Property.Limits.filter(x => x.LimitName == 'Coverage A')[0].Amount = 750000;
		$scope.Property.Limits.filter(x => x.LimitName == 'Coverage B')[0].Amount = 56000;
		$scope.Property.Limits.filter(x => x.LimitName == 'Coverage C')[0].Amount = 375000;
		$scope.Property.Limits.filter(x => x.LimitName == 'Coverage D')[0].Amount = 150000;
		$scope.Property.Limits.filter(x => x.LimitName == 'Coverage E')[0].Amount = 100000;
		$scope.Property.Limits.filter(x => x.LimitName == 'Coverage F')[0].Amount = 2000;
		$scope.Property.TheftExclusion = false;
		$scope.Property.PressurizedWaterDamageExclusion = false;
		$scope.Property.PersonalPropertyExclusion = false;
		$scope.Property.OutdoorPropertyExclusion = false;
		$scope.Property.Occupancy = 'Primary';
		$scope.Property.RentedToOthers = 'No';
		$scope.Property.Construction = 'Concrete';
		$scope.Property.Sprinklered = 'Yes'
		$scope.Property.FirePlaceIndication = 'No';
		$scope.Property.CentralStationAlarm = 'Yes';
		$scope.Property.CentralBurglarAlarm = 'Yes';
		$scope.Property.FireStationFiveMiles = 'Yes';
		$scope.Property.FireHydrantThousandFeet = 'Yes';
		let year = 2015;
		$scope.Property.YearBuilt = year;
		$scope.Property.RoofUpdate = year;
		$scope.Property.WiringUpdate = year;
		$scope.Property.PlumbingUpdate = year;
		$scope.Property.HVACUpdate = year;
		$scope.Property.NumberOfStories = 1;
		$scope.Property.NumberOfBathrooms = 1;
		$scope.Property.RoofShape = 'Hip';
		$scope.Property.RoofCover = 'Concrete/Clay Tiles';
		$scope.Property.RoofAnchor = 'Double Wraps';
		$scope.Property.RoofSheathing = '8d Nails';
		$scope.Property.ACVRoof = 'No';
		$scope.Property.OpeningProtection = 'Openings Designed for Large Missiles';
		$scope.Property.SquareFeet = 3500;
		$scope.Property.ParcelSize = 12000;
		$scope.Property.Cladding = 'Brick Veneer';
		$scope.Property.PropertyPool = 'Y';
		$scope.Property.FloodZone = 'A';
	}
}]);

MALACHIAPP.controller('test_Homeowners_fieldDescription', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'guideline', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, guideline) {
    $scope.guideline = guideline;
    $scope.onHomeOwnersPortal = true;

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

MALACHIAPP.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().startsWith(text) || item[prop].toString().replace("$", "").toLowerCase().startsWith(text)) {
                        itemMatches = true;
                        break;
                    }
                }
                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
});


var geocoder = new google.maps.Geocoder();
var addressLocation;
var map;

function updateMapAddress(address) {
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            addressLocation = results[0].geometry.location;
            DrawMap(19, address);
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function getModel(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Id == id) return list[i];
    }
}

function getModelByName(list, name) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].Name == name) return list[i];
    }
}

/// </summary>
/// <event name="DrawMap"></event>
var panorama = null;

function DrawMap(zoom, address) {
    var sv = new google.maps.StreetViewService();
    var map = null;
    var heading = null;

    var myOptions = {
        zoom: zoom,
        center: addressLocation,
        scaleControl: true,
        mapTypeId: google.maps.MapTypeId.HYBRID
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    sv.getPanorama({ location: addressLocation, radius: 75 },
        function (streetViewPanoramaData, status) {
            if (status === google.maps.StreetViewStatus.OK) {

                if (address != null) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: addressLocation,
                        title: address + '<br/>lat: ' + addressLocation.lat() + ' , lon: ' + addressLocation.lng()
                    });
                }

                heading = google.maps.geometry.spherical.computeHeading(streetViewPanoramaData.location.latLng,
                    addressLocation);
                panorama = map.getStreetView();
                panorama.setPosition(addressLocation);
                panorama.setPov(/** @type {google.maps.StreetViewPov} */
                    ({
                        heading: heading,
                        pitch: 0
                    }));
                panorama.setVisible(true);
            }
        });
}



