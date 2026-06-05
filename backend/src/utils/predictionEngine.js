const { ATTENDANCE_STATUS } = require('../config/constants');

/**
 * Calculates attendance weight for a record
 * present = 1, absent = 0, half = 0.5
 */
const getAttendanceWeight = (status) => {
  switch (status) {
    case ATTENDANCE_STATUS.PRESENT: return 1;
    case ATTENDANCE_STATUS.ABSENT: return 0;
    case ATTENDANCE_STATUS.HALF_DAY_MORNING_PRESENT:
    case ATTENDANCE_STATUS.HALF_DAY_AFTERNOON_PRESENT:
    case ATTENDANCE_STATUS.HALF_DAY_MORNING_ABSENT:
    case ATTENDANCE_STATUS.HALF_DAY_AFTERNOON_ABSENT: return 0.5;
    default: return 0;
  }
};

/**
 * Given attended and total classes, calculates attendance %
 */
const calcPercentage = (attended, total) => {
  if (total === 0) return 0;
  return parseFloat(((attended / total) * 100).toFixed(2));
};

/**
 * How many consecutive classes to attend to reach target
 */
const classesNeededToReach = (attended, total, target = 75) => {
  // (attended + x) / (total + x) >= target/100
  // attended + x >= target/100 * (total + x)
  // attended + x >= target*total/100 + target*x/100
  // x - target*x/100 >= target*total/100 - attended
  // x(1 - target/100) >= target*total/100 - attended
  const t = target / 100;
  if (attended / total >= t) return 0;
  const needed = Math.ceil((t * total - attended) / (1 - t));
  return needed > 0 ? needed : 0;
};

/**
 * How many classes can be missed while staying at/above target
 */
const classesCanMiss = (attended, total, target = 75) => {
  // (attended) / (total + x) >= target/100
  // attended >= target/100 * (total + x)
  // attended >= target*total/100 + target*x/100
  // attended - target*total/100 >= target*x/100
  // x <= (attended - target*total/100) * 100 / target
  const t = target / 100;
  const canMiss = Math.floor((attended - t * total) / t);
  return canMiss > 0 ? canMiss : 0;
};

/**
 * Predict attendance given planned absences & attendances on top of current
 */
const predictAttendance = (attended, total, plannedPresent = 0, plannedAbsent = 0) => {
  const newAttended = attended + plannedPresent;
  const newTotal = total + plannedPresent + plannedAbsent;
  return calcPercentage(newAttended, newTotal);
};

/**
 * Determine health status based on percentage
 */
const getHealthStatus = (percentage, target = 75) => {
  if (percentage >= 90) return 'excellent';
  if (percentage >= 80) return 'good';
  if (percentage >= target) return 'warning';
  return 'danger';
};

/**
 * Generate smart insights array
 */
const generateInsights = (attended, total, target = 75, subjectStats = []) => {
  const insights = [];
  const pct = calcPercentage(attended, total);
  const needed = classesNeededToReach(attended, total, target);
  const canMiss = classesCanMiss(attended, total, target);

  if (pct < target) {
    insights.push({
      type: 'danger',
      message: `⚠️ Attend the next ${needed} consecutive classes to reach ${target}% attendance.`,
    });
  } else {
    insights.push({
      type: 'success',
      message: `✅ You can safely miss ${canMiss} more class${canMiss !== 1 ? 'es' : ''} and stay above ${target}%.`,
    });
  }

  // Subject-level insights
  subjectStats.forEach((s) => {
    if (s.percentage < target) {
      insights.push({
        type: 'warning',
        message: `📚 ${s.name} attendance is ${s.percentage}% — below ${target}%. Attend ${classesNeededToReach(s.attended, s.total, target)} more classes.`,
      });
    }
  });

  if (pct >= 90) {
    insights.push({ type: 'info', message: '🏆 Excellent attendance! Keep it up.' });
  }

  return insights;
};

module.exports = {
  getAttendanceWeight,
  calcPercentage,
  classesNeededToReach,
  classesCanMiss,
  predictAttendance,
  getHealthStatus,
  generateInsights,
};
