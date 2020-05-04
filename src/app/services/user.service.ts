import { Injectable } from '@angular/core';
import { User } from '../data/user';

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

    return user;
  }

  private setUpUser(user: User) {
    if (user == null) {
      user = new User();
    }
    
    return user;
  }
}
