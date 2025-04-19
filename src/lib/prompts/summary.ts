import { LengthType } from "@/components/plate-ui/custom/generate-notes-dialog";
import { CoreMessage } from "ai";

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

export const conciseSummaryPrompt = (text: string, withImages: boolean) =>
  `You are a summarization expert. Summarize the following text (extracted from a PDF) according to the instructions.

<text>
${text}
</text>

<instructions>
- Write the summary in Markdown format, WITHOUT the code block \`\`\`...\`\`\`
- Use headings for key sections
- Use list items for key points
- Use bold or italics for emphasis
- Write concisely and clearly, assuming the reader is familiar with the subject matter
- Prefer short points over complete sentences
- Include ALL the important information, such as key concepts, examples, figures/values, and so on
${
  withImages
    ? "-  Include important images throughout the summary by inserting like ![img-0.jpeg](img-0.jpeg)"
    : ""
}
</instructions>`;

export const detailedSummaryPrompt = (text: string, withImages: boolean) =>
  `You are a summarization expert. Summarize the following text (extracted from a PDF) according to the instructions.

<text>
${text}
</text>

<instructions>
- Write the summary in Markdown format, WITHOUT the code block \`\`\`...\`\`\`
- Write and explain the details, assuming the reader IS NOT familiar with the subject matter
- Use paragraphs to explain important background information, motivation, reasoning, concepts, and so on
- Give examples when appropriate
- Make sure the content is logically connected, and easy to understand
- Prefer multiple short paragraphs over long paragraphs
- Use headings for key sections
- Use list items for key points
- Use bold or italics to emphasize important keywords or phrases
${
  withImages
    ? "- Include important images throughout the summary by inserting like ![img-0.jpeg](img-0.jpeg)"
    : ""
}
</instructions>`;
