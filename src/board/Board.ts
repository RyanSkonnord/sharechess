import {
  BoardConfig,
  CreateCanvas,
  Header,
  LoadImage,
  Position,
  Style,
  BoardStyle,
} from "./../types";
// @ts-ignore
import drawRectangle from "./layers/drawRectangle";
import drawCoords from "./layers/drawCoords";
import drawMoveIndicators from "./layers/drawMoveIndicators";
import drawPieces from "./layers/drawPieces";
import drawHeader from "./layers/drawHeader";
import drawExtraInfo from "./layers/drawExtraInfo";
import boards from "./styles-board/boardStyles";
import isLink from "../utils/isLink";
import { PiecesStyle } from "./styles-pieces/piecesStyles";
import loadImageBrowser from "./loaders/loadImage";

const defaultConfig: BoardConfig = {
  size: 720,
  tiles: 8,
  boardStyle: "standard",
  piecesStyle: "tatiana",
  showBorder: true,
  showExtraInfo: true,
  showMaterial: true,
  showMoveIndicator: true,
  showChecks: true,
  showCoords: true,
  showShadows: false,
  flipped: false,
};

const defaultHeader: Header = {
  White: "White",
  Black: "Black",
  WhitePretty: "White",
  BlackPretty: "Black",
  WhiteElo: null,
  BlackElo: null,
  Date: null,
  DatePretty: null,
  Event: null,
  Round: null,
  Site: null,
  Result: null,
};

class Board {
  private cfg: BoardConfig = defaultConfig;
  private _anonymous: boolean = false;

  private scale: number = 1;
  private borderScale: number = 1;

  private size: number = 0;
  private squareSize: number = 0;
  private innerSize: number = 0;
  private borderWidth: number = 0;
  private margin: number = 0;

  private style: Style = boards.standard;
  private header: Header = defaultHeader;
  private lastPosition: Position | null = null;
  private background: HTMLCanvasElement | null = null;
  private currentScreen: "title" | "move" = "move";

  private ctx: CanvasRenderingContext2D;
  private tempCtx: CanvasRenderingContext2D;

  private tempCanvas: HTMLCanvasElement;
  public canvas: HTMLCanvasElement;

  constructor(
    config: Partial<BoardConfig> = {},
    private loadImage: LoadImage = loadImageBrowser,
    private createCanvas: CreateCanvas = () => document.createElement("canvas")
  ) {
    this.canvas = this.createCanvas();
    this.tempCanvas = this.createCanvas();

    const ctx = this.canvas.getContext("2d");
    const tempCtx = this.tempCanvas.getContext("2d");

    if (ctx === null || tempCtx === null) {
      throw new Error("Cannot create canvas 2D context");
    }

    this.ctx = ctx;
    this.tempCtx = tempCtx;

    this.updateConfig(config, false);
  }

  async setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.setSize(this.cfg.size);

