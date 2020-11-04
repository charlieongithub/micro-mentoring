import AWS from 'aws-sdk';
import {CONFIG} from '../../config';

const database = new AWS.DynamoDB.DocumentClient();

export const logSkillMatched = async (mentorUserId: string, event: any, matchedSkill: string) => {
    const payload = {
        TableName: CONFIG.SKILL_MATCHED_LOG_TABLE_NAME,
        Item: {
            teamId: event.team_id,
            sourceUserId: event.event.user,
            mentorUserId: mentorUserId,
            messagePayload: event.event.text,
            matchedSkill: matchedSkill,
            messageTs: event.event.ts,
            channel: event.event.channel,
            channelType: event.event.channel_type,
            datetime: new Date(event.event.ts * 1000).toLocaleString('en-GB')
        }
    } as any;


    return database.put(payload).promise();
};

export const logSkillSearched = async (teamId: string, userId: string, channelId: string, channelName: string, searchPhrase: string, resultsCount: number) => {
    const payload = {
        TableName: CONFIG.SKILL_SEARCHED_LOG_TABLE_NAME,
        Item: {
            searchPhrase: searchPhrase,
            searchResultsCount: resultsCount,
            teamId: teamId,
            sourceUserId: userId,
            channel: channelId,
            channelName: channelName,
            datetime: new Date().toLocaleString('en-GB'),
            timestamp: new Date().getTime()
        }
    } as any;

    return database.put(payload).promise();
};

export const logProfileCalled = async (event: any) => {
    const payload = {
        TableName: CONFIG.PROFILE_CALLED_LOG_TABLE_NAME,
        Item: {
            payload: event.text === '' ? ' ' : event.text,
            teamId: event.team_id,
            sourceUserId: event.user_id,
            channel: event.channel_id,
            channelName: event.channel_name,
            datetime: new Date().toLocaleString('en-GB'),
            timestamp: new Date().getTime()
        }
    } as any;

    return database.put(payload).promise();
};

export const logKudosCalled = async (event: any) => {
    const payload = {
        TableName: CONFIG.KUDOS_CALLED_LOG_TABLE_NAME,
        Item: {
            payload: event.text === '' ? ' ' : event.text,
            command: event.command,
            teamId: event.team_id,
            sourceUserId: event.user_id,
            channel: event.channel_id,
            channelName: event.channel_name,
            datetime: new Date().toLocaleString('en-GB'),
            timestamp: new Date().getTime()
        }
    } as any;

    return database.put(payload).promise();
};

export const logButtonClicked = async (event: any) => {
    console.log('logging event', JSON.stringify(event));
    const action = event.actions ? event.actions[0] : null;
    const isActionEmpty = !action || !action.value || action.value === '';

    const payload = {
        TableName: CONFIG.BUTTON_CLICKED_LOG_TABLE_NAME,
        Item: {
            actionValue: isActionEmpty ? event.callback_id : action.value,
            action: isActionEmpty ? event.type : action.action_id,
            teamId: event.team.id,
            sourceUserId: event.user.id,
            channel: event.channel.id,
            channelName: event.channel.name,
            datetime: new Date().toLocaleString('en-GB'),
            timestamp: isActionEmpty ? new Date().getTime().toString() : action.action_ts
        }
    } as any;

    console.log('log payload', JSON.stringify(payload));

    return database.put(payload).promise();
};
