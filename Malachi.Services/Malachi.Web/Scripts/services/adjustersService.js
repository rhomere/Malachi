"use strict";
MALACHIAPP.factory("adjustersService", function ($http, ngAuthSettings) {

	// Bass URI
	var serviceBase = ngAuthSettings.apiServiceBaseUri;
	var factory = {};
  
	// ADJUSTERS
	factory.getTpaList = function () {

		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: "none" });
		return $http.get(serviceBase + "api/Claims/GetAllAdjusterCompanies", { cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
  };

  // ADJUSTERS
  factory.getAdjusterList = function () {

    //Get from API
    Metronic.blockUI({ animate: true, overlayColor: "none" });
    return $http.get(serviceBase + "api/Claims/GetClaimsPublicAdjusters", { cache: false }).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  };

	factory.getAdjusterListByTpaId = function (id) {

		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: "none" });
		return $http.get(serviceBase + "api/Claims/GetAllAdjustersForCompany", { params: { id: id }, cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	};

	factory.getAdjusterById = function (id) {
		//Get from API
		Metronic.blockUI({ animate: true, overlayColor: "none" });
		return $http.get(serviceBase + "api/Claims/GetAdjusterById", { params: { id: id }, cache: false }).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
	};

  factory.addNewAdjuster = function (adjuster) {

    // Is active by default
    adjuster.IsActive = true;

    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Claims/AddAdjuster', adjuster).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  };
  
	factory.updateAdjuster = function (adjuster) {
		Metronic.blockUI({ animate: true, overlayColor: 'none' });
		return $http.post(serviceBase + 'api/Claims/UpdateAdjuster', adjuster).then(function (results) {
			Metronic.unblockUI();
			return results;
		});
  };

  factory.addPublicAdjuster = function (adjuster) {

    // Is active by default
    adjuster.IsActive = true;

    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Claims/AddPublicAdjuster', adjuster).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  };

  factory.updatePublicAdjuster = function (adjuster) {

    // Is active by default
    adjuster.IsActive = true;

    Metronic.blockUI({ animate: true, overlayColor: 'none' });
    return $http.post(serviceBase + 'api/Claims/UpdatePublicAdjuster', adjuster).then(function (results) {
      Metronic.unblockUI();
      return results;
    });
  };
  
	return factory;
});