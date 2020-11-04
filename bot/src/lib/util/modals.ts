import {CONFIG} from '../../config';
import AWS from 'aws-sdk';
import {getSkillsByName} from '../skills';
import {getUserProfilesBySkillName} from '../user';
import {searchResultsTemplate} from '../templates/modal.template';
import {logSkillSearched} from './stats';

const database = new AWS.DynamoDB.DocumentClient();

export const storeSearchPopupViewId = async (teamId: string, userId: string, viewId: string) => {
    const payload = {
        TableName: CONFIG.POPUP_ID_TABLE_NAME,
        Item: {
            teamId: teamId,
            userId: userId,
            viewId: viewId
        }
    } as any;

    const popupViewIdItem: any = await getSearchPopupViewId(teamId, userId);

    console.log('checking if item exists', JSON.stringify(popupViewIdItem));

    if (popupViewIdItem.teamId) {
        const updatePayload = {
            TableName: CONFIG.POPUP_ID_TABLE_NAME,
            Key: {
                teamId: teamId,
                userId: userId
            },
            UpdateExpression: 'set viewId = :val',
            ExpressionAttributeValues: {
                ':val': viewId
            },
            ReturnValues: 'UPDATED_NEW'
        } as any;

        return database.update(updatePayload).promise();
    } else {
        console.log('item does not exist');
        return database.put(payload).promise();
    }
};

export const getSearchPopupViewId = async (teamId: string, userId: string) => {
    const payload = {
        TableName: CONFIG.POPUP_ID_TABLE_NAME,
        Key: {
            teamId: teamId,
            userId: userId
        }
    } as any;

    return database.get(payload).promise();
};

export const getSkillSearchPopupOptions = async (skillName: string) => {
    const skills = await getSkillsByName(skillName);
    const options = new Array();

    for (const skill of skills.skills) {
        options.push({
            "text": {
                "type": "plain_text",
                "text": skill.title
            },
            "value": skill.title
        });
    }

    return options;
};

export const getSkillSearchSubmissionResponse = async (actionJSONPayload) => {
    console.log('view submission callback_id', actionJSONPayload.view.callback_id);
    console.log('view state values', JSON.stringify(actionJSONPayload.view.state.values));

    let searchPhrase = actionJSONPayload.view.state.values['skill-search-form']['skill-name-value']['selected_option'].value;

    console.log('search phrase', JSON.stringify(searchPhrase));

    if (actionJSONPayload.view.callback_id === 'search-modal') {
        const userProfiles = await getUserProfilesBySkillName(searchPhrase);

        await logSkillSearched(actionJSONPayload.team.id, actionJSONPayload.user.id, ' ', 'search-modal', searchPhrase, userProfiles.length);

        return searchResultsTemplate(actionJSONPayload.view.state.values['skill-search-form']['skill-name-value']['selected_option'], userProfiles);
    }
};