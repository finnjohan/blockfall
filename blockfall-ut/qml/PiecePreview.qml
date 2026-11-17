// SPDX-FileCopyrightText: 2026 Johan Finn
// SPDX-License-Identifier: GPL-3.0-or-later

import QtQuick 2.12
import Lomiri.Components 1.3
import "Logic.js" as Logic
import "Palette.js" as Palette

Item {
    id: preview
    property string pieceType: ""
    property real blockSize: units.gu(1.4)

    implicitWidth: blockSize * 4
    implicitHeight: blockSize * 4

    Grid {
        anchors.centerIn: parent
        columns: 4
        rows: 4
        spacing: 0

        Repeater {
            model: 16
            delegate: Rectangle {
                property int row: Math.floor(index / 4)
                property int col: index % 4
                property var matrix: Logic.BASE[preview.pieceType]
                property bool filled: matrix !== undefined && matrix !== null
                                      && row < matrix.length
                                      && col < matrix[row].length
                                      && matrix[row][col] === 1

                width: preview.blockSize
                height: preview.blockSize
                color: filled ? Palette.colorForType(preview.pieceType) : "transparent"
                border.width: filled ? units.dp(1) : 0
                border.color: root.isDark ? "#0b1f16" : "#333333"
            }
        }
    }
}
