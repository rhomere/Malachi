'use strict'

/* Setup general page controller */
MALACHIAPP.controller('test_Homeowners_LocationsController', ['authService', '$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modal', 'settings', 'policyService', 'toolsService', function (authService, $rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modal, settings, policyService, toolsService) {
  $scope.parent = $scope.$parent;

  $scope.$on('$viewContentLoaded', function () {
    // initialize core components
    Metronic.initAjax();
    // set default layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    //$rootScope.settings.layout.pageSidebarClosed = false;
  });

  $scope.parent.LoadingPage = true;
  $scope.AppId = $scope.parent.AppId;
  $scope.PolicyId = $scope.parent.PolicyId;
  $scope.Policy = $scope.parent.Policy;
  $scope.showLocationToggle = false;
  $scope.submitReviewer = $.inArray("Submit Reviewer", authService.authentication.roles) > -1;

  if ($scope.AppId == null) {
    $rootScope.$state.transitionTo('policyDashboard');
  }

  if ($scope.PolicyId) { // Existing Policy
    loadLocations();
  }
  else {
    $rootScope.$state.transitionTo('policy.' + $scope.parent.App.Url + '.submission', { appId: $scope.AppId, policyId: $scope.PolicyId });
  }

  function loadLocations() {
    $scope.Locations = $scope.parent.Policy.CurrentVersion.Locations;
    $scope.parent.LoadingPage = false;
  }
  //--------------------------
  //- New Location -
  //--------------------------
  $scope.newLocation = function () {
    var modalInstance = $modal.open({
      templateUrl: 'locationModelContent.html',
      controller: 'test_Homeowners_locationModelCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        location: function () {
          return {
            Address: {}
          };
        },
        policyId: function () {
          return $scope.PolicyId;
        },
        locations: function () {
          return $scope.Locations;
        }
      }
    });

    modalInstance.result.then(function (location) {
      if (location != 'cancel') {
        if ($scope.parent.Policy.CurrentVersion.Locations == null) $scope.parent.Policy.CurrentVersion.Locations = [];
        policyService.newLocation($scope.PolicyId, location).then(function (result) {
          if (result.data.Result.Success) {
            var location = result.data.Location;
            $scope.parent.Policy.CurrentVersion.Locations.push(result.data.Location);
            $scope.parent.Policy.HasLocations = true;

            policyService.updateCrimeScores($scope.PolicyId, result.data.Location).then(function (result) {
              if (result.data.Result.Success) {

                location.ViolentCrime = result.data.ViolentCrime;
                location.PropertyCrime = result.data.PropertyCrime;
              }
              else {
                $scope.Errors = result.data.Result.Errors;
              }
            }, function (error) {
              $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
          }
          else {
            $scope.Errors = result.data.Result.Errors;
          }
        }, function (error) {
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });

      }
    });
  }

  //--------------------------
  //- Update Location -
  //--------------------------
  $scope.updateLocation = function (location) {
    if (!$scope.parent.canModify(false)) return;

    var modalInstance = $modal.open({
      templateUrl: 'locationModelContent.html',
      controller: 'test_Homeowners_locationModelCtrl',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        location: function () {
          return location;
          },
          Policy: function () {
              $scope.parent.Policy;
          },
        policyId: function () {
          return $scope.PolicyId;
        },
        locations: function () {
          return $scope.Locations;
        }
      }
    });

    modalInstance.result.then(function (location) {
      $scope.Errors = [];
      if (location != 'cancel') {
        policyService.updateLocation($scope.PolicyId, location).then(function (result) {
          if (result.data.Result.Success) {
            $.extend(location, result.data.Location);
            $scope.parent.Policy.CurrentVersion.RateProperty = true;
            policyService.updateCrimeScores($scope.PolicyId, result.data.Location).then(function (result) {
              if (result.data.Result.Success) {

                location.ViolentCrime = result.data.ViolentCrime;
                location.PropertyCrime = result.data.PropertyCrime;
              }
              else {
                $scope.Errors = result.data.Result.Errors;
              }
            }, function (error) {
              $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
            });
          }
          else {
            $.extend(location, result.data.Location);
            $scope.Errors = result.data.Result.Errors;
          }
        }, function (error) {
          $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
      }
    });
  }

  //--------------------------
  //- Delete Location -
  //--------------------------
  $scope.deleteLocation = function (location) {
    BootstrapDialog.show({
      title: 'Delete Location ' + location.LocationNumber,
      message: 'Are you sure you want to delete this location ' + location.LocationNumber + '?',
      buttons: [{
        label: 'Cancel',
        action: function (dialogItself) {
          dialogItself.close();
        }
      }, {
        label: 'Delete Location',
        cssClass: 'btn-primary',
        action: function (dialogItself) {
          policyService.deleteLocation($scope.PolicyId, { LocationId: location.Id }).then(function (result) {
            if (result.data.Result.Success) {
              $scope.parent.Policy.CurrentVersion.Locations.splice($scope.parent.Policy.CurrentVersion.Locations.indexOf(location), 1);
              if ($scope.parent.Policy.CurrentVersion.Locations.length == 0)
                $scope.parent.Policy.HasLocations = false;
            }
            else {
              $scope.Errors = result.data.Result.Errors;
            }
          }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
          });
          dialogItself.close();
        }
      }]
    });
  }

  // Call this after the whole page is loaded.
  $rootScope.$broadcast('$pageloaded');

}]);

