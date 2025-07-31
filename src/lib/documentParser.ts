// 클라이언트 사이드에서 사용할 수 있는 유틸리티 함수들만 export
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
