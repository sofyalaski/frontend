import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { AppConfigService } from "app-config.service";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormArray,
  Validators,
} from "@angular/forms";
import { Store } from "@ngrx/store";
import { Dataset } from "shared/sdk/models";
import {
  selectCurrentDataset,
} from "state-management/selectors/datasets.selectors";
import {
  selectCurrentUser
} from "state-management/selectors/user.selectors";
import { User } from "shared/sdk";
import { MethodsList, DepositionFiles, EmFile } from "./types/methods.enum"
import { Subscription, fromEvent } from "rxjs";


@Component({
  selector: 'onedep',
  templateUrl: './onedep.component.html',
  styleUrls: ['./onedep.component.scss']
})
export class OneDepComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private _hasUnsavedChanges = false;

  appConfig = this.appConfigService.getConfig();
  dataset: Dataset | undefined;
  user: User | undefined;
  form: FormGroup;
  showAssociatedMapQuestion: boolean = false;
  methodsList = MethodsList;

  selectedFile: { [key: string]: File | null } = {};
  formSubmitted = false;
  emFile = EmFile;
  obligatoryFiles = {}; 
  detailsOverflow: string = 'hidden';
  fileTypes: { [f in EmFile]?: DepositionFiles };

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;

  constructor(public appConfigService: AppConfigService,
    private store: Store,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) { }


  ngOnInit() {
    this.store.select(selectCurrentDataset).subscribe((dataset) => {
      this.dataset = dataset;
    });
    this.subscriptions.push(
      this.store.select(selectCurrentUser).subscribe((user) => {
        if (user) {
          this.user = user;
        }
      }),
    );
    // Prevent user from reloading page if there are unsave changes
    this.subscriptions.push(
      fromEvent(window, "beforeunload").subscribe((event) => {
        if (this.hasUnsavedChanges()) {
          event.preventDefault();
        }
      }),
    );
    this.form = this.fb.group({
      email: this.user.email,
      jwtToken: new FormControl(""),
      metadata: this.dataset.scientificMetadata,
      experiments: this.fb.array([]),
      emMethod: new FormControl(""),
      deposingCoordinates: new FormControl(null, Validators.required),
      associatedMap: new FormControl(null, Validators.required),
      compositeMap: new FormControl(null, Validators.required),
      emdbId: new FormControl(""),
      orcid: this.fb.array([]),
    })
  }

  get orcidArray(): FormArray {
    return this.form.get('orcid') as FormArray;
  }

  hasUnsavedChanges() {
    return this._hasUnsavedChanges;
  }
  onHasUnsavedChanges($event: boolean) {
    this._hasUnsavedChanges = $event;
  }
  addOrcidField(): void {
    const orcidField = this.fb.group({
      orcidId: ['', [Validators.required, Validators.pattern(/^(\d{4}-){3}\d{4}$/)]],
    });
    this.orcidArray.push(orcidField);
  }
  removeOrcidField(index: number): void {
    this.orcidArray.removeAt(index);
  }

  onMethodChange(): void {
    this.fileTypes = this.methodsList.find(mL => mL.value=== this.form.value['emMethod']).files;
    this.fileTypes[this.emFile.MainMap].required = true;
    this.fileTypes[this.emFile.Image].required = true;
    switch (this.form.value['emMethod']){
      case 'helical':
      this.fileTypes[this.emFile.HalfMap1].required = true;
      this.fileTypes[this.emFile.HalfMap2].required = true;
        break;
      case "single-particle":
        this.fileTypes[this.emFile.HalfMap1].required = true;
        this.fileTypes[this.emFile.HalfMap2].required = true;
        this.fileTypes[this.emFile.MaskMap].required = true;
        break;
    }
    const sortedDepositionSet = Object.entries(this.fileTypes)
        .sort(([keyA, valueA], [keyB, valueB]) => {
            if (valueA.required && !valueB.required) return -1; // valueA comes first
            if (!valueA.required && valueB.required) return 1;  // valueB comes first
            return 0; 
        })
        .reduce((sortedObj, [key, value]) => {
            sortedObj[key as EmFile] = value;
            return sortedObj;
        }, {} as { [f in EmFile]: DepositionFiles });

    this.fileTypes = sortedDepositionSet;

  }
  onPDB(event: any): void {
    const input = event.value;  
    if (input === 'true') {
      this.fileTypes[this.emFile.Coordinates].required = true;
    } 
  }

  autoGrow(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
    const maxLines = 5;

    // Reset height to auto to calculate scrollHeight
    textarea.style.height = 'auto';

    // Set the height based on the scrollHeight but limit it
    const newHeight = Math.min(textarea.scrollHeight, lineHeight * maxLines);
    textarea.style.height = `${newHeight}px`;

    // Update overflow property based on height
    this.detailsOverflow = textarea.scrollHeight > newHeight ? 'auto' : 'hidden';
  }

  get fileTypesEntries() {
    return Object.entries(this.fileTypes || {}).map(([key, value]) => ({ key, value }));
  }

  onChooseFile(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
  onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile[controlName] = input.files[0];
      this.fileTypes[controlName].file = this.selectedFile[controlName];
      this.fileTypes[controlName].fileName = this.selectedFile[controlName].name;
    }
  }
  updateContourLevelMain(event: Event) {
    const input = (event.target as HTMLInputElement).value.trim();
    const normalizedInput = input.replace(',', '.');
    const parsedValue = parseFloat(normalizedInput);
    if (!isNaN(parsedValue)) {
      [EmFile.MainMap, EmFile.HalfMap1, EmFile.HalfMap2].forEach((key) => {
        if (this.fileTypes[key]) {
          this.fileTypes[key].contour = parsedValue;
        }
      });
    } else {
      console.warn('Invalid number format:', input);
    }
  }
  updateContourLevel(event: Event, controlName: string) {
    const input = (event.target as HTMLInputElement).value.trim();
    const normalizedInput = input.replace(',', '.');
    const parsedValue = parseFloat(normalizedInput);
    if (!isNaN(parsedValue)) {
      this.fileTypes[controlName].contour = parsedValue;
    } else {
      console.warn('Invalid number format:', input);
    }
  }
  updateDetails(event: Event, controlName: string) {
    const textarea = event.target as HTMLTextAreaElement; // Cast to HTMLTextAreaElement
    const value = textarea.value;
    if (this.fileTypes[controlName]) {
      this.fileTypes[controlName].details = value;
    }
  }
 
  isFormValid(): boolean {
    // Ensure all required files in EmFiles have been selected
    return Object.keys(this.fileTypes).every((fileKey) => {
        const file = this.fileTypes[fileKey as EmFile];
        return !file.required || !!this.fileTypes[file.type]?.file;  // If required, ensure it's selected
    });
}
  isRequired(key: string): boolean {
    return this.fileTypes[key].required;
  }
  onDepositClick() {
    const formDataToSend = new FormData();
    formDataToSend.append('email', this.form.value.email);
    formDataToSend.append('orcidIds', this.form.value.orcidArray);
    formDataToSend.append('metadata', JSON.stringify(this.form.value.metadata));
    formDataToSend.append('experiments', this.form.value.emMethod);
    // emdbId: this.form.value.emdbId, 
    var fileMetadata = []

    for (const key in this.fileTypes) {
      if (this.fileTypes[key].file) {
        formDataToSend.append('file', this.fileTypes[key].file);
        fileMetadata.push({ name: this.fileTypes[key].name, type: this.fileTypes[key].type, contour: this.fileTypes[key].contour, details: this.fileTypes[key].details });
      }
    }
    formDataToSend.append('fileMetadata', JSON.stringify(fileMetadata));
    this.http.post("http://localhost:8080/onedep", formDataToSend, {
      headers: {}
    }).subscribe(
      response => {
        console.log('Created deposition in OneDep', response);
      },
      error => {
        console.error('Request failed', error.error);
      }
    );

  }
}
