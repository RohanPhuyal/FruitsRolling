// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GameConfig, GameState } from "./GameConfig";
import GameStateManager from "./GameStateManager";
import GameUIController from "./GameUIController";

const { ccclass, property } = cc._decorator;


@ccclass
export default class GameController extends cc.Component {

    public static instance: GameController = null;

    @property(cc.Node) fruitsNode: cc.Node = null;
    @property(cc.Label) resultLabel: cc.Label = null;
    @property(cc.JsonAsset) gameData: cc.JsonAsset = null;

    public static fruitsNodeChilds = null;
    // private fruitsNodeChilds = null;

    private currentFruitsNodeChildsPosition: number[] = [];

    private visibleNodes: cc.Node[] = [];

    private snapPoints: number[] = [-254, -127, -0, 127, 254, 381];


    private rollConfig: GameConfig = {
        speed: 250,
        topPosition: 381,
        bottomPosition: -381,
        lowerBound: -127,
        upperBound: 127
    }


    onLoad() {
        if (!GameController.instance) {
            GameController.instance = this;
        }
        GameController.fruitsNodeChilds = this.fruitsNode.children;
    }


    // start() {
    // }

    //reset the value of visibleNodes array and also position of fruits
    resetPosition() {
        GameUIController.instance.assignTexture(GameStateManager.shuffledValues);
        this.visibleNodes = [];
        this.resultLabel.string = "Result:                         ";
        for (let index = 0; index < this.snapPoints.length; index++) {
            GameController.fruitsNodeChilds[index].position = cc.v3(0, this.snapPoints[index], 0);
        }
    }

    //roll the reel down
    startRollingDown(dt) {
        for (let i = 0; i < GameController.fruitsNodeChilds.length; i++) {
            const value = GameController.fruitsNodeChilds[i];

            value.position = value.position.add(cc.v3(0, -this.rollConfig.speed*dt, 0));

            // Check if the node has reached the bottom
            if (value.position.y <= this.rollConfig.bottomPosition) {
                // Remove the node from the array
                const removedNode = GameController.fruitsNodeChilds.splice(i, 1)[0];

                // Reset its position to the top
                removedNode.position = cc.v3(0, this.rollConfig.topPosition, 0);

                // Push it back to the end of the array
                GameController.fruitsNodeChilds.push(removedNode);

                // Adjust the index due to the splice
                i--;
            }
        }
    }

    //roll the reel up
    startRollingUp(dt) {
        for (let i = 0; i < GameController.fruitsNodeChilds.length; i++) {
            const value = GameController.fruitsNodeChilds[i];

            value.position = value.position.add(cc.v3(0, this.rollConfig.speed*dt, 0));

            // Check if the node has reached or passed the top position
            if (value.position.y >= this.rollConfig.topPosition) {
                // Remove the node from the array (pop from the end)
                const removedNode = GameController.fruitsNodeChilds.pop();

                // Reset its position to the bottom
                removedNode.position = cc.v3(0, this.rollConfig.bottomPosition, 0);

                // Add it back to the start of the array (shift to the front)
                GameController.fruitsNodeChilds.unshift(removedNode);

                // Adjust the index due to the pop
                i--;
            }
        }
    }


    //executed when game is paused
    onGamePause() {
        if (GameStateManager.isPauseStarted) {
            GameController.fruitsNodeChilds.forEach((element, index) => {
                this.currentFruitsNodeChildsPosition[index] = element.position.y;
            });
            let completedAnimations = 0;
            this.currentFruitsNodeChildsPosition.sort((a, b) => a - b);
            cc.log(this.currentFruitsNodeChildsPosition);
            cc.log(this.snapPoints);
            const result = this.currentFruitsNodeChildsPosition.map((value, index) => Math.abs(value - (this.snapPoints[index] || 0)));
            cc.log(result);
            // GameStateManager.shuffledValues=(this.gameData.json.data.symbols);
            GameController.fruitsNodeChilds.forEach((node: cc.Node, index: number) => {
                const symbols = this.gameData.json.data.symbols[index];
                cc.resources.load(`Texture/${symbols}`, cc.Texture2D, (err, texture: cc.Texture2D) => {
                    if (!err) {
                        const sprite = node.children[0].getComponent(cc.Sprite);
                        const newSpriteFrame = new cc.SpriteFrame(texture); // Create new SpriteFrame with the loaded texture
                        sprite.spriteFrame = newSpriteFrame; // Assign the new SpriteFrame to the sprite
                    } else {
                        cc.log('Error loading texture:', err);
                    }
                });

                // node.children[0].getComponent(cc.Sprite).spriteFrame;

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
                        if (completedAnimations === GameController.fruitsNodeChilds.length) {
                            cc.log('Visible nodes:', this.visibleNodes);
                            this.calculateResult();
                        }
                    })
                    .start();
            });
            GameStateManager.isPauseStarted = false;
        }
    }
    //function to get result / name of fruits visible
    calculateResult() {
        const visibleNodeName = this.getTextureFileNamesOfVisibleNodes();
        this.resultLabel.string = "Result: " + visibleNodeName[2] + ", " + visibleNodeName[1] + ", " + visibleNodeName[0];
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
                        if (fileName == "487777f7-a8f7-4bea-b78e-bc544cea9051.png") {
                            actualName = "Apple";
                        }
                        if (fileName == "6cdb2f24-dacd-42f3-9d98-c02a4a2d1df3.png") {
                            actualName = "Pineapple";
                        }
                        if (fileName == "d2b2d2ce-88cb-4a8a-8182-743d513646a5.png") {
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
        GameController.fruitsNodeChilds.forEach((node: cc.Node) => {
            cc.log(node.position.y);
            // Check if the node's Y position is within the visible range
            if (node.position.y >= this.rollConfig.lowerBound && node.position.y <= this.rollConfig.upperBound) {
                visibleNodes.push(node);  // Add to visible nodes if in range
            }
        });

        return visibleNodes;
    }


    update(dt) {
        if (GameStateManager.currentGameState === GameState.RollingDown) {
            this.startRollingDown(dt);
        }
        if (GameStateManager.currentGameState === GameState.RollingUp) {
            this.startRollingUp(dt);
        }

        if (GameStateManager.currentGameState === GameState.End) {
            GameStateManager.currentGameState = GameState.Start;
            GameUIController.instance.changeButtonState();
        }
    }
}
