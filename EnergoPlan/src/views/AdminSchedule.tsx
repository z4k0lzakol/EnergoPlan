import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { Icon } from '../components/Icons';

export const AdminSchedule: React.FC = () => {
  const { bookings, rooms, zones, planPublished } = useApp();
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const roomMap = useMemo(() => {
    const map = new Map<string, (typeof rooms)[0]>();
    rooms.forEach((r) => map.set(r.id, r));
    return map;
  }, [rooms]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const activeRoomId = planPublished ? (b.isLocked ? b.baselineRoomId : b.optimizedRoomId) : b.baselineRoomId;
      const room = roomMap.get(activeRoomId);

      if (selectedZone !== 'all' && room?.zoneId !== selectedZone) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchSubject = b.subject.toLowerCase().includes(query);
        const matchTeacher = b.teacherName.toLowerCase().includes(query);
        const matchRoom = activeRoomId.toLowerCase().includes(query);
        if (!matchSubject && !matchTeacher && !matchRoom) return false;
      }
      return true;
    });
  }, [bookings, selectedZone, searchQuery, planPublished, roomMap]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Plan dnia i harmonogram sal</Text>
        <Text style={styles.subtitle}>
          Czwartek, 22 października 2026 • Pełny wykaz zajęć popołudniowych i obłożenia sal
        </Text>
      </View>

      {/* Ważna uwaga z dokumentu */}
      <View style={styles.infoBanner}>
        <Icon name="information-circle-outline" size={20} color={Theme.colors.forest} />
        <Text style={styles.infoBannerText}>
          <Text style={{ fontWeight: '700' }}>Zasada działania stref:</Text> Widok nie utożsamia
          pustej sali z wyłączoną instalacją. Wyłączenie oświetlenia i ograniczenie wentylacji
          następuje tylko wtedy, gdy cała strefa budynku pozostaje wolna w danym oknie czasowym.
        </Text>
      </View>

      {/* Pasek filtrów */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={18} color={Theme.colors.muted} />
          <TextInput
            placeholder="Szukaj po nazwie zajęć, nauczycielu lub sali..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor={Theme.colors.muted}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={16} color={Theme.colors.muted} />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.zonePills}>
          <Pressable
            onPress={() => setSelectedZone('all')}
            style={[styles.zonePill, selectedZone === 'all' && styles.zonePillActive]}
          >
            <Text style={[styles.zonePillText, selectedZone === 'all' && styles.zonePillTextActive]}>
              Wszystkie strefy
            </Text>
          </Pressable>
          {zones.map((z) => (
            <Pressable
              key={z.id}
              onPress={() => setSelectedZone(z.id)}
              style={[styles.zonePill, selectedZone === z.id && styles.zonePillActive]}
            >
              <Text style={[styles.zonePillText, selectedZone === z.id && styles.zonePillTextActive]}>
                {z.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Tabela / Karty zajęć */}
      <View style={styles.scheduleCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, { width: 100 }]}>Godziny</Text>
          <Text style={[styles.tableCol, { flex: 1.5 }]}>Przedmiot i opiekun</Text>
          <Text style={[styles.tableCol, { width: 90 }]}>Liczba osób</Text>
          <Text style={[styles.tableCol, { flex: 1 }]}>Wymagania</Text>
          <Text style={[styles.tableCol, { width: 150 }]}>Sala (Przed ➔ Po)</Text>
          <Text style={[styles.tableCol, { width: 110 }]}>Status strefy</Text>
        </View>

        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={32} color={Theme.colors.muted} />
            <Text style={styles.emptyText}>Brak zajęć spełniających wybrane kryteria.</Text>
          </View>
        ) : (
          filteredBookings.map((b) => {
            const hasShift = b.optimizedRoomId !== b.baselineRoomId;
            const targetRoomId = b.isLocked ? b.baselineRoomId : b.optimizedRoomId;
            const room = roomMap.get(targetRoomId);

            return (
              <View key={b.id} style={styles.tableRow}>
                <View style={[styles.tableCell, { width: 100 }]}>
                  <Text style={styles.timeText}>
                    {b.startTime}–{b.endTime}
                  </Text>
                </View>

                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.subjectText}>{b.subject}</Text>
                  <Text style={styles.teacherText}>{b.teacherName}</Text>
                </View>

                <View style={[styles.tableCell, { width: 90 }]}>
                  <View style={styles.peopleBadge}>
                    <Icon name="people-outline" size={13} color={Theme.colors.text} />
                    <Text style={styles.peopleText}>{b.people}</Text>
                  </View>
                </View>

                <View style={[styles.tableCell, { flex: 1 }]}>
                  <View style={styles.reqList}>
                    {b.equipmentNeeds.map((eq, i) => (
                      <View key={i} style={styles.reqBadge}>
                        <Text style={styles.reqBadgeText}>{eq}</Text>
                      </View>
                    ))}
                    {b.accessibilityNeeded && (
                      <View style={[styles.reqBadge, { backgroundColor: '#E2F0D9' }]}>
                        <Text style={[styles.reqBadgeText, { color: '#276C50' }]}>bez barier</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={[styles.tableCell, { width: 150 }]}>
                  {hasShift && !b.isLocked ? (
                    <View style={styles.roomShiftBox}>
                      <Text style={styles.roomOld}>{b.baselineRoomId}</Text>
                      <Icon name="arrow-forward" size={12} color={Theme.colors.green} />
                      <Text style={styles.roomNew}>{b.optimizedRoomId}</Text>
                    </View>
                  ) : (
                    <View style={styles.roomRegularBox}>
                      <Text style={styles.roomRegular}>{b.baselineRoomId}</Text>
                      {b.isLocked && <Text style={styles.lockedHint}>[Zablokowana]</Text>}
                    </View>
                  )}
                </View>

                <View style={[styles.tableCell, { width: 110 }]}>
                  <View
                    style={[
                      styles.zoneStatusPill,
                      {
                        backgroundColor:
                          room?.zoneId === 'zone-A'
                            ? '#E6F4EA'
                            : room?.zoneId === 'zone-B'
                            ? '#FEF3D6'
                            : '#FCE8E6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.zoneStatusText,
                        {
                          color:
                            room?.zoneId === 'zone-A'
                              ? '#137333'
                              : room?.zoneId === 'zone-B'
                              ? '#B06000'
                              : '#C5221F',
                        },
                      ]}
                    >
                      {room?.zoneId === 'zone-A' ? 'Strefa A' : room?.zoneId === 'zone-B' ? 'Strefa B' : 'Strefa C'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.lg,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.muted,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EAF3EE',
    borderWidth: 1,
    borderColor: '#C5DDD0',
    borderRadius: Theme.radii.md,
    padding: 14,
    marginBottom: 16,
  },
  infoBannerText: {
    fontSize: 13,
    color: Theme.colors.forest,
    flex: 1,
    lineHeight: 18,
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radii.md,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.text,
  },
  zonePills: {
    flexDirection: 'row',
  },
  zonePill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Theme.radii.full,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: 8,
  },
  zonePillActive: {
    backgroundColor: Theme.colors.forest,
    borderColor: Theme.colors.forest,
  },
  zonePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  zonePillTextActive: {
    color: '#FFFFFF',
  },
  scheduleCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F6F4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  tableCol: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.muted,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  tableCell: {
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  teacherText: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  peopleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F2F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
    alignSelf: 'flex-start',
  },
  peopleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reqList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reqBadge: {
    backgroundColor: '#EEF1F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reqBadgeText: {
    fontSize: 11,
    color: Theme.colors.muted,
  },
  roomShiftBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
    borderWidth: 1,
    borderColor: '#D2E7DC',
    alignSelf: 'flex-start',
  },
  roomOld: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.muted,
    textDecorationLine: 'line-through',
  },
  roomNew: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.green,
  },
  roomRegularBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomRegular: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.forest,
  },
  lockedHint: {
    fontSize: 10,
    color: Theme.colors.warningText,
    fontWeight: '600',
  },
  zoneStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
    alignSelf: 'flex-start',
  },
  zoneStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Theme.colors.muted,
  },
});

