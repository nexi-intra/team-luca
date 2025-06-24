import { BaseFactory } from "./base.factory";
import { faker } from "@faker-js/faker";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
  featureRing: 1 | 2 | 3 | 4;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  bio: string;
  avatar: string;
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

export class UserFactory extends BaseFactory<User> {
  protected getDefaults(): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: "user",
      featureRing: 4,
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }

  withProfile(): this {
    return this.state("withProfile", {
      profile: {
        bio: faker.person.bio(),
        avatar: faker.image.avatar(),
        preferences: {
          theme: faker.helpers.arrayElement(["light", "dark"] as const),
          notifications: faker.datatype.boolean(),
        },
      },
    } as Partial<User>);
  }

  admin(): this {
    return this.state("admin", {
      role: "admin",
      featureRing: 1,
    } as Partial<User>);
  }

  experimental(): this {
    return this.state("experimental", {
      featureRing: 1,
    } as Partial<User>);
  }

  inactive(): this {
    return this.state("inactive", {
      isActive: false,
    } as Partial<User>);
  }
}

export const userFactory = new UserFactory();
