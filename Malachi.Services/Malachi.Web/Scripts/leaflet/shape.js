
L.ShapeManager = L.Class.extend({

    //    {
    //        map: ,
    //        layer: ,
    //        name: ,
    //        featureGroup: ,
    //        rectangleBtn: ,
    //        circleBtn: ,
    //        polygonBtn: 
    //    }

    initialize: function (options) {
        this.shapes = [];
        var map = options.map;
        // Zoom Event
        map.on('zoomend', function (e) {
            for (var i = 0; i < L.shapeManager.shapes.length; i++) {
                L.shapeManager.shapes[i].redraw();
            }
        });

        map.on('mousedown', function (e) {
            // Disabled Other Shapes
            map.eachLayer(function (layer) {
                if (layer.featureGroup != null) {
                    layer.featureGroup.eachLayer(function (feature) {
                        if (feature instanceof L.ShapeControl.Polygon || feature instanceof L.ShapeControl.Circle || feature instanceof L.ShapeControl.Rectangle)
                            feature.disable();
                    });
                }
            });
        });

        // Always remove the context menu
        $('body').on('mousedown', function (e) {
            $('#ShapeManager_contextMenu').remove();
        }).on('click', function (e) {
            $('#ShapeManager_contextMenu').remove();
        }).on('dbclick', function (e) {
            $('#ShapeManager_contextMenu').remove();
        });

        // Create Pane
        var pane = map.createPane('pane-shape-controls');
        pane.style.zIndex = 1000;
        map.getPanes().markerPane.style.zIndex = 1001;

    },

    addControl: function (options) {
        var ctrl = new L.ShapeControl(options);
        this.shapes.push(ctrl);
    },

    removeControl: function (name) {
        var index = -1;
        for (var i = 0; i < this.shapes.length; i++) {
            if (this.shapes[i].name == name)
                index = i;
        }
        if (index > -1) this.shapes.splice(index, 1);
    },

    stopEditing: function () {
        for (var i = 0; i < this.shapes.length; i++) {
            this.shapes[i].stopEditing();
        }
    }
});

L.ShapeControl = L.Class.extend({

    initialize: function (options) {
        // Merge Options
        L.Util.setOptions(this, options);
        // Create Buttons
        if (options.rectangleBtn != null)
            L.DomEvent.on(document.getElementById(options.rectangleBtn), 'click', this._addRectangle, this);
        if (options.circleBtn != null)
            L.DomEvent.on(document.getElementById(options.circleBtn), 'click', this._addCircle, this);
        if (options.polygonBtn != null)
            L.DomEvent.on(document.getElementById(options.polygonBtn), 'click', this._addPolygon, this);

        this._map = options.map;
        this.name = options.name;
        this.pane = options.pane;
        this.featureGroup = options.featureGroup;
        this.layer = options.layer;
        this.onMove = options.onMove;
        this.onResize = options.onResize;
        this.onUpdateEnded = options.onUpdateEnded;

    },

    stopEditing: function () {
        this.featureGroup.eachLayer(function (layer) {
            layer.disable();
        });
    },

    _addRectangle: function (e) {
        var shape = L.ShapeControl.rectangle({ pane: this.pane, featureGroup: this.featureGroup, map: this._map, onUpdateEnded: this.onUpdateEnded, onMove: this.onMove, onResize: this.onResize }).addTo(this.featureGroup);
        //this._map.fire('shaperManager:add', { type: 'rectangle', shape: shp });
        if (this.layer != null) {
            this.layer.addShape({ type: 'rectangle', shape: shape, layer: this.layer });
            shape.enable();
        }
    },

    _addCircle: function (e) {
        var shape = L.ShapeControl.circle({ pane: this.pane, featureGroup: this.featureGroup, map: this._map, onUpdateEnded: this.onUpdateEnded, onMove: this.onMove, onResize: this.onResize }).addTo(this.featureGroup);
        if (this.layer != null) {
            this.layer.addShape({ type: 'circle', shape: shape, layer: this.layer });
            shape.enable();
        }
    },

    _addPolygon: function (e) {
        var shape = L.ShapeControl.polygon({ pane: this.pane, featureGroup: this.featureGroup, map: this._map, onUpdateEnded: this.onUpdateEnded, onMove: this.onMove, onResize: this.onResize }).addTo(this.featureGroup);
        if (this.layer != null) {
            this.layer.addShape({ type: 'polygon', shape: shape, layer: this.layer });
            shape.enable();
        }
    },

    redraw: function () {
        if (this.layer != null) {
            for (var i = 0; i < this.layer.Shapes.length; i++) {
                this.layer.Shapes[i].Shape.redraw();
            }
        }
    }
});

