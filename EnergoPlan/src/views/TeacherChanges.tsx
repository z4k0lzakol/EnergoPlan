import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton } from '../components/UIComponents';
import { Icon } from '../components/Icons';

export const TeacherChanges: React.FC = () => {
  const { changeNotices, acknowledgeChangeNotice, rooms } = useApp();

  // Zmiany dla Jana Kowalskiego
  const myNotices = changeNotices.filter((n) => n.teacherId === 'teacher-1');

  const roomMap = new Map<string, (typeof rooms)[0]>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Powiadomienia o zmianie sal</Text>
        <Text style={styles.subtitle}>
          Zmiany sal wynikające z optymalizacji zużycia energii w szkole
        </Text>
      </View>

      {myNotices.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="checkmark-done-circle-outline" size={48} color={Theme.colors.green} />
          <Text style={styles.emptyTitle}>Brak zmian sal</Text>
          <Text style={styles.emptySubtitle}>
            Twoje zajęcia odbywają się w pierwotnie przydzielonych salach.
          </Text>
        </View>
      ) : (
        <View style={styles.noticesList}>
          {myNotices.map((notice) => {
            const isAcknowledged = !!notice.acknowledgedAt;
            const newRoom = roomMap.get(notice.afterRoomId);

            return (
              <View
                key={notice.id}
                style={[
                  styles.noticeCard,
                  !isAcknowledged && styles.noticeCardUnread,
                ]}
              >
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectText}>{notice.subject}</Text>
                    <Text style={styles.dateMeta}>
                      Termin bez zmian: {notice.date} ({notice.startTime}–{notice.endTime})
                    </Text>
                  </View>
                  <View style={styles.versionTag}>
                    <Text style={styles.versionTagText}>{notice.planVersion}</Text>
                  </View>
                </View>

                {/* Porównanie sal stara -> nowa */}
                <View style={styles.shiftContainer}>
                  <View style={styles.roomCol}>
                    <Text style={styles.roomColLabel}>Poprzednia sala:</Text>
                    <Text style={styles.roomOld}>{notice.beforeRoomId}</Text>
                    <Text style={styles.roomOldLoc}>Skrzydło B, I piętro</Text>
                  </View>

                  <View style={styles.arrowBox}>
                    <Icon name="arrow-forward" size={20} color={Theme.colors.forest} />
                  </View>

                  <View style={[styles.roomCol, styles.roomNewCol]}>
                    <Text style={styles.roomColLabelNew}>Nowa sala:</Text>
                    <Text style={styles.roomNew}>{notice.afterRoomId}</Text>
                    <Text style={styles.roomNewLoc}>
                      {newRoom ? `${newRoom.floor} • ${newRoom.name}` : 'Skrzydło A, Parter'}
                    </Text>
                  </View>
                </View>

                {/* Uzasadnienie zmiany */}
                <View style={styles.reasonBox}>
                  <Icon name="leaf-outline" size={16} color={Theme.colors.forest} />
                  <Text style={styles.reasonText}>
                    <Text style={{ fontWeight: '700' }}>Powód zmiany:</Text> {notice.reason}
                  </Text>
                </View>

                {/* Akcja potwierdzenia */}
                <View style={styles.confirmSection}>
                  {isAcknowledged ? (
                    <View style={styles.acknowledgedBox}>
                      <Icon name="checkmark-circle" size={18} color="#0F5132" />
                      <Text style={styles.acknowledgedText}>
                        Potwierdzono zapoznanie się ze zmianą ({notice.acknowledgedAt})
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.unackNotice}>
                        Prosimy o potwierdzenie zapoznania się z nową lokalizacją zajęć.
                      </Text>
                      <PrimaryButton
                        title="Potwierdzam zapoznanie się ze zmianą"
                        icon="checkmark-outline"
                        onPress={() => acknowledgeChangeNotice(notice.id)}
                      />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
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
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  noticesList: {
    gap: 16,
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  noticeCardUnread: {
    borderColor: '#E8CA8C',
    borderWidth: 2,
    backgroundColor: '#FFFCF7',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  dateMeta: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  versionTag: {
    backgroundColor: '#EEF2EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radii.sm,
  },
  versionTagText: {
    fontSize: 11,
    color: Theme.colors.forest,
    fontWeight: '700',
  },
  shiftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F5',
    borderRadius: Theme.radii.lg,
    padding: 14,
    marginBottom: 14,
  },
  roomCol: {
    flex: 1,
  },
  roomNewCol: {
    paddingLeft: 10,
  },
  roomColLabel: {
    fontSize: 11,
    color: Theme.colors.muted,
    marginBottom: 2,
  },
  roomColLabelNew: {
    fontSize: 11,
    color: Theme.colors.green,
    fontWeight: '700',
    marginBottom: 2,
  },
  roomOld: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.muted,
    textDecorationLine: 'line-through',
  },
  roomOldLoc: {
    fontSize: 11,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  arrowBox: {
    paddingHorizontal: 12,
  },
  roomNew: {
    fontSize: 24,
    fontWeight: '900',
    color: Theme.colors.forest,
  },
  roomNewLoc: {
    fontSize: 11,
    color: Theme.colors.forest,
    fontWeight: '600',
    marginTop: 2,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6F1',
    padding: 12,
    borderRadius: Theme.radii.md,
    marginBottom: 16,
  },
  reasonText: {
    fontSize: 12,
    color: Theme.colors.forest,
    flex: 1,
    lineHeight: 18,
  },
  confirmSection: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
    paddingTop: 14,
  },
  unackNotice: {
    fontSize: 12,
    color: Theme.colors.warningText,
    fontWeight: '600',
    marginBottom: 10,
  },
  acknowledgedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAF6EF',
    padding: 12,
    borderRadius: Theme.radii.md,
  },
  acknowledgedText: {
    fontSize: 12,
    color: '#0F5132',
    fontWeight: '700',
    flex: 1,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.xl,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});

