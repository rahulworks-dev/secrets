import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecretsPage } from './secrets.page';

describe('SecretsPage', () => {
  let component: SecretsPage;
  let fixture: ComponentFixture<SecretsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
