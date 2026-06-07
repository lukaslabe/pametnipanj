const STRENGTH_FACTOR = {
  weak: 0.5,
  normal: 1,
  strong: 1.5,
};

export function seasonalBaseConsumption(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return 0.5;
  if (month >= 6 && month <= 8) return 0.4;
  if (month >= 9 && month <= 11) return 0.25;
  return 0.15;
}

export function calculateHiveFood(hive, date = new Date()) {
  const framesOccupied = Math.max(0, Number(hive.framesOccupied ?? hive.frameCount ?? 10) || 0);
  const colonyStrength = hive.colonyStrength || "normal";
  const strengthFactor = STRENGTH_FACTOR[colonyStrength] || STRENGTH_FACTOR.normal;
  const dailyConsumptionKg = seasonalBaseConsumption(date) * strengthFactor + framesOccupied * 0.08;
  const foodKg = Math.max(0, Number(hive.foodKg) || 0);
  const foodDays = dailyConsumptionKg > 0 ? Math.max(0, Math.floor(foodKg / dailyConsumptionKg)) : 0;
  return {
    framesOccupied,
    colonyStrength,
    dailyConsumptionKg: Math.round(dailyConsumptionKg * 100) / 100,
    foodDays,
  };
}

export function deriveHiveStatus(hive, date = new Date()) {
  const food = calculateHiveFood(hive, date);
  const weeklyDeltaKg = Number(hive.weeklyDeltaKg) || 0;
  let status = "ok";
  let statusText = food.foodDays > 30 && weeklyDeltaKg >= 0 ? "Močan" : "Mirno";

  if (food.foodDays < 7 || (food.foodDays <= 14 && weeklyDeltaKg < -1)) {
    status = "danger";
    statusText = "Ukrepaj";
  } else if (food.foodDays <= 14 || weeklyDeltaKg < 0) {
    status = "warn";
    statusText = "Preveri";
  }

  return { ...food, status, statusText };
}
