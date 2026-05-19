// src/utils/saw.ts
// Simple Additive Weighting (SAW) for Laptitude
// Mock weights derived from hypothetical IEQ results (Yes/No format)

export interface Device {
  id: string;
  name: string;
  brand: string;
  price_php: number;
  ram_gb: number;
  storage_gb: number;
  storage_type: "SSD" | "HDD";
  battery_hrs: number;
  weight_kg: number;
  has_gpu: boolean;
  os: "Windows" | "macOS" | "Linux";
  track_scores: {
    web_dev: number;
    networking: number;
    data: number;
    general: number;
  };
  image_url?: string;
  created_at?: string;
}

export interface Weights {
  price: number;
  ram: number;
  storage: number;
  battery: number;
  weight: number;
  gpu: number;
  os: number;
}

// MOCK WEIGHTS (from hypothetical IEQ: n=94, Yes% normalized)
// In production: replace with actual tabulated IEQ results
export const MOCK_WEIGHTS: Weights = {
  price: 0.184, // 18.4% - Most endorsed "must-have"
  ram: 0.169, // 16.9%
  storage: 0.174, // 17.4% (SSD preference)
  battery: 0.135, // 13.5%
  weight: 0.106, // 10.6%
  gpu: 0.087, // 8.7% (specialized need)
  os: 0.145, // 14.5% (Windows compatibility)
};

// Normalization helpers (higher = better, except price/weight)
const normalize = {
  price: (value: number, max: number) => Math.max(0, 1 - value / max), // Clamp to [0,1]
  ram: (value: number, max: number) => value / max,
  storage: (value: number, max: number) => value / max,
  battery: (value: number, max: number) => value / max,
  weight: (value: number, max: number) => Math.max(0, 1 - value / max), // ← CLAMPED: prevents negative scores
  gpu: (value: boolean) => (value ? 1 : 0),
  os: (value: string, preferred: string) => (value === preferred ? 1 : 0.5),
};

// Max values for normalization (adjust based on your dataset range)
const MAX_SPECS = {
  price: 150000, // ₱150k max budget considered
  ram: 32, // 32GB max
  storage: 2048, // 2TB max
  battery: 15, // 15hrs max
  weight: 3.5, // 3.5kg max
};

export function calculateSAWScore(
  device: Device,
  weights: Weights = MOCK_WEIGHTS,
  userPrefs?: { preferred_os?: string }
): number {
  const osPref = userPrefs?.preferred_os || "Windows";

  const scores = {
    price: normalize.price(device.price_php, MAX_SPECS.price),
    ram: normalize.ram(device.ram_gb, MAX_SPECS.ram),
    storage:
      normalize.storage(device.storage_gb, MAX_SPECS.storage) *
      (device.storage_type === "SSD" ? 1.2 : 0.8),
    battery: normalize.battery(device.battery_hrs, MAX_SPECS.battery),
    weight: normalize.weight(device.weight_kg, MAX_SPECS.weight),
    gpu: normalize.gpu(device.has_gpu),
    os: normalize.os(device.os, osPref),
  };

  // Weighted sum
  return (
    weights.price * scores.price +
    weights.ram * scores.ram +
    weights.storage * scores.storage +
    weights.battery * scores.battery +
    weights.weight * scores.weight +
    weights.gpu * scores.gpu +
    weights.os * scores.os
  );
}

export function rankDevices(
  devices: Device[],
  userPrefs?: {
    budget_max?: number;
    track?: keyof Device["track_scores"];
    preferred_os?: string;
  }
): Device[] {
  const rankedWithScores = devices
    .filter((d) => {
      // Apply hard filters first (user constraints)
      if (userPrefs?.budget_max && d.price_php > userPrefs.budget_max) return false;
      if (userPrefs?.track && d.track_scores[userPrefs.track] < 50) return false; // Minimum track fit threshold
      return true;
    })
    .map((d) => ({
      device: d,
      saw_score: calculateSAWScore(d, MOCK_WEIGHTS, {
        preferred_os: userPrefs?.preferred_os,
      }),
    }))
    .sort((a, b) => b.saw_score - a.saw_score);

  return rankedWithScores.map((entry) => entry.device);
}

// Test cases
export const runTests = () => {
  const mockDevices: Device[] = [
    {
      id: "test1",
      name: "Budget Laptop",
      brand: "Generic",
      price_php: 35000,
      ram_gb: 8,
      storage_gb: 256,
      storage_type: "SSD",
      battery_hrs: 6,
      weight_kg: 2.1,
      has_gpu: false,
      os: "Windows",
      track_scores: { web_dev: 70, networking: 60, data: 50, general: 80 },
    },
    {
      id: "test2",
      name: "Performance Laptop",
      brand: "Generic",
      price_php: 85000,
      ram_gb: 32,
      storage_gb: 1024,
      storage_type: "SSD",
      battery_hrs: 10,
      weight_kg: 2.8,
      has_gpu: true,
      os: "Windows",
      track_scores: { web_dev: 95, networking: 85, data: 90, general: 75 },
    },
  ];

  const ranked = rankDevices(mockDevices, { budget_max: 100000, track: "web_dev" });
  console.log("SAW Test: Top recommendation =", ranked[0]?.name);
  console.log(
    "Scores:",
    mockDevices.map((d) => ({
      name: d.name,
      score: calculateSAWScore(d).toFixed(3),
    }))
  );
};

// Uncomment to run tests in dev:
// if (process.env.NODE_ENV === 'development') runTests();
