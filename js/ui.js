const panel = document.getElementById('controlPanel');
const btn = document.getElementById('toggleBtn');

// Toggle panel
btn.onclick = () => {
  panel.classList.toggle('closed');
  btn.textContent = panel.classList.contains('closed') ? '❯' : '❮';
};

// --------------------
// Unit & hasil measurement
// --------------------
let currentUnit = "km"; 
let currentAreaUnit = "m²"; 
let measureMode = null; // "distance" | "area"

const distanceUnits = [
  {name:"m", factor:1},
  {name:"km", factor:0.001},
  {name:"mi", factor:0.000621371},
  {name:"ft", factor:3.28084},
  {name:"yd", factor:1.09361}
];

const areaUnits = [
  {name:"m²", factor:1},
  {name:"ha", factor:0.0001},
  {name:"km²", factor:0.000001},
  {name:"ac", factor:0.000247105},
  {name:"ft²", factor:10.7639}
];

function updateMeasurementResult(value, type="distance") {
  let result = "";
  if(type === "distance") {
    const unit = distanceUnits.find(u => u.name === currentUnit);
    result = (value * unit.factor).toFixed(3) + " " + unit.name;
  } else if(type === "area") {
    const unit = areaUnits.find(u => u.name === currentAreaUnit);
    result = (value * unit.factor).toFixed(3) + " " + unit.name;
  }
  const out = document.getElementById("measureResult");
  if(out) out.innerText = result;
}

// --------------------
// Highlight tombol measure
// --------------------
function setMeasureMode(mode) {
  measureMode = mode;

  // Reset warna dulu
  btnDistance.style.backgroundColor = "";
  btnArea.style.backgroundColor = "";

  if(mode === "distance") {
    btnDistance.style.backgroundColor = "#2196f3"; // biru
  } else if(mode === "area") {
    btnArea.style.backgroundColor = "#2196f3"; // biru
  }
}


// --------------------
// Popup menu unit
// --------------------
const measureMenu = document.getElementById("measureMenu");
let measurePopup;

measureMenu.onclick = (e) => {
  if(measurePopup) measurePopup.remove();

  measurePopup = document.createElement("div");
  measurePopup.className = "measure-popup";
  measurePopup.style.color = "#fff"; // teks putih

  // Header Distance
  const headerDist = document.createElement("div");
  headerDist.style.fontWeight = "bold";
  headerDist.style.padding = "4px 10px";
  headerDist.style.borderBottom = "1px solid #555";
  headerDist.innerText = "Distance Units";
  measurePopup.appendChild(headerDist);

  distanceUnits.forEach(u => {
    const item = document.createElement("div");
    item.className = "measure-popup-item";
    item.innerText = u.name;
    item.onclick = () => {
      currentUnit = u.name;
      updateMeasurementResult(window.Measure.lastDistance || 0, "distance");
      measurePopup.remove();
      setMeasureMode("distance");
    };
    measurePopup.appendChild(item);
  });

  // Header Area
  const headerArea = document.createElement("div");
  headerArea.style.fontWeight = "bold";
  headerArea.style.padding = "4px 10px";
  headerArea.style.borderTop = "1px solid #555";
  headerArea.style.borderBottom = "1px solid #555";
  headerArea.innerText = "Area Units";
  measurePopup.appendChild(headerArea);

  areaUnits.forEach(u => {
    const item = document.createElement("div");
    item.className = "measure-popup-item";
    item.innerText = u.name;
    item.onclick = () => {
      currentAreaUnit = u.name;
      updateMeasurementResult(window.Measure.lastArea || 0, "area");
      measurePopup.remove();
      setMeasureMode("area");
    };
    measurePopup.appendChild(item);
  });

  measurePopup.style.left = (e.target.getBoundingClientRect().right + window.scrollX - 100) + "px";
  measurePopup.style.top = (e.target.getBoundingClientRect().bottom + window.scrollY) + "px";

  document.body.appendChild(measurePopup);
};

// Tutup popup saat klik di luar
document.addEventListener("click", (e) => {
  if (measurePopup && !measureMenu.contains(e.target)) {
    measurePopup.remove();
  }
});

// --------------------
// Tombol measure
// --------------------
const btnDistance = document.querySelector('button[onclick="Measure.startDistance()"]');
const btnArea = document.querySelector('button[onclick="Measure.startArea()"]');

btnDistance.onclick = () => {
  Measure.startDistance();
  setMeasureMode("distance");
};

btnArea.onclick = () => {
  Measure.startArea();
  setMeasureMode("area");
};

// Reset highlight saat measurement selesai
// Pastikan Measure sudah siap
if (window.Measure) {
  const originalEndMeasurement = window.Measure.endMeasurement;

  window.Measure.endMeasurement = function() {
    // Cek mode area dan jumlah titik
    if (measureMode === "area") {
      const points = window.Measure.points || [];
      if (points.length < 3) {
        alert("Untuk pengukuran area, minimal harus 3 titik!");
        return; // hentikan endMeasurement
      }
    }

    // Reset highlight
    setMeasureMode(null);

    // Panggil original endMeasurement
    if (originalEndMeasurement) originalEndMeasurement.call(this);
  };
}





const btnClear = document.querySelector('button[onclick="Measure.clear()"]');
btnClear.onclick = () => {
    if (window.Measure.clear) window.Measure.clear();
    setMeasureMode(null); // reset highlight
};

