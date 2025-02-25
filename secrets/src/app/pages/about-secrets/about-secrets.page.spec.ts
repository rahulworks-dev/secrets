import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutSecretsPage } from './about-secrets.page';

describe('AboutSecretsPage', () => {
  let component: AboutSecretsPage;
  let fixture: ComponentFixture<AboutSecretsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutSecretsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