    await this.refresh();
  }

  async updateConfig(config: Partial<BoardConfig>, refresh: boolean = true) {
    const cfg = { ...this.cfg, ...config };

    this.cfg = cfg;

    this.setSize(cfg.size);
    this.setStyle(cfg.boardStyle, refresh);

    if (refresh) {
      await this.refresh();
    }
  }

  set anonymous(value: boolean) {
    this._anonymous = value;
    this.refresh();
  }

  async refresh() {
    await this.renderBackground();

    if (this.currentScreen === "title") {
      await this.titleFrame(this.header);
    } else if (this.lastPosition !== null) {
      await this.frame(this.lastPosition, this.header);
    }

    this.render();
  }

  setSize(size: number) {
    this.size = size;
    this.scale = size / 720;
    this.margin = this.cfg.showExtraInfo ? Math.round(50 * this.scale) : 0;

    const height = size + this.margin * 2;

    if (this.canvas.width !== size || this.canvas.height !== height) {
      this.canvas.width = size;
      this.canvas.height = height;
      this.tempCanvas.width = size;
      this.tempCanvas.height = height;
    }

    const tempBorderWidth = this.cfg.showBorder
      ? (this.size / 32) * this.borderScale
      : 0;
    const tempInnerSize = this.size - tempBorderWidth * 2;
    this.squareSize = Math.floor(tempInnerSize / this.cfg.tiles);
    this.innerSize = this.squareSize * this.cfg.tiles;
    this.borderWidth = (this.size - this.innerSize) / 2;

    return this;
  }

  getSize() {
    return this.size;
  }

  setBorderScale(scale: number) {
    this.borderScale = scale;
  }

  setStyle(style: BoardStyle, refresh: boolean = true) {
    this.style = boards[style];
    this.cfg.boardStyle = style;
    if (refresh) {
      this.refresh();
    }
    return this;
  }

  setPiecesStyle(style: PiecesStyle) {
    this.cfg.piecesStyle = style;
    this.refresh();
    return this;
  }

  flip() {
    this.cfg.flipped = !this.cfg.flipped;
    this.refresh();
    return this;
  }

  flipWhite() {
    if (!this.cfg.flipped) {
      return;
    }

    this.cfg.flipped = false;
    this.refresh();
    return this;
  }

  flipBlack() {
    if (this.cfg.flipped) {
      return;
    }

    this.cfg.flipped = true;
    this.refresh();
    return this;
  }

  hideBorder() {
    this.cfg.showBorder = false;
    this.setSize(this.size);
    this.refresh();
    return this;
  }

  showBorder() {
    this.cfg.showBorder = true;
    this.setSize(this.size);
    this.refresh();
    return this;
  }

  toggleBorder() {
    this.cfg.showBorder = !this.cfg.showBorder;
    this.setSize(this.size);
    this.refresh();
    return this;
  }

  toggleExtraInfo() {
    this.cfg.showExtraInfo = !this.cfg.showExtraInfo;
    this.setSize(this.size);
    this.refresh();
    return this;
  }

  toggleShadows() {
    this.cfg.showShadows = !this.cfg.showShadows;
    this.refresh();
    return this;
  }

  private getFinalHeader() {
    return this._anonymous
      ? {
          ...this.header,
          White: "Anonymous",
          Black: "Anonymous",
          WhitePretty: "Anonymous",
          BlackPretty: "Anonymous",
          Site: isLink(this.header.Site) ? null : this.header.Site,
        }
      : {
          ...this.header,
          Site: isLink(this.header.Site)
            ? (this.header.Site as string).replace(/^http[s]*:\/\//, "")
            : this.header.Site,
        };
  }

  async titleFrame(header: Header) {
    this.currentScreen = "title";
    this.header = header;

    await drawHeader(
      this.tempCtx,
      this.size,
      this.scale,
      this.margin,
      this.style,
      this.getFinalHeader(),
      this.loadImage
    );
  }

  async renderBackground() {
    const canvas = this.createCanvas();
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = this.size;
    canvas.height = this.size + this.margin * 2;

    const { background, dark, light, border, coords } = this.style;

    ctx.clearRect(0, 0, this.size, this.size);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 0, this.size, this.size);

    await drawRectangle(
      ctx,
      this.width,
      this.height,
      0,
      0,
      border,
      this.loadImage
    );

    await drawRectangle(
      ctx,
      this.innerSize,
      this.innerSize,
      this.cfg.showBorder ? this.borderWidth : 0,
      (this.cfg.showBorder ? this.borderWidth : 0) + this.margin,
      background,
      this.loadImage,
      this.cfg.tiles
    );

    for (let rank = 0; rank < this.cfg.tiles; rank++) {
      for (let file = 0; file < this.cfg.tiles; file++) {
        const style =
          (file % 2 === 0 && rank % 2 === 0) ||
          (file % 2 !== 0 && rank % 2 !== 0)
            ? light
            : dark;

        const x = file * this.squareSize + this.borderWidth;
        const y = rank * this.squareSize + this.borderWidth + this.margin;

        await drawRectangle(
          ctx,
          this.squareSize,
          this.squareSize,
          x,
          y,
          style,
          this.loadImage
        );
      }
    }

    if (this.cfg.showBorder && this.cfg.showCoords) {
      drawCoords(
        ctx,
        coords,
        this.squareSize,
        this.cfg.tiles,
        this.cfg.flipped,
        this.borderWidth,
        this.size,
        this.cfg.showBorder,
        this.margin
      );
    }

    console.log("Background rendered!");
    this.background = canvas;
  }

  async frame(position: Position | null, header?: Header) {
    this.currentScreen = "move";
    this.lastPosition = position;
    this.header = header ?? this.header;

    this.tempCtx.clearRect(0, 0, this.size, this.size);

    if (this.background === null) {
      await this.renderBackground();
    }

    this.tempCtx.drawImage((await this.background) as HTMLCanvasElement, 0, 0);

    if (this.lastPosition?.move && this.cfg.showMoveIndicator) {
      await drawMoveIndicators(
        this.tempCtx,
        this.lastPosition.move,
        this.squareSize,
        this.style,
        this.borderWidth,
        this.cfg.tiles,
        this.cfg.flipped,
        this.margin,
        this.loadImage
      );
    }

    if (!this.cfg.showBorder && this.cfg.showCoords) {
      drawCoords(
        this.tempCtx,
        this.style.coords,
        this.squareSize,
        this.cfg.tiles,
        this.cfg.flipped,
        this.borderWidth,
        this.size,
        this.cfg.showBorder,
        this.margin
      );
    }

    if (!this.lastPosition) {
      return;
    }

    await drawPieces(
      this.tempCtx,
      this.lastPosition,
      this.squareSize,
      this.borderWidth,
      this.cfg.flipped,
      this.margin,
      this.cfg.piecesStyle,
      this.cfg.showShadows,
      this.loadImage
    );

    if (this.cfg.showExtraInfo && header) {
      await drawExtraInfo(
        this.tempCtx,
        this.width,
        this.height,
        this.scale,
        this.margin,
        this.style,
        this.getFinalHeader(),
        this.cfg.flipped,
        this.lastPosition
      );
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.drawImage(this.tempCanvas, 0, 0);
  }

  async renderStatic() {
    this.ctx.clearRect(0, 0, this.size, this.size);
    const { background, dark, light, border } = this.style;

    drawRectangle(
      this.ctx,
      this.width,
      this.height,
      0,
      0,
      border,
      this.loadImage
    );

    drawRectangle(
      this.ctx,
      this.innerSize,
      this.innerSize,
      this.cfg.showBorder ? this.borderWidth : 0,
      (this.cfg.showBorder ? this.borderWidth : 0) + this.margin,
      background,
      this.loadImage,
      this.cfg.tiles
    );

    for (let rank = 0; rank < this.cfg.tiles; rank++) {
      for (let file = 0; file < this.cfg.tiles; file++) {
        const style =
          (file % 2 === 0 && rank % 2 === 0) ||
          (file % 2 !== 0 && rank % 2 !== 0)
            ? light
            : dark;

        const x = file * this.squareSize + this.borderWidth;
        const y = rank * this.squareSize + this.borderWidth + this.margin;

        drawRectangle(
          this.ctx,
          this.squareSize,
          this.squareSize,
          x,
          y,
          style,
          this.loadImage
        );
      }
    }
  }

  toImgUrl() {
    return this.canvas.toDataURL();
  }

  toImageData() {
    return this.ctx.getImageData(0, 0, this.width, this.height);
  }

  toClampedArray() {
    return this.ctx.getImageData(0, 0, this.width, this.height).data;
  }

  toImgElement() {
    const dataUrl = this.toImgUrl();

    const img = new Image();
    img.classList.add("board");
    img.src = dataUrl;
    return img;
  }

  get width() {
    return this.size;
  }

  get height() {
    return this.size + this.margin * 2;
  }

  toGIF() {}
}

export default Board;
