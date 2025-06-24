import {
  saveAuthToStorage,
  getAuthFromStorage,
  clearAuthFromStorage,
  saveOAuthState,
  getOAuthState,
  clearOAuthState,
  openAuthPopup,
  listenForAuthMessage,
} from '../../oauth/storage';
import type { StoredAuth, OAuthState } from '../../oauth/storage';
import { localStorageMock, sessionStorageMock } from '../setup';

describe('OAuth Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
  });

  describe('Auth Storage', () => {
    const mockAuth: StoredAuth = {
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      },
      accessToken: 'access-token',
      idToken: 'id-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };

    it('should save auth to localStorage', () => {
      saveAuthToStorage(mockAuth);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_state',
        JSON.stringify(mockAuth)
      );
    });

    it('should get auth from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuth));
      
      const auth = getAuthFromStorage();
      
      expect(auth).toEqual(mockAuth);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_state');
    });

    it('should return null if auth is expired', () => {
      const expiredAuth = {
        ...mockAuth,
        expiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredAuth));
      
      const auth = getAuthFromStorage();
      
      expect(auth).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_state');
    });

    it('should clear auth from localStorage', () => {
      clearAuthFromStorage();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_state');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => saveAuthToStorage(mockAuth)).not.toThrow();
    });
  });

  describe('OAuth State Storage', () => {
    const mockState: OAuthState = {
      state: 'random-state',
      codeVerifier: 'code-verifier',
      redirectUri: 'http://localhost:3000/callback',
      timestamp: Date.now(),
    };

    it('should save OAuth state to sessionStorage', () => {
      saveOAuthState(mockState);
      
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'oauth_state',
        JSON.stringify(mockState)
      );
    });

    it('should get OAuth state from sessionStorage', () => {
      sessionStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));
      
      const state = getOAuthState();
      
      expect(state).toEqual(mockState);
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('oauth_state');
    });

    it('should return null if OAuth state is older than 10 minutes', () => {
      const oldState = {
        ...mockState,
        timestamp: Date.now() - 11 * 60 * 1000, // 11 minutes ago
      };
      sessionStorageMock.getItem.mockReturnValue(JSON.stringify(oldState));
      
      const state = getOAuthState();
      
      expect(state).toBeNull();
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('oauth_state');
    });

    it('should clear OAuth state from sessionStorage', () => {
      clearOAuthState();
      
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('oauth_state');
    });
  });

  describe('Auth Popup', () => {
    const originalOpen = window.open;

    beforeEach(() => {
      window.open = jest.fn();
    });

    afterEach(() => {
      window.open = originalOpen;
    });

    it('should open auth popup with correct parameters', () => {
      openAuthPopup('https://auth.example.com', 'auth-window');
      
      expect(window.open).toHaveBeenCalledWith(
        'https://auth.example.com',
        'auth-window',
        expect.stringContaining('width=500,height=600')
      );
    });

    it('should use default name if not provided', () => {
      openAuthPopup('https://auth.example.com');
      
      expect(window.open).toHaveBeenCalledWith(
        'https://auth.example.com',
        'auth',
        expect.any(String)
      );
    });
  });

  describe('Auth Message Listener', () => {
    it('should listen for auth messages', () => {
      const callback = jest.fn();
      const removeListener = listenForAuthMessage(callback);
      
      const event = new MessageEvent('message', {
        origin: window.location.origin,
        data: {
          type: 'auth_callback',
          code: 'auth-code',
          state: 'auth-state',
        },
      });
      
      window.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalledWith({
        type: 'auth_callback',
        code: 'auth-code',
        state: 'auth-state',
      });
      
      removeListener();
    });

    it('should ignore messages from different origins', () => {
      const callback = jest.fn();
      listenForAuthMessage(callback);
      
      const event = new MessageEvent('message', {
        origin: 'https://evil.com',
        data: {
          type: 'auth_callback',
          code: 'auth-code',
        },
      });
      
      window.dispatchEvent(event);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should ignore non-auth messages', () => {
      const callback = jest.fn();
      listenForAuthMessage(callback);
      
      const event = new MessageEvent('message', {
        origin: window.location.origin,
        data: {
          type: 'other_message',
        },
      });
      
      window.dispatchEvent(event);
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
});