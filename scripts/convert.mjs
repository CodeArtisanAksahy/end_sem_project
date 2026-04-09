import fs from 'fs';
import path from 'path';

const screens = [
  {
    name: "Dashboard",
    path: "page.tsx", // Root
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzk5NmJjODhkZmIwZjQ3ODdhYTVhNTFlN2Y4OTA2MTZiEgsSBxCDp9SInwUYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNTI0MTY1MDYzNjgzNDMzOQ&filename=&opi=89354086"
  },
  {
    name: "Login",
    path: "login/page.tsx",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2ViZGMyOTgwNjQyNjRlNmM4ZTAxMWM3ZWRiMjgyYjg2EgsSBxCDp9SInwUYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNTI0MTY1MDYzNjgzNDMzOQ&filename=&opi=89354086"
  },
  {
    name: "AI Companion",
    path: "companion/page.tsx",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzVkMzQ4MWZjNDVlODQ5OGE4ZGQ4NmE1ODgzNzhiYjA5EgsSBxCDp9SInwUYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNTI0MTY1MDYzNjgzNDMzOQ&filename=&opi=89354086"
  },
  {
    name: "Insights & Progress",
    path: "insights/page.tsx",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzkzZDBhYzBhYTNmYTQ0ZGU4NDllYTc0M2Y3ZGIyMjAwEgsSBxCDp9SInwUYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNTI0MTY1MDYzNjgzNDMzOQ&filename=&opi=89354086"
  },
  {
    name: "Exercise Library",
    path: "exercises/page.tsx",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzcyZTc3YTVjMTdhNDRmN2RiYzQxNzk0YzU4ZDYzNjU4EgsSBxCDp9SInwUYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNTI0MTY1MDYzNjgzNDMzOQ&filename=&opi=89354086"
  },
  {
    name: "Mood Analytics",
    path: "mood/page.tsx",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE3ZWJmZWM0NTkwNzQyZGZiZTNhMjUyNWJhMjJjMjczEgsSBxCDp9SInwUYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNTI0MTY1MDYzNjgzNDMzOQ&filename=&opi=89354086"
  },
  {
    name: "Sleep Tracker",
    path: "sleep/page.tsx",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2Y3MzkwMzEwYWZiMTQ0NTM5ODIxNTEwMmIyOGQ3MTdkEgsSBxCDp9SInwUYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNTI0MTY1MDYzNjgzNDMzOQ&filename=&opi=89354086"
  },
  {
    name: "Logout",
    path: "logout/page.tsx",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2UwYWQ2ODE2MzdmZTQ1Mjc4MzcwODk1MzhiYjdjYTU4EgsSBxCDp9SInwUYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNTI0MTY1MDYzNjgzNDMzOQ&filename=&opi=89354086"
  },
  {
    name: "Password Reset",
    path: "forgot-password/page.tsx",
    url: "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M1ZDNiODlhZWNlYTRjY2RhMTlhOGY0MWE3NmY4OTU3EgsSBxCDp9SInwUYAZIBJAoKcHJvamVjdF9pZBIWQhQxNTcxNTI0MTY1MDYzNjgzNDMzOQ&filename=&opi=89354086"
  }
];

function camelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

async function run() {
  for (const screen of screens) {
    console.log(`Downloading ${screen.name}...`);
    try {
      const resp = await fetch(screen.url);
      let html = await resp.text();

      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (!bodyMatch) {
         console.error(`Could not find body in ${screen.name}`);
         continue;
      }

      let content = bodyMatch[1];
      
      content = content.replace(/class=/g, 'className=');
      content = content.replace(/for=/g, 'htmlFor=');
      content = content.replace(/<!--(.*?)-->/gs, '{/* $1 */}');
      content = content.replace(/tabindex=/g, 'tabIndex=');
      content = content.replace(/srcset=/g, 'srcSet=');
      content = content.replace(/stroke-width=/g, 'strokeWidth=');
      content = content.replace(/stroke-linecap=/g, 'strokeLinecap=');
      content = content.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
      content = content.replace(/clip-path=/g, 'clipPath=');
      content = content.replace(/fill-rule=/g, 'fillRule=');
      content = content.replace(/clip-rule=/g, 'clipRule=');
      content = content.replace(/preserveaspectratio=/g, 'preserveAspectRatio=');
      content = content.replace(/viewbox=/g, 'viewBox=');
      content = content.replace(/gradientunits=/g, 'gradientUnits=');
      content = content.replace(/<lineargradient/gi, '<linearGradient');
      content = content.replace(/<\/lineargradient>/gi, '</linearGradient>');
      content = content.replace(/stop-color=/g, 'stopColor=');
      
      content = content.replace(/style="([^"]+)"/g, (match, p1) => {
          let styleObjStr = p1.split(';').filter((s) => s.trim().length > 0).map(s => {
              let parts = s.split(':');
              let key = parts.shift();
              let val = parts.join(':').trim();
              if (!key || !val) return '';
              key = camelCase(key.trim());
              val = val.replace(/`/g, "\\`");
              return `${key}: \`${val}\``;
          }).join(', ');
          return `style={{ ${styleObjStr} }}`;
      });

      const reactComponent = `
export default function ${screen.name.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return (
    <>
      ${content}
    </>
  );
}
      `.trim();

      const outPath = path.join(process.cwd(), 'app', screen.path);
      const outDir = path.dirname(outPath);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outPath, reactComponent);
      console.log(`Wrote ${outPath}`);
    } catch (e) {
      console.error('Error processing', screen.name, e);
    }
  }
}

run();
