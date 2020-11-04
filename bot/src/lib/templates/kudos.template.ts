import {getUserSkill} from '../skills';
import {fetchUserBySlackId} from '../user';
import {getAppHomeLink} from '../util/slack';
import {Kudos} from '../bot';
import {CONFIG} from '../../config';

export const addSkillPayloadTemplate = (sourceUserId: string, targetUserId: string, skillName: string, imageUrl: string) => {
    return {
        text: `Do you agree that <@${targetUserId}> deserves kudos for ${skillName}?`,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Do you agree that <@${targetUserId}> deserves kudos for *${skillName}*?`
                },
                accessory: {
                    type: 'image',
                    image_url: `${imageUrl.replace("\\/", "/")}`,
                    alt_text: 'Mentor profile pic'
                }
            },
            {
                type: 'divider'
            },
            {
                type: 'actions',
                elements: [
                    {
                        action_id: 'kudos-click',
                        style: 'primary',
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Give Kudos',
                            emoji: true
                        },
                        value: `mma-kudos#${sourceUserId}#${targetUserId}#${skillName}`
                    }
                ]
            }
        ]
    }
};

export const getKudosButtonClickedTemplate = () => {

    return {
        replace_original: false,
        text: 'Thank you for clicking the button',
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'Thank you for clicking the button'
                },
                accessory: {
                    type: 'button',
                    style: 'primary',
                    text: {
                        type: 'plain_text',
                        text: 'See Most Popular Kudos',
                        emoji: true
                    },
                    action_id: 'open-wordcloud',
                    url: CONFIG.WORDCLOUD_LINK,
                    value: 'open-wordcloud'
                }
            }
        ]
    }

};

export const getKudosAddedToYourProfileTemplate = (skillName: string) => {
    return {
        replace_original: false,
        text: `The skill *${skillName}* has been successfully added to your profile`,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `The skill *${skillName}* has been successfully added to your profile`
                },
                accessory: {
                    type: 'button',
                    style: 'primary',
                    text: {
                        type: 'plain_text',
                        "text": "See Most Popular Kudos",
                        "emoji": true
                    },
                    "action_id": "open-wordcloud",
                    "url": CONFIG.WORDCLOUD_LINK,
                    "value": "open-wordcloud"
                }
            }
        ]
    }
};

export const getMentorRecommendationBlockTemplate = async (mentorId: string, skill: string ) => {
    console.log('getMentorRecommendationBlockTemplate', mentorId, skill);
    const userSkill = await getUserSkill(mentorId, skill);
    const user = await fetchUserBySlackId(mentorId);

    console.log('userskill payload', JSON.stringify(userSkill));

    return {
        "text": `<@${mentorId}> knows about ${skill}`,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `<@${mentorId}> knows about ${skill}`,
                },
                "accessory": {
                    "type": "button",
                    "style": "primary",
                    "text": {
                        "type": "plain_text",
                        "text": `Talk to ${user.realName}`,
                        "emoji": true
                    },
                    "action_id": `match-open-calendar#${skill}`,
                    "url": userSkill.skills[0].userSkill.meetingLink,
                    "value": "open-google-calendar-link"
                }
            }
        ]
    };
};

export const getAskedAboutTemplate = (menteeId: string, skill: string, messageUrl: string) => {
    return {
        "text": `<@${menteeId}> asked about *${skill}* which is listed in your \`/profile\`. Please consider helping out by getting in touch with this person.`,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text":  `<@${menteeId}> asked about *${skill}* which is listed in your \`/profile\`. Please consider helping out by getting in touch with this person.`,
                },
                "accessory": {
                    "type": "button",
                    "style": "primary",
                    "text": {
                        "type": "plain_text",
                        "text": `Go to message`,
                        "emoji": true
                    },
                    "url": messageUrl.replace('\\/', '/'),
                    "value": "open-message-permalink"
                }
            }
        ]
    };
};

