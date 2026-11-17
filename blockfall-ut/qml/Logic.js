.pragma library
// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

// Ren spellogik för Blockfall. Ingen Qt-import, inga DOM/Node-API:er.
// Allt tillstånd är JSON-serialiserbart (slump och påse lagras i state).

var COLS = 10
var ROWS = 20

var TYPES = ["I", "O", "T", "S", "Z", "J", "L"]

var COLORS = { I: 1, O: 2, T: 3, S: 4, Z: 5, J: 6, L: 7 }

// Klassiska Tetris-former. 4x4 för I, 2x2 för O, 3x3 för övriga.
var BASE = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ]
}

var KICKS = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1], [0, -2]]

function emptyBoard() {
    var board = []
    for (var i = 0; i < COLS * ROWS; i++)
        board.push(0)
    return board
}

function nextRandom(state) {
    var x = state.seed | 0
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    state.seed = x >>> 0
    return state.seed
}

function refillBag(state) {
    var bag = TYPES.slice()
    for (var i = bag.length - 1; i > 0; i--) {
        var j = nextRandom(state) % (i + 1)
        var tmp = bag[i]
        bag[i] = bag[j]
        bag[j] = tmp
    }
    state.bag = bag
    return bag
}

function takeFromBag(state) {
    if (!state.bag || state.bag.length === 0)
        refillBag(state)
    return state.bag.shift()
}

function ensureNext(state) {
    while (state.next.length < 4)
        state.next.push(takeFromBag(state))
    return state.next
}

function createPiece(type) {
    var src = BASE[type]
    var matrix = []
    for (var r = 0; r < src.length; r++)
        matrix.push(src[r].slice())
    var width = matrix[0].length
    return {
        type: type,
        matrix: matrix,
        x: Math.floor((COLS - width) / 2),
        y: -1
    }
}

function rotateMatrix(matrix, dir) {
    var n = matrix.length
    var out = []
    for (var r = 0; r < n; r++) {
        var row = []
        for (var c = 0; c < n; c++) {
            if (dir < 0)
                row.push(matrix[c][n - 1 - r])
            else
                row.push(matrix[n - 1 - c][r])
        }
        out.push(row)
    }
    return out
}

function collides(board, piece, dx, dy, matrix) {
    var m = matrix || piece.matrix
    for (var r = 0; r < m.length; r++) {
        for (var c = 0; c < m[r].length; c++) {
            if (!m[r][c])
                continue
            var x = piece.x + c + dx
            var y = piece.y + r + dy
            if (x < 0 || x >= COLS || y >= ROWS)
                return true
            if (y < 0)
                continue
            if (board[y * COLS + x] !== 0)
                return true
        }
    }
    return false
}

function spawn(state) {
    var type = state.next.shift()
    ensureNext(state)
    var piece = createPiece(type)
    state.current = piece
    state.canHold = true
    if (collides(state.board, piece, 0, 0, piece.matrix)) {
        state.over = true
        state.current = null
        return false
    }
    return true
}

function newGame(seed) {
    var state = {
        board: emptyBoard(),
        current: null,
        next: [],
        hold: null,
        canHold: true,
        bag: [],
        seed: (seed ? seed : 0x9e3779b9) >>> 0,
        score: 0,
        lines: 0,
        level: 1,
        combo: -1,
        over: false,
        paused: false,
        pieces: 0,
        lastClear: 0
    }
    refillBag(state)
    ensureNext(state)
    spawn(state)
    return state
}

function move(state, dx, dy) {
    if (state.over || !state.current)
        return false
    var p = state.current
    if (collides(state.board, p, dx, dy, p.matrix))
        return false
    p.x += dx
    p.y += dy
    return true
}

function rotate(state, dir) {
    if (state.over || !state.current)
        return false
    var p = state.current
    var rotated = rotateMatrix(p.matrix, dir)
    for (var i = 0; i < KICKS.length; i++) {
        var dx = KICKS[i][0]
        var dy = KICKS[i][1]
        if (!collides(state.board, p, dx, dy, rotated)) {
            p.matrix = rotated
            p.x += dx
            p.y += dy
            return true
        }
    }
    return false
}

function ghostDistance(state) {
    if (!state.current)
        return 0
    var p = state.current
    var d = 0
    while (!collides(state.board, p, 0, d + 1, p.matrix))
        d++
    return d
}

