import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { UserService } from "src/app/_services/user.service";
import { topcard, topcards } from "src/app/dashboard/dashboard-components/top-cards/top-cards-data";
import * as UserSelectors from "../../_store/selectors/users.selectors";
import * as TeamSelectors from "../../_store/selectors/teams.selectors";
import { NotifierService } from "angular-notifier";
import { blogcard } from "src/app/dashboard/dashboard-components/blog-cards/blog-cards-data";
import { DashboardService } from "src/app/_services/dashbaord.service";

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"]
})
export class AdminDashboardComponent implements OnInit {
  private notifier: NotifierService;
  public dashbordContents: any = {};
  blogcards: blogcard[] = [];
  topcards: topcard[];
  users: any = [];
  teams: any = [];
  constructor(private store: Store, private dashboardService: DashboardService, notifier: NotifierService) {
    notifier = notifier;
    this.topcards = topcards;
  }

  ngOnInit(): void {
    // select to get user from store
    this.store.select(UserSelectors.getUsers).subscribe((users) => {
      this.users = users;
    });

    this.store.select(TeamSelectors.getTeams).subscribe((teams) => {
      this.teams = teams;
    });
  }
  getDashboardContents() {
    this.dashboardService.getDashboardContents().subscribe((res: any) => {
      if (res) {
        this.notifier.notify("success", res.message);
        this.dashbordContents = res.data;
        this.mapDashboardContents();
      }
    });
  }
  mapDashboardContents() {
    if (Object.keys(this.dashbordContents).length > 0) {
      Object.keys(this.dashbordContents).forEach((key) => {
        this.blogcards.push({
          title: key,
          count: this.dashbordContents[key].length.toString(),
          image: `${key}.svg`,
          bgcolor: "success",
          icon: "bi bi-wallet"
        });
      });
    }
  }
}
