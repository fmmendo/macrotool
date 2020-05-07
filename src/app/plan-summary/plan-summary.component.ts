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

  readonly dayTypes: string[] = [
    'rest', 'light', 'moderate', 'hard'//, 'veryhard'//, 'custom'
  ];

  constructor(private userService: UserService, private planBuilder: PlanBuilderService) {
    this.userSubscription = this.userService.user$.subscribe(u => this.user = u);
    this.mealPlanSubscription = this.planBuilder.mealPlan$.subscribe(mp => {
      this.mealPlan = mp;
      this.updateTotals();
    });
  }

  ngOnInit(): void {
    this.userService.getUser();

    this.populateMealPlanIfEmpty();
    // 
    // this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "rest");
    this.planBuilder.getGeneratedPlan(this.user, "rest");

    this.updateTotals();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.mealPlanSubscription.unsubscribe();
  }

  private populateMealPlanIfEmpty() {
    console.log("summary populate")
    // if (this.user.plan.details == undefined || this.user.plan.details.size == undefined) {
    //   this.user.plan.details = new Record();
    // }
    for (let i = 0; i < this.dayTypes.length; i++) {
      if (!this.user.plan.details[this.dayTypes[i]] != null) {
        let details = new PlanDetails();
        // details.dayType = this.dayTypes[i];
        // details.mealPlan = new Array<Meal>();
        this.user.plan.details[this.dayTypes[i]] = details;
      }
    }

    this.userService.saveUser(this.user);
    console.log("summary done " + JSON.stringify(this.user.plan))

  }

  onTextChanged() {
    switch (this.dayTypeId) {
      case 1:
        this.planBuilder.getGeneratedPlan(this.user, "rest");
        break;
      case 2:
        this.planBuilder.getGeneratedPlan(this.user, "light");
        break;
      case 3:
        this.planBuilder.getGeneratedPlan(this.user, "moderate");
        break;
      case 4:
        this.planBuilder.getGeneratedPlan(this.user, "hard");
        break;
    }

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
