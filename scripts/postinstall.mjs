import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

// On Linux (Cloudflare Workers) or macOS, npm automatically installs the native Linux/Darwin binary.
// On Windows, if npm skipped extracting the win32 native binary due to npm issue #4828, ensure it's unpacked.
if (process.platform === "win32") {
  const binaryPath = path.resolve("node_modules/@rolldown/binding-win32-x64-msvc/rolldown-binding.win32-x64-msvc.node");
  if (!fs.existsSync(binaryPath)) {
    try {
      execSync("npm pack @rolldown/binding-win32-x64-msvc@1.2.11", { stdio: "ignore" });
      execSync("tar -xzf rolldown-binding-win32-x64-msvc-1.2.11.tgz", { stdio: "ignore" });
      const targetDir = path.resolve("node_modules/@rolldown/binding-win32-x64-msvc");
      fs.mkdirSync(targetDir, { recursive: true });
      fs.cpSync(path.resolve("package"), targetDir, { recursive: true });
      fs.rmSync(path.resolve("package"), { recursive: true, force: true });
      fs.rmSync(path.resolve("rolldown-binding-win32-x64-msvc-1.2.11.tgz"), { force: true });
    } catch {
      // Ignore if not available
    }
  }
}