L.ShapeControl.Rectangle = L.Rectangle.extend({
    initialize: function (options) {
        this.options.weigth = this.options.weigth ? this.options.weigth : 4;
        var centerLatLng = options.map.getCenter(); // get map center
        var pointC = options.map.latLngToContainerPoint(centerLatLng); // convert to containerpoint (pixels)
        var pointX = [pointC.x - 200, pointC.y - 200];
        var pointY = [pointC.x + 200, pointC.y + 200];

        // convert containerpoints to latlng's
        var latLngX = options.map.containerPointToLatLng(pointX);
        var latLngY = options.map.containerPointToLatLng(pointY);

        L.Rectangle.prototype.initialize.call(this, [latLngX, latLngY], options);
        this.setStyle({ color: options.featureGroup.color, fillColor: options.featureGroup.fillColor, fillOpacity: 0 });

        this.on('mouseover', this._onMouseover, this);
        this.on('mouseout', this._onMouseout, this);
        this.on('mousemove', this._onMousemove, this);
        this.on('click', this._onClick, this);
        this.onMove = options.onMove;
        this.onResize = options.onResize;
        this.onUpdateEnded = options.onUpdateEnded;
        this.featureGroup = options.featureGroup;
        this.on('contextmenu', this._contextmenu, this);

        this.enabled = false;

    },

    _contextmenu: function (e) {
        if (this.enabled) {
            // Shape Context Menu
            $('body').append('<ul id="ShapeManager_contextMenu" class="dropdown-menu" role="menu" style="display:none" >' +
                                '<li><a tabindex="-1" href="#">Resize</a></li>' +
                                '<li class="divider"></li>' +
                                '<li><a tabindex="-1" href="#">Delete</a></li>' +
                            '</ul>');

            $('#ShapeManager_contextMenu')
                    .data("invokedOn", $(e.target))
                    .show()
                    .css({
                        position: "absolute",
                        left: e.containerPoint.x,
                        top: e.containerPoint.y
                    })
                    .off('click')
                    .on('click', function (e) {
                        var $invokedOn = $(this).data("invokedOn");
                        var $selectedMenu = $(e.target);

                        //settings.menuSelected.call(this, $invokedOn, $selectedMenu);

                        $(this).remove();
                    });
        }
        // stop propagation
        e.originalEvent.preventDefault();
    },

    _onMouseover: function (e) {
        if (this.enabled == false) {
            if (this.isPointInsideBorder(e)) {
                this.setStyle({ weight: this.options.weigth + 2 });
            }
            // Fire Map Event
            this._map.fire("mouseover", e);
        }
    },

    _onMousemove: function (e) {
        if (this.enabled == false) {
            if (this.isPointInsideBorder(e) == false) {
                this.setStyle({ weight: this.options.weigth });
            }
            else {
                this.setStyle({ weight: this.options.weigth + 2 });
            }
            // Fire Map Event
            this._map.fire("mousemove", e);
        }
    },

    _onMouseout: function (e) {
        if (this.enabled == false) {
            this.setStyle({ weight: this.options.weigth });
            // Fire Map Event
            this._map.fire("mouseout", e);
        }
    },

    _onClick: function (e) {
        if (this.enabled == false) {
            if (this.isPointInsideBorder(e)) {
                this.enable();
            } else {
                // Fire Map Event
                this._map.fire("click", e);
            }
        }
    },

    isPointInsideBorder: function (e) {
        var northWest = this._map.latLngToContainerPoint(this.getBounds().getNorthWest()),
            southWest = this._map.latLngToContainerPoint(this.getBounds().getSouthWest()),
            southEast = this._map.latLngToContainerPoint(this.getBounds().getSouthEast()),
            northEast = this._map.latLngToContainerPoint(this.getBounds().getNorthEast());

        return (this.isPointInsideRectangle(e.containerPoint.x, e.containerPoint.y, northWest.x - (this.options.weigth * 2), northWest.y - (this.options.weigth * 2), southWest.x + (this.options.weigth * 2), southWest.y + (this.options.weigth * 2)) ||
             this.isPointInsideRectangle(e.containerPoint.x, e.containerPoint.y, northWest.x - (this.options.weigth * 2), northWest.y - (this.options.weigth * 2), northEast.x + (this.options.weigth * 2), northEast.y + (this.options.weigth * 2)) ||
             this.isPointInsideRectangle(e.containerPoint.x, e.containerPoint.y, southWest.x - (this.options.weigth * 2), southWest.y - (this.options.weigth * 2), southEast.x + (this.options.weigth * 2), southEast.y + (this.options.weigth * 2)) ||
             this.isPointInsideRectangle(e.containerPoint.x, e.containerPoint.y, northEast.x - (this.options.weigth * 2), northEast.y - (this.options.weigth * 2), southEast.x + (this.options.weigth * 2), southEast.y + (this.options.weigth * 2)))
    },

    isPointInsideRectangle: function (x, y, topLeftX, topLeftY, bottomRightX, bottomRightY) {
        return (x >= topLeftX) &&
               (x <= bottomRightX) &&
               (y >= topLeftY) &&
               (y <= bottomRightY);
    },

    _createMarker: function (latlng, classes) {
        var marker = new L.Marker(latlng, {
            icon: new L.DivIcon({
                iconSize: new L.Point(12, 12),
                className: 'leaflet-div-icon leaflet-editing-icon ' + classes
            })
        });
        marker.parent = this;
        this._markerGroup.addLayer(marker);

        return marker;
    },

    _setupMarkers: function (map) {
        this._markerGroup = new L.LayerGroup().addTo(map);

        this._resizeMarkers = [];
        var corners = this._getCorners();
        for (var i = 0, l = corners.length; i < l; i++) {
            this._resizeMarkers.push(this._createMarker(corners[i], 'leaflet-editing-resize'));
            // Set the corner
            this._resizeMarkers[i]._cornerIndex = i;
            this._resizeMarkers[i].on('mousedown', this._onMarkerMouseDown, this._resizeMarkers[i]);
        }

        this._toggleMarkers(0);
    },

    _onMarkerMouseDown: function (e) {
        var marker = this;
        marker.enableAction = true;
        this._map.dragging.disable(); // Disable Map Dragging
        // Save a reference to the opposite point
        var corners = marker.parent._getCorners();
        currentCornerIndex = marker._cornerIndex;

        this.parent._oppositeCorner = corners[(currentCornerIndex + 2) % 4];
        // Add Action Events
        L.DomEvent.on(this._map.getContainer(), 'mouseup', this.parent._onMarkerMouseUp, marker);
        L.DomEvent.on(this._map.getContainer(), 'mousemove', this.parent._onMarkerMouseMove, marker);
    },

    _onMarkerMouseUp: function (e) {
        var marker = this;
        marker.enableAction = false;
        this._map.dragging.enable(); // Enable Map Dragging
        // Remove Events
        L.DomEvent.off(this._map.getContainer(), 'mouseup', this.parent._onMarkerMouseUp, marker);
        L.DomEvent.off(this._map.getContainer(), 'mousemove', this.parent._onMarkerMouseMove, marker);
    },

    _onMarkerMouseMove: function (e) {
        var marker = this;
        if (marker.enableAction) {
            var point = [e.clientX - $(this._map.getContainer()).offset().left, e.clientY - $(this._map.getContainer()).offset().top];
            var latlng = this._map.containerPointToLatLng(point);
            marker.setLatLng(latlng);
            if (marker.isCenter) { // Move Shape/Marker
                // Move Shape
                marker.parent._move(latlng);
            }
            else { // Resize
                marker.parent._resize(latlng);
            }
        }
    },

    _move: function (newCenter) {
        var latlngs = this.getLatLngs(),
            bounds = this.getBounds(),
            center = bounds.getCenter(),
            offset, newLatLngs = [];

        // Offset the latlngs to the new center
        for (var i = 0, l = latlngs.length; i < l; i++) {
            offset = [latlngs[i].lat - center.lat, latlngs[i].lng - center.lng];
            newLatLngs.push([newCenter.lat + offset[0], newCenter.lng + offset[1]]);
        }

        this.setLatLngs(newLatLngs);

        // Reposition the resize markers
        this._repositionMarkers();

        if (this.onMove != null) this.onMove();
    },

    _resize: function (latlng) {
        var bounds;

        // Update the shape based on the current position of this corner and the opposite point
        this.setBounds(L.latLngBounds(latlng, this._oppositeCorner));

        // Reposition the move marker
        bounds = this.getBounds();
        // Reposition the resize markers
        this._repositionMarkers();

        if (this.onResize != null) this.onResize();
    },

    _repositionMarkers: function () {
        var corners = this._getCorners();

        for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
            this._resizeMarkers[i].setLatLng(corners[i]);
        }
    },

    _getCorners: function () {
        var bounds = this.getBounds(),
            nw = bounds.getNorthWest(),
            ne = bounds.getNorthEast(),
            se = bounds.getSouthEast(),
            sw = bounds.getSouthWest();

        return [nw, ne, se, sw];
    },

    _toggleMarkers: function (opacity) {
        for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
            this._resizeMarkers[i].setOpacity(opacity);
        }
    },

    enable: function (e) {
        if (this.enabled == false) {
            // Disabled Other Shapes
            this._map.eachLayer(function (layer) {
                if (layer.featureGroup != null) {
                    layer.featureGroup.eachLayer(function (feature) {
                        if (feature instanceof L.ShapeControl.Polygon || feature instanceof L.ShapeControl.Circle || feature instanceof L.ShapeControl.Rectangle)
                            feature.disable();
                    });
                }
            });

            if (this._markerGroup == null) {
                // Setup Resize and Center Markers
                this._setupMarkers(this._map);
            }
            this.setStyle({ fillOpacity: 0.4 });
            this._toggleMarkers(1);
            this.enabled = true;

            this.redraw();
        }
    },

    disable: function (e) {
        if (this.enabled == true) {
            this._toggleMarkers(0);
            this.setStyle({ weight: this.options.weigth, fillOpacity: 0 });
            this.enabled = false;
            this.redraw();

            if (this.onUpdateEnded != null) this.onUpdateEnded();
        }
    },

    show: function () {
        this.setStyle({ opacity: 1, fillOpacity: 0.2 });
        if (this.enabled == true) this._toggleMarkers(1);
    },

    hide: function () {
        this.setStyle({ opacity: 0, fillOpacity: 0 });
        if (this.enabled == true) this._toggleMarkers(0);
    },

    redraw: function () {
        L.Rectangle.prototype.redraw.call(this);


        if (this.enabled) {
            var paddedBounds = this.getBounds().pad(0.01);
            if (this.boundry != null) {
                this.boundry.setBounds(paddedBounds);
            }
            else
                this.boundry = L.rectangle(paddedBounds, { color: "#4d4d50", fillOpacity: 0, opacity: 0.5, weight: 4, className: 'non-clickable' }).addTo(map);
            var southWestP = map.latLngToContainerPoint(paddedBounds.getSouthWest());
            var northEastP = map.latLngToContainerPoint(paddedBounds.getNorthEast());
            southWestP.y = northEastP.y - 24;
            var southWest = map.containerPointToLatLng(southWestP),
                 northEast = map.containerPointToLatLng(northEastP);
            var topBounds = L.latLngBounds(southWest, northEast);
            if (this.topBarBoundry != null) {
                this.topBarBoundry.setBounds(topBounds);
            }
            else {
                this.topBarBoundry = L.rectangle(topBounds, { pane: 'pane-shape-controls', color: "#4d4d50", fillOpacity: 0.5, opacity: 0.5, weight: 4 }).addTo(map);
                this.topBarBoundry.on('mousedown', function (e) {
                    var point = e.containerPoint;
                    var center = map.latLngToContainerPoint(this.getBounds().getCenter());
                    this.originalCenterOffset = [center.x - point.x, center.y - point.y];
                    this.canMove = true;

                    // Add Action Events
                    L.DomEvent.on(this._map.getContainer(), 'mouseup', this.topBarBoundry.mouseup, this);
                    L.DomEvent.on(this._map.getContainer(), 'mousemove', this.topBarBoundry.mousemove, this);
                    this._map.dragging.disable();
                    this._map.touchZoom.disable();
                    this._map.doubleClickZoom.disable();
                    this._map.scrollWheelZoom.disable();
                    this._map.boxZoom.disable();
                    this._map.keyboard.disable();
                    if (this._map.tap) this._map.tap.disable();
                }, this);
                this.topBarBoundry.mouseup = function (e) {
                    this.canMove = false;

                    // Remove Events
                    L.DomEvent.off(this._map.getContainer(), 'mouseup', this.topBarBoundry.mouseup, this);
                    L.DomEvent.off(this._map.getContainer(), 'mousemove', this.topBarBoundry.mousemove, this);

                    this._map.dragging.enable();
                    this._map.touchZoom.enable();
                    this._map.doubleClickZoom.enable();
                    this._map.scrollWheelZoom.enable();
                    this._map.boxZoom.enable();
                    this._map.keyboard.enable();
                    if (this._map.tap) this._map.tap.enable();
                };
                this.topBarBoundry.mousemove = function (e) {
                    if (this.canMove) {
                        this._move(map.containerPointToLatLng([e.clientX - $(this._map.getContainer()).offset().left + this.originalCenterOffset[0], e.clientY - $(this._map.getContainer()).offset().top + this.originalCenterOffset[1]]));
                    }
                };
                this.topBarBoundry.on('contextmenu', this._contextmenu, this);
            }
        }
        else {
            if (this.boundry != null) {
                this.boundry.removeFrom(map);
                this.boundry = null;
            }

            if (this.topBarBoundry != null) {
                this.topBarBoundry.removeFrom(map);
                this.topBarBoundry = null;
            }
        }

        return this;
    },

    contains: function (latlng) {
        return this.getBounds().contains(latlng);
    }
});

