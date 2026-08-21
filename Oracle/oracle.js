/* ============================================================
   THE ORACLE
   An intuitive recommender tied to the Allmer catalog.

   Mirrors the catalog's "functional medium" division. Starts
   directly at the medium question.

   Built so far:
     L0  medium → which studio (in catalog order)
     L1  games  → Digital or physical?
     L2         → How many players?
     L3+        → nature, fate, the hour — but only while the games
                  still standing disagree. The moment one is left,
                  the Oracle speaks.
   Other studios are "coming soon" leaves.

   Navigation is an ELEVATOR: each answer is a floor. You ride
   up/down through the floors you've visited (buttons, ↑/↓ keys),
   ←/→ move the highlighted choice, Space/Enter selects, Esc rides
   back up to the medium. Choosing a new option on a floor discards
   the floors below it.

   New catalog games slot into GAMES below — name, slug, brand,
   player counts, Bartle types, fate, minutes. Digital-only titles
   use digitalOnly(). New questions slot into QUESTIONS, in the
   order they should be asked.
   ============================================================ */

// The studio's hue — Allmer Games green, worn by every floor below it.
const GAMES_COLOR = '#10b981';

const ORACLE = {
    start: 'medium',
    nodes: {
        // ---- Entry: the functional branch ----
        medium: {
            label: 'Medium',
            color: '#c8a96a',
            eyebrow: 'The Oracle',
            prompt: 'Through which <em>medium</em> shall the Oracle speak?',
            sub: 'Six studios. Choose the one whose craft you desire.',
            choices: ['comics', 'films', 'music', 'games', 'journals', 'snacks'],
        },

        // ---- The six studios ----
        comics: studio('Comics', '#ef4444', 'Ink, panel, and page'),
        films: studio('Films', '#3b82f6', 'Light in the dark'),
        music: studio('Music', '#fbbf24', 'Sound and score'),
        games: {
            label: 'Games',
            color: GAMES_COLOR,
            hint: 'Play made design',
            eyebrow: 'By Form',
            prompt: 'Shall the play be <em>digital</em> or <em>physical</em>?',
            sub: 'Screen or table — the form decides which games can gather.',
            choices: ['digital', 'physical'],
        },

        // ---- The two forms of play ----
        // Each leads to its own player question, because the two forms
        // offer different table sizes (see playerCounts).
        digital: {
            label: 'Digital',
            color: GAMES_COLOR,
            hint: 'Screen, arcade, machine',
            mode: 'digital',
            eyebrow: 'By Players',
            prompt: 'How many <em>players</em> gather?',
            sub: 'Machines fill the empty seats — every game plays from one.',
            question: 'players',
        },
        physical: {
            label: 'Physical',
            color: GAMES_COLOR,
            hint: 'Cards, board, table',
            mode: 'physical',
            eyebrow: 'By Players',
            prompt: 'How many <em>players</em> gather?',
            sub: 'Every seat is a person — the Oracle will name the games for your table.',
            question: 'players',
        },
        journals: studio('Journals', '#b8763a', 'The written record'),
        snacks: studio('Snacks', '#ec4899', 'Taste as craft'),
    },
};

function studio(label, color, hint) {
    return {
        label,
        color,
        hint,
        comingSoon: true,
        leafTitle: label,
        leafBody: 'The Oracle is still learning to question this medium. Its functional attributes will soon guide you here.',
    };
}

