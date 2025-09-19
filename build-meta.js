// build-meta.js
import fs from "fs";
import path from "path";

// Pad naar de folder waar CMS de meta.json bestanden zet
const metaDir = path.join(process.cwd(), "data/meta");

// Doelbestand: het samengevoegde JSON-bestand
const outputFile = path.join(process.cwd(), "data/all-meta.json");

function collectMetaFiles(dir) {
    const items = [];

    // Submappen uitlezen (elke submap = één item)
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        if (entry.isDirectory()) {
            const metaPath = path.join(dir, entry.name, "meta.json");
            if (fs.existsSync(metaPath)) {
                const raw = fs.readFileSync(metaPath, "utf8");
                try {
                    const data = JSON.parse(raw);
                    items.push(data);
                } catch (err) {
                    console.error("Fout in JSON:", metaPath, err);
                }
            }
        }
    });

    return items;
}

function build() {
    const allItems = collectMetaFiles(metaDir);

    // Alles in één array opslaan
    fs.writeFileSync(outputFile, JSON.stringify(allItems, null, 2), "utf8");
    console.log(`✅ ${allItems.length} items samengevoegd naar ${outputFile}`);
}

build();
