import { Plan } from './plan';

export class User {
    age: number;
    weight: number;
    height: number;
    bodyfat: number;
    gender: string;

    lifestyle: number;
    macroPreferences: number;
    numberOfMeals: number;

    plan: Plan;
}

export enum DayType {
    Rest,
    Light, 
    Moderate,
    Hard,
}