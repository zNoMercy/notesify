import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pause, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDuration } from "../../lib/audio/utils";
import { useAtom, useSetAtom } from "jotai";
import {
  isPlayingAtom,
  currentTimeAtom,
  playbackSpeedAtom,
  selectedRecordingAtom,
} from "@/atoms/audio-recorder";
import {
  playRecordingAtom,
  changePlaybackTimeAtom,
  skipForwardAtom,
  skipBackwardAtom,
  changePlaybackSpeedAtom,
} from "@/actions/audio-recorder";
import { GrBackTen, GrForwardTen } from "react-icons/gr";

export const AudioPlayer = ({ duration }: { duration: number }) => {
  const [isPlaying] = useAtom(isPlayingAtom);
  const [currentTime] = useAtom(currentTimeAtom);
  const [playbackSpeed] = useAtom(playbackSpeedAtom);
  const [selectedRecording] = useAtom(selectedRecordingAtom);

  const playRecording = useSetAtom(playRecordingAtom);
  const changePlaybackTime = useSetAtom(changePlaybackTimeAtom);
  const skipForward = useSetAtom(skipForwardAtom);
  const skipBackward = useSetAtom(skipBackwardAtom);
  const changePlaybackSpeed = useSetAtom(changePlaybackSpeedAtom);

  const handlePlayPause = () => {
    if (selectedRecording) {
      playRecording(selectedRecording);
    }
  };
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="text-xs">{formatDuration(currentTime)}</div>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          className="flex-1"
          onValueChange={(value) => changePlaybackTime(value[0])}
        />
        <div className="text-xs">{formatDuration(duration)}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={skipBackward}
          >
            <GrBackTen />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={skipForward}
          >
            <GrForwardTen />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              {playbackSpeed}x
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {speedOptions.map((speed) => (
              <DropdownMenuItem
                key={speed}
                onClick={() => changePlaybackSpeed(speed)}
                className={cn(
                  "text-xs",
                  playbackSpeed === speed && "bg-neutral-100 font-medium"
                )}
              >
                {speed}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
