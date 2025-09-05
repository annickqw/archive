// scripts/generate-archive.js
// Leest /images en schrijft data/archive.json
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(process.cwd(), 'images');
const OUT_DIR = path.join(process.cwd(), 'data');
const OUT_FILE = path.join(OUT_DIR, 'archive.json');

// optionele metadata (handig voor beschrijvingen)
// sleutel = bestandsnaam (zonder pad)
const META_PATH = path.join(process.cwd(), 'data', 'meta.json');
let meta = {};
if (fs.existsSync(META_PATH)) {
    meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
}

function slugify(str) {
    return String(str)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function parseFromFilename(filename) {
    // conventie (vrijblijvend):
    //  YYYY-MM-DD__tag1,tag2__Titel vrij.jpg
    // Voorbeeld: 2025-03-10__installation,texture__Cave Study.jpg
    const name = filename.replace(/\.[^.]+$/, '');
    const parts = name.split('__');
    let date = '';
    let tags = [];
    let title = name;

    if (parts.length >= 3) {
        date = parts[0];                    // "2025-03-10"
        tags = parts[1].split(',');         // ["installation","texture"]
        title = parts.slice(2).join(' — '); // "Cave Study"
    } else if (parts.length === 2) {
        //  titel + tags óf datum + titel
        if (/^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
            date = parts[0];
            title = parts[1];
        } else {
            title = parts[0];
            tags = parts[1].split(',');
        }
    } else {
        title = name;
    }
    return { date, tags, title };
}

function buildItem(file) {
    const filepath = path.join(IMAGES_DIR, file);
    const stat = fs.statSync(filepath);
    const mtime = stat.mtime; // fallback datum

    const base = path.basename(file);
    const parsed = parseFromFilename(base);
    const key = base; // meta lookup

    const metaEntry = meta[key] || {};
    return {
        title: metaEntry.title || parsed.title || slugify(base),
        date: metaEntry.date || parsed.date || mtime.toISOString().slice(0, 10),
        tags: (metaEntry.tags || parsed.tags || []).map(t => t.toLowerCase()),
        img: `images/${base}`,
        desc: metaEntry.desc || ''
    };
}

function run() {
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error('Geen images/ map gevonden.');
        process.exit(1);
    }
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    const files = fs.readdirSync(IMAGES_DIR)
        .filter(f => /\.(jpe?g|png|webp|gif|avif)$/i.test(f));

    const items = files
        .map(buildItem)
        // sorteer nieuwste eerst
        .sort((a, b) => (a.date < b.date ? 1 : -1));

    fs.writeFileSync(OUT_FILE, JSON.stringify(items, null, 2), 'utf8');
    console.log(`✔ archive.json gegenereerd met ${items.length} items`);
}

run();
