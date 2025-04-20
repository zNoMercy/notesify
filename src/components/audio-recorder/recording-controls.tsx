import { Mic, Pause, Play, Square } from "lucide-react";
import { useAtom, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { formatDuration } from "../../lib/audio/utils";
import { recordingStateAtom, recordingTimeAtom } from "@/atoms/audio-recorder";
import {
  startRecordingAtom,
  stopRecordingAtom,
  pauseRecordingAtom,
  resumeRecordingAtom,
} from "@/actions/audio-recorder";

export const RecordingControls = () => {
  const [recordingState] = useAtom(recordingStateAtom);
  const [recordingTime] = useAtom(recordingTimeAtom);

  const startRecording = useSetAtom(startRecordingAtom);
  const stopRecording = useSetAtom(stopRecordingAtom);
  const pauseRecording = useSetAtom(pauseRecordingAtom);
  const resumeRecording = useSetAtom(resumeRecordingAtom);

  return (
    <div className="border-t p-4">
      <div className="flex flex-col items-center gap-4">
        {recordingState !== "inactive" && (
          <div className="text-lg font-medium">
            {formatDuration(recordingTime)}
          </div>
        )}
        <div className="flex justify-center items-center gap-6">
          {recordingState === "inactive" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-red-100 hover:bg-red-200"
              onClick={startRecording}
            >
              <Mic className="h-6 w-6 text-red-600" />
            </Button>
          ) : recordingState === "recording" ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={pauseRecording}
              >
                <Pause className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-red-100 hover:bg-red-200"
                onClick={stopRecording}
              >
                <Square className="h-5 w-5 text-red-600" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={resumeRecording}
              >
                <Play className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-red-100 hover:bg-red-200"
                onClick={stopRecording}
              >
                <Square className="h-5 w-5 text-red-600" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