// ============================================================
//  The Games — drawn from the catalog.
//  counts   = the table-sizes the game is designed for.
//             (Seven Wonders is exactly 2 OR 4 — never 3 — hence a set.)
//  physical = the sizes you can actually sit down and play in print.
//             An empty set means there is no physical edition yet, so
//             the title never appears on the physical floor and carries
//             no Product link.
//  types    = which of Bartle's four players the game serves.
//  fate     = how much chance decides: none | some | much. A title can
//             hold two — American Playing Cards is many games in one
//             deck, Elements can be played hard or played light.
//  minutes  = the ceiling of its band: 5, 15 or 30. Nothing runs past
//             thirty, so you can always switch it up or play again.
//  Digitally every game plays from 1 up to its largest table, since
//  machines take the empty seats — see countsFor().
//  Slugs build the three links: /slug, /slugarcade, /slugdemo.
//  TBA titles (Trinity, Capital, Equilibrium, Silk Road) are omitted
//  until made.
// ============================================================
const GAMES = [
    // Seven Wonders — designed for 2 or 4 players, no chance at all.
    // Only Pyramid and Statue are in print so far; the rest are screen-only.
    sw('Pyramid', 'pyramid', [2, 4]),
    sw('Gardens', 'gardens'),
    sw('Temple', 'temple'),
    sw('Statue', 'statue', [2]),
    sw('Mausoleum', 'mausoleum'),
    sw('Colossus', 'colossus'),
    sw('Pharos', 'pharos'),
    sw('Colosseum', 'colosseum'),
    sw('Great Wall', 'greatwall'),
    sw('Library', 'library'),
    sw('Tower', 'tower'),
    sw('Cathedral', 'cathedral'),
    sw('Palace', 'palace'),
    sw('Skyscraper', 'skyscraper'),

    // Futory — 2-4 (2-6 when several titles are combined)
    game('Futory Cards Unity', 'futorycardsunity', 'Futory',
        { min: 2, max: 4, types: 'achiever explorer', fate: 'some', minutes: 30 }),
    game('Futory Cards Duality', 'futorycardsduality', 'Futory',
        { min: 2, max: 4, types: 'achiever explorer', fate: 'some', minutes: 30 }),

    // Casino Camino — the road, the gamble
    // Many games in one deck — some of them lean on chance harder than others.
    game('American Playing Cards', 'americanplayingcards', 'Casino Camino',
        { min: 2, max: 6, types: 'socializer killer', fate: 'some much', minutes: 15 }),
    game('Fortuna', 'fortuna', 'Casino Camino',
        { min: 2, max: 8, types: 'socializer achiever', fate: 'much', minutes: 15 }),
    game('Ricochet', 'ricochet', 'Casino Camino',
        { min: 2, max: 8, types: 'killer socializer', fate: 'much', minutes: 15 }),

    // Believe — the story told on the spot. Purely social; the random
    // draw is the only place chance enters.
    game('Believe', 'believe', 'Believe',
        { min: 2, max: 8, types: 'socializer', fate: 'some', minutes: 15 }),
    game('Believe Objects', 'believeobjects', 'Believe',
        { min: 2, max: 8, types: 'socializer', fate: 'some', minutes: 15 }),

    // Detective Noname — solo, screen only. One chapter ≈ 30 minutes.
    digitalOnly('Detective Noname and the Silent Circle', 'noname', 'Detective Noname',
        { min: 1, max: 1, types: 'explorer', fate: 'none', minutes: 30 }),

    // Screen-born solo games — no physical edition
    digitalOnly('Beat Race', 'beatrace', '',
        { min: 1, max: 1, types: 'achiever', fate: 'none', minutes: 5 }),
    digitalOnly('Crosslink', 'crosslink', '',
        { min: 1, max: 1, types: 'explorer achiever', fate: 'none', minutes: 5 }),

    // Elements — learned in two minutes. You race to shed cards rather
    // than to beat anyone, and it stays light enough to talk over.
    // Playable strategically, though most won't — hence both fates.
    game('Elements', 'elements', 'Elements',
        { min: 2, max: 6, types: 'socializer achiever', fate: 'some much', minutes: 15 }),

    // Nectar (brand to be confirmed)
    game('Nectar', 'nectar', '',
        { min: 2, max: 6, types: 'achiever socializer', fate: 'some', minutes: 15 }),
];

const MAX_PLAYERS = 8;

function range(min, max) {
    const out = [];
    for (let i = min; i <= max; i++) out.push(i);
    return out;
}

