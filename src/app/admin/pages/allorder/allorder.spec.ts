import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Allorder } from './allorder';

describe('Allorder', () => {
  let component: Allorder;
  let fixture: ComponentFixture<Allorder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Allorder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Allorder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
