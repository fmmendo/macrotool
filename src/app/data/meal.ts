export class Meal {
    name: string;
    tag: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  
    setCalories(): number {
        this.calories =  (this.protein * 4) + (this.carbs) * 4 + (this.fat * 9);
        return this.calories;
    }
}