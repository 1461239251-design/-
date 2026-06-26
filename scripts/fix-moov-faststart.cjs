/**
 * Fix MP4 MOOV atom position — move it from end to beginning (faststart).
 * When MOOV is at the end of the file, browsers must download the entire
 * video before playback can start. Moving it to the beginning (right after
 * ftyp) enables progressive download playback.
 *
 * Usage: node scripts/fix-moov-faststart.js <input.mp4> [output.mp4]
 * If output is omitted, overwrites the input file.
 */

const fs = require('fs');
const path = require('path');

function readUInt32BE(buf, offset) {
  return buf.readUInt32BE(offset);
}

function writeUInt32BE(buf, offset, value) {
  buf.writeUInt32BE(value, offset);
}

/**
 * Find a top-level atom by type, returns { offset, size, type } or null.
 * Handles 64-bit extended size (type 'uuid' or size=1 followed by 8-byte size).
 */
function findAtom(buffer, type, startOffset = 0) {
  let offset = startOffset;
  while (offset < buffer.length - 8) {
    const size = readUInt32BE(buffer, offset);
    const atomType = buffer.subarray(offset + 4, offset + 8).toString('ascii');

    let actualSize;
    if (size === 1) {
      // 64-bit extended size: next 8 bytes are the actual size
      // Read as BigInt, but for our purposes just read high/low
      const high = readUInt32BE(buffer, offset + 8);
      const low = readUInt32BE(buffer, offset + 12);
      actualSize = Number((BigInt(high) << 32n) | BigInt(low));
    } else if (size === 0) {
      // Size extends to end of file
      actualSize = buffer.length - offset;
    } else {
      actualSize = size;
    }

    if (atomType === type) {
      return { offset, size: actualSize, type: atomType };
    }

    offset += actualSize;
  }
  return null;
}

/**
 * Fix STCO (chunk offset) atoms inside MOOV.
 * Each stco contains absolute byte offsets into mdat. Since we're inserting
 * MOOV before MDAT, each offset must be increased by the MOOV atom size.
 */
function fixStcoOffsets(buf, moovSize, startOffset, endOffset) {
  // Recursively walk through atoms, fix stco/co64 chunk offsets
  let offset = startOffset;

  while (offset < endOffset - 8) {
    const atomSize = readUInt32BE(buf, offset);
    const atomType = buf.subarray(offset + 4, offset + 8).toString('ascii');

    let actualAtomSize;
    if (atomSize === 1) {
      const high = readUInt32BE(buf, offset + 8);
      const low = readUInt32BE(buf, offset + 12);
      actualAtomSize = Number((BigInt(high) << 32n) | BigInt(low));
    } else {
      actualAtomSize = atomSize;
    }

    if (actualAtomSize <= 0 || offset + actualAtomSize > endOffset) break;

    const headerSize = atomSize === 1 ? 16 : 8;

    if (atomType === 'stco') {
      const entryCount = readUInt32BE(buf, offset + 12);
      let entryOffset = offset + 16;
      console.log(`  Fixing stco: ${entryCount} chunk offsets`);
      for (let i = 0; i < entryCount; i++) {
        const chunkOffset = readUInt32BE(buf, entryOffset);
        writeUInt32BE(buf, entryOffset, chunkOffset + moovSize);
        entryOffset += 4;
      }
    } else if (atomType === 'co64') {
      const entryCount = readUInt32BE(buf, offset + 12);
      let entryOffset = offset + 16;
      console.log(`  Fixing co64: ${entryCount} chunk offsets`);
      for (let i = 0; i < entryCount; i++) {
        const chunkOffset = Number(
          (BigInt(readUInt32BE(buf, entryOffset)) << 32n) |
          BigInt(readUInt32BE(buf, entryOffset + 4))
        );
        const newOffset = chunkOffset + BigInt(moovSize);
        writeUInt32BE(buf, entryOffset, Number(newOffset >> 32n));
        writeUInt32BE(buf, entryOffset + 4, Number(newOffset & 0xFFFFFFFFn));
        entryOffset += 8;
      }
    } else if (['moov', 'trak', 'mdia', 'minf', 'stbl', 'dinf', 'edts', 'udta', 'mvex', 'moof', 'tref']
      .includes(atomType) && actualAtomSize > headerSize) {
      // Recurse into container atoms
      fixStcoOffsets(buf, moovSize, offset + headerSize, offset + actualAtomSize);
    }

    offset += actualAtomSize;
  }
}

function fixMoovFaststart(inputPath, outputPath) {
  console.log(`\n🔧 Fixing MOOV atom for: ${path.basename(inputPath)}`);
  const buffer = fs.readFileSync(inputPath);
  console.log(`  File size: ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);

  // Find top-level atoms
  const ftyp = findAtom(buffer, 'ftyp');
  const moov = findAtom(buffer, 'moov');
  const mdat = findAtom(buffer, 'mdat');

  if (!moov) {
    console.error('❌ No MOOV atom found');
    return false;
  }
  if (!mdat) {
    console.error('❌ No MDAT atom found');
    return false;
  }

  console.log(`  ftyp: offset=${ftyp?.offset}, size=${ftyp?.size}`);
  console.log(`  mdat: offset=${mdat.offset}, size=${(mdat.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  moov: offset=${moov.offset}, size=${(moov.size / 1024 / 1024).toFixed(2)} MB`);

  if (moov.offset < mdat.offset) {
    console.log('✅ MOOV is already before MDAT — no fix needed');
    return true;
  }

  // Extract MOOV data
  const moovData = buffer.subarray(moov.offset, moov.offset + moov.size);

  // Fix STCO/CO64 offsets inside MOOV
  // Start from offset 8 (after the MOOV atom header) and scan child atoms recursively
  console.log('  Adjusting chunk offsets...');
  fixStcoOffsets(moovData, moov.size, 8, moovData.length);

  // Build new file: ftyp + moov + mdat + any remaining atoms after moov
  const parts = [];

  // Part 1: Everything before mdat (ftyp + possible free/skip atoms)
  // We take from start to mdat.offset
  parts.push(buffer.subarray(0, mdat.offset));

  // Part 2: MOOV data (now goes between ftyp header area and mdat)
  parts.push(moovData);

  // Part 3: MDAT data
  parts.push(buffer.subarray(mdat.offset, mdat.offset + mdat.size));

  // Part 4: Any remaining atoms between mdat end and moov start
  // (typically there's nothing, but handle the case)
  const mdatEnd = mdat.offset + mdat.size;
  if (moov.offset > mdatEnd) {
    parts.push(buffer.subarray(mdatEnd, moov.offset));
  }

  // Part 5: Any atoms after moov
  const moovEnd = moov.offset + moov.size;
  if (moovEnd < buffer.length) {
    parts.push(buffer.subarray(moovEnd));
  }

  const output = Buffer.concat(parts);
  console.log(`  New file size: ${(output.length / 1024 / 1024).toFixed(1)} MB`);

  fs.writeFileSync(outputPath, output);
  console.log(`✅ Written to: ${outputPath}`);
  return true;
}

// --- Main ---
const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath;

if (!inputPath) {
  console.log('Usage: node scripts/fix-moov-faststart.js <input.mp4> [output.mp4]');
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

try {
  const success = fixMoovFaststart(inputPath, outputPath);
  process.exit(success ? 0 : 1);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
