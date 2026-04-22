export interface Location {
  id: string;
  name: string;
  timezone: string;
  buildings: Building[];
}

export interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

export interface Floor {
  id: string;
  name: string;
  zones: Zone[];
}

export interface Zone {
  id: string;
  name: string;
  kind: 'functional' | 'safety' | 'automation';
  roomIds: string[];
}

export interface Room {
  id: string;
  name: string;
  iconKey: string;
  backgroundImageUrl: string | null;
  deviceIds: string[];
}

export const DEFAULT_ROOMS: ReadonlyArray<Pick<Room, 'name' | 'iconKey'>> = [
  { name: 'Wohnzimmer', iconKey: 'sofa' },
  { name: 'Küche', iconKey: 'chef-hat' },
  { name: 'Schlafzimmer', iconKey: 'bed' },
  { name: 'Badezimmer', iconKey: 'droplet' },
  { name: 'Flur', iconKey: 'door-open' },
  { name: 'Büro', iconKey: 'briefcase' },
  { name: 'Kinderzimmer', iconKey: 'toy-brick' },
  { name: 'Garage', iconKey: 'car' },
];
