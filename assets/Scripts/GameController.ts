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
    @property(cc.Label) resultLabel: cc.Label = null;
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

    private visibleNodes: cc.Node[] = [];

    private snapPoints: number[] = [-254, -127, -0, 127, 254, 381];


    private moveDown: boolean = null;

    private isPauseStarted: boolean = false;
    
    private rollConfig: GameConfig = {
        speed: 25,
        topPosition: 381,
        bottomPosition: -381,
        lowerBound: -127,
        upperBound: 127
    }

    //function to shuffle the fruit sprites
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

    //reset the value of visibleNodes array and also position of fruits
    resetPosition() {
        this.visibleNodes = [];
        this.resultLabel.string="Result:                         ";
        for (let index = 0; index < this.snapPoints.length; index++) {
            this.fruitsNodeChilds[index].position = cc.v3(0, this.snapPoints[index], 0);
        }
    }

    //start roll up event
    onUpButtonClick() {
        this.resetPosition();
        this.currentGameState = GameState.Pause;
        this.changeButtonState();
        this.moveDown = false;
        this.currentGameState = GameState.RollingUp;
        this.changeButtonState();
    }

    //start roll down event
    onDownButtonClick() {
        this.resetPosition();
        this.currentGameState = GameState.Pause;
        this.changeButtonState();
        this.moveDown = true;
        this.currentGameState = GameState.RollingDown;
        this.changeButtonState();
    }


    //function to pause or contunute the roll 
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
            this.onGamePause();
        }
    }

    //not currently used (used for game start/stop)
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

    //change button state during different gamestate
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

    //roll the reel down
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

    //roll the reel up
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

    //executed when game is paused
    onGamePause() {
        if (this.isPauseStarted) {
            this.fruitsNodeChilds.forEach((element, index) => {
                this.currentFruitsNodeChildsPosition[index] = element.position.y;
            });
            let completedAnimations = 0;
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
                    .call(() => {
                        if (node.position.y >= this.rollConfig.lowerBound && node.position.y <= this.rollConfig.upperBound) {
                            this.visibleNodes.push(node);  // Add to visible nodes if in range
                        }
                        completedAnimations++;
                        if (completedAnimations === this.fruitsNodeChilds.length) {
                            cc.log('Visible nodes:', this.visibleNodes);
                            this.calculateResult();
                        }
                    })
                    .start();
            });
            this.isPauseStarted = false;
        }
    }
    //function to get result / name of fruits visible
    calculateResult() {
        const visibleNodeName = this.getTextureFileNamesOfVisibleNodes();
        this.resultLabel.string="Result: "+visibleNodeName[2]+ ", "+visibleNodeName[1]+", "+visibleNodeName[0];
        cc.log("Name: " + visibleNodeName);
    }
    // Function to get the texture URLs of the children of visible nodes
    getTextureFileNamesOfVisibleNodes() {
        const textureFileNames: string[] = [];
    
        // Loop through each visible node
        this.visibleNodes.forEach((node: cc.Node) => {
            if (node.children.length > 0) {
                const childNode = node.children[0];  // Assuming the first child has the sprite component
                const sprite = childNode.getComponent(cc.Sprite);
    
                if (sprite && sprite.spriteFrame) {
                    // Get the texture from the sprite frame
                    const texture = sprite.spriteFrame.getTexture();
                    if (texture) {
                        // Get the internal path (e.g., assets/others/native/48/487777f7-a8f7-4bea-b78e-bc544cea9051.png)
                        const fullPath = texture.nativeUrl;
    
                        // Extract the file name from the full path
                        const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
                        let actualName: string;
                        if(fileName=="487777f7-a8f7-4bea-b78e-bc544cea9051.png"){
                            actualName = "Apple";
                        }
                        if(fileName=="6cdb2f24-dacd-42f3-9d98-c02a4a2d1df3.png"){
                            actualName = "Pineapple";
                        }
                        if(fileName=="d2b2d2ce-88cb-4a8a-8182-743d513646a5.png"){
                            actualName = "Cherry";
                        }

    
                        // Add the file name (e.g., 487777f7-a8f7-4bea-b78e-bc544cea9051.png)
                        textureFileNames.push(actualName);
                    }
                }
            }
        });
    
        return textureFileNames;  // Return the array of texture file names
    }
    

    // Function to check which nodes are in the visible zone
    getVisibleNodes(): cc.Node[] {
        const visibleNodes: cc.Node[] = [];

        // Loop through the fruits nodes and check their Y position
        this.fruitsNodeChilds.forEach((node: cc.Node) => {
            cc.log(node.position.y);
            // Check if the node's Y position is within the visible range
            if (node.position.y >= this.rollConfig.lowerBound && node.position.y <= this.rollConfig.upperBound) {
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
        // if (this.currentGameState === GameState.Pause) {

        //     this.onGamePause(dt);
        // }
        if (this.currentGameState === GameState.End) {
            this.currentGameState = GameState.Start;
            this.changeButtonState();
        }
    }
}
