// =========================
// FILE INPUT LISTENER
// =========================
document.getElementById("fileInput").addEventListener("change", function (e) {
  const files = e.target.files;
  if (!files.length) return;

  for (let i = 0; i < files.length; i++) {
    loadFile(files[i]);
  }

  e.target.value = ""; // reset supaya file yang sama bisa di-load lagi
});

// =========================
// LOAD FILE FUNCTION
// =========================
async function loadFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  // =========================
  // 3D MODEL (GLB / GLTF)
  // =========================
  if (ext === "glb" || ext === "gltf") {
    const url = URL.createObjectURL(file);
    const entity = viewer.entities.add({
      position: viewer.camera.positionWC,
      model: { uri: url, scale: 1 }
    });
    viewer.flyTo(entity);
    addLayerItem(file.name, entity);
    return;
  }

  // =========================
  // CSV (lon,lat,height)
  // =========================
  if (ext === "csv") {
    const reader = new FileReader();
    reader.onload = function() {
      const lines = reader.result.split("\n");
      const group = viewer.entities.add();
      lines.forEach((line) => {
        if(!line.trim()) return;
        const [lon, lat, height] = line.split(",").map(Number);
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat, height || 0),
          point: { pixelSize: 5, color: Cesium.Color.YELLOW },
          parent: group
        });
      });
      addLayerItem(file.name, group);
      viewer.flyTo(group);
    };
    reader.readAsText(file);
    return;
  }

  // =========================
  // SHAPEFILE (ZIP / SHP)
  // =========================
  if (ext === "zip" || ext === "shp") {
    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const arrayBuffer = reader.result;
        const geojson = await shp(arrayBuffer); // shp.js
        const ds = await Cesium.GeoJsonDataSource.load(geojson, { clampToGround: false });
        viewer.dataSources.add(ds);
        viewer.flyTo(ds); // otomatis zoom
        const layerName = (ext === "zip") ? file.name.replace(/\.zip$/i, ".shp") : file.name;
        addLayerItem(layerName, ds);
      } catch(err) {
        console.error("Gagal load shapefile:", err);
        alert("File shapefile rusak atau tidak lengkap: " + file.name);
      }
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  // =========================
  // 2D DATA (GeoJSON, CZML, KML/KMZ)
  // =========================
  if (ext === "geojson" || ext === "json" || ext === "czml" || ext === "kml" || ext === "kmz") {
    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const data = JSON.parse(reader.result);
        let ds;
        if (ext === "geojson" || ext === "json") {
          ds = await Cesium.GeoJsonDataSource.load(data, { clampToGround: false });
        } else if (ext === "czml") {
          ds = new Cesium.CzmlDataSource();
          await ds.load(data);
        } else if (ext === "kml" || ext === "kmz") {
          ds = await Cesium.KmlDataSource.load(data, {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas
          });
        }
        viewer.dataSources.add(ds);
        viewer.flyTo(ds);
        addLayerItem(file.name, ds);
      } catch (err) {
        console.error("Gagal load file:", file.name, err);
        alert("File tidak didukung atau rusak: " + file.name);
      }
    };
    reader.readAsText(file);
    return;
  }

  // =========================
  // GeoTIFF (opsional)
  // =========================
  if (ext === "tif" || ext === "tiff") {
    const url = URL.createObjectURL(file);
    const georaster = await parseGeoraster(url);
    const layer = new GeoRasterLayer({ georaster });
    viewer.imageryLayers.add(layer);
    addLayerItem(file.name, layer);
  }
}

// =========================
// LAYER LIST HANDLER
// =========================
function addLayerItem(name, obj) {
  const list = document.getElementById("layerList");
  if (list.innerText.trim() === "-") list.innerHTML = "";

  const item = document.createElement("div");
  item.className = "layer-item";

  const chk = document.createElement("input");
  chk.type = "checkbox";
  chk.checked = true;
  chk.onchange = () => obj.show = chk.checked;

  const label = document.createElement("div");
  label.className = "layer-label";
  label.textContent = name;

  const menu = document.createElement("div");
  menu.className = "layer-menu";
  menu.textContent = "⋮";

  item.oncontextmenu = e => {
    e.preventDefault();
    viewer.flyTo(obj);
  };

  menu.onclick = e => {
    e.stopPropagation();
    closeAllPopups();

    const popup = document.createElement("div");
    popup.className = "layer-popup";
    popup.style.left = e.pageX + "px";
    popup.style.top = e.pageY + "px";

    const zoomItem = document.createElement("div");
    zoomItem.className = "layer-popup-item";
    zoomItem.textContent = "Zoom to layer";
    zoomItem.onclick = () => { viewer.flyTo(obj); popup.remove(); };

    const deleteItem = document.createElement("div");
    deleteItem.className = "layer-popup-item delete";
    deleteItem.textContent = "Delete layer";
    deleteItem.onclick = () => {
      if (obj instanceof Cesium.DataSource) viewer.dataSources.remove(obj);
      else viewer.entities.remove(obj);
      item.remove();
      if (!list.children.length) list.innerText = "-";
      popup.remove();
    };

    popup.appendChild(zoomItem);
    popup.appendChild(deleteItem);
    document.body.appendChild(popup);
  };

  item.appendChild(chk);
  item.appendChild(label);
  item.appendChild(menu);
  list.appendChild(item);
}

// =========================
// CLOSE POPUP GLOBAL
// =========================
function closeAllPopups() {
  document.querySelectorAll(".layer-popup").forEach(p => p.remove());
}

document.addEventListener("click", closeAllPopups);
