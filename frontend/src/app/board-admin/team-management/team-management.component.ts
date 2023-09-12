import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { NotifierService } from "angular-notifier";
import { AcademyService } from "src/app/_services/academy.service";
import { StorageService } from "src/app/_services/storage.service";
import * as AcademyActions from "../../_store/actions/academies.actions";
// importing selectors
import * as AcademySelectors from "../../_store/selectors/academies.selectors";
import { Store } from "@ngrx/store";
import { Router } from "@angular/router";
import { UserService } from "src/app/_services/user.service";
import { ConfirmationDialogService } from "src/app/_services/confirmation-dialog.service";

@Component({
  selector: "app-team-management",
  templateUrl: "./team-management.component.html",
  styleUrls: ["./team-management.component.scss"]
})
export class TeamManagementComponent implements OnInit {
  private notifier: NotifierService;
  public academies: any = [];
  public academyToDel: any = [];
  academyForm = new FormGroup({
    academyName: new FormControl("")
  });

  constructor(
    private storageService: StorageService,
    private confirmationDialogService: ConfirmationDialogService,
    notifier: NotifierService,
    private academyService: AcademyService,
    private store: Store,
    private router: Router,
    private userService: UserService
  ) {
    this.notifier = notifier;
  }

  ngOnInit(): void {
    this.getAcademiesFromStore();
  }

  getAcademiesFromStore() {
    this.store.select(AcademySelectors.getAcademies).subscribe((academy) => {
      this.academies = academy;
    });
  }

  onSubmit() {
    if (!this.academyForm.value.academyName) {
      this.notifier.notify("error", "Academy name not provided!");
      return;
    } else {
      const user = this.storageService.getUser();
      if (this.academyForm.value.academyName) {
        const academyData = {
          "Academy Name": this.academyForm.value.academyName,
          "Academy User Name": this.makeAcademyUserName(this.academyForm.value.academyName),
          Email: `${this.makeAcademyUserName(this.academyForm.value.academyName)}@dummy.com`,
          Password: `Password@${this.makeAcademyUserName(this.academyForm.value.academyName)}`,
          user: {
            createdBy: user.id
          }
        };
        const userData = {
          firstname: this.makeAcademyUserName(this.academyForm.value.academyName),
          lastname: this.makeAcademyUserName(this.academyForm.value.academyName),
          username: this.makeAcademyUserName(this.academyForm.value.academyName),
          email: `${this.makeAcademyUserName(this.academyForm.value.academyName)}@dummy.com`,
          password: `Password@${this.makeAcademyUserName(this.academyForm.value.academyName)}`,
          role: "coach"
        };
        // check if academy exists
        this.academyService.getAcademyByName({ name: this.academyForm.value.academyName }).subscribe((res: any) => {
          if (!res.message) {
            this.notifier.notify("error", "Academy Name already exists!");
            return;
          } else {
            this.userService.createUser(userData).subscribe((user: any) => {
              if (user) {
                // add owner for new academy.
                academyData.user = {
                  createdBy: user._id
                };
                this.academyService.createAcademy(academyData).subscribe((res: any) => {
                  if (res._id) {
                    this.notifier.notify("success", "Academy created successfully!");
                    this.academyForm.reset();
                    this.store.dispatch(AcademyActions.loadAcademies());
                  }
                });
              }
            });
          }
        });
      }
    }
  }

  makeAcademyUserName(academyName: any) {
    if (academyName) {
      return academyName.replace(/\s/g, "").toLowerCase();
    }
  }

  academyDetails(id: string) {
    this.router.navigate([`/academies/academy/${id}`]);
  }
  redirectTo() {
    this.router.navigate(["/admin/academies/academy"]);
  }

  onDelete(academy: any) {
    this.academyToDel = academy;
    this.openConfirmationDialog();
  }

  public openConfirmationDialog() {
    this.confirmationDialogService
      .confirm("Teams Under Academy will be deleted also", "Do you really want to ... ?")
      .then((value) => this.deleteSelection(value))
      .catch(() => console.log("User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)"));
  }

  deleteSelection(value: any) {
    if (value) {
      this.academyService.deleteAcademy(this.academyToDel).subscribe((result: any) => {
        if (result.message) {
          this.notifier.notify("success", result.message);
          this.store.dispatch(AcademyActions.loadAcademies());
          this.getAcademiesFromStore();
        }
      });
    }
  }
}