// Every Seven Wonders title shares its nature: pure strategy, no chance,
// a full half-hour. `physical` is the only thing that differs — which of
// the 2/4 tables you can buy in a box (none by default).
function sw(name, slug, physical = []) {
    return game(name, slug, 'Seven Wonders',
        { counts: [2, 4], physical, types: 'achiever killer', fate: 'none', minutes: 30 });
}

function game(name, slug, brand, o) {
    const counts = o.counts || range(o.min, o.max);
    return {
        name, slug, brand, counts,
        physical: o.physical || counts,   // in print at every size, unless told otherwise
        types: o.types.split(' '),
        fate: o.fate.split(' '),
        minutes: o.minutes,
    };
}

// A title that exists only on a screen — it never reaches the table.
function digitalOnly(name, slug, brand, o) {
    return game(name, slug, brand, { ...o, physical: [] });
}

function inPrint(g) {
    return g.physical.length > 0;
}

// Digitally you can just turn on computers: any number of people from
// one up to the largest table the game was designed for.
function countsFor(g, mode) {
    return mode === 'digital' ? range(1, Math.max(...g.counts)) : g.physical;
}

function gamesFor(n, mode) {
    return GAMES.filter(g => countsFor(g, mode).includes(n));
}

// Only offer a number the catalog can actually answer. Every solo title
// is digital-only, so 1 simply doesn't appear on the physical floor.
function playerCounts(mode) {
    return range(1, MAX_PLAYERS).filter(n => gamesFor(n, mode).length > 0);
}

// ============================================================
//  The questions of appetite — asked after the table is set.
//
//  Order matters: the most telling question comes first, so a lone
//  survivor is named at once instead of surviving three more floors.
//  Bartle's four players discriminate hardest, then fate, then the hour.
// ============================================================
const ARCHETYPES = [
    { value: 'achiever', label: 'Achiever', hint: 'Points, status, the win recorded' },
    { value: 'explorer', label: 'Explorer', hint: 'Discovery, hidden mechanics, deep lore' },
    { value: 'socializer', label: 'Socializer', hint: 'Talk, alliance, the table itself' },
    { value: 'killer', label: 'Killer', hint: 'Competition, dominance, the other beaten' },
];

// `said` is how an answer is echoed back on the result floor, where the
// bare label ("None") would read wrong.
const FATES = [
    { value: 'none', label: 'None', hint: 'Every outcome earned', said: 'No fate' },
    { value: 'some', label: 'Some', hint: 'Chance deals, skill decides', said: 'Some fate' },
    { value: 'much', label: 'Much', hint: 'Surrender to the draw', said: 'Much fate' },
];

const SPANS = [
    { value: 5, label: '0–5 min', hint: 'A round between two things' },
    { value: 15, label: '5–15 min', hint: 'A sitting' },
    { value: 30, label: '15–30 min', hint: 'A chapter, a full game' },
];

const QUESTIONS = [
    {
        key: 'type',
        options: ARCHETYPES,
        color: GAMES_COLOR,
        eyebrow: 'By Nature',
        prompt: 'Which <em>player</em> are you?',
        sub: 'Four natures gather at every table. Choose the one that is yours.',
        test: (g, v) => g.types.includes(v),
    },
    {
        key: 'fate',
        options: FATES,
        color: GAMES_COLOR,
        eyebrow: 'By Fate',
        prompt: 'How much <em>fate</em> shall you encounter?',
        sub: 'The Oracle asks how much it may decide on your behalf.',
        test: (g, v) => g.fate.includes(v),
    },
    {
        key: 'span',
        options: SPANS,
        color: GAMES_COLOR,
        eyebrow: 'By The Hour',
        prompt: 'How long shall it <em>last</em>?',
        sub: 'Nothing here runs past thirty minutes — switch it up, or play again.',
        test: (g, v) => g.minutes === v,
    },
];

