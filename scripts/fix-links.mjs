import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');

  // Top Nav Items
  content = content.replace(/href="#"([^>]*>Dashboard)/g, 'href="/"$1');
  content = content.replace(/href="#"([^>]*>Exercises)/g, 'href="/exercises"$1');
  content = content.replace(/href="#"([^>]*>Insights)/g, 'href="/insights"$1');
  
  // Specific Sleep Nav
  content = content.replace(/href="#"([^>]*>Home)/g, 'href="/"$1');
  content = content.replace(/href="#"([^>]*>Sleep)/g, 'href="/sleep"$1');
  content = content.replace(/href="#"([^>]*>Sanctuary)/g, 'href="/"$1');

  // Side Nav Items (with span inside)
  content = content.replace(/href="#"([\s\S]*?<span>Home<\/span>)/g, 'href="/"$1');
  content = content.replace(/href="#"([\s\S]*?<span>Companion<\/span>)/g, 'href="/companion"$1');
  content = content.replace(/href="#"([\s\S]*?<span>Library<\/span>)/g, 'href="/exercises"$1');
  content = content.replace(/href="#"([\s\S]*?<span>Stats<\/span>)/g, 'href="/insights"$1');
  
  fs.writeFileSync(filePath, content);
}

const docs = [
  'app/page.tsx',
  'app/login/page.tsx',
  'app/companion/page.tsx',
  'app/insights/page.tsx',
  'app/exercises/page.tsx',
  'app/mood/page.tsx',
  'app/sleep/page.tsx',
  'app/logout/page.tsx',
  'app/forgot-password/page.tsx'
];

docs.forEach(doc => fixFile(path.join(process.cwd(), doc)));
console.log('Fixed links in all files!');
