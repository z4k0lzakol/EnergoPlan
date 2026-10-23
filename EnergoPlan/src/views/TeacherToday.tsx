import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton } from '../components/UIComponents';
import { Icon } from '../components/Icons';

export const TeacherToday: React.FC = () => {
  const { bookings, changeNotices, setTeacherTab, planPublished, publishedVersion } = useApp();

  // Zalogowany nauczyciel: Jan Kowalski (Angielski)
  const teacherBooking = bookings.find((b) => b.teacherName === 'Jan Kowalski');
  const unacknowledgedNotice = changeNotices.find(
    (n) => n.teacherId === 'teacher-1' && !n.acknowledgedAt
  );

  const activeRoomId = planPublished
    ? teacherBooking?.isLocked
      ? teacherBooking?.baselineRoomId
      : teacherBooking?.optimizedRoomId
    : teacherBooking?.baselineRoomId || 'B201';

  const isRoomChanged = activeRoomId !== teacherBooking?.baselineRoomId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.dateText}>CZWARTEK, 22 PAŹDZIERNIKA 2026</Text>
        <Text style={styles.screenTitle}>Twój dzień w szkole</Text>
        <Text style={styles.teacherGreeting}>Witaj, Jan Kowalski (Nauczyciel)</Text>
      </View>

      {/* Główna ciemnozielona karta najbliższych zajęć */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.timeBadge}>
            <Icon name="time-outline" size={14} color={Theme.colors.lime} />
            <Text style={styles.timeBadgeText}>
              {teacherBooking?.startTime || '16:00'}–{teacherBooking?.endTime || '17:30'}
            </Text>
          </View>
          <View style={styles.subjectPill}>
            <Text style={styles.subjectPillText}>Zajęcia pozalekcyjne</Text>
          </View>
        </View>

        <Text style={styles.subjectTitle}>{teacherBooking?.subject || 'Język angielski'}</Text>

        <View style={styles.roomContainer}>
          <Text style={styles.roomLabel}>Twoja sala:</Text>
          <View style={styles.roomNumberRow}>
            <Text style={styles.roomNumber}>{activeRoomId}</Text>
            {isRoomChanged && (
              <View style={styles.newRoomBadge}>
                <Text style={styles.newRoomBadgeText}>NOWA SALA</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.heroMetaRow}>
          <View style={styles.metaItem}>
            <Icon name="people-outline" size={14} color="#D4EF97" />
            <Text style={styles.metaText}>{teacherBooking?.people || 12} osób</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Icon name="business-outline" size={14} color="#D4EF97" />
            <Text style={styles.metaText}>
              {activeRoomId === 'A102' ? 'Skrzydło A (Parter)' : 'Skrzydło B (I piętro)'}
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Icon name="tv-outline" size={14} color="#D4EF97" />
            <Text style={styles.metaText}>Sala z ekranem</Text>
          </View>
        </View>
      </View>

      {/* Karta statusu aktualności / ostrzeżenie o zmianie */}
      {unacknowledgedNotice ? (
        <Pressable
          style={styles.changeNoticeBanner}
          onPress={() => setTeacherTab('changes')}
        >
          <View style={styles.warningIconBox}>
            <Icon name="notifications" size={22} color="#8A5A16" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.changeNoticeTitle}>Zmiana sali wymaga potwierdzenia!</Text>
            <Text style={styles.changeNoticeDesc}>
              Administrator przeniósł Twoje zajęcia z sali {unacknowledgedNotice.beforeRoomId} do {unacknowledgedNotice.afterRoomId}.
              Dotknij, aby przejść do potwierdzenia odbioru.
            </Text>
          </View>
          <Icon name="chevron-forward" size={18} color="#8A5A16" />
        </Pressable>
      ) : (
        <View style={styles.statusCurrentCard}>
          <Icon name="checkmark-circle-outline" size={22} color="#137333" />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusCurrentTitle}>Plan jest aktualny</Text>
            <Text style={styles.statusCurrentDesc}>Zmiany znajdziesz w aplikacji</Text>
          </View>
        </View>
      )}

      {/* Przycisk akcji Zgłoś zajęcia */}
      <View style={styles.actionSection}>
        <PrimaryButton
          title="Zgłoś zajęcia"
          icon="add-circle-outline"
          onPress={() => setTeacherTab('new_request')}
        />
      </View>

      {/* Pozostałe zaplanowane wydarzenia */}
      <View style={styles.secondarySection}>
        <Text style={styles.secondaryTitle}>Harmonogram na kolejne dni</Text>

        <View style={styles.upcomingItem}>
          <View style={styles.upcomingTimeCol}>
            <Text style={styles.upcomingDay}>PIĄ</Text>
            <Text style={styles.upcomingDate}>23.10</Text>
          </View>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingSubject}>Konsultacje językowe</Text>
            <Text style={styles.upcomingDetails}>15:30–17:00 • 6 osób • Sala B201</Text>
          </View>
          <View style={styles.upcomingStatus}>
            <Text style={styles.upcomingStatusText}>Oczekuje na przydział</Text>
          </View>
        </View>
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
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text,
    marginTop: 4,
  },
  teacherGreeting: {
    fontSize: 14,
    color: Theme.colors.forest,
    fontWeight: '600',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: Theme.colors.forest,
    borderRadius: Theme.radii.xl,
    padding: 24,
    shadowColor: '#153F35',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 239, 151, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.radii.full,
  },
  timeBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.lime,
  },
  subjectPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
  },
  subjectPillText: {
    fontSize: 11,
    color: '#E0E8E4',
    fontWeight: '600',
  },
  subjectTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  roomContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Theme.radii.lg,
    padding: 16,
    marginBottom: 16,
  },
  roomLabel: {
    fontSize: 13,
    color: '#D4EF97',
    fontWeight: '600',
    marginBottom: 4,
  },
  roomNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  newRoomBadge: {
    backgroundColor: Theme.colors.lime,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
  },
  newRoomBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.forest,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#E0E8E4',
    fontWeight: '500',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#65756D',
  },
  changeNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Theme.colors.warningBg,
    borderRadius: Theme.radii.lg,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E8CA8C',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  warningIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFE5B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeNoticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.warningText,
  },
  changeNoticeDesc: {
    fontSize: 12,
    color: Theme.colors.warningText,
    lineHeight: 16,
    marginTop: 2,
  },
  statusCurrentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 20,
  },
  statusCurrentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  statusCurrentDesc: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  actionSection: {
    marginBottom: 24,
  },
  secondarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 14,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Theme.radii.md,
    backgroundColor: '#F9FAF9',
    gap: 12,
    flexWrap: 'wrap',
  },
  upcomingTimeCol: {
    alignItems: 'center',
    backgroundColor: '#EEF2EE',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Theme.radii.sm,
  },
  upcomingDay: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.forest,
  },
  upcomingDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.muted,
  },
  upcomingInfo: {
    flex: 1,
    minWidth: 140,
  },
  upcomingSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  upcomingDetails: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  upcomingStatus: {
    backgroundColor: Theme.colors.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.radii.sm,
    alignSelf: 'flex-start',
  },
  upcomingStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.warningText,
  },
});

