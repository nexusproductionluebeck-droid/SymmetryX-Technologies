import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import type { Device } from '@magnax/shared';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  devices: Device[];
  width: number;
  height: number;
}

interface RoomLayout {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  floor: 'OG' | 'EG' | 'KG';
  devices: Device[];
}

interface MeshEdge {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

/**
 * House-wide mesh visualisation. The whole single-family home as
 * a stylised top-down floor plan with rooms as glass boxes,
 * mesh-capable nodes as dots inside, and pulsing connections
 * between adjacent rooms. Two heartbeat pulses sweep outward —
 * the "ceiling that breathes".
 */
export function HouseMeshMap({ devices, width, height }: Props) {
  const layout = useMemo(() => layoutHouse(devices, width, height), [devices, width, height]);

  const beatA = useSharedValue(0);
  const beatB = useSharedValue(0);
  const flow = useSharedValue(0);

  useEffect(() => {
    beatA.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    beatB.value = withRepeat(
      withTiming(1, { duration: 5400, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    flow.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [beatA, beatB, flow]);

  const houseCenter = { x: width / 2, y: height / 2 };

  const beatPropsA = useAnimatedProps(() => ({
    r: 20 + beatA.value * Math.min(width, height) * 0.6,
    opacity: (1 - beatA.value) * 0.18,
  }));
  const beatPropsB = useAnimatedProps(() => ({
    r: 20 + beatB.value * Math.min(width, height) * 0.65,
    opacity: (1 - beatB.value) * 0.12,
  }));

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="floorGlow" cx="50%" cy="50%" r="60%">
            <Stop offset="0" stopColor="#1A8A7D" stopOpacity={0.1} />
            <Stop offset="1" stopColor="#1A8A7D" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="meshEdge" x1="0" y1="0" x2={width} y2={height}>
            <Stop offset="0" stopColor="#1A8A7D" stopOpacity={0.35} />
            <Stop offset="1" stopColor="#2E75B6" stopOpacity={0.35} />
          </LinearGradient>
        </Defs>

        <Circle
          cx={houseCenter.x}
          cy={houseCenter.y}
          r={Math.min(width, height) * 0.5}
          fill="url(#floorGlow)"
        />

        <AnimatedCircle
          cx={houseCenter.x}
          cy={houseCenter.y}
          fill="none"
          stroke="#1A8A7D"
          strokeWidth={1.5}
          animatedProps={beatPropsA}
        />
        <AnimatedCircle
          cx={houseCenter.x}
          cy={houseCenter.y}
          fill="none"
          stroke="#2E75B6"
          strokeWidth={1}
          animatedProps={beatPropsB}
        />

        {layout.floorDividers.map((y, i) => (
          <Path
            key={`fd-${i}`}
            d={`M 32 ${y} L ${width - 8} ${y}`}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
            strokeDasharray="3,4"
          />
        ))}

        {layout.edges.map((edge) => (
          <Path
            key={edge.id}
            d={`M ${edge.from.x} ${edge.from.y} L ${edge.to.x} ${edge.to.y}`}
            stroke="url(#meshEdge)"
            strokeWidth={1.4}
          />
        ))}

        {layout.edges.map((edge, i) => (
          <DataPacket key={`pk-${edge.id}`} edge={edge} flow={flow} offset={i * 0.07} />
        ))}
      </Svg>

      {layout.floors.map((f) => (
        <Text key={f.label} style={[styles.floorBadge, { top: f.y - 7 }]}>
          {f.label}
        </Text>
      ))}

      {layout.rooms.map((room) => (
        <RoomBox key={room.id} room={room} flow={flow} />
      ))}
    </View>
  );
}

function RoomBox({ room, flow }: { room: RoomLayout; flow: SharedValue<number> }) {
  const onlineCount = room.devices.filter((d) => d.status === 'online').length;
  const warningCount = room.devices.filter((d) => d.status === 'warning').length;
  const meshCapable = room.devices.filter((d) => d.capabilities.mesh);

  const intensity = warningCount > 0 ? 'warning' : onlineCount > 0 ? 'online' : 'idle';
  const accent =
    intensity === 'warning'
      ? '#E09A46'
      : intensity === 'online'
        ? '#1A8A7D'
        : 'rgba(255,255,255,0.18)';

  const glowStyle = useAnimatedStyle(() => {
    const phase = (flow.value + room.x / 800) % 1;
    const opacity = 0.04 + (Math.sin(phase * Math.PI * 2) + 1) * 0.05;
    return { opacity };
  });

  return (
    <View
      style={[
        styles.roomBox,
        {
          left: room.x,
          top: room.y,
          width: room.w,
          height: room.h,
          borderColor: accent,
        },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          glowStyle,
          { backgroundColor: accent, borderRadius: 6 },
        ]}
      />

      <View style={styles.roomHeader}>
        <View style={[styles.roomDot, { backgroundColor: accent }]} />
        <Text style={styles.roomLabel} numberOfLines={1}>
          {room.label}
        </Text>
      </View>

      <View style={styles.nodesRow}>
        {meshCapable.slice(0, 6).map((d) => (
          <View
            key={d.id}
            style={[
              styles.nodeDot,
              {
                backgroundColor:
                  d.status === 'online'
                    ? '#1A8A7D'
                    : d.status === 'warning'
                      ? '#E09A46'
                      : 'rgba(255,255,255,0.2)',
              },
            ]}
          />
        ))}
        {meshCapable.length > 6 && (
          <Text style={styles.nodeOverflow}>+{meshCapable.length - 6}</Text>
        )}
      </View>

      <Text style={styles.roomCount}>{room.devices.length}</Text>
    </View>
  );
}

function DataPacket({
  edge,
  flow,
  offset,
}: {
  edge: MeshEdge;
  flow: SharedValue<number>;
  offset: number;
}) {
  const props = useAnimatedProps(() => {
    const t = (flow.value + offset) % 1;
    const cx = edge.from.x + (edge.to.x - edge.from.x) * t;
    const cy = edge.from.y + (edge.to.y - edge.from.y) * t;
    const opacity = interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
    return { cx, cy, opacity };
  });
  return <AnimatedCircle r={2.6} fill="#FFFFFF" animatedProps={props} />;
}

interface HouseLayout {
  rooms: RoomLayout[];
  edges: MeshEdge[];
  floorDividers: number[];
  floors: { label: string; y: number }[];
}

function layoutHouse(devices: Device[], width: number, height: number): HouseLayout {
  const byRoom = new Map<string, Device[]>();
  for (const d of devices) {
    const key = d.roomId ?? '_unassigned';
    const list = byRoom.get(key) ?? [];
    list.push(d);
    byRoom.set(key, list);
  }

  const FOOTPRINT: ReadonlyArray<{
    id: string;
    label: string;
    floor: 'OG' | 'EG' | 'KG';
    col: number;
    cols: number;
    row: 0 | 1 | 2;
  }> = [
    { id: 'schlafzimmer', label: 'Schlaf', floor: 'OG', col: 0, cols: 3, row: 0 },
    { id: 'kinderzimmer', label: 'Kind', floor: 'OG', col: 1, cols: 3, row: 0 },
    { id: 'badezimmer', label: 'Bad', floor: 'OG', col: 2, cols: 3, row: 0 },
    { id: 'wohnzimmer', label: 'Wohnen', floor: 'EG', col: 0, cols: 4, row: 1 },
    { id: 'kueche', label: 'Küche', floor: 'EG', col: 1, cols: 4, row: 1 },
    { id: 'flur-eg', label: 'Flur', floor: 'EG', col: 2, cols: 4, row: 1 },
    { id: 'buero', label: 'Büro', floor: 'EG', col: 3, cols: 4, row: 1 },
    { id: 'garage', label: 'Garage', floor: 'KG', col: 0, cols: 1, row: 2 },
  ];

  const padX = 32;
  const padXRight = 12;
  const padY = 12;
  const rowHeight = (height - padY * 2) / 3;
  const gap = 6;

  const rooms: RoomLayout[] = FOOTPRINT.map((slot) => {
    const innerWidth = width - padX - padXRight;
    const colWidth = (innerWidth - gap * (slot.cols - 1)) / slot.cols;
    const widthThis = slot.cols === 1 ? innerWidth : colWidth;
    return {
      id: slot.id,
      label: slot.label,
      floor: slot.floor,
      x: padX + slot.col * (colWidth + gap),
      y: padY + slot.row * rowHeight + 4,
      w: widthThis,
      h: rowHeight - 12,
      devices: byRoom.get(slot.id) ?? [],
    };
  });

  const edges: MeshEdge[] = [];
  const byRow = new Map<number, RoomLayout[]>();
  for (const r of rooms) {
    const slot = FOOTPRINT.find((s) => s.id === r.id);
    if (!slot) continue;
    const list = byRow.get(slot.row) ?? [];
    list.push(r);
    byRow.set(slot.row, list);
  }
  byRow.forEach((list) => {
    for (let i = 0; i < list.length - 1; i += 1) {
      const a = list[i]!;
      const b = list[i + 1]!;
      edges.push({
        id: `${a.id}-${b.id}`,
        from: { x: a.x + a.w, y: a.y + a.h / 2 },
        to: { x: b.x, y: b.y + b.h / 2 },
      });
    }
  });
  for (let row = 0; row < 2; row += 1) {
    const upper = byRow.get(row)?.[0];
    const lower = byRow.get(row + 1)?.[0];
    if (upper && lower) {
      edges.push({
        id: `floor-${row}-${row + 1}`,
        from: { x: upper.x + upper.w / 2, y: upper.y + upper.h },
        to: { x: lower.x + lower.w / 2, y: lower.y },
      });
    }
  }

  const floorDividers = [padY + rowHeight, padY + rowHeight * 2];
  const floors = [
    { label: 'OG', y: padY + rowHeight * 0.5 },
    { label: 'EG', y: padY + rowHeight * 1.5 },
    { label: 'KG', y: padY + rowHeight * 2.5 },
  ];

  return { rooms, edges, floorDividers, floors };
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  floorBadge: {
    position: 'absolute',
    left: 6,
    color: 'rgba(232,238,243,0.45)',
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  roomBox: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(20,30,42,0.55)',
    padding: 6,
    overflow: 'hidden',
  },
  roomHeader: { flexDirection: 'row', alignItems: 'center' },
  roomDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  roomLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    flex: 1,
  },
  nodesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  nodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 3,
    marginTop: 3,
  },
  nodeOverflow: {
    color: 'rgba(232,238,243,0.55)',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
    marginTop: 1,
  },
  roomCount: {
    position: 'absolute',
    right: 6,
    bottom: 4,
    color: 'rgba(232,238,243,0.4)',
    fontSize: 9,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
