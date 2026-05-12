import { ProgressCallback, DecodeResult } from '../types';
import { encryptData, decryptData } from './crypto';
import { fileToBase64, base64ToUint8Array, uint8ArrayToBase64, textToBase64, base64ToText } from './fileHelpers';

const DELIMITER = '<<<STEGIFY_END>>>';
const BITS_PER_CHANNEL = 2; // use 2 LSBs per channel for balance of capacity vs quality
const CHANNELS = 3; // R, G, B (skip alpha for compatibility)
const BITS_PER_PIXEL = BITS_PER_CHANNEL * CHANNELS;

export function getImageCapacity(width: number, height: number): number {
  const totalBits = width * height * BITS_PER_PIXEL;
  return Math.floor(totalBits / 8) - 50; // subtract header overhead
}

function loadImageData(file: File): Promise<{ ctx: OffscreenCanvasRenderingContext2D; canvas: OffscreenCanvas; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Cannot get canvas context')); return; }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve({ ctx, canvas, width: img.width, height: img.height });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
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
  const { ctx, canvas, width, height } = await loadImageData(coverFile);

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

  const payload = JSON.stringify({
    filename,
    mimeType,
    data: base64Data,
  });

  let finalPayload = payload;
  if (password) {
    onProgress(25, 'Encrypting…');
    finalPayload = 'ENC:' + encryptData(payload, password);
  }

  const messageWithDelimiter = finalPayload + DELIMITER;
  const messageBytes = stringToBytes(messageWithDelimiter);
  const capacity = getImageCapacity(width, height);

  if (messageBytes.length > capacity) {
    throw new Error(
      `Payload too large: ${messageBytes.length} bytes needed, but image only holds ${capacity} bytes. Use a larger cover image.`
    );
  }

  onProgress(35, 'Embedding data…');
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let byteIndex = 0;
  let bitIndex = 0;
  const totalBits = messageBytes.length * 8;
  let pixelOffset = 0;

  while (byteIndex < messageBytes.length) {
    const byte = messageBytes[byteIndex];
    const channelIndex = pixelOffset * 4 + Math.floor(bitIndex / BITS_PER_CHANNEL / CHANNELS) * 4;

    for (let ch = 0; ch < CHANNELS && byteIndex < messageBytes.length; ch++) {
      const pixIdx = (Math.floor((byteIndex * 8 + bitIndex) / BITS_PER_PIXEL) * 4) + ch;
      if (pixIdx >= pixels.length) break;

      const bitsToWrite = Math.min(BITS_PER_CHANNEL, 8 - (byteIndex * 8 + bitIndex) % 8);
      let val = pixels[pixIdx];
      const mask = (1 << bitsToWrite) - 1;
      val = (val & ~mask) | ((byte >> bitIndex) & mask);
      pixels[pixIdx] = val;
      bitIndex += bitsToWrite;

      if (bitIndex >= 8) {
        bitIndex -= 8;
        byteIndex++;
        if (byteIndex < messageBytes.length && byteIndex % Math.floor(messageBytes.length / 10) === 0) {
          const pct = 35 + Math.floor((byteIndex / messageBytes.length) * 55);
          onProgress(pct, 'Embedding data…');
        }
      }
    }
    pixelOffset++;
    if (pixelOffset > width * height) break;
  }

  // Simpler, correct embedding: pack bits sequentially
  // Reset and redo with a correct algorithm
  const imageData2 = ctx.getImageData(0, 0, width, height);
  const pixels2 = imageData2.data;

  embedBytes(pixels2, messageBytes, onProgress);

  ctx.putImageData(imageData2, 0, 0);
  onProgress(95, 'Finalizing PNG…');
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  onProgress(100, 'Done!');
  return blob;
}

