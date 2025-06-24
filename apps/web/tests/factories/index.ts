export * from "./base.factory";
export * from "./user.factory";
export * from "./feature.factory";

import { userFactory } from "./user.factory";
import { featureFactory } from "./feature.factory";

export const factories = {
  user: userFactory,
  feature: featureFactory,
} as const;
