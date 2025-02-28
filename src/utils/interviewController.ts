interface DialogueNode {
    id: string;
    text: string;
    options: DialogueOption[];
    onEnter?: (state: ConversationState) => void;
}

interface DialogueOption {
    text: string;
    nextNodeId: string | null;
    onSelect?: (state: ConversationState) => void;
}

enum ConversationStatus {
    InProgress = 'IN_PROGRESS',
    Completed = 'COMPLETED',
}

interface ConversationState {
    currentNodeId: string;
    status: ConversationStatus;
}

export class Interview {
    private dialogueTree: Map<string, DialogueNode>;
    private state: ConversationState;

    constructor(startNodeId: string) {
        this.dialogueTree = new Map();
        this.state = {
            currentNodeId: startNodeId,
            status: ConversationStatus.InProgress,
        };
    }
    
    addNode(node: DialogueNode) {
        this.dialogueTree.set(node.id, node);
    }

    getCurrentNode(): DialogueNode | null {
        return this.dialogueTree.get(this.state.currentNodeId) || null;
    }

    processUserResponse(optionIndex: number) {
        const currentNode = this.getCurrentNode();
        if (!currentNode) {
            throw new Error('No current node found');
        }
        if (optionIndex < 0 || optionIndex >= currentNode.options.length) {
            throw new Error('Invalid option index');
        }

        const selectedOption = currentNode.options[optionIndex];

        if (selectedOption.onSelect) {
            selectedOption.onSelect(this.state);
        
    }
    if (selectedOption.nextNodeId) {
        this.state.currentNodeId = selectedOption.nextNodeId;
        const nextNode = this.getCurrentNode();
        if (nextNode?.onEnter) {
            nextNode.onEnter(this.state);
            }
        
    } else {
        this.state.status = ConversationStatus.Completed;
    }
}

updateStatus(status: ConversationStatus) {
    this.state.status = status;
}

saveState() {
    return JSON.stringify(this.state);
}

loadState(savedState: string){
    try {
        this.state = JSON.parse(savedState);
    } catch (error) {
        console.error('Error loading state:', error);
    }
}

}







