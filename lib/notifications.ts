import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { useKnowledgeStore } from './store';

// Task name for background notification task
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Schedule a local notification
export const scheduleNotification = async (
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
  data?: Record<string, any>
) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger,
    });
    return id;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
};

// Cancel a scheduled notification
export const cancelNotification = async (id: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};

// Get all scheduled notifications
export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
};

// Daily AI insight notification
export const scheduleDailyInsight = async (insightText?: string) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return;
  }

  // Cancel existing daily notification
  const scheduled = await getScheduledNotifications();
  const dailyNotification = scheduled.find(n => 
    n.content.data?.type === 'daily_insight'
  );
  if (dailyNotification) {
    await cancelNotification(dailyNotification.identifier);
  }

  // Generate insight text if not provided
  let notificationBody = insightText;
  if (!notificationBody) {
    try {
      // Import AIService dynamically to avoid circular dependency
      const { AIService } = require('./ai-service');
      const response = await AIService.generateChatResponse(
        'Generate a short daily insight (max 50 chars) based on my knowledge base',
        [], // No specific items needed for general insight
        []
      );
      notificationBody = response.response.substring(0, 50) + '...';
    } catch (error) {
      notificationBody = 'Check out today\'s AI-powered insights!';
    }
  }

  // Schedule for 9 AM daily
  await scheduleNotification(
    'Vivid Daily Insight',
    notificationBody,
    {
      hour: 9,
      minute: 0,
      repeats: true,
    },
    { type: 'daily_insight' }
  );
};

// Task reminder notification
export const scheduleTaskReminder = async (
  taskId: string,
  title: string,
  reminderTime: Date
) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  return await scheduleNotification(
    'Task Reminder',
    `Don't forget: ${title}`,
    {
      date: reminderTime,
    },
    { type: 'task_reminder', taskId }
  );
};

// Handle notification response (when user taps notification)
export const addNotificationResponseReceivedListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Handle notification received (when app is foregrounded)
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Background task for handling notifications
TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error, executionInfo }) => {
    if (error) {
      console.error('Background notification task error:', error);
      return;
    }
    
    // Refresh knowledge items or perform background sync
    try {
      const { backgroundSync } = useKnowledgeStore.getState();
      await backgroundSync();
    } catch (err) {
      console.error('Background sync failed:', err);
    }
  }
);

// Register background task
export const registerBackgroundTask = async () => {
  try {
    await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK).then((isRegistered) => {
      if (!isRegistered) {
        TaskManager.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, () => {});
      }
    });
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
};

// Initialize notifications
export const initializeNotifications = async () => {
  // Request permissions
  await requestNotificationPermissions();
  
  // Register background task
  await registerBackgroundTask();  
  // Schedule daily insight (optional)
  // await scheduleDailyInsight();  
  console.log('Notifications initialized');
};