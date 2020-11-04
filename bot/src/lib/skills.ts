import {requestWithJWTHeader} from './util/request';
import {CONFIG} from '../config';
import {getShortenedGoogleCalendarLink} from './util/calendar';
import {addKudosForUser} from './kudos';

export const addSkillForUser = async (userId: string, skillName: string, status: boolean, meetingLink: string): Promise<any> => {
    const options = {
        method: 'POST',
        uri: `${CONFIG.REST_API_URL}/user/${userId}/skills`,
        body: {
            skillName: skillName.toLocaleLowerCase(),
            active: status ? 1 : 0,
            meetingLink: meetingLink
        },
        json: true
    };

    const skill = await getSkill(skillName);

    if (!skill) {
        console.log('adding a new skill to global database', skillName);
        const addSkillToUserPayload = await addSkill(skillName);

        if (addSkillToUserPayload.statusCode === 500) {
            throw new Error(`Could not add skill for user. ${addSkillToUserPayload.message}`);
        }

        console.log('addSkill(skillName) payload', JSON.stringify(addSkillToUserPayload));
    }

    return requestWithJWTHeader(options);
};

export const getSkill = async (title: string): Promise<any> => {
    const options = {
        method: 'GET',
        uri: `${CONFIG.REST_API_URL}/skills/${title.toLocaleLowerCase()}`,
        json: true
    };

    return requestWithJWTHeader(options);
};

export const getSkillsByName = async (title: string): Promise<any> => {
    const options = {
        method: 'GET',
        uri: `${CONFIG.REST_API_URL}/skills/options/${title.toLocaleLowerCase()}`,
        json: true
    };

    return requestWithJWTHeader(options);
};

export const addSkill = async (skillName: string): Promise<any> => {
    const options = {
        method: 'POST',
        uri: `${CONFIG.REST_API_URL}/skills`,
        body: {
            title: skillName.toLocaleLowerCase()
        },
        json: true
    };

    return requestWithJWTHeader(options);
};

export const getUserSkill = async (userId: string, skillName: string): Promise<any> => {
    const options = {
        method: 'GET',
        uri: `${CONFIG.REST_API_URL}/user/${userId}/skills/${skillName.toLocaleLowerCase()}`,
        json: true
    };

    return requestWithJWTHeader(options);
};

export const updateUserSkillStatus = async (userId: string, skillName: string, status: boolean): Promise<any> => {
    const options = {
        method: 'PUT',
        uri: `${CONFIG.REST_API_URL}/user/${userId}/skills/${skillName}/update`,
        body: {
            status: status
        },
        json: true
    };

    return requestWithJWTHeader(options);
};

export const addSkillAndKudosToUserProfile = async (teamId: string, targetUserEmail: string, targetUserId: string, sourceUserId: string, skillName: string, skillStatus: boolean) => {
    const meetingLink = await getShortenedGoogleCalendarLink(targetUserEmail, skillName);

    const addSkillForUserPayload = await addSkillForUser(targetUserId, skillName, skillStatus, meetingLink);
    console.log('addSkillForUser payload', JSON.stringify(addSkillForUserPayload));

    return addKudosForUser(teamId, sourceUserId, targetUserId, skillName);
};