// Everything still standing under the answers given so far.
function matching(q) {
    return gamesFor(q.players, q.mode).filter(g =>
        QUESTIONS.every(x => q[x.key] === undefined || x.test(g, q[x.key]))
    );
}

// A question earns its floor only when the survivors disagree about it.
// One game left, one live answer, or an answer that changes nothing —
// and the Oracle skips straight ahead rather than asking for form's sake.
function nextQuestion(q) {
    const rest = matching(q);
    if (rest.length <= 1) return null;

    for (const x of QUESTIONS) {
        if (q[x.key] !== undefined) continue;
        const live = x.options.filter(o => rest.some(g => x.test(g, o.value)));
        const splits = live.some(o => rest.filter(g => x.test(g, o.value)).length < rest.length);
        if (live.length > 1 && splits) return { ...x, options: live };
    }
    return null;
}

// The answers given, in the Oracle's own words.
function saidSoFar(q) {
    return QUESTIONS
        .filter(x => q[x.key] !== undefined)
        .map(x => {
            const option = x.options.find(o => o.value === q[x.key]);
            return option.said || option.label;
        });
}

// ============================================================
//  Engine — the elevator
// ============================================================
class Oracle {
    constructor() {
        this.column = document.getElementById('column');
        this.elUp = document.getElementById('elUp');
        this.elDown = document.getElementById('elDown');
        this.elevFloors = document.getElementById('elevFloors');

        this.floors = [];   // [{ el, node, kind, chosenIndex, accent }]
        this.current = 0;   // active floor
        this.focusIndex = 0;
        this.keyboardMode = false; // highlight a choice only once keys are used
        this.locked = false;

        this.elUp.addEventListener('click', () => this.up());
        this.elDown.addEventListener('click', () => this.down());
        document.getElementById('brandReset').addEventListener('click', () => this.reset());
        document.getElementById('devToggle').addEventListener('click', () =>
            document.body.classList.toggle('dev')
        );
        window.addEventListener('keydown', e => this.onKey(e));

        this.reset();
    }

    reset() {
        this.column.innerHTML = '';
        this.floors = [];
        this.current = 0;
        this.locked = false;
        this.appendFloor(this.makeNodeFloor(ORACLE.nodes[ORACLE.start]));
        this.setActive(0);
        this.armFloor(0);
        this.updateChrome();
    }

    setActive(index) {
        this.column.style.setProperty('--active', index);
    }

    // ---- Floor construction ----
    makeNodeFloor(node) {
        const idx = this.floors.length; // the index this floor will occupy
        let el, kind;
        if (node.choices) { el = this.buildChoiceLevel(node, idx); kind = 'choice'; }
        else if (node.question === 'players') { el = this.buildPlayersLevel(node, idx); kind = 'players'; }
        else { el = this.buildLeafLevel(node); kind = 'leaf'; }
        return { el, node, kind, chosenIndex: null, accent: node.color };
    }

    // The games branch below the player count: ask the next question
    // that still separates them, or — when one stands alone — speak.
    makeGamesFloor(query) {
        const question = nextQuestion(query);
        return question
            ? this.makeQuestionFloor(question, query)
            : this.makeResultFloor(query);
    }

    makeQuestionFloor(question, query) {
        const idx = this.floors.length;
        return {
            el: this.buildQuestionLevel(question, query, idx),
            node: { color: question.color },
            kind: 'choice',
            chosenIndex: null,
            accent: question.color,
        };
    }

    makeResultFloor(query) {
        return { el: this.buildResultLevel(query), node: null, kind: 'leaf', chosenIndex: null, accent: GAMES_COLOR };
    }

    appendFloor(floor) {
        this.column.appendChild(floor.el);
        this.floors.push(floor);
        floor.el.style.setProperty('--depth', Math.min(this.floors.length - 1, 4));
    }

    truncateForward(index) {
        for (let k = this.floors.length - 1; k > index; k--) {
            this.floors[k].el.remove();
            this.floors.pop();
        }
    }

