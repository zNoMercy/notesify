import { useEffect } from "react";
import { useSetAtom } from "jotai";

import {
  initializeAudioPlayerAtom,
  cleanupAudioResourcesAtom,
} from "@/actions/audio-recorder";

import { AudioRecorderToolbar } from "./toolbar";
import { RecordingControls } from "./recording-controls";
import { RecordingsList } from "./recordings-list";

export type RecordingState = "inactive" | "recording" | "paused";

export interface Recording {
  id: string;
  name: string;
  url: string;
  duration: number; // in seconds
  createdAt: Date;
}

export const AudioRecorder = () => {
  const initialize = useSetAtom(initializeAudioPlayerAtom);
  const cleanup = useSetAtom(cleanupAudioResourcesAtom);

  // Initialize and cleanup audio player
  useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <AudioRecorderToolbar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* List of recordings */}
        <div className="flex-1 overflow-y-auto">
          <RecordingsList />
        </div>

        {/* Recording controls */}
        <RecordingControls />
      </div>
    </div>
  );
};
