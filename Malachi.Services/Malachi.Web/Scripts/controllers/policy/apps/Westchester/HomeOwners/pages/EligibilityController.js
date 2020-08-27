'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Homeowners_EligibilityController', ['authService', '$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', '$sce', '$filter', 'settings', 'policyService', 'contractService', 'toolsService', 'test_policyService', function (authService, $rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, $sce, $filter, settings, policyService, contractService, toolsService, test_policyService) {
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
    $scope.ErrorList = [];
    $scope.parent.PremiumBreakdowns = [];
    $scope.parent.LiabilityRiskCompanyContracts = [];
    $scope.parent.ContractDeclines = [];
    $scope.HidePage = true;
    $scope.FocusedRiskCompanyId = $scope.Policy.CurrentVersion.FocusedRiskCompanyId;
    $scope.EligibilityQuestionErrors = [];
    $scope.FloodQuote = {};
    $scope.PolicyFloodCoverage = {};
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

    }
    else {
        $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
    }

    $scope.orderRiskCompanies = function (riskCompanies) {
        if (riskCompanies == null) riskCompanies = $scope.RiskCompanies;

        if ($scope.OrderedRiskCompanies.length == 0) {
            // Get accepted and declined markets.
            var declined = riskCompanies.filter(x => $scope.parent.isRiskCompanyDeclined(x.Id));
            var accepted = riskCompanies.filter(x => declined.every(y => x.Id != y.Id));
            // Sort them by name.
            if (declined.length > 0) declined.sort(sortRiskCompany);
            if (accepted.length > 0) accepted.sort(sortRiskCompany);
            // Look for top companies in list of accepted companies.
            var topCompanies = [];
            var topOrder = ["Safety Specialty Insurance Company", "Trisura Specialty Insurance Company", "HDI Global Specialty SE", "Lloyds of London"]
            for (var topName of topOrder) {
                var company = accepted.find(x => x.Name == topName);
                if (accepted.some(x => x.Name == topName)) {
                    topCompanies.push(company);
                }
            }
            // Remove the top companies from the accepted companies list.
            accepted = accepted.filter(x => topCompanies.every(y => x.Name != y.Name));
            // Set the ordered risk companies.
            $scope.OrderedRiskCompanies = $scope.OrderedRiskCompanies.concat(topCompanies, accepted, declined);
        }
    }

    function sortRiskCompany(a, b) {
        var nameA = a.Name.toLowerCase();
        var nameB = b.Name.toLowerCase();
        return nameA == nameB ? 0 : nameA > nameB ? 1 : -1;
    }

    $scope.canRerate = function () {
        var version = $scope.parent.Policy.CurrentVersion;

        return version.RateProperty && isReviewed()
            && $scope.allQuestionsAnswered($scope.FocusedRiskCompanyId);
    }

    $scope.showConfirmation = function () {
        return !$scope.parent.isAgencyPortal && $scope.FocusedRiskCompanyId != null;
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

    $scope.uncheckUserConfirmation = function () {
        var policyId = $scope.PolicyId;

        test_policyService.updateQuestionReviewConfirmation(policyId, false).then(function (result) {
            if (result.data.Success) {
                $scope.Policy.CurrentVersion.UserConfirmsQuestionReview = false;
            } else {
                $scope.Errors = result.data.Errors;
            }
        }, function (error) {
            $scope.Errors = ["An unexpected error has occurred. Please refresh the page."];
            console.log(error);
        });
    }

    $scope.isRiskCompanySelected = function (riskCompanyId) {
        return $scope.FocusedRiskCompanyId != null && $scope.FocusedRiskCompanyId == riskCompanyId;
    }

    $scope.getRiskCompanyName = function (riskCompany) {
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

  $scope.showDogBreeds = function(eligibility) {
    return eligibility.Question.includes('breeds listed');
  }

  $scope.DogBreeds = "American Staffordshire Terrier; American Pit Bull Terrier; Staffordshire Bull Terrier; Doberman Pinscher; Rottweiler; Chow; Bull Mastiff; German Shepherd; Husky; Alaskan Malamute; Great Dane; St. Bernard; Akita; Rhodesian Ridgeback; or Wolf - Dog";

    $scope.isEQDeclined = function (riskCompany, coverage) {
        if ($scope.parent.Policy.CurrentVersion.Coverages.find(x => x.Name == "Earthquake")) {
            var hasCoverage = riskCompany.Coverages.find(x => x == coverage.Name);
            if (hasCoverage) {
                var eqCoverage = $scope.parent.Policy.CurrentVersion.EarthquakeCoverages.find(function (x) { return x.RiskCompanyId == riskCompany.Id && x.ContractId });
                if (eqCoverage) {
                    var declines = $scope.parent.Policy.CurrentVersion.ContractDeclines.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == "Earthquake" && x.ContractId == eqCoverage.ContractId; });
                    if (declines.length > 0)
                        return true;
                }
                else {
                    var declines = $scope.parent.Policy.CurrentVersion.ContractDeclines.filter(function (x) { return x.RiskCompanyId == riskCompany.Id && x.CoverageName == "Earthquake"; });
                    if (declines.length > 0)
                        return true;
                }
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    };

    $scope.getEQPremium = function (riskCompany) {
        var eqCoverages = $scope.parent.Policy.CurrentVersion.EarthquakeCoverages;

        if (eqCoverages && eqCoverages.length != 0) {
            var eqCoverage = eqCoverages.find(function (x) { return x.RiskCompanyId == riskCompany.Id; });

            if (eqCoverage)
                return eqCoverage.Premium;
        }

        return -1;
    }

    $scope.getRatingQuestions = function (riskCompanyId) {
        return $scope.RatingQuestions.filter(function (x) {
            return x.RiskCompanies.some(function (y) {
                return y == riskCompanyId;
            });
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

    $scope.checkForAnsweredQuestions = function () {
        $scope.QuestionErrors = [];

        if ($scope.Policy.Bound || $scope.getQuestionCount($scope.FocusedRiskCompanyId) == 0) { return; }

        if (!$scope.allQuestionsAnswered($scope.FocusedRiskCompanyId)) {
            $scope.QuestionErrors.push("Not all questions have been answered.");
        }
    };

    $scope.updateFocusedRiskCompanyId = function (riskCompanyId) {
        policyService.updateFocusedRiskCompanyId($scope.PolicyId, riskCompanyId).then(function (result) {
            if (result.data.Result.Success) {
                var version = $scope.parent.Policy.CurrentVersion;
                $scope.FocusedRiskCompanyId = version.FocusedRiskCompanyId = result.data.FocusedRiskCompanyId;

                // Get updated inspection type and set it on the client
                $scope.parent.Policy.InspectionType = result.data.InspectionType;
                version.InspectionType = result.data.InspectionType;

                $scope.checkForAnsweredQuestions();

                // Always uncheck the confirmation box when the user updates the focused risk company
                $scope.uncheckUserConfirmation();                
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            console.log(error);
        });
    }

    $scope.isRiskCompanyDeclined = function (riskCompany) {
        if (!riskCompany) {
            return true;
        }
        if (typeof riskCompany !== 'object') {
            riskCompany = $scope.RiskCompanies.find(x => x.Id == riskCompany);
        }
        return $scope.parent.isRiskCompanyDeclined(riskCompany.Id) || $scope.isEQDeclined(riskCompany, { Name: 'Earthquake' });
    }

    $scope.selectRiskCompany = function (riskCompany) {
        if (!$scope.parent.canModify()) return;
        $scope.updateFocusedRiskCompanyId(riskCompany.Id);
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

    $scope.showRiskCompanyCoverage = function (riskCompany, name) {
        if (name == "Inland Marine") {
            $scope.openInlandMarineCoverages(riskCompany);
            return;
        }

        // Custom Modal for the flood Coverages
        if (name == "Flood") {
            $scope.openFloodCoveragesModal(riskCompany);
            return;
        }

        if (name == "Earthquake") {
            return;
        }

        riskCompany.ActiveCoverage = name;

        if (name == "TRIA" || name == "Liquor Liability") return;

        var modalInstance = $modal.open({
            templateUrl: 'coveragesModel.html',
            controller: 'test_Homeowners_coveragesCtrl',
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
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
            }
        });
    }

    $scope.openFloodCoveragesModal = function (riskCompany) {
        riskCompany.ActiveCoverage = "Flood";

        var modalInstance = $modal.open({
            templateUrl: 'showFloodCoveragesModel.html',
            controller: 'test_Homeowners_showFloodCoveragesCtrl',
            size: 'sm',
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
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.removeFloodCoverage($scope.PolicyId).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.Policy = $scope.parent.Policy = result.data.Policy;
                        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                        //$scope.HidePage = true;
                        // try and rate it to refresh the contracts
                        $scope.checkEligibility();
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

    $scope.checkEligibility = function () {
        if ($scope.ErrorList.length > 0) return;
        $scope.hideEligibilityBtn = true;

        policyService.checkEligibility($scope.PolicyId, 'Homeowners').then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.LoadingPage = false;
                $scope.OrderedRiskCompanies = [];

                $scope.Policy = $scope.parent.Policy = result.data.Policy;
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                $scope.FocusedRiskCompanyId = $scope.Policy.CurrentVersion.FocusedRiskCompanyId;
                hideRiskCompaniesOnBound();

                $scope.refreshPolicyData();
                $scope.checkForAnsweredQuestions();
                $scope.orderRiskCompanies();
                $scope.HidePage = false;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
                $scope.HidePage = false;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            $scope.HidePage = false;
        });

    }

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

        showDeclines();
        setRatingQuestions();
    }


    $scope.submitQuote = function (riskCompanyId) {
        var modalInstance = $modal.open({
            templateUrl: 'submitQuote.html',
            controller: 'test_Homeowners_submitQuoteCtrl',
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

    $scope.adjustRating = function (rating) {
        // Apply user answer to similar assigned contract questions.
        var contractQuestions = rating.AppliesTo;

        for (var i = 0; i < contractQuestions.length; i++) {
            var question = contractQuestions[i];
            question.UserAnswer = rating.Answer;
        }

        // Use the first assigned contract question to adjust the rating.
        var ratingQuestion = contractQuestions[0];

        policyService.adjustRating($scope.PolicyId, ratingQuestion, 'Homeowners').then(function (result) {
            if (result.data.Result.Success) {
                $scope.parent.Policy = result.data.Policy;
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                $scope.parent.Policy.CurrentVersion.RateProperty = true;
                $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;

                showDeclines();
                setRatingQuestions();

                $scope.PremiumBreakdowns = $scope.parent.Policy.CurrentVersion.Premiums;
                //$scope.RefreshPremium();

            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    function hideRiskCompaniesOnBound() {
        // Check if policy is bound and not issued
        var policy = $scope.Policy;
        if (policy == undefined || !policy.Bound || !policy.Issued) return;

        // Retrieve a list of risk companies that are currently focused (at least one).
        var focusedRiskCompanyId = policy.CurrentVersion.FocusedRiskCompanyId;
        var riskCompanies = $.grep($scope.RiskCompanies, function (riskCompany) {
            return riskCompany.Id == focusedRiskCompanyId;
        });

        // Replace the list used by the view with the result
        if (riskCompanies.length > 0) $scope.RiskCompanies = riskCompanies;
    }

    function showDeclines() {
        for (var i = 0; i < $scope.Locations.length; i++) {
            if ($scope.Locations[i].Properties != null) {
                for (var j = 0; j < $scope.Locations[i].Properties.length; j++) {
                    if ($scope.Locations[i].Properties[j].AssignedContracts != null) {
                        for (var k = 0; k < $scope.Locations[i].Properties[j].AssignedContracts.length; k++) {
                            var contract = $scope.Locations[i].Properties[j].AssignedContracts[k];
                            if (contract.SubmitReason.length > 0 && $scope.parent.SubmitApproved() != true) {
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

    $scope.getCoveragePremium = function (riskCompany, coverage) {
        var premiumGrep = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompany.Id });
        if (premiumGrep.length == 0) return 0;
        var breakdownGrep = $.grep(premiumGrep[0].Breakdown, function (x) { return x.Coverage == coverage.Name });
        if (breakdownGrep.length == 0) return 0;

        var amount = breakdownGrep[0].Amount;
        if (coverage.Name == "Homeowners") {
            var eqPremium = $scope.getEQPremium(riskCompany);
            if (eqPremium > 0)
                amount -= eqPremium;
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
        var coveragesGrep = $.grep(riskCompany.Coverages, function (x) { return x == coverage.Name });
        if (coveragesGrep.length > 0) {

            var premiumGrep = $.grep($scope.parent.Policy.CurrentVersion.Premiums, function (x) { return x.RiskCompanyId == riskCompany.Id });
            if (premiumGrep.length == 0) return true;

            var breakdownGrep = $.grep(premiumGrep[0].Breakdown, function (x) { return x.Coverage == coverage.Name });
            if (breakdownGrep.length == 0) return true;
            if (breakdownGrep[0].Amount <= 0) return true;

            // I don't think this is needed because if there is a premium, there can't be a decline - MU
            for (var i = 0; i < riskCompany.Contracts.length; i++) {
                var declinesGrep = $.grep($scope.parent.Policy.CurrentVersion.Declines, function (x) { return x.RiskCompanyId == riskCompany.Id; });
                if (declinesGrep.length != 0) {
                    // Make sure the contract is final
                    for (var d = 0; d < declinesGrep.length; d++) {
                        var contractId = declinesGrep[d].ContractId;
                        for (var j = 0; j < $scope.parent.Policy.CurrentVersion.Locations.length; j++) {
                            var location = $scope.parent.Policy.CurrentVersion.Locations[j];

                            for (var k = 0; k < location.Properties.length; k++) {
                                var property = location.Properties[k];
                                var contracts = $.grep(property.AssignedContracts, function (x) { return x.ContractId == contractId && x.Final; });
                                if (contracts.length > 0) return true;
                            }
                        }
                    }
                }
            }
        }
        else {
            return true;
        }
        return false;
    }

    $scope.openFloodCoverages = function (floodQuote) {

        var modalInstance = $modal.open({
            templateUrl: 'floodCoveragesModel.html',
            controller: 'test_Homeowners_floodCoveragesCtrl',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                floodQuote: function () {
                    return floodQuote;
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != 'cancel') {
                policyService.addFloodCoverage($scope.PolicyId, data.QuoteId, data.OptionNumber).then(function (result) {
                    if (result.data.Result.Success) {
                        $scope.Policy = $scope.parent.Policy = result.data.Policy;
                        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                        //$scope.HidePage = true;

                        // try and rate it to refresh the contracts
                        $scope.checkEligibility();
                    }
                    else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });

            } else {
                // do nothing, if we got here that means they did not pick anything.
            }
        });
    }

    $scope.showFloodButton = function (riskCompany) {
        if (riskCompany.Name == "Safety Specialty Insurance Company") return false;
        if (!$scope.canModify()) return false;
        var policyForm = $scope.Policy.CurrentVersion.Locations[0].Properties[0].PolicyForm;
        return ($scope.parent.Policy.CurrentVersion.FloodCoverages.length == 0 && (policyForm == 'HO-3' || policyForm == 'DP-3') && $scope.parent.Policy.Endorsement == null);
    }

    $scope.rateFloodCoverage = function (policyId) {
        if (!$scope.parent.canModify()) return;

        $scope.FloodQuote = {};
        policyService.quoteFlood(policyId).then(function (result) {
            if (result.data.Result.Success) {
                if (result.data.FloodResponse.Errors.length == 0) {
                    $scope.FloodQuote = {
                        Quote: result.data.FloodResponse.Quote,
                        QuoteId: result.data.FloodResponse.QuoteId
                    };

                    $scope.openFloodCoverages($scope.FloodQuote);
                } else {
                    $scope.Errors = result.data.FloodResponse.Errors;
                }
            } else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

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

MALACHIAPP.controller('test_Homeowners_coveragesCtrl', ['authService', '$rootScope', '$scope', '$sce', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policyId', 'riskCompany', 'parent', 'scope', 'test_policyService', function (authService, $rootScope, $scope, $sce, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, $modalInstance, settings, policyService, toolsService, policyId, riskCompany, parent, scope, test_policyService) {
    $scope.PolicyId = policyId;
    $scope.riskCompany = riskCompany;
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

    var contracts = riskCompany.Contracts;
    riskCompany.LiabilityContracts = [];
    for (var j = 0; j < contracts.length; j++) {
        if ($.grep(contracts[j].Coverages, function (x) { return x == "Liability"; }).length > 0) {
            riskCompany.LiabilityContracts.push(contracts[j]);
        }
    }

    $scope.isLloydsOrRiskShare = function () {
        return $scope.riskCompany.Id == "4488e1cd-a57b-4e16-828e-cf2bc4a03186"
            || $scope.riskCompany.Id == "b2248844-b57f-411e-bb54-4ad8c6698473"
            || $scope.riskCompany.Id == "85f22c2e-57e3-4358-a561-932e16407458";
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
                        if (!l.FinalRate) l.FinalRate = "";
                        if (property.IsWindOnly) contract.IsWindOnly = true;

                        if ((l.LimitName == 'Coverage A' || l.LimitName == 'Coverage B' || l.LimitName == 'Coverage C' || l.LimitName == 'Coverage D')) {
                            contract.FinalRate = l.FinalRate;
                        }
                        else {
                            var additionalCoveragePremium = {
                                LocationId: location.Id,
                                PropertyId: property.Id,
                                ContractName: contract.ContractName,
                                LimitName: l.LimitName,
                                DevelopedPremium: contract.Split != 0 ? l.DevelopedPremium * (100 / contract.Split) : l.DevelopedPremium
                            };

                            $scope.AdditionalCoveragePremiums.push(additionalCoveragePremium);
                        }

                        if ((l.Premium == null || l.Premium == 0) && l.DevelopedPremium == 0 && contract.IsUserEntered)
                            l.Hidden = true;
                    }
                }
            }
        }
    };

    showDeclines();
    setRatingQuestions();
    $scope.setupContracts();

    $scope.filterHomeownersDecline = function (value) {
        return value.CoverageName == "Homeowners" || value.CoverageName == "Flood";
    }

    var createAddedAssignedContract = function (data) {
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
            IsUserEntered: true,
            Final: true
        };

        var locations = $scope.CopiedLocations;
        for (var i = 0; i < locations.length; i++) {
            var properties = locations[i].Properties;
            for (var j = 0; j < properties.length; j++) {
                var property = properties[j];

                var existingContracts = $.grep(property.AssignedContracts, function (x) { return x.ContractName == selectedContract.Name; });

                var addedAssignedContract = $.extend(true, {}, templateAddedAssignedContract);
                addedAssignedContract.Id = existingContracts[0].Id;
                addedAssignedContract.PropertyId = properties[j].Id;
                addedAssignedContract.Limits = [];
                addedAssignedContract.Questions = existingContracts[0].Questions;

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
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedLimit.LimitName })[0];

                        addedLimit.Id = existingLimit.Id;
                        addedLimit.DevelopedRate = existingLimit.DevelopedRate;
                        addedLimit.DevelopedWindLoad = existingLimit.DevelopedWindLoad;
                    };

                    if (addedLimit.Amount == 0)
                        addedLimit.Hidden = true;

                    addedAssignedContract.Limits.push(addedLimit);
                }

                var index = 10;

                if (property.WaterBackup != "Excluded" && property.WaterBackup.replace("$", "").replace(",", "") != 0) {
                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Water Back-Up",
                        Amount: property.WaterBackup.replace("$", "").replace(",", ""),
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];

                        addedAdditionalLimit.Id = existingLimit.Id;
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                if (property.Mold != "Excluded" && property.Mold.replace("$", "").replace(",", "") != 0) {
                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Mold",
                        Amount: property.Mold.replace("$", "").replace(",", ""),
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];

                        addedAdditionalLimit.Id = existingLimit.Id;
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                if (property.IncreasedLossAssessment != "Excluded" && property.IncreasedLossAssessment.replace("$", "").replace(",", "") != 0) {
                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Increased Loss Assessment",
                        Amount: property.IncreasedLossAssessment.replace("$", ""),
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];

                        addedAdditionalLimit.Id = existingLimit.Id;
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                if (property.OffPremisesTheftBuyback == "Included") {
                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Off Premises Theft Buyback",
                        Amount: null,
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];

                        addedAdditionalLimit.Id = existingLimit.Id;
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                } else {
                    var broadTheftCvgLimit = property.OffPremisesTheftBuyback.replace("$", "").replace(",", "");

                    if (!isNaN(broadTheftCvgLimit) && broadTheftCvgLimit > 0) {
                        var addedAdditionalLimit = {
                            Index: ++index,
                            LimitName: "Broad Theft Coverage",
                            Amount: broadTheftCvgLimit,
                            DevelopedFinalRate: 0,
                            DevelopedPremium: 0
                        }

                        if (existingContracts.length > 0) {
                            var existingContract = existingContracts[0];
                            var existingLimit = contract.find(function (x) { return x.LimitName == addedAdditionalLimit.LimitName });

                            if (existingLimit != null) {
                                assignedContractLimit.Id = existingLimit.Id;
                            }
                        };

                        addedAssignedContract.Limits.push(addedAdditionalLimit);
                    }
                }

                if (property.OrdinanceAndLaw == "Included") {
                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Ordinance or Law",
                        Amount: null,
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];

                        addedAdditionalLimit.Id = existingLimit.Id;
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                if (property.PersonalInjury == "Included") {
                    var addedAdditionalLimit = {
                        Index: ++index,
                        LimitName: "Personal Injury",
                        Amount: null,
                        DevelopedFinalRate: 0,
                        DevelopedPremium: 0
                    };

                    if (existingContracts.length > 0) {
                        var existingContract = existingContracts[0];
                        var existingLimit = $.grep(existingContract.Limits, function (x) { return x.LimitName == addedAdditionalLimit.LimitName })[0];

                        addedAdditionalLimit.Id = existingLimit.Id;
                    };

                    addedAssignedContract.Limits.push(addedAdditionalLimit);
                }

                $scope.calculateLimitAmounts(addedAssignedContract, property, locations[i]);
                for (var k = 0; k < addedAssignedContract.Limits.length; k++)
                    $scope.calculateLimitRate(addedAssignedContract.Limits[k], addedAssignedContract);

                var ids = $.map(property.AssignedContracts, function (x) { return x.Id; });
                var index = ids.indexOf(addedAssignedContract.Id);

                property.AssignedContracts[index] = null;
                property.AssignedContracts[index] = addedAssignedContract;
                $scope.openLimits(property, addedAssignedContract);
            }
        }
    };

    var openAddContractModal = function (contracts) {
        if (contracts.length == 0) {
            $scope.Errors = [];

            $scope.Errors.push("No contracts to add for this market.");
            return;
        }

        var modalInstance = $modal.open({
            templateUrl: "addContract.html",
            controller: "test_Homeowners_addContract",
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
                createAddedAssignedContract(data);

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

            var firstPropertyId = $scope.CopiedLocations[0].Properties[0].Id;
            var policyEffective = $scope.Policy.CurrentVersion.Effective;

            test_policyService.getPropertyContractsByRiskCompany($scope.parent.AppId, firstPropertyId, $scope.riskCompany.Id, policyEffective, "Homeowners").then(function (result) {
                Metronic.unblockUI(".modal-dialog");

                if (result.data.Result.Success) {
                    $scope.PotentialContracts = result.data.Contracts;

                    var contracts = $.map($scope.PotentialContracts, function (x) {
                        var copiedContracts = $scope.CopiedLocations[0].Properties[0].AssignedContracts;
                        var existingContracts = $.grep(copiedContracts, function (y) { return y.ContractName == x.Name; });
                        if (existingContracts.length != 0 && existingContracts[0].Limits.length != 0)
                            return x;
                        return null;
                    });

                    $scope.FirstTime = false;
                    openAddContractModal(contracts);
                } else {
                    console.log(result.data.Result.Errors);
                }
            }, function (error) {
                Metronic.unblockUI(".modal-dialog");

                console.log(error);
            });
        }
        else {
            var contracts = $.map($scope.PotentialContracts, function (x) {
                var copiedContracts = $scope.CopiedLocations[0].Properties[0].AssignedContracts;
                var existingContracts = $.grep(copiedContracts, function (y) { return y.ContractName == x.Name; });
                if (existingContracts.length != 0 && existingContracts[0].Limits.length != 0)
                    return x;
                return null;
            });

            openAddContractModal(contracts);
        }
    };

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
            }
            else {
                var propertyLimit = propertyLimits[0];
                limit.Amount = parseFloat(propertyLimit.Amount) * (parseInt(contract.Split) / 100);
                if ($scope.getAdditionalCoveragePremium(location, property, contract, limit)) {
                    limit.DevelopedPremium = $scope.getAdditionalCoveragePremium(location, property, contract, limit) * (parseInt(contract.Split) / 100);
                    limit.AdditionalDevelopedPremium = $scope.getAdditionalCoveragePremium(location, property, contract, limit);
                }
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
        return limit.LimitName.includes("Ordinance or Law") ||
            limit.LimitName.includes("Off Premises Theft Buyback") ||
            limit.LimitName.includes("Broad Theft Coverage") ||
            limit.LimitName.includes("Mold") ||
            limit.LimitName.includes("Personal Injury") ||
            limit.LimitName.includes("Coverage E") ||
            limit.LimitName.includes("Coverage F") ||
            limit.LimitName.includes("Water Back-Up") ||
            limit.LimitName.includes("Mold") ||
            limit.LimitName.includes("Increased Loss Assessment") ||
            limit.LimitName.includes("Scheduled Property");
    };

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
            limit.DevelopedPremium = Math.round(limit.FinalRate * limit.Amount / 100);
        }
        else if (limit.DevelopedFinalRate > 0) {
            limit.DevelopedPremium = Math.round(limit.DevelopedFinalRate * limit.Amount / 100);
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

        contract.Premium = Math.ceil(contract.Premium);
        if (limit.FinalRate != null)
            contract.FinalRate = limit.FinalRate;
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
                    if (addedAssignedContract.IsUserEntered && !contractLimit.Hidden) {
                        if (contractLimit.Premium && (isNaN(parseFloat(contractLimit.Premium)) || contractLimit.Premium <= 0)) {
                            $scope.Errors.push("Limit " + contractLimit.LimitName + " for " + addedAssignedContract.InsurerName + " must have a valid overriden premium if entered.");
                        }
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
                    if ((!contractLimit.DevelopedRate || isNaN(parseFloat(contractLimit.DevelopedRate) || contractLimit.DevelopedRate <= 0)) && !addedAssignedContract.WindExclusive && !addedAssignedContract.IsWindOnly) {
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
        if (coverage == "Homeowners")
            $scope.PerformChecks();
    };


    $scope.openCreditAccountabilityModal = function () {
        var existingEntry = $scope.Policy
            .CurrentVersion.PolicyVersionCreditEntries
            .find(function (x) { return x.VersionId == $scope.Policy.CurrentVersion.Id && x.RiskCompanyId == $scope.riskCompany.Id && x.CoverageName == 'Homeowners' });
        var modalInstance = $modal.open({
            templateUrl: "test_Homeowners_creditAccountability.html",
            controller: "test_Homeowners_creditAccountability",
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
                var contracts = $.grep(property.AssignedContracts, function (contract) { return contract.RiskCompanyId == riskCompanyId && contract.Final });
                updatedAssignedContracts = updatedAssignedContracts.concat(contracts);
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
                var finalRateLowered = limit.FinalRate != null && limit.FinalRate < limit.DevelopedFinalRate;
                var premiumLowered = limit.Premium != null && limit.Premium < limit.DevelopedPremium;
                if (finalRateLowered || premiumLowered)
                    return true;
            }
        }

        return false;
    };

    $scope.PerformChecks = function () {
        validateContracts();
        if ($scope.Errors.length != 0) return;

        var updatedAssignedContracts = $scope.aggregateAssignedContracts($scope.riskCompany.Id);

        if ($scope.IsCreditApplied(updatedAssignedContracts)) {
            $scope.openCreditAccountabilityModal();
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

    $scope.saveProperty = function () {
        validateContracts();
        if ($scope.Errors.length != 0) return;

        var updatedAssignedContracts = [];
        for (var i = 0; i < $scope.CopiedLocations.length; i++) {
            var location = $scope.CopiedLocations[i];

            for (var j = 0; j < location.Properties.length; j++) {
                var property = location.Properties[j];

                updatedAssignedContracts = updatedAssignedContracts.concat($.grep(property.AssignedContracts, function (contract) { return contract.RiskCompanyId == $scope.riskCompany.Id; }));
            }
        }

        Metronic.blockUI({ target: ".modal-dialog", animate: true, overlayColor: "none" });
        policyService.updateAssignedContracts($scope.Policy.Id, updatedAssignedContracts).then(function (result) {
            Metronic.unblockUI(".modal-dialog");
            if (result.data.Result.Success) {
                $scope.parent.Policy = result.data.Policy;
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];

                $scope.Policy = $scope.parent.Policy;
                $scope.CopiedLocations = $.extend(true, [], $scope.parent.Policy.CurrentVersion.Locations);

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
                }
            }
        });

        modalInstance.result.then(function (data) {
            var code = $.grep($scope.parent.Policy.CurrentVersion.ClassCodes, function (x) { return x.Id == classCode.Id })[0];
            if (code != null && data.ClassCode != null)
                code = data.ClassCode;
            if (data.PremiumBreakdowns != null) {
                $scope.parent.Policy.CurrentVersion.Premiums = data.PremiumBreakdowns;
            }
        });
    }

    $scope.expandModal = function (resize) {
        if ($scope.expanded || resize) {
            $(".modal-dialog").css("width", "1200px");
            $("#coverages-holder").css("max-height", "500px");
            $("#coverages-holder").css("height", ($(window).height() - 250) + "px");
        } else {
            $(".modal-dialog").css("width", "98%");
            $("#coverages-holder").css("max-height", ($(window).height() - 250) + "px");
            $("#coverages-holder").css("height", ($(window).height() - 250) + "px");
        }

        if (!resize)
            $scope.expanded = !$scope.expanded;
    }
    setTimeout(function () {
        $scope.expandModal(true);
    }, 50);

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

            if (l.LimitName == 'Coverage A' || l.LimitName == 'Coverage B' || l.LimitName == 'Coverage C' || l.LimitName == 'Coverage D') {
                limit += l.Amount;
            }
        }

        return limit;
    }

    $scope.rate = function (contract) {
        var _limits = contract.Limits.filter(x => x.Amount != null && x.Amount > 0);
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ((l.LimitName == 'Coverage A' || l.LimitName == 'Coverage B' || l.LimitName == 'Coverage C' || l.LimitName == 'Coverage D') && l.DevelopedRate > 0) {
                return l.DevelopedRate;
            }
        }
        return '';
    }

    $scope.windLoad = function (contract) {
        var _limits = contract.Limits.filter(x => x.Amount != null && x.Amount > 0);
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ((l.LimitName == 'Coverage A' || l.LimitName == 'Coverage B' || l.LimitName == 'Coverage C' || l.LimitName == 'Coverage D') && l.DevelopedWindLoad > 0) {
                return l.DevelopedWindLoad;
            }
        }
        return '';
    }

    $scope.developedFinalRate = function (contract) {
        var _limits = contract.Limits.filter(x => x.Amount != null && x.Amount > 0);
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ((l.LimitName == 'Coverage A' || l.LimitName == 'Coverage B' || l.LimitName == 'Coverage C' || l.LimitName == 'Coverage D') && l.DevelopedFinalRate > 0) {
                return l.DevelopedFinalRate;
            }
        }
        return '';
    }

    $scope.finalRate = function (contract) {
        var _limits = contract.Limits.filter(x => x.Amount != null && x.Amount > 0);
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if ((l.LimitName == 'Coverage A' || l.LimitName == 'Coverage B' || l.LimitName == 'Coverage C' || l.LimitName == 'Coverage D') && l.FinalRate > 0) {
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

            if (l.LimitName == 'Coverage A' || l.LimitName == 'Coverage B' || l.LimitName == 'Coverage C' || l.LimitName == 'Coverage D') {
                if (_finalRate != null && _finalRate != l.FinalRate)
                    return false;
                _finalRate = l.FinalRate;
            }
        }

        _finalRate = null;
        for (var i = 0; i < _limits.length; i++) {
            var l = _limits[i];

            if (l.LimitName == 'Coverage A' || l.LimitName == 'Coverage B' || l.LimitName == 'Coverage C' || l.LimitName == 'Coverage D') {
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

            if (l.LimitName == 'Coverage A' || l.LimitName == 'Coverage B' || l.LimitName == 'Coverage C' || l.LimitName == 'Coverage D') {
                l.FinalRate = contract.FinalRate;
                $scope.calculateLimitRate(l, contract);
            }
        }
    }

    $scope.isPropertyLimit = function (limitName) {
        var acceptedNames = ["Coverage A", "Coverage B", "Coverage C", "Coverage D"];
        return acceptedNames.some(function (name) { return limitName == name });
    }

    $scope.addCreditDebit = function () {
        var modalInstance = $modal.open({
            templateUrl: "addCreditDebit.html",
            controller: "test_Homeowners_AddCreditDebitCtrl",
            size: "md",
            backdrop: "static",
            resolve: {
                locations: function () { return $scope.CopiedLocations }
            }
        });

        modalInstance.result.then(function (data) {
            if (data != "cancel") {
                var riskCompanyId = $scope.riskCompany.Id;

                for (var i = 0; i < $scope.CopiedLocations.length; i++) {
                    var location = $scope.CopiedLocations[i];
                    for (var j = 0; j < location.Properties.length; j++) {
                        var property = location.Properties[j];
                        var selected = data.SelectedProperties.some(function (id) { return property.Id == id });
                        if (!selected) continue;

                        for (var k = 0; k < property.AssignedContracts.length; k++) {
                            var contract = property.AssignedContracts[k];
                            if (contract.RiskCompanyId != riskCompanyId || !contract.Final) continue;

                            for (var l = 0; l < contract.Limits.length; l++) {
                                var limit = contract.Limits[l];
                                if (!$scope.isPropertyLimit(limit.LimitName)) continue;

                                if (limit.DevelopedFinalRate > 0) {
                                    switch (data.RateType) {
                                        case "Credit/Debit Mod":
                                            limit.FinalRate = limit.DevelopedFinalRate * data.Rate;
                                            break;
                                        default:
                                            limit.FinalRate = data.Rate;
                                            break;
                                    }
                                    limit.FinalRate = Math.round(limit.FinalRate * 100000) / 100000;
                                    contract.FinalRate = limit.FinalRate;
                                    $scope.calculateLimitRate(limit, contract);
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}]);

MALACHIAPP.controller('test_Homeowners_submitQuoteCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policy', 'policyId', 'riskCompanyId', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, policy, policyId, riskCompanyId) {
    $scope.PolicyId = policyId;
    $scope.Policy = policy;
    $scope.SubmitReason = '';
    $scope.RiskCompanyId = riskCompanyId;

    var submit = $.grep($scope.Policy.Submits, function (x) {
        return x.RiskCompanyId == $scope.RiskCompanyId && x.VersionNumber == $scope.Policy.VersionNumber;
    });

    if (submit.length > 0) $scope.SubmitReason = submit[0].UserNotes;

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.submit = function () {
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        policyService.submitQuote($scope.PolicyId, $scope.RiskCompanyId, $scope.SubmitReason).then(function (result) {
            Metronic.unblockUI('.modal-dialog');

            if (result.data.Result.Success) {
                $modalInstance.close({ SubmitRequested: true });
                $scope.Policy.Submits = result.data.Submits;
                notificationsHub.showSuccess('Quote ' + $scope.Policy.Number, 'Quote Submitted for review!');
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }
}]);

MALACHIAPP.controller('test_Homeowners_addContract', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'contracts', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, contracts) {
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

MALACHIAPP.controller("test_Homeowners_AddCreditDebitCtrl", ['authService', '$rootScope', '$scope', '$sce', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', '$modalInstance', 'settings', 'policyService', 'toolsService', 'locations', function (authService, $rootScope, $scope, $sce, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, $modalInstance, settings, policyService, toolsService, locations) {
    $scope.Properties = [];
    $scope.Errors = [];
    $scope.RateTypeOptions = ["Override", "Credit/Debit Mod"];
    $scope.Settings = {
        RateType: $scope.RateTypeOptions[0],
        Rate: null,
        SelectedProperties: []
    };

    for (var i = 0; i < locations.length; i++) {
        var location = locations[i];
        for (var j = 0; j < location.Properties.length; j++) {
            var property = location.Properties[j];
            $scope.Properties.push({
                Id: property.Id,
                LocationNumber: location.LocationNumber,
                BuildingNumber: property.BuildingNumber
            });
        }
    }

    // Default to the first property since NPL quotes only have one property.
    $scope.Settings.SelectedProperties.push($scope.Properties[0].Id);

    $scope.close = function () {
        $modalInstance.dismiss("cancel");
    }

    $scope.apply = function () {
        validateInputs();
        if ($scope.Errors.length == 0)
            $modalInstance.close($scope.Settings);
    }

    $scope.getRateTypeDescription = function () {
        switch ($scope.Settings.RateType) {
            case "Credit/Debit Mod":
                return "Enter the credit/debit mod you would like to use.";
            default:
                return "Enter the new rate you would like to use.";
        }
    }

    //$scope.selectAllProperties = function () {
    //    $scope.Settings.SelectedProperties = [];

    //    for (var i = 0; i < $scope.Properties.length; i++) {
    //        var propertyId = $scope.Properties[i].Id;
    //        $scope.Settings.SelectedProperties.push(propertyId);
    //    }
    //}

    //$scope.deselectAllProperties = function () {
    //    $scope.Settings.SelectedProperties = [];
    //}

    function validateInputs() {
        $scope.Errors = [];

        //if ($scope.Settings.SelectedProperties.length == 0)
        //    $scope.Errors.push("Select one or more properties to apply the changes.");

        if ($scope.Settings.Rate == null || $scope.Settings.Rate < 0) {
            switch ($scope.Settings.RateType) {
                case "Credit/Debit Mod":
                    $scope.Errors.push("Please enter a rate greater than or equal to 0 for the rate mod.");
                    break;
                default:
                    $scope.Errors.push("Please enter a rate greater than or equal to 0 for the rate override.");
                    break;
            }
        }
    }
}]);

MALACHIAPP.controller('test_Homeowners_showFloodCoveragesCtrl', ['authService', '$rootScope', '$scope', '$sce', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', '$modalInstance', 'settings', 'policyService', 'toolsService', 'policyId', 'riskCompany', 'parent', 'scope', 'test_policyService', function (authService, $rootScope, $scope, $sce, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, $modalInstance, settings, policyService, toolsService, policyId, riskCompany, parent, scope, test_policyService) {
    $scope.PolicyId = policyId;
    $scope.riskCompany = riskCompany;
    $scope.Policy = parent.Policy;
    $scope.parent = parent;
    $scope.scope = scope;
    $scope.Errors = [];
    $scope.FloodInfo = $scope.Policy.CurrentVersion.FloodCoverages[0];

    var contracts = riskCompany.Contracts;



    $scope.close = function (data) {
        $modalInstance.close(data);
    };


    $scope.expandModal = function (resize) {
        if ($scope.expanded || resize) {
            $(".modal-dialog").css("width", "1200px");
            $("#coverages-holder").css("max-height", "500px");
            $("#coverages-holder").css("height", ($(window).height() - 250) + "px");
        } else {
            $(".modal-dialog").css("width", "98%");
            $("#coverages-holder").css("max-height", ($(window).height() - 250) + "px");
            $("#coverages-holder").css("height", ($(window).height() - 250) + "px");
        }

        if (!resize)
            $scope.expanded = !$scope.expanded;
    }
    setTimeout(function () {
        $scope.expandModal(true);
    }, 50);

    $(window).resize(function () {
        if ($scope.expanded) {
            $(".modal-dialog").css("width", "98%");
            $("#coverages-holder").css("max-height", ($(window).height() - 250) + "px");
            $("#coverages-holder").css("height", ($(window).height() - 250) + "px");
        }
    });

}]);

MALACHIAPP.controller('test_Homeowners_floodCoveragesCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', '$filter', 'settings', 'policyService', 'toolsService', 'floodQuote', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, $filter, settings, policyService, toolsService, floodQuote) {
    $scope.FloodQuote = floodQuote;

    $scope.Errors = [];

    $scope.close = function (data) {
        if (data != "cancel") {
        }

        $modalInstance.close(data);
    };

    $scope.optionClicked = function (option, quote) {
        $scope.PolicyFloodCoverage = {};

        // Set up the object to be sent to the server
        $scope.PolicyFloodCoverage = {
            QuoteId: quote.QuoteId,
            OptionNumber: option.OptionNumber
        }

        console.log('The quote has these stats:' +
            $scope.PolicyFloodCoverage.QuoteId +
            ', ' +
            $scope.PolicyFloodCoverage.OptionNumber);

        $scope.close($scope.PolicyFloodCoverage);
    }

}]);

MALACHIAPP.controller('test_Homeowners_creditAccountability', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'authService', 'policyId', 'versionId', 'riskCompany', 'creditEntry', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, authService, policyId, versionId, riskCompany, creditEntry) {
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
        policyService.createPolicyVersionCreditEntry($scope.PolicyId, "Homeowners", $scope.CreditEntry).then(function (result) {
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