const fs = require('fs').promises;
const path = require('path');

const EXCLUDED_DIRECTORIES = ['node_modules', '.next', '.vercel', '.bolt', '.vscode'];
const EXCLUDED_FILES = ['package-lock.json', '.gitignore', '.eslint.json', '.env.local'];

async function collectFiles(rootDir) {
  const fileContents = [];
  
  async function traverseDirectory(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        if (EXCLUDED_DIRECTORIES.includes(entry.name)) {
          continue;
        }
        await traverseDirectory(fullPath);
      } else if (entry.isFile()) {
        if (EXCLUDED_FILES.includes(entry.name)) {
          continue;
        }
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.md', '.astro'].includes(ext)) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const relativePath = path.relative(rootDir, fullPath);
            fileContents.push({ path: relativePath, content: content });
          } catch (error) {
            console.error(`No se pudo leer el archivo ${fullPath}: ${error.message}`);
          }
        }
      }
    }
  }

  await traverseDirectory(rootDir);
  return fileContents;
}

async function saveToFile(fileContents, outputFile) {
  let output = "Contexto del proyecto Astro:\n\n";
  for (const file of fileContents) {
    output += `Archivo: ${file.path}\n`;
    output += "Contenido:\n```\n";
    output += file.content;
    output += "\n```\n\n";
  }
  await fs.writeFile(outputFile, output, 'utf-8');
}

async function main() {
  
  const outputFile = 'context/app_context.txt';

  try {
    const fileContents = await collectFiles('./');
    await saveToFile(fileContents, outputFile);
    console.log(`Se han recopilado ${fileContents.length} archivos en ${outputFile}`);
  } catch (error) {
    console.error('Ocurrió un error:', error);
  }
}

main();