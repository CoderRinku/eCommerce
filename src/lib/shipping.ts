/**
 * Calculates shipping charge based on total weight (in grams) and destination district.
 * 
 * Inside Dhaka: Base BDT 60 for up to 1kg, BDT 20 per extra kg.
 * Outside Dhaka: Base BDT 120 for up to 1kg, BDT 30 per extra kg.
 */
export function calculateShippingCharge(totalWeightGrams: number, district: string): number {
  const isInsideDhaka = district.toLowerCase().includes('dhaka');
  const baseCharge = isInsideDhaka ? 60 : 120;
  const weightKg = totalWeightGrams / 1000;
  
  if (weightKg <= 1) {
    return baseCharge;
  }
  
  // Calculate extra weight, rounded up to the nearest whole kg
  const extraWeightKg = Math.ceil(weightKg - 1);
  const extraChargePerKg = isInsideDhaka ? 20 : 30;
  
  return baseCharge + (extraWeightKg * extraChargePerKg);
}
