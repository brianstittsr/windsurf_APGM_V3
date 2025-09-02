import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ruleData = await request.json();
    const { id } = params;

    const updatedRule = {
      ...ruleData,
      updatedAt: new Date().toISOString()
    };

    await DatabaseService.updateDocument('crmAutomationRules', id, updatedRule);

    return NextResponse.json({ success: true, rule: updatedRule });
  } catch (error) {
    console.error('Failed to update automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to update automation rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await DatabaseService.deleteDocument('crmAutomationRules', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete automation rule' },
      { status: 500 }
    );
  }
}
