import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton, SecondaryButton, StatusBadge } from '../components/UIComponents';
import { Icon } from '../components/Icons';

export const TeacherRequests: React.FC = () => {
  const { requests, cancelRequest, setTeacherTab } = useApp();

  // Filtrujemy wnioski dla Jana Kowalskiego
  const myRequests = requests.filter((r) => r.ownerName === 'Jan Kowalski');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Moje wnioski o salę</Text>
          <Text style={styles.subtitle}>
            Historia zgłoszeń i status przydziału sal przez administratora szkoły
          </Text>
        </View>

        <PrimaryButton
          title="+ Zgłoś zajęcia"
          icon="add-outline"
          onPress={() => setTeacherTab('new_request')}
        />
      </View>

      {myRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="document-text-outline" size={48} color={Theme.colors.muted} />
          <Text style={styles.emptyTitle}>Brak zgłoszonych wniosków</Text>
          <Text style={styles.emptySubtitle}>
            Nie masz jeszcze żadnych wniosków o przydział sali. Dotknij przycisku poniżej, aby zgłosić swoje zajęcia.
          </Text>
          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              title="Zgłoś pierwsze zajęcia"
              onPress={() => setTeacherTab('new_request')}
            />
          </View>
        </View>
      ) : (
        <View style={styles.requestsList}>
          {myRequests.map((req) => (
            <View key={req.id} style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestSubject}>{req.subject}</Text>
                  <Text style={styles.requestDate}>Zgłoszono: {req.createdAt}</Text>
                </View>
                <StatusBadge status={req.status} />
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Termin:</Text>
                  <Text style={styles.infoValue}>
                    {req.date} ({req.startTime}–{req.endTime})
                  </Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Uczestnicy:</Text>
                  <Text style={styles.infoValue}>{req.people} osób</Text>
                </View>
              </View>

              {/* Status przydzielenia */}
              {req.status === 'przydzielony' && req.assignedRoomId && (
                <View style={styles.assignedBadgeBox}>
                  <Icon name="checkmark-circle" size={18} color="#0F5132" />
                  <Text style={styles.assignedBadgeText}>
                    Przydzielona sala: <Text style={{ fontWeight: '800' }}>{req.assignedRoomId}</Text>
                  </Text>
                </View>
              )}

              {req.status === 'odrzucony' && req.rejectionReason && (
                <View style={styles.rejectedBadgeBox}>
                  <Icon name="close-circle" size={18} color="#DC3545" />
                  <Text style={styles.rejectedBadgeText}>
                    Uzasadnienie: {req.rejectionReason}
                  </Text>
                </View>
              )}

              {/* Anulowanie wniosku oczekującego */}
              {req.status === 'oczekujący' && (
                <View style={styles.cardActions}>
                  <Text style={styles.pendingHint}>
                    Wniosek oczekuje na weryfikację harmonogramu przez dyrekcję.
                  </Text>
                  <SecondaryButton
                    title="Anuluj wniosek"
                    onPress={() => cancelRequest(req.id)}
                  />
                </View>
              )}
            </View>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
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
  requestsList: {
    gap: 14,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestSubject: {
    fontSize: 17,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  requestDate: {
    fontSize: 11,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: 10,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Theme.colors.muted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginTop: 2,
  },
  assignedBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF6EF',
    padding: 10,
    borderRadius: Theme.radii.md,
    marginTop: 4,
  },
  assignedBadgeText: {
    fontSize: 13,
    color: '#0F5132',
  },
  rejectedBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.dangerBg,
    padding: 10,
    borderRadius: Theme.radii.md,
    marginTop: 4,
  },
  rejectedBadgeText: {
    fontSize: 13,
    color: Theme.colors.dangerText,
  },
  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pendingHint: {
    fontSize: 12,
    color: Theme.colors.muted,
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
    maxWidth: 400,
  },
});

