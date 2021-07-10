"use strict";
const ConnectFour = (() => {
  const keyCode = { leftButton: 37, rightButton: 39, space: 32 };
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
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        const node = document.createElement("div");
        node.className = "node";
        node.id = `${j}${i}`;
        playgroundElement.appendChild(node);
      }
    }
  }

  function listenToControl() {
    window.addEventListener("keyup", (e) => {
      const code = e.keyCode;
      if (code === keyCode.leftButton || code === keyCode.rightButton) {
        moveNodeTarget(code === keyCode.leftButton);
        fillConnectFourGroundOverlay();
      }
      if (code === keyCode.space) {
        lastActivePosition = fillConnectFourGround();
        checkWinner(playerInControl);
        setPlayerInControl(true);
        fillConnectFourGroundOverlay();
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

  function fillConnectFourGround() {
    const columnIndex = rowTargetIndex;
    const nodeColumn = nodes[columnIndex];
    const lastIndex = nodeColumn.findIndex((v) => v);
    if (lastIndex === 0) return;
    const index = lastIndex === -1 ? 5 : lastIndex - 1;
    nodeColumn[index] = `${playerInControl}`;
    const targetIndex = columnIndex + "" + index;
    document.getElementById(targetIndex).style.background =
      playerInControlColor[playerInControl];
    return targetIndex.split("");
  }

  function fillConnectFourGroundOverlay() {
    const columnIndex = rowTargetIndex;
    const nodeColumn = nodes[columnIndex];
    const lastIndex = nodeColumn.findIndex((v) => v);
    if (lastIndex === 0) return;
    if (lastTargetOverlay) {
      const [x, y] = lastTargetOverlay.split("");
      if (!nodes[x][y]) {
        document.getElementById(lastTargetOverlay).style.background =
          defaultNodeColor;
      }
    }
    const index = lastIndex === -1 ? 5 : lastIndex - 1;
    const idx = columnIndex + "" + index;
    lastTargetOverlay = idx;
    document.getElementById(idx).style.background =
      playerInControlColor[playerInControl] + "30";
  }

  function checkWinner(player) {
    if (!Array.isArray(lastActivePosition)) return;
    const [x, y] = lastActivePosition;
    let count = 0;
    for (let x = 0; x < 7; x++) count = checkXYAxis(x, y, player, count);
    count = 0;
    for (let y = 0; y < 6; y++) count = checkXYAxis(x, y, player, count);
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
    while (1) {
      if (
        y >= 6 ||
        (x >= 7 && !topRight_bottom) ||
        (x < 0 && topRight_bottom)
      ) {
        break;
      }
      const node = nodes[x][y];
      const hasMatch = `${node}` == player;
      if (hasMatch) {
        if (++count === 4) someoneWon(player);
      } else {
        count = 0;
      }
      if (!topRight_bottom) {
        x++;
      } else {
        x--;
      }
      y++;
    }
  }
  function someoneWon(player) {
    setTimeout(() => {
      alert(`Player ${player + 1} won !!!`);
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
      while (x < 7 && y >= 0) {
        if (x + 1 < 7 && y - 1 >= 0) {
          x++;
          y--;
        } else {
          break;
        }
      }
      return [x, y];
    }
  }

  function checkXYAxis(x, y, player, count) {
    const hasMatch = `${nodes[x][y]}` == player;
    if (hasMatch) {
      if (++count === 4) someoneWon(player);
      return count;
    }
    count = 0;
    return 0;
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
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        const element = document.getElementById(`${j}${i}`);
        element.style.background = defaultNodeColor;
      }
    }
    setPlayerInControl(true);
    rowTargetElement.style.left = `30px`;
  }

  function main() {
    setPlayerInControl();
    initalizeNodes();
    listenToControl();
    fillConnectFourGroundOverlay();
  }

  main.prototype.reset = function () {
    reset();
    setPlayerInControl(true);
    fillConnectFourGroundOverlay();
  };

  return main;
})();
const connectFour = new ConnectFour();
function reset() {
  connectFour.reset();
}
