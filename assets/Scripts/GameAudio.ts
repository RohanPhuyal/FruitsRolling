// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GameState } from "./GameConfig";
import GameStateManager from "./GameStateManager";
import GameUIController from "./GameUIController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameAudio extends cc.Component {

    @property({ type: cc.AudioSource })
    backgrooundSound: cc.AudioSource = null; // Assign the rolling sound in the editor
    @property({ type: cc.AudioSource })
    rollingSound: cc.AudioSource = null; // Assign the rolling sound in the editor

    public static instance: GameAudio = null;

    public static isBackgroundSoundMuted: boolean = false;
    public static isOtherSoundMuted: boolean = false;

    onLoad() {
        if (!GameAudio.instance) {
            GameAudio.instance = this;
        }
    }

    start() {
        // Update the sound playback during the game update loop
        this.schedule(this.checkGameState, 0.1); // Check every 0.1 seconds
    }

    checkGameState() {
        const currentGameState = GameStateManager.currentGameState;

        // Play or stop audio based on the game state
        if (currentGameState === GameState.RollingUp || currentGameState === GameState.RollingDown) {
            if (!this.rollingSound.isPlaying) {
                this.backgrooundSound.volume=0.4;
                this.rollingSound.loop = true; // Enable looping
                this.rollingSound.play();     // Play the sound
            }
        } else {
            if (this.rollingSound.isPlaying) {
                this.backgrooundSound.volume=1;
                this.rollingSound.stop(); // Stop the sound
            }
        }
    }
    muteBackgroundAudio() {
        if (GameAudio.isBackgroundSoundMuted) {
            GameUIController.instance.changeBackgroundAudioIcon();
            this.backgrooundSound.mute = true; //// Enable mute
            this.backgrooundSound.stop();     // Stop the sound
        } else {
            GameUIController.instance.changeBackgroundAudioIcon();
            this.backgrooundSound.loop = true; // Enable looping
            this.backgrooundSound.mute = false; // Disable mute
            this.backgrooundSound.play();     // Play the sound
        }
    }
    muteOtherAudio() {
        if (GameAudio.isOtherSoundMuted) {
            GameUIController.instance.changeOtherAudioIcon();
            this.rollingSound.mute = true; //// Enable mute
            this.rollingSound.stop();     // Stop the sound
        } else {
            GameUIController.instance.changeOtherAudioIcon();
            this.rollingSound.loop = true; // Enable looping
            this.rollingSound.mute = false; // Disable mute
        }
    }
}
