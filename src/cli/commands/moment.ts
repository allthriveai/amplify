import { loadConfig } from "../../config.js";
import { captureMoment } from "../../pipeline/capture.js";

/** `lumis moment "..."` — capture a moment */
export async function momentCommand(rawInput: string): Promise<void> {
  if (!rawInput.trim()) {
    console.error("Usage: lumis moment \"describe what happened\"");
    process.exit(1);
  }

  const config = loadConfig();
  // TODO: Call captureMoment and print summary
  console.log("Moment capture not yet implemented.");
}
