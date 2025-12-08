import { ref, onMounted, onUnmounted } from 'vue';

export function useRelativeTime() {
  /**
   * Converts a Java LocalDateTime string to a relative time string.
   * Units: Minute, Hour, Day, Month, Year.
   * @param {string} dateString - The ISO-like date string (e.g., '2023-12-07T17:39:18')
   * @returns {string} - The formatted relative time string
   */
  const formatTime = (dateString) => {
    if (!dateString) return '';

    // Parse the date string
    // Java LocalDateTime usually comes as 'YYYY-MM-DDTHH:mm:ss'
    // We assume this time is in the same timezone as the user's browser
    // or standard ISO format.
    const date = new Date(dateString);
    const now = new Date();

    // Calculate difference in milliseconds
    const diff = now - date;

    // Convert to seconds
    const seconds = Math.floor(diff / 1000);

    // Future dates or very small differences
    if (seconds < 60) {
      return '방금 전';
    }

    const minutes = Math.floor(seconds / 60);
    
    // "분 단위로 시간 차이가 나면 분" (If minute difference -> Minute)
    // We use this for 1 min <= diff < 60 mins
    if (minutes < 60) {
      return `${minutes}분 전`;
    }

    const hours = Math.floor(minutes / 60);

    // "시간 단위로 나면 시간" (If hour difference -> Hour)
    // We use this for 1 hour <= diff < 24 hours
    if (hours < 24) {
      return `${hours}시간 전`;
    }

    const days = Math.floor(hours / 24);

    // Although the prompt skipped "Day", it is standard to include it
    // for gaps between 24 hours and 1 month.
    // We assume "Month unit" starts roughly around 30 days.
    if (days < 30) {
      return `${days}일 전`;
    }

    const months = Math.floor(days / 30);

    // "달 단위로 나면 달" (If month difference -> Month)
    // We use this for 1 month <= diff < 12 months
    if (months < 12) {
      return `${months}달 전`;
    }

    const years = Math.floor(days / 365);

    // "년 단위로 나면 년" (If year difference -> Year)
    return `${years}년 전`;
  };

  return {
    formatTime
  };
}
