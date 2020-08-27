MALACHIAPP.controller('ContractsController', ['$rootScope', '$scope', '$sce', '$location', '$timeout', '$modal', 'settings', 'notificationsHub', 'sharedService', 'contractService', 'settingsService', 'insurerService', 'toolsService', 'ContractScroller', 'riskCompanyService', function ($rootScope, $scope, $sce, $location, $timeout, $modal, settings, notificationsHub, sharedService, contractService, settingsService, insurerService, toolsService, ContractScroller, riskCompanyService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });
    var $state = $rootScope.$state;

    $scope.Contracts = [];
    $scope.AllContracts = [];
    $scope.Apps = [];
    $scope.Attributes = [];
    $scope.AppFilters = [];
    $scope.States = [];
    $scope.Insurers = [];
    $scope.Brokers = [];
    $scope.Coverages = [];
    $scope.ManagingGeneralAgents = [];
    $scope.LastContractSyndicates = [];
    $scope.newContract = false;
    $scope.Status = "Effective";
    $scope.AppFilter = "";
    $scope.HiddenFilter = true;

    // Store risk companies that will show in dropdown for contract risk company override
    $scope.RiskCompanies = []; 

    $scope.Accordion = {
        SyndicateDetails: { isOpen: false },
        StateDetails: { isOpen: false }
    }

    function loadPage() {
        // Load States
        toolsService.getStates().then(function (result) {
            if (result.data.Result.Success) {
                $scope.States = result.data.States;

                $scope.contractscroller = new ContractScroller($scope);
                $scope.contractscroller.nextPage('', $scope.AppFilter);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

        settingsService.getApps().then(function (result) {
            if (result.data.Result.Success) {
                $scope.Apps = result.data.Apps;
                $scope.AppFilters = $scope.Apps.slice();
                if ($scope.AppFilters.length > 1)
                    $scope.HiddenFilter = false;

                $scope.AppFilters.push({ Id: 'unassigned', Name: 'Unassigned' });
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });

        settingsService.getAttributes().then(function (result) {
            if (result.data.Result.Success) {
                $scope.Attributes = result.data.Attributes;              
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });


        insurerService.getInsurers().then(function (result) {
            if (result.data.Result.Success) {
                $scope.Insurers = result.data.Insurers;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

        settingsService.getBrokers().then(function (result) {
            if (result.data.Result.Success) {
                $scope.Brokers = result.data.Brokers;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

        settingsService.getManagingGeneralAgents().then(function (result) {
            if (result.data.Result.Success) {
                $scope.ManagingGeneralAgents = result.data.ManagingGeneralAgents;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

        settingsService.getCoverages().then(function (result) {
            if (result.data.Result.Success) {
                $scope.Coverages = result.data.Coverages;
                $scope.Coverages.sort(function(a, b) {
                    return a.Index - b.Index;
                });
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

        contractService.getAllContracts().then(function (result) {
            if (result.data.Result.Success) {
                $scope.AllContracts = result.data.Contracts;

                $scope.AllContracts.unshift({ Id: null, Name: "None" });
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

        riskCompanyService.getRiskCompanies().then(function (result) {
            if (result.data.Result.Success) {
                $scope.RiskCompanies = result.data.RiskCompanies;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.searchContract = function (name, pageNumber, display, status, appFilter) {
        $scope.Status = status;
        $scope.contractscroller = new ContractScroller($scope);
        $scope.contractscroller.nextPage('', $scope.AppFilter);

        //contractService.searchContracts(name, pageNumber, display, status, appFilter).then(function (result) {
        //    if (result.data.Result.Success) {
        //        $scope.Contracts = result.data.Contracts;
        //        $scope.Status = status;


        //    } else {
        //        $scope.Errors = result.data.Result.Errors;
        //    }
        //}, function (error) {
        //    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        //});
    }

    $scope.currentTimeout = null;
    $scope.searchNameChanged = function () {
        if ($scope.currentTimeout != null) {
            $timeout.cancel($scope.currentTimeout);
        }

        $scope.currentTimeout = $timeout(function () { $scope.contractscroller.search($scope.searchName, $scope.AppFilter); }, 1000);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $scope.searchContract('', $scope.currentPage, 10, $scope.Status, $scope.AppFilter);
    };

    $scope.addNewContract = function () {
        $scope.ErrorMessage = null;
        $scope.newContract = true;
        $scope.Contract = new contract();
        $scope.LastContractSyndicates = [];
        $scope.Contract.Enabled = true;
        $scope.Contract.AssignedManagingGeneralAgents = [];
    }

    $scope.selectContract = function (Contract) {
        $scope.Errors = [];
        $scope.newContract = true;
        $scope.Contract = $.extend(true, {}, Contract);
        $scope.LastContractSyndicates = $.extend(true, [], $scope.Contract.ContractSyndicates);
        setDate($scope.Contract);

        $scope.Contract.AssignedManagingGeneralAgents = [];
        for (var i = 0; i < $scope.Contract.ManagingGeneralAgents.length; i++) {
            $scope.Contract.AssignedManagingGeneralAgents.push($scope.Contract.ManagingGeneralAgents[i].ManagingGeneralAgentId);
        }

        $scope.refreshZoneGroups($scope.Contract.InsurerId);
    }

    $scope.refreshZoneGroups = function (insurerId) {
        if (insurerId == null) {
            $scope.ZoneGroups = [];
            return;
        }
        insurerService.getAllZoneGroups().then(function (result) {
            if (result.data.Result.Success) {
                $scope.ZoneGroups = result.data.ZoneGroups;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.saveContract = function (Contract) {
        $scope.Errors = [];
        // Check if dates are valid
        if (sharedService.validateDate(Contract.Effective) == false) {
            $scope.Errors = ['The effective date is not a valid date. Please check the calendar.'];
            return;
        }

        if (sharedService.validateDate(Contract.Expiration) == false) {
            $scope.Errors = ['The expiration date is not a valid date. Please check the calendar.'];
            return;
        }

        if (Contract.ContractSyndicates == null) {
            Contract.ContractSyndicates = [];
        }

        $scope.validateContractSyndicates();

        if ($scope.Errors.length > 0) return;

        $scope.Contract.ManagingGeneralAgents = [];
        for (var i = 0; i < $scope.Contract.AssignedManagingGeneralAgents.length; i++) {
            $scope.Contract.ManagingGeneralAgents.push({ ManagingGeneralAgentId: $scope.Contract.AssignedManagingGeneralAgents[i] });
        }

        var isNew = $scope.Contract.Id == null;
        contractService.updateContract($scope.Contract).then(function (result) {
            if (result.data.Result.Success) {
                if (isNew) {
                    $scope.Contracts.push(result.data.Contract);
                    setDate(result.data.Contract);
                } else {
                    for (var i = 0; i < $scope.Contracts.length; i++) {
                        if ($scope.Contracts[i].Id == result.data.Contract.Id) {
                            $scope.Contracts[i] = result.data.Contract;
                            setDate(result.data.Contract);
                        }
                    }

                    // If syndicates are changed, let user know that changes will reflect on existing quotes and policies.
                    var syndicates = result.data.Contract.ContractSyndicates;
                    if ($scope.LastContractSyndicates.length != syndicates.length) {
                        notificationsHub.showInfo('Contract', 'Changes to contract syndicates will reflect on existing quotes and policies.');
                    }
                }
                // Clean up
                $scope.cancelContract();
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.cancelContract = function () {
        var accordion = $scope.Accordion;
        accordion.SyndicateDetails.isOpen = false;
        accordion.StateDetails.isOpen = false;

        $scope.newContract = false;
        $scope.LastContractSyndicates = [];
        $scope.Errors = [];
    }

    $scope.deleteContract = function (contract) {
        settingsService.deleteContract(contract.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Contracts.splice($.inArray(contract, $scope.Contracts), 1);
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.getContractErrorsTooltip = function (contract) {
        var html = "";
        var messages = contract.ValidationMessages;

        for (var i = 0; i < messages.length; i++) {
            var isLastElement = i == messages.length - 1;
            html += messages[i] + (isLastElement ? "" : "<br/>");
        }

        return $sce.trustAsHtml(html);
    }

    function isNullOrEmpty(str) {
        return typeof (str) != "string" || str.length == 0;
    }

    function isNumeric(str) {
        if (typeof (str) == "number") return true;
        if (typeof (str) == "string") {
            return parseFloat(str) == str;
        }
        return false;
    }

    function isWithinDecimalPlace(actual, precision) {
        if (typeof (actual) == "number") {
            var multiplier = (precision < 1) ? 10 : Math.pow(10, precision);
            var expected = Math.round(actual * multiplier) / multiplier;
            return actual == expected;
        }
        return false;
    }

    $scope.isLloydsContract = function() {
        var contract = $scope.Contract;
        if (contract == null) return false;
        var insurer = $scope.Insurers.find(function (x) { return x.Id == contract.InsurerId });

        return insurer != null && insurer.RiskCompanyId == "4488e1cd-a57b-4e16-828e-cf2bc4a03186";
    }

    $scope.addContractSyndicate = function () {
        var contract = $scope.Contract;
        if (contract != undefined) {
            contract.ContractSyndicates.push({
                CoverageId: $scope.Coverages[0].Id,
                SyndicateCode: "",
                SplitPercentage: 0
            });
        }
    }

    $scope.removeContractSyndicate = function (syndicate) {
        var contract = $scope.Contract;
        if (contract != undefined) {
            var index = contract.ContractSyndicates.indexOf(syndicate);
            if (index > -1)
                contract.ContractSyndicates.splice(index, 1);            
        }
    }

    $scope.validateContractSyndicates = function () {
        var contract = $scope.Contract;
        if (contract != undefined) {
            var syndicates = contract.ContractSyndicates;
            if (syndicates.length > 0) {
                // Check for blank syndicate codes.
                var hasEmptyEntries = syndicates.some(function (x) { return isNullOrEmpty(x.SyndicateCode); });
                if (hasEmptyEntries) {
                    $scope.Errors.push("Syndicate code(s) cannot be blank.");
                    return;
                }

                // Check for non-numeric and non-negative split percentages.
                var hasInvalidInput = syndicates.some(function (x) { return !isNumeric(x.SplitPercentage) || parseFloat(x.SplitPercentage) < 0; });
                if (hasInvalidInput) {
                    $scope.Errors.push("Please enter a valid split amount.");
                    return;
                }

                // Check if any split percentage is not within two decimal places.
                var isNotTwoDecimalPlaces = syndicates.some(function (x) { return !isWithinDecimalPlace(parseFloat(x.SplitPercentage), 2); });
                if (isNotTwoDecimalPlaces) {
                    $scope.Errors.push("Split percentage(s) must not be more than two decimal places.");
                    return;
                }

                // Get coverages used by the syndicates.
                var coverages = $scope.Coverages.filter(function (x) {
                    return syndicates.some(function (y) { return y.CoverageId == x.Id; });
                });

                // Check for duplicate syndicate codes on the same coverage.
                coverages.forEach(function (coverage) {
                    var syndicatesWithCoverage = syndicates.filter(function (syndicate) { return syndicate.CoverageId == coverage.Id; });
                    var copies = getSyndicateCopies(syndicatesWithCoverage);
                    if (copies.some(function(x) { return x.Count > 1 })) {
                        $scope.Errors.push(coverage.Name + ": Syndicate codes must be unique.");
                    }
                });

                // Check if syndicate splits accumulate to 100% exact for each coverage.
                //if ($scope.Errors.length < 1) {
                //    coverages.forEach(function (coverage) {
                //        var splitSum = 0;
                //        var syndicatesWithCoverage = syndicates.filter(function (syndicate) { return syndicate.CoverageId == coverage.Id; });
                //        syndicatesWithCoverage.forEach(function (syndicate) {
                //            splitSum += Math.round(parseFloat(syndicate.SplitPercentage) * 100);
                //        });
                //        if (splitSum != 10000) {
                //            var fSplitSum = splitSum / 100;
                //            $scope.Errors.push(coverage.Name + ": Split(s) must total up to 100% (currently at " + fSplitSum.toFixed(2) + "%)");
                //        }
                //    });
                //}
            }
        }
    }

    function getSyndicateCopies(syndicates) {
        var syndicateCopies = [];
        syndicates.forEach(function (syndicate) {
            if (syndicateCopies.some(function (x) { return x.Code == syndicate.SyndicateCode.toLowerCase(); })) {
                var index = syndicateCopies.findIndex(function (x) { return x.Code == syndicate.SyndicateCode.toLowerCase(); });
                syndicateCopies[index].Count++;
            } else {
                syndicateCopies.push({
                    Code: syndicate.SyndicateCode.toLowerCase(),
                    Count: 1
                });
            }
        });
        return syndicateCopies;
    }

    $scope.InsurerName = function (contract) {
        for (var i = 0; i < $scope.Insurers.length; i++) {
            if ($scope.Insurers[i].Id == contract.InsurerId) return $scope.Insurers[i].Name;
        }
        return "";
    }

    $scope.BrokerName = function (contract) {
        for (var i = 0; i < $scope.Brokers.length; i++) {
            if ($scope.Brokers[i].Id == contract.BrokerId) return $scope.Brokers[i].Name;
        }
        return "";
    }

    $scope.ContractName = function (contractId) {
        if (contractId == null) return "";
        for (var i = 0; i < $scope.AllContracts.length; i++) {
            if ($scope.AllContracts[i].Id == contractId) return $scope.AllContracts[i].Name + ' (' + $scope.AllContracts[i].InsurerName+ ')';
        }
        return "";
    }

    $scope.GoToModelMapping = function (contract) {
        $state.transitionTo('modelmapping', { Contract: contract });
    }

    $scope.GoToForms = function (contract) {
        $state.transitionTo('contractforms', { Contract: contract });
    }

    $scope.GoToEligibility = function (contract) {
        $state.transitionTo('eligibility', { Contract: contract, AllContracts: $scope.AllContracts });
    }

    $scope.GoToClassCodes = function (contract) {
        $state.transitionTo('classcodes', { Contract: contract });
    }

    $scope.GoToEligibilityQuestions = function (contract) {
        $state.transitionTo('eligibilityquestions', { Contract: contract, AllContracts: $scope.AllContracts });
    }

    $scope.GoToRatingQuestions = function (contract) {
        $state.transitionTo('ratingquestions', { Contract: contract });
    }

    $scope.GoToZones = function (contract) {
        $state.transitionTo('zones', { Contract: contract });
    }

    $scope.GoToRates = function (contract) {
        $state.transitionTo('ratesheet', { Contract: contract });
    }

    $scope.GoToCommissions = function (contract) {
        $state.transitionTo('contractcommissions', { Contract: contract });
    }

    $scope.GoToNotes = function (contract) {
        $state.transitionTo('contractnotes', { Contract: contract });
    }

    $scope.GoToCoverages = function (contract) {
        $state.transitionTo('coverages', { Contract: contract });
    }

    $scope.Copy = function (contract) {
        var modalInstance = $modal.open({
            templateUrl: 'copyModelContent.html',
            controller: 'copyModelCtrl',
            backdrop: 'static',
            size: 'sm',
            resolve: {
                insurers: function () {
                    return $scope.Insurers;
                },
                insurerId: function () {
                    return contract.InsurerId;
                }
            }
        });

        modalInstance.result.then(function (insurerId) {
            if (insurerId != 'cancel') {
                notificationsHub.showSuccess('Contract', 'Contract copying. Rating engine might need to be redeployed, please talk to System Admin.');
                contractService.copy(contract.Id, insurerId).then(function (result) {
                    if (result.data.Success) {
                        $scope.Errors = [];
                        $scope.newContract = true;
                        $scope.Contract = result.data.Contract;
                        setDate($scope.Contract);
                        $scope.Contracts.push($scope.Contract);

                        $scope.Contract.AssignedManagingGeneralAgents = [];
                        for (var i = 0; i < $scope.Contract.ManagingGeneralAgents.length; i++) {
                            $scope.Contract.AssignedManagingGeneralAgents.push($scope.Contract.ManagingGeneralAgents[i].ManagingGeneralAgentId);
                        }

                        $scope.refreshZoneGroups($scope.Contract.InsurerId);
                    }
                    else {
                        $scope.Errors = result.data.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
        });
    }

    $scope.TIV = function (contract) {
        $state.transitionTo('contracttotalInsuredValues', { Contract: contract });
    }

    $scope.ReCache = function (contract) {
        contractService.recacheContract(contract.Id).then(function (result) {
            if (result.data.Success) {
                notificationsHub.showSuccess('Contract', 'Contract re-cashed.');
            }
            else {
                $scope.Errors = result.data.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    loadPage();

    function setDate(contract) {
        if (contract.Effective.indexOf("-") > -1) {
            var date = moment(contract.Effective, "YYYY-MM-DD").toDate();
            var day = date.getUTCDate();
            var monthIndex = date.getMonth() + 1;
            var year = date.getFullYear();

            contract.Effective = monthIndex + '/' + day + '/' + year;

            date = moment(contract.Expiration, "YYYY-MM-DD").toDate();
            day = date.getUTCDate();
            monthIndex = date.getMonth() + 1;
            year = date.getFullYear();

            contract.Expiration = monthIndex + '/' + day + '/' + year;
        }
    }

    function contract() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        if (dd < 10) dd = '0' + dd
        if (mm < 10) mm = '0' + mm
        var contract = {
            "Name": "",
            "Effective": mm + '/' + dd + '/' + yyyy,
            "Expiration": mm + '/' + dd + '/' + (yyyy + 1)
        };

        contract.StateDetails = [];

        for (var i = 0; i < $scope.States.length; i++) {
            var state = $scope.States[i].Name;

            contract.StateDetails.push({
                State: state,
                LiabilityCommission: 22.5,
                MaxSplit: 100,
                MinSplit: 100,
                PropertyCommission: 22.5
            });
        }

        return contract;
    }
}]);


MALACHIAPP.controller('copyModelCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'insurers', 'insurerId', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, insurers, insurerId) {
    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.selectedInsurerId = insurerId;
    $scope.Insurers = insurers;

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.copy = function () {
        if ($scope.selectedInsurerId != null) {
            $modalInstance.close($scope.selectedInsurerId);
        }
    }
}]);


// Scroller constructor function to encapsulate HTTP and pagination logic
MALACHIAPP.factory('ContractScroller', function ($http, contractService) {
    var ContractScroller = function (scope) {
        this.items = [];
        this.busy = false;
        this.after = 1;
        this.Scope = scope;
        this.previousSearch = ""; // will hold previous message search
        this.noResult = false; // disable infinite scroller if no result
        this.status = scope.Status;
    };

    ContractScroller.prototype.nextPage = function (message, appFilter) {
        // if a request is pending exit function
        if (this.busy)
            return;

        // if message comes in undefined the text field is empty, search for empty string
        if (message == undefined)
            message = '';
        if (appFilter == undefined)
            appFilter = '';

            // if message is different from previous enable inifinite scroller
        else if (this.previousSearch != message)
            this.noResult = false;

        // update previous message
        this.previousSearch = message;

        // set scroller as busy
        this.busy = true;

        // perform request through service
        contractService.searchContracts(message, this.after, 15, this.status, appFilter).then(function (result) {
            var objects = result.data.Contracts;

            // no result from server disable inifinite scroller
            if (objects.length == 0) {
                this.noResult = true;
            }

            // get the total amount of contracts
            this.totalContracts = result.data.Count;

            // push new items into the array
            if (objects.length > 0) {

                // iterate through contracts
                for (var i = 0; i < objects.length; i++) {
                    this.items.push(objects[i]);
                }

                // increment page
                this.after++;

                // scroller is no longer busy
                this.busy = false;
            }

            // add contracts to the scope
            this.Scope.Contracts = this.items;

        }.bind(this), function (error) {

            // log an error
            console.log("Error - Was not able to perform request for Contracts!");

            // scroller is no longer busy
            this.busy = false;

            //$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

    };

    ContractScroller.prototype.search = function (message, appFilter) {
        // if message comes in undefined the text field is empty, search for empty string
        if (message == undefined)
            message = '';
        if (appFilter == undefined)
            appFilter = '';

        this.after = 1;
        this.items = [];

        // if new search is performed enable infinite scroller
        this.noResult = false;
        this.busy = true;

        contractService.searchContracts(message, this.after, 15, this.status, appFilter).then(function (result) {
            var objects = result.data.Contracts;
            this.totalContracts = result.data.Count;
            if (objects.length > 0) {
                for (var i = 0; i < objects.length; i++) {
                    this.items.push(objects[i]);
                }
                this.after++;
                this.busy = false;
            }
            this.Scope.Contracts = this.items;
        }.bind(this), function (error) {
            //$scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            this.busy = false;
        });

    };

    return ContractScroller;
});

