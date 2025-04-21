import { atom } from "jotai";
import {
  recordingStateAtom,
  recordingTimeAtom,
  recordingsAtom,
  isPlayingAtom,
  currentTimeAtom,
  playbackSpeedAtom,
  recordingDataAtomFamily,
  RecordingData,
  recordingAtomFamily,
  selectedRecordingIdAtom,
} from "@/atoms/audio-recorder";
import { ActionError } from "@/hooks/state/use-action";
import { generateId } from "@/lib/id";
import { Recording } from "@/db/schema";
import { RESET } from "jotai/utils";

// Refs to be kept in components to maintain state
let mediaRecorder: MediaRecorder | null = null;
let audioElement: HTMLAudioElement | null = null;
let intervalId: number | null = null;

// Initialize audio element
export const initializeAudioPlayerAtom = atom(null, (_, set) => {
  if (!audioElement) {
    audioElement = new Audio();

    audioElement.addEventListener("timeupdate", () => {
      if (audioElement) {
        set(currentTimeAtom, audioElement.currentTime);
      }
    });

    audioElement.addEventListener("ended", () => {
      set(isPlayingAtom, false);
    });
  }
  return audioElement;
});

// Clean up audio resources
export const cleanupAudioResourcesAtom = atom(null, () => {
  if (audioElement) {
    audioElement.pause();
    audioElement = null;
  }

  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
});

// Start recording
export const startRecordingAtom = atom(null, async (get, set) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    set(recordingTimeAtom, 0); // Reset recording time at start

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const finalDuration = Math.max(get(recordingTimeAtom), 1); // Ensure at least 1 second

      const recordingId = generateId();
      const recording: Recording = {
        id: recordingId,
        name: `New Recording`,
        duration: finalDuration,
        createdAt: new Date(),
      };
      const recordingData: RecordingData = {
        id: recordingId,
        data: audioBlob,
      };

      set(recordingAtomFamily(recordingId), recording);
      set(recordingDataAtomFamily(recordingId), recordingData);
      set(recordingsAtom, async (recordings) => [
        ...(await recordings),
        recording,
      ]);
      set(recordingStateAtom, "inactive");
      set(recordingTimeAtom, 0);

      // Stop all tracks
      stream.getTracks().forEach((track) => track.stop());
    };

    // Request data chunks every 1000ms
    mediaRecorder.start(1000);
    set(recordingStateAtom, "recording");

    // Start timer
    intervalId = window.setInterval(() => {
      set(recordingTimeAtom, (prev) => prev + 1);
    }, 1000);
  } catch (error) {
    console.error("Error starting recording:", error);
    throw new ActionError("Failed to record audio");
  }
});

// Stop recording
export const stopRecordingAtom = atom(null, (get) => {
  const recordingState = get(recordingStateAtom);
  if (mediaRecorder && recordingState !== "inactive") {
    mediaRecorder.stop();

    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }
});

// Pause recording
export const pauseRecordingAtom = atom(null, (get, set) => {
  const recordingState = get(recordingStateAtom);
  if (mediaRecorder && recordingState === "recording") {
    mediaRecorder.pause();
    set(recordingStateAtom, "paused");

    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }
});

// Resume recording
export const resumeRecordingAtom = atom(null, (get, set) => {
  const recordingState = get(recordingStateAtom);

  if (mediaRecorder && recordingState === "paused") {
    mediaRecorder.resume();
    set(recordingStateAtom, "recording");

    // Resume timer
    intervalId = window.setInterval(() => {
      set(recordingTimeAtom, (prev) => prev + 1);
    }, 1000);
  }
});

// Play/pause recording
export const playRecordingAtom = atom(
  null,
  async (get, set, recordingId: string) => {
    if (!audioElement) {
      set(initializeAudioPlayerAtom);
      audioElement = new Audio();
    }
    const selectedRecordingId = get(selectedRecordingIdAtom);
    const isPlaying = get(isPlayingAtom);

    if (selectedRecordingId === recordingId && isPlaying) {
      audioElement.pause();
      set(isPlayingAtom, false);
      return;
    }

    const recordingData = await get(recordingDataAtomFamily(recordingId));
    if (!recordingData) return;

    const url = URL.createObjectURL(recordingData.data);
    audioElement.src = url;
    audioElement.play();
    set(currentTimeAtom, 0);
    set(selectedRecordingIdAtom, recordingId);
    set(isPlayingAtom, true);
  }
);

// Change playback time
export const changePlaybackTimeAtom = atom(null, (get, set, time: number) => {
  const selectedRecordingId = get(selectedRecordingIdAtom);
  if (audioElement && selectedRecordingId) {
    audioElement.currentTime = time;
    set(currentTimeAtom, time);
  }
});

// Skip forward
export const skipForwardAtom = atom(null, async (get, set) => {
  const selectedRecordingId = get(selectedRecordingIdAtom);
  if (!selectedRecordingId) return;

  const recording = await get(recordingAtomFamily(selectedRecordingId));
  if (audioElement && recording) {
    const newTime = Math.min(audioElement.currentTime + 10, recording.duration);
    audioElement.currentTime = newTime;
    set(currentTimeAtom, newTime);
  }
});

// Skip backward
export const skipBackwardAtom = atom(null, async (get, set) => {
  const selectedRecordingId = get(selectedRecordingIdAtom);
  if (!selectedRecordingId) return;

  const recording = await get(recordingAtomFamily(selectedRecordingId));
  if (audioElement && recording) {
    const newTime = Math.max(audioElement.currentTime - 10, 0);
    audioElement.currentTime = newTime;
    set(currentTimeAtom, newTime);
  }
});

// Change playback speed
export const changePlaybackSpeedAtom = atom(null, (get, set, speed: number) => {
  set(playbackSpeedAtom, speed);
  if (audioElement) {
    audioElement.playbackRate = speed;
  }
});

// Delete recording
export const deleteRecordingAtom = atom(null, (get, set) => {
  const selectedRecordingId = get(selectedRecordingIdAtom);
  const isPlaying = get(isPlayingAtom);

  if (!selectedRecordingId) return;

  // Stop playing if the deleted recording is the one being played
  if (audioElement && isPlaying) {
    audioElement.pause();
    set(isPlayingAtom, false);
  }

  set(recordingDataAtomFamily(selectedRecordingId), RESET);
  set(recordingsAtom, async (recordings) =>
    (await recordings).filter((rec) => rec.id !== selectedRecordingId)
  );
  set(selectedRecordingIdAtom, null);
});

// Rename recording
export const renameRecordingAtom = atom(
  null,
  async (get, set, newName: string) => {
    const selectedRecordingId = get(selectedRecordingIdAtom);
    if (!selectedRecordingId) return;

    const recording = await get(recordingAtomFamily(selectedRecordingId));
    if (!recording) return;

    set(recordingAtomFamily(selectedRecordingId), {
      ...recording,
      name: newName,
    });
  }
);

// Close audio recorder
export const closeAudioRecorderAtom = atom(
  null,
  (get, set, { stopRecordingFirst = true } = {}) => {
    const recordingState = get(recordingStateAtom);
    const isPlaying = get(isPlayingAtom);

    // Stop recording if active and requested
    if (stopRecordingFirst && recordingState !== "inactive") {
      set(stopRecordingAtom);
    }

    // Stop playback if active
    if (audioElement && isPlaying) {
      audioElement.pause();
      set(isPlayingAtom, false);
    }
  }
);
