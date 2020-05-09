import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../data/user';
import { PlanBuilderService } from '../services/plan-builder.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  user: User;
  subscription: Subscription;

  constructor(private userService: UserService, private planBuilder: PlanBuilderService) {
    this.subscription = this.userService.user$.subscribe(u => this.user = u);
  }

  ngOnInit(): void {
    this.userService.getUser();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onTextChanged() {
    this.saveDetails()
  }

  saveDetails() {
    this.userService.saveUser(this.user);
    this.planBuilder.getGeneratedPlan(this.user);
  }

}
