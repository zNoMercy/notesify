import { Check } from "lucide-react";
import { ReactNode, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SelectItem = {
  label: string;
  value: any;
};

export const Select = ({
  items,
  selectedItem,
  onSelect,
  actionButtons,
  notFoundHint,
  children,
  pinSelectedModel = true,
  className,
}: {
  items?: SelectItem[];
  selectedItem?: SelectItem;
  onSelect?: (item?: SelectItem) => void;
  actionButtons?: ReactNode;
  notFoundHint?: ReactNode;
  children: ReactNode;
  pinSelectedModel?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  const displayedItems =
    pinSelectedModel && selectedItem && items
      ? [
          selectedItem,
          ...items.filter((item) => item.label !== selectedItem.label),
        ]
      : (items ?? []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={className}>{children}</PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            placeholder="Search model"
            actionButtons={actionButtons}
          />
          <CommandList>
            <CommandEmpty>{notFoundHint}</CommandEmpty>
            <CommandGroup>
              {displayedItems.map((item) => (
                <CommandItem
                  key={item.label}
                  value={item.label}
                  onSelect={() => {
                    onSelect?.(
                      item.label === selectedItem?.label ? undefined : item
                    );
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedItem?.label === item.label
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
