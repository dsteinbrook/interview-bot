# interview-bot

## usage

clone repo onto local machine (requires sqlite installed, comes by default with macOS) and navigate to root directory.

create a .env file with ```OPENAI_API_KEY=<your key here>```

to run dev environment on http://localhost:3000

```
npm install
npm run create-db
npm run dev
```

## about

The interview bot works by following a script configured for a forklift operator interview (see ```src/utils/interviewScript.ts```) using the interview class declared in ```src/utils/interviewController.ts```. 

The script works by defining a conversation tree, where each node defines the bot's response at that node along with an array of options corresponding to possible user responses, each with a pointer to the next node if that option is selected. The user's responses are classified as one of the available options using openai's structured outputs api (see ```src/utils/openai.ts```).

The bot has the ability to answer users' questions about the role when the user input is classified as a question, by querying the openai api using an ai-generated job description for the forklift operator role. When the user has an unexpected response that doesn't answer the question, the bot is directed using the script to repeat the question.

The interview class saves its state in a sqlite database along with the previous messages so the interviews can be loaded and resumed. When the interview state is set as concluded further user responses are disabled. 


