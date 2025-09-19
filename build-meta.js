// build-meta.js
// Combineert alle meta.json bestanden uit /data/meta/**/meta.json
// en schrijft 1 bestand: /data/all-meta.json

const fs = require("fs");
const path = require("path");

const metaDir = path.join(process.cwd(), "data", "meta");
const outFile = path.join(process.cwd(), "data", "all-meta.json");

function collectMeta(dir) {
    const items = [];

    if (!fs.existsSync(dir)) {
        console.error("❌ Map data/meta bestaat niet.");
        return items;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const metaPath = path.join(dir, entry.name, "meta.json");
            if (fs.existsSync(metaPath)) {
                try {
                    const raw = fs.readFileSync(metaPath, "utf8");
                    const data = JSON.parse(raw);
                    items.push(data);
                } catch (err) {
                    console.error("⚠️ Fout in JSON:", metaPath, err);
                }
            }
        }
    }

    return items;
}

function build() {
    const allItems = collectMeta(metaDir);

    fs.writeFileSync(outFile, JSON.stringify(allItems, null, 2), "utf8");
    console.log(`✅ ${allItems.length} items samengevoegd naar ${outFile}`);
}

build();
