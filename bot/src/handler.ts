import * as Tokens from './lib/util/tokens';
import {WebClient} from '@slack/web-api';
import {sessionData} from './lib/util/request';
import * as querystring from 'querystring';
import {CONFIG} from './config';
import {getAppInstallTemplate} from './lib/templates/slack.template';
import {logButtonClicked} from './lib/util/stats';
import {actionsHandler} from './lib/actions';
import {handleEvent} from './lib/events';

export const install = async () => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html'
        },
        body: getAppInstallTemplate((CONFIG as any).CLIENT_ID)
    }
};

export const authorized = async (event) => {
    const args = {
        client_id: CONFIG.CLIENT_ID,
        client_secret: CONFIG.CLIENT_SECRET,
        code: event.queryStringParameters.code
    } as any;

    console.log('authorized called', JSON.stringify(event), args, JSON.stringify(args));
    const oauthPayload = await (new WebClient()).oauth.v2.access(args);

    console.log('oauthPayload', JSON.stringify(oauthPayload));

    const storePayload = await Tokens.store((oauthPayload as any).team.id, (oauthPayload as any).access_token, (oauthPayload as any).authed_user.access_token);

    console.log('tokens store payload', JSON.stringify(storePayload));
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html'
        },
        body: 'authorized'
    };
};

export const event = async (event, context, callback) => {
    try {
        if (event.source === 'serverless-plugin-warmup') {
            console.log('lambda is warm');
            return;
        }
        const response = {
            statusCode: 200
        };

        const jsonBody = event.body;

        console.log('event payload', JSON.stringify(jsonBody));

        switch (jsonBody.type) {
            case 'url_verification':
                (response as any).headers = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                };
                (response as any).body = jsonBody.challenge;
                break;
            case 'event_callback':
                const tokens: any = await Tokens.retrieve(jsonBody.team_id)
                await handleEvent(jsonBody, tokens.botAccessToken);

                break;
        }

        callback(null, response);
    } catch (ex) {
        console.log('Exception occurred while handling event', JSON.stringify(ex));

    }
};


export const handleActions = async (e, context, callback) => {
    try {
        if (e.source === 'serverless-plugin-warmup') {
            console.log('lambda is warm');
            return;
        }

        const jsonBody: any = querystring.parse(e.body);
        console.log('handleActions body', JSON.stringify(jsonBody));

        const actionJSONPayload = JSON.parse(jsonBody.payload);
        const userId = actionJSONPayload.user.id;

        sessionData.slackTeamId = actionJSONPayload.team.id;
        sessionData.slackUserId = userId;

        await actionsHandler(actionJSONPayload, callback);

        await logButtonClicked(actionJSONPayload);
    } catch (ex) {
        console.log('Exception occurred while handling action', JSON.stringify(ex));
    }
};