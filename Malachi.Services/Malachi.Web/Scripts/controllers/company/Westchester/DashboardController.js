'use strict';

MALACHIAPP.controller('DashboardController', ['$rootScope', '$scope', '$http', '$timeout', '$location', '$modal', 'authService', 'policyService', 'localStorageService', 'ngAuthSettings', 'announcementService', 'adminService', 'settingsService', 'toolsService', function ($rootScope, $scope, $http, $timeout, $location, $modal, authService, policyService, localStorageService, ngAuthSettings, announcementService, adminService, settingsService, toolsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
    });
     
    window.appInsights.trackPageView();

    $rootScope.$broadcast('$pageloaded');

    if (authService.authentication.isAuth == false) {
        $location.path('/login');
        return;
    }

    $scope.announcementAdmin = $.inArray("Announcement Admin", authService.authentication.roles) > -1;
    $scope.zoneView = $.inArray("Zone View", authService.authentication.roles) > -1;
    $scope.widgetView = $.inArray("Company Production Widget View", authService.authentication.roles) > -1;
    $scope.ClassCode = {};
    $scope.TeamData = [];
    $scope.TotalQuoted = 0;
    $scope.TotalBound = 0;
    $scope.TeamBindRatio = 0;
    $scope.BarHeight = 55;
    $scope.BarWidth = 10;
    $scope.Map = null;
    $scope.Coordinates = [];
    $scope.Heatmap = null;
    $scope.ZoneGroups = [];
    $scope.ZoneGroup = null;
    $scope.Zones = [];
    $scope.AllZones = [];
    $scope.States = [];
    $scope.groupedZones = [];
    $scope.singleZones = [];
    $scope.activeZone = null;
    $scope.breadcrumbs = [];
    $scope.Apps = $rootScope.Apps;
    $scope.Types = ["Commercial", "Homeowners"];
    $scope.Obj = {};
    $scope.Obj.SelectedType = $scope.Types[0];
    $scope.SelectedDataType = "Binds";

    $scope.formatDate = function (date) {
        var strDate = '';

        strDate += date.getFullYear() + '-';
        strDate += ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-';
        strDate += (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());

        return strDate;
    };

    $scope.getChartData = function () {
        if ($scope.widgetView) {
            Metronic.blockUI({ target: "#risk-company-production", animate: true, overlayColor: "none" });
            adminService.getRiskCompanyProduction().then(function(result) {
                Metronic.unblockUI("#risk-company-production");

                $scope.riskCompanyData = result.data.RiskCompanyBindsPerMonth;
                $scope.createChartData($scope.Obj.SelectedType);
            });
        }
    };
    $scope.getChartData();

    $scope.createChartData = function (selectedType, dataType) {
        $scope.SelectedDataType = (dataType == null ? "Binds" : dataType);

        if ($scope.SelectedDataType != "Binds") {
            $("#bind-button").removeClass("active");
            $("#premium-button").addClass("active");
        }
        else {
            $("#bind-button").addClass("active");
            $("#premium-button").removeClass("active");
        }

        var riskCompanyBindsPerMonth = $scope.riskCompanyData;
        var chartData = [];
        var dates = Object.keys(riskCompanyBindsPerMonth);
        var riskCompanyNames = [];

        for (var i = 0; i < dates.length; i++) {
            var strDate = dates[i];
            var date = new Date(strDate);

            chartData.push({
                "date": $scope.formatDate(date)
            });

            var commercialBinds = $.grep(riskCompanyBindsPerMonth[strDate], function (x) { return x.Type == selectedType; });
            for (var j = 0; j < commercialBinds.length; j++) {
                var stat = commercialBinds[j];
                var riskCompanyName = stat.RiskCompanyName;
                var riskCompanyData = stat[$scope.SelectedDataType];

                chartData[i][riskCompanyName] = riskCompanyData;

                if (i == dates.length - 1)
                    riskCompanyNames.push(riskCompanyName);
            }

            if (i == dates.length - 1) {
                chartData[i].bulletClass = "lastBullet";
                chartData.push({
                    "date": $scope.formatDate(new Date(date.setMonth(date.getMonth() + 1)))
                });
            }
        }

        $scope.displayChartData(chartData, riskCompanyNames, $scope.SelectedDataType);
    };

    $scope.displayChartData = function (chartData, riskCompanyNames, dataType) {
        var colors = [
            "#8dd3c7",
            "#fccde5",
            "#fb8072",
            "#80b1d3",
            "#fdb462",
            "#b3de69",
        ]

        var graphs = [];
        for (var i = 0; i < riskCompanyNames.length; i++) {

            var graph = {
                "id": null,
                "valueField": null,
                "title": null,
                "classNameField": "bulletClass",
                "type": "line",
                "valueAxis": "a1",
                "lineColor": null,
                "balloonText": "[[value]]" + null,
                "legendValueText": "",
                "lineThickness": 1,
                "bullet": "square",
                "bulletBorderColor": null,
                "bulletBorderThickness": 1,
                "bulletBorderAlpha": 1,
                "dashLengthField": "dashLength",
                "animationPlayed": true
            };

            graph.id = "g" + (i == 2 ? i + 10 : i);
            graph.valueField = riskCompanyNames[i];
            graph.title = riskCompanyNames[i];
            graph.lineColor = colors[i % 7];
            graph.balloonText = (dataType != "Binds" ? "$"  : "") + "[[value]] - " + riskCompanyNames[i];
            graph.bulletBorderColor = colors[i % 7];

            graphs.push(graph);
        }

        var json = {
            "type": "serial",
            "theme": "none",

            "dataDateFormat": "YYYY-MM-DD",
            "dataProvider": chartData,

            "addClassNames": true,
            "startDuration": 1,
            "color": "#6c7b88",
            "marginLeft": 0,

            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "minPeriod": "MM",
                "autoGridCount": false,
                "gridCount": 50,
                "gridAlpha": 0.1,
                "gridColor": "#FFFFFF",
                "axisColor": "#555555",
                "dateFormats": [{
                    "period": 'DD',
                    "format": 'DD'
                }, {
                    "period": 'WW',
                    "format": 'MMM DD'
                }, {
                    "period": 'MM',
                    "format": 'MMM'
                }, {
                    "period": 'YYYY',
                    "format": 'YYYY'
                }]
            },

            "valueAxes": [{
                "id": "a1",
                "title": (dataType != "Binds" ? "Premium" : "Binds"),
                "gridAlpha": 0,
                "axisAlpha": 0
            }],
            "graphs": graphs,

            "chartCursor": {
                "zoomable": true,
                "categoryBalloonDateFormat": "MMM",
                "cursorAlpha": 0.25,
                "valueBalloonsEnabled": true,
                "avoidBalloonOverlapping": true,
                "categoryBalloonAlpha": 1,
                "categoryBalloonEnabled": false
            },
            "legend": {
                "bulletType": "round",
                "equalWidths": true,
                "valueWidth": 0,
                "useGraphSettings": true
            },
            "allLabels": [
	            {
                    "id": "total",
		            "text": "Total:",
		            "bold": true,
		            "x": $(".portlet").width() - 150,
		            "y": 12
	            }
            ]
        };

        var chart = AmCharts.makeChart("chartdiv", json);

        chart.chartCursor.addListener('changed', function (args) {
            if (args.index == null) return;

            var sum = 0;
            var keys = Object.keys(chartData[args.index]);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key == "date" || key == "bulletClass") continue;

                sum += chartData[args.index][key];
            }

            if (dataType != "Binds")
            {
                sum = sum.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                });
                sum = sum.substring(0, sum.length - 3);
            }
            
            $(".amcharts-label-total").text("Total: " + (sum == 0 || sum == "$0" ? "" : sum));
        });

        for (var i = 0; i < chart.graphs.length; i++) {
            var graph = chart.graphs[i];

            graph.balloon.originalSetPosition = graph.balloon.setPosition;
            graph.balloon.setPosition = function (x, y) {
                //y += -15;
                //this.pointToY += 15;
                this.originalSetPosition(x, y);
            };
        }

        setTimeout(function () {
            $('a[title="JavaScript charts"]').remove();
            $('.amChartsLegend').click(function () {
                $('a[title="JavaScript charts"]').remove();
            });
        }, 10);
    };

    var createMap = function (latAverage, longAverage, bounds) {
        var location = new google.maps.LatLng(latAverage, longAverage);
        var options = {
            center: location,
            mapTypeId: 'roadmap',
            fullscreenControl: true,
            minZoom: 4,
            disableDefaultUI: true
        };

        options.styles = [
            { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] },
            { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] },
            { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
            { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] },
            { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
            { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
            { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
            }
        ];

        $scope.Map = new google.maps.Map(document.getElementById("map-activity-canvas"), options);

        $scope.Heatmap = new google.maps.visualization.HeatmapLayer({
            data: $scope.Coordinates,
            map: $scope.Map
        });

        $scope.Map.fitBounds(bounds);
        $scope.Heatmap.set('radius', 5);

        // FIX LATER
        //$.getJSON("/Content/maptheme.json",
        //    function (data) {
        //        options.styles = data;
        //        $scope.Map = new google.maps.Map(document.getElementById("map-activity-canvas"), options);

        //        $scope.Heatmap = new google.maps.visualization.HeatmapLayer({
        //            data: $scope.Coordinates,
        //            map: $scope.Map
        //        });

        //        $scope.Map.fitBounds(bounds);
        //        $scope.Heatmap.set('radius', 5);
        //    });
    };

    var getLatestAnnouncement = function () {
        Metronic.blockUI({ target: "#announcement-info", animate: true, overlayColor: "none" });
        announcementService.getLastestAnnouncement().then(function (result) {
            Metronic.unblockUI("#announcement-info");
            if (result.data.Result.Success) {
                $scope.subject = result.data.LatestAnnouncement.Subject;
                $scope.body = result.data.LatestAnnouncement.Body;
            } else {
                console.log("An error has occurred!");
            }
        },
            function (error) {
                console.log(error);
            });
    }
    getLatestAnnouncement();

    $scope.openAnnouncement = function () {
        var modalInstance = $modal.open({
            templateUrl: 'Announcement.html',
            controller: 'AnnouncementController',
            size: 'md',
            backdrop: 'static',
            keyboard: true,
            resolve: {
            }
        });

        modalInstance.result.then(function (data) {
            $scope.subject = data.subject;
            $scope.body = data.body;
        });
    };

    var createSparklineBars = function () {
        var quoteHigh = 0;
        var quotes = [];
        var quoteTooltipValues = {};

        $.each($scope.TeamData,
            function (index, data) {
                quotes.push(data.Quoted);
                if (quoteHigh < data.Quoted) quoteHigh = data.Quoted;

                quoteTooltipValues[index] = data.Name + " - ";
            });

        $("#sparkline_bar").sparkline(quotes, {
            width: "100%",
            type: "bar",
            height: $scope.BarHeight,
            barWidth: $scope.BarWidth,
            barColor: "#2386CA",
            tooltipFormat: "{{offset:offset}} {{value}}",
            tooltipValueLookups: {
                'offset': quoteTooltipValues
            }
        });

        var boundHigh = 0;
        var binds = [];
        var boundTooltipValues = {};

        $.each($scope.TeamData,
            function (index, data) {
                binds.push(data.Bound);
                if (boundHigh < data.Bound) boundHigh = data.Bound;

                boundTooltipValues[index] = data.Name + " - ";
            });

        $("#sparkline_bar2").sparkline(binds, {
            width: "100%",
            type: "bar",
            height: $scope.BarHeight,
            barWidth: $scope.BarWidth,
            barColor: "#CB5A5E",
            tooltipFormat: "{{offset:offset}} {{value}}",
            tooltipValueLookups: {
                'offset': boundTooltipValues
            }
        });
    };

    $scope.getTeamStatistics = function (term) {
        var date = new Date();
        if (term == "Week")
            date.setDate(date.getDate() - 7);
        else if (term == "Month")
            date.setMonth(date.getMonth() - 1);
        else
            date.setFullYear(date.getFullYear() - 1);

        date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

        Metronic.blockUI({ target: "#team-data", animate: true, overlayColor: "none" });
        adminService.getTeamStatistics(date).then(function (result) {
            Metronic.unblockUI("#team-data");
            if (result.data.Result.Success) {
                $scope.TeamData = [];
                $scope.TotalQuoted = 0;
                $scope.TotalBound = 0;

                $rootScope.TeamMembers = result.data.TeamMembers;

                $.each(result.data.TeamMembers,
                    function (index, member) {
                        $scope.TotalQuoted += member.Quoted;
                        $scope.TotalBound += member.Bound;

                        var name = member.FirstName + " " + member.LastName;
                        var initials = member.FirstName[0] + member.LastName[0];
                        var boundPremium = member.BoundPremium ? member.BoundPremium : 0;
                        var quoted = member.Quoted;
                        var bound = member.Bound;
                        //var ratio = !member.Quoted ? 0 : member.Bound / member.Quoted * 100;

                        $scope.TeamData.push({
                            Name: name,
                            Initials: initials,
                            BoundPremium: boundPremium,
                            Quoted: quoted,
                            Bound: bound
                            //Ratio: ratio
                        });
                    });

                $scope.TeamBindRatio = Math.round($scope.TotalBound / $scope.TotalQuoted * 100) || 0;

                createSparklineBars();
            }
            else {
                $.each(result.data.Result.Errors,
                    function (index, error) {
                        console.log(error);
                    });
            }
        },
        function (error) {
            Metronic.unblockUI("#team-data");
            console.log("An error has occured!");
            console.log(error);
        });
    }

    $scope.getTeamStatistics("Month"); // <-- runs annual by default

    $scope.getAllZoneGroups = function () {

        Metronic.blockUI({ target: "#aggregate-data", animate: true, overlayColor: "none" });
        settingsService.getAllZoneGroups().then(function (result) {
            Metronic.unblockUI("#aggregate-data");

            if (result.data.Result.Success) {
                $scope.ZoneGroups = result.data.ZoneGroups;

                if ($scope.ZoneGroups.length > 0) {
                    var master = $.grep($scope.ZoneGroups, function (x) { return x.Name == "Master Contract" });
                    $scope.getZonesWithAggregate(master.length != 0 ? master[0] : $scope.ZoneGroups[0]);
                }
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI("#aggregate-data");
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    };

    $scope.getZonesWithAggregate = function (zoneGroup) {
        $scope.ZoneGroup = zoneGroup;

        Metronic.blockUI({ target: "#aggregate-data", animate: true, overlayColor: "none" });
        settingsService.getZonesWithAggregate($scope.ZoneGroup.Id, true).then(function (result) {
            Metronic.unblockUI("#aggregate-data");

            if (result.data.Result.Success) {
                $scope.getStatesAndCounties();
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
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI("#aggregate-data");
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    };

    $scope.getStatesAndCounties = function () {

        Metronic.blockUI({ target: "#aggregate-data", animate: true, overlayColor: "none" });
        toolsService.getStatesAndCounties().then(function (result) {
            Metronic.unblockUI("#aggregate-data");

            if (result.data.Result.Success) {
                $scope.States = result.data.States;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            Metronic.unblockUI("#aggregate-data");
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    };

    $scope.allZones = function () {
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

        $scope.selectedZone = {
            Name: "None"
        };
    }

    $scope.childZones = function (parent) {
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

        var cZone = parent;
        $scope.selectedZone = parent;
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
    if ($scope.zoneView)
        $scope.getAllZoneGroups();

    if (!$rootScope.Apps || $rootScope.Apps.length == 0) {
        policyService.getApps().then(function (result) {
            $rootScope.Apps = result.data.Apps;
            $scope.Apps = $rootScope.Apps;
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.checkClassCodeEligibility = function () {
        var classCode = $scope.ClassCode.Code;
        policyService.checkClassCodeEligibility(classCode).then(function (result) {
            if (result.data.Result.Success) {
                var modalInstance = $modal.open({
                    templateUrl: 'classCodeEligibility.html',
                    controller: 'classCodeEligibilityCtrl',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        classCode: function () {
                            return classCode;
                        },
                        classCodeEligibilities: function () {
                            return result.data.ClassCodeEligibilities;
                        }
                    }
                });
            }
            else {

            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    }

    $scope.newQuote = function (app) {
        var allowDisabledApp = $.inArray("View Disabled Apps", authService.authentication.roles) > -1;
        if (!allowDisabledApp && !app.Enabled)
            return;

        $rootScope.$state.transitionTo('policy', { appId: app.Id, policyId: null });
    }

    $scope.ClassCodes = [];
    $scope.refreshClassCodes = function (name) {
        return policyService.getAllClassCodes(name).then(function (result) {
            if (result.data.Result.Success) {
                $scope.ClassCodes = result.data.ClassCodes;
            }
            else {
                $scope.Errors = result.data.Result.Errors;
            }
        }, function (error) {
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];
        });
    };


    $scope.getReportForZonesWithLowAgg = function (zoneGroup) {  
        Metronic.blockUI({ animate: true, overlayColor: 'none' });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', ngAuthSettings.apiServiceBaseUri + 'api/settings/GetReportForZonesWithLowAgg', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            Metronic.unblockUI();
            if (this.status === 200) {
                var filename = "LowAggReport.xlsx";
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }
                var type = xhr.getResponseHeader('Content-Type');

                var blob = new Blob([this.response], { type: type });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
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
            }
        };

        xhr.setRequestHeader("Content-Type", "application/json");
        var authData = localStorageService.get('authorizationData');
        xhr.setRequestHeader('Authorization', 'Bearer ' + authData.token);
        xhr.send();
    };
}]);

MALACHIAPP.controller('AnnouncementController', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'announcementService', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, announcementService) {

    // declare errors
    $scope.Errors = [];

    // send announcement to server
    $scope.submit = function () {

        // set as busy
        $scope.busy = true;

        // clear previous errors
        $scope.Errors = [];

        // check to make sure user enters a body
        if (!$scope.body)
            $scope.Errors.push("You must enter an announcement body.");

        // if any errors exit function
        if ($scope.Errors.length != 0) {
            $scope.busy = false;
            return;
        }


        // perform request to server
        announcementService.addAnnouncement($scope.subject, $scope.body).then(function (result) {

            // if result was successful change announcement
            if (result.data.Result.Success)
                // update announcement on client and close modal
                $modalInstance.close({ subject: $scope.subject, body: $scope.body });
            else
                $scope.Errors = result.data.Result.Errors;

            // not busy
            $scope.busy = false;
        }, function (error) {
            // show error
            $scope.Errors = ['An unexpected error has occured. Please refresh the page.'];

            // log error
            console.log(error);

            // not busy
            $scope.busy = false;
        });
    };

    // close the modal window
    $scope.close = function () {

        // close
        $modalInstance.dismiss('cancel');
    };
}]);



MALACHIAPP.controller('classCodeEligibilityCtrl', ['$rootScope', '$scope', '$location', '$stateParams', '$ocLazyLoad', 'notificationsHub', '$modalInstance', 'settings', 'policyService', 'classCode', 'classCodeEligibilities', function ($rootScope, $scope, $location, $stateParams, $ocLazyLoad, notificationsHub, $modalInstance, settings, policyService, classCode, classCodeEligibilities) {
    $scope.ClassCode = classCode;
    $scope.ClassCodeEligibilities = classCodeEligibilities;

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    }
}]);