import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton, SecondaryButton, StatusBadge } from '../components/UIComponents';
import { Icon } from '../components/Icons';
import { BookingRequest, Room } from '../types';

export const AdminRequests: React.FC = () => {
  const { requests, rooms, bookings, allocateRoomToRequest, rejectRequest } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'oczekujący' | 'przydzielony' | 'odrzucony'>('all');

  // Modal przydziału
  const [assigningReq, setAssigningReq] = useState<BookingRequest | null>(null);

  // Modal odrzucenia
  const [rejectingReq, setRejectingReq] = useState<BookingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const filteredRequests = requests.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.status === selectedFilter;
  });

  // Weryfikacja kompatybilności sali dla danego wniosku
  const checkRoomSuitability = (room: Room, req: BookingRequest) => {
    const issues: string[] = [];

    // 1. Pojemność
    if (room.capacity < req.people) {
      issues.push(`Za mała pojemność (${room.capacity} < ${req.people} os.)`);
    }

    // 2. Dostępność bez barier
    if (req.accessibilityNeeded && !room.accessibility) {
      issues.push('Brak dostępu bez barier (wymagany parter / winda)');
    }

    // 3. Wyposażenie
    for (const eq of req.equipmentNeeds) {
      if (!room.equipment.includes(eq)) {
        issues.push(`Brak wymaganego sprzętu: ${eq}`);
      }
    }

    // 4. Kolizja terminów z istniejącymi rezerwacjami
    const reqStart = req.startTime;
    const reqEnd = req.endTime;
    const hasConflict = bookings.some((b) => {
      if (b.date !== req.date) return false;
      if (b.baselineRoomId !== room.id && b.optimizedRoomId !== room.id) return false;
      // Sprawdź nakładanie się przedziałów
      return !(reqEnd <= b.startTime || reqStart >= b.endTime);
    });

    if (hasConflict) {
      issues.push('Sala zajęta w wybranym terminie');
    }

    return {
      suitable: issues.length === 0,
      issues,
    };
  };

  const handleOpenAssign = (req: BookingRequest) => {
    setAssigningReq(req);
  };

  const handleConfirmAssign = (roomId: string) => {
    if (assigningReq) {
      allocateRoomToRequest(assigningReq.id, roomId);
      setAssigningReq(null);
    }
  };

  const handleOpenReject = (req: BookingRequest) => {
    setRejectingReq(req);
    setRejectReason('Brak wolnych sal spełniających wymagania techniczne w tym terminie.');
  };

  const handleConfirmReject = () => {
    if (rejectingReq) {
      rejectRequest(rejectingReq.id, rejectReason);
      setRejectingReq(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 260 }}>
          <Text style={styles.title}>Wnioski nauczycieli o przydział sal</Text>
          <Text style={styles.subtitle}>
            Zgłoszenia zajęć pozalekcyjnych, weryfikacja kryteriów technicznych i przydział
          </Text>
        </View>

        {/* Filtr statusu */}
        <View style={styles.filterTabs}>
          {(['all', 'oczekujący', 'przydzielony', 'odrzucony'] as const).map((st) => (
            <Pressable
              key={st}
              onPress={() => setSelectedFilter(st)}
              style={[styles.filterTab, selectedFilter === st && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, selectedFilter === st && styles.filterTabTextActive]}>
                {st === 'all' ? 'Wszystkie' : st.charAt(0).toUpperCase() + st.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Lista wniosków */}
      <View style={styles.requestsList}>
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="document-text-outline" size={36} color={Theme.colors.muted} />
            <Text style={styles.emptyTitle}>Brak wniosków w tej kategorii</Text>
            <Text style={styles.emptyDesc}>Wszystkie zgłoszenia zostały rozpatrzone.</Text>
          </View>
        ) : (
          filteredRequests.map((req) => (
            <View key={req.id} style={styles.requestCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardTitleBox}>
                  <Text style={styles.requestSubject}>{req.subject}</Text>
                  <Text style={styles.requestAuthor}>
                    Zgłaszający: <Text style={{ fontWeight: '700', color: Theme.colors.text }}>{req.ownerName}</Text> • {req.createdAt}
                  </Text>
                </View>
                <StatusBadge status={req.status} />
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Termin zajęć:</Text>
                  <Text style={styles.detailValue}>
                    {req.date} ({req.startTime}–{req.endTime})
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Liczba uczestników:</Text>
                  <Text style={styles.detailValue}>{req.people} osób</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Wymagania sali:</Text>
                  <View style={styles.needsRow}>
                    {req.equipmentNeeds.length === 0 && !req.accessibilityNeeded && (
                      <Text style={styles.detailValue}>Standardowa sala lekcyjna</Text>
                    )}
                    {req.equipmentNeeds.map((eq, i) => (
                      <View key={i} style={styles.needBadge}>
                        <Text style={styles.needBadgeText}>{eq}</Text>
                      </View>
                    ))}
                    {req.accessibilityNeeded && (
                      <View style={[styles.needBadge, { backgroundColor: '#E2F0D9' }]}>
                        <Text style={[styles.needBadgeText, { color: '#276C50' }]}>bez schodów</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {req.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>
                    <Text style={{ fontWeight: '700' }}>Uwagi nauczyciela:</Text> {req.notes}
                  </Text>
                </View>
              )}

              {req.status === 'przydzielony' && req.assignedRoomId && (
                <View style={styles.assignedBox}>
                  <Icon name="checkbox-outline" size={18} color="#0F5132" />
                  <Text style={styles.assignedText}>
                    Przydzielono salę: <Text style={{ fontWeight: '800' }}>{req.assignedRoomId}</Text>
                  </Text>
                </View>
              )}

              {req.status === 'odrzucony' && req.rejectionReason && (
                <View style={styles.rejectedBox}>
                  <Icon name="alert-circle-outline" size={18} color="#DC3545" />
                  <Text style={styles.rejectedText}>
                    Powód odmowy: {req.rejectionReason}
                  </Text>
                </View>
              )}

              {/* Przyciski akcji dla administratora */}
              {req.status === 'oczekujący' && (
                <View style={styles.actionRow}>
                  <SecondaryButton
                    title="Odrzuć wniosek"
                    style={styles.actionBtnSecondary}
                    onPress={() => handleOpenReject(req)}
                  />
                  <PrimaryButton
                    title="Sprawdź i przydziel salę"
                    icon="checkmark"
                    style={styles.actionBtnPrimary}
                    onPress={() => handleOpenAssign(req)}
                  />
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Modal przydziału sali z regułami twardymi */}
      <Modal visible={assigningReq !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 600 }]}>
            <View style={styles.modalHeader}>
              <Icon name="business-outline" size={24} color={Theme.colors.forest} />
              <View>
                <Text style={styles.modalTitle}>Weryfikacja i przydział sali</Text>
                <Text style={styles.modalSubtitle}>
                  Zgłoszenie: {assigningReq?.subject} ({assigningReq?.people} osób, {assigningReq?.startTime}–{assigningReq?.endTime})
                </Text>
              </View>
            </View>

            <Text style={styles.roomSelectHeader}>
              Dostępne sale w szkole (sprawdzenie kryteriów technicznych i kolizji):
            </Text>

            <ScrollView style={{ maxHeight: 320 }}>
              <View style={styles.roomsCheckList}>
                {assigningReq &&
                  rooms.map((room) => {
                    const check = checkRoomSuitability(room, assigningReq);
                    return (
                      <View
                        key={room.id}
                        style={[
                          styles.roomCheckRow,
                          !check.suitable && styles.roomCheckRowDisabled,
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={styles.roomCheckId}>{room.id}</Text>
                            <Text style={styles.roomCheckCap}>({room.capacity} os. • {room.floor})</Text>
                            {room.accessibility && (
                              <View style={styles.miniBadge}>
                                <Text style={styles.miniBadgeText}>bez barier</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.roomCheckName}>{room.name}</Text>

                          {/* Wyświetlenie ewentualnych niespełnionych warunków */}
                          {!check.suitable && (
                            <View style={styles.issuesList}>
                              {check.issues.map((iss, idx) => (
                                <Text key={idx} style={styles.issueText}>
                                  • {iss}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>

                        <View style={{ justifyContent: 'center' }}>
                          {check.suitable ? (
                            <PrimaryButton
                              title="Przydziel salę"
                              variant="green"
                              onPress={() => handleConfirmAssign(room.id)}
                            />
                          ) : (
                            <View style={styles.disabledTag}>
                              <Text style={styles.disabledTagText}>Niedostępna</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
              </View>
            </ScrollView>

            <View style={{ marginTop: 16, alignItems: 'flex-end' }}>
              <SecondaryButton title="Zamknij" onPress={() => setAssigningReq(null)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal odrzucenia wniosku */}
      <Modal visible={rejectingReq !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Odrzucenie wniosku</Text>
            <Text style={styles.modalSubtitle}>
              Podaj czytelne uzasadnienie dla nauczyciela ({rejectingReq?.subject}):
            </Text>

            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
            />

            <View style={styles.modalActions}>
              <SecondaryButton title="Anuluj" onPress={() => setRejectingReq(null)} />
              <PrimaryButton
                title="Odrzuć wniosek"
                variant="danger"
                onPress={handleConfirmReject}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.muted,
    marginTop: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    backgroundColor: Theme.colors.surface,
    padding: 4,
    borderRadius: Theme.radii.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radii.sm,
  },
  filterTabActive: {
    backgroundColor: Theme.colors.forest,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.muted,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  requestsList: {
    gap: 16,
  },
  requestCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleBox: {
    flex: 1,
  },
  requestSubject: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  requestAuthor: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: 12,
  },
  detailItem: {
    minWidth: 160,
  },
  detailLabel: {
    fontSize: 11,
    color: Theme.colors.muted,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  needsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  needBadge: {
    backgroundColor: '#EDF1EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  needBadgeText: {
    fontSize: 11,
    color: Theme.colors.forest,
    fontWeight: '600',
  },
  notesBox: {
    backgroundColor: '#F9FAF9',
    padding: 10,
    borderRadius: Theme.radii.sm,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 12,
    color: Theme.colors.text,
    lineHeight: 18,
  },
  assignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF6EF',
    padding: 12,
    borderRadius: Theme.radii.md,
    marginTop: 4,
  },
  assignedText: {
    fontSize: 13,
    color: '#0F5132',
  },
  rejectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.dangerBg,
    padding: 12,
    borderRadius: Theme.radii.md,
    marginTop: 4,
  },
  rejectedText: {
    fontSize: 13,
    color: Theme.colors.dangerText,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  actionBtnSecondary: {
    flexGrow: 1,
    minWidth: 130,
  },
  actionBtnPrimary: {
    flexGrow: 1,
    minWidth: 180,
  },
  emptyCard: {
    backgroundColor: Theme.colors.surface,
    padding: 40,
    borderRadius: Theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  emptyDesc: {
    fontSize: 13,
    color: Theme.colors.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.lg,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
  },
  roomSelectHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 10,
  },
  roomsCheckList: {
    gap: 10,
  },
  roomCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F7F9F7',
    borderRadius: Theme.radii.md,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    flexWrap: 'wrap',
    gap: 10,
  },
  roomCheckRowDisabled: {
    backgroundColor: '#FDF7F7',
    borderColor: '#F5DCDC',
  },
  roomCheckId: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.forest,
  },
  roomCheckCap: {
    fontSize: 12,
    color: Theme.colors.muted,
  },
  miniBadge: {
    backgroundColor: '#E2F0D9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#276C50',
  },
  roomCheckName: {
    fontSize: 13,
    color: Theme.colors.text,
    marginTop: 2,
  },
  issuesList: {
    marginTop: 4,
  },
  issueText: {
    fontSize: 11,
    color: '#DC3545',
    fontWeight: '600',
  },
  disabledTag: {
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Theme.radii.sm,
  },
  disabledTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radii.md,
    padding: 12,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
});

