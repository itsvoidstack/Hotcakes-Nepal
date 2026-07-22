export interface OpeningHourDay {
  openTime: string; // "HH:MM" 24h format
  closeTime: string; // "HH:MM" 24h format
  isClosed: boolean;
}

export interface OpeningHours {
  monday: OpeningHourDay;
  tuesday: OpeningHourDay;
  wednesday: OpeningHourDay;
  thursday: OpeningHourDay;
  friday: OpeningHourDay;
  saturday: OpeningHourDay;
  sunday: OpeningHourDay;
}

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { openTime: '08:00', closeTime: '20:00', isClosed: false },
  tuesday: { openTime: '08:00', closeTime: '20:00', isClosed: false },
  wednesday: { openTime: '08:00', closeTime: '20:00', isClosed: false },
  thursday: { openTime: '08:00', closeTime: '20:00', isClosed: false },
  friday: { openTime: '08:00', closeTime: '20:00', isClosed: false },
  saturday: { openTime: '08:00', closeTime: '20:00', isClosed: false },
  sunday: { openTime: '08:00', closeTime: '20:00', isClosed: false },
};

export const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export type DayName = typeof DAY_NAMES[number];

// Helper to format time into "H:MM AM/PM" format
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minStr = m < 10 ? `0${m}` : m;
  return `${hour12}:${minStr} ${ampm}`;
}

// Helper to format a day's hours into display text e.g. "8:00 AM – 8:00 PM"
export function formatDayHours(dayHours: OpeningHourDay): string {
  if (dayHours.isClosed) return 'Closed';
  return `${formatTime12h(dayHours.openTime)} – ${formatTime12h(dayHours.closeTime)}`;
}

// Helper to get local Kathmandu time
export function getKathmanduTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 345 * 60000); // Kathmandu is UTC + 5:45 (345 minutes)
}

export interface StatusInfo {
  isOpen: boolean;
  statusText: string; // "Open Now • Closes at X", "Closed • Opens at X", etc.
  todayHoursText: string;
}

// Computes the dynamic open/closed status
export function getOpeningHoursStatus(
  hours: OpeningHours | null | undefined,
  manualOpenStatus: boolean
): StatusInfo {
  const activeHours = hours || DEFAULT_OPENING_HOURS;
  
  const kTime = getKathmanduTime();
  const dayIdx = kTime.getDay();
  const currentDay = DAY_NAMES[dayIdx];
  const todayHours = activeHours[currentDay] || DEFAULT_OPENING_HOURS[currentDay];
  const todayHoursText = formatDayHours(todayHours);

  // 1. If the manual open_status is false, we are closed
  if (!manualOpenStatus) {
    return {
      isOpen: false,
      statusText: 'Closed',
      todayHoursText
    };
  }

  const currentMinutes = kTime.getHours() * 60 + kTime.getMinutes();

  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Find when it opens next if closed
  const getNextOpenTimeText = (startOffset = 0): string => {
    for (let i = startOffset; i <= 7; i++) {
      const nextIdx = (dayIdx + i) % 7;
      const nextDayName = DAY_NAMES[nextIdx];
      const nextHours = activeHours[nextDayName] || DEFAULT_OPENING_HOURS[nextDayName];
      if (!nextHours.isClosed) {
        const timeFormatted = formatTime12h(nextHours.openTime);
        if (i === 0) {
          return `Opens at ${timeFormatted}`;
        } else if (i === 1) {
          return `Opens tomorrow at ${timeFormatted}`;
        } else {
          const capitalizedDay = nextDayName.charAt(0).toUpperCase() + nextDayName.slice(1);
          return `Opens ${capitalizedDay} at ${timeFormatted}`;
        }
      }
    }
    return 'Closed';
  };

  // If today is closed
  if (todayHours.isClosed) {
    return {
      isOpen: false,
      statusText: `Closed • ${getNextOpenTimeText(1)}`,
      todayHoursText
    };
  }

  const openMinutes = parseTimeToMinutes(todayHours.openTime);
  const closeMinutes = parseTimeToMinutes(todayHours.closeTime);

  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      statusText: `Closed • ${getNextOpenTimeText(0)}`,
      todayHoursText
    };
  } else if (currentMinutes >= closeMinutes) {
    return {
      isOpen: false,
      statusText: `Closed • ${getNextOpenTimeText(1)}`,
      todayHoursText
    };
  } else {
    return {
      isOpen: true,
      statusText: `Open Now • Closes at ${formatTime12h(todayHours.closeTime)}`,
      todayHoursText
    };
  }
}
