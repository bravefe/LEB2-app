import { chromium, type BrowserContext, type Page } from "playwright";
import { resolve } from "node:path";

export const classListUrl = "https://app.leb2.org/class";
export const loginUrl = "https://signin.leb2.org/login";
const classCardSelector = '.class-card[name^="card-"]';

function isLoginPage(page: Page): boolean {
  const url = new URL(page.url());
  return url.hostname === "signin.leb2.org" || url.pathname.startsWith("/login");
}

async function hasClassCards(page: Page): Promise<boolean> {
  return (await page.locator(classCardSelector).count()) > 0;
}

export async function openSession(profileDirectory = ".leb2-profile"): Promise<{ context: BrowserContext; page: Page }> {
  const context = await chromium.launchPersistentContext(resolve(profileDirectory), {
    headless: false,
    viewport: { width: 1440, height: 1000 }
  });
  const page = context.pages()[0] ?? await context.newPage();
  await page.goto(classListUrl, { waitUntil: "domcontentloaded" });
  await page.locator(classCardSelector).first().waitFor({ state: "attached", timeout: 10000 }).catch(() => undefined);

  if (isLoginPage(page) || !(await hasClassCards(page))) {
    await page.goto(loginUrl, { waitUntil: "domcontentloaded" });
    console.log("The official LEB2 sign-in page is open. Sign in manually in the browser window.");
    console.log("The scanner will continue automatically after LEB2 redirects to the class page.");
    await page.locator(classCardSelector).first().waitFor({ state: "attached", timeout: 300000 }).catch(() => undefined);
  }

  if (!(await hasClassCards(page))) {
    throw new Error(`LEB2 class list was not reached after sign-in. Current page: ${page.url()}`);
  }
  return { context, page };
}
