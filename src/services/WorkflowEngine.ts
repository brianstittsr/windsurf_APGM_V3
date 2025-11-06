import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'delay' | 'condition' | 'tag' | 'task';
  title: string;
  description: string;
  delay?: number;
  delayUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
  content?: string;
  subject?: string;
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals';
    value: string;
  };
  tags?: string[];
  taskDescription?: string;
  assignedTo?: string;
}

export interface MarketingWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'new_client' | 'appointment_booked' | 'appointment_completed' | 'no_show' | 'manual' | 'birthday' | 'follow_up';
  isActive: boolean;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  stats: {
    totalEnrolled: number;
    completed: number;
    active: number;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  userEmail: string;
  currentStepIndex: number;
  status: 'active' | 'completed' | 'paused' | 'failed';
  startedAt: string;
  completedAt?: string;
  nextExecutionTime?: string;
  executionLog: WorkflowExecutionLog[];
}

export interface WorkflowExecutionLog {
  stepId: string;
  stepType: string;
  executedAt: string;
  status: 'success' | 'failed' | 'skipped';
  result?: any;
  error?: string;
}

export class WorkflowEngine {
  private static instance: WorkflowEngine;

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  // Enroll a user in a workflow
  async enrollUserInWorkflow(workflowId: string, userId: string, userEmail: string): Promise<string> {
    try {
      const executionId = `execution_${Date.now()}_${userId}`;
      const execution: WorkflowExecution = {
        id: executionId,
        workflowId,
        userId,
        userEmail,
        currentStepIndex: 0,
        status: 'active',
        startedAt: new Date().toISOString(),
        executionLog: []
      };

      const db = getDb();
      await setDoc(doc(db, 'workflowExecutions', executionId), execution);
      
      // Update workflow stats
      await this.updateWorkflowStats(workflowId, 'enrolled');
      
      // Start executing the workflow
      await this.processWorkflowExecution(executionId);
      
      return executionId;
    } catch (error) {
      console.error('Error enrolling user in workflow:', error);
      throw error;
    }
  }

