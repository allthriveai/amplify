#!/usr/bin/env node

const [, , command, ...args] = process.argv;

async function main() {
  switch (command) {
    case "init": {
      const { initCommand } = await import("./commands/init.js");
      await initCommand(args[0]);
      break;
    }
    case "import-sparks": {
      const fromIndex = args.indexOf("--from");
      const fromPath = fromIndex !== -1 ? args[fromIndex + 1] : null;
      if (!fromPath) {
        console.error("Usage: amplify import-sparks --from <path>");
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
    case "obs": {
      const { obsCommand } = await import("./commands/obs.js");
      await obsCommand(args[0], args.slice(1));
      break;
    }
    case "listen": {
      const { listenCommand } = await import("./commands/listen.js");
      await listenCommand(args);
      break;
    }
    case "storyboard": {
      const { storyboardCommand } = await import("./commands/storyboard.js");
      await storyboardCommand(args);
      break;
    }
    default:
      console.log(`amplify — turn your second brain into published content

Commands:
  amplify init [path]                 Connect Amplify to an Obsidian vault
  amplify studio <cmd>                Video production (list, render, preview)
  amplify storyboard <slug>           Visual storyboard editor (edits save to timeline)
  amplify listen <note>               Narrate a wiki page with ElevenLabs
  amplify listen --voices             List available ElevenLabs voices
  amplify obs <cmd>                   Screen capture (setup, start, stop, status, scenes)
  amplify import-sparks --from <path> Import content from a sparks manifest

Options:
  --help    Show this help

Your notes stay in your vault. Amplify reads and writes there, and stores nothing itself.`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
