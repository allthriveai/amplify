# /listen — Convert research notes to audio narration

Turns vault research notes into audio using ElevenLabs TTS. Uses a pre-made voice (not the user's own).

## Trigger

User runs `/listen`, optionally followed by a note name, path, or "latest".

## Steps

1. **Load config**: Read `.lumisrc` via `loadConfig()`. Check that `studio.elevenlabsApiKey` exists.

2. **Check voice**: If no `studio.listenVoiceId` is configured:
   - Run `lumis listen --voices` to show available voices
   - Ask the user to pick one
   - Update `.lumisrc` with the chosen `listenVoiceId` under the `studio` section

3. **Find the note**:
   - If user said "latest", read all research notes and pick the most recently modified
   - If user gave a name or path, fuzzy-match against research note filenames and titles
   - If no argument, ask what to convert. Show a few recent research note titles as options.

4. **Generate audio**: Run `lumis listen <note-filename>` (without .md extension works too)
   - The CLI handles markdown cleaning, chunking, ElevenLabs API calls, and MP3 concatenation
   - For long notes, it generates chunks and concatenates with ffmpeg

5. **Report results**:
   - File saved location
   - Estimated duration
   - Note title

6. **Emit signal**: Write an `audio_generated` signal to signals.json:
   ```json
   {
     "type": "audio_generated",
     "data": {
       "sourceNote": "the-note-filename.md",
       "audioFile": "the-note-filename.mp3",
       "durationEstimate": "8 min"
     }
   }
   ```
   Use `emitSignal()` from `src/vault/signals.ts`.

## Error handling

- Missing ElevenLabs API key: Tell user to add `studio.elevenlabsApiKey` to `.lumisrc`
- Missing voice ID: Run `--voices` and help them pick
- No matching note: Show available research notes and ask again
- ffmpeg not found: Tell user to install ffmpeg (`brew install ffmpeg`)

## Notes

- `listenVoiceId` is separate from `elevenlabsVoiceId` (used for video voiceovers)
- If only `elevenlabsVoiceId` is set and `listenVoiceId` is not, the CLI falls back to `elevenlabsVoiceId`
- Audio files are saved to `{vaultPath}/{paths.audio}/` (default: `3 - Resources/Research/Audio/`)
