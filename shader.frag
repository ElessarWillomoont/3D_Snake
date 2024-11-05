#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dt;
uniform int u_msg;

uniform int u_acctual_size; // actual grid size
uniform int u_gridWidth;     // grid width
uniform int u_gridHeight;    // grid height

uniform int u_gameArray[200]; // game array

in vec2 f_uv;

out vec4 outColor;

const int unUse = 0;
const int isEmpty = 1;
const int haveSnake = 2;
const int haveApple = 3;

void decodeGridPlace(int gridIndex, out int x, out int y) {
    x = gridIndex % u_gridWidth; // 获取 x 坐标
    y = gridIndex / u_gridWidth; // 获取 y 坐标
}

void main() {
    float cellWidth = u_resolution.x / float(u_gridWidth);
    float cellHeight = u_resolution.y / float(u_gridHeight);

    // 计算片段在网格中的位置
    float xPos = mod(gl_FragCoord.x, cellWidth);
    float yPos = mod(gl_FragCoord.y, cellHeight);
    
    // 定义网格线宽度
    float lineWidth = 2.0; // 线宽（像素）

    // 设置圆的半径，与格子大小一致
    float radius = min(cellWidth, cellHeight) / 2.0;

    // 遍历 u_gameArray 中的每个元素
    for (int i = 0; i < 200; i++) {
        int gridX, gridY;
        decodeGridPlace(i, gridX, gridY);

        // 计算网格中心
        float centerX = float(gridX) * cellWidth + cellWidth / 2.0;
        float centerY = float(gridY) * cellHeight + cellHeight / 2.0;

        // 计算当前片段与网格中心的距离
        float dist = distance(vec2(gl_FragCoord.x, gl_FragCoord.y), vec2(centerX, centerY));

        // 根据 u_gameArray[i] 的值绘制不同内容
        if (u_gameArray[i] == haveSnake) {
            // 绘制绿色圆圈表示蛇
            if (dist < radius) {
                outColor = vec4(0.0, 1.0, 0.0, 1.0); // 绿色
                return;
            }
        } else if (u_gameArray[i] == haveApple) {
            // 绘制红色圆圈表示苹果
            if (dist < radius) {
                outColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
                return;
            }
        } else if (u_gameArray[i] == isEmpty) {
            // 空格子设置为背景颜色（白色）
            outColor = vec4(1.0, 1.0, 1.0, 1.0); // 白色
        }
    }

    // 绘制网格线
    if (xPos < lineWidth || xPos > (cellWidth - lineWidth) ||
        yPos < lineWidth || yPos > (cellHeight - lineWidth)) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0); 
    }
}
