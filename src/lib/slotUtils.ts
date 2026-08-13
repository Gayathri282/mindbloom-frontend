import { AvailabilitySlot } from './types';

/**
 * Parses slot date string and start time string into a native Date object.
 * e.g. dateStr: "2026-08-13" or "Today" or "Thu, Aug 13"
 * e.g. timeStr: "10:00" or "10:00 AM - 10:50 AM"
 */
export function parseSlotDateTime(dateStr: string, timeStr?: string): Date {
  const now = new Date();
  let baseDate = new Date();

  const dayLower = (dateStr || '').toLowerCase().trim();

  if (dayLower === 'today' || !dateStr) {
    baseDate = new Date();
  } else if (dayLower === 'tomorrow') {
    baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1);
  } else if (dayLower === 'yesterday') {
    baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 1);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    baseDate = new Date(y, m - 1, d);
  } else {
    const timestamp = Date.parse(dateStr);
    if (!isNaN(timestamp)) {
      baseDate = new Date(timestamp);
    }
  }

  // Parse time component if provided
  if (timeStr) {
    // Check for 24-hour format "10:00"
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [h, m] = timeStr.split(':').map(Number);
      baseDate.setHours(h, m, 0, 0);
      return baseDate;
    }

    // Extract start time part from range like "10:00 AM - 10:50 AM"
    const startPart = timeStr.split('-')[0]?.trim();
    if (startPart) {
      const match = startPart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        baseDate.setHours(hours, minutes, 0, 0);
        return baseDate;
      }
    }
  }

  return baseDate;
}

/**
 * Checks if an availability slot has passed (is expired).
 */
export function isSlotExpired(slot: Partial<AvailabilitySlot>): boolean {
  if (!slot) return true;
  const now = new Date();

  // 1. Check ISO start_time if present
  if (slot.start_time) {
    const startTimeDate = new Date(slot.start_time);
    if (!isNaN(startTimeDate.getTime())) {
      // 5 minute grace buffer for active slot joins
      if (startTimeDate.getTime() + 5 * 60 * 1000 < now.getTime()) {
        return true;
      }
      return false;
    }
  }

  // 2. Fall back to parsing day_label and time_label
  if (slot.day_label) {
    const parsedDate = parseSlotDateTime(slot.day_label, slot.time_label);
    if (parsedDate.getTime() + 5 * 60 * 1000 < now.getTime()) {
      return true;
    }
  }

  return false;
}
