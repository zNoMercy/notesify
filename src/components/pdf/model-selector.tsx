import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { LuSettings } from "react-icons/lu";
import { RiRobot2Line } from "react-icons/ri";

import {
  Model,
  ModelType,
  availableModelsAtom,
  openSettingsDialogAtom,
  selectedModelsAtom,
} from "@/atoms/providers";
import { Button } from "@/components/ui/button";
import { Select } from "../origin-ui/select";
import { TooltipButton } from "../tooltip/tooltip-button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type SelectItem = {
  label: string;
  value: Model;
};

const OCR_MODELS = ["mistral-ocr-latest"];

export const ModelSelector = ({
  variant,
  showModelName,
  modelType = "Chat",
  model, // If model is provided, the setSelectedModel is controlled by the caller
  onChange,
}: {
  variant: "button" | "select";
  showModelName?: boolean;
  modelType?: ModelType;
  model?: Model;
  onChange?: (value?: Model) => void;
}) => {
  const models = useAtomValue(availableModelsAtom);
  const [selectedModels, setSelectedModels] = useAtom(selectedModelsAtom);
  const setOpenSettings = useSetAtom(openSettingsDialogAtom);

  const modelItems = Object.entries(models)
    .map(([provider, models]) =>
      models.map((model) => ({
        label: model.name,
        value: model,
      }))
    )
    .flat()
    .filter(
      (model) =>
        modelType !== "Document Parser" || OCR_MODELS.includes(model.value.id)
    );

  const selectedItem = model
    ? { label: model.name, value: model }
    : modelItems?.find(
        (model) => model.label === selectedModels[modelType]?.name
      );

  return (
    <Select
      className="w-full"
      items={modelItems}
      selectedItem={selectedItem}
      onSelect={(item) => {
        onChange?.(item?.value);
        if (!model) {
          setSelectedModels((prev) => ({
            ...prev,
            [modelType]: item?.value,
          }));
        }
      }}
      notFoundHint={
        variant === "button" ? (
          <>
            <p>No model found</p>
            <Button
              variant="link"
              className="underline"
              onClick={() => setOpenSettings(true)}
            >
              Manage your models
            </Button>
          </>
        ) : (
          <>
            <p>No model found</p>
            <p>Please provide API key first</p>
          </>
        )
      }
      actionButtons={
        variant === "button" && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-50 w-8 h-8 p-2"
            onClick={() => setOpenSettings(true)}
          >
            <LuSettings />
          </Button>
        )
      }
    >
      {variant === "button" ? (
        <TooltipButton tooltip="AI Model">
          <RiRobot2Line className="opacity-50 !size-5" />
          {showModelName && selectedItem && (
            <span className="text-muted-foreground">
              {selectedItem.value.name}
            </span>
          )}
        </TooltipButton>
      ) : (
        <Button
          variant="outline"
          type="button"
          className="w-full justify-between bg-background px-3"
        >
          <span
            className={cn("truncate", !selectedItem && "text-muted-foreground")}
          >
            {selectedItem
              ? selectedItem.value.name
              : `Select ${modelType.toLowerCase()} model`}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={2}
            className="shrink-0 text-muted-foreground/80"
          />
        </Button>
      )}
    </Select>
  );
};
