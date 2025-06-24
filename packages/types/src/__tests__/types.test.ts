import type {
  // Auth types
  AuthSource,
  User,
  AuthenticatedUser,
  AuthUser,
  AuthSession,
  JWTPayload,
  SessionPayload,
  IAuthProvider,
  AuthProviderConfig,
  
  // API types
  ApiResponse,
  ApiError,
  CreateSessionRequest,
  SessionResponse,
  MagicLinkRequest,
  MagicLinkResponse,
  HealthCheckResponse,
  EnvVariable,
  EnvCheckResult,
  PaginationParams,
  PaginatedResponse,
  FilterParams,
  SortParams,
  WebSocketMessage,
  
  // Demo types
  DemoStep,
  DemoScript,
  DemoState,
  DemoContextType,
  
  // UI types
  BreadcrumbItem,
  BreadcrumbContextType,
  RouteMetadata,
  CommandCategory,
  CommandAction,
  CommandPaletteContextType,
  Language,
  LanguageInfo,
  LanguageDetectionResult,
  LanguageContextType,
  TranslationStrings,
  Translations,
  AccessibilityContextType,
  AnnounceContextType,
  Theme,
  CookiePreferences,
  CookieConsentProps,
  UserLike,
  UserAvatarProps,
  WhitelabelConfig,
  WhitelabelContextType,
  Position,
  FocusTrapProps,
  
  // Common types
  DeepPartial,
  DeepRequired,
  ArrayElement,
  RequireKeys,
  PartialKeys,
  AsyncFunction,
  JsonPrimitive,
  JsonObject,
  JsonArray,
  JsonValue,
  Environment,
  HttpMethod,
  Status,
  SortOrder,
  DateRange,
  KeyValue,
  Option,
  TreeNode,
  Metadata,
  CodedError,
  FeatureFlag
} from '../index';

