# PMM Converter

**Browser-only IFC → OBJ converter for Revit-to-SketchUp workflows.**

*A user guide from the PMM Tools suite by Trilogy Design Intelligence.*

**Tool 08 · v1.0 · Schema v1.0**  

**Audience:** Designers

---

PMM Converter is a single-page React app that turns Revit-exported IFC files into SketchUp-importable OBJ. The whole conversion happens in the browser — files never leave your computer. The missing link for studios working between Revit and SketchUp without a Revit license.


# Part I — Foundations


## 1. What This Tool Is

Direct .rvt → .skp conversion is not possible without a Revit license. Both formats are proprietary; the .rvt format has no public reader, and .skp writing requires Trimble SDKs.

The standard workaround is a two-hop:

```text
Revit (.rvt) → export → IFC (.ifc) → THIS TOOL → OBJ (.obj) → import → SketchUp (.skp)
```

PMM Converter handles the middle step in the browser, so you do not need a server, an account, or to upload anything.


## 2. Opening the Tool

Open the hosted version at the published URL, or open the local HTML file. No installation, no sign-in. Once loaded, it works offline.


## 3. What It Handles

The parser supports IFC files using `IFCPOLYLOOP` / `IFCCARTESIANPOINT` geometry — the most common representation. Some IFC files use `IFCFACETEDBREP` or `IFCSWEPTSOLIDSHAPE`; if your file shows zero faces detected, that is why. Open an issue and we will extend the parser.


# Part II — Daily Use


## 4. Step 1 — Export from Revit

In Revit:

- **File → Export → IFC**
- Choose IFC2x3 or IFC4 (either works)
- Enable *Export solids* if your import has missing geometry later
- Save the file


## 5. Step 2 — Convert

- Drag the .ifc onto the upload area, or click to browse
- Click **Convert to OBJ**
- Watch the stats fill in: face count, point count, entity count, detected types
- Click **↓ Download .OBJ**


## 6. Step 3 — Import into SketchUp

- In SketchUp: **File → Import**
- Choose the OBJ file
- Adjust units in the import dialog if needed (default is meters)
- Click Import

Your geometry now lives in SketchUp. From here you can run PMM Connection to layer in PMM metadata.


# Part III — Reference


## 7. Reading the Stats Panel

After conversion, the tool displays:

- **Face count** — total triangles in the OBJ output
- **Point count** — unique vertices
- **Entity count** — IFC entities parsed
- **Detected types** — IFC entity types found (IfcWall, IfcWindow, IfcDoor, etc.)

If face count is 0 but entity count is high, the geometry representation is unsupported (see Section 3).


## 8. Privacy &amp; Files

The conversion runs entirely in your browser using a JavaScript IFC parser. No files are uploaded to any server. Refresh the page and the file is gone from memory.


# Part IV — Care & Repair


## 9. Troubleshooting

### "0 faces detected"

The IFC uses geometry representations the parser does not handle yet. Try re-exporting from Revit with a different IFC version (IFC4 instead of IFC2x3, or vice versa). If still nothing, the source file uses `IFCFACETEDBREP` or `IFCSWEPTSOLIDSHAPE` — file an issue and we will extend the parser.

### OBJ imports into SketchUp upside-down

Coordinate-system mismatch between Revit and SketchUp. After import, select all and *Edit → Flip → Red Axis* (or whichever axis fixes it). Once you know which one for your workflow it is consistent.

### SketchUp says "no geometry"

The OBJ is valid but contains only points or lines — no faces. The source IFC did not export with solid geometry. Re-export from Revit with *Export solids* enabled.

### Wrong scale

Default OBJ units are meters; SketchUp may import as inches. In the Import dialog, set units to Meters and the scale will be correct.


## 10. Credits

Part of the PMM Tools suite by Trilogy Design Intelligence, a service of Trilogy Partners.

- **Design and requirements** — Trilogy Design Intelligence
- **Implementation** — Claude (Anthropic)
- **Questions or issues** — christianah@trilogybuilds.com

Follows the PMM Attribute Schema v1.0.

*Trilogy Partners. Boots on the Ground, Eyes on the Sky.*


---

**PMM Converter User Guide · v1.0**  
*Trilogy Partners. Boots on the Ground, Eyes on the Sky.*
