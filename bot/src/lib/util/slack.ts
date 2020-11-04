import * as Tokens from './tokens';
import * as rp from 'request-promise';
import {Kudos, stripChars} from '../bot';
import {WebClient} from '@slack/web-api';

export const sendMessageToSlackResponseURL = (responseURL, JSONmessage) => {
    const postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage
    };

    return rp(postOptions);
};

export const getPresence = async (teamId: string, userId: string) => {
    const token = await getAccessToken(teamId);
    const web = new WebClient(token.botAccessToken);

    return web.users.getPresence({
       user: userId
    });
};

export const conversationsOpen = async (teamId: string, users: string) => {
    const token = await getAccessToken(teamId);
    const web = new WebClient(token.botAccessToken);

    return web.conversations.open({
        users: users
    });
};

export const conversationsJoin = async (teamId: string, channel: string) => {
    const token = await getAccessToken(teamId);
    const web = new WebClient(token.botAccessToken);

    return web.conversations.open({
        channel: channel
    });
};

export const updateAppHome = async (teamId: string, viewPayload: any, targetUserId) => {
    const data: any = await Tokens.retrieve(teamId);

    const postOptions = {
        uri: `https://slack.com/api/views.publish`,
        method: 'POST',
        form: {
            token: data.botAccessToken,
            view: JSON.stringify(viewPayload),
            user_id: targetUserId
        }
    };

    return rp(postOptions);
};

export const getAppHomeLink = async (botAccessToken: string, tab: string) => {
    const botUserPayload = await rp({
        uri: `https://slack.com/api/auth.test`,
        method: 'POST',
        form: {
            token: botAccessToken
        },
        json: true
    });

    const botsInfoPayload = await rp({
        uri: `https://slack.com/api/bots.info`,
        method: 'POST',
        form: {
            token: botAccessToken,
            bot: botUserPayload.bot_id
        },
        json: true
    });

    return `slack://app?team=${botUserPayload.team_id}&id=${botsInfoPayload.bot.app_id}${ tab ? `&tab=${tab}` : ''}`;
};

export const getPermalink = async (teamId: string, channel: string, messageTs: string) => {
    const data: any = await Tokens.retrieve(teamId);

    const postOptions = {
        uri: `https://slack.com/api/chat.getPermalink`,
        method: 'POST',
        form: {
            token: data.botAccessToken,
            message_ts: messageTs,
            channel: channel
        },
        json: true
    };

    return rp(postOptions);
};

export const inviteToKudosChannel = async (teamId: string, userId: string, kudosChannelId: string) => {
    const data: any = await Tokens.retrieve(teamId);

    const postOptions = {
        uri: `https://slack.com/api/conversations.invite`,
        method: 'POST',
        form: {
            token: data.botAccessToken,
            channel: kudosChannelId,
            users: userId
        },
        json: true
    };

    return rp(postOptions);
};

export const openView = async (teamId: string, viewPayload: any) => {
    const data: any = await Tokens.retrieve(teamId);

    const postOptions = {
        uri: `https://slack.com/api/views.open`,
        method: 'POST',
        form: {
            token: data.botAccessToken,
            view: JSON.stringify(viewPayload.view),
            trigger_id: viewPayload.trigger_id
        }
    };

    return rp(postOptions);
};

export const updateView = async (teamId: string, viewId: string, viewPayload: any) => {
    const data: any = await Tokens.retrieve(teamId);

    const postOptions = {
        uri: `https://slack.com/api/views.update`,
        method: 'POST',
        form: {
            token: data.botAccessToken,
            view_id: viewId,
            view: JSON.stringify(viewPayload)
        }
    };

    return rp(postOptions);
};

export const getUsersInfo = async (userId: string, teamId: string): Promise<any> => {
    const data: any = await Tokens.retrieve(teamId);

    console.log('dynamodb usersData', data);

    const options = {
        method: 'GET',
        uri: `https://slack.com/api/users.info?token=${data.accessToken}&user=${userId}&pretty=1`,
        json: true
    };

    return rp(options);
};

export const getAccessToken = async (teamId: string): Promise<any> => {
    return Tokens.retrieve(teamId);
};

export const parseText = (text): Kudos => {
    try {
        const matches = text.match(/<@(.{4,11})\|.*>\s*(.*)/);

        return {
            userId:  matches && matches.length > 0 ? matches[1] : '',
            skillName: matches && matches.length > 1 ? stripChars(matches[2]) : ''
        }
    } catch (e) {
        throw new Error('Could not match user and skill name ' + e.Message);
    }
};