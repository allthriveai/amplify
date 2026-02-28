#!/usr/bin/env node

import { loadConfig } from "../config.js";

const [, , command, ...args] = process.argv;

async function main() {
  switch (command) {
    case "moment": {
      const { momentCommand } = await import("./commands/moment.js");
      await momentCommand(args.join(" "));
      break;
    }
    case "patterns": {
      const { patternsCommand } = await import("./commands/patterns.js");
      await patternsCommand();
      break;
    }
    case "init": {
      const { initCommand } = await import("./commands/init.js");
      await initCommand(args[0]);
      break;
    }
    case "import-sparks": {
      const fromIndex = args.indexOf("--from");
      const fromPath = fromIndex !== -1 ? args[fromIndex + 1] : null;
      if (!fromPath) {
        console.error("Usage: lumis import-sparks --from <path>");
        process.exit(1);
      }
      const { importSparksCommand } = await import("./commands/import-sparks.js");
      await importSparksCommand(fromPath);
      break;
    }
    case "studio": {
      const { studioCommand } = await import("./commands/studio.js");
      await studioCommand(args[0], args.slice(1));
      break;
    }
    default:
      console.log(`lumis — your AI confidant

Commands:
  lumis moment "..."                 Capture a moment
  lumis patterns                     Regenerate the Pattern Map
  lumis init [path]                  Set up Lumis in a vault
  lumis import-sparks --from <path>  Import sparks from manifest
  lumis studio <cmd>                 Video production (list, render, preview)

Options:
  --help    Show this help`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
