'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Commercial_Lines_EligibilityController', ['authService', 'rateService', '$rootScope', '$scope', '$location', '$stateParams', '$anchorScroll', '$timeout', 'notificationsHub', '$modal', '$sce', 'settings', 'policyService', 'contractService', 'toolsService', 'test_policyService', 'customPackageService', function (authService, rateService, $rootScope, $scope, $location, $stateParams, $anchorScroll, $timeout, notificationsHub, $modal, $sce, settings, policyService, contractService, toolsService, test_policyService, customPackageService) {
    $scope.parent = $scope.$parent;

    $scope.AppId = $scope.parent.AppId;
    $scope.PolicyId = $scope.parent.PolicyId;
    $scope.Policy = $scope.parent.Policy;
    $scope.RiskCompanies = $scope.parent.RiskCompanies;
    $scope.Contracts = [];
    $scope.EligibilityQuestions = [];
    $scope.PropertyPremium = {};
    $scope.LiabilityPremium = {};
    $scope.RatingQuestions = [];
    $scope.showDetails = false;
    $scope.hideEligibilityBtn = false;
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
    $scope.Errors = [];
    $scope.parent.PremiumBreakdowns = [];
    $scope.parent.LiabilityRiskCompanyContracts = [];
    $scope.parent.ContractDeclines = [];
    $scope.HidePage = true;
    $scope.FocusedRiskCompanyId = $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId;
    $scope.QuestionErrors = [];
    $scope.OrderedRiskCompanies = [];
    $scope.UserReviews = [];

    function setupUserReviews() {
        var version = $scope.parent.Policy.CurrentVersion;

        for (var riskCompany of $scope.RiskCompanies) {
            var checked = version.QuestionReviewConfirmations.some(x => x.RiskCompanyId == riskCompany.Id) || version.UserConfirmsQuestionReview;
            $scope.UserReviews[riskCompany.Id] = checked;
        }
    }

    setTimeout(() => setupUserReviews(), 10);

    function isReviewed() {
        return $scope.FocusedRiskCompanyId != null
            && $scope.UserReviews[$scope.FocusedRiskCompanyId];
    }

    function getReviewedRiskCompanies() {
        var riskCompanyIds = [];

        for (var riskCompanyId in $scope.UserReviews) {
            var checked = $scope.UserReviews[riskCompanyId];
            if (checked) riskCompanyIds.push(riskCompanyId);
        }

        return riskCompanyIds;
    }

    if ($scope.AppId == null) {
        $rootScope.$state.transitionTo('policyDashboard');
    }

    if ($scope.PolicyId) { // Existing Policy
    } else {
        $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
    }

    $scope.isPackage = function () {
        var coverages = $scope.Policy.CurrentVersion.Coverages;
        var hasProperty = coverages.find(function (x) { return x.Name == "Property"; });
        var hasLiability = coverages.find(function (x) { return x.Name == "Liability"; });

        return hasProperty && hasLiability;
    };

    $scope.isMonolineLiability = function () {
        var coverages = $scope.Policy.CurrentVersion.Coverages;
        var hasProperty = coverages.find(function (x) { return x.Name == "Property"; });
        var hasLiability = coverages.find(function (x) { return x.Name == "Liability"; });

        return !hasProperty && hasLiability;
    };

    $scope.hideSubmitButton = function (riskCompany) {
        let riskCompanyIds = [
            "b216d262-52f0-4864-aec9-3411acf7c218",
            "48b1a26b-713f-4344-8470-5bfb9e25017c",
            "be7a9234-5ba5-49e5-acc0-deec3ff2ead0",
            "6d719a07-b422-4c38-9a7c-e9df837f3010",
            "689c1168-395d-483b-8837-f92ea949e92a",
            "5328469d-f3fe-4d09-9294-7898fea47adc",
            "d4a5b7d5-1104-4cad-84de-7cdddaff7f2d"
        ];
        return !$scope.parent.canModify() || riskCompanyIds.some(x => riskCompany.Id.toLowerCase() == x);
    };

    $scope.isSafetySpecialty = function (riskCompany) {
        return riskCompany.Id == "F20153C2-7B31-42F0-B3CB-26C6BC82EAF0".toLowerCase();
    };

    $scope.isTrisuraSpecialty = function (riskCompany) {
        return riskCompany.Id == "29DB6946-0124-4A09-9D6F-5E4FF22F1980".toLowerCase();
    };

    $scope.isLiquorEligible = function (riskCompany) {
        var riskCompanyIds = ["b216d262-52f0-4864-aec9-3411acf7c218", "6d719a07-b422-4c38-9a7c-e9df837f3010"];
        return riskCompanyIds.some(x => riskCompany.Id.toLowerCase() == x);
    }

    $scope.isRLI = function (riskCompanyId) {
        return riskCompanyId == "b216d262-52f0-4864-aec9-3411acf7c218";
    };

    $scope.hideRiskCompany = function (riskCompany) {
        var customPackageRiskCompany = $scope.getCustomPackageRiskCompany(riskCompany.Id);

        var isDeclinedCustomPackage = (customPackageRiskCompany && riskCompany.Id == customPackageRiskCompany.Id) && !$scope.showCustomPackage(riskCompany.Id);
        var isPackageSafety = $scope.isPackage() && ($scope.isSafetySpecialty(riskCompany) || $scope.isTrisuraSpecialty(riskCompany));
        var isLiabilitySafety = $scope.isMonolineLiability() && ($scope.isSafetySpecialty(riskCompany) || $scope.isTrisuraSpecialty(riskCompany));

        return isDeclinedCustomPackage || isPackageSafety || isLiabilitySafety;
    };

    $scope.orderRiskCompanies = function (riskCompanies) {
        if (riskCompanies == null) riskCompanies = $scope.RiskCompanies;
        if ($scope.OrderedRiskCompanies.length == 0) {
            var filteredRiskCompanies = riskCompanies.filter(function (x) { return !customPackageService.isCustomPackage(x.Id); });
            var acceptedCompanies = []; // list to store the not declined list of companies
            var declinedCompanies = []; //  list for the declines

            // Get the declined list first
            declinedCompanies = filteredRiskCompanies.filter(function (x) {
                return $scope.parent.isRiskCompanyDeclined(x.Id);
            });
            // Then the accepted list
            acceptedCompanies = filteredRiskCompanies.filter(function (x) {
                return !declinedCompanies.some(y => x.Id == y.Id);
            });
            // Sort them by name in alphabetical order
            if (declinedCompanies.length > 0) {
                declinedCompanies.sort(function (a, b) {
                    var nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase();
                    if (nameA < nameB) //sort string ascending
                        return -1
                    if (nameA > nameB)
                        return 1
                    return 0 //default return value (no sorting)
                });
            }

            if (acceptedCompanies.length > 0) {
                acceptedCompanies.sort(function (a, b) {
                    var nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase();
                    if (nameA < nameB) //sort string ascending
                        return -1
                    if (nameA > nameB)
                        return 1
                    return 0 //default return value (no sorting)
                });
            }

            var topCompanies = [];
            var topOrder = ["Safety Specialty Insurance Company", "Trisura Specialty Insurance Company", "HDI Global Specialty SE", "Lloyds of London"] // these companies will show up at the top if they're not declined, add any new ones here

            for (var i = 0; i < topOrder.length; i++) {
                var check = acceptedCompanies.find(x => x.Name == topOrder[i]);
                if (check != null) {
                    topCompanies.push(check);
                }
            }

            var lloydsAndAxisId = 'b2248844-b57f-411e-bb54-4ad8c6698473';
            var lloydsOfLondonId = '4488e1cd-a57b-4e16-828e-cf2bc4a03186';

            // If "Lloyds of London" and "Lloyds & Axis" are both accepted, remove Lloyds
            if (acceptedCompanies.some(x => x.Id == lloydsAndAxisId) && acceptedCompanies.some(x => x.Id == lloydsOfLondonId)) {
                var pos = acceptedCompanies.map(function (e) { return e.Id; }).indexOf(lloydsOfLondonId);
                acceptedCompanies.splice(pos, 1);

                pos = topCompanies.map(function (e) { return e.Id; }).indexOf(lloydsOfLondonId);
                if (pos != -1) topCompanies.splice(pos, 1);
            }

            acceptedCompanies = acceptedCompanies.filter(function (x) {
                return !topCompanies.some(function (y) { return y.Name == x.Name; });
            });

            if (riskCompanies.length == $scope.RiskCompanies.length) {
                var customPackageRiskCompanies = customPackageService.getRiskCompanies(riskCompanies);

                customPackageRiskCompanies.forEach(customPackageRiskCompany => {
                    var customPackageId = customPackageRiskCompany ? customPackageRiskCompany.Id : null;
                    var customPackage = riskCompanies.find(function (x) { return x.Id == customPackageId; });
                    if (customPackage)
                        $scope.OrderedRiskCompanies.push(customPackage);
                });
            }
            $scope.OrderedRiskCompanies = $scope.OrderedRiskCompanies.concat(topCompanies, acceptedCompanies, declinedCompanies);
        }
    };

    $scope.isAnEndorsement = function () {
        return $scope.parent.Policy.EndorsementNumber != null;
    };

    $scope.getRiskCompany = function (riskCompanyId) {
        return $scope.RiskCompanies.find(function (x) { return x.Id == riskCompanyId; });
    };

    $scope.policyHasEquipmentBreakdown = function () {
        return $scope.Policy.CurrentVersion.Coverages.some(x => x.Name == "Equipment Breakdown");
    };

    /* CUSTOM PACKAGE */

    var eligibilityQuestions = [];
    var ratingQuestions = [];

    $scope.getCustomPackageCoverages = function (riskCompanyId) {
        return customPackageService.getCoverages(riskCompanyId);
    };

    $scope.isCustomPackage = function (riskCompanyId) {
        return customPackageService.isCustomPackage(riskCompanyId);
    };


    $scope.getCustomPackageCoverageRiskCompany = function (coverageName, riskCompanyId) {
        return customPackageService.getCoverageRiskCompany(coverageName, riskCompanyId);
    };

    $scope.getCustomPackageTotalBasePremium = function (riskCompanyId) {
        return customPackageService.getTotalBasePremium($scope.parent.Policy, riskCompanyId);
    };

    $scope.getCustomPackageCoveragePremium = function (coverageName, riskCompanyId) {
        return customPackageService.getCoveragePremium(coverageName, $scope.parent.Policy, riskCompanyId);
    };

    $scope.getCustomPackageEqbPremium = function (riskCompanyId) {
        return customPackageService.GetEquipmentBreakdownPremium($scope.parent.Policy, riskCompanyId);
    };

    $scope.showCustomPackage = function (riskCompanyId) {
        return customPackageService.exists($scope.RiskCompanies, $scope.parent.Policy, riskCompanyId);
    };

    $scope.IsCustomPackageDeclined = function (riskCompanyId) {
        return customPackageService.isDeclined($scope.parent.Policy, riskCompanyId);
    };

    $scope.IsCustomPackageCoverageDeclined = function (coverageName, riskCompanyId) {
        if (coverageName == customPackageService.getCoverages(riskCompanyId)[0].Name) {
            return customPackageService.isPropertyDeclined($scope.parent.Policy, riskCompanyId);
        }
        else if (coverageName == customPackageService.getCoverages(riskCompanyId)[1].Name) {
            return customPackageService.isLiabilityDeclined($scope.parent.Policy, riskCompanyId);
        }

        return true;
    };

    $scope.IsCustomPackageEqbCoverageDeclined = function (riskCompanyId) {
        return customPackageService.IsEquipmentBreakdownDeclined($scope.parent.Policy, riskCompanyId);
    };

    $scope.getCustomPackageEligbilityQuestions = function (riskCompanyId) {
        if (eligibilityQuestions.length == 0) {
            eligibilityQuestions = customPackageService.getEligibilityQuestions($scope.parent.Policy, riskCompanyId);
        }
        return customPackageService.getEligibilityQuestions($scope.parent.Policy, riskCompanyId);
    };

    $scope.getCustomPackageRatingQuestions = function (riskCompanyId) {
        if (ratingQuestions.length == 0) {
            ratingQuestions = customPackageService.getRatingQuestions($scope.parent.Policy, riskCompanyId);
        }
        return ratingQuestions;
    };

    $scope.getCustomPackageQuestionCount = function (riskCompanyId) {
        if (eligibilityQuestions.length == 0) {
            eligibilityQuestions = customPackageService.getEligibilityQuestions($scope.parent.Policy, riskCompanyId);
        }
        if (ratingQuestions.length == 0) {
            ratingQuestions = customPackageService.getRatingQuestions($scope.parent.Policy, riskCompanyId);
        }

        return eligibilityQuestions.length + ratingQuestions.length;
    };

    $scope.getCustomPackageRiskCompany = function (riskCompanyId) {
        return customPackageService.getRiskCompany(riskCompanyId);
    };

    $scope.getCustomPackageRiskCompanyName = function (riskCompanyId) {
        return customPackageService.getRiskCompanyName(riskCompanyId);
    };

    $scope.openCustomPackageRiskCompanyCoverage = function (riskCompanyId, coverageName, packageCompanyId) {
        var riskCompany = $scope.getRiskCompany(riskCompanyId);
        $scope.showRiskCompanyCoverage(riskCompany, coverageName, packageCompanyId);
    };

    /* END */

    $scope.openSplitPackageQuoteModal = function () {
        var modalInstance = $modal.open({
            templateUrl: 'splitPackageQuote.html',
            controller: 'test_Commercial_Lines_splitPackageQuote',
            windowClass: 'splitPackageQuoteModal',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                policyId: function () {
                    return $scope.PolicyId;
                }
            }
        });
        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
            }
        });
    };

    $scope.getRiskCompanyName = function (riskCompany) {
        if (riskCompany.Name == "International Insurance Co. of Hannover SE") return "International Hannover";
        if (riskCompany.Name == "Trisura Specialty Insurance Company") return "Trisura Specialty";
        return riskCompany.Name == "Safety Specialty Insurance Company" ? "Safety Specialty" : riskCompany.Name;
    }

    $scope.getQuestionHeader = function (riskCompanyId) {
        var riskCompany = $scope.RiskCompanies.find(function (x) { return x.Id == riskCompanyId });
        return riskCompany != null ? riskCompany.Name : "No Market Selected";
    }

    $scope.getQuestionCount = function (riskCompanyId) {
        var eligibilityQuestions = $scope.getEligibilityQuestions(riskCompanyId);
        var ratingQuestions = $scope.getRatingQuestions(riskCompanyId);
        return eligibilityQuestions.length + ratingQuestions.length;
    }

    $scope.getEligibilityQuestions = function (riskCompanyId) {
        return $scope.EligibilityQuestions.filter(function (x) {
            return x.RiskCompanyId == riskCompanyId;
        });
    }

    $scope.getRatingQuestions = function (riskCompanyId) {
        return $scope.RatingQuestions.filter(function (x) {
            return x.RiskCompanies.some(function (y) {
                return y == riskCompanyId;
            });
        });
    }

    $scope.allRiskCompaniesDeclined = function () {
        return $scope.RiskCompanies.every(function (x) {
            return $scope.isDeclined(x);
        });
    }

    $scope.allQuestionsAnswered = function (riskCompanyId) {
        if (riskCompanyId == null)
            return false;

        var questions = $scope.getEligibilityQuestions(riskCompanyId);
        questions = questions.concat($scope.getRatingQuestions(riskCompanyId));

        return questions.every(function (x) {
            return x.Answer != null && x.Answer.length > 0;
        });
    }

    $scope.canRerate = function () {
        var version = $scope.parent.Policy.CurrentVersion;
        /*feature13787: Show Rate button when IM coverage updates*/
        if (version.RequiresFormUpdate)
            return true;

        return version.RateProperty && isReviewed()
            && $scope.allQuestionsAnswered($scope.FocusedRiskCompanyId);
    }

    $scope.updateFocusedRiskCompanyId = function (riskCompanyId) {
        policyService.updateFocusedRiskCompanyId($scope.PolicyId, riskCompanyId).then(function (result) {
            if (result.data.Result.Success) {
                if ($scope.parent.canModify()) {
                    var version = $scope.parent.Policy.CurrentVersion;
                    $scope.FocusedRiskCompanyId = version.FocusedRiskCompanyId = result.data.FocusedRiskCompanyId;
                    $scope.checkForAnsweredQuestions();
                }
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.selectRiskCompany = function (riskCompany) {
        $scope.updateFocusedRiskCompanyId(riskCompany.Id);
    };

    $scope.isRiskCompanySelected = function (riskCompanyId) {
        return $scope.FocusedRiskCompanyId != null && $scope.FocusedRiskCompanyId == riskCompanyId;
    }

    $scope.checkForAnsweredQuestions = function () {
        $scope.QuestionErrors = [];

        if ($scope.Policy.Bound || $scope.getQuestionCount($scope.FocusedRiskCompanyId) == 0) { return; }

        if (!$scope.allQuestionsAnswered($scope.FocusedRiskCompanyId)) {
            $scope.QuestionErrors.push("Not all questions have been answered.");
        }
    };

    $scope.isDeclined = function (riskCompany) {
        return $scope.parent.isRiskCompanyDeclined(riskCompany.Id);
    };

    $scope.SplitIsNot100 = function (riskCompanyId) {
        if ($scope.parent.Policy.CurrentVersion.Locations != null) {
            for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Locations.length; i++) {
                for (var j = 0; j < $scope.parent.Policy.CurrentVersion.Locations[i].Properties.length; j++) {
                    var property = $scope.parent.Policy.CurrentVersion.Locations[i].Properties[j];

                    var split = 0;
                    for (var c = 0; c < property.AssignedContracts.length; c++) {
                        var contract = property.AssignedContracts[c];

                        if (contract.RiskCompanyId == riskCompanyId) {
                            split += contract.Split;
                        }
                    }

                    if (split != 100 && split != 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    $scope.riskCompanyPremium = function (riskCompany) {
        var premiums = $.grep($scope.parent.PremiumBreakdowns, function (a) {
            return a.RiskCompanyId == riskCompany.Id;
        });

        if (premiums.length > 0 && premiums[0].Premium > 0) {
            return premiums[0].Premium;
        }

        return 9999999999999999999; // <----- LOL
    }

    $scope.showRiskCompanyCoverage = function (riskCompany, name, packageCompanyId) {
        if (name == "Inland Marine") {
            $scope.openInlandMarineCoverages(riskCompany);
            return;
        }

        riskCompany.ActiveCoverage = name;

        if (name == "TRIA" || name == "Liquor Liability") return;

        var modalInstance = $modal.open({
            templateUrl: 'coveragesModel.html',
            controller: 'test_Commercial_Lines_coveragesCtrl',
            windowClass: 'eligibilityModal',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                scope: function () {
                    return $scope;
                },
                parent: function () {
                    return $scope.parent;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                riskCompany: function () {
                    return riskCompany;
                },
                packageCompanyId: function () {
                    return packageCompanyId
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                $scope.setupClassCodes();
            }
        });
    }

    $scope.updateUserConfirmation = function () {
        var policyId = $scope.PolicyId;
        var riskCompanyIds = getReviewedRiskCompanies();

        test_policyService.updateQuestionReviewConfirmation(policyId, riskCompanyIds).then(function (result) {
            if (result.data.Result.Success) {
                $scope.Policy.CurrentVersion.QuestionReviewConfirmations = result.data.QuestionReviewConfirmations;
            } else {
                $scope.Errors = result.data.Errors;
            }
        }, function (error) {
            $scope.Errors = ["An unexpected error has occurred. Please refresh the page."];
            console.log(error);
        });
    }

    $scope.checkEligibility = function () {
        if ($scope.Errors.length > 0) return;
        $scope.orderRiskCompanies();
        $scope.ratingInProgress = true;

        //$scope.HidePage = true; 

        var riskCompaniesInProgress = [];
        var ratingSession = rateService.newRatingSession($scope.Policy, $scope.RiskCompanies);

        ratingSession.onNotifyRiskCompanyRated = function (
            classCodeRatingResults,
            assignedContracts,
            assignedContractQuestions,
            forms,
            versionContractDeclines,
            versionContractDeclineOverrides,
            versionContractSubmits,
            premium,
            riskCompany) {
            riskCompaniesInProgress.push(riskCompany);
            // Locations
            $scope.Policy.CurrentVersion.Locations.forEach(location => {
                location.Properties.forEach(property => {
                    var _assignedContracts = assignedContracts.filter(x => x.PropertyId == property.Id);
                    _assignedContracts.forEach(x => {
                        property.AssignedContracts.push(x);
                    });
                });
            });

            // Class Codes
            $scope.Policy.CurrentVersion.ClassCodes.forEach(classCode => {
                var _classCodeRatingResults = classCodeRatingResults.filter(x => x.ClassCodeId == classCode.Id);
                // Class Code Rating Results
                _classCodeRatingResults.forEach(x => {
                    classCode.ClassCodeRatingResults.push(x);
                });
            });

            versionContractDeclines.forEach(x => {
                $scope.Policy.CurrentVersion.ContractDeclines.push(x);
            });
            versionContractDeclineOverrides.forEach(x => {
                $scope.Policy.CurrentVersion.ContractDeclineOverrides.push(x);
            });
            versionContractSubmits.forEach(x => {
                $scope.Policy.CurrentVersion.ContractSubmits.push(x);
            });
            $scope.Policy.CurrentVersion.Premiums.push(premium);

            // Refresh
            $scope.refreshPolicyData();
            $scope.checkForAnsweredQuestions();
            hideRiskCompaniesOnBound();
            $scope.parent.LoadingPage = false;
            $scope.HidePage = false;
            riskCompany.ratingInProgress = false;
            $scope.OrderedRiskCompanies = [];
            $scope.orderRiskCompanies();
        };

        ratingSession.onRatingBegins = function () {
            $scope.parent.LoadingPage = false;
            $scope.HidePage = false;
        };


        ratingSession.beginRating.then(function (policy) {
            $scope.parent.LoadingPage = false;
            $scope.HidePage = false;
            $scope.Policy = $scope.parent.Policy = policy;
            $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
            $scope.FocusedRiskCompanyId = $scope.parent.Policy.CurrentVersion.FocusedRiskCompanyId;
            $scope.refreshPolicyData();
            $scope.checkForAnsweredQuestions();
            hideRiskCompaniesOnBound();
            $scope.OrderedRiskCompanies = [];
            $scope.orderRiskCompanies();
            $scope.ratingInProgress = false;
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            $scope.HidePage = false;
        });
    };

    $scope.refreshPolicyData = function () {
        $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;
        $scope.parent.EligibilityQuestions = $scope.EligibilityQuestions = $scope.parent.Policy.CurrentVersion.Questions;

        $scope.hideEligibilityBtn = false;

        setRatingQuestions();

        $scope.showDetails = true;
        for (var i = 0; i < $scope.EligibilityQuestions.length; i++) {
            if ($scope.EligibilityQuestions[i].Answer == null) {
                $scope.showDetails = false;
            }
        }

        $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;
        if ($scope.PremiumBreakdowns.length > 0) {

            if ($.grep($scope.PremiumBreakdowns[0].Breakdown, function (n) { return n.Name == 'Property Premium' }).length > 0) {
                $scope.PropertyPremium = $.grep($scope.PremiumBreakdowns[0].Breakdown, function (n) { return n.Name == 'Property Premium' })[0].Amount;
                $scope.PropertyPremiumMP = $.grep($scope.PremiumBreakdowns[0].Breakdown, function (n) { return n.Name == 'Property Premium' })[0].MinimumPremium;
            }

            if ($.grep($scope.PremiumBreakdowns[0].Breakdown, function (n) { return n.Name == 'Liability Premium' }).length > 0) {
                $scope.LiabilityPremium = $.grep($scope.PremiumBreakdowns[0].Breakdown, function (n) { return n.Name == 'Liability Premium' })[0].Amount;
                $scope.LiabilityPremiumMP = $.grep($scope.PremiumBreakdowns[0].Breakdown, function (n) { return n.Name == 'Liability Premium' })[0].MinimumPremium;
            }
        }

        setRatingQuestions();

        $scope.setupClassCodes();
    }


    $scope.submitQuote = function (riskCompanyId, isRequired) {
        if (isRequired == null || typeof (isRequired) !== "boolean")
            isRequired = true;

        var modalInstance = $modal.open({
            templateUrl: 'submitQuote.html',
            controller: 'test_Commercial_Lines_submitQuoteCtrl',
            backdrop: 'static',
            resolve: {
                policy: function () {
                    return $scope.parent.Policy;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                riskCompanyId: function () {
                    return riskCompanyId;
                },
                isRequired: function () {
                    return isRequired;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                $scope.Policy.SubmitRequested = true;
            }
        });
    }


    $scope.adjustEligibility = function (eligibility) {
        for (var i = 0; i < $scope.EligibilityQuestions.length; i++) {
            if ($scope.EligibilityQuestions[i].Question == eligibility.Question) {
                $scope.EligibilityQuestions[i].Answer = eligibility.Answer;

                if ($scope.isRLI(eligibility.RiskCompanyId) && $scope.isRLI($scope.EligibilityQuestions[i].RiskCompanyId))
                    $scope.EligibilityQuestions[i].SelectedAnswer = eligibility.SelectedAnswer;
            }
        }

        $scope.checkForAnsweredQuestions();

        policyService.adjustEligibility($scope.PolicyId, $scope.EligibilityQuestions).then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy.CurrentVersion.RateProperty = true;

                $scope.showDetails = true;
                for (var i = 0; i < $scope.EligibilityQuestions.length; i++) {
                    if ($scope.EligibilityQuestions[i].Answer == null) {
                        $scope.showDetails = false;
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


    $scope.setupClassCodes = function () {
        if ($scope.parent.Policy.CurrentVersion.Locations != null) {
            for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Locations.length; i++) {
                var location = $scope.parent.Policy.CurrentVersion.Locations[i];
                location.ClassCodes = [];
                for (var j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {
                    var c = $scope.parent.Policy.CurrentVersion.ClassCodes[j];
                    if (c.LocationNumber == location.LocationNumber) {
                        location.ClassCodes.push(c);
                    }
                }
            }
        }

        for (var k = 0; k < $scope.RiskCompanies.length; k++) {
            var company = $scope.RiskCompanies[k];
            if (company.ContractId == null) {
                var comps = $.grep($scope.parent.Policy.CurrentVersion.Liability.RiskCompanyContracts, function (x) { return (x.RiskCompanyId == company.Id); });
                if (comps.length > 0) {
                    company.ContractId = comps[0].ContractId;
                }
            }

            if (company.ContractId == null) {
                company.ContractId = company.Contracts[0].Id;
            }
        }
    }

    function hideRiskCompaniesOnBound() {
        // Check if policy is bound and not issued
        var policy = $scope.Policy;
        if (!policy.Bound && !policy.Issued) return;

        // Retrieve a list of risk companies that are currently focused (at least one).
        var focusedRiskCompanyId = policy.CurrentVersion.FocusedRiskCompanyId;
        var riskCompanies = $.grep($scope.parent.RiskCompanies, function (riskCompany) { return riskCompany.Id === focusedRiskCompanyId; });

        // Replace the list used by the view with the result
        if (riskCompanies.length > 0) $scope.RiskCompanies = riskCompanies;
    }

    function setRatingQuestions() {
        $scope.RatingQuestions = [];

        for (var i = 0; i < $scope.Locations.length; i++) {
            var location = $scope.Locations[i];
            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];
                for (var k = 0; k < property.AssignedContracts.length; k++) {
                    var contract = property.AssignedContracts[k];
                    for (var q = 0; q < contract.Questions.length; q++) {
                        var question = contract.Questions[q];
                        var existingQuestion = $scope.RatingQuestions.find(function (x) { return x.Question == question.Question });

                        if (existingQuestion == null) {
                            $scope.RatingQuestions.push({
                                Question: question.Question,
                                Answer: question.UserAnswer != null ? question.UserAnswer : question.Answer,
                                AppliesTo: [question],
                                RiskCompanies: [contract.RiskCompanyId]
                            });
                        } else {
                            existingQuestion.AppliesTo.push(question);

                            var riskCompany = existingQuestion.RiskCompanies.find(function (x) { return x == contract.RiskCompanyId });
                            if (riskCompany != null) existingQuestion.RiskCompanies.push(contract.RiskCompanyId);
                        }
                    }
                }
            }
        }
    }

    $scope.adjustRating = function (rating) {
        // Apply user answer to similar assigned contract questions.
        var contractQuestions = rating.AppliesTo;

        for (var i = 0; i < contractQuestions.length; i++) {
            var question = contractQuestions[i];
            question.UserAnswer = rating.Answer;
        }

        // Use the first assigned contract question to adjust the rating.
        var ratingQuestion = contractQuestions[0];

        policyService.adjustRating($scope.PolicyId, ratingQuestion, 'Property').then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy = result.data.Policy;
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;

                //showDeclines();
                setRatingQuestions();

                $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;
                //$scope.RefreshPremium();
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.getCoveragePremiumByRiskCompanyId = function (riskCompanyId, coverageName) {
        var premiumGrep = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompanyId; });
        if (premiumGrep.length == 0) return 0;
        var breakdownGrep = $.grep(premiumGrep[0].Breakdown, function (x) { return x.Coverage == coverageName });
        if (breakdownGrep.length == 0) return 0;

        var amount = breakdownGrep[0].Amount;
        if (coverageName == "Property") {
            var equipmentBreakdownCoverages = $scope.parent.Policy.CurrentVersion.EquipmentBreakdownCoverages;

            if (equipmentBreakdownCoverages && equipmentBreakdownCoverages.length != 0) {
                var equipmentBreakdownCoverage = equipmentBreakdownCoverages.find(function (x) { return x.RiskCompanyId == riskCompanyId; });

                if (equipmentBreakdownCoverage)
                    amount = amount - equipmentBreakdownCoverage.Premium;
            }
        }

        return amount;
    }

    $scope.getCoveragePremium = function (riskCompany, coverage) {
        var premiumGrep = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompany.Id });
        if (premiumGrep.length == 0) return 0;
        var breakdownGrep = $.grep(premiumGrep[0].Breakdown, function (x) { return x.Coverage == coverage.Name });
        if (breakdownGrep.length == 0) return 0;

        var amount = breakdownGrep[0].Amount;
        if (coverage.Name == "Property") {
            var equipmentBreakdownCoverages = $scope.parent.Policy.CurrentVersion.EquipmentBreakdownCoverages;

            if (equipmentBreakdownCoverages && equipmentBreakdownCoverages.length != 0) {
                var equipmentBreakdownCoverage = equipmentBreakdownCoverages.find(function (x) { return x.RiskCompanyId == riskCompany.Id; });

                if (equipmentBreakdownCoverage)
                    amount = amount - equipmentBreakdownCoverage.Premium;
            }
        }

        return amount;
    }

    $scope.getEquipmentBreakdownPremium = function (riskCompany) {
        var equipmentBreakdownCoverages = $scope.parent.Policy.CurrentVersion.EquipmentBreakdownCoverages;

        if (equipmentBreakdownCoverages && equipmentBreakdownCoverages.length != 0) {
            var equipmentBreakdownCoverage = equipmentBreakdownCoverages.find(function (x) { return x.RiskCompanyId == riskCompany.Id; });

            if (equipmentBreakdownCoverage)
                return equipmentBreakdownCoverage.Premium;
        }

        return -1;
    }

    $scope.isPropertyDeclined = function (riskCompany, coverage) {
        var coverageFound = riskCompany.Coverages.some(function (x) { return x == coverage.Name; });

        if (coverageFound) {
            var version = $scope.parent.Policy.CurrentVersion;
            var premium = version.Premiums.find(function (x) { return x.RiskCompanyId == riskCompany.Id; })
            if (premium == undefined) return true;

            var breakdown = premium.Breakdown.find(function (x) { return x.Coverage == coverage.Name; })
            if (breakdown == undefined || breakdown.Amount <= 0) return true;

            var declines = version.ContractDeclines.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == coverage.Name; });
            var overrides = version.ContractDeclineOverrides.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == coverage.Name; });
            var declineWithOverrides = declines.filter(function (x) {
                return overrides.some(function (y) {
                    return x.ContractId == y.ContractId && x.Reason == y.Reason;
                });
            });

            if (declineWithOverrides.length < declines.length) {
                var assignedContracts = $scope.parent.getAssignedContracts(riskCompany.Id);
                if (assignedContracts.length == 0)
                    return true;
            }

            // If there are any RiskCompany Contracts that are not declined
            var riskCompanyContractsApproved = riskCompany.Contracts.filter(function (x) {
                return declines.filter(function (y) {
                    return y.RiskCompanyId == riskCompany.Id && x.Name != y.ContractName;
                });
            });
            if (riskCompanyContractsApproved !== undefined && riskCompanyContractsApproved.length == 0 && declines.length !== declineWithOverrides.length)
                return true;

        } else {
            return true;
        }

        return false;
    }

    $scope.isLiabilityDeclined = function (riskCompany, coverage) {
        if (riskCompany.ContractId == null) return true;
        var coveragesGrep = $.grep(riskCompany.Coverages, function (x) { return x == coverage.Name });
        if (coveragesGrep.length > 0) {
            if ($scope.parent.Policy == null || $scope.parent.Policy.CurrentVersion == null || $scope.parent.Policy.CurrentVersion.Premiums == null) return false;
            var premiumGrep = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompany.Id });
            if (premiumGrep.length == 0) return true;

            var breakdownGrep = $.grep(premiumGrep[0].Breakdown, function (x) { return x.Coverage == coverage.Name });
            if (breakdownGrep.length == 0) return true;
            if (breakdownGrep[0].Amount <= 0) return true;

            var contractDeclinesGrep = $.grep($scope.parent.Policy.CurrentVersion.ContractDeclines, function (x) { return x.ContractId == riskCompany.ContractId && x.CoverageId == coverage.CoverageId });
            if (contractDeclinesGrep.length > 0) {
                return true;
            }

            var version = $scope.Policy.CurrentVersion;

            for (var j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {

                var hasRateInfo = version.ClassCodes[j].ClassCodeRateInfo.find(x => x.ContractId == riskCompany.ContractId) != null;
                if (!hasRateInfo) continue;

                var classcode = $scope.parent.Policy.CurrentVersion.ClassCodes[j];
                var classCodesFound = $.grep(classcode.ClassCodeRatingResults, function (x) { return x.ContractId == riskCompany.ContractId }).length;
                var classcodeInput = $.grep(classcode.ClassCodeRatingInputs, function (x) { return x.ContractId == riskCompany.ContractId })[0];
                if (classcodeInput == null || (classCodesFound == 0 && classcodeInput.RateBy != "If Any")) {
                    var isIgnored = $.grep(classcode.ClassCodeRatingInputs, function (x) { return x.IsIgnored && x.ContractId == riskCompany.ContractId }).length > 0;
                    if (!isIgnored)
                        return true;
                }
            }
        }
        else {
            return true;
        }

        return false;
    }

    $scope.isEQBDeclined = function (riskCompany, coverage) {
        if (riskCompany.ContractId == null) return true;
        var coveragesGrep = $.grep(riskCompany.Coverages, function (x) { return x == coverage.Name });
        if (coveragesGrep.length > 0) {
            var coverage = $scope.parent.Policy.CurrentVersion.EquipmentBreakdownCoverages.find(function (x) { return x.RiskCompanyId == riskCompany.Id && x.ContractId });
            if (coverage) {
                var declines = $scope.parent.Policy.CurrentVersion.ContractDeclines.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == "Equipment Breakdown" && x.ContractId == coverage.ContractId; });
                if (declines.length > 0)
                    return true;
            }
            else {
                var declines = $scope.parent.Policy.CurrentVersion.ContractDeclines.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == "Equipment Breakdown"; });
                if (declines.length > 0)
                    return true;
            }
            return false;
        }
        else {
            return true;
        }
    }


    $scope.isLiquorLiabilityDeclined = function (riskCompany, coverage) {
        var coveragesGrep = $.grep(riskCompany.Coverages, function (x) { return x == coverage.Name });
        if (coveragesGrep.length > 0) {
            if ($scope.parent.Policy == null || $scope.parent.Policy.CurrentVersion == null || $scope.parent.Policy.CurrentVersion.Premiums == null) return false;
            var premiumGrep = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompany.Id });
            if (premiumGrep.length == 0) return true;

            var breakdownGrep = $.grep(premiumGrep[0].Breakdown, function (x) { return x.Coverage == coverage.Name });
            if (breakdownGrep.length == 0) return true;
            if (breakdownGrep[0].Amount <= 0) return true;

            var contractDeclinesGrep = $.grep($scope.parent.Policy.CurrentVersion.ContractDeclines, function (x) { return x.ContractId == riskCompany.ContractId && x.CoverageId == coverage.CoverageId });
            if (contractDeclinesGrep.length > 0) {
                return true;
            }
        }
        else {
            return true;
        }

        return false;
    }

    $scope.isInlandMarineDeclined = function (riskCompany, coverage) {

        // check if risk company covers inland marine
        if (riskCompany.Name != "RSUI Covington") return true;

        // check if there is a premium for risk company
        var premiums = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompany.Id });
        if (premiums.length == 0) return true;

        // check if a there is a breakdown for inland marine
        var breakdowns = $.grep(premiums[0].Breakdown, function (x) { return x.Coverage == coverage.Name });
        if (breakdowns.length == 0) return true;

        // check if there are any contract declines for inland marine
        var contractDeclines = $.grep($scope.parent.Policy.CurrentVersion.ContractDeclines, function (x) { return x.ContractId == riskCompany.ContractId && x.CoverageId == coverage.CoverageId });
        if (contractDeclines.length != 0) return true;

        // not declined
        return false;
    };

    $scope.openInlandMarineCoverages = function (riskCompany) {
        var modalInstance = $modal.open({
            templateUrl: "inlandMarineCoverages.html",
            controller: "test_Commercial_Lines_inlandMarineCoveragesCtrl",
            backdrop: "static",
            size: "lg",
            resolve: {
                parent: function () {
                    return $scope.parent;
                },
                riskCompany: function () {
                    return riskCompany;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != "cancel") {
                $scope.setupClassCodes();
            }
        });
    };

    $scope.isMPApplied = function (riskCompanyId) {
        // Do not apply minimum premium if the risk company is Century Surety.
        var unitedSpecialtyId = 'be7a9234-5ba5-49e5-acc0-deec3ff2ead0';
        var centurySuretyId = '48b1a26b-713f-4344-8470-5bfb9e25017c';
        if (riskCompanyId == centurySuretyId || riskCompanyId == unitedSpecialtyId) return false;

        var premiums = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompanyId });
        if (premiums.length == 0) return false;

        var breakdowns = $.grep(premiums[0].Breakdown, function (x) { return x.MinimumPremium == true || x.Amount == x.MinimumAmount });
        if (breakdowns.length == 0) return false;

        return true;
    }

    $scope.toggleIgnoreMP = function (riskCompanyId) {
        if ($scope.parent.Policy.Issued) return false;
        var premiums = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompanyId });
        if (premiums.length == 0) return false;

        policyService.toggleIgnoreMP($scope.PolicyId, riskCompanyId, !premiums[0].IgnoreMP).then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy = result.data.Policy;
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;

                setRatingQuestions();

                $scope.setupClassCodes();

                $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;

            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        });
        return true;
    }

    // Call this after the whole page is loaded.
    $rootScope.$broadcast('$pageloaded');

    $scope.checkEligibility();
}]);

