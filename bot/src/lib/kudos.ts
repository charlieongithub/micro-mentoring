import * as Bot from './bot';
import {
    cantAddPayloadTemplate, cantAddSkillTemplate,
    cantDeleteKudosTemplate, cantGiveKudosTemplate, getKudosButtonClickedTemplate, kudosGivenTemplate,
    selfLoveTemplate
} from './templates/kudos.template';
import {Kudos, stripChars} from './bot';
import {WebClient} from '@slack/web-api';
import {addUser, fetchUserBySlackId} from './user';
import {
    getAccessToken,
    getUsersInfo, inviteToKudosChannel,
    parseText,
    sendMessageToSlackResponseURL
} from './util/slack';
import {addSkillAndKudosToUserProfile, getUserSkill, updateUserSkillStatus} from './skills';
import {
    skillNotReactivatedTemplate,
    skillReactivatedTemplate
} from './templates/profile.template';
import {requestWithJWTHeader} from './util/request';
import {CONFIG} from '../config';

export const iKnowAboutCmd = async (web, jsonBody) => {
    try {
        const sourceUserId: string = jsonBody['user_id'] as string;
        let userImage: string;
        const teamId = jsonBody['team_id'] as string;
        const user = await fetchUserBySlackId(sourceUserId);
        const slackUser = await getUsersInfo(sourceUserId, teamId);
        const skillName = stripChars(jsonBody.text);
        console.log('slack user payload', JSON.stringify(slackUser));

        const invitePayload = await inviteToKudosChannel(teamId, sourceUserId, (CONFIG as any).KUDOS_CHANNEL_ID);
        console.log('user invited to channel payload', JSON.stringify(invitePayload));

        if (user.id) {
            console.log('user exists', JSON.stringify(user));

            const userSkill = await getUserSkill(sourceUserId, skillName);

            console.log('userSkill', JSON.stringify(userSkill));
            if (userSkill) {
                console.log('skill exists, reactivating', userSkill);

                await updateUserSkillStatusCmd(jsonBody, sourceUserId, skillName, true, {
                    success: skillReactivatedTemplate(),
                    failure: skillNotReactivatedTemplate()
                });

                return;
            } else {
                console.log('skill does not exist adding it to user');

                await addSkillAndKudosToUserProfile(teamId, slackUser.user.profile.email, sourceUserId, sourceUserId, skillName, true);
            }

            userImage = user.image;
        } else {
            console.log('user does not exist. create user, add skill');

            const addUserPayload = await addUser(sourceUserId, slackUser.user.real_name, slackUser.user.profile['image_512'], slackUser.user.profile.email);
            console.log('addUserPayload', JSON.stringify(addUserPayload));

            await addSkillAndKudosToUserProfile(teamId, slackUser.user.profile.email, sourceUserId, sourceUserId, skillName, true);

            userImage =  addUserPayload.user.image;
        }

        await Bot.postSkillAddedConfirmationToMentor(web, sourceUserId, skillName);

        await Bot.postKudosToChannel(web, sourceUserId, sourceUserId, skillName, userImage);
    } catch (e) {
        console.log('exception occurred', JSON.stringify(e));
        await sendMessageToSlackResponseURL(jsonBody.response_url, cantAddSkillTemplate());

        return null;
    }
};

export const kudosCmd = async (web, jsonBody, token) => {
    const skillAndMentor: Kudos = parseText(jsonBody.text);

    try {
        const teamId = jsonBody['team_id'] as string;
        const sourceUserId: string = jsonBody['user_id'] as string;
        let userImage: string;
        console.debug('body parsed and stringified', JSON.stringify(jsonBody));

        if (sourceUserId === skillAndMentor.userId) {
            await sendMessageToSlackResponseURL(jsonBody.response_url, selfLoveTemplate());
            return;
        }

        const user = await fetchUserBySlackId(skillAndMentor.userId);
        const slackUser = await getUsersInfo(skillAndMentor.userId, teamId);
        console.log('slack user payload', JSON.stringify(slackUser));

        const invitePayload = await inviteToKudosChannel(teamId, skillAndMentor.userId, (CONFIG as any).KUDOS_CHANNEL_ID);
        console.log('user invited to channel payload', JSON.stringify(invitePayload));

        if (user.id) {
            console.log('user exists', JSON.stringify(user));
            const userSkill = await getUserSkill(skillAndMentor.userId, skillAndMentor.skillName);

            console.log('userSkill', JSON.stringify(userSkill));
            if (userSkill) {
                const isSkillActive = userSkill.skills[0] && userSkill.skills[0].userSkill.active;
                console.log('skill exists giving kudos', JSON.stringify(userSkill.skills[0].userSkill));
                await addKudosForUser(teamId, sourceUserId, skillAndMentor.userId, skillAndMentor.skillName);

                await Bot.postKudosGivenTo(web, `<@${sourceUserId}>`, `<@${skillAndMentor.userId}>`, skillAndMentor.skillName);

                if (!isSkillActive) {
                    await Bot.postGaveYouKudosForInactiveSkill(web, sourceUserId, skillAndMentor.userId, skillAndMentor.skillName, token);
                }
            } else {
                await addSkillAndKudosToUserProfile(teamId, user.email, skillAndMentor.userId, sourceUserId, skillAndMentor.skillName, false);
                await Bot.postGaveYouKudosForNewSkill(web, sourceUserId, skillAndMentor.userId, skillAndMentor.skillName, token);
            }

            userImage = user.image;
        } else {
            console.log('user does not exist. create user, add skill und kudos');

            // create user
            const addUserPayload = await addUser(skillAndMentor.userId, slackUser.user.real_name, slackUser.user.profile['image_512'], slackUser.user.profile.email);
            console.log('addUserPayload', JSON.stringify(addUserPayload));

            await addSkillAndKudosToUserProfile(teamId, slackUser.user.profile.email, skillAndMentor.userId, sourceUserId, skillAndMentor.skillName, false);

            userImage =  addUserPayload.user.image;
            await Bot.postGaveYouKudosForNewSkill(web, sourceUserId, skillAndMentor.userId, skillAndMentor.skillName, token);
        }

        await Bot.postKudosToChannel(web, sourceUserId, skillAndMentor.userId, skillAndMentor.skillName, userImage);

        await sendMessageToSlackResponseURL(jsonBody.response_url, kudosGivenTemplate(skillAndMentor.userId, skillAndMentor.skillName));
    } catch (e) {
        console.log('exception occurred', JSON.stringify(e));
        await sendMessageToSlackResponseURL(jsonBody.response_url, cantGiveKudosTemplate(e, skillAndMentor));

        return null;
    }
};

