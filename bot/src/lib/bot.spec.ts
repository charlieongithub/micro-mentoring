import * as Bot from './bot';
import {createSkillsMap, stripChars} from './bot';
import expressions from './util/expressions';
import {parseText} from './util/slack';

let web;

beforeEach(() => {
    web = {
        chat: {
            postMessage: () => Promise.resolve()
        },
        reactions: {
            add: () => Promise.resolve()
        }
    };

    jest.spyOn(web.chat, 'postMessage');
    jest.spyOn(web.reactions, 'add');
});


describe('direct message', () => {
    test('Should offer CTO services', () => {
        const channel = 'D1234567890';

        Bot.processMessage({event: {subtype: null, text: 'time?', channel}}, web, expressions);

        expect(web.chat.postMessage).toHaveBeenCalledWith({
            channel,
            text: 'There is this Chief Time Officer @ Core Team, tell him I sent you!'
        });
    });

    test('Should offer training with Ali himself', () => {
        const channel = 'D1234567890';

        Bot.processMessage({event: {text: 'I was looking into boxing training - looks like a good workout?', channel}}, web, expressions);

        expect(web.chat.postMessage).toHaveBeenCalledWith({
            channel,
            text: 'Muhammad Ali is your man!'
        });
    });

    test('Should offer training with Rodney Mullen himself', () => {
        const channel = 'D1234567890';

        Bot.processMessage({event: {text: 'I was looking to go for some professional skateboarding training camp?', channel}}, web, expressions);

        expect(web.chat.postMessage).toHaveBeenCalledWith({
            channel,
            text: 'Rodney Mullen is your man!'
        });
    });

    test('Should offer snowboarding training', () => {
        const channel = 'D1234567890';

        Bot.processMessage({event: {text: 'I was looking to go for some professional snowboarding training camp?', channel}}, web, expressions);

        expect(web.chat.postMessage).toHaveBeenCalledWith({
            channel,
            text: 'Talk to <@123> about *snowboarding training*'
        });
        expect(web.reactions.add).not.toHaveBeenCalled();
    });

    test('Should offer help even if skill provided in plural', () => {
        const channel = 'D1234567890';

        Bot.processMessage({event: {text: 'I was looking to go for some sprite designs?', channel}}, web, expressions);

        expect(web.chat.postMessage).toHaveBeenCalledWith({
            channel,
            text: 'Talk to <@123> about *sprite design*'
        });
    });

    test('Should offer help even if skill is saved in plural and provided in singular', () => {
        const channel = 'D1234567890';

        Bot.processMessage({event:{text: 'Is anybody good at 3d printer?', channel}}, web, expressions);

        expect(web.chat.postMessage).toHaveBeenCalledWith({
            channel,
            text: 'Talk to <@123> about *3d printers*'
        });
    });

    test('Should offer help even if skill is saved in plural and provided in singular and followed by question mark', () => {
        const channel = 'D1234567890';

        Bot.processMessage({event: {text: 'Is anybody good at 3d printer?', channel}}, web, expressions);

        expect(web.chat.postMessage).toHaveBeenCalledWith({
            channel,
            text: 'Talk to <@123> about *3d printers*'
        });
    });
});

describe('unit test', () => {

    test('should strip string 1', () =>
    {
        const userInput = 'kudos2?';

        expect(stripChars(userInput)).toBe(`kudos2?`);
    });

    test('should strip string', () =>
    {
        const userInput = 'http://google.com/?q google.com @john_travolta #kudos `code` *bold* ~ @';

        expect(stripChars(userInput)).toBe(`google.com  kudos code bold`);
    });

    test('Should build skill map', () => {
            const userProfilesArray = [
                {
                    "userId": "123",
                    "realName": "Karol",
                    "image": null,
                    "skills": [
                        {
                            "skillName": "sequelize",
                            "kudos": 0
                        },
                        {
                            "skillName": "funny stuff",
                            "kudos": 1
                        },
                        {
                            "skillName": "snowboarding training",
                            "kudos": 1
                        }
                    ]
                },
                {
                    "userId": "456",
                    "realName": "Example",
                    "image": null,
                    "skills": [
                        {
                            "skillName": "funny stuff",
                            "kudos": 0
                        }
                    ]
                }
            ];

            const normalizedMap = createSkillsMap(userProfilesArray);

            console.log('normalizedMap', JSON.stringify(normalizedMap));
            expect(normalizedMap).toMatchObject([["sequelize",["Talk to <@123> about *sequelize*"]],["funny stuff",["Talk to <@123> about *sequelize*","Talk to <@456> about *funny stuff*"]],["snowboarding training",["Talk to <@123> about *snowboarding training*"]]]);
        }
    );
});

describe('slash commands', () => {
    test('"/kudos @Karol serverless skills" payload is correctly processed', () => {
        const text = '<@UQRAWCCBV|charlie.mma> serverless skills';
        const skillAndMentor = parseText(text);

        expect(skillAndMentor.skillName).toBe('serverless skills');
        expect(skillAndMentor.userId).toBe('UQRAWCCBV');
    });
});
