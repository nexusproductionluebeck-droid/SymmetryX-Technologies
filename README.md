# SymmetryX Technologies — MagnaX Platform

Monorepo für die gesamte Softwareplattform rund um **MagnaX** — das modulare
Deckeninfrastruktursystem von **SymmetryX Technologies S.L.**.

Zwei Client-Apps, ein Hardware-Ökosystem, ein Design-System.

| Paket | Beschreibung | Stack |
| --- | --- | --- |
| [`apps/mobile`](apps/mobile) | **MagnaX App** — iOS/Android Consumer-App | Expo · React Native · Reanimated · Zustand |
| [`apps/desktop`](apps/desktop) | **MagnaX Desktop** — Leitstand für Industrie & Hotellerie | Next.js 15 · React 19 · Tailwind CSS |
| [`packages/shared`](packages/shared) | Design-Tokens, Typen, Mock-Services (BLE + MQTT) | TypeScript (strict) |

## Quickstart

```bash
pnpm install

# Mobile (Expo dev server)
pnpm mobile

# Desktop (Next.js @ :3000)
pnpm desktop

# Typecheck das gesamte Repo
pnpm typecheck
```

> Die Apps sind so verdrahtet, dass sie ohne echte Hardware laufen. Der
> `MockBleScanner` emittiert Advertisements und der `MockMqttClient`
> echot Device-Commands zurück als State-Events, so dass der gesamte
> Onboarding → Dimmer → Farbtemperatur-Flow End-to-End demonstrierbar ist.

## Umgesetzter Scope (Phase 1 · Punkt 1)

- ✅ Monorepo-Setup mit pnpm Workspaces, geteilter `tsconfig.base.json`,
  ESLint und Prettier-Konfiguration.
- ✅ `@magnax/shared`: Design-Tokens (Farben, Typo, Spacing, Radius,
  Motion), Hardware-/Produkttypen, Tier-Matrix, Capability-Matrix sowie
  Mock-BLE- und Mock-MQTT-Clients.
- ✅ `@magnax/mobile` mit vollständigem Onboarding-Wizard (Splash →
  Welcome → Login → Produktwahl → Bluetooth-Scan → WLAN → Raum →
  Funktionstest → Abschluss), Home-Dashboard, Geräte-Detail mit Dimmer
  und Farbtemperatur, einheitlichem Theme-Provider und Zustand-Stores.
- ✅ `@magnax/desktop` Shell: Landing, Login, Dashboard-Mock mit
  Leitstand-Ästhetik, Tailwind-Setup auf Basis der geteilten Tokens.

## Noch nicht in diesem Commit

Die folgenden Bereiche sind strukturell vorgesehen (Typen, Tokens,
Navigations-Slots), aber in dieser ersten Iteration nicht implementiert:

- Automationen, Szenen-Editor, Energie-Dashboard (Mobile, Phase 1/2).
- Grundriss-Editor, Mesh-Topologie-Graph, AGV-Navigation (Desktop,
  Phase 2/3).
- Echter Backend-Layer (Supabase/Postgres), Stripe-Integration,
  Firmware-OTA-Pipeline.

Siehe [`ARCHITECTURE.md`](ARCHITECTURE.md) für Architekturentscheidungen
und Richtungen für Phase 2+.

## Repository-Konventionen

- **TypeScript strict** mit `noUncheckedIndexedAccess` und
  `exactOptionalPropertyTypes`.
- Kein `any`. ESLint erzwingt das.
- Keine lokalen Design-Tokens — alles geht durch `@magnax/shared`.
- Services (BLE, MQTT) immer hinter einer Fassade — mockable,
  swap-fähig gegen `react-native-ble-plx` / `mqtt.js`.

## Lizenz

Proprietär · © SymmetryX Technologies S.L. 2026
