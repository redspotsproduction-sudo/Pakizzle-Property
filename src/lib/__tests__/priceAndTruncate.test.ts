import test from "node:test";
import assert from "node:assert/strict";
import { formatPrice, formatExactPrice, truncateText, TITLE_MAX_CHARS } from "../utils";

test("formatPrice - Zameen.com style compact formatting", async (t) => {
  await t.test("formats Crore values with truncation and strips trailing zeros", () => {
    // 16,36,50,000 -> "Rs 16.36 Crore"
    assert.equal(formatPrice(163650000), "Rs 16.36 Crore");
    // 10,50,50,000 -> "Rs 10.5 Crore"
    assert.equal(formatPrice(105050000), "Rs 10.5 Crore");
    // 18,20,00,000 -> "Rs 18.2 Crore"
    assert.equal(formatPrice(182000000), "Rs 18.2 Crore");
    // Exact Crore without decimals: 10,00,00,000 -> "Rs 10 Crore"
    assert.equal(formatPrice(100000000), "Rs 10 Crore");
  });

  await t.test("formats Lakh values correctly", () => {
    // 85,00,000 -> "Rs 85 Lakh"
    assert.equal(formatPrice(8500000), "Rs 85 Lakh");
    // 85,50,000 -> "Rs 85.5 Lakh"
    assert.equal(formatPrice(8550000), "Rs 85.5 Lakh");
    // 85,25,000 -> "Rs 85.25 Lakh"
    assert.equal(formatPrice(8525000), "Rs 85.25 Lakh");
  });

  await t.test("formats Thousand values correctly", () => {
    assert.equal(formatPrice(50000), "Rs 50 Thousand");
    assert.equal(formatPrice(75500), "Rs 75.5 Thousand");
  });

  await t.test("formats amounts below 1,000 as plain number with Rs prefix", () => {
    assert.equal(formatPrice(500), "Rs 500");
    assert.equal(formatPrice(999), "Rs 999");
  });

  await t.test("handles 99,99,999 edge case correctly without displaying 100 Lakh", () => {
    // In truncation mode ('floor'), 9,999,999 is 99.99 Lakh
    assert.equal(formatPrice(9999999), "Rs 99.99 Lakh");
    // In round-half-up mode, it promotes to 1 Crore rather than displaying 100 Lakh
    assert.equal(formatPrice(9999999, 'round-half-up'), "Rs 1 Crore");
  });

  await t.test("handles edge cases: null, undefined, 0, negative, NaN", () => {
    assert.equal(formatPrice(0), "Price on request");
    assert.equal(formatPrice(null), "Price on request");
    assert.equal(formatPrice(undefined), "Price on request");
    assert.equal(formatPrice(-5000), "Price on request");
    assert.equal(formatPrice(NaN), "Price on request");
    assert.equal(formatPrice("invalid"), "Price on request");
  });

  await t.test("handles numeric strings with and without commas", () => {
    assert.equal(formatPrice("16,36,50,000"), "Rs 16.36 Crore");
    assert.equal(formatPrice("163650000"), "Rs 16.36 Crore");
    assert.equal(formatPrice(" 10,50,50,000 "), "Rs 10.5 Crore");
    assert.equal(formatPrice("85,00,000"), "Rs 85 Lakh");
  });
});

test("formatExactPrice - South Asian number grouping for accessibility", async (t) => {
  await t.test("formats exact figures for tooltips and aria-labels", () => {
    assert.equal(formatExactPrice(163650000), "Rs 16,36,50,000");
    assert.equal(formatExactPrice(105050000), "Rs 10,50,50,000");
    assert.equal(formatExactPrice(null), "Price on request");
    assert.equal(formatExactPrice(0), "Price on request");
  });
});

test("truncateText - Single-line truncation with Unicode safety", async (t) => {
  await t.test("truncates text over 28 chars and adds ellipsis without trailing whitespace/punctuation", () => {
    // "DHA Phase 6 Residential Land Plot" (33 chars) -> "DHA Phase 6 Residential Land..."
    assert.equal(truncateText("DHA Phase 6 Residential Land Plot", TITLE_MAX_CHARS), "DHA Phase 6 Residential Land...");
  });

  await t.test("leaves text <= 28 chars untouched", () => {
    assert.equal(truncateText("Bahria Town Elite", TITLE_MAX_CHARS), "Bahria Town Elite");
    assert.equal(truncateText("Bahria Town Elite Land Plot", TITLE_MAX_CHARS), "Bahria Town Elite Land Plot");
    assert.equal(truncateText("Short Title", TITLE_MAX_CHARS), "Short Title");
  });

  await t.test("cleans trailing whitespace and punctuation before ellipsis", () => {
    // String where 28th char ends right after whitespace or punctuation
    assert.equal(truncateText("DHA Phase 6 Residential Land    Extra", TITLE_MAX_CHARS), "DHA Phase 6 Residential Land...");
    assert.equal(truncateText("DHA Phase 6 Residential Land,   Extra", TITLE_MAX_CHARS), "DHA Phase 6 Residential Land...");
  });

  await t.test("handles null, undefined, empty string", () => {
    assert.equal(truncateText(""), "");
    assert.equal(truncateText(null), "");
    assert.equal(truncateText(undefined), "");
  });

  await t.test("handles Unicode / Urdu text safely", () => {
    const urdu = "بحریہ ٹاؤن فیز 8 رہائشی پلاٹ راولپنڈی";
    const truncated = truncateText(urdu, 15);
    assert.ok(truncated.endsWith("..."));
    assert.ok(truncated.length <= 18);
  });
});
