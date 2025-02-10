import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoldersPage } from './folders.page';

describe('FoldersPage', () => {
  let component: FoldersPage;
  let fixture: ComponentFixture<FoldersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FoldersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
