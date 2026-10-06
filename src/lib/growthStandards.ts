import { Gender, GrowthZScores, NutritionStatus, StuntingStatus } from '../types';

// Standar Antropometri Anak Kemenkes RI Permenkes No. 2 Tahun 2020 & WHO Child Growth Standards
// Referensi Median dan Standar Deviasi (SD) TB/U (cm) dan BB/U (kg) usia 60-144 bulan (5-12 tahun)

interface AgeReference {
  ageMonths: number;
  // Laki-laki
  mHeightMedian: number;
  mHeightSD: number;
  mWeightMedian: number;
  mWeightSD: number;
  mBmiMedian: number;
  mBmiSD: number;
  // Perempuan
  fHeightMedian: number;
  fHeightSD: number;
  fWeightMedian: number;
  fWeightSD: number;
  fBmiMedian: number;
  fBmiSD: number;
}

// Sample reference table for ages 5-12 (60, 72, 84, 96, 108, 120, 132, 144 bulan)
const referenceTable: AgeReference[] = [
  {
    ageMonths: 60, // 5 th
    mHeightMedian: 110.0, mHeightSD: 4.5,
    mWeightMedian: 18.3, mWeightSD: 2.3,
    mBmiMedian: 15.3, mBmiSD: 1.1,
    fHeightMedian: 109.4, fHeightSD: 4.4,
    fWeightMedian: 18.2, fWeightSD: 2.4,
    fBmiMedian: 15.2, fBmiSD: 1.2,
  },
  {
    ageMonths: 72, // 6 th (Kelas 1)
    mHeightMedian: 116.0, mHeightSD: 4.8,
    mWeightMedian: 20.5, mWeightSD: 2.7,
    mBmiMedian: 15.3, mBmiSD: 1.2,
    fHeightMedian: 115.1, fHeightSD: 4.7,
    fWeightMedian: 20.2, fWeightSD: 2.8,
    fBmiMedian: 15.3, fBmiSD: 1.3,
  },
  {
    ageMonths: 84, // 7 th (Kelas 2)
    mHeightMedian: 121.7, mHeightSD: 5.1,
    mWeightMedian: 22.9, mWeightSD: 3.1,
    mBmiMedian: 15.5, mBmiSD: 1.3,
    fHeightMedian: 120.8, fHeightSD: 5.1,
    fWeightMedian: 22.4, fWeightSD: 3.3,
    fBmiMedian: 15.4, fBmiSD: 1.4,
  },
  {
    ageMonths: 96, // 8 th (Kelas 3)
    mHeightMedian: 127.3, mHeightSD: 5.4,
    mWeightMedian: 25.6, mWeightSD: 3.7,
    mBmiMedian: 15.8, mBmiSD: 1.5,
    fHeightMedian: 126.6, fHeightSD: 5.5,
    fWeightMedian: 25.0, fWeightSD: 3.9,
    fBmiMedian: 15.7, fBmiSD: 1.6,
  },
  {
    ageMonths: 108, // 9 th (Kelas 4)
    mHeightMedian: 132.6, mHeightSD: 5.8,
    mWeightMedian: 28.6, mWeightSD: 4.4,
    mBmiMedian: 16.3, mBmiSD: 1.7,
    fHeightMedian: 132.5, fHeightSD: 6.0,
    fWeightMedian: 28.2, fWeightSD: 4.6,
    fBmiMedian: 16.1, fBmiSD: 1.8,
  },
  {
    ageMonths: 120, // 10 th (Kelas 5)
    mHeightMedian: 137.8, mHeightSD: 6.2,
    mWeightMedian: 32.0, mWeightSD: 5.1,
    mBmiMedian: 16.8, mBmiSD: 1.9,
    fHeightMedian: 138.6, fHeightSD: 6.6,
    fWeightMedian: 31.9, fWeightSD: 5.4,
    fBmiMedian: 16.6, fBmiSD: 2.1,
  },
  {
    ageMonths: 132, // 11 th (Kelas 6)
    mHeightMedian: 143.1, mHeightSD: 6.7,
    mWeightMedian: 35.6, mWeightSD: 5.9,
    mBmiMedian: 17.4, mBmiSD: 2.1,
    fHeightMedian: 145.0, fHeightSD: 7.1,
    fWeightMedian: 36.1, fWeightSD: 6.2,
    fBmiMedian: 17.2, fBmiSD: 2.3,
  },
  {
    ageMonths: 144, // 12 th
    mHeightMedian: 149.1, mHeightSD: 7.3,
    mWeightMedian: 39.8, mWeightSD: 6.8,
    mBmiMedian: 18.0, mBmiSD: 2.3,
    fHeightMedian: 151.2, fHeightSD: 7.4,
    fWeightMedian: 41.0, fWeightSD: 7.0,
    fBmiMedian: 17.9, fBmiSD: 2.5,
  },
];

