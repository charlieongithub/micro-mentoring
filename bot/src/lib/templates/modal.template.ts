import {userProfileItemTemplate} from './profile.template';

export const searchTemplate = (triggerId: string) => {
  return {
      trigger_id: triggerId,
      view: {
          type: 'modal',
          callback_id: 'search-modal',
          title: {
              type: 'plain_text',
              text: 'Find a mentor'
          },
          submit: {
              type: 'plain_text',
              text: 'Search'
          },
          blocks: [
              {
                  type: 'section',
                  block_id: 'section-identifier',
                  text: {
                      type: 'mrkdwn',
                      text: '*Welcome* to beta version of mentor directory search. Use input field below to find top mentors with a skill you are looking for:'
                  }
              },
              {
                  block_id: 'skill-search-form',
                  type: 'input',
                  element: {
                      action_id: 'skill-name-value',
                      type: 'external_select',
                      placeholder: {
                          type: 'plain_text',
                          text: 'Start typing',
                          emoji: true
                      },
                      min_query_length: 2
                  },
                  label: {
                      type: 'plain_text',
                      text: 'Skill name',
                      emoji: true
                  }
              }
          ]
      }
  }
};

export const searchResultsTemplate = (initialOption, userProfiles) => {
    let resultItems = new Array();

    console.log('user profiles', JSON.stringify(userProfiles));
    for (const profile of userProfiles) {

        console.log('building user profiles userProfileItemTemplate(profile, \'request-mentoring\', \'primary\')', JSON.stringify(profile), 'request-mentoring', null);

        resultItems = resultItems.concat(userProfileItemTemplate(profile, 'request-mentoring', null));
    }

    if (resultItems.length === 0) {
        resultItems.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `No mentors are teaching *${initialOption.value}* now. Try to find a different skill? :thinking_face:`
            }
        });
    }

    return {
        response_action: 'update',
        view: {
            callback_id: 'search-modal',
            type: 'modal',
            title: {
                type: 'plain_text',
                text: 'Search results'
            },
            submit: {
                type: 'plain_text',
                text: 'Search'
            },
            blocks: [
                {
                    block_id: 'skill-search-form',
                    type: 'input',
                    element: {
                        initial_option: initialOption,
                        action_id: 'skill-name-value',
                        type: 'external_select',
                        placeholder: {
                            type: 'plain_text',
                            text: 'Start typing',
                            emoji: true
                        },
                        min_query_length: 2
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Skill name',
                        emoji: true
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: 'Search results:'
                        }
                    ]
                },
                ...resultItems
            ]
        }
    };
};