import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCoupons } from './show-coupons';

describe('ShowCoupons', () => {
  let component: ShowCoupons;
  let fixture: ComponentFixture<ShowCoupons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCoupons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowCoupons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
