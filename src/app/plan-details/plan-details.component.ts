import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { PlanBuilderService } from '../services/plan-builder.service';
import { User } from '../data/user';
import { Meal } from '../data/meal';
import { PlanDetails } from '../data/plan';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-plan-details',
  templateUrl: './plan-details.component.html',
  styleUrls: ['./plan-details.component.scss']
})
export class PlanDetailsComponent implements OnInit, OnDestroy {
  user: User;
  userSubscription: Subscription;
  mealPlanSubscription: Subscription;
  mealPlan: Meal[];

  readonly dayTypes: string[] = [
    'rest', 'light', 'moderate', 'hard'//, 'veryhard'//, 'custom'
  ];

  constructor(private userService: UserService, private planBuilder: PlanBuilderService) {
    this.userSubscription = this.userService.user$.subscribe(u => this.user = u);
    this.mealPlanSubscription = this.planBuilder.mealPlan$.subscribe(mp => this.mealPlan = mp);
  }

  ngOnInit(): void {
    this.userService.getUser();
    this.planBuilder.getGeneratedPlan(this.user);

    this.populateMealPlanIfEmpty();
    // this.mealPlan = this.planBuilder.getGeneratedPlan(this.user, "rest");
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.mealPlanSubscription.unsubscribe();
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
        this.user.plan.details[this.dayTypes[i]] = details;
      }
    }

    this.userService.saveUser(this.user);
  }

}
