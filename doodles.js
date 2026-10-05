// ============================================================
// ULLI DINO - Interactive Margin Doodles & Intro Screen
// Handles the animated Malayalam full-page intro,
// interactive doodles in blank spaces, and doodle themes
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('intro-overlay');
    const startBtn = document.getElementById('start-game-btn');
    const canvas = document.getElementById('game-canvas');
    const gameOverModal = document.getElementById('game-over-modal');
    const restartBtn = document.getElementById('restart-btn');
    const muteBtn = document.getElementById('mute-btn');
    const bgmBtn = document.getElementById('bgm-btn');
    const inkThemeSelect = document.getElementById('ink-theme-select');

    // Initialize Game Instance
    const game = new UlliDinoGame(canvas);
    window.currentGame = game;

    // --- GAME OVER HOOK ---
    window.onGameOver = (score, highScore) => {
        const finalScoreSpan = document.getElementById('final-score-val');
        const bestScoreSpan = document.getElementById('best-score-val');
        if (finalScoreSpan) finalScoreSpan.textContent = score;
        if (bestScoreSpan) bestScoreSpan.textContent = highScore;

        // Game Over comments (clean, fun doodle runner quips)
        const gameOverComments = [
            "Sliced by the blade! Watch your jump timing!",
            "That cleaver was too close! Jump earlier!",
            "Duck under the spinning swords next time!",
            "Dust yourself off and run again!",
            "So close! You've got this!"
        ];
        const commentEl = document.getElementById('game-over-comment');
        if (commentEl) {
            commentEl.textContent = gameOverComments[Math.floor(Math.random() * gameOverComments.length)];
        }

        setTimeout(() => {
            gameOverModal.classList.add('visible');
        }, 300);
    };

    // --- SCORE MILESTONE CELEBRATION ---
    window.onScoreMilestone = (score) => {
        // Trigger cheerful doodle celebration banner
        const banner = document.getElementById('milestone-banner');
        if (banner) {
            banner.textContent = `🎉 100+ BONUS: ${score} PTS! 🎉`;
            banner.classList.add('pop-active');
            setTimeout(() => {
                banner.classList.remove('pop-active');
            }, 1800);
        }
    };

    // --- FULL-PAGE ANIMATED MALAYALAM INTRO DISMISSAL ---
    function dismissIntro() {
        if (!introOverlay.classList.contains('hidden')) {
            introOverlay.classList.add('fading-out');
            if (window.soundManager) {
                window.soundManager.init();
                window.soundManager.playIntroFanfare();
            }
            setTimeout(() => {
                introOverlay.classList.add('hidden');
                introOverlay.classList.remove('fading-out');
                game.reset();
                game.start();
            }, 600);
        }
    }

    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissIntro();
        });
    }

    introOverlay.addEventListener('click', () => {
        dismissIntro();
    });

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowUp' || e.code === 'KeyW') {
            if (!introOverlay.classList.contains('hidden')) {
                dismissIntro();
            } else if (gameOverModal.classList.contains('visible')) {
                restartGame();
            }
        }
    });

    // --- RESTART GAME ---
    function restartGame() {
        gameOverModal.classList.remove('visible');
        if (window.soundManager) {
            window.soundManager.playPencilClick();
        }
        game.reset();
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            restartGame();
        });
    }

    if (gameOverModal) {
        gameOverModal.addEventListener('click', () => {
            restartGame();
        });
    }

    // --- SOUND TOGGLE CONTROLS ---
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            const isMuted = window.soundManager.toggleMute();
            muteBtn.innerHTML = isMuted ? '🔇 <span class="lbl">Unmute SFX</span>' : '🔊 <span class="lbl">Mute SFX</span>';
            muteBtn.classList.toggle('active', isMuted);
        });
    }

    if (bgmBtn) {
        bgmBtn.addEventListener('click', () => {
            const isPlaying = window.soundManager.toggleBGM();
            bgmBtn.innerHTML = isPlaying ? '🎵 <span class="lbl">Lo-fi Beat: ON</span>' : '🎵 <span class="lbl">Lo-fi Beat: OFF</span>';
            bgmBtn.classList.toggle('active', isPlaying);
        });
    }

    // --- SOUNDBOARD TEST BUTTONS ---
    const testJumpBtn = document.getElementById('test-jump-btn');
    const testCrashBtn = document.getElementById('test-crash-btn');
    const testChilliBtn = document.getElementById('test-chilli-btn');

    if (testJumpBtn) {
        testJumpBtn.addEventListener('click', () => {
            window.soundManager.init();
            window.soundManager.playJump();
        });
    }
    if (testCrashBtn) {
        testCrashBtn.addEventListener('click', () => {
            window.soundManager.init();
            window.soundManager.playCrash();
        });
    }
    if (testChilliBtn) {
        testChilliBtn.addEventListener('click', () => {
            window.soundManager.init();
            window.soundManager.playChilliBoost();
        });
    }

    // --- THEME / INK SWITCHER ---
    if (inkThemeSelect) {
        inkThemeSelect.addEventListener('change', (e) => {
            document.body.className = `theme-${e.target.value}`;
            if (window.soundManager) {
                window.soundManager.playPencilClick();
            }
        });
    }

    // --- INTERACTIVE MARGIN DOODLES ---

    // 1. Doodle Sun click & wink
    const doodleSun = document.getElementById('doodle-sun');
    if (doodleSun) {
        let sunShades = 0;
        doodleSun.addEventListener('click', () => {
            sunShades = (sunShades + 1) % 3;
            doodleSun.classList.toggle('wink', sunShades === 1);
            doodleSun.classList.toggle('disco', sunShades === 2);
            if (window.soundManager) window.soundManager.playOnionSqueak();
        });
    }

    // 2. Interactive Clickable Onion ("ഉള്ളി") Mascot
    const mascotOnion = document.getElementById('mascot-onion');
    const onionBubble = document.getElementById('onion-speech-bubble');
    if (mascotOnion && onionBubble) {
        const phrases = [
            "SQUEAK! 🧅",
            "RUN FOR IT! 🏃‍♀️",
            "WATCH THE BLADES! 🗡️",
            "NICE JUMP! ⭐",
            "DUCK LOW! 💨"
        ];
        let pIdx = 0;
        mascotOnion.addEventListener('click', () => {
            mascotOnion.classList.add('bouncing');
            onionBubble.textContent = phrases[pIdx % phrases.length];
            onionBubble.classList.add('visible');
            pIdx++;

            if (window.soundManager) {
                window.soundManager.playOnionSqueak();
            }

            setTimeout(() => {
                mascotOnion.classList.remove('bouncing');
            }, 600);
            setTimeout(() => {
                onionBubble.classList.remove('visible');
            }, 2500);
        });
    }

    // 3. Flying Paper Airplane loop-de-loop
    const paperPlane = document.getElementById('paper-plane-doodle');
    if (paperPlane) {
        paperPlane.addEventListener('click', () => {
            paperPlane.classList.add('looping');
            if (window.soundManager) window.soundManager.playDuck();
            setTimeout(() => {
                paperPlane.classList.remove('looping');
            }, 1200);
        });
    }

    // 4. Coffee Stain Sip
    const coffeeStain = document.getElementById('coffee-stain-doodle');
    if (coffeeStain) {
        coffeeStain.addEventListener('click', () => {
            coffeeStain.classList.add('steaming');
            if (window.soundManager) window.soundManager.playPencilClick();
            setTimeout(() => coffeeStain.classList.remove('steaming'), 1000);
        });
    }

    // 5. Mobile on-screen action buttons
    const mobileJumpBtn = document.getElementById('mobile-jump-btn');
    const mobileDuckBtn = document.getElementById('mobile-duck-btn');

    if (mobileJumpBtn) {
        const onJumpStart = (e) => {
            if (e && e.cancelable) e.preventDefault();
            if (!introOverlay.classList.contains('hidden')) {
                dismissIntro();
                return;
            }
            game.handleJumpPress();
        };

        const onJumpEnd = (e) => {
            if (e && e.cancelable) e.preventDefault();
            game.handleJumpRelease();
        };

        mobileJumpBtn.addEventListener('touchstart', onJumpStart, { passive: false });
        mobileJumpBtn.addEventListener('touchend', onJumpEnd, { passive: false });
        mobileJumpBtn.addEventListener('touchcancel', onJumpEnd, { passive: false });
        mobileJumpBtn.addEventListener('mousedown', onJumpStart);
        mobileJumpBtn.addEventListener('mouseup', onJumpEnd);
        mobileJumpBtn.addEventListener('mouseleave', onJumpEnd);
    }

    if (mobileDuckBtn) {
        const onDuckStart = (e) => {
            if (e && e.cancelable) e.preventDefault();
            game.handleDuckPress(true);
        };

        const onDuckEnd = (e) => {
            if (e && e.cancelable) e.preventDefault();
            game.handleDuckPress(false);
        };

        mobileDuckBtn.addEventListener('touchstart', onDuckStart, { passive: false });
        mobileDuckBtn.addEventListener('touchend', onDuckEnd, { passive: false });
        mobileDuckBtn.addEventListener('touchcancel', onDuckEnd, { passive: false });
        mobileDuckBtn.addEventListener('mousedown', onDuckStart);
        mobileDuckBtn.addEventListener('mouseup', onDuckEnd);
        mobileDuckBtn.addEventListener('mouseleave', onDuckEnd);
    }
});
