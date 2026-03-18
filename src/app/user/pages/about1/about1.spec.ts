import { ComponentFixture, TestBed } from '@angular/core/testing';

import { About1 } from './about1';

describe('About1', () => {
  let component: About1;
  let fixture: ComponentFixture<About1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(About1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
