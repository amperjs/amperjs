import DefaultTheme from "vitepress/theme";
import "virtual:group-icons.css";

import CodeSamples from "./components/CodeSamples.vue";
import LinkButton from "./components/LinkButton.vue";
import "./index.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("LinkButton", LinkButton);
    app.component("CodeSamples", CodeSamples);
  },
};
