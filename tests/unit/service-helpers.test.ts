import { describe, it, expect } from "vitest";

// Extracted from service-dialog.tsx and services/page.tsx

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180];

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min.`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} val.`;
  return `${h} val. ${m} min.`;
}

function buildEditableFields(
  name: string,
  description: string,
  durationMinutes: string,
  price: string
) {
  return {
    name,
    description: description || null,
    duration_minutes: parseInt(durationMinutes),
    price: parseFloat(price),
    currency: "EUR",
  };
}

function calculateSortOrder(
  existing: { sort_order: number }[] | null
): number {
  if (existing && existing.length > 0) {
    return existing[0].sort_order + 1;
  }
  return 0;
}

// --- Tests ---

describe("formatDuration", () => {
  it("formats minutes under 60", () => {
    expect(formatDuration(15)).toBe("15 min.");
    expect(formatDuration(30)).toBe("30 min.");
    expect(formatDuration(45)).toBe("45 min.");
  });

  it("formats exact hours", () => {
    expect(formatDuration(60)).toBe("1 val.");
    expect(formatDuration(120)).toBe("2 val.");
    expect(formatDuration(180)).toBe("3 val.");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(75)).toBe("1 val. 15 min.");
    expect(formatDuration(90)).toBe("1 val. 30 min.");
    expect(formatDuration(150)).toBe("2 val. 30 min.");
  });
});

describe("DURATION_OPTIONS", () => {
  it("has all expected options", () => {
    expect(DURATION_OPTIONS).toEqual([15, 30, 45, 60, 75, 90, 120, 150, 180]);
  });

  it("all options are positive", () => {
    DURATION_OPTIONS.forEach((d) => expect(d).toBeGreaterThan(0));
  });

  it("options are sorted ascending", () => {
    for (let i = 1; i < DURATION_OPTIONS.length; i++) {
      expect(DURATION_OPTIONS[i]).toBeGreaterThan(DURATION_OPTIONS[i - 1]);
    }
  });
});

describe("buildEditableFields", () => {
  it("builds correct fields for a service", () => {
    const fields = buildEditableFields("Kirpimas", "Vyriškas", "30", "25.00");
    expect(fields).toEqual({
      name: "Kirpimas",
      description: "Vyriškas",
      duration_minutes: 30,
      price: 25,
      currency: "EUR",
    });
  });

  it("sets empty description to null", () => {
    const fields = buildEditableFields("Test", "", "60", "10");
    expect(fields.description).toBeNull();
  });

  it("parses duration as integer", () => {
    const fields = buildEditableFields("Test", "", "45", "10");
    expect(fields.duration_minutes).toBe(45);
    expect(Number.isInteger(fields.duration_minutes)).toBe(true);
  });

  it("parses price as float", () => {
    const fields = buildEditableFields("Test", "", "60", "19.99");
    expect(fields.price).toBe(19.99);
  });

  it("always sets currency to EUR", () => {
    const fields = buildEditableFields("Test", "", "60", "10");
    expect(fields.currency).toBe("EUR");
  });
});

describe("calculateSortOrder", () => {
  it("returns 0 for empty list", () => {
    expect(calculateSortOrder(null)).toBe(0);
    expect(calculateSortOrder([])).toBe(0);
  });

  it("returns max + 1", () => {
    expect(calculateSortOrder([{ sort_order: 3 }])).toBe(4);
    expect(calculateSortOrder([{ sort_order: 0 }])).toBe(1);
  });
});