export const getGaveYouKudosTemplate = async (sourceUserId: string, targetUserId: string, skillName: string, token: string) => {
    const message = `<@${sourceUserId}> gave you kudos for *${skillName}*.`;
    const appHomeLink = await getAppHomeLink(token, 'home');

    console.log('appHomeLink', appHomeLink);

    return {
        "text": `<@${sourceUserId}> gave you kudos for ${skillName}`,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": message
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "See Most Popular Kudos",
                        "emoji": true
                    },
                    "action_id": "open-wordcloud",
                    "url": CONFIG.WORDCLOUD_LINK,
                    "value": "open-wordcloud"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "action_id": `activate-skill#${skillName}`,
                        "style": "primary",
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `Accept`,
                            "emoji": true
                        },
                        "value": `activate-skill`
                    },
                    {
                        "action_id": `disable-skill#${skillName}`,
                        "style": "danger",
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `Reject`,
                            "emoji": true
                        },
                        "value": `disable-skill`
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": `For more info visit <${appHomeLink}|mma home page>`
                    }
                ]
            }
        ]
    }
};

export const getGaveYouKudosForInactiveSkillTemplate = async (sourceUserId: string, targetUserId: string, skillName: string, token: string) => {
    const message = `<@${sourceUserId}> gave you kudos for *${skillName}* which currently inactive in your profile`;
    const appHomeLink = await getAppHomeLink(token, 'home');

    console.log('appHomeLink', appHomeLink);

    return {
        "text": `<@${sourceUserId}> gave you kudos for ${skillName} which currently inactive in your profile`,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": message
                },
            },
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "action_id": `activate-skill#${skillName}`,
                        "style": "primary",
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `Add to my profile`,
                            "emoji": true
                        },
                        "value": `activate-skill`
                    },
                    {
                        "action_id": `disable-skill#${skillName}`,
                        "style": "danger",
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `Ignore`,
                            "emoji": true
                        },
                        "value": `disable-skill`
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": `For more info visit <${appHomeLink}|mma home page>`
                    }
                ]
            }
        ]
    }
};

export const kudosGivenTemplate = (to: string, skillName: string) => {
    return {
        replace_original: false,
        text: `Successfully gave kudos to <@${to}> for *${skillName}*.`,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    text: `Successfully gave kudos to <@${to}> for *${skillName}*.`,
                },
                "accessory": {
                    "type": "button",
                    "style": "primary",
                    "text": {
                        "type": "plain_text",
                        "text": "See Most Popular Kudos",
                        "emoji": true
                    },
                    "action_id": "open-wordcloud",
                    "url": CONFIG.WORDCLOUD_LINK,
                    "value": "open-wordcloud"
                }
            }
        ]
    }
};

export const cantGiveKudosTemplate = (e: any, skillAndMentor: Kudos) => {
    let text = '';
    const entity = e.error && e.error.entity ? e.error.entity : '';

    switch (entity) {
        case 'user':
            text = `Can't give kudos. There was a problem while adding a new mentor. Please try again in few minutes.`;
            break;
        case 'userSkill':
            text = `Can't give kudos. There was a problem while assigning a skill *${skillAndMentor.skillName}* to a mentor. Please try again in few minutes.`;
            break;
        case 'kudos':
            text = `Can't add kudos to <@${skillAndMentor.userId}> for *${skillAndMentor.skillName}*. Perhaps you already did?`;
            break;
        default:
            text = `Can't give kudos. Please check if user and skill/ability is in correct format: maximum 26 characters and does not contain: *#* or *@* `;
    }

    return {
        "replace_original": false,
        "text": text,
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": text
                },
                "accessory": {
                    "type": "button",
                    "style": "primary",
                    "text": {
                        "type": "plain_text",
                        "text": "See Most Popular Kudos",
                        "emoji": true
                    },
                    "action_id": "open-wordcloud",
                    "url": CONFIG.WORDCLOUD_LINK,
                    "value": "open-wordcloud"
                }
            }
        ]
    }
};

export const cantAddSkillTemplate = () => {
    return {
        text: `Can't add skill. Please check if user and skill/ability is in correct format: maximum 26 characters and does not contain: *#* or *@* `,
        replace_original: false
    }
};

export const cantAddPayloadTemplate = (to: string, skillName: string) => {
    return {
        text: `Can't add kudos to <@${to}> for *${skillName}*. Perhaps you already did?`,
        replace_original: false
    }
};

export const cantDeleteKudosTemplate = (skillName: string) => {
    return {
        text: `Can't delete kudos for *${skillName}*. Perhaps you already did?`,
        replace_original: false
    }
};

export const selfLoveTemplate = () => {
    return {
        replace_original: false,
        blocks: [
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "I know what ya tryin' to do!",
                    "emoji": true
                },
                "image_url": "https://media.giphy.com/media/3o8dFBcecbeoHgQTFS/giphy.gif",
                "alt_text": "I know what ya doin"
            }
        ]
    };
};
