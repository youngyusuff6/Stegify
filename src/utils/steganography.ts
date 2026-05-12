import type { ProgressCallback, DecodeResult } from '../types';
import { encryptData, decryptData } from './crypto';
import { fileToBase64, base64ToUint8Array, base64ToText, textToBase64 } from './fileHelpers';

const DELIMITER = '<<<STEGIFY_END>>>';
// Use 2 LSBs per channel, 3 channels (R,G,B) per pixel → 6 bits/pixel = 0.75 bytes/pixel
const BITS_PER_CHANNEL = 2;
const CHANNELS_USED = 3; // R, G, B only (skip alpha)

export function getImageCapacity(width: number, height: number): number {
  const totalBits = width * height * BITS_PER_CHANNEL * CHANNELS_USED;
  return Math.floor(totalBits / 8) - 64; // reserve margin for header/rounding
}

function loadImage(file: File): Promise<{ canvas: OffscreenCanvas; ctx: OffscreenCanvasRenderingContext2D; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve({ canvas, ctx, width: img.width, height: img.height });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

/**
 * Embed bytes into pixel data using 2-LSB per R/G/B channel.
 * Layout: each byte is split into four 2-bit chunks written to consecutive channels.
 * Channel order per pixel group: R0,G0,B0, R1,G1,B1, ...
 * Bit packing within a byte (little-endian): bits[1:0], bits[3:2], bits[5:4], bits[7:6]
 */
function embedBytes(pixels: Uint8ClampedArray, bytes: Uint8Array, onProgress: ProgressCallback, progressStart: number, progressEnd: number) {
  const mask = (1 << BITS_PER_CHANNEL) - 1; // 0b11
  let channelPos = 0; // logical channel index (R=0,G=1,B=2 of pixel 0; R=3,G=4,... etc.)

  for (let byteIdx = 0; byteIdx < bytes.length; byteIdx++) {
    const b = bytes[byteIdx];
    // Each byte needs 8/BITS_PER_CHANNEL = 4 channel slots
    for (let shift = 0; shift < 8; shift += BITS_PER_CHANNEL) {
      const chunkInPixel = channelPos % CHANNELS_USED; // 0=R,1=G,2=B
      const pixelIdx = Math.floor(channelPos / CHANNELS_USED);
      const arrayIdx = pixelIdx * 4 + chunkInPixel; // *4 because RGBA
      if (arrayIdx >= pixels.length) return;

      const bits = (b >> shift) & mask;
      pixels[arrayIdx] = (pixels[arrayIdx] & ~mask) | bits;
      channelPos++;
    }

    if (byteIdx % 8000 === 0 && bytes.length > 0) {
      const pct = progressStart + ((byteIdx / bytes.length) * (progressEnd - progressStart));
      onProgress(Math.round(pct), 'Embedding data…');
    }
  }
}

function extractBytes(pixels: Uint8ClampedArray, maxBytes: number, onProgress: ProgressCallback): Uint8Array {
  const mask = (1 << BITS_PER_CHANNEL) - 1;
  const result: number[] = [];
  let channelPos = 0;

  while (result.length < maxBytes) {
    let b = 0;
    for (let shift = 0; shift < 8; shift += BITS_PER_CHANNEL) {
      const chunkInPixel = channelPos % CHANNELS_USED;
      const pixelIdx = Math.floor(channelPos / CHANNELS_USED);
      const arrayIdx = pixelIdx * 4 + chunkInPixel;
      if (arrayIdx >= pixels.length) break;

      const bits = pixels[arrayIdx] & mask;
      b |= bits << shift;
      channelPos++;
    }
    result.push(b & 0xff);

    if (result.length % 10000 === 0) {
      const pct = 40 + Math.round((result.length / maxBytes) * 45);
      onProgress(Math.min(pct, 85), 'Extracting…');
    }
  }

  return new Uint8Array(result);
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export async function encodeIntoImage(
  coverFile: File,
  secretFile: File | undefined,
  secretText: string | undefined,
  password: string | undefined,
  onProgress: ProgressCallback
): Promise<Blob> {
  onProgress(5, 'Loading image…');
  const { ctx, canvas, width, height } = await loadImage(coverFile);

  onProgress(15, 'Preparing payload…');

  let base64Data: string;
  let filename: string;
  let mimeType: string;

  if (secretFile) {
    base64Data = await fileToBase64(secretFile);
    filename = secretFile.name;
    mimeType = secretFile.type || 'application/octet-stream';
  } else if (secretText) {
    base64Data = textToBase64(secretText);
    filename = 'hidden_message.txt';
    mimeType = 'text/plain';
  } else {
    throw new Error('No secret content provided');
  }

  const payload = JSON.stringify({ filename, mimeType, data: base64Data });

  let finalPayload = payload;
  if (password) {
    onProgress(25, 'Encrypting…');
    finalPayload = 'ENC:' + encryptData(payload, password);
  }

  const messageBytes = stringToBytes(finalPayload + DELIMITER);
  const capacity = getImageCapacity(width, height);

  if (messageBytes.length > capacity) {
    throw new Error(
      `Payload too large: needs ${messageBytes.length.toLocaleString()} bytes, but image capacity is ${capacity.toLocaleString()} bytes. Use a larger cover image.`
    );
  }

  onProgress(35, 'Embedding data…');
  const imageData = ctx.getImageData(0, 0, width, height);
  embedBytes(imageData.data, messageBytes, onProgress, 35, 92);
  ctx.putImageData(imageData, 0, 0);

  onProgress(95, 'Finalizing PNG…');
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  onProgress(100, 'Done!');
  return blob;
}

export async function decodeFromImage(
  encodedFile: File,
  password: string | undefined,
  onProgress: ProgressCallback
): Promise<DecodeResult> {
  onProgress(5, 'Loading image…');
  const { ctx, width, height } = await loadImage(encodedFile);

  onProgress(25, 'Reading pixel data…');
  const imageData = ctx.getImageData(0, 0, width, height);

  onProgress(40, 'Extracting hidden bits…');
  const capacity = getImageCapacity(width, height) + stringToBytes(DELIMITER).length + 128;
  const rawBytes = extractBytes(imageData.data, capacity, onProgress);

  onProgress(88, 'Scanning for delimiter…');
  const delimBytes = stringToBytes(DELIMITER);

  // Find delimiter position
  let delimIdx = -1;
  outer: for (let i = 0; i <= rawBytes.length - delimBytes.length; i++) {
    for (let j = 0; j < delimBytes.length; j++) {
      if (rawBytes[i + j] !== delimBytes[j]) continue outer;
    }
    delimIdx = i;
    break;
  }

  if (delimIdx === -1) {
    throw new Error('No hidden data found in this image. It may not have been encoded with STEGIFY.');
  }

  let payloadStr = bytesToString(rawBytes.slice(0, delimIdx));

  if (payloadStr.startsWith('ENC:')) {
    if (!password) throw new Error('This image is password-protected. Please enter the passphrase.');
    onProgress(92, 'Decrypting…');
    payloadStr = decryptData(payloadStr.slice(4), password);
  }

  onProgress(96, 'Parsing metadata…');
  let parsed: { filename: string; mimeType: string; data: string };
  try {
    parsed = JSON.parse(payloadStr);
  } catch {
    throw new Error('Failed to parse payload — the image may be corrupted or the password is wrong.');
  }

  const { filename, mimeType, data: base64Data } = parsed;
  const dataBytes = base64ToUint8Array(base64Data);

  let text: string | undefined;
  if (mimeType === 'text/plain') {
    text = base64ToText(base64Data);
  }

  onProgress(100, 'Done!');
  return {
    type: mimeType === 'text/plain' ? 'text' : 'file',
    filename,
    mimeType,
    data: dataBytes,
    text,
  };
}
