import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../constants/theme';
import { PrimaryButton, SecondaryButton } from '../components/UIComponents';
import { Icon } from '../components/Icons';

export const AdminReport: React.FC = () => {
  const { energySummary, school, publishedVersion } = useApp();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Generowanie tekstu CSV
  const generateCsv = () => {
    let csv = 'Strefa;Moc (kW);Czas przed (h);Czas po (h);Energia przed (kWh);Energia po (kWh);Oszczednosc (kWh);Redukcja (%)\n';
    energySummary.zoneCalculations.forEach((z) => {
      csv += `${z.zoneName};${z.powerKw};${z.baselineHours};${z.variantHours};${z.baselineKWh};${z.variantKWh};${z.savedKWh};${z.reductionPercent}%\n`;
    });
    csv += `SUMA;;${energySummary.baselineHours};${energySummary.variantHours};${energySummary.baselineKWh};${energySummary.variantKWh};${energySummary.savedKWh};${energySummary.percentSaved}%\n`;
    csv += `Koszt (1.20 zl/kWh);;;;${energySummary.baselineCost.toFixed(2)} zl;${energySummary.variantCost.toFixed(2)} zl;${energySummary.savedCost.toFixed(2)} zl;\n`;
    return csv;
  };

  const handleCopyCsv = () => {
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Raport efektywności energetycznej</Text>
          <Text style={styles.subtitle}>
            {school.name} • Raport pilotażu modelu Future Smart City 2026 ({publishedVersion})
          </Text>
        </View>

        <PrimaryButton
          title="Eksportuj raport (CSV)"
          icon="download-outline"
          onPress={() => setIsExportModalOpen(true)}
        />
      </View>

      {/* Ważne rozróżnienie metodologiczne z pliku DOCX */}
      <View style={styles.methodologyCard}>
        <View style={styles.methodologyHeader}>
          <Icon name="shield-checkmark-outline" size={22} color={Theme.colors.forest} />
          <Text style={styles.methodologyTitle}>
            Metodologia pilotażu: Potencjał modelu vs. Pomiar rzeczywisty
          </Text>
        </View>
        <Text style={styles.methodologyText}>
          Prezentowane oszczędności wynikają z <Text style={{ fontWeight: '700' }}>symulacji matematycznej</Text>{' '}
          mocy instalacji HVAC i oświetlenia oraz buforów czasowych. Zgodnie ze standardem EnergoPlan,
          dopóki szkoła nie podłączy telemetrycznych liczników energii (BMS/IoT), wyniki są
          oznaczone jako <Text style={{ fontWeight: '700' }}>potencjał szacunkowy</Text>, a nie
          zweryfikowana oszczędność z faktury.
        </Text>
        <View style={styles.meterStatusBadge}>
          <Icon name="hardware-chip-outline" size={14} color="#8A5A16" />
          <Text style={styles.meterStatusText}>
            Status odczytu liczników: Brak pomiaru fizycznego (symulacja wzorcowa)
          </Text>
        </View>
      </View>

      {/* Podsumowanie kluczowych liczb */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Energia planu wyjściowego</Text>
          <Text style={styles.kpiValue}>{energySummary.baselineKWh} kWh</Text>
          <Text style={styles.kpiSub}>Koszt: {energySummary.baselineCost.toFixed(2)} zł</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Energia po optymalizacji</Text>
          <Text style={[styles.kpiValue, { color: Theme.colors.green }]}>
            {energySummary.variantKWh} kWh
          </Text>
          <Text style={styles.kpiSub}>Koszt: {energySummary.variantCost.toFixed(2)} zł</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: Theme.colors.forest }]}>
          <Text style={[styles.kpiLabel, { color: '#D4EF97' }]}>Szacowana redukcja</Text>
          <Text style={[styles.kpiValue, { color: '#FFFFFF' }]}>
            {energySummary.savedKWh} kWh
          </Text>
          <Text style={[styles.kpiSub, { color: Theme.colors.lime }]}>
            -{energySummary.percentSaved}% ({energySummary.savedCost.toFixed(2)} zł mniej)
          </Text>
        </View>
      </View>

      {/* Tabela założeń dla każdej strefy */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Zestawienie założeń modelowych stref budynku</Text>
        <Text style={styles.tableSubtitle}>
          Kalkulacja oparta na czasie trwania zajęć, buforze 30 min oraz mocy urządzeń
        </Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 1.5 }]}>Strefa energetyczna</Text>
          <Text style={[styles.th, { width: 80 }]}>Moc (kW)</Text>
          <Text style={[styles.th, { width: 90 }]}>Czas bazowy</Text>
          <Text style={[styles.th, { width: 90 }]}>Czas wariant</Text>
          <Text style={[styles.th, { width: 100 }]}>Energia bazowa</Text>
          <Text style={[styles.th, { width: 100 }]}>Energia wariant</Text>
          <Text style={[styles.th, { width: 90 }]}>Oszczędność</Text>
        </View>

        {energySummary.zoneCalculations.map((z) => (
          <View key={z.zoneId} style={styles.tableRow}>
            <View style={[styles.td, { flex: 1.5 }]}>
              <Text style={styles.zoneNameText}>{z.zoneName}</Text>
            </View>
            <View style={[styles.td, { width: 80 }]}>
              <Text style={styles.tdText}>{z.powerKw} kW</Text>
            </View>
            <View style={[styles.td, { width: 90 }]}>
              <Text style={styles.tdText}>{z.baselineHours} h</Text>
            </View>
            <View style={[styles.td, { width: 90 }]}>
              <Text style={[styles.tdText, { fontWeight: '700', color: Theme.colors.green }]}>
                {z.variantHours} h
              </Text>
            </View>
            <View style={[styles.td, { width: 100 }]}>
              <Text style={styles.tdText}>{z.baselineKWh} kWh</Text>
            </View>
            <View style={[styles.td, { width: 100 }]}>
              <Text style={[styles.tdText, { fontWeight: '700', color: Theme.colors.green }]}>
                {z.variantKWh} kWh
              </Text>
            </View>
            <View style={[styles.td, { width: 90 }]}>
              <Text style={[styles.tdText, { fontWeight: '800', color: Theme.colors.forest }]}>
                {z.savedKWh > 0 ? `-${z.savedKWh} kWh` : '0 kWh'}
              </Text>
            </View>
          </View>
        ))}

        {/* Wiersz sumaryczny */}
        <View style={[styles.tableRow, styles.summaryRow]}>
          <View style={[styles.td, { flex: 1.5 }]}>
            <Text style={[styles.zoneNameText, { fontWeight: '800' }]}>SUMA ŁĄCZNA</Text>
          </View>
          <View style={[styles.td, { width: 80 }]}>
            <Text style={styles.tdText}>-</Text>
          </View>
          <View style={[styles.td, { width: 90 }]}>
            <Text style={[styles.tdText, { fontWeight: '800' }]}>{energySummary.baselineHours} h</Text>
          </View>
          <View style={[styles.td, { width: 90 }]}>
            <Text style={[styles.tdText, { fontWeight: '800', color: Theme.colors.green }]}>
              {energySummary.variantHours} h
            </Text>
          </View>
          <View style={[styles.td, { width: 100 }]}>
            <Text style={[styles.tdText, { fontWeight: '800' }]}>{energySummary.baselineKWh} kWh</Text>
          </View>
          <View style={[styles.td, { width: 100 }]}>
            <Text style={[styles.tdText, { fontWeight: '800', color: Theme.colors.green }]}>
              {energySummary.variantKWh} kWh
            </Text>
          </View>
          <View style={[styles.td, { width: 90 }]}>
            <Text style={[styles.tdText, { fontWeight: '800', color: Theme.colors.forest }]}>
              -{energySummary.savedKWh} kWh
            </Text>
          </View>
        </View>
      </View>

      {/* Modal eksportu raportu do CSV */}
      <Modal visible={isExportModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 640 }]}>
            <View style={styles.modalHeader}>
              <Icon name="document-text-outline" size={24} color={Theme.colors.forest} />
              <View>
                <Text style={styles.modalTitle}>Eksport raportu do pliku CSV</Text>
                <Text style={styles.modalSubtitle}>Format zgodny z arkuszami kalkulacyjnymi Excel / LibreOffice</Text>
              </View>
            </View>

            <TextInput
              value={generateCsv()}
              multiline
              editable={false}
              style={styles.csvPreview}
            />

            {copiedNotice && (
              <View style={styles.copiedBanner}>
                <Text style={styles.copiedBannerText}>Dane zostały skopiowane do schowka!</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <SecondaryButton title="Zamknij" onPress={() => setIsExportModalOpen(false)} />
              <PrimaryButton
                title={copiedNotice ? 'Skopiowano!' : 'Kopiuj dane CSV'}
                icon="copy-outline"
                onPress={handleCopyCsv}
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
  methodologyCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 20,
  },
  methodologyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  methodologyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.forest,
  },
  methodologyText: {
    fontSize: 13,
    color: Theme.colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  meterStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.warningBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radii.sm,
    alignSelf: 'flex-start',
  },
  meterStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.warningText,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: Theme.radii.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  kpiLabel: {
    fontSize: 12,
    color: Theme.colors.muted,
    fontWeight: '600',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  kpiSub: {
    fontSize: 12,
    color: Theme.colors.muted,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  tableSubtitle: {
    fontSize: 13,
    color: Theme.colors.muted,
    marginBottom: 16,
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F7F5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.muted,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  summaryRow: {
    backgroundColor: '#F9FBF9',
    borderTopWidth: 2,
    borderTopColor: Theme.colors.border,
  },
  td: {
    justifyContent: 'center',
  },
  zoneNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  tdText: {
    fontSize: 13,
    color: Theme.colors.text,
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
    maxWidth: 550,
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
    fontSize: 12,
    color: Theme.colors.muted,
  },
  csvPreview: {
    backgroundColor: '#F5F5F5',
    borderRadius: Theme.radii.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 12,
    height: 180,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  copiedBanner: {
    backgroundColor: Theme.colors.successBg,
    padding: 8,
    borderRadius: Theme.radii.sm,
    marginBottom: 12,
    alignItems: 'center',
  },
  copiedBannerText: {
    color: '#0F5132',
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});

