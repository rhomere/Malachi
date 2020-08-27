MALACHIAPP.controller("AgentRequestsController", ["$rootScope", "ngAuthSettings", "$scope", "$location", "$modal", "$timeout", "localStorageService", "$stateParams", "$state", "settings", "policyService", "adminService", "accountService", "toolsService", ($rootScope, ngAuthSettings, $scope, $location, $modal, $timeout, localStorageService, $stateParams, $state, settings, policyService, adminService, accountService, toolsService) => {
  $scope.$on("$viewContentLoaded", () => {
    // Initialize core components.
    Metronic.initAjax();
    // Set default layout mode.
    $rootScope.settings.layout.pageBodySolid = false;
  });

  $scope.TabTypeEnum = {
    SUBMISSIONS: 0,
    SUBMITS: 1,
    BIND_REQUESTS: 2
  }

  $scope.errors = [];
  $scope.pageInfo = {
    items: [],
    totalItems: 0,
    onPage: 1,
    maxSize: 10,
    itemsPerPage: 10,
    searchString: "",
    isSearching: false
  }

  var currentTab = $scope.TabTypeEnum.SUBMISSIONS;
  var isLoaded = false;

  // Switches to a specific tab.
  $scope.gotoTab = function (tabType) {
    // Set current tab to a specific one.
    currentTab = tabType;
    // Update the data shown on the page.
    var pageInfo = $scope.pageInfo;
    pageInfo.items = [];
    pageInfo.totalItems = 0;
    pageInfo.onPage = 1;
    pageInfo.isSearching = false;
    $scope.onPageChanged();
  }

  // Checks if the user is on a specific tab.
  $scope.isOnTab = function (tabType) {
    return currentTab === tabType;
  }

  // Updates the items displayed on the table. Fires when the page number is changed.
  $scope.onPageChanged = function () {
    // Load agent request info of the page selected.
    loadAgentRequests();
  }

  // Uses the search string to look up policies by submission number/named insured.
  $scope.search = function () {
    // Create a shorthand reference to the page info.
    var pageInfo = $scope.pageInfo;
    // Reset search flag.
    pageInfo.isSearching = true;
    // Start on the first page.
    pageInfo.onPage = 1;
    // Call page change event.
    $scope.onPageChanged();
  }

  // Refreshes the data on the current tab.
  $scope.refresh = function () {
    // Load agent request info of the page selected.
    loadAgentRequests();
  }

  // Gets the warning message to display if there are no items to show on the page.
  $scope.getWarningMessage = function () {
    return $scope.pageInfo.isSearching
      ? "No results were found matching '" + $scope.pageInfo.searchString + "'."
      : "There are no quotes available for this section."
  }

  // Opens the app to access the policy.
  $scope.openPolicy = function (item) {
    if (item.PolicyId != null && item.AppId != null) {
      $rootScope.$state.transitionTo("policy", {
        appId: item.AppId,
        policyId: item.PolicyId
      });
    }
  }

  // Creates a copy of the policy.
  $scope.copyPolicy = function (item) {
    // Get coverage from the policy.
    var coverage = item.Coverage.toLowerCase() == "package" ? ["Property", "Liability"] : [item.Coverage];

    // Open modal to allow user to select coverage on copied policy before continuing.
    var modalInstance = $modal.open({
      templateUrl: "showPolicyCoverage.html",
      controller: "ShowPolicyCoverageController",
      size: "md",
      backdrop: "static",
      keyboard: false,
      resolve: {
        coverageTypes: () => { return ["Property", "Liability"]; },
        coverageSelected: () => { return coverage; }
      }
    });

    // Handle results after modal is closed.
    modalInstance.result.then((data) => {
      if (data != "cancel") {
        policyService.copyPolicy(item.PolicyId, data.Coverage, data.SubmissionNumber, data.Data).then((result) => {
          $rootScope.$state.transitionTo("policy", {
            appId: item.AppId,
            policyId: result.data.PolicyId
          });
        }, (error) => {
          $scope.errors = ["An unexpected error has occured. Please refresh the page."];
        });
      }
    });
  }

  // Clears an agent submit.
  $scope.clearSubmit = function (item) {
    policyService.clearHelpByUnderwriter(item.PolicyId).then((result) => {
      var data = result.data;
      if (data.Result.Success) {
        // Delete the item from the list of displayed items.
        var index = $scope.pageInfo.items.indexOf(item);
        if (index > -1) {
          $scope.pageInfo.items.splice(index, 1);
          // Update the page with the item erased.
          $scope.onPageChanged();
          // Update agent request count.
          updateAgentRequestCount();
        }
      } else {
        $scope.errors = data.Result.Errors;
      }
    }, (error) => {
      $scope.errors = ["An unexpected error has occurred. Please refresh the page."];
    });
  }

  // Clears an agent bind request.
  $scope.clearBindRequest = function (item) {
    // Make API call to decline bind request.
    policyService.declineAgentRequestToBind(item.PolicyId).then((result) => {
      var data = result.data;
      if (data.Result.Success) {
        // Delete the item from the list of displayed items.
        var index = $scope.pageInfo.items.indexOf(item);
        if (index > -1) {
          $scope.pageInfo.items.splice(index, 1);
          // Update the page with the item erased.
          $scope.onPageChanged();
          // Update agent request count.
          updateAgentRequestCount();
        }
      } else {
        $scope.errors = data.Result.Errors;
      }
    }, (error) => {
      $scope.errors = ["An unexpected error has occurred. Please refresh the page."];
    });
  }

  // Checks if the data loaded on the page is completed.
  $scope.isPageLoaded = function () {
    return isLoaded;
  }

  // Checks if a string is null or empty.
  function isNullOrEmpty(str) {
    return str == null || typeof (str) !== "string" || str.length < 1;
  }

  // Load agent requests data.
  function loadAgentRequests() {
    // Clear errors.
    $scope.errors = [];
    // Reset the flag that determines if the page is loaded.
    isLoaded = false;
    // Create a shorthand reference to the page info.
    var pageInfo = $scope.pageInfo;
    // Block the interface to prevent user changes.
    Metronic.blockUI({ animate: true, overlayColor: "none" });
    // Make an API call to get the agent requests.
    adminService.getAgentRequests(currentTab, pageInfo.onPage, pageInfo.itemsPerPage, pageInfo.searchString, pageInfo.isSearching).then(result => {
      var data = result.data;
      // Upon success, get the displayed items and item count for the pagination.
      if (data.Result.Success) {
        pageInfo.items = data.RequestInfos;
        pageInfo.totalItems = data.Count;
      }
      else {
        $scope.errors.push(data.Result.Errors);
      }
      // Signal that the page is loaded.
      isLoaded = true;
      onDataLoaded();
    }, error => {
      $scope.errors = ["An unexpected error has occurred. Please refresh page."]
      Metronic.unblockUI();
    });
  }

  // Updates the pagination if the page data is loaded.
  function onDataLoaded() {
    // Check if all data for the page is loaded.
    if ($scope.isPageLoaded()) {
      // Unblock user interface.
      Metronic.unblockUI();
    }
  }

  // Loads policy information for each tab.
  function initialize() {
    // Load agent request data.
    loadAgentRequests();
  }

  // Call this after the whole page is loaded.
  $rootScope.$broadcast("$pageloaded");

  // Inititalize the page.
  initialize();
}]);

