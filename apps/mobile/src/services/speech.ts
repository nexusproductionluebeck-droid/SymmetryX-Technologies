import { Platform } from 'react-native';

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
}

/**
 * Tiny facade around the browser SpeechSynthesis API so the rest of
 * the app stays platform-agnostic. On native (iOS / Android builds)
 * this is a no-op for now — add expo-speech there when we ship
 * native binaries.
 *
 * Safari on iOS blocks speech without a prior user gesture; the
 * Intro's sound-toggle solves that by giving the user an explicit
 * tap to enable it.
 */

function getSynth(): SpeechSynthesis | null {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  return window.speechSynthesis;
}

export function speechAvailable(): boolean {
  return getSynth() !== null;
}

function pickGermanVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  // Prefer a neural German voice if the platform advertises one.
  const preferredOrder = [
    'de-DE-Neural2-F',
    'Anna',
    'Markus',
    'Petra',
  ];
  for (const name of preferredOrder) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }
  // Otherwise take the first German voice.
  return voices.find((v) => v.lang.toLowerCase().startsWith('de')) ?? null;
}

export function speak(text: string, options: SpeakOptions = {}): void {
  const synth = getSynth();
  if (!synth) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang ?? 'de-DE';
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  const voice = options.voiceName
    ? synth.getVoices().find((v) => v.name === options.voiceName) ?? null
    : pickGermanVoice(synth);
  if (voice) utterance.voice = voice;

  synth.speak(utterance);
}

export function cancelSpeech(): void {
  const synth = getSynth();
  if (!synth) return;
  synth.cancel();
}

/**
 * Warm up the voice catalogue. `getVoices()` is often empty on the
 * first call; calling this once at app boot (or on a user gesture)
 * triggers the `voiceschanged` event and makes subsequent lookups
 * synchronous.
 */
export function primeSpeechVoices(): void {
  const synth = getSynth();
  if (!synth) return;
  synth.getVoices();
}
