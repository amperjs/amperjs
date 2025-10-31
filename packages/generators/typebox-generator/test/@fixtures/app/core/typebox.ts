import Type from "typebox";
import { Settings } from "typebox/system";

Settings.Set({ exactOptionalPropertyTypes: true });

export class TDate extends Type.Base<Date> {
  public override Check(value: unknown): value is Date {
    return value instanceof globalThis.Date;
  }
  public override Errors(value: unknown): object[] {
    return this.Check(value) ? [] : [{ message: "must be Date" }];
  }
  public override Create(): Date {
    return new globalThis.Date(0);
  }
}

export default {
  Date: new TDate(),
};
