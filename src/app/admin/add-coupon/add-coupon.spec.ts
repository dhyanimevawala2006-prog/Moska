import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCoupon } from './add-coupon';

describe('AddCoupon', () => {
  let component: AddCoupon;
  let fixture: ComponentFixture<AddCoupon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCoupon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCoupon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
