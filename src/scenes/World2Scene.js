export default class World2Scene extends Phaser.Scene {
    constructor() { super('World2Scene'); }

    init(data) {
        this.lives = data.lives ?? 3;
        this.score = data.score ?? 0;
        this.invincible = false;
    }

    create() {
        const WORLD_WIDTH = 3600;
        const HEIGHT = 500;
        this.worldWidth = WORLD_WIDTH;

        // Fons nocturn (tiled)
        for (let x = 0; x < WORLD_WIDTH; x += 800) {
            this.add.image(x + 400, HEIGHT / 2, 'bg2').setScrollFactor(0.25);
        }

        // Boira/efecte de profunditat
        const fogGraphics = this.add.graphics().setScrollFactor(0);
        fogGraphics.fillGradientStyle(0x0d0d2b, 0x0d0d2b, 0x0d0d2b, 0x0d0d2b, 0, 0, 0.6, 0.6);
        fogGraphics.fillRect(0, 350, 800, 150);

        // Grups
        this.platforms = this.physics.add.staticGroup();
        this.coins = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();
        this.flyingEnemies = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.hazards = this.physics.add.staticGroup();

        this.buildLevel(WORLD_WIDTH, HEIGHT);

        // Jugador
        this.player = this.physics.add.sprite(100, 350, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(28, 44);

        // Col·lisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.bullets, this.platforms, (b) => b.destroy());

        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.flyingEnemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.hitHazard, null, this);
        this.physics.add.overlap(this.bullets, this.enemies, this.killEnemy, null, this);
        this.physics.add.overlap(this.bullets, this.flyingEnemies, this.killEnemy, null, this);

        // Portal final
        this.portal = this.physics.add.staticSprite(WORLD_WIDTH - 80, HEIGHT - 160, 'portal');
        this.portal.body.setSize(50, 100);
        this.physics.add.overlap(this.player, this.portal, this.finishGame, null, this);

        // Límits
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, HEIGHT);
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.fadeIn(600, 0, 0, 0);

        // HUD
        this.createHUD();

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            fire: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        this.lastFired = 0;

        // Text "Món 2"
        const worldText = this.add.text(400, 200, 'MÓN 2', {
            fontSize: '72px', fontFamily: 'Arial Black',
            fill: '#00e5ff', stroke: '#000033', strokeThickness: 8
        }).setOrigin(0.5).setScrollFactor(0);
        this.tweens.add({ targets: worldText, alpha: 0, delay: 1500, duration: 1000 });

        // Enemics voladors
        this.flyingTimer = this.time.addEvent({
            delay: 1500, callback: this.moveFlyingEnemies, callbackScope: this, loop: true
        });
    }

    buildLevel(W, H) {
        const ground = (x, y, count, tex = 'ground2') => {
            for (let i = 0; i < count; i++) {
                this.platforms.create(x + i * 32 + 16, y, tex).refreshBody();
            }
        };
        const spike = (x, y) => {
            const s = this.hazards.create(x, y, 'spikes').refreshBody();
            s.body.setSize(64, 20).setOffset(0, 12);
        };
        const lava = (x, y) => {
            const l = this.hazards.create(x, y, 'lava').refreshBody();
            l.body.setSize(64, 20).setOffset(0, 12);
        };

        // Terra
        ground(0, H - 16, 35);
        ground(1200, H - 16, 30);
        ground(2200, H - 16, 20);
        ground(3000, H - 16, 20);

        // Plataformes (disposició més difícil)
        ground(200, 380, 4); ground(350, 320, 3); ground(500, 260, 5);
        ground(700, 310, 4); ground(850, 380, 3); ground(1000, 300, 4);
        ground(1250, 350, 4); ground(1450, 270, 5); ground(1650, 320, 3);
        ground(1800, 250, 4); ground(2000, 310, 5); ground(2200, 370, 3);
        ground(2350, 290, 4); ground(2550, 230, 5); ground(2750, 300, 4);
        ground(2900, 240, 5); ground(3050, 310, 3); ground(3200, 280, 5);
        ground(3400, 220, 4);

        // Perills (més nombrosos)
        spike(300, H - 32); spike(364, H - 32); spike(428, H - 32);
        lava(600, H - 32); lava(664, H - 32); lava(728, H - 32);
        spike(1100, H - 32); spike(1164, H - 32);
        lava(1500, H - 32); lava(1564, H - 32);
        spike(1900, H - 32); spike(1964, H - 32); spike(2028, H - 32);
        lava(2600, H - 32); lava(2664, H - 32);
        spike(2800, H - 32);

        // Monedes
        const coinPositions = [
            [250,350],[300,350],[400,290],[550,230],[600,230],
            [750,280],[900,350],[1050,270],[1300,320],[1500,240],
            [1700,290],[1850,220],[1950,220],[2050,280],[2250,340],
            [2400,260],[2600,200],[2800,270],[2950,210],[3100,280],
            [3250,250],[3450,190],[3500,190],[3550,190]
        ];
        coinPositions.forEach(([x, y]) => {
            const c = this.coins.create(x, y, 'coin');
            this.tweens.add({ targets: c, y: y - 10, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        // Enemics terrestres
        [400, 700, 1050, 1400, 1700, 2100, 2400, 2700, 3100, 3300].forEach(x => {
            const e = this.enemies.create(x, H - 64, 'enemy');
            e.setVelocityX(Phaser.Math.Between(-100, 100));
            e.setCollideWorldBounds(true);
            e.health = 1;
            e.patrolStart = x - 120; e.patrolEnd = x + 120;
        });

        // Enemics voladors
        [500, 900, 1300, 1800, 2300, 2700, 3200].forEach(x => {
            const fe = this.flyingEnemies.create(x, Phaser.Math.Between(80, 200), 'enemyFlying');
            fe.body.allowGravity = false;
            fe.setVelocityX(Phaser.Math.Between(-60, 60) || 60);
            fe.baseY = fe.y;
            fe.health = 1;
        });
    }

    createHUD() {
        this.hudLives = [];
        for (let i = 0; i < 3; i++) {
            const h = this.add.image(25 + i * 36, 25, 'heart').setScrollFactor(0).setScale(0.9);
            this.hudLives.push(h);
        }
        this.scoreText = this.add.text(10, 55, 'Punts: 0', {
            fontSize: '18px', fontFamily: 'Arial', fill: '#ffd700',
            stroke: '#000', strokeThickness: 3
        }).setScrollFactor(0);
        this.add.text(400, 10, 'MÓN 2', {
            fontSize: '20px', fontFamily: 'Arial Black',
            fill: '#00e5ff', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5, 0).setScrollFactor(0);
    }

    updateHUD() {
        this.hudLives.forEach((h, i) => h.setAlpha(i < this.lives ? 1 : 0.2));
        this.scoreText.setText('Punts: ' + this.score);
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.score += 10;
        const txt = this.add.text(coin.x, coin.y - 20, '+10', {
            fontSize: '16px', fill: '#ffd700', stroke: '#000', strokeThickness: 2
        });
        this.tweens.add({ targets: txt, y: coin.y - 60, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
    }

    hitEnemy(player, enemy) { if (!this.invincible) this.takeDamage(); }
    hitHazard(player, hazard) { if (!this.invincible) this.takeDamage(); }

    takeDamage() {
        this.invincible = true;
        this.lives--;
        this.updateHUD();
        this.cameras.main.shake(300, 0.015);
        this.player.setTint(0xff6666);
        this.time.delayedCall(1500, () => { this.invincible = false; this.player.clearTint(); });
        if (this.lives <= 0) {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.time.delayedCall(600, () => this.scene.start('GameOverScene', { score: this.score }));
        }
    }

    killEnemy(bullet, enemy) {
        bullet.destroy(); enemy.destroy();
        this.score += 50;
    }

    finishGame(player, portal) {
        this.cameras.main.fadeOut(700, 0, 0, 0);
        this.time.delayedCall(700, () => this.scene.start('VictoryScene', { score: this.score }));
    }

    moveFlyingEnemies() {
        this.flyingEnemies.children.each(fe => {
            if (!fe.active) return;
            if (fe.x < 0 || fe.x > this.worldWidth) fe.setVelocityX(-fe.body.velocity.x);
            fe.y = fe.baseY + Math.sin(this.time.now * 0.002) * 30;
            fe.flipX = fe.body.velocity.x < 0;
        });
    }

    fireBullet() {
        const now = this.time.now;
        if (now - this.lastFired < 300) return;
        this.lastFired = now;
        const dir = this.player.flipX ? -1 : 1;
        const b = this.bullets.create(this.player.x + dir * 20, this.player.y, 'bullet');
        b.setVelocityX(dir * 550);
        b.body.allowGravity = false;
        this.time.delayedCall(2000, () => { if (b.active) b.destroy(); });
    }

    update() {
        const p = this.player;
        const onGround = p.body.blocked.down;
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const fire = Phaser.Input.Keyboard.JustDown(this.cursors.space) || Phaser.Input.Keyboard.JustDown(this.wasd.fire);

        if (left) { p.setVelocityX(-220); p.flipX = true; }
        else if (right) { p.setVelocityX(220); p.flipX = false; }
        else { p.setVelocityX(0); }

        if (up && onGround) { p.setVelocityY(-540); }
        if (fire) { this.fireBullet(); }

        if (p.y > this.scale.height + 50) {
            if (!this.invincible) this.takeDamage();
            p.setPosition(100, 350);
            p.setVelocity(0, 0);
        }

        // Enemics voladors segueixen al jugador (IA lleugera)
        this.flyingEnemies.children.each(fe => {
            if (!fe.active) return;
            const dist = Phaser.Math.Distance.Between(fe.x, fe.y, p.x, p.y);
            if (dist < 300) {
                const angle = Phaser.Math.Angle.Between(fe.x, fe.y, p.x, p.y);
                fe.setVelocityX(Math.cos(angle) * 80);
            }
        });

        // Enemic terrestre patrol
        this.enemies.children.each(e => {
            if (!e.active) return;
            if (e.x <= e.patrolStart) e.setVelocityX(100);
            if (e.x >= e.patrolEnd) e.setVelocityX(-100);
            e.flipX = e.body.velocity.x > 0;
        });

        this.updateHUD();
    }
}
