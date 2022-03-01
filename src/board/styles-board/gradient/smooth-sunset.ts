import { Style } from "../../../types";

const style: Style = {
  name: "Smooth Sunset",
  category: "gradient",
  background: {
    type: "gradient",
    data: {
      dir: "diagonal-top",
      colors: ["#F5B061", "#EC366D"],
    },
  },
  dark: {
    type: "solid",
    data: {
      color: "transparent",
    },
  },
  light: {
    type: "solid",
    data: {
      color: "#ffffff7f",
    },
  },
  moveIndicator: {
    type: "color",
    data: "#00ffee55",
  },
  border: {
    type: "gradient",
    data: {
      dir: "diagonal-top",
      colors: ["#DC7D47", "#C32C73"],
    },
  },
  coords: {
    onLight: "#CF545D",
    onDark: "#fff",
    onBorder: "#fff",
  },
};

export default style;
