// build-meta.js
// Combineert alle losse .json bestanden uit /data/*.json
// en schrijft 1 bestand: /data/all-meta.json

const fs = require("fs");
const path = require("path");

const dataDir = path.join(process.cwd(), "data");
const outFile = path.join(dataDir, "all-meta.json");

function collectMeta(dir) {
    const items = [];

    if (!fs.existsSync(dir)) {
        console.error("❌ Map data bestaat niet.");
        return items;
    }

    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith(".json") && file !== "all-meta.json") {
            try {
                const raw = fs.readFileSync(path.join(dir, file), "utf8");
                const data = JSON.parse(raw);
                items.push(data);
            } catch (err) {
                console.error("⚠️ Fout in JSON:", file, err);
            }
        }
    }

    return items;
}

function build() {
    const allItems = collectMeta(dataDir);
    fs.writeFileSync(outFile, JSON.stringify(allItems, null, 2), "utf8");
    console.log(`✅ ${allItems.length} items samengevoegd naar ${outFile}`);
}

build();
