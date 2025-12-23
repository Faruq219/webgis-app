Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MTdjOWM3MS00MzQ3LTQzNmYtODgwMy0yODIzOGYyOWUyNzIiLCJpZCI6MzcxNTMxLCJpYXQiOjE3NjYyOTQ5NTF9.idUPX0j1NEaRA0x3u1izTtZNFA9KLkC35cq1cHmbNqY';

window.viewer = new Cesium.Viewer("cesiumContainer", {
  animation: true,
  timeline: true,
  geocoder: true,
  homeButton: true,
  sceneModePicker: true,
  baseLayerPicker: true,
  fullscreenButton: true
});

// Penting untuk 3D GIS
viewer.scene.globe.depthTestAgainstTerrain = True;

// Kamera awal
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(110, -7, 4000000)
});