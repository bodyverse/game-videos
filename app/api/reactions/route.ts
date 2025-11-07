import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";

async function collectFiles(dir: string, base: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await collectFiles(fullPath, base)));
      } else if (entry.isFile()) {
        files.push(path.relative(base, fullPath));
      }
    })
  );

  return files;
}

export async function GET() {
  try {
    const reactionsRoot = path.join(process.cwd(), "public", "reactions");
    const files = await collectFiles(reactionsRoot, reactionsRoot);
    const sorted = files.sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ files: sorted.map((file) => `/reactions/${file.replace(/\\/g, "/")}`) });
  } catch (error) {
    return NextResponse.json({ error: "Unable to read reactions directory" }, { status: 500 });
  }
}
