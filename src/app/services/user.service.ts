import { Injectable } from '@angular/core';
import { User } from '../data/user';
import { Plan, PlanDetails } from '../data/plan';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private key_user = "user";

  private userSource = new Subject<User>();
  user$ = this.userSource.asObservable();

  constructor() { }

  saveUser(user: User) {
    localStorage.setItem(this.key_user, JSON.stringify(user));
    this.userSource.next(user);
  }

  getUser() {
    let userJson = localStorage.getItem(this.key_user);

    let user: User;
    user = JSON.parse(userJson);
    user = this.setUpUser(user);

    this.userSource.next(user);
  }

  private setUpUser(user: User): User {
    if (user == null) {
      user = new User();

      user.numberOfMeals = 5;
      user.lifestyle = 1;
      user.macroPreferences = 3;
    }

    if (user.plan == null) {
      user.plan = new Plan();

      user.plan.details = {
        rest: new PlanDetails(),
        light: new PlanDetails(),
        moderate: new PlanDetails(),
        hard: new PlanDetails(),
      }
    }
    return user;
  }
}
