import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarUserDialogComponent } from './editar-user-dialog.component';

describe('EditarUserDialogComponent', () => {
  let component: EditarUserDialogComponent;
  let fixture: ComponentFixture<EditarUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarUserDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
