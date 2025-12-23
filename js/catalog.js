const catalogItems = [
  {
    name: "OpenStreetMap (2D)",
    type: "imagery",
    create: () =>
      new Cesium.OpenStreetMapImageryProvider()
  },
  {
    name: "OSM Buildings (3D)",
    type: "3dtiles",
    create: async () => {
      // ⚠️ MATIKAN TERRAIN SEBELUM LOAD BUILDINGS
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

      // RETURN tileset SAJA
      return await Cesium.createOsmBuildingsAsync();
    }
  }
];

catalogItems.forEach(addCatalogItem);

function addCatalogItem(item) {
  const list = document.getElementById("catalogList");
  if (list.innerText.trim() === "-") list.innerHTML = "";

  const row = document.createElement("div");
  row.className = "layer-item";

  const chk = document.createElement("input");
  chk.type = "checkbox";

  chk.onchange = async () => {
    if (chk.checked) {

      if (item.type === "imagery") {
        item._layer = viewer.imageryLayers.addImageryProvider(item.create());
      }

      if (item.type === "3dtiles") {
        // LOAD SEKALI SAJA
        if (!item._tileset) {
          item._tileset = await item.create();
          viewer.scene.primitives.add(item._tileset);
        }
        item._tileset.show = true;
      }

    } else {
      if (item._layer) {
        viewer.imageryLayers.remove(item._layer);
        item._layer = null;
      }

      if (item._tileset) {
        // JANGAN remove, cukup hide
        item._tileset.show = false;
      }
    }
  };

  const label = document.createElement("div");
  label.className = "layer-label";
  label.innerText = item.name;

  row.appendChild(chk);
  row.appendChild(label);
  list.appendChild(row);
}
