# WebGIS Interaktif

Aplikasi WebGIS interaktif berbasis **CesiumJS** untuk menampilkan peta, data 2D/3D, dan pengukuran jarak & area. Mendukung berbagai format data lokal/kustom termasuk **GeoJSON, CSV, KML/KMZ, Shapefile, GLB/GLTF, dan GeoTIFF**.

---

## Fitur Utama

- **Visualisasi Data 2D & 3D**
  - GeoJSON/KML/KMZ untuk geometri 2D.
  - GLB/GLTF untuk model 3D.
  - GeoTIFF untuk raster.
- **Layer Management**
  - Tambah, hapus, sembunyikan/tampilkan layer.
  - Zoom otomatis ke extent layer.
- **Measurement Tools**
  - Distance dan Area measurement.
  - Pilihan unit (m, km, mi, ft, yd, m², ha, km², ac, ft²).
  - Highlight tombol aktif saat pengukuran.
  - Validasi area minimal 3 titik.
- **Interaktif**
  - Klik kanan untuk zoom ke layer.
  - Clear measurement.
- **Offline Data Support**
  - Upload file lokal dari komputer (zip shapefile, CSV, GLB/GLTF, GeoJSON, KML/KMZ).

---

## Cara Penggunaan

1. Buka file `index.html` di browser modern.
2. Gunakan panel kontrol di kiri untuk:
   - Menambahkan file lokal melalui `File Input`.
   - Memilih unit pengukuran di menu **⋮**.
   - Mengaktifkan measurement distance atau area.
3. Klik kanan pada layer untuk zoom ke layer tersebut.
4. Gunakan tombol `Clear Measurement` untuk mereset pengukuran.

---

## Format Data yang Didukung

- **3D Model:** `.glb`, `.gltf`
- **2D Data:** `.geojson`, `.json`, `.czml`, `.kml`, `.kmz`
- **Shapefile:** `.shp`, `.zip` (harus berisi `.shp`, `.dbf`, `.shx`, dll.)
- **Raster:** `.tif`, `.tiff`
- **CSV:** longitude, latitude, height (optional)

---
