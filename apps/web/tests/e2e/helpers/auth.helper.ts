import { Page } from "@playwright/test";

export class AuthHelper {
  constructor(private page: Page) {}

  async mockLogin(user: { email: string; name: string; id: string }) {
    await this.page.evaluate((userData) => {
      const mockAuthResponse = {
        account: {
          homeAccountId: userData.id,
          environment: "login.windows.net",
          tenantId: "test-tenant-id",
          username: userData.email,
          localAccountId: userData.id,
          name: userData.name,
        },
        idToken: "mock-id-token",
        accessToken: "mock-access-token",
        expiresOn: new Date(Date.now() + 3600000),
        scopes: ["openid", "profile"],
      };

      sessionStorage.setItem(
        "msal.token.keys",
        JSON.stringify({
          idToken: [
            `${userData.id}.login.windows.net-idtoken-test-client-id-test-tenant-id-`,
          ],
          accessToken: [
            `${userData.id}.login.windows.net-accesstoken-test-client-id-test-tenant-id-openid profile`,
          ],
          refreshToken: [
            `${userData.id}.login.windows.net-refreshtoken-test-client-id-`,
          ],
        }),
      );

      sessionStorage.setItem(
        `${userData.id}.login.windows.net-idtoken-test-client-id-test-tenant-id-`,
        JSON.stringify({
          secret: "mock-id-token",
          expiresOn: Math.floor(Date.now() / 1000) + 3600,
        }),
      );

      sessionStorage.setItem(
        `${userData.id}.login.windows.net-accesstoken-test-client-id-test-tenant-id-openid profile`,
        JSON.stringify({
          secret: "mock-access-token",
          expiresOn: Math.floor(Date.now() / 1000) + 3600,
        }),
      );

      sessionStorage.setItem(
        "msal.account.keys",
        JSON.stringify([userData.id]),
      );
      sessionStorage.setItem(
        userData.id,
        JSON.stringify(mockAuthResponse.account),
      );
    }, user);
  }

  async verifyAuthenticated() {
    await this.page.waitForSelector('[data-testid="user-menu"]', {
      timeout: 5000,
    });
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForSelector('[data-testid="login-button"]', {
      timeout: 5000,
    });
  }

  async clearAuthState() {
    await this.page.evaluate(() => {
      sessionStorage.clear();
      localStorage.removeItem("test-user");
    });
  }
}
