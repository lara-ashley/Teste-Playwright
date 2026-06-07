import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TwoFactorCodePage } from '../pages/TwoFactorCodePage';
import dotenv from 'dotenv';

dotenv.config();

test('Login with TOTP automation', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const twoFactorCodePage = new TwoFactorCodePage(page);

  await loginPage.goto();
  await loginPage.fillCredentials(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
  await loginPage.submit();

  await twoFactorCodePage.fillCode(process.env.TEST_TOTP_SECRET!);
  await twoFactorCodePage.submit();

  await expect(page).toHaveURL(/dashboard/);
});