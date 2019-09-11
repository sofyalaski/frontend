import { NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FileUploaderComponent } from "./file-uploader.component";
import { ReadFile, ReadMode } from "ngx-file-helpers";

describe("FileUploaderComponent", () => {
  let component: FileUploaderComponent;
  let fixture: ComponentFixture<FileUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [FileUploaderComponent]
    });
    TestBed.compileComponents();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#onReadStart()", () => {
    it("should set the status", () => {
      expect(component.status).toBeUndefined();

      component.onReadStart(1);

      expect(component.status).toBeDefined();
    });
  });

  describe("#onFilePicked()", () => {
    it("should emit the picked file", () => {
      spyOn(component.filePicked, "emit");

      const file: ReadFile = {
        name: "test",
        size: 100,
        type: "image/png",
        readMode: ReadMode.dataURL,
        content: "abc123",
        underlyingFile: {
          lastModified: 123,
          name: "test",
          size: 100,
          type: "image/png",
          slice: () => new Blob().slice()
        }
      };
      component.onFilePicked(file);

      expect(component.filePicked.emit).toHaveBeenCalledTimes(1);
      expect(component.filePicked.emit).toHaveBeenCalledWith(file);
    });
  });

  describe("#onReadEnd()", () => {
    it("should set the status and emit the number of files read", () => {
      expect(component.status).toBeUndefined();
      spyOn(component.readEnd, "emit");

      component.onReadEnd(1);

      expect(component.status).toBeDefined();
      expect(component.readEnd.emit).toHaveBeenCalledTimes(1);
      expect(component.readEnd.emit).toHaveBeenCalledWith(1);
    });
  });
});