function embedBytes(pixels: Uint8ClampedArray, bytes: Uint8Array, onProgress: ProgressCallback) {
  // Each channel stores BITS_PER_CHANNEL bits. We skip the alpha channel.
  // Channel order per pixel: R(0), G(1), B(2) — indices 0,1,2 within each pixel's 4 bytes.
  let bitPos = 0; // global bit position in message

  for (let byteIdx = 0; byteIdx < bytes.length; byteIdx++) {
    const b = bytes[byteIdx];
    for (let bit = 0; bit < 8; bit += BITS_PER_CHANNEL) {
      const channelPos = Math.floor(bitPos / BITS_PER_CHANNEL);
      const pixelIdx = Math.floor(channelPos / CHANNELS);
      const channelInPixel = channelPos % CHANNELS;
      const arrayIdx = pixelIdx * 4 + channelInPixel;

      if (arrayIdx >= pixels.length) return;

      const mask = (1 << BITS_PER_CHANNEL) - 1;
      const bits = (b >> bit) & mask;
      pixels[arrayIdx] = (pixels[arrayIdx] & ~mask) | bits;
      bitPos += BITS_PER_CHANNEL;
    }

    if (byteIdx % 5000 === 0 && bytes.length > 0) {
      const pct = 35 + Math.floor((byteIdx / bytes.length) * 60);
      onProgress(pct, 'Embedding data…');
    }
  }
}

export async function decodeFromImage(
  encodedFile: File,
  password: string | undefined,
  onProgress: ProgressCallback
): Promise<DecodeResult> {
  onProgress(5, 'Loading image…');
  const { ctx, width, height } = await loadImageData(encodedFile);

  onProgress(20, 'Reading pixel data…');
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  onProgress(35, 'Extracting hidden bits…');

  const delimBytes = stringToBytes(DELIMITER);
  const extractedBytes: number[] = [];
  let bitPos = 0;
  let currentByte = 0;
  let bitInByte = 0;
  let found = false;

  const maxBytes = getImageCapacity(width, height) + delimBytes.length + 200;

  outer: while (true) {
    const channelPos = Math.floor(bitPos / BITS_PER_CHANNEL);
    const pixelIdx = Math.floor(channelPos / CHANNELS);
    const channelInPixel = channelPos % CHANNELS;
    const arrayIdx = pixelIdx * 4 + channelInPixel;

    if (arrayIdx >= pixels.length || extractedBytes.length > maxBytes) break;

    const mask = (1 << BITS_PER_CHANNEL) - 1;
    const bits = pixels[arrayIdx] & mask;
    currentByte |= bits << bitInByte;
    bitInByte += BITS_PER_CHANNEL;
    bitPos += BITS_PER_CHANNEL;

    if (bitInByte >= 8) {
      extractedBytes.push(currentByte & 0xff);
      currentByte = 0;
      bitInByte = 0;

      // Check for delimiter at tail
      if (extractedBytes.length >= delimBytes.length) {
        const tail = extractedBytes.slice(-delimBytes.length);
        if (tail.every((v, i) => v === delimBytes[i])) {
          found = true;
          break outer;
        }
      }

      if (extractedBytes.length % 10000 === 0) {
        const pct = 35 + Math.floor((extractedBytes.length / maxBytes) * 50);
        onProgress(Math.min(pct, 85), 'Extracting…');
      }
    }
  }

  if (!found) throw new Error('No hidden data found in this image, or it was not encoded with STEGIFY.');

  onProgress(88, 'Parsing payload…');

  // Strip delimiter
  const payloadBytes = new Uint8Array(extractedBytes.slice(0, extractedBytes.length - delimBytes.length));
  let payloadStr = bytesToString(payloadBytes);

  if (payloadStr.startsWith('ENC:')) {
    if (!password) throw new Error('This image is password-protected. Please provide the password.');
    onProgress(92, 'Decrypting…');
    payloadStr = decryptData(payloadStr.slice(4), password);
  }

  const parsed = JSON.parse(payloadStr);
  const { filename, mimeType, data: base64Data } = parsed;
  const dataBytes = base64ToUint8Array(base64Data);

  let text: string | undefined;
  if (mimeType === 'text/plain') {
    text = base64ToText(base64Data);
  }

  onProgress(100, 'Done!');
  return { type: mimeType === 'text/plain' ? 'text' : 'file', filename, mimeType, data: dataBytes, text };
}
