window.Measure = (() => {
  let handler;
  let positions = [];
  let markers = [];
  let lineEntity;
  let polygonEntity;
  let resultLabel;
  let mode = null; // "distance" | "area"

  // =====================
  // Convert screen to Cartesian (globe)
  // =====================
  function getCartesian(screenPosition) {
    const scene = viewer.scene;
    let cartesian;

    if (scene.pickPositionSupported) {
      cartesian = scene.pickPosition(screenPosition);
      if (Cesium.defined(cartesian)) return cartesian;
    }

    const ray = viewer.camera.getPickRay(screenPosition);
    return scene.globe.pick(ray, scene);
  }

  // =====================
  // Clear measurement
  // =====================
  function clear() {
    if (handler) handler.destroy();
    handler = null;

    positions = [];
    mode = null;

    markers.forEach(m => viewer.entities.remove(m));
    markers = [];

    if (lineEntity) viewer.entities.remove(lineEntity);
    if (polygonEntity) viewer.entities.remove(polygonEntity);
    if (resultLabel) viewer.entities.remove(resultLabel);

    lineEntity = polygonEntity = resultLabel = null;

    const out = document.getElementById("measureResult");
    if (out) out.innerText = "-";

    window.Measure.lastDistance = 0;
    window.Measure.lastArea = 0;
  }

  // =====================
  // Add marker on globe
  // =====================
  function addMarker(position, index) {
    const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
    const height = viewer.scene.globe.getHeight(cartographic) || 0;
    const clampedPosition = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      height
    );

    const marker = viewer.entities.add({
      position: clampedPosition,
      point: {
        pixelSize: 10,
        color: Cesium.Color.CYAN,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: index.toString(),
        font: "12px sans-serif",
        pixelOffset: new Cesium.Cartesian2(0, -15),
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });

    markers.push(marker);
  }

  // =====================
  // Compute distance in meters
  // =====================
  function computeDistance(positions) {
    let dist = 0;
    for (let i = 1; i < positions.length; i++) {
      dist += Cesium.Cartesian3.distance(positions[i - 1], positions[i]);
    }
    return dist;
  }

  // =====================
  // Compute area in m²
  // =====================
  function computeArea(cartesians) {
    const coords = cartesians.map(c =>
      Cesium.Ellipsoid.WGS84.cartesianToCartographic(c)
    );

    let area = 0;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      area +=
        (coords[j].longitude + coords[i].longitude) *
        (coords[j].latitude - coords[i].latitude);
    }

    return Math.abs(area * Cesium.Ellipsoid.WGS84.maximumRadius ** 2);
  }

  // =====================
  // Start distance measurement
  // =====================
  function startDistance() {
    clear();
    mode = "distance";
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    // ubah cursor saat measurement
    viewer.canvas.style.cursor = "crosshair";

    handler.setInputAction(e => {
        const pos = getCartesian(e.position);
        if (!pos) return;

        positions.push(pos);
        addMarker(pos, positions.length);

        // Update polyline setiap titik baru
        if (positions.length > 1) {
        if (lineEntity) viewer.entities.remove(lineEntity);
        lineEntity = viewer.entities.add({
            polyline: {
            positions,
            width: 3,
            material: Cesium.Color.RED,
            clampToGround: true
            }
        });
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(() => {
        if (positions.length < 2) return;

        const dist = computeDistance(positions);
        window.Measure.lastDistance = dist;
        updateMeasurementResult(dist, "distance");

        handler.destroy();
        // reset cursor
        viewer.canvas.style.cursor = "default";
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // reset cursor saat mouse leave
    viewer.scene.canvas.addEventListener('mouseleave', () => {
        viewer.canvas.style.cursor = "default";
    });
  }

  // =====================
  // Start area measurement
  // =====================
  function startArea() {
    clear();
    mode = "area";
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    // ubah cursor saat measurement
    viewer.canvas.style.cursor = "crosshair";

    handler.setInputAction(e => {
        const pos = getCartesian(e.position);
        if (!pos) return;

        positions.push(pos);
        addMarker(pos, positions.length);

        // Update poligon setiap titik baru
        if (positions.length > 2) {
        if (polygonEntity) viewer.entities.remove(polygonEntity);
        polygonEntity = viewer.entities.add({
            polygon: {
            hierarchy: new Cesium.PolygonHierarchy(positions),
            material: Cesium.Color.YELLOW.withAlpha(0.4),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            clampToGround: true
            }
        });
        }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(() => {
        if (positions.length < 3) return;

        const area = computeArea(positions);
        window.Measure.lastArea = area;
        updateMeasurementResult(area, "area");

        handler.destroy();
        // reset cursor
        viewer.canvas.style.cursor = "default";
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // reset cursor saat mouse leave
    viewer.scene.canvas.addEventListener('mouseleave', () => {
        viewer.canvas.style.cursor = "default";
    });
  }


  return {
    startDistance,
    startArea,
    clear,
    lastDistance: 0,
    lastArea: 0
  };
})();
