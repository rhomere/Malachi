/***
Global Directives
***/

// Show button to open structure insights modal
MALACHIAPP.directive('ngStructureInsights', ['$modal',
    function ($modal) {
        var link = function (scope, element, attrs) {
            scope.type = attrs.type;
            if (!scope.type) {
                scope.type = 'button';
            }

            scope.openStructureInsightsModal = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'Views/Shared/structureInsights.html?v=' + version,
                    controller: 'structureInsights', /* <-- Controller must be loaded when used */
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        location: function () {
                            return scope.location;
                        }
                    }
                });

                modalInstance.result.then(function (data) {
                    if (data != 'cancel') {
                    }
                });
            };
        }

        return {
            restrict: 'E',
            scope: {
                location: '=location'
            },
            templateUrl: 'Views/Shared/structureInsightsDirective.html',
            link: link
        };
    }
]);

// Route State Load Spinner(used on page or content load)
MALACHIAPP.directive('ngSpinnerBar', ['$rootScope',
    function ($rootScope) {
        return {
            link: function (scope, element, attrs) {
                // by defult hide the spinner bar
                element.addClass('hide'); // hide spinner bar by default

                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function () {
                    //$('.page-content').hide();
                    //element.removeClass('hide'); // show spinner bar
                });


                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$pageloaded', function () {
                    element.addClass('hide'); // hide spinner bar
                    //$('.page-content').show();
                    //$('div').removeClass('page-on-load'); // remove page loading indicator
                    Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu

                    // auto scorll to page top
                    //setTimeout(function () {
                    //    Metronic.scrollTop(); // scroll to the top on content load
                    //}, $rootScope.settings.layout.pageAutoScrollOnLoad);     
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function () {
                    element.addClass('hide'); // hide spinner bar
                });

                // handle errors
                $rootScope.$on('$stateChangeError', function () {
                    element.addClass('hide'); // hide spinner bar
                });
            }
        };
    }
])

// Handle global LINK click
MALACHIAPP.directive('a', function () {
    return {
        restrict: 'E',
        link: function (scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                elem.on('click', function (e) {
                    e.preventDefault(); // prevent link click for above criteria
                });
            }
        }
    };
});

// Handle Dropdown Hover Plugin Integration
MALACHIAPP.directive('dropdownMenuHover', function () {
    return {
        link: function (scope, elem) {
            elem.dropdownHover();
        }
    };
});


