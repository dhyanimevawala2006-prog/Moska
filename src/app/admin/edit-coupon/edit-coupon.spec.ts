import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCoupon } from './edit-coupon';

describe('EditCoupon', () => {
  let component: EditCoupon;
  let fixture: ComponentFixture<EditCoupon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCoupon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCoupon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
