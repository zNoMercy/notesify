import { LengthType } from "@/components/plate-ui/custom/generate-notes-dialog";
import { CoreMessage } from "ai";
import {
  conciseSummaryPrompt,
  detailedSummaryPrompt,
} from "../prompts/summary";

export const replaceImageReferences = (text: string, images: string[]) => {
  // Replace ![img-X.jpeg](img-X.jpeg) with ![](base64 image)
  const imgPattern = /!\[img-(\d+).jpeg\]\(img-\d+\.jpeg\)/g;
  const res = text.replace(imgPattern, (match: string, index: string) => {
    const imgIndex = parseInt(index);
    if (imgIndex >= 0 && imgIndex < images.length && images[imgIndex]) {
      return `![](${images[imgIndex]})`;
    }
    // Return original match if no replacement is possible
    return match;
  });
  return res;
};

export const formatMessages = (
  text: string,
  length: LengthType,
  images?: string[]
) => {
  // console.log("Images", images);
  const withImages = images ? images.length > 0 : false;
  return [
    {
      role: "user",
      content: [
        {
          type: "text",
          text:
            length === "Concise"
              ? conciseSummaryPrompt(text, withImages)
              : detailedSummaryPrompt(text, withImages),
        },
        ...(images?.map((image) => ({ type: "image", image })) || []),
      ],
    } as CoreMessage,
  ];
};
