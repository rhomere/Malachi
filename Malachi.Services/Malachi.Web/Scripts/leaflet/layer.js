var LayerManager = {
    scope: function () {
        var controllerElement = document.querySelector('[ng-controller=controller]');
        var controllerScope = angular.element(controllerElement).scope();
        return controllerScope;
    },
    addShapeLayer: function () { // 0 - rectangle, 1 - circle, 2 - polygon
        // Create a Pane
        var scope = this.scope();
        var layer = new project_layer("Shape Layer", scope.Project, "#fe57a1");
        layer.Pane = map.createPane('pane-shape-' + layer.Id);
        layer.Pane.style.zIndex = 500 + layer.Index;
        layer.LayerType = 0;
        layer.LayerObjects = [];
        var l = L.featureGroup({ pane: 'pane-shape-' + layer.Id }).addTo(map);
        layer.Shapes = [],
        layer.FilteredDatasets = [];

        layer.LayerObjects.push(l);

        layer.addShape = function (e) {
            e.layer.Shapes.push({
                ID: e.layer.Shapes.length + 1,
                Name: e.type == 'polygon' ? 'Polygon' : e.type == 'rectangle' ? 'Rectangle' : 'Circle',
                Shape: e.shape,
                Visible: true,
                Filter: true,
                Color: layer.Color
            });
            LayerManager.scope().$apply();
        };

        l.setStyle({ color: layer.Color, fillColor: layer.Color });
        l.color = layer.Color;
        l.fillColor = layer.Color;
        scope.Project.Layers.push(layer);
        scope.Project.Layers.sort(function (a, b) { return b.Index - a.Index })
        scope.$apply();
        this.refresh();

        // Add Control after creation
        L.shapeManager.addControl({
            map: map,
            layer: layer,
            name: 'layer-' + layer.Id,
            pane: 'pane-shape-' + layer.Id,
            featureGroup: l,
            rectangleBtn: 'rectangle-' + layer.Id,
            circleBtn: 'circle-' + layer.Id,
            polygonBtn: 'polygon-' + layer.Id,
            onUpdateEnded: function () {
                LayerManager.Update(true);
            }
        });
    },
    addGeoLayerToProject: function (dataset) {
        // Create a Pane
        var scope = this.scope();
        var layer = new project_layer(dataset.Name, scope.Project, "#e8960e");
        var projectDataset = new project_dataset(dataset, scope.Project, layer);
        layer.Datasets.push(projectDataset);
        layer.Pane = map.createPane('pane-' + layer.Id);
        layer.LayerType = 2;
        var options = $.extend({}, shapeOptions, { pane: 'pane-' + layer.Id });
        var layerObj = L.geoJson(JSON.parse(projectDataset.Dataset.GeoJson), options).addTo(map);
        layer.LayerObjects = [];
        layer.LayerObjects.push(layerObj);
        scope.Project.Layers.push(layer);
        scope.Project.Layers.sort(function (a, b) { return b.Index - a.Index })
        scope.$apply();
        this.refresh();
    },
    addNewDataLayerToProject: function (dataset, contractId) {
        // Create a Pane
        var scope = this.scope();
        var layer = new project_layer(dataset.Name, scope.Project, "#000");
        var projectDataset = new project_dataset(dataset, scope.Project, layer);
        layer.Datasets.push(projectDataset);
        layer.Pane = map.createPane('pane-' + layer.Id);
        layer.MaxMinRange = [layer.MetricMin, layer.MetricMax];
        layer.DisplayType = 2;
        layer.LayerType = 1;
        layer.ContractId = contractId;
        this.changeDisplayType(layer);
        scope.Project.Layers.push(layer);
        scope.Project.Layers.sort(function (a, b) { return b.Index - a.Index })
        scope.$apply();
        this.refresh();

        $('#views').append('<div id="views_' + layer.Id + '" class="tabbable tabbable-tabdrop" style="display:none"><ul class="nav nav-tabs"><li><button class="btn btn-success" style="margin:3px" onclick="addNewView(' + layer.Id + ')"><i class="icon-plus"></i></button></li></ul><div class="tab-content"></div></div>');

        setTimeout(function () {
            setupMetricSliderColor($('#project-metrics-slider-' + layer.Id), layer)
        }, 100);
    },
    refresh: function () {
        refreshLayersView();
    },
    refreshOrder: function () {
        var project = this.scope().Project;

        for (var i = 0; i < project.Layers.length; i++) {
            var layer = project.Layers[i];
            if (layer.Pane != null && layer.Index > 0) {
                if (layer.Pane.className.indexOf("pane-shape-") > -1)
                    layer.Pane.style.zIndex = 500 + layer.Index;
                else
                    layer.Pane.style.zIndex = 4 + layer.Index;
            }
        }
    },
    changeDisplayType: function (layer) {
        // Remove old type
        if (layer.LayerObjects != null) {
            for (var i = 0; i < layer.LayerObjects.length; i++) {
                layer.LayerObjects[i].removeFrom(map);
            }
        }
        layer.LayerObjects = [];
        // Points
        if (layer.DisplayType == 0) {
            layer.Update = dataset_points;
        }
        // Clusters
        if (layer.DisplayType == 1) {
            layer.Update = dataset_cluster;
        }
        // Heat Map
        if (layer.DisplayType == 2) {
            layer.Update = dataset_heat;
        }

        layer.Update(layer, true);
    },

    Update: function (resetMaxMin) {
        if (this.scope() != null && this.scope().Project != null) {
            var project = this.scope().Project;
            for (var i = 0; i < project.Layers.length; i++) {
                var layer = project.Layers[i];
                if (layer.Update != null) {
                    layer.Update(layer, resetMaxMin);
                }
            }

            for (var j = 0; j < project.Views.length; j++) {
                project.Views[j].refresh();
            }
        }
    },

    containsFilter: function (layerId, latlng) {
        var project = this.scope().Project;
        var contains = true;
        for (var i = 0; i < project.Layers.length; i++) {
            var layer = project.Layers[i];

            if (layer.Id != layerId && layer.FilteredDatasets != null && (layer.LayerType == 0 || layer.LayerType == 2)) {
                for (var j = 0; j < layer.FilteredDatasets.length; j++) {
                    if (layer.FilteredDatasets[j].DatasetId == layerId) {
                        for (var k = 0; k < layer.Shapes.length; k++) {
                            var shape = layer.Shapes[k];
                            if (shape.Visible && shape.Filter) {
                                contains = false;
                                if (shape.Shape.contains(latlng)) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return contains;
    }
}