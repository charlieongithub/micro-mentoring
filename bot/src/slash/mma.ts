import {sessionData} from '../lib/util/request';
import {getUserProfilesBySkillName} from '../lib/user';
import {noMentorProfilesFoundTemplate, userProfileItemTemplate} from '../lib/templates/profile.template';
import {openView, sendMessageToSlackResponseURL} from '../lib/util/slack';
import {logSkillSearched} from '../lib/util/stats';
import * as querystring from 'querystring';
import {getSkillSearchPopupOptions, storeSearchPopupViewId} from '../lib/util/modals';
import {searchTemplate} from '../lib/templates/modal.template';

export const search = async (e) => {
    if (e.source === 'serverless-plugin-warmup') {
        console.log('lambda is warm');
        return;
    }

    const jsonBody = e.body;
    console.log('mma serverless logs: ', e.body);

    sessionData.slackTeamId = jsonBody['team_id'] as string;
    sessionData.slackUserId = jsonBody['user_id'] as string;

    let userProfiles;
    userProfiles = await getUserProfilesBySkillName(jsonBody.text);

    let userProfilesRenderedTemplates = new Array();

    console.log('user profiles', JSON.stringify(userProfiles));
    for (const profile of userProfiles) {

        console.log('building user profiles userProfileItemTemplate(profile, \'request-mentoring\', \'primary\')', JSON.stringify(profile), 'request-mentoring', null);

        userProfilesRenderedTemplates = userProfilesRenderedTemplates.concat(userProfileItemTemplate(profile, 'request-mentoring', null));
    }

    if (userProfilesRenderedTemplates.length > 0) {
        console.log('build templates', JSON.stringify(userProfilesRenderedTemplates));

        await sendMessageToSlackResponseURL(jsonBody.response_url, {
            'blocks': userProfilesRenderedTemplates
        });
    } else {
        console.log('no mentors found');

        await sendMessageToSlackResponseURL(jsonBody.response_url, noMentorProfilesFoundTemplate());
    }

    const searchPhrase = jsonBody.text === '' ? ' ' : jsonBody.text;

    await logSkillSearched(jsonBody.team_id, jsonBody.user_id, jsonBody.channel_id, jsonBody.channel_name, searchPhrase, userProfiles.length);
    return null;
};

export const searchOptions = async (e) => {
    if (e.source === 'serverless-plugin-warmup') {
        console.log('lambda is warm');
        return;
    }
    const jsonBody: any = querystring.parse(e.body);
    const payload = JSON.parse(jsonBody.payload);

    sessionData.slackTeamId = payload.team.id;
    sessionData.slackUserId = payload.user.id;

    const options = await getSkillSearchPopupOptions(payload.value);

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            options: options
        })
    };
};

export const searchWithModal = async (e) => {
    try {
        if (e.source === 'serverless-plugin-warmup') {
            console.log('lambda is warm');
            return;
        }

        const jsonBody = e.body;
        console.log('search by modal trigger id: ', e.body.trigger_id);

        sessionData.slackTeamId = jsonBody['team_id'] as string;
        sessionData.slackUserId = jsonBody['user_id'] as string;

        const viewResponse = await openView(sessionData.slackTeamId, searchTemplate(jsonBody.trigger_id));

        sessionData.searchModalViewId[`${sessionData.slackTeamId}#${sessionData.slackUserId}`] = JSON.parse(viewResponse).view.id;

        const store = await storeSearchPopupViewId(sessionData.slackTeamId, sessionData.slackUserId, JSON.parse(viewResponse).view.id);

        console.log('store returned', JSON.stringify(store));

        console.log('view response', JSON.stringify(viewResponse));

        console.log('searchPopupViewId', sessionData.searchModalViewId[`${sessionData.slackTeamId}#${sessionData.slackUserId}`]);
    } catch (e) {
        console.log('error occurred while opening the search modal', JSON.stringify(e))
    }
};