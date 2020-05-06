import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { PlanBuilderService } from '../services/plan-builder.service';
import { User } from '../data/user';
import { Meal } from '../data/meal';
import { PlanDetails } from '../data/plan';

@Component({
  selector: 'app-plan-summary',
  templateUrl: './plan-summary.component.html',
  styleUrls: ['./plan-summary.component.scss']
})
export class PlanSummaryComponent implements OnInit {
  user: User;
  mealPlan: Meal[];
  dayTypeId: number;

  readonly dayTypes: string[] = [
    'rest', 'light', 'moderate', 'hard'//, 'veryhard'//, 'custom'
  ];

  constructor(private userService: UserService, private planBuilder: PlanBuilderService) { }

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.populateMealPlanIfEmpty();
    // 
    // this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "rest");
    this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "rest");
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
        this.user.plan.details[this.dayTypes[i]]= details;
      }
    }

    this.userService.saveUser(this.user);
    console.log("summary done " +  JSON.stringify(this.user.plan))

  }


  onTextChanged() {
    switch (this.dayTypeId) {
      case 1:
        this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "rest");
        break;
      case 2:
        this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "light");
        break;
      case 3:
        this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "moderate");
        break;
      case 4:
        this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "hard");
        break;
    }
  }
}
