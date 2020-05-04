import { Injectable } from '@angular/core';
import { User } from '../data/user';
import { Meal } from '../data/meal';

@Injectable({
  providedIn: 'root'
})
export class PlanBuilderService {

  readonly carbsRest = 0.5;
  readonly carbsLight = 1;
  readonly carbsMod = 1.5;
  readonly carbsHard = 2;

  bmr = 0;
  bmr_lifestyle = 0;
  
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  minCarbsModifier: number;
  totalCalories: number;
  mealPlan: Meal[];

  constructor() { }

  // Formulas for estimating BMR with or withouth body-fat can be found at:
  // https://en.wikipedia.org/wiki/Basal_metabolic_rate#BMR_estimation_formulas
  calculateBmr(user: User) {
    if (user.bodyfat > 0) {
      this.bmr = 371 + (21.6 * (user.weight * (1 - user.bodyfat / 100)));
    } else {
      if (user.gender == "male") {
        this.bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + 5;
      }
      else {
        this.bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161;
      }
    }

    this.calculateBmrLifestyle(user);
  }

  calculateBmrLifestyle(user: User) {
    switch (user.lifestyle) {
      case 1: // sedentary
        this.bmr_lifestyle = 1.2 * this.bmr;
        break;
      case 2: // light
        this.bmr_lifestyle = 1.375 * this.bmr;
        break;
      case 3: // active
        this.bmr_lifestyle = 1.55 * this.bmr;
        break;
      case 4: // very active
        this.bmr_lifestyle = 1.725 * this.bmr;
        break;
    }
  }

  generateMacros(user: User, selectedDayType: string) {

    this.customDetailsIndex = user.plan.details.findIndex(item => item.dayType == selectedDayType);
    this.customDetails = user.plan.details.filter(item => item.dayType == selectedDayType)[0];

    const weightInPounds = this.toPounds(user.weight);
    const minimumFat = 0.3 * weightInPounds;
    this.proteinGrams = weightInPounds;

    let calorieModifier = 1;
    let reccomendedCarbsModifier = 1;
    this.minCarbsModifier = 1;
    switch (selectedDayType) {
      case 'rest':
        calorieModifier = 1.0;
        reccomendedCarbsModifier = 0.5;
        this.minCarbsModifier = 0.3;
        break;

      case 'light':
        calorieModifier = 1.2;
        reccomendedCarbsModifier = 1;
        this.minCarbsModifier = 0.5;
        break;

      case 'moderate':
        calorieModifier = 1.35;
        reccomendedCarbsModifier = 1.5;
        this.minCarbsModifier = 1.0;
        break;

      case 'hard':
        calorieModifier = 1.45;
        reccomendedCarbsModifier = 2;
        this.minCarbsModifier = 1.5;
        break;

      // case 'custom':
      //   calorieModifier = (this.bmr_lifestyle + this.customCalorieBurn) / this.bmr_lifestyle;
      //   if (calorieModifier > 1.45) {
      //     reccomendedCarbsModifier = 2;
      //     this.minCarbsModifier = 1.5;
      //   } else if (calorieModifier > 1.35) {
      //     reccomendedCarbsModifier = 1.5;
      //     this.minCarbsModifier = 1.0;
      //   } else if (calorieModifier > 1.2) {
      //     reccomendedCarbsModifier = 1;
      //     this.minCarbsModifier = 0.5;
      //   } else if (calorieModifier > 1.1) {
      //     reccomendedCarbsModifier = 0.5;
      //     this.minCarbsModifier = 0.3;
      //   }
      //   break;
    }

    let dietPhaseCalorieAdjustment = 0;
    // switch (this.selectedPhase) {
    //   case 'base':
    //     break;
    //   case 'cut 1':
    //     dietPhaseCalorieAdjustment = -250;
    //     break;
    //   case 'cut 2':
    //     dietPhaseCalorieAdjustment = -500;
    //     break;
    //   case 'cut 3':
    //     dietPhaseCalorieAdjustment = -750;
    //     break;
    //   case 'bulk 1':
    //     dietPhaseCalorieAdjustment = 250;
    //     break;
    //   case 'bulk 2':
    //     dietPhaseCalorieAdjustment = 500;
    //     break;
    //   case 'bulk 3':
    //     dietPhaseCalorieAdjustment = 750;
    //     break;
    // }

    let carbsModifier: number;

    if (this.customDetails != null && this.customDetails.userCarbsModifier > 0) {
      if (this.customDetails.userCarbsModifier >= this.minCarbsModifier) {
        carbsModifier = this.customDetails.userCarbsModifier;
      } else {
        carbsModifier = reccomendedCarbsModifier;
      }
    } else {
      if (this.userCarbsModifier >= this.minCarbsModifier) {
        carbsModifier = this.userCarbsModifier;
      } else {
        carbsModifier = reccomendedCarbsModifier;
      }
    }
    let startingCalories = (this.bmr_lifestyle * calorieModifier) + dietPhaseCalorieAdjustment;

    let availableCalories = startingCalories - (4 * this.proteinGrams) - (9 * minimumFat);
    this.maxCarbsModifier = (availableCalories / 4 / weightInPounds);
    this.carbsGrams = Math.min(carbsModifier * weightInPounds, availableCalories / 4);

    availableCalories -= this.carbsGrams * 4;

    this.fatGrams = minimumFat + (availableCalories / 9);

    this.totalCalories = this.proteinGrams * 4 + this.carbsGrams * 4 + this.fatGrams * 9;
  }

