module.exports = {
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    HALF_DAY_MORNING_PRESENT: 'half-morning-present',
    HALF_DAY_AFTERNOON_PRESENT: 'half-afternoon-present',
    HALF_DAY_MORNING_ABSENT: 'half-morning-absent',
    HALF_DAY_AFTERNOON_ABSENT: 'half-afternoon-absent',
  },
  LEAVE_TYPE: {
    SICK: 'sick',
    ON_DUTY: 'on-duty',
    PERSONAL: 'personal',
    OTHER: 'other',
  },
  NOTIFICATION_TYPE: {
    WARNING: 'warning',
    CRITICAL: 'critical',
    INFO: 'info',
    SUBJECT_RISK: 'subject-risk',
  },
  HEALTH_STATUS: {
    EXCELLENT: 'excellent',   // 90%+
    GOOD: 'good',             // 80%+
    WARNING: 'warning',       // 75-80%
    DANGER: 'danger',         // below 75%
  },
  DEFAULT_ATTENDANCE_TARGET: 75,
};