L.ShapeControl.rectangle = function (options) {
    return new L.ShapeControl.Rectangle(options);
};

L.ShapeControl.Circle = L.Circle.extend({
    initialize: function (options) {
        L.setOptions(this, options);

        this.options.weigth = this.options.weigth ? this.options.weigth : 4;
        // Size
        var centerLatLng = options.map.getCenter(); // get map center
        var pointC = options.map.latLngToContainerPoint(centerLatLng); // convert to containerpoint (pixels)
        var pointX = [pointC.x + 200, pointC.y];
        // convert containerpoints to latlng's
        var latLngC = options.map.containerPointToLatLng(pointC);
        var latLngX = options.map.containerPointToLatLng(pointX);
        var distanceX = latLngC.distanceTo(latLngX); // calculate distance between c and x (latitude)
        L.Circle.prototype.initialize.call(this, centerLatLng, distanceX, options);
        this.setStyle({ color: options.featureGroup.color, fillColor: options.featureGroup.fillColor, fillOpacity: 0 });

        this.on('mouseover', this._onMouseover, this);
        this.on('mouseout', this._onMouseout, this);
        this.on('click', this._onClick, this);
        this.onMove = options.onMove;
        this.onResize = options.onResize;
        this.onUpdateEnded = options.onUpdateEnded;
        this.featureGroup = options.featureGroup;


        this.enabled = false;
    },

    _onMouseover: function (e) {
        if (this.enabled == false) {
            this.setStyle({ weight: this.options.weigth + 2 });
        }
    },

    _onMouseout: function (e) {
        if (this.enabled == false) {
            this.setStyle({ weight: this.options.weigth });
        }
    },

    _onClick: function (e) {
        if (this.enabled == false) {
            this.enable();
        }
    },

    _createMarker: function (latlng, classes) {
        var marker = new L.Marker(latlng, {
            icon: new L.DivIcon({
                iconSize: new L.Point(12, 12),
                className: 'leaflet-div-icon leaflet-editing-icon ' + classes
            })
        });
        marker.parent = this;
        this._markerGroup.addLayer(marker);
        return marker;
    },

    _setupMarkers: function (map) {
        this._markerGroup = new L.LayerGroup().addTo(map);

        this._resizeMarkers = [];
        // Place Center Marker Handle for movement        
        var center = this.getLatLng(),
            resizemarkerPoint = this._getResizeMarkerPoint(center);
        this._resizeMarkers.push(this._createMarker(resizemarkerPoint, 'leaflet-editing-resize'));
        this._resizeMarkers[0].on('mousedown', this._onMarkerMouseDown, this._resizeMarkers[0]);


        this._toggleMarkers(0);
    },

    _onMarkerMouseDown: function (e) {
        var marker = this;
        marker.enableAction = true;
        this._map.dragging.disable(); // Disable Map Dragging
        // Add Action Events
        L.DomEvent.on(this._map.getContainer(), 'mouseup', this.parent._onMarkerMouseUp, marker);
        L.DomEvent.on(this._map.getContainer(), 'mousemove', this.parent._onMarkerMouseMove, marker);
    },

    _onMarkerMouseUp: function (e) {
        var marker = this;
        marker.enableAction = false;
        this._map.dragging.enable(); // Enable Map Dragging
        // Remove Events
        L.DomEvent.off(this._map.getContainer(), 'mouseup', this.parent._onMarkerMouseUp, marker);
        L.DomEvent.off(this._map.getContainer(), 'mousemove', this.parent._onMarkerMouseMove, marker);
    },

    _onMarkerMouseMove: function (e) {
        var marker = this;
        if (marker.enableAction) {
            var point = [e.clientX - $(this._map.getContainer()).offset().left, e.clientY - $(this._map.getContainer()).offset().top];
            var latlng = this._map.containerPointToLatLng(point);

            if (marker.isCenter) { // Move Shape/Marker
                // Move Shape
                marker.parent._move(latlng);
            }
            else { // Resize
                marker.parent._resize(latlng);
            }
        }
    },

    _move: function (latlng) {
        var resizemarkerPoint = this._getResizeMarkerPoint(latlng);

        // Move the resize marker
        this._resizeMarkers[0].setLatLng(resizemarkerPoint);

        // Move the circle
        this.setLatLng(latlng);

        // Reposition the resize markers
        this._repositionMarkers();

        if (this.onMove != null) this.onMove();
    },

    _resize: function (latlng) {
        var bounds;

        var moveLatLng = this.getLatLng(),
            radius = moveLatLng.distanceTo(latlng);

        this.setRadius(radius);

        // Reposition the resize markers
        this._repositionMarkers();

        if (this.onResize != null) this.onResize();
    },

    _repositionMarkers: function () {
        var resizemarkerPoint = this._getResizeMarkerPoint(this.getLatLng());
        // Move the resize marker
        this._resizeMarkers[0].setLatLng(resizemarkerPoint);
    },

    _getResizeMarkerPoint: function (latlng) {
        // From L.shape.getBounds()
        var delta = this._radius * Math.cos(Math.PI / 4),
            point = this._map.project(latlng);
        return this._map.unproject([point.x + delta, point.y - delta]);
    },

    _toggleMarkers: function (opacity) {
        for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
            this._resizeMarkers[i].setOpacity(opacity);
        }
    },

    enable: function (e) {
        if (this.enabled == false) {
            // Disabled Other Shapes
            this._map.eachLayer(function (layer) {
                if (layer.featureGroup != null) {
                    layer.featureGroup.eachLayer(function (feature) {
                        if (feature instanceof L.ShapeControl.Polygon || feature instanceof L.ShapeControl.Circle || feature instanceof L.ShapeControl.Rectangle)
                            feature.disable();
                    });
                }
            });
            if (this._markerGroup == null) {
                // Setup Resize and Center Markers
                this._setupMarkers(this._map);
            }
            this.setStyle({ fillOpacity: 0.4 });
            this._toggleMarkers(1);
            this.enabled = true;

            this.redraw();
        }
    },

    disable: function (e) {
        if (this.enabled == true) {
            this._toggleMarkers(0);
            this.setStyle({ weight: this.options.weigth, fillOpacity: 0 });
            this.enabled = false;
            this.redraw();

            if (this.onUpdateEnded != null) this.onUpdateEnded();
        }
    },

    show: function () {
        this.setStyle({ opacity: 1, fillOpacity: 0.2 });
        if (this.enabled == true) this._toggleMarkers(1);
    },

    hide: function () {
        this.setStyle({ opacity: 0, fillOpacity: 0 });
        if (this.enabled == true) this._toggleMarkers(0);
    },

    redraw: function () {
        L.Circle.prototype.redraw.call(this);
        if (this.enabled) {
            var paddedBounds = this.getBounds().pad(0.01);
            if (this.boundry != null) {
                this.boundry.setBounds(paddedBounds);
            }
            else
                this.boundry = L.rectangle(paddedBounds, { color: "#4d4d50", fillOpacity: 0, opacity: 0.5, weight: 4, className: 'non-clickable' }).addTo(map);
            var southWestP = map.latLngToContainerPoint(paddedBounds.getSouthWest());
            var northEastP = map.latLngToContainerPoint(paddedBounds.getNorthEast());
            southWestP.y = northEastP.y - 24;
            var southWest = map.containerPointToLatLng(southWestP),
                 northEast = map.containerPointToLatLng(northEastP);
            var topBounds = L.latLngBounds(southWest, northEast);
            if (this.topBarBoundry != null) {
                this.topBarBoundry.setBounds(topBounds);
            }
            else {
                this.topBarBoundry = L.rectangle(topBounds, { pane: 'pane-shape-controls', color: "#4d4d50", fillOpacity: 0.5, opacity: 0.5, weight: 4 }).addTo(map);
                this.topBarBoundry.on('mousedown', function (e) {
                    var point = e.containerPoint;
                    var center = map.latLngToContainerPoint(this.getBounds().getCenter());
                    this.originalCenterOffset = [center.x - point.x, center.y - point.y];
                    this.canMove = true;

                    // Add Action Events
                    L.DomEvent.on(this._map.getContainer(), 'mouseup', this.topBarBoundry.mouseup, this);
                    L.DomEvent.on(this._map.getContainer(), 'mousemove', this.topBarBoundry.mousemove, this);
                    this._map.dragging.disable();
                    this._map.touchZoom.disable();
                    this._map.doubleClickZoom.disable();
                    this._map.scrollWheelZoom.disable();
                    this._map.boxZoom.disable();
                    this._map.keyboard.disable();
                    if (this._map.tap) this._map.tap.disable();
                }, this);
                this.topBarBoundry.mouseup = function (e) {
                    this.canMove = false;

                    // Remove Events
                    L.DomEvent.off(this._map.getContainer(), 'mouseup', this.topBarBoundry.mouseup, this);
                    L.DomEvent.off(this._map.getContainer(), 'mousemove', this.topBarBoundry.mousemove, this);

                    this._map.dragging.enable();
                    this._map.touchZoom.enable();
                    this._map.doubleClickZoom.enable();
                    this._map.scrollWheelZoom.enable();
                    this._map.boxZoom.enable();
                    this._map.keyboard.enable();
                    if (this._map.tap) this._map.tap.enable();
                };
                this.topBarBoundry.mousemove = function (e) {
                    if (this.canMove) {
                        this._move(map.containerPointToLatLng([e.clientX - $(this._map.getContainer()).offset().left + this.originalCenterOffset[0], e.clientY - $(this._map.getContainer()).offset().top + this.originalCenterOffset[1]]));
                    }
                };
            }
        }
        else {
            if (this.boundry != null) {
                this.boundry.removeFrom(map);
                this.boundry = null;
            }

            if (this.topBarBoundry != null) {
                this.topBarBoundry.removeFrom(map);
                this.topBarBoundry = null;
            }
        }

        return this;
    },

    contains: function (latlng) {
        var radius = this.getRadius(); //in meters
        var circleCenterPoint = this.getLatLng(); //gets the circle's center latlng
        return Math.abs(circleCenterPoint.distanceTo(latlng)) <= radius;
    }
});

