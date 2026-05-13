import React from "react";
import { calculateSAWScore, Device, MOCK_WEIGHTS, Weights } from "../utils/saw";

export function ScoreBreakdown({ device }: { device: Device }) {
  const weights = MOCK_WEIGHTS;
  const scores = {
    price: (1 - device.price_php / 150000).toFixed(2),
    ram: (device.ram_gb / 32).toFixed(2),
    storage: (
      (device.storage_gb / 2048) * (device.storage_type === "SSD" ? 1.2 : 0.8)
    ).toFixed(2),
    battery: (device.battery_hrs / 15).toFixed(2),
    weight: (1 - device.weight_kg / 3.5).toFixed(2),
    gpu: device.has_gpu ? "1.00" : "0.00",
    os: device.os === "Windows" ? "1.00" : "0.50",
  };

  return (
    <div className="breakdown">
      <h4>Why this matches you:</h4>
      <ul className="score-list">
        {Object.entries(scores).map(([key, value]) => (
          <li key={key}>
            <span className="criterion">{key.toUpperCase()}</span>
            <span className="weight">
              {" "}
              x {(weights[key as keyof Weights] * 100).toFixed(0)}%
            </span>
            <span className="score"> = {value}</span>
          </li>
        ))}
      </ul>
      <p className="total">
        <strong>Total SAW Score:</strong> {calculateSAWScore(device).toFixed(3)}
      </p>
    </div>
  );
}
