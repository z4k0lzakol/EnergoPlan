import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  UserRole,
  School,
  EnergyZone,
  Room,
  Booking,
  BookingRequest,
  ChangeNotice,
  EnergySummary,
  EnergyZoneCalc,
  RequestStatus,
} from '../types';
import {
  INITIAL_SCHOOL,
  INITIAL_ZONES,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_REQUESTS,
  INITIAL_CHANGE_NOTICES,
} from '../data/mockData';

// Helper do scalania przedziałów czasowych (w minutach od północy)
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

  // Aktywne widoki
  adminTab: 'overview' | 'schedule' | 'rooms' | 'variants' | 'requests' | 'report';
  setAdminTab: (tab: 'overview' | 'schedule' | 'rooms' | 'variants' | 'requests' | 'report') => void;
  teacherTab: 'today' | 'requests' | 'changes' | 'profile' | 'new_request';
  setTeacherTab: (tab: 'today' | 'requests' | 'changes' | 'profile' | 'new_request') => void;

  // Akcje
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

  // Mapa pokoju do strefy
  const roomToZoneMap = useMemo(() => {
    const map = new Map<string, string>();
    rooms.forEach((r) => map.set(r.id, r.zoneId));
    return map;
  }, [rooms]);

  // Model energii - kalkulacja w czasie rzeczywistym
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

      // 2. Wariant zoptymalizowany (z uwzględnieniem ewentualnych blokad użytkownika)
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

  // Przełączanie blokady sali
  const toggleBookingLock = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, isLocked: !b.isLocked } : b))
    );
  };

  // Zatwierdzenie i publikacja planu
  const publishPlan = () => {
    const newVersion = `v2.0-zatwierdzony-${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
    setPublishedVersion(newVersion);
    setPlanPublished(true);

    // Wygeneruj ChangeNotice dla przeniesionych zajęć
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

  // Dodawanie wniosku (z symulacją wysyłania)
  const addRequest = async (req: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Symulacja zapisu do bazy
    const newReq: BookingRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'oczekujący',
      createdAt: new Date().toLocaleString('pl-PL'),
    };
    setRequests((prev) => [newReq, ...prev]);
    return true;
  };

  // Anulowanie wniosku
  const cancelRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'anulowany' } : r))
    );
  };

  // Przydział sali do wniosku przez administratora
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

    // Opcjonalnie dodaj do listy bookings
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

  // Odrzucenie wniosku
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

  // Potwierdzenie otrzymania zmiany przez nauczyciela
  const acknowledgeChangeNotice = (noticeId: string) => {
    const timestamp = new Date().toLocaleString('pl-PL');
    setChangeNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, acknowledgedAt: timestamp } : n))
    );
  };

  // Aktualizacja parametrów strefy
  const updateZoneParams = (zoneId: string, powerKw: number, bufferMinutes: number) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, powerKw, bufferMinutes } : z))
    );
  };

  // Dodawanie nowej sali
  const addRoom = (newRoomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...newRoomData,
      id: `${newRoomData.floor === 'Parter' ? 'A' : newRoomData.floor === 'I Piętro' ? 'B' : 'C'}${Math.floor(100 + Math.random() * 899)}`,
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  // Przywrócenie danych demonstracyjnych
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
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

