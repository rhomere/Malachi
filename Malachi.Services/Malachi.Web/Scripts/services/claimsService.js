"use strict";
MALACHIAPP.factory("claimsService", function ($http, ngAuthSettings) {

	// Bass URI
	var serviceBase = ngAuthSettings.apiServiceBaseUri;
	var factory = {};

	// Get 15 recently updated policies
	factory.getLastFifteenPolicies = function () {

		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.get(serviceBase + 'api/Claims/GetInitialPoliciesList', { cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	};

	// Get 15 recently updated policies
	factory.getLastFifteenClaims = function () {

		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.get(serviceBase + 'api/Claims/GetInitialClaimsList', { cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	};

	// Get policy by number and date
	factory.searchPoliciesByNumber = function (policyNumber) {

		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.get(serviceBase + 'api/Claims/Search', { params: { PolicyNumber: policyNumber }, cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});

	};

	// Get policy by number and date
	factory.searchClaimByNumber = function (claimNumber) {

		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.get(serviceBase + 'api/Claims/SearchClaims', { params: { claimNumber: claimNumber }, cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});

	};

	// Get policy by number and date
	factory.getPolicyOverview = function (policyNumber, effective) {

		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.get(serviceBase + 'api/Claims/GetPolicyOverview', { params: { PolicyNumber: policyNumber, Effective: effective }, cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});

    };

    // Get Shared Access Signature from Server for uploading claims imports to blob
    factory.getSharedAccessSignature = function () {

        //Get from API
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        return $http.get(serviceBase + 'api/Claims/GetSharedAccessSignatureForBlob').then(function (results) {
            Metronic.unblockUI();
            return results;
        });

    };

	// Returns Status color, depends on the status code
	factory.getStatusColor = function (status) {
		switch (status) {
			case 0:
			case 3:
				return "#e23b30"; //red
			case 1:
			case 11:
			case 12:
				return "limegreen";
			case 2:
			case 21:
				return "#ef8200"; //orange
			case 4:
				return "blue";
			case 5:
				return "#673bb8";//purple
			case 6:
				return "#ffc82e"; // dark yellow
			case 7:
			case 71:
				return "grey";
			default:
				return "black";
		}
	}

	factory.statuses = [
		{ Code: 0, Name: "OPEN", Color: "red" },
		{ Code: 1, Name: "CLOSED", Color: "limegreen" },
		{ Code: 11, Name: "CLOSED: Below Deductible", Color: "limegreen" },
		{ Code: 12, Name: "CLOSED: Location not listed on policy", Color: "limegreen" },
		{ Code: 2, Name: "DENIED", Color: "orange" },
		{ Code: 21, Name: "DENIED: Insured not cooperating with carriier", Color: "orange" },
		{ Code: 3, Name: "REOPENED", Color: "red" },
		{ Code: 4, Name: "WITHDRAWN", Color: "blue" },
		{ Code: 5, Name: "LITIGATION", Color: "purple" },
		{ Code: 6, Name: "RESERVATION Of RIGHTS", Color: "#e6a804" },
		{ Code: 7, Name: "SUBROGATION", Color: "grey" },
		{ Code: 71, Name: "SUBROGATION: Papers received", Color: "grey" },
		{ Code: 8, Name: "REASSINGMENT OF ADJUSTER", Color: "black" }
	];

	// Returns status name, depends on the status code
	factory.getStatus = function (status) {
		switch (status) {
			case 0:
				return "OPEN";
			case 1:
				return "CLOSED";
			case 11:
				return "CLOSED: Below Deductible";
			case 12:
				return "CLOSED: Location not listed on policy";
			case 2:
				return "DENIED";
			case 21:
				return "DENIED: Insured not cooperating with carriier";
			case 3:
				return "REOPENED";
			case 4:
				return "WITHDRAWN";
			case 5:
				return "LITIGATION";
			case 6:
				return "RESERVATION Of RIGHTS";
			case 7:
				return "SUBROGATION";
			case 71:
				return "SUBROGATION: Papers received";
			case 8:
				return "REASSINGMENT OF ADJUSTER";
			default:
				return "NOT FOUND";
		}
	}

	// Get Address as 1 string value
	factory.getAddress = function (location) {
		var address = "";
		address += location.StreetAddress1;
		address += !location.StreetAddress2 ? "" : " " + location.StreetAddress2;
		address += " " + location.City;
		address += ", " + location.State;
		address += " " + location.Zip;

		return address;
  }

  factory.getLossTypesList = function () {
    //Get from API
    Metronic.blockUI({ animate: true, overlayColor: "none" });
    return $http.get(serviceBase + "api/Claims/GetLossTypes", { cache: false }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  }	

	factory.getConstructionTypeList = [
		"Frame Brick Veneer",
		"Frame",
		"Joisted Masonry",
		"Non Combustible",
		"Masonry Non Combustible",
		"Fire Resistant",
		"Modified Fire Resistant",
		"Heavy Timber / Old Mill",
		"Not Applicable"
	];

	factory.getOccupancyList = [
		"Agri Equip Dealer",
		"Aircraft Hanger/Repair",
		"Airport Terminal",
		"Amusement Park/Fairgrounds",
		"Apartment",
		"Condominium",
		"Appliance Repair",
		"Appliance Retail",
		"Asphalt Batch Plant",
		"Auditoriums/Arenas",
		"Auto Dealer-Floor Plan",
		"Auto Dealer - Service Repair",
		"Auto Dealer - Showroom",
		"Auto Parts and Supplies",
		"Bakeries",
		"Bar/Tavern",
		"Beauty Salon",
		"Boat Dealer",
		"Manufacturing - Boats",
		"Marinas",
		"Bowling Alley",
		"Brewery",
		"Building Supplies - Not Lumber Yard",
		"Building Supplies/Lumber Yard",
		"Camera/Photo Supplies",
		"Camps",
		"Canvas Manufacturing",
		"Manufacturing (non-hazardous)",
		"Carpet/Floor Distributing",
		"EDP Equipment",
		"Manufacturing - Electronics",
		"Exhibition Halls",
    "Fairs",
    "Farm",
		"Farmers Market",
		"Fertilizer Plants",
		"Manufacturing - Fiberglass",
		"Fine Art Dealer",
		"Food Processing - Cooking",
		"Food Processing - Frying",
		"Food Processing - Processing Only",
		"Funeral home/Mortuary",
		"Furniture Retail/Wholesaler",
		"Gasoline Station",
		"Glass Products",
		"Grocer - Small Retail",
		"Grocer - Supermarket",
		"Warehouse - Cold Storage",
		"Habitational Student Living",
		"Hardware Store",
		"Health Club",
		"Hospital",
		"Hotels/Motels",
		"Industrial Painting",
		"Jewelry- retail/Wholesale",
		"Casino -Ex BI",
		"Casino - With BI",
		"Cement Plant",
		"Chemical Plant -Non Petrol",
		"Churches",
		"Clothing Retail/Wholesale",
		"Country Club",
		"Contractor Equipment dealer",
		"Contractors Offices",
		"Convenient Store",
		"Convention Center",
		"Day Care Center",
		"Department Store",
		"Distillers",
		"Drug Store",
		"Drug Store - with Theft",
		"Dry Cleaners",
		"Kennels",
		"Laboratory - Research",
		"Laboratory Equipment",
		"Laundry -Commercial",
		"Manufacturing - Leather goods",
		"Leather Tanneries",
		"Library",
		"Manufacturing -Mixed",
		"Manufacturing -Plastics",
		"Medical office",
		"Mercantile Building",
		"Metal Fabrication",
		"Metal Worker -Molten",
		"Metal Worker - Non Molten",
		"Museum",
		"Night Club",
		"Nursing Home",
		"Offices",
		"Distributor- Oil/Fuel",
		"Manufacturer - Paint",
		"Prison/Halfway House",
		"Shops/Retail",
		"Restaurant",
		"Clubs - Health",
		"Contractors",
		"Deli",
		"Halls",
		"Building materials dealers",
		"Distributors (no chemicals)",
		"Dwelling",
		"Liquor stores",
		"Mini-storage facilities",
		"Pawn shops",
		"Warehouses",
		"Auto repair shop",
		"Manufacturing/dealer - Chemical",
		"Clinics/laboratories",
		"Electroplating",
		"Exterminators/pest control",
		"Feed/grain stores or dealers",
		"Fuel dealers or distributors",
		"Gunsmith",
		"Heavy machinery repair",
		"Industrial processing",
		"Machine shops",
		"Manufacturing (hazardous)",
		"Recycling/salvage",
		"Stables/barns",
		"Upholstery shops",
		"Warehouses (with flammables)",
		"Welding",
		"Woodworking",
		"Schools",
		"Service",
		"Habitational",
		"Clubs-Social",
		"Vacant",
		"Other",
		"Lessors Risk",
		"Builder Risk",
		"Primary",
		"Secondary",
		"Trucking / Transportation",
		"Landscaping",
		"Janitorial",
		"Car Wash",
		"Wholesaler",
		"Cinema/Theatre",
		"Internet Cafe",
		"Inland Marine"
	];

	factory.createClaim = function (claim) {
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.post(serviceBase + 'api/Claims/SaveClaim', claim).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	};

	factory.updateClaim = function (claim) {
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.post(serviceBase + 'api/Claims/UpdateClaims', claim).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	};

	factory.getClaimById = function (id) {
		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.get(serviceBase + 'api/Claims/GetCLaim', { params: { id: id }, cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	};

	factory.withdrawClaim = function (id) {

		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.get(serviceBase + 'api/Claims/WithdrawClaim', { params: { id: id }, cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	};
  
	factory.getAgencies = function (search) {
		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: "none" });
		return $http.get(serviceBase + "api/Claims/ClaimsGetAllClaimsAgencies", { params: { searchTerm: search }, cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	}
  
	factory.getAppId = function (policyId) {
		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: "none" });
		return $http.get(serviceBase + "api/Claims/GetClaimsToPolicyInfo", { params: { policyId: policyId }, cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	}

	factory.getClaimsForReport = function (from, to, status, code, field, mode) {

		if (mode === "By Date") {
			//Get from API
			Metronic.blockUI({ animate: true, overlayColor: "none" });
			return $http.get(serviceBase + "api/Claims/ClaimsReportByDate", { params: { from: from, to: to, searchField: field }, cache: false }).then(function (results) {
				Metronic.unblockUI();
				return results;
			});
		}
		else if (mode === "By Status") {
			//Get from API
			Metronic.blockUI({ animate: true, overlayColor: "none" });
			return $http.get(serviceBase + "api/Claims/ClaimsReportByStatus", { params: { from: from, to: to, status: status, searchField: field }, cache: false }).then(function (results) {
				Metronic.unblockUI();
				return results;
			});
		} else {
			//Get from API
			Metronic.blockUI({ animate: true, overlayColor: "none" });
			return $http.get(serviceBase + "api/Claims/ClaimsReportByAgency", { params: { from: from, to: to, searchField: field, agencyCode: code }, cache: false }).then(function (results) {
				Metronic.unblockUI();
				return results;
			});
		}
	};
  
	factory.sendEmail = function (id, memoType) {

		// Container
		var info = {
			id: id,
			memoType: memoType
		}

		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.post(serviceBase + 'api/Claims/ClaimsEmailCorrespondence', info).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	}

	return factory;
});