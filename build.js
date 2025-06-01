import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get version increment type from command line
const incrementType = process.argv[2] || 'patch'; // major, minor, or patch

// Read current manifest
const manifestPath = path.join(__dirname, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Parse current version safely, fallback to [0,0,0] if missing or malformed
let currentVersionArr = [0, 0, 0];
if (typeof manifest.version === 'string') {
  const parts = manifest.version.split('.').map(n => Number.parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    currentVersionArr[i] = Number.isNaN(parts[i]) ? 0 : parts[i];
  }
}
const oldVersion = manifest.version || '0.0.0';

// Increment version based on type
switch (incrementType) {
  case 'major':
    currentVersionArr[0]++;
    currentVersionArr[1] = 0;
    currentVersionArr[2] = 0;
    break;
  case 'minor':
    currentVersionArr[1]++;
    currentVersionArr[2] = 0;
    break;
  case 'patch':
  default:
    currentVersionArr[2]++;
    break;
}

const newVersion = currentVersionArr.join('.');

// Update manifest with new version
manifest.version = newVersion;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `✅ Version updated: ${oldVersion} -> ${newVersion} (${incrementType})`
);

// Create a build directory
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Files to include in the build
const filesToCopy = [
  'manifest.json',
  'popup.html',
  'popup.js',
  'popup.css',
  'popup-init.js',
  'README.md',
  'LICENSE'
];

// Directories to copy
const directoriesToCopy = ['icons'];

// Copy files
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(buildDir, file);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`📄 Copied: ${file}`);
  } else {
    console.warn(`⚠️  File not found: ${file}`);
  }
});

// Copy directories
directoriesToCopy.forEach(dir => {
  const srcPath = path.join(__dirname, dir);
  const destPath = path.join(buildDir, dir);

  if (fs.existsSync(srcPath)) {
    copyDirectory(srcPath, destPath);
    console.log(`📁 Copied directory: ${dir}`);
  }
});

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Create a zip file (optional - requires 'zip' command)
try {
  // Ensure dist directory exists
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }
  const zipName = `tab-search-v${newVersion}.zip`;
  const zipPath = path.join(distDir, zipName);
  execSync(`cd build && zip -r "${zipPath}" ./*`);
  console.log(`\n📦 Created build package: dist/${zipName}`);
} catch (error) {
  console.warn(`⚠️  Failed to create zip package: ${error.message}`);
  console.log(
    '\n💡 Tip: Install zip command to create packaged builds automatically'
  );
}

console.log(`\n✨ Build completed successfully! Version: ${newVersion}`);
console.log(`📁 Build output: ${buildDir}`);

// Create a version log
const versionLogPath = path.join(__dirname, 'version-log.txt');
const timestamp = new Date().toISOString();
const logEntry = `${timestamp}: v${newVersion} - Build completed\n`;
fs.appendFileSync(versionLogPath, logEntry);
