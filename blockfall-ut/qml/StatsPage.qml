// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import Lomiri.Components 1.3
import "Storage.js" as Storage

Page {
    id: statsPage
    property var scoreData: []
    property var totals: Storage.summary()

    function refresh() {
        scoreData = Storage.scores(10)
        totals = Storage.summary()
    }

    header: PageHeader {
        title: root.tr("High scores")
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
            spacing: units.gu(0.8)

            Row { spacing: units.gu(1); Label { width: units.gu(14); font.bold: true; text: root.tr("Games") } Label { text: String(totals.games || 0) } }
            Row { spacing: units.gu(1); Label { width: units.gu(14); font.bold: true; text: root.tr("Total lines") } Label { text: String(totals.lines || 0) } }
            Row { spacing: units.gu(1); Label { width: units.gu(14); font.bold: true; text: root.tr("Best score") } Label { text: String(totals.best || 0) } }

            Label { text: root.tr("Recent games"); font.bold: true; fontSize: "large" }

            Repeater {
                model: scoreData
                delegate: Rectangle {
                    width: parent.width
                    height: units.gu(4)
                    color: index % 2 === 0 ? (root.isDark ? "#12261c" : "#eef2e9") : "transparent"
                    Row {
                        anchors { left: parent.left; right: parent.right; verticalCenter: parent.verticalCenter; margins: units.gu(0.5) }
                        spacing: units.gu(0.5)
                        Label { width: units.gu(3); text: (index + 1) + "."; font.bold: true }
                        Label { width: units.gu(11); text: String(modelData.score) }
                        Label { width: units.gu(7); text: root.tr("Lines") + " " + modelData.lines }
                        Label { width: units.gu(7); text: root.tr("Level") + " " + modelData.level }
                        Label { width: units.gu(10); text: modelData.date; font.pixelSize: units.dp(12); elide: Text.ElideRight }
                    }
                }
            }

            Label {
                width: parent.width
                wrapMode: Text.WordWrap
                visible: scoreData.length === 0
                text: root.tr("No games played yet.")
            }
        }
    }

    Component.onCompleted: refresh()
}
