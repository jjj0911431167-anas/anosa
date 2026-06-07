import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export const notificationsService = {
  async requestPermissions() {
    if (!Device.isDevice) {
      console.log("[notifications] Must use physical device for push notifications");
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[notifications] Failed to get push notification permissions");
      return false;
    }

    return true;
  },

  async getExpoPushToken() {
    try {
      if (!Device.isDevice) {
        console.log("[notifications] Must use physical device for push notifications");
        return null;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.log("[notifications] Project ID not found");
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token.data;
    } catch (error) {
      console.error("[notifications] Error getting Expo push token:", error);
      return null;
    }
  },

  async savePushToken(userId: string, token: string) {
    try {
      await AsyncStorage.setItem(`pushToken_${userId}`, token);
    } catch (error) {
      console.error("[notifications] Error saving push token:", error);
    }
  },

  async getPushToken(userId: string) {
    try {
      return await AsyncStorage.getItem(`pushToken_${userId}`);
    } catch (error) {
      console.error("[notifications] Error getting push token:", error);
      return null;
    }
  },

  // Send local notification (for testing)
  async sendLocalNotification(title: string, body: string, data?: Record<string, any>) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: "default",
        badge: 1,
      },
      trigger: { type: "timeInterval", seconds: 1 } as any,
    });
  },

  // Listen for notification responses
  onNotificationResponse(callback: (response: Notifications.NotificationResponse) => void) {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return subscription;
  },

  // Listen for notifications while app is in foreground
  onNotificationReceived(callback: (notification: Notifications.Notification) => void) {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    return subscription;
  },

  // Send message notification
  async sendMessageNotification(
    senderName: string,
    message: string,
    senderId: string,
    messageId: string
  ) {
    await this.sendLocalNotification(senderName, message, {
      type: "message",
      senderId,
      messageId,
    });
  },

  // Send incoming call notification
  async sendIncomingCallNotification(callerName: string, callType: "voice" | "video") {
    await this.sendLocalNotification(
      `${callerName} is calling...`,
      callType === "video" ? "Video call" : "Voice call",
      {
        type: "call",
        callType,
      }
    );
  },

  // Send missed call notification
  async sendMissedCallNotification(callerName: string) {
    await this.sendLocalNotification(
      "Missed call",
      `You missed a call from ${callerName}`,
      {
        type: "missedCall",
      }
    );
  },

  // Send group message notification
  async sendGroupMessageNotification(
    groupName: string,
    senderName: string,
    message: string,
    groupId: string
  ) {
    await this.sendLocalNotification(
      `${groupName}: ${senderName}`,
      message,
      {
        type: "groupMessage",
        groupId,
      }
    );
  },

  // Send story notification
  async sendStoryNotification(userName: string) {
    await this.sendLocalNotification(
      `${userName} posted a story`,
      "Tap to view",
      {
        type: "story",
        userName,
      }
    );
  },

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  },

  // Get all scheduled notifications
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  // Cancel notification
  async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },
};
