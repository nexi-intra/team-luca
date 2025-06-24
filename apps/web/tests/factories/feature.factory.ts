import { BaseFactory } from "./base.factory";
import { Feature, FeatureRing } from "@monorepo/features";
import { faker } from "@faker-js/faker";

export class FeatureFactory extends BaseFactory<Feature> {
  protected getDefaults(): Feature {
    return {
      id: faker.string.alphanumeric(10),
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      ring: faker.helpers.arrayElement([1, 2, 3, 4] as FeatureRing[]),
      category: faker.helpers.arrayElement(["UI", "API", "Analytics", "AI"]),
    };
  }

  experimental(): this {
    return this.state("experimental", {
      ring: 1,
    } as Partial<Feature>);
  }

  preview(): this {
    return this.state("preview", {
      ring: 2,
    } as Partial<Feature>);
  }

  beta(): this {
    return this.state("beta", {
      ring: 3,
    } as Partial<Feature>);
  }

  stable(): this {
    return this.state("stable", {
      ring: 4,
    } as Partial<Feature>);
  }

  ui(): this {
    return this.state("ui", {
      category: "UI",
    } as Partial<Feature>);
  }

  ai(): this {
    return this.state("ai", {
      category: "AI",
    } as Partial<Feature>);
  }
}

export const featureFactory = new FeatureFactory();
