const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

const INPUT = "D:\\Coding\\Ongoing\\E-Shown Movie Max\\scripts\\desktop-shell\\assets\\icon.ico";
const OUTPUT = INPUT;
const BACKUP = INPUT.replace(".ico", ".bak.ico");

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
    // If pixel is nearly white (background), make it transparent
    if (r > 230 && g > 230 && b > 230) {
      pixels[i + 3] = 0; // set alpha to 0
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
  if (fs.existsSync(BACKUP)) {
    buf = fs.readFileSync(BACKUP);
    console.log("Using backup (original source)");
  } else {
    buf = fs.readFileSync(INPUT);
  }

  const ico = parseIco(buf);
  let best = ico.entries[0];
  for (const e of ico.entries) {
    if (e.w * e.h > best.w * best.h) best = e;
  }
  console.log(`Largest: ${best.w}x${best.h} (${best.size} bytes)`);

  const srcPng = buf.slice(best.dataOff, best.dataOff + best.size);

  // Step 1: remove near-white background
  console.log("Stripping background...");
  const transparent = await removeBackground(srcPng);

  // Step 2: trim transparent edges
  console.log("Trimming...");
  const trimmed = await sharp(transparent).trim({ threshold: 10 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  console.log(`Trimmed to ${meta.width}x${meta.height}`);

  // Enhance colors: boost contrast + saturation for visibility at small sizes
  console.log("Enhancing colors...");
  const enhanced = await sharp(trimmed)
    .modulate({ brightness: 1.08, saturation: 1.4 })
    .linear(1.15, -0.04)
    .png()
    .toBuffer();

  if (!fs.existsSync(BACKUP)) {
    fs.copyFileSync(INPUT, BACKUP);
    console.log(`Backed up original to ${path.basename(BACKUP)}`);
  }

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
