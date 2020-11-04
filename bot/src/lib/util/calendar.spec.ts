import {getBitlyLink, getGoogleCalendarLink} from './calendar';
import {getMentorRecommendationBlockTemplate} from '../templates/kudos.template';

describe('calendar util', () => {
   test('should return a valid calendar link', async () => {
      const calendarLink: string = await getGoogleCalendarLink('example@example.com', '3d printing');
      console.log('calendarLink', calendarLink);
      const bitlyLink: any = await getBitlyLink(calendarLink);

      console.log('bitlylink', bitlyLink);

      expect(bitlyLink.url).not.toBeNull();
   });

   test('Should create a slack payload template', async () => {
      const payload = await getMentorRecommendationBlockTemplate('Example', '3d printers');

      console.log('payload', payload);

      expect(payload).toBe({});
   });
});
