MALACHIAPP.factory('customPackageService', [function () {
  class CustomPackageGroup {
    constructor(riskCompanyId, propertyRiskCompanyId, propertyLongName, propertyShortName, liabilityRiskCompanyId, liabilityLongName, liabilityShortName, riskCompanyName, name) {
      this.Id = riskCompanyId;
      this.riskCompanyId = riskCompanyId;
      this.riskCompanyName = riskCompanyName;
      this.name = name;
      this.propertyRiskCompany = {
        Id: propertyRiskCompanyId,
        Name: propertyLongName,
        ShortName: propertyShortName
      };
      this.liabilityRiskCompany = {
        Id: liabilityRiskCompanyId,
        Name: liabilityLongName,
        ShortName: liabilityShortName
      };

      this.coverages = [];
    }
  }

  var customPackage = {};
  var customPackages = [];

  // SAFETY & RLI
  customPackages.push(new CustomPackageGroup("f1a73156-b097-474d-9949-fd1933e806ee",
    "f20153c2-7b31-42f0-b3cb-26c6bc82eaf0", "Safety Specialty Insurance Company", "Safety",
    "b216d262-52f0-4864-aec9-3411acf7c218", "RLI Insurance Company", "RLI",
    "Safety Specialty & RLI", "Custom Package"));

  // TRISURA & RLI
  customPackages.push(new CustomPackageGroup("22f75091-96c6-477f-b619-0ce86bae3984",
    "29db6946-0124-4a09-9d6f-5e4ff22f1980", "Trisura Specialty Insurance Company", "Trisura",
    "b216d262-52f0-4864-aec9-3411acf7c218", "RLI Insurance Company", "RLI",
    "Trisura & RLI", "Trisura & RLI Custom Package"));

  // GetCustomPackage given a risk companyId
  getCustomPackage = (riskCompanyId) => customPackages.find((x) => x.riskCompanyId == riskCompanyId);
  isCustomPackage = (riskCompanyId) => customPackages.find((x) => x.riskCompanyId == riskCompanyId) != null;

  customPackage.initializeCoverages = function (policy) {
    if (policy != null) {
      customPackages.forEach(package => {
        package.coverages = [];
        var propertyCoverage = Object.assign({}, policy.CurrentVersion.Coverages.find(function (x) { return x.Name == "Property" }));
        if (propertyCoverage && propertyCoverage.Name) {
          propertyCoverage.riskCompanyId = package.propertyRiskCompany.Id;
          package.coverages.push(propertyCoverage);
        }

        var liabilityCoverage = Object.assign({}, policy.CurrentVersion.Coverages.find(function (x) { return x.Name == "Liability" }));
        if (liabilityCoverage && liabilityCoverage.Name) {
          liabilityCoverage.riskCompanyId = package.liabilityRiskCompany.Id;
          package.coverages.push(liabilityCoverage);
        }
      });
    }
  };


  customPackage.isCustomPackage = function (riskCompanyId) {
    return isCustomPackage(riskCompanyId);
  };


  customPackage.getCoverages = function (riskCompanyId) {
    return getCustomPackage(riskCompanyId).coverages;
  };

  customPackage.getRiskCompany = function (riskCompanyId) {
    return getCustomPackage(riskCompanyId);
  };

  customPackage.getRiskCompanyName = function (riskCompanyId) {
    return getCustomPackage(riskCompanyId).riskCompanyName;
  };

  customPackage.getRiskCompanies = function (riskCompanies) {
    return riskCompanies.filter(function (x) { return isCustomPackage(x.Id); });
  };

  customPackage.getCoverageRiskCompany = function (coverageName, riskCompanyId) {
    if (coverageName == getCustomPackage(riskCompanyId).coverages[0].Name)
      return getCustomPackage(riskCompanyId).propertyRiskCompany;
    else if (coverageName == getCustomPackage(riskCompanyId).coverages[1].Name)
      return getCustomPackage(riskCompanyId).liabilityRiskCompany;
    else
      return null;
  };

  customPackage.getCoveragePremiumBreakdown = function (coverageName, coverageRiskCompanyId, riskCompanyId, policy) {
    var riskCompanyPremium = policy.CurrentVersion.Premiums.find(function (x) { return x.RiskCompanyId == riskCompanyId; });

    if (riskCompanyPremium)
      return riskCompanyPremium.Breakdown.find(function (x) { return x.Name == (coverageName + " Premium") && x.RiskCompanyId == coverageRiskCompanyId; });
    else
      return null;
  };

  customPackage.GetEquipmentBreakdownPremium = function (policy, riskCompanyId) {
    var eqbCoverages = policy.CurrentVersion.EquipmentBreakdownCoverages;
    if (eqbCoverages.length == 0)
      return -1;

    var eqbCoverage = eqbCoverages.find(function (x) { return x.RiskCompanyId == getCustomPackage(riskCompanyId).propertyRiskCompany.Id; });
    if (!eqbCoverage)
      return -1;

    return eqbCoverage.Premium;
  };

  customPackage.getTotalBasePremium = function (policy, riskCompanyId) {
    var propertyBreakdown = customPackage.getCoveragePremiumBreakdown(getCustomPackage(riskCompanyId).coverages[0].Name, getCustomPackage(riskCompanyId).propertyRiskCompany.Id, riskCompanyId, policy);
    var liabilityBreakdown = customPackage.getCoveragePremiumBreakdown(getCustomPackage(riskCompanyId).coverages[1].Name, getCustomPackage(riskCompanyId).liabilityRiskCompany.Id, riskCompanyId, policy);

    var total = getPremiumFromBreakdown(propertyBreakdown) + getPremiumFromBreakdown(liabilityBreakdown);

    return total;

    var triaBreakdown = customPackage.getCoveragePremiumBreakdown("TRIA", riskCompanyId, riskCompanyId, policy);

    if (triaBreakdown)
      total += getPremiumFromBreakdown(triaBreakdown);

    return total;
  };

  customPackage.getCoveragePremium = function (coverageName, policy, riskCompanyId) {
    var coverageRiskCompanyId = customPackage.getCoverageRiskCompany(coverageName, riskCompanyId).Id;

    var coveragePremiumBreakdown = customPackage.getCoveragePremiumBreakdown(coverageName, coverageRiskCompanyId, riskCompanyId, policy);
    var coveragePremium = getPremiumFromBreakdown(coveragePremiumBreakdown);

    /* REMOVE EQB PREMIUM FROM PROPERTY PREMIUM IF EXISTS */
    if (coverageName == "Property" && !customPackage.IsEquipmentBreakdownDeclined(policy, riskCompanyId)) {
      coveragePremium -= customPackage.GetEquipmentBreakdownPremium(policy, riskCompanyId);
    }

    return coveragePremium;
  };

  customPackage.exists = function (riskCompanies, policy, riskCompanyId) {
    if (getCustomPackage(riskCompanyId).coverages.length != 2)
      return false;
    var customPackageRiskCompanies = customPackage.getRiskCompanies(riskCompanies);
    return customPackageRiskCompanies.length > 0;
  };

  customPackage.getEligibilityQuestions = function (policy, riskCompanyId) {
    if (getCustomPackage(riskCompanyId).coverages.length != 2)
      return [];

    var propertyCoverageId = getCustomPackage(riskCompanyId).coverages[0].CoverageId;
    var liabilityCoverageId = getCustomPackage(riskCompanyId).coverages[1].CoverageId;

    var propertyEligibilityQuestions = policy.CurrentVersion.Questions.filter(function (x) { return x.RiskCompanyId == getCustomPackage(riskCompanyId).propertyRiskCompany.Id && x.CoverageId == propertyCoverageId; });
    var liabilityEligibilityQuestions = policy.CurrentVersion.Questions.filter(function (x) { return x.RiskCompanyId == getCustomPackage(riskCompanyId).liabilityRiskCompany.Id && x.CoverageId == liabilityCoverageId; });

    var customPackageEligibilityQuestions = [];
    customPackageEligibilityQuestions = propertyEligibilityQuestions.concat(liabilityEligibilityQuestions);

    return customPackageEligibilityQuestions;
  };

  customPackage.getRatingQuestions = function (policy, riskCompanyId) {
    var propertyRatingQuestions = getRatingQuestions(policy, getCustomPackage(riskCompanyId).propertyRiskCompany.Id);
    var liabilityRatingQuestions = getRatingQuestions(policy, getCustomPackage(riskCompanyId).liabilityRiskCompany.Id);

    var customPackageRatingQuestions = [];
    customPackageRatingQuestions = propertyRatingQuestions.concat(liabilityRatingQuestions);

    return customPackageRatingQuestions;
  };

  customPackage.allEligibilityQuestionsAnswered = function (policy, riskCompanyId) {
    return customPackage.getEligibilityQuestions(policy, riskCompanyId).every(function (x) {
      var isRli = x.RiskCompanyId == "b216d262-52f0-4864-aec9-3411acf7c218";
      var answer = isRli && !policy.Bound ? x.SelectedAnswer : x.Answer;
      return answer != null && answer.length > 0;
    });
  };

  customPackage.isDeclined = function (policy, riskCompanyId) {
    if (policy == null || policy.CurrentVersion == null)
      return true;
    if (policy.CurrentVersion.Premiums == null || policy.CurrentVersion.Premiums.length == 0)
      return true;

    /* EQB */
    if (policy.CurrentVersion.Coverages.some(x => x.Name == "Equipment Breakdown") && customPackage.IsEquipmentBreakdownDeclined(policy, riskCompanyId))
      return true;

    /* PROPERTY */
    if (getCustomPackage(riskCompanyId).coverages.some(x => x.Name == "Property") && customPackage.isPropertyDeclined(policy, riskCompanyId))
      return true;

    /* LIABILITY */
    if (getCustomPackage(riskCompanyId).coverages.some(x => x.Name == "Liability") && customPackage.isLiabilityDeclined(policy, riskCompanyId))
      return true;

    return false;
  };

  customPackage.isPropertyDeclined = function (policy, riskCompanyId) {
    var coverage = getCustomPackage(riskCompanyId).coverages.find(function (x) { return x.Name == "Property"; });

    if (!coverage)
      return true;

    var propertyBreakdown = customPackage.getCoveragePremiumBreakdown(coverage.Name, getCustomPackage(riskCompanyId).propertyRiskCompany.Id, riskCompanyId, policy);
    if (propertyBreakdown == null)
      return true;

    if (getPremiumFromBreakdown(propertyBreakdown) == 0)
      return true;

    /* TODO: Factor out contract declines */
    var propertyDeclines = policy.CurrentVersion.ContractDeclines.filter(function (x) { return x.RiskCompanyId == getCustomPackage(riskCompanyId).propertyRiskCompany.Id && x.CoverageName == coverage.Name; });
    var propertyDeclineOverrides = policy.CurrentVersion.ContractDeclineOverrides.filter(function (x) { return x.RiskCompanyId == getCustomPackage(riskCompanyId).propertyRiskCompany.Id && x.CoverageName == coverage.Name; });

    var propertyDeclinesWithOverrides = propertyDeclines.filter(function (x) {
      return propertyDeclineOverrides.some(function (y) {
        return x.ContractId == y.ContractId && x.Reason == y.Reason;
      });
    });

    if (propertyDeclinesWithOverrides.length != propertyDeclines.length) {
      var finalAssignedContracts = getFinalAssignedContracts(policy, getCustomPackage(riskCompanyId).propertyRiskCompany.Id);
      if (finalAssignedContracts.length == 0)
        return true;
    }

    return false;
  };

  customPackage.isLiabilityDeclined = function (policy, riskCompanyId) {
    var coverage = getCustomPackage(riskCompanyId).coverages.find(function (x) { return x.Name == "Liability"; });

    if (!coverage)
      return true;

    var liabilityBreakdown = customPackage.getCoveragePremiumBreakdown(coverage.Name, getCustomPackage(riskCompanyId).liabilityRiskCompany.Id, riskCompanyId, policy);
    if (liabilityBreakdown == null)
      return true;

    if (getPremiumFromBreakdown(liabilityBreakdown) == 0)
      return true;

    var liabilityContract = policy.CurrentVersion.Liability.RiskCompanyContracts.find(function (x) { return x.RiskCompanyId == getCustomPackage(riskCompanyId).liabilityRiskCompany.Id });
    if (!liabilityContract)
      return true;

    var liabilityDeclines = policy.CurrentVersion.ContractDeclines.filter(function (x) { return x.ContractId == liabilityContract.Id && x.CoverageName == coverage.Name; });
    if (liabilityDeclines.length > 0)
      return true;

    for (var i = 0; i < policy.CurrentVersion.ClassCodes.length; i++) {
      var classCode = policy.CurrentVersion.ClassCodes[i];
      var result = classCode.ClassCodeRatingResults.find(function (x) { return x.ContractId == liabilityContract.ContractId; });
      var input = classCode.ClassCodeRatingInputs.find(function (x) { return x.ContractId == liabilityContract.ContractId; });

      if (input == null)
        return true;
      if (result == null && input.RateBy != "If Any" && !input.IsIgnored)
        return true;
    }

    /* TODO: Factor out contract declines */
    liabilityDeclines = policy.CurrentVersion.ContractDeclines.filter(function (x) { return x.RiskCompanyId == getCustomPackage(riskCompanyId).liabilityRiskCompany.Id && x.CoverageName == coverage.Name; }); // WHY?
    var liabilityDeclineOverrides = policy.CurrentVersion.ContractDeclineOverrides.filter(function (x) { return x.RiskCompanyId == getCustomPackage(riskCompanyId).liabilityRiskCompany.Id && x.CoverageName == coverage.Name; });

    var liabilityDeclinesWithOverrides = liabilityDeclines.filter(function (x) {
      return liabilityDeclineOverrides.some(function (y) {
        return x.ContractId == y.ContractId && x.Reason == y.Reason;
      });
    });

    if (liabilityDeclinesWithOverrides.length != liabilityDeclines.length)
      return true;

    return false;
  };

  customPackage.IsEquipmentBreakdownDeclined = function (policy, riskCompanyId) {
    var eqbCoverages = policy.CurrentVersion.EquipmentBreakdownCoverages;
    if (eqbCoverages.length == 0)
      return true;

    var eqbCoverage = eqbCoverages.find(function (x) { return x.RiskCompanyId == getCustomPackage(riskCompanyId).propertyRiskCompany.Id; });
    if (!eqbCoverage)
      return true;

    if (!eqbCoverage.Premium || eqbCoverage.Premium < 0)
      return true;

    return false;
  };

  customPackage.isCustomPackageRiskCompany = function (riskCompany) {
    return isCustomPackage(riskCompany.Id);
  };

  customPackage.getCoverageForms = function (policyForms, riskCompanies, coverageName, riskCompanyId) {
    var customPackageRiskCompany = getCustomPackage(riskCompanyId);
    var coverageRiskCompanyId = '';

    if (coverageName == customPackageRiskCompany.coverages[0].Name)
      coverageRiskCompanyId = customPackageRiskCompany.propertyRiskCompany.Id;
    else if (coverageName == customPackageRiskCompany.coverages[1].Name)
      coverageRiskCompanyId = customPackageRiskCompany.liabilityRiskCompany.Id;

    var filteredForms = policyForms.filter(function (x) {
      return x.RiskCompanyId == customPackageRiskCompany.Id && x.OriginalRiskCompanyId == coverageRiskCompanyId;
    });

    return filteredForms;
  };

  function getPremiumFromBreakdown(breakdown) {
    if (breakdown.Amount)
      return breakdown.Amount;
    else
      return breakdown.DevelopedAmount;
  }

  function getRatingQuestions(policy, riskCompanyId) {
    var ratingQuestions = [];
    var version = policy.CurrentVersion;

    for (var i = 0; i < version.Locations.length; i++) {
      var location = version.Locations[i];

      for (var j = 0; j < location.Properties.length; j++) {
        var property = location.Properties[j];

        for (var k = 0; k < property.AssignedContracts.length; k++) {
          var contract = property.AssignedContracts[k];

          for (var q = 0; q < contract.Questions.length; q++) {
            var question = contract.Questions[q];
            var existingQuestion = ratingQuestions.find(function (x) { return x.Question == question.Question });

            if (existingQuestion == null) {
              ratingQuestions.push({
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

    if (riskCompanyId) {
      ratingQuestions = ratingQuestions.filter(function (x) {
        return x.RiskCompanies.some(function (y) {
          return y == riskCompanyId;
        });
      });
    }

    return ratingQuestions;
  }

  function getFinalAssignedContracts(policy, riskCompanyId) {
    var contracts = [];

    var version = policy.CurrentVersion;
    version.Locations.forEach(function (location) {
      location.Properties.forEach(function (property) {
        property.AssignedContracts.forEach(function (contract) {
          if (contract.RiskCompanyId == riskCompanyId && contract.Final) {
            contracts.push(contract.ContractId);
          }
        });
      });
    });

    return contracts.filter(function (x, i) { return contracts.indexOf(x) === i }); // Distinct
  }

  return customPackage;
}]);

