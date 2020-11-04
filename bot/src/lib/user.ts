import {requestWithJWTHeader} from './util/request';
import {CONFIG} from '../config';

export const addUser = (userId: string, realName: string, image: string, email: string): Promise<any> => {
    const options = {
        method: 'POST',
        uri: `${CONFIG.REST_API_URL}/users`,
        body: {
            userId: userId,
            realName: realName,
            image: image,
            email: email
        },
        json: true
    };

    return requestWithJWTHeader(options);
};

export const updateUser = (profile): Promise<any> => {
    const options = {
        method: 'PUT',
        uri: `${CONFIG.REST_API_URL}/user/${profile.userId}`,
        body: {
            realName: profile.realName,
            image: profile.image,
            email: profile.email,
            active: profile.active
        },
        json: true
    };

    return requestWithJWTHeader(options);
};

export const fetchUserBySlackId = async (userId: string): Promise<any> => {
    const options = {
        method: 'GET',
        uri: `${CONFIG.REST_API_URL}/user/${userId}`,
        json: true
    };

    return requestWithJWTHeader(options);
};

export const getUsers = async (): Promise<any> => {
    const options = {
        method: 'GET',
        uri: `${CONFIG.REST_API_URL}/users`,
        json: true
    };

    return requestWithJWTHeader(options);
};

export const getUserProfile = async (userId: string): Promise<any> => {
    const options = {
        method: 'GET',
        uri: `${CONFIG.REST_API_URL}/kudos/user/${userId}`,
        json: true
    };

    return requestWithJWTHeader(options);
};

export const getUserProfiles = async (): Promise<any> => {
    const options = {
        method: 'GET',
        uri: `${CONFIG.REST_API_URL}/users/kudos`,
        json: true
    };

    return requestWithJWTHeader(options);
};

export const getUserProfilesBySkillName = async (skill: string): Promise<any> => {
    const options = {
        method: 'GET',
        uri: `${CONFIG.REST_API_URL}/users/${skill}/kudos`,
        json: true
    };

    return requestWithJWTHeader(options);
};

export const getRandomUserProfilesBySkillName = async (skill: string): Promise<any> => {
    const options = {
        method: 'GET',
        uri: `${CONFIG.REST_API_URL}/users/${skill}/kudos/random`,
        json: true
    };

    return requestWithJWTHeader(options);
};