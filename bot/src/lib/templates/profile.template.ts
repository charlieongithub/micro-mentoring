import {CONFIG} from '../../config';

interface kudos {
    skillName: string;
    kudos: number;
    meetingLink: string;
}

export const userProfileTemplate = (profile, action: string, buttonStyle: string|null) => {
    const block = {
        blocks: []
    };

    block.blocks = block.blocks.concat(userProfileItemTemplate(profile, action, buttonStyle) as any);

    return block;
};

const buildSkillActionButtons = (skills: kudos[], buttonStyle: string, action: string) => {
    const buttons = new Array();

    for (const skill of skills) {
        buttons.push(
            {
                action_id: `${action}#${skill.skillName}`,
                style: buttonStyle,
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: `${skill.skillName} (${skill.kudos})`,
                    emoji: true
                },
                value: action
            }
        );
    }

    return buttons;
};

const buildReadOnlySkills = (skills: kudos[]) => {
    const items = new Array();

    for (const skill of skills) {
        items.push(
            {
                action_id: `profile-open-calendar#${skill.skillName}`,
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: `${skill.skillName} (${skill.kudos}) :calendar:`,
                    emoji: true
                },
                url: skill.meetingLink
            }
        );
    }

    return items;
};

export const userProfileItemTemplate = (profile, action: string, buttonStyle: string | null) => {
    let buttons = new Array();

    let items = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Full Name:* ${profile.realName}\n\n\n :slack: <@${profile.userId}>${profile.skills.length > 0 ? '\n\n\n*Skills:*' : ''}`
            },
            accessory: {
                type: 'image',
                image_url: `${profile.image.replace("\\/", "/")}`,
                alt_text: 'Mentor profile pic'
            }
        }
    ];

    if (buttonStyle) {
        buttons = buildSkillActionButtons(profile.skills, buttonStyle, action);

        if (buttons.length > 0) {
            items = items.concat({
                type: 'actions',
                elements: buttons
            } as any);
        }

    } else {
        const fields = buildReadOnlySkills(profile.skills);

        if (fields.length > 0) {
            items = items.concat({
                type: 'actions',
                elements: fields
            } as any);
        }
    }

    items = items.concat({
        type: 'divider'
    } as any);

    return items;
};

export const profileNotFoundTemplate = () => {
    return {
        text: `Mentor profile not found. To create the profile use */kudos [@mentor] [skillName]*`,
        replace_original: false
    }
};

export const profileMissingAtCharacter = () => {
    return {
        text: `To check someone's mentor profile start typing the name with the  \`@\` character for example: \`/profile @John\``,
        replace_original: false
    }
};

export const skillStatusUpdatedTemplate = (skillName: string, isActivate: boolean) => {
    let message = '';

    if (isActivate) {
        message = `The skill *${skillName}* has been added to your profile`;
    } else {
        message = `The skill *${skillName}* will not be visible in your profile`;
    }
    return {
        text: message,
        replace_original: true
    }
};

export const skillReactivatedTemplate = () => {
    return {
        text: `The skill was found in your profile and is now active`,
        replace_original: false
    }
};

export const skillNotReactivatedTemplate = () => {
    return {
        text: `The skill is already in your profile, but activation has failed. Please try to reactivate the skill manually `,
        replace_original: false
    }
};

export const skillStatusNotUpdatedTemplate = () => {
    return {
        text: `The status of a skill has been not been updated. Perhaps skill is not added yet?`,
        replace_original: false
    }
};

export const noMentorProfilesFoundTemplate = () => {
    return {
        replace_original: false,
        text: `No mentor profiles found`,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `No mentor profiles found`,
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
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: 'Get random mentoring suggestions'
                },
                accessory: {
                    style: 'primary',
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: ':game_die: Try now!',
                        emoji: true
                    },
                    value: 'ephemeral-lotto'
                }
            }
        ]
    }
};

