export interface MqttEnvelope<T = unknown> {
  topic: string;
  payload: T;
  qos: 0 | 1 | 2;
  retain: boolean;
  timestamp: string;
}

export type MqttTopic =
  | `magnax/device/${string}/state`
  | `magnax/device/${string}/command`
  | `magnax/device/${string}/sensors`
  | `magnax/device/${string}/firmware`
  | `magnax/mesh/topology`
  | `magnax/mesh/${string}/health`;

export interface DeviceCommand {
  on?: boolean;
  brightness?: number;
  colorTempK?: number;
  rgb?: { r: number; g: number; b: number };
  scene?: string;
}

export interface DeviceStateEvent {
  deviceId: string;
  on: boolean;
  brightness: number;
  colorTempK: number;
  powerDrawW: number;
  updatedAt: string;
}

export type MqttListener<T = unknown> = (env: MqttEnvelope<T>) => void;
