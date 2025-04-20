import { useAtom } from "jotai";
import { Mic } from "lucide-react";
import { recordingsAtom } from "@/atoms/audio-recorder";
import { RecordingItem } from "./recording-item";

export const RecordingsList = () => {
  const [recordings] = useAtom(recordingsAtom);

  if (recordings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <div className="h-10 w-10 mb-2 flex items-center justify-center">
          <Mic className="h-6 w-6" />
        </div>
        <p>No recordings yet</p>
      </div>
    );
  }

  return recordings.map((recording) => (
    <RecordingItem key={recording.id} recording={recording} />
  ));
};
