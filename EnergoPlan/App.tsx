import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Switch,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ==========================================
// 1. MOTYW I TOKENY WIZUALNE (DESIGN TOKENS)
// ==========================================
export const Theme = {
  colors: {
    forest: '#153F35',      // Główny kolor: nawigacja, przyciski główne, karta najbliższych zajęć
    forestDark: '#0D2721',
    forestLight: '#1E4E42',
    green: '#276C50',       // Akcenty, linki, stany aktywne
    greenLight: '#328864',
    lime: '#D4EF97',        // Akcent na ciemnym tle, procent oszczędności
    background: '#F5F6F2',  // Tło aplikacji
    surface: '#FFFFFF',     // Karty, formularze, okna modalne
    text: '#1C3029',        // Tekst podstawowy
    muted: '#65756D',       // Teksty pomocnicze
    border: '#E1E6E2',
    borderLight: '#EDF2EE',
    warningBg: '#FFF4DF',   // Statusy oczekujące / ostrzeżenia o zmianie
    warningText: '#8A5A16',
    successBg: '#E6F4EA',   // Statusy zatwierdzone / przydzielone
    successText: '#137333',
    dangerBg: '#FCE8E6',    // Odrzucone / anulowane
    dangerText: '#C5221F',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radii: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

// ==========================================
// 2. TYPY DANYCH I STRUKTURY SPECYFIKACJI
// ==========================================
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
  accessibility: boolean;
}

export type RequestStatus = 'szkic' | 'oczekujący' | 'przydzielony' | 'odrzucony' | 'anulowany';

export interface BookingRequest {
  id: string;
  ownerId: string;
  ownerName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
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
  isLocked: boolean;
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

// ==========================================
// 3. DANE DEMONSTRACYJNE (MOCK DATA Z DOCX)
// ==========================================
export const INITIAL_SCHOOL: School = {
  id: 'school-demo-1',
  name: 'Szkoła Podstawowa Demonstracyjna nr 1',
  city: 'Warszawa',
  timezone: 'Europe/Warsaw',
};

export const INITIAL_ZONES: EnergyZone[] = [
  {
    id: 'zone-A',
    name: 'Strefa A (Parter)',
    wing: 'Skrzydło A',
    floor: 'Parter',
    controllable: true,
    powerKw: 2.0,
    bufferMinutes: 30,
    source: 'Dokumentacja techniczna 2025',
    status: 'pomiar',
  },
  {
    id: 'zone-B',
    name: 'Strefa B (I Piętro)',
    wing: 'Skrzydło B',
    floor: 'I Piętro',
    controllable: true,
    powerKw: 1.5,
    bufferMinutes: 30,
    source: 'Audyt energetyczny 2024',
    status: 'dokumentacja',
  },
  {
    id: 'zone-C',
    name: 'Strefa C (II Piętro)',
    wing: 'Skrzydło C',
    floor: 'II Piętro',
    controllable: true,
    powerKw: 1.8,
    bufferMinutes: 30,
    source: 'Założenie modelowe pilotażu',
    status: 'założenie',
  },
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'A101',
    name: 'Sala A101 (Robotyka i STEM)',
    zoneId: 'zone-A',
    capacity: 24,
    equipment: ['ekran', 'komputery', 'drukarka 3d'],
    floor: 'Parter',
    accessibility: true,
  },
  {
    id: 'A102',
    name: 'Sala A102 (Multimedialna)',
    zoneId: 'zone-A',
    capacity: 16,
    equipment: ['ekran'],
    floor: 'Parter',
    accessibility: true,
  },
  {
    id: 'B201',
    name: 'Sala B201 (Pracownia językowa)',
    zoneId: 'zone-B',
    capacity: 15,
    equipment: ['ekran'],
    floor: 'I Piętro',
    accessibility: false,
  },
  {
    id: 'B202',
    name: 'Sala B202 (Wykładowa)',
    zoneId: 'zone-B',
    capacity: 30,
    equipment: ['ekran', 'nagłośnienie'],
    floor: 'I Piętro',
    accessibility: false,
  },
  {
    id: 'C301',
    name: 'Sala C301 (Konferencyjna samorządu)',
    zoneId: 'zone-C',
    capacity: 18,
    equipment: ['tablica'],
    floor: 'II Piętro',
    accessibility: false,
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    requestId: 'req-init-1',
    subject: 'Koło robotyki',
    teacherName: 'Michał Wiśniewski',
    people: 18,
    date: '2026-10-22',
    startTime: '16:00',
    endTime: '18:00',
    baselineRoomId: 'A101',
    optimizedRoomId: 'A101',
    isLocked: false,
    equipmentNeeds: ['ekran', 'komputery'],
    accessibilityNeeded: true,
  },
  {
    id: 'b-2',
    requestId: 'req-init-2',
    subject: 'Język angielski',
    teacherName: 'Jan Kowalski',
    people: 12,
    date: '2026-10-22',
    startTime: '16:00',
    endTime: '17:30',
    baselineRoomId: 'B201',
    optimizedRoomId: 'A102',
    isLocked: false,
    equipmentNeeds: ['ekran'],
    accessibilityNeeded: false,
  },
  {
    id: 'b-3',
    requestId: 'req-init-3',
    subject: 'Samorząd uczniowski',
    teacherName: 'Katarzyna Lewandowska',
    people: 10,
    date: '2026-10-22',
    startTime: '18:00',
    endTime: '19:30',
    baselineRoomId: 'C301',
    optimizedRoomId: 'A102',
    isLocked: false,
    equipmentNeeds: [],
    accessibilityNeeded: false,
  },
];

export const INITIAL_REQUESTS: BookingRequest[] = [
  {
    id: 'req-init-1',
    ownerId: 'teacher-2',
    ownerName: 'Michał Wiśniewski',
    subject: 'Koło robotyki',
    date: '2026-10-22',
    startTime: '16:00',
    endTime: '18:00',
    people: 18,
    equipmentNeeds: ['ekran', 'komputery'],
    accessibilityNeeded: true,
    status: 'przydzielony',
    assignedRoomId: 'A101',
    createdAt: '2026-10-18 10:15',
  },
  {
    id: 'req-init-2',
    ownerId: 'teacher-1',
    ownerName: 'Jan Kowalski',
    subject: 'Język angielski',
    date: '2026-10-22',
    startTime: '16:00',
    endTime: '17:30',
    people: 12,
    equipmentNeeds: ['ekran'],
    accessibilityNeeded: false,
    status: 'przydzielony',
    assignedRoomId: 'B201',
    createdAt: '2026-10-19 12:40',
  },
  {
    id: 'req-init-3',
    ownerId: 'teacher-3',
    ownerName: 'Katarzyna Lewandowska',
    subject: 'Samorząd uczniowski',
    date: '2026-10-22',
    startTime: '18:00',
    endTime: '19:30',
    people: 10,
    equipmentNeeds: [],
    accessibilityNeeded: false,
    status: 'przydzielony',
    assignedRoomId: 'C301',
    createdAt: '2026-10-20 09:10',
  },
  {
    id: 'req-init-4',
    ownerId: 'teacher-1',
    ownerName: 'Jan Kowalski',
    subject: 'Konsultacje z języka angielskiego',
    date: '2026-10-23',
    startTime: '15:30',
    endTime: '17:00',
    people: 6,
    equipmentNeeds: ['ekran'],
    accessibilityNeeded: false,
    status: 'oczekujący',
    notes: 'Potrzebne ciche miejsce do przygotowania do olimpiady',
    createdAt: '2026-10-21 14:20',
  },
  {
    id: 'req-init-5',
    ownerId: 'teacher-4',
    ownerName: 'Tomasz Dąbrowski',
    subject: 'Klub szachowy i gry logiczne',
    date: '2026-10-23',
    startTime: '16:00',
    endTime: '18:00',
    people: 16,
    equipmentNeeds: [],
    accessibilityNeeded: true,
    status: 'oczekujący',
    notes: 'Wymagany parter ze względu na ucznia z niepełnosprawnością ruchową',
    createdAt: '2026-10-22 08:30',
  },
];

export const INITIAL_CHANGE_NOTICES: ChangeNotice[] = [
  {
    id: 'notice-1',
    planVersion: 'v1.1-demo',
    teacherId: 'teacher-1',
    teacherName: 'Jan Kowalski',
    subject: 'Język angielski',
    date: '2026-10-22',
    startTime: '16:00',
    endTime: '17:30',
    beforeRoomId: 'B201',
    afterRoomId: 'A102',
    reason: 'Optymalizacja energetyczna: wyłączenie wentylacji i oświetlenia w skrzydle B po lekcjach. Wszystkie warunki (ekran, 12 osób) zachowane.',
    createdAt: '2026-10-22 13:00',
  },
];

// Scalanie nakładających się przedziałów minutowych
function mergeIntervals(intervals: [number, number][]): [number, number][] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// ==========================================
// 4. KONTEKST I MODEL BIZNESOWY ENERGETYKI
// ==========================================
interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  school: School;
  zones: EnergyZone[];
  rooms: Room[];
  bookings: Booking[];
  requests: BookingRequest[];
  changeNotices: ChangeNotice[];
  pricePerKWh: number;
  planPublished: boolean;
  publishedVersion: string;
  energySummary: EnergySummary;
  adminTab: 'overview' | 'schedule' | 'rooms' | 'variants' | 'requests' | 'report';
  setAdminTab: (tab: 'overview' | 'schedule' | 'rooms' | 'variants' | 'requests' | 'report') => void;
  teacherTab: 'today' | 'requests' | 'changes' | 'profile' | 'new_request';
  setTeacherTab: (tab: 'today' | 'requests' | 'changes' | 'profile' | 'new_request') => void;
  toggleBookingLock: (bookingId: string) => void;
  publishPlan: () => void;
  addRequest: (req: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  cancelRequest: (requestId: string) => void;
  allocateRoomToRequest: (requestId: string, roomId: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  acknowledgeChangeNotice: (noticeId: string) => void;
  updateZoneParams: (zoneId: string, powerKw: number, bufferMinutes: number) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('admin');
  const [school] = useState<School>(INITIAL_SCHOOL);
  const [zones, setZones] = useState<EnergyZone[]>(INITIAL_ZONES);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [requests, setRequests] = useState<BookingRequest[]>(INITIAL_REQUESTS);
  const [changeNotices, setChangeNotices] = useState<ChangeNotice[]>(INITIAL_CHANGE_NOTICES);
  const [pricePerKWh] = useState<number>(1.2);
  const [planPublished, setPlanPublished] = useState<boolean>(false);
  const [publishedVersion, setPublishedVersion] = useState<string>('v1.0-wyjściowy');

  const [adminTab, setAdminTab] = useState<'overview' | 'schedule' | 'rooms' | 'variants' | 'requests' | 'report'>('overview');
  const [teacherTab, setTeacherTab] = useState<'today' | 'requests' | 'changes' | 'profile' | 'new_request'>('today');

  const roomToZoneMap = useMemo(() => {
    const map = new Map<string, string>();
    rooms.forEach((r) => map.set(r.id, r.zoneId));
    return map;
  }, [rooms]);

  // Model energii - przeliczenia w czasie rzeczywistym
  const energySummary: EnergySummary = useMemo(() => {
    const zoneCalculations: EnergyZoneCalc[] = zones.map((zone) => {
      // 1. Bazowy plan
      const baselineIntervals: [number, number][] = [];
      bookings.forEach((b) => {
        const zoneId = roomToZoneMap.get(b.baselineRoomId);
        if (zoneId === zone.id) {
          const start = timeStringToMinutes(b.startTime);
          const end = timeStringToMinutes(b.endTime) + zone.bufferMinutes;
          baselineIntervals.push([start, end]);
        }
      });
      const mergedBaseline = mergeIntervals(baselineIntervals);
      const baselineMinutes = mergedBaseline.reduce((acc, [s, e]) => acc + (e - s), 0);
      const baselineHours = baselineMinutes / 60;
      const baselineKWh = Number((zone.powerKw * baselineHours).toFixed(2));

      // 2. Wariant zoptymalizowany (uwzględnia ewentualne blokady administratora)
      const variantIntervals: [number, number][] = [];
      bookings.forEach((b) => {
        const targetRoomId = b.isLocked ? b.baselineRoomId : b.optimizedRoomId;
        const zoneId = roomToZoneMap.get(targetRoomId);
        if (zoneId === zone.id) {
          const start = timeStringToMinutes(b.startTime);
          const end = timeStringToMinutes(b.endTime) + zone.bufferMinutes;
          variantIntervals.push([start, end]);
        }
      });
      const mergedVariant = mergeIntervals(variantIntervals);
      const variantMinutes = mergedVariant.reduce((acc, [s, e]) => acc + (e - s), 0);
      const variantHours = variantMinutes / 60;
      const variantKWh = Number((zone.powerKw * variantHours).toFixed(2));

      const savedKWh = Number((baselineKWh - variantKWh).toFixed(2));
      const reductionPercent = baselineKWh > 0 ? Math.round((savedKWh / baselineKWh) * 100) : 0;

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        powerKw: zone.powerKw,
        baselineHours: Number(baselineHours.toFixed(1)),
        variantHours: Number(variantHours.toFixed(1)),
        baselineKWh,
        variantKWh,
        savedKWh,
        reductionPercent,
      };
    });

    const baselineKWh = Number(zoneCalculations.reduce((acc, z) => acc + z.baselineKWh, 0).toFixed(1));
    const variantKWh = Number(zoneCalculations.reduce((acc, z) => acc + z.variantKWh, 0).toFixed(1));
    const savedKWh = Number((baselineKWh - variantKWh).toFixed(1));
    const percentSaved = baselineKWh > 0 ? Math.round((savedKWh / baselineKWh) * 100) : 0;

    const baselineHours = Number(zoneCalculations.reduce((acc, z) => acc + z.baselineHours, 0).toFixed(1));
    const variantHours = Number(zoneCalculations.reduce((acc, z) => acc + z.variantHours, 0).toFixed(1));
    const savedHours = Number((baselineHours - variantHours).toFixed(1));

    const baselineCost = Number((baselineKWh * pricePerKWh).toFixed(2));
    const variantCost = Number((variantKWh * pricePerKWh).toFixed(2));
    const savedCost = Number((savedKWh * pricePerKWh).toFixed(2));

    return {
      baselineKWh,
      variantKWh,
      savedKWh,
      percentSaved,
      baselineHours,
      variantHours,
      savedHours,
      pricePerKWh,
      baselineCost,
      variantCost,
      savedCost,
      zoneCalculations,
    };
  }, [zones, rooms, bookings, pricePerKWh, roomToZoneMap]);

  const toggleBookingLock = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, isLocked: !b.isLocked } : b))
    );
  };

  const publishPlan = () => {
    const newVersion = `v2.0-zatwierdzony-${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
    setPublishedVersion(newVersion);
    setPlanPublished(true);

    const newNotices: ChangeNotice[] = [];
    bookings.forEach((b) => {
      const activeTarget = b.isLocked ? b.baselineRoomId : b.optimizedRoomId;
      if (activeTarget !== b.baselineRoomId) {
        newNotices.push({
          id: `notice-pub-${Date.now()}-${b.id}`,
          planVersion: newVersion,
          teacherId: b.teacherName === 'Jan Kowalski' ? 'teacher-1' : `teacher-${b.id}`,
          teacherName: b.teacherName,
          subject: b.subject,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          beforeRoomId: b.baselineRoomId,
          afterRoomId: activeTarget,
          reason: `Optymalizacja stref energetycznych: przeniesienie do ${activeTarget} pozwala skrócić pracę skrzydła i zaoszczędzić energię szkoły.`,
          createdAt: new Date().toLocaleString('pl-PL'),
        });
      }
    });

    if (newNotices.length > 0) {
      setChangeNotices(newNotices);
    }
  };

  const addRequest = async (req: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newReq: BookingRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'oczekujący',
      createdAt: new Date().toLocaleString('pl-PL'),
    };
    setRequests((prev) => [newReq, ...prev]);
    return true;
  };

  const cancelRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'anulowany' } : r))
    );
  };

  const allocateRoomToRequest = (requestId: string, roomId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'przydzielony',
            assignedRoomId: roomId,
          };
        }
        return r;
      })
    );

    const req = requests.find((r) => r.id === requestId);
    if (req) {
      const newBooking: Booking = {
        id: `b-alloc-${Date.now()}`,
        requestId: req.id,
        subject: req.subject,
        teacherName: req.ownerName,
        people: req.people,
        date: req.date,
        startTime: req.startTime,
        endTime: req.endTime,
        baselineRoomId: roomId,
        optimizedRoomId: roomId,
        isLocked: true,
        equipmentNeeds: req.equipmentNeeds,
        accessibilityNeeded: req.accessibilityNeeded,
      };
      setBookings((prev) => [...prev, newBooking]);
    }
  };

  const rejectRequest = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'odrzucony',
              rejectionReason: reason || 'Brak wolnych sal spełniających kryteria w tym terminie.',
            }
          : r
      )
    );
  };

  const acknowledgeChangeNotice = (noticeId: string) => {
    const timestamp = new Date().toLocaleString('pl-PL');
    setChangeNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, acknowledgedAt: timestamp } : n))
    );
  };

  const updateZoneParams = (zoneId: string, powerKw: number, bufferMinutes: number) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, powerKw, bufferMinutes } : z))
    );
  };

  const addRoom = (newRoomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...newRoomData,
      id: `${newRoomData.floor === 'Parter' ? 'A' : newRoomData.floor === 'I Piętro' ? 'B' : 'C'}${Math.floor(100 + Math.random() * 899)}`,
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  const resetToDemoData = () => {
    setZones(INITIAL_ZONES);
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setRequests(INITIAL_REQUESTS);
    setChangeNotices(INITIAL_CHANGE_NOTICES);
    setPlanPublished(false);
    setPublishedVersion('v1.0-wyjściowy');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        school,
        zones,
        rooms,
        bookings,
        requests,
        changeNotices,
        pricePerKWh,
        planPublished,
        publishedVersion,
        energySummary,
        adminTab,
        setAdminTab,
        teacherTab,
        setTeacherTab,
        toggleBookingLock,
        publishPlan,
        addRequest,
        cancelRequest,
        allocateRoomToRequest,
        rejectRequest,
        acknowledgeChangeNotice,
        updateZoneParams,
        addRoom,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

// ==========================================
// 5. UNIWERSALNE KOMPONENTY WIZUALNE
// ==========================================
export const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({
  name,
  size = 20,
  color = '#1C3029',
}) => {
  return <Ionicons name={name as any} size={size} color={color} />;
};

export const PrimaryButton: React.FC<{
  title: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'forest' | 'green' | 'danger';
}> = ({ title, onPress, icon, loading = false, disabled = false, variant = 'forest' }) => {
  const bgColor =
    variant === 'green'
      ? Theme.colors.green
      : variant === 'danger'
      ? Theme.colors.dangerText
      : Theme.colors.forest;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        compStyles.primaryButton,
        { backgroundColor: bgColor, opacity: disabled ? 0.6 : pressed ? 0.88 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={compStyles.buttonContent}>
          {icon && <Icon name={icon} size={18} color="#FFFFFF" />}
          <Text style={compStyles.primaryButtonText}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
};

export const SecondaryButton: React.FC<{
  title: string;
  onPress: () => void;
  icon?: string;
  disabled?: boolean;
}> = ({ title, onPress, icon, disabled = false }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        compStyles.secondaryButton,
        { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
      ]}
    >
      <View style={compStyles.buttonContent}>
        {icon && <Icon name={icon} size={16} color={Theme.colors.forest} />}
        <Text style={compStyles.secondaryButtonText}>{title}</Text>
      </View>
    </Pressable>
  );
};

export const StatusBadge: React.FC<{ status: RequestStatus | 'zmiana' | 'zaakceptowany' }> = ({
  status,
}) => {
  let bg: string = Theme.colors.borderLight;
  let text: string = Theme.colors.muted;
  let label: string = status;

  switch (status) {
    case 'oczekujący':
      bg = Theme.colors.warningBg;
      text = Theme.colors.warningText;
      label = 'Oczekujący';
      break;
    case 'przydzielony':
    case 'zaakceptowany':
      bg = Theme.colors.successBg;
      text = Theme.colors.successText;
      label = 'Przydzielony';
      break;
    case 'odrzucony':
      bg = Theme.colors.dangerBg;
      text = Theme.colors.dangerText;
      label = 'Odrzucony';
      break;
    case 'anulowany':
      bg = '#EAEAEA';
      text = '#777777';
      label = 'Anulowany';
      break;
    case 'szkic':
      bg = '#E8F0FE';
      text = '#1967D2';
      label = 'Szkic';
      break;
    case 'zmiana':
      bg = Theme.colors.warningBg;
      text = Theme.colors.warningText;
      label = 'Zmiana sali';
      break;
  }

  return (
    <View style={[compStyles.badge, { backgroundColor: bg }]}>
      <Text style={[compStyles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

export const MetricCard: React.FC<{
  title: string;
  value: string;
  unit?: string;
  subtitle: string;
  highlight?: boolean;
}> = ({ title, value, unit, subtitle, highlight = false }) => {
  return (
    <View
      style={[
        compStyles.metricCard,
        highlight && { backgroundColor: Theme.colors.forest, borderColor: Theme.colors.forest },
      ]}
    >
      <Text style={[compStyles.metricTitle, highlight && { color: '#E1EBE6' }]}>{title}</Text>
      <View style={compStyles.valueRow}>
        <Text style={[compStyles.metricValue, highlight && { color: '#FFFFFF' }]}>{value}</Text>
        {unit && (
          <Text style={[compStyles.metricUnit, highlight && { color: Theme.colors.lime }]}>
            {' ' + unit}
          </Text>
        )}
      </View>
      <Text style={[compStyles.metricSubtitle, highlight && { color: Theme.colors.lime }]}>
        {subtitle}
      </Text>
    </View>
  );
};

const compStyles = StyleSheet.create({
  primaryButton: {
    height: 48,
    borderRadius: Theme.radii.md,
    paddingHorizontal: Theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 44,
    borderRadius: Theme.radii.md,
    paddingHorizontal: Theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  metricTitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    fontWeight: '500',
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 34,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  metricUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.forest,
  },
  metricSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.green,
  },
});

// ==========================================
// 6. GŁÓWNY PUNKT WEJŚCIA APLIKACJI
// ==========================================
import MainScreen from './src/app/index';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainScreen />
      </AppProvider>
    </SafeAreaProvider>
  );
}

