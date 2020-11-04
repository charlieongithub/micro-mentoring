import AWS from 'aws-sdk';
import {CONFIG} from '../config';

export const proxy = async (e, context) => {
    if (e.source === 'serverless-plugin-warmup') {
        console.log('lambda is warm');
        return {
            statusCode: 200
        }
    }

    console.log('event called', JSON.stringify(e));
    let lambda = new AWS.Lambda();

    const calledTimestamp = new Date().getTime();

    console.log('proxy handler called',calledTimestamp, JSON.stringify(e));
    console.log('proxy context', JSON.stringify(context));
    let params = {
        FunctionName: `${CONFIG.SERVICE}-${CONFIG.STAGE}-${e.path.command}`,
        Payload: JSON.stringify({
            timestamp: calledTimestamp,
            body: e.body
        })
    };

    console.log('invoking', JSON.stringify(params));
    const payload = await lambda.invoke(params).promise();
    console.log('invoked', JSON.stringify(payload));

    return {
        statusCode: 200
    };
};