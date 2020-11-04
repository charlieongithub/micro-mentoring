import {sessionData} from '../lib/util/request';
import {getAccessToken} from '../lib/util/slack';
import {WebClient} from '@slack/web-api';
import {iKnowAboutCmd, kudosCmd} from '../lib/kudos';
import {logKudosCalled} from '../lib/util/stats';

export const give = async (e) => {
    if (e.source === 'serverless-plugin-warmup') {
        console.log('lambda is warm');
        return;
    }

    const jsonBody = e.body;
    console.log('Kudos serverless logs: ', e.body);

    sessionData.slackTeamId = jsonBody['team_id'] as string;
    sessionData.slackUserId = jsonBody['user_id'] as string;

    const token = await getAccessToken(jsonBody['team_id'] as string);
    const web = new WebClient(token.botAccessToken);

    await kudosCmd(web, jsonBody, token.botAccessToken);
    await logKudosCalled(jsonBody);
};

export const iKnowAbout = async(e) => {
    if (e.source === 'serverless-plugin-warmup') {
        console.log('lambda is warm');
        return;
    }

    const jsonBody = e.body;
    console.log('iKnowAbout serverless logs: ', e.body);

    sessionData.slackTeamId = jsonBody['team_id'] as string;
    sessionData.slackUserId = jsonBody['user_id'] as string;

    console.log('session data', JSON.stringify(sessionData));

    const token = await getAccessToken(jsonBody['team_id'] as string);
    const web = new WebClient(token.botAccessToken);

    await iKnowAboutCmd(web, jsonBody);
    await logKudosCalled(jsonBody);
};