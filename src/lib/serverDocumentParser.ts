import pdf from "pdf-parse";
import mammoth from "mammoth";

export interface DocumentContent {
  text: string;
  title?: string;
  metadata?: {
    pageCount?: number;
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

export interface DocumentParseError {
  error: string;
  details?: string;
}

/**
 * PDF 파일에서 텍스트를 추출하는 함수
 */
export async function parsePdf(buffer: Buffer): Promise<DocumentContent> {
  try {
    console.log("📄 PDF 파일 파싱 시작...");

    const data = await pdf(buffer);

    console.log(`✅ PDF 파싱 완료 (${data.text.length}자)`);

    return {
      text: data.text.trim(),
      title: data.info?.Title || "PDF 문서",
      metadata: {
        pageCount: data.numpages,
        author: data.info?.Author,
        subject: data.info?.Subject,
        keywords: data.info?.Keywords
          ? data.info.Keywords.split(",").map((k: string) => k.trim())
          : undefined,
      },
    };
  } catch (error) {
    console.error("❌ PDF 파싱 오류:", error);
    throw new Error(
      "PDF 파일을 읽을 수 없습니다. 파일이 손상되었거나 암호화되어 있을 수 있습니다."
    );
  }
}

/**
 * DOCX 파일에서 텍스트를 추출하는 함수
 */
export async function parseDocx(buffer: Buffer): Promise<DocumentContent> {
  try {
    console.log("📝 DOCX 파일 파싱 시작...");

    const result = await mammoth.extractRawText({ buffer });

    console.log(`✅ DOCX 파싱 완료 (${result.value.length}자)`);

    return {
      text: result.value.trim(),
      title: "Word 문서",
      metadata: {
        author: undefined,
        subject: undefined,
      },
    };
  } catch (error) {
    console.error("❌ DOCX 파싱 오류:", error);
    throw new Error(
      "DOCX 파일을 읽을 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다."
    );
  }
}

/**
 * TXT 파일에서 텍스트를 추출하는 함수
 */
export async function parseTxt(buffer: Buffer): Promise<DocumentContent> {
  try {
    console.log("📄 TXT 파일 파싱 시작...");

    const text = buffer.toString("utf-8");

    console.log(`✅ TXT 파싱 완료 (${text.length}자)`);

    return {
      text: text.trim(),
      title: "텍스트 문서",
      metadata: {
        author: undefined,
        subject: undefined,
      },
    };
  } catch (error) {
    console.error("❌ TXT 파싱 오류:", error);
    throw new Error("TXT 파일을 읽을 수 없습니다. 파일 인코딩을 확인해주세요.");
  }
}

/**
 * 파일 확장자에 따라 적절한 파서를 선택하는 함수
 */
export async function parseDocument(file: File): Promise<DocumentContent> {
  const buffer = Buffer.from(await file.arrayBuffer());

  // 파일 확장자 확인
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  console.log(`🔍 파일 분석: ${fileName} (${fileType})`);

  // PDF 파일
  if (fileName.endsWith(".pdf") || fileType === "application/pdf") {
    return await parsePdf(buffer);
  }

  // DOCX 파일
  if (
    fileName.endsWith(".docx") ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await parseDocx(buffer);
  }

  // DOC 파일 (구버전 Word)
  if (fileName.endsWith(".doc") || fileType === "application/msword") {
    throw new Error(
      "DOC 파일은 현재 지원하지 않습니다. DOCX 형식으로 변환 후 다시 시도해주세요."
    );
  }

  // TXT 파일
  if (fileName.endsWith(".txt") || fileType === "text/plain") {
    return await parseTxt(buffer);
  }

  // PPTX 파일 (향후 지원 예정)
  if (
    fileName.endsWith(".pptx") ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    throw new Error(
      "PPTX 파일은 현재 지원하지 않습니다. PDF로 변환 후 다시 시도해주세요."
    );
  }

  // PPT 파일 (향후 지원 예정)
  if (
    fileName.endsWith(".ppt") ||
    fileType === "application/vnd.ms-powerpoint"
  ) {
    throw new Error(
      "PPT 파일은 현재 지원하지 않습니다. PDF로 변환 후 다시 시도해주세요."
    );
  }

  throw new Error(
    "지원하지 않는 파일 형식입니다. PDF, DOCX, TXT 파일만 지원합니다."
  );
}

/**
 * 파일 크기 제한 확인
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * 지원하는 파일 형식 확인
 */
export function isSupportedFileType(file: File): boolean {
  const supportedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const supportedExtensions = [".pdf", ".docx", ".txt"];
  const fileName = file.name.toLowerCase();

  return (
    supportedTypes.includes(file.type) ||
    supportedExtensions.some((ext) => fileName.endsWith(ext))
  );
}
