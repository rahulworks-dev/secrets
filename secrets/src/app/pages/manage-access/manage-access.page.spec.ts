import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAccessPage } from './manage-access.page';

describe('ManageAccessPage', () => {
  let component: ManageAccessPage;
  let fixture: ComponentFixture<ManageAccessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
