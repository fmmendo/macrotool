import { Meal } from './meal';

export class Plan {
    // details: PlanDetails[];
    details: Record<string, PlanDetails>;
}

export class PlanDetails {
    dayType: string;
    // numberOfMeals: number;
    workoutAfterMeal: number;
    useWorkoutShake: boolean;
}