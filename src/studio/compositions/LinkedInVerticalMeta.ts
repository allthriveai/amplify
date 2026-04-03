import { CalculateMetadataFunction, staticFile } from 'remotion';
import { getAudioDuration } from './get-audio-duration';
import type { LinkedInVerticalProps } from './LinkedInVertical';

const FPS = 30;
const TRANSITION_FRAMES = 12;
const PADDING_FRAMES = 15; // Extra frames after audio ends

export const calculateLinkedInMetadata: CalculateMetadataFunction<
  LinkedInVerticalProps
> = async ({ props }) => {
  const updatedScenes = await Promise.all(
    props.scenes.map(async (scene) => {
      if (!scene.audioFile) return scene;

      try {
        const durationInSeconds = await getAudioDuration(
          staticFile(scene.audioFile),
        );
        const durationInFrames = Math.ceil(durationInSeconds * FPS) + PADDING_FRAMES;
        return { ...scene, durationInFrames };
      } catch {
        return scene;
      }
    }),
  );

  const totalDuration =
    updatedScenes.reduce((sum, s) => sum + s.durationInFrames, 0) -
    TRANSITION_FRAMES * (updatedScenes.length - 1);

  return {
    durationInFrames: totalDuration,
    props: {
      ...props,
      scenes: updatedScenes,
    },
  };
};
