import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { PROFESSIONAL_COLORS, TEMPLATE_CATALOG } from "./templateCatalog";
import { JOB_CATEGORY_OPTIONS } from "./types";

describe("shared frontend catalogs", () => {
  it("contains twenty unique templates and only approved colors", () => {
    const ids = TEMPLATE_CATALOG.map((template) => template.id);
    const allowedColors = new Set(
      Object.values(PROFESSIONAL_COLORS).map((color) => color.toUpperCase()),
    );

    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
    for (const template of TEMPLATE_CATALOG) {
      expect(template.colors.length).toBeGreaterThan(0);
      for (const color of template.colors) {
        expect(allowedColors.has(color.toUpperCase())).toBe(true);
      }
    }
  });

  it("maps display category names to unique dataset labels", () => {
    const values = JOB_CATEGORY_OPTIONS.map((category) => category.value);

    expect(JOB_CATEGORY_OPTIONS).toHaveLength(24);
    expect(new Set(values).size).toBe(24);
    expect(
      JOB_CATEGORY_OPTIONS.find((category) => category.label === "Human Resources")?.value,
    ).toBe("HR");
    expect(
      JOB_CATEGORY_OPTIONS.find((category) => category.label === "Information Technology")?.value,
    ).toBe("INFORMATION-TECHNOLOGY");
  });

  const categoryStatsPath = resolve(process.cwd(), "ai", "ml", "artifacts", "category_stats.json");
  it.skipIf(!existsSync(categoryStatsPath))("covers every trained dataset category", () => {
    const stats = JSON.parse(readFileSync(categoryStatsPath, "utf8")) as Record<string, unknown>;
    const mappedValues = new Set(JOB_CATEGORY_OPTIONS.map((category) => category.value));

    expect(Object.keys(stats).every((category) => mappedValues.has(category))).toBe(true);
  });
});
