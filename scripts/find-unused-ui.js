import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, "../src");
const uiDir = path.join(srcDir, "components/ui");

// Get all UI component files
const uiFiles = fs
  .readdirSync(uiDir)
  .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"));

// Read all source files to check for imports
const getAllSourceFiles = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && item !== "node_modules" && item !== ".git") {
      files.push(...getAllSourceFiles(fullPath));
    } else if (item.endsWith(".tsx") || item.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
};

const sourceFiles = getAllSourceFiles(srcDir);
const unusedComponents = [];

// Check each UI component
for (const uiFile of uiFiles) {
  const componentName = path.basename(uiFile, path.extname(uiFile));
  let isUsed = false;

  // Skip use-toast.ts as it's imported differently
  if (componentName === "use-toast") continue;

  for (const sourceFile of sourceFiles) {
    // Skip the component file itself
    if (sourceFile.includes(uiFile)) continue;

    try {
      const content = fs.readFileSync(sourceFile, "utf8");

      // Check for imports from this component
      const importPattern = new RegExp(
        `from\\s+["']@/components/ui/${componentName}["']|from\\s+["']\\./ui/${componentName}["']`,
        "g"
      );

      if (importPattern.test(content)) {
        isUsed = true;
        break;
      }
    } catch (error) {
      // Skip if can't read file
    }
  }

  if (!isUsed) {
    unusedComponents.push(uiFile);
  }
}

console.log("🧹 Unused UI Components:");
if (unusedComponents.length === 0) {
  console.log("✅ All UI components are being used!");
} else {
  unusedComponents.forEach((component) => {
    console.log(`❌ ${component}`);
  });
}

console.log(
  `\n📊 Summary: ${unusedComponents.length} unused out of ${uiFiles.length} total UI components`
);
