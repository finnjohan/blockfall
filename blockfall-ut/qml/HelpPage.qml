// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import Lomiri.Components 1.3

Page {
    id: helpPage
    header: PageHeader {
        title: root.tr("How to play")
        trailingActionBar.actions: [
            Action { iconName: "close"; text: root.tr("Close"); onTriggered: stack.pop() }
        ]
    }

    Flickable {
        anchors { top: header.bottom; left: parent.left; right: parent.right; bottom: parent.bottom }
        contentHeight: col.height + units.gu(2)
        clip: true

        Column {
            id: col
            anchors { left: parent.left; right: parent.right; margins: units.gu(2) }
            spacing: units.gu(1)

            Label { text: root.tr("Rules"); font.bold: true; fontSize: "large"; color: root.isDark ? "white" : "black" }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Fill complete horizontal lines to clear them and score points.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Pieces fall faster as the level increases. Every 10 cleared lines raises the level.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("You can save one piece for later and swap it once between placements.")
            }

            Label { text: root.tr("Controls"); font.bold: true; fontSize: "large"; color: root.isDark ? "white" : "black" }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Use the on-screen buttons, or swipe and tap on the board.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Swipe left/right, tap to rotate, swipe down for hard drop.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Keyboard: arrows move, Up rotates, Down soft drops, Space hard drops, H holds, P pauses.")
            }

            Label { text: root.tr("Scoring"); font.bold: true; fontSize: "large"; color: root.isDark ? "white" : "black" }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Single 100 · Double 300 · Triple 500 · Tetris 800, multiplied by level.")
            }
            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                text: root.tr("Soft drop gives 1 point per cell, hard drop 2 points per cell.")
            }
        }
    }
}
