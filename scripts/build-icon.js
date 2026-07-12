const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

const INPUT = "D:\\Coding\\Ongoing\\E-Shown Movie Max\\resources\\application icon\\app icon.png";
const OUTPUT = "D:\\Coding\\Ongoing\\E-Shown Movie Max\\scripts\\desktop-shell\\assets\\icon.ico";

function parseIco(buf) {
  if (buf.readUInt16LE(0) !== 0) throw new Error("Not ICO");
  if (buf.readUInt16LE(2) !== 1) throw new Error("Not ICO");
  const count = buf.readUInt16LE(4);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const off = 6 + i * 16;
    const w = buf.readUInt8(off) || 256;
    const h = buf.readUInt8(off + 1) || 256;
    entries.push({ w, h, size: buf.readUInt32LE(off + 8), dataOff: buf.readUInt32LE(off + 12) });
  }
  return { count, entries };
}

function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let dataOffset = 6 + images.length * 16;
  const dataChunks = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.w >= 256 ? 0 : img.w, 0);
    entry.writeUInt8(img.h >= 256 ? 0 : img.h, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(0, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.pngBuf.length, 8);
    entry.writeUInt32LE(dataOffset, 12);
    entries.push(entry);
    dataChunks.push(img.pngBuf);
    dataOffset += img.pngBuf.length;
  }
  return Buffer.concat([header, ...entries, ...dataChunks]);
}

// Make near-white pixels transparent (the background), keep logo colors
async function removeBackground(pngBuf) {
  const { data, info } = await sharp(pngBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r > 230 && g > 230 && b > 230) {
      pixels[i + 3] = 0;
    }
  }

  return await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

// Remove near-dark/black background by finding the most common color
async function removeBackgroundDark(pngBuf) {
  const { data, info } = await sharp(pngBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  const w = info.width, h = info.height;

  // Sparse sample to find the most common (background) color
  const histo = new Map();
  const step = Math.max(1, Math.floor(Math.min(w, h) / 10));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      const key = `${pixels[idx]},${pixels[idx + 1]},${pixels[idx + 2]}`;
      histo.set(key, (histo.get(key) || 0) + 1);
    }
  }
  let bestKey = null, bestCount = 0;
  for (const [key, count] of histo) {
    if (count > bestCount) { bestCount = count; bestKey = key; }
  }
  const [bgR, bgG, bgB] = bestKey.split(",").map(Number);
  console.log(`Most common color: rgb(${bgR},${bgG},${bgB}) (${bestCount} samples)`);

  // Remove pixels close to the background color
  const threshold = 30;
  for (let i = 0; i < pixels.length; i += 4) {
    const dr = pixels[i] - bgR;
    const dg = pixels[i + 1] - bgG;
    const db = pixels[i + 2] - bgB;
    if (Math.abs(dr) < threshold && Math.abs(dg) < threshold && Math.abs(db) < threshold) {
      pixels[i + 3] = 0;
    }
  }

  return await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

async function buildSizedIcon(logoBuf, targetSize) {
  const isSmall = targetSize <= 48;
  const fillRatio = isSmall ? 0.92 : 0.88;
  const contentSize = Math.round(targetSize * fillRatio);
  const offset = Math.round((targetSize - contentSize) / 2);
  const radius = Math.round(targetSize * (isSmall ? 0.18 : 0.22));

  const scaled = await sharp(logoBuf)
    .resize(contentSize, contentSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const maskSvg = `<svg width="${contentSize}" height="${contentSize}">
    <rect x="0" y="0" width="${contentSize}" height="${contentSize}" rx="${radius}" ry="${radius}" fill="white"/>
  </svg>`;
  const mask = await sharp(Buffer.from(maskSvg)).resize(contentSize, contentSize).png().toBuffer();

  const rounded = await sharp(scaled)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const final = await sharp({
    create: { width: targetSize, height: targetSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([{ input: rounded, left: offset, top: offset }])
    .png()
    .toBuffer();

  return final;
}

async function main() {
  let buf;

  if (INPUT.toLowerCase().endsWith(".png")) {
    buf = fs.readFileSync(INPUT);
    console.log(`Source PNG: ${INPUT}`);
  } else {
    console.log("Source ICO — extracting largest frame");
    const raw = fs.readFileSync(INPUT);
    const ico = parseIco(raw);
    let best = ico.entries[0];
    for (const e of ico.entries) {
      if (e.w * e.h > best.w * best.h) best = e;
    }
    console.log(`Largest: ${best.w}x${best.h} (${best.size} bytes)`);
    buf = raw.slice(best.dataOff, best.dataOff + best.size);
  }

  const meta = await sharp(buf).metadata();
  console.log(`Input: ${meta.width}x${meta.height}, alpha=${meta.hasAlpha}`);

  const hasAlpha = meta.hasAlpha || meta.channels === 4;

  let transparent;
  if (hasAlpha) {
    transparent = await removeBackground(buf);
  } else {
    transparent = await removeBackgroundDark(buf);
  }

  // Step 2: trim transparent edges
  console.log("Trimming...");
  const trimmed = await sharp(transparent).trim({ threshold: 10 }).toBuffer();
  const trimMeta = await sharp(trimmed).metadata();
  console.log(`Trimmed to ${trimMeta.width}x${trimMeta.height}`);

  // Enhance colors: boost contrast + saturation for visibility at small sizes
  console.log("Enhancing colors...");
  const enhanced = await sharp(trimmed)
    .modulate({ brightness: 1.08, saturation: 1.4 })
    .linear(1.15, -0.04)
    .png()
    .toBuffer();

  const sizes = [16, 20, 24, 32, 40, 48, 64, 128, 256];
  const images = [];

  for (const s of sizes) {
    const img = await buildSizedIcon(enhanced, s);
    images.push({ w: s, h: s, pngBuf: img });
    console.log(`  ${s}x${s}  (${img.length} bytes)`);
  }

  const newIco = createIco(images);
  fs.writeFileSync(OUTPUT, newIco);
  console.log(`\nWrote ${OUTPUT} (${newIco.length} bytes, ${sizes.length} sizes)`);

  const installed = "D:\\temp\\CHITHRA - CINEMA\\icon.ico";
  if (fs.existsSync(path.dirname(installed))) {
    fs.copyFileSync(OUTPUT, installed);
    console.log(`Copied to ${installed}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
