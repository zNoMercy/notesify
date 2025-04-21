import { atom } from "jotai";
import { atomFamily, atomWithDefault, loadable } from "jotai/utils";
import { atomWithStorage } from "jotai/utils";
import {
  readFile,
  writeFile,
  remove,
  exists,
  mkdir,
} from "@tauri-apps/plugin-fs";
import * as path from "@tauri-apps/api/path";
import { wrapNativeStorage } from "@/lib/tauri";
import { toast } from "sonner";
import { getDB } from "@/db/sqlite";
import { eq } from "drizzle-orm";
import { Recording, recordingsTable } from "@/db/schema";

export type RecordingState = "inactive" | "recording" | "paused";
export interface RecordingData {
  id: string;
  data: Blob;
}

// UI state
export const audioRecorderOpenAtom = atom<boolean>(false);

// Recording state
export const recordingStateAtom = atom<RecordingState>("inactive");
export const recordingTimeAtom = atom<number>(0);

// Recordings management
export const createOrGetRecordingsDir = async () => {
  const dir = await path.join(await path.appDataDir(), "recordings");
  if (!(await exists(dir))) {
    await mkdir(dir);
  }
  return dir;
};

const getRecordingPath = async (id: string) => {
  return await path.join(await createOrGetRecordingsDir(), `${id}.webm`);
};

export const recordingAtomFamily = atomFamily((id: string) =>
  atomWithStorage<Recording | null>(`recording-${id}`, null, {
    async getItem(_key, initialValue) {
      const db = await getDB();
      const value = await db.query.recordingsTable.findFirst({
        where: eq(recordingsTable.id, id),
      });
      return value ?? initialValue;
    },
    async setItem(_key, value) {
      if (!value) return;
      const db = await getDB();
      await db.insert(recordingsTable).values(value).onConflictDoUpdate({
        target: recordingsTable.id,
        set: value,
      });
    },
    async removeItem(_key) {
      const db = await getDB();
      await db.delete(recordingsTable).where(eq(recordingsTable.id, id));
    },
  })
);
export const recordingsAtom = atomWithDefault(async () => {
  const db = await getDB();
  const result = await db.query.recordingsTable.findMany({
    orderBy: (recordings, { desc }) => [desc(recordings.createdAt)],
  });
  return result;
});
export const recordingsAtomLoadable = loadable(recordingsAtom);

export const recordingDataAtomFamily = atomFamily((id: string) =>
  atomWithStorage<RecordingData | null>(
    `recording-data-${id}`,
    null,
    wrapNativeStorage({
      async getItem(_key, initialValue) {
        try {
          const data = await readFile(await getRecordingPath(id));
          const blob = new Blob([data], { type: "audio/mp4" });
          return { id, data: blob };
        } catch (error) {
          toast.error("Failed to load recording: " + error);
          return initialValue;
        }
      },
      async setItem(_key, value) {
        if (!value) return;
        try {
          const data = new Uint8Array(await value.data.arrayBuffer());
          await writeFile(await getRecordingPath(id), data);
        } catch (error) {
          toast.error("Failed to save recording: " + error);
        }
      },
      async removeItem(_key) {
        await remove(await getRecordingPath(id));
      },
    })
  )
);

export const selectedRecordingIdAtom = atom<string | null>(null);

// Playback state
export const isPlayingAtom = atom<boolean>(false);
export const currentTimeAtom = atom<number>(0);
export const playbackSpeedAtom = atom<number>(1);
