import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton, SecondaryButton } from '../components/UIComponents';
import { Icon } from '../components/Icons';

export const AdminVariants: React.FC = () => {
  const {
    energySummary,
    bookings,
    toggleBookingLock,
    publishPlan,
    planPublished,
    publishedVersion,
    setAdminTab,
  } = useApp();

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const handleConfirmPublish = () => {
    publishPlan();
    setIsPublishModalOpen(false);
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 5000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Porównanie wariantów przydziału sal</Text>
          <Text style={styles.subtitle}>
            Model optymalizacji energetycznej Future Smart City 2026 • Analiza i zatwierdzenie
          </Text>
        </View>

        <PrimaryButton
          title={planPublished ? 'Zaktualizuj i opublikuj plan' : 'Zatwierdź i opublikuj plan'}
          icon="checkmark-circle-outline"
          onPress={() => setIsPublishModalOpen(true)}
        />
      </View>

      {/* Komunikat o opublikowaniu */}
      {justPublished && (
        <View style={styles.successBanner}>
          <Icon name="checkmark-circle" size={20} color="#0F5132" />
          <Text style={styles.successBannerText}>
            Nowy plan został opublikowany jako wersja <Text style={{ fontWeight: '700' }}>{publishedVersion}</Text>!
            Powiadomienia o zmianie sal trafiły do aplikacji nauczycieli (zakładka Zmiany).
          </Text>
        </View>
      )}

      {/* Porównanie dwóch wariantów w kartach obok siebie */}
      <View style={styles.variantsComparison}>
        {/* Wariant 1: Wyjściowy */}
        <View style={styles.variantCard}>
          <View style={styles.variantHeader}>
            <Text style={styles.variantTag}>Wariant 1</Text>
            <Text style={styles.variantName}>Plan wyjściowy (Bez optymalizacji)</Text>
          </View>
          <Text style={styles.variantDesc}>
            Zajęcia rozproszone po skrzydłach A, B i C. Wszystkie strefy muszą pracować równolegle.
          </Text>

          <View style={styles.variantStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Zużycie energii:</Text>
              <Text style={styles.statValue}>{energySummary.baselineKWh} kWh</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Czas pracy stref:</Text>
              <Text style={styles.statValue}>{energySummary.baselineHours} h</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Koszt energii (1,20 zł/kWh):</Text>
              <Text style={styles.statValue}>{energySummary.baselineCost.toFixed(2)} zł</Text>
            </View>
          </View>
        </View>

        {/* Wariant 2: Zoptymalizowany */}
        <View style={[styles.variantCard, styles.variantCardOptimized]}>
          <View style={styles.variantHeader}>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedBadgeText}>Rekomendowany wariant</Text>
            </View>
            <Text style={styles.variantName}>Plan zoptymalizowany (EnergoPlan)</Text>
          </View>
          <Text style={styles.variantDesc}>
            Zajęcia skonsolidowane w skrzydle A. Skrzydła B i C wyłączone po zajęciach lekcyjnych.
          </Text>

          <View style={styles.variantStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Zużycie energii:</Text>
              <Text style={[styles.statValue, { color: Theme.colors.green, fontSize: 20 }]}>
                {energySummary.variantKWh} kWh
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Czas pracy stref:</Text>
              <Text style={[styles.statValue, { color: Theme.colors.green, fontSize: 20 }]}>
                {energySummary.variantHours} h
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Koszt energii:</Text>
              <Text style={[styles.statValue, { color: Theme.colors.green, fontSize: 20 }]}>
                {energySummary.variantCost.toFixed(2)} zł
              </Text>
            </View>
          </View>

          <View style={styles.savingsRow}>
            <Icon name="trending-down-outline" size={20} color={Theme.colors.forest} />
            <Text style={styles.savingsText}>
              Oszczędność w modelu:{' '}
              <Text style={{ fontWeight: '800' }}>
                {energySummary.savedKWh} kWh ({energySummary.percentSaved}%) • {energySummary.savedCost.toFixed(2)} zł
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Sekcja: Proponowane przeniesienia sal i spełnienie kryteriów */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Weryfikacja warunków technicznych przeniesień</Text>
        <Text style={styles.sectionSubtitle}>
          Algorytm gwarantuje spełnienie pojemności, wymaganego wyposażenia oraz dostępności bez barier
        </Text>

        <View style={styles.allocationsList}>
          {bookings.map((b) => {
            const isMoved = b.optimizedRoomId !== b.baselineRoomId;
            return (
              <View key={b.id} style={styles.allocationRow}>
                <View style={styles.allocMain}>
                  <Text style={styles.allocSubject}>{b.subject}</Text>
                  <Text style={styles.allocMeta}>
                    {b.teacherName} • {b.startTime}–{b.endTime} • {b.people} osób
                  </Text>
                </View>

                <View style={styles.allocRooms}>
                  <Text style={styles.roomFrom}>{b.baselineRoomId}</Text>
                  <Icon name="arrow-forward" size={14} color={Theme.colors.forest} />
                  <Text style={[styles.roomTo, isMoved && !b.isLocked && { color: Theme.colors.green }]}>
                    {b.isLocked ? b.baselineRoomId : b.optimizedRoomId}
                  </Text>
                </View>

                <View style={styles.allocChecks}>
                  <View style={styles.checkPill}>
                    <Icon name="checkmark" size={12} color="#137333" />
                    <Text style={styles.checkText}>Pojemność OK</Text>
                  </View>
                  <View style={styles.checkPill}>
                    <Icon name="checkmark" size={12} color="#137333" />
                    <Text style={styles.checkText}>Sprzęt OK</Text>
                  </View>
                  {b.accessibilityNeeded && (
                    <View style={styles.checkPill}>
                      <Icon name="checkmark" size={12} color="#137333" />
                      <Text style={styles.checkText}>Parter OK</Text>
                    </View>
                  )}
                </View>

                {/* Panel blokady */}
                <View style={styles.lockToggleBox}>
                  <Text style={styles.lockLabel}>Zablokuj salę:</Text>
                  <Switch
                    value={b.isLocked}
                    onValueChange={() => toggleBookingLock(b.id)}
                    trackColor={{ true: Theme.colors.warningText, false: '#DDD' }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Modal zatwierdzenia publikacji */}
      <Modal visible={isPublishModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Icon name="alert-circle-outline" size={28} color={Theme.colors.forest} />
              <Text style={styles.modalTitle}>Zatwierdzenie i publikacja planu</Text>
            </View>

            <Text style={styles.modalBody}>
              Zatwierdzasz nową wersję planu sal po lekcjach.
            </Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryLine}>
                • Modelowana redukcja energii:{' '}
                <Text style={{ fontWeight: '700' }}>
                  {energySummary.savedKWh} kWh ({energySummary.percentSaved}%)
                </Text>
              </Text>
              <Text style={styles.summaryLine}>
                • Przeniesienia sal:{' '}
                <Text style={{ fontWeight: '700' }}>
                  {bookings.filter((b) => !b.isLocked && b.optimizedRoomId !== b.baselineRoomId).length} grup zajęciowych
                </Text>
              </Text>
              <Text style={styles.summaryLine}>
                • Nauczyciele otrzymają powiadomienie o nowej sali z prośbą o potwierdzenie odbioru.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton title="Wróć" onPress={() => setIsPublishModalOpen(false)} />
              <PrimaryButton
                title="Potwierdź i opublikuj"
                variant="forest"
                onPress={handleConfirmPublish}
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.colors.successBg,
    padding: 16,
    borderRadius: Theme.radii.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B7DFC6',
  },
  successBannerText: {
    fontSize: 14,
    color: '#0F5132',
    flex: 1,
    lineHeight: 20,
  },
  variantsComparison: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  variantCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  variantCardOptimized: {
    borderColor: Theme.colors.forest,
    borderWidth: 2,
    backgroundColor: '#F7FAF8',
  },
  variantHeader: {
    marginBottom: 8,
  },
  variantTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.muted,
    textTransform: 'uppercase',
  },
  recommendedBadge: {
    backgroundColor: Theme.colors.lime,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radii.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  recommendedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.forest,
  },
  variantName: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  variantDesc: {
    fontSize: 13,
    color: Theme.colors.muted,
    lineHeight: 18,
    marginBottom: 16,
  },
  variantStats: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: Theme.radii.md,
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: Theme.colors.muted,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F3EC',
    padding: 10,
    borderRadius: Theme.radii.sm,
  },
  savingsText: {
    fontSize: 13,
    color: Theme.colors.forest,
  },
  sectionCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    marginBottom: 16,
    marginTop: 2,
  },
  allocationsList: {
    gap: 12,
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F9FAF9',
    borderRadius: Theme.radii.md,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    flexWrap: 'wrap',
    gap: 12,
  },
  allocMain: {
    width: 220,
  },
  allocSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  allocMeta: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  allocRooms: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radii.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  roomFrom: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.muted,
    textDecorationLine: 'line-through',
  },
  roomTo: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  allocChecks: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  checkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF6EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radii.sm,
  },
  checkText: {
    fontSize: 11,
    color: '#137333',
    fontWeight: '700',
  },
  lockToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockLabel: {
    fontSize: 12,
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
    maxWidth: 480,
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  modalBody: {
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 20,
    marginBottom: 14,
  },
  summaryBox: {
    backgroundColor: '#F5F8F6',
    padding: 14,
    borderRadius: Theme.radii.md,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D4E5DB',
  },
  summaryLine: {
    fontSize: 13,
    color: Theme.colors.text,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});