    buildChoiceLevel(node, floorIndex) {
        const level = document.createElement('section');
        level.className = 'level';
        level.innerHTML = `
            <div class="level-voice">
                ${node.eyebrow ? `<div class="level-eyebrow">${node.eyebrow}</div>` : ''}
                <div class="level-prompt">${node.prompt}</div>
                ${node.sub ? `<div class="level-sub">${node.sub}</div>` : ''}
            </div>
            <div class="valves"></div>
            <div class="level-orb floating"></div>
        `;
        this.tintOrb(level.querySelector('.level-orb'), node.color);

        const valves = level.querySelector('.valves');
        node.choices.forEach((childId, i) => {
            const child = ORACLE.nodes[childId];
            const valve = document.createElement('button');
            valve.className = 'valve';
            if (child.dev) valve.classList.add('is-dev');
            valve.style.setProperty('--vc', child.color || 'var(--champagne)');
            valve.style.animationDelay = `${0.35 + i * 0.08}s`;
            valve.innerHTML = `
                <div class="socket"></div>
                <div class="valve-label">${child.label}</div>
                ${child.hint ? `<div class="valve-hint">${child.hint}</div>` : ''}
            `;
            valve.addEventListener('click', () =>
                this.commit(floorIndex, valve, i, child.color, () => this.makeNodeFloor(child))
            );
            valves.appendChild(valve);
        });
        return level;
    }

    buildPlayersLevel(node, floorIndex) {
        const level = document.createElement('section');
        level.className = 'level';
        level.innerHTML = `
            <div class="level-voice">
                <div class="level-eyebrow">${node.eyebrow}</div>
                <div class="level-prompt">${node.prompt}</div>
                <div class="level-sub">${node.sub}</div>
            </div>
            <div class="valves players"></div>
            <div class="level-orb floating"></div>
        `;
        this.tintOrb(level.querySelector('.level-orb'), node.color);

        const valves = level.querySelector('.valves');
        playerCounts(node.mode).forEach((n, i) => {
            const valve = document.createElement('button');
            valve.className = 'valve valve-num';
            valve.style.setProperty('--vc', node.color);
            valve.style.animationDelay = `${0.35 + i * 0.06}s`;
            valve.innerHTML = `<div class="socket"><span class="numeral">${n}</span></div>`;
            valve.addEventListener('click', () =>
                this.commit(floorIndex, valve, i, node.color, () =>
                    this.makeGamesFloor({ mode: node.mode, players: n }))
            );
            valves.appendChild(valve);
        });
        return level;
    }

    buildQuestionLevel(question, query, floorIndex) {
        const level = document.createElement('section');
        level.className = 'level';
        level.innerHTML = `
            <div class="level-voice">
                <div class="level-eyebrow">${question.eyebrow}</div>
                <div class="level-prompt">${question.prompt}</div>
                <div class="level-sub">${question.sub}</div>
            </div>
            <div class="valves"></div>
            <div class="level-orb floating"></div>
        `;
        this.tintOrb(level.querySelector('.level-orb'), question.color);

        const valves = level.querySelector('.valves');
        question.options.forEach((option, i) => {
            const valve = document.createElement('button');
            valve.className = 'valve';
            valve.style.setProperty('--vc', question.color);
            valve.style.animationDelay = `${0.35 + i * 0.08}s`;
            valve.innerHTML = `
                <div class="socket"></div>
                <div class="valve-label">${option.label}</div>
                <div class="valve-hint">${option.hint}</div>
            `;
            valve.addEventListener('click', () =>
                this.commit(floorIndex, valve, i, question.color, () =>
                    this.makeGamesFloor({ ...query, [question.key]: option.value }))
            );
            valves.appendChild(valve);
        });
        return level;
    }

