import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/services/couponService';

export async function POST(request: NextRequest) {
  try {
    const couponData = await request.json();

    // Validate required fields
    if (!couponData.code || !couponData.description || !couponData.expirationDate) {
      return NextResponse.json(
        { error: 'Missing required fields: code, description, expirationDate' },
        { status: 400 }
      );
    }

    // Create the coupon
    const couponId = await CouponService.createCoupon(couponData);

    return NextResponse.json({
      success: true,
      couponId,
      message: 'Coupon created successfully'
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const coupons = await CouponService.getAllCoupons();
    return NextResponse.json({
      success: true,
      coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}