MALACHIAPP.controller('test_Homeowners_locationModelCtrl', ['$rootScope', '$http', '$scope', '$timeout', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'toolsService', 'location', 'policyId', 'locations', function ($rootScope, $http, $scope, $timeout, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, toolsService, location, policyId, locations) {
  $scope.details = {};
  $scope.PolicyId = policyId;
  $scope.original_location = location;
  $scope.Locations = locations;
  $scope.location = $.extend(true, {}, location);
  $scope.Errors = [];
  $scope.TerritoryCodes = [];
  $scope.busy = false;
  $scope.LocationDetails = [];
  getTerritoryCodes($scope.location.TerritoryCode);

  if ($scope.location.LocationNumber == null) {
    if ($scope.Locations.length == 0)
      $scope.location.LocationNumber = 1;
    else
      $scope.location.LocationNumber = Math.max.apply(Math, $scope.Locations.map(function (l) { return l.LocationNumber; })) + 1;
  }

  $scope.locationNumberCheck = function () {
    $scope.showLocationNumberError = false;
    for (var i = 0; i < $scope.Locations.length; i++) {
      var loc = $scope.Locations[i]
      if ($scope.original_location != loc) {
        if (loc.LocationNumber == $scope.location.LocationNumber) {
          $scope.location.LocationNumber = null;
          $scope.showLocationNumberError = true;
        }
      }
    }
  }

  $scope.copyMailingAddress = function () {
    $scope.busy = true;
    $scope.Errors = [];
    policyService.getInsured($scope.PolicyId).then(function (result) {
      if (result.data.Result.Success) {

        var regex = /^ *((#\d+)|((box|bin)[-. \/\\]?\d+)|(.*p[ \.]? ?(o|0)[-. \/\\]? *-?((box|bin)|b|(#|num)?\d+))|(p(ost)? *(o(ff(ice)?)?)? *((box|bin)|b)? *\d+)|(p *-?\/?(o)? *-?box)|post office box|((box|bin)|b) *(number|num|#)? *\d+|(num|number|#) *\d+)/i;
        if ((result.data.StreetAddress1 && result.data.StreetAddress1.match(regex)) || (result.data.StreetAddress2 && result.data.StreetAddress2.replace("#", "").match(regex))) {
          $scope.Errors.push("P.O. boxes are not allowed for physical locations.");
          $scope.busy = false;
          return;
        }

        $scope.location.Address.StreetAddress1 = result.data.StreetAddress1;
        $scope.location.Address.StreetAddress2 = result.data.StreetAddress2;
        $scope.location.Address.City = result.data.City;
        $scope.location.Address.State = result.data.State;
        $scope.location.Address.Zip = result.data.Zip;
        $scope.location.Address.Country = result.data.Country;
        $scope.location.Address.County = result.data.County;
        $scope.location.Address.ShortAddress = result.data.ShortAddress;

        for (var i = 0; i < $scope.States.length; i++) {
          if ($scope.States[i].Name == $scope.location.Address.State) {
            $scope.location.Address.StateObject = $scope.States[i];
            $scope.location.Address.StateCode = $scope.States[i].Code;
          }
        }

        $scope.updateLocation();
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  $scope.addressChange = function () {
    $scope.updateLocation();
  }

  $scope.placeset = function (result) {
    if (result) {
      if ($scope.validateAddressInfo(result)) {

        var county = result.County;
        result.County = county.replace('County', '').trim();

        $scope.location.Address.StreetAddress1 = result.StreetAddress1;
        $scope.location.Address.StreetAddress2 = result.StreetAddress2;
        $scope.location.Address.City = result.City;
        $scope.location.Address.State = result.State;

        for (var i = 0; i < $scope.States.length; i++) {
          if ($scope.States[i].Name == $scope.location.Address.State) {
            $scope.location.Address.StateObject = $scope.States[i];
            $scope.location.Address.StateCode = $scope.States[i].Code;
          }
        }

        $scope.location.Address.Zip = result.Zip;
        $scope.location.Address.Country = result.Country;
        $scope.location.Address.County = result.County;
        $scope.location.Address.ShortAddress = result.formatted_address;

        $scope.updateLocation();
      } else {
        $scope.Errors = ["Unable to geocode address. Please confirm it is a correct address or manually enter it."];
      }
    }
  }

  var disableSave = false;

  $scope.updateLocation = function () {
    $scope.Errors = [];
    $scope.location.Address.ShortAddress = getShortAddress($scope.location);
    if ($scope.location.Address.ShortAddress == null || $scope.location.Address.ShortAddress.trim().length == 0) return;

    $scope.busy = true;
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    policyService.getLocationDetails($scope.location.Address.ShortAddress).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      $scope.busy = false;
      if (result.data.Result.Success) {
        $scope.location.Latitude = result.data.Latitude;
        $scope.location.Longitude = result.data.Longitude;
        $scope.location.CoastLatitude = result.data.CoastLatitude;
        $scope.location.CoastLongitude = result.data.CoastLongitude;
        $scope.location.DistanceToCoast = result.data.DistanceToCoast;
        $scope.location.LandElevation = result.data.LandElevation;

        $scope.updateMapAddress();
        $scope.updateLocationDetails();
        getTerritoryCodes();
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  // Update Location Details
  $scope.updateLocationDetails = function () {
    $scope.LocationDetails.DistanceToCoast = $scope.location.DistanceToCoast;

    var elevation = $scope.location.LandElevation;
    $scope.LocationDetails.LandElevation = (elevation != null) ? Math.round(elevation * 3.28084 * 1000000) / 1000000 : null;

    var latDirection = ($scope.location.Latitude < 0) ? "S" : "N";
    var longDirection = ($scope.location.Longitude < 0) ? "E" : "W";
    $scope.LocationDetails.Latitude = Math.abs(Math.round($scope.location.Latitude * 1000000) / 1000000).toString() + "\xB0" + latDirection;
    $scope.LocationDetails.Longitude = Math.abs(Math.round($scope.location.Longitude * 1000000) / 1000000).toString() + "\xB0" + longDirection;
  }

  $scope.validateAddressInfo = function (address) {
    if (typeof (address) !== "object") return false;

    var hasUndefinedEntry = function (text) {
      return typeof (text) !== "string" || text.includes("undefined");
    }

    if (hasUndefinedEntry(address.StreetAddress1)) return false;
    if (typeof (address.StreetAddress2) === "string" && hasUndefinedEntry(address.StreetAddress2)) return false;
    if (hasUndefinedEntry(address.City)) return false;
    if (hasUndefinedEntry(address.County)) return false;
    if (hasUndefinedEntry(address.State)) return false;
    if (hasUndefinedEntry(address.Zip)) return false;
    if (hasUndefinedEntry(address.Country)) return false;

    return true;
  }

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  }

  $scope.save = function () {
    if (disableSave) return;
    // something.
    $scope.validateInputs();
    if ($scope.ErrorList.length > 0) return;
    if ($scope.location.LocationNumber == null) return;

    var regex = /^ *((#\d+)|((box|bin)[-. \/\\]?\d+)|(.*p[ \.]? ?(o|0)[-. \/\\]? *-?((box|bin)|b|(#|num)?\d+))|(p(ost)? *(o(ff(ice)?)?)? *((box|bin)|b)? *\d+)|(p *-?\/?(o)? *-?box)|post office box|((box|bin)|b) *(number|num|#)? *\d+|(num|number|#) *\d+)/i;
    if (($scope.location.Address.StreetAddress1 && $scope.location.Address.StreetAddress1.match(regex)) || ($scope.location.Address.StreetAddress2 && $scope.location.Address.StreetAddress2.replace("#", "").match(regex))) {
      $scope.Errors.push("P.O. boxes are not allowed for physical locations.");
      return;
    }

    $scope.original_location.Id = $scope.location.Id;
    $scope.original_location.LocationNumber = $scope.location.LocationNumber;
    $scope.original_location.Address.StreetAddress1 = $scope.location.Address.StreetAddress1;
    $scope.original_location.Address.StreetAddress2 = $scope.location.Address.StreetAddress2;
    $scope.original_location.Address.City = $scope.location.Address.City;
    $scope.original_location.Address.State = $scope.location.Address.StateObject.Name;
    $scope.original_location.Address.StateCode = $scope.location.Address.StateObject.Code;
    $scope.original_location.Address.Zip = $scope.location.Address.Zip;
    $scope.original_location.Address.Country = $scope.location.Address.Country;
    $scope.original_location.Address.County = $scope.location.Address.County;
    $scope.original_location.TerritoryCode = $scope.location.TerritoryCode;

    $scope.original_location.Latitude = $scope.location.Latitude;
    $scope.original_location.Longitude = $scope.location.Longitude;
    $scope.original_location.CoastLatitude = $scope.location.CoastLatitude;
    $scope.original_location.CoastLongitude = $scope.location.CoastLongitude;
    $scope.original_location.DistanceToCoast = $scope.location.DistanceToCoast;
    $scope.original_location.LandElevation = $scope.location.LandElevation;

    $scope.original_location.Address.ShortAddress = getShortAddress($scope.original_location);

    if ($scope.original_location.Address.ShortAddress != null && $scope.original_location.Address.ShortAddress.trim().length > 0) {
      $modalInstance.close($scope.original_location);
    }
  }


  $scope.updateStateFromZip = function () {
    $scope.ErrorList = [];
    var zip = $scope.location.Address.Zip;

    // Check the entered zip code to make sure it meets the minimum requirements
    if (zip == null || zip === "") {
      $scope.ErrorList.push("Please enter a valid zip code");
    } else {
      if (zip.length < 5) {
        $scope.ErrorList.push("Zip code must be 5 digits long");
        $scope.location.Address.Zip = "";
        $scope.location.Address.StateObject = null;
        $scope.location.Address.County = "";
        $scope.location.Address.City = "";
      }
    }

    if ($scope.ErrorList.length > 0) return;

    toolsService.getStateAndCountyByZip(zip).then(function (result) {
      if (result.data.Result.Success) {
        if (result.data.State != null) {
          $scope.location.Address.County = result.data.State.County;
          $scope.location.Address.City = result.data.State.City;

          for (var i = 0; i < $scope.States.length; i++) {
            if ($scope.States[i].Name === result.data.State.Name) {
              $scope.location.Address.StateObject = $scope.States[i];
              $scope.location.Address.StateCode = $scope.States[i].Code;
            }
          }

        } else {

          $scope.ErrorList.push("Could not find State and County for entered zip code: " + $scope.location.Address.Zip);
          $scope.location.Address.Zip = "";
          $scope.location.Address.StateObject = null;
          $scope.location.Address.County = "";
          $scope.location.Address.City = "";
        }

      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

  }

  $scope.validateInputs = function () {
    $scope.ErrorList = [];

    if (checkInputs($scope.location.Address.StreetAddress1)) {
      $scope.ErrorList.push('Address 1 cannot be blank.');
    }

    if (checkInputs($scope.location.Address.City)) {
      $scope.ErrorList.push('City cannot be blank.');
    }

    if (checkInputs($scope.location.Address.Zip)) {
      $scope.ErrorList.push('Zip cannot be blank.');
    }

    if ($scope.location.Address.County === null || $scope.location.Address.County === undefined) {
      $scope.ErrorList.push('County cannot be blank.');
    }

    if (checkInputs($scope.location.Address.StateObject)) {
      $scope.ErrorList.push('Please select a State.');
    }

    // Check States
    var allowedStates = ['Florida', 'Georgia', 'Alabama', 'Mississippi', 'South Carolina', 'North Carolina', 'Virginia', 'New York', 'New Jersey',
      'Connecticut', 'Pennsylvania', 'Texas', 'Louisiana', 'Oklahoma', 'California', 'Colorado', 'Oregon', 'Nevada', 'Washington'];

    if (allowedStates.indexOf($scope.location.Address.StateObject.Name) <= -1) {
      $scope.ErrorList.push('Not authorized to write in selected state.');
    }
  }

  function checkInputs(input) {
    if (input == '' || input == undefined) {
      return true;
    }
    else {
      return false;
    }
  }

  function getShortAddress(location) {
    var address = [];
    if (location.Address.StreetAddress1 != null && location.Address.StreetAddress1 != '') address.push(location.Address.StreetAddress1);
    //if (location.Address.StreetAddress2 != null && location.Address.StreetAddress2 != '') address.push(location.Address.StreetAddress2);
    if (location.Address.City != null && location.Address.City != '') address.push(location.Address.City);
    if (location.Address.StateCode != null && location.Address.StateCode != '') address.push(location.Address.StateCode);
    if (location.Address.Zip != null && location.Address.Zip != '') address.push(location.Address.Zip);
    return address.join(', ');
  }

  function getTerritoryCodes(code) {
    if ($scope.location == null || $scope.location.Address.StateCode == null || $scope.location.Address.Zip == null) return;
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    policyService.getTerritoryCodes($scope.location.Address.StateCode, $scope.location.Address.Zip).then(function (result) {
      if (result.data.Result.Success) {
        if (code)
          $scope.location.TerritoryCode = code;
        else
          $scope.location.TerritoryCode = result.data.TerritoryCodes[0];
        $scope.TerritoryCodes = result.data.TerritoryCodes;
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
      Metronic.unblockUI('.modal-dialog');
    }, function (error) {
      Metronic.unblockUI('.modal-dialog');
    });
  }

  toolsService.getStates().then(function (result) {
    if (result.data.Result.Success) {
      $scope.States = result.data.States;
      for (var i = 0; i < $scope.States.length; i++) {
        if ($scope.States[i].Name == $scope.location.Address.State) {
          $scope.location.Address.StateObject = $scope.States[i];
        }
      }
    }
    else {
      $scope.Errors = result.data.Result.Errors;
    }
  }, function (error) {
    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
  });


  //--------------------------
  //- Map -
  //--------------------------
  var map = null;
  var addressMarker = null;
  var coastMarker = null;
  var linePath = null;
  var panorama = null;
  var heading = null;

  /* Update Map Address */
  $scope.updateMapAddress = function () {
    var mapOptions = {
      zoom: 10,
      center: new google.maps.LatLng($scope.location.Latitude, $scope.location.Longitude),
      scaleControl: true
    };

    $scope.prepareMap(mapOptions);

    google.maps.event.addListener(coastMarker, 'mouseup', function (e) {
      $scope.drawLinePath(addressMarker.getPosition(), e.latLng, false);
      $scope.updateLocationDetails();
      coastMarker.title = 'Lat: ' + e.latLng.lat() + ', Lng: ' + e.latLng.lng();
    });
  }

  /* Prepare Map */
  $scope.prepareMap = function (mapOptions) {
    var shortAddress = $scope.location.Address.ShortAddress;
    var addressLocation = mapOptions.center;
    var coastLocation = new google.maps.LatLng($scope.location.CoastLatitude, $scope.location.CoastLongitude);
    var sv = new google.maps.StreetViewService();

    var mapCanvas = document.getElementById("map_canvas");
    map = new google.maps.Map(mapCanvas, mapOptions);
    $scope.showLocationToggle = true;

    addressMarker = new google.maps.Marker({
      map: map,
      position: addressLocation,
      title: shortAddress + '\nLat: ' + addressLocation.lat() + ', Lng: ' + addressLocation.lng(),
      icon: '/content/img/building.png',
    });

    coastMarker = new google.maps.Marker({
      map: map,
      position: coastLocation,
      title: 'Lat: ' + coastLocation.lat() + ', Lng: ' + coastLocation.lng(),
      draggable: true
    });

    $scope.drawLinePath(addressLocation, coastLocation, true);

    sv.getPanorama({ location: addressLocation, radius: 75 },
      function (streetViewPanoramaData, status) {
        if (status === google.maps.StreetViewStatus.OK) {
          heading = google.maps.geometry.spherical.computeHeading(streetViewPanoramaData.location.latLng, addressLocation);
          panorama = map.getStreetView();
          panorama.setPosition(addressLocation);
          panorama.setPov(/** @type {google.maps.StreetViewPov} */
            ({
              heading: heading,
              pitch: 0
            }));
        }
      });
  }

  $scope.toggleStreetView = function () {
    var toggle = panorama.getVisible();
    if (toggle == false) {
      panorama.setVisible(true);
    } else {
      panorama.setVisible(false);
    }
  }

  /* Draw Line Path */
  $scope.drawLinePath = function (addressLocation, coastLocation, zoomOption) {
    if (map == null) return;
    if (linePath != null) linePath.setMap(null);

    linePath = new google.maps.Polyline({
      path: [addressLocation, coastLocation],
      strokeColor: "#0000FF",
      strokeOpacity: 1.0,
      strokeWeight: 5,
    });

    var distance = google.maps.geometry.spherical.computeDistanceBetween(addressLocation, coastLocation) * 0.000621371192;

    $scope.location.DistanceToCoast = Math.round(distance * 100) / 100;
    $scope.location.CoastLatitude = coastLocation.lat();
    $scope.location.CoastLongitude = coastLocation.lng();

    if (zoomOption) {
      if (distance <= 1)
        map.setZoom(12);
      else if (distance < 5)
        map.setZoom(10);
      else if (distance < 40)
        map.setZoom(9);
      else if (distance < 80)
        map.setZoom(7);
      else if (distance < 150)
        map.setZoom(6);
      else
        map.setZoom(5);
    }

    linePath.setMap(map);
  }

  if (location.Address.ShortAddress != null && location.Address.ShortAddress.trim().length > 0) {
    $timeout(function () {
      $scope.updateMapAddress();
      $scope.updateLocationDetails();
    }, 0, false);
  }

  $scope.getLocationNumber = function () {
    Metronic.blockUI({ target: '.modal-dialog', animate: true, overlayColor: 'none' });
    policyService.getLocationNumber($scope.PolicyId, $scope.location).then(function (result) {
      Metronic.unblockUI('.modal-dialog');
      if (result.data.Result.Success) {
        $scope.location.LocationNumber = result.data.LocationNumber;
      }
      else {
        $scope.Errors = result.data.Result.Errors;
      }
    }, function (error) {
      $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });
  }

  if ($scope.location.LocationNumber == null) {
    $scope.getLocationNumber();
  }
}]);

