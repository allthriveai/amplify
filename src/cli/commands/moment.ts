import { loadConfig } from "../../config.js";
import { captureMoment } from "../../pipeline/capture.js";

/** `lumis moment "..."` — capture a moment */
export async function momentCommand(rawInput: string): Promise<void> {
  if (!rawInput.trim()) {
    console.error("Usage: lumis moment \"describe what happened\"");
    process.exit(1);
  }

  const config = loadConfig();

  if (!config.anthropicApiKey) {
    console.error("No Anthropic API key configured. Set ANTHROPIC_API_KEY or add it to .lumisrc.");
    process.exit(1);
  }

  console.log("Capturing moment...");
  const { moment, analysis } = await captureMoment(rawInput, config);

  console.log(`\nMoment captured: ${analysis.title}`);
  console.log(`5-second moment: ${analysis.fiveSecondMoment}`);
  console.log(`Themes: ${analysis.themes.join(", ")}`);
  console.log(`Story potential: ${analysis.storyPotential}`);
  if (analysis.connections.length > 0) {
    console.log(`Connections: ${analysis.connections.length}`);
    for (const c of analysis.connections) {
      console.log(`  - ${c.momentPath} — ${c.reason}`);
    }
  }
  console.log(`\nSaved to: ${moment.path}`);
}
