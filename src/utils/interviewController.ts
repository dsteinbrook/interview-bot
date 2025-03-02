interface DialogueNode {
    id: string;
    text: string;
    options: DialogueOption[];
    onEnter?: (state: ConversationState) => void;
}

interface DialogueOption {
    text?: string;
    nextNodeId: string | null;
    onSelect?: (state: ConversationState) => void;
}

export enum ConversationStatus {
    InProgress = 'IN_PROGRESS',
    Completed = 'COMPLETED',
}

export interface ConversationState {
    currentNodeId: string | null;
    status: ConversationStatus;
    userName?: string;
    flags: Record<string, boolean>
}

export class Interview {
    private dialogueTree: Map<string, DialogueNode>;
    private state: ConversationState;

    constructor(startNodeId: string) {
        this.dialogueTree = new Map();
        this.state = {
            currentNodeId: startNodeId,
            status: ConversationStatus.InProgress,
            flags: {}
        };
    }
    
    addNode(node: DialogueNode) {
        this.dialogueTree.set(node.id, node);
    }
    getCurrentNode(): DialogueNode | null {
        if (this.state.currentNodeId === null) {
            return null;
        }
        return this.dialogueTree.get(this.state.currentNodeId) || null;
    }

    processUserResponse(optionIndex: number, userInput?: string) {

        const currentNode = this.getCurrentNode();
        if (!currentNode) {
            throw new Error('No current node found');
        }
        if (optionIndex < 0 || optionIndex >= currentNode.options.length) {
            throw new Error('Invalid option index');
        }

        if (userInput && this.state.flags['collectName']){
            this.setUserName(userInput);
            
            
            console.log('reached here', userInput);
        }

        const selectedOption = currentNode.options[optionIndex];

        if (selectedOption.onSelect) {
            selectedOption.onSelect(this.state);
        
    }
    if (selectedOption.nextNodeId) {
        this.state.currentNodeId = selectedOption.nextNodeId;
        const nextNode = this.getCurrentNode();
        if (this.getFlag('collectName') && nextNode){
            nextNode.text = `Nice to meet you, ${this.getUserName()}! Which location are you applying for?`;
            this.setFlag('collectName', false);
        }
        if (nextNode?.onEnter) {
            nextNode.onEnter(this.state);
            }
        
    } else {
        this.state.status = ConversationStatus.Completed;
        this.state.currentNodeId = null;
    }
}

getAvailableOptions(): string[] {
    const currentNode = this.getCurrentNode();
    if (!currentNode){
        return []
    }
    return currentNode.options.map(
        option => option.text || ''
    ).filter(text => text !== '')
}

getDialogueText(): string {
    const currentNode = this.getCurrentNode();
    if (currentNode === null){
        this.updateStatus(ConversationStatus.Completed)
        return 'The interview is concluded.'
    } else {
        return currentNode.text
    }
}

getStatus(){
    return this.state.status
}

updateStatus(status: ConversationStatus) {
    this.state.status = status;
}

getUserName(){
    return this.state.userName
}

setUserName(userName: string){
    this.state.userName = userName;
}

setFlag(flag: string, value: boolean){
    this.state.flags[flag] = value;
}

getFlag(flag: string){
    return this.state.flags[flag] || false
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







