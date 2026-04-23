import type { SensorReading } from '@magnax/shared';

import { useDeviceStore } from '@/store/deviceStore';

/**
 * Sensor data simulator.
 *
 * Drives a smooth, life-like drift of sensor readings into the device
 * store so the Sense visualisations feel alive even without real
 * hardware. Each reading has its own low-frequency oscillator plus a
 * small amount of noise, so values move organically rather than
 * step-changing.
 *
 * Replace with the MQTT-subscribed `magnax/device/+/sensors` stream
 * when the real broker + devices are wired up.
 */

export interface SimulatorHandle {
  stop: () => void;
}

interface OscState {
  t0: number;
  motionTrigger: number;
}

const TICK_MS = 800;

export function startSensorSimulator(): SimulatorHandle {
  const store = useDeviceStore;
  const oscByDevice = new Map<string, OscState>();

  const tick = () => {
    const state = store.getState();
    const sensorDevices = Object.values(state.devices).filter(
      (d) => d.capabilities.sensors,
    );

    const now = Date.now();
    for (const device of sensorDevices) {
      const osc = oscByDevice.get(device.id) ?? { t0: now, motionTrigger: now + randInt(4000, 12000) };
      oscByDevice.set(device.id, osc);

      const elapsed = (now - osc.t0) / 1000;
      const reading: SensorReading = {
        temperatureC: 21.5 + Math.sin(elapsed / 7) * 1.4 + noise(0.3),
        humidityPct: 48 + Math.sin(elapsed / 11 + 1.3) * 6 + noise(1),
        co2Ppm: 620 + Math.sin(elapsed / 9 + 0.7) * 160 + noise(25),
        luxAmbient: Math.max(
          0,
          180 + Math.sin(elapsed / 13) * 120 + noise(18),
        ),
        motionDetected: now >= osc.motionTrigger && now <= osc.motionTrigger + 2500,
        recordedAt: new Date().toISOString(),
      };

      if (now > osc.motionTrigger + 2500) {
        osc.motionTrigger = now + randInt(6000, 14000);
      }

      state.setSensors(device.id, reading);
    }
  };

  // Fire once immediately so the UI is not empty on first render.
  tick();
  const id = setInterval(tick, TICK_MS);

  return {
    stop: () => clearInterval(id),
  };
}

function noise(amplitude: number): number {
  return (Math.random() - 0.5) * 2 * amplitude;
}

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min));
}
