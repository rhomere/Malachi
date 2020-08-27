'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Commercial_Lines_SubmissionController', ['authService', '$rootScope', '$scope', '$timeout', '$modal', '$location', '$stateParams', '$ocLazyLoad', '$filter', 'notificationsHub', 'settings', 'policyService', 'toolsService', 'customPackageService', function (authService, $rootScope, $scope, $timeout, $modal, $location, $stateParams, $ocLazyLoad, $filter, notificationsHub, settings, policyService, toolsService, customPackageService) {
    $scope.parent = $scope.$parent;

    $scope.toggleManaulAddressEntry = false;
    $scope.AppId = $scope.parent.AppId;
    $scope.PolicyId = $scope.parent.PolicyId;
    $scope.ErrorMessage = '';
    $scope.WarningMessage = '';
    $scope.requiresSave = false;
    $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;
    $scope.lateBinder = $.inArray("Late Binding Authority", authService.authentication.roles) > -1;
    $scope.officeId = authService.authentication.officeId;
    $scope.PolicyTermOptions = [
    {
        id: 12,
        name: '12 Months'
    },
    {
        id: 6,
        name: '6 Months'
    },
    {
        id: 3,
        name: '3 Months'
    },
    {
        id: 0,
        name: 'Short-Term'
    }];
    $scope.MinimumEarnedPremiums = ['25%', '50%', '100%'];
    $scope.FormOfBusiness = [
        '',
        'Partnership',
        'Corporation',
        'Individual',
        'Limited Liability Company',
        'Limited Liability Partnership',
        'Joint Venture',
        'Not For Profit',
        'Trust'
    ];
    $scope.Contacts = [];
    $scope.LicensedAgents = [];
    $scope.Agencies = [];

    if ($scope.AppId != null) {

    }

    if (!$scope.PolicyId) {
        if (authService.authentication.isUnderwriterExec) {
            $scope.parent.Policy.UnderwriterId = authService.authentication.userId;
            $scope.parent.Policy.OfficeId = authService.authentication.officeId;
        }
    }

    $scope.parent.Policy.ManagingGeneralAgentId = '6F8F9A04-0D1D-424D-B1DA-5A1B72629129';

    policyService.getOfficesAndExecutives($scope.PolicyId, $scope.parent.Policy.ManagingGeneralAgentId).then(function (result) {
        if (result.data.Result.Success) {
            $scope.AccountExecutives = result.data.Users;
            $scope.Offices = result.data.Offices;
            if ($scope.parent.Policy.UnderwriterId == null && result.data.ExecUser != null) {
                $scope.parent.Policy.UnderwriterId = result.data.ExecUser.Id;
                $scope.parent.Policy.OfficeId = result.data.ExecUser.OfficeId;

                // Default HomeState if office is FL, CA, TX 
                var officeIdsFL = [
                    '87E2F769-0EFD-41EE-88B9-2A6A5434F0DE',
                    '120811AD-79D5-462D-9D79-5EB55A4BA372',
                    '33E0AEFB-7E7B-4EB7-B104-6FBB26230533',
                    '97639E72-6653-4168-8170-8A71A4E725A3',
                    '3EF13CB5-FF3E-4F15-82F1-980D58373B64',
                    'AEC229C6-1455-4B5B-846F-B5856713ACB4',
                    '1F051B10-803A-430F-B27D-FC4097E2AAEB'
                ];

                var officeIdsCA = [
                    'EEE85EBB-07D4-4815-AB42-0D02FDC2D0F7',
                    '4A054047-CBE9-4EBA-A156-0ED1C51E88B1',
                    '04139F83-E484-49C9-A0AF-C4C43F9CB530',
                    '6546EC0A-D40E-4B8A-B348-D15F3F7422CE'
                ];

                var officeIdsTX = [
                     '49E28922-923E-4175-8A0A-2C68513940D9'
                ];

                if (officeIdsFL.indexOf($scope.parent.Policy.OfficeId.toUpperCase()) > -1) {
                    $scope.parent.Policy.HomeStateCode = 'FL';
                } else if (officeIdsCA.indexOf($scope.parent.Policy.OfficeId.toUpperCase()) > -1) {
                    $scope.parent.Policy.HomeStateCode = 'CA';
                } else if (officeIdsTX.indexOf($scope.parent.Policy.OfficeId.toUpperCase()) > -1) {
                    $scope.parent.Policy.HomeStateCode = 'TX';
                }
            }
        } else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    if ($scope.PolicyId) { // Existing Policy
        loadPolicy();
    } else {
        $scope.parent.LoadingPage = false;

        $scope.createSubmission = function () {
            $scope.validatePage();
            if ($scope.ErrorList.length > 0) {
                return;
            }

            $scope.saved = true;

            if ($scope.parent.Policy.CurrentVersion == null) {
                $scope.parent.Policy.Versions = [{}];
                $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
            }

            if ($scope.parent.Coverages.length > 0) {
                $scope.parent.Policy.CurrentVersion.Subjectivities =
                    'Signed Completed ACORD applications (upon Binding)\n' +
                    'Signed TRIA Rejection\n' +
                    '3 years hard copy loss runs on accounts exceeding $5,000 in total premium (if requested)\n' +
                    'No known loss box must be checked on account under $5,000\n' +
                    'Any required class specific supplementals\n' +
                    'Favorable Inspection and compliance with any/all recommendations\n' +
                    'Written Confirmation SOV on file is accurate if applicable';

                policyService.newSubmission($scope.AppId, new Date().getTimezoneOffset(), $scope.parent.Coverages, $scope.parent.Policy).then(function (result) {
                    if (result.data.Result.Success) {

                        $scope.parent.PolicyId = result.data.Policy.Id;
                        $scope.parent.Policy = result.data.Policy;
                        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                        $scope.parent.Coverages = result.data.Coverages;
                        $scope.parent.RiskCompanies = $scope.RiskCompanies = result.data.RiskCompanies;
                        $scope.parent.RiskCompanyId = $scope.parent.Policy.CurrentVersion.RiskCompanyId;
                        if ($scope.RiskCompanies.length == 1 || $scope.parent.RiskCompanyId == null) $scope.parent.RiskCompanyId = $scope.RiskCompanies[0].Id;

                        $scope.parent.getAppContracts();
                        $scope.parent.getAllClassCodesForApp();
                        $scope.saved = true;

                        if (result.data.Policy.MGASubmissionNumber == null) {
                          $scope.parent.getMgaSubmissionNumber();
                        }

                        customPackageService.initializeCoverages($scope.parent.Policy);
                        $timeout(function () { $('#lnkLocations').click(); }, 0, false);
                        notificationsHub.showSuccess('Quote', 'Quote ' + $scope.parent.Policy.Number + ' is saved.');
                    } else {
                        $scope.ErrorList = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
            else {
                $scope.parent.showCoverages();
            }

            //$scope.parent.Policy.PolicyTerm = 12;
        }

        $scope.defaultPolicyTerm = function () {
            $scope.parent.Policy.PolicyTerm = 12;
            $scope.parent.Policy.MinimumEarnedPremium = '25%';

            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();

            $scope.parent.Policy.Effective = mm + '/' + dd + '/' + yyyy;

            var expirationDate = new Date();
            expirationDate.setHours(0, 0, 0, 0);
            expirationDate.setMonth(expirationDate.getMonth() + $scope.parent.Policy.PolicyTerm);

            dd = expirationDate.getDate();
            mm = expirationDate.getMonth() + 1;
            yyyy = expirationDate.getFullYear();

            $scope.parent.Policy.Expiration = mm + '/' + dd + '/' + yyyy;
        }

        $scope.defaultPolicyTerm();

        $scope.parent.Policy.FormOfBussiness = 'Corporation';

        $scope.parent.showCoverages();
    }

    function loadPolicy() {

        if ($scope.parent.Policy.CurrentVersion.Locations == null) {
            policyService.getPolicy($scope.PolicyId).then(function (result) {
                if (result.data.Result.Success) {
                    $scope.parent.Policy = result.data.Policy;
                    $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                    $scope.parent.Coverages = result.data.Coverages;
                    $scope.parent.RiskCompanies = $scope.RiskCompanies = result.data.RiskCompanies;
                    $scope.parent.RiskCompanyId = $scope.parent.Policy.CurrentVersion.RiskCompanyId;

                    if ($scope.RiskCompanies.length == 1 || $scope.parent.RiskCompanyId == null) $scope.parent.RiskCompanyId = $scope.RiskCompanies[0].Id;

                    $scope.parent.getAppContracts();
                    $scope.parent.getAllClassCodesForApp();

                    $scope.parent.LoadingPage = false;

                    if ($scope.parent.Policy.RenewalOf === '')
                        $scope.parent.Policy.RenewalOf = null;

                    customPackageService.initializeCoverages($scope.parent.Policy);

                    if (!result.data.Policy.MGASubmissionNumber && !result.data.Policy.EndorsementNumber) {
                      $scope.parent.showAimSubmissionModal();  
                    }

                    if (!$scope.parent.Policy.Bound) {
                        $timeout(function () {
                            $('.quoteTabLinks').click(function (e) {
                                if (!$scope.saved) {
                                    if ($scope.createSubmission != null) {
                                        $scope.createSubmission();
                                    } else {
                                        $scope.saveChanges('#' + $(this).attr('id'));
                                    }
                                    e.preventDefault();
                                    return false;
                                }
                            });
                        }, 1, false);
                    }
                } else {
                    $scope.ErrorList = result.data.Result.Errors;
                }
            }, function (error) {
                $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
            });
        } else {
            $scope.parent.LoadingPage = false;

            $timeout(function () {
                $('.quoteTabLinks').click(function (e) {
                    if (!$scope.saved) {
                        if ($scope.createSubmission != null) {
                            $scope.createSubmission();
                        } else {
                            $scope.saveChanges('#' + $(this).attr('id'));
                        }
                        e.preventDefault();
                        return false;
                    }
                });
            }, 1, false);
        }
    }

    $scope.searchByBeginsWith = function(actual, expected) {
        var lowerSearchString = (actual + '').toLowerCase();
        return lowerSearchString.indexOf(expected.toLowerCase()) === 0;
    }

    $scope.accountExecSelected = function () {
        $scope.requiresSave = true;

        for (var i = 0; i < $scope.AccountExecutives.length; i++) {
            if ($scope.parent.Policy.UnderwriterId == $scope.AccountExecutives[i].Id) {
                $scope.parent.Policy.OfficeId = $scope.AccountExecutives[i].OfficeId;
            }
        }
    }


    $scope.effectiveDateChanged = function () {
        $scope.requiresSave = true;
        var termLength = $scope.parent.Policy.PolicyTerm;

        // Policy Term Logic with MEP
        if (termLength == 0 || termLength == 3) {
            $scope.parent.Policy.MinimumEarnedPremium = '100%';
        }
        else if (termLength == 6) {
            $scope.parent.Policy.MinimumEarnedPremium = '50%';
        }
        else if (termLength >= 12) {
            $scope.parent.Policy.MinimumEarnedPremium = '25%';
        }

        if ($scope.parent.Policy.Effective == undefined || $scope.parent.Policy.Effective === "") return;

        $scope.ErrorList = [];
        var checkDate = new Date($scope.parent.Policy.Effective).toString();
        if (checkDate === "Invalid Date") {
            $scope.parent.Policy.Expiration = "";
            $scope.parent.Policy.Effective = "";
            $scope.ErrorList.push("The effective date entered is not valid");
            return;
        }

        var today = new Date($scope.parent.Policy.Effective);

        // check to make sure that user cant go past three days if not late binder
        if (!$scope.lateBinder) {
            var threeDaysPast = new Date();
            threeDaysPast.setHours(0, 0, 0, 0);
            threeDaysPast.setDate(threeDaysPast.getDate() - 3);

            // check to make sure user did not enter a date past three days in the past
            if (today.getTime() < threeDaysPast.getTime()) {
                $scope.parent.Policy.Expiration = "";
                $scope.parent.Policy.Effective = "";
                $scope.ErrorList.push("The effective date cannot be more than three days in the past");
                return;
            }
        }

        // make a date that is 6 months in the furture
        var sixMonths = new Date();
        sixMonths.setHours(0, 0, 0, 0);
        sixMonths.setMonth(sixMonths.getMonth() + 6);

        // if effective is greater than six months in the future show error
        if (today.getTime() > sixMonths.getTime()) {
            $scope.parent.Policy.Expiration = "";
            $scope.parent.Policy.Effective = "";
            $scope.ErrorList.push("The effective date cannot be more than six months in the future");
            return;
        }

        var expirationDate = new Date(today.setMonth(today.getMonth() + termLength));

        if (termLength != 0 || expirationDate <= today) {
            var dd = expirationDate.getDate();
            var mm = expirationDate.getMonth() + 1;
            var yyyy = expirationDate.getFullYear();

            $scope.parent.Policy.Expiration = mm + '/' + dd + '/' + yyyy;
        }

        // In case it is short term just set the expiration to the next day
        if (termLength == 0) {
            var dd = expirationDate.getDate() + 1;
            var mm = expirationDate.getMonth() + 1;
            var yyyy = expirationDate.getFullYear();

            $scope.parent.Policy.Expiration = mm + '/' + dd + '/' + yyyy;
        }

		$scope.parent.Policy.CurrentVersion.RateProperty = true;
        $scope.saved = false;
    }


    $scope.getStateByZip = function () {
        $scope.requiresSave = true;
        $scope.ErrorList = [];
        // reset the Insured state to make sure we get a new one from the supplied zip
        $scope.parent.Policy.Insured.MailingAddress.State = "";
        $scope.parent.Policy.Insured.MailingAddress.StateCode = "";
        $scope.parent.Policy.Insured.MailingAddress.County = "";

        if ($scope.parent.Policy.Insured.MailingAddress.Zip == undefined || $scope.parent.Policy.Insured.MailingAddress.Zip == null || $scope.parent.Policy.Insured.MailingAddress.Zip === "") return;
        if ($scope.parent.Policy.Insured.MailingAddress.Zip.length < 5) {
            $scope.ErrorList.push("Zip code must be at least 5 digits long");
            $scope.parent.Policy.Insured.MailingAddress.State = "";
            $scope.parent.Policy.Insured.MailingAddress.StateCode = "";
            $scope.parent.Policy.Insured.MailingAddress.County = "";
            $scope.parent.Policy.Insured.MailingAddress.Zip = "";
        }

        if ($scope.ErrorList.length > 0) return;

        toolsService.getStatesAndCountiesByZip($scope.parent.Policy.Insured.MailingAddress.Zip).then(function (result) {
            if (result.data.Result.Success) {
                if (result.data.State != null) {
                    $scope.parent.Policy.Insured.MailingAddress.County = result.data.State.Counties[0].Name;
                    $scope.parent.Policy.Insured.MailingAddress.State = result.data.State.Name;
                    $scope.parent.Policy.Insured.MailingAddress.StateCode = result.data.State.Code;
                } else {
                    $scope.parent.Policy.Insured.MailingAddress.County = "";
                    $scope.parent.Policy.Insured.MailingAddress.State = "";
                    $scope.parent.Policy.Insured.MailingAddress.StateCode = "";
                    $scope.ErrorList.push("Could not find State and County for entered zip code: " + $scope.parent.Policy.Insured.MailingAddress.Zip);

                    $scope.parent.Policy.Insured.MailingAddress.Zip = "";
                }

            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }


    $scope.placeset = function (result) {
        $scope.requiresSave = true;
        if (result) {
            $scope.parent.Policy.Insured.MailingAddress.StreetAddress1 = result.StreetAddress1;
            $scope.parent.Policy.Insured.MailingAddress.StreetAddress2 = result.StreetAddress2;
            $scope.parent.Policy.Insured.MailingAddress.City = result.City;
            $scope.parent.Policy.Insured.MailingAddress.State = result.State;
            for (var i = 0; i < $scope.States.length; i++) {
                if ($scope.parent.Policy.Insured.MailingAddress.State == $scope.States[i].Name) {
                    $scope.parent.Policy.Insured.MailingAddress.StateCode = $scope.States[i].Code;
                }
            }
            $scope.parent.Policy.Insured.MailingAddress.Zip = result.Zip;
            $scope.parent.Policy.Insured.MailingAddress.Country = result.Country;
            $scope.parent.Policy.Insured.MailingAddress.County = result.County;
            $scope.parent.Policy.Insured.MailingAddress.ShortAddress = result.formatted_address;
        }
        $scope.saved = false;
    }

    $scope.saveChanges = function (goTo) {
        if (goTo == null) goTo = '#lnkLocations';
        $scope.validatePage();
        if ($scope.ErrorList.length > 0) {
            return;
        }
        $scope.saved = true;

        if ($scope.requiresSave) {
            policyService.updateSubmissionAndInsured($scope.PolicyId,
                $scope.parent.Policy,
                $scope.parent.Policy.Insured).then(function (result) {
                    if (result.data.Result.Success) {

                        $scope.parent.Policy = result.data.Policy;
                        $scope.parent.Policy.CurrentVersion = $scope.parent.Policy.Versions[0];
                        $scope.parent.Coverages = result.data.Coverages;

                        $scope.parent.getAppContracts();

                        $timeout(function () { $(goTo).click(); }, 0, false);
                        notificationsHub.showSuccess('Quote', 'Quote ' + $scope.parent.Policy.Number + ' is saved.');
                    } else {
                        $scope.ErrorList = result.data.Result.Errors;
                    }
                },
                function (error) {
                    $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
                });
        } else {
            $scope.requiresSave = false;
            $timeout(function () { $(goTo).click(); }, 0, false);
        }
    }

    $scope.requireSave = function() {
        $scope.requiresSave = true;
    }

    // Function that handles page validation for user inputs
    $scope.validatePage = function () {
        $scope.ErrorList = [];

        if (checkInput($scope.parent.Policy.Insured.Name)) {
            $scope.ErrorList.push('Named Insured cannot be blank.');
        }

        if (checkInput($scope.parent.Policy.UnderwriterId)) {
            $scope.ErrorList.push('Must select an account executive.');
        }

        if (checkInput($scope.parent.Policy.OfficeId)) {
            $scope.ErrorList.push('Must select an office.');
        }

        if (checkInput($scope.parent.Policy.HomeStateCode)) {
            $scope.ErrorList.push('Must select a home state.');
        }

        if (checkInput($scope.parent.Policy.Effective)) {
            $scope.ErrorList.push('Effective date cannot be blank.');
        }

        if (checkInput($scope.parent.Policy.Expiration)) {
            $scope.ErrorList.push('Expiration date cannot be blank.');
        }

        if (checkInput($scope.parent.Policy.Insured.MailingAddress.StreetAddress1)) {
            $scope.ErrorList.push('Mailing street address cannot be blank.');
        }

        if (checkInput($scope.parent.Policy.Insured.MailingAddress.Zip)) {
            $scope.ErrorList.push('Mailing zip cannot be blank.');
        }

        if (checkInput($scope.parent.Policy.Insured.MailingAddress.City)) {
            $scope.ErrorList.push('Mailing city cannot be blank.');
        }

        if (checkInput($scope.parent.Policy.Insured.MailingAddress.State)) {
            $scope.ErrorList.push('Mailing state cannot be blank.');
        }

        if (checkInput($scope.parent.Policy.BusinessDescription)) {
            $scope.ErrorList.push('Business Description cannot be blank.');
        }

        validateDates();
    }

    function checkInput(input) {
        if (input == '' || input == undefined || input == null) {
            return true;
        }
        else {
            return false;
        }
    }

    function validateDates() {
        var policy = $scope.parent.Policy;
        
        if (policy == null || typeof (policy.Expiration) !== "string" || typeof (policy.Effective) !== "string") {
            $scope.ErrorList.push("An unexpected error has occurred. Please refresh the page.");
            return;
        }

        var expirationDate = new Date(policy.Expiration);
        var effectiveDate = new Date(policy.Effective);

        if (expirationDate == effectiveDate) {
            $scope.ErrorList.push("Expiration date cannot be the same as the effective date.");
        }
        else if (expirationDate < effectiveDate) {
            $scope.ErrorList.push("Expiration date cannot be before the effective date.");
        }
    }

    // Load States
    toolsService.getStatesAndCounties().then(function (result) {
        if (result.data.Result.Success) {
            $scope.parent.States = $scope.States = result.data.States;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });



    $scope.BusinessDescriptions = [
  'Accountants',
'Ad Agencies',
'Adjusters',
'Agents',
'Air Freight',
'Airlines',
'All Service',
'All Types Of Leasing Autos/Trucks',
'Ambulance',
'Architects/Engineers',
'Armored Companies',
'Art Galleries',
'Artists',
'Associations',
'Auto (Excess)',
'Auto Driving',
'Auto',
'Bakers/Bakeries',
'Banks/Banking',
'Bars/Taverns',
'Beauty Shops',
'Bed & Breakfast (B&Bs)',
'Beverage Processing',
'Beverages',
'Blackcar',
'Blood/Organ Banks',
'Body Shops',
'Books',
'Bowling',
'Breweries',
'Brick',
'Bridge',
'Brokers',
'Bus',
'Business Support Services',
'Businesses',
'Cable',
'Call Centers',
'Campgrounds',
'Canning',
'Casinos',
'Caterers',
'Cemeteries',
'Centers',
'Chemical',
'Child Care',
'Chiropractors',
'Claims',
'Clothes',
'Coal',
'Colleges',
'Commercial',
'Commodity Dealers',
'Computer Programmers',
'Computers',
'Concrete/Masonry',
'Construction Materials',
'Correctional Facilities',
'Courier/Messenger',
'Courts',
'Credit Bureaus',
'Credit Card Related',
'Credit Union',
'Dance Companies',
'Dealers',
'Dentists',
'Diagnostic Labs',
'Dialysis',
'Diet Centers',
'Direct Sellers',
'Directories/Mailing Lists',
'Disposal',
'Distiller',
'Distribution',
'Distribution/Production/Recording',
'Doctors',
'Draftsmen',
'Drilling',
'Drugs',
'Dry Cleaners',
'Drywall',
'Educational Support Services',
'Electric Contractors',
'Electric',
'Electrical',
'Electronics',
'Emergency Relief Services',
'Equipment',
'Excess Flood',
'Fabric',
'Farm/Farming',
'Ferries/Cruise',
'Fiduciaries',
'Film/Video',
'Financing/Lending',
'Fire',
'Fishing',
'Fitness Center',
'Flooring',
'Florists',
'Food Processing',
'Food',
'Footwear',
'Fossil Fuel',
'Framing',
'Fraternity/Rooming&Boarding',
'Funeral',
'Glass/Glazing',
'Golf Courses',
'Government Regulatory Agencies/Bodies',
'Government',
'Graphic Design',
'Gravel',
'Growers',
'Hair',
'Hatcheries',
'Holding Companies And Conglomerates',
'Home/Health',
'Homeowners',
'Hospitals',
'Hotels',
'Hunters/Hunting',
'Hydroelectric',
'Industrial Materials',
'Industrial',
'Institutional',
'Instructions',
'Insurance Agents',
'Insurance Brokers',
'Insurance Consultants',
'Insurers',
'Internet Sellers',
'Internet',
'Investment Banking',
'Investment Management',
'Iron Ore',
'Janitorial',
'Labor Union',
'Land Subdivision',
'Landscapers',
'Languages',
'Laundries',
'Lawyers',
'Leather',
'Legislatives',
'Lessors/Vacant Lot Rental Or Leasing',
'Liability',
'Libraries',
'Limo',
'Liquor',
'Locksmiths',
'Logging',
'Machinery/Equipment',
'Machining/Forging/Stamping',
'Mail Centers',
'Mail Order Supply',
'Managers',
'Marinas',
'Markets',
'Mechanical',
'Medical Centers',
'Medical Lab',
'Merchandise',
'Metal Ore',
'Metal',
'Milling/Mills',
'Monetary Authority',
'Motels',
'Museums',
'Music',
'Natural Gas',
'Newspapers',
'Nonresidential Buildings',
'Notaries',
'Nuclear',
'Nurseries',
'Nursing/Home',
'Oil/Gas',
'Orchids/Groves',
'Outsourced Services',
'Painters',
'Paper Products',
'Parole',
'Pension Funds',
'Pet Care',
'Pharmaceutical',
'Photography',
'Pipeline',
'Plastic',
'Plumbing',
'Police',
'Political',
'Postal Service',
'Power Generation',
'Power Transmission',
'Power/Communication',
'Precious Metals',
'Probation',
'Processing',
'Product Prep/Processing',
'Professional Employment Offices (Peo""S)""',
'Promoters',
'Property Floater',
'Property Inspectors',
'Prosecutors',
'Public Administration',
'Publishing',
'Quarry/Quarrying',
'R&D Companies',
'Racetracks',
'Rail Freight',
'Rail Lines',
'Ranch/Ranching',
'Real Estate Property',
'Real Estate',
'Recreation/Amusements Parks',
'Recreational Rv',
'Refining',
'Rehabilitation',
'Reinsurers',
'Reits',
'Religious',
'Remediation',
'Rental Centers',
'Repairers/Repairs Maintenance',
'Residential Buildings & Dwellings',
'Residential Property',
'Residential',
'Restaurants',
'Retail Distributions/Sales',
'Road/Highway',
'Roofers/Roofing',
'Rubber',
'Sand',
'Schools',
'Securities Dealers',
'Security Companies/Services',
'Septic Tank',
'Sewage',
'Shelters',
'Shoe Repair',
'Siding',
'Ski Areas',
'Slaughter House',
'Social Services',
'Software',
'Spas',
'Sports Managers',
'Sports/Recreation',
'Stadiums',
'Staffing',
'Stores',
'Structural Steel',
'Supplies',
'Surveyors',
'Tailors',
'Taxi',
'Teams',
'Telecommunications',
'Temporary Help',
'Test Sites',
'Textile',
'Theatres',
'Therapists',
'Tile Layers',
'Timber',
'Title Abstract Companies',
'Tour Transport',
'Towing',
'Tpas',
'Traning Companies',
'Trapper/Trapping',
'Travel Agencies',
'Tribes/Nations',
'Truck/Trucking',
'Trust/Trustees',
'Tuxedos',
'Umbrella',
'Universities',
'Vending Machine Operators',
'Veterninary Services',
'Vineyards',
'Warehouse/Storage',
'Waste Collection',
'Waste Treatment',
'Water Transportation',
'Water',
'Wholesale Distribution',
'Wholesale Distributor',
'Winery',
'Wood Products',
'Writers'
    ];
}]);


MALACHIAPP.controller('test_Commercial_Lines_submissionClearanceModelCtrl', ['$rootScope', '$http', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'test_policyService', 'policy', function ($rootScope, $http, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, test_policyService, policy) {
    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }

    $scope.policy = policy;
    $scope.selectedSubmission = null;
    $scope.submissions = [];
    $scope.searchTerm = "";
    $scope.ErrorList = [];
    $scope.searched = false;
    $scope.searched = false;

    $scope.getSubmissions = function () {
        if ($scope.searchTerm != null && $scope.searchTerm.length > 0) $scope.searched = true;
        $scope.ErrorList = [];
        Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
        test_policyService.getSubmissions($scope.searchTerm).then(function (result) {
            Metronic.unblockUI('.modal-dialog');
            if (result.data.Result.Success) {
                $scope.submissions = result.data.Submissions;
            }
            else {
                $scope.ErrorList = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI('.modal-dialog');
            $scope.ErrorList = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.submissionClicked = function (submission) {
        $scope.selectedSubmission = submission;
    }

    $scope.newSubmit = function () {
        if ($scope.selectedSubmission != null) {
            $scope.policy.Insured.Name = $scope.selectedSubmission.Name;
            $scope.policy.Insured.DBA = $scope.selectedSubmission.DBA;
            $modalInstance.close();
        } else {
            $scope.ErrorList = ['Please select a submission.'];
        }
    }

    $scope.expanded = false;

    $scope.expandModal = function () {
        if ($scope.expanded) {
            $(".modal-dialog").css("width", "900px");
            $("#tableHolder").css("max-height", "500px");
        } else {
            $(".modal-dialog").css("width", "98%");
            $("#tableHolder").css("max-height", ($(window).height() - 300) + "px");
        }

        $scope.expanded = !$scope.expanded;
    }

    $(window).resize(function () {
        if ($scope.expanded) {
            $(".modal-dialog").css("width", "98%");
            $("#tableHolder").css("max-height", ($(window).height() - 300) + "px");
        }
    });

    $scope.newInsured = function () {
        $modalInstance.close();
    }

    $scope.goBack = function () {
        $modalInstance.close('back');
    }

    $scope.keyPress = function (keyCode) {
        if (keyCode === 13) {
            $scope.getSubmissions();
            return;
        }
    }
}]);