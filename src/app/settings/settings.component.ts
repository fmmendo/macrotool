import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../data/user';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: User;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.user = this.userService.getUser();
  }

  onTextChanged() {
    this.saveDetails()
  }

  saveDetails() {
    this.userService.saveUser(this.user);
  }

}