L.ShapeControl.circle = function (options) {
    return new L.ShapeControl.Circle(options);
};


L.ShapeControl.Polygon = L.Polygon.extend({
    initialize: function (options) {
        this.options.weigth = this.options.weigth ? this.options.weigth : 4;

        var centerLatLng = options.map.getBounds().getCenter(); // get map center
        var pointC = options.map.latLngToContainerPoint(centerLatLng); // convert to containerpoint (pixels)
        var point1 = [pointC.x + 100, pointC.y - 200];
        var point2 = [pointC.x + 200, pointC.y + 100];
        var point3 = [pointC.x - 50, pointC.y + 100];

        // convert containerpoints to latlng's
        var latLng1 = options.map.containerPointToLatLng(point1);
        var latLng2 = options.map.containerPointToLatLng(point2);
        var latLng3 = options.map.containerPointToLatLng(point3);

        L.Polygon.prototype.initialize.call(this, [latLng1, latLng2, latLng3], options);
        this.setStyle({ weigth: this.options.weigth, color: options.featureGroup.color, fillColor: options.featureGroup.fillColor, fillOpacity: 0 });


        this.on('mouseover', this._onMouseover, this);
        this.on('mouseout', this._onMouseout, this);
        this.on('click', this._onClick, this);
        this.onMove = options.onMove;
        this.onResize = options.onResize;
        this.onUpdateEnded = options.onUpdateEnded;
        this.featureGroup = options.featureGroup;

        this.enabled = false;
    },

    getCenter: function () {
        var centroid = [0, 0];

        var points = this._getCorners();
        for (var i = 0; i < points.length; i++) {

            centroid[0] += points[i].lat;
            centroid[1] += points[i].lng;
        }

        var totalPoints = points.length;
        centroid[0] = centroid[0] / totalPoints;
        centroid[1] = centroid[1] / totalPoints;

        return centroid;
    },

    _onMouseover: function (e) {
        if (this.enabled == false) {
            this.setStyle({ weight: this.options.weigth + 2 });
        }
    },

    _onMouseout: function (e) {
        if (this.enabled == false) {
            this.setStyle({ weight: this.options.weigth });
        }
    },

    _onClick: function (e) {
        if (this.enabled == false) {
            this.enable();
        }
    },

    _createMarker: function (latlng, classes) {
        var marker = new L.Marker(latlng, {
            icon: new L.DivIcon({
                iconSize: new L.Point(12, 12),
                className: 'leaflet-div-icon leaflet-editing-icon ' + classes
            })
        });
        marker.parent = this;
        this._markerGroup.addLayer(marker);

        return marker;
    },

    _setupMarkers: function (map) {
        this._markerGroup = new L.LayerGroup().addTo(map);

        this._resizeMarkers = [];

        var corners = this._getCorners();
        for (var i = 0, l = corners.length; i < l; i++) {
            this._resizeMarkers.push(this._createMarker(corners[i], 'leaflet-editing-resize'));
            // Set the corner
            this._resizeMarkers[i]._cornerIndex = i;
            this._resizeMarkers[i].newMarker = false;
            this._resizeMarkers[i].on('mousedown', this._onMarkerMouseDown, this._resizeMarkers[i]);
            this._resizeMarkers[i].on('dblclick', this._onMarkerDblClick, this._resizeMarkers[i]);
        }

        // Setup New Markers
        this._resetNewMarkers();

        this._toggleMarkers(0);

    },

    _resetNewMarkers: function (e) {
        if (this._addNewMarkers != null) {
            for (var i = 0, l = this._addNewMarkers.length; i < l; i++) {
                this._addNewMarkers[i].removeFrom(this._map);
            }
        }
        this._addNewMarkers = [];
        var newMarkers = this._newMarkers();
        for (var i = 0, l = newMarkers.length; i < l; i++) {
            this._addNewMarkers.push(this._createMarker(newMarkers[i], 'leaflet-editing-resize'));
            // Set the corner
            this._addNewMarkers[i].setOpacity(0.5);
            this._addNewMarkers[i].newMarker = true;
            this._addNewMarkers[i]._cornerIndex = i;
            this._addNewMarkers[i].on('mousedown', this._onMarkerMouseDown, this._addNewMarkers[i]);
            this._addNewMarkers[i].on('dblclick', this._onMarkerDblClick, this._addNewMarkers[i]);
        }
    },

    _onMarkerDblClick: function (e) {
        var marker = this;

        if (marker.newMarker == false && marker.parent._resizeMarkers.length > 3) {
            marker.enableAction = false;
            this._map.dragging.enable(); // Enable Map Dragging
            // Remove Events
            marker.off('mousedown', this._onMarkerMouseDown, marker);
            marker.off('dblclick', this._onMarkerDblClick, marker);
            // Remove Events
            L.DomEvent.off(this._map.getContainer(), 'mouseup', this.parent._onMarkerMouseUp, marker);
            L.DomEvent.off(this._map.getContainer(), 'mousemove', this.parent._onMarkerMouseMove, marker);

            // Remove from new markers
            marker.parent._resizeMarkers.splice(marker.parent._resizeMarkers.indexOf(marker), 1);
            marker.removeFrom(this._map);
            marker.parent._resetNewMarkers();
            marker.parent._resize();

            return false;
        }
    },

    _onMarkerMouseDown: function (e) {
        var marker = this;
        marker.enableAction = true;
        this._map.dragging.disable(); // Disable Map Dragging

        // Add Action Events
        L.DomEvent.on(this._map.getContainer(), 'mouseup', this.parent._onMarkerMouseUp, marker);
        L.DomEvent.on(this._map.getContainer(), 'mousemove', this.parent._onMarkerMouseMove, marker);
    },

    _onMarkerMouseUp: function (e) {
        var marker = this;
        if (marker.enableAction) {
            marker.enableAction = false;
            this._map.dragging.enable(); // Enable Map Dragging
            // Remove Events
            L.DomEvent.off(this._map.getContainer(), 'mouseup', this.parent._onMarkerMouseUp, marker);
            L.DomEvent.off(this._map.getContainer(), 'mousemove', this.parent._onMarkerMouseMove, marker);
            // Reset New Markers
            this.parent._resetNewMarkers();
        }
    },

    _onMarkerMouseMove: function (e) {
        var marker = this;
        if (marker.enableAction) {
            var point = [e.clientX - $(this._map.getContainer()).offset().left, e.clientY - $(this._map.getContainer()).offset().top];
            var latlng = this._map.containerPointToLatLng(point);
            marker.setLatLng(latlng);

            if (marker.newMarker) {
                marker.newMarker = false;
                // Remove from new markers
                marker.parent._addNewMarkers.splice(marker.parent._addNewMarkers.indexOf(marker), 1);
                // Add to Resize Markers
                if (marker._cornerIndex == marker.parent._resizeMarkers.length)
                    marker.parent._resizeMarkers.splice(0, 0, marker);
                else
                    marker.parent._resizeMarkers.splice(marker._cornerIndex + 1, 0, marker);
                // Resize Polygon
                marker.parent._resize();
                // Change Opacity
                marker.setOpacity(1);
            }
            else if (marker.isCenter) { // Move Shape/Marker
                // Move Shape
                marker.parent._move(latlng);
            }
            else { // Resize
                marker.parent._resize();
            }
        }
    },

    _move: function (newCenter) {
        var latlngs = this.getLatLngs(),
            bounds = this.getBounds(),
            center = bounds.getCenter(),
            offset, newLatLngs = [];

        // Offset the latlngs to the new center
        for (var i = 0, l = latlngs.length; i < l; i++) {
            offset = [latlngs[i].lat - center.lat, latlngs[i].lng - center.lng];
            newLatLngs.push([newCenter.lat + offset[0], newCenter.lng + offset[1]]);
        }

        this.setLatLngs(newLatLngs);

        // Reposition the resize markers
        this._repositionMarkers();

        if (this.onMove != null) this.onMove();
    },

    _resize: function () {
        var bounds;

        // Update the shape based on the markers
        var points = []
        for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
            points.push(this._resizeMarkers[i].getLatLng());
        }

        this.setLatLngs(points);

        // Reposition the resize markers
        this._repositionMarkers();

        if (this.onResize != null) this.onResize();
    },

    _repositionMarkers: function () {
        var corners = this._getCorners();

        for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
            this._resizeMarkers[i].setLatLng(corners[i]);
        }

        var newMarkers = this._newMarkers();
        for (var i = 0, l = this._addNewMarkers.length; i < l; i++) {
            if (i < newMarkers.length)
                this._addNewMarkers[i].setLatLng(newMarkers[i]);
        }
    },

    _getCorners: function () {
        var corners = this.getLatLngs();
        return corners;
    },

    _newMarkers: function () {
        var corners = this.getLatLngs();
        var newMarkers = [];
        for (var i = 0, l = corners.length; i < l; i++) {
            var p1 = corners[i];
            var p2 = i + 1 < corners.length ? corners[i + 1] : corners[0];
            var m = L.latLng((p1.lat + p2.lat) / 2, (p1.lng + p2.lng) / 2);
            newMarkers.push(m);
        }

        return newMarkers;
    },

    _toggleMarkers: function (opacity) {

        for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
            this._resizeMarkers[i].setOpacity(opacity);
        }

        for (var i = 0, l = this._addNewMarkers.length; i < l; i++) {
            this._addNewMarkers[i].setOpacity(opacity / 2);
        }
    },

    enable: function (e) {
        if (this.enabled == false) {
            // Disabled Other Shapes
            this._map.eachLayer(function (layer) {
                if (layer.featureGroup != null) {
                    layer.featureGroup.eachLayer(function (feature) {
                        if (feature instanceof L.ShapeControl.Polygon || feature instanceof L.ShapeControl.Circle || feature instanceof L.ShapeControl.Rectangle)
                            feature.disable();
                    });
                }
            });
            if (this._markerGroup == null) {
                // Setup Resize and Center Markers
                this._setupMarkers(this._map);
            }

            this._toggleMarkers(1);
            this.enabled = true;
            this.setStyle({ fillOpacity: 0.4 });

            this.bringToFront();

            this.redraw();
        }
    },

    disable: function (e) {
        if (this.enabled == true) {
            this._toggleMarkers(0);
            this.setStyle({ fillOpacity: 0 });
            this.enabled = false;
            this.redraw();

            if (this.onUpdateEnded != null) this.onUpdateEnded();
        }
    },

    show: function () {
        this.setStyle({ opacity: 1, fillOpacity: 0.2 });
        if (this.enabled == true) this._toggleMarkers(1);
    },

    hide: function () {
        this.setStyle({ opacity: 0, fillOpacity: 0 });
        if (this.enabled == true) this._toggleMarkers(0);
    },

    redraw: function () {
        L.Polygon.prototype.redraw.call(this);


        if (this.enabled) {
            var paddedBounds = this.getBounds().pad(0.01);
            if (this.boundry != null) {
                this.boundry.setBounds(paddedBounds);
            }
            else
                this.boundry = L.rectangle(paddedBounds, { color: "#4d4d50", fillOpacity: 0, opacity: 0.5, weight: 4, className: 'non-clickable' }).addTo(map);
            var southWestP = map.latLngToContainerPoint(paddedBounds.getSouthWest());
            var northEastP = map.latLngToContainerPoint(paddedBounds.getNorthEast());
            southWestP.y = northEastP.y - 24;
            var southWest = map.containerPointToLatLng(southWestP),
                 northEast = map.containerPointToLatLng(northEastP);
            var topBounds = L.latLngBounds(southWest, northEast);
            if (this.topBarBoundry != null) {
                this.topBarBoundry.setBounds(topBounds);
            }
            else {
                this.topBarBoundry = L.rectangle(topBounds, { pane: 'pane-shape-controls', color: "#4d4d50", fillOpacity: 0.5, opacity: 0.5, weight: 4 }).addTo(map);
                this.topBarBoundry.on('mousedown', function (e) {
                    var point = e.containerPoint;
                    var center = map.latLngToContainerPoint(this.getBounds().getCenter());
                    this.originalCenterOffset = [center.x - point.x, center.y - point.y];
                    this.canMove = true;

                    // Add Action Events
                    L.DomEvent.on(this._map.getContainer(), 'mouseup', this.topBarBoundry.mouseup, this);
                    L.DomEvent.on(this._map.getContainer(), 'mousemove', this.topBarBoundry.mousemove, this);
                    this._map.dragging.disable();
                    this._map.touchZoom.disable();
                    this._map.doubleClickZoom.disable();
                    this._map.scrollWheelZoom.disable();
                    this._map.boxZoom.disable();
                    this._map.keyboard.disable();
                    if (this._map.tap) this._map.tap.disable();
                }, this);
                this.topBarBoundry.mouseup = function (e) {
                    this.canMove = false;

                    // Remove Events
                    L.DomEvent.off(this._map.getContainer(), 'mouseup', this.topBarBoundry.mouseup, this);
                    L.DomEvent.off(this._map.getContainer(), 'mousemove', this.topBarBoundry.mousemove, this);

                    this._map.dragging.enable();
                    this._map.touchZoom.enable();
                    this._map.doubleClickZoom.enable();
                    this._map.scrollWheelZoom.enable();
                    this._map.boxZoom.enable();
                    this._map.keyboard.enable();
                    if (this._map.tap) this._map.tap.enable();
                };
                this.topBarBoundry.mousemove = function (e) {
                    if (this.canMove) {
                        this._move(map.containerPointToLatLng([e.clientX - $(this._map.getContainer()).offset().left + this.originalCenterOffset[0], e.clientY - $(this._map.getContainer()).offset().top + this.originalCenterOffset[1]]));
                    }
                };
            }
        }
        else {
            if (this.boundry != null) {
                this.boundry.removeFrom(map);
                this.boundry = null;
            }

            if (this.topBarBoundry != null) {
                this.topBarBoundry.removeFrom(map);
                this.topBarBoundry = null;
            }
        }

        return this;
    },

    contains: function (latlng) {
        return this.pointInPolygon(latlng, this);
    },

    pointInPolygon: function (latlng, poly) {
        var coords = poly.getLatLngs();

        var result = false;
        var j = coords.length - 1;
        for (var i = 0; i < coords.length; i++) {
            var gcj = coords[j];
            var gci = coords[i];

            if (gci.lat < latlng.lat && gcj.lat >= latlng.lat || gcj.lat < latlng.lat && gci.lat >= latlng.lat) {
                if (gci.lng + (latlng.lat - gci.lat) / (gcj.lat - gci.lat) * (gcj.lng - gci.lng) < latlng.lng) {
                    result = !result;
                }
            }
            j = i;
        }
        return result;
    }
});

L.ShapeControl.polygon = function (options) {
    return new L.ShapeControl.Polygon(options);
};

