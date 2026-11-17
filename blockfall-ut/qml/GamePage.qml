// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import QtQuick.Layouts 1.12
import Lomiri.Components 1.3
import "Logic.js" as Logic
import "Palette.js" as Palette
import "Storage.js" as Storage

Page {
    id: page
    focus: true
    Keys.enabled: true

    property var game: Logic.newGame(12345)
    property var ghostMap: ({})
    property var currentMap: ({})
    property string statusText: ""
    property bool overRecorded: false

    readonly property string cellBg: root.isDark ? "#13241c" : "#f7f8f3"
    readonly property string boardBg: root.isDark ? "#0a1711" : "#e8ece4"
    readonly property string lineColor: root.isDark ? "#466052" : "#9aa89c"
    readonly property string textColor: root.isDark ? "#eef5f0" : "#1b2a21"

    function seedValue() {
        if (root.seedParam !== "") return parseInt(root.seedParam, 10)
        return Math.floor(Math.random() * 2147483647) + 1
    }

    function newGame() {
        var s = Logic.newGame(seedValue())
        if (root.argValue("score") !== "") s.score = parseInt(root.argValue("score"), 10)
        if (root.argValue("lines") !== "") s.lines = parseInt(root.argValue("lines"), 10)
        if (root.argValue("level") !== "") s.level = parseInt(root.argValue("level"), 10)
        if (root.pausedParam) s.paused = true
        if (root.overParam) { s.over = true; s.current = null }
        var stack = parseInt(root.argValue("stack"), 10)
        if (!isNaN(stack) && stack > 0) {
            for (var r = Logic.ROWS - stack; r < Logic.ROWS; r++) {
                for (var c = 0; c < Logic.COLS; c++) {
                    if ((c + r) % 7 === 0) continue
                    s.board[r * Logic.COLS + c] = (c + r) % 7 + 1
                }
            }
        }
        game = s
        overRecorded = root.overParam
        statusText = root.tr("Tap the board or use the buttons to move pieces.")
        rebuildMaps()
    }

    function sync() {
        game = JSON.parse(JSON.stringify(game))
        rebuildMaps()
    }

    function rebuildMaps() {
        var gm = {}, cm = {}, i, c
        var ghosts = Logic.ghostCells(game)
        for (i = 0; i < ghosts.length; i++) {
            c = ghosts[i]
            gm[c.y * Logic.COLS + c.x] = Palette.colorForIndex(c.color)
        }
        var current = Logic.currentCells(game)
        for (i = 0; i < current.length; i++) {
            c = current[i]
            cm[c.y * Logic.COLS + c.x] = Palette.colorForIndex(c.color)
        }
        ghostMap = gm
        currentMap = cm
    }

    function afterAction(prevLines, prevLevel) {
        var gained = game.lines - prevLines
        if (gained >= 4) statusText = root.tr("Tetris!")
        else if (gained === 3) statusText = root.tr("Triple!")
        else if (gained === 2) statusText = root.tr("Double!")
        else if (gained === 1) statusText = root.tr("Line clear!")
        if (game.level > prevLevel) statusText = (statusText ? statusText + " · " : "") + root.tr("New level!")
        checkOver()
    }

    function checkOver() {
        if (game.over && !overRecorded) {
            overRecorded = true
            Storage.addScore(game.score, game.lines, game.level)
            statusText = root.tr("Game over")
        }
    }

    function doMove(dx, dy) {
        if (game.over || game.paused || !game.current) return
        Logic.move(game, dx, dy)
        sync()
    }

    function doRotate() {
        if (game.over || game.paused || !game.current) return
        Logic.rotate(game, 1)
        sync()
    }

    function doSoftDrop() {
        if (game.over || game.paused || !game.current) return
        var lines = game.lines, level = game.level
        Logic.softDrop(game)
        sync()
        afterAction(lines, level)
    }

    function doHardDrop() {
        if (game.over || game.paused || !game.current) return
        var lines = game.lines, level = game.level
        Logic.hardDrop(game)
        sync()
        afterAction(lines, level)
    }

    function doHold() {
        if (game.over || game.paused || !game.current) return
        var before = game.hold
        if (Logic.holdPiece(game)) {
            statusText = root.tr("Piece held.")
            sync()
        } else {
            statusText = root.tr("Cannot hold again yet.")
            sync()
        }
    }

    function togglePause() {
        if (game.over) return
        game.paused = !game.paused
        statusText = game.paused ? root.tr("Paused") : root.tr("Ready?")
        sync()
    }

    function tick() {
        if (game.over || game.paused || !game.current) return
        var lines = game.lines, level = game.level
        Logic.tick(game)
        sync()
        afterAction(lines, level)
    }

    Timer {
        interval: Logic.dropInterval(page.game.level)
        repeat: true
        running: page.game && !page.game.paused && !page.game.over && page.game.current !== null
        onTriggered: page.tick()
    }

    header: PageHeader {
        id: header
        title: root.tr("Blockfall")
        subtitle: root.tr("Score") + " " + page.game.score + "  ·  "
                  + root.tr("Lines") + " " + page.game.lines + "  ·  "
                  + root.tr("Level") + " " + page.game.level
        trailingActionBar.actions: [
            Action { iconName: "help"; text: root.tr("Help"); onTriggered: stack.push(Qt.resolvedUrl("HelpPage.qml")) },
            Action { iconName: "info"; text: root.tr("Statistics"); onTriggered: stack.push(Qt.resolvedUrl("StatsPage.qml")) },
            Action { iconName: "settings"; text: root.tr("Settings"); onTriggered: stack.push(Qt.resolvedUrl("SettingsPage.qml")) },
            Action {
                iconName: page.game.paused ? "media-playback-start" : "media-playback-pause"
                text: page.game.paused ? root.tr("Resume") : root.tr("Pause")
                onTriggered: page.togglePause()
            }
        ]
    }

    ColumnLayout {
        anchors {
            top: header.bottom
            left: parent.left
            right: parent.right
            bottom: parent.bottom
            margins: units.gu(1)
        }
        spacing: units.gu(0.6)

        Row {
            Layout.alignment: Qt.AlignHCenter
            spacing: units.gu(1.5)

            Column {
                spacing: units.dp(2)
                Label {
                    width: units.gu(7)
                    horizontalAlignment: Text.AlignHCenter
                    text: root.tr("Hold")
                    font.bold: true
                    color: page.textColor
                }
                Rectangle {
                    width: units.gu(7)
                    height: units.gu(5)
                    radius: units.gu(0.5)
                    color: root.isDark ? "#10251a" : "#eef2e9"
                    border.width: units.dp(1)
                    border.color: page.lineColor
                    PiecePreview {
                        anchors.centerIn: parent
                        pieceType: page.game.hold || ""
                        blockSize: units.gu(0.9)
                    }
                }
            }

            Column {
                spacing: units.dp(2)
                Label {
                    width: units.gu(15)
                    horizontalAlignment: Text.AlignHCenter
                    text: root.tr("Next")
                    font.bold: true
                    color: page.textColor
                }
                Row {
                    spacing: units.gu(0.6)
                    Repeater {
                        model: 3
                        Rectangle {
                            width: units.gu(5)
                            height: units.gu(5)
                            radius: units.gu(0.5)
                            color: root.isDark ? "#10251a" : "#eef2e9"
                            border.width: units.dp(1)
                            border.color: page.lineColor
                            PiecePreview {
                                anchors.centerIn: parent
                                pieceType: page.game.next && page.game.next.length > index ? page.game.next[index] : ""
                                blockSize: units.gu(0.7)
                            }
                        }
                    }
                }
            }
        }

        Item {
            id: boardWrap
            Layout.alignment: Qt.AlignHCenter
            Layout.preferredWidth: Math.min(parent.width * 0.72, parent.height * 0.38, units.gu(40))
            Layout.preferredHeight: width * 2
            property real cellSize: width / Logic.COLS

            Rectangle {
                anchors.fill: parent
                color: page.boardBg
                border.width: units.dp(2)
                border.color: page.lineColor
                radius: units.gu(0.4)
            }

            Grid {
                anchors.fill: parent
                columns: Logic.COLS
                rows: Logic.ROWS
                Repeater {
                    model: Logic.ROWS * Logic.COLS
                    delegate: Rectangle {
                        property int idx: index
                        property int val: page.game.board[idx]
                        property string ghostColor: page.ghostMap[idx] || ""
                        property string currentColor: page.currentMap[idx] || ""
                        property bool isGhost: val === 0 && ghostColor !== "" && currentColor === ""

                        width: boardWrap.cellSize
                        height: boardWrap.cellSize
                        color: val !== 0 ? Palette.colorForIndex(val)
                             : (currentColor !== "" ? currentColor
                             : (ghostColor !== "" ? ghostColor : "transparent"))
                        opacity: isGhost ? 0.32 : 1
                        border.width: units.dp(1)
                        border.color: page.lineColor
                    }
                }
            }

            MouseArea {
                anchors.fill: parent
                property real startX: 0
                property real startY: 0
                onPressed: { startX = mouseX; startY = mouseY }
                onReleased: {
                    var dx = mouseX - startX, dy = mouseY - startY
                    if (Math.abs(dx) > units.gu(1.5)) page.doMove(dx > 0 ? 1 : -1, 0)
                    else if (dy > units.gu(1.5)) page.doHardDrop()
                    else if (dy < -units.gu(1.5)) page.doSoftDrop()
                    else page.doRotate()
                }
            }
        }

        Label {
            Layout.fillWidth: true
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.WordWrap
            text: page.statusText
            color: page.textColor
        }

        Column {
            Layout.alignment: Qt.AlignHCenter
            spacing: units.gu(0.6)

            Row {
                anchors.horizontalCenter: parent.horizontalCenter
                spacing: units.gu(0.6)
                Button { text: root.tr("Left"); width: units.gu(10); height: units.gu(6.5); onClicked: page.doMove(-1, 0) }
                Button { text: root.tr("Right"); width: units.gu(10); height: units.gu(6.5); onClicked: page.doMove(1, 0) }
                Button { text: root.tr("Rotate"); width: units.gu(10); height: units.gu(6.5); onClicked: page.doRotate() }
                Button { text: root.tr("Soft drop"); width: units.gu(10); height: units.gu(6.5); onClicked: page.doSoftDrop() }
            }
            Row {
                anchors.horizontalCenter: parent.horizontalCenter
                spacing: units.gu(0.6)
                Button { text: root.tr("Hard drop"); width: units.gu(12); height: units.gu(6.5); onClicked: page.doHardDrop() }
                Button { text: root.tr("Hold"); width: units.gu(10); height: units.gu(6.5); onClicked: page.doHold() }
                Button { text: page.game.paused ? root.tr("Resume") : root.tr("Pause"); width: units.gu(10); height: units.gu(6.5); onClicked: page.togglePause() }
                Button { text: root.tr("New game"); width: units.gu(11); height: units.gu(6.5); onClicked: page.newGame() }
            }
        }

        Item { Layout.fillHeight: true }
    }

    Rectangle {
        anchors.fill: parent
        visible: page.game.paused && !page.game.over
        color: "#000000aa"
        z: 50
        Column {
            anchors.centerIn: parent
            spacing: units.gu(1)
            Label { text: root.tr("Paused"); fontSize: "x-large"; color: "white" }
            Button { text: root.tr("Resume"); onClicked: page.togglePause() }
            Button { text: root.tr("New game"); onClicked: page.newGame() }
        }
    }

    Rectangle {
        anchors.fill: parent
        visible: page.game.over
        color: "#000000bb"
        z: 100
        Column {
            anchors.centerIn: parent
            spacing: units.gu(1)
            Label {
                width: units.gu(30)
                horizontalAlignment: Text.AlignHCenter
                wrapMode: Text.WordWrap
                text: root.tr("Game over")
                fontSize: "x-large"
                color: "white"
            }
            Label {
                width: units.gu(30)
                horizontalAlignment: Text.AlignHCenter
                color: "#dfeee4"
                text: root.tr("Final score") + ": " + page.game.score
            }
            Button { text: root.tr("Play again"); onClicked: page.newGame() }
            Button { text: root.tr("Statistics"); onClicked: stack.push(Qt.resolvedUrl("StatsPage.qml")) }
        }
    }

    Keys.onPressed: {
        if (event.key === Qt.Key_Left) page.doMove(-1, 0)
        else if (event.key === Qt.Key_Right) page.doMove(1, 0)
        else if (event.key === Qt.Key_Up) page.doRotate()
        else if (event.key === Qt.Key_Down) page.doSoftDrop()
        else if (event.key === Qt.Key_Space) page.doHardDrop()
        else if (event.key === Qt.Key_H) page.doHold()
        else if (event.key === Qt.Key_P) page.togglePause()
        else return
        event.accepted = true
    }

    Component.onCompleted: {
        newGame()
        page.forceActiveFocus()
    }
}
