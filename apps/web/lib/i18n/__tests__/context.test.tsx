import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider, useLanguage } from "../context";
import { AnnounceProvider } from "@/components/accessibility/announce-provider";

// Mock the detection module
jest.mock("../detection", () => ({
  detectLanguage: jest.fn().mockResolvedValue({
    detectedLanguage: "en-US",
    confidence: 0.9,
    source: "browser",
  }),
}));

function TestComponent() {
  const {
    language,
    languageInfo,
    formatNumber,
    formatDate,
    formatCurrency,
    setLanguage,
  } = useLanguage();

  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="language-name">{languageInfo.nativeName}</div>
      <div data-testid="formatted-number">{formatNumber(1234.56)}</div>
      <div data-testid="formatted-date">
        {formatDate(new Date("2024-01-15"), { dateStyle: "short" })}
      </div>
      <div data-testid="formatted-currency">{formatCurrency(99.99, "USD")}</div>
      <button onClick={() => setLanguage("es-ES")}>Change to Spanish</button>
    </div>
  );
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AnnounceProvider>
      <LanguageProvider>{ui}</LanguageProvider>
    </AnnounceProvider>,
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("detects and sets default language", async () => {
    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("current-language")).toHaveTextContent("en-US");
    });

    expect(screen.getByTestId("language-name")).toHaveTextContent("English");
  });

  it("formats numbers according to locale", async () => {
    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("formatted-number")).toHaveTextContent(
        "1,234.56",
      );
    });
  });

  it("formats dates according to locale", async () => {
    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("formatted-date")).toHaveTextContent("1/15/24");
    });
  });

  it("formats currency according to locale", async () => {
    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const formatted = screen.getByTestId("formatted-currency").textContent;
      expect(formatted).toContain("99.99");
      expect(formatted).toMatch(/\$|USD/);
    });
  });

  it("changes language when setLanguage is called", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("current-language")).toHaveTextContent("en-US");
    });

    await user.click(screen.getByText("Change to Spanish"));

    await waitFor(() => {
      expect(screen.getByTestId("current-language")).toHaveTextContent("es-ES");
      expect(screen.getByTestId("language-name")).toHaveTextContent("Español");
    });
  });

  it("persists language preference to localStorage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("current-language")).toHaveTextContent("en-US");
    });

    await user.click(screen.getByText("Change to Spanish"));

    await waitFor(() => {
      expect(localStorage.getItem("user-language")).toBe("es-ES");
    });
  });
});
