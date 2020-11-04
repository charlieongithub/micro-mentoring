import {sessionData} from '../lib/util/request';
import {skillStatusNotUpdatedTemplate, skillStatusUpdatedTemplate} from '../lib/templates/profile.template';
import {updateUserSkillStatusCmd} from '../lib/kudos';

export const mmaProfileActivateSkill = async (e) => {
    if (e.source === 'serverless-plugin-warmup') {
        console.log('lambda is warm');
        return;
    }

    const jsonBody = e.body;
    console.log('Kudos serverless logs: ', e.body);

    sessionData.slackTeamId = jsonBody['team_id'] as string;
    sessionData.slackUserId = jsonBody['user_id'] as string;

    await updateUserSkillStatusCmd(jsonBody, jsonBody['user_id'], null, true, {
        success: skillStatusUpdatedTemplate(jsonBody.text, true),
        failure: skillStatusNotUpdatedTemplate()
    });
};

export const mmaProfileDeactivateSkill = async (e) => {
    if (e.source === 'serverless-plugin-warmup') {
        console.log('lambda is warm');
        return;
    }

    const jsonBody = e.body;
    console.log('Kudos serverless logs: ', e.body);

    sessionData.slackTeamId = jsonBody['team_id'] as string;
    sessionData.slackUserId = jsonBody['user_id'] as string;

    await updateUserSkillStatusCmd(jsonBody, jsonBody['user_id'], null, false, {
        success: skillStatusUpdatedTemplate(jsonBody.text, false),
        failure: skillStatusNotUpdatedTemplate()
    });
};