/**
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
angular.module('MALACHIAPP').filter('unique', function () {

    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }
            };

            angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    newItems.push(item);
                }

            });
            items = newItems;
        }
        return items;
    };
});

angular.module("ngAutocomplete", [])
  .directive('ngAutocomplete', function () {
      return {
          require: 'ngModel',
          scope: {
              ngModel: '=',
              options: '=?',
              details: '=?',
              placeset: '=?'
          },

          link: function (scope, element, attrs, controller) {

              //options for autocomplete
              var opts;
              var watchEnter = false;
              //convert options provided to opts
              var initOpts = function () {

                  opts = {}
                  if (scope.options) {

                      if (scope.options.watchEnter !== true) {
                          watchEnter = false
                      } else {
                          watchEnter = true;
                      }

                      if (scope.options.types) {
                          opts.types = [];
                          opts.types.push(scope.options.types);
                          scope.gPlace.setTypes(opts.types);
                      } else {
                          scope.gPlace.setTypes([])
                      }

                      if (scope.options.bounds) {
                          opts.bounds = scope.options.bounds;
                          scope.gPlace.setBounds(opts.bounds);
                      } else {
                          scope.gPlace.setBounds(null)
                      }

                      if (scope.options.country) {
                          opts.componentRestrictions = {
                              country: scope.options.country
                          }
                          scope.gPlace.setComponentRestrictions(opts.componentRestrictions);
                      } else {
                          scope.gPlace.setComponentRestrictions(null);
                      }
                  }
                  scope.gPlace.setComponentRestrictions({ 'country': ['us', 'pr', 'vi', 'gu', 'mp'] });
              }

              if (scope.gPlace == undefined) {
                  scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
              }
              google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                  var result = scope.gPlace.getPlace();
                  if (result !== undefined) {
                      if (result.address_components !== undefined) {

                          scope.$apply(function () {

                              scope.details = result;

                              controller.$setViewValue(element.val());

                              if (scope.$parent.placeset != null) scope.$parent.placeset(parseResult(result));

                              if (scope.placeset != null) scope.placeset(true);
                          });
                      }
                      else {
                          if (watchEnter) {
                              getPlace(result)
                          }
                      }
                  }
              })

              //function to get retrieve the autocompletes first result using the AutocompleteService 
              var getPlace = function (result) {
                  var autocompleteService = new google.maps.places.AutocompleteService();                  
                  if (result.name.length > 0) {
                      autocompleteService.getPlacePredictions(
                        {
                            input: result.name,
                            offset: result.name.length
                        },
                        function listentoresult(list, status) {
                            if (list == null || list.length == 0) {

                                scope.$apply(function () {
                                    scope.details = null;
                                });

                            } else {
                                var placesService = new google.maps.places.PlacesService(element[0]);
                                placesService.getDetails(
                                  { 'reference': list[0].reference },
                                  function detailsresult(detailsResult, placesServiceStatus) {

                                      if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                                          scope.$apply(function () {

                                              controller.$setViewValue(detailsResult.formatted_address);
                                              element.val(detailsResult.formatted_address);

                                              scope.details = detailsResult;

                                              if (scope.$parent.placeset != null) scope.$parent.placeset(true);

                                              if (scope.placeset != null) scope.placeset(true);

                                              //on focusout the value reverts, need to set it again.
                                              var watchFocusOut = element.on('focusout', function (event) {
                                                  element.val(detailsResult.formatted_address);
                                                  element.unbind('focusout')
                                              })

                                          });
                                      }
                                  }
                                );
                            }
                        });
                  }
              }

              controller.$render = function () {
                  var location = controller.$viewValue;
                  element.val(location);
              };

              //watch options provided to directive
              scope.watchOptions = function () {
                  return scope.options
              };
              scope.$watch(scope.watchOptions, function () {
                  initOpts()
              }, true);

              var parseResult = function (place) {
                  var street_number, route, subpremise, locality, administrative_area_level_1, administrative_area_level_2, country, postal_code;
                  var placeSearch, autocomplete;
                  var componentForm = {
                      street_number: 'short_name',
                      route: 'long_name',
                      locality: 'long_name',
                      sublocality: 'long_name',
                      sublocality_level_1: 'long_name',
                      neighborhood: 'long_name',
                      administrative_area_level_1: 'long_name',
                      administrative_area_level_2: 'long_name',
                      country: 'short_name',
                      postal_code: 'short_name',
                      subpremise: 'short_name'
                  };
                  for (var i = 0; i < place.address_components.length; i++) {
                      var addressType = place.address_components[i].types[0];
                      if (componentForm[addressType]) {
                          var val = place.address_components[i][componentForm[addressType]];
                          if (val != null) {
                              if (addressType == "street_number") street_number = val;
                              if (addressType == "route") route = val;
                              if (addressType == "locality" || addressType == "sublocality" || addressType == "sublocality_level_1" || addressType == "neighborhood") locality = val;
                              if (addressType == "administrative_area_level_1") administrative_area_level_1 = val;
                              if (addressType == "administrative_area_level_2") administrative_area_level_2 = val;
                              if (addressType == "country") country = val;
                              if (addressType == "postal_code") postal_code = val;
                              if (addressType == "subpremise") subpremise = val;
                          }
                      }
                  }

                  /* Means the location does not have a county */
                  if (!administrative_area_level_2) {
                    administrative_area_level_2 = "";
                  }

                  return {
                      StreetAddress1: street_number + " " + route,
                      StreetAddress2: subpremise,
                      City: locality,
                      State: administrative_area_level_1,
                      County: administrative_area_level_2,
                      Zip: postal_code,
                      Country: country,
                      formatted_address: place.formatted_address,
                      geometry: place.geometry
                  }
              };
          }
      };
  });


MALACHIAPP.directive('ngMin', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMin, function () {
                if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
            });

            var isEmpty = function (value) {
                return angular.isUndefined(value) || value === "" || value === null;
            }

            var minValidator = function (value) {
                var min = scope.$eval(attr.ngMin) || 0;
                if (!isEmpty(value) && parseFloat(value) < parseFloat(min)) {
                    ctrl.$setValidity('ngMin', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('ngMin', true);
                    return value;
                }
            };

            ctrl.$parsers.push(minValidator);
            ctrl.$formatters.push(minValidator);
        }
    };
});

MALACHIAPP.directive('ngMax', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMax, function () {
                if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
            });
            var maxValidator = function (value) {
                var max = scope.$eval(attr.ngMax) || Infinity;
                if (!isEmpty(value) && parseFloat(value) > parseFloat(max)) {
                    ctrl.$setValidity('ngMax', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('ngMax', true);
                    return value;
                }
            };

            ctrl.$parsers.push(maxValidator);
            ctrl.$formatters.push(maxValidator);
        }
    };
});

