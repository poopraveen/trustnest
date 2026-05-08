"use client";

import { useState } from "react";
import DataFreshnessBar from "./DataFreshnessBar";

interface Props {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  covers: string;
  lastVerified: string;
  updateFrequency: string;
  health: "live" | "stale" | "manual";
  recordCount: number;
}

export default function FYSelectorBar(props: Props) {
  const [selectedYear, setSelectedYear] = useState("2024-25");

  return (
    <DataFreshnessBar
      {...props}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
    />
  );
}
