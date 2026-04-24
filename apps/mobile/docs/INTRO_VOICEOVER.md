# Intro-Voiceover (echte Sprachaufnahme)

Der 20-Sekunden-Intro-Screen läuft aktuell **ohne** Sprache. Die Browser-
Sprachsynthese (Web Speech API) ist probiert worden und klingt
roboterhaft — nicht passend für eine Kino-Trailer-Marke.

Um eine **richtige, menschliche Sprecher-Stimme** einzubauen, liefern
wir in einem künftigen Commit eine MP3-Datei aus:

```
apps/mobile/assets/audio/intro-voiceover.mp3   ← ca. 20 s, 128–192 kbps
```

## Empfohlene Quellen für die Aufnahme

| Weg | Zeitaufwand | Kosten |
| --- | --- | --- |
| **Professioneller Sprecher** (z. B. über voice123.com, bodalgo.com) | 1–2 Tage | 80 – 300 € einmalig |
| **ElevenLabs** (KI-Stimme, klingt wie echte Person) | 30 Minuten | ab 5 €/Monat |
| **PlayHT / WellSaid** (KI, ähnlich) | 30 Minuten | ab 10 €/Monat |

Für einen Trailer-Ton reicht normalerweise eine einzige, gut gesprochene,
tiefe männliche Stimme. Der Sprecher braucht die folgenden vier Zeilen
mit jeweils kleiner Pause davor:

```
0:01  Deine Decke.
0:06  Wird intelligent.
0:11  Ein System. Alles in einem Punkt.
0:17  MAGNA-X. Die Revolution der Deckeninfrastruktur.
```

**Empfehlung für die Aufnahme**: ruhiger Raum, ein bisschen Hall (Reverb)
mischen — das gibt den Trailer-Kino-Effekt. Ein Sprecher-Clip in der
Art von „Don LaFontaine" (legendärer Hollywood-Trailer-Sprecher) passt
zum Ton den wir suchen.

## Einbau — so sieht der Commit aus

Sobald die Datei da ist, schickst du sie rein, ich:

1. Lege die MP3 in `apps/mobile/assets/audio/` ab
2. Installiere `expo-audio` (oder `expo-av` falls älter)
3. Erweitere `PresentationIntro.tsx` um einen Audio-Player, der beim
   Start das MP3 anspielt und beim Skip stoppt
4. Führe Feature-Flag `FEATURES.INTRO_VOICEOVER` wieder ein, standardmäßig
   `true`
5. Committee Sound-Toggle unten rechts im Intro — damit der Presenter
   bei lauten Messen mit einem Tap stumm stellen kann
