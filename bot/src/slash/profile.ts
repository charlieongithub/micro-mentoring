import {parseText, sendMessageToSlackResponseURL} from '../lib/util/slack';
import {fetchUserBySlackId, getUserProfile} from '../lib/user';
import {
    profileMissingAtCharacter,
    profileNotFoundTemplate,
    userProfileTemplate
} from '../lib/templates/profile.template';
import {sessionData} from '../lib/util/request';
import {logProfileCalled} from '../lib/util/stats';

export const show = async (e, context) => {
    if (e.source === 'serverless-plugin-warmup') {
        console.log('lambda is warm');
        return;
    }

    console.log('mmaprofile context', JSON.stringify(context));
    console.log('request timestamp', e.timestamp);
    console.log('my timestamp', new Date().getTime());

    const jsonBody = e.body;

    console.log('mmaProfile Kudos serverless logs: ', e.body);
    console.log('jsonBody.text', jsonBody.text);
    sessionData.slackTeamId = jsonBody['team_id'] as string;
    sessionData.slackUserId = jsonBody['user_id'] as string;

    const sourceUserId: string = jsonBody['user_id'] as string;
    let userId;

    const parsedText = parseText(jsonBody.text);

    console.log('parsedText', JSON.stringify(parsedText));

    if (parsedText && parsedText.userId) {
        userId = parsedText.userId;
    } else if (parsedText && !parsedText.userId && jsonBody.text.length > 0) {
        await sendMessageToSlackResponseURL(jsonBody.response_url, profileMissingAtCharacter());
        return;
    } else {
        userId = sourceUserId;
    }

    try {
        const user = await fetchUserBySlackId(userId);

        if (!user.id) {
            console.log('mentor profile does not exist');
            await sendMessageToSlackResponseURL(jsonBody.response_url, profileNotFoundTemplate());
        } else {
            const userKudosPayload = await getUserProfile(userId);

            const template = userProfileTemplate({
                userId: userId,
                realName: user.realName,
                skills: userKudosPayload,
                image: user.image
            }, 'delete-skill', null);
            console.log('profile template', JSON.stringify(template));
            await sendMessageToSlackResponseURL(jsonBody.response_url, template);
        }

        await logProfileCalled(jsonBody);
    } catch (e) {
        console.log('error occurred while calling the profile method', JSON.stringify(e));
        return null;
    }
};