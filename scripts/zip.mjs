// Minimal deterministic ZIP writer for this small static data bundle.
// UTF-8 filenames, DEFLATE, CRC-32; intentionally rejects ZIP64-sized inputs.
import { deflateRawSync } from 'node:zlib';
import assert from 'node:assert/strict';
const table = Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  return value >>> 0;
});
function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = (value >>> 8) ^ table[(value ^ byte) & 0xff];
  return (value ^ 0xffffffff) >>> 0;
}
/** entries: [{name: string, bytes: Buffer}], snapshotDate: YYYY-MM-DD. */
export function createZip(entries, snapshotDate) {
  assert(entries.length < 65535, 'ZIP64 entry count is unsupported');
  const [year, month, day] = snapshotDate.split('-').map(Number);
  assert(year >= 1980 && year <= 2107, 'Date outside ZIP range');
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  const local = []; const central = []; let offset = 0;
  const names = new Set();
  for (const entry of entries) {
    assert(!names.has(entry.name) && !entry.name.startsWith('/') && !entry.name.split('/').includes('..'), 'Unsafe or duplicate ZIP entry');
    names.add(entry.name);
    const name = Buffer.from(entry.name, 'utf8');
    const bytes = Buffer.from(entry.bytes); const compressed = deflateRawSync(bytes, { level: 9 });
    assert(name.length < 65536 && bytes.length < 0xffffffff && compressed.length < 0xffffffff);
    const crc = crc32(bytes);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6); header.writeUInt16LE(8, 8);
    header.writeUInt16LE(dosDate, 12); header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(bytes.length, 22);
    header.writeUInt16LE(name.length, 26);
    local.push(header, name, compressed);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(0x800, 8); directory.writeUInt16LE(8, 10);
    directory.writeUInt16LE(dosDate, 14); directory.writeUInt32LE(crc, 16);
    directory.writeUInt32LE(compressed.length, 20); directory.writeUInt32LE(bytes.length, 24);
    directory.writeUInt16LE(name.length, 28); directory.writeUInt32LE(offset, 42);
    central.push(directory, name); offset += header.length + name.length + compressed.length;
    assert(offset < 0xffffffff, 'ZIP64 archive size is unsupported');
  }
  const centralSize = central.reduce((size, item) => size + item.length, 0);
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}
