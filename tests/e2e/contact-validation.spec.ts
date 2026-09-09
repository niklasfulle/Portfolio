import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectValidity(field: Locator, expected: boolean) {
  await expect
    .poll(() =>
      field.evaluate((element) => {
        const control = element as HTMLInputElement | HTMLTextAreaElement;
        return control.validity.valid;
      })
    )
    .toBe(expected);
}

async function openContactForm(page: Page) {
  await page.goto("/?language=de#contact", { waitUntil: "domcontentloaded" });

  const contactSection = page.locator("#contact");
  await expect(contactSection).toBeVisible();
  await contactSection.scrollIntoViewIfNeeded();

  return contactSection.locator("form");
}

test.describe("Contact form validation", () => {
  test("blocks an empty submission before the email API is called", async ({
    page,
  }) => {
    const emailRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/email/send")) {
        emailRequests.push(request.url());
      }
    });
    await page.route("**/api/email/send", (route) => route.abort());

    const form = await openContactForm(page);
    const senderEmail = form.locator('input[name="senderEmail"]');
    const topic = form.locator('input[name="topic"]');
    const message = form.locator('textarea[name="message"]');

    await form.getByRole("button", { name: "Nachricht senden", exact: true }).click();

    await expectValidity(senderEmail, false);
    await expectValidity(topic, false);
    await expectValidity(message, false);
    expect(emailRequests).toHaveLength(0);
  });

  test("rejects an invalid sender email without sending a request", async ({
    page,
  }) => {
    const emailRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/email/send")) {
        emailRequests.push(request.url());
      }
    });
    await page.route("**/api/email/send", (route) => route.abort());

    const form = await openContactForm(page);
    const senderEmail = form.locator('input[name="senderEmail"]');

    await senderEmail.fill("not-an-email");
    await form.locator('input[name="topic"]').fill("Playwright validation");
    await form
      .locator('textarea[name="message"]')
      .fill("This message must not be sent.");
    await form.getByRole("button", { name: "Nachricht senden", exact: true }).click();

    await expectValidity(senderEmail, false);
    await expectValidity(form.locator('input[name="topic"]'), true);
    await expectValidity(form.locator('textarea[name="message"]'), true);
    expect(emailRequests).toHaveLength(0);
  });
});
