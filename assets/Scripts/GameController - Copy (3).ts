// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GameConfig, GameState } from "./GameConfig";

const { ccclass, property } = cc._decorator;


@ccclass
export default class GameController extends cc.Component {

    @property(cc.Node) fruitsNode: cc.Node = null;
    @property(cc.Button) playButton: cc.Button = null;
    @property(cc.Button) pauseButton: cc.Button = null;
    @property(cc.Button) directionButton: cc.Button = null;
    @property(cc.SpriteFrame) startButtonSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) stopButtonSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame) playButtonSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) pauseButtonSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame) fruitSprites: cc.SpriteFrame[] = [];

    private startStopButton: cc.Sprite = null;
    private playPauseButton: cc.Sprite = null;
    private currentGameState = GameState.Start;
    private fruitsNodeChilds = null;

    private initialFruitsNodeChildsPosition: cc.Vec3[] = [];
    private currentFruitsNodeChildsPosition: number[] = [];

    private snapPoints: number[] = [-254, -127, -0, 127, 254, 381];


    private moveDown: boolean = null;

    private isPauseStarted: boolean = false;
    // LIFE-CYCLE CALLBACKS:
    private rollConfig: GameConfig = {
        speed: 25,
        topPosition: 381,
        bottomPosition: -381
    }
    private ranodmizeFruits() {
        // Fisher-Yates Sorting Algorithm
        const shuffle = (array: cc.SpriteFrame[]) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const shuffledValues = shuffle(this.fruitSprites);

        // for(let i=0;i<this.fruitsNodeChilds.length;i++){
        //     this.fruitsNodeChilds[0].children[0].getComponent(cc.Sprite).spriteFrame = this.fruitSprites[0];
        //     this.fruitsNodeChilds[1].children[0].getComponent(cc.Sprite).spriteFrame = this.fruitSprites[0];
        //     this.fruitsNodeChilds[2].children[0].getComponent(cc.Sprite).spriteFrame = this.fruitSprites[0];
        //     this.fruitsNodeChilds[3].children[0].getComponent(cc.Sprite).spriteFrame = this.fruitSprites[0];
        //     this.fruitsNodeChilds[4].children[0].getComponent(cc.Sprite).spriteFrame = this.fruitSprites[0];
        //     this.fruitsNodeChilds[5].children[0].getComponent(cc.Sprite).spriteFrame = this.fruitSprites[0];
        // }


        this.fruitsNodeChilds[1].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[0];
        this.fruitsNodeChilds[2].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[1];
        this.fruitsNodeChilds[3].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[2];
        this.fruitsNodeChilds[4].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[0];
        this.fruitsNodeChilds[5].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[1];
        this.fruitsNodeChilds[0].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[2];

    }

    onLoad() {
        this.fruitsNodeChilds = this.fruitsNode.children;
        this.ranodmizeFruits();
    }


    start() {
        this.startStopButton = this.playButton.getComponentInChildren(cc.Sprite);
        this.startStopButton.spriteFrame = this.startButtonSprite;
        this.playPauseButton = this.pauseButton.getComponentInChildren(cc.Sprite);
        this.playPauseButton.spriteFrame = this.pauseButtonSprite;
        for (let index = 0; index < this.fruitsNodeChilds.length; index++) {
            this.initialFruitsNodeChildsPosition[index] = this.fruitsNodeChilds[index].position;
        }
    }
    resetPosition() {
        for (let index = 0; index < this.snapPoints.length; index++) {
            this.fruitsNodeChilds[index].position = cc.v3(0, this.snapPoints[index], 0);
        }
    }




    onUpButtonClick() {
        this.resetPosition();
        this.currentGameState = GameState.Pause;
        this.changeButtonState();
        this.moveDown = false;
        this.currentGameState = GameState.RollingUp;
        this.changeButtonState();
    }
    onDownButtonClick() {
        this.resetPosition();
        this.currentGameState = GameState.Pause;
        this.changeButtonState();
        this.moveDown = true;
        this.currentGameState = GameState.RollingDown;
        this.changeButtonState();
    }



    onPlayPauseButtonClick() {
        if (this.currentGameState === GameState.Pause) {
            if (this.moveDown) {
                this.resetPosition();
                this.currentGameState = GameState.RollingDown;
                this.changeButtonState();
            }
            if (!this.moveDown) {
                this.resetPosition();
                this.currentGameState = GameState.RollingUp;
                this.changeButtonState();
            }
            return;
        }
        if (this.currentGameState === GameState.RollingDown || this.currentGameState === GameState.RollingUp) {

            // Update state
            this.currentGameState = GameState.Pause;
            this.changeButtonState();
            this.isPauseStarted = true;
        }
    }


    onStartStopClick() {
        if (this.currentGameState === GameState.RollingDown) {
            this.currentGameState = GameState.End;
            return;
        }
        if (this.currentGameState === GameState.Start || this.currentGameState === GameState.End) {
            this.currentGameState = GameState.RollingDown;
            this.changeButtonState();
        }

        // cc.tween(this.fruitsNode)
        //     .by(4, {position: cc.v3(0,-500,0) })
        //     .start();
    }

    changeButtonState() {
        if (this.currentGameState === GameState.Start || this.currentGameState === GameState.End) {
            this.startStopButton.spriteFrame = this.startButtonSprite;
            this.playPauseButton.spriteFrame = this.pauseButtonSprite;
        } else {
            this.startStopButton.spriteFrame = this.stopButtonSprite;
            this.playPauseButton.spriteFrame = this.pauseButtonSprite;
        }
        if (this.currentGameState === GameState.Pause) {
            this.playPauseButton.spriteFrame = this.playButtonSprite;
        }
    }

    startRollingDown(dt) {
        for (let i = 0; i < this.fruitsNodeChilds.length; i++) {
            const value = this.fruitsNodeChilds[i];

            value.position = value.position.add(cc.v3(0, -this.rollConfig.speed, 0));

            // Check if the node has reached the bottom
            if (value.position.y <= this.rollConfig.bottomPosition) {
                // Remove the node from the array
                const removedNode = this.fruitsNodeChilds.splice(i, 1)[0];

                // Reset its position to the top
                removedNode.position = cc.v3(0, this.rollConfig.topPosition, 0);

                // Push it back to the end of the array
                this.fruitsNodeChilds.push(removedNode);

                // Adjust the index due to the splice
                i--;
            }
        }
    }


    startRollingUp(dt) {
        for (let i = 0; i < this.fruitsNodeChilds.length; i++) {
            const value = this.fruitsNodeChilds[i];

            value.position = value.position.add(cc.v3(0, this.rollConfig.speed, 0));

            // Check if the node has reached or passed the top position
            if (value.position.y >= this.rollConfig.topPosition) {
                // Remove the node from the array (pop from the end)
                const removedNode = this.fruitsNodeChilds.pop();

                // Reset its position to the bottom
                removedNode.position = cc.v3(0, this.rollConfig.bottomPosition, 0);

                // Add it back to the start of the array (shift to the front)
                this.fruitsNodeChilds.unshift(removedNode);

                // Adjust the index due to the pop
                i--;
            }
        }
    }


    onGamePause(dt) {

        if (this.isPauseStarted) {
            this.fruitsNodeChilds.forEach((element, index) => {
                this.currentFruitsNodeChildsPosition[index] = element.position.y;
            });
            this.currentFruitsNodeChildsPosition.sort((a, b) => a - b);
            cc.log(this.currentFruitsNodeChildsPosition);
            cc.log(this.snapPoints);
            const result = this.currentFruitsNodeChildsPosition.map((value, index) => Math.abs(value - (this.snapPoints[index] || 0)));
            cc.log(result);
            this.fruitsNodeChilds.forEach((node: cc.Node, index: number) => {
                // Get the nearest snap point below or equal to the current position
                const nearestSnap = result[index] + this.currentFruitsNodeChildsPosition[index];

                // Tween to the calculated position
                cc.tween(node)
                    // .to(0.1, { position: cc.v3(0, nearestSnap, 0) }, { easing: 'cubicOut' })
                    .to(0.09, { position: cc.v3(0, nearestSnap, 0) })
                    .start();
            });
            const visibleNodes = this.getVisibleNodes();
            cc.log('Visible nodes:', visibleNodes);
            this.isPauseStarted = false;
        }
    }
    // Function to check which nodes are in the visible zone
    getVisibleNodes(): cc.Node[] {
        const visibleNodes: cc.Node[] = [];

        // Define the visible range
        const lowerBound = -127;
        const upperBound = 127;

        // Loop through the fruits nodes and check their Y position
        this.fruitsNodeChilds.forEach((node: cc.Node) => {
            cc.log(node.position.y);
            // Check if the node's Y position is within the visible range
            if (node.position.y >= lowerBound && node.position.y <= upperBound) {
                visibleNodes.push(node);  // Add to visible nodes if in range
            }
        });

        return visibleNodes;
    }


    update(dt) {
        if (this.currentGameState === GameState.RollingDown) {
            this.startRollingDown(dt);
        }
        if (this.currentGameState === GameState.RollingUp) {
            this.startRollingUp(dt);
        }
        if (this.currentGameState === GameState.Pause) {

            this.onGamePause(dt);
        }
        if (this.currentGameState === GameState.End) {
            this.currentGameState = GameState.Start;
            this.changeButtonState();
        }
    }
}
