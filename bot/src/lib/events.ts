import * as Bot from './bot';
import {sessionData} from './util/request';
import {fetchUserBySlackId, getUserProfiles, updateUser} from './user';
import {WebClient} from '@slack/web-api';
import {onboardingTemplate} from './templates/app-home.template';
import {updateAppHome} from './util/slack';
import {createSkillsMap, isPrivateConversation, isQuestionFromUser} from './bot';

export const handleEvent = async (body, token) => {
    switch (body.event.type) {
        case 'message':
            console.log('body', JSON.stringify(body));

            if (!isQuestionFromUser(body.event) || isPrivateConversation(body.event)) {
                return;
            }

            sessionData.slackTeamId = body['team_id'] as string;
            sessionData.slackUserId = body.event.user;

            const userProfiles = await getUserProfiles();

            console.log('user profiles', JSON.stringify(userProfiles));
            const expressions = new Map(createSkillsMap(userProfiles));

            const web = new WebClient(token);
            await Bot.processMessage(body, web, expressions);
            break;
        case 'app_home_opened':
            console.log('body', JSON.stringify(body));

            sessionData.slackTeamId = body['team_id'] as string;
            sessionData.slackUserId = body.event.user;

            const onBoardingTemlatePayload = await onboardingTemplate(token);

            console.log('calling updateAppHome', sessionData.slackTeamId, JSON.stringify(onBoardingTemlatePayload), sessionData.slackUserId);

            const updateAppHomePayload = await updateAppHome(sessionData.slackTeamId, onBoardingTemlatePayload, sessionData.slackUserId);

            console.log('update app home payload', JSON.stringify(updateAppHomePayload));

            break;
        case 'user_change':
            sessionData.slackTeamId = body['team_id'] as string;
            sessionData.slackUserId = body.event.user;

            const userProfile = body.event.user.profile;
            console.log('user profile changed', body.event.user.id, JSON.stringify(userProfile));

            const user = await fetchUserBySlackId(body.event.user.id);

            if (user.id) {
                console.log('user_change, user exists', JSON.stringify(body.event.user));
                await updateUser({
                    userId: body.event.user.id,
                    realName: userProfile.real_name,
                    email: userProfile.email,
                    image: userProfile.image_512,
                    active: !body.event.user.deleted
                });
            }

            break;
    }
};