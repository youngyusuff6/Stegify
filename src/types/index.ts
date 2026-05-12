export interface FileMetadata {
  filename: string;
  mimeType: string;
  fileSize: number;
}

export interface EncodedPayload {
  metadata: FileMetadata;
  data: string; // base64
}

export interface EncodeOptions {
  coverImage: File;
  secretFile?: File;
  secretText?: string;
  password?: string;
}

export interface DecodeOptions {
  encodedImage: File;
  password?: string;
}

export interface DecodeResult {
  type: 'file' | 'text';
  filename: string;
  mimeType: string;
  data: Uint8Array;
  text?: string;
}

export interface CapacityInfo {
  totalBytes: number;
  usedBytes: number;
  percentage: number;
  width: number;
  height: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export type ProgressCallback = (percent: number, message?: string) => void;
