MALACHIAPP.controller("ClaimsReportsController", function ($rootScope, ngAuthSettings, $scope, $stateParams, authService, claimsService, localStorageService) {

	$scope.$on("$viewContentLoaded", function () {
		// initialize core components
		Metronic.initAjax();
		// set default layout mode
		$rootScope.settings.layout.pageBodySolid = false;
	});

	$scope.getStatusColor = claimsService.getStatusColor;

	$scope.search = {};
	$scope.Fields = [
		"Date Reported",
		"Date of Loss",
		"Effective Date"
	];
	$scope.Agencies = [];

	$scope.getAgencies = function (search) {
		$scope.Errors = [];
		if (search.length > 2) {
			claimsService.getAgencies(search).then(function (result) {
				if (result.data.Success) {
					$scope.Agencies = result.data.Data;
				}
				else {
					$scope.Errors = result.data.Errors;
				}
			}, function () {

			});
		}
	};

	$scope.Modes = [
		"By Date",
		"By Status",
		"By Agency"
	];

	// Get list of statuses with codes
	$scope.statuses = claimsService.statuses;

	// Returns status name, depends on the status code
	$scope.getStatus = claimsService.getStatus;

	// Change background color of Status select box after it was selected
	$scope.changeColor = function () {
		if ($scope.byStatus) $("span[class='btn btn-default form-control ui-select-toggle']")
			.first()
			.css({ "backgroundColor": claimsService.getStatusColor($scope.search.status.Code), color: "#fff" });
	};

	$scope.modeByDate = function () {
		$scope.byDate = "X";
		$scope.byStatus = null;
		$scope.byAgency = null;
		$scope.myStyleDate = "modechoice";
		$scope.myStyleStatus = "";
		$scope.myStyleAgency = "";

		$scope.search.mode = "By Date";
	};

	$scope.modeByStatus = function () {
		$scope.byDate = null;
		$scope.byStatus = "X";
		$scope.byAgency = null;
		$scope.myStyleStatus = "modechoice";
		$scope.myStyleDate = "";
		$scope.myStyleAgency = "";
		$scope.search.mode = "By Status";
		// Delay 
		setTimeout($scope.changeColor, 10);
	};

	$scope.modeByAgency = function () {
		$scope.byDate = null;
		$scope.byStatus = null;
		$scope.byAgency = "X";
		$scope.myStyleStatus = "";
		$scope.myStyleAgency = "modechoice";
		$scope.myStyleDate = "";
		$scope.search.mode = "By Agency";
	};

	$scope.reset = function () {
		$scope.search.status = {
			Code: 0,
			Name: "OPEN"
		};
		$scope.search.Field = "Effective Date";
		$scope.dateFrom = "";
		$scope.dateTo = "";
		$scope.search.Agency = {};
		$scope.search.mode = "By Date";
		$scope.byDate = "X";
		$scope.byStatus = null;
		$scope.byAgecy = null;
		$scope.myStyleDate = "modechoice";
		$scope.claims = [];
		$scope.modeByDate();
		$scope.endpoint = "";
		$scope.Errors = [];
	};

	$scope.getEndpointAndParams = function () {
		if ($scope.search.mode === "By Date") {
			$scope.endpoint = "api/Claims/ClaimsReportByDate?from=" + $scope.dateFrom + "&to=" + $scope.dateTo + "&searchField=" + $scope.search.Field;
			$scope.fileName = "Claims Report By Date (" + $scope.dateFrom + " - " + $scope.dateFrom + ").xlsx";
		}
		else if ($scope.search.mode === "By Status") {
			$scope.endpoint = "api/Claims/ClaimsReportByDate?from=" + $scope.dateFrom + "&to=" + $scope.dateTo + "&status=" + $scope.search.status.Code + "&searchField=" + $scope.search.Field;
			$scope.fileName = "Claims Report By Status **" + $scope.search.status.Name + "** (" + $scope.dateFrom + " - " + $scope.dateFrom + ").xlsx";
		} else {
			$scope.endpoint = "api/Claims/ClaimsReportByAgency?from=" + $scope.dateFrom + "&to=" + $scope.dateTo + "&agencyCode=" + $scope.search.Agency.AgencyCode + "&searchField=" + $scope.search.Field;
			$scope.fileName = "Claims Report By Agency **" + $scope.search.Agency.AgencyCode + "** (" + $scope.dateFrom + " - " + $scope.dateFrom + ").xlsx";
		}
	}

	$scope.downloadReport = function () {

		$scope.Errors = [];
		$scope.getEndpointAndParams();

		Metronic.blockUI({ animate: true, overlayColor: 'none' });

		var xhr = new XMLHttpRequest();
		xhr.open('GET', ngAuthSettings.apiServiceBaseUri + $scope.endpoint, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function () {

			Metronic.unblockUI();
			if (this.status === 200) {
				var filename = $scope.fileName;
				var type = xhr.getResponseHeader('Content-Type');

				var blob = new Blob([this.response], { type: type });
				if (typeof window.navigator.msSaveBlob !== 'undefined') {
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
			} else if (this.status === 206) {
				$scope.$apply(function () {
					$scope.Errors = ["No claims were found matching provided criteria."];
				});
			} else if (this.status === 400) {
				$scope.$apply(function () {
					$scope.Errors = ["Please provide valid search criteria."];
				});
			}
			else {
				$scope.$apply(function () {
					$scope.Errors = ["Couldn't connect to the server. Please try again."];
				});
			}
		};

		xhr.setRequestHeader("Content-Type", "application/json");
		var authData = localStorageService.get('authorizationData');
		xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
		xhr.send();
	};

	$scope.reset();
});