function lockPiece(state) {
    var p = state.current
    if (!p)
        return false
    var cleared = 0
    for (var r = 0; r < p.matrix.length; r++) {
        for (var c = 0; c < p.matrix[r].length; c++) {
            if (!p.matrix[r][c])
                continue
            var x = p.x + c
            var y = p.y + r
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS)
                state.board[y * COLS + x] = COLORS[p.type]
        }
    }
    state.pieces++

    var result = clearLines(state.board)
    state.board = result.board
    cleared = result.count

    state.lines += cleared
    state.level = Math.floor(state.lines / 10) + 1
    state.score += scoreForLines(cleared, state.level)
    state.lastClear = cleared
    if (cleared > 0)
        state.combo = state.combo + 1
    else
        state.combo = -1

    state.current = null
    return spawn(state)
}

function softDrop(state) {
    if (state.over || !state.current)
        return false
    var p = state.current
    if (!collides(state.board, p, 0, 1, p.matrix)) {
        p.y++
        state.score += 1
        return true
    }
    lockPiece(state)
    return false
}

function tick(state) {
    if (state.over || !state.current)
        return false
    var p = state.current
    if (!collides(state.board, p, 0, 1, p.matrix)) {
        p.y++
        return true
    }
    lockPiece(state)
    return false
}

function hardDrop(state) {
    if (state.over || !state.current)
        return 0
    var d = ghostDistance(state)
    state.current.y += d
    state.score += 2 * d
    lockPiece(state)
    return d
}

function clearLines(board) {
    var out = board.slice()
    var count = 0
    for (var r = ROWS - 1; r >= 0; r--) {
        var full = true
        for (var c = 0; c < COLS; c++) {
            if (out[r * COLS + c] === 0) {
                full = false
                break
            }
        }
        if (full) {
            count++
            for (var y = r; y > 0; y--) {
                for (var x = 0; x < COLS; x++)
                    out[y * COLS + x] = out[(y - 1) * COLS + x]
            }
            for (var x2 = 0; x2 < COLS; x2++)
                out[x2] = 0
            r++
        }
    }
    return { board: out, count: count }
}

function scoreForLines(count, level) {
    var base = [0, 100, 300, 500, 800]
    if (count < 0)
        count = 0
    if (count > 4)
        count = 4
    return base[count] * level
}

function holdPiece(state) {
    if (state.over || !state.current || !state.canHold)
        return false
    var currentType = state.current.type
    if (state.hold === null) {
        state.hold = currentType
        spawn(state)
    } else {
        var swapped = state.hold
        state.hold = currentType
        state.current = createPiece(swapped)
        if (collides(state.board, state.current, 0, 0, state.current.matrix)) {
            state.over = true
            state.current = null
        }
    }
    state.canHold = false
    return true
}

function currentCells(state) {
    var out = []
    if (!state.current)
        return out
    var p = state.current
    var color = COLORS[p.type]
    for (var r = 0; r < p.matrix.length; r++) {
        for (var c = 0; c < p.matrix[r].length; c++) {
            if (!p.matrix[r][c])
                continue
            var y = p.y + r
            if (y < 0)
                continue
            out.push({ x: p.x + c, y: y, type: p.type, color: color, current: true })
        }
    }
    return out
}

function ghostCells(state) {
    var out = []
    if (!state.current)
        return out
    var p = state.current
    var d = ghostDistance(state)
    var color = COLORS[p.type]
    for (var r = 0; r < p.matrix.length; r++) {
        for (var c = 0; c < p.matrix[r].length; c++) {
            if (!p.matrix[r][c])
                continue
            var y = p.y + r + d
            if (y < 0 || y >= ROWS)
                continue
            var x = p.x + c
            if (state.board[y * COLS + x] !== 0)
                continue
            out.push({ x: x, y: y, type: p.type, color: color })
        }
    }
    return out
}

function dropInterval(level) {
    return Math.max(90, 800 - (level - 1) * 70)
}

function cloneState(state) {
    var copy = {
        board: state.board.slice(),
        current: null,
        next: state.next.slice(),
        hold: state.hold,
        canHold: state.canHold,
        bag: state.bag.slice(),
        seed: state.seed,
        score: state.score,
        lines: state.lines,
        level: state.level,
        combo: state.combo,
        over: state.over,
        paused: state.paused,
        pieces: state.pieces,
        lastClear: state.lastClear
    }
    if (state.current) {
        var m = []
        for (var r = 0; r < state.current.matrix.length; r++)
            m.push(state.current.matrix[r].slice())
        copy.current = {
            type: state.current.type,
            matrix: m,
            x: state.current.x,
            y: state.current.y
        }
    }
    return copy
}
