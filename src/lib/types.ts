export type BehavioralDynamics = {
    [key: string]: {
        name: string;
        short: string;
        desc: string;
        science: string;
        color: string;
        low: string;
        high: string;
    };
};

export type OptionTag = {
    [key: string]: number;
};

export type ScenarioOption = {
    text: string;
    tags: OptionTag;
};

export type Scenario = {
    id: number;
    ctx: string;
    q: string;
    sub: string;
    opts: ScenarioOption[];
};

export type Phase = {
    name: string;
    desc: string;
    scenarios: Scenario[];
};

export type CognitiveQuestion = {
    id: string;
    level: number;
    ctx: string;
    q: string;
    opts: string[];
    correct: number;
    explain: string;
};

export type CognitiveScheduleItem = {
    after: string;
    questions: number[];
};

export type OpenQuestion = {
    ctx: string;
    q: string;
    sub: string;
    placeholder: string;
};

export type Point = {
    x: number;
    y: number;
    t: number;
};

export type HoverEvent = {
    opt: number;
    t: number;
};

export type Answer = {
    scenarioId: number;
    choice: number;
    tags: OptionTag;
    time: number;
    firstMove: number;
    hoverChanges: number;
    moveCount: number;
    pathComplexity: number;
    uniqueHovers: number;
    hoverSequence: HoverEvent[];
    optionDwellTimes: number[];
    pathPoints: number; // Storing count to avoid huge payload in store, actual points can be separate if needed
};

export type CognitiveAnswer = {
    questionId: string;
    choice: number;
    time: number;
    correct: boolean;
};

export type AppState = {
    phase: 'intro' | 'transition' | 'scenario' | 'cognitive' | 'openq' | 'result';
    currentPhaseIndex: number;
    currentScenarioIndex: number;
    globalScenarioIndex: number;
    globalStep: number;
    totalSteps: number;

    answers: Answer[];
    cogAnswers: CognitiveAnswer[];
    openAnswer: string;

    cogQueueIndex: number;
    cogBatch: number[]; // Indices of COGNITIVE array
    analysis: string | null;
};
