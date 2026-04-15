export default class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        // Genera gràfics procedurals (no cal arxius externs)
        this.generateAssets();
    }

    generateAssets() {
        const g = this.make.graphics({ add: false });

        // Personatge (32x48)
        g.clear();
        g.fillStyle(0x4a90d9); g.fillRect(0, 0, 32, 48);       // cos
        g.fillStyle(0xf5cba7); g.fillRect(8, 0, 16, 16);        // cap
        g.fillStyle(0xff4500); g.fillRect(6, -4, 20, 8);        // barret
        g.fillStyle(0x2c3e50); g.fillRect(8, 32, 6, 16);        // cama e
        g.fillStyle(0x2c3e50); g.fillRect(18, 32, 6, 16);       // cama d
        g.generateTexture('player', 32, 48);

        // Terra / plataforma
        g.clear();
        g.fillStyle(0x5d4037); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x4caf50); g.fillRect(0, 0, 32, 8);
        g.fillStyle(0x388e3c); g.fillRect(0, 0, 32, 3);
        g.generateTexture('ground', 32, 32);

        // Moneda
        g.clear();
        g.fillStyle(0xffd700); g.fillCircle(12, 12, 12);
        g.fillStyle(0xffa000); g.fillCircle(12, 12, 8);
        g.generateTexture('coin', 24, 24);

        // Enemic bàsic
        g.clear();
        g.fillStyle(0xe74c3c); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0xc0392b); g.fillRect(4, 4, 8, 8);
        g.fillStyle(0xc0392b); g.fillRect(20, 4, 8, 8);
        g.fillStyle(0x000); g.fillRect(8, 20, 16, 4);
        g.generateTexture('enemy', 32, 32);

        // Enemic 2 (volador)
        g.clear();
        g.fillStyle(0x8e44ad); g.fillRect(0, 8, 32, 20);
        g.fillStyle(0x9b59b6); g.fillRect(0, 0, 14, 16);
        g.fillStyle(0x9b59b6); g.fillRect(18, 0, 14, 16);
        g.fillStyle(0xfff); g.fillCircle(8, 14, 4); g.fillCircle(24, 14, 4);
        g.generateTexture('enemyFlying', 32, 28);

        // Bala
        g.clear();
        g.fillStyle(0xffeb3b); g.fillCircle(6, 6, 6);
        g.generateTexture('bullet', 12, 12);

        // Portal
        g.clear();
        g.fillStyle(0x00bcd4, 0.8); g.fillEllipse(30, 60, 60, 120);
        g.lineStyle(4, 0x00e5ff); g.strokeEllipse(30, 60, 60, 120);
        g.generateTexture('portal', 60, 120);

        // Perill - espines
        g.clear();
        for (let i = 0; i < 4; i++) {
            g.fillStyle(0x607d8b);
            g.fillTriangle(i * 16, 32, i * 16 + 8, 0, i * 16 + 16, 32);
        }
        g.generateTexture('spikes', 64, 32);

        // Perill - lava
        g.clear();
        g.fillStyle(0xff5722); g.fillRect(0, 0, 64, 32);
        g.fillStyle(0xff9800);
        for (let i = 0; i < 5; i++) {
            g.fillCircle(6 + i * 13, 16, 8);
        }
        g.generateTexture('lava', 64, 32);

        // Fons Món 1 (cel blau)
        g.clear();
        g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4fc3f7, 0x4fc3f7);
        g.fillRect(0, 0, 800, 500);
        // núvols
        g.fillStyle(0xffffff, 0.9);
        g.fillEllipse(100, 80, 120, 60); g.fillEllipse(300, 50, 100, 50);
        g.fillEllipse(600, 90, 140, 65); g.fillEllipse(750, 60, 90, 45);
        g.generateTexture('bg1', 800, 500);

        // Fons Món 2 (nit/coves)
        g.clear();
        g.fillGradientStyle(0x0d0d2b, 0x0d0d2b, 0x1a1a4e, 0x1a1a4e);
        g.fillRect(0, 0, 800, 500);
        g.fillStyle(0xffffff);
        for (let i = 0; i < 40; i++) {
            g.fillCircle(Math.random() * 800, Math.random() * 300, Math.random() * 2 + 1);
        }
        g.generateTexture('bg2', 800, 500);

        // Plataforma fosca
        g.clear();
        g.fillStyle(0x3e2723); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x6d4c41); g.fillRect(0, 0, 32, 6);
        g.generateTexture('ground2', 32, 32);

        // Corazón (vida)
        g.clear();
        g.fillStyle(0xff1744);
        g.fillCircle(8, 8, 8); g.fillCircle(22, 8, 8);
        g.fillTriangle(0, 10, 30, 10, 15, 28);
        g.generateTexture('heart', 30, 28);

        g.destroy();
    }

    create() {
        this.scene.start('MenuScene');
    }
}
