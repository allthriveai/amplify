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
    default:
      console.log(`lumis — your AI confidant

Commands:
  lumis moment "..."    Capture a moment
  lumis patterns        Regenerate the Pattern Map
  lumis init [path]     Set up Lumis in a vault

Options:
  --help    Show this help`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
