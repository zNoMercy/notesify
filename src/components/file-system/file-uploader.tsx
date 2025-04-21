import { BsFiletypePdf, BsFiletypeDoc, BsFiletypePpt } from "react-icons/bs";
import { FileInput, FileUploader } from "@/components/ui/file-uploader";
import { convertToPdfAtom, savePdfAtom } from "@/actions/pdf/pdf";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { toast } from "sonner";
import { generateId } from "@/lib/id";
import { useNavigatePdf } from "@/hooks/pdf/use-navigate-pdf";
import { useAction } from "@/hooks/state/use-action";

const FileSvgDraw = ({ thin }: { thin?: boolean }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center flex-col border border-dashed border-gray-400 rounded-md",
        thin ? "h-fit w-full py-2 mt-2" : "h-48 w-80"
      )}
    >
      {thin ? (
        <Plus className="text-gray-500 w-4 h-4" />
      ) : (
        <>
          <div className="flex items-center justify-center space-x-3 mb-2">
            <BsFiletypeDoc className="text-gray-500 w-8 h-8" />
            <BsFiletypePdf className="text-gray-500 w-8 h-8" />
            <BsFiletypePpt className="text-gray-500 w-8 h-8" />
          </div>
          <p className="my-1 text-sm text-gray-500 font-semibold">
            Drag and drop a file
          </p>
          <p className="text-xs text-gray-500">Or click to select</p>
        </>
      )}
    </div>
  );
};

export const PdfFileUploader = ({
  className,
  thin,
}: {
  className?: string;
  thin?: boolean;
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  const { navigatePdf } = useNavigatePdf();
  const [convertToPdf] = useAction(convertToPdfAtom, (_, filename) => ({
    loading: `Converting ${filename} to PDF...`,
    success: `Converted ${filename} to PDF`,
    error: `Failed to convert ${filename} to PDF`,
  }));
  const [savePdf] = useAction(savePdfAtom);

  const loadPdfFromBlob = async (
    data: Blob,
    fileName: string,
    originalType?: string
  ) => {
    if (isMobile) {
      toast.info(
        "Mobile version is not supported yet. Please view on a desktop or laptop."
      );
      return;
    }
    const pdfData =
      originalType === "application/pdf"
        ? data
        : await convertToPdf(data, fileName);
    if (!pdfData) {
      return;
    }

    const pdf = {
      id: generateId(),
      data: pdfData,
    };
    const saved = await savePdf(fileName, pdf);
    if (saved) {
      navigatePdf({ pdfId: pdf.id });
    }
  };

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 50,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
    },
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <FileUploader
        value={[]}
        onValueChange={async (files) => {
          const file = files?.[0];
          if (file) {
            const blob = new Blob([file], { type: file.type });
            await loadPdfFromBlob(blob, file.name, file.type);
          }
        }}
        dropzoneOptions={dropZoneConfig}
        className={cn(thin && "w-full")}
      >
        <FileInput>
          <FileSvgDraw thin={thin} />
        </FileInput>
      </FileUploader>
    </div>
  );
};
