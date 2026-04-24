/**
 * Feature flags for the mobile app.
 *
 * Flip these for pitches / general availability. Keep it stupid —
 * one file, plain constants, no runtime config. When we go live to
 * customers, `SHOW_PRESENTATION_INTRO` moves to `false`.
 */

export const FEATURES = {
  /**
   * Play the 20-second cinematic intro before the app's splash.
   * Switch to `false` for customer-facing builds.
   */
  SHOW_PRESENTATION_INTRO: true,
  /**
   * Narrate the intro beats with the browser's German speech
   * synthesis voice. If the browser blocks autoplay (iOS Safari),
   * the user sees a sound toggle and can enable it manually.
   */
  INTRO_VOICEOVER: true,
} as const;
