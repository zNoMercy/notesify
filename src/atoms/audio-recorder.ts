import {
  Recording,
  RecordingState,
} from "@/components/audio-recorder/audio-recorder";
import { atom } from "jotai";

// UI state
export const audioRecorderOpenAtom = atom<boolean>(false);

// Recording state
export const recordingStateAtom = atom<RecordingState>("inactive");
export const recordingTimeAtom = atom<number>(0);

// Recordings management
export const recordingsAtom = atom<Recording[]>([]);
export const selectedRecordingAtom = atom<Recording | null>(null);

// Playback state
export const isPlayingAtom = atom<boolean>(false);
export const currentTimeAtom = atom<number>(0);
export const playbackSpeedAtom = atom<number>(1);
