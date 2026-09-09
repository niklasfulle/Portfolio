import { expect, test, type Page } from "@playwright/test";

const navigationItems = [
  { label: "Startseite", id: "home" },
  { label: "Über mich", id: "about" },
  { label: "Projekte", id: "projects" },
  { label: "Fähigkeiten", id: "skills" },
  { label: "Erfahrung", id: "experience" },
  { label: "Kontakt", id: "contact" },
] as const;

async function openGermanPortfolio(page: Page) {
  await page.goto("/#home", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#home")).toBeVisible();
}

async function hasThemeClass(
  page: Page,
  className: string
) {
  return page.locator("html").evaluate(
    (element, themeClass) => element.classList.contains(themeClass),
    className
  );
}

async function acceptCookieConsent(page: Page) {
  const consentDialog = page.getByRole("dialog", {
    name: "Deine Darstellung, deine Entscheidung",
  });

  await expect(consentDialog).toBeVisible();
  await consentDialog.getByRole("button", { name: "Akzeptieren" }).click();
  await expect(consentDialog).toBeHidden();
}

test.describe("Portfolio shell", () => {
  test("publishes machine-readable portfolio information", async ({ page }) => {
    await openGermanPortfolio(page);

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(jsonLd).not.toBeNull();

    const structuredData = JSON.parse(jsonLd ?? "{}");
    expect(structuredData["@context"]).toBe("https://schema.org");
    expect(structuredData["@graph"])
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({ "@type": "Person", name: "Niklas Fulle" }),
          expect.objectContaining({
            "@type": "SoftwareSourceCode",
            name: "Portfolio",
          }),
        ])
      );

    const llmsResponse = await page.request.get("/llms.txt");
    await expect(llmsResponse).toBeOK();
    await expect(llmsResponse.headers()["content-type"]).toContain("text/plain");
    await expect(llmsResponse.text()).resolves.toContain("# Niklas Fulle — Portfolio");
  });

  test("does not inject a theme script after hydration", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await openGermanPortfolio(page);
    await expect(page.getByRole("dialog")).toBeVisible();

    expect(consoleErrors).not.toContain(
      "Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client."
    );
  });

  test("loads the home page with its primary content", async ({ page }) => {
    await openGermanPortfolio(page);

    await expect(
      page.getByRole("heading", { name: "Niklas Fulle", level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Hallo, ich bin Niklas.", level: 1 })
    ).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("renders the animated GitHub statistic cards", async ({ page }) => {
    await openGermanPortfolio(page);

    await expect(page.getByTestId("github-stats")).toBeVisible();
    await expect(page.getByTestId("github-stats-card")).toContainText(
      "GitHub-Aktivität"
    );
    await expect(page.getByTestId("github-streak-card")).toContainText(
      "Gesamtbeiträge"
    );
    await expect(page.getByTestId("github-languages-card")).toContainText(
      "TypeScript"
    );
    await expect(page.getByTestId("github-languages-card")).toContainText("#1");
    await expect(page.getByTestId("github-languages-card")).toContainText("Top:");
    const topLanguages = page.getByTestId("github-top-languages");
    expect(await topLanguages.locator("li").count()).toBeLessThanOrEqual(8);

    const moreLanguages = page.getByTestId("github-more-languages");
    if (await moreLanguages.count()) {
      expect(await moreLanguages.getAttribute("open")).toBeNull();
      await moreLanguages.locator("summary").click();
      await expect(moreLanguages).toHaveAttribute("open", "");
      await expect(moreLanguages).toContainText("#9");
    }

    const ring = page.getByTestId("github-current-streak-ring");
    const value = page.getByTestId("github-current-streak-value");
    const icon = page.getByTestId("github-current-streak-icon");
    const ringBox = await ring.boundingBox();
    const valueBox = await value.boundingBox();
    const iconBox = await icon.boundingBox();

    expect(ringBox).not.toBeNull();
    expect(valueBox).not.toBeNull();
    expect(iconBox).not.toBeNull();
    expect(valueBox!.x).toBeGreaterThanOrEqual(ringBox!.x);
    expect(valueBox!.x + valueBox!.width).toBeLessThanOrEqual(
      ringBox!.x + ringBox!.width
    );
    expect(iconBox!.y).toBeLessThan(ringBox!.y);
  });

  test("navigates to every visible section through the anchor navigation", async ({
    page,
  }) => {
    await openGermanPortfolio(page);

    const navigation = page.locator("header nav");

    for (const item of navigationItems) {
      const link = navigation.getByRole("link", {
        name: item.label,
        exact: true,
      });

      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute(
        "href",
        new RegExp(`/#${item.id}$`)
      );

      await link.click();

      await expect(page).toHaveURL(new RegExp(`#${item.id}$`));
      await expect(page.locator(`#${item.id}`)).toBeVisible();
      await expect(page.locator(`#${item.id}`)).toBeInViewport();
    }
  });

  test("marks the section from the URL hash as active", async ({ page }) => {
    await page.goto("/#experience", {
      waitUntil: "domcontentloaded",
    });

    const navigation = page.locator("header nav");
    await expect(
      navigation.getByRole("link", { name: "Erfahrung", exact: true })
    ).toHaveAttribute("aria-current", "location");
    await expect(
      navigation.getByRole("link", { name: "Startseite", exact: true })
    ).not.toHaveAttribute("aria-current");
  });

  test("switches between German and English", async ({ page }) => {
    await openGermanPortfolio(page);
    await acceptCookieConsent(page);
    let loadEvents = 0;
    page.on("load", () => {
      loadEvents += 1;
    });

    await expect(
      page.getByRole("heading", { name: "Hallo, ich bin Niklas.", level: 1 })
    ).toBeVisible();

    const languageToggle = page.getByRole("button", {
      name: /Sprache wechseln|Change language/,
    });
    await expect(languageToggle).toBeVisible();

    await languageToggle.click();

    await expect(page).toHaveURL(/127\.0\.0\.1:3000\/(#home)?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", { name: "Hello, I'm Niklas.", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "About me", exact: true })
    ).toBeVisible();
    expect(loadEvents).toBe(0);

    await languageToggle.click();

    await expect(page).toHaveURL(/127\.0\.0\.1:3000\/(#home)?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(
      page.getByRole("heading", { name: "Hallo, ich bin Niklas.", level: 1 })
    ).toBeVisible();
  });

  test("switches the document theme between light and dark mode", async ({
    page,
  }) => {
    await openGermanPortfolio(page);
    await acceptCookieConsent(page);

    const themeToggle = page.getByRole("button", {
      name: /Darstellung wechseln|Change theme/,
    });
    await expect(themeToggle).toBeVisible();

    await expect
      .poll(() => hasThemeClass(page, "light"))
      .toBe(true);

    await themeToggle.click();

    await expect
      .poll(() => hasThemeClass(page, "dark"))
      .toBe(true);
    await expect
      .poll(() => hasThemeClass(page, "light"))
      .toBe(false);

    await themeToggle.click();

    await expect
      .poll(() => hasThemeClass(page, "light"))
      .toBe(true);
    await expect
      .poll(() => hasThemeClass(page, "dark"))
      .toBe(false);
  });

  test("stores a theme preference only after consent", async ({ page }) => {
    await openGermanPortfolio(page);

    const consentDialog = page.getByRole("dialog", {
      name: "Deine Darstellung, deine Entscheidung",
    });
    await expect(consentDialog).toBeVisible();
    await consentDialog.getByRole("button", { name: "Ablehnen" }).click();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")))
      .toBeNull();

    const cookieSettingsButton = page.getByRole("button", {
      name: "Cookie-Einstellungen öffnen",
    });
    await cookieSettingsButton.click();
    await expect(consentDialog).toBeVisible();

    await consentDialog.getByRole("button", { name: "Akzeptieren" }).click();
    const themeToggle = page.getByRole("button", {
      name: "Darstellung wechseln",
    });
    await themeToggle.click();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("dark");
  });

});
