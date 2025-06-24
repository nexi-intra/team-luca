import "@testing-library/jest-dom";
import "reflect-metadata";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock MSAL
jest.mock("@azure/msal-react", () => ({
  MsalProvider: ({ children }) => children,
  useMsal: () => ({
    instance: {
      loginPopup: jest.fn(),
      logoutPopup: jest.fn(),
      getActiveAccount: jest.fn(),
    },
    accounts: [],
    inProgress: "none",
  }),
  useIsAuthenticated: () => false,
  AuthenticatedTemplate: ({ children }) => children,
  UnauthenticatedTemplate: ({ children }) => children,
}));

// Mock crypto for MSAL
Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      digest: jest.fn(),
      generateKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    },
  },
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID = "test-client-id";
process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID = "test-tenant-id";
process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI = "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
