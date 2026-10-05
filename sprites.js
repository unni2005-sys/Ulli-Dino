// ============================================================
// ULLI DINO - Hand-Drawn Doodle Sprite Engine
// Renders the weird short curly-haired girl, knives & swords,
// doodle particles, and notebook sketchbook background
// ============================================================

class DoodleRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.roughSeed = 0;
    }

    // Hand-drawn wobbly line helper to give authentic sketch feel
    sketchLine(x1, y1, x2, y2, wobble = 1.2, color = '#2b2a27', width = 2) {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * wobble * 2;
        const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * wobble * 2;

        ctx.beginPath();
        ctx.moveTo(x1 + (Math.random() - 0.5) * wobble, y1 + (Math.random() - 0.5) * wobble);
        ctx.quadraticCurveTo(midX, midY, x2 + (Math.random() - 0.5) * wobble, y2 + (Math.random() - 0.5) * wobble);
        ctx.stroke();
        ctx.restore();
    }

    // Hand-drawn sketch circle / oval with wobbly outline
    sketchCircle(cx, cy, r, fillColor = null, strokeColor = '#2b2a27', lineWidth = 2) {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        const steps = 14;
        for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            const wobbleR = r + (Math.sin(angle * 5) + Math.cos(angle * 3)) * 0.8;
            const x = cx + Math.cos(angle) * wobbleR;
            const y = cy + Math.sin(angle) * wobbleR;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
        ctx.restore();
    }

    // -------------------------------------------------------------
    // DRAW WEIRD SHORT CURLY-HAIRED GIRL
    // States: 'RUN', 'JUMP', 'DUCK', 'CRASH'
    // -------------------------------------------------------------
    drawGirl(x, y, state, animTime, isDucking = false) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);

        const ink = '#1f1e1d';
        const skinFill = '#fff9f0';
        const shirtFill = '#fff';
        const pantsFill = '#2c3e50';

        if (state === 'CRASH') {
            this.drawGirlCrashed(ctx, ink, skinFill);
            ctx.restore();
            return;
        }

        if (state === 'DUCK') {
            this.drawGirlDucking(ctx, animTime, ink, skinFill, shirtFill);
            ctx.restore();
            return;
        }

        if (state === 'JUMP') {
            this.drawGirlJumping(ctx, animTime, ink, skinFill, shirtFill, pantsFill);
            ctx.restore();
            return;
        }

        // --- NORMAL RUNNING CYCLE (4 frames) ---
        const runCycle = Math.sin(animTime * 14);
        const bob = Math.abs(Math.sin(animTime * 14)) * 4; // Head bobbing
        const curlBounce = Math.sin(animTime * 14) * 3;

        // 1. Back Noodle Leg
        ctx.save();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const backLegX = -runCycle * 14;
        const backFootY = 56 - Math.max(0, runCycle * 8);
        ctx.moveTo(18, 42);
        ctx.quadraticCurveTo(20 + backLegX * 0.5, 48, 16 + backLegX, backFootY);
        ctx.stroke();
        // Sneaker
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.ellipse(16 + backLegX, backFootY, 6, 3.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Short Torso / Scribbled T-Shirt
        ctx.save();
        ctx.fillStyle = shirtFill;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(14, 28 - bob * 0.5, 18, 16, 4);
        ctx.fill();
        ctx.stroke();
        // Doodle swirl on t-shirt
        ctx.beginPath();
        ctx.arc(23, 35 - bob * 0.5, 3.5, 0, Math.PI * 1.5);
        ctx.stroke();
        // Shorts
        ctx.fillStyle = pantsFill;
        ctx.fillRect(14, 40 - bob * 0.5, 18, 6);
        ctx.strokeRect(14, 40 - bob * 0.5, 18, 6);
        ctx.restore();

        // 3. Front Noodle Leg
        ctx.save();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const frontLegX = runCycle * 16;
        const frontFootY = 56 - Math.max(0, -runCycle * 8);
        ctx.moveTo(24, 42);
        ctx.quadraticCurveTo(24 + frontLegX * 0.5, 48, 24 + frontLegX, frontFootY);
        ctx.stroke();
        // Sneaker
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.ellipse(24 + frontLegX, frontFootY, 6, 3.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Arms swinging
        ctx.save();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(17, 32 - bob * 0.5);
        ctx.quadraticCurveTo(12 - runCycle * 10, 36, 10 - runCycle * 12, 38 + runCycle * 6);
        ctx.stroke();
        // Little hand
        ctx.fillStyle = skinFill;
        ctx.beginPath();
        ctx.arc(10 - runCycle * 12, 38 + runCycle * 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // 5. Big Quirky Round Head
        const headY = 16 - bob;
        const headX = 24;
        this.sketchCircle(headX, headY, 13, skinFill, ink, 2.5);

        // 6. Big Goofy Eyes & Expressive Face
        // Left Eye
        this.sketchCircle(headX - 4, headY - 1, 4.5, '#ffffff', ink, 2);
        ctx.fillStyle = ink;
        ctx.beginPath();
        // Dilated goofy pupil looking forward
        ctx.arc(headX - 3 + runCycle * 0.5, headY - 1, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Right Eye (slightly bigger for that weird goofy cartoon look)
        this.sketchCircle(headX + 5, headY - 1, 5, '#ffffff', ink, 2);
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(headX + 6 + runCycle * 0.5, headY - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Hilarious nervous smile / open mouth
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(headX + 1, headY + 5, 4.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Quirky eyebrows
        ctx.beginPath();
        ctx.moveTo(headX - 8, headY - 8);
        ctx.lineTo(headX - 1, headY - 6);
        ctx.moveTo(headX + 2, headY - 6);
        ctx.lineTo(headX + 9, headY - 9);
        ctx.stroke();

        // 7. MASSIVE MESSY CHAOTIC CURLS (Springy spiral clusters!)
        this.drawCurlyHair(ctx, headX, headY, curlBounce, ink);

        ctx.restore();
    }

    // -------------------------------------------------------------
    // DRAW COMPANION ONION ("കുഞ്ഞു ഉള്ളി") RUNNING ALONGSIDE
    // -------------------------------------------------------------
    drawCompanionOnion(x, y, state, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);

        const ink = '#1f1e1d';
        const bulb = '#ffeaa7';
        const sproutGreen = '#27ae60';

        if (state === 'CRASH') {
            // Dizzy onion upside down
            ctx.rotate(0.5);
            this.sketchCircle(0, 0, 10, bulb, ink, 2);
            this.drawSpiralEye(ctx, -3, -1, 3, ink);
            this.drawSpiralEye(ctx, 3, -1, 3, ink);
            ctx.restore();
            return;
        }

        if (state === 'DUCK') {
            // Rolling along ground!
            const rollAngle = animTime * 18;
            ctx.rotate(rollAngle);
            this.sketchCircle(0, 0, 10, bulb, ink, 2);
            // Sprout spinning
            ctx.strokeStyle = sproutGreen;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, -10); ctx.lineTo(-4, -18);
            ctx.moveTo(0, -10); ctx.lineTo(4, -17);
            ctx.stroke();
            ctx.restore();
            return;
        }

        const runCycle = Math.sin(animTime * 16);
        const bob = Math.abs(runCycle) * 3;

        // Little running legs
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-4, 8); ctx.lineTo(-4 - runCycle * 6, 16);
        ctx.moveTo(4, 8); ctx.lineTo(4 + runCycle * 6, 16);
        ctx.stroke();

        // Onion Bulb
        this.sketchCircle(0, -bob, 10.5, bulb, ink, 2.2);

        // Flapping sprout hair
        ctx.strokeStyle = sproutGreen;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -10 - bob); ctx.quadraticCurveTo(-6, -18 - bob, -8 - runCycle * 3, -22 - bob);
        ctx.moveTo(0, -10 - bob); ctx.quadraticCurveTo(0, -20 - bob, 0, -24 - bob);
        ctx.moveTo(0, -10 - bob); ctx.quadraticCurveTo(6, -18 - bob, 8 + runCycle * 3, -21 - bob);
        ctx.stroke();

        // Cheerful cartoon face
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(-3, -bob - 1, 1.8, 0, Math.PI * 2);
        ctx.arc(3, -bob - 1, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Happy mouth
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        if (state === 'JUMP') {
            ctx.arc(0, -bob + 3, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ff7675';
            ctx.fill();
        } else {
            ctx.arc(0, -bob + 2, 2.8, 0.1 * Math.PI, 0.9 * Math.PI);
        }
        ctx.stroke();

        ctx.restore();
    }

    // -------------------------------------------------------------
    // DRAW POWER-UP (Chilli Booster)
    // -------------------------------------------------------------
    drawPowerUp(item, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(item.x, item.y);

        const floatBob = Math.sin(animTime * 6 + item.seed) * 5;
        ctx.translate(0, floatBob);

        const ink = '#1f1e1d';

        // Fiery Hot Chilli Pepper
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(Math.sin(animTime * 8) * 0.2);

        // Red curved chilli body
        ctx.fillStyle = '#e74c3c';
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-10, -12);
        ctx.quadraticCurveTo(8, -8, 12, 6);
        ctx.quadraticCurveTo(14, 16, 16, 20); // Sharp curled tip
        ctx.quadraticCurveTo(6, 16, -4, 4);
        ctx.quadraticCurveTo(-12, -4, -10, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Green chilli stem
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(-8, -11, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-8, -12); ctx.quadraticCurveTo(-14, -16, -12, -22);
        ctx.stroke();

        // Doodle fire puffs
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(14, -2, 3, 0, Math.PI * 2);
        ctx.arc(18, 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    // Protective Shield Bubble around Girl
    drawGirlShieldAura(x, y, radius, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x + 24, y + 28);

        // Pulsing iridescent doodle aura
        const pulse = Math.sin(animTime * 10) * 3;
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 5]);
        ctx.lineDashOffset = -animTime * 25;

        ctx.beginPath();
        ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(241, 196, 15, 0.15)';
        ctx.fill();

        // Orbiting golden star
        const starA = animTime * 6;
        const sx = Math.cos(starA) * (radius + 6);
        const sy = Math.sin(starA) * (radius + 6);
        this.drawComicStar(ctx, sx, sy, 5, '#e67e22');

        ctx.restore();
    }

    // Fiery Speed-Lines when Chilli Boost is active (Removed per user request)
    drawTurboSpeedLines(x, y, animTime) {
        // Red speed lines removed
    }

    // Extra Weapon Obstacle: Shuriken (Spinning Ninja Star)
    drawShuriken(ctx, w, h, animTime) {
        const ink = '#1f1e1d';
        const steel = '#bdc3c7';

        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        ctx.rotate(animTime * 18); // Fast spin!

        ctx.fillStyle = steel;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2;
            const tipX = Math.cos(a) * (w * 0.5);
            const tipY = Math.sin(a) * (h * 0.5);
            const midA = a + Math.PI / 4;
            const inX = Math.cos(midA) * 6;
            const inY = Math.sin(midA) * 6;
            if (i === 0) ctx.moveTo(tipX, tipY);
            else ctx.lineTo(tipX, tipY);
            ctx.lineTo(inX, inY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Center hole
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    // Extra Weapon Obstacle: Flaming Sword
    drawFlamingSword(ctx, w, h, animTime) {
        // Broadsword base
        this.drawBroadsword(ctx, w, h);

        // Flickering Doodle Flames on the blade
        const ctxRef = this.ctx;
        ctxRef.save();
        ctxRef.translate(w * 0.5, 0);

        for (let y = Math.floor(h * 0.36); y < h - 4; y += 10) {
            const flicker = Math.sin(animTime * 20 + y) * 3;
            // Left flame tongue
            ctxRef.fillStyle = '#e74c3c';
            ctxRef.beginPath();
            ctxRef.moveTo(-6, y);
            ctxRef.quadraticCurveTo(-13 - flicker, y - 4, -8, y - 8);
            ctxRef.quadraticCurveTo(-5, y - 6, -6, y);
            ctxRef.fill();

            // Right flame tongue
            ctxRef.fillStyle = '#f39c12';
            ctxRef.beginPath();
            ctxRef.moveTo(6, y);
            ctxRef.quadraticCurveTo(13 + flicker, y - 4, 8, y - 8);
            ctxRef.quadraticCurveTo(5, y - 6, 6, y);
            ctxRef.fill();
        }
        ctxRef.restore();
    }

    // Extra Weapon Obstacle: Kitchen Rolling Pin
    drawRollingPin(ctx, w, h, animTime) {
        const ink = '#1f1e1d';
        const wood = '#d35400';

        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);

        // Barrel of rolling pin
        ctx.fillStyle = '#f39c12';
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-w * 0.35, -h * 0.35, w * 0.7, h * 0.7, 4);
        ctx.fill();
        ctx.stroke();

        // Left & Right Handles
        ctx.fillStyle = wood;
        ctx.fillRect(-w * 0.48, -4, w * 0.14, 8);
        ctx.strokeRect(-w * 0.48, -4, w * 0.14, 8);
        ctx.fillRect(w * 0.34, -4, w * 0.14, 8);
        ctx.strokeRect(w * 0.34, -4, w * 0.14, 8);

        // Rolling motion lines
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1.5;
        const rollOffset = (animTime * 30) % 20;
        ctx.beginPath();
        ctx.moveTo(-w * 0.2 + rollOffset, -h * 0.2);
        ctx.lineTo(-w * 0.2 + rollOffset, h * 0.2);
        ctx.stroke();

        ctx.restore();
        this.drawGroundCrack(ctx, w * 0.5, h);
    }

    // Curly hair generator with springy clusters
    drawCurlyHair(ctx, hx, hy, bounce, ink) {
        ctx.save();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';

        // Hair curls definition: relative offsets and sizes
        const curls = [
            { ox: -12, oy: -8, r: 7 },
            { ox: -14, oy: -2, r: 6.5 },
            { ox: -13, oy: 5, r: 6 },
            { ox: -8, oy: -15, r: 7.5 },
            { ox: 0, oy: -17, r: 8 },
            { ox: 8, oy: -16, r: 7.5 },
            { ox: 14, oy: -11, r: 7 },
            { ox: 15, oy: -3, r: 6.5 },
            { ox: 14, oy: 4, r: 6 },
            // Inner curls for dense curly volume
            { ox: -6, oy: -8, r: 6 },
            { ox: 4, oy: -9, r: 6.5 },
            { ox: -1, oy: -12, r: 7 }
        ];

        curls.forEach((c, idx) => {
            const cx = hx + c.ox;
            const cy = hy + c.oy + bounce * (idx % 2 === 0 ? 1 : 0.6);
            ctx.beginPath();
            // Multi-turn spiral / spring loop
            const turns = 1.6;
            const stepCount = 10;
            for (let i = 0; i <= stepCount; i++) {
                const angle = (i / stepCount) * Math.PI * 2 * turns;
                const radius = (c.r * 0.4) + (c.r * 0.6) * (i / stepCount);
                const x = cx + Math.cos(angle + idx) * radius;
                const y = cy + Math.sin(angle + idx) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        // Stray wild bounce curls sticking out comically!
        const wildSprings = [
            { x: hx - 17, y: hy - 14 },
            { x: hx + 18, y: hy - 16 },
            { x: hx - 3, y: hy - 23 },
            { x: hx + 12, y: hy - 21 }
        ];
        wildSprings.forEach((ws, i) => {
            ctx.beginPath();
            ctx.arc(ws.x, ws.y + bounce * 1.3, 4, 0, Math.PI * 1.8);
            ctx.stroke();
        });

        ctx.restore();
    }

    // --- JUMPING STATE: Arms out, screaming mouth, hair floating high! ---
    drawGirlJumping(ctx, animTime, ink, skinFill, shirtFill, pantsFill) {
        const headX = 24;
        const headY = 12;

        // Legs curled up in mid-air
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        // Left tucked leg
        ctx.beginPath();
        ctx.moveTo(18, 38);
        ctx.quadraticCurveTo(12, 44, 16, 48);
        ctx.stroke();
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.ellipse(16, 48, 5, 3.5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Right kicked out leg
        ctx.beginPath();
        ctx.moveTo(24, 38);
        ctx.quadraticCurveTo(32, 40, 36, 44);
        ctx.stroke();
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.ellipse(36, 44, 5, 3.5, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = shirtFill;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(14, 24, 18, 15, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = pantsFill;
        ctx.fillRect(14, 35, 18, 5);
        ctx.strokeRect(14, 35, 18, 5);

        // Arms thrown up in excitement / panic
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(16, 26);
        ctx.lineTo(6, 14); // Left arm up
        ctx.moveTo(28, 26);
        ctx.lineTo(38, 12); // Right arm up
        ctx.stroke();

        // Head
        this.sketchCircle(headX, headY, 13, skinFill, ink, 2.5);

        // Wide screaming eyes
        this.sketchCircle(headX - 4, headY - 2, 5, '#ffffff', ink, 2);
        this.sketchCircle(headX + 5, headY - 2, 5.5, '#ffffff', ink, 2);
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(headX - 4, headY - 3, 2.3, 0, Math.PI * 2);
        ctx.arc(headX + 5, headY - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Wide screaming mouth "WAAAAH!"
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.ellipse(headX + 1, headY + 5, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair blown backward / floating high!
        this.drawCurlyHair(ctx, headX, headY - 4, -4, ink);
    }

    // --- DUCKING STATE: Flattened doodle hedgehog sliding under swords ---
    drawGirlDucking(ctx, animTime, ink, skinFill, shirtFill) {
        const slideWobble = Math.sin(animTime * 18) * 1.5;

        // Speed lines behind
        ctx.strokeStyle = '#8a8880';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, 48); ctx.lineTo(-2, 48);
        ctx.moveTo(-14, 52); ctx.lineTo(-4, 52);
        ctx.moveTo(-8, 55); ctx.lineTo(-1, 55);
        ctx.stroke();

        // Horizontal flattened body
        ctx.fillStyle = shirtFill;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(22, 46 + slideWobble, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head lowered close to ground
        const headX = 36;
        const headY = 44 + slideWobble;
        this.sketchCircle(headX, headY, 11, skinFill, ink, 2.2);

        // Nervous squinting eyes looking up at flying sword!
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(headX - 2, headY - 3, 3.5, 0.8 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(headX + 4, headY - 3, 3.5, 0.8 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();

        // Nervous squiggly mouth
        ctx.beginPath();
        ctx.moveTo(headX - 2, headY + 4);
        ctx.lineTo(headX, headY + 3);
        ctx.lineTo(headX + 3, headY + 5);
        ctx.stroke();

        // Hair blown flat horizontally backward
        this.drawCurlyHair(ctx, headX - 10, headY - 2, 0, ink);

        // Sliding feet
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.ellipse(8, 52, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // --- CRASHED STATE: Spiral eyes, dizzy stars, dramatic comic knockback ---
    drawGirlCrashed(ctx, ink, skinFill) {
        const headX = 20;
        const headY = 28;

        // Sprawled body
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        // Legs splayed
        ctx.beginPath();
        ctx.moveTo(18, 38); ctx.lineTo(6, 52); // Left leg
        ctx.moveTo(22, 38); ctx.lineTo(34, 52); // Right leg
        ctx.stroke();

        // Crossed arms
        ctx.beginPath();
        ctx.moveTo(14, 30); ctx.lineTo(2, 24);
        ctx.moveTo(24, 30); ctx.lineTo(36, 26);
        ctx.stroke();

        // Head tilted
        this.sketchCircle(headX, headY, 13, skinFill, ink, 2.5);

        // Dizzy Spiral Eyes!
        this.drawSpiralEye(ctx, headX - 4, headY - 2, 4, ink);
        this.drawSpiralEye(ctx, headX + 5, headY - 2, 4, ink);

        // Droopy wavy mouth with tongue sticking out
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(headX, headY + 5, 4, 0.8 * Math.PI, 0.2 * Math.PI, true);
        ctx.stroke();
        // Little tongue
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(headX + 2, headY + 8, 2.5, 0, Math.PI);
        ctx.fill();
        ctx.stroke();

        // Exploded wild hair
        this.drawCurlyHair(ctx, headX, headY, -6, ink);

        // Orbiting comic stars & onion!
        const time = Date.now() * 0.006;
        for (let i = 0; i < 3; i++) {
            const angle = time + (i * Math.PI * 2) / 3;
            const sx = headX + Math.cos(angle) * 22;
            const sy = headY - 14 + Math.sin(angle) * 8;
            this.drawComicStar(ctx, sx, sy, 4.5, '#e67e22');
        }
    }

    drawSpiralEye(ctx, cx, cy, r, ink) {
        ctx.save();
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
            const angle = 0.4 * i;
            const rad = (r / 16) * i;
            const x = cx + Math.cos(angle) * rad;
            const y = cy + Math.sin(angle) * rad;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    drawComicStar(ctx, cx, cy, r, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#2b2a27';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a1 = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const a2 = a1 + Math.PI / 5;
            ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
            ctx.lineTo(cx + Math.cos(a2) * (r * 0.4), cy + Math.sin(a2) * (r * 0.4));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // -------------------------------------------------------------
    // DRAW OBSTACLES: KNIVES AND SWORDS
    // -------------------------------------------------------------
    drawObstacle(obs, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(obs.x, obs.y);

        switch (obs.type) {
            case 'CLEAVER':
                this.drawMeatCleaver(ctx, obs.width, obs.height);
                break;
            case 'CHEF_KNIFE':
                this.drawChefKnife(ctx, obs.width, obs.height);
                break;
            case 'BROADSWORD':
                this.drawBroadsword(ctx, obs.width, obs.height);
                break;
            case 'DUAL_DAGGERS':
                this.drawDualDaggers(ctx, obs.width, obs.height);
                break;
            case 'TRIPLE_KNIVES':
                this.drawTripleKnives(ctx, obs.width, obs.height);
                break;
            case 'FLYING_SCIMITAR':
                this.drawFlyingScimitar(ctx, obs.width, obs.height, animTime);
                break;
            case 'FLYING_DAGGER':
                this.drawFlyingDagger(ctx, obs.width, obs.height, animTime);
                break;
            case 'SHURIKEN':
                this.drawShuriken(ctx, obs.width, obs.height, animTime);
                break;
            case 'FLAMING_SWORD':
                this.drawFlamingSword(ctx, obs.width, obs.height, animTime);
                break;
            case 'ROLLING_PIN':
                this.drawRollingPin(ctx, obs.width, obs.height, animTime);
                break;
            default:
                this.drawChefKnife(ctx, obs.width, obs.height);
        }
        ctx.restore();
    }

    // 1. Meat Cleaver stuck in ground
    drawMeatCleaver(ctx, w, h) {
        const ink = '#1f1e1d';
        const steel = '#e8ecf1';
        const wood = '#c89666';

        // Cleaver Blade (Heavy rectangle)
        ctx.fillStyle = steel;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(4, h);
        ctx.lineTo(4, 18);
        ctx.lineTo(w - 6, 12);
        ctx.lineTo(w - 2, h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cleaver hanging hole
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10, 24, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Blade gleam / crosshatch lines
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(12, 30); ctx.lineTo(w - 10, 26);
        ctx.moveTo(8, 42); ctx.lineTo(w - 6, 38);
        ctx.stroke();

        // Wooden Handle pointing up-left
        ctx.save();
        ctx.translate(6, 16);
        ctx.rotate(-0.4);
        ctx.fillStyle = wood;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-4, -20, 8, 22, 3);
        ctx.fill();
        ctx.stroke();
        // Handle rivets
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(0, -6, 1.5, 0, Math.PI * 2);
        ctx.arc(0, -14, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Dirt crack at impact point
        this.drawGroundCrack(ctx, w * 0.5, h);
    }

    // 2. Chef's Knife pointed up
    drawChefKnife(ctx, w, h) {
        const ink = '#1f1e1d';
        const steel = '#f2f4f7';
        const handle = '#2c3e50';

        ctx.save();
        ctx.translate(w * 0.5, h);
        ctx.rotate(0.08); // Slight ominous tilt

        // Blade stuck pointing down, handle up (or blade sticking straight up!)
        // Blade pointing straight up into the sky to slice runners:
        ctx.fillStyle = steel;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.35, 0); // Ground base
        ctx.lineTo(-w * 0.3, -h * 0.65); // Back edge
        ctx.quadraticCurveTo(0, -h * 0.95, 2, -h); // Sharp tip!
        ctx.quadraticCurveTo(w * 0.3, -h * 0.5, w * 0.35, 0); // Curved cutting edge
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shiny blade highlight
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.85);
        ctx.lineTo(0, -4);
        ctx.stroke();

        // Bolster & Handle at base stuck in ground
        ctx.fillStyle = handle;
        ctx.beginPath();
        ctx.roundRect(-w * 0.3, -4, w * 0.6, 6, 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        this.drawGroundCrack(ctx, w * 0.5, h);
    }

    // 3. Knight's Broadsword (Balanced, compact sword proportions)
    drawBroadsword(ctx, w, h) {
        const ink = '#1f1e1d';
        const steel = '#e4e7eb';
        const gold = '#f1c40f';

        const midX = w * 0.5;
        const guardY = h * 0.32;
        const pommelY = h * 0.08;

        // Blade thrust into ground (clean compact length)
        ctx.fillStyle = steel;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(midX - 5.5, h);
        ctx.lineTo(midX - 5.5, guardY + 4);
        ctx.lineTo(midX + 5.5, guardY + 4);
        ctx.lineTo(midX + 5.5, h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fuller (blood groove) down the blade
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(midX, guardY + 6);
        ctx.lineTo(midX, h - 4);
        ctx.stroke();

        // Ornate Golden Crossguard
        ctx.fillStyle = gold;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(midX - w * 0.44, guardY - 2, w * 0.88, 6, 2.5);
        ctx.fill();
        ctx.stroke();

        // Sword Grip / Hilt wrapped in leather
        ctx.fillStyle = '#8e44ad';
        ctx.beginPath();
        ctx.rect(midX - 3, pommelY + 4, 6, guardY - pommelY - 6);
        ctx.fill();
        ctx.stroke();

        // Golden Pommel (jeweled circle on top)
        ctx.fillStyle = gold;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(midX, pommelY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Ruby jewel
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(midX, pommelY, 1.8, 0, Math.PI * 2);
        ctx.fill();

        this.drawGroundCrack(ctx, midX, h);
    }

    // 4. Dual Crossed Daggers
    drawDualDaggers(ctx, w, h) {
        const ink = '#1f1e1d';
        const steel = '#e8ecf1';
        const grip = '#e67e22';

        // Left Dagger leaning right
        ctx.save();
        ctx.translate(w * 0.35, h * 0.55);
        ctx.rotate(0.45);
        this.drawSingleDagger(ctx, 0, 0, h * 0.85, steel, grip, ink);
        ctx.restore();

        // Right Dagger leaning left (crossing over)
        ctx.save();
        ctx.translate(w * 0.65, h * 0.55);
        ctx.rotate(-0.45);
        this.drawSingleDagger(ctx, 0, 0, h * 0.85, steel, grip, ink);
        ctx.restore();

        this.drawGroundCrack(ctx, w * 0.5, h);
    }

    drawSingleDagger(ctx, cx, cy, len, steel, grip, ink) {
        ctx.save();
        ctx.translate(cx, cy);

        // Blade
        ctx.fillStyle = steel;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-5, len * 0.3);
        ctx.lineTo(-4, -len * 0.3);
        ctx.lineTo(0, -len * 0.5); // Tip
        ctx.lineTo(4, -len * 0.3);
        ctx.lineTo(5, len * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Guard
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-8, len * 0.3, 16, 4);
        ctx.strokeRect(-8, len * 0.3, 16, 4);

        // Grip
        ctx.fillStyle = grip;
        ctx.fillRect(-3, len * 0.3 + 4, 6, len * 0.25);
        ctx.strokeRect(-3, len * 0.3 + 4, 6, len * 0.25);
        ctx.restore();
    }

    // 5. Triple mini knives in a row
    drawTripleKnives(ctx, w, h) {
        const count = 3;
        const spacing = w / count;
        for (let i = 0; i < count; i++) {
            ctx.save();
            ctx.translate(i * spacing, 0);
            this.drawChefKnife(ctx, spacing, h * (0.8 + (i % 2) * 0.2));
            ctx.restore();
        }
    }

    // 6. Flying Spinning Pirate Scimitar (Requires ducking or jumping!)
    drawFlyingScimitar(ctx, w, h, animTime) {
        const ink = '#1f1e1d';
        const steel = '#ecf0f1';
        const gold = '#f39c12';

        const spin = animTime * 12; // Rapid spinning

        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        ctx.rotate(spin);

        // Motion blur streaks
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.5, -0.6, 0.6);
        ctx.stroke();

        // Curved Scimitar Blade
        ctx.fillStyle = steel;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-4, 12);
        ctx.quadraticCurveTo(-2, -8, 8, -26); // Wide curved belly
        ctx.quadraticCurveTo(12, -34, 16, -38); // Tip
        ctx.quadraticCurveTo(6, -24, 0, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Basket Guard
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.arc(0, 14, 7, 0, Math.PI);
        ctx.fill();
        ctx.stroke();

        // Grip & Pommel
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-2.5, 14, 5, 12);
        ctx.strokeRect(-2.5, 14, 5, 12);
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.arc(0, 28, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    // 7. Flying Dagger (Aerial speed obstacle)
    drawFlyingDagger(ctx, w, h, animTime) {
        const ink = '#1f1e1d';
        const steel = '#e8ecf1';

        // Speed whistle lines trailing behind
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(w + 10, h * 0.5); ctx.lineTo(w + 24, h * 0.5);
        ctx.moveTo(w + 6, h * 0.5 - 6); ctx.lineTo(w + 18, h * 0.5 - 6);
        ctx.moveTo(w + 8, h * 0.5 + 6); ctx.lineTo(w + 20, h * 0.5 + 6);
        ctx.stroke();

        // Horizontal flying dagger
        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        ctx.rotate(-Math.PI * 0.5); // Pointing left towards the player
        this.drawSingleDagger(ctx, 0, 0, w * 0.9, steel, '#e74c3c', ink);
        ctx.restore();
    }

    // Doodle ground crack where knives impact
    drawGroundCrack(ctx, cx, cy) {
        ctx.strokeStyle = '#2b2a27';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy); ctx.lineTo(cx - 2, cy + 3); ctx.lineTo(cx + 6, cy);
        ctx.moveTo(cx - 1, cy + 3); ctx.lineTo(cx + 1, cy + 7);
        ctx.stroke();
    }

    // -------------------------------------------------------------
    // DRAW BACKGROUND DOODLE ELEMENTS (Clouds, Hills, Notebook Lines)
    // -------------------------------------------------------------
    drawBackground(width, height, groundY, scrollX) {
        const ctx = this.ctx;

        // Notebook Ruled Lines (Faint blue school notebook lines)
        ctx.save();
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.18)';
        ctx.lineWidth = 1;
        const lineSpacing = 28;
        for (let y = lineSpacing; y < height; y += lineSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Red Notebook Vertical Margin Line
        ctx.strokeStyle = 'rgba(231, 76, 60, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(70, 0);
        ctx.lineTo(70, height);
        ctx.stroke();
        ctx.restore();

        // Distant doodle mountains/hills (slow parallax)
        ctx.save();
        ctx.strokeStyle = 'rgba(120, 120, 110, 0.45)';
        ctx.lineWidth = 1.8;
        const hillOffset = (scrollX * 0.15) % 300;
        for (let x = -300; x < width + 300; x += 300) {
            const hx = x - hillOffset;
            ctx.beginPath();
            ctx.moveTo(hx, groundY);
            ctx.quadraticCurveTo(hx + 75, groundY - 45, hx + 150, groundY - 15);
            ctx.quadraticCurveTo(hx + 225, groundY - 60, hx + 300, groundY);
            ctx.stroke();
            // Scribble hatch shading on hills
            for (let s = 30; s < 270; s += 20) {
                ctx.moveTo(hx + s, groundY);
                ctx.lineTo(hx + s - 10, groundY - 18);
            }
            ctx.stroke();
        }
        ctx.restore();

        // Hand-drawn Doodle Ground Line
        ctx.save();
        ctx.strokeStyle = '#2b2a27';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        const groundStep = 20;
        for (let x = 0; x <= width; x += groundStep) {
            const wobble = Math.sin((x + scrollX) * 0.05) * 1.2;
            ctx.lineTo(x, groundY + wobble);
        }
        ctx.stroke();

        // Ground crosshatch texture & pencil crumbs
        ctx.strokeStyle = '#5a5850';
        ctx.lineWidth = 1.5;
        const textureOffset = (scrollX * 1.0) % 200;
        for (let x = -200; x < width + 200; x += 35) {
            const tx = x - textureOffset;
            // Short angled hatch marks under the ground line
            ctx.beginPath();
            ctx.moveTo(tx, groundY + 2);
            ctx.lineTo(tx - 6, groundY + 12);
            ctx.moveTo(tx + 8, groundY + 4);
            ctx.lineTo(tx + 2, groundY + 14);
            ctx.stroke();

            // Stray pebbles
            if ((x + 200) % 70 === 0) {
                this.sketchCircle(tx + 15, groundY + 7, 2, '#88857b', '#2b2a27', 1.2);
            }
        }
        ctx.restore();
    }

    // Draw happy floating doodle clouds
    drawCloud(cloud) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(cloud.x, cloud.y);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4a4843';
        ctx.lineWidth = 2;

        const w = cloud.w;
        const h = cloud.h;

        ctx.beginPath();
        ctx.moveTo(10, h);
        ctx.lineTo(w - 10, h);
        ctx.quadraticCurveTo(w + 6, h, w, h - 8);
        ctx.arc(w - 12, h - 14, 12, 0.2 * Math.PI, 1.4 * Math.PI, true);
        ctx.arc(w * 0.5, h - 22, 18, 0.9 * Math.PI, 1.9 * Math.PI, false);
        ctx.arc(14, h - 12, 12, 1.5 * Math.PI, 2.7 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cute smiling face on cloud
        ctx.strokeStyle = '#4a4843';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        // Eyes
        ctx.arc(w * 0.4, h - 10, 1.8, 0, Math.PI * 2);
        ctx.arc(w * 0.6, h - 10, 1.8, 0, Math.PI * 2);
        ctx.stroke();
        // Smile
        ctx.beginPath();
        ctx.arc(w * 0.5, h - 7, 3, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    // -------------------------------------------------------------
    // PARTICLES: PENCIL DUST, COMIC CRASH BURSTS, ONIONS
    // -------------------------------------------------------------
    drawParticles(particles) {
        const ctx = this.ctx;
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);

            if (p.type === 'DUST') {
                // Pencil shavings / crumbs
                ctx.fillStyle = '#4a4843';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'COMIC_TEXT') {
                // Hand-drawn comic bubble: "CLANG!", "OUCH!", "SHIIING!"
                ctx.font = `bold ${p.size}px 'Chilanka', 'Architects Daughter', cursive`;
                ctx.fillStyle = p.color || '#e74c3c';
                ctx.strokeStyle = '#1f1e1d';
                ctx.lineWidth = 3;
                ctx.strokeText(p.text, p.x, p.y);
                ctx.fillText(p.text, p.x, p.y);
            } else if (p.type === 'STAR') {
                this.drawComicStar(ctx, p.x, p.y, p.size, p.color || '#f1c40f');
            } else if (p.type === 'ONION') {
                // Little panicked onion jumping out
                this.drawMiniOnion(ctx, p.x, p.y, p.size);
            }

            ctx.restore();
        });
    }

    // Panicked cute doodle onion
    drawMiniOnion(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        const scale = size / 20;
        ctx.scale(scale, scale);

        const ink = '#1f1e1d';
        // Onion bulb
        ctx.fillStyle = '#fce7cb';
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -12); // Sprout tip
        ctx.quadraticCurveTo(14, -6, 12, 10);
        ctx.quadraticCurveTo(6, 16, 0, 16);
        ctx.quadraticCurveTo(-6, 16, -12, 10);
        ctx.quadraticCurveTo(-14, -6, 0, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Green sprout hair
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -12); ctx.lineTo(-4, -20);
        ctx.moveTo(0, -12); ctx.lineTo(0, -22);
        ctx.moveTo(0, -12); ctx.lineTo(4, -19);
        ctx.stroke();

        // Panicked big cartoon eyes
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-4, 0, 3.5, 0, Math.PI * 2);
        ctx.arc(4, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(-4, 0, 1.8, 0, Math.PI * 2);
        ctx.arc(4, 0, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Screaming mouth
        ctx.beginPath();
        ctx.ellipse(0, 7, 2.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

window.DoodleRenderer = DoodleRenderer;
