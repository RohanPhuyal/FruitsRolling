export enum GameState {
    Start=0,
    RollingDown=1,
    RollingUp=2,
    Pause=3,
    End=4
}
export type GameConfig = {
    speed: number,
    topPosition: number,
    bottomPosition: number
}
