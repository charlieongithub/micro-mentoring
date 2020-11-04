import * as rp from 'request-promise';
import {getToken} from './auth';

export const sessionData = {
    slackUserId: '',
    slackTeamId: '',
    searchModalViewId: {}
};

export const requestWithJWTHeader = (options: any) => {
    let token: string;
    if (!options.headers) {
        options.headers = {};
    }

    token = getToken({
        slackUserId: sessionData.slackUserId,
        slackTeamId: sessionData.slackTeamId
    });


    options.headers.Authorization = `Bearer: ${token}`;

    return rp(options);
};