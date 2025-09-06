import path from 'path';
import { promises as fs } from 'fs';
import ejs from 'ejs';

// In CommonJS, __dirname is available globally
// const __dirname = path.dirname(__filename);

export async function generateProject(projectName: string) {
  const targetDir = path.resolve(process.cwd(), projectName);
  await scaffoldProject(targetDir, projectName);
  console.log(`\n✅ Project '${projectName}' created at ${targetDir}`);
  console.log('\n📋 Next steps:');
  console.log(`   cd ${projectName}`);
  console.log('   npm install');
  console.log('   npm run dev');
}

async function scaffoldProject(targetDir: string, projectName: string) {
  // 1. Define the template root
  const templateRoot = path.join(__dirname, '../../templates');

  // 2. Recursively copy structure
  await copyTemplate(templateRoot, targetDir, { projectName });
}

async function copyTemplate(src: string, dest: string, data: any) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name.replace('project-name', data.projectName));
    if (entry.isDirectory()) {
      await copyTemplate(srcPath, destPath, data);
    } else {
      if (entry.name.endsWith('.ejs')) {
        // Render EJS template
        const template = await fs.readFile(srcPath, 'utf8');
        const rendered = ejs.render(template, data);
        await fs.writeFile(destPath.replace(/\.ejs$/, ''), rendered);
      } else {
        // Copy as-is
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}
