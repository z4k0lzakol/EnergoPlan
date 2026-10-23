export type UserRole = 'teacher' | 'admin';

export interface School {
  id: string;
  name: string;
  city: string;
  timezone: string;
}

export interface EnergyZone {
  id: string;
  name: string;
  wing: string;
  floor: string;
  controllable: boolean;
  powerKw: number;
  bufferMinutes: number;
  source: string;
  status: 'pomiar' | 'dokumentacja' | 'założenie';
}

export interface Room {
  id: string;
  name: string;
  zoneId: string;
  capacity: number;
  equipment: ('ekran' | 'komputery' | 'drukarka 3d' | 'nagłośnienie' | 'tablica')[];
  floor: string;
  accessibility: boolean; // dostęp bez schodów / parter / winda
}

export type RequestStatus = 'szkic' | 'oczekujący' | 'przydzielony' | 'odrzucony' | 'anulowany';

export interface BookingRequest {
  id: string;
  ownerId: string;
  ownerName: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  people: number;
  equipmentNeeds: ('ekran' | 'komputery' | 'drukarka 3d' | 'nagłośnienie' | 'tablica')[];
  accessibilityNeeded: boolean;
  notes?: string;
  status: RequestStatus;
  assignedRoomId?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  requestId: string;
  subject: string;
  teacherName: string;
  people: number;
  date: string;
  startTime: string;
  endTime: string;
  baselineRoomId: string;
  optimizedRoomId: string;
  isLocked: boolean; // Blokada sali w wariancie
  equipmentNeeds: ('ekran' | 'komputery' | 'drukarka 3d' | 'nagłośnienie' | 'tablica')[];
  accessibilityNeeded: boolean;
}

export interface ChangeNotice {
  id: string;
  planVersion: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  beforeRoomId: string;
  afterRoomId: string;
  reason: string;
  createdAt: string;
  acknowledgedAt?: string;
}

export interface EnergyZoneCalc {
  zoneId: string;
  zoneName: string;
  powerKw: number;
  baselineHours: number;
  variantHours: number;
  baselineKWh: number;
  variantKWh: number;
  savedKWh: number;
  reductionPercent: number;
}

export interface EnergySummary {
  baselineKWh: number;
  variantKWh: number;
  savedKWh: number;
  percentSaved: number;
  baselineHours: number;
  variantHours: number;
  savedHours: number;
  pricePerKWh: number;
  baselineCost: number;
  variantCost: number;
  savedCost: number;
  zoneCalculations: EnergyZoneCalc[];
}

