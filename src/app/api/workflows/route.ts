import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { MarketingWorkflow } from '@/services/WorkflowEngine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('id');

    if (workflowId) {
      // Get specific workflow
      const workflowDoc = await getDoc(doc(getDb(), 'marketingWorkflows', workflowId));
      if (!workflowDoc.exists()) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ workflow: { id: workflowDoc.id, ...workflowDoc.data() } });
    } else {
      // Get all workflows
      const querySnapshot = await getDocs(collection(getDb(), 'marketingWorkflows'));
      const workflows = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json({ workflows });
    }

  } catch (error) {
    console.error('Error getting workflows:', error);
    return NextResponse.json(
      { error: 'Failed to get workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow } = body;

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow data is required' },
        { status: 400 }
      );
    }

    const workflowId = workflow.id || `workflow_${Date.now()}`;
    const workflowData: MarketingWorkflow = {
      ...workflow,
      id: workflowId,
      createdAt: workflow.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: workflow.stats || {
        totalEnrolled: 0,
        completed: 0,
        active: 0
      }
    };

    await setDoc(doc(getDb(), 'marketingWorkflows', workflowId), workflowData);

    return NextResponse.json({ 
      success: true, 
      workflow: workflowData,
      message: 'Workflow created successfully' 
    });

  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow } = body;

    if (!workflow || !workflow.id) {
      return NextResponse.json(
        { error: 'Workflow data with ID is required' },
        { status: 400 }
      );
    }

    const workflowData = {
      ...workflow,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(getDb(), 'marketingWorkflows', workflow.id), workflowData);

    return NextResponse.json({ 
      success: true, 
      workflow: workflowData,
      message: 'Workflow updated successfully' 
    });

  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('id');

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    await deleteDoc(doc(getDb(), 'marketingWorkflows', workflowId));

    return NextResponse.json({ 
      success: true, 
      message: 'Workflow deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
