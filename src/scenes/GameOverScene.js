export default class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }

    init(data) {
        this.finalScore = data.score ?? 0;
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x1a0000);

        // Efecte parpelleig vermell
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0.3);
        this.tweens.add({ targets: overlay, alpha: 0, duration: 600, yoyo: true, repeat: 3 });

        this.add.text(width / 2, 130, 'GAME OVER', {
            fontSize: '80px', fontFamily: 'Arial Black',
            fill: '#ff1744', stroke: '#7f0000', strokeThickness: 10
        }).setOrigin(0.5);

        this.add.text(width / 2, 240, 'Has perdut totes les vides!', {
            fontSize: '24px', fontFamily: 'Arial', fill: '#ff6666'
        }).setOrigin(0.5);

        this.add.text(width / 2, 295, `Puntuació final: ${this.finalScore}`, {
            fontSize: '32px', fontFamily: 'Arial Black',
            fill: '#ffd700', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        // Botó tornar al menú
        const menuBtn = this.add.text(width / 2, 380, '↩ TORNAR AL MENÚ', {
            fontSize: '30px', fontFamily: 'Arial Black',
            fill: '#ffffff', backgroundColor: '#c62828',
            padding: { x: 25, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#ffd700' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#ffffff' }));
        menuBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('MenuScene'));
        });

        // Botó intentar de nou
        const retryBtn = this.add.text(width / 2, 445, '▶ TORNAR A INTENTAR', {
            fontSize: '24px', fontFamily: 'Arial Black',
            fill: '#ffffff', backgroundColor: '#1565c0',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryBtn.on('pointerover', () => retryBtn.setStyle({ fill: '#ffd700' }));
        retryBtn.on('pointerout', () => retryBtn.setStyle({ fill: '#ffffff' }));
        retryBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('World1Scene', { lives: 3, score: 0 }));
        });

        this.cameras.main.fadeIn(600, 0, 0, 0);
    }
}
