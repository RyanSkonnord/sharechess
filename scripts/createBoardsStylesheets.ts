import { BoardStyle, Style } from "./../src/types";
import { loadImage, createCanvas } from "canvas";
import Board from "../src/board/Board";
import { CreateCanvas, LoadImage } from "../src/types";
import boardStyles from "../src/board/styles-board/boardStyles";
import fs from "fs";

const size = 1200;
// const OUT_DIR = "public/boards";
const OUT_DIR_LICHESS = "public/stylus/lichess/boards";
const OUT_DIR_CHESSCOM = "public/stylus/chesscom/boards";

const ChesscomStylesheet = (
  dataURL: string,
  boardName: string,
  style: Style
) => {
  return `
    /* ==UserStyle==
    @name           ${boardName} chess set
    @namespace      chess.com
    @version        1.0.0
    @description    Chess set for chess.com
    @author         sharechess.github.io
    ==/UserStyle== */

    @-moz-document domain("chess.com") {
      .board {background-image: url(${dataURL}) !important}
      .coordinate-light {fill: ${style.coords.onLight} !important}
      .coordinate-dark {fill: ${style.coords.onDark} !important}
      .highlight {opacity: 1 !important; background-color: ${style.moveIndicator.color} !important}
    }
  `;
};

const main = async () => {
  if (!fs.existsSync(OUT_DIR_CHESSCOM)) {
    fs.mkdirSync(OUT_DIR_CHESSCOM, { recursive: true });
  }

  if (!fs.existsSync(OUT_DIR_LICHESS)) {
    fs.mkdirSync(OUT_DIR_LICHESS, { recursive: true });
  }

  const create = () => createCanvas(size, size);
  const load = (src: string) => loadImage(`public${src}`);

  for (const boardStyle of Object.keys(boardStyles)) {
    console.log(`Generating stylesheets for board: ${boardStyle}...`);

    const boardNamePretty = boardStyle
      .split(/[-_]/)
      .map((chunk) => chunk[0].toUpperCase() + chunk.substring(1))
      .join(" ");

    const board = new Board(
      {
        size,
        tiles: 8,
        showBorder: false,
        showExtraInfo: false,
        boardStyle: boardStyle as BoardStyle,
      },
      load as unknown as LoadImage,
      create as unknown as CreateCanvas
    );

    await board.renderStatic();
    // @ts-ignore
    // const image = board.canvas.toBuffer();

    const chesscomStylesheet = ChesscomStylesheet(
      board.toImgUrl(),
      boardNamePretty,
      boardStyles[boardStyle as BoardStyle]
    );

    fs.writeFileSync(
      `${OUT_DIR_CHESSCOM}/${boardStyle}.user.css`,
      chesscomStylesheet
    );
  }
};

main();