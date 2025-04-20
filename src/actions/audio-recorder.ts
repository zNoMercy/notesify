import { atom } from "jotai";
import {
  recordingStateAtom,
  recordingTimeAtom,
  recordingsAtom,
  selectedRecordingAtom,
  isPlayingAtom,
  currentTimeAtom,
  playbackSpeedAtom,
} from "@/atoms/audio-recorder";
import { Recording } from "@/components/audio-recorder/audio-recorder";
import { ActionError } from "@/hooks/state/use-action";

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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    set(recordingTimeAtom, 0); // Reset recording time at start

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, {
        type: "audio/wav",
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const finalDuration = Math.max(get(recordingTimeAtom), 1); // Ensure at least 1 second

      const recordings = get(recordingsAtom);
      const recording: Recording = {
        id: Date.now().toString(),
        name: `Recording ${recordings.length + 1}`,
        url: audioUrl,
        duration: finalDuration,
        createdAt: new Date(),
      };

      set(recordingsAtom, [...recordings, recording]);
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
  (get, set, recording: Recording) => {
    if (!audioElement) {
      set(initializeAudioPlayerAtom);
      audioElement = new Audio();
    }

    const selectedRecording = get(selectedRecordingAtom);
    const isPlaying = get(isPlayingAtom);
    const playbackSpeed = get(playbackSpeedAtom);

    // If the same recording is already playing, pause it
    if (selectedRecording?.id === recording.id && isPlaying) {
      audioElement.pause();
      set(isPlayingAtom, false);
      return;
    }

    // If a different recording is selected
    if (selectedRecording?.id !== recording.id) {
      set(selectedRecordingAtom, recording);
      audioElement.src = recording.url;
      audioElement.playbackRate = playbackSpeed;
      set(currentTimeAtom, 0);
    }

    // Play the selected recording
    audioElement.play();
    set(isPlayingAtom, true);
  }
);

// Change playback time
export const changePlaybackTimeAtom = atom(null, (get, set, time: number) => {
  const selectedRecording = get(selectedRecordingAtom);
  if (audioElement && selectedRecording) {
    audioElement.currentTime = time;
    set(currentTimeAtom, time);
  }
});

// Skip forward
export const skipForwardAtom = atom(null, (get, set) => {
  const selectedRecording = get(selectedRecordingAtom);
  if (audioElement && selectedRecording) {
    const newTime = Math.min(
      audioElement.currentTime + 10,
      selectedRecording.duration
    );
    audioElement.currentTime = newTime;
    set(currentTimeAtom, newTime);
  }
});

// Skip backward
export const skipBackwardAtom = atom(null, (get, set) => {
  const selectedRecording = get(selectedRecordingAtom);
  if (audioElement && selectedRecording) {
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
  const selectedRecording = get(selectedRecordingAtom);
  const isPlaying = get(isPlayingAtom);

  if (selectedRecording) {
    // Stop playing if the deleted recording is the one being played
    if (audioElement && isPlaying) {
      audioElement.pause();
      set(isPlayingAtom, false);
    }

    // Remove the recording from the list
    const recordings = get(recordingsAtom);
    set(
      recordingsAtom,
      recordings.filter((rec) => rec.id !== selectedRecording.id)
    );

    // Clear selection
    set(selectedRecordingAtom, null);
  }
});

// Rename recording
export const renameRecordingAtom = atom(null, (get, set, newName: string) => {
  const selectedRecording = get(selectedRecordingAtom);
  const recordings = get(recordingsAtom);

  if (selectedRecording) {
    set(
      recordingsAtom,
      recordings.map((rec) =>
        rec.id === selectedRecording.id ? { ...rec, name: newName } : rec
      )
    );

    // Update the selected recording
    set(
      selectedRecordingAtom,
      selectedRecording ? { ...selectedRecording, name: newName } : null
    );
  }
});

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
