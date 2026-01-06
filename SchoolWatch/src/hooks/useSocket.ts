import { useEffect, useCallback, useState } from 'react';
import { socketClient } from '../services/socketClient';

/**
 * useSocket - React hook for Socket.IO real-time updates
 * @param userId - User ID for authentication
 * @param autoConnect - Whether to connect automatically (default: true)
 */
export const useSocket = (userId?: string, autoConnect: boolean = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (autoConnect && userId) {
      socketClient.connect(userId);
    }

    // Setup listeners for connection status
    const handleAuthSuccess = (data: any) => {
      setIsConnected(true);
      setSocketId(data.socketId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(null);
    };

    socketClient.on('auth:success', handleAuthSuccess);
    socketClient.on('disconnect', handleDisconnect);

    // Update initial state
    const status = socketClient.getStatus();
    setIsConnected(status.connected);
    setSocketId(status.socketId);

    // Cleanup
    return () => {
      socketClient.off('auth:success', handleAuthSuccess);
      socketClient.off('disconnect', handleDisconnect);

      // Don't disconnect on unmount - keep connection alive
      // User should manually disconnect when logging out
    };
  }, [userId, autoConnect]);

  return {
    isConnected,
    socketId,
    connect: (uid: string) => socketClient.connect(uid),
    disconnect: () => socketClient.disconnect(),
    subscribeToSchool: (schoolId: string) => socketClient.subscribeToSchool(schoolId),
    unsubscribeFromSchool: (schoolId: string) => socketClient.unsubscribeFromSchool(schoolId),
    subscribeToApplication: (appId: string) => socketClient.subscribeToApplication(appId),
    unsubscribeFromApplication: (appId: string) => socketClient.unsubscribeFromApplication(appId),
    on: (event: string, callback: Function) => socketClient.on(event, callback),
    off: (event: string, callback: Function) => socketClient.off(event, callback),
  };
};

/**
 * useApplicationUpdates - Hook for subscribing to application updates
 * @param applicationId - Application ID to subscribe to
 * @param onUpdate - Callback when application is updated
 */
export const useApplicationUpdates = (
  applicationId?: string,
  onUpdate?: (data: any) => void
) => {
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  useEffect(() => {
    if (!applicationId) return;

    // Subscribe to application updates
    socketClient.subscribeToApplication(applicationId);

    // Setup listener
    const handleUpdate = (data: any) => {
      if (data.applicationId === applicationId) {
        setLastUpdate(data);
        onUpdate?.(data);
      }
    };

    socketClient.on('application:updated', handleUpdate);

    // Cleanup
    return () => {
      socketClient.unsubscribeFromApplication(applicationId);
      socketClient.off('application:updated', handleUpdate);
    };
  }, [applicationId, onUpdate]);

  return { lastUpdate };
};

/**
 * useSchoolUpdates - Hook for subscribing to school community updates
 * @param schoolId - School ID to subscribe to
 * @param onStatsUpdate - Callback when community stats are updated
 * @param onNewContribution - Callback when new contribution is added
 */
export const useSchoolUpdates = (
  schoolId?: string,
  onStatsUpdate?: (data: any) => void,
  onNewContribution?: (data: any) => void
) => {
  const [lastStatsUpdate, setLastStatsUpdate] = useState<any>(null);
  const [lastContribution, setLastContribution] = useState<any>(null);

  useEffect(() => {
    if (!schoolId) return;

    // Subscribe to school updates
    socketClient.subscribeToSchool(schoolId);

    // Setup listeners
    const handleStatsUpdate = (data: any) => {
      if (data.schoolId === schoolId) {
        setLastStatsUpdate(data);
        onStatsUpdate?.(data);
      }
    };

    const handleNewContribution = (data: any) => {
      if (data.schoolId === schoolId) {
        setLastContribution(data);
        onNewContribution?.(data);
      }
    };

    socketClient.on('community:stats:updated', handleStatsUpdate);
    socketClient.on('community:contribution:new', handleNewContribution);

    // Cleanup
    return () => {
      socketClient.unsubscribeFromSchool(schoolId);
      socketClient.off('community:stats:updated', handleStatsUpdate);
      socketClient.off('community:contribution:new', handleNewContribution);
    };
  }, [schoolId, onStatsUpdate, onNewContribution]);

  return { lastStatsUpdate, lastContribution };
};

/**
 * useReminderNotifications - Hook for reminder notifications
 * @param onReminder - Callback when reminder notification is received
 */
export const useReminderNotifications = (onReminder?: (data: any) => void) => {
  const [lastReminder, setLastReminder] = useState<any>(null);

  useEffect(() => {
    const handleReminder = (data: any) => {
      setLastReminder(data);
      onReminder?.(data);
    };

    socketClient.on('reminder:notification', handleReminder);

    return () => {
      socketClient.off('reminder:notification', handleReminder);
    };
  }, [onReminder]);

  return { lastReminder };
};

/**
 * useSystemAnnouncements - Hook for system announcements
 * @param onAnnouncement - Callback when system announcement is received
 */
export const useSystemAnnouncements = (onAnnouncement?: (data: any) => void) => {
  const [lastAnnouncement, setLastAnnouncement] = useState<any>(null);

  useEffect(() => {
    const handleAnnouncement = (data: any) => {
      setLastAnnouncement(data);
      onAnnouncement?.(data);
    };

    socketClient.on('system:announcement', handleAnnouncement);

    return () => {
      socketClient.off('system:announcement', handleAnnouncement);
    };
  }, [onAnnouncement]);

  return { lastAnnouncement };
};

export default useSocket;
