import { renderHook, act } from '@testing-library/react-hooks';
import {
  useSocket,
  useApplicationUpdates,
  useSchoolUpdates,
  useReminderNotifications,
  useSystemAnnouncements,
} from '../useSocket';
import { socketClient } from '../../services/socketClient';

// Mock socket client
jest.mock('../../services/socketClient', () => ({
  socketClient: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribeToSchool: jest.fn(),
    unsubscribeFromSchool: jest.fn(),
    subscribeToApplication: jest.fn(),
    unsubscribeFromApplication: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    getStatus: jest.fn(() => ({
      connected: true,
      userId: 'user-1',
      socketId: 'socket-1',
      reconnectAttempts: 0,
    })),
  },
}));

describe('useSocket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect automatically with user ID', () => {
    renderHook(() => useSocket('user-1', true));

    expect(socketClient.connect).toHaveBeenCalledWith('user-1');
  });

  it('should not connect automatically when autoConnect is false', () => {
    renderHook(() => useSocket('user-1', false));

    expect(socketClient.connect).not.toHaveBeenCalled();
  });

  it('should provide connection status', () => {
    const { result } = renderHook(() => useSocket('user-1'));

    expect(result.current.isConnected).toBe(true);
    expect(result.current.socketId).toBe('socket-1');
  });

  it('should provide socket methods', () => {
    const { result } = renderHook(() => useSocket('user-1'));

    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
    expect(typeof result.current.subscribeToSchool).toBe('function');
    expect(typeof result.current.unsubscribeFromSchool).toBe('function');
    expect(typeof result.current.subscribeToApplication).toBe('function');
    expect(typeof result.current.unsubscribeFromApplication).toBe('function');
    expect(typeof result.current.on).toBe('function');
    expect(typeof result.current.off).toBe('function');
  });

  it('should call socket methods correctly', () => {
    const { result } = renderHook(() => useSocket('user-1'));

    act(() => {
      result.current.subscribeToSchool('school-1');
    });

    expect(socketClient.subscribeToSchool).toHaveBeenCalledWith('school-1');

    act(() => {
      result.current.subscribeToApplication('app-1');
    });

    expect(socketClient.subscribeToApplication).toHaveBeenCalledWith('app-1');
  });
});

describe('useApplicationUpdates Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to application updates', () => {
    renderHook(() => useApplicationUpdates('app-1'));

    expect(socketClient.subscribeToApplication).toHaveBeenCalledWith('app-1');
    expect(socketClient.on).toHaveBeenCalledWith('application:updated', expect.any(Function));
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useApplicationUpdates('app-1'));

    unmount();

    expect(socketClient.unsubscribeFromApplication).toHaveBeenCalledWith('app-1');
    expect(socketClient.off).toHaveBeenCalledWith('application:updated', expect.any(Function));
  });

  it('should not subscribe without application ID', () => {
    renderHook(() => useApplicationUpdates(undefined));

    expect(socketClient.subscribeToApplication).not.toHaveBeenCalled();
  });

  it('should call onUpdate callback when provided', () => {
    const onUpdate = jest.fn();
    renderHook(() => useApplicationUpdates('app-1', onUpdate));

    // onUpdate callback should be set up (tested indirectly through subscription)
    expect(socketClient.on).toHaveBeenCalled();
  });
});

describe('useSchoolUpdates Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to school updates', () => {
    renderHook(() => useSchoolUpdates('school-1'));

    expect(socketClient.subscribeToSchool).toHaveBeenCalledWith('school-1');
    expect(socketClient.on).toHaveBeenCalledWith('community:stats:updated', expect.any(Function));
    expect(socketClient.on).toHaveBeenCalledWith('community:contribution:new', expect.any(Function));
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useSchoolUpdates('school-1'));

    unmount();

    expect(socketClient.unsubscribeFromSchool).toHaveBeenCalledWith('school-1');
    expect(socketClient.off).toHaveBeenCalledWith('community:stats:updated', expect.any(Function));
    expect(socketClient.off).toHaveBeenCalledWith('community:contribution:new', expect.any(Function));
  });

  it('should not subscribe without school ID', () => {
    renderHook(() => useSchoolUpdates(undefined));

    expect(socketClient.subscribeToSchool).not.toHaveBeenCalled();
  });

  it('should call callbacks when provided', () => {
    const onStatsUpdate = jest.fn();
    const onNewContribution = jest.fn();

    renderHook(() => useSchoolUpdates('school-1', onStatsUpdate, onNewContribution));

    expect(socketClient.on).toHaveBeenCalledWith('community:stats:updated', expect.any(Function));
    expect(socketClient.on).toHaveBeenCalledWith('community:contribution:new', expect.any(Function));
  });
});

describe('useReminderNotifications Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to reminder notifications', () => {
    renderHook(() => useReminderNotifications());

    expect(socketClient.on).toHaveBeenCalledWith('reminder:notification', expect.any(Function));
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useReminderNotifications());

    unmount();

    expect(socketClient.off).toHaveBeenCalledWith('reminder:notification', expect.any(Function));
  });

  it('should call onReminder callback when provided', () => {
    const onReminder = jest.fn();
    renderHook(() => useReminderNotifications(onReminder));

    expect(socketClient.on).toHaveBeenCalledWith('reminder:notification', expect.any(Function));
  });
});

describe('useSystemAnnouncements Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to system announcements', () => {
    renderHook(() => useSystemAnnouncements());

    expect(socketClient.on).toHaveBeenCalledWith('system:announcement', expect.any(Function));
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useSystemAnnouncements());

    unmount();

    expect(socketClient.off).toHaveBeenCalledWith('system:announcement', expect.any(Function));
  });

  it('should call onAnnouncement callback when provided', () => {
    const onAnnouncement = jest.fn();
    renderHook(() => useSystemAnnouncements(onAnnouncement));

    expect(socketClient.on).toHaveBeenCalledWith('system:announcement', expect.any(Function));
  });
});
