import { Style } from "../../../types";

const style: Style = {
  name: "Mono Blue",
  category: "solid",
  background: {
    type: "solid",
    data: {
      color: "transparent",
    },
  },
  dark: {
    type: "solid",
    data: {
      color: "#C95D3B",
    },
  },
  light: {
    type: "solid",
    data: {
      color: "#D98D75",
    },
  },
  moveIndicator: {
    type: "hueShift",
    data: 30,
  },
  border: {
    type: "solid",
    data: {
      color: "#C95D3B",
    },
  },
  coords: {
    onLight: "#00000088",
    onDark: "#ffffffcc",
    onBorder: "#ffffffcc",
  },
};

export default style;