// Linear interpolation to obtain reference values for exact months
function getInterpolatedRef(ageMonths: number, gender: Gender) {
  const clampedAge = Math.max(60, Math.min(144, ageMonths));
  
  let lower = referenceTable[0];
  let upper = referenceTable[referenceTable.length - 1];
  
  for (let i = 0; i < referenceTable.length - 1; i++) {
    if (clampedAge >= referenceTable[i].ageMonths && clampedAge <= referenceTable[i + 1].ageMonths) {
      lower = referenceTable[i];
      upper = referenceTable[i + 1];
      break;
    }
  }

  const factor = lower.ageMonths === upper.ageMonths 
    ? 0 
    : (clampedAge - lower.ageMonths) / (upper.ageMonths - lower.ageMonths);

  const isMale = gender === 'L';
  const heightMedian = isMale 
    ? lower.mHeightMedian + factor * (upper.mHeightMedian - lower.mHeightMedian)
    : lower.fHeightMedian + factor * (upper.fHeightMedian - lower.fHeightMedian);
  const heightSD = isMale
    ? lower.mHeightSD + factor * (upper.mHeightSD - lower.mHeightSD)
    : lower.fHeightSD + factor * (upper.fHeightSD - lower.fHeightSD);

  const weightMedian = isMale
    ? lower.mWeightMedian + factor * (upper.mWeightMedian - lower.mWeightMedian)
    : lower.fWeightMedian + factor * (upper.fWeightMedian - lower.fWeightMedian);
  const weightSD = isMale
    ? lower.mWeightSD + factor * (upper.mWeightSD - lower.mWeightSD)
    : lower.fWeightSD + factor * (upper.fWeightSD - lower.fWeightSD);

  const bmiMedian = isMale
    ? lower.mBmiMedian + factor * (upper.mBmiMedian - lower.mBmiMedian)
    : lower.fBmiMedian + factor * (upper.fBmiMedian - lower.fBmiMedian);
  const bmiSD = isMale
    ? lower.mBmiSD + factor * (upper.mBmiSD - lower.mBmiSD)
    : lower.fBmiSD + factor * (upper.fBmiSD - lower.fBmiSD);

  return { heightMedian, heightSD, weightMedian, weightSD, bmiMedian, bmiSD };
}

