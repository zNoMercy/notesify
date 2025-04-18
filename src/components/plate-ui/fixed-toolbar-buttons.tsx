"use client";

// import React from 'react';

// import {
//   BoldPlugin,
//   CodePlugin,
//   ItalicPlugin,
//   StrikethroughPlugin,
//   UnderlinePlugin,
// } from '@udecode/plate-basic-marks/react';
// import {
//   FontBackgroundColorPlugin,
//   FontColorPlugin,
// } from '@udecode/plate-font/react';
// import { HighlightPlugin } from '@udecode/plate-highlight/react';
// import {
//   AudioPlugin,
//   FilePlugin,
//   ImagePlugin,
//   VideoPlugin,
// } from '@udecode/plate-media/react';
// import {
//   ArrowUpToLineIcon,
//   BaselineIcon,
//   BoldIcon,
//   Code2Icon,
//   HighlighterIcon,
//   ItalicIcon,
//   PaintBucketIcon,
//   StrikethroughIcon,
//   UnderlineIcon,
//   WandSparklesIcon,
// } from 'lucide-react';

// import { MoreDropdownMenu } from '@/components/plate-ui/more-dropdown-menu';

// import { AIToolbarButton } from './ai-toolbar-button';
// import { AlignDropdownMenu } from './align-dropdown-menu';
// import { ColorDropdownMenu } from './color-dropdown-menu';
// import { CommentToolbarButton } from './comment-toolbar-button';
// import { EmojiDropdownMenu } from './emoji-dropdown-menu';
// import { ExportToolbarButton } from './export-toolbar-button';
// import { FontSizeToolbarButton } from './font-size-toolbar-button';
// import {
//   BulletedIndentListToolbarButton,
//   NumberedIndentListToolbarButton,
// } from './indent-list-toolbar-button';
// import { IndentTodoToolbarButton } from './indent-todo-toolbar-button';
// import { IndentToolbarButton } from './indent-toolbar-button';
// import { InsertDropdownMenu } from './insert-dropdown-menu';
// import { LineHeightDropdownMenu } from './line-height-dropdown-menu';
// import { LinkToolbarButton } from './link-toolbar-button';
// import { MarkToolbarButton } from './mark-toolbar-button';
// import { MediaToolbarButton } from './media-toolbar-button';
// import { OutdentToolbarButton } from './outdent-toolbar-button';
// import { TableDropdownMenu } from './table-dropdown-menu';
// import { ToggleToolbarButton } from './toggle-toolbar-button';
// import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';

import { useEditorPlugin, useEditorReadOnly } from "@udecode/plate/react";
import { RedoToolbarButton, UndoToolbarButton } from "./history-toolbar-button";
import { ModeDropdownMenu } from "./mode-dropdown-menu";
import { ToolbarButton, ToolbarGroup } from "./toolbar";
import { useAtomValue, useSetAtom } from "jotai";
import { generatingNotesAtom, notesOpenAtom } from "@/atoms/notes";
import { StatesPlugin } from "./custom/states";
import { GeneratingButton } from "./custom/generating-button";
import { X } from "lucide-react";

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();
  const { getOption } = useEditorPlugin(StatesPlugin);
  const notesId = getOption("notesId");
  const setNotesOpen = useSetAtom(notesOpenAtom);
  const generatingSignal = useAtomValue(generatingNotesAtom(notesId));

  return (
    <div className="flex w-full px-1 py-0.5">
      {/* <ToolbarGroup> */}
      <UndoToolbarButton disabled={readOnly} />
      <RedoToolbarButton disabled={readOnly} />
      {/* </ToolbarGroup> */}

      {/* <ToolbarGroup>
            <AIToolbarButton tooltip="AI commands">
              <WandSparklesIcon />
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <ExportToolbarButton>
              <ArrowUpToLineIcon />
            </ExportToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <InsertDropdownMenu />
            <TurnIntoDropdownMenu />
            <FontSizeToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
              <BoldIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip="Italic (⌘+I)"
            >
              <ItalicIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={UnderlinePlugin.key}
              tooltip="Underline (⌘+U)"
            >
              <UnderlineIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={StrikethroughPlugin.key}
              tooltip="Strikethrough (⌘+⇧+M)"
            >
              <StrikethroughIcon />
            </MarkToolbarButton>

            <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
              <Code2Icon />
            </MarkToolbarButton>

            <ColorDropdownMenu
              nodeType={FontColorPlugin.key}
              tooltip="Text color"
            >
              <BaselineIcon />
            </ColorDropdownMenu>

            <ColorDropdownMenu
              nodeType={FontBackgroundColorPlugin.key}
              tooltip="Background color"
            >
              <PaintBucketIcon />
            </ColorDropdownMenu>
          </ToolbarGroup>

          <ToolbarGroup>
            <AlignDropdownMenu />

            <NumberedIndentListToolbarButton />
            <BulletedIndentListToolbarButton />
            <IndentTodoToolbarButton />
            <ToggleToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <LinkToolbarButton />
            <TableDropdownMenu />
            <EmojiDropdownMenu />
          </ToolbarGroup>

          <ToolbarGroup>
            <MediaToolbarButton nodeType={ImagePlugin.key} />
            <MediaToolbarButton nodeType={VideoPlugin.key} />
            <MediaToolbarButton nodeType={AudioPlugin.key} />
            <MediaToolbarButton nodeType={FilePlugin.key} />
          </ToolbarGroup>

          <ToolbarGroup>
            <LineHeightDropdownMenu />
            <OutdentToolbarButton />
            <IndentToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <MoreDropdownMenu />
          </ToolbarGroup> */}

      <div className="grow" />

      {/* <ToolbarGroup>
        <MarkToolbarButton nodeType={HighlightPlugin.key} tooltip="Highlight">
          <HighlighterIcon />
        </MarkToolbarButton>
        <CommentToolbarButton />
      </ToolbarGroup> */}

      <ToolbarGroup>
        <GeneratingButton />
        {/* <ModeDropdownMenu /> */}
      </ToolbarGroup>

      <ToolbarButton
        disabled={!!generatingSignal}
        onClick={() => {
          setNotesOpen(false);
        }}
        tooltip="Close"
      >
        <X />
      </ToolbarButton>
    </div>
  );
}