MALACHIAPP.controller('test_Commercial_Lines_coveragesCtrl', ['authService', '$rootScope', '$scope', '$sce', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policyId', 'riskCompany', 'parent', 'scope', 'test_policyService', 'packageCompanyId', function (authService, $rootScope, $scope, $sce, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, $modalInstance, settings, policyService, toolsService, policyId, riskCompany, parent, scope, test_policyService, packageCompanyId) {
    $scope.PolicyId = policyId;
    $scope.riskCompany = riskCompany;
    $scope.packageCompanyId = packageCompanyId;
    $scope.Policy = parent.Policy;
    $scope.parent = parent;
    $scope.scope = scope;
    $scope.CopiedLocations = $.extend(true, [], $scope.parent.Policy.CurrentVersion.Locations);
    $scope.PotentialContracts = [];
    $scope.FirstTime = true;
    $scope.Errors = [];
    $scope.propertyContractSplit = $.inArray("Property Contract Split", authService.authentication.roles) > -1;
    $scope.canOverrideDecline = $.inArray("Decline Override", authService.authentication.roles) > -1;
    $scope.canAddContract = $.inArray("Custom Contract Authority", authService.authentication.roles) > -1;
    $scope.AdditionalCoveragePremiums = [];
    $scope.adminModOverride = $.inArray("Admin Mod Override", authService.authentication.roles) > -1;

    var contracts = riskCompany.Contracts;
    riskCompany.LiabilityContracts = [];
    for (var j = 0; j < contracts.length; j++) {
        if ($.grep(contracts[j].Coverages, function (x) { return x == "Liability"; }).length > 0) {
            riskCompany.LiabilityContracts.push(contracts[j]);
        }
    }

    showDeclines();
    setRatingQuestions();

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

    //-----
    $scope.istest = function (riskCompanyName) {
        return riskCompanyName == "test Surplus Lines" || riskCompanyName == "Illinois Union";
    };

    $scope.roundPackageGLPremium = function (ratingResults, contractId)// this is for the general liability of a package 
    {
        for (var i = 0; i < ratingResults.length; i++) {
            if (ratingResults[i].ContractId == contractId) {
                return Math.ceil((ratingResults[i].PremisesPremium / 0.9));
            }
        }
        return Math.ceil(1)
    }
	$scope.roundPackageGLFinalRate = function (ratingResults, contractId)// this is for the general liability of a package 
	{
		for (var i = 0; i < ratingResults.length; i++) {
			if (ratingResults[i].ContractId == contractId) {
				return (ratingResults[i].ExposureQuestionResults[0].PremisesCoverageRatingResult.AdjustedRate / 0.9).toFixed(3);
			}
		}
		return 1
	}
	$scope.roundPackageGLRate = function (ratingResults, contractId)// this is for the general liability of a package 
	{
		for (var i = 0; i < ratingResults.length; i++) {
			if (ratingResults[i].ContractId == contractId) {
				return (ratingResults[i].ExposureQuestionResults[0].PremisesCoverageRatingResult.Rate / 0.9).toFixed(3);
			}
		}
		return 1
	}
    $scope.isAnEndorsement = function () {
        return $scope.Policy.EndorsementNumber != null;
    };

    $scope.isLloydsOrRiskShare = function () {
        return $scope.riskCompany.Id == "4488e1cd-a57b-4e16-828e-cf2bc4a03186"
            || $scope.riskCompany.Id == "b2248844-b57f-411e-bb54-4ad8c6698473";
    }

    $scope.IsCoverageDeclined = function () {
        var version = $scope.Policy.CurrentVersion;
        var riskCompany = $scope.riskCompany;

        var coverage = version.Coverages.find(function (coverage) { return coverage.Name === riskCompany.ActiveCoverage; });
        if (coverage == undefined) return true;

        var premium = version.Premiums.find(function (premium) { return premium.RiskCompanyId === riskCompany.Id; });
        if (premium == undefined) return true;

        var breakdown = premium.Breakdown.find(function (breakdown) { return breakdown.Coverage === riskCompany.ActiveCoverage; });
        if (breakdown == undefined || breakdown.Amount <= 0) return true;

        if (riskCompany.ActiveCoverage == "Property") {
            var declines = version.ContractDeclines.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == coverage.Name; });
            var overrides = version.ContractDeclineOverrides.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == coverage.Name; });
            var declineWithOverrides = declines.filter(function (x) {
                return overrides.some(function (y) {
                    return x.ContractId == y.ContractId && x.Reason == y.Reason;
                });
            });

            if (declineWithOverrides.length < declines.length) {
                var assignedContracts = $scope.parent.getAssignedContracts(riskCompany.Id);
                if (assignedContracts.length == 0)
                    return true;
            }
        } else if (riskCompany.ActiveCoverage == "Liability") {
            if (riskCompany.ContractId == null) return true;

            var hasDeclines = version.ContractDeclines.some(function (decline) {
                return decline.ContractId === riskCompany.ContractId && decline.CoverageId === coverage.CoverageId;
            });
            if (hasDeclines) return true;

            for (var i = 0; i < version.ClassCodes.length; i++) {
                var classCode = version.ClassCodes[i];
                var classCodeResultsFound = classCode.ClassCodeRatingResults.some(function (result) { return result.ContractId === riskCompany.ContractId; });
                if (!classCodeResultsFound) {
                    var input = classCode.ClassCodeRatingInputs.find(function (input) { return input.ContractId === riskCompany.ContractId; });
                    if (input == undefined || !input.IsIgnored)
                        return true;
                    if (input.RateBy != null && input.RateBy != "If Any")
                        return true;
                }
            }
        }

        return false;
    }

    $scope.GetCoveragePremium = function () {
        var riskCompany = $scope.riskCompany;
        var isPackage = $scope.packageCompanyId;
        var premium = 0;

        switch (riskCompany.ActiveCoverage) {
            case "Property": {
                for (var i = 0; i < $scope.CopiedLocations.length; i++) {
                    var location = $scope.CopiedLocations[i];
                    for (var j = 0; j < location.Properties.length; j++) {
                        var property = location.Properties[j];
                        var contracts = property.AssignedContracts.filter(function (contract) { return contract.RiskCompanyId === riskCompany.Id && contract.Final; });
                        for (var k = 0; k < contracts.length; k++) {
                            var contract = contracts[k];
                            premium += contract.Premium;
                        }
                    }
                }
                break;
            }
            case "Liability": {
                var classCodes = $scope.Policy.CurrentVersion.ClassCodes;
                for (var i = 0; i < classCodes.length; i++) {
                    var classCode = classCodes[i];

                    if (classCode.LocationId != null) {
                        var location = $scope.CopiedLocations.find(function (location) { return location.Id === classCode.LocationId; });
                        var locationClassCode = location.ClassCodes.find(function (locationClassCode) { return locationClassCode.Id === classCode.Id; });
                        classCode = locationClassCode;
                    }

                    var input = classCode.ClassCodeRatingInputs.find(function (input) { return input.ContractId === riskCompany.ContractId; });
                    if (input.RateBy == null) continue;

                    if (input.RateBy != "If Any") {
                        var result = classCode.ClassCodeRatingResults.find(function (result) { return result.ContractId === riskCompany.ContractId; });

                        result.AdditionalQuestionResults.forEach(exposure => {
                            premium += exposure.Premium;
                        });

                        result.ExposureQuestionResults.forEach(exposure => {
                            if (exposure.PremisesCoverageRatingResult != null)
                                premium += exposure.PremisesCoverageRatingResult.Premium;
                            if (exposure.ProductsCoverageRatingResult != null)
                                premium += exposure.ProductsCoverageRatingResult.Premium;
                        });
                    }
                }
                if (isPackage != null) {
                    premium = Math.ceil(premium / 0.9);
                }
                break;
            }
            default:
                break;
        }

        return premium;
    }

    //-----

    $scope.IsPropertyLimit = function (limitName) {
        return (limitName == 'Building' ||
            limitName == 'BPP & Content' ||
            limitName == 'IMP/BETT' ||
            limitName == 'Business Income' ||
            limitName == 'Existing Structure' ||
            limitName == 'New Work Limit' ||
            $scope.additionalStructures.includes(limitName));
    }

    $scope.setupContracts = function () {
        for (var i = 0; i < $scope.CopiedLocations.length; i++) {
            var location = $scope.CopiedLocations[i];

            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];

                for (var c = 0; c < property.AssignedContracts.length; c++) {
                    var contract = property.AssignedContracts[c];

                    for (var k = 0; k < contract.Limits.length; k++) {
                        var l = contract.Limits[k];

                        if (!l.FinalRate)
                            l.FinalRate = "";
                        if (property.IsWindOnly)
                            contract.IsWindOnly = true;

                        if ($scope.IsPropertyLimit(l.LimitName)) {
                            contract.FinalRate = l.FinalRate;
                        }
                        else {
                            var additionalCoveragePremium = {
                                'LocationId': location.Id,
                                'PropertyId': property.Id,
                                'ContractName': contract.ContractName,
                                'LimitName': l.LimitName,
                                'DevelopedPremium': contract.Split != 0 ? l.DevelopedPremium * (100 / contract.Split) : l.DevelopedPremium
                            };

                            $scope.AdditionalCoveragePremiums.push(additionalCoveragePremium);
                        }
                    }
                }
            }
        }
    };
    $scope.setupContracts();

    $scope.createAddedAssignedContract = function (data) {
        var selectedContract = data.SelectedContract;
        var split = data.Split;

        var templateAddedAssignedContract = {
            ContractId: selectedContract.Id,
            RiskCompanyId: $scope.riskCompany.Id,
            Split: split,
            Premium: 0,
            DevelopedPremium: 0,
            ContractName: selectedContract.Name,
            InsurerName: selectedContract.InsurerName,
            IsWindOnly: false,
            IsUserEntered: true,
            CustomContract: true,
            Final: true
        };

        var locations = $scope.CopiedLocations;
        for (var i = 0; i < locations.length; i++) {
            var properties = locations[i].Properties;
            for (var j = 0; j < properties.length; j++) {
                var property = properties[j];
                var existingContracts = $.grep(property.AssignedContracts, function (x) { return x.ContractName == selectedContract.Name; });
                var addedAssignedContract = $.extend(true, {}, templateAddedAssignedContract);

                addedAssignedContract.PropertyId = properties[j].Id;
                addedAssignedContract.Limits = [];
                addedAssignedContract.IsWindOnly = property.IsWindOnly;

                for (var k = 0; k < property.Limits.length; k++) {
                    var limit = property.Limits[k];
                    if (isNaN(parseFloat(limit.Amount)) || parseFloat(limit.Amount) == 0) continue;

                    var addedLimit = {
                        Index: limit.Index,
                        LimitName: limit.LimitName,
                        Amount: parseFloat(limit.Amount) * (parseInt(split) / 100),
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = existingContract.Limits.find(function (x) { return x.LimitName == addedLimit.LimitName });

                        if (existingLimit) {
                            addedLimit.DevelopedRate = existingLimit.DevelopedRate;
                            addedLimit.DevelopedWindLoad = existingLimit.DevelopedWindLoad;

                            if (existingLimit.DevelopedRate || (addedAssignedContract.IsWindOnly && existingLimit.DevelopedWindLoad))
                                addedAssignedContract.CustomContract = false;
                        }
                    };

                    addedAssignedContract.Limits.push(addedLimit);
                }

                var index = 4;

                if (property.OrdinanceAndLawCoverageA != "Excluded") {
                    var amountA = parseFloat(property.OrdinanceAndLawCoverageA.replace(",", ""));

                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Ordinance And Law Coverage A",
                        Amount: amountA * (parseInt(split) / 100),
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = existingContract.Limits.find(function (x) { return x.LimitName == addedAdditionalLimit.LimitName });
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                if (property.OrdinanceAndLawCoverageB != "Excluded") {
                    var amountB = parseFloat(property.OrdinanceAndLawCoverageB.replace(",", ""));

                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Ordinance And Law Coverage B",
                        Amount: amountB * (parseInt(split) / 100),
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                if (property.OrdinanceAndLawCoverageC != "Excluded") {
                    var amountC = parseFloat(property.OrdinanceAndLawCoverageC.replace(",", ""));

                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Ordinance And Law Coverage C",
                        Amount: amountC * (parseInt(split) / 100),
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                // Ordinance & Law Coverage B&C
                if (property.OrdinanceAndLawCoverageBAndC != "Excluded") {
                    var amountBAndC = parseFloat(property.OrdinanceAndLawCoverageBAndC.replace(",", ""));

                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Ordinance And Law Coverage B&C",
                        Amount: amountBAndC * (parseInt(split) / 100),
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                if (property.ExtensionEndorsementLimit) {
                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: property.ExtensionEndorsementLimit,
                        Amount: null,
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                $scope.calculateLimitAmounts(addedAssignedContract, property, locations[i]);
                for (var k = 0; k < addedAssignedContract.Limits.length; k++)
                    $scope.calculateLimitRate(addedAssignedContract.Limits[k], addedAssignedContract);

                property.AssignedContracts.push(addedAssignedContract);
                $scope.openLimits(property, addedAssignedContract);
            }
        }
    };

    $scope.clearWindLoads = function (contract) {

        if (contract.WindIncludedInRate) {
            for (var i = 0; i < contract.Limits.length; i++) {
                var limit = contract.Limits[i];

                limit.DevelopedWindLoad = null;
                $scope.calculateLimitRate(limit, contract);
            }
        }
    };

    $scope.openAddContractModal = function (contracts) {
        if ($scope.PotentialContracts.length == 0) {
            $scope.Errors = [];

            $scope.Errors.push("No contracts to add for this market.");
            return;
        }

        var modalInstance = $modal.open({
            templateUrl: "addContract.html",
            controller: "test_Commercial_Lines_addContract",
            size: "md",
            backdrop: "static",
            resolve: {
                parent: function () {
                    return $scope.parent;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                riskCompany: function () {
                    return $scope.riskCompany;
                },
                contracts: function () {
                    return contracts;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != "cancel") {
                $scope.createAddedAssignedContract(data);

                for (var i = 0; i < $scope.PotentialContracts.length; i++) {
                    var potentialContract = $scope.PotentialContracts[i];

                    if (data.SelectedContract.Id == potentialContract.Id) {
                        $scope.PotentialContracts.splice(i, 1);
                        break;
                    }
                }
            }
        });
    };

    $scope.addContract = function () {
        if ($scope.PotentialContracts.length == 0 && $scope.FirstTime) {
            Metronic.blockUI({ target: ".modal-dialog", animate: true, overlayColor: "none" });

            var found = false;
            var firstPropertyId;
            for (var i = 0; i < $scope.CopiedLocations.length; i++) {
                var location = $scope.CopiedLocations[i];

                for (var j = 0; j < location.Properties.length; j++) {
                    var property = location.Properties[j];

                    firstPropertyId = property.Id;
                    found = true;
                    break;
                }

                if (found)
                    break;
            }
            var policyEffective = $scope.Policy.CurrentVersion.Effective;

            test_policyService.getPropertyContractsByRiskCompany($scope.parent.AppId, firstPropertyId, $scope.riskCompany.Id, policyEffective).then(function (result) {
                Metronic.unblockUI(".modal-dialog");

                if (result.data.Result.Success) {
                    $scope.PotentialContracts = result.data.Contracts;

                    $scope.FirstTime = false;
                    $scope.openAddContractModal(result.data.Contracts);
                } else {
                    console.log(result.data.Result.Errors);
                }
            }, function (error) {
                Metronic.unblockUI(".modal-dialog");

                console.log(error);
            });
        }
        else {
            $scope.openAddContractModal($scope.PotentialContracts);
        }
    };

    $scope.checkIfValidFinalRate = function (limit) {
        if (!limit.FinalRate)
            return;

        limit.FinalRate = limit.FinalRate.toString();
        var index = limit.FinalRate.indexOf('.');

        if (index == -1)
            return;
        else {
            var digits = limit.FinalRate.length - (index + 1);

            if (digits > 6) {
                limit.FinalRate = limit.FinalRate.slice(0, index + 6);
            }
        }

    };

    $scope.creditDebit = function () {
        var modalInstance = $modal.open({
            templateUrl: "test_Commercial_Lines_creditDebit.html",
            controller: "test_Commercial_Lines_creditDebit",
            size: "md",
            backdrop: "static",
            resolve: {
                parent: function () {
                    return $scope.parent;
                },
                policyId: function () {
                    return $scope.PolicyId;
                },
                riskCompany: function () {
                    return $scope.riskCompany;
                },
                locations: function () {
                    return $scope.CopiedLocations;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != "cancel") {

                for (var i = 0; i < $scope.CopiedLocations.length; i++) {
                    var location = $scope.CopiedLocations[i];

                    for (var j = 0; j < location.Properties.length; j++) {
                        var property = location.Properties[j];

                        if (data.SelectedProperties.indexOf(property.Id) > -1) {
                            for (var c = 0; c < property.AssignedContracts.length; c++) {
                                var contract = property.AssignedContracts[c];

                                for (var k = 0; k < contract.Limits.length; k++) {
                                    var l = contract.Limits[k];

                                    if ($scope.IsPropertyLimit(l.LimitName)) {
                                        if (l.DevelopedFinalRate > 0) {
                                            if (data.RateType == "Override") {
                                                l.FinalRate = data.Rate;
                                                contract.FinalRate = l.FinalRate;
                                            } else {
                                                l.FinalRate = l.DevelopedFinalRate * data.Mod;
                                                contract.FinalRate = l.FinalRate;
                                            }

                                            $scope.calculateLimitRate(l, contract);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    $scope.calculateLimitAmounts = function (contract, property, location, notUserChange) {
        if (!contract.Split) contract.Split = "";

        if (!notUserChange) {
            for (var i = 0; i < $scope.CopiedLocations.length; i++) {
                var _location = $scope.CopiedLocations[i];

                for (var j = 0; j < _location.Properties.length; j++) {
                    var _property = _location.Properties[j];

                    var _contracts = $.grep(_property.AssignedContracts,
                        function (x) { return x.ContractName == contract.ContractName; });
                    $.each(_contracts, function (index, x) { x.Split = contract.Split; $scope.calculateLimitAmounts(x, _property, _location, true); });
                }
            }
        }

        for (var i = 0; i < contract.Limits.length; i++) {
            var limit = contract.Limits[i];

            var propertyLimits = $.grep(property.Limits, function (x) { return x.LimitName == limit.LimitName; });
            if (propertyLimits.length == 0) {
                if ($scope.getAdditionalCoveragePremium(location, property, contract, limit)) {
                    limit.DevelopedPremium = $scope.getAdditionalCoveragePremium(location, property, contract, limit) * (parseInt(contract.Split) / 100);
                    limit.AdditionalDevelopedPremium = $scope.getAdditionalCoveragePremium(location, property, contract, limit);
                }

                if (limit.LimitName == "Ordinance And Law Coverage A") {
                    var amountA = parseFloat(property.OrdinanceAndLawCoverageA.replace(",", ""));
                    limit.Amount = amountA * (parseInt(contract.Split) / 100);
                }
                else if (limit.LimitName == "Ordinance And Law Coverage B") {
                    var amountB = parseFloat(property.OrdinanceAndLawCoverageB.replace(",", ""));
                    limit.Amount = amountB * (parseInt(contract.Split) / 100);
                }
                else if (limit.LimitName == "Ordinance And Law Coverage C") {
                    var amountC = parseFloat(property.OrdinanceAndLawCoverageC.replace(",", ""));
                    limit.Amount = amountC * (parseInt(contract.Split) / 100);
                }
                else if (limit.LimitName == "Ordinance And Law Coverage B&C") {
                    var amountBAndC = parseFloat(property.OrdinanceAndLawCoverageBAndC.replace(",", ""));
                    limit.Amount = amountBAndC * (parseInt(contract.Split) / 100);
                }
                else if (limit.LimitName.includes("Coverage Extension Endorsement")) {
                    limit.Amount = null;
                }
                else if (limit.LimitName.includes("Spoilage Coverage")) {
                    var spoilageAmount = parseFloat(property.SpoilageCoverageLimit.replace(",", ""));
                    limit.Amount = spoilageAmount * (parseInt(contract.Split) / 100);
                }
            }
            else {
                var propertyLimit = propertyLimits[0];
                limit.Amount = parseFloat(propertyLimit.Amount) * (parseInt(contract.Split) / 100);
            }

            $scope.calculateLimitRate(limit, contract);
        }
    }

    $scope.getAdditionalCoveragePremium = function (location, property, contract, limit) {
        var premium = $scope.AdditionalCoveragePremiums.find(function (x) {
            return location.Id == x.LocationId &&
                property.Id == x.PropertyId &&
                contract.ContractName == x.ContractName &&
                limit.LimitName == x.LimitName;
        });

        return premium ? premium.DevelopedPremium : 0;
    }

    $scope.isAdditionalCoverage = function (limit) {
        if (limit.LimitName.includes("Ordinance And Law") || limit.LimitName.includes("Coverage Extension Endorsement") || limit.LimitName.includes("Spoilage Coverage"))
            return true;

        return false;
    };

    $scope.isAnyLimitMP = function (contract) {
        for (var i = 0; i < contract.Limits.length; i++) {
            var contractLimit = contract.Limits[i];

            if (contractLimit.IsMinimumPremium) return true;
        }
        return false;
    }

    $scope.calculateLimitRate = function (limit, contract) {
        $scope.checkIfValidFinalRate(limit);

        if (limit.DevelopedRate > 0 || contract.WindExclusive) {
            if (!limit.DevelopedRate)
                limit.DevelopedRate = 0;
            if (!limit.DevelopedWindLoad)
                limit.DevelopedFinalRate = Math.round(10000 * (parseFloat(limit.DevelopedRate))) / 10000;
            else if (isNaN(parseFloat(limit.DevelopedWindLoad)) || limit.DevelopedWindLoad < 0)
                limit.DevelopedFinalRate = 0;
            else
                limit.DevelopedFinalRate = Math.round(10000 * (parseFloat(limit.DevelopedRate) + parseFloat(limit.DevelopedWindLoad))) / 10000;
        }
        else if (limit.DevelopedWindLoad > 0 && contract.IsWindOnly) {
            if (isNaN(parseFloat(limit.DevelopedWindLoad)) || limit.DevelopedWindLoad < 0)
                limit.DevelopedFinalRate = 0;
            else
                limit.DevelopedFinalRate = Math.round(10000 * parseFloat(limit.DevelopedWindLoad)) / 10000;
        }
        else {
            limit.DevelopedFinalRate = 0;
        }

        if (limit.FinalRate > 0) {
            var developedPremium = limit.FinalRate * limit.Amount / 100;
            if (developedPremium < 1 && developedPremium > 0 && limit.Amount)
                developedPremium = 1;

            limit.DevelopedPremium = Math.round(developedPremium);
        }
        else if (limit.DevelopedFinalRate > 0) {
            var developedPremium = limit.DevelopedFinalRate * limit.Amount / 100;
            if (developedPremium < 1 && developedPremium > 0 && limit.Amount)
                developedPremium = 1;

            limit.DevelopedPremium = Math.round(developedPremium);
        }
        else if (!$scope.isAdditionalCoverage(limit)) {
            limit.DevelopedPremium = 0;
        }

        contract.Premium = 0;
        for (var i = 0; i < contract.Limits.length; i++) {
            var contractLimit = contract.Limits[i];

            if (contractLimit.Premium > 0)
                contract.Premium += parseFloat(contractLimit.Premium);
            else
                contract.Premium += parseFloat(contractLimit.DevelopedPremium);
        }

        contract.FinalRate = limit.FinalRate;
    };

    var validateContracts = function () {
        $scope.Errors = [];

        var coverages = $scope.Policy.CurrentVersion.Coverages;
        if (coverages.some(x => x.Name == "Homeowners") && $scope.riskCompany.ActiveCoverage == "Homeowners") {
            var splitSums = $scope.CopiedLocations.flatMap(x => x.Properties).flatMap(x => {
                var windExclusiveSplit = x.AssignedContracts.filter(y => y.RiskCompanyId == riskCompany.Id && y.Final && y.WindExclusive).reduce((y, z) => y + parseInt(z.Split), 0);
                var nonWindExclusiveSplit = x.AssignedContracts.filter(y => y.RiskCompanyId == riskCompany.Id && y.Final && y.WindExclusive).reduce((y, z) => y + parseInt(z.Split), 0);
                return [windExclusiveSplit, nonWindExclusiveSplit];
            })

            if (splitSums.some(x => x != 100 && x != 0)) {
                $scope.Errors.push("The sum of the splits for a building must be 100%");
                return;
            }
        }

        var assignedContracts = $scope.CopiedLocations.flatMap(x => x.Properties).flatMap(x => x.AssignedContracts).filter(x => x.RiskCompanyId == riskCompany.Id);
        for (var i = 0; i < assignedContracts.length; i++) {
            var addedAssignedContract = assignedContracts[i];
            if (!addedAssignedContract.Final) continue;
            if (addedAssignedContract.Split == 0) continue;

            if (!addedAssignedContract.Split || isNaN(parseInt(addedAssignedContract.Split)) || addedAssignedContract.Split < 0) {
                $scope.Errors.push("Split for " + addedAssignedContract.InsurerName + " is not valid.");
            }

            for (var j = 0; j < addedAssignedContract.Limits.length; j++) {
                var contractLimit = addedAssignedContract.Limits[j];

                if ($scope.isAdditionalCoverage(contractLimit)) {
                    if (addedAssignedContract.IsUserEntered && (!contractLimit.DevelopedPremium || isNaN(parseFloat(contractLimit.DevelopedPremium)) || contractLimit.DevelopedPremium <= 0)
                        && (!contractLimit.Premium || isNaN(parseFloat(contractLimit.Premium)) || contractLimit.Premium <= 0)) {
                        $scope.Errors.push("Limit " + contractLimit.LimitName + " for " + addedAssignedContract.InsurerName + " must have a valid overriden premium.");
                    }
                    continue;
                }

                if (!contractLimit.Amount || isNaN(parseFloat(contractLimit.Amount)) || contractLimit.Amount <= 0) continue;

                if (contractLimit.DevelopedRate && (isNaN(parseFloat(contractLimit.DevelopedRate)) || contractLimit.DevelopedRate <= 0)) {
                    $scope.Errors.push("Limit " + contractLimit.LimitName + " for " + addedAssignedContract.InsurerName + " must have a valid rate if entered.");
                }

                if (contractLimit.DevelopedWindLoad) {
                    if (isNaN(parseFloat(contractLimit.DevelopedWindLoad)) || contractLimit.DevelopedWindLoad <= 0) {
                        $scope.Errors.push("Limit " + contractLimit.LimitName + " for " + addedAssignedContract.InsurerName + " must have a valid wind load if entered.");
                    }
                    if ((!addedAssignedContract.IsWindOnly && !addedAssignedContract.WindExclusive) && (!contractLimit.DevelopedRate || isNaN(parseFloat(contractLimit.DevelopedRate) || contractLimit.DevelopedRate <= 0))) {
                        $scope.Errors.push("Limit " + contractLimit.LimitName + " for " + addedAssignedContract.InsurerName + " must have a valid rate if wind load is entered.");
                    }
                }

                if (contractLimit.FinalRate && (isNaN(parseFloat(contractLimit.FinalRate)) || contractLimit.FinalRate <= 0)) {
                    $scope.Errors.push("Limit " + contractLimit.LimitName + " for " + addedAssignedContract.InsurerName + " must have a valid overriden final rate if entered.");
                }

                if (!contractLimit.DevelopedFinalRate || isNaN(parseFloat(contractLimit.DevelopedFinalRate)) || contractLimit.DevelopedFinalRate <= 0) {
                    if (!contractLimit.FinalRate || isNaN(parseFloat(contractLimit.FinalRate)) || contractLimit.FinalRate <= 0) {
                        $scope.Errors.push("Limit " + contractLimit.LimitName + " for " + addedAssignedContract.InsurerName + " must have a valid final rate.");
                    }
                }

                if (contractLimit.Premium && (isNaN(parseFloat(contractLimit.Premium)) || contractLimit.Premium <= 0)) {
                    $scope.Errors.push("Limit " + contractLimit.LimitName + " for " + addedAssignedContract.InsurerName + " must have a valid overriden premium if entered.");
                }

                if (!contractLimit.DevelopedPremium || isNaN(parseFloat(contractLimit.DevelopedPremium)) || contractLimit.DevelopedPremium <= 0) {
                    if (!contractLimit.Premium || isNaN(parseFloat(contractLimit.Premium)) || contractLimit.Premium <= 0) {
                        $scope.Errors.push("Limit " + contractLimit.LimitName + " for " + addedAssignedContract.InsurerName + " must have a valid premium.");
                    }
                }
            }
        }
    };

    $scope.save = function (coverage) {
        if (coverage == "Property")
            $scope.PerformChecks();
        else if (coverage == "Liability")
            $scope.saveLiability();
    };

    $scope.openCreditAccountabilityModal = function () {
        var existingEntry = $scope.Policy
            .CurrentVersion.PolicyVersionCreditEntries
            .find(function (x) { return x.VersionId == $scope.Policy.CurrentVersion.Id && x.RiskCompanyId == $scope.riskCompany.Id && x.CoverageId == '091d16de-2891-4050-9d6f-1be4cf008d2a' });
        var modalInstance = $modal.open({
            templateUrl: "test_Commercial_Lines_creditAccountability.html",
            controller: "test_Commercial_Lines_creditAccountability",
            size: "md",
            backdrop: "static",
            resolve: {
                policyId: function () {
                    return $scope.PolicyId;
                },
                versionId: function () {
                    return $scope.Policy.CurrentVersion.Id;
                },
                riskCompany: function () {
                    return $scope.riskCompany;
                },
                creditEntry: function () {
                    return existingEntry;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != "cancel") {

                var entries = $scope.Policy.CurrentVersion.PolicyVersionCreditEntries;
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];

                    if (entry.Id == data.Id) {
                        entries[i] = data;
                        $scope.saveProperty($scope.aggregateAssignedContracts($scope.riskCompany.Id));

                        return;
                    }
                }

                entries.push(data);
                $scope.saveProperty($scope.aggregateAssignedContracts($scope.riskCompany.Id));
            }
        });
    };

    $scope.aggregateAssignedContracts = function (riskCompanyId) {
        var updatedAssignedContracts = [];
        for (var i = 0; i < $scope.CopiedLocations.length; i++) {
            var location = $scope.CopiedLocations[i];

            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];

                updatedAssignedContracts = updatedAssignedContracts.concat($.grep(property.AssignedContracts, function (contract) { return contract.RiskCompanyId == riskCompanyId; }));
            }
        }

        return updatedAssignedContracts;
    };

    $scope.IsCreditApplied = function (assignedContracts) {
        for (var i = 0; i < assignedContracts.length; i++) {
            var assignedContract = assignedContracts[i];

      for (var j = 0; j < assignedContract.Limits.length; j++) {
        var limit = assignedContract.Limits[j];
        if (limit.Amount <= 0) continue;
        if (limit.FinalRate && limit.FinalRate < limit.DevelopedFinalRate) {
          return true;
        }
        if (limit.Premium && limit.Premium < limit.DevelopedPremium) {
          return true;
        }
      }
    }
    return false;
  };

    $scope.PerformChecks = function () {
        validateContracts();
        if ($scope.Errors.length != 0) return;

        var updatedAssignedContracts = $scope.aggregateAssignedContracts($scope.riskCompany.Id);

        if ($scope.IsCreditApplied(updatedAssignedContracts)) {
            if ($scope.adminModOverride || $scope.riskCompany.AllowPropertyCredit) {
                $scope.openCreditAccountabilityModal();
            } else {
                $scope.Errors.push(`${$scope.riskCompany.Name} does not allow a property credit.`);
            }
            return;
        }

        $scope.saveProperty(updatedAssignedContracts);
    };

    $scope.saveProperty = function (updatedAssignedContracts) {
        Metronic.blockUI({ target: ".modal-dialog", animate: true, overlayColor: "none" });
        test_policyService.updateAssignedContracts($scope.Policy.Id, updatedAssignedContracts).then(function (result) {
            Metronic.unblockUI(".modal-dialog");
            if (result.data.Result.Success) {
                $scope.parent.Policy = result.data.Policy;
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];

                $scope.Policy = $scope.parent.Policy;
                $scope.CopiedLocations = $.extend(true, [], $scope.parent.Policy.CurrentVersion.Locations);

                $scope.setupClassCodes();
                notificationsHub.showSuccess("Contract(s) updated successfully!");

                $modalInstance.dismiss("cancel");
            }
            else {
                $scope.Errors = result.data.Result.Errors;
                console.log(result.data.Result.Errors);
            }
        }, function (error) {
            Metronic.unblockUI(".modal-dialog");
            console.log(error);
        });
    };

    $scope.saveLiability = function () {
        var classCodeRatingInputs = [];
        var contractIds = [];

        for (var i = 0; i < $scope.CopiedLocations.length; i++) {
            var location = $scope.CopiedLocations[i];

            for (var j = 0; j < location.ClassCodes.length; j++) {
                var classCode = location.ClassCodes[j];
                var classCodeInput = classCode.ClassCodeRatingInputs.find(function (x) { return x.ContractId == $scope.riskCompany.ContractId; });
                if (classCodeInput) {
                    if (!$scope.adminModOverride && !$scope.riskCompany.AllowLiabilityCredit) {
                        if (classCodeInput.IsUserEnteredMinimumPremium) {
                            var result = classCode.ClassCodeRatingResults.find(function (x) {
                                return x.ContractId == $scope.riskCompany.ContractId;
                            });
                            if (classCodeInput.UserEnteredMinimumPremium < result.TotalDevelopedPremium) {
                                $scope.Errors.push(`${$scope.riskCompany.Name} does not allow a liability credit.`);
                                return;
                            }
                        } else if (classCodeInput.PremisesDiscretionaryModifier < 1) {
                            $scope.Errors.push(`${$scope.riskCompany.Name} does not allow a liability credit.`);
                            return;
                        }
                    }
                    classCodeRatingInputs.push(classCodeInput);
                }
            }
        }

        // TODO: Temporary fix!!
        var ais = $.grep($scope.parent.Policy.CurrentVersion.ClassCodes, function (x) { return x.Number == '49950' || x.Number == '99999'; });
        for (var i = 0; i < ais.length; i++) {
            var ai = ais[i];
            var classCodeInput = ai.ClassCodeRatingInputs.find(function (x) { return x.ContractId == $scope.riskCompany.ContractId; });

            if (classCodeInput)
                classCodeRatingInputs.push(classCodeInput);
        }
        // TODO

        for (var i = 0; i < $scope.parent.RiskCompanies.length; i++) {
            var riskCompany = $scope.parent.RiskCompanies[i];
            if (riskCompany.LiabilityContracts) {
                var ids = $.map(riskCompany.LiabilityContracts, function (x) { return x.Id; });
                contractIds = contractIds.concat(ids);
            }
            else {
                contractIds.push(riskCompany.ContractId);
            }
        }

        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.rateClassCodeInputs($scope.parent.Policy, classCodeRatingInputs, contractIds).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                $scope.parent.Policy = result.data.Policy;
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                $scope.setupClassCodes();

                $scope.CopiedLocations = $.extend(true, [], $scope.parent.Policy.CurrentVersion.Locations);
                notificationsHub.showSuccess("Liability updated successfully!");
                $modalInstance.dismiss("cancel");
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    };

    $scope.setupClassCodes = function () {
        if ($scope.Policy.CurrentVersion.Locations != null) {
            for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                var location = $scope.Policy.CurrentVersion.Locations[i];
                location.ClassCodes = [];
                for (var j = 0; j < $scope.Policy.CurrentVersion.ClassCodes.length; j++) {
                    var c = $scope.Policy.CurrentVersion.ClassCodes[j];
                    if (c.LocationNumber == location.LocationNumber) {
                        location.ClassCodes.push(c);
                    }
                }
            }
        }
    }

    $scope.close = function () {
        $modalInstance.dismiss("cancel");
    };

    $scope.getNonWindExclusiveAssignedContracts = function (assignedContracts, riskCompanyId) {
        return assignedContracts.filter(x => {
            return x.Final && x.RiskCompanyId == riskCompanyId && !x.WindExclusive;
        });
    };

    $scope.hasNonWindExclusiveAssignedContracts = function (assignedContracts, riskCompanyId) {
        return $scope.getNonWindExclusiveAssignedContracts(assignedContracts, riskCompanyId).length > 0;
    };

    $scope.getWindExclusiveAssignedContracts = function (assignedContracts, riskCompanyId) {
        return assignedContracts.filter(x => {
            return x.Final && x.RiskCompanyId == riskCompanyId && x.WindExclusive;
        });
    };

    $scope.hasWindExclusiveAssignedContracts = function (assignedContracts, riskCompanyId) {
        return $scope.getWindExclusiveAssignedContracts(assignedContracts, riskCompanyId).length > 0;
    };

    /* DISABLE ADDING CONTRACTS IF WIND EXCLUSIVE CONTRACTS */
    if ($scope.canAddContract) {
        var assignedContracts = $scope.CopiedLocations.flatMap(x => x.Properties).flatMap(x => x.AssignedContracts);
        if (assignedContracts.filter(x => x.RiskCompanyId == riskCompany.Id && x.Final).some(x => x.WindExclusive))
            $scope.canAddContract = false;
    }

    $scope.openLimits = function (property, contract) {
        var openLimitsContracts = $.grep(property.AssignedContracts, function (assignedContract) { return assignedContract.showLimits && assignedContract.Id != contract.Id; });
        $.each(openLimitsContracts, function (index, openLimitsContract) { openLimitsContract.showLimits = false; });

        contract.showLimits = !contract.showLimits;
    };

    $scope.updateClassCodeInput = function (classCodeRatingInput, classCodeRatingResult, riskCompany) {
        if (riskCompany.Id == 'be7a9234-5ba5-49e5-acc0-deec3ff2ead0' || riskCompany.Id == '48b1a26b-713f-4344-8470-5bfb9e25017c')
            return;

        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.rateClassCodeInput($scope.parent.Policy, classCodeRatingInput, riskCompany.ContractId).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                classCodeRatingResult = result.data.ClassCodeRatingResult;
                $scope.Policy.Versions = result.data.Policy.Versions;
                $scope.Policy.CurrentVersion = $scope.Policy.Versions[0];
                $scope.setupClassCodes();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.updateFields = function (classcode, riskCompany, type) {
        if (!type) type = "Premises";
        classcode["Has" + type + "UserInput"] = true;

        var info = classcode.ClassCodeRateInfo.find(function (x) { return x.ContractId == riskCompany.ContractId; });
        var input = classcode.ClassCodeRatingInputs.find(function (x) { return x.ContractId == riskCompany.ContractId; });
        var result = classcode.ClassCodeRatingResults.find(function (x) { return x.ContractId == riskCompany.ContractId; });

        var rate = result.ExposureQuestionResults[0][type + "CoverageRatingResult"].Rate;
        var modFactor = input[type + "DiscretionaryModifier"];
        var exposureAnswer = 0;
        var rateBasis = 0;

        var field = type == "Premises" ? "PremisesExposureGroups" : "ProductExposureGroups";
        if (info.CanRateByISO && input.RateBy == "ISO") {
            var exposureInput = input.IsoRatingInput.ExposureAnswers.find(function (x) { return x.Answer != null; });
            var exposureInfo = info.IsoRateInfo.PremisesExposureGroups[0].Exposures.find(function (x) { return x.QuestionID == exposureInput.QuestionID; });

            exposureAnswer = exposureInput.Answer;
            rateBasis = exposureInfo.RateBasis;
        }
        else if (info.CanRateByCompany && input.RateBy == "Company") {
            var exposureInput = input.CompanyRatingInput.ExposureAnswers.find(function (x) { return x.Answer != null; });
            var exposureInfo = info.CompanyRateInfo.PremisesExposureGroups[0].Exposures.find(function (x) { return x.QuestionID == exposureInput.QuestionID; });

            exposureAnswer = exposureInput.Answer;
            rateBasis = exposureInfo.RateBasis;
        }

        var finalRate = rate * modFactor;
        var calculatedPremium = finalRate * exposureAnswer / rateBasis;

        result.ExposureQuestionResults[0][type + "CoverageRatingResult"].AdjustedRate = Math.round(1000 * finalRate) / 1000;
        result[type + "Premium"] = Math.round(calculatedPremium);
    };

    $scope.setupClassCodes = function () {
        for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Locations.length; i++) {
            var location = $scope.parent.Policy.CurrentVersion.Locations[i];
            location.ClassCodes = [];
            for (var j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {
                var c = $scope.parent.Policy.CurrentVersion.ClassCodes[j];
                if (c.LocationNumber == location.LocationNumber) {
                    location.ClassCodes.push(c);
                }
            }
        }

        for (var k = 0; k < $scope.parent.RiskCompanies.length; k++) {
            var company = $scope.parent.RiskCompanies[k];

            if (company.ContractId == null) {
                for (var j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {
                    var comps = $.grep($scope.parent.LiabilityRiskCompanyContracts, function (x) { return (x.RiskCompanyId == company.Id); });
                    if (comps.length > 0) {
                        company.ContractId = comps[0].ContractId;
                    }
                }
            }

            if (company.ContractId == null) {
                company.ContractId = company.Contracts[0].Id;
            }
        }
    }

    $scope.showGeneralClassCodes = function (contractId) {
        if ($scope.parent.Policy.CurrentVersion.ClassCodes == null) return false;
        for (var j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {
            var c = $scope.parent.Policy.CurrentVersion.ClassCodes[j];
            if (c.LocationNumber == null && c.Number != '49950') {
                for (var k = 0; k < c.ClassCodeRatingInputs.length; k++) {
                    if (c.ClassCodeRatingInputs[k].ContractId == contractId && c.ClassCodeRatingInputs[k].IsIgnored == false) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    $scope.updateContractPremium = function (limit, property) {
        // Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.updateContractPremium($scope.PolicyId, [limit], limit.AssignedContractId, 'Property').then(function (result) {
            // Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
				// Update parent Policy, Policy, CurrentVersion and Locations
				$scope.parent.Policy = result.data.Policy;
				$scope.parent.Policy.CurrentVersion = result.data.Policy.Versions[0];
				$scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;
                setRatingQuestions();

                $scope.getPolicyPremiumBreakdown(property);

                $scope.parent.Policy.CurrentVersion.Premiums = $scope.PremiumBreakdowns = result.data.PremiumBreakdowns;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

    }

    $scope.updateContractFinalRate = function (limit, property) {
        // Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.updateContractFinalRate($scope.PolicyId, [limit], limit.AssignedContractId, 'Property').then(function (result) {
            // Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
				// Update parent Policy, Policy, CurrentVersion and Locations
				$scope.parent.Policy = result.data.Policy;
				$scope.Policy = $scope.parent.Policy;
				$scope.parent.Policy.CurrentVersion = result.data.Policy.Versions[0];
				$scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;
                setRatingQuestions();

                $scope.getPolicyPremiumBreakdown(property);

                $scope.parent.Policy.CurrentVersion.Premiums = $scope.PremiumBreakdowns = result.data.PremiumBreakdowns;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.getPolicyPremiumBreakdown = function (property) {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.getPolicyPremiumBreakdown($scope.PolicyId).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                $scope.parent.PremiumBreakdowns = result.data.PremiumBreakdowns;

                notificationsHub.showSuccess('Quote ' + $scope.parent.Policy.Number, 'Building ' + property.BuildingNumber + ' rates are updated.');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.liabilityRateBreakdown = function (ratingResult) {
        if (ratingResult == null) return '';

        var html = '<table style="border-collapse: collapse; border: 1px solid white;padding:0;margin:0">';

        var rateBreakdown = ratingResult.Breakdown.sort(function (a, b) { return a.Index - b.Index; });

        for (var i = 0; i < rateBreakdown.length; i++) {
            var b = rateBreakdown[i];
			if (b.Name == "Final Rate") {
				//b.Rate = b.Rate / 0.9;
			}
            if ($scope.packageCompanyId != null && b.Name == "Package Mod Factor") continue;
            html += '<tr>';

            var style = b.Index == 10 || b.Index == 3 || b.Index == 6 ? 'border: 1px solid white; font-weight:bold;font-size:1.1em' :
                'border: 1px solid white';

            html += '<td  style="' + style + '"><ul style="list-style:none;margin-left:2px;padding-left:2px;padding-top:4px">';
            html += b.Name;
            html += '</td>';

            style = b.Index == 10 || b.Index == 3 || b.Index == 6 ? 'border: 1px solid white;padding:3px;text-align:center;font-weight:bold;font-size:1.1em' :
                'border: 1px solid white;padding:3px;text-align:center';
            html += '<td  style="' + style + '">' + b.Rate + '</td>';
            html += '</tr>';
        }

        html += '</table>';
        return $sce.trustAsHtml(html);
    };


    $scope.limitRateBreakdown = function (contract, wind, limit) {
        if (contract.IsUserEntered) return "";
        var breakdown = contract.RateBreakdown;

        if (breakdown.length == 0) return "";
        var html = '<table style="border-collapse: collapse; border: 1px solid white">';

        for (var i = 0; i < breakdown.length; i++) {
            var b = breakdown[i];

            if (b.Wind == wind && b.Limit == limit && b.Reasons != null) {
                html += '<tr>';
                html += '<td  style=" border: 1px solid white"><ul style="list-style:none;margin-left:2px;padding-left:2px;padding-top:4px">';
                for (var j = 0; j < b.Reasons.length; j++) {
                    var reason = b.Reasons[j];
                    html += '<li>' + reason + '</li>';
                }
                html += '</ul></td>';
                html += '<td  style="border: 1px solid white;padding:3px;text-align:center">' + b.Rate + '</td>';
                html += '</tr>';
            }
        }

        html += '</table>';
        return $sce.trustAsHtml(html);
    };


    $scope.adjustRating = function (rating) {
        policyService.adjustRating($scope.PolicyId, rating, 'Homeowners').then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy = result.data.Policy;
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;

                showDeclines();
                setRatingQuestions();

                $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;
                $scope.RefreshPremium();

            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.adjustSplit = function (assignedContract) {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.adjustSplit($scope.PolicyId, assignedContract.ContractId, assignedContract.Split, 'Property').then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                if (result.data.Locations != null) {
                    $scope.parent.Policy.CurrentVersion.Locations = $scope.Locations = result.data.Locations;
                }
                else {
                    $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;
                }
                showDeclines();
                setRatingQuestions();

                $scope.parent.Policy.CurrentVersion.Premiums = $scope.PremiumBreakdowns = result.data.PremiumBreakdowns;
                //$scope.RefreshPremium();

                $scope.setupClassCodes();
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.updatePremium = function (limit) {
        limit.Mod = (limit.Premium * 100) / limit.Amount / (limit.DevelopedRate + limit.DevelopedWindLoad);
        limit.FinalRate = parseFloat(((limit.DevelopedRate + limit.DevelopedWindLoad) * limit.Mod).toFixed(6));
    }

    $scope.updateMod = function (limit) {
        limit.FinalRate = parseFloat(((limit.DevelopedRate + limit.DevelopedWindLoad) * limit.Mod).toFixed(6));
    }

    $scope.updateRate = function (contract) {
        contract.Mod = parseFloat((contract.FinalRate / (contract.DevelopedRate + contract.DevelopedWindLoad)).toFixed(6));
    }

    $scope.contractDecline = function (contract) {
        if (contract.ShowDecline == null || contract.ShowDecline == false)
            contract.ShowDecline = true;
        else
            contract.ShowDecline = false;
    }

    $scope.setupClassCodes = function () {
        for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Locations.length; i++) {
            var location = $scope.parent.Policy.CurrentVersion.Locations[i];
            location.ClassCodes = [];
            for (var j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {
                var c = $scope.parent.Policy.CurrentVersion.ClassCodes[j];
                if (c.LocationNumber == location.LocationNumber) {
                    location.ClassCodes.push(c);
                }
            }
        }

        for (var k = 0; k < $scope.parent.RiskCompanies.length; k++) {
            var company = $scope.parent.RiskCompanies[k];

            if (company.ContractId == null) {
                for (var j = 0; j < $scope.parent.Policy.CurrentVersion.ClassCodes.length; j++) {
                    var comps = $.grep($scope.parent.LiabilityRiskCompanyContracts, function (x) { return (x.RiskCompanyId == company.Id); });
                    if (comps.length > 0) {
                        company.ContractId = comps[0].ContractId;
                    }
                }
            }

            if (company.ContractId == null) {
                company.ContractId = company.Contracts[0].Id;
            }
        }
    }

    function showDeclines() {
        for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Locations.length; i++) {
            if ($scope.parent.Policy.CurrentVersion.Locations[i].Properties != null) {
                for (var j = 0; j < $scope.parent.Policy.CurrentVersion.Locations[i].Properties.length; j++) {
                    if ($scope.parent.Policy.CurrentVersion.Locations[i].Properties[j].AssignedContracts != null) {
                        for (var k = 0; k < $scope.parent.Policy.CurrentVersion.Locations[i].Properties[j].AssignedContracts.length; k++) {
                            var contract = $scope.parent.Policy.CurrentVersion.Locations[i].Properties[j].AssignedContracts[k];
                            if (contract.SubmitReason.length > 0 && $scope.parent.Policy.SubmitApproved != true) {
                                contract.ShowDecline = true;
                                $scope.RequiresSubmit = true;
                            }
                        }
                    }
                }
            }
        }
    }

    function setRatingQuestions() {
        $scope.RatingQuestions = [];
        for (var i = 0; i < $scope.parent.Policy.CurrentVersion.Locations.length; i++) {
            for (var j = 0; j < $scope.parent.Policy.CurrentVersion.Locations[i].Properties.length; j++) {
                var property = $scope.parent.Policy.CurrentVersion.Locations[i].Properties[j];
                for (var k = 0; k < property.AssignedContracts.length; k++) {
                    for (var q = 0; q < property.AssignedContracts[k].Questions.length; q++) {
                        var question = property.AssignedContracts[k].Questions[q];

                        var existingQuestion = $.grep($scope.RatingQuestions, function (a) {
                            return a.Question == question.Question && a.ContractId == question.ContractId;
                        });

                        if (existingQuestion.length == 0) {
                            $scope.RatingQuestions.push({
                                Question: question.Question,
                                UserAnswer: question.UserAnswer,
                                AppliesTo: ["Location " + $scope.parent.Policy.CurrentVersion.Locations[i].LocationNumber + " Building " + property.BuildingNumber]
                            });
                        }
                        else {
                            if (existingQuestion.AppliesTo == null) existingQuestion.AppliesTo = [];
                            existingQuestion.AppliesTo.push("Location " + $scope.parent.Policy.CurrentVersion.Locations[i].LocationNumber + " Building " + property.BuildingNumber);
                        }
                    }
                }
            }
        }
    }

    $scope.toggleOverride = function (decline, reason) {
        var exists = $.grep($scope.parent.Policy.CurrentVersion.ContractDeclineOverrides, function (x) { return x.RiskCompanyId == decline.RiskCompanyId && x.ContractId == decline.ContractId && x.CoverageId == reason.CoverageId && x.Group == reason.Group && x.Reason == reason.Reason && x.Wind == reason.Wind }).length > 0;

        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        if (exists) { // Than Remove
            policyService.removeDeclineOverride($scope.PolicyId, decline.RiskCompanyId, decline.ContractId, reason.CoverageId, reason.Group, reason.Reason, reason.Wind).then(function (result) {
                Metronic.unblockUI('.modal-dialog');
                if (result.data.Result.Success) {
                    $scope.parent.Policy.CurrentVersion.RateProperty = true;
                    $scope.parent.Policy.CurrentVersion.ContractDeclineOverrides = result.data.ContractDeclineOverrides;
                }
                else {
                    $scope.Errors = result.data.Result.Errors;
                }
            }, function (error) {
                Metronic.unblockUI('.modal-dialog');
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
        }
        else // Than Add
        {
            policyService.addDeclineOverride($scope.PolicyId, decline.RiskCompanyId, decline.ContractId, reason.CoverageId, reason.Group, reason.Reason, reason.Wind).then(function (result) {
                Metronic.unblockUI('.modal-dialog');
                if (result.data.Result.Success) {
                    $scope.parent.Policy.CurrentVersion.RateProperty = true;
                    $scope.parent.Policy.CurrentVersion.ContractDeclineOverrides = result.data.ContractDeclineOverrides;
                }
                else {
                    $scope.Errors = result.data.Result.Errors;
                }
            }, function (error) {
                Metronic.unblockUI('.modal-dialog');
                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
        }
    }

    $scope.modify = function (classCode) {
        var modalInstance = $modal.open({
            templateUrl: 'test_Commercial_Lines_eligibility_modifyClassCode.html',
            controller: 'test_Commercial_Lines_eligibility_modifyClassCodeCtrl',
            backdrop: 'static',
            size: 'md',
            resolve: {
                policyId: function () {
                    return $scope.PolicyId;
                },
                policy: function () {
                    return $scope.parent.Policy;
                },
                contracts: function () {
                    return $scope.parent.Contracts;
                },
                locations: function () {
                    return $scope.parent.Policy.CurrentVersion.Locations;
                },
                contractId: function () {
                    return $scope.parent.Policy.CurrentVersion.Liability.ContractId;
                },
                classCode: function () {
                    return classCode;
                },
                riskCompany: function () {
                    return $scope.riskCompany; // WARNING
                },
                states: function () {
                    return $scope.parent.States;
                },
                parent: function () {
                    return $scope.parent;
                },
                packageCompanyId: function () {
                    return $scope.packageCompanyId;
                }
            }
        });

        modalInstance.result.then(function (data) {
            var code = $.grep($scope.parent.Policy.CurrentVersion.ClassCodes, function (x) { return x.Id == classCode.Id })[0];
            if (code != null && data.ClassCode != null)
                code = data.ClassCode;
            $scope.setupClassCodes();
            if (data.PremiumBreakdowns != null) {
                $scope.parent.Policy.CurrentVersion.Premiums = data.PremiumBreakdowns;
            }
        });
    }

    $scope.expandModal = function () {
        if ($scope.expanded) {
            $(".modal-dialog").css("width", "1200px");
            $("#coverages-holder").css("max-height", "500px");
            $("#coverages-holder").css("height", ($(window).height() - 250) + "px");
        } else {
            $(".modal-dialog").css("width", "98%");
            $("#coverages-holder").css("max-height", ($(window).height() - 250) + "px");
            $("#coverages-holder").css("height", ($(window).height() - 250) + "px");
        }

        $scope.expanded = !$scope.expanded;
    }

    $(window).resize(function () {
        if ($scope.expanded) {
            $(".modal-dialog").css("width", "98%");
            $("#coverages-holder").css("max-height", ($(window).height() - 250) + "px");
            $("#coverages-holder").css("height", ($(window).height() - 250) + "px");
        }
    });

    $scope.totalLimit = function (contract) {
        var limit = 0;

        for (var i = 0; i < contract.Limits.length; i++) {
            var l = contract.Limits[i];

            if ($scope.IsPropertyLimit(l.LimitName)) {
                limit += l.Amount;
            }
        }

        return limit;
    }

    $scope.rate = function (contract) {
        var _limits = contract.Limits.filter(x => x.Amount != null && x.Amount > 0);
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ($scope.IsPropertyLimit(l.LimitName) && l.DevelopedRate > 0) {
                return l.DevelopedRate;
            }
        }

        return '';
    }

    $scope.windLoad = function (contract) {
        var _limits = contract.Limits.filter(x => x.Amount != null && x.Amount > 0);
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ($scope.IsPropertyLimit(l.LimitName) && l.DevelopedWindLoad > 0) {
                return l.DevelopedWindLoad;
            }
        }

        return '';
    }

    $scope.developedFinalRate = function (contract) {
        var _limits = contract.Limits.filter(x => x.Amount != null && x.Amount > 0);
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ($scope.IsPropertyLimit(l.LimitName) && l.DevelopedFinalRate > 0) {
                return l.DevelopedFinalRate;
            }
        }

        return '';
    }

    $scope.finalRate = function (contract) {
        var _limits = contract.Limits.filter(x => x.Amount != null && x.Amount > 0);
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ($scope.IsPropertyLimit(l.LimitName) && l.FinalRate > 0) {
                return l.FinalRate;
            }
        }

        return '';
    }


    $scope.sameFinalRate = function (contract) {
        var _finalRate = null;
        var _limits = contract.Limits.filter(x => x.Amount != null && x.Amount > 0);

        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ($scope.IsPropertyLimit(l.LimitName)) {
                if (_finalRate != null && _finalRate != l.FinalRate)
                    return false;
                _finalRate = l.FinalRate;
            }
        }

        _finalRate = null;
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ($scope.IsPropertyLimit(l.LimitName)) {
                if (_finalRate != null && _finalRate != l.DevelopedFinalRate)
                    return false;
                _finalRate = l.DevelopedFinalRate;
            }
        }

        return true;
    }

    $scope.calculateLimitsRate = function (contract) {
        for (var i = 0; i < contract.Limits.length; i++) {
            var l = contract.Limits[i];

            if ($scope.IsPropertyLimit(l.LimitName)) {
                l.FinalRate = contract.FinalRate;
                $scope.calculateLimitRate(l, contract);
            }
        }
    }

    $scope.isGridiron = function () {
        return riskCompany.Id.toLowerCase() === "689c1168-395d-483b-8837-f92ea949e92a";
    }
}]);

MALACHIAPP.controller('test_Commercial_Lines_addContract', ['authService', '$rootScope', '$scope', '$sce', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policyId', 'riskCompany', 'parent', 'contracts', function (authService, $rootScope, $scope, $sce, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, $modalInstance, settings, policyService, toolsService, policyId, riskCompany, parent, contracts) {
    $scope.PolicyId = policyId;
    $scope.riskCompany = riskCompany;
    $scope.Policy = parent.Policy;

    $scope.Contracts = contracts;
    $scope.Contract = { SelectedContract: { InsurerName: "Select a Contract" } };
    $scope.Errors = [];

    var validateInput = function () {
        $scope.Errors = [];

        if (!$scope.Contract.SelectedContract.Name)
            $scope.Errors.push("Select a contract from the dropdown");

        if (!$scope.Contract.Split || $scope.Contract.Split == '')
            $scope.Errors.push("Enter a split percentage");
        else if (!(/^\d+$/.test($scope.Contract.Split)))
            $scope.Errors.push("Split must be a whole number");
    };

    $scope.hasAvailableContracts = function () {
        return $scope.Contracts != null && $scope.Contracts.length > 0;
    }

    $scope.close = function (data) {
        if (data != "cancel") {
            validateInput();
            if ($scope.Errors.length != 0)
                return;
        }

        $modalInstance.close(data);
    };
}]);

MALACHIAPP.controller('test_Commercial_Lines_creditDebit', ['authService', '$rootScope', '$scope', '$sce', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policyId', 'riskCompany', 'parent', 'locations', function (authService, $rootScope, $scope, $sce, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, $modalInstance, settings, policyService, toolsService, policyId, riskCompany, parent, locations) {
    $scope.PolicyId = policyId;
    $scope.riskCompany = riskCompany;
    $scope.Policy = parent.Policy;
    $scope.Locations = locations;
    $scope.Errors = [];
    $scope.settings = {
        RateType: 'Override',
        Rate: null,
        Mod: null,
        SelectedProperties: []
    };

    var validateInput = function () {
        $scope.Errors = [];

        if ($scope.settings.SelectedProperties.length == 0)
            $scope.Errors.push("Select one or more properties to apply changes.");

        if ($scope.settings.RateType == 'Override') {
            if ($scope.settings.Rate == null || $scope.settings.Rate < 0) {
                $scope.Errors.push("Please enter a number greater than ZERO for the rate override.");
            }
        } else {
            if ($scope.settings.Mod == null || $scope.settings.Mod < 0) {
                $scope.Errors.push("Please enter a number greater than ZERO for the rate mod.");
            }
        }
    };

    $scope.close = function (data) {
        if (data != "cancel") {
            validateInput();
            if ($scope.Errors.length != 0)
                return;

            $modalInstance.close($scope.settings);
            return;
        }

        $modalInstance.dismiss('cancel');
    };

    $scope.selectAllProperties = function () {
        $scope.settings.SelectedProperties = [];
        for (var i = 0; i < $scope.Locations.length; i++) {
            var location = $scope.Locations[i];

            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];

                $scope.settings.SelectedProperties.push(property.Id);
            }
        }
    }

    $scope.deselectAllProperties = function () {
        $scope.settings.SelectedProperties = [];
    }
}]);

MALACHIAPP.controller('test_Commercial_Lines_eligibility_modifyClassCodeCtrl', ['$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'policyService', 'policyId', 'policy', 'classCode', 'contractId', 'riskCompany', 'locations', 'states', 'parent', 'packageCompanyId', function ($scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, policyService, policyId, policy, classCode, contractId, riskCompany, locations, states, parent, packageCompanyId) {
    $scope.PolicyId = policyId;
    $scope.Policy = policy;
    $scope.ClassCode = classCode;
    $scope.RiskCompanies = [];
    $scope.RiskCompanies.push(riskCompany);
    $scope.parent = parent;
    $scope.packageCompanyId = packageCompanyId;
    // $scope.LiabilityRiskCompanyContracts = riskCompanyContracts;

    $scope.roundPackageGLPremium = function (ratingResults, contractId)// this is for the general liability of a package 
    {
        for (var i = 0; i < ratingResults.length; i++) {
            if (ratingResults[i].ContractId == contractId) {
                return Math.ceil((ratingResults[i].PremisesPremium / 0.9));
            }
        }
        return Math.ceil(1)
    }

    function isNullOrEmpty(str) {
        return str == null || str == undefined || str.toString().length < 1;
    }


    $scope.isIfgAi = function (riskCompanyName, classCodeNumber) {
        return (riskCompanyName == 'Burlington IFG' && classCodeNumber == '49950');
    }

    function roundMinimumPremium() {
        for (var i = 0; i < $scope.RiskCompanies.length; i++) {
            var riskCompany = $scope.RiskCompanies[i];
            var contractId = riskCompany.ContractId;
            var ratingInput = $scope.ClassCode.ClassCodeRatingInputs.find(function (x) { return x.ContractId === contractId; });
            var ratingResult = $scope.ClassCode.ClassCodeRatingResults.find(function (x) { return x.ContractId === contractId; });
            if (ratingInput == undefined || ratingResult == undefined) return;

            if (ratingInput.IsUserEnteredMinimumPremium) {
                var minimumPremium = ratingInput.UserEnteredMinimumPremium;

                // Quick error validation
                if (minimumPremium == undefined || isNullOrEmpty(minimumPremium)) {
                    $scope.Errors.push("Please enter a minimum premium.");
                    return;
                } else {
                    if (isNaN(minimumPremium)) {
                        $scope.Errors.push("Please enter a valid minimum premium.");
                        return;
                    }
                }

                minimumPremium = Math.round(parseFloat(minimumPremium));
                ratingInput.UserEnteredMinimumPremium = minimumPremium.toString();
            }
        }
    }

    $scope.subCodeChange = function (riskCompany) {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.getClassCodeInfoAndInput($scope.PolicyId, $scope.ClassCode, riskCompany.SubClassCode.SubNumber, riskCompany.ContractId, riskCompany.Id, $scope.ClassCode.Id).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                var inputs = $.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) { return (x.ContractId == riskCompany.ContractId); });
                var input;
                var i;
                if (inputs.length > 0) {
                    for (i = 0; i < $scope.ClassCode.ClassCodeRatingInputs.length; i++) {
                        input = $scope.ClassCode.ClassCodeRatingInputs[i];
                        if (input.ContractId == riskCompany.ContractId) {
                            $scope.ClassCode.ClassCodeRatingInputs[i] = result.data.ClassCodeRatingInput;
                        }
                    }
                } else {
                    $scope.ClassCode.ClassCodeRatingInputs.push(result.data.ClassCodeRatingInput);
                }

                var infos = $.grep($scope.ClassCode.ClassCodeRateInfo, function (x) { return (x.ContractId == riskCompany.ContractId); });

                if (infos.length > 0) {
                    for (i = 0; i < $scope.ClassCode.ClassCodeRateInfo.length; i++) {
                        input = $scope.ClassCode.ClassCodeRateInfo[i];
                        if (input.ContractId == riskCompany.ContractId) {
                            $scope.ClassCode.ClassCodeRateInfo[i] = result.data.ClassCodeRateInfo;
                        }
                    }
                } else {
                    $scope.ClassCode.ClassCodeRateInfo.push(result.data.ClassCodeRateInfo);
                }
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.updateFields = function (classcode, riskCompany, type) {
        if (!type) type = "Premises";
        classcode["Has" + type + "UserInput"] = true;

        var info = classcode.ClassCodeRateInfo.find(function (x) { return x.ContractId == riskCompany.ContractId; });
        var input = classcode.ClassCodeRatingInputs.find(function (x) { return x.ContractId == riskCompany.ContractId; });
        var result = classcode.ClassCodeRatingResults.find(function (x) { return x.ContractId == riskCompany.ContractId; });

        var rate = result.ExposureQuestionResults[0][type + "CoverageRatingResult"].Rate;
        var modFactor = input[type + "DiscretionaryModifier"];
        var exposureAnswer = 0;
        var rateBasis = 0;

        var field = type == "Premises" ? "PremisesExposureGroups" : "ProductExposureGroups";
        if (info.CanRateByISO) {
            exposureAnswer = input.IsoRatingInput.ExposureAnswers[0].Answer;
            rateBasis = info.IsoRateInfo.PremisesExposureGroups[0].Exposures[0].RateBasis;
        }
        else if (info.CanRateByCompany) {
            exposureAnswer = input.CompanyRatingInput.ExposureAnswers[0].Answer;
            rateBasis = info.CompanyRateInfo.PremisesExposureGroups[0].Exposures[0].RateBasis;
        }

        var finalRate = rate * modFactor;
        var calculatedPremium = finalRate * exposureAnswer / rateBasis;

        result.ExposureQuestionResults[0][type + "CoverageRatingResult"].AdjustedRate = Math.round(1000 * finalRate) / 1000;
        result[type + "Premium"] = Math.round(calculatedPremium);
    };

    $scope.updateIsMinimumPremium = function (classcode, isMinimumPremium) {
        if (!isMinimumPremium) {
            var input = classcode.ClassCodeRatingInputs.find(function (x) { return x.ContractId == riskCompany.ContractId; });
            if (input) input.UserEnteredMinimumPremium = null;
        }
    }

    $scope.hasLiquorLiabilityResult = function (classcode, contractId) {
        var result = classcode.ClassCodeRatingResults.find(function (x) { return x.ContractId == contractId; });
        if (!result) return false;

        var liquorAdditionalQuestion = result.AdditionalQuestionResults.find(function (x) { return x.CoverageType == 1; });
        if (!liquorAdditionalQuestion) return false;

        return true;
    }

    $scope.updateIsLiquorMinimumPremium = function (classcode, isLiquorMinimumPremium) {
        if (!isLiquorMinimumPremium) {
            var input = classcode.ClassCodeRatingInputs.find(function (x) { return x.ContractId == riskCompany.ContractId; });
            if (input) input.UserEnteredLiquorMinimumPremium = null;
        }
    }

    $scope.rateClassCode = function (close) {
        for (var i = 0; i < $scope.Policy.CurrentVersion.ClassCodes.length; i++)
            if ($scope.Policy.CurrentVersion.ClassCodes[i].Id == $scope.ClassCode.Id)
                $scope.Policy.CurrentVersion.ClassCodes[i] = $scope.ClassCode;

        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.rateClassCode($scope.Policy, $scope.ClassCode).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                $scope.Policy = result.data.Policy;
                $scope.Policy.CurrentVersion = $scope.Policy.Versions[0];
                $scope.Policy.CurrentVersion.Premiums = result.data.PremiumBreakdowns;
                $scope.ClassCode.ClassCodeRatingResults = result.data.ClassCodeRatingResults;

                $scope.setupClassCodes();

                notificationsHub.showSuccess('Quote', 'Class Code ' + $scope.ClassCode.Number + ' updated.');

                if (close) {
                    var data = {
                        ClassCode: $scope.ClassCode,
                        PremiumBreakdowns: result.data.PremiumBreakdowns
                    };
                    $modalInstance.close(data);
                }
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.close = function (validate) {
        if (validate == null) validate = true;

        if (validate) {
            $scope.Errors = [];

            // Make sure at least one sub class code is picked
            for (var i = 0; i < $scope.RiskCompanies.length; i++) {
                var riskCompany = $scope.RiskCompanies[i];
                if (riskCompany.SubClassCodes.length > 0) {
                    var inputs = $.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) { return (x.ContractId == riskCompany.ContractId); });
                    if (inputs.length == 0) {
                        $scope.Errors.push("Please pick a sub-class code for " + riskCompany.Name);
                    }
                }
            }

            // Validate the minimum premium; round if it has a floating value
            roundMinimumPremium();

            if ($scope.Errors.length > 0) return;
        }

        $modalInstance.dismiss("close");

        for (var i = 0; i < $scope.RiskCompanies.length; i++) {
            $scope.RiskCompanies[i].SubClassCode = null;
        }
    }

    $scope.setupClassCodes = function () {
        if ($scope.Policy.CurrentVersion.Locations != null) {
            for (var i = 0; i < $scope.Policy.CurrentVersion.Locations.length; i++) {
                var location = $scope.Policy.CurrentVersion.Locations[i];
                location.ClassCodes = [];
                for (var j = 0; j < $scope.Policy.CurrentVersion.ClassCodes.length; j++) {
                    var c = $scope.Policy.CurrentVersion.ClassCodes[j];
                    if (c.LocationNumber == location.LocationNumber) {
                        location.ClassCodes.push(c);
                    }
                }
            }
        }

        for (var k = 0; k < $scope.RiskCompanies.length; k++) {
            var company = $scope.RiskCompanies[k];
            if (company.ContractId == null) {
                company.ContractId = company.Contracts[0].Id;
            }
        }
    }

    $scope.exposureCheck = function (limit, answer) {
        if (limit == null || limit == "" || parseFloat(limit) == 0) return false;
        if (parseFloat(limit) < parseFloat(answer)) return true;
        return false;
    }

    $scope.loadClassCode = function (riskCompany, subNumber) {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        $scope.ClassCode.SubNumber = subNumber;
        policyService.getClassCodesInfo($scope.PolicyId, $scope.ClassCode, riskCompany.ContractId, riskCompany.Id).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ClassCode.ClassCodeRateInfo.push(result.data.ClassCodeRateInfo);
            }
            else {
            }
            Metronic.unblockUI('.modal-dialog');
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.getSubClassCodes = function (riskCompany) {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.getSubClassCodes($scope.PolicyId, riskCompany.ContractId, $scope.ClassCode.Number).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                riskCompany.SubClassCodes = result.data.ClassCodes;
                // Select current one
                if ($.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) { return (x.ContractId == riskCompany.ContractId); }).length > 0) {
                    var subNumber = $.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) { return (x.ContractId == riskCompany.ContractId); })[0].SubNumber;

                    for (var i = 0; i < riskCompany.SubClassCodes.length; i++) {
                        if (riskCompany.SubClassCodes[i].SubNumber == subNumber) {
                            riskCompany.SubClassCode = riskCompany.SubClassCodes[i];
                        }
                    }
                }
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.syncPremiseExposure = function (originalRatedBy, riskCompanyId, contractId, exposure, exposureAnswer) {
        for (var i = 0; i < $scope.RiskCompanies.length; i++) {
            var riskCompany = $scope.RiskCompanies[i];

            var infos = $.grep($scope.ClassCode.ClassCodeRateInfo, function (x) {
                return (x.RiskCompanyId == riskCompany.Id);
            });

            for (var k = 0; k < infos.length; k++) {
                var info = infos[k];
                var input = $.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) {
                    return (x.ContractId == info.ContractId);
                })[0];

                var ratedBy = input.RateBy;

                if (input.ContractId != contractId || originalRatedBy != 'ISO') {
                    if (info.IsoRateInfo != null && info.IsoRateInfo.PremisesExposureGroups != null) {
                        var premisesExposureGroups = info.IsoRateInfo.PremisesExposureGroups;

                        if (premisesExposureGroups.length == 1 && premisesExposureGroups[0].Exposures.length == 1 && premisesExposureGroups[0].Exposures[0].RateBasis == exposure.RateBasis) {
                            var questionId = premisesExposureGroups[0].Exposures[0].QuestionID;
                            var exposureAnswers = input.IsoRatingInput.ExposureAnswers;
                            var question = $.grep(exposureAnswers, function (x) {
                                return (x.QuestionID == questionId);
                            })[0];
                            question.Answer = exposureAnswer.Answer;
                        }
                    }
                }


                if (input.ContractId != contractId || originalRatedBy != 'Company') {
                    if (info.CompanyRateInfo != null && info.CompanyRateInfo.PremisesExposureGroups != null) {
                        var premisesExposureGroups = info.CompanyRateInfo.PremisesExposureGroups;

                        if (premisesExposureGroups.length == 1 && premisesExposureGroups[0].Exposures.length == 1 && premisesExposureGroups[0].Exposures[0].RateBasis == exposure.RateBasis) {
                            var questionId = premisesExposureGroups[0].Exposures[0].QuestionID;
                            var exposureAnswers = input.CompanyRatingInput.ExposureAnswers;
                            var question = $.grep(exposureAnswers, function (x) {
                                return (x.QuestionID == questionId);
                            })[0];
                            question.Answer = exposureAnswer.Answer;
                        }
                    }
                }
            }
        }
    }

    $scope.syncProductExposure = function (originalRatedBy, riskCompanyId, contractId, exposure, exposureAnswer) {
        for (var i = 0; i < $scope.RiskCompanies.length; i++) {
            var riskCompany = $scope.RiskCompanies[i];

            var infos = $.grep($scope.ClassCode.ClassCodeRateInfo, function (x) {
                return (x.RiskCompanyId == riskCompany.Id);
            });

            for (var k = 0; k < infos.length; k++) {
                var info = infos[k];
                var input = $.grep($scope.ClassCode.ClassCodeRatingInputs, function (x) {
                    return (x.ContractId == info.ContractId);
                })[0];
                var ratedBy = input.RateBy;

                if (input.ContractId != contractId || originalRatedBy != 'ISO') {
                    if (info.IsoRateInfo != null && info.IsoRateInfo.ProductsExposureGroups != null) {
                        var productsExposureGroups = info.IsoRateInfo.ProductsExposureGroups;

                        if (productsExposureGroups.length == 1 && productsExposureGroups[0].Exposures.length == 1 && productsExposureGroups[0].Exposures[0].RateBasis == exposure.RateBasis) {
                            var questionId = productsExposureGroups[0].Exposures[0].QuestionID;
                            var exposureAnswers = input.IsoRatingInput.ExposureAnswers;
                            var question = $.grep(exposureAnswers, function (x) {
                                return (x.QuestionID == questionId);
                            })[0];
                            question.Answer = exposureAnswer.Answer;
                        }
                    }
                }

                if (input.ContractId != contractId || originalRatedBy != 'Company') {
                    if (info.CompanyRateInfo != null && info.CompanyRateInfo.ProductsExposureGroups != null) {
                        var productsExposureGroups = info.CompanyRateInfo.ProductsExposureGroups;

                        if (productsExposureGroups.length == 1 && productsExposureGroups[0].Exposures.length == 1 && productsExposureGroups[0].Exposures[0].RateBasis == exposure.RateBasis) {
                            var questionId = productsExposureGroups[0].Exposures[0].QuestionID;
                            var exposureAnswers = input.CompanyRatingInput.ExposureAnswers;
                            var question = $.grep(exposureAnswers, function (x) {
                                return (x.QuestionID == questionId);
                            })[0];
                            question.Answer = exposureAnswer.Answer;
                        }
                    }
                }
            }
        }
    }

    $scope.syncIfAny = function (input) {
        var rateBy = input.RateBy;

        for (var i = 0; i < $scope.ClassCode.ClassCodeRatingInputs.length; i++) {

            if (rateBy == "If Any") {
                $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = rateBy;
            } else if ($scope.ClassCode.ClassCodeRatingInputs[i].RateBy == "If Any") {
                var info = $.grep($scope.ClassCode.ClassCodeRateInfo, function (x) {
                    return (x.ContractId == $scope.ClassCode.ClassCodeRatingInputs[i].ContractId);
                })[0];

                if (info.CanRateByCompany && rateBy == 'Company') {
                    $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = 'Company';
                }
                else if (info.CanRateByISO && rateBy == 'ISO') {
                    $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = 'ISO';
                }
                else if (info.CanRateByCompany) {
                    $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = 'Company';
                } else {
                    $scope.ClassCode.ClassCodeRatingInputs[i].RateBy = 'ISO';
                }
            }
        }
    }

    for (var i = 0; i < $scope.RiskCompanies.length; i++) {
        var riskCompany = $scope.RiskCompanies[i];

        $scope.getSubClassCodes(riskCompany);
    }

    if ($scope.RiskCompanies.length == 1) setTimeout(function () {
        $('.riskCompanies').parent().hide()
    }, 10);
}]);

MALACHIAPP.controller('test_Commercial_Lines_submitQuoteCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'authService', 'customPackageService', 'policy', 'policyId', 'riskCompanyId', 'isRequired', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, authService, customPackageService, policy, policyId, riskCompanyId, isRequired) {
    $scope.PolicyId = policyId;
    $scope.Policy = policy;
    $scope.SubmitReason = '';
    $scope.ExternalApprovedBy = '';
    $scope.RiskCompanyId = riskCompanyId;
    $scope.canSubmit = true;
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
    $scope.hasSubmits = policy.CurrentVersion.Submits.some(x => x.RiskCompanyId == riskCompanyId);
    $scope.isSubmitRequired = isRequired;

    function isNullOrEmpty(text) {
        return typeof (text) !== "string" || text.trim().length == 0;
    }

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.submit = function () {
        $scope.canSubmit = false;
        $scope.Errors = [];

        if (!$scope.isSubmitRequired && isNullOrEmpty($scope.SubmitReason)) {
            $scope.canSubmit = true;
            $scope.Errors = ['Please enter a reason for the submit.'];
            return;
        }

        if (isCustomPackageWithGLSubmits()) {
            $scope.canSubmit = true;
            $scope.Errors = ['Unable to submit quote. Please split quotes.'];
            return;
        }

        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.submitQuote($scope.PolicyId, $scope.RiskCompanyId, $scope.SubmitReason).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                $modalInstance.close({ SubmitRequested: true });
                $scope.Policy.Submits = result.data.Submits;
                $scope.Policy.WebServiceApprovedSubmits = result.data.WebServiceApprovedSubmits;
                $scope.Policy.WebServiceSubmitted = result.data.WebServiceSubmitted;
                notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Quote submitted for review!');
            }
            else {
                $scope.canSubmit = true;
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.canSubmit = true;
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.approve = function () {
        if ($scope.ExternalApprovedBy != null && $scope.ExternalApprovedBy.trim().length > 2) {
            $scope.canSubmit = false;
            Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
            policyService.submitApprovedQuote($scope.PolicyId,
                $scope.RiskCompanyId,
                $scope.SubmitReason,
                $scope.ExternalApprovedBy).then(function (result) {
                    Metronic.unblockUI('.modal-dialog');
                    if (result.data.Result.Success) {
                        $modalInstance.close({ SubmitRequested: true });
                        $scope.Policy.Submits = result.data.Submits;
                    } else {
                        $scope.canSubmit = true;
                        $scope.Errors = result.data.Result.Errors;
                    }
                },
                    function (error) {
                        Metronic.unblockUI('.modal-dialog');
                        $scope.canSubmit = true;
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
        } else {
            $scope.Errors = ['Please enter the name of the underwriter at the carrier that approved this submission.'];
        }
    }

    $scope.continueSubmit = function () {
        // Going to need a service function to handle this
        // policyService.continueSubmitOnCarrierSite()
        alert("Not implemented yet");
    }

    $scope.canApprove = function () {
        if ($scope.RiskCompanyId == 'be7a9234-5ba5-49e5-acc0-deec3ff2ead0' || $scope.RiskCompanyId == '48b1a26b-713f-4344-8470-5bfb9e25017c' || $scope.RiskCompanyId == '6d719a07-b422-4c38-9a7c-e9df837f3010') return true;
        return false;
    }

    function isCustomPackageWithGLSubmits() {
        if (customPackageService.isCustomPackage($scope.RiskCompanyId)) {
            let liabilityCoverageIds = ['26cd8c6f-1225-4dee-88b6-2839b6f11233', 'de5c3219-8f26-42c5-ae85-ac54f97a391e', 'b55751c5-3580-46ca-9115-b95c6707acfb']
            let submit = $scope.Policy.CurrentVersion.Submits.find(x => x.RiskCompanyId == $scope.RiskCompanyId);
            if (submit != null && submit.Reasons.some(x => liabilityCoverageIds.includes(x.CoverageId))) {
                return true;
            }
        }
        return false;
    }
}]);

MALACHIAPP.controller('test_Commercial_Lines_inlandMarineCoveragesCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'authService', 'parent', 'riskCompany', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, authService, parent, riskCompany) {
    $scope.Policy = parent.Policy;
    $scope.PolicyId = parent.Policy.policyId;
    $scope.parent = parent;
    $scope.RiskCompany = riskCompany;
    $scope.RiskCompanyId = riskCompany.Id;
    $scope.Errors = [];
    $scope.ContractDeclines = [];

    $scope.CeScheduledEquipment = 'Scheduled Equipment'
    $scope.EdpScheduledHardware = 'Scheduled Hardware';
    $scope.MiscEdpCoverages = [
        'Software/Protection and Control Systems',
        'Communication Systems',
        'Virus/Harmful Code'
    ];
    $scope.MiscCeCoverages = [
        'Owned Miscellaneous Tools and Equipment',
        'Unscheduled Equipment Leased, Rented or Borrowed',
        'Employee Tools/Clothing'
    ]
    $scope.InlandMarineCoverages = [
        {
            Name: "Contractor's Equipment",
            VersionId: parent.Policy.CurrentVersion.Id,
            RiskCompanyId: riskCompany.Id,
            RiskCompanyName: riskCompany.Name,
            InlandMarineType: 0,
            Schedules: [{ Index: 0, Description: $scope.CeScheduledEquipment }],
            IsTheftExcluded: true,
            IsVandalismExcluded: true,
            IsWindExcluded: true,
            IsEquipmentRegularlyHoused: "",
            AreAllVehiclesLocked: ""
        },
        {
            Name: "Installation Floater",
            VersionId: parent.Policy.CurrentVersion.Id,
            RiskCompanyId: riskCompany.Id,
            RiskCompanyName: riskCompany.Name,
            InlandMarineType: 1,
            Schedules: [{ Index: 0 }],
            IsTheftExcluded: true,
            IsVandalismExcluded: true,
            IsWindExcluded: true,
            IsPropertyStoredInside: ""
        },
        {
            Name: "EDP",
            VersionId: parent.Policy.CurrentVersion.Id,
            RiskCompanyId: riskCompany.Id,
            RiskCompanyName: riskCompany.Name,
            InlandMarineType: 2,
            Schedules: [{ Index: 0, Description: $scope.EdpScheduledHardware }],
            IsTheftExcluded: true,
            IsWindExcluded: true
        },
        {
            Name: "Accounts Recievable",
            VersionId: parent.Policy.CurrentVersion.Id,
            RiskCompanyId: riskCompany.Id,
            RiskCompanyName: riskCompany.Name,
            InlandMarineType: 3,
            Schedules: [{ Index: 0 }],
            IsWindExcluded: true
        },
        {
            Name: "Valuable Papers",
            VersionId: parent.Policy.CurrentVersion.Id,
            RiskCompanyId: riskCompany.Id,
            RiskCompanyName: riskCompany.Name,
            InlandMarineType: 4,
            Schedules: [{ Index: 0 }],
            IsWindExcluded: true,
            AreDuplicateRecordsOffSite: ""
        },
        {
            Name: "Bailees' Coverage",
            VersionId: parent.Policy.CurrentVersion.Id,
            RiskCompanyId: riskCompany.Id,
            RiskCompanyName: riskCompany.Name,
            InlandMarineType: 5,
            Schedules: [{ Index: 0 }],
            IsTheftExcluded: true,
            IsWindExcluded: true,
            IsVandalismExcluded: true
        }
    ];
    $scope.Deductibles = [
        "$500",
        "$1,000",
        "$2,500",
        "$5,000",
        "$10,000",
        "$25,000"
    ];
    $scope.YesOrNo = [
        "Yes",
        "No"
    ];
    $scope.VehicleOptions = [
        "Not Applicable",
        "Yes",
        "No"
    ];
    $scope.CoverageOptions = [
        "Basic",
        "Special"
    ];
    $scope.WindDeductibleOptions = [
        "Not Applicable",
        "1%",
        "2%",
        "3%",
        "5%",
        "10%"
    ];
    $scope.DuplicatRecordsOptions = [
        '35%',
        '50%',
        '80%',
        '90%',
        '100%'
    ];
    $scope.CoInsuranceOptions = [
        'None',
        '50%',
        '80%',
        '90%',
        '100%'
    ];
    $scope.BaileeLimitOptions = [
        '$500',
        '$1,000',
        '$2,500',
        '$5,000',
        '$10,000',
        '$25,000',
        '$50,000'
    ]

    $scope.LoadInlandMarine = function () {
        var currentInlandMarineCoverage = $.grep(parent.Policy.CurrentVersion.InlandMarineCoverages, function (x) { return x.RiskCompanyId == riskCompany.Id });
        if (currentInlandMarineCoverage.length == 0)
            return;

        currentInlandMarineCoverage = currentInlandMarineCoverage[0];
        $.extend(true, $scope.InlandMarineCoverages[0], currentInlandMarineCoverage.ContractorsEquipment);
        $.extend(true, $scope.InlandMarineCoverages[1], currentInlandMarineCoverage.InstallationFloater);
        $.extend(true, $scope.InlandMarineCoverages[2], currentInlandMarineCoverage.ElectronicData);
        $.extend(true, $scope.InlandMarineCoverages[3], currentInlandMarineCoverage.AccountsReceivable);
        $.extend(true, $scope.InlandMarineCoverages[4], currentInlandMarineCoverage.ValuablePapers);
        $.extend(true, $scope.InlandMarineCoverages[5], currentInlandMarineCoverage.Bailees);

        for (var i = 0; i < $scope.InlandMarineCoverages.length; i++) {
            if ($scope.InlandMarineCoverages[i].Id)
                $scope.InlandMarineCoverages[i].Included = true;

            if (!$scope.InlandMarineCoverages[i].IsTheftExcluded)
                $scope.InlandMarineCoverages[i].IsTheftIncluded = true;
        }

        $scope.ContractDeclines = $.grep(parent.Policy.CurrentVersion.ContractDeclines, function (x) { return x.ContractId == riskCompany.ContractId && x.Group == "Inland Marine" });
    };
    $scope.LoadInlandMarine();

    $scope.filterCoverages = function (schedule, schedules, coverages) {
        if (!schedules) {
            return $scope.MiscEdpCoverages;
        }

        var filteredSchedules = schedules.filter(x => x.Description != $scope.EdpScheduledHardware);
        var cov = coverages.filter(x => !filteredSchedules.some(y => y.Description == x))

        if (schedule.Description && !cov.some(x => x == schedule.Description)) {
            cov.push(coverages.find(x => x == schedule.Description));
        }

        return cov;
    }

    /* */
    $scope.filterLocations = function (schedule, schedules, excludeBuildingLogic) {
        if (!schedules) {
            return parent.Policy.CurrentVersion.Locations
        }

        var locations = parent.Policy.CurrentVersion.Locations.filter(x => !schedules.some(y => y.LocationNumber == x.LocationNumber));

        if (!excludeBuildingLogic) {
            var existingLocations = parent.Policy.CurrentVersion.Locations.filter(x => schedules.some(y => y.LocationNumber == x.LocationNumber));
            for (var i = 0; i < existingLocations.length; i++) {
                var location = existingLocations[i];
                var locationSchedules = schedules.filter(x => x.LocationNumber == location.LocationNumber);
                if (location.Properties.some(x => !locationSchedules.some(y => y.Building == x.BuildingNumber)))
                    locations.push(location);
            }
        }

        if (schedule.LocationNumber) {
            var location = parent.Policy.CurrentVersion.Locations.find(x => x.LocationNumber == schedule.LocationNumber);
            if (!locations.some(x => x.LocationNumber == location.LocationNumber))
                locations.push(location);
        }

        return locations;
    };

    /* */
    $scope.filterBuildings = function (locationNumber, schedule, schedules) {
        if (locationNumber) {
            var properties = parent.Policy.CurrentVersion.Locations.find(x => x.LocationNumber == locationNumber).Properties;
            var locationSchedules = schedules.filter(x => x.LocationNumber == locationNumber);
            var availableProperties = properties.filter(x => !locationSchedules.some(y => y.Building == x.BuildingNumber));

            if (schedule.Building && !availableProperties.some(x => x.BuildingNumber == schedule.Building)) {
                availableProperties.push(properties.find(x => x.BuildingNumber == schedule.Building))
            }

            return availableProperties;
        }

        return [];
    };

    /*
    $scope.filterLocations = function () {
      return parent.Policy.CurrentVersion.Locations;
    };
   
    $scope.filterBuildings = function (locationNumber) {
      return parent.Policy.CurrentVersion.Locations.find(x => x.LocationNumber == locationNumber).Properties;
    };
    */
    $scope.setIfIncluded = function (coverage, field, value) {
        coverage[field] = !value;
    };

    $scope.addSchedule = function (schedules, description) {
        var index = -1;
        if (schedules.length > 0) {
            for (var i = 0; i < schedules.length; i++) {
                if (schedules[i].Index > index) {
                    index = schedules[i].Index;
                }
            }
            index = index + 1;
        } else {
            index = 0;
        }

        var schedule = {
            Index: index
        };
        if (description) {
            schedule.Description = description;
        }

        schedules.push(schedule);
    };

    $scope.deleteSchedule = function (schedules, index) {
        schedules.splice(schedules.findIndex(x => x.Index == index), 1);
    };

    $scope.clearFields = function (coverage, isSelected, fields) {
        if (!isSelected) {
            for (var i = 0; i < fields.length; i++) {
                coverage[fields[i]] = '';
            }
        }
    }

    $scope.close = function () {
        $modalInstance.close("success");
    };

    $scope.save = function () {
        $scope.validate();

        if ($scope.Errors.length > 0)
            return;

        var contractorsEquipment = $scope.InlandMarineCoverages[0].Included ? $scope.InlandMarineCoverages[0] : null;
        var installationFloater = $scope.InlandMarineCoverages[1].Included ? $scope.InlandMarineCoverages[1] : null;
        var electronicData = $scope.InlandMarineCoverages[2].Included ? $scope.InlandMarineCoverages[2] : null;
        var accountsReceivable = $scope.InlandMarineCoverages[3].Included ? $scope.InlandMarineCoverages[3] : null;
        var valuablePapers = $scope.InlandMarineCoverages[4].Included ? $scope.InlandMarineCoverages[4] : null;
        var bailees = $scope.InlandMarineCoverages[5].Included ? $scope.InlandMarineCoverages[5] : null;

        for (var i = 0; i < $scope.InlandMarineCoverages.length; i++) {
            if ($scope.InlandMarineCoverages[i].MiscToolsLimit)
                $scope.InlandMarineCoverages[i].IsMiscToolsCovered = true;
        }

        $scope.ContractDeclines = [];
        Metronic.blockUI({ target: ".modal-dialog", animate: true, overlayColor: "none" });
        policyService.updateInlandMarine(parent.Policy.Id, riskCompany.Id, contractorsEquipment, installationFloater, electronicData, accountsReceivable, valuablePapers, bailees).then(function (result) {
            Metronic.unblockUI(".modal-dialog");

            if (result.data.Result.Success) {
                parent.Policy = result.data.Policy;
                parent.Policy.CurrentVersion = result.data.Policy.Versions[0];

                $scope.LoadInlandMarine();

                if ($scope.ContractDeclines.length == 0)
                    $modalInstance.close(result);
            }
        }, function (error) {
            Metronic.unblockUI(".modal-dialog");
            console.log(error);
        });
    };

    $scope.validate = function () {
        $scope.Errors = [];

        for (var i = 0; i < $scope.InlandMarineCoverages.length; i++) {
            var coverage = $scope.InlandMarineCoverages[i];

            if (!coverage.Included) {
                continue;
            }

            //if (coverage.IsTheftIncluded == undefined && coverage.TheftSublimit == undefined)
            //  continue;
            //else if ((coverage.IsTheftIncluded || coverage.IsTheftIncluded == undefined)&& (coverage.TheftSublimit == "" || coverage.TheftSublimit == undefined)) {
            //  $scope.Errors.push("Schedule must have a theft sublimit .");
            //}

            if (coverage.InlandMarineType != 3) {
                if (!coverage.Deductible)
                    $scope.Errors.push("Must enter a deductible for " + coverage.Name + ".");
            }

            if (!coverage.CoverageForm) {
                $scope.Errors.push("Must enter a coverage form for " + coverage.Name + ".");
            }

            if (coverage.InlandMarineType == 3) {
                if (!coverage.AreDuplicateRecordsOffSite)
                    $scope.Errors.push("Must answer if duplicate records for " + coverage.Name + ".");
            }

            if (!coverage.IsWindExcluded) {
                //if (coverage.InlandMarineType != 4 && !coverage.WindDeductible)
                //  $scope.Errors.push("Must select a wind deductible for " + coverage.Name + ".");

                //if (!coverage.IsWindLoadIncluded && !coverage.WindLoad) {
                //  $scope.Errors.push("Must enter a wind load for " + coverage.Name + ".");
                //}
            }

            //if (coverage.InlandMarineType == 0 || coverage.InlandMarineType == 1 || coverage.InlandMarineType == 2 || coverage.InlandMarineType == 5) {
            //    if (!coverage.IsTheftExcluded) {
            //        if (!coverage.TheftSublimit)
            //            $scope.Errors.push("Must enter a theft sublimit for " + coverage.Name + ".");
            //    }
            //}

            if (coverage.Schedules.length == 0) {
                $scope.Errors.push("Must have at least one schedule for " + coverage.Name + ".");
            }

            for (var j = 0; j < coverage.Schedules.length; j++) {
                var schedule = coverage.Schedules[j]

                if (coverage.InlandMarineType == 0) {
                    if (schedule.Description == $scope.CeScheduledEquipment) {
                        if (!schedule.ModelYear)
                            $scope.Errors.push("All schedules must have a year for " + coverage.Name + ".");
                        if (!schedule.Manufacturer)
                            $scope.Errors.push("All schedules must have a manafacturer for " + coverage.Name + ".");
                        if (!schedule.Model)
                            $scope.Errors.push("All schedules must have a model for " + coverage.Name + ".");
                        if (!schedule.Serial)
                            $scope.Errors.push("All schedules must have a serial for " + coverage.Name + ".");
                        if (!schedule.Limit)
                            $scope.Errors.push("All schedules must have a limit for " + coverage.Name + ".");
                    }
                    else {
                        if (!schedule.Coverage)
                            $scope.Errors.push("All schedules must have a coverage for " + coverage.Name + ".");
                        if (!schedule.Limit && schedule.Coverage != "Employee Tools/Clothing")
                            $scope.Errors.push("All schedules must have a limit for " + coverage.Name + ".");
                        if (!schedule.PerItemLimit && schedule.Coverage != "Employee Tools/Clothing")
                            $scope.Errors.push("All schedules must have a max limit per item for " + coverage.Name + ".");
                    }
                }

                if (coverage.InlandMarineType == 5) {
                    if (!schedule.DescriptionOfOperations)
                        $scope.Errors.push("Schedule must have a description of operations for " + coverage.Name + ".");

                    if (!schedule.Limit)
                        $scope.Errors.push("Schedule must have a limit per occurrence for " + coverage.Name + ".");

                    if (!schedule.CustomerPropertyDescription)
                        $scope.Errors.push("Schedule must have a description of customer property for " + coverage.Name + ".");

                    if (!schedule.LimitAnyOneItem)
                        $scope.Errors.push("Schedule must have a limit any one item for " + coverage.Name + ".");
                }

                if (coverage.InlandMarineType == 1) {
                    if (!schedule.LocationNumber)
                        $scope.Errors.push("All schedules must have a location for " + coverage.Name + ".");
                    if (!schedule.Limit)
                        $scope.Errors.push("All schedules must have a limit for " + coverage.Name + ".");
                }

                if (coverage.InlandMarineType == 2) {
                    if (schedule.Description == $scope.EdpScheduledHardware) {
                        if (!schedule.Manufacturer)
                            $scope.Errors.push("All schedules must have a manufacturer for " + coverage.Name + ".");
                        if (!schedule.Model)
                            $scope.Errors.push("All schedules must have a model for " + coverage.Name + ".");
                        if (!schedule.Serial)
                            $scope.Errors.push("All schedules must have a serial for " + coverage.Name + ".");
                        if (!schedule.CoInsurance)
                            $scope.Errors.push("All schedules must have a co-insurance for " + coverage.Name + ".");
                        if (!schedule.Limit)
                            $scope.Errors.push("All schedules must have a limit for " + coverage.Name + ".");
                    }
                    else {
                        if (!schedule.Coverage)
                            $scope.Errors.push("All schedules must have a coverage for " + coverage.Name + ".");
                        if (!schedule.Limit)
                            $scope.Errors.push("All schedules must have a limit for " + coverage.Name + ".");
                    }
                }

                if (coverage.InlandMarineType == 3 || coverage.InlandMarineType == 4) {
                    if (!schedule.LocationNumber)
                        $scope.Errors.push("All schedules must have a location for " + coverage.Name + ".");

                    if (!schedule.CoInsurance) {
                        if (coverage.InlandMarineType == 3)
                            $scope.Errors.push("All schedules must have a co-insurance for " + coverage.Name + ".");
                    }

                    if (!schedule.Limit)
                        $scope.Errors.push("All schedules must have a limit for " + coverage.Name + ".");

                    if (coverage.InlandMarineType == 4) {
                        if (!schedule.Building)
                            $scope.Errors.push("All schedules must have a building for " + coverage.Name + ".");
                    }
                }
            }

            if (coverage.InlandMarineType == 5) {
                if (coverage.LimitOfPropForApprovalTrialDemoInstallationAppliesToDeductible) {
                    if (!coverage.LimitOfPropForApprovalTrialDemoInstallation)
                        $scope.Errors.push("Must must enter an approval trial demo installation limit for " + coverage.Name + ".");
                }

                if (coverage.LimitOfPropOfCustInControlOfInsuredOnPremAppliesToDeductible) {
                    if (!coverage.LimitOfPropOfCustInControlOfInsuredOnPrem)
                        $scope.Errors.push("Must must enter a customer in control of insured limit for " + coverage.Name + ".");
                }

                if (coverage.LimitOfPropForVehiclesOwnedOperatedInTransitAppliesToDeductible) {
                    if (!coverage.LimitOfPropForVehiclesOwnedOperatedInTransit)
                        $scope.Errors.push("Must must enter a vehicle owned operated in transit limit for " + coverage.Name + ".");
                }

                if (coverage.LimitOfPropForToolsEquipUsedForMaintRepairAdjServMaintAppliesToDeductible) {
                    if (!coverage.LimitOfPropForToolsEquipUsedForMaintRepairAdjServMaint)
                        $scope.Errors.push("Must must enter a equipment used for maintenance and repair limit for " + coverage.Name + ".");
                }
            }
        }
    };
}]);

MALACHIAPP.controller('test_Commercial_Lines_creditAccountability', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'authService', 'policyId', 'versionId', 'riskCompany', 'creditEntry', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, authService, policyId, versionId, riskCompany, creditEntry) {
    $scope.PolicyId = policyId;
    $scope.VersionId = versionId;
    $scope.RiskCompany = riskCompany;
    $scope.Errors = [];

    $scope.CreditEntry = {
        VersionId: versionId,
        RiskCompanyId: riskCompany.Id,
        IsWithinCreditAuthority: null,
        ApprovedBy: '',
        Reason: '',
    };

    if (creditEntry) {
        if (creditEntry.IsWithinCreditAuthority == true)
            creditEntry.IsWithinCreditAuthority = 'true';
        else
            creditEntry.IsWithinCreditAuthority = 'false';

        $scope.CreditEntry = $.extend(true, {}, creditEntry);
    };

    $scope.ErrorCheck = function () {
        $scope.Errors = [];

        if (!$scope.CreditEntry.IsWithinCreditAuthority) {
            $scope.Errors.push('Please answer whether you are within credit authority.');
        }

        if ($scope.CreditEntry.IsWithinCreditAuthority == 'true')
            return;

        if ($scope.CreditEntry.ApprovedBy == '') {
            $scope.Errors.push('Please enter the authorizing underwriter approving credit.');
        }

        if ($scope.CreditEntry.Reason == '') {
            $scope.Errors.push('Please enter reason for approving credit.')
        }
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.save = function () {
        $scope.ErrorCheck();

        if ($scope.Errors.length != 0)
            return;

        if ($scope.CreditEntry.IsWithinCreditAuthority == 'true') {
            $scope.CreditEntry.ApprovedBy = '';
            $scope.CreditEntry.Reason = '';
        }

        Metronic.blockUI({ target: "#credit-accountability", animate: true, overlayColor: "none" });
        policyService.createPolicyVersionCreditEntry($scope.PolicyId, "Property", $scope.CreditEntry).then(function (result) {
            Metronic.unblockUI("#credit-accountability");
            if (result.data.Result.Success) {
                $modalInstance.close(result.data.CreditEntry);
            }
            else {
                console.log(result);
            }
        },
            function (error) {
                Metronic.unblockUI("#credit-accountability");
                console.log(error);
            });
    };
}]);

MALACHIAPP.controller('test_Commercial_Lines_splitPackageQuote', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$timeout', 'settings', 'policyService', 'toolsService', 'authService', 'policyId', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $timeout, settings, policyService, toolsService, authService, policyId) {
    $scope.IsQuoteSplit = false;
    $scope.PolicyId = policyId;
    $scope.Errors = [];

    $scope.PropertySubmissionNumber = '';
    $scope.LiabilitySubmissionNumber = '';

    $scope.splitPackageQuote = function () {
        policyService.splitPackageQuote($scope.PolicyId).then(function (result) {
            if (result.data.Result.Success) {
                $scope.PropertySubmissionNumber = result.data.PropertySubmissionNumber;
                $scope.LiabilitySubmissionNumber = result.data.LiabilitySubmissionNumber;

                $scope.IsQuoteSplit = true;
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI("#credit-accountability");
            $scope.Errors = ["An unexpected error has occurred. Please refresh the page."];
            console.log(error);
        });
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

    $timeout($scope.splitPackageQuote, 10);
}]);