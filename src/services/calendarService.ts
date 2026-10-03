import { Interview } from '../types/job';

/**
 * Generates an official Google Calendar 1-click web event link with strict Asia/Kolkata timezone.
 */
export function generateGoogleCalendarUrl(interview: Interview): string {
  const start = new Date(interview.startTime);
  const end = new Date(interview.endTime);

  const formatIsoForGCal = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const datesParam = `${formatIsoForGCal(start)}/${formatIsoForGCal(end)}`;
  const title = encodeURIComponent(`${interview.role} Interview - ${interview.company}`);
  const details = encodeURIComponent(
    `Official Interview for ${interview.role} at ${interview.company}.\n` +
    `Interviewer: ${interview.interviewer}\n` +
    `Status: ${interview.status.toUpperCase()}\n\n` +
    `Meeting Video Link: ${interview.meetingUrl}\n` +
    `Organized via CareerMatch Verified Recruitment Gateway.`
  );
  const location = encodeURIComponent(interview.meetingUrl || interview.location);
  const timezone = encodeURIComponent(interview.timezone || 'Asia/Kolkata');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}&ctz=${timezone}`;
}

/**
 * Generates an RFC 5545 compliant .ics (iCalendar) file for download.
 */
export function generateIcsFileContent(interview: Interview): string {
  const start = new Date(interview.startTime);
  const end = new Date(interview.endTime);

  const formatIcsDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CareerMatch//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:interview-${interview.id}@careermatch.portal`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${interview.role} Interview with ${interview.company}`,
    `DESCRIPTION:Interview with ${interview.interviewer}. Meeting URL: ${interview.meetingUrl}`,
    `LOCATION:${interview.meetingUrl || interview.location}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers a browser download of the .ics calendar invitation.
 */
export function downloadIcsFile(interview: Interview) {
  const content = generateIcsFileContent(interview);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Interview_${interview.company.replace(/\s+/g, '_')}_${interview.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
