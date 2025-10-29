import DefaultTheme from "vitepress/theme";
import "virtual:group-icons.css";

import LinkButton from "./components/LinkButton.vue";
import "./index.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("LinkButton", LinkButton);
  },
};