  // Process a workflow execution
  async processWorkflowExecution(executionId: string): Promise<void> {
    try {
      // Get Firestore DB instance
      const db = getDb();
      
      // Get execution doc
      const executionDoc = await getDoc(doc(db, 'workflowExecutions', executionId));
      if (!executionDoc.exists()) {
        throw new Error('Workflow execution not found');
      }

      const execution = executionDoc.data() as WorkflowExecution;
      if (execution.status !== 'active') {
        return; // Skip if not active
      }

      // Get the workflow
      const workflowDoc = await getDoc(doc(db, 'marketingWorkflows', execution.workflowId));
      if (!workflowDoc.exists()) {
        throw new Error('Workflow not found');
      }

      const workflow = workflowDoc.data() as MarketingWorkflow;
      if (!workflow.isActive) {
        return; // Skip if workflow is inactive
      }

      const currentStep = workflow.steps[execution.currentStepIndex];
      if (!currentStep) {
        // Workflow completed
        await this.completeWorkflowExecution(executionId);
        return;
      }

      // Execute the current step
      const stepResult = await this.executeWorkflowStep(currentStep, execution, workflow);
      
      // Log the execution
      const logEntry: WorkflowExecutionLog = {
        stepId: currentStep.id,
        stepType: currentStep.type,
        executedAt: new Date().toISOString(),
        status: stepResult.success ? 'success' : 'failed',
        result: stepResult.result,
        error: stepResult.error
      };

      execution.executionLog.push(logEntry);

      if (stepResult.success) {
        if (stepResult.shouldAdvance) {
          // Move to next step
          execution.currentStepIndex++;
        }
        
        if (stepResult.nextExecutionTime) {
          // Schedule next execution
          execution.nextExecutionTime = stepResult.nextExecutionTime;
        }
      } else {
        // Handle failure
        execution.status = 'failed';
      }

      // Update execution
      await updateDoc(doc(getDb(), 'workflowExecutions', executionId), execution as any);

      // Continue processing if needed
      if (stepResult.success && stepResult.shouldAdvance && !stepResult.nextExecutionTime) {
        await this.processWorkflowExecution(executionId);
      }

    } catch (error) {
      console.error('Error processing workflow execution:', error);
      // Mark execution as failed
      await updateDoc(doc(getDb(), 'workflowExecutions', executionId), {
        status: 'failed',
        executionLog: [{
          stepId: 'system',
          stepType: 'error',
          executedAt: new Date().toISOString(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
    }
  }

  // Execute a specific workflow step
  private async executeWorkflowStep(
    step: WorkflowStep, 
    execution: WorkflowExecution, 
    workflow: MarketingWorkflow
  ): Promise<{
    success: boolean;
    shouldAdvance: boolean;
    nextExecutionTime?: string;
    result?: any;
    error?: string;
  }> {
    try {
      switch (step.type) {
        case 'email':
          return await this.executeEmailStep(step, execution);
        
        case 'sms':
          return await this.executeSMSStep(step, execution);
        
        case 'delay':
          return await this.executeDelayStep(step, execution);
        
        case 'condition':
          return await this.executeConditionStep(step, execution);
        
        case 'tag':
          return await this.executeTagStep(step, execution);
        
        case 'task':
          return await this.executeTaskStep(step, execution);
        
        default:
          return {
            success: false,
            shouldAdvance: false,
            error: `Unknown step type: ${step.type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        shouldAdvance: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Execute email step
  private async executeEmailStep(step: WorkflowStep, execution: WorkflowExecution) {
    try {
      // In a real implementation, this would integrate with an email service like SendGrid, Mailgun, etc.
      // For now, we'll simulate the email sending and log it
      
      const emailData = {
        to: execution.userEmail,
        subject: step.subject || 'Message from A Pretty Girl Matter',
        content: step.content || '',
        workflowId: execution.workflowId,
        executionId: execution.id,
        stepId: step.id
      };

      // Log the email to Firebase for tracking
      await addDoc(collection(getDb(), 'emailLogs'), {
        ...emailData,
        sentAt: serverTimestamp(),
        status: 'sent'
      });

      console.log('Email sent:', emailData);

      return {
        success: true,
        shouldAdvance: true,
        result: { emailSent: true, recipient: execution.userEmail }
      };
    } catch (error) {
      return {
        success: false,
        shouldAdvance: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  }

  // Execute SMS step
  private async executeSMSStep(step: WorkflowStep, execution: WorkflowExecution) {
    try {
      // In a real implementation, this would integrate with an SMS service like Twilio
      // For now, we'll simulate the SMS sending and log it
      
      // Get user's phone number from their profile
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', execution.userId));
      const userData = userDoc.data();
      const phoneNumber = userData?.phone;

      if (!phoneNumber) {
        return {
          success: false,
          shouldAdvance: true, // Skip this step if no phone number
          error: 'No phone number available for user'
        };
      }

      const smsData = {
        to: phoneNumber,
        content: step.content || '',
        workflowId: execution.workflowId,
        executionId: execution.id,
        stepId: step.id
      };

      // Log the SMS to Firebase for tracking
      await addDoc(collection(getDb(), 'smsLogs'), {
        ...smsData,
        sentAt: serverTimestamp(),
        status: 'sent'
      });

      console.log('SMS sent:', smsData);

      return {
        success: true,
        shouldAdvance: true,
        result: { smsSent: true, recipient: phoneNumber }
      };
    } catch (error) {
      return {
        success: false,
        shouldAdvance: false,
        error: error instanceof Error ? error.message : 'SMS sending failed'
      };
    }
  }

  // Execute delay step
  private async executeDelayStep(step: WorkflowStep, execution: WorkflowExecution) {
    try {
      const delay = step.delay || 1;
      const unit = step.delayUnit || 'days';
      
      let delayMs = 0;
      switch (unit) {
        case 'minutes':
          delayMs = delay * 60 * 1000;
          break;
        case 'hours':
          delayMs = delay * 60 * 60 * 1000;
          break;
        case 'days':
          delayMs = delay * 24 * 60 * 60 * 1000;
          break;
        case 'weeks':
          delayMs = delay * 7 * 24 * 60 * 60 * 1000;
          break;
      }

      const nextExecutionTime = new Date(Date.now() + delayMs).toISOString();

      return {
        success: true,
        shouldAdvance: true,
        nextExecutionTime,
        result: { delayUntil: nextExecutionTime, delay, unit }
      };
    } catch (error) {
      return {
        success: false,
        shouldAdvance: false,
        error: error instanceof Error ? error.message : 'Delay step failed'
      };
    }
  }

  // Execute condition step
  private async executeConditionStep(step: WorkflowStep, execution: WorkflowExecution) {
    try {
      if (!step.condition) {
        return {
          success: false,
          shouldAdvance: false,
          error: 'No condition specified'
        };
      }

      // Get user data to evaluate condition
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', execution.userId));
      const userData = userDoc.data();

      if (!userData) {
        return {
          success: false,
          shouldAdvance: false,
          error: 'User data not found'
        };
      }

      const fieldValue = userData[step.condition.field];
      const conditionValue = step.condition.value;
      let conditionMet = false;

      switch (step.condition.operator) {
        case 'equals':
          conditionMet = fieldValue === conditionValue;
          break;
        case 'not_equals':
          conditionMet = fieldValue !== conditionValue;
          break;
        case 'contains':
          conditionMet = String(fieldValue).includes(conditionValue);
          break;
        case 'greater_than':
          conditionMet = Number(fieldValue) > Number(conditionValue);
          break;
        case 'less_than':
          conditionMet = Number(fieldValue) < Number(conditionValue);
          break;
      }

      return {
        success: true,
        shouldAdvance: conditionMet,
        result: { conditionMet, fieldValue, conditionValue }
      };
    } catch (error) {
      return {
        success: false,
        shouldAdvance: false,
        error: error instanceof Error ? error.message : 'Condition evaluation failed'
      };
    }
  }

  // Execute tag step
  private async executeTagStep(step: WorkflowStep, execution: WorkflowExecution) {
    try {
      if (!step.tags || step.tags.length === 0) {
        return {
          success: false,
          shouldAdvance: false,
          error: 'No tags specified'
        };
      }

      // Add tags to user profile
      const db = getDb();
      const userRef = doc(db, 'users', execution.userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const existingTags = userData?.tags || [];
      const newTags = [...new Set([...existingTags, ...step.tags])];

      await updateDoc(userRef, { tags: newTags });

      return {
        success: true,
        shouldAdvance: true,
        result: { tagsAdded: step.tags, totalTags: newTags.length }
      };
    } catch (error) {
      return {
        success: false,
        shouldAdvance: false,
        error: error instanceof Error ? error.message : 'Tag step failed'
      };
    }
  }

  // Execute task step
  private async executeTaskStep(step: WorkflowStep, execution: WorkflowExecution) {
    try {
      const taskData = {
        description: step.taskDescription || 'Workflow task',
        assignedTo: step.assignedTo || 'admin',
        userId: execution.userId,
        userEmail: execution.userEmail,
        workflowId: execution.workflowId,
        executionId: execution.id,
        stepId: step.id,
        createdAt: serverTimestamp(),
        status: 'pending'
      };

      // Create task in Firebase
      await addDoc(collection(getDb(), 'workflowTasks'), taskData);

      return {
        success: true,
        shouldAdvance: true,
        result: { taskCreated: true, assignedTo: step.assignedTo }
      };
    } catch (error) {
      return {
        success: false,
        shouldAdvance: false,
        error: error instanceof Error ? error.message : 'Task creation failed'
      };
    }
  }

  // Complete workflow execution
  private async completeWorkflowExecution(executionId: string): Promise<void> {
    try {
      const db = getDb();
      const execution = await getDoc(doc(db, 'workflowExecutions', executionId));
      const executionData = execution.data() as WorkflowExecution;

      await updateDoc(doc(db, 'workflowExecutions', executionId), {
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      // Update workflow stats
      await this.updateWorkflowStats(executionData.workflowId, 'completed');
    } catch (error) {
      console.error('Error completing workflow execution:', error);
    }
  }

  // Update workflow statistics
  private async updateWorkflowStats(workflowId: string, action: 'enrolled' | 'completed'): Promise<void> {
    try {
      const db = getDb();
      const workflowRef = doc(db, 'marketingWorkflows', workflowId);
      const workflowDoc = await getDoc(workflowRef);
      
      if (workflowDoc.exists()) {
        const workflow = workflowDoc.data() as MarketingWorkflow;
        const stats = workflow.stats || { totalEnrolled: 0, completed: 0, active: 0 };

        if (action === 'enrolled') {
          stats.totalEnrolled++;
          stats.active++;
        } else if (action === 'completed') {
          stats.completed++;
          stats.active = Math.max(0, stats.active - 1);
        }

        await updateDoc(workflowRef, { stats });
      }
    } catch (error) {
      console.error('Error updating workflow stats:', error);
    }
  }

  // Get workflow executions for a user
  async getUserWorkflowExecutions(userId: string): Promise<WorkflowExecution[]> {
    try {
      const db = getDb();
      const q = query(
        collection(db, 'workflowExecutions'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as WorkflowExecution);
    } catch (error) {
      console.error('Error getting user workflow executions:', error);
      return [];
    }
  }

  // Get all workflow executions for a workflow
  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    try {
      const db = getDb();
      const q = query(
        collection(db, 'workflowExecutions'),
        where('workflowId', '==', workflowId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as WorkflowExecution);
    } catch (error) {
      console.error('Error getting workflow executions:', error);
      return [];
    }
  }

  // Process scheduled workflows (this would be called by a cron job or scheduler)
  async processScheduledWorkflows(): Promise<void> {
    try {
      const now = new Date().toISOString();
      const db = getDb();
      const q = query(
        collection(db, 'workflowExecutions'),
        where('status', '==', 'active'),
        where('nextExecutionTime', '<=', now)
      );
      
      const querySnapshot = await getDocs(q);
      const executions = querySnapshot.docs.map(doc => doc.data() as WorkflowExecution);

      for (const execution of executions) {
        await this.processWorkflowExecution(execution.id);
      }
    } catch (error) {
      console.error('Error processing scheduled workflows:', error);
    }
  }

  // Trigger workflows based on events
  async triggerWorkflows(trigger: string, userId: string, userEmail: string, additionalData?: any): Promise<void> {
    try {
      // Get all active workflows with this trigger
      const db = getDb();
      const q = query(
        collection(db, 'marketingWorkflows'),
        where('trigger', '==', trigger),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const workflows = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MarketingWorkflow[];

      // Enroll user in each matching workflow
      for (const workflow of workflows) {
        await this.enrollUserInWorkflow(workflow.id, userId, userEmail);
      }
    } catch (error) {
      console.error('Error triggering workflows:', error);
    }
  }
}

// Export singleton instance
export const workflowEngine = WorkflowEngine.getInstance();
