import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import World1Scene from './scenes/World1Scene.js';
import World2Scene from './scenes/World2Scene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, World1Scene, World2Scene, GameOverScene, VictoryScene]
};

new Phaser.Game(config);
