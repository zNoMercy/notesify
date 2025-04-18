import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type QualityType = "Standard" | "High";
export type LengthType = "Concise" | "Detail";

interface GenerateNotesDialogProps {
  onGenerate: (quality: QualityType, length: LengthType) => void;
  trigger?: React.ReactNode;
}

export const GenerateNotesDialog = ({
  onGenerate,
  trigger,
}: GenerateNotesDialogProps) => {
  const [quality, setQuality] = useState<QualityType>("Standard");
  const [length, setLength] = useState<LengthType>("Concise");
  const [open, setOpen] = useState(false);

  const handleGenerate = () => {
    onGenerate(quality, length);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="leading-4">
            <Sparkles className="h-4 w-4" />
            Generate Notes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Generate Notes</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="length" className="text-right">
              Length
            </Label>
            <Select
              value={length}
              onValueChange={(value) => setLength(value as LengthType)}
            >
              <SelectTrigger id="length" className="col-span-3">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Concise">Concise</SelectItem>
                <SelectItem value="Detail">Detail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quality" className="text-right">
              Quality
            </Label>
            <Select
              value={quality}
              onValueChange={(value) => setQuality(value as QualityType)}
            >
              <SelectTrigger id="quality" className="col-span-3">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="High">
                  High (<b>Document Parser</b> required)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate}>
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
