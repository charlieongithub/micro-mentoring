import {getAppHomeLink} from "../util/slack";

export const onboardingTemplate = async (token) => {
    const appHomeLink = await getAppHomeLink(token, 'about');

    return {
        "type": "home",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Actions*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Click this button to open a skill search popup"
                },
                "accessory": {
                    "type": "button",
                    "style": "primary",
                    "text": {
                        "type": "plain_text",
                        "text": "Find a mentor",
                        "emoji": true
                    },
                    "value": "open-search-modal"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Micro Mentoring Bot*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Have you ever been stuck working on some *Thing*, where 30 minutes talking to an expert on *Thing* over coffee would have unstuck you? The _Micro Mentoring Bot_ is here to help!"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "The _Micro Mentoring Bot_ will help you find experts from across the company or let you tell others about _your_ expertise. You can also give *kudos* to your colleagues for their expertise, to appreciate them for your work."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "> Kudos: public admiration a person receives as a result of a particular achievement or position in society e.g. being an actor has kudos attached to it."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Find a mentor*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "You can find a mentor with the `/who-knows-about` <https://slack.com/intl/en-ch/help/articles/201259356-Use-built-in-slash-commands|slash command> for example;"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "- `/who-knows-about slackbots`\n- `/who-knows-about google analytics`\n- `/who-knows-about OKRs`"
                }
            },
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "Who knows about slackbots?",
                    "emoji": true
                },
                "image_url": "https://tamediadigital.github.io/micromentoringapp/assets/images/who-knows-about.png",
                "alt_text": "Who knows about slackbots?"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Tip*: type `/who-knows-about` without a search term to see all the mentors"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Say \"thanks\" with kudos*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Give kudos to someone you worked with using the `/kudos` <https://slack.com/intl/en-ch/help/articles/201259356-Use-built-in-slash-commands|slash command> for example `/kudos @Karol Charlie slackbots`"
                }
            },
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "Give Kudos!",
                    "emoji": true
                },
                "image_url": "https://tamediadigital.github.io/micromentoringapp/assets/images/kudos.png",
                "alt_text": "Give Kudos!"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Tell people about your skills*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "You can tell people about your own skills using the `/i-know-about` <https://slack.com/intl/en-ch/help/articles/201259356-Use-built-in-slash-commands|slash command> for example;"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "- `/i-know-about slackbots`\n- `/i-know-about google analytics`\n- `/i-know-about OKRs`"
                }
            },
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "I know about stuff!",
                    "emoji": true
                },
                "image_url": "https://tamediadigital.github.io/micromentoringapp/assets/images/i-know-about.png",
                "alt_text": "I know about stuff!"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*See your mentor profile and others*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "You can see your mentor profile simply by typing `/profile`. You can also view other people's profile using `/profile @User Name`."
                }
            },
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "See profiles",
                    "emoji": true
                },
                "image_url": "https://tamediadigital.github.io/micromentoringapp/assets/images/profile.png",
                "alt_text": "See profiles"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Remove a Skill from your Profile*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "You can remove skills from your profile with `/deactivate-skill [skill name]`"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Get tips on who to talk to by inviting the bot to channel*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "If you invite the Micro Mentoring Bot to a channel with `/invite @mma`, when you ask questions it will automatically recommend people on the channel who have the required knowledge."
                }
            },
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "Get recommendation",
                    "emoji": true
                },
                "image_url": "https://tamediadigital.github.io/micromentoringapp/assets/images/recommend.png",
                "alt_text": "Get recommendation"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*More info*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `To get detailed information about all possible commands of the \`@mma\` bot go the the <${appHomeLink}|about tab>`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Maintainers*"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "This project is maintained on github https://github.com/charlieongithub/micro-mentoring."
                }
            }
        ]
    }
};
