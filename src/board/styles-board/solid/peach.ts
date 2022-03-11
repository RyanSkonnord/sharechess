import { Style } from "../../../types";

const style: Style = {
  name: "Peach",
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
      color: "#E54B4B",
    },
  },
  light: {
    type: "solid",
    data: {
      color: "#EFB293",
    },
  },
  moveIndicator: {
    type: "hueShift",
    data: 30,
  },
  border: {
    type: "solid",
    data: {
      color: "#9E3131",
    },
  },
  coords: {
    onLight: "#e54b4b",
    onDark: "#EFB293",
    onBorder: "#EFB293",
  },
};

export default style;
