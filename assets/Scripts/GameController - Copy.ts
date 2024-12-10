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
    private currentFruitsNodeChildsPosition: cc.Vec3[] = [];

    private snapPoints: number[] = [-256.375, -128.627, -0.869, 126.889, 254.647, 382.405];
    // private snapPoints: number[] = [382.405, 254.647, 126.889, -0.869, -128.627, -256.375];


    private moveDown: boolean = null;
    // LIFE-CYCLE CALLBACKS:
    private rollConfig: GameConfig = {
        speed: 25,
        topPosition: 382.405,
        bottomPosition: -384.133,
        lowerBound: -127,
        upperBound: 127
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

    private getNearestSnapPointDown(y: number): number {
        
        cc.log(y);
        // If y is less than -254, snap to 381
        if (y < -254) {
            return 381;
        }
        // Filter snap points to include only those less than or equal to the current position
        const validSnapPoints = this.snapPoints.filter(point => point <= y);

        // If no valid snap points, default to the smallest snap point (move to the bottommost position)
        if (validSnapPoints.length === 0) {
            return Math.min(...this.snapPoints);
        }

        // Find the closest valid snap point
        return validSnapPoints.reduce((prev, curr) =>
            Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
        );
    }

    private getNearestSnapPointUp(y: number): number {
        cc.log(y);
        // If y is less than -254, snap to 381
        if (y > -381 && y < -254) {
            return -254;
        }
        // Filter snap points to include only those greater than or equal to the current position
        const validSnapPoints = this.snapPoints.filter(point => point >= y);

        // If no valid snap points, default to the largest snap point (move to the topmost position)
        if (validSnapPoints.length === 0) {
            return Math.max(...this.snapPoints);
        }

        // Find the closest valid snap point
        return validSnapPoints.reduce((prev, curr) =>
            Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
        );
    }


    snapFruitsPosition() {
        if (this.moveDown) {
            this.fruitsNodeChilds.forEach((node: cc.Node, index: number) => {
                this.currentFruitsNodeChildsPosition[index] = node.position;

                // Get the nearest snap point below or equal to the current position
                const nearestSnap = this.getNearestSnapPointDown(node.position.y);

                // Tween to the calculated position
                cc.tween(node)
                    // .to(0.1, { position: cc.v3(0, nearestSnap, 0) }, { easing: 'cubicOut' })
                    .to(0.1, { position: cc.v3(0, nearestSnap, 0) })
                    .start();
            });
        }

        if (!this.moveDown) {
            this.fruitsNodeChilds.forEach((node: cc.Node, index: number) => {
                this.currentFruitsNodeChildsPosition[index] = node.position;

                // Get the nearest snap point below or equal to the current position
                const nearestSnap = this.getNearestSnapPointUp(node.position.y);

                // Tween to the calculated position
                cc.tween(node)
                    // .to(0.1, { position: cc.v3(0, nearestSnap, 0) }, { easing: 'cubicOut' })
                    .to(0.1, { position: cc.v3(0, nearestSnap, 0) })
                    .start();
            });
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
            this.snapFruitsPosition();
            this.changeButtonState();
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
        this.fruitsNodeChilds.forEach((value: cc.Node) => {
            value.position = value.position.add(cc.v3(0, -this.rollConfig.speed, 0));
            if (value.position.y <= this.rollConfig.bottomPosition) {
                value.position = cc.v3(0, this.rollConfig.topPosition, 0);
            }
        });
    }
    startRollingUp(dt) {
        this.fruitsNodeChilds.forEach((value: cc.Node) => {
            value.position = value.position.add(cc.v3(0, this.rollConfig.speed, 0));
            if (value.position.y >= this.rollConfig.topPosition) {
                value.position = cc.v3(0, this.rollConfig.bottomPosition, 0);
            }
        });
    }

    update(dt) {
        if (this.currentGameState === GameState.RollingDown) {
            this.startRollingDown(dt);
        }
        if (this.currentGameState === GameState.RollingUp) {
            this.startRollingUp(dt);
        }
        if (this.currentGameState === GameState.End) {
            this.currentGameState = GameState.Start;
            this.changeButtonState();
        }
    }
}
