interface NotificationTemplate {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

interface TemplateData {
  userName?: string;
  courseName?: string;
  lessonName?: string;
  progress?: number;
  daysInactive?: number;
  achievementName?: string;
  messageCount?: number;
  senderName?: string;
  deadline?: string;
  score?: number;
}

export const notificationTemplates = {
  newMessage: (data: TemplateData): NotificationTemplate => ({
    title: 'New Message',
    body: `${data.senderName} sent you a message${data.messageCount && data.messageCount > 1 
      ? ` (+${data.messageCount - 1} more)` 
      : ''
    }`,
    icon: '/icons/message.png',
    badge: '/icons/badge-message.png',
    data: {
      url: '/messages',
      type: 'message',
      senderId: data.senderName,
    },
    actions: [
      {
        action: 'reply',
        title: 'Reply',
        icon: '/icons/reply.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png',
      },
    ],
  }),

  courseProgress: (data: TemplateData): NotificationTemplate => ({
    title: 'Learning Progress Update',
    body: `You've completed ${data.progress}% of ${data.courseName}! Keep up the great work!`,
    icon: '/icons/progress.png',
    badge: '/icons/badge-progress.png',
    data: {
      url: '/progress',
      type: 'progress',
      courseId: data.courseName,
    },
    actions: [
      {
        action: 'viewProgress',
        title: 'View Progress',
        icon: '/icons/view.png',
      },
    ],
  }),

  achievement: (data: TemplateData): NotificationTemplate => ({
    title: 'Achievement Unlocked! 🏆',
    body: `Congratulations! You've earned the "${data.achievementName}" badge.`,
    icon: '/icons/achievement.png',
    badge: '/icons/badge-achievement.png',
    data: {
      url: '/achievements',
      type: 'achievement',
      achievementId: data.achievementName,
    },
    actions: [
      {
        action: 'share',
        title: 'Share',
        icon: '/icons/share.png',
      },
      {
        action: 'viewAll',
        title: 'View All',
        icon: '/icons/view.png',
      },
    ],
  }),

  reminder: (data: TemplateData): NotificationTemplate => ({
    title: 'Learning Reminder',
    body: data.daysInactive && data.daysInactive > 1
      ? `It's been ${data.daysInactive} days since your last lesson. Ready to continue learning?`
      : 'Time for your daily learning session!',
    icon: '/icons/reminder.png',
    badge: '/icons/badge-reminder.png',
    data: {
      url: '/learn',
      type: 'reminder',
    },
    actions: [
      {
        action: 'startLesson',
        title: 'Start Lesson',
        icon: '/icons/play.png',
      },
      {
        action: 'snooze',
        title: 'Remind Later',
        icon: '/icons/snooze.png',
      },
    ],
  }),

  deadline: (data: TemplateData): NotificationTemplate => ({
    title: 'Deadline Approaching',
    body: `The deadline for ${data.lessonName} is ${data.deadline}. Don't forget to complete it!`,
    icon: '/icons/deadline.png',
    badge: '/icons/badge-deadline.png',
    data: {
      url: `/lesson/${data.lessonName}`,
      type: 'deadline',
      lessonId: data.lessonName,
    },
    actions: [
      {
        action: 'startLesson',
        title: 'Start Now',
        icon: '/icons/play.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png',
      },
    ],
  }),

  quiz: (data: TemplateData): NotificationTemplate => ({
    title: 'Quiz Results',
    body: `You scored ${data.score}% on ${data.lessonName}! ${
      data.score && data.score >= 80
        ? 'Great job! 🎉'
        : 'Keep practicing to improve!'
    }`,
    icon: '/icons/quiz.png',
    badge: '/icons/badge-quiz.png',
    data: {
      url: `/lesson/${data.lessonName}/results`,
      type: 'quiz',
      lessonId: data.lessonName,
    },
    actions: [
      {
        action: 'viewDetails',
        title: 'View Details',
        icon: '/icons/view.png',
      },
      {
        action: 'retry',
        title: 'Try Again',
        icon: '/icons/retry.png',
      },
    ],
  }),

  weeklyDigest: (data: TemplateData): NotificationTemplate => ({
    title: 'Weekly Learning Summary',
    body: `Hi ${data.userName}! Check out your learning progress this week.`,
    icon: '/icons/digest.png',
    badge: '/icons/badge-digest.png',
    data: {
      url: '/progress/weekly',
      type: 'digest',
    },
    actions: [
      {
        action: 'viewSummary',
        title: 'View Summary',
        icon: '/icons/view.png',
      },
    ],
  }),
};

export function generateNotification(
  type: keyof typeof notificationTemplates,
  data: TemplateData
): NotificationTemplate {
  return notificationTemplates[type](data);
}
