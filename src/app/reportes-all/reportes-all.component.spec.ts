import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesAllComponent } from './reportes-all.component';

describe('ReportesAllComponent', () => {
  let component: ReportesAllComponent;
  let fixture: ComponentFixture<ReportesAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportesAllComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
