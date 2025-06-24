import 'reflect-metadata';
import { injectable, inject, singleton, scoped, Lifecycle } from 'tsyringe';

export { injectable, inject, singleton, scoped };

export function Service(token?: symbol | string) {
  return function (target: any) {
    injectable()(target);
    if (token) {
      Reflect.defineMetadata('custom:service:token', token, target);
    }
    return target;
  };
}

export function Inject(token: any) {
  return inject(token);
}

export function AutoMock() {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('custom:mock:auto', true, target, propertyKey);
  };
}

export function MockImplementation(implementation: any) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('custom:mock:implementation', implementation, target, propertyKey);
  };
}