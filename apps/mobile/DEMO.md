# MagnaX — Demo für Madeline

Dies ist der direkte Weg, um Madeline Nolte die aktuelle Version der MagnaX-App
auf ihrem Handy zu zeigen.

Du hast drei Optionen, sortiert nach „schnellster Weg zuerst".

---

## Option A · Sofort teilbarer Link (empfohlen)

**Was sie bekommt**: Einen Link. Sie öffnet ihn im Browser, tippt
„Zum Home-Bildschirm hinzufügen", und MagnaX sieht ab dann auf ihrem
Handy aus wie eine echte App — mit SymmetryX-Logo im Dock, startet
im Vollbild, ohne Browser-UI.

**Technik im Hintergrund**: Progressive Web App (PWA) aus dem
Expo-Web-Build. Fertig gepackt unter
`apps/mobile/deliverables/MagnaX-App-Preview.zip` (1 MB).

### Schritt-für-Schritt

1. **Den Build auf einen Webhoster hochladen** (kostenlos, 2 Minuten):

   **Vercel** (am einfachsten):
   ```bash
   cd apps/mobile/dist
   npx vercel --prod
   ```
   Beim ersten Mal fragt Vercel nach E-Mail und bestätigt per Link.
   Am Ende kommt eine URL wie `https://magnax-xyz.vercel.app`.

   **Alternativen**:
   - **Netlify Drop**: https://app.netlify.com/drop — Zip-Datei
     (`MagnaX-App-Preview.zip` entpackt) per Drag-and-Drop auf die Seite
     werfen. Sofort eine URL.
   - **GitHub Pages / Cloudflare Pages**: Ebenfalls kostenlos, ähnliche
     Handhabung.

2. **URL an Madeline schicken** (WhatsApp, Signal, E-Mail).

3. **Madeline öffnet den Link in Safari (iPhone) oder Chrome (Android)**:
   - iPhone: Teilen-Button → „Zum Home-Bildschirm" → auf dem Home-
     Screen erscheint das MagnaX-Icon. Tippen → App startet im
     Vollbild mit unserem Splash.
   - Android: Menü (drei Punkte) → „Zur Startseite hinzufügen".

**Vorteile**: Kein App-Store-Upload, kein Apple-Account, keine
Developer-Gebühr. Madeline kann jederzeit testen. Wenn du Änderungen
am Code machst und neu deployst, sieht sie beim nächsten Öffnen die
neue Version automatisch.

**Einschränkungen der Web-Version**: Bluetooth-Scan und Haptik-Feedback
funktionieren im Browser **nicht**. Für die Demo sind die Mock-Daten
genau das, was wir wollen — Madeline klickt durch den kompletten Flow
und sieht Dimmer, Farbtemperatur, Home-Dashboard, Onboarding-Animation.

---

## Option B · Native App via Expo Go (mit Bluetooth + Haptik)

Wenn Madeline die App **mit** funktionierender Haptik und echter
Native-Performance sehen will:

1. Madeline installiert **Expo Go** aus dem App Store / Play Store
   (kostenlos, einmalig).
2. Du startest auf deinem Rechner:
   ```bash
   pnpm --filter @magnax/mobile start:tunnel
   ```
3. Du schickst ihr den `exp://…` Link, der im Terminal erscheint.
4. Sie tippt auf den Link → MagnaX läuft nativ.

Details siehe [`QUICKSTART.md`](QUICKSTART.md).

**Nachteil**: Der Tunnel lebt nur, solange dein Dev-Server läuft.

---

## Option C · Echter APK-Build (für dauerhafte Installation)

Wenn du ihr eine echte App-Datei schicken willst, die auch ohne Expo Go
und ohne laufenden Dev-Server installiert bleibt:

**Voraussetzung**: Kostenloser Expo-Account.

```bash
# Einmalig
npm install -g eas-cli
eas login

# Jedes Mal, wenn du eine neue APK willst
cd apps/mobile
eas build --platform android --profile preview
```

EAS baut in der Cloud (~8 Minuten) und gibt dir einen Download-Link.
Den schickst du Madeline. Sie lädt die `.apk` auf ihr Android-Handy,
installiert sie (muss einmal „Installationen aus unbekannter Quelle"
erlauben), und hat MagnaX dauerhaft drauf.

**Für iOS**: Gleiches Prinzip, aber Apple verlangt einen Developer
Account (99 €/Jahr) und Madelines Gerät muss vorher in TestFlight
registriert werden.

---

## Zusammenfassung

| Option | Zeit bis Demo | Dauerhaft? | Bluetooth/Haptik |
| --- | --- | --- | --- |
| **A · Web-PWA** | ~5 Min | ✅ | ❌ |
| **B · Expo Go** | ~3 Min | ❌ (Server muss laufen) | ✅ |
| **C · Native APK** | ~15 Min (einmalige Einrichtung) | ✅ | ✅ |

Für den ersten Eindruck an Madeline empfehle ich **Option A**. Sie
sieht die komplette Design-Sprache in 30 Sekunden und hat MagnaX als
Icon auf ihrem Homescreen. Wenn sie tiefer einsteigen will, schiebst
du Option C hinterher.

---

## Was sie in der App zu sehen bekommt

**Splash-Screen**: Pulsierende magnetische Ringe, MagnaX-Logo aus dem
Zentrum, Wordmark „MagnaX" mit Untertitel „by SymmetryX Technologies".

**Welcome-Carousel**: Drei Slides (Verbinden · Steuern · Automatisieren)
mit eigener SVG-Illustration pro Slide, Parallax-Animation beim Wischen,
drift-animierter Hintergrund aus zwei Auroren und Sternkonstellation.

**Guided-Setup**: Fünf-Schritte-Onboarding mit Glass-Morphism-Cards,
haptischem Feedback, animierter Status-LED.

**Geräte-Detail (das Herzstück)**: Radialer Dimmer als Cockpit-Knopf,
dahinter ein warm/kalter Farbhalo, der sich in Echtzeit mit der
Farbtemperatur verändert. Es fühlt sich an, als würde das Licht aus
dem Bildschirm strahlen.

**Home-Dashboard**: KPI-Kacheln mit Live-Werten, Geräte-Karten im Glass-
Look, aktive Geräte glühen im SymmetryX-Teal.