  generateMealPlan(user: User, selectedDayType: string) {

    this.customDetailsIndex = user.plan.details.findIndex(item => item.dayType == selectedDayType);
    this.customDetails = user.plan.details.filter(item => item.dayType == selectedDayType)[0];

    let numberOfMeals = this.customDetails.numberOfMealsOverride || user.planDetails.numberOfMeals;
    let useShake = this.customDetails.useWorkoutShakeOverride || user.planDetails.useWorkoutShake;
    let workoutAfterMeal = this.customDetails.workoutAfterMealOverride || user.planDetails.workoutAfterMeal;

    this.mealPlan = new Array();
    for (let i = 0; i < numberOfMeals; i++) {
      const meal = new Meal();

      meal.name = `${i + 1}`;
      meal.carbs = -1;
      meal.fat = -1;

      meal.protein = Math.round(this.proteinGrams / numberOfMeals);
      this.mealPlan.push(meal);
    }

    this.mealPlan[workoutAfterMeal - 1].fat = this.fatGrams * .10;
    this.mealPlan[workoutAfterMeal].fat = this.fatGrams * .10;

    if (numberOfMeals === 4) {
      this.mealPlan[workoutAfterMeal - 1].carbs = this.carbsGrams * .25;
      this.mealPlan[workoutAfterMeal].carbs = this.carbsGrams * .35;

      this.mealPlan[numberOfMeals - 1].carbs = this.carbsGrams * .25;

      this.mealPlan[workoutAfterMeal - 1].tag = 'pre-workout';
      this.mealPlan[workoutAfterMeal].tag = 'post-workout';
    } else if (numberOfMeals === 5) {
      this.mealPlan[workoutAfterMeal - 1].carbs = this.carbsGrams * .2;
      this.mealPlan[workoutAfterMeal].carbs = this.carbsGrams * .3;

      this.mealPlan[numberOfMeals - 1].carbs = this.carbsGrams * .2;

      this.mealPlan[workoutAfterMeal - 1].tag = 'pre-workout';
      this.mealPlan[workoutAfterMeal].tag = 'post-workout';
    } else if (numberOfMeals === 6) {
      this.mealPlan[workoutAfterMeal - 1].carbs = this.carbsGrams * .18;
      this.mealPlan[workoutAfterMeal].carbs = this.carbsGrams * .25;

      this.mealPlan[numberOfMeals - 1].carbs = this.carbsGrams * .18;

      this.mealPlan[workoutAfterMeal - 1].tag = 'pre-workout';
      this.mealPlan[workoutAfterMeal].tag = 'post-workout';
    }

    for (let i = 0; i < numberOfMeals; i++) {
      if (this.mealPlan[i].carbs < 0) {
        if (numberOfMeals === 4) {
          this.mealPlan[i].carbs = this.carbsGrams * .15;
        } else if (numberOfMeals === 5) {
          this.mealPlan[i].carbs = this.carbsGrams * (.3 / 2);
        } else if (numberOfMeals === 6) {
          this.mealPlan[i].carbs = this.carbsGrams * (.39 / 3);
        }
      }
    }
    for (let i = 0; i < numberOfMeals; i++) {
      if (this.mealPlan[i].fat < 0) {
        if (numberOfMeals === 4) {
          this.mealPlan[i].fat = this.fatGrams * (.8 / 2);
        } else if (numberOfMeals === 5) {
          this.mealPlan[i].fat = this.fatGrams * (.8 / 3);
        } else if (numberOfMeals === 6) {
          this.mealPlan[i].fat = this.fatGrams * (.8 / 4);
        }
      }
    }

    if (useShake && selectedDayType != 'rest') {
      const shakeCarbs = this.mealPlan[workoutAfterMeal - 1].carbs / 2;
      const shakeProtein = this.mealPlan[workoutAfterMeal - 1].protein / 2;
      this.mealPlan[workoutAfterMeal - 1].carbs = shakeCarbs;
      this.mealPlan[workoutAfterMeal - 1].protein = shakeProtein;

      const shake = new Meal();
      shake.tag = "intra-workout";
      shake.carbs = shakeCarbs;
      shake.protein = shakeProtein;
      shake.fat = 0;

      this.mealPlan.splice(workoutAfterMeal, 0, shake);
    }

    let nom = useShake ? numberOfMeals + 1 : numberOfMeals;

    for (let i = 0; i < nom; i++) {
      this.mealPlan[i].setCalories();
    }
  }


  toPounds(kg: number): number {
    return kg * 2.20462;
  }
}
