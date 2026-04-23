import { useDeviceStore } from '@/store/deviceStore';

/**
 * Mesh health simulator.
 *
 * Drives:
 * - A slow RSSI drift per mesh-capable node so the ∅-dBm reading
 *   moves organically on the Mesh dashboard.
 * - A small chance per tick to flip a node to "warning" briefly and
 *   back to "online" — simulating a self-heal / re-route event.
 *
 * Replace with the MQTT subscription `magnax/mesh/+/health` when
 * the broker is wired up.
 */

export interface MeshSimulatorHandle {
  stop: () => void;
}

const TICK_MS = 2400;
const SELF_HEAL_PROBABILITY = 0.18;

export function startMeshSimulator(): MeshSimulatorHandle {
  const store = useDeviceStore;

  const tick = () => {
    const state = store.getState();
    const devices = Object.values(state.devices);

    for (const device of devices) {
      if (!device.mesh) continue;

      const driftedRssi = clamp(
        device.mesh.rssiDbm + (Math.random() - 0.5) * 3,
        -80,
        -35,
      );
      const nextUplink = clamp(
        (device.mesh.uplinkMbps || 0) + (Math.random() - 0.5) * 2,
        0,
        120,
      );

      // Apply drift directly through upsert to keep it a single write.
      state.upsert({
        ...device,
        mesh: {
          ...device.mesh,
          rssiDbm: Math.round(driftedRssi),
          uplinkMbps: Math.round(nextUplink * 10) / 10,
        },
      });
    }

    // Self-heal drama: pick one mesh-capable online node, briefly flip
    // it to "warning", then restore it. No more than once per tick.
    if (Math.random() < SELF_HEAL_PROBABILITY) {
      const pool = devices.filter((d) => d.mesh && d.status === 'online');
      if (pool.length > 0) {
        const pick = pool[Math.floor(Math.random() * pool.length)]!;
        state.upsert({ ...pick, status: 'warning' });
        setTimeout(() => {
          const current = store.getState().devices[pick.id];
          if (current) store.getState().upsert({ ...current, status: 'online' });
        }, 2200);
      }
    }
  };

  const id = setInterval(tick, TICK_MS);

  return {
    stop: () => clearInterval(id),
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
