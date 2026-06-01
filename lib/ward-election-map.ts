// Map pin locations per election area (polling parts).
// Coordinates are approximate — refine with GPS or OSM when you survey booths.

export interface PartMapPin {
  partNo: number;
  lat: number;
  lng: number;
  label?: string;
}

/** Veppampattu — parts clustered around town panchayat (adjust after field survey). */
export const VEPPAMPATTU_MAP_PINS: PartMapPin[] = [
  { partNo: 164, lat: 13.1258, lng: 79.9652, label: "PUES North" },
  { partNo: 165, lat: 13.1245, lng: 79.9698, label: "PUES East" },
  { partNo: 166, lat: 13.1228, lng: 79.9712, label: "PUES East Rm1" },
  { partNo: 167, lat: 13.1215, lng: 79.9675, label: "PUES East" },
  { partNo: 168, lat: 13.1202, lng: 79.9705, label: "PUES East" },
  { partNo: 169, lat: 13.1238, lng: 79.9660, label: "PUES South" },
  { partNo: 170, lat: 13.1250, lng: 79.9725, label: "PUES East" },
  { partNo: 171, lat: 13.1195, lng: 79.9688, label: "Govt HS West" },
  { partNo: 172, lat: 13.1188, lng: 79.9715, label: "Part 172" },
  { partNo: 173, lat: 13.1198, lng: 79.9672, label: "Govt HS West" },
];

/** Perumalpattu — approximate booth locations (refine after survey). */
export const PERUMALPATTU_MAP_PINS: PartMapPin[] = [
  { partNo: 188, lat: 13.0935, lng: 79.9165, label: "PU Middle School N" },
  { partNo: 191, lat: 13.0928, lng: 79.9178, label: "PU Middle School S" },
  { partNo: 192, lat: 13.0920, lng: 79.9185, label: "PU Middle School E" },
  { partNo: 193, lat: 13.0915, lng: 79.9172, label: "PU Middle School E" },
  { partNo: 194, lat: 13.0910, lng: 79.9168, label: "PU Middle School E" },
  { partNo: 195, lat: 13.0930, lng: 79.9190, label: "PU Middle School N Rm2" },
  { partNo: 196, lat: 13.0908, lng: 79.9180, label: "Anganwadi E" },
  { partNo: 197, lat: 13.0902, lng: 79.9175, label: "PU Middle School" },
];

const PINS_BY_AREA: Record<string, PartMapPin[]> = {
  veppampattu: VEPPAMPATTU_MAP_PINS,
  perumalpattu: PERUMALPATTU_MAP_PINS,
};

export function getMapPinsForArea(areaId: string): PartMapPin[] {
  return PINS_BY_AREA[areaId] ?? [];
}
