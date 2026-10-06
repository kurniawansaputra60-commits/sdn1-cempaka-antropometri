import { Measurement, Student } from '../types';

export interface MonthlyReportStats {
  periodMonthYear: string;
  totalStudentsMeasured: number;
  normalCount: number;
  stuntedCount: number;
  severelyStuntedCount: number;
  stuntingRatePercent: number;
  goodNutritionCount: number;
  poorNutritionCount: number;
  obesityCount: number;
}

export function computeMonthlyReportStats(
  measurements: Measurement[],
  periodDate: Date = new Date()
): MonthlyReportStats {
  const month = periodDate.getMonth();
  const year = periodDate.getFullYear();

  // Filter measurements in the specified month
  const filtered = measurements.filter((m) => {
    const d = new Date(m.timestamp);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const total = filtered.length;
  if (total === 0) {
    return {
      periodMonthYear: periodDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      totalStudentsMeasured: 0,
      normalCount: 0,
      stuntedCount: 0,
      severelyStuntedCount: 0,
      stuntingRatePercent: 0,
      goodNutritionCount: 0,
      poorNutritionCount: 0,
      obesityCount: 0,
    };
  }

  const normal = filtered.filter((m) => m.stuntingStatus === 'normal' || m.stuntingStatus === 'tinggi').length;
  const stunted = filtered.filter((m) => m.stuntingStatus === 'pendek').length;
  const severelyStunted = filtered.filter((m) => m.stuntingStatus === 'sangat_pendek').length;
  const stuntingRate = Number((((stunted + severelyStunted) / total) * 100).toFixed(1));

  const goodNutri = filtered.filter((m) => m.nutritionStatus === 'gizi_baik').length;
  const poorNutri = filtered.filter((m) => m.nutritionStatus === 'gizi_kurang' || m.nutritionStatus === 'gizi_buruk').length;
  const obese = filtered.filter((m) => m.nutritionStatus === 'obesitas' || m.nutritionStatus === 'berisiko_gizi_lebih').length;

  return {
    periodMonthYear: periodDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    totalStudentsMeasured: total,
    normalCount: normal,
    stuntedCount: stunted,
    severelyStuntedCount: severelyStunted,
    stuntingRatePercent: stuntingRate,
    goodNutritionCount: goodNutri,
    poorNutritionCount: poorNutri,
    obesityCount: obese,
  };
}

export function triggerPrintReport(): void {
  window.print();
}
