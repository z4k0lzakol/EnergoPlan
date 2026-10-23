import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { MetricCard, PrimaryButton } from '../components/UIComponents';
import { Icon } from '../components/Icons';

export const AdminOverview: React.FC = () => {
  const { energySummary, bookings, setAdminTab, planPublished, publishedVersion } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Subheader z nazwą szkoły */}
      <View style={styles.header}>
        <Text style={styles.schoolSubtitle}>Szkoła demonstracyjna • EnergoPlan 2026</Text>
        <Text style={styles.mainTitle}>Lepszy plan. Mniej energii.</Text>
        <Text style={styles.description}>
          Model optymalizacji przydziału sal pozalekcyjnych. Grupowanie zajęć w strefie A pozwala
          skrócić czas pracy wentylacji i oświetlenia w pozostałych skrzydłach szkoły.
        </Text>
      </View>

      {/* Trzy wskaźniki główne */}
      <View style={styles.metricsRow}>
        <MetricCard
          title="Potencjał zmiany"
          value={`${energySummary.savedKWh.toString().replace('.', ',')}`}
          unit="kWh"
          subtitle={`${energySummary.percentSaved}% mniej w modelu`}
          highlight
        />
        <MetricCard
          title="Szacowane zużycie"
          value={`${energySummary.baselineKWh.toString().replace('.', ',')}`}
          unit="kWh"
          subtitle="Plan wyjściowy"
        />
        <MetricCard
          title="Czas pracy stref"
          value={`${energySummary.baselineHours.toString().replace('.', ',')}`}
          unit="h"
          subtitle="Suma dla stref A, B i C"
        />
      </View>

      {/* Dwie kolumny: Plan po lekcjach & Propozycje zmian */}
      <View style={styles.twoColumnGrid}>
        {/* Kolumna 1: Plan po lekcjach */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Plan po lekcjach (Czw, 22.10)</Text>
            <Pressable onPress={() => setAdminTab('schedule')}>
              <Text style={styles.cardLink}>Zobacz harmonogram →</Text>
            </Pressable>
          </View>

          <View style={styles.eventList}>
            {bookings.map((b) => (
              <View key={b.id} style={styles.eventRow}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventSubject}>{b.subject}</Text>
                  <Text style={styles.eventMeta}>
                    {b.startTime}–{b.endTime} • {b.people} osób • {b.teacherName}
                  </Text>
                </View>
                <View
                  style={[
                    styles.roomTag,
                    {
                      backgroundColor:
                        b.baselineRoomId.startsWith('A')
                          ? '#E2F0D9'
                          : b.baselineRoomId.startsWith('B')
                          ? '#E8F0FE'
                          : '#FFF0D4',
                    },
                  ]}
                >
                  <Text style={[styles.roomTagText, { color: Theme.colors.text }]}>
                    {b.baselineRoomId}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Kolumna 2: Propozycje zmian */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Propozycje zmian</Text>
            {planPublished ? (
              <View style={styles.publishedBadge}>
                <Text style={styles.publishedBadgeText}>Plan opublikowany ({publishedVersion})</Text>
              </View>
            ) : (
              <View style={styles.draftBadge}>
                <Text style={styles.draftBadgeText}>Wariant roboczy</Text>
              </View>
            )}
          </View>

          <View style={styles.changeProposals}>
            <View style={styles.proposalItem}>
              <Text style={styles.proposalSubject}>Język angielski</Text>
              <View style={styles.shiftPill}>
                <Text style={styles.shiftText}>B201 ➔ A102</Text>
              </View>
              <Text style={styles.proposalTime}>16:00–17:30 • 12 osób • Ekran multimedialny</Text>
            </View>

            <View style={styles.proposalItem}>
              <Text style={styles.proposalSubject}>Samorząd uczniowski</Text>
              <View style={styles.shiftPill}>
                <Text style={styles.shiftText}>C301 ➔ A102</Text>
              </View>
              <Text style={styles.proposalTime}>18:00–19:30 • 10 osób • Standardowa</Text>
            </View>

            <View style={styles.proposalBenefitBanner}>
              <Icon name="leaf-outline" size={18} color={Theme.colors.forest} />
              <Text style={styles.proposalBenefitText}>
                Strefy B i C zostają całkowicie wyłączone po lekcjach. Oszczędność:{' '}
                <Text style={{ fontWeight: '700' }}>3,6 kWh (4,32 zł)</Text> na jednym popołudniu.
              </Text>
            </View>

            <View style={{ marginTop: 14 }}>
              <PrimaryButton
                title="Porównaj warianty"
                icon="git-compare-outline"
                onPress={() => setAdminTab('variants')}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Dolna sekcja: Okresy pracy stref */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.cardTitle}>Okresy pracy i bilans stref energetycznych</Text>
        <Text style={styles.cardSubtitle}>
          Porównanie czasu pracy wentylacji i oświetlenia (uwzględnia 30 min buforu technicznego po zajęciach)
        </Text>

        <View style={styles.zoneTable}>
          {energySummary.zoneCalculations.map((z) => (
            <View key={z.zoneId} style={styles.zoneRow}>
              <View style={styles.zoneNameCol}>
                <Text style={styles.zoneRowName}>{z.zoneName}</Text>
                <Text style={styles.zoneRowPower}>Moc: {z.powerKw} kW</Text>
              </View>

              <View style={styles.zoneBarCol}>
                <View style={styles.barLabels}>
                  <Text style={styles.barLabel}>
                    Przed: {z.baselineHours} h ({z.baselineKWh} kWh)
                  </Text>
                  <Text style={[styles.barLabel, { fontWeight: '700', color: Theme.colors.green }]}>
                    Po: {z.variantHours} h ({z.variantKWh} kWh)
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFillBaseline,
                      { width: `${Math.min(100, (z.baselineHours / 6.5) * 100)}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.barFillVariant,
                      { width: `${Math.min(100, (z.variantHours / 6.5) * 100)}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.zoneResultCol}>
                <Text style={styles.zoneSavedText}>
                  {z.savedKWh > 0 ? `-${z.savedKWh} kWh` : z.savedKWh < 0 ? `+${Math.abs(z.savedKWh)} kWh` : '0 kWh'}
                </Text>
                <Text style={styles.zoneReductionText}>
                  {z.reductionPercent > 0 ? `-${z.reductionPercent}%` : 'b/z'}
                </Text>
              </View>
            </View>
          ))}
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
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: Theme.spacing.lg,
  },
  schoolSubtitle: {
    fontSize: 14,
    color: Theme.colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Theme.colors.muted,
    lineHeight: 22,
    maxWidth: 800,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    flex: 1,
    minWidth: 320,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.lg,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    marginBottom: 16,
  },
  cardLink: {
    fontSize: 14,
    color: Theme.colors.green,
    fontWeight: '600',
  },
  eventList: {
    gap: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: Theme.radii.md,
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  eventInfo: {
    flex: 1,
  },
  eventSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 2,
  },
  eventMeta: {
    fontSize: 12,
    color: Theme.colors.muted,
  },
  roomTag: {
    backgroundColor: Theme.colors.forest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radii.sm,
  },
  roomTagText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  publishedBadge: {
    backgroundColor: Theme.colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
  },
  publishedBadgeText: {
    color: Theme.colors.successText,
    fontSize: 11,
    fontWeight: '700',
  },
  draftBadge: {
    backgroundColor: Theme.colors.warningBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radii.full,
  },
  draftBadgeText: {
    color: Theme.colors.warningText,
    fontSize: 11,
    fontWeight: '700',
  },
  changeProposals: {
    gap: 12,
  },
  proposalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FDFBF7',
    borderRadius: Theme.radii.md,
    borderWidth: 1,
    borderColor: '#F3EBDD',
  },
  proposalInfo: {
    flex: 1,
  },
  proposalSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  proposalTime: {
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 2,
  },
  shiftPill: {
    marginVertical: 4,
  },
  shiftText: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.forest,
    letterSpacing: 0.5,
  },
  proposalBenefitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF6F0',
    padding: 12,
    borderRadius: Theme.radii.md,
    marginTop: 4,
  },
  proposalBenefitText: {
    fontSize: 13,
    color: Theme.colors.forest,
    flex: 1,
    lineHeight: 18,
  },
  zoneTable: {
    gap: 14,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
    flexWrap: 'wrap',
    gap: 12,
  },
  zoneNameCol: {
    width: 170,
  },
  zoneRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  zoneRowPower: {
    fontSize: 12,
    color: Theme.colors.muted,
  },
  zoneBarCol: {
    flex: 1,
    minWidth: 200,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 12,
    color: Theme.colors.muted,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#E6ECE8',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  barFillBaseline: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#C5D4CB',
    borderRadius: 4,
  },
  barFillVariant: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Theme.colors.green,
    borderRadius: 4,
  },
  zoneResultCol: {
    width: 90,
    alignItems: 'flex-end',
  },
  zoneSavedText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  zoneReductionText: {
    fontSize: 12,
    color: Theme.colors.green,
    fontWeight: '600',
  },
});

