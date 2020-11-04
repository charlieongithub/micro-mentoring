import {CONFIG} from '../../config';

const {BitlyClient} = require('bitly');
const bitly = new BitlyClient(CONFIG.BITLY_TOKEN, {});

export const getBitlyLink = async (url: string) => {
    return await bitly.shorten(url);
};

export const getGoogleCalendarLink = (mentor: string, skillName: string) => {
    const title = `Let's talk about ${skillName}`.replace('&', '%26');
    const details = `I have some questions about ${skillName}`.replace('&', '%26');
    // replace + with %2b for google calendar compatibility
    mentor = mentor.replace('+', '%2b');

    return `https://calendar.google.com/calendar/r/eventedit?sf=true&output=xml&text=${title}&details=${details}&add=${mentor}`;
};

export const getShortenedGoogleCalendarLink = async (mentor: string, skillName: string) => {
    const calendarLink: string = await getGoogleCalendarLink(mentor, skillName);
    console.log('calendarLink', calendarLink);
    const bitlyLink: any = await getBitlyLink(calendarLink);

    return bitlyLink.url;
};
