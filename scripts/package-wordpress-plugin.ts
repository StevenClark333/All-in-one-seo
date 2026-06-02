import { deflateRawSync } from "node:zlib";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const pluginSlug = "all-in-one-seo";
const pluginRoot = path.join(
  process.cwd(),
  "integrations",
  "wordpress",
  pluginSlug,
);
const outputDir = path.join(process.cwd(), "public", "downloads");
const outputPath = path.join(outputDir, "all-in-one-seo-wordpress.zip");

type ZipEntry = {
  compressed: Buffer;
  crc32: number;
  localHeaderOffset: number;
  name: string;
  uncompressedSize: number;
};

const crcTable = buildCrcTable();

function main() {
  const files = listFiles(pluginRoot);
  const chunks: Buffer[] = [];
  const entries: ZipEntry[] = [];
  let offset = 0;

  for (const filePath of files) {
    const contents = readFileSync(filePath);
    const compressed = deflateRawSync(contents, { level: 9 });
    const crc32 = calculateCrc32(contents);
    const name = toZipPath(path.relative(pluginRoot, filePath));
    const zipName = `${pluginSlug}/${name}`;
    const localHeader = buildLocalFileHeader({
      compressedSize: compressed.length,
      crc32,
      name: zipName,
      uncompressedSize: contents.length,
    });

    chunks.push(localHeader, compressed);
    entries.push({
      compressed,
      crc32,
      localHeaderOffset: offset,
      name: zipName,
      uncompressedSize: contents.length,
    });
    offset += localHeader.length + compressed.length;
  }

  const centralDirectoryOffset = offset;
  const centralDirectory = entries.map(buildCentralDirectoryHeader);
  const centralDirectorySize = centralDirectory.reduce(
    (total, chunk) => total + chunk.length,
    0,
  );
  const endRecord = buildEndOfCentralDirectory({
    centralDirectoryOffset,
    centralDirectorySize,
    entryCount: entries.length,
  });

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    outputPath,
    Buffer.concat([...chunks, ...centralDirectory, endRecord]),
  );

  console.log(
    `Packaged ${entries.length} files to ${path.relative(process.cwd(), outputPath)}`,
  );
}

function listFiles(root: string) {
  const files: string[] = [];

  for (const item of readdirSync(root)) {
    if (item.startsWith(".")) {
      continue;
    }

    const itemPath = path.join(root, item);
    const stats = statSync(itemPath);

    if (stats.isDirectory()) {
      files.push(...listFiles(itemPath));
      continue;
    }

    if (stats.isFile()) {
      files.push(itemPath);
    }
  }

  return files.sort();
}

function toZipPath(value: string) {
  return value.split(path.sep).join("/");
}

function buildLocalFileHeader(input: {
  compressedSize: number;
  crc32: number;
  name: string;
  uncompressedSize: number;
}) {
  const name = Buffer.from(input.name, "utf8");
  const header = Buffer.alloc(30 + name.length);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(input.crc32, 14);
  header.writeUInt32LE(input.compressedSize, 18);
  header.writeUInt32LE(input.uncompressedSize, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  name.copy(header, 30);

  return header;
}

function buildCentralDirectoryHeader(entry: ZipEntry) {
  const name = Buffer.from(entry.name, "utf8");
  const header = Buffer.alloc(46 + name.length);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(8, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(entry.crc32, 16);
  header.writeUInt32LE(entry.compressed.length, 20);
  header.writeUInt32LE(entry.uncompressedSize, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.localHeaderOffset, 42);
  name.copy(header, 46);

  return header;
}

function buildEndOfCentralDirectory(input: {
  centralDirectoryOffset: number;
  centralDirectorySize: number;
  entryCount: number;
}) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(input.entryCount, 8);
  header.writeUInt16LE(input.entryCount, 10);
  header.writeUInt32LE(input.centralDirectorySize, 12);
  header.writeUInt32LE(input.centralDirectoryOffset, 16);
  header.writeUInt16LE(0, 20);

  return header;
}

function calculateCrc32(buffer: Buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function buildCrcTable() {
  const table = new Array<number>(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
}

main();
