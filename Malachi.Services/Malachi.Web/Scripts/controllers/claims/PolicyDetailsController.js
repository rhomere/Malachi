MALACHIAPP.controller("PolicyDetailsController", function ($rootScope, ngAuthSettings, $scope, $stateParams, authService, claimsService, localStorageService) {

    // Initializer
    $scope.$on("$viewContentLoaded", function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;

        if ($stateParams.policy === null) {
            $rootScope.$state.transitionTo("claims");
        };

        $scope.claimEditor = $.inArray("Claim Creator", authService.authentication.roles) > -1;
    });

    // Main Policy object for th view
    $scope.policy = $stateParams.policy;

    $scope.isFromFullPolicy = false;

    // Gets AppId for transition to Policy Page
    $scope.getAppId = function () {
        $scope.Errors = [];
        claimsService.getAppId($scope.policy.Id).then(function (result) {
            $scope.AppId = result.data.AppId;
            $scope.isFromFullPolicy = result.data.CanNavigate;
        }, function () {
            $scope.Errors = ["An unexpected error has occured."];
        });
    }

    // Returns Status color, depends on the status code
    $scope.getStatusColor = claimsService.getStatusColor;

    // Returns status name, depends on the status code
    $scope.getStatus = claimsService.getStatus;

    // Returns address as 1 string
    $scope.getAddress = claimsService.getAddress;

    // Open Policy Dashboard
    $scope.openClaimsDashboard = function () {
        $rootScope.$state.transitionTo("claims");
    }

    // Add Claim to Policy with Address
    $scope.addClaimWithAddress = function (hasAddress, location, property) {
        $scope.createClaim(hasAddress, location, property);
        $rootScope.$state.transitionTo("addClaim", { claim: $scope.claim, hasAddress: hasAddress });
    }

    // OVERLOAD THE METHOD FOR NO PROPERTY
    $scope.addClaimWithoutAddress = function (hasAddress, location) {
        $scope.createClaimNoProperty(hasAddress, location);
        $rootScope.$state.transitionTo("addClaim", { claim: $scope.claim, hasAddress: hasAddress });
    }

    $scope.claim = {};

    //FIRST CREATE CLAIM FUNCTION NORMALLY WORKING FROM AIM IMPORT
    $scope.createClaim = function (hasAddress, location, property) {

        $scope.fillClaimsData();

        //// LOCATION BLOCK /////
        $scope.claim.LossAddress = {};
        if (hasAddress) {
            if (location.LocationId !== "" && location.LocationId !== null)
                $scope.claim.LocationId = location.LocationId;
            $scope.claim.LossAddress.StreetAddress1 = location.StreetAddress1;
            $scope.claim.LossAddress.StreetAddress2 = location.StreetAddress2;
            $scope.claim.LossAddress.City = location.City;
            $scope.claim.LossAddress.State = location.State;
            $scope.claim.LossAddress.Zip = location.Zip;
            $scope.claim.LossAddress.County = location.County;
            $scope.claim.BuildingNumber = property.BuildingNumber;
            $scope.claim.LocationNumber = location.LocationNumber; // Not in UI
        }
        else {
            $scope.claim.LossAddress.StreetAddress1 = "";
            $scope.claim.LossAddress.StreetAddress2 = "";
            $scope.claim.LossAddress.City = "";
            $scope.claim.LossAddress.State = "";
            $scope.claim.LossAddress.Zip = "";
            $scope.claim.LossAddress.County = "";	// Not in UI
        }

        //// LOSS BLOCK /////
        $scope.claim.LossType = "";
        $scope.claim.DateOfLoss = "";
        $scope.claim.DateReported = "";
        $scope.claim.ClaimantName = "";
        if (hasAddress) {
            $scope.claim.Occupancy = property.Occupancy;
            $scope.claim.Construction = property.Construction;
        }
        else {
            $scope.claim.Occupancy = "";
            $scope.claim.Construction = "";
        }
    }

    //SECOND CREATE CLAIM FUNCTION THAT WORKS WHEN AIM DOES NOT IMPORT PROPERTY
    $scope.createClaimNoProperty = function (hasAddress, location) {

        $scope.fillClaimsData();

        //// LOCATION BLOCK /////
        $scope.claim.LossAddress = {};
        if (hasAddress) {
            if (location.LocationId !== "" && location.LocationId !== null)
                $scope.claim.LocationId = location.LocationId;
            $scope.claim.LossAddress.StreetAddress1 = location.StreetAddress1;
            $scope.claim.LossAddress.StreetAddress2 = location.StreetAddress2;
            $scope.claim.LossAddress.City = location.City;
            $scope.claim.LossAddress.State = location.State;
            $scope.claim.LossAddress.Zip = location.Zip;
            $scope.claim.LossAddress.County = location.County;
            $scope.claim.LocationNumber = location.LocationNumber; // Not in UI
        }
        else {
            $scope.claim.LossAddress.StreetAddress1 = "";
            $scope.claim.LossAddress.StreetAddress2 = "";
            $scope.claim.LossAddress.City = "";
            $scope.claim.LossAddress.State = "";
            $scope.claim.LossAddress.Zip = "";
            $scope.claim.LossAddress.County = "";	// Not in UI
        }

        //// LOSS BLOCK /////
        $scope.claim.LossType = "";
        $scope.claim.DateOfLoss = "";
        $scope.claim.DateReported = "";
        $scope.claim.ClaimantName = "";
        $scope.claim.Occupancy = "";
        $scope.claim.Construction = "";
    }

    //THIS METHOD IS FOR THE SAKE OF EXCESS CODE
    $scope.fillClaimsData = function () {
		/***********
		GENERAL INFO
		************/
        $scope.claim.PolicyNumber = $scope.policy.PolicyNumber;
        $scope.claim.NamedInsured = $scope.policy.NamedInsured;
        $scope.claim.UnderwriterName = $scope.policy.FirstName + " " + $scope.policy.LastName;
        $scope.claim.AgencyName = $scope.policy.AgencyName;
        $scope.claim.Coverage = $scope.policy.Coverage;
        $scope.claim.EffectiveDate = $scope.policy.Effective;
        $scope.claim.ExpirationDate = $scope.policy.Expiration;
        $scope.claim.TeamId = $scope.policy.OfficeCode;
        $scope.claim.UnderwriterEmail = $scope.policy.UnderwriterEmail;
        $scope.claim.AgencyCode = $scope.policy.AgencyCode;
        $scope.claim.AgentName = $scope.policy.AgentName;
        $scope.claim.AgentEmail = $scope.policy.AgentEmail;
        $scope.claim.AgentPhone = $scope.policy.AgentPhone;
        $scope.claim.MarketName = $scope.policy.MarketName;
        $scope.claim.CompanyName = $scope.policy.CompanyName;
        $scope.claim.AdjusterIsPublic = false;

		/*********
		CLAIM INFO
		**********/
        //$scope.claim.ClaimNumber = {};
        $scope.claim.ClaimOfficialNumber = "-- NA --";

        //// STATUS BLOCK ////
        $scope.claim.Status = 0;	// Default value - "OPEN"

        //// ADJUSTER BLOCK ////
        $scope.claim.AdjusterId = ""; // Not in UI
        $scope.claim.AdjusterName = "";
        $scope.claim.AdjusterPhone = ""; // Not in UI
        $scope.claim.AdjusterEmail = "";
        $scope.claim.ClaimDescription = "";
        $scope.claim.AdditionalNotes = "";

		/*******
		RESERVES
		********/
        $scope.claim.LossReserve = 0;
        $scope.claim.LossPaid = 0;
        $scope.claim.LAEReserve = 0;
        $scope.claim.LAEPaid = 0;
        $scope.claim.Subrogation = 0;

        //// Additional fields;
        $scope.claim.PolicyId = $scope.policy.Id;  // Not in UI
        $scope.claim.PolicyBusinessDescription = $scope.policy.BusinessDescription;	// NOT in UI
    }

    // Get full Claim object By ID
    $scope.openClaimDetails = function (id) {
        $scope.Errors = [];
        claimsService.getClaimById(id).then(function (result) {
            if (result.data.Success) {
                var claimToBeUpdated = result.data.Data;
                claimToBeUpdated.MarketName = $scope.policy.MarketName;
                claimToBeUpdated.CompanyName = $scope.policy.CompanyName;
                $rootScope.$state.transitionTo("claimDetails", { claim: result.data.Data });
            } else {
                $scope.Errors = result.data.Errors;
            }
        },
            function (error) {
                $scope.Errors = ["An unexpected error has occured. Please refresh the page."];
            });
    };

    // Open update claim paige
    $scope.updateClaim = function (id) {
        $scope.Errors = [];
        claimsService.getClaimById(id).then(function (result) {
            if (result.data.Success) {
                $rootScope.$state.transitionTo("updateClaim", { claim: result.data.Data });
            } else {
                $scope.Errors = result.data.Errors;
            }
        },
            function (error) {
                $scope.Errors = ["An unexpected error has occured. Please refresh the page."];
            });
    };

    $scope.sendEmail = function (id, memoType) {
        claimsService.sendEmail(id, memoType);
    }

    // Withdraw the claim
    $scope.withdrawClaim = function (id) {
        $scope.Errors = [];
        claimsService.withdrawClaim(id).then(function (result) {
            if (result.data.Success) {
                var claim = result.data.Data;

                // Get Policy with updated claim and refresh the page
                claimsService.getPolicyOverview(claim.PolicyNumber, claim.EffectiveDate).then(function (policyResult) {
                    if (policyResult.data.Success) {
                        $rootScope.$state.transitionTo("policyDetails", { policy: policyResult.data.Data });
                    }
                    else {
                        $scope.Errors = policyResult.data.Errors;
                    }
                }, function () {
                    $scope.Errors = ["An unexpected error has occured. Please try again."];
                });
            }
            else {
                $scope.Errors = result.data.Errors;
            }
        }, function () {
            $scope.Errors = ["An unexpected error has occured. Please try again."];
        });
    };

    $scope.getEndpointAndParams = function (id, memo) {
        if (memo === "Claim") {
            $scope.endpoint = "api/Claims/GetClaimsAcknowledgementMemo?id=" + id;
            $scope.fileName = "Claim Acknowledgement Memo.pdf";
        }
        else {
            $scope.endpoint = "api/Claims/GetClaimsAdjusterChangeMemo?id=" + id;
            $scope.fileName = "Claim Adjuster Change Memo.pdf";;
        }
    }

    $scope.downloadMemo = function (id, memo) {
        Metronic.blockUI({ animate: true, overlayColor: 'none' });

        // SHow error if no claims for report found
        $scope.showNoClaims = false;
        $scope.getEndpointAndParams(id, memo);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', ngAuthSettings.apiServiceBaseUri + $scope.endpoint, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {

            $scope.Errors = [];

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
            } else {
                $scope.$apply(function () {
                    $scope.Errors = ["Couldn't generate a memo. Please try again. Status: " + this.status];
                });
            }
        };

        xhr.setRequestHeader("Content-Type", "application/json");
        var authData = localStorageService.get('authorizationData');
        xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
        xhr.send();
    };

    $scope.openFullPolicy = function () {
        if ($scope.AppId !== null && $scope.policy.Id !== null) {
            $rootScope.$state.transitionTo('policy', { appId: $scope.AppId, policyId: $scope.policy.Id });
        }

        // IF ANY OF THE VALUES IS NULL REMOVE LINK FROM POLICY NUMBER
        $scope.isFromFullPolicy = false;
    }

    $scope.getAppId();
});



