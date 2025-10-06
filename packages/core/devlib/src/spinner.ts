import { Spinner } from "@topcli/spinner";

export type SpinnerFactory = {
  text: (text: string) => void;
  append: (text: string) => void;
  succeed: (text?: string) => void;
  failed: (text?: string) => void;
};

export const spinnerFactory = (startText: string): SpinnerFactory => {
  const spinner = new Spinner().start(startText);
  let _text = startText;
  return {
    text(text) {
      _text = text;
      spinner.text = text;
    },
    append(text) {
      spinner.text = `${_text} › ${text}`;
    },
    succeed(text) {
      if (text) {
        this.append(text);
      } else {
        this.text(_text);
      }
      spinner.succeed();
    },
    failed(text) {
      if (text) {
        this.text([_text, text].join("\n"));
      }
      spinner.failed();
    },
  };
};

export const withSpinner = (
  text: string,
  pipe: (spinner: SpinnerFactory) => void | Promise<void>,
  spinner?: SpinnerFactory,
) => pipe(spinner || spinnerFactory(text));
