# MagnaX Platform — Architektur­entscheidungen

Dieses Dokument fasst die Entscheidungen zusammen, die das Scaffold
dieses Repositories prägen, und begründet sie kurz. Nachfolgende
Commits sollten es fortschreiben, wenn sich Annahmen ändern.

## 1. Monorepo · pnpm Workspaces

Die beiden Produkt-Apps teilen sich Design-Tokens, Typen und
Mock-Services. Ein einziger Workspace ermöglicht:

- typsichere Imports aus `@magnax/shared` ohne zwischengeschobene Build-
  und Publish-Pipeline,
- einen gemeinsamen `tsconfig.base.json`,
- eine einzige Quelle der Wahrheit für Hardware-Produkt-Metadaten
  (Capability-Matrix, Preise, Taglines).

`pnpm` wurde wegen strikter Phantom-Deps-Vermeidung, Workspaces-First
Design und guter Native-Unterstützung gewählt.

## 2. Mobile · React Native (Expo) statt Flutter

- **Gemeinsame Sprache** (TypeScript) mit dem Desktop, dadurch
  einheitliches Domänenmodell.
- **Expo Router + Reanimated 3** geben die nötige Performance für die
  Splash- und Onboarding-Animationen.
- **BLE-Reife**: `react-native-ble-plx` ist produktionsreif — der
  Service-Layer in `src/services/ble.ts` ist so designt, dass das Mock
  später 1:1 durch einen realen Scanner ersetzt wird (identisches
  Listener-Contract).

## 3. Desktop · Next.js 15 + optionaler Electron-Wrapper

- Das Web-Bundle ist die Source of Truth. Electron wird in einer
  späteren Phase als Wrapper ergänzt, insbesondere wenn lokale
  MQTT-Brücken oder Offline-Funktionalität gebraucht werden.
- **Tailwind + CSS-Custom-Layer (`.glass-card`, `.stat-pill`)** geben
  die Leitstand-Ästhetik mit minimalem Laufzeit-Overhead. Farben und
  Typo werden aus `@magnax/shared` importiert, damit kein Fork der
  Design-Tokens entstehen kann.

## 4. State-Management

- **Mobile**: `zustand` für lokalen UI-State (Geräte-Snapshot,
  Setup-Fortschritt). Klein, typisiert, SSR-unabhängig. Migriert später
  problemlos auf `TanStack Query` für Remote-State, sobald das Backend
  steht.
- **Desktop**: identisch — `zustand` für UI-State, TanStack Query (wird
  in Phase 2 eingeführt) für Remote-State / SWR-Muster.

## 5. Transport · MQTT, gekapselt

Die gesamte Kommunikation mit Geräten läuft über eine MQTT-Fassade
(`apps/mobile/src/services/mqtt.ts`). Heute steht dahinter ein
`MockMqttClient`, der Commands zurück als State-Events echot — das
entspricht exakt dem späteren Broker-Verhalten. Der Umstieg auf
`mqtt.js` gegen Mosquitto/HiveMQ/AWS-IoT ist ein einzeiliger Swap.

Topics folgen dem Muster:

```
magnax/device/<deviceId>/command   ← App → Gerät
magnax/device/<deviceId>/state     ← Gerät → App (retained)
magnax/device/<deviceId>/sensors
magnax/device/<deviceId>/firmware
magnax/mesh/topology
magnax/mesh/<nodeId>/health
```

## 6. Design-Tokens · Single Source

Alle sichtbaren Farben, Schrift- und Spacing-Werte kommen aus
`packages/shared/src/tokens`. Tailwind (Desktop) und der `ThemeProvider`
(Mobile) importieren exakt dieselben Objekte. So garantiert: Ein
geändertes CI-Teal schlägt in beiden Apps durch.

## 7. Strict-Typing

- `noUncheckedIndexedAccess` — kein `array[i]` ohne Guard.
- `exactOptionalPropertyTypes` — `{ x?: T }` und `{ x: T | undefined }`
  bleiben distinkt.
- `any` ist per ESLint-Regel verboten.

## 8. Onboarding-Zustandsmaschine

`useSetupStore` modelliert den Wizard als lineare Maschine mit
Schritten `product → bluetooth → wifi → room → test → complete`. Der
`discoveredDeviceId` wird sobald verfügbar im Device-Store eingetragen,
so dass der Funktionstest-Screen direkt gegen den echten (bzw.
Mock-)MQTT-Topic arbeitet.

## 9. Nächste Iterationen

Phase 2 erweitert:

1. **Automationen-Engine** (Trigger/Condition/Action) — DSL-first, im
   `@magnax/shared` Paket, damit beide Apps identisch rendern.
2. **Szenen-Editor** mit Live-Preview (Mobile) und Bulk-Editing
   (Desktop).
3. **Energie-Analytics**: Zeitreihe in Supabase/TimescaleDB, dieselben
   Aggregate per Edge Function.
4. **Grundriss-Editor + Heatmap** (Desktop) mit Konva.js.
5. **Mesh-Topologie-Visualisierung** (Desktop) mit D3 Force-Directed.
6. **Abo-Logik**: Stripe-Gateway, Server-seitige Feature-Flags per Tier.

## 10. Security-Grundlinien

- TLS 1.3 überall; MQTT via WSS.
- Keine Klartext-WLAN-Passwörter ins Backend — Provisioning läuft via
  SoftAP + lokalem Schlüsselaustausch (später durch Matter-Commissioning
  ersetzt).
- RBAC-Rollen sind im Typ `UserRole` schon deklariert und werden im
  Backend zuerst enforced, nicht in der UI.
- DSGVO: Datenexport/-löschung ist als Profileinstellung vorgesehen
  (Phase 2).
