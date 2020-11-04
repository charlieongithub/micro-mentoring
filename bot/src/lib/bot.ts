import pluralize from 'pluralize';
import stopwords from './util/stopwords';
import {
    addSkillPayloadTemplate,
    getAskedAboutTemplate, getGaveYouKudosForInactiveSkillTemplate,
    getGaveYouKudosTemplate, getKudosAddedToYourProfileTemplate,
    getMentorRecommendationBlockTemplate
} from './templates/kudos.template';
import {CONFIG} from '../config';
import {getPermalink, getPresence} from './util/slack';
import {logSkillMatched} from './util/stats';
import {introductionTemplate} from './templates/lotto.template';
import {sessionData} from './util/request';

export interface Kudos {
    userId: string;
    skillName: string
}

export const postRecommendationInDirectMessage = async (web: any, requestBody: any, mentorRecommendationTemplate: any) => {
    return web.chat.postMessage({
        channel: requestBody.event.channel,
        text: mentorRecommendationTemplate.text,
        blocks: mentorRecommendationTemplate.blocks
    });
};

export const postEphemeralText = async (web, user: string, mmaChannel: string, text: string) => {
    return web.chat.postEphemeral({
        channel: mmaChannel,
        text: text,
        user: user
    });
};

export const postEphemeralBlock = async (web, user: string, mmaChannel: string, fallBackText: string, blocks: any[]) => {
    return web.chat.postEphemeral({
        channel: mmaChannel,
        text: fallBackText,
        user: user,
        blocks: blocks
    });
};

export const postAttachmentTo = async (web, mmaChannel: string, attachment: any) => {
    return web.chat.postMessage({
        channel: mmaChannel,
        blocks: attachment.blocks,
        text: attachment.text
    });
};

export const postIntroductionTemplate = async (web, channelId: string, mentorId: string) => {
    const introductionTemplatePayload = await introductionTemplate(mentorId);
    return postAttachmentTo(web, channelId, introductionTemplatePayload);
};

export const postSkillAddedConfirmationToMentor = async (web, mentorId: string, skillName: string) => {
    const template = getKudosAddedToYourProfileTemplate(skillName);
    return postEphemeralBlock(web, mentorId, mentorId, template.text, template.blocks);
};

export const postKudosToChannel = async (web, from: string, mentor: string, skillName: string, image: string) => {
    return postAttachmentTo(web, (CONFIG as any).KUDOS_CHANNEL, addSkillPayloadTemplate(from, mentor, skillName, image));
};

export const postKudosGivenTo = async (web, from: string, mentor: string, skillName: string) => {
    return web.chat.postMessage({
        channel: (CONFIG as any).KUDOS_CHANNEL,
        text: `${from} gave kudos to ${mentor} for ${skillName}`
    });
};

export const postGaveYouKudosForInactiveSkill = async (web, from: string, mentor: string, skillName: string, token: string) => {
    const gaveYouKudosTemplate = await getGaveYouKudosForInactiveSkillTemplate(from, mentor, skillName, token);
    console.log('update skill status template', JSON.stringify(gaveYouKudosTemplate));
    return postAttachmentTo(web, mentor, gaveYouKudosTemplate);
};

export const postGaveYouKudosForNewSkill = async (web, from: string, mentor: string, skillName: string, token: string) => {
    const gaveYouKudosTemplate = await getGaveYouKudosTemplate(from, mentor, skillName, token);
    console.log('update skill status template', JSON.stringify(gaveYouKudosTemplate));
    return postAttachmentTo(web, mentor, gaveYouKudosTemplate);
};

export const processMessage = async (body, web, expressions) => {
    if (isBotMessage(body.event) || isSlashCommand(body.event) || !isAQuestion(body.event)) {
        return;
    }

    let paths = getMentorsForSkill(stripChars(body.event.text), expressions);

    console.log('skill paths', JSON.stringify(paths));
    // get all paths
    let names = paths
    // convert back arrays of string
        .map(path => path.out)
        // this reduces nested array to a flat array
        .reduce(
            // callback
            (
                // accumulates the callbacks return values
                array,
                // current element
                current
            ) => array.concat(current),
            // initial value
            []
        );

    names = removeDuplicatesFromArray(names);
    console.log('all people who know about', JSON.stringify(names));

    const menteeId = body.event.user;
    const onlineMentors = await getOnlineMentors(sessionData.slackTeamId, names);

    const mentors = onlineMentors.length > 0 ? onlineMentors : names;

    const mentorId = getRandomMentorFromArray(mentors, menteeId);
    const mentorRecommendationTemplate = await getMentorRecommendationBlockTemplate(mentorId, paths[0].in);
    console.log('jsonBody', JSON.stringify(body));

    if (isDirectMessage(body.event)) {
        await postRecommendationInDirectMessage(web, body, mentorRecommendationTemplate);
    } else if (mentorId) {
        console.log('Following users know of ', paths[0].in, names.join());
        await informMentorsAboutAQuestion(names, paths[0].in, body, web);

        await postEphemeralBlock(web,
            menteeId,
            body.event.channel,
            mentorRecommendationTemplate.text,
            mentorRecommendationTemplate.blocks
        );
    }

    await reactToAMenteeQuestion(web, body.event.channel, body.event.event_ts);
    await logSkillMatched(mentorId, body, paths[0].in);
};

