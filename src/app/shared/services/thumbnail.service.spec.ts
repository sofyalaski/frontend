import { TestBed } from "@angular/core/testing";
import { DatasetApi } from "shared/sdk";
import { AppConfigService } from "app-config.service";
import { ThumbnailService } from "./thumbnail.service";
import { selectDatasetsPerPage } from "state-management/selectors/datasets.selectors";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { of, throwError } from "rxjs";

describe("ThumbnailService", () => {
  let service: ThumbnailService;
  let datasetApi: jasmine.SpyObj<DatasetApi>;
  let store: MockStore;
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds

  const getConfig = () => ({
    thumbnailFetchLimitPerPage: 100,
  });

  beforeEach(() => {
    const datasetApiSpy = jasmine.createSpyObj("DatasetApi", ["thumbnail"]);

    TestBed.configureTestingModule({
      providers: [
        ThumbnailService,
        { provide: DatasetApi, useValue: datasetApiSpy },
        {
          provide: AppConfigService,
          useValue: { getConfig },
        },
        provideMockStore({
          selectors: [
            {
              selector: selectDatasetsPerPage,
              value: 100,
            },
          ],
        }),
      ],
    });

    service = TestBed.inject(ThumbnailService);
    datasetApi = TestBed.inject(DatasetApi) as jasmine.SpyObj<DatasetApi>;
    store = TestBed.inject(MockStore);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it("should create the service", () => {
    expect(service).toBeTruthy();
  });

  it("should return cached thumbnail if it exists and is valid", async () => {
    const pid = "test-pid";
    const thumbnail = "thumbnai_binary_data";
    const timestamp = Date.now();

    service["thumbnailCache"][pid] = {
      value: thumbnail,
      timestamp,
      isError: false,
    };

    const result = await service.getThumbnail(pid);

    expect(result).toBe(thumbnail);
  });

  it("should fetch a new thumbnail if cache has expired", async () => {
    const pid = "test-pid";
    const thumbnail = "thumbnai_binary_data-2";
    const expiredTimestamp = Date.now() - (cacheTimeout + 1000);

    service["thumbnailCache"][pid] = {
      value: thumbnail,
      timestamp: expiredTimestamp,
      isError: false,
    };

    datasetApi.thumbnail.and.returnValue(of({ thumbnail }));

    const result = await service.getThumbnail(pid);
    expect(datasetApi.thumbnail).toHaveBeenCalledWith(encodeURIComponent(pid));
    expect(result).toBe(thumbnail);
  });

  it("should not fetch thumbnail if datasetsPerPage exceeds the thumbnailFetchLimitPerPage", async () => {
    store.overrideSelector(selectDatasetsPerPage, 200);
    store.refreshState(); // Refresh the state to apply the override
    const pid = "test-pid";
    const result = await service.getThumbnail(pid);

    expect(result).toBeNull(); // Should return null when over limit
    expect(datasetApi.thumbnail).not.toHaveBeenCalled();
  });

  it("should fetch thumbnail and cache it if not already cached", async () => {
    const pid = "test-pid";
    const thumbnail = "http://thumbnail-url.com/image.jpg";

    datasetApi.thumbnail.and.returnValue(of({ thumbnail }));

    const result = await service.getThumbnail(pid);
    expect(datasetApi.thumbnail).toHaveBeenCalledWith(encodeURIComponent(pid));
    expect(result).toBe(thumbnail);
    expect(service["thumbnailCache"][pid].value).toBe(thumbnail);
  });

  it("should cache failed requests as null with isError=true", async () => {
    const pid = "test-pid";
    const err = new Error("Failed to fetch thumbnail");
    datasetApi.thumbnail.and.returnValue(throwError(() => err));

    const result = await service.getThumbnail(pid);
    expect(result).toBeNull();
    expect(service["thumbnailCache"][pid].value).toBeNull();
    expect(service["thumbnailCache"][pid].isError).toBeTrue();
  });
});
