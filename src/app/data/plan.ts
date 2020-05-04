export class Plan {
    details: PlanDetails[];
}

export class PlanDetails {
    dayType: string;
    // numberOfMeals: number;
    workoutAfterMeal: number;
    useWorkoutShake: boolean;
}