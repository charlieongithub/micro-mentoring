import {openView} from './util/slack';
import {sessionData} from './util/request';
import {searchTemplate} from './templates/modal.template';
import {getSkillSearchSubmissionResponse} from './util/modals';
import {deleteKudosAction, giveKudosAction, updateUserSkillStatusCmd} from './kudos';
import {skillStatusNotUpdatedTemplate, skillStatusUpdatedTemplate} from './templates/profile.template';
import {startConversation} from './lotto';
import {lotto} from '../slash/lotto';

export const actionsHandler = async (actionJSONPayload: any, callback) => {
    console.log('action type', actionJSONPayload.type);
    switch (actionJSONPayload.type) {
        case 'message_action':
            callback(null, {
                statusCode: 200
            });

            await handleMessageActions(actionJSONPayload);
            break;
        case 'view_submission':
            const submissionResponse = await getSkillSearchSubmissionResponse(actionJSONPayload);

            callback(null, {
                statusCode: 200,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(submissionResponse)
            });
            break;
        case 'block_actions':
            callback(null, {
                statusCode: 200
            });

            await handleBlockActions(actionJSONPayload);

            break;
    }
};

const handleMessageActions = async (actionJSONPayload: any) => {
    console.log('message action called', JSON.stringify(actionJSONPayload.callback_id));

    if (actionJSONPayload.callback_id === 'mentor-search-popup') {
        await openView(sessionData.slackTeamId, searchTemplate(actionJSONPayload.trigger_id));
    }
};

const handleBlockActions = async (actionJSONPayload: any) => {
    const firstAction = actionJSONPayload.actions[0];

    console.log('first action, value', firstAction.value, JSON.stringify(firstAction));

    if (!firstAction) {
        return;
    }

    const isKudosAction = () => firstAction.value && firstAction.value.indexOf('mma-kudos') !== -1;
    const isActivateSkillAction = () => firstAction.value && firstAction.value.indexOf('activate-skill') !== -1;
    const isDeleteSkillAction = () => firstAction.value && firstAction.value.indexOf('delete-skill') !== -1;
    const isDisableSkillAction = () => firstAction.value && firstAction.value.indexOf('disable-skill') !== -1;
    const isSearchSkillAction = () => firstAction.value && firstAction.value.indexOf('open-search-modal') !== -1;
    const isStartConversationAction = () => firstAction.value && firstAction.value.indexOf('start-conversation') !== -1;
    const isMentoringLotto = () => firstAction.value && firstAction.value.indexOf('mentoring-lotto') !== -1;
    const isMentoringLottoEphemeral = () => firstAction.value && firstAction.value.indexOf('ephemeral-lotto') !== -1;


    if (isKudosAction()) {
        console.log('giving kudos whats the action?', actionJSONPayload.type);
        await giveKudosAction(actionJSONPayload);
    } else if (isDeleteSkillAction()) {
        await deleteKudosAction(actionJSONPayload, firstAction);
    } else if (isActivateSkillAction()) {
        const skillName = firstAction['action_id'].split('#')[1];
        await updateUserSkillStatusCmd(actionJSONPayload, sessionData.slackUserId, skillName, true, {
            success: skillStatusUpdatedTemplate(skillName, true),
            failure: skillStatusNotUpdatedTemplate()
        });
    } else if (isDisableSkillAction()) {
        const skillName = firstAction['action_id'].split('#')[1];
        await updateUserSkillStatusCmd(actionJSONPayload, sessionData.slackUserId, skillName, false, {
            success: skillStatusUpdatedTemplate(skillName, false),
            failure: skillStatusNotUpdatedTemplate()
        });
    } else if (isSearchSkillAction()) {
        await openView(sessionData.slackTeamId, searchTemplate(actionJSONPayload.trigger_id));
    } else if (isStartConversationAction()) {
        const splittedValues = firstAction.value.split('-');
        const menteeId = splittedValues[3];
        const mentorId = splittedValues[2];

        await startConversation(mentorId, menteeId, actionJSONPayload.response_url);
    } else if (isMentoringLotto()) {
        await lotto(actionJSONPayload.response_url, true);
    } else if (isMentoringLottoEphemeral()) {
        await lotto(actionJSONPayload.response_url, false);
    }
};