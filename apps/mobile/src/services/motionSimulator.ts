import type { MotionEvent } from '@magnax/shared';

import { useDeviceStore } from '@/store/deviceStore';

/**
 * Motion-sensor activity simulator.
 *
 * For every device of type 'motion', randomly generates a motion
 * event every 6–16 s and clears the "present" flag 2 s later — so
 * the radar pulse fires, the caption flips to "Bewegung erkannt",
 * and the event log gets a new row. Swap with the MQTT topic
 * `magnax/accessory/+/motion` when real hardware is wired up.
 */

export interface MotionSimulatorHandle {
  stop: () => void;
}

const ZONES = ['Sofa-Bereich', 'Eingang', 'Fenster Süd', 'Flur', 'Esstisch'];
const TICK_MS = 2000;

export function startMotionSimulator(): MotionSimulatorHandle {
  const store = useDeviceStore;
  const nextTrigger = new Map<string, number>();

  const tick = () => {
    const state = store.getState();
    const motionDevices = Object.values(state.devices).filter((d) => d.type === 'motion');
    const now = Date.now();

    for (const d of motionDevices) {
      const scheduled = nextTrigger.get(d.id);
      if (scheduled === undefined) {
        nextTrigger.set(d.id, now + randInt(6000, 16000));
        continue;
      }

      if (now >= scheduled) {
        const zone = ZONES[Math.floor(Math.random() * ZONES.length)]!;
        const event: MotionEvent = {
          id: `${d.id}-${now}`,
          at: new Date().toISOString(),
          zone,
        };
        state.recordMotionEvent(d.id, event);

        // Clear presence 2 s later to mimic a PIR's hold time.
        setTimeout(() => {
          const current = store.getState().devices[d.id];
          if (current) store.getState().setMotionPresent(d.id, false);
        }, 2000);

        nextTrigger.set(d.id, now + randInt(6000, 16000));
      }
    }
  };

  const id = setInterval(tick, TICK_MS);

  return { stop: () => clearInterval(id) };
}

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min));
}
