//import { fail } from "assert";

'use strict'
MALACHIAPP.controller('structureInsights', ['$rootScope', '$scope', '$modalInstance', 'toolsService', 'location', function ($rootScope, $scope, $modalInstance, toolsService, location) {
  $scope.$on('structureInsightsFinishLoading', function () {

    //$scope.location = {
    //    Address: {
    //        StreetAddress1: '4423 Magnolia Ridge Drive',
    //        City: 'Weston',
    //        State: 'FL',
    //        Zip: '33331'
    //    }
    //}

    if ($scope.location == null) {
      $scope.fromDashboard = true;
      $scope.fromDashboardCont = true;
      $scope.showsidemap = true;// changed to showsidemap so variable has a better description
      $scope.showHighlightsBool = true;
    }
    else {
      $scope.showHighlightsBool = true;
      $scope.isLoading = true;
      $scope.showsidemap = false;// changed to showsidemap so variable has a better description
      $scope.getStructureInsights();
    }
  });

    $scope.detailsFilter = '';
    $scope.zillowDetailsFilter = '';
    $scope.zillowHomeDetailsUrl = '';
    $scope.showHighlightsBool = true;
    $scope.showZillowHighlightsBool = false;
	$scope.showYelpHighlightsBool = false;
    $scope.showAdditionalDetailsBool = false;
    $scope.showMapBool = false;
    $scope.showsidemap = false;
    $scope.toggleManaulAddressEntry = false;
    $scope.isLoading = false;
    $scope.fromDashboard = false;
    $scope.fromDashboardCont = false;
    $scope.viewReport = false;
    $scope.requiresSave = false;
    $scope.doesBuildingPermitExist = true;
    $scope.doesElectricalPermitExist = true;
    $scope.doesMechanicalPermitExist = true;
    $scope.doesPlumbingPermitExist = true;
	$scope.yelp = {};
	$scope.yelp.BusinessHours = {};
	$scope.yelp.Categories = {};
    $scope.location = {};
    $scope.location.Address = {};
    $scope.location.Address.StreetAddress2 = null;
    $scope.location = location;
    $scope.structureInsights = null;
    $scope.ShortAddress = null;
    $scope.parcelsData = null;
    $scope.errorList = [];
    $scope.Errors = [];
    $scope.ZillowErrors = [];
	$scope.YelpErrors = [];
    $scope.manualLocation = {};
    $scope.manualLocation.Address = {};
    $scope.manualLocation.Address.StreetAddress1 = null;
    $scope.manualLocation.Address.StreetAddress2 = null;
    $scope.manualLocation.Address.City = null;
    $scope.manualLocation.Address.State = null;
    $scope.manualLocation.Address.Zip = null;
    $scope.noDataString = "No data";
    $scope.screenWidth = window.innerWidth;

    $scope.getStructureInsights = function () {
        
        //Sample no Permits 
        //toolsService.getStructureInsights("4423 MAGNOLIA RIDGE DRIVE", "WESTON", "FL", "33331").then(function (result) {
        //Sample w/ Permits 
        //toolsService.getStructureInsights("6951 WEST SUNRISE BLVD", "Plantation", "FL", "33313").then(function (result) {

      var address = '';
      if ($scope.toggleManaulAddressEntry) {
        if (typeof $scope.manualLocation.Address.StreetAddress2 !== 'undefined') {
          address = $scope.location.Address.StreetAddress1 + ' ' + $scope.manualLocation.Address.StreetAddress2;
        }
        else {
          address = $scope.location.Address.StreetAddress1;
        }
      }
      else {
        if (typeof $scope.location.Address.StreetAddress2 !== 'undefined') {
          address = $scope.location.Address.StreetAddress1 + ' ' + $scope.location.Address.StreetAddress2;
        }
        else {
          address = $scope.location.Address.StreetAddress1;
        }
      }
      
        toolsService.getStructureInsights(address, $scope.location.Address.City, $scope.location.Address.State, $scope.location.Address.Zip, true).then(function (result) {
          $scope.structureInsights = result.data;
		  $scope.structureInsights.records = result.data.ZillowData.ZillowRecords;
          if (typeof $scope.location.Address.StreetAddress2 !== 'undefined' && $scope.location.Address.StreetAddress2 !== "") {
            $scope.structureInsights.LongAddress = $scope.location.Address.StreetAddress1 + ', ' + $scope.location.Address.StreetAddress2 + ', ' + $scope.structureInsights.Address.City + ', ' + $scope.structureInsights.Address.State + ', ' + $scope.structureInsights.Address.Zip;
          }
          else {
            $scope.structureInsights.LongAddress = $scope.location.Address.StreetAddress1 + ', ' + $scope.structureInsights.Address.City + ', ' + $scope.structureInsights.Address.State + ', ' + $scope.structureInsights.Address.Zip;
          }
            
            $scope.formatInsights($scope.structureInsights);
            $scope.isLoading = false;
            $scope.viewReport = true;
            $scope.fromDashboard = false;
            //if enough screeen space/size
            if ($scope.screenWidth > 1762 && $scope.showsidemap != false) {
              $scope.showMapcont();
            }
        },
        function (error) {
          $scope.structureInsights = "An error has occurred!";
            $scope.isLoading = false;
            $scope.fromDashboard = false;
            $scope.Errors.push("An error has occured! Please refresh page.");
        });
      
      $scope.manualLocation.Address.StreetAddress2 = null;

      //toolsService.getzpid($scope.location.Address.StreetAddress1, $scope.location.Address.City, $scope.location.Address.State, $scope.location.Address.Zip, $scope.location.Address.StreetAddress2).then(function (result) {
      //  $scope.zillowZpid = 'https://www.zillow.com/homedetails/' + result.data + '_zpid';
      //});
    };

    $scope.getClassForInsight = function () {
        var score = $scope.structureInsights.RoofDetails.ConditionScore.Score;
        if (score == "N" || score == "UN") return 'alert-danger';
        if (score == "C" || score == "UU" || score == "UY") return 'alert-warning';
        return 'alert-info';
    }

    $scope.requireSave = function () {
        $scope.requiresSave = true;
    }

    $scope.save = function () {

    };

    $scope.back = function () {
        if (!$scope.fromDashboardCont) {
          $scope.fromDashboard = true;
          $scope.showHighlightsBool = true;
          $scope.viewReport = false;
          $scope.Errors = [];
          $scope.ZillowErrors = [];
		  $scope.YelpErrors = [];
          $scope.parcelsTestData = null;
          $scope.structureInsights = null;
          $modalInstance.dismiss('cancel');
        }
        else {
          $scope.location.Address.ShortAddress = null;
          $scope.location.Address.StreetAddress2 = null;
          $scope.fromDashboard = true;
		  $scope.showYelpHighlightsBool = false;
          $scope.showHighlightsBool = true;
          $scope.showZillowHighlightsBool = false;
          $scope.showAdditionalDetailsBool = false;
          $scope.showsidemap = false;
          $scope.viewReport = false;
          $scope.Errors = [];
          $scope.ZillowErrors = [];
		  $scope.YelpErrors = [];
          $scope.parcelsTestData = null;
          $scope.structureInsights = null;
        }
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.showHighlights = function () {
		$scope.showYelpHighlightsBool = false;
        $scope.showAdditionalDetailsBool = false;
        $scope.showZillowHighlightsBool = false;
        $scope.showMapBool = false;
        $scope.showHighlightsBool = true;
        $scope.screenWidth = window.innerWidth;
        if ($scope.screenWidth > 1762) {
          if ($scope.fromDashboardCont != false) {
            $scope.showsidemap = true;
          }
          else {
            $scope.showsidemap = false;
          }
          updateMapAddress($scope.structureInsights.LongAddress);
        }
    }

    $scope.showAdditionalDetails = function () {
		  $scope.showYelpHighlightsBool = false;
          $scope.showZillowHighlightsBool = false;
          $scope.showHighlightsBool = false;
          $scope.showMapBool = false;
          $scope.showsidemap = false;
          $scope.showAdditionalDetailsBool = true;
    }

    $scope.showZillowHighlights = function () {
        $scope.showZillowHighlightsBool = true;
		$scope.showYelpHighlightsBool = false;
        $scope.showAdditionalDetailsBool = false;
        $scope.showHighlightsBool = false;
        $scope.showMapBool = false;
        $scope.showsidemap = false;
    }

	$scope.showYelpHighlights = function () {
		$scope.showYelpHighlightsBool = true;
		$scope.showZillowHighlightsBool = false;
		$scope.showAdditionalDetailsBool = false;
		$scope.showHighlightsBool = false;
		$scope.showMapBool = false;
		$scope.showsidemap = false;
	}
    
    $scope.showMap = function () {
	  $scope.showYelpHighlightsBool = false;
      $scope.showHighlightsBool = false;
      $scope.showAdditionalDetailsBool = false;
      $scope.showZillowHighlightsBool = false;
      $scope.showMapBool = true;
      $scope.showsidemap = false;
      updateMapAddress($scope.structureInsights.LongAddress);
    }

    $scope.showMapcont = function () {
        $scope.showsidemap = true;
        updateMapAddress($scope.structureInsights.LongAddress);
    }

    $scope.formatInsights = function (structureInsights) {
        for (let permitSummary of structureInsights.PermitSummaries) {
            if (!permitSummary.EarliestDate)
                permitSummary.EarliestDate = $scope.noDataString;
            if (!permitSummary.EarliestCost)
                permitSummary.EarliestCost = $scope.noDataString;
            if (!permitSummary.LatestDate)
                permitSummary.LatestDate = $scope.noDataString;
            if (!permitSummary.LatestCost)
                permitSummary.LatestCost = $scope.noDataString;
            if (!permitSummary.Description)
                permitSummary.Description = $scope.noDataString;

            if (permitSummary.Name == "Building" && permitSummary.EarliestDate == $scope.noDataString && permitSummary.LatestDate == $scope.noDataString)
                $scope.doesBuildingPermitExist = false;
            if (permitSummary.Name == "Electrical" && permitSummary.EarliestDate == $scope.noDataString && permitSummary.LatestDate == $scope.noDataString)
                $scope.doesElectricalPermitExist = false;
            if (permitSummary.Name == "Mechanical" && permitSummary.EarliestDate == $scope.noDataString && permitSummary.LatestDate == $scope.noDataString)
                $scope.doesMechanicalPermitExist = false;
            if (permitSummary.Name == "Plumbing" && permitSummary.EarliestDate == $scope.noDataString && permitSummary.LatestDate == $scope.noDataString)
                $scope.doesPlumbingPermitExist = false;
        }

        if (structureInsights.RoofDetails.Age != 0)
            structureInsights.RoofDetails.Age += " year(s)";
        else
            structureInsights.RoofDetails.Age = $scope.noDataString;

        if (structureInsights.SquareFeet != 0)
            structureInsights.SquareFeet += " sqft.";
        else
            structureInsights.SquareFeet = $scope.noDataString;

        switch (structureInsights.RoofDetails.AgeConfidence) {
            case 0:
                structureInsights.RoofDetails.AgeConfidence = "High";
                break;
            case 1:
                structureInsights.RoofDetails.AgeConfidence = "Medium";
                break;
            case 2:
                structureInsights.RoofDetails.AgeConfidence = "Low";
                break;
            case 3:
                structureInsights.RoofDetails.AgeConfidence = "Modeled";
                break;
            default:
                structureInsights.RoofDetails.AgeConfidence = $scope.noDataString;
                break;
        }

        //YearBuilt
        if (!structureInsights.YearBuilt)
            structureInsights.YearBuilt = $scope.noDataString;
        //Roof Age
        if (!structureInsights.RoofDetails.Age)
            structureInsights.RoofDetails.Age = $scope.noDataString;
        //Age Confidence
        if (!structureInsights.RoofDetails.Age)
            structureInsights.RoofDetails.AgeConfidence = $scope.noDataString;
        //Roof Coverage
        if ($scope.isUnknown(structureInsights.RoofDetails.Coverage))
            structureInsights.RoofDetails.Coverage = $scope.noDataString;
        //Construction
        if ($scope.isUnknown(structureInsights.Construction))
            structureInsights.Construction = $scope.noDataString;
        //Protection Class
        if (!structureInsights.ProtectionClass)
            structureInsights.ProtectionClass = $scope.noDataString;
        //Roof Shape
        if (!structureInsights.RoofDetails.Shape)
            structureInsights.RoofDetails.Shape = $scope.noDataString;
        //Square Feet
        if (!structureInsights.SquareFeet)
            structureInsights.SquareFeet = $scope.noDataString;
        //Number Of Stories
        if ($scope.isUnknown(structureInsights.NumberOfStories))
            structureInsights.NumberOfStories = $scope.noDataString;
        //Roof Anchor
        if ($scope.isUnknown(structureInsights.RoofDetails.AnchorType))
            structureInsights.RoofDetails.AnchorType = $scope.noDataString;
        //Basement
        if ($scope.isUnknown(structureInsights.HasBasement))
            structureInsights.HasBasement = $scope.noDataString;
        //IsElevated
        if ($scope.isUnknown(structureInsights.IsElevated))
          structureInsights.IsElevated = $scope.noDataString;
        //PropertyCrime
        if ($scope.isUnknown(structureInsights.PropertyCrime))
          structureInsights.PropertyCrime = $scope.noDataString;
        //ViolentCrime
        if ($scope.isUnknown(structureInsights.ViolentCrime))
          structureInsights.ViolentCrime = $scope.noDataString;
        //Longitude
        if ($scope.isUnknown(structureInsights.Longitude))
          structureInsights.Longitude = "No data";
        //Latitude
        if ($scope.isUnknown(structureInsights.Latitude))
          structureInsights.Latitude = "No data";

		// Zillow
		if (structureInsights.records != null) {
			$scope.parcelsData = structureInsights.records;
			$scope.zillowHomeDetailsUrl = 'https://www.zillow.com/homedetails/' + '1' + '_zpid';
			//if (result.data.Zpid != -1) {
			//	$scope.zillowHomeDetailsUrl = 'https://www.zillow.com/homedetails/' + result.data.Zpid + '_zpid';
			//}
			//else {
			//	$scope.zillowZpid = 'https://www.zillow.com';
			//}
		}
		else {
			$scope.ZillowErrors.push("No Data");
		}
		
		// Yelp
		if (structureInsights.YelpData !== null) {
			$scope.yelp = structureInsights.YelpData;

			if ($scope.yelp.BusinessDetail.Hours.length > 0) {
				$scope.yelp.BusinessHours = $scope.getYelpBusinessHours($scope.yelp.BusinessDetail.Hours[0].Open)
			}

			$scope.yelp.Categories = $scope.getYelpBusinessCategories($scope.yelp.BusinessDetail.Categories)
		}
		else {
			$scope.YelpErrors.push("No Data");
		}
    }

	$scope.GetRatingImagePath = function (value) {

		if (value == 5) {
			return `../../Content/img/large_5.png`
		}
		if (value == 4.5) {
			return `../../Content/img/large_4_half.png`
		}
		if (value == 4) {
			return `../../Content/img/large_4.png`
		}
		if (value == 3.5) {
			return `../../Content/img/large_3_half.png`
		}
		if (value == 3) {
			return `../../Content/img/large_3.png`
		}
		if (value == 2.5) {
			return `../../Content/img/large_2_half.png`
		}
		if (value == 2) {
			return `../../Content/img/large_2.png`
		}
		if (value == 1.5) {
			return `../../Content/img/large_1_half.png`
		}
		if (value == 1) {
			return `../../Content/img/large_1.png`
		}
		if (value == 0) {
			return `../../Content/img/large_0.png`
		}
	}

	$scope.GetShortDate = function (value) {
		
		var date = new Date(value);
		return date.toLocaleDateString();
	}

	$scope.FormatBoolean = function (value) {
		if (value == 'false') {
			return 'No';
		}
		if (value == 'true') {
			return 'Yes';
		}
		return value;
	}

	$scope.getYelpBusinessCategories = function (listOfCategories) {

		var categories = [];

		listOfCategories.forEach(function (item) {
	
			categories.push(item.Title);
		});

		return categories;
	}

	$scope.getYelpBusinessHours = function (listOfHours) {
		
		var businessHours = [];
		
		listOfHours.forEach(function (item) {
			var hour = {};
			hour.Day = item.Day;
			hour.Start = item.Start;
			hour.End = item.End;
			businessHours.push(hour);
		});

		return businessHours;
	}

	$scope.getDayOfWeekByNumber = function (value) {
		if (value == 0) return 'Mon';
		if (value == 1) return 'Tues';
		if (value == 2) return 'Wed';
		if (value == 3) return 'Thur';
		if (value == 4) return 'Fri';
		if (value == 5) return 'Sat';
		if (value == 6) return 'Sun';
	}

	$scope.getTime = function (value) {
		
		if (value == null) {
			return;
		}

		var initialValue = value;

		value = new String(value);

		// change from military time to standard time
		if (value !== '0000' && initialValue >= '1300') {
			var hour = `${value.charAt(0)}${value.charAt(1)}`;
			hour = hour - 12;
			value = `${hour}${value.charAt(2)}${value.charAt(3)}`;
		}

		// Add colon between numbers
		if (value.charAt(0) == '0') {
			value = `${value.charAt(1)}:${value.charAt(2)}${value.charAt(3)}`;
		}
		else if (value.length == 3) {
			value = `${value.charAt(0)}:${value.charAt(1)}${value.charAt(2)}`;
		}
		else if (value.length == 4) {
			value = `${value.charAt(0)}${value.charAt(1)}:${value.charAt(2)}${value.charAt(3)}`;
		}
		
		if (value == '0:00') return '12:00 am';

		if (initialValue > '1200') {
			return value + ' pm';
		}
		else {
			return value + ' am';
		}
	}

    $scope.placeset = function (result) {
        $scope.requiresSave = true;
        if (result) {
            $scope.location = {};
            $scope.location.Address = {};
            $scope.location.Address.StreetAddress1 = result.StreetAddress1;
            $scope.location.Address.StreetAddress2 = result.StreetAddress2;
            $scope.location.Address.City = result.City;
            $scope.location.Address.State = result.State;
            $scope.location.Address.Zip = result.Zip;
            $scope.location.Address.Country = result.Country;
            $scope.location.Address.County = result.County;
            $scope.location.Address.ShortAddress = result.formatted_address;
        }
        $scope.saved = false;
    }

    $scope.searchAddress = function () {
        if ($scope.manualLocation.Address.StreetAddress1 != null &&
            $scope.manualLocation.Address.StreetAddress2 != null &&
            $scope.manualLocation.Address.City != null &&
            $scope.manualLocation.Address.State != null &&
            $scope.manualLocation.Address.Zip != null){
            $scope.fromDashboard = false;
            $scope.isLoading = true;
            $scope.location = $scope.manualLocation;
            $scope.getStructureInsights();
        }
        else if ($scope.location == undefined) {
            $scope.errorList.push("Please enter an address");
            return;
        }
        $scope.fromDashboard = false;
        $scope.isLoading = true;
        $scope.getStructureInsights();
    }

    $scope.getRecordKeys = function (record) {
        var keys = Object.keys(record);
        var filteredKeys = keys.filter(x => x != 'Index' && x != 'CategoryName' && x != 'DisplayName' && x != '$$hashKey' && x != 'HasInfo' && x != 'BundleIndex' && x != 'OwnerName' && x != 'FullAddress').sort(); 
        return filteredKeys;
    }

  $scope.getRecordItemName = function (itemKey, record) {
        if (itemKey == null || itemKey == '') return'NA';
        if (!(itemKey in record)) return'NA';
        var text = itemKey;
        var result = text.replace(/([A-Z])/g, " $1");
        var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
        return finalResult + ':';
  }
  // Gets the item name for each field in a property record
  $scope.getZillowRecordItemName = function (itemKey, record) {
    if (itemKey == null || itemKey == '') return 'NA';
    //if (!(itemKey in record)) return 'NA';
    var text = itemKey;
    var result = text.replace(/([A-Z])/g, " $1");
    var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult + ':';
  }
  // Gets the item value for each field in a property record
  $scope.getZillowRecordItemValue = function (itemKey, record) {
    if (itemKey == null || itemKey == '') return 'NA';
    //if (!(itemKey in record)) return 'NA';
    var text = itemKey;
    var result = text.replace(/([A-Z])/g, " $1");
    var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  }

    $scope.isUnknown = function (value) {
        if (value == 'Unknown Or Not Provided' || value == 'Unknown' || value == '' || value == null)
            return true;
        else
            return false;
    }

    $scope.getRecordItemValue = function (itemKey, record) { 
        return record[itemKey];
    }

    var geocoder = new google.maps.Geocoder();

    var addressLocation;
    var map;

    function updateMapAddress(address) {
      geocoder.geocode({
        'address': address
      }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          addressLocation = results[0].geometry.location;
          DrawMap(19, address);
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
    } 

  /// </summary>
  /// <event name="DrawMap"></event>
  var panorama = null;

  function DrawMap(zoom, address) {
    var sv = new google.maps.StreetViewService();
    var map = null;
    var heading = null;

    var myOptions = {
      zoom: zoom,
      center: new google.maps.LatLng(addressLocation.lat(), addressLocation.lng()),//addressLocation,
      scaleControl: true,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      tilt: 0
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    sv.getPanorama({ location: addressLocation, radius: 75 },
      function (streetViewPanoramaData, status) {
        if (status === google.maps.StreetViewStatus.OK) {

          if (address != null) {
            var marker = new google.maps.Marker({
              map: map,
              position: new google.maps.LatLng(addressLocation.lat(), addressLocation.lng()),//addressLocation,
              title: address + '<br/>lat: ' + addressLocation.lat() + ' , lon: ' + addressLocation.lng()
            });
          }

          heading = google.maps.geometry.spherical.computeHeading(streetViewPanoramaData.location.latLng, addressLocation);
          panorama = map.getStreetView();
          panorama.setPosition(addressLocation);
          panorama.setPov(/** @type {google.maps.StreetViewPov} */
            ({
              heading: heading,
              pitch: 0
            }));
          panorama.setVisible(false);
        }
      });
  }

    $scope.showLocationToggle = true;

    $scope.toggleStreetView = function () {
      var toggle = panorama.getVisible();
      if (toggle == false) {
        panorama.setVisible(true);
      } else {
        panorama.setVisible(false);
      }
    }

    $rootScope.$broadcast('structureInsightsFinishLoading');
}]);

