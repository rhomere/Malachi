"use strict";

MALACHIAPP.controller("EdmRiskReportController", ["$rootScope", "$scope", "$http", "$timeout", "$location", "$modal", "authService", "policyService", "notificationsHub", "ngAuthSettings", "localStorageService", ($rootScope, $scope, $http, $timeout, $location, $modal, authService, policyService, notificationsHub, ngAuthSettings, localStorageService) => {
  $scope.$on("$viewContentLoaded", () => {
    // Initialize core components.
    Metronic.initAjax();
    // Set sidebar closed and body solid layout mode.
    $rootScope.settings.layout.pageBodySolid = false;
  });

  if (!authService.authentication.isAuth) {
    $location.path("/login");
  }

  $scope.Errors = [];
  $scope.Report = {
    EffectiveFrom: null,
    EffectiveTo: null,
    Brokers: [],
    Markets: [],
    States: []
  };
  $scope.Brokers = [];
  $scope.Markets = [];
  $scope.States = [
    { Index: 1, Name: "Alabama", Code: "AL" },
    { Index: 2, Name: "Alaska", Code: "AK" },
    { Index: 3, Name: "Arizona", Code: "AZ" },
    { Index: 4, Name: "Arkansas", Code: "AR" },
    { Index: 5, Name: "California", Code: "CA" },
    { Index: 6, Name: "Colorado", Code: "CO" },
    { Index: 7, Name: "Connecticut", Code: "CT" },
    { Index: 8, Name: "District of Columbia", Code: "DC" },
    { Index: 9, Name: "Delaware", Code: "DE" },
    { Index: 10, Name: "Florida", Code: "FL" },
    { Index: 11, Name: "Georgia", Code: "GA" },
    { Index: 12, Name: "Hawaii", Code: "HI" },
    { Index: 13, Name: "Idaho", Code: "ID" },
    { Index: 14, Name: "Illinois", Code: "IL" },
    { Index: 15, Name: "Indiana", Code: "IN" },
    { Index: 16, Name: "Iowa", Code: "IA" },
    { Index: 17, Name: "Kansas", Code: "KS" },
    { Index: 18, Name: "Kentucky", Code: "KY" },
    { Index: 19, Name: "Louisiana", Code: "LA" },
    { Index: 20, Name: "Maine", Code: "ME" },
    { Index: 21, Name: "Maryland", Code: "MD" },
    { Index: 22, Name: "Massachusetts", Code: "MA" },
    { Index: 23, Name: "Michigan", Code: "MI" },
    { Index: 24, Name: "Minnesota", Code: "MN" },
    { Index: 25, Name: "Mississippi", Code: "MS" },
    { Index: 26, Name: "Missouri", Code: "MO" },
    { Index: 27, Name: "Montana", Code: "MT" },
    { Index: 28, Name: "Nebraska", Code: "NE" },
    { Index: 29, Name: "Nevada", Code: "NV" },
    { Index: 30, Name: "New Hampshire", Code: "NH" },
    { Index: 31, Name: "New Jersey", Code: "NJ" },
    { Index: 32, Name: "New Mexico", Code: "NM" },
    { Index: 33, Name: "New York", Code: "NY" },
    { Index: 34, Name: "North Carolina", Code: "NC" },
    { Index: 35, Name: "North Dakota", Code: "ND" },
    { Index: 36, Name: "Ohio", Code: "OH" },
    { Index: 37, Name: "Oklahoma", Code: "OK" },
    { Index: 38, Name: "Oregon", Code: "OR" },
    { Index: 39, Name: "Pennsylvania", Code: "PA" },
    { Index: 40, Name: "Rhode Island", Code: "RI" },
    { Index: 41, Name: "South Carolina", Code: "SC" },
    { Index: 42, Name: "South Dakota", Code: "SD" },
    { Index: 43, Name: "Tennessee", Code: "TN" },
    { Index: 44, Name: "Texas", Code: "TX" },
    { Index: 45, Name: "Utah", Code: "UT" },
    { Index: 46, Name: "Vermont", Code: "VT" },
    { Index: 47, Name: "Virginia", Code: "VA" },
    { Index: 48, Name: "Washington", Code: "WA" },
    { Index: 49, Name: "West Virginia", Code: "WV" },
    { Index: 50, Name: "Wisconsin", Code: "WI" },
    { Index: 51, Name: "Wyoming", Code: "WY" },
    { Index: 52, Name: "Puerto Rico", Code: "PR" },
    { Index: 53, Name: "Alberta", Code: "AB" },
    { Index: 54, Name: "British Columbia", Code: "BC" },
    { Index: 55, Name: "Manitoba", Code: "MB" },
    { Index: 56, Name: "New Brunswick", Code: "NB" },
    { Index: 57, Name: "New Foundland", Code: "NL" },
    { Index: 58, Name: "Northwest Territories", Code: "NT" },
    { Index: 59, Name: "Nova Scotia", Code: "NS" },
    { Index: 60, Name: "Ontario", Code: "ON" },
    { Index: 61, Name: "Prince Edward Island", Code: "PE" },
    { Index: 62, Name: "Quebec", Code: "QC" },
    { Index: 63, Name: "Saskatchewan", Code: "SK" },
    { Index: 64, Name: "Yukon Territories", Code: "YT" }
  ];

  $scope.requestReport = function () {
    $scope.errorList = [];
    $scope.validate();
    if ($scope.errorList.length > 0) return;

    var params = $scope.Report;

    Metronic.blockUI({ animate: true, overlayColor: "none" });
    $http.post(window.reportsAPI + "api/export/RequestEdmRisk", params).then(result => {
      Metronic.unblockUI();
      if (result.data.Success) {
        notificationsHub.showSuccess("Request Successful", "Your request has been acknowledged and your report is being prepared. "
          + "You will receive an email with the report attached and summary details in a few minutes.");
      }
      else {
        notificationsHub.showError("Request Failed", "A problem has occurred with sending your request. Please contact support.");
      }
    }), error => {
      Metronic.unblockUI();
      $scope.errorList = ["An unexpected error has occurred. Please refresh the page."];
    };
  }

  $scope.downloadReport = function () {
    $scope.validate();
    if ($scope.Errors.length > 0)
      return;

    // TODO: Download the report.
    Metronic.blockUI({ animate: true, overlayColor: "none" });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.reportsAPI + "api/export/EdmRiskReport", true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
      Metronic.unblockUI();

      if (this.status == 200) {
        var filename = "EdmRiskReport.xlsx";
        var disposition = xhr.getResponseHeader("Content-Disposition");
        if (disposition && disposition.includes("attachment")) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, "");
          }
        }

        var type = xhr.getResponseHeader('Content-Type');
        var blob = new Blob([this.response], { type: type });
        if (typeof (window.navigator.msSaveBlob) !== "undefined") {
          // IE workaround
          window.navigator.msSaveBlob(blob, filename);
        }
        else {
          var url = window.URL || window.webkitURL;
          var downloadUrl = url.createObjectURL(blob);

          if (filename) {
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof (a.download) === "undefined") {
              window.location = downloadUrl;
            }
            else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          }
          else {
            window.location = downloadUrl;
          }

          setTimeout(function () { url.revokeObjectURL(downloadUrl); }, 100);
        }
      }
      else {
        $scope.Errors = ["An unexpected error has occurred. Please refresh the page."];
        $scope.$apply();
      }
    };
    xhr.onerror = function () {
      Metronic.unblockUI();
      $scope.Errors = ["An unexpected error has occurred. Please refresh the page."];
      $scope.$apply();
    };

    var authData = localStorageService.get("authorizationData");
    xhr.setRequestHeader("Authorization", "Bearer " + authData.token);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify($scope.Report));
  }

  $scope.canDownloadReport = function () {
    return $scope.Report.EffectiveFrom != null && $scope.Report.EffectiveTo != null;
  }

  $scope.selectStates = function (selectAll) {
    if (selectAll == null) selectAll = false;
    if (!selectAll) {
      $scope.Report.States = [];
    }
    else {
      for (let state of $scope.States) {
        $scope.Report.States.push(state.Code);
      }
    }
  }

  $scope.getMarkets = function () {
    var brokers = $scope.Report.Brokers;

    $http.post(ngAuthSettings.apiServiceBaseUri + "api/bassuw/policy/GetLegacyMarkets", { Brokers: brokers }).then((result) => {
      $scope.Markets = result.data;
      Metronic.unblockUI();
    }), (error) => {
      Metronic.unblockUI();
      $scope.Errors = ["An unexpected error has occurred. Please refresh the page."];
    };
  }

  $scope.selectMarkets = function (selectAll) {
    if (selectAll == null) selectAll = false;
    if (!selectAll) {
      $scope.Report.Markets = [];
    }
    else {
      for (let market of $scope.Markets) {
        $scope.Report.Markets.push(market.Contract);
      }
    }
  }

  $scope.validate = function () {
    $scope.Errors = [];
    var report = $scope.Report;
    var dateFrom = new Date(report.EffectiveFrom);
    var dateTo = new Date(report.EffectiveTo);

    if (dateTo.getTime() < dateFrom.getTime()) {
      $scope.Errors.push("'To' date must be greater than or equal to the 'From' date.");
    }

    if (report.States.length == 0) {
      $scope.Errors.push("Please select at least one state in order to download the report.");
    }

    if (report.Markets.length == 0) {
      $scope.Errors.push("Please select at least one market in order to download the report.");
    }
  }

  function initialize() {
    // Load brokers first.
    Metronic.blockUI({ animate: true, overlayColor: "none" });
    $http.post(ngAuthSettings.apiServiceBaseUri + "api/bassuw/policy/GetLegacyBrokers").then((result) => {
      $scope.Brokers = result.data;
      Metronic.unblockUI();
    }), (error) => {
      Metronic.unblockUI();
      $scope.Errors = ["An unexpected error has occurred. Please refresh the page."];
    };
  }

  initialize();

  // Call this after the whole page is loaded.
  $rootScope.$broadcast("$pageloaded");
}]);