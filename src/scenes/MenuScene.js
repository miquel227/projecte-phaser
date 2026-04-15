export default class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        const { width, height } = this.scale;

        // Fons animat
        this.bg = this.add.graphics();
        this.bgAngle = 0;

        this.add.rectangle(width / 2, height / 2, width, height, 0x0d0d2b);

        // Estrelles
        this.stars = [];
        for (let i = 0; i < 60; i++) {
            const s = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height * 0.75),
                Phaser.Math.Between(1, 3),
                0xffffff,
                Phaser.Math.FloatBetween(0.3, 1)
            );
            this.stars.push({ obj: s, speed: Phaser.Math.FloatBetween(0.002, 0.008) });
        }

        // Títol
        this.add.text(width / 2, 120, 'AVENTURA DE', {
            fontSize: '52px', fontFamily: 'Arial Black, Arial',
            fill: '#00e5ff', stroke: '#003366', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(width / 2, 185, 'PLATAFORMES', {
            fontSize: '64px', fontFamily: 'Arial Black, Arial',
            fill: '#ffd700', stroke: '#8b6914', strokeThickness: 8
        }).setOrigin(0.5);

        // Decoració - personatge a la pantalla de menú
        const playerImg = this.add.image(width / 2, 290, 'player').setScale(3);
        this.tweens.add({
            targets: playerImg, y: 280, duration: 800,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // Botó Jugar
        const playBtn = this.add.text(width / 2, 380, '► JUGAR', {
            fontSize: '36px', fontFamily: 'Arial Black',
            fill: '#ffffff', backgroundColor: '#1565c0',
            padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: playBtn, scaleX: 1.05, scaleY: 1.05,
            duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        playBtn.on('pointerover', () => playBtn.setStyle({ fill: '#ffd700' }));
        playBtn.on('pointerout', () => playBtn.setStyle({ fill: '#ffffff' }));
        playBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('World1Scene', { lives: 3, score: 0 });
            });
        });

        // Controls
        this.add.text(width / 2, 455, 'WASD / Fletxes: Moure   ESPAI: Disparar', {
            fontSize: '14px', fontFamily: 'Arial', fill: '#90caf9'
        }).setOrigin(0.5);

        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    update() {
        this.stars.forEach(s => {
            s.obj.alpha = 0.4 + Math.sin(this.time.now * s.speed) * 0.5;
        });
    }
}
