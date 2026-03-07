import { describe, it, expect } from "vitest";

// Extracted from settings/page.tsx

const DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

interface WorkingHour {
  id: string;
  day_of_week: number;
  is_working: boolean;
  start_time: string;
  end_time: string;
}

function sortWorkingHours(workingHours: WorkingHour[]): WorkingHour[] {
  return DAYS_OF_WEEK.map((day) =>
    workingHours.find((wh) => wh.day_of_week === day)
  ).filter(Boolean) as WorkingHour[];
}

function updateHour(
  workingHours: WorkingHour[],
  dayOfWeek: number,
  field: keyof WorkingHour,
  value: string | boolean
): WorkingHour[] {
  return workingHours.map((wh) =>
    wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh
  );
}

function validateTimeRange(start: string, end: string): boolean {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  return startH * 60 + startM < endH * 60 + endM;
}

// --- Tests ---

const MOCK_HOURS: WorkingHour[] = [
  { id: "1", day_of_week: 0, is_working: false, start_time: "09:00", end_time: "17:00" },
  { id: "2", day_of_week: 1, is_working: true, start_time: "09:00", end_time: "17:00" },
  { id: "3", day_of_week: 2, is_working: true, start_time: "09:00", end_time: "17:00" },
  { id: "4", day_of_week: 3, is_working: true, start_time: "09:00", end_time: "17:00" },
  { id: "5", day_of_week: 4, is_working: true, start_time: "09:00", end_time: "17:00" },
  { id: "6", day_of_week: 5, is_working: true, start_time: "09:00", end_time: "17:00" },
  { id: "7", day_of_week: 6, is_working: true, start_time: "10:00", end_time: "14:00" },
];

describe("DAYS_OF_WEEK order", () => {
  it("starts with Monday (1) and ends with Sunday (0)", () => {
    expect(DAYS_OF_WEEK[0]).toBe(1);
    expect(DAYS_OF_WEEK[DAYS_OF_WEEK.length - 1]).toBe(0);
  });

  it("has 7 days", () => {
    expect(DAYS_OF_WEEK).toHaveLength(7);
  });

  it("contains all days 0-6", () => {
    const sorted = [...DAYS_OF_WEEK].sort();
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe("sortWorkingHours", () => {
  it("sorts in Mon-Sun order", () => {
    const sorted = sortWorkingHours(MOCK_HOURS);
    expect(sorted[0].day_of_week).toBe(1); // Monday
    expect(sorted[6].day_of_week).toBe(0); // Sunday
  });

  it("preserves all 7 days", () => {
    const sorted = sortWorkingHours(MOCK_HOURS);
    expect(sorted).toHaveLength(7);
  });

  it("handles missing days gracefully", () => {
    const partial = MOCK_HOURS.filter((wh) => wh.day_of_week <= 3);
    const sorted = sortWorkingHours(partial);
    // Only Mon, Tue, Wed, Sun should be found
    expect(sorted.length).toBe(4);
  });
});

describe("updateHour", () => {
  it("toggles is_working for a specific day", () => {
    const updated = updateHour(MOCK_HOURS, 0, "is_working", true);
    const sunday = updated.find((wh) => wh.day_of_week === 0);
    expect(sunday!.is_working).toBe(true);
  });

  it("does not modify other days", () => {
    const updated = updateHour(MOCK_HOURS, 0, "is_working", true);
    const monday = updated.find((wh) => wh.day_of_week === 1);
    expect(monday!.is_working).toBe(true); // Was already true
    expect(monday!.start_time).toBe("09:00"); // Unchanged
  });

  it("updates start_time", () => {
    const updated = updateHour(MOCK_HOURS, 1, "start_time", "08:00");
    const monday = updated.find((wh) => wh.day_of_week === 1);
    expect(monday!.start_time).toBe("08:00");
  });

  it("updates end_time", () => {
    const updated = updateHour(MOCK_HOURS, 6, "end_time", "16:00");
    const saturday = updated.find((wh) => wh.day_of_week === 6);
    expect(saturday!.end_time).toBe("16:00");
  });

  it("returns new array (immutability)", () => {
    const updated = updateHour(MOCK_HOURS, 0, "is_working", true);
    expect(updated).not.toBe(MOCK_HOURS);
    // Original should be unchanged
    const original = MOCK_HOURS.find((wh) => wh.day_of_week === 0);
    expect(original!.is_working).toBe(false);
  });
});

describe("validateTimeRange", () => {
  it("valid range: start before end", () => {
    expect(validateTimeRange("09:00", "17:00")).toBe(true);
  });

  it("invalid range: start equals end", () => {
    expect(validateTimeRange("09:00", "09:00")).toBe(false);
  });

  it("invalid range: start after end", () => {
    expect(validateTimeRange("17:00", "09:00")).toBe(false);
  });

  it("valid range: 1 minute difference", () => {
    expect(validateTimeRange("09:00", "09:01")).toBe(true);
  });
});