export function calculateAgeMonths(birthDateStr: string, measurementDateStr: string = new Date().toISOString()): number {
  const birth = new Date(birthDateStr);
  const measure = new Date(measurementDateStr);
  let months = (measure.getFullYear() - birth.getFullYear()) * 12 + (measure.getMonth() - birth.getMonth());
  if (measure.getDate() < birth.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function formatAgeString(ageMonths: number): string {
  const years = Math.floor(ageMonths / 12);
  const remainingMonths = ageMonths % 12;
  if (remainingMonths === 0) return `${years} Tahun`;
  return `${years} Th ${remainingMonths} Bln`;
}

export function calculateGrowthStatus(
  heightCm: number,
  weightKg: number,
  ageMonths: number,
  gender: Gender
): {
  bmi: number;
  zScores: GrowthZScores;
  stuntingStatus: StuntingStatus;
  nutritionStatus: NutritionStatus;
  isStuntingIndicated: boolean;
  recommendations: string[];
} {
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(2));
  const ref = getInterpolatedRef(ageMonths, gender);

  // Z-Score formula: (Measured - Median) / SD
  const tb_u = Number(((heightCm - ref.heightMedian) / ref.heightSD).toFixed(2));
  const bb_u = Number(((weightKg - ref.weightMedian) / ref.weightSD).toFixed(2));
  const imt_u = Number(((bmi - ref.bmiMedian) / ref.bmiSD).toFixed(2));
  const bb_tb = tb_u !== 0 ? Number(((bb_u / (tb_u + 0.001))).toFixed(2)) : 0;

  // Stunting Classification (TB/U) Permenkes No. 2/2020:
  // < -3 SD: Sangat Pendek (Severely Stunted)
  // -3 SD s/d < -2 SD: Pendek (Stunted)
  // -2 SD s/d +3 SD: Normal
  // > +3 SD: Tinggi
  let stuntingStatus: StuntingStatus = 'normal';
  if (tb_u < -3.0) {
    stuntingStatus = 'sangat_pendek';
  } else if (tb_u < -2.0) {
    stuntingStatus = 'pendek';
  } else if (tb_u > 3.0) {
    stuntingStatus = 'tinggi';
  } else {
    stuntingStatus = 'normal';
  }

  const isStuntingIndicated = stuntingStatus === 'sangat_pendek' || stuntingStatus === 'pendek';

  // Nutrition Status (IMT/U & BB/U):
  let nutritionStatus: NutritionStatus = 'gizi_baik';
  if (imt_u < -3.0 || bb_u < -3.0) {
    nutritionStatus = 'gizi_buruk';
  } else if (imt_u < -2.0 || bb_u < -2.0) {
    nutritionStatus = 'gizi_kurang';
  } else if (imt_u > 2.0) {
    nutritionStatus = 'obesitas';
  } else if (imt_u > 1.0) {
    nutritionStatus = 'berisiko_gizi_lebih';
  } else {
    nutritionStatus = 'gizi_baik';
  }

  // Clinical Recommendations based on status
  const recommendations: string[] = [];
  if (stuntingStatus === 'sangat_pendek') {
    recommendations.push('Rujukan segera ke Puskesmas Cempaka untuk pemeriksaan komprehensif.');
    recommendations.push('Pemberian Makanan Tambahan (PMT) tinggi protein hewani (telur, susu, daging/ikan) 2x sehari.');
    recommendations.push('Pemeriksaan skrining penyakit kronis penyerta (tuberkulosis anak, kecacingan, anemia).');
  } else if (stuntingStatus === 'pendek') {
    recommendations.push('Konseling gizi dengan petugas UKS SDN 1 Cempaka & orang tua.');
    recommendations.push('Tingkatkan asupan protein hewani minimal 1 butir telur/hari dan segelas susu.');
    recommendations.push('Pantau perkembangan tinggi badan berkala setiap bulan melalui pos Antropometri IoT.');
  } else if (nutritionStatus === 'obesitas' || nutritionStatus === 'berisiko_gizi_lebih') {
    recommendations.push('Batasi konsumsi jajanan tinggi gula dan makanan olahan kemasan di kantin sekolah.');
    recommendations.push('Tingkatkan aktivitas fisik bermain aktif minimal 60 menit setiap hari.');
  } else if (nutritionStatus === 'gizi_kurang') {
    recommendations.push('Intervensi camilan padat kalori bergizi seimbang.');
    recommendations.push('Suplementasi vitamin A dan obat cacing berkala dari program UKS.');
  } else {
    recommendations.push('Pertumbuhan anak berada dalam rentang ideal (Gizi Baik).');
    recommendations.push('Pertahankan pola makan bergizi seimbang "Isi Piringku" dan kebersihan diri.');
  }

  return {
    bmi,
    zScores: { tb_u, bb_u, bb_tb, imt_u },
    stuntingStatus,
    nutritionStatus,
    isStuntingIndicated,
    recommendations,
  };
}

export function getStuntingBadgeInfo(status: StuntingStatus) {
  switch (status) {
    case 'sangat_pendek':
      return {
        label: 'Sangat Pendek (Severely Stunted)',
        shortLabel: 'Sangat Pendek',
        color: 'text-red-700 bg-red-50 border-red-200',
        dotColor: 'bg-red-600',
        textColor: 'text-red-700',
        severity: 'danger',
      };
    case 'pendek':
      return {
        label: 'Pendek (Stunted)',
        shortLabel: 'Pendek / Stunted',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        dotColor: 'bg-amber-600',
        textColor: 'text-amber-700',
        severity: 'warning',
      };
    case 'tinggi':
      return {
        label: 'Tinggi (Above Average)',
        shortLabel: 'Tinggi',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        dotColor: 'bg-blue-600',
        textColor: 'text-blue-700',
        severity: 'info',
      };
    case 'normal':
    default:
      return {
        label: 'Tinggi Normal',
        shortLabel: 'Normal',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dotColor: 'bg-emerald-600',
        textColor: 'text-emerald-700',
        severity: 'success',
      };
  }
}

export function getNutritionBadgeInfo(status: NutritionStatus) {
  switch (status) {
    case 'gizi_buruk':
      return {
        label: 'Gizi Buruk',
        color: 'text-red-800 bg-red-100 border-red-300',
      };
    case 'gizi_kurang':
      return {
        label: 'Gizi Kurang',
        color: 'text-amber-800 bg-amber-100 border-amber-300',
      };
    case 'berisiko_gizi_lebih':
      return {
        label: 'Berisiko Gizi Lebih',
        color: 'text-orange-800 bg-orange-100 border-orange-300',
      };
    case 'obesitas':
      return {
        label: 'Obesitas',
        color: 'text-purple-800 bg-purple-100 border-purple-300',
      };
    case 'gizi_baik':
    default:
      return {
        label: 'Gizi Baik (Normal)',
        color: 'text-emerald-800 bg-emerald-100 border-emerald-300',
      };
  }
}

// Generate Standard WHO Curves for Chart visualization across ages 60 to 144 months
export function getStandardCurveData(gender: Gender) {
  const points: {
    ageMonths: number;
    ageLabel: string;
    sdMinus3: number;
    sdMinus2: number;
    median: number;
    sdPlus2: number;
    sdPlus3: number;
  }[] = [];

  for (let age = 60; age <= 144; age += 12) {
    const ref = getInterpolatedRef(age, gender);
    points.push({
      ageMonths: age,
      ageLabel: `${Math.floor(age / 12)} Th`,
      sdMinus3: Number((ref.heightMedian - 3 * ref.heightSD).toFixed(1)),
      sdMinus2: Number((ref.heightMedian - 2 * ref.heightSD).toFixed(1)),
      median: Number(ref.heightMedian.toFixed(1)),
      sdPlus2: Number((ref.heightMedian + 2 * ref.heightSD).toFixed(1)),
      sdPlus3: Number((ref.heightMedian + 3 * ref.heightSD).toFixed(1)),
    });
  }

  return points;
}
