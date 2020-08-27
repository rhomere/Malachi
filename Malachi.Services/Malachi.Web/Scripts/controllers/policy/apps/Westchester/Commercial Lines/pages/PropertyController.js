'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Commercial_Lines_PropertyController', ['$rootScope', '$scope', '$location', '$stateParams', '$filter', '$ocLazyLoad', 'authService', 'notificationsHub', '$modal', 'settings', 'policyService', 'toolsService', function ($rootScope, $scope, $location, $stateParams, $filter, $ocLazyLoad, authService, notificationsHub, $modal, settings, policyService, toolsService) {
    $scope.parent = $scope.$parent;

    $scope.parent.LoadingPage = true;
    $scope.AppId = $scope.parent.AppId;
    $scope.PolicyId = $scope.parent.PolicyId;
    $scope.Policy = $scope.parent.Policy;
    $scope.Characteristics = [];
    $scope.Locations = [];
    $scope.FormattedProperties = [];
    $scope.Mortgagees = [];
    $scope.ProtectiveSafeGuards = [];
    $scope.LossPayees = [];
    $scope.PropertyDeductibles = [];
    $scope.SelectedProperty = {};
    $scope.PropertyWindCoverageType = {};
    $scope.showAllDeductibles = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;

    if ($scope.AppId == null) {
        $rootScope.$state.transitionTo('policyDashboard');
    }

    if ($scope.PolicyId) { // Existing Policy
        loadProperty();
        loadPropertyDeductibles(true);
    }
    else {
        $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
    }

    function loadPropertyDeductibles(selectFirst) {
        selectFirst = selectFirst || false;
        $scope.FormattedProperties = [];

        for (var i = 0; i < $scope.Locations.length; i++) {
            var location = $scope.Locations[i];
            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];
                var description = location.LocationNumber + " - " + property.BuildingNumber + ": " + property.Occupancy + ", " + property.Construction;
                $scope.FormattedProperties.push({
                    Id: property.Id,
                    LocationNumber: location.LocationNumber,
                    BuildingNumber: property.BuildingNumber,
                    Description: description
                });
            }
        }

        if ($scope.FormattedProperties.length > 0) {
            $scope.FormattedProperties = $filter('orderBy')($scope.FormattedProperties, ['LocationNumber', 'BuildingNumber']);
            var index = selectFirst ? 0 : $scope.FormattedProperties.length - 1;
            $scope.SelectedProperty.value = $scope.FormattedProperties[index];
        }
    }

    $scope.$on("reload-deductibles", function (event, args) {
        if (args == null) args = { selectFirst: false, deductibles: null };
        if (args.selectFirst == null) args.selectFirst = false;
        if (args.deductibles != null) $scope.PropertyDeductibles = args.deductibles;
        loadPropertyDeductibles(args.selectFirst);
    });

    function loadProperty() {
        $scope.Policy = $scope.parent.Policy;
        $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;
        $scope.Mortgagees = [];
        $scope.ProtectiveSafeGuards = [];
        $scope.LossPayees = [];
        $scope.PropertyDeductibles = [];
        $scope.FormattedProperties = [];

        for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
            var location = $scope.Policy.CurrentVersion.Locations[i];
            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];

                var description = location.LocationNumber + " - " + property.BuildingNumber + ": " + property.Occupancy + ", " + property.Construction;
                $scope.FormattedProperties.push({
                    Id: property.Id,
                    LocationNumber: location.LocationNumber,
                    BuildingNumber: property.BuildingNumber,
                    Description: description
                });

                for (var k = 0; k < property.Mortgagees.length; k++) {
                    $scope.Mortgagees.push(property.Mortgagees[k]);
                }

                for (var k = 0; k < property.LossPayees.length; k++) {
                    $scope.LossPayees.push(property.LossPayees[k]);
                }

                for (var k = 0; k < property.ProtectiveSafeGuards.length; k++) {
                    $scope.ProtectiveSafeGuards.push(property.ProtectiveSafeGuards[k]);
                }

                for (var k = 0; k < property.Deductibles.length; k++) {
                    $scope.PropertyDeductibles.push(property.Deductibles[k]);
                }
            }
        }

        for (var j = 0; j < $scope.Locations.length; j++) {
            var loc = $scope.Locations[j];
            loc.TIV = 0;
            for (var i = 0; i < loc.Properties.length; i++) {
                loc.Properties[i].TIV = 0;

                for (var k = 0; k < loc.Properties[i].Limits.length; k++) {
                    loc.Properties[i].TIV += loc.Properties[i].Limits[k].Amount;
                }

                loc.TIV += loc.Properties[i].TIV;
            }
        }

        $scope.parent.LoadingPage = false;

        $scope.Characteristics = {
            'Coverage Form': [
                {
                    id: "Basic",
                    name: "Basic"
                },
                {
                    id: "Broad",
                    name: "Broad"
                },
                {
                    id: "Special",
                    name: "Special"
                },
                {
                    id: "Spec Ex Theft",
                    name: "Special Excluding Theft"
                },
            ],
            'Coverage Form - Wind Only': [
                {
                    id: "Wind or Hail",
                    name: "Windstorm or Hail Only"
                }
            ],
            'Co-Insurance': ["80%", "90%", "100%"],
            'Wind Deductible': ["Non Applicable", "1%", "2%", "3%", "5%", "10%"],
            'Named Storm Deductible': [
                "Non Applicable",
                "2%",
                "3%",
                "5%",
                "10%"
            ],
            'All Other Wind Deductible': [
                "Non Applicable",
                "2%",
                "3%",
                "5%",
                "10%"
            ],
            'Ordinance And Law': [
                "Excluded",
                "B&C",
                'A'
            ],
            'Electronic Data Processing': [
                "Excluded",
                "Included"
            ],
            'Commercial Occupancy': [
                "Agri Equip Dealer",
                "Aircraft Hanger/Repair",
                "Airport Terminal",
                "Amusement Park/Fairgrounds",
                "Apartment",
                "Appliance Repair",
                "Appliance Retail",
                "Asphalt Batch Plant",
                "Auditoriums/Arenas",
                "Auto Dealer - Service Repair",
                "Auto Dealer - Showroom",
                "Auto Dealer-Floor Plan",
                "Auto Parts and Supplies",
                "Auto repair shop",
                "Bakeries",
                "Bar/Tavern",
                "Beauty Salon",
                "Boat Dealer",
                "Bowling Alley",
                "Brewery",
                "Building materials dealers",
                "Building Supplies - Not Lumber Yard",
                "Building Supplies/Lumber Yard",
                "Camera/Photo Supplies",
                "Camps",
                "Canvas Manufacturing",
                "Carpet/Floor Distributing",
                "Casino - With BI",
                "Casino -Ex BI",
                "Cement Plant",
                "Chemical Plant -Non Petrol",
                "Churches",
                "Clinics/laboratories",
                "Clothing Retail/Wholesale",
                "Clubs-Social",
                "Condominium",
                "Contractor Equipment dealer",
                "Contractors",
                "Contractors Offices",
                "Convenient Store",
                "Convention Center",
                "Country Club",
                "Day Care Center",
                "Deli",
                "Department Store",
                "Distillers",
                "Distributor- Oil/Fuel",
                "Distributors (no chemicals)",
                "Drug Store",
                "Drug Store - with Theft",
                "Dry Cleaners",
                "Dwelling",
                "EDP Equipment",
                "Electroplating",
                "Exhibition Halls",
                "Exterminators/pest control",
                "Fairs",
                "Farmers Market",
                "Feed/grain stores or dealers",
                "Fertilizer Plants",
                "Fine Art Dealer",
                "Food Processing - Cooking",
                "Food Processing - Frying",
                "Food Processing - Processing Only",
                "Fuel dealers or distributors",
                "Funeral home/Mortuary",
                "Furniture Retail/Wholesaler",
                "Gasoline Station",
                "Glass Products",
                "Grocer - Small Retail",
                "Grocer - Supermarket",
                "Gunsmith",
                "Habitational",
                "Habitational Student Living",
                "Halls",
                "Hardware Store",
                "Health Club",
                "Heavy machinery repair",
                "Hospital",
                "Hotels/Motels",
                "Industrial Painting",
                "Industrial processing",
                "Jewelry- retail/Wholesale",
                "Kennels",
                "Laboratory - Research",
                "Laboratory Equipment",
                "Laundry -Commercial",
                "Leather Tanneries",
                "Library",
                "Liquor stores",
                "Machine shops",
                "Manufacturer - Paint",
                "Manufacturing - Boats",
                "Manufacturing - Electronics",
                "Manufacturing - Fiberglass",
                "Manufacturing - Leather goods",
                "Manufacturing (hazardous)",
                "Manufacturing (non-hazardous)",
                "Manufacturing -Mixed",
                "Manufacturing -Plastics",
                "Manufacturing/dealer - Chemical",
                "Marinas",
                "Medical office",
                "Mercantile Building",
                "Metal Fabrication",
                "Metal Worker - Non Molten",
                "Metal Worker -Molten",
                "Mini-storage facilities",
                "Museum",
                "Night Club",
                "Nursing Home",
                "Offices",
                "Pawn shops",
                "Prison/Halfway House",
                "Recycling/salvage",
                "Restaurant",
                "Schools",
                "Service",
                "Shops/Retail",
                "Stables/barns",
                "Upholstery shops",
                "Warehouse - Cold Storage",
                "Warehouses",
                "Warehouses (with flammables)",
                "Welding",
                "Woodworking"],
            'Construction': [
                "Fire Resistive",
                "Frame",
                "Joisted Masonry",
                "Masonry Non-Combustible",
                "Modified Fire Resistive",
                "Non-Combustible"],
            'AOP Deductible': [
                "$1,000",
                "$2,500",
                "$5,000",
                "$10,000",
                "$25,000",
                "$50,000"],
            'Sprinklered': [
                "None", "Partial", "Full"
            ],
            'Protection Class': [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"
            ],
            'Roof Shape': [
                "Flat",
                "Gable",
                "Hip",
                "Non Applicable",
                "Flat with parapets (3+ feet)"
            ],
            'Roof Anchor': [
                "Clips",
                "Double wraps",
                "Single wraps",
                "Structural",
                "Toe nailing / No anchorage",
                "Unknown"
            ],
            'Roof Coverage': [
                "Built Up",
                "Composite",
                "Concrete Fill",
                "Concrete/Clay Tiles",
                "Metal Sheathing",
                "Non Applicable",
                "Shingle",
                "Single Ply Membrane"],
            'Opening Protection': [
                "Unknown",
                "Impact Resistant Windows & Doors",
                "Impact Resistant Windows Only"
            ],
            'Number of Stories': [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"
            ],
            'Central Station Alarm': ["No", "Yes"],
            'Extension Endorsement': [
                { Id: "Coverage Extension Endorsement A", Name: "Coverage Extension Endorsement A" },
                { Id: "Coverage Extension Endorsement B", Name: "Coverage Extension Endorsement B" },
                { Id: "Coverage Extension Endorsement C", Name: "Coverage Extension Endorsement C - Lloyds Only" },
                { Id: "Coverage Extension Endorsement D", Name: "Endorsement Wind Only" }
            ],
            'Year Built': [],
            'Year Upgrade': [],
            'Roof Update': [],
            'Wiring Update': [],
            'Plumbing Update': [],
            'HVAC Update': [],
            'Sinkhole': ["Excluded", "Included"],
            'Builder\'s Risk Type': [
                "Ground Up Construction",
                "Renovation"
            ],
            'Vandalism': [
                "Excluded",
                "Included"
            ],
            'Sprinkler Leakage': [
                "Excluded",
                "Included"
            ],
            'Property Wind Coverage Types': [
                'With Wind/Hail',
                'Exclude Wind/Hail',
                'Wind Only'
            ]
        };

        var cYear = new Date().getFullYear();
        $scope.Characteristics['Year Upgrade'].push("-");
        for (var year = cYear; year >= 1900; year--) {
            $scope.Characteristics['Year Built'].push(year.toString());
            $scope.Characteristics['Year Upgrade'].push(year.toString());
            $scope.Characteristics['Roof Update'].push(year.toString());
            $scope.Characteristics['Wiring Update'].push(year.toString());
            $scope.Characteristics['Plumbing Update'].push(year.toString());
            $scope.Characteristics['HVAC Update'].push(year.toString());
        }
    };

    $scope.canAddDeductibles = function () {
        if ($scope.Locations.length < 1)
            return false;

        for (var i = 0; i < $scope.Locations.length; i++) {
            var location = $scope.Locations[i];

            if (location.Properties.length > 0)
                return true;
        }

        return false;
    };

    $scope.GetCompanyCharacteristicValues = function (riskCompanyId) {
        policyService.getRiskCompanyCharacteristicValues(riskCompanyId, 'Commercial Occupancy').then(function (result) {
            if (result.data.Result.Success) {
                $scope.CompanyCharacteristicValues = $scope.CompanyCharacteristicValues.concat(result.data.CompanyCharacteristicValues);
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    if ($scope.parent.CompanyCharacteristicValues == null || $scope.parent.CompanyCharacteristicValues.length == 0) {
        $scope.parent.CompanyCharacteristicValues = [];
        for (var k = 0; k < $scope.parent.RiskCompanies.length; k++) {
            $scope.GetCompanyCharacteristicValues($scope.parent.RiskCompanies[k].Id);
        }
    }


    $scope.GetListOfCompanyCharacteristicValues = function (characteristicValue, riskCompanyId) {
        var list = $.grep($scope.CompanyCharacteristicValues, function (n) { return n.RiskCompanyId == riskCompanyId && n.CharacteristicValue == characteristicValue });
        return list;
    }

    $scope.copy_Structure = function (location, property) {
        var modalInstance = $modal.open({
            templateUrl: 'copyProperty.html',
            controller: 'test_Commercial_Lines_copyPropertyCtrl',
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
                currentLocation: function () {
                    return location;
                },
                property: function () {
                    return property;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.copyStructure(data.location.Id, data.property.Id, $scope.PolicyId).then(function (result) {
                    if (result.data.Result.Success) {
                        var copiedProperty = result.data.Property;
                        var loc = $.grep($scope.Locations, function (x) { return x.Id == data.location.Id })[0];
                        loc.Properties.push(copiedProperty);
                        for (var k = 0; k < copiedProperty.Mortgagees.length; k++) {
                            $scope.Mortgagees.push(copiedProperty.Mortgagees[k]);
                        }

                        for (var k = 0; k < copiedProperty.LossPayees.length; k++) {
                            $scope.LossPayees.push(copiedProperty.LossPayees[k]);
                        }

                        for (var k = 0; k < copiedProperty.ProtectiveSafeGuards.length; k++) {
                            $scope.ProtectiveSafeGuards.push(copiedProperty.ProtectiveSafeGuards[k]);
                        }

                        for (var k = 0; k < copiedProperty.Deductibles.length; k++) {
                            $scope.PropertyDeductibles.push(copiedProperty.Deductibles[k]);
                        }
                        copiedProperty.TIV = 0;
                        for (var k = 0; k < copiedProperty.Limits.length; k++) {
                            copiedProperty.TIV += copiedProperty.Limits[k].Amount;
                        }
                        $scope.modify(data.location, copiedProperty);
                        $scope.parent.Policy.CurrentVersion.RateProperty = true;
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

    $scope.add_structure = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addProperty.html',
            controller: 'test_Commercial_Lines_addPropertyCtrl',
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
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                data.property.Id = null;

                $scope.PropertyDeductibles.push({
                    PropertyId: null,
                    Name: 'AOP Deductible',
                    Amount: '$1,000'
                });

                $scope.addWindDeductibleBasedOnState(data.location.Address.StateCode);

                data.property.RiskCompanyData = [];

                if ($.grep($scope.RiskCompanies, function (n) { return n.Id == "be7a9234-5ba5-49e5-acc0-deec3ff2ead0" }).length > 0) {
                    data.property.RiskCompanyData.push({ RiskCompanyId: "be7a9234-5ba5-49e5-acc0-deec3ff2ead0" });
                }
                if ($.grep($scope.RiskCompanies, function (n) { return n.Id == "48b1a26b-713f-4344-8470-5bfb9e25017c" }).length > 0) {
                    data.property.RiskCompanyData.push({ RiskCompanyId: "48b1a26b-713f-4344-8470-5bfb9e25017c" });
                }

                if (data.property.PropertyType == 'Building') {
                    policyService.getPropertyCoverageInfo(data.location.Id, false).then(function (result) {
                        if (result.data.Result.Success) {
                            data.property.RoofShape = result.data.Property.RoofShape;
                            data.property.NumberOfStories = result.data.Property.NumberOfStories;
                            data.property.SquareFeet = result.data.Property.SquareFeet;
                            data.property.Construction = result.data.Property.Construction;
                            data.property.RoofCoverage = result.data.Property.RoofCoverage;
                            data.property.ProtectionClass = result.data.Property.ProtectionClass;
                            data.property.YearBuilt = result.data.Property.YearBuilt;
                            data.property.HVACUpdate = result.data.Property.HVACUpdate;
                            data.property.WiringUpdate = result.data.Property.WiringUpdate;
                            data.property.PlumbingUpdate = result.data.Property.PlumbingUpdate;
                            data.property.RoofUpdate = result.data.Property.RoofUpdate;
                            data.property.HasBasement = result.data.Property.HasBasement;
                            data.property.RoofAnchor = result.data.Property.RoofAnchor;
                            data.property.Sinkhole = "Excluded";
                            data.property.CentralStationAlarm = "No";
                            data.property.Sprinklered = "None";
                            data.property.OpeningProtection = "Unknown";
                            $scope.PropertyWindCoverageType.Name = 'With Wind/Hail';

                            $scope.modify(data.location, data.property);
                        } else {
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                } else {
                    $scope.modify(data.location, data.property);
                }
            }
        });

    }

    $scope.getWindDeductibleBasedOnState = function (stateCode) {
        var nonApplicableList = ['AR', 'AZ', 'CA', 'CO', 'CT', 'GA', 'HI', 'ID', 'IL', 'IN', 'KS', 'LA', 'MA', 'MD', 'MO', 'NC', 'NE', 'NJ', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'TN', 'UT', 'VA', 'VT', 'WA', 'WV'];
        var deductible5List = ['AL', 'DE', 'FL', 'MI', 'MS', 'WI'];
        var deductible2List = ['SC', 'TX'];

        if (nonApplicableList.indexOf(stateCode) > -1) {
            return 'Non Applicable';
        } else if (deductible5List.indexOf(stateCode) > -1) {
            return '5%';
        } else if (deductible2List.indexOf(stateCode) > -1) {
            return '2%';
        }

        return '5%';
    }

    $scope.addWindDeductibleToProperty = function (propertyId, amount) {
        if ($scope.PropertyDeductible.Amount == 'Non Applicable') {
            $scope.PropertyDeductibles.push({
                PropertyId: propertyId,
                Amount: amount,
                Name: 'Wind Deductible',
                SubjectToMinimumOf: "N/A"
            });
        } else {
            $scope.PropertyDeductibles.push({
                PropertyId: propertyId,
                Amount: amount,
                Name: 'Wind Deductible',
                SubjectToMinimumOf: "$2,500"
            });
        }
    }

    $scope.addWindDeductibleBasedOnState = function (stateCode) {
        var deductible = null;
        var nonApplicableList = ['AR', 'AZ', 'CA', 'CO', 'CT', 'GA', 'HI', 'ID', 'IL', 'IN', 'KS', 'LA', 'MA', 'MD', 'MO', 'NC', 'NE', 'NJ', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'TN', 'UT', 'VA', 'VT', 'WA', 'WV'];
        var deductible5List = ['AL', 'DE', 'FL', 'MI', 'MS', 'WI'];
        var deductible2List = ['SC', 'TX'];

        if (nonApplicableList.indexOf(stateCode) > -1) {
            deductible = 'Non Applicable';
        } else if (deductible5List.indexOf(stateCode) > -1) {
            deductible = '5%';
        } else if (deductible2List.indexOf(stateCode) > -1) {
            deductible = '2%';
        }

        $scope.PropertyDeductibles.push({
            PropertyId: null,
            Amount: deductible,
            Name: 'Wind Deductible',
            SubjectToMinimumOf: "$2,500"
        });
    }

    $scope.addProtectiveSafeGuard = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addProtectiveSafeGuard.html',
            controller: 'test_Commercial_Lines_addProtectiveSafeGuardCtrl',
            size: 'lg',
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
                protectiveSafeGuard: function () {
                    return null;
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                var safeGuards = [];
                for (var j = 0; j < data.ProtectiveSafeGuard.Safeguards.length; j++) {
                    for (var i = 0; i < data.ProtectiveSafeGuard.Properties.length; i++) {
                        safeGuards.push({
                            PropertyId: data.ProtectiveSafeGuard.Properties[i],
                            ProtectiveSafeGuard: data.ProtectiveSafeGuard.Safeguards[j]
                        });
                    }
                }

                policyService.addProtectiveSafeGuards($scope.PolicyId, safeGuards).then(function (result) {
                    if (result.data.Result.Success) {
                        // A list of forms isn't returned with this API, so I comment it out for now.
                        //$scope.Policy.CurrentVersion.Forms = result.data.Forms;

                        $scope.ProtectiveSafeGuards = $scope.ProtectiveSafeGuards.concat(result.data.ProtectiveSafeGuards);

                        notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Protective Safeguard(s) where added.');

                        for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {

                            var location = $scope.Policy.CurrentVersion.Locations[i];
                            for (var j = 0; j < location.Properties.length; j++) {

                                var property = location.Properties[j];
                                for (var k = 0; k < result.data.ProtectiveSafeGuards.length; k++) {
                                    if (result.data.ProtectiveSafeGuards[k].LocationNumber == location.LocationNumber && result.data.ProtectiveSafeGuards[k].BuildingNumber == property.BuildingNumber) {
                                        property.ProtectiveSafeGuards.push(result.data.ProtectiveSafeGuards[k]);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    notificationsHub.showError('An unexpected error has occured. Please refresh the page.');
                });
            }
        });
    }

    $scope.updateProtectiveSafeGuard = function (protectiveSafeGuard) {
        var modalInstance = $modal.open({
            templateUrl: 'addProtectiveSafeGuard.html',
            controller: 'test_Commercial_Lines_addProtectiveSafeGuardCtrl',
            size: 'lg',
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
                protectiveSafeGuard: function () {
                    return $.extend({}, protectiveSafeGuard);
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.updateProtectiveSafeGuard($scope.PolicyId, data.ProtectiveSafeGuard).then(function (result) {
                    if (result.data.Result.Success) {
                        for (var d = 0; d < $scope.ProtectiveSafeGuards.length; d++) {
                            if ($scope.ProtectiveSafeGuards[d].Id == result.data.ProtectiveSafeGuard.Id) {
                                $scope.ProtectiveSafeGuards[d] = result.data.ProtectiveSafeGuard;

                                for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                                    var location = $scope.Policy.CurrentVersion.Locations[i];
                                    for (var j = 0; j < location.Properties.length; j++) {
                                        var property = location.Properties[j];
                                        for (var k = 0; k < property.ProtectiveSafeGuards.length; k++) {
                                            if (property.ProtectiveSafeGuards[k].Id == result.data.ProtectiveSafeGuard.Id) {
                                                property.ProtectiveSafeGuards[k] = result.data.ProtectiveSafeGuard;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Protective Safe Guard is updated.')
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

    $scope.deleteProtectiveSafeGuard = function (protectiveSafeGuard) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this protective safeguard from Loc. ' + protectiveSafeGuard.LocationNumber + ' Bldg.' + protectiveSafeGuard.BuildingNumber + '?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            },
            {
                label: 'Delete Protective Safe Guard',
                cssClass: 'yellow-casablanca',
                action: function (dialogItself) {
                    dialogItself.close();
                    policyService.deleteProtectiveSafeGuards($scope.PolicyId, [protectiveSafeGuard.Id]).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.ProtectiveSafeGuards.splice($scope.ProtectiveSafeGuards.indexOf(protectiveSafeGuard), 1);
                            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Protective Safeguard is deleted.');

                            for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                                var location = $scope.Policy.CurrentVersion.Locations[i];
                                for (var j = 0; j < location.Properties.length; j++) {
                                    var property = location.Properties[j];
                                    for (var k = 0; k < property.ProtectiveSafeGuards.length; k++) {
                                        if (property.ProtectiveSafeGuards[k].Id == protectiveSafeGuard.Id) {
                                            property.ProtectiveSafeGuards.splice(property.ProtectiveSafeGuards.indexOf(property.ProtectiveSafeGuards[k]), 1);
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
                        notificationsHub.showError('An unexpected error has occured. Please refresh the page.');
                    });
                }
            }]
        });
    }

    $scope.addEQB = function () {
        policyService.addEQBCoverage($scope.PolicyId).then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy = result.data.Policy;
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                // Set the current version to re-rate in order to refresh forms
                $scope.parent.Policy.CurrentVersion.RateProperty = true;
                $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;
                $scope.parent.Coverages.push('Equipment Breakdown');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.removeEQB = function () {
        policyService.deleteCoverage($scope.PolicyId, ['Equipment Breakdown']).then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy.CurrentVersion.Premiums = $scope.PremiumBreakdowns = result.data.PremiumBreakdowns;
                $scope.parent.Policy.CurrentVersion.EquipmentBreakdownCoverages = [];
                // need to re-rate again for the forms to refresh 
                $scope.parent.Policy.CurrentVersion.RateProperty = true;
                $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;
                $scope.parent.Coverages.splice($scope.parent.Coverages.indexOf('Equipment Breakdown'), 1);
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.addAdditionalInsured = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addAdditionalInsured.html',
            controller: 'test_Commercial_Lines_addAdditionalInsuredCtrl',
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
                            $scope.Policy.CurrentVersion.RateProperty = true;
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
                }
                else {
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

                            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Loss Payee is added.');
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
            templateUrl: 'addAdditionalInsured.html',
            controller: 'test_Commercial_Lines_addAdditionalInsuredCtrl',
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
                        $scope.Policy.CurrentVersion.RateProperty = true;
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
                            $scope.Policy.CurrentVersion.RateProperty = true;
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
            controller: 'test_Commercial_Lines_addAdditionalInsuredCtrl',
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

    $scope.deleteLossPayee = function (lossPayeee) {
        BootstrapDialog.show({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this loss payee: Loc. ' + lossPayeee.LocationNumber + ' Bldg.' + lossPayeee.BuildingNumber + ' ' + lossPayeee.Name + '?',
            buttons: [{
                label: 'Cancel',
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }, {
                label: 'Delete Loss Payee',
                cssClass: 'yellow-casablanca',
                action: function (dialogItself) {
                    policyService.deleteLossPayee($scope.PolicyId, lossPayeee.Id).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.Policy.CurrentVersion.RateProperty = true;
                            $scope.LossPayees.splice($scope.LossPayees.indexOf(lossPayeee), 1);
                            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Loss Payee is deleted.');
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

    $scope.addPropertyDeductible = function () {
        var modalInstance = $modal.open({
            templateUrl: 'addPropertyDeductible.html',
            controller: 'test_Commercial_Lines_addPropertyDeductibleCtrl',
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
                policyService.updatePropertyDeductibles($scope.parent.Policy.Id, data.propertyDeductibles).then(function (result) {
                    if (result.data.Result.Success) {
                        console.log('Success on the property deductible front');

                        $scope.PropertyDeductibles = result.data.PropertyDeductibles;

                        for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                            var location = $scope.Policy.CurrentVersion.Locations[i];
                            for (var j = 0; j < location.Properties.length; j++) {
                                var property = location.Properties[j];
                                property.Deductibles = result.data.PropertyDeductibles.filter(
                                    x => x.LocationNumber == location.LocationNumber && x.BuildingNumber == property.BuildingNumber);
                            }
                        }

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

                // If Named Storm, delete All Other Wind as well
                if (propertyDeductible.Name.indexOf('Named Storm') > -1) {
                    for (i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                        location = $scope.Policy.CurrentVersion.Locations[i];
                        for (j = 0; j < location.Properties.length; j++) {
                            property = location.Properties[j];
                            if (property.Id == propertyDeductible.PropertyId) {
                                var allOtherWind = $.grep(property.Deductibles, function (n) { return n.Name.indexOf('All Other Wind') > -1 });

                                if (allOtherWind.length > 0) {
                                    $scope.deletePropertyDeductibleConfirmed(allOtherWind[0], dialogItself);
                                    return;
                                }
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

    $scope.isDeductibleDisabled = function (propertyDeductible) {
        if (propertyDeductible == null) return false;

        var property = $scope.getPropertyFromDeductible(propertyDeductible);

        if (propertyDeductible.Name == 'Wind Deductible' || propertyDeductible.Name == 'Wind Deductible (Flat Dollar)') {
            // If Wind Deductible and there is a named storm
            var hasNamedStorm = $.grep(property.Deductibles, function (n) { return n.Name.indexOf('Named Storm') > -1 }).length > 0;
            if (hasNamedStorm) {
                return true;
            }
        } else if (propertyDeductible.Name == 'AOP Deductible' || propertyDeductible.Name == 'Higher Theft Deductible') {
            // If the property is wind only, then AOP will be disabled
            if (property.IsWindOnly) return true;
        }
        return false;
    }

    $scope.getPropertyFromDeductible = function (propertyDeductible) {
        for (var i = 0; i < $scope.Locations.length; i++) {
            var location = $scope.Locations[i];
            for (var j = 0; j < location.Properties.length; j++) {
                if (location.Properties[j].Id == propertyDeductible.PropertyId) {
                    return location.Properties[j];
                }
            }
        }
        return null;
    }

    $scope.updatePropertyDeductible = function (propertyDeductible) {
        var modalInstance = $modal.open({
            templateUrl: 'addPropertyDeductible.html',
            controller: 'test_Commercial_Lines_addPropertyDeductibleCtrl',
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
                    return true;
                },
                parent: function () {
                    return $scope.parent;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.updatePropertyDeductibles($scope.parent.Policy.Id, data.propertyDeductibles).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.parent.Policy.CurrentVersion.RateProperty = true;
                        for (var d = 0; d < $scope.PropertyDeductibles.length; d++) {
                            var deductible = result.data.PropertyDeductibles.find(function (e) { return e.Id == $scope.PropertyDeductibles[d].Id; });

                            if (deductible != null) {
                                $scope.PropertyDeductibles[d] = deductible;

                                for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                                    var location = $scope.Policy.CurrentVersion.Locations[i];

                                    for (var j = 0; j < location.Properties.length; j++) {
                                        var property = location.Properties[j];

                                        for (var k = 0; k < property.Deductibles.length; k++) {
                                            if (property.Deductibles[k].Id == deductible.Id) {
                                                property.Deductibles[k] = deductible;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        policyService.clearEligibility($scope.PolicyId).then(function (result) {
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });
                        notificationsHub.showSuccess('Quote ' + $scope.Policy.Number + ' Property Deductible is updated.');
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

    $scope.modify = function (location, property) {
        // Show Modify Property
        $('#listProperty').hide();

        property = $.extend(true, {}, property);

        var controllerElement = document.querySelector('[ng-controller=test_Commercial_Lines_modifyPropertyCtrl]');
        var controllerScope = angular.element(controllerElement).scope();
        controllerScope.PolicyId = $scope.PolicyId;
        controllerScope.Policy = $scope.parent.Policy;
        controllerScope.Property = property;
        controllerScope.OriginalProperty = $.extend(true, {}, property);
        controllerScope.OriginalPropertyDeductibles = $.extend(true, [], $scope.PropertyDeductibles);
        controllerScope.Location = location;
        controllerScope.ParentScope = $scope.parent;
        controllerScope.Characteristics = $scope.Characteristics;
        controllerScope.PropertyDeductibles = $scope.PropertyDeductibles;
        controllerScope.showExtensionEndorsement = false;
        controllerScope.Property.includeOrdinance = "Excluded";
        controllerScope.ProtectiveSafeGuards = $scope.ProtectiveSafeGuards;
        controllerScope.requiresRate = false;

        // Work out the logic for the Wind Type
        if (property.IsWindOnly) {
            $scope.PropertyWindCoverageType.Name = 'Wind Only';
        } else if (property.ExcludeWindHail && !property.IsWindOnly) {
            $scope.PropertyWindCoverageType.Name = 'Exclude Wind/Hail';
        } else {
            $scope.PropertyWindCoverageType.Name = 'With Wind/Hail';
        }

        // Since we added Roof Anchor recently, we need to update the field for the renewals
        if ($scope.parent.Policy.RenewalOf != null && $scope.parent.Policy.RenewalOf != '') {
            // If the roof anchor field is blank then we will update with a default value
            if (property.RoofAnchor == null || property.RoofAnchor == '') {
                property.RoofAnchor = 'No Anchorage';
            }
        }

        if (property.PropertyType == 'Building' && property.OccupancyType == 'Occupied') {
            if (property.Limits == null || property.Limits.length == 0) {
                property.Limits = [];
                property.Limits.push({
                    LimitName: "Building", Amount: 0, ValuationBasis: "RCV", CauseOfLoss: "Special Excluding Theft", CoInsurance: "80%", Wind: 1, Index: 1
                });
                property.Limits.push({
                    LimitName: "BPP & Content", Amount: 0, ValuationBasis: "RCV", CauseOfLoss: "Special Excluding Theft", CoInsurance: "80%", Wind: 1, Index: 2
                });
                property.Limits.push({
                    LimitName: "IMP/BETT", Amount: 0, ValuationBasis: "RCV", CauseOfLoss: "Special Excluding Theft", CoInsurance: "80%", Wind: 1, Index: 3
                });
                property.Limits.push({
                    LimitName: "Business Income", Amount: 0, Payout: "1/4", EE: 'w/EE', CauseOfLoss: "Special Excluding Theft", CoInsurance: "80%", Wind: 1, Index: 4
                });

                property.OrdinanceAndLawCoverageA = "Excluded";
                property.OrdinanceAndLawCoverageB = "Excluded";
                property.OrdinanceAndLawCoverageC = "Excluded";
                property.OrdinanceAndLawCoverageBAndC = "Excluded";
                property.ElectronicDataProcessing = "Excluded";
                property.SpoilageCoverageLimit = "Excluded";
                property.SpoilageCoverageDeductible = "250";
                property.SpoilageRefrigeration = "Excluded";
                property.SpoilageBreakdown = "Excluded";
                property.SpoilagePowerOutage = "Excluded";
                property.SpoilageSellingPrice = "Excluded";
                property.ExtensionEndorsementLimit = null;
                property.ExtensionEndorsementDeductible = "250";
            }
        }
        else if (property.PropertyType == 'Building' && property.OccupancyType == 'Vacant') {
            if (property.Limits == null || property.Limits.length == 0) {
                property.Limits = [];
                property.Limits.push({
                    LimitName: "Building", Amount: 0, ValuationBasis: "ACV", CauseOfLoss: "Basic", CoInsurance: "80%", Wind: 1, Index: 1
                });
                property.Limits.push({
                    LimitName: "BPP & Content", Amount: 0, ValuationBasis: "ACV", CauseOfLoss: "Basic", CoInsurance: "80%", Wind: 1, Index: 2
                });
                property.Limits.push({
                    LimitName: "IMP/BETT", Amount: 0, ValuationBasis: "ACV", CauseOfLoss: "Basic", CoInsurance: "80%", Wind: 1, Index: 3
                });
                property.Limits.push({
                    LimitName: "Business Income", Amount: 0, Payout: "1/4", EE: 'w/EE', CauseOfLoss: "Basic", CoInsurance: "80%", Wind: 1, Index: 4
                });

                property.OrdinanceAndLawCoverageA = "Excluded";
                property.OrdinanceAndLawCoverageB = "Excluded";
                property.OrdinanceAndLawCoverageC = "Excluded";
                property.OrdinanceAndLawCoverageBAndC = "Excluded";
                property.ElectronicDataProcessing = "Excluded";
                property.SpoilageCoverageLimit = "Excluded";
                property.SpoilageCoverageDeductible = "250";
                property.SpoilageRefrigeration = "Excluded";
                property.SpoilageBreakdown = "Excluded";
                property.SpoilagePowerOutage = "Excluded";
                property.SpoilageSellingPrice = "Excluded";
                property.ExtensionEndorsementLimit = null;
                property.ExtensionEndorsementDeductible = "250";
                property.Occupancy = "Vacant";
                property.Vandalism = "Excluded";
                property.SprinklerLeakage = "Excluded";
            }
        }
        else if (property.PropertyType == 'Building' && property.OccupancyType == 'Builder\'s Risk') {
            if (property.Limits == null || property.Limits.length == 0) {
                property.Limits = [];
                property.Limits.push({
                    LimitName: 'Existing Structure', Amount: 0, ValuationBasis: "ACV", CauseOfLoss: "Basic", CoInsurance: "80%", Wind: 1, Index: 1
                });
                property.Limits.push({
                    LimitName: 'New Work Limit', Amount: 0, ValuationBasis: "ACV", CauseOfLoss: "Basic", CoInsurance: "80%", Wind: 1, Index: 2
                });

                property.OrdinanceAndLawCoverageA = "Excluded";
                property.OrdinanceAndLawCoverageB = "Excluded";
                property.OrdinanceAndLawCoverageC = "Excluded";
                property.OrdinanceAndLawCoverageBAndC = "Excluded";
                property.ElectronicDataProcessing = "Excluded";
                property.SpoilageCoverageLimit = "Excluded";
                property.SpoilageCoverageDeductible = "0";
                property.SpoilageRefrigeration = "Excluded";
                property.SpoilageBreakdown = "Excluded";
                property.SpoilagePowerOutage = "Excluded";
                property.SpoilageSellingPrice = "Excluded";
                property.ExtensionEndorsementLimit = null;
                property.ExtensionEndorsementDeductible = "0";
                property.Occupancy = "Builder's Risk";
                property.Vandalism = "Excluded";
                property.SprinklerLeakage = "Excluded";
            }
        }
        else {
            if (property.Limits == null || property.Limits.length == 0) {
                property.Limits = [];
                property.Limits.push({
                    LimitName: property.PropertyType, Amount: 0, ValuationBasis: "RCV", CauseOfLoss: "Special Excluding Theft", CoInsurance: "80%", Wind: 1, Index: 1
                });
            }
        }

        if (property.OrdinanceAndLawCoverageA == null) property.OrdinanceAndLawCoverageA = 'Excluded';
        if (property.OrdinanceAndLawCoverageB == null) property.OrdinanceAndLawCoverageB = 'Excluded';
        if (property.OrdinanceAndLawCoverageC == null) property.OrdinanceAndLawCoverageC = 'Excluded';
        if (property.OrdinanceAndLawCoverageBAndC == null) property.OrdinanceAndLawCoverageBAndC = 'Excluded';
        if (property.SpoilageCoverageLimit == null) property.SpoilageCoverageLimit = 'Excluded';
        if (property.SpoilageRefrigeration == null) property.SpoilageRefrigeration = 'Excluded';
        if (property.SpoilageBreakdown == null) property.SpoilageBreakdown = 'Excluded';
        if (property.SpoilagePowerOutage == null) property.SpoilagePowerOutage = 'Excluded';
        if (property.SpoilageSellingPrice == null) property.SpoilageSellingPrice = 'Excluded';
        //if (property.ExtensionEndorsementLimit != null) property.ExtensionEndorsementLimit = 'Excluded';

        for (var k = 0; k < property.Limits.length; k++) {
            property.Limits[k].Amount = property.Limits[k].Amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // bit of code to make these limits look good to the client
        if (property.OrdinanceAndLawCoverageA != "Excluded") {
            property.OrdinanceAndLawCoverageA = property.OrdinanceAndLawCoverageA.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            controllerScope.showLawAndOrdinance = true;
            controllerScope.Property.includeOrdinance = "Included";
        }

        if (property.OrdinanceAndLawCoverageB != "Excluded") {
            property.OrdinanceAndLawCoverageB = property.OrdinanceAndLawCoverageB.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            controllerScope.showLawAndOrdinance = true;
            controllerScope.Property.includeOrdinance = "Included";
        }

        if (property.OrdinanceAndLawCoverageC != "Excluded") {
            property.OrdinanceAndLawCoverageC = property.OrdinanceAndLawCoverageC.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            controllerScope.showLawAndOrdinance = true;
            controllerScope.Property.includeOrdinance = "Included";
        }

        if (property.OrdinanceAndLawCoverageBAndC != "Excluded") {
            property.OrdinanceAndLawCoverageBAndC = property.OrdinanceAndLawCoverageBAndC.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            controllerScope.showLawAndOrdinance = true;
            controllerScope.Property.includeOrdinance = "Included";
        }

        if (property.SpoilageCoverageLimit != "Excluded") {
            property.SpoilageCoverageLimit = property.SpoilageCoverageLimit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        if (property.ExtensionEndorsementLimit != "Excluded" && property.ExtensionEndorsementLimit != null) {
            controllerScope.showExtensionEndorsement = true;
            controllerScope.updateExtensionEndorsementOptions();
        }

        controllerScope.CharacteristicsState = {};
        controllerScope.CharacteristicsState.State = 'Coverage Form';
        if (property != null && property.Limits != null) {
            var hasWindOnlyCauseOfLoss = property.Limits.some(function (x) { return x.CauseOfLoss == "Windstorm or Hail Only"; });
            if (hasWindOnlyCauseOfLoss) {
                controllerScope.CharacteristicsState.State = 'Coverage Form - Wind Only';
            }
        }

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
                    dialogItself.close();
                    policyService.deleteProperty($scope.PolicyId, property.Id).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.parent.Policy = result.data.Policy;
                            $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];

                            loadProperty();
                            loadPropertyDeductibles();

                            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Building ' + property.BuildingNumber + ' is deleted.');
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

    $scope.addEDP = function () {
        var modalInstance = $modal.open({
            templateUrl: 'test_Commercial_Lines_EDPCoverage.html',
            controller: 'test_Commercial_Lines_EDPCoverage',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.addEDPCoverage($scope.PolicyId, data.Limit).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.parent.Policy = result.data.Policy;
                        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                        $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;
                        $scope.parent.Coverages.push('Electronic Data Processing');
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

    $scope.updateEDP = function () {
        var modalInstance = $modal.open({
            templateUrl: 'test_Commercial_Lines_EDPCoverage.html',
            controller: 'test_Commercial_Lines_EDPCoverage',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.updateEDPCoverage($scope.parent.Policy.CurrentVersion.ElectronicDataProcessingCoverages[0].Id, data.Limit).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.parent.Policy.CurrentVersion.ElectronicDataProcessingCoverages[0].Limit = data.limit;
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

    $scope.removeEDP = function () {
        policyService.deleteCoverage($scope.PolicyId, ['Electronic Data Processing']).then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy.CurrentVersion.Premiums = $scope.PremiumBreakdowns = result.data.PremiumBreakdowns;
                $scope.parent.Policy.CurrentVersion.ElectronicDataProcessingCoverages = [];
                $scope.parent.Coverages.splice($scope.parent.Coverages.indexOf('Electronic Data Processing'), 1);
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.sinkholeOption = {};
    $scope.sinkholeOption.selected = "Excluded";
    $scope.GetCharacteristicValues = function (name) {
        return $scope.Characteristics[name];
    }

    $scope.toCurrency = function (num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    $rootScope.$broadcast('$pageloaded');

}]);

MALACHIAPP.controller('Field_Description', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'guideline', 'ngAuthSettings', 'localStorageService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, guideline, ngAuthSettings, localStorageService) {
    $scope.guideline = guideline;

    $scope.downloadFormDocument = function (formNumber, edition) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', window.documentServiceBase + 'api/document/DownloadForm', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "Form.pdf";
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }
                var type = xhr.getResponseHeader('Content-Type');

                var blob = new Blob([this.response], { type: type });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                    window.navigator.msSaveBlob(blob, filename);
                } else {
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);

                    if (filename) {
                        // use HTML5 a[download] attribute to specify filename
                        var a = document.createElement("a");
                        // safari doesn't support this yet
                        if (typeof a.download === 'undefined') {
                            window.location = downloadUrl;
                        } else {
                            a.href = downloadUrl;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                        }
                    } else {
                        window.location = downloadUrl;
                    }

                    setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                }
            }
        };

        xhr.setRequestHeader("Content-Type", "application/json");
        var authData = localStorageService.get('authorizationData');
        xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
        xhr.send(JSON.stringify({ FormNumber: formNumber, Edition: edition }));
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

MALACHIAPP.controller('test_Commercial_Lines_EDPCoverage', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId) {
    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

MALACHIAPP.controller('test_Commercial_Lines_addPropertyDeductibleCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'propertyDeductible', 'isUpdate', 'parent', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, propertyDeductible, isUpdate, parent) {
    $scope.PolicyId = policyId;
    $scope.Locations = locations;
    $scope.Policy = policy;
    $scope.propertyDeductible = {};
    $scope.originalPropertyDeductible = null;
    $scope.lockedDown = false;
    $scope.isUpdate = isUpdate;
    $scope.changeInBuildingMessage = [];
    $scope.deductibleProperties = [];
    $scope.Properties = [];
    $scope.PropertiesWithSameDeductible = [];
    $scope.parent = parent;

    $scope.deductibleCharacteristics = {
        'Property Deductibles': [
            "Higher Theft Deductible",
            "Water Deductible",
            "Wind Deductible (Flat Dollar)",
            "Named Storm Deductible",
            //"Named Storm Deductible (Flat Dollar)",
            "All Other Wind Deductible",
            "All Other Wind Deductible (Flat Dollar)"
        ],
        'AOP Deductible': [
            "$1,000",
            "$2,500",
            "$5,000",
            "$10,000",
            "$25,000",
            "$50,000",
            "$100,000"
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
        ]
    };

    $scope.WindDeductibles = [
        "Wind Deductible",
        "Wind Deductible (Flat Dollar)",
        "Named Storm Deductible",
        "Named Storm Deductible (Flat Dollar)",
        "All Other Wind Deductible",
        "All Other Wind Deductible (Flat Dollar)"
    ];

    $scope.isSelectionListDeductible = function (propertyDeductible) {
        var deductibleOptions = $scope.deductibleCharacteristics[propertyDeductible.Name];
        if (deductibleOptions == undefined) return false;

        return $scope.deductibleCharacteristics[propertyDeductible.Name] != null;
    }

    if (propertyDeductible != null) {
        $scope.propertyDeductible = propertyDeductible;
        $scope.originalPropertyDeductible = Object.assign({}, propertyDeductible);
        removeCurrencyFormat($scope.propertyDeductible);
        $scope.lockedDown = true;
    }

    for (var i = 0; i < locations.length; i++) {
        var location = locations[i];
        for (var j = 0; j < location.Properties.length; j++) {
            var property = location.Properties[j];
            $scope.Properties.push(property);
            if (isUpdate) {
                var locationNumber = location.LocationNumber;
                var buildingNumber = property.BuildingNumber;
                var deductible = property.Deductibles.find(x => x.Name == $scope.originalPropertyDeductible.Name);
                if (deductible == null) continue;

                var isSelected = property.Id == $scope.originalPropertyDeductible.PropertyId;
                var isXWind = $scope.WindDeductibles.includes($scope.originalPropertyDeductible.Name) && property.ExcludeWindHail;

                var selectedProperty = {
                    PropertyId: property.Id,
                    LocationNumber: locationNumber,
                    BuildingNumber: buildingNumber,
                    ShortAddress: location.Address.ShortAddress,
                    DeductibleId: deductible.Id,
                    DeductibleName: deductible.Name,
                    Amount: deductible.Amount,
                    SubjectToMinimumOf: deductible.SubjectToMinimumOf,
                    WindRequired: deductible.WindRequired,
                    Selected: isSelected,
                    Disabled: isSelected || isXWind
                };

                $scope.PropertiesWithSameDeductible.push(selectedProperty);
            }
        }
    }

    function removeCurrencyFormat(deductible) {
        if (!$scope.isSelectionListDeductible(deductible)) {
            deductible.Amount = deductible.Amount.replace(/\$/g, "");
        }

        if (deductible.SubjectToMinimumOf != null) {
            deductible.SubjectToMinimumOf = deductible.SubjectToMinimumOf.replace(/\$/g, "");
        }
    }

    function fixDeductibleFormatting() {
        var deductible = $scope.propertyDeductible;

        if (!$scope.isSelectionListDeductible(deductible)) {
            if (!deductible.Amount.startsWith("$")) {
                deductible.Amount = $scope.toCurrency(deductible.Amount);
            }
        }

        if (deductible.SubjectToMinimumOf != null && !deductible.SubjectToMinimumOf.startsWith("$")) {
            deductible.SubjectToMinimumOf = $scope.toCurrency(deductible.SubjectToMinimumOf);
        }
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.deselectAllProperties = function () {
        for (var k = 0; k < $scope.PropertiesWithSameDeductible.length; k++) {
            var property = $scope.PropertiesWithSameDeductible[k];
            if (!property.Disabled) { property.Selected = false; }
        }
    }

    $scope.selectAllProperties = function () {
        for (var k = 0; k < $scope.PropertiesWithSameDeductible.length; k++) {
            var property = $scope.PropertiesWithSameDeductible[k];
            if (!property.Disabled) { property.Selected = true; }
        }
    }

    $scope.selectSimilarProperties = function () {
        var propertyDeductible = $scope.originalPropertyDeductible;
        for (var k = 0; k < $scope.PropertiesWithSameDeductible.length; k++) {
            var property = $scope.PropertiesWithSameDeductible[k];
            if (!property.Disabled) {
                var propertySubjectTo = property.SubjectToMinimumOf == null ? "" : property.SubjectToMinimumOf;
                var origPropertySubjectTo = propertyDeductible.SubjectToMinimumOf == null ? "" : propertyDeductible.SubjectToMinimumOf;
                property.Selected = property.Amount === propertyDeductible.Amount && propertySubjectTo === origPropertySubjectTo;
            }
        }
    }

    $scope.checkDeductibleSelected = function () {
        $scope.propertyDeductible.Amount = '';
        $scope.deselectXWindProperties();
    }

    $scope.isAmountPercentage = function () {
        return $scope.propertyDeductible.Amount != null ? $scope.propertyDeductible.Amount.endsWith("%") : false;
    }

    $scope.formatNonApplicableEntry = function (amount) {
        return amount === "Non Applicable" ? "N/A" : amount;
    }

    $scope.GetScheduleCharacteristicValues = function (name) {
        return $scope.deductibleCharacteristics[name];
    }

    $scope.add = function () {
        $scope.validateInputs();
        if ($scope.ErrorList.length > 0) return;

        $scope.PropertyDeductibles = [];
        fixDeductibleFormatting();

        if ($scope.propertyDeductible.Amount === "Non Applicable") {
            $scope.propertyDeductible.SubjectToMinimumOf = "N/A";
        }

        if (!$scope.isUpdate) {
            for (var i = 0; i < $scope.deductibleProperties.length; i++) {

                var copiedDeductible = $.extend(true, {}, $scope.propertyDeductible);
                copiedDeductible.PropertyId = $scope.deductibleProperties[i];

                $scope.Property = $.grep($scope.Properties, function (n) { return n.Id == copiedDeductible.PropertyId })[0];

                if ($scope.propertyDeductible.Name.indexOf('All Other Wind') > -1) { // All Other Wind can only be added if there is a Named Storm
                    var hasNamedStorm = $.grep($scope.Property.Deductibles, function (n) { return n.Name.indexOf('Named Storm') > -1 }).length > 0;
                    if (!hasNamedStorm) {
                        $scope.ErrorList.push('All Other Wind Deductible requires a Named Storm Deductible on the property.');
                        return;
                    }
                }

                if ($scope.propertyDeductible.Name.indexOf('Named Storm') > -1 || $scope.propertyDeductible.Name.indexOf('Wind Deductible (Flat Dollar)') > -1) {
                    // Named Storm will modify wind deductible to Non Applicable
                    // Wind Deductible Flat Dollar will modify wind deductible to Non Applicable
                    var windDeductible = $.grep($scope.Property.Deductibles, function (n) { return n.Name == 'Wind Deductible' })[0];
                    windDeductible.Amount = "Non Applicable";
                    $scope.PropertyDeductibles.push(windDeductible);
                }


                if ($scope.propertyDeductible.Name == 'Named Storm Deductible (Flat Dollar)') {
                    // Named Storm will modify wind deductible to Non Applicable
                    // Wind Deductible Flat Dollar will modify wind deductible to Non Applicable
                    var hasNamedStorm = $.grep($scope.Property.Deductibles, function (n) { return n.Name == 'Named Storm Deductible' }).length > 0;
                    if (hasNamedStorm) {
                        $scope.ErrorList.push('Named Storm Deductible is already on for this structure.');
                        return;
                    }
                }

                if ($scope.propertyDeductible.Name == 'Named Storm Deductible') {
                    // Named Storm will modify wind deductible to Non Applicable
                    // Wind Deductible Flat Dollar will modify wind deductible to Non Applicable
                    var hasNamedStorm = $.grep($scope.Property.Deductibles, function (n) { return n.Name == 'Named Storm Deductible (Flat Dollar)' }).length > 0;
                    if (hasNamedStorm) {
                        $scope.ErrorList.push('Named Storm Deductible is already on for this structure.');
                        return;
                    }
                }

                $scope.PropertyDeductibles.push(copiedDeductible);
            }
        }
        else {
            $scope.PropertyDeductibles.push($.extend(true, {}, $scope.propertyDeductible));

            var selectedProperties = $.grep($scope.PropertiesWithSameDeductible, function (e) { return !e.Disabled && e.Selected; });

            for (var k = 0; k < selectedProperties.length; k++) {
                var selectedProperty = selectedProperties[k];

                var newPropertyDeductible = {
                    Id: selectedProperty.DeductibleId,
                    PropertyId: selectedProperty.PropertyId,
                    LocationNumber: selectedProperty.LocationNumber,
                    BuildingNumber: selectedProperty.BuildingNumber,
                    Name: selectedProperty.DeductibleName,
                    Amount: propertyDeductible.Amount,
                    SubjectToMinimumOf: propertyDeductible.SubjectToMinimumOf,
                    WindRequired: selectedProperty.WindRequired,
                    Note: null
                };

                $scope.PropertyDeductibles.push(newPropertyDeductible);
            }
        }

        $modalInstance.close({ propertyDeductibles: $scope.PropertyDeductibles });
    }

    $scope.toCurrency = function (num) {
        return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    $scope.validateInputs = function () {
        $scope.ErrorList = [];

        if (checkInputs($scope.propertyDeductible.Name)) {
            $scope.ErrorList.push('Please select an item from the property deductible list.');
        }

        if (checkInputs($scope.propertyDeductible.Amount)) {
            $scope.ErrorList.push('Please enter a value for the deductible.');
        }

        var amount = parseInt($scope.propertyDeductible.Amount);
        if (isNaN(amount) && $scope.propertyDeductible.Amount != 'Non Applicable' && $scope.propertyDeductible.Name != 'AOP Deductible') {
            $scope.ErrorList.push('Deductible amount must be a number.');
        }
        else {
            if (amount < 1) {
                $scope.ErrorList.push('Deducitble amount must be greater than 0.');
            }
        }

        if ($scope.isUpdate) return;

        if (!$scope.deductibleProperties || $scope.deductibleProperties.length == 0) {
            $scope.ErrorList.push('Please select a location.');
        } else {
            var locations = $scope.Policy.CurrentVersion.Locations;

            for (var i = 0; i < locations.length; i++) {
                var properties = locations[i].Properties;

                for (var j = 0; j < properties.length; j++) {

                    //if theft deductible is selected and the property is Wind Only add the validation error
                    if ($scope.deductibleProperties.includes(properties[j].Id) && $scope.propertyDeductible.Name && $scope.propertyDeductible.Name.toLowerCase().includes("theft")) {

                        var propertySelected = properties[j];

                        if (propertySelected.IsWindOnly) {
                            $scope.ErrorList.push('Unable to add Theft Deductible in a Wind Only Property.');
                        }

                    }

                    var deductible = $.grep(properties[j].Deductibles, function (l) {
                        return l.Name == $scope.propertyDeductible.Name && $scope.deductibleProperties.includes(properties[j].Id);
                    });

                    if (deductible.length != 0)
                        $scope.ErrorList.push('Deductible already exists for location ' + locations[i].LocationNumber + ' - ' + properties[j].BuildingNumber);
                }
            }
        }
    }

    $scope.isWindDeductibleSelected = function () {
        return $scope.WindDeductibles.includes($scope.propertyDeductible.Name);
    }

    $scope.deselectXWindProperties = function () {
        // Skip if the deductible is being edited.
        if ($scope.isUpdate) return;
        // Don't do anything if a wind deductible option isn't selected.
        if (!$scope.isWindDeductibleSelected()) return;

        // Search for X-wind properties and uncheck them.
        var propertiesToRemove = [];

        for (var i = 0; i < $scope.deductibleProperties.length; i++) {
            var property = $scope.Properties.find(x => x.Id == $scope.deductibleProperties[i]);
            if (property != null && property.ExcludeWindHail) {
                propertiesToRemove.push(i);
            }
        }

        for (let index in propertiesToRemove) {
            $scope.deductibleProperties.splice(index, 1);
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
}]);

MALACHIAPP.controller('test_Commercial_Lines_addProtectiveSafeGuardCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'protectiveSafeGuard', 'parent', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, protectiveSafeGuard, parent) {
    $scope.PolicyId = policyId;
    $scope.Locations = locations;
    $scope.Policy = policy;
    $scope.parent = parent;
    $scope.ProtectiveSafeGuard = {};
    $scope.ProtectiveSafeGuard.Safeguards = [];
    $scope.ProtectiveSafeGuard.Properties = [];
    if (protectiveSafeGuard != null) {
        $scope.ProtectiveSafeGuard = protectiveSafeGuard;
        $scope.ProtectiveSafeGuard.Properties = [];
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {
        $scope.validateInputs();
        if ($scope.Errors.length != 0) return;

        if ($scope.CustomSafeGuard != null && $scope.CustomSafeGuard.length > 0) {

            if ($scope.CustomSafeGuard.slice(0, 3) != 'P-9')
                $scope.CustomSafeGuard = 'P-9 ' + $scope.CustomSafeGuard;

            $scope.ProtectiveSafeGuard.Safeguards.push($scope.CustomSafeGuard);
        }

        $modalInstance.close({
            ProtectiveSafeGuard: $scope.ProtectiveSafeGuard
        });
    }

    $scope.validateInputs = function () {
        $scope.Errors = [];

        var locations = $scope.Policy.CurrentVersion.Locations;
        for (var i = 0; i < locations.length; i++) {

            var properties = locations[i].Properties;
            for (var j = 0; j < properties.length; j++) {

                var protectiveSafeGuards = properties[j].ProtectiveSafeGuards;

                for (var k = 0; k < protectiveSafeGuards.length; k++) {

                    var pgs = $.grep($scope.ProtectiveSafeGuard.Safeguards, function (p) { return p == protectiveSafeGuards[k].ProtectiveSafeGuard; });
                    var prts = $.grep($scope.ProtectiveSafeGuard.Properties, function (p) { return p == protectiveSafeGuards[k].PropertyId; });

                    if (pgs.length != 0 && prts.length != 0)
                        $scope.Errors.push(protectiveSafeGuards[k].ProtectiveSafeGuard + " already exist for " + locations[i].LocationNumber + "-" + properties[j].BuildingNumber + ".");
                }
            }
        }

        if ($scope.ProtectiveSafeGuard.Properties.length == 0) {
            $scope.Errors.push("Select at least one property from the list.");
        }

        if ($scope.ProtectiveSafeGuard.Safeguards.length == 0 && ($scope.CustomSafeGuard == null || $scope.CustomSafeGuard.length == 0)) {
            $scope.Errors.push("Select at least one protective safeguard.");
        }
    }


    $scope.update = function () {
        $scope.Errors = [];

        if ($scope.ProtectiveSafeGuard.ProtectiveSafeGuard == "") {
            Errors.push("You must have some text to edit the protective safe guard");
        } else {
            $modalInstance.close({
                ProtectiveSafeGuard: $scope.ProtectiveSafeGuard
            });
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
}]);

MALACHIAPP.controller('test_Commercial_Lines_addAdditionalInsuredCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'additionalInsured', 'aiType', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, additionalInsured, aiType) {
    $scope.PolicyId = policyId;
    $scope.Locations = locations;
    $scope.Policy = policy;
    $scope.AI = {
        Address: {}
    };
    $scope.AI.Properties = [];
    $scope.AIType = aiType;
    if (additionalInsured != null) {
        $scope.AI = additionalInsured;
        $scope.AI.Properties = [];
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {
        $scope.validateInputs();
        if ($scope.ErrorList.length > 0) return;
        if ($scope.AI.Properties.length > 0 || $scope.AI.PropertyId != null) {
            $modalInstance.close({
                AI: $scope.AI, AIType: $scope.AIType
            });
        }
        else {
            $scope.Errors = ['You must pick at least one location.'];
        }
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


        var locationSelected = false;
        if ($scope.AI.Properties.length > 0 && $scope.AI.Properties != undefined) {
            for (var i = 0; i < $scope.AI.Properties.length; i++) {
                if ($scope.AI.Properties[i].length > 0) {
                    locationSelected = true;
                }
            }
        }

        if ($scope.AI.PropertyId != null) {
            locationSelected = true;
        }

        if (locationSelected == false) {
            $scope.ErrorList.push('Please select a location.');
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
                    $scope.AI.Address.City = result.data.State.City;
                    $scope.AI.Address.StateObject = result.data.State;
                    $scope.AI.Address.State = result.data.State.Name;
                    $scope.AI.Address.StateCode = result.data.State.Code;
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

MALACHIAPP.controller('test_Commercial_Lines_addPropertyCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'parent', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, parent) {
    $scope.PolicyId = policyId;
    $scope.Locations = locations;
    $scope.Policy = policy;
    $scope.parent = parent;
    if ($scope.Locations.length == 1) $scope.Location = $scope.Locations[0];
    $scope.Property = {
        PropertyType: 'Building',
        OccupancyType: 'Occupied'
    };

    $scope.additionalStructures = [
        'Awning',
        'Bridge',
        'Building',
        'Canopy',
        'Deck',
        'Docks/Slips',
        'Fence/Wall',
        'Glass',
        'Lightpost',
        'Other Structures',
        'Pool',
        'Pumps',
        'Satellites',
        'Shed',
        'Sign',
        'Sign (Entirely Metal)'
    ];

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {
        $scope.Property.LocationId = $scope.Location.Id;

        $modalInstance.close({
            location: $scope.Location, property: $scope.Property
        });
    }
}]);

MALACHIAPP.controller('test_Commercial_Lines_copyPropertyCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'locations', 'currentLocation', 'property', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, locations, currentLocation, property) {
    $scope.PolicyId = policyId;
    $scope.Locations = locations;
    $scope.Policy = policy;
    $scope.Location = currentLocation;
    $scope.Property = property;

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.add = function () {
        $scope.Property.LocationId = $scope.Location.Id;

        $modalInstance.close({
            location: $scope.Location, property: $scope.Property
        });
    }
}]);

MALACHIAPP.controller('test_Commercial_Lines_modifyPropertyCtrl', ['$scope', 'policyService', 'notificationsHub', 'ngAuthSettings', 'localStorageService', '$modal', function ($scope, policyService, notificationsHub, ngAuthSettings, localStorageService, $modal) {

    $scope.disableSaveButton = false;

    window.onbeforeunload = function () {
        $scope.save();
    };

    $scope.requireRerate = function () {
        $scope.requiresRate = true;

        // Check to see if the construction type should change the roof anchor
        if ($scope.Property.Construction == "Masonry Non-Combustible" || $scope.Property.Construction == "Modified Fire Resistive" || $scope.Property.Construction == "Fire Resistive") {
            $scope.Property.RoofAnchor = "Structural";
        }
    }

    $scope.valuationBasisChanged = function (limit) {
        if (limit != null && limit.LimitName == "Building") {
            if (limit.ValuationBasis == "Agreed Value") {
                limit.CoInsurance = "N/A";
            } else {
                if (limit.CoInsurance == "N/A") {
                    limit.CoInsurance = "80%"
                }
            }
        }
    }

    $scope.windOnly = function () {
        var windType = $scope.PropertyWindCoverageType.Name;
        return windType == "Wind Only";
    }

    $scope.toggleExtensionEndorsement = function () {
        $scope.showExtensionEndorsement = !$scope.showExtensionEndorsement;
        $scope.requireRerate();
        $scope.updateExtensionEndorsementOptions();
    }

    $scope.canShowLimit = function (limit) {
        var property = $scope.Property;

        if (property.Occupancy == "Builder's Risk") {
            if (property.BuildersRiskType == "Ground Up Construction") {
                if (limit.LimitName == "Existing Structure") {
                    var amount = typeof (limit.Amount) === "string" ? parseInt(limit.Amount.replace(/,/g, '')) : limit.Amount;
                    if (amount > 0) limit.Amount = "0";
                    return true;
                }
            }
        }

        return false;
    }

    $scope.includeOrdinanceAndLaw = function (which) {
        // defaulting to 12% instead of 25% to make it available to more companies
        var buildingLimit = $scope.Property.Limits.find(x => x.LimitName == "Building");
        var building = buildingLimit != null ? parseInt(buildingLimit.Amount.replace(/,/g, '')) : 0;

        if ($scope.Property.Occupancy == "Builder's Risk") {
            building = 0;

            for (var i = 0; i < $scope.Property.Limits.length; i++) {
                var limit = $scope.Property.Limits[i];
                if (!limit || !limit.Amount) continue;
                building += parseInt(limit.Amount.replace(',', ''));
            }
        }

        $scope.maxOrdinance = Math.floor(parseInt(building * .12));

        switch (which) {
            case "A":
                if ($scope.Property.OrdinanceAndLawCoverageA == "Excluded") {
                    $scope.Property.OrdinanceAndLawCoverageA = building.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else {
                    $scope.Property.OrdinanceAndLawCoverageA = "Excluded";
                }

                break;
            case "B":
                if ($scope.Property.OrdinanceAndLawCoverageB == "Excluded") {
                    $scope.Property.OrdinanceAndLawCoverageB = $scope.maxOrdinance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else {
                    $scope.Property.OrdinanceAndLawCoverageB = "Excluded";
                }
                break;
            case "C":
                if ($scope.Property.OrdinanceAndLawCoverageC == "Excluded") {
                    $scope.Property.OrdinanceAndLawCoverageC = $scope.maxOrdinance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else {
                    $scope.Property.OrdinanceAndLawCoverageC = "Excluded";
                }
                break;
            case "B&C":
                if ($scope.Property.OrdinanceAndLawCoverageBAndC == "Excluded") {
                    var ordinanceAmount = Math.round(building * .25);
                    $scope.Property.OrdinanceAndLawCoverageBAndC = ordinanceAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else {
                    $scope.Property.OrdinanceAndLawCoverageBAndC = "Excluded";
                }
                break;
            default:
        }

        $scope.requireRerate();
    }

    $scope.canCheckOrdinanceAndLawCoverageBOrC = function () {
        // Ensure Ordinance and Law is included.
        var property = $scope.Property;

        if (property == null || property.includeOrdinance == null || property.includeOrdinance == "Excluded")
            return false;

        // Check if Coverage B&C is unchecked.
        return property.OrdinanceAndLawCoverageBAndC == "Excluded";
    }

    $scope.canCheckOrdinanceAndLawCoverageBAndC = function () {
        // Ensure Ordinance and Law is included.
        var property = $scope.Property;

        if (property == null || property.includeOrdinance == null || property.includeOrdinance == "Excluded")
            return false;

        // Check if either Coverage B and C are unchecked.
        return property.OrdinanceAndLawCoverageB == "Excluded"
            && property.OrdinanceAndLawCoverageC == "Excluded";
    }

    $scope.isDeductibleDisabled = function (propertyDeductible) {
        if (propertyDeductible == null) return false;
        if (propertyDeductible.Name == 'Wind Deductible' || propertyDeductible.Name == 'Wind Deductible (Flat Dollar)') {
            // If Wind Deductible and there is a named storm
            for (var i = 0; i < $scope.Locations.length; i++) {
                var location = $scope.Locations[i];
                for (var j = 0; j < location.Properties.length; j++) {
                    if (location.Properties[j].Id == propertyDeductible.PropertyId) {
                        var property = location.Properties[j];
                        if (propertyDeductible == null) return false;
                        var hasNamedStorm = $.grep(property.Deductibles, function (n) { return n.Name.indexOf('Named Storm') > -1 }).length > 0;
                        if (hasNamedStorm) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    $scope.updateOrdinanceAndLawCoverageA = function () {
        var buildingLimit = $scope.Property.Limits.find(x => x.LimitName == "Building");
        var building = buildingLimit != null ? parseInt(buildingLimit.Amount.replace(/,/g, '')) : 0;

        if ($scope.Property.Occupancy == "Builder's Risk") {
            building = 0;

            for (var i = 0; i < $scope.Property.Limits.length; i++) {
                var limit = $scope.Property.Limits[i];
                if (!limit || !limit.Amount) continue;
                building += parseInt(limit.Amount.replace(',', ''));
            }
        }

        $scope.maxOrdinance = Math.floor(building * .12);

        if ($scope.Property.OrdinanceAndLawCoverageA != "Excluded") {
            $scope.Property.OrdinanceAndLawCoverageA = building.toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // set up the max for coverage B if it is included
        if ($scope.Property.OrdinanceAndLawCoverageB != "Excluded") {
            $scope.Property.OrdinanceAndLawCoverageB = $scope.maxOrdinance.toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // set up the max for coverage C if it is included
        if ($scope.Property.OrdinanceAndLawCoverageC != "Excluded") {
            $scope.Property.OrdinanceAndLawCoverageC = $scope.maxOrdinance.toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // set up the max for coverage B&C if it is included
        if ($scope.Property.OrdinanceAndLawCoverageBAndC != "Excluded") {
            var ordinanceAmount = Math.round(building * .25);
            $scope.Property.OrdinanceAndLawCoverageBAndC = ordinanceAmount.toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }

    $scope.includeExtensionEndorsement = function () {
        var maxEndorsementLimit = 10000;
        var minEndorsementDeductible = 250;

        if ($scope.Property.ExtensionEndorsementLimit == "Excluded") {
            $scope.Property.ExtensionEndorsementLimit = maxEndorsementLimit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            $scope.Property.ExtensionEndorsementLimit = "Excluded";
        }
    }

    $scope.toggleLawAndOrdinance = function () {
        if ($scope.Property.includeOrdinance == "Included") {
            $scope.Property.includeOrdinance = "Excluded";
            $scope.Property.OrdinanceAndLawCoverageA = "Excluded";
            $scope.Property.OrdinanceAndLawCoverageB = "Excluded";
            $scope.Property.OrdinanceAndLawCoverageC = "Excluded";
            $scope.Property.OrdinanceAndLawCoverageBAndC = "Excluded";
        } else {
            $scope.Property.includeOrdinance = "Included";
            $scope.Property.OrdinanceAndLawCoverageA = "Excluded";
            $scope.Property.OrdinanceAndLawCoverageB = "Excluded";
            $scope.Property.OrdinanceAndLawCoverageC = "Excluded";
            $scope.Property.OrdinanceAndLawCoverageBAndC = "Excluded";
        }
        $scope.requireRerate();
    }

    $scope.includeSpoilage = function () {
        var defaultSpoilageLimit = 10000;
        var minSpoilageDeductible = 250;

        if ($scope.Property.SpoilageCoverageLimit == "Excluded") {
            $scope.Property.SpoilageCoverageLimit = defaultSpoilageLimit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            $scope.Property.SpoilageCoverageLimit = "Excluded";
            $scope.Property.SpoilageRefrigeration = "Excluded";
            $scope.Property.SpoilageBreakdown = "Excluded";
            $scope.Property.SpoilagePowerOutage = "Excluded";
            $scope.Property.SpoilageSellingPrice = "Excluded";
            $scope.Property.SpoilagePropertyDescription = '';
            $scope.Property.SpoilageCoverageDeductible = '250';
        }

        $scope.requireRerate();
    }

    $scope.includeSpoilageCoverages = function (coverage) {
        switch (coverage) {
            case "Refrigeration":
                if ($scope.Property.SpoilageRefrigeration != "Excluded") {
                    $scope.Property.SpoilageRefrigeration = "Excluded";
                } else {
                    $scope.Property.SpoilageRefrigeration = "Included";
                }
                break;
            case "Breakdown":
                if ($scope.Property.SpoilageBreakdown != "Excluded") {
                    $scope.Property.SpoilageBreakdown = "Excluded";
                } else {
                    $scope.Property.SpoilageBreakdown = "Included";
                }
                break;
            case "Power Outage":
                if ($scope.Property.SpoilagePowerOutage != "Excluded") {
                    $scope.Property.SpoilagePowerOutage = "Excluded";
                } else {
                    $scope.Property.SpoilagePowerOutage = "Included";
                }
                break;
            case "Selling Price":
                if ($scope.Property.SpoilageSellingPrice != "Excluded") {
                    $scope.Property.SpoilageSellingPrice = "Excluded";
                } else {
                    $scope.Property.SpoilageSellingPrice = "Included";
                }
                break;
            default:
        }

        $scope.requireRerate();
    }

    $scope.resetOpeningProtection = function () {
        if ($scope.Property.ExcludeWindHail) {
            $scope.Property.OpeningProtection = $scope.Characteristics["Opening Protection"][0];
        }
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

    $scope.checkNumberOfStories = function () {
        var property = $scope.Property;
        if (property == undefined) return true;

        var numberOfStories = parseInt(property.NumberOfStories);
        return numberOfStories < 1;
    }

    $scope.searchByBeginsWith = function (actual, expected) {
        var lowerSearchString = (actual + '').toLowerCase();
        return lowerSearchString.indexOf(expected.toLowerCase()) === 0;
    }

    $scope.close = function () {
        $('#modifyProperty').hide();
        $('#listProperty').show();
        $scope.disableSaveButton = false;
        window.onbeforeunload = null;
        $scope.ParentScope.policyMenuVisible = true;

        var deductibles = $.extend([], $scope.PropertyDeductibles);
        $scope.PropertyDeductibles.splice(0, $scope.PropertyDeductibles.length);
        for (var i = 0; i < deductibles.length; i++) {
            if (deductibles[i].PropertyId != null) {
                $scope.PropertyDeductibles.push(deductibles[i]);
            }
        }
    }

    $scope.save = function () {
        $scope.Errors = [];
        $scope.disableSaveButton = true;
        $scope.validateInputs();
        $scope.resetOpeningProtection();

        if ($scope.ErrorList.length > 0) {
            $scope.disableSaveButton = false;
            return;
        }

        // This checks if a sub occupancy exists, and if it does we set the property "SubOccupancy" field
        if ($scope.Property.RiskCompanyData != null && $scope.Property.RiskCompanyData[0] != null && $scope.Property.RiskCompanyData[0].OccupancyCode != null) {
            // Get the list of sub occupancies
            var subOccupancyList = $scope.GetListOfCompanyCharacteristicValues($scope.Property.Occupancy, 'be7a9234-5ba5-49e5-acc0-deec3ff2ead0');
            if (!subOccupancyList) subOccupancyList = [];
            subOccupancyList = subOccupancyList.concat($scope.GetListOfCompanyCharacteristicValues($scope.Property.Occupancy, '48b1a26b-713f-4344-8470-5bfb9e25017c'));
            // Set the SubOccupancy based off the occupancy code
            var occupancy = subOccupancyList.find(x => x.CompanyCharacteristicValue == $scope.Property.RiskCompanyData[0].OccupancyCode);
            if (occupancy != null) {
                $scope.Property.SubOccupancy = occupancy.Description;
            }
        }

        for (var k = 0; k < $scope.Property.Limits.length; k++) {
            $scope.Property.Limits[k].Amount = parseFloat($scope.Property.Limits[k].Amount.toString().replace(/,/g, ''));
        }

        // Check the wind coverage type and update the property accordingly
        $scope.checkPropertyWindCoverageType($scope.Property);
        $scope.deleteWindDeductibles($scope.addOrUpdateProperty)
    }

    $scope.addOrUpdateProperty = function () {
        if ($scope.Property.Id == null) {
            Metronic.blockUI({
                target: '.modal-dialog', animate: true, overlayColor: 'none'
            });
            policyService.newProperty($scope.PolicyId, $scope.Property.LocationId).then(function (result) {
                Metronic.unblockUI('.modal-dialog');
                if (result.data.Result.Success) {
                    if ($scope.Location.Properties == null) $scope.Location.Properties = [];
                    $scope.Property.Id = result.data.Property.Id;
                    $scope.Property.BuildingNumber = result.data.Property.BuildingNumber;

                    var theftSubLimitNull = true;
                    for (var j = 0; j < $scope.Property.Limits.length; j++) {
                        var limit = $scope.Property.Limits[j];

                        if (limit.CauseOfLoss === "Special" && limit.Amount > 0) {
                            theftSubLimitNull = false;
                        }
                    }

                    if (theftSubLimitNull === true) {
                        $scope.Property.TheftSublimit = null;
                    }

                    policyService.updateProperty($scope.PolicyId, $scope.Property).then(function (result) {
                        if (result.data.Result.Success) {
                            $scope.Property = result.data.Property;
                            $scope.Location.Properties.push($scope.Property);

                            for (var l = 0; l < $scope.Locations.length; l++) {
                                var loc = $scope.Locations[l];
                                loc.TIV = 0;
                                for (var i = 0; i < loc.Properties.length; i++) {
                                    loc.Properties[i].TIV = 0;
                                    for (var k = 0; k < loc.Properties[i].Limits.length; k++) {
                                        loc.Properties[i].TIV += loc.Properties[i].Limits[k].Amount;
                                    }
                                    loc.TIV += loc.Properties[i].TIV;
                                }
                            }

                            // Property Deductibles
                            var newDeductibles = [];
                            for (var d = 0; d < $scope.PropertyDeductibles.length; d++) {
                                if ($scope.PropertyDeductibles[d].PropertyId == null) {
                                    $scope.PropertyDeductibles[d].PropertyId = $scope.Property.Id;
                                    $scope.PropertyDeductibles[d].LocationNumber = $scope.Location.LocationNumber;
                                    $scope.PropertyDeductibles[d].BuildingNumber = $scope.Property.BuildingNumber;
                                    newDeductibles.push($scope.PropertyDeductibles[d]);
                                }
                            }

                            if (newDeductibles.length > 0) {
                                policyService.updatePropertyDeductibles($scope.parent.Policy.Id, newDeductibles).then(
                                    function (result) {
                                        if (result.data.Result.Success) {
                                            var deductibles = result.data.PropertyDeductibles;
                                            $scope.Property.Deductibles = deductibles.filter(x => x.PropertyId == $scope.Property.Id);
                                            $scope.PropertyDeductibles = deductibles;
                                            $scope.$emit("reload-deductibles", { selectFirst: false, deductibles: $scope.PropertyDeductibles });

                                            // Safeguard Logic
                                            $scope.safeGuardLogic();
                                        } else {
                                            $scope.Errors = result.data.Result.Errors;
                                        }
                                    },
                                    function (error) {
                                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                                    });
                            } else {
                                // Safeguard Logic
                                $scope.safeGuardLogic();
                            }
                            notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Structure ' + $scope.Property.BuildingNumber + ' is saved.');
                        }
                        else {
                            $scope.disableSaveButton = false;
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) {
                        $scope.disableSaveButton = false;
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });

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
            var noPropertyChanges = angular.equals($scope.OriginalProperty, $scope.Property);
            var matched = false;
            var noAssignedContractsChanges = false;
            var noDeductibleChanges = false;
            var noLimitsChanges = false;

            if ($scope.OriginalProperty.AssignedContracts.length == $scope.Property.AssignedContracts.length)
                for (var a = 0; a < $scope.OriginalProperty.AssignedContracts.length; a++) {
                    matched = false;
                    var opa = $scope.OriginalProperty.AssignedContracts[a];
                    for (var b = 0; b < $scope.Property.AssignedContracts.length; b++) {
                        var pa = $scope.Property.AssignedContracts[b];
                        if (angular.equals(opa, pa)) {
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        noAssignedContractsChanges = true;
                        break;
                    }
                }

            if ($scope.OriginalPropertyDeductibles.length == $scope.PropertyDeductibles.length)
                for (var a = 0; a < $scope.OriginalPropertyDeductibles.length; a++) {
                    matched = false;
                    var opd = $scope.OriginalPropertyDeductibles[a];
                    for (var b = 0; b < $scope.PropertyDeductibles.length; b++) {
                        var pd = $scope.PropertyDeductibles[b];
                        if (angular.equals(opd, pd)) {
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        noDeductibleChanges = true;
                        break;
                    }
                }

            if ($scope.OriginalProperty.Limits.length == $scope.Property.Limits.length) {
                for (var a = 0; a < $scope.OriginalProperty.Limits.length; a++) {
                    matched = false;
                    var opl = $scope.OriginalProperty.Limits[a];
                    for (var b = 0; b < $scope.Property.Limits.length; b++) {
                        var pl = $scope.Property.Limits[b];
                        if (angular.equals(opl, pl)) {
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        noLimitsChanges = true;
                        break;
                    }
                }
            }

            var theftSubLimitNull = true;
            for (var j = 0; j < $scope.Property.Limits.length; j++) {
                var limit = $scope.Property.Limits[j];

                if (limit.CauseOfLoss === "Special" && limit.Amount > 0) {
                    theftSubLimitNull = false;
                }
            }

            if (theftSubLimitNull === true) {
                $scope.Property.TheftSublimit = null;
            }

            if (noPropertyChanges === false || noDeductibleChanges === false) {
                policyService.updateProperty($scope.PolicyId, $scope.Property, $scope.requiresRate).then(function (result) {
                    if (result.data.Result.Success) {
                        for (var i = 0; i < $scope.Location.Properties.length; i++) {
                            if ($scope.Location.Properties[i].Id == $scope.Property.Id) {
                                $scope.Location.Properties[i] = $scope.Property;
                            }
                        }

                        for (var l = 0; l < $scope.Locations.length; l++) {
                            var loc = $scope.Locations[l];
                            loc.TIV = 0;
                            for (var i = 0; i < loc.Properties.length; i++) {
                                loc.Properties[i].TIV = 0;
                                for (var k = 0; k < loc.Properties[i].Limits.length; k++) {
                                    loc.Properties[i].TIV += loc.Properties[i].Limits[k].Amount;
                                }
                                loc.TIV += loc.Properties[i].TIV;
                            }
                        }

                        // Property Deductibles 
                        policyService.updatePropertyDeductibles($scope.parent.Policy.Id, $scope.PropertyDeductibles).then(function (result) {
                            if (result.data.Result.Success) {
                                var deductibles = result.data.PropertyDeductibles;
                                $scope.Property.Deductibles = deductibles.filter(x => x.PropertyId == $scope.Property.Id);
                                $scope.PropertyDeductibles = deductibles;
                                $scope.parent.Policy.CurrentVersion.RateProperty = true;
                                $scope.$emit("reload-deductibles", { selectFirst: false, deductibles: $scope.PropertyDeductibles });

                                // Safeguard Logic
                                $scope.safeGuardLogic();
                            }
                            else {
                                $scope.Errors = result.data.Result.Errors;
                            }
                        }, function (error) {
                            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                        });
                    }
                    else {
                        $scope.disableSaveButton = false;
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.disableSaveButton = false;
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            } else {
                $scope.close();
            }
        }
    }

    $scope.checkPropertyWindCoverageType = function (property) {
        switch ($scope.PropertyWindCoverageType.Name) {
            case 'Wind Only':
                property.IsWindOnly = true;
                property.ExcludeWindHail = false;
                //delete theft ded if exist
                $scope.deleteTheftDed();
                break;
            case 'Exclude Wind/Hail':
                property.IsWindOnly = false;
                property.ExcludeWindHail = true;
                break;
            default:
                // If we got in here, then it must be a wind policy
                property.IsWindOnly = false;
                property.ExcludeWindHail = false;
                break;
        }
    }

    $scope.deleteTheftDed = function () {
        //if contains theft ded delete it
        if ($scope.PropertyDeductibles.some(function (e) { return e.Name.toLowerCase().includes('theft') })) {

            var theftDeds = $scope.PropertyDeductibles.filter(function (e) { return e.Name.toLowerCase().includes('theft') });

            for (var i = 0; i < theftDeds.length; i++) {
                var ded = theftDeds[i];

                var index = $scope.PropertyDeductibles.indexOf(ded);
                $scope.PropertyDeductibles.splice(index, 1);

            }
        }

        //if contains theft ded delete it
        if ($scope.PropertyDeductibles.some(function (e) { return e.Name.toLowerCase().includes('theft') })) {

            //Get deductible id if exist in the original property
            var originalDeds = $scope.Property.Deductibles.filter(function (e) { return e.Name.toLowerCase().includes('theft') });
            for (var i = 0; i < originalDeds.length; i++) {
                var ded = originalDeds[i];

                if ($scope.PolicyId && originalDeds[i].Id) {

                    policyService.deletePropertyDeductible($scope.PolicyId, originalDeds[i].Id).then(function (result) {

                        var index = $scope.Property.Deductibles.indexOf(originalDeds[i]);
                        $scope.Property.Deductibles.splice(index, 1);

                    }, function (error) {

                    });

                }

            }
        }

    }

    $scope.deleteWindDeductibles = function (fnCallback) {
        if (!$scope.Property.ExcludeWindHail || $scope.Property.Deductibles == null) {
            if (fnCallback != null && typeof (fnCallback) === "function")
                fnCallback();
            return;
        }

        const windDeductibles = [
            "Wind Deductible (Flat Dollar)",
            "Named Storm Deductible",
            "Named Storm Deductible (Flat Dollar)",
            "All Other Wind Deductible",
            "All Other Wind Deductible (Flat Dollar)"
        ];

        $scope.PropertyDeductibles = $scope.PropertyDeductibles.filter(x => x.PropertyId != $scope.Property.Id || !windDeductibles.includes(x.Name));

        var deductiblesToRemove = [];
        for (var deductible of $scope.Property.Deductibles.filter(x => windDeductibles.includes(x.Name))) {
            deductiblesToRemove.push(deductible.Id);
        }

        if (deductiblesToRemove.length > 0) {
            policyService.deletePropertyDeductibles($scope.PolicyId, deductiblesToRemove)
                .then(result => {
                    if (result.data.Result.Success)
                        $scope.Property.Deductibles = $scope.Property.Deductibles.filter(x => !windDeductibles.includes(x.Name))
                    if (fnCallback != null && typeof (fnCallback) === "function")
                        fnCallback();
                });
        }
        else {
            if (fnCallback != null && typeof (fnCallback) === "function")
                fnCallback();
        }
    }

    $scope.safeGuardLogic = function () {
        var safeGuards = [];

        var pushSafeGuard = function (description) {
            var property = $scope.Property;
            var isIncluded = property.ProtectiveSafeGuards.findIndex(function (x) { return x.ProtectiveSafeGuard === description; }) > -1;
            if (!isIncluded) {
                safeGuards.push({
                    PropertyId: $scope.Property.Id,
                    ProtectiveSafeGuard: description
                });
            }
        }

        if ($scope.PropertyWindCoverageType.Name == "Wind Only") {
            

            var safeGuardIds = $scope.Property.ProtectiveSafeGuards.map(s => s.Id);
            var policyId = $scope.Policy.Id;
                        
            policyService.deleteProtectiveSafeGuards(policyId, safeGuardIds).then(function (result) {
                if (result.data.Result.Success) {
                    
                    notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Protective Safeguard(s) removed.');

                    $scope.Property.ProtectiveSafeGuards = [];

                    for (var i = 0; i < safeGuardIds.length; i++) {

                        var safeguardToRemove = $scope.ProtectiveSafeGuards.find(s => s.Id === safeGuardIds[i]);
                        var index = $scope.ProtectiveSafeGuards.indexOf(safeguardToRemove);

                        $scope.ProtectiveSafeGuards.splice(index, 1);
                    }
                } else {
                    $scope.Errors = result.data.Result.Errors;
                }
                $scope.close();
            }, function (error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                $scope.close();
            });

        } else {
            // By default, include 'P-9 Portable Fire Extinguisher' protective safeguard to the property.
            pushSafeGuard("P-9 Portable Fire Extinguisher.");

            //-----

            if ($scope.Property.CentralStationAlarm === "Yes") {
                pushSafeGuard("P-9 Central Station Burglar Alarm.");
            }

            if ($scope.Property.Occupancy === "Restaurant" || $scope.Property.Occupancy === "Bakeries") {
                pushSafeGuard("P-9 Automatic extinguishing systems over all cooking surfaces that is operational and maintained by semi annual professional cleaning contract. " +
                    "(Hoods/Vents on quarterly professional cleaning contract.).");
            }

            if ($scope.Property.Occupancy === "Apartment" || $scope.Property.Occupancy === "Condominium" || $scope.Property.Occupancy === "Dwelling" ||
                $scope.Property.Occupancy === "Habitational" || $scope.Property.Occupancy === "Hotels/Motels" || $scope.Property.Occupancy === "Habitational Student Living") {
                pushSafeGuard("P-9 Smoke detection devised: Smoke detection devices in each unit that are operational and maintained by semi-annual maintenance program.");
            }

            if ($scope.Property.Occupancy === "Woodworking") {
                pushSafeGuard("P-9 Dust Removal System must be operational and adequate for the exposure that will accommodate the work space for all operations involving the shaving, " +
                    "planing, finishing or similar operations performed on wood or metal which result in dust or wood/metal shavings.");
            }

            if ($scope.Property.Occupancy === "Vacant") {
                pushSafeGuard("P-9 Property to be fully secured against unauthorized entry and visited at least every two weeks by the insured or a representative of the insured.");
            }
        }

        // Call policy service to add new protective safeguard codes.
        if (safeGuards.length > 0) {
            policyService.addProtectiveSafeGuards($scope.PolicyId, safeGuards).then(function (result) {
                if (result.data.Result.Success) {
                    // A list of forms isn't returned with this API, so I comment it out for now.
                    //$scope.Policy.CurrentVersion.Forms = result.data.Forms;

                    notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Protective Safeguard(s) added.');

                    for (var i = 0; i < result.data.ProtectiveSafeGuards.length; i++) {
                        var safeGuard = result.data.ProtectiveSafeGuards[i];
                        $scope.ProtectiveSafeGuards.push(safeGuard);
                        $scope.Property.ProtectiveSafeGuards.push(safeGuard);
                    }
                } else {
                    $scope.Errors = result.data.Result.Errors;
                }
                $scope.close();
            }, function (error) {
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                $scope.close();
            });
        } else {
            $scope.close();
        }
    }

    $scope.windHailChecked = function () {
        if ($scope.Property.ExcludeWindHail) {
            $scope.PropertyDeductibles.filter(function (x) { return x.PropertyId == $scope.Property.Id && x.Name == 'Wind Deductible' })[0].Amount = '';
        } else {
            var windDeductible = $scope.PropertyDeductibles.filter(function (x) { return x.PropertyId == $scope.Property.Id && x.Name == 'Wind Deductible' })[0];
            var amount = $scope.getWindDeductibleBasedOnState($scope.Location.Address.StateCode);
            if (windDeductible == null) {
                $scope.addWindDeductibleToProperty($scope.Property.Id, amount);
            } else {
                if (windDeductible.Amount == null || windDeductible.Amount == '') {
                    windDeductible.Amount = amount;
                }
            }
        }
        $scope.requiresRate = true;
    }

    $scope.validateInputs = function () {
        $scope.ErrorList = [];

        if ($scope.Property.PropertyType == "Glass") {
            if ($scope.Property.Description == null || (!$scope.Property.Description.replace(/\s/g, '').length)) {
                $scope.ErrorList.push('Description is required for Glass Structures');
            }
        }

        if ($scope.Property.PropertyType == 'Building') {

            var passRatioCheck = false;
            var buildingLimit = 0;

            if ($scope.Property.Occupancy != "Builder's Risk") {
                buildingLimit = $.grep($scope.Property.Limits, function (n) { return n.LimitName == 'Building' })[0].Amount;
            }
            else {
                for (var i = 0; i < $scope.Property.Limits.length; i++) {
                    var limit = $scope.Property.Limits[i];
                    if (!limit || !limit.Amount) continue;
                    buildingLimit += parseInt(limit.Amount.toString().replace(',', ''));
                }
            }

            if (buildingLimit == '' || buildingLimit == '0') {
                passRatioCheck = true;
            }

            var cleanLimit = parseInt(buildingLimit.toString().replace(/,/g, ''));
            if (isNaN(cleanLimit)) {
                cleanLimit = 0;
            }

            $scope.maxOrdinance = Math.floor(cleanLimit * .25);

            if ($scope.Property.OrdinanceAndLawCoverageB != "Excluded") {
                if ($scope.Property.OrdinanceAndLawCoverageB == "") {
                    $scope.ErrorList.push("Ordinance And Law Coverage B cannot be blank");
                }

                var cleanOrdinanceAndLawB = parseInt($scope.Property.OrdinanceAndLawCoverageB.replace(/,/g, ''));
                if (cleanOrdinanceAndLawB < 1) {
                    $scope.ErrorList.push("Ordinance And Law Coverage B limit must be greater than 0");
                } else {
                    if (cleanOrdinanceAndLawB > $scope.maxOrdinance) {
                        $scope.ErrorList.push("Ordinance And Law Coverage B limit cannot exceed 25% (" + $scope.maxOrdinance + ") of building limit");
                    }
                }
            }

            if ($scope.Property.OrdinanceAndLawCoverageC != "Excluded") {
                if ($scope.Property.OrdinanceAndLawCoverageC == "") {
                    $scope.ErrorList.push("Ordinance And Law Coverage C cannot be blank");
                }

                var cleanOrdinanceAndLawC = parseInt($scope.Property.OrdinanceAndLawCoverageC.replace(/,/g, ''));
                if (cleanOrdinanceAndLawC < 1) {
                    $scope.ErrorList.push("Ordinance And Law Coverage C limit must be greater than 0");
                } else {
                    if (cleanOrdinanceAndLawC > $scope.maxOrdinance) {
                        $scope.ErrorList.push("Ordinance And Law Coverage C limit cannot exceed 25% (" + $scope.maxOrdinance + ") of building limit");
                    }
                }
            }

            if ($scope.Property.OrdinanceAndLawCoverageBAndC != "Excluded") {
                if ($scope.Property.OrdinanceAndLawCoverageBAndC == "")
                    $scope.ErrorList.push("Ordinance And Law Coverage B&C cannot be blank");

                var cleanOrdinanceAndLawBAndC = parseInt($scope.Property.OrdinanceAndLawCoverageBAndC.replace(/,/g, ''));
                var maxOrdinanceBAndC = Math.floor(cleanLimit * .5);

                if (cleanOrdinanceAndLawBAndC <= 0) {
                    $scope.ErrorList.push("Ordinance And Law Coverage B&C limit must be greater than 0");
                } else if (cleanOrdinanceAndLawBAndC > maxOrdinanceBAndC) {
                    $scope.ErrorList.push("Ordinance And Law Coverage B&C limit cannot exceed 50% (" + maxOrdinanceBAndC + ") of the building limit");
                }
            }

            if ($scope.Property.SpoilageCoverageLimit != "Excluded") {
                if ($scope.Property.SpoilageCoverageLimit == "") {
                    $scope.ErrorList.push("Spoilage Coverage Limit cannot be blank");
                } else {
                    if ($scope.Property.SpoilageCoverageLimit == undefined ||
                        $scope.Property.SpoilageCoverageLimit == null) {
                        $scope.Property.SpoilageCoverageLimit = "0";
                    }
                }

                var cleanSpoilageLimit = parseInt($scope.Property.SpoilageCoverageLimit.replace(/,/g, ''));
                if (cleanSpoilageLimit < 1) {
                    $scope.ErrorList.push("Spoilage Coverage limit must be greater than $0");
                }

                if ($scope.Property.SpoilageCoverageDeductible == "") {
                    $scope.ErrorList.push("Spoilage Coverage Deductible cannot be blank");
                } else {
                    if ($scope.Property.SpoilageCoverageDeductible == undefined ||
                        $scope.Property.SpoilageCoverageDeductible == null) {
                        $scope.Property.SpoilageCoverageDeductible = "0";
                    }
                    var cleanSpoilageDeductible = parseInt($scope.Property.SpoilageCoverageDeductible.replace(/,/g, ''));
                    if (cleanSpoilageDeductible < 250) {
                        $scope.ErrorList.push("Spoilage Coverage Deductible must be greater than $250");
                    }
                }
            }

            if ($scope.showExtensionEndorsement == true) {
                if ($scope.Property.ExtensionEndorsementLimit == null) {
                    $scope.ErrorList.push("Must select an Extension Endorsement option when Extension Endorsement coverage is selected");
                }
            }
            else {
                $scope.Property.ExtensionEndorsementLimit = null;
            }


            var limitAmount = 0;
            for (var i = 0; i < $scope.Property.Limits.length; i++) {
                var limit = $scope.Property.Limits[i];
                if (limit.Amount == '' || limit.Amount == null) limit.Amount = 0;
                limitAmount += limit.Amount;

                if (isNaN(parseInt(limit.Amount))) {
                    limit.Amount = 0;
                }
            }

            if (limitAmount == 0) {
                $scope.ErrorList.push('You must enter limits in at least one limit category.');
            }

            if (!$scope.Property.ExcludeWindHail) {
                if (checkInputs($scope.PropertyDeductibles
                    .filter(function (x) { return x.PropertyId == $scope.Property.Id && x.Name == 'Wind Deductible' })[0]
                    .Amount)) {
                    $scope.ErrorList.push('Please select a wind deductible.');
                }
            }

            if (checkInputs($scope.PropertyDeductibles
                .filter(function (x) { return x.PropertyId == $scope.Property.Id && x.Name == 'AOP Deductible' })[0]
                .Amount)) {
                $scope.ErrorList.push('Please select an AOP Deductible.');
            }

            if ($scope.Property.PropertyType == 'Building') {
                if (checkInputs($scope.Property.Occupancy)) {
                    $scope.ErrorList.push('Please select an occupancy.');
                }

                if (checkInputs($scope.Property.Construction)) {
                    $scope.ErrorList.push('Please select a construction.');
                }

                if (checkInputs($scope.Property.Sprinklered)) {
                    $scope.ErrorList.push('Please select a sprinkler type.');
                }

                if (checkInputs($scope.Property.ProtectionClass)) {
                    $scope.ErrorList.push('Please select a Protection Class.');
                }

                if (checkInputs($scope.Property.YearBuilt)) {
                    $scope.ErrorList.push('Please select a year built.');
                }

                if ($scope.Property.YearUpgrade === '-') {
                    $scope.Property.YearUpgrade = null;
                }

                if (checkInputs($scope.Property.RoofUpdate)) {
                    $scope.ErrorList.push('Please select a year for roof update.');
                }

                if (checkInputs($scope.Property.WiringUpdate)) {
                    $scope.ErrorList.push('Please select a year for wiring update.');
                }

                if (checkInputs($scope.Property.PlumbingUpdate)) {
                    $scope.ErrorList.push('Please select a year for plumbing update.');
                }

                if (checkInputs($scope.Property.HVACUpdate)) {
                    $scope.ErrorList.push('Please select a year for HVAC update.');
                }

                if (checkInputs($scope.Property.RoofShape)) {
                    $scope.ErrorList.push('Please select a roof shape.');
                }

                if (checkInputs($scope.Property.RoofAnchor)) {
                    $scope.ErrorList.push('Please select a roof anchor type.');
                }

                if (checkInputs($scope.Property.RoofCoverage)) {
                    $scope.ErrorList.push('Please select a roof coverage.');
                }

                if (!$scope.Property.ExcludeWindHail && checkInputs($scope.Property.OpeningProtection)) {
                    $scope.ErrorList.push('Please select an opening protection.');
                }

                if (checkInputs($scope.Property.SquareFeet)) {
                    $scope.ErrorList.push('Please enter the square footage.');
                }

                if (checkInputs($scope.Property.NumberOfStories) || $scope.Property.NumberOfStories == "0") {
                    $scope.ErrorList.push('Please select the number of stories.');
                }

                if (checkInputs($scope.Property.CentralStationAlarm)) {
                    $scope.ErrorList.push('Please select a central station alarm.');
                }

                if ($scope.Property.SpoilageCoverageLimit != "Excluded") {
                    if (checkInputs($scope.Property.SpoilagePropertyDescription)) {
                        $scope.ErrorList
                            .push('Spoilage Property Description cannot be blank when selecting Spoilage Coverage.');
                    }
                }

                if ($scope.Property.TheftSublimit != undefined || $scope.Property.TheftSublimit != null) {
                    if ($scope.Property.TheftSublimit.length > 0) {
                        var cleanTheftLimit = parseInt($scope.Property.TheftSublimit.replace(/,/g, ''));
                        if (isNaN(cleanTheftLimit)) {
                            $scope.ErrorList.push('Theft sublimit must be a valid number');
                        }
                    }
                }

                var riskCompanyData = $.grep($scope.Property.RiskCompanyData, function (n) { return n.RiskCompanyId == "be7a9234-5ba5-49e5-acc0-deec3ff2ead0" })[0];
                if (riskCompanyData != null) {
                    var isSubOccupancyListEmpty = $scope.GetListOfCompanyCharacteristicValues($scope.Property.Occupancy, 'be7a9234-5ba5-49e5-acc0-deec3ff2ead0').length == 0;
                    if (!isSubOccupancyListEmpty) {
                        if (riskCompanyData.OccupancyCode == null || riskCompanyData.OccupancyCode == "") {
                            $scope.ErrorList.push('Please select a sub occupancy.');
                        }
                    }
                }

                riskCompanyData = $.grep($scope.Property.RiskCompanyData, function (n) { return n.RiskCompanyId == '48b1a26b-713f-4344-8470-5bfb9e25017c' })[0];
                if (riskCompanyData != null) {
                    var isSubOccupancyListEmpty = $scope.GetListOfCompanyCharacteristicValues($scope.Property.Occupancy, '48b1a26b-713f-4344-8470-5bfb9e25017c').length == 0;
                    if (!isSubOccupancyListEmpty) {
                        if ((riskCompanyData.OccupancyCode == null || riskCompanyData.OccupancyCode == "") && !$scope.ErrorList.find(x => x == "Please select a sub occupancy.")) {
                            $scope.ErrorList.push('Please select a sub occupancy.');
                        }
                    }
                }

                if ($scope.Property.Occupancy == "Vacant" || $scope.Property.Occupancy == "Builder's Risk") {
                    if (checkInputs($scope.Property.Vandalism)) {
                        $scope.ErrorList.push('Vandalism cannot be blank please make a valid selection');
                    }

                    if (checkInputs($scope.Property.SprinklerLeakage)) {
                        $scope.ErrorList.push('Sprinkler Leakage cannot be blank please make a valid selection');
                    }
                }

                if ($scope.Property.Occupancy == "Builder's Risk") {
                    if (checkInputs($scope.Property.BuildersRiskType)) {
                        $scope.ErrorList.push('Builder\'s Risk Type cannot be blank please make a valid selection');
                    }
                }
            }
        }
        else {
            for (var i = 0; i < $scope.Property.Limits.length; i++) {
                var limit = $scope.Property.Limits[i];


                if (limit.LimitName != "Business Income") {
                    var amount = limit.Amount.replace(/[^0-9-.]/g, "");
                    if (amount % 1 !== 0 || isNaN(amount) || amount == null || amount == '') {
                        $scope.ErrorList.push('Limit must be a valid number');
                        return;
                    }

                    if (amount <= 0) {
                        $scope.ErrorList.push('Must enter a limit greater than zero');
                        return;
                    }
                }
            }
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

    $scope.changeSharedProperty = function (property) {
        property.BiCauseOfLossId = property.BppCauseOfLossId = property.ImpCauseOfLossId = property.OtherCauseOfLossId = property.BuildingCauseOfLossId;
        property.BppCoInsurance = property.ImpCoInsurance = property.OtherCoInsurance = property.BuildingCoInsurance;
    }

    $scope.yearBuiltChanged = function (item, model) {
        if ($scope.Property.RoofUpdate == "" || $scope.Property.RoofUpdate == null || $scope.Property.RoofUpdate < $scope.Property.YearBuilt) {
            $scope.Property.RoofUpdate = $scope.Property.YearBuilt;
            $scope.roofUpdateChanged();
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
        $scope.requireRerate();
    }

    $scope.propertyWindCoverageTypeChanged = function () {
        var windType = $scope.PropertyWindCoverageType.Name;

        switch (windType) {
            case "With Wind/Hail":
                $scope.setUpWithWind();
                break;
            case "Exclude Wind/Hail":
                $scope.setUpExcludedWind();
                break;
            case "Wind Only":
                $scope.setUpWindOnly();
                break;
            default:
            // Do nothing by default
        }

        // Make sure we set it to be re-rated if this field changes
        $scope.requireRerate();

        // Update extension endorsement options to show/hide 'Wind Only' option.
        $scope.updateExtensionEndorsementOptions();
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

    $scope.setUpWindOnly = function () {
        //$scope.windOnly = true;
        $scope.Property.ExcludeWindHail = false;
        $scope.windHailChecked();

        // Set the AOP to N/A
        $scope.PropertyDeductibles.filter(function (x) { return x.PropertyId == $scope.Property.Id && x.Name == 'AOP Deductible' })[0].Amount = 'N/A';

        // Go through property limits and set cause of loss to wind only
        for (var i = 0; i < $scope.Property.Limits.length; i++) {
            var limit = $scope.Property.Limits[i];
            limit.CauseOfLoss = "Windstorm or Hail Only";
        }

        // This will cause the UI to only show wind only cause of losses
        $scope.CharacteristicsState.State = 'Coverage Form - Wind Only';
    }

    $scope.setUpExcludedWind = function () {
        //$scope.windOnly = false;
        $scope.Property.ExcludeWindHail = true;
        $scope.windHailChecked();

        // Check and set the Aop default
        $scope.setDefaultAop();

        if ($scope.CharacteristicsState.State != 'Coverage Form') {
            // Go through property limits and set cause of loss to special ex theft
            for (var i = 0; i < $scope.Property.Limits.length; i++) {
                var limit = $scope.Property.Limits[i];
                limit.CauseOfLoss = "Special Excluding Theft";
            }

            // This will cause the UI all cause of losses but wind only
            $scope.CharacteristicsState.State = 'Coverage Form';
        }
    }

    $scope.setUpWithWind = function () {
        //$scope.windOnly = false;
        $scope.Property.ExcludeWindHail = false;
        $scope.windHailChecked();

        // Check and set the Aop default
        $scope.setDefaultAop();

        if ($scope.CharacteristicsState.State != 'Coverage Form') {
            // Go through property limits and set cause of loss to special ex theft
            for (var i = 0; i < $scope.Property.Limits.length; i++) {
                var limit = $scope.Property.Limits[i];
                limit.CauseOfLoss = "Special Excluding Theft";
            }

            // This will cause the UI all cause of losses but wind only
            $scope.CharacteristicsState.State = 'Coverage Form';
        }
    }

    $scope.setDefaultAop = function () {
        // If the AOP is set to N/A, set it back to the default value otherwise leave it as is
        var aop = $scope.PropertyDeductibles.filter(function (x) { return x.PropertyId == $scope.Property.Id && x.Name == 'AOP Deductible' })[0].Amount;
        if (aop == "N/A") $scope.PropertyDeductibles.filter(function (x) { return x.PropertyId == $scope.Property.Id && x.Name == 'AOP Deductible' })[0].Amount = "$1,000";
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

    $scope.roofUpdateChanged = function (item, model) {
        if ($scope.Property.RoofUpdate == "" || $scope.Property.RoofUpdate == null || $scope.Property.RoofUpdate < $scope.Property.YearBuilt) {
            $scope.Property.RoofUpdate = $scope.Property.YearBuilt;
        }

        $scope.requireRerate();
    }

    $scope.wiringUpdateChanged = function (item, model) {
        if ($scope.Property.WiringUpdate == "" || $scope.Property.WiringUpdate == null || $scope.Property.WiringUpdate < $scope.Property.YearBuilt) {
            $scope.Property.WiringUpdate = $scope.Property.YearBuilt;
        }
        $scope.requireRerate();
    }

    $scope.plumbingUpdateChanged = function (item, model) {
        if ($scope.Property.PlumbingUpdate == "" || $scope.Property.PlumbingUpdate == null || $scope.Property.PlumbingUpdate < $scope.Property.YearBuilt) {
            $scope.Property.PlumbingUpdate = $scope.Property.YearBuilt;
        }
        $scope.requireRerate();
    }

    $scope.hvacUpdateChanged = function (item, model) {
        if ($scope.Property.HVACUpdate == "" || $scope.Property.HVACUpdate == null || $scope.Property.HVACUpdate < $scope.Property.YearBuilt) {
            $scope.Property.HVACUpdate = $scope.Property.YearBuilt;
        }
        $scope.requireRerate();
    }

    $scope.sinkholeOption = {};
    $scope.sinkholeOption.selected = "Excluded";
    $scope.GetCharacteristicValues = function (name) {
        return $scope.Characteristics[name];
    }

    $scope.resetSubOccupancy = function () {
        for (var i = 0; i < $scope.Property.RiskCompanyData.length; i++) {
            $scope.Property.RiskCompanyData[i].OccupancyCode = null;
        }
    }

    $scope.setSubOccupancy = function () {
        // declare code variable and get risk company with valid code
        var occupancyCode;
        var riskCompanyData = $scope.Property.RiskCompanyData.find(x => x.OccupancyCode)

        // extract valid code from risk company
        if (riskCompanyData) {
            occupancyCode = riskCompanyData.OccupancyCode;
        }

        // set code to other risk companies if code is valid
        if (occupancyCode) {
            for (var i = 0; i < $scope.Property.RiskCompanyData.length; i++) {
                $scope.Property.RiskCompanyData[i].OccupancyCode = occupancyCode;
            }
        }
    }

    $scope.showGuidelines = function (guideline) {
        var modalInstance = $modal.open({
            templateUrl: 'template.html',
            controller: 'Field_Description',
            backdrop: 'static',
            resolve: {
                guideline: function () {
                    return guideline;
                },
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

    $scope.checkWindCoverageType = function () {
        var property = $scope.Property;

        if (property == undefined) return;

        if (property.IsWindOnly) {
            $scope.PropertyWindCoverageType.Name = 'Wind Only';
        } else if (property.ExcludeWindHail && !property.IsWindOnly) {
            $scope.PropertyWindCoverageType.Name = 'Exclude Wind/Hail';
        } else {
            $scope.PropertyWindCoverageType.Name = 'With Wind/Hail';
        }
    }
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
    geocoder.geocode({
        'address': address
    }, function (results, status) {
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

                heading = google.maps.geometry.spherical.computeHeading(streetViewPanoramaData.location.latLng, addressLocation);
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