    buildLeafLevel(node) {
        const level = document.createElement('section');
        level.className = 'level';
        const color = node.color || 'var(--champagne)';
        level.innerHTML = `
            <div class="leaf ${node.dev ? 'is-dev' : ''}">
                <div class="leaf-medallion" style="--vc:${color}"><span class="dot"></span></div>
                <div class="leaf-title">${node.leafTitle || node.label}</div>
                <div class="leaf-body">${node.leafBody || 'The Oracle has not yet formed this vision.'}</div>
                <div class="leaf-tag">Coming Soon</div>
            </div>
        `;
        return level;
    }

    buildResultLevel(query) {
        const level = document.createElement('section');
        level.className = 'level level-result';
        level.style.setProperty('--vc', GAMES_COLOR);

        const games = matching(query);
        const label = query.players === 1 ? 'Solo' : `${query.players} Players`;
        const count = games.length;
        const where = query.mode === 'digital' ? 'on screen' : 'for your table';
        const said = saidSoFar(query).join(' · ');

        const rows = games.map(g => `
            <div class="game">
                <div class="game-info">
                    <span class="game-name">${g.name}</span>
                    ${g.brand ? `<span class="game-brand">${g.brand}</span>` : ''}
                </div>
                <div class="game-actions">
                    ${inPrint(g) ? extLink('Product', `https://simonallmer.com/${g.slug}`) : ''}
                    ${extLink('Arcade', `https://simonallmer.com/${g.slug}arcade`)}
                    ${extLink('Demo', `https://simonallmer.com/${g.slug}demo`)}
                </div>
            </div>
        `).join('');

        level.innerHTML = `
            <div class="suggest">
                <div class="level-eyebrow">The Oracle Speaks</div>
                <h2 class="suggest-title">${label}</h2>
                <p class="suggest-sub">${count} ${count === 1 ? 'game' : 'games'} ${where}.</p>
                ${said ? `<p class="suggest-said">${said}</p>` : ''}
                <div class="game-list">${rows}</div>
            </div>
        `;
        return level;
    }

    tintOrb(orb, color) {
        if (!orb || !color) return;
        orb.style.setProperty('--vc', color);
        orb.classList.add('tinted');
    }

    // ---- Choosing (commit an answer on a floor) ----
    commit(floorIndex, valve, valveIndex, accent, nextFactory) {
        if (this.locked || floorIndex !== this.current) return;
        this.locked = true;

        this.truncateForward(floorIndex);
        const floor = this.floors[floorIndex];
        floor.chosenIndex = valveIndex;
        floor.accent = accent;

        this.dropOrb(floor.el, valve, accent, () => {
            this.appendFloor(nextFactory());
            this.current = floorIndex + 1;
            this.setActive(this.current);
            this.armFloor(this.current);
            this.updateChrome();
            this.locked = false;
        });
    }

    // Roll the crystal ball down into a valve, then run `done`.
    dropOrb(levelEl, valve, accent, done) {
        const orb = levelEl.querySelector('.level-orb');
        const socket = valve.querySelector('.socket');

        levelEl.querySelector('.valves').classList.add('choosing');
        valve.classList.add('chosen');

        const oR = orb.getBoundingClientRect();
        const sR = socket.getBoundingClientRect();
        const dx = (sR.left + sR.width / 2) - (oR.left + oR.width / 2);
        const dy = (sR.top + sR.height / 2) - (oR.top + oR.height / 2);

        orb.classList.remove('floating');
        orb.classList.add('dropping');
        if (accent) {
            orb.style.setProperty('--vc', accent);
            orb.classList.add('tinted');
        }
        orb.style.transform = `translate(${dx}px, ${dy}px) scale(0.62)`;

        setTimeout(() => {
            valve.classList.add('filled');
            orb.style.opacity = '0';
        }, 620);
        setTimeout(done, 900);
    }

    // ---- Elevator movement ----
    armFloor(index) {
        this.floors.forEach((f, k) => f.el.classList.toggle('past', k !== index));

        const floor = this.floors[index];
        const wrap = floor.el.querySelector('.valves');
        if (wrap) wrap.classList.remove('choosing');
        floor.el.querySelectorAll('.valve').forEach(v =>
            v.classList.remove('chosen', 'filled', 'focused')
        );

        const orb = floor.el.querySelector('.level-orb');
        if (orb) {
            orb.classList.remove('dropping', 'tinted');
            orb.style.transform = '';
            orb.style.opacity = '';
            orb.style.removeProperty('--vc');
            this.tintOrb(orb, floor.node && floor.node.color); // restore this floor's own hue
            orb.classList.add('floating');
        }

        const valves = floor.el.querySelectorAll('.valve');
        this.focusIndex = valves.length ? Math.min(floor.chosenIndex ?? 0, valves.length - 1) : 0;
        this.applyFocus();
    }

    applyFocus() {
        const valves = this.floors[this.current].el.querySelectorAll('.valve');
        valves.forEach((v, i) =>
            v.classList.toggle('focused', this.keyboardMode && i === this.focusIndex)
        );
    }

    moveFocus(dir) {
        const valves = this.floors[this.current].el.querySelectorAll('.valve');
        if (!valves.length) return;
        this.focusIndex = (this.focusIndex + dir + valves.length) % valves.length;
        this.applyFocus();
    }

    activateFocused() {
        const valves = this.floors[this.current].el.querySelectorAll('.valve');
        if (!valves.length) return;
        valves[this.focusIndex].click();
    }

    up() {
        if (this.locked || this.current <= 0) return;
        this.locked = true;
        this.current--;
        this.setActive(this.current);
        this.armFloor(this.current);
        this.updateChrome();
        setTimeout(() => { this.locked = false; }, 450);
    }

    down() {
        if (this.locked || this.current >= this.floors.length - 1) return;
        const floor = this.floors[this.current];
        const valve = floor.el.querySelectorAll('.valve')[floor.chosenIndex];
        if (!valve) return;
        this.locked = true;
        this.dropOrb(floor.el, valve, floor.accent, () => {
            this.current++;
            this.setActive(this.current);
            this.armFloor(this.current);
            this.updateChrome();
            this.locked = false;
        });
    }

    esc() {
        if (this.locked || this.current === 0) return;
        this.locked = true;
        this.current = 0;
        this.setActive(0);
        this.armFloor(0);
        this.updateChrome();
        setTimeout(() => { this.locked = false; }, 450);
    }

    updateChrome() {
        const atTop = this.current <= 0;
        const atBottom = this.current >= this.floors.length - 1;
        this.elUp.classList.toggle('disabled', atTop);
        this.elDown.classList.toggle('disabled', atBottom);
        this.elUp.disabled = atTop;
        this.elDown.disabled = atBottom;

        // Floor indicator pips
        this.elevFloors.innerHTML = '';
        this.floors.forEach((f, k) => {
            const pip = document.createElement('span');
            pip.className = 'elev-pip' + (k === this.current ? ' active' : '');
            this.elevFloors.appendChild(pip);
        });
    }

    onKey(e) {
        if (['ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Spacebar'].includes(e.key)) {
            this.keyboardMode = true;
        }
        switch (e.key) {
            case 'ArrowLeft': e.preventDefault(); this.moveFocus(-1); break;
            case 'ArrowRight': e.preventDefault(); this.moveFocus(1); break;
            case 'ArrowUp': e.preventDefault(); this.up(); break;
            case 'ArrowDown': e.preventDefault(); this.down(); break;
            case 'Enter': e.preventDefault(); this.activateFocused(); break;
            case ' ': case 'Spacebar': e.preventDefault(); this.activateFocused(); break;
            case 'Escape': this.esc(); break;
        }
    }
}

function extLink(label, href) {
    return `<a class="ext" href="${href}" target="_blank" rel="noopener">${label}<span class="ext-i" aria-hidden="true">↗</span></a>`;
}

document.addEventListener('DOMContentLoaded', () => new Oracle());
