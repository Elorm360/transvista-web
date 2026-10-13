import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const OFFICIAL_WHATSAPP = "233248442916";

const publicPages = [
  "/",
  "/plan",
  "/stories",
  "/destinations",
  "/destinations/accra",
  "/experiences/kakum-canopy-walk",
  "/trips",
  "/trips/central-region-heritage-adventure-2026",
  "/contact",
  "/privacy",
  "/terms",
  "/policies/payment-booking-refunds",
];

test.describe("Every public page", () => {
  for (const path of publicPages) {
    test(`${path} loads, has one h1, canonical and no serious a11y issues`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toMatch(/^https:\/\/www\.transvistaafrica\.com/);

      const title = await page.title();
      expect(title.match(/TransVista Africa/g)?.length ?? 0).toBeLessThanOrEqual(1);

      // Reveal-on-scroll sections fade in; scroll through so axe sees final colours.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
      });
      await page.waitForTimeout(1200);
      await page.keyboard.press("Escape");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      const serious = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );
      expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    });
  }
});

test("all WhatsApp links use the official number", async ({ page }) => {
  for (const path of ["/", "/plan", "/destinations/accra", "/trips/central-region-heritage-adventure-2026", "/contact"]) {
    await page.goto(path);
    const hrefs = await page
      .locator('a[href*="wa.me/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href, `${path}: ${href}`).toContain(`wa.me/${OFFICIAL_WHATSAPP}`);
    }
  }
});

test("floating WhatsApp message matches the trip page", async ({ page }) => {
  await page.goto("/trips/central-region-heritage-adventure-2026");
  const href = await page
    .getByRole("link", { name: "Chat with TransVista Africa on WhatsApp" })
    .getAttribute("href");
  expect(decodeURIComponent(href ?? "")).toContain("Central Region Heritage");
});

test("trip page shares its own preview", async ({ page }) => {
  await page.goto("/trips/central-region-heritage-adventure-2026");
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogTitle).toContain("Central Region");
  expect(ogImage).toContain("https://www.transvistaafrica.com/images/experiences/");
});

test.describe("Plan form", () => {
  // networkidle = hydrated, so React-controlled inputs keep typed values.

  test("destination links pre-select the region", async ({ page }) => {
    await page.goto("/destinations/accra");
    const cta = page.locator("main").getByRole("link", { name: /plan my trip/i }).first();
    await expect(cta).toHaveAttribute("href", "/plan?destination=accra");
    await page.goto("/plan?destination=accra");
    await expect(page.getByRole("combobox", { name: /region/i })).toHaveValue("greater-accra");
  });

  test("legacy name links still pre-select", async ({ page }) => {
    await page.goto("/plan?destination=Cape%20Coast");
    await expect(page.getByRole("combobox", { name: /region/i })).toHaveValue("central");
  });

  test("empty submit shows inline errors and does not send", async ({ page }) => {
    await page.goto("/plan", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Send my trip request" }).click();
    await expect(page.getByText("Please check the highlighted fields")).toBeVisible();
    await expect(page.getByText("Please enter your full name.")).toBeVisible();
    await expect(page.getByText("Choose at least one type of support.")).toBeVisible();
    await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible();
  });

  test("end date before start date is rejected", async ({ page }) => {
    await page.goto("/plan", { waitUntil: "networkidle" });
    const start = page.locator('input[name="startDate"]');
    await expect(start).toHaveAttribute("min", /\d{4}-\d{2}-\d{2}/);
    await start.fill("2030-12-20");
    await expect(page.locator('input[name="endDate"]')).toHaveAttribute("min", "2030-12-20");
    await page.locator('input[name="endDate"]').fill("2030-12-10");
    await page.getByRole("button", { name: "Send my trip request" }).click();
    await expect(page.getByText("End date must be on or after the start date.")).toBeVisible();
  });
});

test.describe("Trip announcement", () => {
  test("does not cover the page on mobile first load", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile behaviour");
    await page.goto("/");
    await page.waitForTimeout(2000);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open upcoming trip details" })).toBeVisible();
  });

  test("opens on desktop only after scrolling", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop behaviour");
    await page.goto("/");
    await page.waitForTimeout(1500);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.mouse.wheel(0, 6000);
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test("redirects and new pages work", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveURL(/#why-transvista$/);
  for (const path of ["/destinations", "/trips", "/contact", "/privacy", "/terms"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
});

test("sitemap and robots use the www host", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("<loc>https://www.transvistaafrica.com/privacy</loc>");
  expect(sitemap).not.toMatch(/<loc>https:\/\/transvistaafrica\.com/);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("https://www.transvistaafrica.com/sitemap.xml");
});
