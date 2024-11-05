#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform int u_gridWidth;     // 网格宽度（列数）
uniform int u_gridHeight;    // 网格高度（行数）
uniform int u_gameArray[200]; // 网格状态数组

out vec4 outColor;

const int unUse = 0;
const int isEmpty = 1;
const int haveSnake = 2;
const int haveApple = 3;

void main() {
    // 每个网格的宽度和高度
    float cellWidth = u_resolution.x / float(u_gridWidth);
    float cellHeight = u_resolution.y / float(u_gridHeight);

    // 计算当前像素所在的网格坐标 (gridX, gridY)
    int gridX = int(gl_FragCoord.x / cellWidth);
    int gridY = int(gl_FragCoord.y / cellHeight);

    // 计算当前网格在 u_gameArray 中的索引
    int gridIndex = gridY * u_gridWidth + gridX;

    // 确保索引不超出 u_gameArray 范围
    if (gridIndex < 0 || gridIndex >= 200) {
        outColor = vec4(1.0, 1.0, 1.0, 1.0); // 默认白色
        return;
    }

    // 获取当前网格的状态
    int cellState = u_gameArray[gridIndex];

    // 计算当前片段相对于网格的局部位置
    float xPos = mod(gl_FragCoord.x, cellWidth) - cellWidth / 2.0;
    float yPos = mod(gl_FragCoord.y, cellHeight) - cellHeight / 2.0;
    float dist = length(vec2(xPos, yPos));

    // 绘制不同状态的颜色和图形
    float radius = min(cellWidth, cellHeight) / 2.0 - 2.0; // 圆的半径

    if (cellState == haveSnake && dist < radius) {
        outColor = vec4(0.0, 1.0, 0.0, 1.0); // 绿色，表示蛇
    } else if (cellState == haveApple && dist < radius) {
        outColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色，表示苹果
    } else if (cellState == isEmpty) {
        outColor = vec4(1.0, 1.0, 1.0, 1.0); // 白色，表示空
    } else {
        outColor = vec4(0.0, 0.0, 0.0, 1.0); // 其他情况
    }
}
