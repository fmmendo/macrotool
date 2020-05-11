import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { PlanBuilderService } from '../services/plan-builder.service';
import { User } from '../data/user';
import { Meal } from '../data/meal';
import { PlanDetails } from '../data/plan';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-plan-summary',
  templateUrl: './plan-summary.component.html',
  styleUrls: ['./plan-summary.component.scss']
})
export class PlanSummaryComponent implements OnInit, OnDestroy {

  user: User;
  userSubscription: Subscription;
  mealPlanSubscription: Subscription;
  mealPlan: Meal[];
  dayTypeId: number;

  totalCalories: number;
  totalCarbs: number;
  totalFat: number;
  totalProtein: number;

  percentCarbs: number;
  percentProtein: number;
  percentFat: number;

  workoutAfterMeal: number;
  workoutShake: boolean;
  mealNumbers: number[];

  readonly dayTypes: string[] = [
    'rest', 'light', 'moderate', 'hard'//, 'veryhard'//, 'custom'
  ];

  constructor(private userService: UserService, private planBuilder: PlanBuilderService) {
    this.userSubscription = this.userService.user$.subscribe(u => this.user = u);
    this.mealPlanSubscription = this.planBuilder.mealPlan$.subscribe(mp => {
      this.mealPlan = mp;
      this.updateTotals();
      this.mealNumbers = [...Array(this.user.numberOfMeals - 1).keys()]
    });
  }

  ngOnInit(): void {
    this.userService.getUser();
    // 
    // this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "rest");
    this.planBuilder.getGeneratedPlan(this.user, this.dayTypes[0]);


    this.populateMealPlanIfEmpty();
    this.updateTotals();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.mealPlanSubscription.unsubscribe();
  }

  private populateMealPlanIfEmpty() {
    for (let i = 0; i < this.dayTypes.length; i++) {
      if (!this.user.plan.details[this.dayTypes[i]] != null) {
        this.user.plan.details[this.dayTypes[i]] = new PlanDetails();
      }
    }

    this.userService.saveUser(this.user);

  }

  onTextChanged() {
    this.planBuilder.getGeneratedPlan(this.user, this.dayTypes[this.dayTypeId]);
    this.mealNumbers = [...Array(this.user.numberOfMeals - 1).keys()]

    this.user.plan.details[this.dayTypes[this.dayTypeId]].workoutAfterMeal = this.workoutAfterMeal;
    this.user.plan.details[this.dayTypes[this.dayTypeId]].useWorkoutShake = this.workoutShake;
    this.userService.saveUser(this.user);
    this.updateTotals();
  }

  updateTotals() {
    this.totalCalories = this.mealPlan.reduce(function (total, meal) { return total + meal.calories }, 0);
    this.totalCarbs = this.mealPlan.reduce(function (total, meal) { return total + meal.carbs }, 0);
    this.totalFat = this.mealPlan.reduce(function (total, meal) { return total + meal.fat }, 0);
    this.totalProtein = this.mealPlan.reduce(function (total, meal) { return total + meal.protein }, 0);

    this.percentCarbs = 100 * this.totalCarbs * 4 / this.totalCalories;
    this.percentFat = 100 * this.totalFat * 9 / this.totalCalories;
    this.percentProtein = 100 * this.totalProtein * 4 / this.totalCalories;
  }
}