MALACHIAPP.controller("ShowPolicyCoverageController", ["$rootScope", "$scope", "$location", "$stateParams", "$ocLazyLoad", "notificationsHub", "$modalInstance", "test_policyService", "settings", "coverageTypes", "coverageSelected", ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, test_policyService, settings, coverageTypes, coverageSelected) => {
  $scope.aimSubmissionNumber = null;
  $scope.coverageTypes = coverageTypes.filter(x => x.toLowerCase() == "property" || x.toLowerCase() == "liability");
  $scope.coverageSelected = coverageSelected;
  $scope.errors = [];

  // Closes the modal.
  $scope.cancel = function () {
    $modalInstance.dismiss("cancel");
  }

  // Saves the coverage selected. Also imports from AIM if a submission number is provided.
  $scope.save = function () {
    // Make sure the user selects at least one coverage.
    if ($scope.coverageSelected.length < 1) {
      $scope.errors = ["Please pick at least one coverage."]
    }
    // Import from AIM if applicable, then close the modal with the coverage selection returned.
    else {
      $modalInstance.close({ Coverage: $scope.coverageSelected });
    }
  }

  // Checks if a string is null or empty.
  function isNullOrEmpty(str) {
    return str == null || typeof (str) !== "string" || str.length < 1;
  }
}]);
