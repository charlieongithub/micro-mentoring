import {getUserProfile} from '../user';
import {CONFIG} from '../../config';

export const startConversationTemplate = async (menteeId: string, mentorId: string, replaceOriginal: boolean) => {
    const userKudosPayload = await getUserProfile(mentorId);
    const mentorSkills = new Array();

    const skillMaxCount = userKudosPayload.length > 2 ? 3 : userKudosPayload.length;
    for (let i = 0; i < skillMaxCount; i++) {
        mentorSkills.push(`*${userKudosPayload[i].skillName}*`);
    }

    return {
        response_type: 'ephemeral',
        replace_original: replaceOriginal,
        text: 'We found a mentor for you!',
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'We found a mentor for you :tada:  '
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Click the button to start the conversation about things like: ${mentorSkills.join(', ')}`
                },
                accessory: {
                    type: 'button',
                    style: 'primary',
                    text: {
                        type: 'plain_text',
                        text: ':zap: Start conversation',
                        emoji: true
                    },
                    value: `start-conversation-${menteeId}-${mentorId}`
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'Meh? Roll the :game_die: again'
                },
                accessory: {
                    style: 'primary',
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: ':game_die: Try again',
                        emoji: true
                    },
                    value: 'mentoring-lotto'
                }
            }
        ]
    }
};

export const introductionTemplate = async (mentorId: string) => {
    const userKudosPayload = await getUserProfile(mentorId);
    const mentorSkills = new Array();

    const skillMaxCount = userKudosPayload.length > 2 ? 3 : userKudosPayload.length;

    for (let i = 0; i < skillMaxCount; i++) {
        mentorSkills.push({
            type: 'mrkdwn',
            text: `*${userKudosPayload[i].skillName}*`
        });
    }


    return {
        replace_original: false,
        text: 'Mentoring lotto conversation',
        blocks:  [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: ':tada: Howdy! This conversation was started by the `/mentoring-lotto` command :tada: '
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'With *mentoring lotto* the *TX Micro Mentoring Bot* randomly connects people so they can talk about some interesting stuff... :thinking_face:'
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'Anyway here are some things you can talk about:'
                }
            },
            {
                type: 'section',
                fields: mentorSkills
            },
            {
                type: 'divider'
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'You can also use this button to search for more skills in the mentors directory'
                },
                accessory: {
                    type: 'button',
                    style: 'primary',
                    text: {
                        type: 'plain_text',
                        text: 'Search for skills',
                        emoji: true
                    },
                    value: 'open-search-modal'
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'Click this button to open a page with most popular kudos'
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
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: 'For more info visit: https://tamediadigital.github.io/micromentoringapp/'
                    }
                ]
            }
        ]
    };
};


export const conversationStartedTemplate = () => {
    return {
        text: `The conversation has been started. Please check your latest message in the *Direct Messages* section.`,
        replace_original: true
    }
};
