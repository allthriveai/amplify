import { join } from "node:path";
import { loadConfig } from "../../config.js";
import { readResearchNotes } from "../../vault/reader.js";
import { createElevenLabsClient } from "../../studio/elevenlabs.js";
import { narrateToAudio, estimateDuration } from "../../studio/narrate.js";
import { resolveAudioDir } from "../../vault/paths.js";
import { mkdir } from "node:fs/promises";

export async function listenCommand(args: string[]): Promise<void> {
  const config = loadConfig();

  // Check for ElevenLabs API key
  if (!config.studio?.elevenlabsApiKey) {
    console.error("Missing ElevenLabs API key. Set studio.elevenlabsApiKey in .lumisrc or ELEVENLABS_API_KEY env var.");
    process.exit(1);
  }

  // --voices flag: list available voices and exit
  if (args.includes("--voices")) {
    const client = createElevenLabsClient(config.studio.elevenlabsApiKey, "");
    const voices = await client.getVoices();
    console.log("Available ElevenLabs voices:\n");
    for (const voice of voices) {
      console.log(`  ${voice.voice_id}  ${voice.name}`);
    }
    return;
  }

  // Determine voice ID
  const voiceIndex = args.indexOf("--voice");
  const voiceId = voiceIndex !== -1
    ? args[voiceIndex + 1]
    : config.studio.listenVoiceId ?? config.studio.elevenlabsVoiceId;

  if (!voiceId) {
    console.error("No voice ID configured. Set studio.listenVoiceId in .lumisrc, use --voice <id>, or run `lumis listen --voices` to see options.");
    process.exit(1);
  }

  // Get the search term (remaining args after removing --voice <id> flag pair)
  const searchArgs = voiceIndex !== -1
    ? args.filter((_, i) => i !== voiceIndex && i !== voiceIndex + 1)
    : args;
  const searchTerm = searchArgs.join(" ").trim();

  if (!searchTerm) {
    console.error("Usage: lumis listen <note-name-or-path>");
    console.error("       lumis listen --voices");
    console.error("       lumis listen --voice <id> <note-name>");
    process.exit(1);
  }

  // Find matching research note
  const notes = readResearchNotes(config);
  const normalizedSearch = searchTerm.toLowerCase().replace(/\.md$/, "");

  const match = notes.find((n) => {
    const name = n.filename.toLowerCase().replace(/\.md$/, "");
    const title = (n.frontmatter.title ?? "").toLowerCase();
    return (
      name === normalizedSearch ||
      title === normalizedSearch ||
      name.includes(normalizedSearch) ||
      title.includes(normalizedSearch)
    );
  });

  if (!match) {
    console.error(`No research note found matching "${searchTerm}".`);
    console.error(`Found ${notes.length} research notes total.`);
    process.exit(1);
  }

  console.log(`Found: ${match.frontmatter.title ?? match.filename}`);
  console.log(`Estimated duration: ${estimateDuration(match.content)}`);
  console.log("Generating audio...\n");

  // Set up output
  const audioDir = resolveAudioDir(config);
  await mkdir(audioDir, { recursive: true });

  const outputFilename = match.filename.replace(/\.md$/, ".mp3");
  const outputPath = join(audioDir, outputFilename);

  // Generate audio
  const client = createElevenLabsClient(config.studio.elevenlabsApiKey, voiceId);
  await narrateToAudio(match.content, outputPath, client);

  console.log(`\nAudio saved: ${outputPath}`);
  console.log(`Duration estimate: ${estimateDuration(match.content)}`);
}
