export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_TEXT_CHARS = 200_000;

export const ALLOWED_FILE_TYPES = ["pdf", "docx", "txt"] as const;
export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
