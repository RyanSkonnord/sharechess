import { Style } from "../../../types";

const style: Style = {
  name: "Clay",
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
      color: "#BF5344",
    },
  },
  light: {
    type: "solid",
    data: {
      color: "#D9B08F",
    },
  },
  moveIndicator: {
    type: "color",
    data: "#ffff0055",
  },
  border: {
    type: "solid",
    data: {
      color: "#793329",
    },
  },
  coords: {
    onLight: "#793329",
    onDark: "#F4C8A3",
    onBorder: "#F4C8A3",
  },
};

export default style;
