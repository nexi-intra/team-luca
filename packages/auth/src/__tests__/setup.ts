// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock window object - update individual properties
if (!(global as any).window) {
  (global as any).window = {};
}

(global as any).window.localStorage = localStorageMock;
(global as any).window.sessionStorage = sessionStorageMock;
(global as any).window.open = jest.fn();
(global as any).window.addEventListener = jest.fn();
(global as any).window.removeEventListener = jest.fn();
(global as any).window.dispatchEvent = jest.fn();
(global as any).window.screenX = 0;
(global as any).window.screenY = 0;
(global as any).window.outerWidth = 1024;
(global as any).window.outerHeight = 768;

// Mock location if not already present
if (!(global as any).window.location) {
  (global as any).window.location = {
    origin: "http://localhost:3000",
    href: "http://localhost:3000",
  };
}

// Mock crypto on both global and window
const cryptoMock = {
  getRandomValues: (arr: any) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
  subtle: {
    digest: async (algorithm: string, data: ArrayBuffer) => {
      // Simple mock implementation
      return new ArrayBuffer(32);
    },
  } as any,
};

(global as any).crypto = cryptoMock;
(global as any).window.crypto = cryptoMock;

// Mock TextEncoder/TextDecoder
(global as any).TextEncoder = class {
  encode(text: string): Uint8Array {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i);
    }
    return bytes;
  }
};

(global as any).TextDecoder = class {
  decode(bytes: Uint8Array): string {
    let result = "";
    for (let i = 0; i < bytes.length; i++) {
      result += String.fromCharCode(bytes[i]);
    }
    return result;
  }
};

// Also set localStorage and sessionStorage directly on global for direct access
(global as any).localStorage = localStorageMock;
(global as any).sessionStorage = sessionStorageMock;

// Export the mocks so tests can use them
export { localStorageMock, sessionStorageMock };

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.getItem.mockReturnValue(null);
});
