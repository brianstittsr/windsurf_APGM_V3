import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

export async function GET(request: NextRequest) {
  try {
    const rules = await DatabaseService.getCollection('crmAutomationRules');
    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Failed to get automation rules:', error);
    return NextResponse.json(
      { error: 'Failed to get automation rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ruleData = await request.json();
    
    const newRule = {
      ...ruleData,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await DatabaseService.create('crmAutomationRules', newRule.id, newRule);

    return NextResponse.json({ success: true, rule: newRule });
  } catch (error) {
    console.error('Failed to create automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to create automation rule' },
      { status: 500 }
    );
  }
}
