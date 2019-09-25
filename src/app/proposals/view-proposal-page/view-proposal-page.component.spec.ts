import { ViewProposalPageComponent } from "./view-proposal-page.component";
import {
  ComponentFixture,
  async,
  TestBed,
  inject
} from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { MockStore, MockActivatedRoute } from "shared/MockStubs";
import { Router, ActivatedRoute } from "@angular/router";
import { StoreModule, Store } from "@ngrx/store";
import { rootReducer } from "state-management/reducers/root.reducer";
import { DatePipe, SlicePipe } from "@angular/common";
import { FileSizePipe } from "shared/pipes/filesize.pipe";
import { Dataset } from "shared/sdk";
import { PageChangeEvent } from "datasets/dataset-table/dataset-table.component";
import { ChangePageAction } from "state-management/actions/proposals.actions";

describe("ViewProposalPageComponent", () => {
  let component: ViewProposalPageComponent;
  let fixture: ComponentFixture<ViewProposalPageComponent>;

  let router = {
    navigateByUrl: jasmine.createSpy("navigateByUrl")
  };
  let store: MockStore;
  let dispatchSpy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ViewProposalPageComponent],
      imports: [StoreModule.forRoot({ rootReducer })],
      providers: [DatePipe, FileSizePipe, SlicePipe]
    });
    TestBed.overrideComponent(ViewProposalPageComponent, {
      set: {
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useClass: MockActivatedRoute }
        ]
      }
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProposalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(inject([Store], (mockStore: MockStore) => {
    store = mockStore;
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#formatTableData()", () => {
    it("should do nothing if there are no datasets", () => {
      const data = component.formatTableData(null);

      expect(data).toBeUndefined();
    });

    it("should return an array of data objects if there are datasets", () => {
      const datasets = [new Dataset()];
      const data = component.formatTableData(datasets);

      expect(data.length).toEqual(1);
    });
  });

  describe("#onPageChange()", () => {
    it("should dispatch a ChangePageAction", () => {
      dispatchSpy = spyOn(store, "dispatch");

      const event: PageChangeEvent = {
        pageIndex: 0,
        pageSize: 25,
        length: 25
      };
      component.onPageChange(event);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        new ChangePageAction(event.pageIndex, event.pageSize)
      );
    });
  });

  describe("#onRowClick()", () => {
    it("should navigate to a dataset", () => {
      const dataset = new Dataset();
      const pid = encodeURIComponent(dataset.pid);
      component.onRowClick(dataset);

      expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
      expect(router.navigateByUrl).toHaveBeenCalledWith("/datasets/" + pid);
    });
  });
});