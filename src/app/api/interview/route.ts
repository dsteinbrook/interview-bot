import { Interview } from "@/utils/interviewController";
import {NextResponse} from 'next/server';

const interview = new Interview('start');

interview.addNode({
    id: 'start',
    text: 'Hello! Are you currently open to discussing the forklift operator role?',
    options: [
        {
            text: 'Yes',
            nextNodeId: 'open_to_discuss',
        },
        {
            text: 'No',
            nextNodeId: null,
        }
    ]
});

interview.addNode({
    id: 'open_to_discuss',
    text: 'Great! I can send you some more information about the role and the application process.',
    options: [
        
    ]
});
