import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSecretPage } from './add-secret.page';

describe('AddSecretPage', () => {
  let component: AddSecretPage;
  let fixture: ComponentFixture<AddSecretPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSecretPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
