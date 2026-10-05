// ============================================================
// ULLI DINO - Core Game Engine
// Manages runner physics, collisions, spawning, input & score
// ============================================================

class UlliDinoGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.renderer = new DoodleRenderer(this.ctx);

        // Virtual game dimensions (Crisp high-resolution canvas)
        this.width = 1000;
        this.height = 360;
        this.groundY = 300;

        // Player configuration (The weird short curly-haired girl)
        this.player = {
            x: 105,
            y: 0,
            width: 48,
            height: 62,
            duckHeight: 34,
            vy: 0,
            gravity: 1650,
            jumpStrength: -680,
            isGrounded: true,
            isJumping: false,
            isDucking: false,
            state: 'RUN', // 'RUN', 'JUMP', 'DUCK', 'CRASH'
            animTime: 0
        };

        // Onion Companion ("കുഞ്ഞു ഉള്ളി") running alongside!
        this.companion = {
            x: 55,
            y: 0,
            vy: 0,
            isGrounded: true,
            state: 'RUN'
        };

        // Active Power-up States
        this.powerUpState = {
            hasShield: false,
            turboTimer: 0, // In seconds
            scoreMultiplier: 1
        };

        // Game parameters
        this.state = 'INIT'; // 'INIT', 'PLAYING', 'GAME_OVER'
        this.baseSpeed = 380;
        this.speed = this.baseSpeed;
        this.maxSpeed = 850;
        this.distance = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('ulli_dino_highscore') || '0', 10);
        this.lastMilestone = 0;

        // Obstacles, Power-ups & Environment
        this.obstacles = [];
        this.powerUps = [];
        this.clouds = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.minSpawnDist = 320;
        this.lastSpawnDist = 0;
        this.lastPowerUpDist = 0;

        // Time tracking
        this.lastTime = 0;
        this.scrollX = 0;

        // Key states
        this.keys = {
            jump: false,
            duck: false
        };

        this.initClouds();
        this.bindEvents();
        this.reset();
    }

    reset() {
        // Immediately hide the Game Over modal on restart
        const gameOverModal = document.getElementById('game-over-modal');
        if (gameOverModal) {
            gameOverModal.classList.remove('visible');
        }

        this.player.y = this.groundY - this.player.height;
        this.player.vy = 0;
        this.player.isGrounded = true;
        this.player.isJumping = false;
        this.player.isDucking = false;
        this.player.state = 'RUN';
        this.player.animTime = 0;

        this.companion.y = this.groundY - 22;
        this.companion.vy = 0;
        this.companion.isGrounded = true;
        this.companion.state = 'RUN';

        this.powerUpState.hasShield = false;
        this.powerUpState.turboTimer = 0;
        this.powerUpState.scoreMultiplier = 1;

        this.speed = this.baseSpeed;
        this.distance = 0;
        this.score = 0;
        this.lastMilestone = 0;
        this.scrollX = 0;
        this.obstacles = [];
        this.powerUps = [];
        this.particles = [];
        this.lastSpawnDist = 0;
        this.lastPowerUpDist = 0;
        this.state = 'PLAYING';

        this.updateScoreUI();
        this.updatePowerUpUI();
    }

    initClouds() {
        this.clouds = [
            { x: 120, y: 50, w: 75, h: 28, speed: 25 },
            { x: 420, y: 80, w: 90, h: 32, speed: 35 },
            { x: 780, y: 40, w: 65, h: 25, speed: 20 },
            { x: 1050, y: 70, w: 85, h: 30, speed: 30 }
        ];
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                e.preventDefault();
                this.handleJumpPress();
            } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                e.preventDefault();
                this.handleDuckPress(true);
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                this.handleJumpRelease();
            } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                this.handleDuckPress(false);
            }
        });

        // Touch & Mouse handlers for mobile / interactive play
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJumpPress();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleJumpRelease();
        }, { passive: false });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.handleJumpPress();
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.handleJumpRelease();
            }
        });
    }

    handleJumpPress() {
        if (this.state === 'GAME_OVER') {
            this.reset();
            return;
        }

        if (this.state === 'INIT') {
            this.state = 'PLAYING';
            this.reset();
        }

        if (this.state !== 'PLAYING') return;

        if (this.player.isGrounded && !this.player.isDucking) {
            this.player.vy = this.player.jumpStrength;
            this.player.isGrounded = false;
            this.player.isJumping = true;
            this.player.state = 'JUMP';

            // Trigger Custom Jump Sound
            if (window.soundManager) {
                window.soundManager.playJump();
            }

            // Companion onion jumps too!
            if (this.companion.isGrounded) {
                setTimeout(() => {
                    if (this.state === 'PLAYING') {
                        this.companion.vy = this.player.jumpStrength * 0.92;
                        this.companion.isGrounded = false;
                        this.companion.state = 'JUMP';
                        if (window.soundManager) {
                            window.soundManager.playCompanionJump();
                        }
                    }
                }, 50);
            }

            // Spawn pencil dust at feet
            this.spawnDust(this.player.x + 20, this.groundY, 8);
        }
    }

    handleJumpRelease() {
        // Variable jump height: releasing early cuts upward velocity
        if (this.player.vy < -250) {
            this.player.vy = -250;
        }
        this.player.isJumping = false;
    }

    handleDuckPress(isDucking) {
        if (this.state !== 'PLAYING') return;

        if (isDucking) {
            this.player.isDucking = true;
            if (this.player.isGrounded) {
                this.player.state = 'DUCK';
                this.companion.state = 'DUCK';
                if (window.soundManager) {
                    window.soundManager.playDuck();
                }
            } else {
                // Fast fall downward if ducking in air!
                this.player.vy += 450;
            }
        } else {
            this.player.isDucking = false;
            if (this.player.isGrounded) {
                this.player.state = 'RUN';
                this.companion.state = 'RUN';
            }
        }
    }

    spawnDust(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 16,
                y: y - Math.random() * 6,
                vx: -this.speed * 0.4 - Math.random() * 60,
                vy: (Math.random() - 0.5) * 40 - 20,
                size: 2 + Math.random() * 3,
                life: 0.35 + Math.random() * 0.2,
                maxLife: 0.5,
                type: 'DUST'
            });
        }
    }

    spawnCrashParticles(x, y) {
        // Comic text burst
        const comicWords = ['CLANG!', 'SHIIING!', 'OUCH!', 'WHAM!', 'BONK!'];
        comicWords.forEach((word, idx) => {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 60,
                y: y - 20 - idx * 22,
                vx: (Math.random() - 0.5) * 120,
                vy: -80 - Math.random() * 100,
                size: 24 + Math.random() * 8,
                life: 1.4,
                maxLife: 1.4,
                text: word,
                color: idx === 0 ? '#e74c3c' : (idx === 1 ? '#d35400' : '#2980b9'),
                type: 'COMIC_TEXT'
            });
        });

        // Stars orbiting
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x + 20,
                y: y + 10,
                vx: (Math.random() - 0.5) * 260,
                vy: -60 - Math.random() * 200,
                size: 4 + Math.random() * 5,
                life: 1.2,
                maxLife: 1.2,
                color: ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6'][i % 4],
                type: 'STAR'
            });
        }

        // Mini screaming onions bouncing away!
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + (i - 1) * 30,
                y: y,
                vx: (i - 1) * 140 + (Math.random() - 0.5) * 40,
                vy: -220 - Math.random() * 100,
                size: 24,
                life: 1.5,
                maxLife: 1.5,
                type: 'ONION'
            });
        }
    }

    spawnObstacle() {
        // Balanced, shorter obstacle dimensions so swords/rods are not excessively long
        const types = [
            { type: 'CHEF_KNIFE', width: 26, height: 40, y: this.groundY - 40 },
            { type: 'CLEAVER', width: 42, height: 44, y: this.groundY - 44 },
            { type: 'BROADSWORD', width: 44, height: 48, y: this.groundY - 48 },
            { type: 'DUAL_DAGGERS', width: 46, height: 40, y: this.groundY - 40 },
            { type: 'TRIPLE_KNIVES', width: 66, height: 38, y: this.groundY - 38 },
            { type: 'ROLLING_PIN', width: 52, height: 34, y: this.groundY - 34 }
        ];

        // Mid/Late game weapon varieties
        if (this.score > 80) {
            types.push({ type: 'FLAMING_SWORD', width: 46, height: 50, y: this.groundY - 50 });
        }

        // Aerial flying weapons: require DUCKING or JUMPING!
        if (this.score > 120 && Math.random() < 0.4) {
            const aerialRnd = Math.random();
            if (aerialRnd < 0.4) {
                // High flying scimitar: requires DUCKING!
                types.push({
                    type: 'FLYING_SCIMITAR',
                    width: 44,
                    height: 32,
                    y: this.groundY - 68
                });
            } else if (aerialRnd < 0.7) {
                // Spinning Shuriken
                types.push({
                    type: 'SHURIKEN',
                    width: 32,
                    height: 32,
                    y: this.groundY - 65
                });
            } else {
                // Flying daggers whistler
                types.push({
                    type: 'FLYING_DAGGER',
                    width: 38,
                    height: 20,
                    y: this.groundY - 64
                });
            }
        }

        const chosen = types[Math.floor(Math.random() * types.length)];
        this.obstacles.push({
            type: chosen.type,
            x: this.width + 40,
            y: chosen.y,
            width: chosen.width,
            height: chosen.height
        });
    }

    spawnPowerUp() {
        // Only spawn the Chilli booster, positioned high in the air so it is 100% optional
        this.powerUps.push({
            type: 'CHILLI',
            x: this.width + 50,
            y: this.groundY - 115 - Math.random() * 20, // High above player's head - optional!
            width: 32,
            height: 32,
            seed: Math.random() * 10
        });
    }

    collectPowerUp(pu) {
        if (pu.type === 'CHILLI') {
            this.powerUpState.turboTimer = 6;
            this.powerUpState.scoreMultiplier = 2;
            if (window.soundManager) window.soundManager.playChilliBoost();
            this.spawnBonusText(this.player.x, this.player.y - 20, '🌶️ 2X TURBO SPEED!', '#e74c3c');
        }
        this.updatePowerUpUI();
    }

    spawnBonusText(x, y, text, color) {
        this.particles.push({
            x: x - 20,
            y: y,
            vx: 0,
            vy: -70,
            size: 20,
            life: 1.2,
            maxLife: 1.2,
            text: text,
            color: color,
            type: 'COMIC_TEXT'
        });
    }

    checkCollision(player, obs) {
        // Generous hitbox padding so near-misses never cause unfair game-overs
        const padX = 14;
        const padY = 10;

        const currentHeight = player.isDucking ? player.duckHeight : player.height;
        const currentY = player.isDucking ? (this.groundY - player.duckHeight) : player.y;

        const pBox = {
            left: player.x + padX,
            right: player.x + player.width - padX,
            top: currentY + padY,
            bottom: currentY + currentHeight - 6
        };

        const oBox = {
            left: obs.x + 10,
            right: obs.x + obs.width - 10,
            top: obs.y + 8,
            bottom: obs.y + obs.height - 4
        };

        return (
            pBox.left < oBox.right &&
            pBox.right > oBox.left &&
            pBox.top < oBox.bottom &&
            pBox.bottom > oBox.top
        );
    }

    gameOver() {
        this.state = 'GAME_OVER';
        this.player.state = 'CRASH';
        this.companion.state = 'CRASH';

        // Custom sword crash sound!
        if (window.soundManager) {
            window.soundManager.playCrash();
        }

        // Spawn dramatic comic particle burst
        this.spawnCrashParticles(this.player.x, this.player.y);

        // Update High Score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('ulli_dino_highscore', this.highScore.toString());
        }

        this.updateScoreUI();
        this.updatePowerUpUI();

        // Notify UI overlay
        if (window.onGameOver) {
            window.onGameOver(this.score, this.highScore);
        }
    }

    update(dt) {
        if (this.state !== 'PLAYING') {
            this.updateParticles(dt);
            return;
        }

        // Turbo Chilli Timer
        if (this.powerUpState.turboTimer > 0) {
            this.powerUpState.turboTimer -= dt;
            if (this.powerUpState.turboTimer <= 0) {
                this.powerUpState.turboTimer = 0;
                this.powerUpState.scoreMultiplier = 1;
                this.updatePowerUpUI();
            }
        }

        // Speed calculation
        const currentEffectiveSpeed = this.speed * (this.powerUpState.turboTimer > 0 ? 1.35 : 1);
        if (this.speed < this.maxSpeed) {
            this.speed += dt * 4;
        }

        // Distance & Score
        this.distance += currentEffectiveSpeed * dt * this.powerUpState.scoreMultiplier;
        this.scrollX += currentEffectiveSpeed * dt;
        this.score = Math.floor(this.distance * 0.05);

        // Score Milestone (Every 100 points)
        if (this.score > 0 && this.score % 100 === 0 && this.score !== this.lastMilestone) {
            this.lastMilestone = this.score;
            if (window.soundManager) {
                window.soundManager.playScoreMilestone();
            }
            if (window.onScoreMilestone) {
                window.onScoreMilestone(this.score);
            }
        }

        this.updateScoreUI();

        // Player physics
        this.player.animTime += dt;

        if (!this.player.isGrounded) {
            this.player.vy += this.player.gravity * dt;
            this.player.y += this.player.vy * dt;

            // Ground impact
            if (this.player.y >= this.groundY - this.player.height) {
                this.player.y = this.groundY - this.player.height;
                this.player.vy = 0;
                this.player.isGrounded = true;
                this.player.state = this.player.isDucking ? 'DUCK' : 'RUN';
                this.spawnDust(this.player.x + 20, this.groundY, 4);
            }
        } else {
            if (Math.random() < 0.25) {
                this.spawnDust(this.player.x + 8, this.groundY, 1);
            }
        }

        // Companion onion physics
        if (!this.companion.isGrounded) {
            this.companion.vy += this.player.gravity * 0.95 * dt;
            this.companion.y += this.companion.vy * dt;
            if (this.companion.y >= this.groundY - 22) {
                this.companion.y = this.groundY - 22;
                this.companion.vy = 0;
                this.companion.isGrounded = true;
                this.companion.state = this.player.isDucking ? 'DUCK' : 'RUN';
            }
        }

        // Clouds update
        this.clouds.forEach(c => {
            c.x -= c.speed * dt;
            if (c.x < -c.w - 50) {
                c.x = this.width + 50 + Math.random() * 80;
                c.y = 35 + Math.random() * 65;
            }
        });

        // Obstacles spawn logic (ensures plenty of breathing room, never crowds a Chilli)
        this.lastSpawnDist += currentEffectiveSpeed * dt;
        const currentMinDist = Math.max(320, 520 - (this.speed - this.baseSpeed) * 0.25);
        if (this.lastSpawnDist > currentMinDist && this.lastPowerUpDist > 200 && Math.random() < 0.04) {
            this.spawnObstacle();
            this.lastSpawnDist = 0;
        }

        // Power-ups spawn logic: Rare Chilli booster (spacing of ~7000+ distance, rarely appearing)
        this.lastPowerUpDist += currentEffectiveSpeed * dt;
        if (
            this.lastPowerUpDist > 7000 &&
            this.lastSpawnDist > 280 &&
            this.powerUps.length === 0 &&
            this.powerUpState.turboTimer <= 0 &&
            Math.random() < 0.005
        ) {
            this.spawnPowerUp();
            this.lastPowerUpDist = 0;
        }

        // Power-ups update & pickup check
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const pu = this.powerUps[i];
            pu.x -= currentEffectiveSpeed * dt;

            // Player pickup check
            const dist = Math.hypot(
                (this.player.x + 24) - (pu.x + 16),
                (this.player.y + 30) - (pu.y + 16)
            );
            if (dist < 45) {
                this.collectPowerUp(pu);
                this.powerUps.splice(i, 1);
                continue;
            }

            if (pu.x < -60) {
                this.powerUps.splice(i, 1);
            }
        }

        // Obstacles update & collision
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= currentEffectiveSpeed * dt;

            // Collision check
            if (this.checkCollision(this.player, obs)) {
                this.gameOver();
                return;
            }

            // Remove off-screen obstacles
            if (obs.x < -obs.width - 60) {
                this.obstacles.splice(i, 1);
            }
        }

        // Particles update
        this.updateParticles(dt);
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;

            if (p.type === 'STAR' || p.type === 'ONION') {
                p.vy += 420 * dt;
            }

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Notebook background lines, margin, distant sketchy hills & ground line
        this.renderer.drawBackground(this.width, this.height, this.groundY, this.scrollX);

        // 2. Parallax doodle clouds
        this.clouds.forEach(c => this.renderer.drawCloud(c));

        // 3. Power-ups floating in air
        this.powerUps.forEach(pu => this.renderer.drawPowerUp(pu, this.player.animTime));

        // 4. Obstacles (Knives, Swords, Shurikens, Rolling Pins, etc.)
        this.obstacles.forEach(obs => {
            this.renderer.drawObstacle(obs, this.player.animTime);
        });

        // 5. Companion Onion ("കുഞ്ഞു ഉള്ളി") running alongside
        this.renderer.drawCompanionOnion(
            this.companion.x,
            this.companion.y,
            this.companion.state,
            this.player.animTime
        );

        // 6. Turbo speed lines removed per user request

        // 7. Player (Weird Short Curly-Haired Girl)
        this.renderer.drawGirl(
            this.player.x,
            this.player.y,
            this.player.state,
            this.player.animTime,
            this.player.isDucking
        );

        // 8. Particles (Dust, Comic Words, Orbiting Stars, Panicked Mini Onions)
        this.renderer.drawParticles(this.particles);

        // 10. Hand-drawn Score HUD
        this.drawScoreHUD();
    }

    drawScoreHUD() {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = "bold 22px 'Patrick Hand', 'Chilanka', cursive";
        ctx.fillStyle = '#2b2a27';
        ctx.textAlign = 'right';

        const hiText = `HI ${String(this.highScore).padStart(5, '0')}`;
        const scoreText = String(this.score).padStart(5, '0');

        // Hand-sketched box around score
        ctx.strokeStyle = 'rgba(43, 42, 39, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.width - 240, 18, 220, 36);

        ctx.fillStyle = '#7f8c8d';
        ctx.fillText(hiText, this.width - 125, 43);

        ctx.fillStyle = this.powerUpState.turboTimer > 0 ? '#e74c3c' : '#2c3e50';
        ctx.fillText(scoreText, this.width - 35, 43);

        // Multiplier tag if active
        if (this.powerUpState.turboTimer > 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.font = "bold 15px 'Patrick Hand', cursive";
            ctx.fillText(`2X TURBO! (${Math.ceil(this.powerUpState.turboTimer)}s)`, this.width - 25, 74);
        }

        ctx.restore();
    }

    updatePowerUpUI() {
        const turboBadge = document.getElementById('turbo-status-badge');
        if (turboBadge) {
            turboBadge.style.display = this.powerUpState.turboTimer > 0 ? 'inline-flex' : 'none';
        }
    }

    updateScoreUI() {
        const curScoreEl = document.getElementById('cur-score-display');
        const hiScoreEl = document.getElementById('hi-score-display');
        if (curScoreEl) curScoreEl.textContent = String(this.score).padStart(5, '0');
        if (hiScoreEl) hiScoreEl.textContent = String(this.highScore).padStart(5, '0');
    }

    start() {
        this.lastTime = performance.now();
        const loop = (currentTime) => {
            const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
            this.lastTime = currentTime;

            this.update(dt);
            this.draw();

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

window.UlliDinoGame = UlliDinoGame;
