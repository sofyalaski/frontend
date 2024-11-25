import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { AppConfigService, HelpMessages } from "app-config.service";
import { HttpClient } from '@angular/common/http';
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
import { selectCurrentDataset } from "state-management/selectors/datasets.selectors";

import { Subscription } from "rxjs";
import { string } from "mathjs";


@Component({
  selector: 'onedep',
  templateUrl: './onedep.component.html',
  styleUrls: ['./onedep.component.scss']
})
export class OneDepComponent implements OnInit {

  appConfig = this.appConfigService.getConfig();
  dataset: Dataset | undefined;
  form: FormGroup;
  private subscriptions: Subscription[] = [];
  showAssociatedMapQuestion: boolean = false;
  methodsList = MethodsList;
  experiment = Experiment;
  selectedFile: { [key: string]: File | null } = {};
  emFile = EmFile;
  files = EmFiles;
  detailsOverflow: string = 'hidden';


  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;

  fileTypes = [
    { header: 'Main Map', key: this.emFile.MainMap },
    { header: 'Half Map (1)', key: this.emFile.HalfMap1 },
    { header: 'Half Map (2)', key: this.emFile.HalfMap2 },
    { header: 'Mask Map', key: this.emFile.MaskMap },
    { header: 'Additional Map', key: this.emFile.AddMap },
    { header: 'Coordinates', key: this.emFile.Coordinates },
    { header: 'Public Image', key: this.emFile.Image },
    { header: 'FSC-XML', key: this.emFile.FSC },
  ];

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
    this.form = this.fb.group({
      datasetName: this.dataset.datasetName,
      description: this.dataset.description,
      keywords: this.fb.array(this.dataset.keywords),
      metadata: this.dataset.scientificMetadata,
      emMethod: new FormControl(""),
      deposingCoordinates: new FormControl(true),
      associatedMap: new FormControl(false),
      compositeMap: new FormControl(false),
      emdbId: new FormControl(""),
      email: this.user.email,
      jwtToken: new FormControl(""),
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
  onChooseFile(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
  onFileSelected(event: Event, controlName: EmFile) {
    const input = event.target as HTMLInputElement;
    console.log(input);
    if (input.files && input.files.length > 0) {
      this.selectedFile[controlName] = input.files[0];
      this.form.get(controlName)?.setValue({
        ...this.form.get(controlName)?.value,
        pathToFile: this.selectedFile[controlName].name
      });
    }
  }
  onDepositClick() {
    const formDataToSend = new FormData();
    formDataToSend.append('email', this.form.value.email);
    formDataToSend.append('orcidIds', this.form.value.orcidArray);
    formDataToSend.append('metadata', JSON.stringify(this.form.value.metadata));
    formDataToSend.append('experiments', this.form.value.emMethod);
    // emdbId: this.form.value.emdbId, 
    var fileMetadata = []

    for (const key in this.files) {
      if (this.files[key].file) {
        formDataToSend.append('file', this.files[key].file);
        fileMetadata.push({ name: this.files[key].name, type: this.files[key].type, contour: this.files[key].contour, details: this.files[key].details });
      }
    }
    formDataToSend.append('fileMetadata', JSON.stringify(fileMetadata));

    this.http.post("http://localhost:8080/onedep", formDataToSend, {
      headers: {}
    }).subscribe(
      response => {
        console.log('created deposition in OneDep', response);
      },
      error => {
        console.error('Request failed esf', error);
      }
    );
  }

}
