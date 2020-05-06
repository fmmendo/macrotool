import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { PlanBuilderService } from '../services/plan-builder.service';
import { User } from '../data/user';
import { Meal } from '../data/meal';
import { PlanDetails } from '../data/plan';

@Component({
  selector: 'app-plan-details',
  templateUrl: './plan-details.component.html',
  styleUrls: ['./plan-details.component.scss']
})
export class PlanDetailsComponent implements OnInit {
  user: User;
  mealPlan: Meal[];

  readonly dayTypes: string[] = [
    'rest', 'light', 'moderate', 'hard'//, 'veryhard'//, 'custom'
  ];

  constructor(private userService: UserService, private planBuilder: PlanBuilderService) { }

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.populateMealPlanIfEmpty();
    this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "rest");

  }

  private populateMealPlanIfEmpty() {
    // if (this.user.plan.details == undefined || this.user.plan.details.size == undefined) {
    //   this.user.plan.details =  Record<string, PlanDetails>;
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
  }

}
