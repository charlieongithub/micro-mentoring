import {sessionData} from './util/request';
import {conversationsOpen, getAccessToken, sendMessageToSlackResponseURL} from './util/slack';
import {postIntroductionTemplate} from './bot';
import {WebClient} from '@slack/web-api';
import {conversationStartedTemplate} from './templates/lotto.template';

export const startConversation = async (mentee: string , mentor: string, responseUrl) => {
    console.log('start conversation', mentee, mentor, sessionData.slackTeamId);

    const token = await getAccessToken(sessionData.slackTeamId);
    const web = new WebClient(token.botAccessToken);

    const conversationPayload: any = await conversationsOpen(sessionData.slackTeamId, `${mentee},${mentor}`);

    console.log('conversation payload', JSON.stringify(conversationPayload));

    await postIntroductionTemplate(web, conversationPayload.channel.id, mentor);

    await sendMessageToSlackResponseURL(responseUrl, conversationStartedTemplate());
};