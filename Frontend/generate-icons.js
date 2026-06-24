#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Minimal valid PNG files (transparent 1x1 pixel, then resized dimensions in header)
const iconSizes = [
  { name: '32x32.png', width: 32, height: 32 },
  { name: '128x128.png', width: 128, height: 128 },
  { name: '128x128@2x.png', width: 256, height: 256 }
];

const iconsDir = path.join(__dirname, 'apps/desktop/src-tauri/icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Function to create a minimal valid PNG with given dimensions
function createMinimalPNG(width, height) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (13 bytes data)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Calculate CRC for IHDR
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c >>> 0;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // IHDR chunk: type(4) + data(13) + crc(4)
  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(Buffer.concat([ihdrType, ihdr])), 0);

  const ihdrChunk = Buffer.concat([
    Buffer.alloc(4, 0), // length
    ihdrType,
    ihdr,
    ihdrCrc
  ]);
  ihdrChunk.writeUInt32BE(13, 0);

  // Minimal IDAT chunk (empty compressed data)
  const idatType = Buffer.from('IDAT');
  const idatData = Buffer.from([0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xe3, 0x21, 0xbc, 0x1b]);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([idatType, idatData])), 0);

  const idatChunk = Buffer.concat([
    Buffer.alloc(4, 0),
    idatType,
    idatData,
    idatCrc
  ]);
  idatChunk.writeUInt32BE(idatData.length, 0);

  // IEND chunk
  const iendType = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendType), 0);

  const iendChunk = Buffer.concat([
    Buffer.alloc(4, 0),
    iendType,
    iendCrc
  ]);

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Create PNG files
iconSizes.forEach(({ name, width, height }) => {
  const pngData = createMinimalPNG(width, height);
  const filePath = path.join(iconsDir, name);
  fs.writeFileSync(filePath, pngData);
  console.log(`Created: ${name} (${width}x${height})`);
});

console.log(`\nAll icons created successfully in: ${iconsDir}`);
