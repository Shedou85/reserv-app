import { describe, it, expect } from "vitest";
import {
  setHours,
  setMinutes,
  addMinutes,
  isBefore,
  format,
  addDays,
  startOfDay,
} from "date-fns";

// Extracted booking logic for testability

interface WorkingHour {
  day_of_week: number;
  is_working: boolean;
  start_time: string;
  end_time: string;
}

function getWorkingHoursForDay(
  date: Date,
  workingHours: WorkingHour[]
): WorkingHour | undefined {
  const dayOfWeek = date.getDay();
  return workingHours.find(
    (wh) => wh.day_of_week === dayOfWeek && wh.is_working
  );
}

function generateTimeSlots(
  date: Date,
  workingHours: WorkingHour[],
  durationMinutes: number,
  now?: Date
): string[] {
  const wh = getWorkingHoursForDay(date, workingHours);
  if (!wh) return [];

  const [startH, startM] = wh.start_time.split(":").map(Number);
  const [endH, endM] = wh.end_time.split(":").map(Number);

  const slots: string[] = [];
  let current = setMinutes(setHours(date, startH), startM);
  const end = setMinutes(setHours(date, endH), endM);
  const currentTime = now || new Date();

  while (
    isBefore(addMinutes(current, durationMinutes), end) ||
    addMinutes(current, durationMinutes).getTime() === end.getTime()
  ) {
    if (!isBefore(current, currentTime)) {
      slots.push(format(current, "HH:mm"));
    }
    current = addMinutes(current, 30);
  }

  return slots;
}

function generateAvailableDates(daysCount: number): Date[] {
  const today = startOfDay(new Date());
  return Array.from({ length: daysCount }, (_, i) => addDays(today, i));
}

// --- Tests ---

const WORKING_HOURS: WorkingHour[] = [
  { day_of_week: 1, is_working: true, start_time: "09:00", end_time: "17:00" },
  { day_of_week: 2, is_working: true, start_time: "09:00", end_time: "17:00" },
  { day_of_week: 3, is_working: true, start_time: "09:00", end_time: "17:00" },
  { day_of_week: 4, is_working: true, start_time: "09:00", end_time: "17:00" },
  { day_of_week: 5, is_working: true, start_time: "09:00", end_time: "17:00" },
  { day_of_week: 6, is_working: true, start_time: "10:00", end_time: "14:00" },
  { day_of_week: 0, is_working: false, start_time: "09:00", end_time: "17:00" },
];

describe("getWorkingHoursForDay", () => {
  it("returns working hours for a working day", () => {
    // Monday = 1
    const monday = new Date(2026, 2, 9); // March 9, 2026 is Monday
    const wh = getWorkingHoursForDay(monday, WORKING_HOURS);
    expect(wh).toBeDefined();
    expect(wh!.start_time).toBe("09:00");
    expect(wh!.end_time).toBe("17:00");
  });

  it("returns undefined for a non-working day", () => {
    // Sunday = 0
    const sunday = new Date(2026, 2, 8); // March 8, 2026 is Sunday
    const wh = getWorkingHoursForDay(sunday, WORKING_HOURS);
    expect(wh).toBeUndefined();
  });

  it("returns Saturday hours (shorter day)", () => {
    const saturday = new Date(2026, 2, 14); // March 14, 2026 is Saturday
    const wh = getWorkingHoursForDay(saturday, WORKING_HOURS);
    expect(wh).toBeDefined();
    expect(wh!.start_time).toBe("10:00");
    expect(wh!.end_time).toBe("14:00");
  });
});

describe("generateTimeSlots", () => {
  // Use a fixed "now" in the past to avoid filtering out slots
  const pastNow = new Date(2026, 2, 9, 0, 0); // Midnight, so all slots available

  it("generates 30-min interval slots for a working day", () => {
    const monday = new Date(2026, 2, 9);
    const slots = generateTimeSlots(monday, WORKING_HOURS, 60, pastNow);

    expect(slots[0]).toBe("09:00");
    expect(slots).toContain("09:30");
    expect(slots).toContain("10:00");
    // Last slot with 60min duration should be 16:00 (ends at 17:00)
    expect(slots[slots.length - 1]).toBe("16:00");
  });

  it("returns empty array for non-working day", () => {
    const sunday = new Date(2026, 2, 8);
    const slots = generateTimeSlots(sunday, WORKING_HOURS, 60, pastNow);
    expect(slots).toEqual([]);
  });

  it("generates fewer slots for longer services", () => {
    const monday = new Date(2026, 2, 9);
    const slots60 = generateTimeSlots(monday, WORKING_HOURS, 60, pastNow);
    const slots120 = generateTimeSlots(monday, WORKING_HOURS, 120, pastNow);

    expect(slots120.length).toBeLessThan(slots60.length);
  });

  it("generates fewer slots on shorter working days", () => {
    const monday = new Date(2026, 2, 9);
    const saturday = new Date(2026, 2, 14);
    const mondaySlots = generateTimeSlots(monday, WORKING_HOURS, 60, pastNow);
    const saturdaySlots = generateTimeSlots(saturday, WORKING_HOURS, 60, pastNow);

    expect(saturdaySlots.length).toBeLessThan(mondaySlots.length);
  });

  it("filters out past time slots for today", () => {
    const monday = new Date(2026, 2, 9);
    // Simulate current time is 12:00
    const noon = new Date(2026, 2, 9, 12, 0);
    const slots = generateTimeSlots(monday, WORKING_HOURS, 60, noon);

    expect(slots).not.toContain("09:00");
    expect(slots).not.toContain("11:30");
    expect(slots[0]).toBe("12:00");
  });

  it("includes slot that ends exactly at closing time", () => {
    const monday = new Date(2026, 2, 9);
    const slots = generateTimeSlots(monday, WORKING_HOURS, 30, pastNow);
    // 16:30 + 30min = 17:00 (exactly closing) — should be included
    expect(slots).toContain("16:30");
  });
});

describe("generateAvailableDates", () => {
  it("generates correct number of dates", () => {
    const dates = generateAvailableDates(14);
    expect(dates).toHaveLength(14);
  });

  it("starts from today", () => {
    const dates = generateAvailableDates(14);
    const today = startOfDay(new Date());
    expect(dates[0].getTime()).toBe(today.getTime());
  });

  it("dates are consecutive", () => {
    const dates = generateAvailableDates(7);
    for (let i = 1; i < dates.length; i++) {
      const diff = dates[i].getTime() - dates[i - 1].getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000); // 1 day in ms
    }
  });
});
