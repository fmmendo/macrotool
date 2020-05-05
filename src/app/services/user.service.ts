import { Injectable } from '@angular/core';
import { User } from '../data/user';
import { Plan } from '../data/plan';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private key_user = "LS-PLAN-USER";

  constructor() { }

  saveUser(user: User) {
    localStorage.setItem(this.key_user, JSON.stringify(user));
  }

  getUser() {
    let userJson = localStorage.getItem(this.key_user);

    let user: User;
    user = JSON.parse(userJson);
    user = this.setUpUser(user);
    return user;
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
    }
    return user;
  }
}
