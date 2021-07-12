"use strict";
const ConnectFour = (() => {
  const overlayOpacity = 45;
  const row = 7;
  const column = 6;
  const winnerCoordinatesStyle = "2px solid";
  const keyCode = { leftButton: 37, rightButton: 39, space: 32 };
  const rowMap = { 0: 30, 1: 110, 2: 190, 3: 270, 4: 350, 5: 430, 6: 510 };
  const playerInControlColor = ["#ff0000", "#0000ff"];
  const defaultNodeColor = "#8888887e";
  let nodes = getDefaultNodes();
  let playgroundElement = document.querySelector(".main_header-playground");
  let playerInControlElement = document.getElementById("playerInControl");
  let rowTargetElement = document.getElementById("rowTarget");
  let rowTarget = 30;
  let rowTargetIndex = 0;
  let playerInControl = 0;
  let lastTargetOverlay = false;
  let lastActivePosition = [];

  //implementation
  function getDefaultNodes() {
    return [
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
      [false, false, false, false, false, false],
    ];
  }
  function initalizeNodes() {
    for (let i = 0; i < column; i++) {
      for (let j = 0; j < row; j++) {
        const node = document.createElement("div");
        node.className = "node";
        node.id = `${j}${i}`;
        playgroundElement.appendChild(node);
      }
    }
  }

  function dropDisk() {
    lastActivePosition = fillConnectFourGround();
    if (lastActivePosition?.stopDisk) return;
    checkWinner(playerInControl);
    setPlayerInControl(true);
    fillConnectFourGround(1);
  }
  function listenToControl() {
    window.addEventListener("keyup", (e) => {
      const code = e.keyCode;
      if (code === keyCode.leftButton || code === keyCode.rightButton) {
        moveNodeTarget(code === keyCode.leftButton);
        fillConnectFourGround(1);
      }
      if (code === keyCode.space) dropDisk();
    });
    document
      .querySelector(".main_header-playground")
      .addEventListener("mouseover", (e) => {
        if (e.target?.id) {
          const row = `${e.target.id}`.split("")[0];
          rowTarget = rowMap[row];
          rowTargetIndex = row;
          rowTargetElement.style.left = `${rowTarget}px`;
          fillConnectFourGround(1);
        }
      });
    document
      .querySelector(".main_header-playground")
      .addEventListener("click", (e) => {
        if (e.target?.id) {
          dropDisk();
        }
      });
  }

  function setPlayerInControl(action) {
    if (action) {
      playerInControl = playerInControl ? 0 : 1;
      rowTargetElement.style.borderTopColor =
        playerInControlColor[playerInControl];
    }
    playerInControlElement.innerText = `Player ${playerInControl + 1} turn!`;
  }

  function fillConnectFourGround(isOverlay) {
    const columnIndex = rowTargetIndex;
    const nodeColumn = nodes[columnIndex];
    const lastIndex = nodeColumn.findIndex((v) => v);
    if (lastIndex === 0) return { stopDisk: true };
    const index = lastIndex === -1 ? 5 : lastIndex - 1;
    const targetIndex = columnIndex + "" + index;
    let isOverlayOpacity = "";
    if (isOverlay) {
      isOverlayOpacity = overlayOpacity;
      if (lastTargetOverlay) {
        const [x, y] = lastTargetOverlay.split("");
        if (!nodes[x][y]) {
          document.getElementById(lastTargetOverlay).style.background =
            defaultNodeColor;
        }
      }
      lastTargetOverlay = targetIndex;
    } else {
      nodeColumn[index] = `${playerInControl}`;
    }
    document.getElementById(targetIndex).style.background =
      playerInControlColor[playerInControl] + isOverlayOpacity;
    return targetIndex.split("");
  }

  function checkWinner(player) {
    if (!Array.isArray(lastActivePosition)) return;
    const [x, y] = lastActivePosition;
    checkXYAxis(x, y, player, true);
    checkXYAxis(x, y, player, false);
    const [topLeftX, topLeftY] = getInitalHorizontalCoordinate(
      "TOP_LEFT",
      Number(x),
      Number(y)
    );
    checkDiagonal(topLeftX, topLeftY, player);
    const [topRightX, topRightY] = getInitalHorizontalCoordinate(
      "TOP_RIGHT",
      Number(x),
      Number(y)
    );
    checkDiagonal(topRightX, topRightY, player, true);
  }

  function checkDiagonal(x, y, player, topRight_bottom) {
    //top-left to bottom-right
    let count = 0;
    let matchedCoordinates = [];
    while (1) {
      if (
        y >= column ||
        (x >= row && !topRight_bottom) ||
        (x < 0 && topRight_bottom)
      ) {
        break;
      }
      const node = nodes[x][y];
      const hasMatch = `${node}` == player;
      if (hasMatch) {
        matchedCoordinates.push({ x, y });
        if (++count === 4) someoneWon(player, matchedCoordinates);
      } else {
        count = 0;
        matchedCoordinates = [];
      }
      if (!topRight_bottom) {
        x++;
      } else {
        x--;
      }
      y++;
    }
  }
  function someoneWon(player, coordinates) {
    if (coordinates) {
      coordinates.forEach((coordinate) => {
        document.getElementById(
          `${coordinate.x}${coordinate.y}`
        ).style.outline = winnerCoordinatesStyle;
      });
    }
    setTimeout(() => {
      alert(`Player ${player + 1} won !`);
      setTimeout(() => {
        reset();
      });
    });
  }

  function getInitalHorizontalCoordinate(coordinate, x, y) {
    if (coordinate === "TOP_LEFT") {
      while (x >= 0 && y >= 0) {
        if (x - 1 > -1 && y - 1 > -1) {
          x--;
          y--;
        } else {
          break;
        }
      }
      return [x, y];
    } else if (coordinate === "TOP_RIGHT") {
      while (x < row && y >= 0) {
        if (x + 1 < row && y - 1 >= 0) {
          x++;
          y--;
        } else {
          break;
        }
      }
      return [x, y];
    }
  }

  function checkXYAxis(x1, y1, player, xAxis) {
    let count = 0;
    let matchedCoordinates = [];
    const checkCondition = (hasMatch, xCoord, yCoord, coordinates) => {
      if (hasMatch) {
        matchedCoordinates.push({ x: xCoord, y: yCoord });
        if (++count === 4) someoneWon(player, coordinates);
      } else {
        matchedCoordinates = [];
        count = 0;
      }
    };
    if (!xAxis) {
      for (let y = 0; y < column; y++) {
        checkCondition(`${nodes[x1][y]}` == player, x1, y, matchedCoordinates);
      }
    } else {
      for (let x = 0; x < row; x++) {
        checkCondition(`${nodes[x][y1]}` == player, x, y1, matchedCoordinates);
      }
    }
  }

  function moveNodeTarget(isLeft) {
    if ((rowTarget === 30 && isLeft) || (rowTarget === 510 && !isLeft)) return;
    rowTarget = rowTarget + (isLeft ? -80 : 80);
    rowTargetIndex = isLeft ? rowTargetIndex - 1 : rowTargetIndex + 1;
    rowTargetElement.style.left = `${rowTarget}px`;
  }

  function reset() {
    rowTarget = 30;
    rowTargetIndex = 0;
    playerInControl = 0;
    lastTargetOverlay = false;
    lastActivePosition = [];
    nodes = getDefaultNodes();
    for (let i = 0; i < column; i++) {
      for (let j = 0; j < row; j++) {
        const element = document.getElementById(`${j}${i}`);
        element.style.background = defaultNodeColor;
        element.style.outline = "none";
      }
    }
    setPlayerInControl(true);
    rowTargetElement.style.left = `30px`;
  }

  function main() {
    setPlayerInControl();
    initalizeNodes();
    listenToControl();
    fillConnectFourGround(1);
  }

  main.prototype.reset = function () {
    reset();
    setPlayerInControl(true);
    fillConnectFourGround(1);
  };

  return main;
})();
const connectFour = new ConnectFour();
function reset() {
  connectFour.reset();
}
