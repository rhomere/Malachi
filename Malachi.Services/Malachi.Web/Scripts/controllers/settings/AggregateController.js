MALACHIAPP.controller('AggregateController', ['$rootScope', '$scope', '$location', '$stateParams', '$state', 'settings', 'accountService', 'toolsService', 'settingsService', function ($rootScope, $scope, $location, $stateParams, $state, settings, accountService, toolsService, settingsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
        // set default layout mode
        $rootScope.settings.layout.pageBodySolid = false;
        //$rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope.ZoneGroup = $stateParams.ZoneGroup;
    if ($scope.ZoneGroup == null) {
        $state.transitionTo('insurers');
        return;
    }

    $scope.$on('$viewContentLoaded', function () {
        loadleafletMap();

        //---------------------------------------------
        // Controls
        //---------------------------------------------
        L.shapeManager = new L.ShapeManager({ map: map });
        map.createPane('custompane');
        var l = L.featureGroup({ pane: 'custompane' }).addTo(map);
        var color = '#ca46d6';
        l.setStyle({ color: color, fillColor: color });
        l.color = color;
        l.fillColor = color;
        L.shapeManager.addControl({
            map: map,
            layer: null,
            name: 'customlayer',
            pane: 'custompane',
            featureGroup: l,
            polygonBtn: 'polygon',
            onUpdateEnded: function () {
                LayerManager.Update(true);
            }
        });
    });

    $scope.Zones = [];
    $scope.AllZones = [];

    settingsService.getZonesWithAggregate($scope.ZoneGroup.Id).then(function (result) {
        if (result.data.Result.Success) {
            $scope.Zones = result.data.Zones;

            function getAllZones(zones) {
                for (var i = 0; i < zones.length; i++) {
                    $scope.AllZones.push(zones[i]);
                    if (zones[i].Children != null && zones[i].Children.length > 0) {
                        getAllZones(zones[i].Children);
                    }
                }
            }
            getAllZones($scope.Zones);

            $scope.allZones();
            loadZone($scope.Zones);
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });

    $scope.groupedZones = [];
    $scope.singleZones = [];
    $scope.breadcrumbs = [];
    $scope.activeZone = null;
    $scope.selectedZone = {
        Name: "None"
    };
    $scope.zoneCheckAll = false;
    var newZoneBoundries = {
        'Empty': [], 'States': [], 'Counties': [], 'Zips': [], 'Custom': []
    };
    //---------------------------------------------
    // Zone Management
    //---------------------------------------------
    $scope.allZones = function () {
        clearMap();

        $scope.groupedZones = [];
        $scope.singleZones = [];
        $scope.breadcrumbs = [];
        $scope.activeZone = null;

        var numberOfZones = 0;
        var numberOfWindZones = 0;
        for (var i = 0; i < $scope.Zones.length; i++) {
            if ($scope.Zones[i].ParentId == null && $scope.Zones[i].Children.length > 0) {
                $scope.groupedZones.push($scope.Zones[i]);
                numberOfZones++;
                if ($scope.Zones[i].Wind) numberOfWindZones++;
            }
            else if ($scope.Zones[i].ParentId == null && $scope.Zones[i].Children.length == 0) {
                $scope.singleZones.push($scope.Zones[i]);
                numberOfZones++;
                if ($scope.Zones[i].Wind) numberOfWindZones++;
            }
        }

        $scope.zoneCheckAll = (numberOfWindZones == numberOfZones);

        // Refresh Style of Every Shape
        refreshLayerStyles($scope.Zones);
        map.setView([27, -82], 5);

        $scope.selectedZone = {
            Name: "None"
        };

        loadZone($scope.Zones)
    }

    $scope.childZones = function (parent) {
        // Refresh Style of Every Shape
        refreshLayerStyles($scope.Zones);

        $scope.activeZone = parent;
        $scope.groupedZones = [];
        $scope.singleZones = [];
        $scope.breadcrumbs = [];
        var numberOfZones = 0;
        var numberOfWindZones = 0;
        for (var i = 0; i < parent.Children.length; i++) {
            if (parent.Children[i].Children.length > 0) {
                $scope.groupedZones.push(parent.Children[i]);
                numberOfZones++;
                if (parent.Children[i]) numberOfWindZones++;
            }
            else if (parent.Children[i].Children.length == 0) {
                $scope.singleZones.push(parent.Children[i]);
                numberOfZones++;
                if (parent.Children[i]) numberOfWindZones++;
            }
        }
        $scope.zoneCheckAll = (numberOfWindZones == numberOfZones);

        var cZone = parent;
        var nZone = null;

        // Set Parent Style
        if (parent.Boundry != null) {
            setLayerStyleActive(parent.Boundry);
            map.fitBounds(parent.Boundry.getBounds());
        }
        else {
            var bounds = null;

            for (var i = 0; i < parent.Children.length; i++) {
                if (parent.Children[i].Boundry != null) {
                    if (bounds != null) {
                        bounds.extend(parent.Children[i].Boundry.getBounds());
                    }
                    else {
                        bounds = parent.Children[i].Boundry.getBounds();
                    }
                }
            }

            if (bounds != null) {
                map.fitBounds(bounds);
            }
        }

        loadZones(parent, parent.Children);
        $scope.selectedZone = parent;
        // Breadcrumbs
        while (true) {
            $scope.breadcrumbs.unshift(cZone);
            cZone = getZoneParent($scope.Zones, cZone.ParentId);
            if (cZone == null) break;
            if (cZone.ParentId == null) {
                $scope.breadcrumbs.unshift(cZone);
                break;
            }
        }
    }

    function setLayerStyleActive(boundry) {
        if (boundry != null) {
            boundry.eachLayer(function (layer) {
                layer.setStyle({ fillOpacity: 0 })
            });
        }
    }

    function refreshLayerStyles(zones) {
        for (var i = 0; i < zones.length; i++) {
            if (zones[i].Boundry != null) {
                zones[i].Boundry.eachLayer(function (layer) {
                    layer.setStyle({ fillOpacity: 0.2 })
                });
                refreshLayerStyles(zones[i].Children)
            }
        }
    }

    $scope.addNewZone = false;

    $scope.checkUncheckAll = function (groupedZones, singleZones) {
        for (var i = 0; i < groupedZones.length; i++) {
            groupedZones[i].Wind = $scope.zoneCheckAll;
            saveZone(groupedZones[i]);
        }
        for (var i = 0; i < singleZones.length; i++) {
            singleZones[i].Wind = $scope.zoneCheckAll;
            saveZone(singleZones[i]);
        }
    };

    function removeBounderies(zone) {
        if (zone.Boundry != null) zone.Boundry.removeFrom(map);

        if (zone.Children != null) {
            for (var i = 0; i < zone.Children.length; i++) {
                removeBounderies(zone.Children[i]);
            }
        }
    }

    function deleteZones(zone) {
        $scope.AllZones.splice($.inArray(zone, $scope.AllZones), 1);
        if (zone.Children != null) {
            for (var i = 0; i < zone.Children.length; i++) {
                deleteZones(zone.Children[i]);
            }
        }
    }

    //---------------------------------------------
    // States Tab
    //---------------------------------------------
    var geoJsons = {
    };
    var geoJsonData = {
    };

    $scope.checkAllStates = function () {
        for (var i = 0; i < $scope.States.length; i++) {
            $scope.States[i].Checked = true;
            $scope.changeState($scope.States[i]);
        }
    }

    $scope.uncheckAllStates = function () {
        for (var i = 0; i < $scope.States.length; i++) {
            $scope.States[i].Checked = false;
            $scope.changeState($scope.States[i]);
        }
    }

    $scope.changeState = function (state) {
        if (state.Checked) {
            if (state.GeoJson == null) {
                if (state.GeoJsonData == null) {
                    toolsService.getGeoJson('State', state.Name, state.Name).then(function (result) {
                        if (result.data.Result.Success) {
                            if (state.Checked) geoJsons[result.data.GeoJson.Id] = L.geoJson(JSON.parse(result.data.GeoJson.Data)).addTo(map);
                            geoJsonData[result.data.GeoJson.Id] = JSON.parse(result.data.GeoJson.Data);
                            state.Id = result.data.GeoJson.Id;
                            state.Name = result.data.GeoJson.Name;
                            newZoneBoundries['States'].push(state);
                        }
                        else {
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }
                else {
                    state.GeoJson = L.geoJson(state.GeoJsonData).addTo(map);
                }

                $scope.newZone.Name = state.Name;
            }
        }
        else {
            if (geoJsons[state.Id] != null) {
                geoJsons[state.Id].removeFrom(map);
                geoJsons[state.Id] = null;
            }
        }
    }

    //---------------------------------------------
    // Counties Tab
    //---------------------------------------------
    $scope.checkAllCounties = function (state) {
        for (var i = 0; i < state.Counties.length; i++) {
            state.Counties[i].Checked = true;
            $scope.changeCounty(state, state.Counties[i]);
        }
    }

    $scope.uncheckAllCounties = function (state) {
        if (state == null) {
            for (var j = 0; j < $scope.States.length; j++) {
                for (var i = 0; i < $scope.States[j].Counties.length; i++) {
                    $scope.States[j].Counties[i].Checked = false;
                    $scope.changeCounty($scope.States[j], $scope.States[j].Counties[i]);
                }
            }
        }
        else {
            for (var i = 0; i < state.Counties.length; i++) {
                state.Counties[i].Checked = false;
                $scope.changeCounty(state, state.Counties[i]);
            }
        }
    }

    $scope.changeCounty = function (state, county) {
        if (county.Checked) {
            if (county.GeoJson == null) {
                if (county.GeoJsonData == null) {
                    toolsService.getGeoJson('County', state.Name + "_" + county.Name, county.Name).then(function (result) {
                        if (result.data.Result.Success) {
                            if (county.Checked) geoJsons[result.data.GeoJson.Id] = L.geoJson(JSON.parse(result.data.GeoJson.Data)).addTo(map);
                            geoJsonData[result.data.GeoJson.Id] = JSON.parse(result.data.GeoJson.Data);
                            county.Id = result.data.GeoJson.Id;
                            county.Name = result.data.GeoJson.Name;
                            newZoneBoundries['Counties'].push(county);
                        }
                        else {
                            $scope.Errors = result.data.Result.Errors;
                        }
                    }, function (error) {
                        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                    });
                }
                else {
                    county.GeoJson = L.geoJson(county.GeoJsonData).addTo(map);
                }

                $scope.newZone.Name = county.Name;
            }
        }
        else {
            if (geoJsons[county.Id] != null) {
                geoJsons[county.Id].removeFrom(map);
                geoJsons[county.Id] = null;
            }
        }
    }

    //---------------------------------------------
    // Zips Tab
    //---------------------------------------------
    var zipGeo = {
    };
    var zipRequest = null;
    $scope.changeZipCodes = function () {
        if (zipRequest != null) clearTimeout(zipRequest);

        zipRequest = setTimeout(function () {
            var zipCodes = $scope.zipCodes;

            // Mark Existing ones
            for (var key in zipGeo) {
                zipGeo[key].Remove = true;
                geoJsons[zipGeo[key].Id].removeFrom(map);
            }


            if (zipCodes != null && zipCodes.length > 0) {
                var zips = zipCodes.split(/[\s,]+/);

                for (var i = 0; i < zips.length; i++) {
                    if (zips[i].trim().length == 5) {
                        var key = zips[i].trim();

                        if (zipGeo[key] == null) {
                            toolsService.getGeoJson('Zip', key, key).then(function (result) {
                                if (result.data.Result.Success) {
                                    if (zipGeo[result.data.GeoJson.Name] == null) {
                                        zipGeo[result.data.GeoJson.Name] = {
                                            Remove: false,
                                            Id: result.data.GeoJson.Id,
                                            Name: result.data.GeoJson.Name
                                        };
                                        geoJsons[result.data.GeoJson.Id] = L.geoJson(JSON.parse(result.data.GeoJson.Data)).addTo(map);
                                        geoJsonData[result.data.GeoJson.Id] = JSON.parse(result.data.GeoJson.Data);
                                        newZoneBoundries['Zips'].push(zipGeo[result.data.GeoJson.Name]);
                                    }
                                }
                                else {
                                    $scope.Errors = result.data.Result.Errors;
                                }
                            }, function (error) {
                                $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                            });

                        } else {
                            zipGeo[key].Remove = false;
                            geoJsons[zipGeo[key].Id] = L.geoJson(geoJsonData[zipGeo[key].Id]).addTo(map);
                        }
                    }
                }
            }
        }, 1000);
    }

    //---------------------------------------------
    // Any Tab
    //---------------------------------------------
    $scope.newZoneTabChange = function (type) {
        for (var key in newZoneBoundries) {
            if (newZoneBoundries.hasOwnProperty(key)) {
                for (var i = 0; i < newZoneBoundries[key].length; i++) {
                    if (key == type) {
                        if (newZoneBoundries[key][i].GeoJsonData != null && newZoneBoundries[key][i].Remove != true) {
                            newZoneBoundries[key][i].GeoJson = L.geoJson(newZoneBoundries[key][i].GeoJsonData).addTo(map);
                        }
                    } else if (newZoneBoundries[key][i].GeoJson != null) {
                        newZoneBoundries[key][i].GeoJson.removeFrom(map);
                        newZoneBoundries[key][i].GeoJson = null;
                    }
                }
            }
        }
    }

    //---------------------------------------------
    // Refresh Map
    //---------------------------------------------
    // Load States and Counties
    toolsService.getStatesAndCounties().then(function (result) {
        if (result.data.Result.Success) {
            $scope.States = result.data.States;
        }
        else {
            $scope.Errors = result.data.Result.Errors;
        }
    }, function (error) {
        $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
    });


    function getChildBoundry(parent, zones) {
        for (var i = 0; i < zones.length; i++) {
            if (zones[i].GeoJsonId != null) {
                var zone = zones[i];

                parent.BottomLeftLat = parent.BottomLeftLat == 0 || parent.BottomLeftLat > zone.BottomLeftLat ? zone.BottomLeftLat : parent.BottomLeftLat;
                parent.BottomLeftLng = parent.BottomLeftLng == 0 || parent.BottomLeftLng > zone.BottomLeftLng ? zone.BottomLeftLng : parent.BottomLeftLat;
                parent.BottomRightLat = parent.BottomRightLat == 0 || parent.BottomRightLat < zone.BottomRightLat ? zone.BottomRightLat : parent.BottomRightLat;
                parent.BottomRightLng = parent.BottomRightLng == 0 || parent.BottomRightLng > zone.BottomRightLng ? zone.BottomRightLng : parent.BottomRightLng;
                parent.TopLeftLat = parent.TopLeftLat == 0 || parent.TopLeftLat > zone.TopLeftLat ? zone.TopLeftLat : parent.TopLeftLat;
                parent.TopLeftLng = parent.TopLeftLng == 0 || parent.TopLeftLng < zone.TopLeftLng ? zone.TopLeftLng : parent.TopLeftLng;
                parent.TopRightLat = parent.TopRightLat == 0 || parent.TopRightLat < zone.TopRightLat ? zone.TopRightLat : parent.TopRightLat;
                parent.TopRightLng = parent.TopRightLng == 0 || parent.TopRightLng < zone.TopRightLng ? zone.TopRightLng : parent.TopRightLng;
            }
            else if (zones[i].Children.length > 0) {
                // Get Total Boundry
                getChildBoundry(parent, zones[i].Children)
            }
        }
    }

    function removeZoneFromParent(zone, zones) {
        for (var i = 0; i < zones.length; i++) {
            if (zones[i].Id == zone.Id) {
                // Remove                
                zones.splice($.inArray(zone, zones), 1);
                return true;
            }

            if (zones[i].Children.length > 0) {
                if (removeZoneFromParent(zone, zones[i].Children)) return true;
            }
        }
    }

    $scope.loadZones = function (parent, zones) {
        if (zones != null)
            loadZones(parent, zones);
        else
            loadZones(parent, $scope.Zones);
    }

    function loadZones(parent, zones) {
        if (zones != null)
            loadZone(zones);
        if (parent != null)
            loadGeoJsonData(parent);
    }

    function loadZone(zones, dontClear) {
        if (dontClear != true)
            clearMap();

        if (zones != null) {
            for (var i = 0; i < zones.length; i++) {

                if (zones[i].Limit != null)
                    zones[i].Limit = zones[i].Limit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                if (zones[i].CustomBoundry != null) {

                }
                else if (zones[i].GeoJsonId != null) {
                    loadGeoJsonData(zones[i]);
                }


                if ($scope.viewChildShapes && zones[i].Children.length > 0) {
                    loadZone(zones[i].Children, true);
                }
            }
        }
    }

    function loadGeoJsonData(zone) {
        if (zone.GeoJsonId != null) {
            if (zone.Boundry == null) {
                toolsService.getGeoJsonById(zone.GeoJsonId).then(function (result) {
                    if (result.data.Result.Success) {
                        if (zone.Boundry == null) zone.Boundry = L.geoJson(JSON.parse(result.data.GeoJson.Data)).addTo(map);
                    }
                    else {
                        $scope.Errors = result.data.Result.Errors;
                    }
                }, function (error) {
                    $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
                });
            }
            else {
                zone.Boundry.removeFrom(map);
                zone.Boundry.addTo(map);
            }
        }
    }

    function clearMap() {
        for (var i = 0; i < $scope.AllZones.length; i++) {
            if ($scope.AllZones[i].Boundry != null) {
                $scope.AllZones[i].Boundry.removeFrom(map);
            }
        }
    }

    function getZoneParent(children, parentId) {
        var parent = null;

        if (parentId == null) return null;

        for (var i = 0; i < children.length; i++) {
            if (parentId == children[i].Id) return children[i];

            if (children[i].Children.length > 0) {
                parent = getZoneParent(children[i].Children, parentId)
            }

            if (parent != null) return parent;
        }

        return parent;
    }


}]);
