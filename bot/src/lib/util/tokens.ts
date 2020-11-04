import AWS from 'aws-sdk';
import {CONFIG} from '../../config';

const database = new AWS.DynamoDB.DocumentClient();
export const retrieve = (teamId) => {
	const payload = {
		TableName: CONFIG.ACCESS_TOKEN_TABLE_NAME,
		Key: {
			teamId: teamId
		}
	} as any;
	
	return new Promise((resolve, reject) => {
		database.get(payload).promise()
			.then(result => {
				if (result && result.Item)
					return resolve({
						botAccessToken: result.Item.botAccessToken,
						accessToken: result.Item.accessToken
					}) as any;

				return null;
			})
			.catch(error => reject(new Error(`Error retrieving OAuth access token: ${error}`)));
	});
};

export const store = (teamId, botAccessToken, accessToken) => {
	const payload = {
		TableName: CONFIG.ACCESS_TOKEN_TABLE_NAME,
		Item: {
			teamId: teamId,
			botAccessToken: botAccessToken,
			accessToken: accessToken
		}
	} as any;
	
	return new Promise((resolve, reject) => {
		database.put(payload).promise()
			.then(result => resolve())
			.catch(error => reject(new Error(`Error storing OAuth access token: ${error}`)));
	});
};