function isEmpty(value) {
    return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

angular.module('MALACHIAPP')
.directive('datepickerPopup', function () {
    return {
        restrict: 'EAC',
        require: 'ngModel',
        link: function (scope, element, attr, controller) {
            //remove the default formatter from the input directive to prevent conflict
            controller.$formatters.shift();
        }
    }
});

angular.module('MALACHIAPP')
.directive('jqdatepickerterm', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            datechange: '&'
        },
        link: function (scope, element, attrs, ctrl) {
            var d = new Date();
            d.setDate(d.getDate() - 3);
            $(element).datepicker({
                dateFormat: 'mm/dd/yy',
                minDate: d,
                onSelect: function (date) {
                    ctrl.$setViewValue(date);
                    ctrl.$render();

                    if (scope.datechange != null) scope.datechange();

                    scope.$apply();
                }
            });
        }
    };
});


angular.module('MALACHIAPP')
.directive('jqdatepicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            datechange: '&',
            datebeforeshow: '&',
            dateonclose: '&'
        },
        link: function (scope, element, attrs, ctrl) {
            $(element).datepicker({
                dateFormat: 'mm/dd/yy',
                onSelect: function (date) {
                    ctrl.$setViewValue(date);
                    ctrl.$render();

                    if (scope.datechange != null) scope.datechange();

                    scope.$apply();
                },
                beforeShow: function (input) {
                    if (scope.datebeforeshow != null) scope.datebeforeshow();
                },
                onClose: function (dateText, inst) {
                    if (scope.dateonclose != null) scope.dateonclose();
                }
            });
        }
    };
});


angular.module('MALACHIAPP')
.directive('jqdatepickerpast', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            datechange: '&',
            datebeforeshow: '&',
            dateonclose: '&'
        },
        link: function (scope, element, attrs, ctrl) {
            var d = new Date();
            d.setDate(d.getDate());
            $(element)
                .datepicker({
                    dateFormat: 'mm/dd/yy',
                    maxDate: d,
                    onSelect: function (date) {
                        ctrl.$setViewValue(date);
                        ctrl.$render();

                        if (scope.datechange != null) scope.datechange();

                        scope.$apply();
                    },
                    beforeShow: function (input) {
                        if (scope.datebeforeshow != null) scope.datebeforeshow();
                    },
                    onClose: function (dateText, inst) {
                        if (scope.dateonclose != null) scope.dateonclose();
                    }
                });
        }
    };
});


angular.module('MALACHIAPP')
.directive('jqdatepickerendorsement', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            ngMaxDate: '=',
            ngMinDate: '=',
            datechange: '&',
            datebeforeshow: '&',
            dateonclose: '&'
        },
        link: function (scope, element, attrs, ctrl) {

            function init() {
                var d = new Date(scope.ngMinDate);
                var d1 = new Date(scope.ngMaxDate);
                $(element).datepicker("destroy");
                $(element)
                    .datepicker({
                        dateFormat: 'mm/dd/yy',
                        minDate: d,
                        maxDate: d1,
                        onSelect: function (date) {
                            ctrl.$setViewValue(date);
                            ctrl.$render();

                            if (scope.datechange != null) scope.datechange();

                            scope.$apply();
                        },
                        beforeShow: function (input) {
                            if (scope.datebeforeshow != null) scope.datebeforeshow();
                        },
                        onClose: function (dateText, inst) {
                            if (scope.dateonclose != null) scope.dateonclose();
                        }
                    });
            }

            //watch options provided to directive
            scope.watchOptions = function () {
                return scope.ngMaxDate;
            };
            scope.$watch(scope.watchOptions, function () {
                init();
            }, true);

            init();
        }
    };
});


MALACHIAPP.directive('charLimit', ['$compile', '$log', function ($compile, $log) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            attrs.$set("ngTrim", "false");
            var maxlength = parseInt(attrs.charLimit, 10);
            ctrl.$parsers.push(function (value) {
                if (value.length > maxlength) {
                    value = value.substr(0, maxlength);
                    ctrl.$setViewValue(value);
                    ctrl.$render();
                }
                return value;
            });
        }
    };
}]);

MALACHIAPP.directive('capitalize', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            var capitalize = function (inputValue) {
                if (inputValue == undefined) inputValue = '';
                var capitalized = inputValue.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
                if (capitalized !== inputValue) {
                    modelCtrl.$setViewValue(capitalized);
                    modelCtrl.$render();
                }
                return capitalized;
            }

            modelCtrl.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]); // capitalize initial value
        }
    };
});

MALACHIAPP.directive('numberMask', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $(element).numeric();
        }
    }
});

MALACHIAPP.filter('customCurrency', ['$filter', function ($filter) {
    return function (input) {
        input = parseFloat(input);
        input = input.toFixed(input % 1 === 0 ? 0 : 2);
        return '$' + input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
}]);
