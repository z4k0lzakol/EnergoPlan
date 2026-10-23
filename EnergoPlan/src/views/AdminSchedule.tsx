import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, useWindowDimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { Icon } from '../components/Icons';

export const AdminSchedule: React.FC = () => {
  const { bookings, rooms, zones, planPublished } = useApp();
  const { width } = useWindowDimensions();
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(width < 768 ? 'cards' : 'table');

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
      <View style={styles.headerRow}>
        <View style={{ flex: 1, minWidth: 260 }}>
          <Text style={styles.title}>Plan dnia i harmonogram sal</Text>
          <Text style={styles.subtitle}>
            Czwartek, 22 października 2026 • Pełny wykaz zajęć popołudniowych i obłożenia sal
          </Text>
        </View>

        {/* Przełącznik widoku Tabela / Karty */}
        <View style={styles.viewModeToggle}>
          <Pressable
            onPress={() => setViewMode('table')}
            style={[styles.viewModeBtn, viewMode === 'table' && styles.viewModeBtnActive]}
          >
            <Icon
              name="list-outline"
              size={15}
              color={viewMode === 'table' ? '#FFFFFF' : Theme.colors.forest}
            />
            <Text
              style={[
                styles.viewModeBtnText,
                viewMode === 'table' && styles.viewModeBtnTextActive,
              ]}
            >
              Tabela
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('cards')}
            style={[styles.viewModeBtn, viewMode === 'cards' && styles.viewModeBtnActive]}
          >
            <Icon
              name="grid-outline"
              size={15}
              color={viewMode === 'cards' ? '#FFFFFF' : Theme.colors.forest}
            />
            <Text
              style={[
                styles.viewModeBtnText,
                viewMode === 'cards' && styles.viewModeBtnTextActive,
              ]}
            >
              Karty
            </Text>
          </Pressable>
        </View>
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

      {/* Widok Tabeli lub Kart w zależności od wybranego trybu */}
      {viewMode === 'table' ? (
        <View style={styles.scheduleCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ minWidth: 880 }}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.tableHeader}>
                <View style={[styles.tableColCell, styles.colTime]}>
                  <Text style={styles.tableCol}>Godziny</Text>
                </View>
                <View style={[styles.tableColCell, styles.colSubject]}>
                  <Text style={styles.tableCol}>Przedmiot i opiekun</Text>
                </View>
                <View style={[styles.tableColCell, styles.colPeople]}>
                  <Text style={styles.tableCol}>Liczba osób</Text>
                </View>
                <View style={[styles.tableColCell, styles.colReq]}>
                  <Text style={styles.tableCol}>Wymagania</Text>
                </View>
                <View style={[styles.tableColCell, styles.colRoom]}>
                  <Text style={styles.tableCol}>Sala (Przed ➔ Po)</Text>
                </View>
                <View style={[styles.tableColCell, styles.colZone]}>
                  <Text style={styles.tableCol}>Status strefy</Text>
                </View>
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
                      {/* 1. Godziny */}
                      <View style={[styles.tableCell, styles.colTime]}>
                        <View style={styles.timeBadge}>
                          <Icon name="time-outline" size={13} color={Theme.colors.forest} />
                          <Text style={styles.timeText}>{b.startTime}–{b.endTime}</Text>
                        </View>
                      </View>

                      {/* 2. Przedmiot i opiekun */}
                      <View style={[styles.tableCell, styles.colSubject]}>
                        <Text style={styles.subjectText} numberOfLines={2}>
                          {b.subject}
                        </Text>
                        <Text style={styles.teacherText} numberOfLines={1}>
                          {b.teacherName}
                        </Text>
                      </View>

                      {/* 3. Liczba osób */}
                      <View style={[styles.tableCell, styles.colPeople]}>
                        <View style={styles.peopleBadge}>
                          <Icon name="people-outline" size={13} color={Theme.colors.forest} />
                          <Text style={styles.peopleText}>{b.people} osób</Text>
                        </View>
                      </View>

                      {/* 4. Wymagania */}
                      <View style={[styles.tableCell, styles.colReq]}>
                        <View style={styles.reqList}>
                          {b.equipmentNeeds.length === 0 && !b.accessibilityNeeded && (
                            <Text style={styles.reqNoneText}>Standardowa</Text>
                          )}
                          {b.equipmentNeeds.map((eq, i) => (
                            <View key={i} style={styles.reqBadge}>
                              <Text style={styles.reqBadgeText}>{eq}</Text>
                            </View>
                          ))}
                          {b.accessibilityNeeded && (
                            <View style={[styles.reqBadge, { backgroundColor: '#E2F0D9' }]}>
                              <Text style={[styles.reqBadgeText, { color: '#276C50' }]}>bez schodów</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* 5. Sala (Przed ➔ Po) */}
                      <View style={[styles.tableCell, styles.colRoom]}>
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

                      {/* 6. Status strefy */}
                      <View style={[styles.tableCell, styles.colZone]}>
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
        </View>
      ) : (
        /* Widok Kartowy */
        <View style={styles.cardList}>
          {filteredBookings.length === 0 ? (
            <View style={[styles.scheduleCard, styles.emptyState]}>
              <Icon name="calendar-outline" size={32} color={Theme.colors.muted} />
              <Text style={styles.emptyText}>Brak zajęć spełniających wybrane kryteria.</Text>
            </View>
          ) : (
            filteredBookings.map((b) => {
              const hasShift = b.optimizedRoomId !== b.baselineRoomId;
              const targetRoomId = b.isLocked ? b.baselineRoomId : b.optimizedRoomId;
              const room = roomMap.get(targetRoomId);

              return (
                <View key={b.id} style={styles.scheduleItemCard}>
                  {/* Górny pasek karty: Godziny i Strefa */}
                  <View style={styles.itemCardTop}>
                    <View style={styles.timeBadge}>
                      <Icon name="time-outline" size={13} color={Theme.colors.forest} />
                      <Text style={styles.timeText}>{b.startTime}–{b.endTime}</Text>
                    </View>

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

                  {/* Treść: Przedmiot i opiekun */}
                  <Text style={styles.cardSubjectTitle}>{b.subject}</Text>
                  <Text style={styles.cardTeacherSub}>Opiekun: {b.teacherName}</Text>

                  {/* Parametry: Liczba osób i Sala */}
                  <View style={styles.cardMetaGrid}>
                    <View style={styles.cardMetaItem}>
                      <Text style={styles.cardMetaLabel}>Liczba osób:</Text>
                      <View style={styles.peopleBadge}>
                        <Icon name="people-outline" size={13} color={Theme.colors.forest} />
                        <Text style={styles.peopleText}>{b.people} osób</Text>
                      </View>
                    </View>

                    <View style={styles.cardMetaItem}>
                      <Text style={styles.cardMetaLabel}>Sala (Przed ➔ Po):</Text>
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
                  </View>

                  {/* Wymagania */}
                  <View style={styles.cardReqSection}>
                    <Text style={styles.cardMetaLabel}>Wymagania sali: </Text>
                    <View style={styles.reqList}>
                      {b.equipmentNeeds.length === 0 && !b.accessibilityNeeded && (
                        <Text style={styles.reqNoneText}>Standardowa sala lekcyjna</Text>
                      )}
                      {b.equipmentNeeds.map((eq, i) => (
                        <View key={i} style={styles.reqBadge}>
                          <Text style={styles.reqBadgeText}>{eq}</Text>
                        </View>
                      ))}
                      {b.accessibilityNeeded && (
                        <View style={[styles.reqBadge, { backgroundColor: '#E2F0D9' }]}>
                          <Text style={[styles.reqBadgeText, { color: '#276C50' }]}>bez schodów</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
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
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#EDF2EE',
    borderRadius: Theme.radii.full,
    padding: 3,
    gap: 4,
    alignSelf: 'flex-start',
  },
  viewModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radii.full,
  },
  viewModeBtnActive: {
    backgroundColor: Theme.colors.forest,
  },
  viewModeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.muted,
  },
  viewModeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    flexShrink: 1,
    minWidth: 0,
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
  tableColCell: {
    justifyContent: 'center',
    paddingRight: 10,
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
    paddingRight: 10,
  },
  colTime: {
    width: 125,
  },
  colSubject: {
    width: 230,
  },
  colPeople: {
    width: 115,
  },
  colReq: {
    width: 155,
  },
  colRoom: {
    width: 145,
  },
  colZone: {
    width: 110,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDF2EE',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Theme.radii.sm,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.forest,
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
    gap: 5,
    backgroundColor: '#EEF2EE',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Theme.radii.sm,
    alignSelf: 'flex-start',
  },
  peopleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.forest,
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
  reqNoneText: {
    fontSize: 12,
    color: Theme.colors.muted,
    fontStyle: 'italic',
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
  // Style dla widoku kartowego
  cardList: {
    gap: 12,
  },
  scheduleItemCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  cardSubjectTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  cardTeacherSub: {
    fontSize: 13,
    color: Theme.colors.muted,
    marginTop: 2,
    marginBottom: 12,
  },
  cardMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: 10,
  },
  cardMetaItem: {
    minWidth: 130,
    flex: 1,
  },
  cardMetaLabel: {
    fontSize: 11,
    color: Theme.colors.muted,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardReqSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
});