export const addKudosForUser = async (teamId: string, sourceUserId: string, userId: string, skillName: string): Promise<any> => {
    const options = {
        method: 'POST',
        uri: `${CONFIG.REST_API_URL}/user/${userId}/skills/${skillName}/kudos`,
        body: {
            from: sourceUserId
        },
        json: true
    };

    return requestWithJWTHeader(options);
};

export const deleteKudosForUser = async (userId: string, skillName: string) => {
    const options = {
        method: 'DELETE',
        uri: `${CONFIG.REST_API_URL}/user/${userId}/skills/${skillName}/kudos`,
        json: true
    };

    return requestWithJWTHeader(options);
};

export const deleteKudosAction = async (json, action) => {
    const skillName = action['action_id'].split('#')[1];
    const userId = json.user.id;
    const message = {
        'text': `The kudos for: ${skillName} has been deleted from your profile`,
        'replace_original': false
    };

    console.log('deleteKudosAction called', userId, skillName);

    const deleteKudosPayload = await deleteKudosForUser(userId, skillName);

    console.log('delete kudos for user payload', JSON.stringify(deleteKudosPayload));

    if (deleteKudosPayload.statusCode !== 500) {
        await sendMessageToSlackResponseURL(json.response_url, message);
    } else {
        await sendMessageToSlackResponseURL(json.response_url, cantDeleteKudosTemplate(skillName));
    }
};

export const giveKudosAction = async (actionJSONPayload) => {
    console.log('handleActions payload', JSON.stringify(actionJSONPayload));
    console.log('handleActions user', JSON.stringify(actionJSONPayload.user));
    console.log('handleActions actions', JSON.stringify(actionJSONPayload.actions));
    const value = actionJSONPayload.actions[0].value.split('#');

    try {
        if (actionJSONPayload.user.id ===  value[2]) {
            await sendMessageToSlackResponseURL(actionJSONPayload.response_url, selfLoveTemplate());

            return;
        }

        const invitePayload = await inviteToKudosChannel(actionJSONPayload.team.id, actionJSONPayload.user.id, (CONFIG as any).KUDOS_CHANNEL_ID);
        console.log('user invited to channel payload', JSON.stringify(invitePayload));

        if (actionJSONPayload.actions[0] && actionJSONPayload.actions[0].value.indexOf('mma-kudos') !== -1) {

            const sourceUser = await fetchUserBySlackId(actionJSONPayload.user.id);
            if (!sourceUser.id) {
                console.log('source user does not exist, adding user', actionJSONPayload.user.id, actionJSONPayload.user.name);
                const slackUser = await getUsersInfo(actionJSONPayload.user.id, actionJSONPayload.team.id);
                // if user who wants to give kudos doesn't exist
                await addUser(actionJSONPayload.user.id, actionJSONPayload.user.name, slackUser.user.profile['image_512'], slackUser.user.profile.email);
            }

            const token = await getAccessToken(actionJSONPayload.team.id as string);
            const web = new WebClient(token.botAccessToken);

            console.log('addKudosForUser', actionJSONPayload.user.id, value[2], value[3]);
            const kudos = await addKudosForUser(actionJSONPayload.team.id as string, actionJSONPayload.user.id, value[2], value[3]);

            console.log('added kudos for user payload', JSON.stringify(kudos));

            console.log('kudosgiventopayload', `<@${actionJSONPayload.user.id}>`, `<@${value[2]}>`, value[3]);

            await Bot.postKudosGivenTo(web, `<@${actionJSONPayload.user.id}>`, `<@${value[2]}>`, value[3]);
        }

        await sendMessageToSlackResponseURL(actionJSONPayload.response_url, getKudosButtonClickedTemplate());
    } catch (e) {
        await sendMessageToSlackResponseURL(actionJSONPayload.response_url, cantAddPayloadTemplate(value[2], value[3]));
    }
};

export const updateUserSkillStatusCmd = async (jsonBody, sourceUserId, skillName, status, responses) => {
    skillName = skillName || jsonBody.text;

    console.log('updateUserSkillStatusCmd', sourceUserId, skillName, status);

    const skillStatusPayload = await updateUserSkillStatus(sourceUserId, skillName, status);

    if (skillStatusPayload.statusCode !== 500) {
        await sendMessageToSlackResponseURL(jsonBody.response_url, responses.success);
    } else {
        await sendMessageToSlackResponseURL(jsonBody.response_url, responses.failure);
    }

    return null;
};