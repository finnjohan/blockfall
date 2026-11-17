.pragma library
// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later
.import QtQuick.LocalStorage 2.0 as Sql

var _db = null
var _name = "blockfall"

function useDatabase(name) {
    _name = name
    _db = null
}

function db() {
    if (_db) return _db
    _db = Sql.LocalStorage.openDatabaseSync(_name, "1.0", "Blockfall", 1000000)
    _db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)")
        tx.executeSql("CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY AUTOINCREMENT, score INTEGER, lines INTEGER, level INTEGER, date TEXT)")
    })
    return _db
}

function setting(key, fallback) {
    var v = fallback
    db().readTransaction(function (tx) {
        var rs = tx.executeSql("SELECT value FROM settings WHERE key = ?", [key])
        if (rs.rows.length > 0 && rs.rows.item(0).value !== null) v = rs.rows.item(0).value
    })
    return v
}

function setSetting(key, value) {
    db().transaction(function (tx) {
        tx.executeSql("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, String(value)])
    })
}

function removeSetting(key) {
    db().transaction(function (tx) {
        tx.executeSql("DELETE FROM settings WHERE key = ?", [key])
    })
}

function dateKey(date) {
    var d = date || new Date()
    var m = d.getMonth() + 1
    var day = d.getDate()
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day
}

function scores(limit) {
    var out = []
    var n = limit || 10
    db().readTransaction(function (tx) {
        var rs = tx.executeSql("SELECT score, lines, level, date FROM scores ORDER BY score DESC, id DESC LIMIT ?", [n])
        for (var i = 0; i < rs.rows.length; i++) {
            var r = rs.rows.item(i)
            out.push({ score: r.score, lines: r.lines, level: r.level, date: r.date })
        }
    })
    return out
}

function addScore(score, lines, level, date) {
    var day = dateKey(date)
    db().transaction(function (tx) {
        tx.executeSql("INSERT INTO scores (score, lines, level, date) VALUES (?, ?, ?, ?)",
                      [score || 0, lines || 0, level || 1, day])
        tx.executeSql("DELETE FROM scores WHERE id NOT IN (SELECT id FROM scores ORDER BY score DESC, id DESC LIMIT 20)")
    })
}

function summary() {
    var s = { games: 0, lines: 0, best: 0 }
    db().readTransaction(function (tx) {
        var rs = tx.executeSql("SELECT COUNT(*) AS games, COALESCE(SUM(lines),0) AS lines, COALESCE(MAX(score),0) AS best FROM scores")
        if (rs.rows.length > 0) {
            s.games = rs.rows.item(0).games
            s.lines = rs.rows.item(0).lines
            s.best = rs.rows.item(0).best
        }
    })
    return s
}
