MALACHIAPP.factory('rateService', ['$http', 'ngAuthSettings', 'customPackageService', function ($http, ngAuthSettings, customPackageService) {

  var serviceBase = ngAuthSettings.apiServiceBaseUri;
  // Rate Service Keeps track of rating individual risk companies and notifies the subscriber when a company is finished rating
  // When all companies rate, the last request is to save the changes.
  // Use the container to generate a new session given the policy 
  // Call rateService.beginRating() to begin rating and get the final policy info.
  var rateServiceContainer = {};
  rateServiceContainer.newRatingSession = function (policy, riskCompanies) {
    var rateService = {};
    rateService.RequestId = guid(); // Generate random guid for the session

    // 
    rateService.beginRating = new Promise((resolve, reject) => {
      Metronic.blockUI({
        animate: true, overlayColor: 'none', zIndex: 9999999
      });

      $http.post(serviceBase + 'api/rating/ShouldRatePolicy', {
        PolicyId: policy.Id
      }).then(function (result) {
        if (result.data.ShouldRate) {
          // Clear the policy
          clearPolicy();

          var counter = 0;
          var riskCompaniesToSend = [];
          var promises = [];

          // Get Eligibility Questions for policy
          promises.push($http.post(serviceBase + 'api/rating/GetEligibilityQuestions', {
            PolicyId: policy.Id,
            RequestId: rateService.RequestId
          }).then(function (result) { }));

          promises.push($http.post(serviceBase + 'api/rating/ResetPolicyData', {
            PolicyId: policy.Id,
            VersionId: policy.CurrentVersion.Id
          }).then(function (result) {
          }));

          // Get All risk companies
          riskCompanies.forEach((riskCompany) => {
            riskCompany.ratingInProgress = true;
            riskCompaniesToSend.push(riskCompany.Id);
            if (!customPackageService.isCustomPackage(riskCompany.Id)) {
              // Rate Each company and increase counter when rate is done
              promises.push($http.post(serviceBase + 'api/rating/RateRiskCompany', {
                PolicyId: policy.Id,
                RequestId: rateService.RequestId,
                RiskCompanyId: riskCompany.Id
              }).then(function (result) {
                counter++;
                // Notify the client
                if (rateService.onNotifyRiskCompanyRated != null) {
                  rateService.onNotifyRiskCompanyRated(
                    result.data.ClassCodeRatingResults,
                    result.data.AssignedContracts,
                    result.data.AssignedContractQuestions,
                    result.data.Forms,
                    result.data.VersionContractDeclines,
                    result.data.VersionContractDeclineOverrides,
                    result.data.VersionContractSubmits,
                    result.data.Premium,
                    riskCompany
                  );
                }
              }));
            }
          });

          Promise.all(promises).then(function (values) {
            // Finalize Rating
            $http.post(serviceBase + 'api/rating/SaveRateResults', {
              PolicyId: policy.Id,
              RequestId: rateService.RequestId,
              RiskCompanies: riskCompaniesToSend
            }).then(function (result) {
              riskCompanies.forEach((riskCompany) => {
                riskCompany.ratingInProgress = false;
              });
              Metronic.unblockUI();
              resolve(result.data.Policy);
            });
          });

          if (rateService.onRatingBegins != null) rateService.onRatingBegins();
        } else {
          riskCompanies.forEach((riskCompany) => {
            riskCompany.ratingInProgress = false;
          });
          Metronic.unblockUI();
          resolve(result.data.Policy);
        }
      });
    });

    function clearPolicy() {
      policy.CurrentVersion.Locations.forEach(location => {
        location.Properties.forEach(property => {
          property.AssignedContracts = [];
          property.AssignedContractQuestions = [];
        });
      });

      policy.CurrentVersion.ClassCodes.forEach(classCode => {
        classCode.ClassCodeRatingResults = [];
      });

      policy.CurrentVersion.ContractDeclines = [];
      policy.CurrentVersion.Premiums = [];

    };

    return rateService;
  };

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
  return rateServiceContainer;
}]);

