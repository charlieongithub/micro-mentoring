import {getRandomUserProfilesBySkillName} from '../lib/user';
import {startConversationTemplate} from '../lib/templates/lotto.template';
import {getPresence, sendMessageToSlackResponseURL} from '../lib/util/slack';
import {sessionData} from '../lib/util/request';

export const handler = async (e) => {
    const jsonBody = e.body;

    console.log('lotto jsonbody', JSON.stringify(jsonBody));

    sessionData.slackTeamId = jsonBody['team_id'] as string;
    sessionData.slackUserId = jsonBody['user_id'] as string;

    await lotto(jsonBody.response_url, true);
};

export const lotto = async (responseUrl, replaceOriginal: boolean) => {

    const isUserPresent = async (teamId: string, userId: string) => {
        const payload = await getPresence(teamId, userId);

        return payload.presence === 'active';
    };

    const userProfiles = await getRandomUserProfilesBySkillName('');

    let mentorUserId = '';
    for (const user of userProfiles) {
        if (user.userId !== sessionData.slackUserId) {
            mentorUserId = user.userId;

            console.log('getting users', JSON.stringify(user), 'presence');
            if (await isUserPresent(sessionData.slackTeamId, mentorUserId)) {
                console.log('user', mentorUserId, 'active - breaking loop');
                break;
            }
        }
    }

    const conversationRecommendationTemplate = await startConversationTemplate(sessionData.slackUserId, mentorUserId, replaceOriginal);

    console.log('recommendation template', JSON.stringify(conversationRecommendationTemplate));

    const postPayload  = await sendMessageToSlackResponseURL(responseUrl, conversationRecommendationTemplate);

    console.log('postPayload', postPayload);
};