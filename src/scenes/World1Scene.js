export default class World1Scene extends Phaser.Scene {
    constructor() { super('World1Scene'); }

    init(data) {
        this.lives = data.lives ?? 3;
        this.score = data.score ?? 0;
        this.invincible = false;
    }

    create() {
        const WORLD_WIDTH = 3200;
        const HEIGHT = 500;

        this.worldWidth = WORLD_WIDTH;

        // Fons (tiled)
        for (let x = 0; x < WORLD_WIDTH; x += 800) {
            this.add.image(x + 400, HEIGHT / 2, 'bg1').setScrollFactor(0.3);
        }

        // Grups
        this.platforms = this.physics.add.staticGroup();
        this.coins = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.hazards = this.physics.add.staticGroup();

        this.buildLevel(WORLD_WIDTH, HEIGHT);

        // Jugador
        this.player = this.physics.add.sprite(100, 380, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(28, 44);

        // Animacions
        this.createAnimations();

        // Col·lisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.bullets, this.platforms, (b) => b.destroy());

        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.hitHazard, null, this);
        this.physics.add.overlap(this.bullets, this.enemies, this.killEnemy, null, this);

        // Portal
        this.portal = this.physics.add.staticSprite(WORLD_WIDTH - 80, HEIGHT - 160, 'portal');
        this.portal.body.setSize(50, 100);
        this.physics.add.overlap(this.player, this.portal, this.nextWorld, null, this);

        // Límits món
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, HEIGHT);

        // Càmera
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.fadeIn(600, 0, 0, 0);

        // Interfície HUD
        this.createHUD();

        // Teclat
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            fire: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        this.lastFired = 0;
        this.enemyTimer = this.time.addEvent({
            delay: 2000, callback: this.updateEnemies, callbackScope: this, loop: true
        });

        // Text "Món 1"
        const worldText = this.add.text(400, 200, 'MÓN 1', {
            fontSize: '72px', fontFamily: 'Arial Black',
            fill: '#ffffff', stroke: '#000000', strokeThickness: 8, alpha: 0.8
        }).setOrigin(0.5).setScrollFactor(0);
        this.tweens.add({ targets: worldText, alpha: 0, delay: 1500, duration: 1000 });
    }

    buildLevel(W, H) {
        const ground = (x, y, count) => {
            for (let i = 0; i < count; i++) {
                this.platforms.create(x + i * 32 + 16, y, 'ground').refreshBody();
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

        // Terra principal
        ground(0, H - 16, 40);
        ground(1300, H - 16, 60);
        ground(2600, H - 16, 20);
        // Forats a terra (perill caiguda)
        // Plataformes flotants
        ground(200, 370, 5);
        ground(400, 310, 4);
        ground(600, 250, 6);
        ground(750, 320, 3);
        ground(900, 260, 4);
        ground(1100, 310, 5);
        ground(1350, 340, 4);
        ground(1550, 280, 5);
        ground(1750, 220, 6);
        ground(1950, 290, 4);
        ground(2100, 240, 5);
        ground(2300, 310, 4);
        ground(2500, 350, 6);
        ground(2700, 280, 5);
        ground(2900, 220, 5);
        ground(3000, 290, 5);
        ground(3100, 340, 3);

        // Perill: espines i lava
        spike(500, H - 32); spike(564, H - 32);
        spike(1200, H - 32); spike(1264, H - 32);
        lava(1100, H - 32); lava(1164, H - 32);
        spike(2000, H - 32); spike(2064, H - 32);
        lava(2800, H - 32); lava(2864, H - 32);
        spike(2900, H - 32);

        // Monedes
        const coinPositions = [
            [250,340],[300,340],[350,340],[450,280],[500,280],
            [650,220],[700,220],[800,290],[900,230],[1000,230],
            [1400,310],[1500,310],[1600,250],[1800,190],[1900,190],
            [2000,190],[2150,210],[2200,210],[2350,280],[2550,320],
            [2750,250],[2800,250],[2950,190],[3050,260],[3150,310]
        ];
        coinPositions.forEach(([x, y]) => {
            const c = this.coins.create(x, y, 'coin');
            this.tweens.add({ targets: c, y: y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });

        // Enemics
        const enemyPositions = [300, 600, 850, 1100, 1400, 1700, 2000, 2200, 2500, 2800, 3000];
        enemyPositions.forEach(x => {
            const e = this.enemies.create(x, H - 64, 'enemy');
            e.setVelocityX(Phaser.Math.Between(-80, 80));
            e.setBounce(0); e.setCollideWorldBounds(true);
            e.health = 1;
            e.patrolDir = 1; e.patrolStart = x - 100; e.patrolEnd = x + 100;
        });
    }

    createAnimations() {
        if (!this.anims.exists('walk')) {
            this.anims.create({ key: 'walk', frames: [{ key: 'player' }], frameRate: 8, repeat: -1 });
            this.anims.create({ key: 'idle', frames: [{ key: 'player' }], frameRate: 1, repeat: -1 });
            this.anims.create({ key: 'enemyWalk', frames: [{ key: 'enemy' }], frameRate: 4, repeat: -1 });
        }
    }

    createHUD() {
        // El HUD es fixa a la càmera
        this.hudLives = [];
        for (let i = 0; i < 3; i++) {
            const h = this.add.image(25 + i * 36, 25, 'heart').setScrollFactor(0).setScale(0.9);
            this.hudLives.push(h);
        }
        this.scoreText = this.add.text(10, 55, 'Punts: 0', {
            fontSize: '18px', fontFamily: 'Arial', fill: '#ffd700',
            stroke: '#000', strokeThickness: 3
        }).setScrollFactor(0);

        this.add.text(400, 10, 'MÓN 1', {
            fontSize: '20px', fontFamily: 'Arial Black',
            fill: '#ffffff', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5, 0).setScrollFactor(0);
    }

    updateHUD() {
        this.hudLives.forEach((h, i) => h.setAlpha(i < this.lives ? 1 : 0.2));
        this.scoreText.setText('Punts: ' + this.score);
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.score += 10;
        this.updateHUD();
        // Efecte visual
        const txt = this.add.text(coin.x, coin.y - 20, '+10', {
            fontSize: '16px', fill: '#ffd700', stroke: '#000', strokeThickness: 2
        });
        this.tweens.add({ targets: txt, y: coin.y - 60, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
    }

    hitEnemy(player, enemy) {
        if (this.invincible) return;
        this.takeDamage();
    }

    hitHazard(player, hazard) {
        if (this.invincible) return;
        this.takeDamage();
    }

    takeDamage() {
        this.invincible = true;
        this.lives--;
        this.updateHUD();
        this.cameras.main.shake(300, 0.015);
        this.player.setTint(0xff6666);
        this.time.delayedCall(1500, () => {
            this.invincible = false;
            this.player.clearTint();
        });
        if (this.lives <= 0) {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.time.delayedCall(600, () => {
                this.scene.start('GameOverScene', { score: this.score });
            });
        }
    }

    killEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
        this.score += 50;
        this.updateHUD();
        const txt = this.add.text(enemy.x, enemy.y - 10, '+50', {
            fontSize: '18px', fill: '#ff4500', stroke: '#000', strokeThickness: 2
        });
        this.tweens.add({ targets: txt, y: enemy.y - 60, alpha: 0, duration: 900, onComplete: () => txt.destroy() });
    }

    nextWorld(player, portal) {
        this.cameras.main.fadeOut(700, 0, 200, 200);
        this.time.delayedCall(700, () => {
            this.scene.start('World2Scene', { lives: this.lives, score: this.score });
        });
    }

    updateEnemies() {
        this.enemies.children.each(e => {
            if (!e.active) return;
            if (e.x <= e.patrolStart) e.setVelocityX(80);
            if (e.x >= e.patrolEnd) e.setVelocityX(-80);
            e.flipX = e.body.velocity.x > 0;
        });
    }

    fireBullet() {
        const now = this.time.now;
        if (now - this.lastFired < 350) return;
        this.lastFired = now;
        const dir = this.player.flipX ? -1 : 1;
        const b = this.bullets.create(this.player.x + dir * 20, this.player.y, 'bullet');
        b.setVelocityX(dir * 500);
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

        if (left) { p.setVelocityX(-200); p.flipX = true; }
        else if (right) { p.setVelocityX(200); p.flipX = false; }
        else { p.setVelocityX(0); }

        if (up && onGround) { p.setVelocityY(-520); }
        if (fire) { this.fireBullet(); }

        // Mort per caiguda
        if (p.y > this.scale.height + 50) {
            if (!this.invincible) this.takeDamage();
            p.setPosition(100, 380);
            p.setVelocity(0, 0);
        }

        this.updateHUD();
    }
}
