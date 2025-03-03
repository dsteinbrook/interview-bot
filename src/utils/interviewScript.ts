import {Interview, ConversationStatus} from './interviewController';

const interview = new Interview('0-0');


//setup interview script
interview.addNode({
    id: '0-0',
    text: 'Hello! Are you currently open to discussing the forklift operator role?',
    options: [
        {
            text: 'Yes',
            nextNodeId: '1-0',
        },
        {
            text: 'No',
            nextNodeId: '0-1',
        },
        {
            text: 'question',
            nextNodeId: '0-2',
            onSelect: () => interview.setFlag('question', true)
        },
        {
            text: 'other',
            nextNodeId: '0-2'
        }
    ]
});

interview.addNode({
    id: '0-1',
    text: 'No problem. Best of luck!',
    onEnter: () => {
        interview.updateStatus(ConversationStatus.Completed)
    },
    options: []

});

interview.addNode({
    id: '0-2',
    text: 'Are you currently open to discussing the forklift operator role?',
    options: [
        {
            text: 'Yes',
            nextNodeId: '1-0',
        },
        {
            text: 'No',
            nextNodeId: '0-1',
        },
        {
            text: 'question',
            nextNodeId: '0-2',
            onSelect: () => interview.setFlag('question', true)
        },
        {
            text: 'other',
            nextNodeId: '0-2'
        }
    ]
})

interview.addNode({
    id: '1-0',
    text: 'Excellent! Let\'s start with some basic information. What is your name?',
    onEnter: () => {
        interview.setFlag('collectName', true)
    },
    options: [
        {
            nextNodeId: '1-1',
        } 
    ]
});

interview.addNode({
    id: '1-1',
    text: `Nice to meet you, ${interview.getUserName()}! Which location are you applying for?`,
    options: [
        {
            text: 'Jersey City',
            nextNodeId: '2-0'
        },
        {
            text: 'Trenton',
            nextNodeId: '2-0'
        },
        {
            text: 'other',
            nextNodeId: '1-2'
        }
    ]
});

interview.addNode({
    id: '1-2',
    text: 'The locations we have available are Jersey City and Trenton. Do either of those work for you?',
    options: [
        {
            text: 'Jersey City',
            nextNodeId: '2-0',

        },
        {
            text: 'Trenton',
            nextNodeId: '2-0'
        },
        {
            text: 'No',
            nextNodeId: '0-1'
        },
        {
            text: 'question',
            nextNodeId: '1-2',
            onSelect: () => interview.setFlag('question', true)
        },
        {
            text: 'other',
            nextNodeId: '1-2'
        }
    ]
});

interview.addNode({
    id: '2-0',
    text: 'Excellent! Let\'s continue. Do you have a valid OSHA forklift certification?',
    options: [
        {
            text: 'Yes',
            nextNodeId: '3-0'
        },
        {
            text: 'No',
            nextNodeId: '2-1'
        },
        {
            text: 'question',
            nextNodeId: '2-0',
            onSelect: () => interview.setFlag('question', true)
        },
        {
            text: 'other',
            nextNodeId: '2-0'
        }
    ]
});

interview.addNode({
        id: '2-1',
        text: 'I\'m sorry, the role requires a valid OSHA certification.',
        onEnter: () => {
            interview.updateStatus(ConversationStatus.Completed)
        },
        options: []
});

interview.addNode({
    id: '3-0',
    text: 'The pay is 25 dollars/hour plus 1.5x overtime. Does that work for you?',
    options: [
       {
        text: 'Yes',
        nextNodeId: '4-0'
       },
       {
        text: 'No',
        nextNodeId: '0-1'
       },
       {
        text: 'other',
        nextNodeId: '3-0'
       } 
    ]
});

interview.addNode(
    {
        id: '4-0',
        text: 'Great! Now let\'s discuss your previous experience. Do you have at least one year of forklift operating experience?',
        options: [
            {
                text: 'Yes',
                nextNodeId: '4-1'
            },
            {
                text: 'No',
                nextNodeId: '4-2'
            },
            {
                text: 'other',
                nextNodeId: '4-3'
            }
        ]
    }
);

interview.addNode({
    id: '4-1',
    text: 'Tell me about your experience',
    options: [
        {
            nextNodeId: '5-0'
        }
    ]
});

interview.addNode({
    id: '4-2',
    text: 'Tell me about some of your other work experience.',
    options: [
        {
            nextNodeId: '5-0'
        }
    ]
});

interview.addNode({
    id: '4-3',
    text: 'Do you have at least one year of forklift operating experience?',
    options: [
        {
            text: 'Yes',
            nextNodeId: '4-1'
        },
        {
            text: 'No',
            nextNodeId: '4-2'
        },
        {
            text: 'other',
            nextNodeId: '4-3'
        }
    ]
});

interview.addNode({
    id: '5-0',
    text: 'Do you have any questions about the role?',
    options: [
        {
            text: 'No',
            nextNodeId: '6-1'
        },
        {
            text: 'question',
            nextNodeId: '5-1',
            onSelect: () => interview.setFlag('question', true)
        },
        {
            text: 'other',
            nextNodeId: '6-1'
        }
    ]
});

interview.addNode({
    id: '5-1',
    text: 'Do you have any other questions?',
    options: [
        {
            text: 'No',
            nextNodeId: '6-1'
        },
        {
            text: 'question',
            nextNodeId: '5-1',
            onSelect: () => interview.setFlag('question', true)
        },
        {
            text: 'other',
            nextNodeId: '6-1'
        }
    ]

});

interview.addNode({
    id: '6-1',
    text: 'Thank you for your time! You will receive an email shortly with a decision and next steps.',
    onEnter: () => {
        interview.updateStatus(ConversationStatus.Completed)
    },
    options: []
});

export default interview;