export const reactToAMenteeQuestion = async (web, channel, event_ts) => {
    return web.reactions.add({name: (CONFIG as any).BOT_REACTION_EMOJI, channel: channel, timestamp: event_ts});
};

export const informMentorsAboutAQuestion = async (mentors: string[], skill: string, body: any, web) => {
    const linkToMessage = await getPermalink(body.team_id, body.event.channel, body.event.event_ts);
    console.log('Direct link to message', linkToMessage, linkToMessage.permalink);
    const message = getAskedAboutTemplate(body.event.user, skill, linkToMessage.permalink);

    for (const mentor of mentors) {
        console.log('mentors who know about', JSON.stringify(mentors));

        if (mentor !== body.event.user) {
            await postEphemeralBlock(web,
                mentor,
                mentor,
                message.text,
                message.blocks
            );
        }
    }
};

const stripUrl = (text: string) => {
    const urls = /(?:https?|ftp):\/\/[\n\S]+/g;
    return text.replace(urls, '');
}

export const stripChars = (text: string) => {
    const hyperlink = /http[^\s]*/;
    const mention = /@[^\s]+/;
    const chars = /\?|\*|!|#|@|~|>|`|_/g;
    const linefeed = /[\x00-\x1F\x7F]/;

    return text
        .replace(hyperlink, '')
        .replace(mention, '')
        .replace(chars, '')
        .replace(linefeed, '')
        .trim();
};

export const createSkillsMap = (payload: any[]) => {
    let skillsMap = {};

    for (const userProfile of payload) {
        for (const userSkill of userProfile.skills) {
            if (!skillsMap[userSkill.skillName]) {
                skillsMap[userSkill.skillName] = [userProfile.userId];
            } else {
                skillsMap[userSkill.skillName].push(userProfile.userId);
            }
        }
    }

    let normalizedMap = new Array();

    for (const i in skillsMap) {
        normalizedMap.push([i, skillsMap[i]]);
    }

    return normalizedMap;
};

export const isQuestionFromUser = (event: any): boolean => {
    return !event.bot_id && isAQuestion(event);
};

export const isAQuestion = event => stripUrl(event.text).indexOf('?') !== -1;

const removeDuplicatesFromArray = (a) => {
    return Array.from(new Set(a));
};

const getWordPairsFromMessage = (str: string): string[] => {
    let words = str.split(' ');
    let finalArray = new Array();
    for (let i = 0; i < words.length; i++) {
        // validate that the next words exists
        if (words[i + 1]) {
            let pairedWords: any = `${words[i]} ${words[i + 1]}`;
            finalArray.push(pairedWords);
        }

        // validate that the next two words exist
        if (words[i + 2]) {
            let pairedWords: any = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
            finalArray.push(pairedWords);
        }
    }

    return finalArray;
};

const isBotMessage = event => event.subtype === 'bot_message';

export const isPrivateConversation = event => event.channel_type === 'mpim';

const isSlashCommand = event => event.text.startsWith('/');

const isDirectMessage = event => event.channel.startsWith('D');

const getRandomMentorFromArray = (array: string[], exclude: string) => {
    array = array.filter(mentor => mentor !== exclude);
    return array[Math.floor(Math.random() * array.length)];
};

const getOnlineMentors = async (teamId: string, userIds: string[]) => {
    const activeUserIds = new Array();
    for (const userId of userIds) {
        const status = await getPresence(teamId, userId);
        const isPresent = status.presence === 'active';

        if (isPresent) {
            activeUserIds.push(userId);
        }
    }

    return activeUserIds;
};

const getMentorsForSkill = (text, expressions) => {
    const toPath = word => ({in: word, out: word});
    const mapPath = f => path => ({...path, out: f(path.out)});

    const toLowerCase = mapPath(out => out.toLowerCase());

    const notStopword = path => !stopwords.has(path.out);

    const toSingular = mapPath(out => pluralize.singular(out));
    const toPlural = mapPath(out => pluralize.plural(out));

    const hasExpression = path => expressions.has(path.out);

    const toExpression = mapPath(out => expressions.get(out));
    let allPaths = new Array();

    // get words from text in an array (remove mentions, emojis and hyperlinks)
    const singularPaths = messageToArray(text)
    // each array item gets mapped into { in: word, out: word }
        .map(toPath)
        // all gets converted to lowercase
        .map(toLowerCase)
        // stopwords are being removed
        .filter(notStopword)
        // all gets converted into singular form
        .map(toSingular);

    allPaths = allPaths.concat(singularPaths);

    const pluralPaths = singularPaths.map(toPlural);

    allPaths = allPaths.concat(pluralPaths);
    const skillsAndMentors = allPaths.filter(hasExpression)
        .map(toExpression);

    // return mentors only for one skill
    return skillsAndMentors.splice(Math.floor(Math.random() * skillsAndMentors.length), 1);

};

const messageToArray = (text: string) => {
    const word = /[^\s]{2,}/g;
    // todo implement normalization in v2
    const normalizedText = text;
    const words = normalizedText.match(word) || [];
    const wordPairs = getWordPairsFromMessage(normalizedText) || [];

    return words.concat(wordPairs);
};