describe('@monorepo/types', () => {
  describe('Type exports', () => {
    it('should export auth types', () => {
      // Type checking only - these tests ensure types are properly exported
      const authSource: AuthSource = 'entraid';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      const authUser: AuthUser = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        source: 'entraid',
      };
      const session: AuthSession = {
        user: authUser,
        token: 'token',
        source: 'entraid',
      };
      
      expect(authSource).toBe('entraid');
      expect(user.id).toBe('1');
      expect(authUser.source).toBe('entraid');
      expect(session.token).toBe('token');
    });

    it('should export API types', () => {
      const apiResponse: ApiResponse<{ id: number }> = {
        data: { id: 1 },
        message: 'Success',
      };
      const apiError: ApiError = {
        error: 'Not found',
        status: 404,
      };
      const healthCheck: HealthCheckResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'test',
        requestId: '123',
      };
      
      expect(apiResponse.data?.id).toBe(1);
      expect(apiError.status).toBe(404);
      expect(healthCheck.status).toBe('healthy');
    });

    it('should export demo types', () => {
      const demoStep: DemoStep = {
        id: '1',
        type: 'click',
        target: '#button',
      };
      const demoScript: DemoScript = {
        id: '1',
        title: 'Test Demo',
        description: 'A test demo',
        steps: [demoStep],
      };
      const demoState: DemoState = {
        isPlaying: false,
        isPaused: false,
        currentScript: null,
        currentStepIndex: 0,
        scripts: [],
        speed: 1,
        error: null,
        highlights: [],
      };
      
      expect(demoStep.type).toBe('click');
      expect(demoScript.title).toBe('Test Demo');
      expect(demoState.isPlaying).toBe(false);
    });

    it('should export UI types', () => {
      const breadcrumb: BreadcrumbItem = {
        label: 'Home',
        href: '/',
      };
      const command: CommandAction = {
        id: 'test',
        name: 'Test Command',
        category: 'actions',
        handler: () => {},
      };
      const language: Language = 'en';
      const theme: Theme = 'dark';
      const cookiePrefs: CookiePreferences = {
        necessary: true,
        analytics: false,
        marketing: false,
      };
      
      expect(breadcrumb.label).toBe('Home');
      expect(command.category).toBe('actions');
      expect(language).toBe('en');
      expect(theme).toBe('dark');
      expect(cookiePrefs.necessary).toBe(true);
    });

    it('should export common utility types', () => {
      // Test DeepPartial
      interface TestInterface {
        a: string;
        b: {
          c: number;
          d: boolean;
        };
      }
      const partial: DeepPartial<TestInterface> = {
        b: {
          c: 42,
        },
      };
      
      // Test RequireKeys
      interface OptionalInterface {
        a?: string;
        b?: number;
        c: boolean;
      }
      const required: RequireKeys<OptionalInterface, 'a' | 'b'> = {
        a: 'test',
        b: 42,
        c: true,
      };
      
      // Test common types
      const env: Environment = 'production';
      const method: HttpMethod = 'GET';
      const status: Status = 'loading';
      const order: SortOrder = 'desc';
      
      expect(partial.b?.c).toBe(42);
      expect(required.a).toBe('test');
      expect(env).toBe('production');
      expect(method).toBe('GET');
      expect(status).toBe('loading');
      expect(order).toBe('desc');
    });

    it('should handle JsonValue types correctly', () => {
      const primitive: JsonPrimitive = 'string';
      const object: JsonObject = { key: 'value' };
      const array: JsonArray = [1, 2, 3];
      const mixed: JsonValue = {
        string: 'value',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' },
      };
      
      expect(primitive).toBe('string');
      expect(object.key).toBe('value');
      expect(array).toEqual([1, 2, 3]);
      expect(mixed).toBeDefined();
    });

    it('should handle complex types correctly', () => {
      const dateRange: DateRange = {
        start: '2024-01-01',
        end: '2024-12-31',
      };
      const keyValue: KeyValue<number> = {
        key: 'count',
        value: 42,
      };
      const option: Option<number> = {
        label: 'Option 1',
        value: 1,
      };
      const treeNode: TreeNode<{ id: string }> = {
        id: '1',
        label: 'Root',
        data: { id: 'root' },
        children: [
          {
            id: '2',
            label: 'Child',
            data: { id: 'child' },
          },
        ],
      };
      
      expect(dateRange.start).toBe('2024-01-01');
      expect(keyValue.value).toBe(42);
      expect(option.value).toBe(1);
      expect(treeNode.children?.[0].label).toBe('Child');
    });

    it('should handle error types correctly', () => {
      class TestError extends Error implements CodedError {
        code: string;
        details?: any;
        
        constructor(message: string, code: string, details?: any) {
          super(message);
          this.code = code;
          this.details = details;
        }
      }
      
      const error = new TestError('Test error', 'TEST_ERROR', { foo: 'bar' });
      
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ foo: 'bar' });
    });

    it('should handle feature flag types', () => {
      const flag: FeatureFlag = {
        key: 'new-feature',
        enabled: true,
        description: 'A new feature',
        rolloutPercentage: 50,
        metadata: {
          owner: 'team-a',
          jiraTicket: 'FEAT-123',
        },
      };
      
      expect(flag.key).toBe('new-feature');
      expect(flag.enabled).toBe(true);
      expect(flag.rolloutPercentage).toBe(50);
      expect(flag.metadata?.owner).toBe('team-a');
    });
  });

  describe('Type constraints', () => {
    it('should enforce auth source constraints', () => {
      const validSources: AuthSource[] = ['entraid', 'sso', 'supabase', 'magic', 'custom'];
      validSources.forEach(source => {
        expect(['entraid', 'sso', 'supabase', 'magic', 'custom']).toContain(source);
      });
    });

    it('should enforce command category constraints', () => {
      const validCategories: CommandCategory[] = [
        'navigation', 'actions', 'search', 'help',
        'theme', 'language', 'accessibility', 'debug'
      ];
      validCategories.forEach(category => {
        expect([
          'navigation', 'actions', 'search', 'help',
          'theme', 'language', 'accessibility', 'debug'
        ]).toContain(category);
      });
    });

    it('should enforce demo step type constraints', () => {
      const validStepTypes: DemoStep['type'][] = [
        'click', 'type', 'wait', 'navigate', 'assert',
        'highlight', 'scroll', 'hover'
      ];
      validStepTypes.forEach(type => {
        expect([
          'click', 'type', 'wait', 'navigate', 'assert',
          'highlight', 'scroll', 'hover'
        ]).toContain(type);
      });
    });
  });
});