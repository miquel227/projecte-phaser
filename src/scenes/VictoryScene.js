export default class VictoryScene extends Phaser.Scene {
    constructor() { super('VictoryScene'); }

    init(data) {
        this.finalScore = data.score ?? 0;
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x0d1a0d);

        // Partícules de confeti simulades
        this.confetti = [];
        for (let i = 0; i < 50; i++) {
            const colors = [0xffd700, 0xff4500, 0x00e5ff, 0xff69b4, 0x00ff7f];
            const c = this.add.rectangle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(-50, height),
                Phaser.Math.Between(6, 14),
                Phaser.Math.Between(6, 14),
                Phaser.Utils.Array.GetRandom(colors)
            );
            this.confetti.push({ obj: c, speed: Phaser.Math.FloatBetween(1, 3), angle: Phaser.Math.FloatBetween(0, 360) });
        }

        this.add.text(width / 2, 100, '🏆 VICTÒRIA! 🏆', {
            fontSize: '64px', fontFamily: 'Arial Black',
            fill: '#ffd700', stroke: '#8b6914', strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(width / 2, 185, 'Has completat tots els mons!', {
            fontSize: '26px', fontFamily: 'Arial', fill: '#00ff7f'
        }).setOrigin(0.5);

        // Puntuació
        this.add.rectangle(width / 2, 270, 400, 80, 0x1a3a1a).setStrokeStyle(3, 0xffd700);
        this.add.text(width / 2, 255, 'PUNTUACIÓ FINAL', {
            fontSize: '18px', fontFamily: 'Arial', fill: '#90caf9'
        }).setOrigin(0.5);
        this.add.text(width / 2, 285, `${this.finalScore} punts`, {
            fontSize: '36px', fontFamily: 'Arial Black',
            fill: '#ffd700', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5);

        // Classificació
        let rank = 'Novell';
        if (this.finalScore >= 1000) rank = 'Mestre';
        else if (this.finalScore >= 600) rank = 'Expert';
        else if (this.finalScore >= 300) rank = 'Aventurer';
        this.add.text(width / 2, 340, `Rang: ${rank}`, {
            fontSize: '22px', fontFamily: 'Arial Bold', fill: '#ff69b4'
        }).setOrigin(0.5);

        // Botó menú
        const menuBtn = this.add.text(width / 2, 410, '↩ TORNAR AL MENÚ', {
            fontSize: '30px', fontFamily: 'Arial Black',
            fill: '#ffffff', backgroundColor: '#1b5e20',
            padding: { x: 25, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tweens.add({ targets: menuBtn, scaleX: 1.05, scaleY: 1.05, duration: 700, yoyo: true, repeat: -1 });

        menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#ffd700' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#ffffff' }));
        menuBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('MenuScene'));
        });

        // Botó jugar de nou
        const playBtn = this.add.text(width / 2, 470, '▶ JUGAR DE NOU', {
            fontSize: '24px', fontFamily: 'Arial Black',
            fill: '#ffffff', backgroundColor: '#0d47a1',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        playBtn.on('pointerover', () => playBtn.setStyle({ fill: '#ffd700' }));
        playBtn.on('pointerout', () => playBtn.setStyle({ fill: '#ffffff' }));
        playBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('World1Scene', { lives: 3, score: 0 }));
        });

        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    update() {
        this.confetti.forEach(c => {
            c.obj.y += c.speed;
            c.obj.angle += 2;
            if (c.obj.y > this.scale.height + 20) {
                c.obj.y = -20;
                c.obj.x = Phaser.Math.Between(0, this.scale.width);
            }
        });
    }
}
