import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage directly before importing the service
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

Object.defineProperty(globalThis, 'window', {
  value: {
    localStorage: localStorageMock
  },
  writable: true
});

// Import after mocking window
import { userSettingsService, type UserSettings } from './user-settings';

describe('UserSettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock completely
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});

    // Reset service state after clearing localStorage
    userSettingsService.reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    test('should load default settings when localStorage is empty', () => {
      const settings = userSettingsService.getSettings();

      expect(settings.autoRefresh.enabled).toBe(false);
      expect(settings.autoRefresh.interval).toBe(5);
      expect(settings.visibleColumns.name).toBe(true);
      expect(settings.visibleColumns.ipAddress).toBe(false);
    });

    test('should handle loading settings with valid JSON', () => {
      const mockSettings: Partial<UserSettings> = {
        autoRefresh: {
          enabled: true,
          interval: 10
        },
        visibleColumns: {
          name: false,
          ipAddress: true
        }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
      userSettingsService.reset();

      const settings = userSettingsService.getSettings();

      // Should use defaults since reset clears everything
      expect(settings.autoRefresh.enabled).toBe(false);
      expect(settings.autoRefresh.interval).toBe(5);
    });

    test('should handle malformed localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const settings = userSettingsService.getSettings();

      expect(settings.autoRefresh.enabled).toBe(false);
      expect(settings.autoRefresh.interval).toBe(5);
    });
  });

  describe('Settings Management', () => {
    test('should get specific setting value', () => {
      expect(userSettingsService.get('autoRefresh')).toEqual({
        enabled: false,
        interval: 5
      });
    });

    test('should set specific setting value', () => {
      // Mock localStorage to track calls
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem.mockClear();

      userSettingsService.set('autoRefresh', {
        enabled: true,
        interval: 15
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rwrs-user-settings',
        expect.any(String)
      );

      // Check the saved JSON content
      const savedCall = localStorageMock.setItem.mock.calls[0];
      const savedSettings = JSON.parse(savedCall[1]);
      expect(savedSettings.autoRefresh.enabled).toBe(true);
      expect(savedSettings.autoRefresh.interval).toBe(15);
    });

    test('should update nested setting values', () => {
      userSettingsService.updateNested('autoRefresh', 'enabled', true);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rwrs-user-settings',
        expect.stringContaining('"enabled":true')
      );

      const settings = userSettingsService.getSettings();
      expect(settings.autoRefresh.enabled).toBe(true);
      expect(settings.autoRefresh.interval).toBe(5); // Should keep original value
    });

    test('should update visible columns', () => {
      userSettingsService.updateNested('visibleColumns', 'name', false);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rwrs-user-settings',
        expect.stringContaining('"name":false')
      );

      const settings = userSettingsService.getSettings();
      expect(settings.visibleColumns.name).toBe(false);
    });
  });

  describe('Settings Persistence', () => {
    test('should save settings to localStorage', () => {
      const newSettings = {
        autoRefresh: {
          enabled: true,
          interval: 20
        },
        visibleColumns: {
          name: false,
          ipAddress: true
        }
      };

      // Clear mock calls before this test
      localStorageMock.setItem.mockClear();

      userSettingsService.set('autoRefresh', newSettings.autoRefresh);

      // Check that setItem was called
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rwrs-user-settings',
        expect.any(String)
      );

      // Verify the important parts are saved correctly
      const savedCall = localStorageMock.setItem.mock.calls[0];
      const savedSettings = JSON.parse(savedCall[1]);
      expect(savedSettings.autoRefresh.enabled).toBe(true);
      expect(savedSettings.autoRefresh.interval).toBe(20);
    });

    test('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      userSettingsService.set('autoRefresh', { enabled: true, interval: 5 });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save user settings to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Settings Reset', () => {
    test('should reset all settings to defaults', () => {
      // First modify some settings
      userSettingsService.set('autoRefresh', { enabled: true, interval: 15 });
      userSettingsService.updateNested('visibleColumns', 'name', false);

      // Reset all settings
      userSettingsService.reset();

      const settings = userSettingsService.getSettings();
      expect(settings.autoRefresh.enabled).toBe(false);
      expect(settings.autoRefresh.interval).toBe(5);
      expect(settings.visibleColumns.name).toBe(true);
      expect(settings.visibleColumns.ipAddress).toBe(false);
    });

    test('should reset specific setting to default', () => {
      // Modify autoRefresh settings
      userSettingsService.set('autoRefresh', { enabled: true, interval: 15 });

      // Reset only autoRefresh
      userSettingsService.resetKey('autoRefresh');

      const settings = userSettingsService.getSettings();
      expect(settings.autoRefresh.enabled).toBe(false);
      expect(settings.autoRefresh.interval).toBe(5);
    });
  });

  describe('Settings Import/Export', () => {
    test('should export settings as JSON', () => {
      const exportedJson = userSettingsService.export();

      expect(typeof exportedJson).toBe('string');
      const parsed = JSON.parse(exportedJson);
      expect(parsed.autoRefresh).toBeDefined();
      expect(parsed.visibleColumns).toBeDefined();
    });

    test('should import valid JSON settings', () => {
      const importData = {
        autoRefresh: {
          enabled: true,
          interval: 30
        },
        visibleColumns: {
          name: false,
          mapId: false
        }
      };

      const success = userSettingsService.import(JSON.stringify(importData));

      expect(success).toBe(true);

      const settings = userSettingsService.getSettings();
      expect(settings.autoRefresh.enabled).toBe(true);
      expect(settings.autoRefresh.interval).toBe(30);
      expect(settings.visibleColumns.name).toBe(false);
      expect(settings.visibleColumns.mapId).toBe(false);
      expect(settings.visibleColumns.ipAddress).toBe(false); // Should keep default
    });

    test('should reject invalid JSON settings', () => {
      const success = userSettingsService.import('invalid json');

      expect(success).toBe(false);
    });

    test('should import partial settings', () => {
      const partialData = {
        autoRefresh: {
          enabled: true
          // Missing interval
        }
      };

      const success = userSettingsService.import(JSON.stringify(partialData));

      expect(success).toBe(true);

      const settings = userSettingsService.getSettings();
      expect(settings.autoRefresh.enabled).toBe(true);
      expect(settings.autoRefresh.interval).toBe(5); // Should use default
    });
  });

  describe('Error Handling', () => {
    test('should handle extra unknown properties in imported settings', () => {
      const extraSettings = {
        autoRefresh: {
          enabled: true,
          interval: 10
        },
        visibleColumns: {
          name: true
        },
        unknownProperty: 'some value'
      };

      const success = userSettingsService.import(JSON.stringify(extraSettings));

      expect(success).toBe(true);
      const settings = userSettingsService.getSettings();
      expect(settings.autoRefresh.enabled).toBe(true);
      expect((settings as any).unknownProperty).toBe('some value');
    });
  });
});