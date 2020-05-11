import { Injectable } from '@angular/core';
import { User } from '../data/user';
import { Meal } from '../data/meal';
import { PlanDetails } from '../data/plan';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanBuilderService {

  readonly carbsRest = 0.5;
  readonly carbsLight = 1;
  readonly carbsMod = 1.5;
  readonly carbsHard = 2;

  private bmr = 0;
  private bmr_lifestyle = 0;

  private proteinGrams: number;
  private carbsGrams: number;
  private fatGrams: number;
  private minCarbsModifier: number;

  private mealPlanSource = new Subject<Meal[]>();
  mealPlan$ = this.mealPlanSource.asObservable();

  private mealPlan: Meal[];
  dayType: string;

  constructor() { }

  // Formulas for estimating BMR with or withouth body-fat can be found at:
  // https://en.wikipedia.org/wiki/Basal_metabolic_rate#BMR_estimation_formulas
  private calculateBmr(user: User) {
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

  private calculateBmrLifestyle(user: User) {
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

  private generateMacros(user: User, selectedDayType: string) {
    const weightInPounds = this.toPounds(user.weight);
    const minimumFat = 0.3 * weightInPounds;
    this.proteinGrams = weightInPounds;

    let calorieModifier = 1;
    let recomendedCarbsModifier = 1;
    this.minCarbsModifier = 1;
    switch (selectedDayType) {
      case 'rest':
        calorieModifier = 1.0;
        recomendedCarbsModifier = 0.5;
        this.minCarbsModifier = 0.3;
        break;

      case 'light':
        calorieModifier = 1.2;
        recomendedCarbsModifier = 1;
        this.minCarbsModifier = 0.5;
        break;

      case 'moderate':
        calorieModifier = 1.35;
        recomendedCarbsModifier = 1.5;
        this.minCarbsModifier = 1.0;
        break;

      case 'hard':
        calorieModifier = 1.45;
        recomendedCarbsModifier = 2;
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

    let startingCalories = (this.bmr_lifestyle * calorieModifier) + dietPhaseCalorieAdjustment;

    let availableCalories = startingCalories - (4 * this.proteinGrams) - (9 * minimumFat);
    let maxCarbsModifier = (availableCalories / 4 / weightInPounds);

    let carbsModifier: number;

    switch (user.macroPreferences) {
      case 1:
        carbsModifier = this.minCarbsModifier;
        break;
      case 2:
        carbsModifier = this.minCarbsModifier + ((recomendedCarbsModifier - this.minCarbsModifier) / 2);
        break;
      case 3:
        carbsModifier = recomendedCarbsModifier;
        break;
      case 4:
        carbsModifier = recomendedCarbsModifier + ((maxCarbsModifier - recomendedCarbsModifier) / 3);
        break;
      case 5:
        carbsModifier = recomendedCarbsModifier + 2 * ((maxCarbsModifier - recomendedCarbsModifier) / 3);
        break;
    }

    // if (this.customDetails != null && this.customDetails.userCarbsModifier > 0) {
    //   if (this.customDetails.userCarbsModifier >= this.minCarbsModifier) {
    //     carbsModifier = this.customDetails.userCarbsModifier;
    //   } else {
    //     carbsModifier = recomendedCarbsModifier;
    //   }
    // } else {
    //   if (this.userCarbsModifier >= this.minCarbsModifier) {
    //     carbsModifier = this.userCarbsModifier;
    //   } else {
    //     carbsModifier = recomendedCarbsModifier;
    //   }
    // }

    this.carbsGrams = Math.min(carbsModifier * weightInPounds, availableCalories / 4);

    availableCalories -= this.carbsGrams * 4;

    this.fatGrams = minimumFat + (availableCalories / 9);
  }

  private generateMealPlan(user: User, selectedDayType: string) {

    let useShake = false;
    let workoutAfterMeal = 1;
    if (user.plan.details[selectedDayType] != undefined) {
      workoutAfterMeal = user.plan.details[selectedDayType].workoutAfterMeal ?? 1;
      useShake = user.plan.details[selectedDayType].useWorkoutShake ?? false;
    }

    let numberOfMeals = user.numberOfMeals ?? 5; 

    this.mealPlan = new Array();
    for (let i = 0; i < numberOfMeals; i++) {
      const meal = new Meal();

      meal.name = `${i + 1}`;

      if (selectedDayType == "rest") {
        meal.carbs = Math.round(this.carbsGrams / numberOfMeals);
        meal.fat = Math.round(this.fatGrams / numberOfMeals);
      }
      else {
        meal.carbs = -1;
        meal.fat = -1;
      }
      meal.protein = Math.round(this.proteinGrams / numberOfMeals);
      meal.setCalories();
      this.mealPlan.push(meal);
    }

    if (selectedDayType != "rest") {
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
        this.mealPlan[i].setCalories();
        
      }

      if (useShake && selectedDayType != 'rest') {
        const shakeCarbs = this.mealPlan[workoutAfterMeal - 1].carbs / 2;
        const shakeProtein = this.mealPlan[workoutAfterMeal - 1].protein / 2;
        this.mealPlan[workoutAfterMeal - 1].carbs = shakeCarbs;
        this.mealPlan[workoutAfterMeal - 1].protein = shakeProtein;
        this.mealPlan[workoutAfterMeal - 1].setCalories()

        const shake = new Meal();
        shake.name = "Shake";
        shake.carbs = shakeCarbs;
        shake.protein = shakeProtein;
        shake.fat = 0;
        shake.setCalories();

        this.mealPlan.splice(workoutAfterMeal, 0, shake);
      }
    }
  }


  getGeneratedPlan(user: User, selectedDayType: string = null) {
    if (selectedDayType) {
      this.dayType = selectedDayType;
    } else {
      if (!this.dayType)
        this.dayType = "rest";
    }
    console.log("generating " + this.dayType);
    this.calculateBmr(user);
    this.generateMacros(user, this.dayType);
    this.generateMealPlan(user, this.dayType);

    this.mealPlanSource.next(this.mealPlan);
    // let details = new PlanDetails();
    // // details. = this.mealPlan;
    // user.plan.details[selectedDayType] = details;

    return this.mealPlan;
  }

  toPounds(kg: number): number {
    return kg * 2.20462;
  }
}
