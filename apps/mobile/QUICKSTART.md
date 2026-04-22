# MagnaX App — Quickstart

Dieses Dokument ist für **dich als Entwickler-Einsteiger** geschrieben. Es
erklärt in drei kleinen Abschnitten, wie du die App startest und wie dein
Chef sie **ohne App Store** auf seinem Handy öffnen kann.

---

## 1. Einmal vorbereiten (5 Minuten)

Installiere auf deinem Rechner:

1. **Node.js 20 oder neuer** — https://nodejs.org
2. **pnpm** — in einem Terminal:
   ```bash
   npm install -g pnpm
   ```

Dann im Projektordner:

```bash
pnpm install
```

Das lädt alle Abhängigkeiten für **alle** Apps im Monorepo. Dauert beim
ersten Mal ein paar Minuten.

> Wenn Expo meckert, dass Pakete nicht zum SDK passen, einmal ausführen:
>
> ```bash
> pnpm --filter @magnax/mobile exec expo install --fix
> ```

---

## 2. App auf deinem eigenen Handy testen

Du brauchst nichts zu bauen, nichts zu signieren, keinen Account.

### Schritt-für-Schritt

**a) Expo Go installieren**

Lade die kostenlose App **„Expo Go"** aus dem App Store (iOS) oder Play
Store (Android) auf dein Handy.

**b) Dev-Server starten**

Im Projektordner auf deinem Rechner:

```bash
pnpm mobile
```

Im Terminal erscheint ein QR-Code.

**c) QR-Code scannen**

- **iPhone**: Öffne die normale Kamera-App, halte sie auf den QR-Code,
  tippe auf die Benachrichtigung „In Expo Go öffnen".
- **Android**: Öffne Expo Go → "Scan QR code" → halte die Kamera auf den
  Code.

Die MagnaX-App startet auf deinem Handy. Änderungen im Code erscheinen
sofort — kein Neustart nötig.

> **Wichtig**: Handy und Rechner müssen im **gleichen WLAN** sein.

---

## 3. Vorschau an deinen Chef schicken

Dein Chef soll die App auf **seinem** Handy sehen, ohne dass er im selben
WLAN sitzt. Das geht so:

**a) Dev-Server im Tunnel-Modus starten**

```bash
pnpm --filter @magnax/mobile start:tunnel
```

Expo baut dann einen öffentlichen Tunnel auf (kostenlos, über Expo-
Infrastruktur). Im Terminal erscheint jetzt zusätzlich ein Link in der
Form:

```
exp://u.expo.dev/…
```

**b) Dein Chef installiert Expo Go einmalig**

Er braucht auf seinem Handy **Expo Go** (App Store / Play Store, kostenlos).

**c) Du schickst ihm den Link**

Einfach per E-Mail, WhatsApp oder Teams. Er tippt drauf → Expo Go
öffnet sich → die MagnaX-App läuft.

Auf seinem Home-Screen steht unter dem Icon **„MagnaX"**, das Icon
zeigt das SymmetryX-Logo mit Teal-Akzent auf Navy.

> **Grenzen des Tunnel-Modus**: Der Tunnel lebt nur, solange dein Dev-
> Server auf deinem Rechner läuft. Sobald du das Terminal schließt, ist
> der Link tot. Für eine dauerhaftere Lösung siehe Abschnitt 4.

---

## 4. Später: Eigenständige App-Datei (EAS Build)

Wenn du später eine **eigene `.apk` (Android)** oder **`.ipa` (iOS)**
willst, die dein Chef auch ohne Expo Go und ohne laufenden Dev-Server
auf dem Handy hat, nutzt man **EAS Build**.

Das ist der nächste Schritt, den wir gemeinsam machen, sobald du sagst:
„Jetzt will ich eine richtige Installations-Datei." Kurz zur
Orientierung:

| Platform | Voraussetzung | Ergebnis |
| --- | --- | --- |
| Android | Kostenloser Expo-Account | `.apk`-Datei, einfach per Link oder USB auf jedes Android-Gerät |
| iOS | Apple Developer Account (99 €/Jahr) | `.ipa` via TestFlight, bis zu 100 Tester |

Für **den ersten Demo an deinen Chef ist das nicht nötig.** Abschnitt 3
(Expo Go + Tunnel) reicht.

---

## 5. Branding überarbeiten

Du willst das Logo oder den Splash anpassen? Alle Quell-SVGs liegen
unter:

```
apps/mobile/assets/src/
  ├─ app-icon.svg           ← App-Icon (1024×1024)
  ├─ adaptive-foreground.svg ← Android-Adaptive-Icon (Vordergrund)
  └─ splash.svg              ← Startbildschirm
```

Nach Änderung einmal ausführen:

```bash
node scripts/generate-icons.mjs
```

Das regeneriert automatisch die PNG-Dateien in `apps/mobile/assets/`.

---

## 6. Häufige Probleme

**„QR-Code funktioniert nicht"**
→ Handy und Rechner im gleichen WLAN? Falls nicht, nutze
`pnpm --filter @magnax/mobile start:tunnel` statt `pnpm mobile`.

**„Expo Go zeigt einen Fehler beim Laden"**
→ Im Terminal `r` drücken, um neu zu laden. Wenn das nicht hilft, im
Terminal `Strg+C`, dann:
```bash
pnpm --filter @magnax/mobile exec expo start -c
```
Das `-c` leert den Cache.

**„pnpm install schlägt fehl"**
→ Stelle sicher, dass du Node 20+ hast: `node --version`.

---

## Wo sind wir gerade?

In der aktuellen App-Version funktioniert (alles mit Mock-Hardware,
daher ohne echtes MagnaX-Gerät demonstrierbar):

- ✅ Splash-Screen mit MagnaX-Logo und SymmetryX-Beschriftung
- ✅ Welcome-Carousel (3 Slides: Verbinden · Steuern · Automatisieren)
- ✅ Login-Screen
- ✅ Kompletter Setup-Wizard: Produktwahl → Bluetooth-Scan →
  WLAN → Raumzuweisung → Funktionstest → Abschluss
- ✅ Home-Dashboard mit Gerätekarten
- ✅ Geräte-Detail mit Helligkeits-Dimmer und Farbtemperatur-Slider

Das reicht für einen überzeugenden Demo-Termin mit deinem Chef.
