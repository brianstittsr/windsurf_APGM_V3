/**
 * Enhanced Email Service with PDF Generation
 * Automatically creates PDF versions of all forms sent via email
 */

import { ClientEmailService, HealthFormEmailData, LoginEmailData } from './clientEmailService';
import { PDFService, FormData } from './pdfService';
import { PDFDocumentService } from './database';
import { Timestamp } from 'firebase/firestore';

export interface EmailWithPDFOptions {
  clientId: string;
  appointmentId?: string;
  generatePDF?: boolean;
  storePDFInProfile?: boolean;
}

export class EnhancedEmailService extends ClientEmailService {
  /**
   * Send health form email with PDF generation and storage
   */
  static async sendHealthFormEmailWithPDF(
    data: HealthFormEmailData, 
    options: EmailWithPDFOptions
  ): Promise<{ emailSent: boolean; pdfUrl?: string; pdfId?: string }> {
    try {
      console.log('📧 Sending health form email with PDF generation...');
      
      // Send the original email
      const emailSent = await super.sendHealthFormEmail(data);
      
      if (!emailSent) {
        console.error('❌ Email sending failed, skipping PDF generation');
        return { emailSent: false };
      }

      // Generate PDF if requested
      if (options.generatePDF !== false) {
        try {
          const pdfFormData: FormData = {
            clientProfile: {
              firstName: data.clientName.split(' ')[0] || '',
              lastName: data.clientName.split(' ').slice(1).join(' ') || '',
              email: data.clientEmail
            },
            healthForm: {
              responses: data.healthFormData,
              signature: data.clientSignature,
              submissionDate: data.submissionDate
            },
            appointment: options.appointmentId ? { id: options.appointmentId } : null,
            service: null,
            signatures: {
              clientSignature: data.clientSignature,
              clientSignatureDate: data.submissionDate,
              consentGiven: true,
              termsAccepted: true
            }
          };

          console.log('📄 Generating health form PDF...');
          const pdfUrl = await PDFService.generateAndStorePDF(
            pdfFormData,
            options.clientId,
            options.appointmentId || `health-${Date.now()}`
          );

          // Store PDF reference in database
          let pdfId: string | undefined;
          if (options.storePDFInProfile !== false) {
            console.log('💾 Storing PDF reference in user profile...');
            pdfId = await PDFDocumentService.createPDFRecord({
              clientId: options.clientId,
              appointmentId: options.appointmentId || `health-${Date.now()}`,
              formType: 'health',
              filename: `health-form-${new Date().toISOString().split('T')[0]}.pdf`,
              downloadURL: pdfUrl,
              filePath: `client-forms/${options.clientId}/health-form-${Date.now()}.pdf`,
              generatedAt: Timestamp.now()
            });
          }

          console.log('✅ Health form email sent and PDF generated successfully');
          return { emailSent: true, pdfUrl, pdfId };

        } catch (pdfError) {
          console.error('❌ PDF generation failed, but email was sent:', pdfError);
          return { emailSent: true };
        }
      }

      return { emailSent: true };

    } catch (error) {
      console.error('❌ Enhanced health form email service failed:', error);
      return { emailSent: false };
    }
  }

  /**
   * Send login email with PDF generation (for login credentials record)
   */
  static async sendLoginEmailWithPDF(
    data: LoginEmailData,
    options: EmailWithPDFOptions
  ): Promise<{ emailSent: boolean; pdfUrl?: string; pdfId?: string }> {
    try {
      console.log('📧 Sending login email with PDF generation...');
      
      // Send the original email
      const emailSent = await super.sendLoginEmail(data);
      
      if (!emailSent) {
        console.error('❌ Email sending failed, skipping PDF generation');
        return { emailSent: false };
      }

      // Generate PDF if requested
      if (options.generatePDF !== false) {
        try {
          const pdfFormData: FormData = {
            clientProfile: {
              firstName: data.clientName.split(' ')[0] || '',
              lastName: data.clientName.split(' ').slice(1).join(' ') || '',
              email: data.clientEmail
            },
            healthForm: null,
            appointment: null,
            service: null,
            signatures: {
              loginCredentials: {
                loginUrl: data.loginUrl,
                temporaryPassword: data.temporaryPassword ? '[REDACTED]' : 'N/A',
                issuedDate: new Date().toISOString()
              }
            }
          };

          console.log('📄 Generating login credentials PDF...');
          const pdfUrl = await PDFService.generateAndStorePDF(
            pdfFormData,
            options.clientId,
            options.appointmentId || `login-${Date.now()}`
          );

          // Store PDF reference in database
          let pdfId: string | undefined;
          if (options.storePDFInProfile !== false) {
            console.log('💾 Storing PDF reference in user profile...');
            pdfId = await PDFDocumentService.createPDFRecord({
              clientId: options.clientId,
              appointmentId: options.appointmentId || `login-${Date.now()}`,
              formType: 'consent',
              filename: `login-credentials-${new Date().toISOString().split('T')[0]}.pdf`,
              downloadURL: pdfUrl,
              filePath: `client-forms/${options.clientId}/login-credentials-${Date.now()}.pdf`,
              generatedAt: Timestamp.now()
            });
          }

          console.log('✅ Login email sent and PDF generated successfully');
          return { emailSent: true, pdfUrl, pdfId };

        } catch (pdfError) {
          console.error('❌ PDF generation failed, but email was sent:', pdfError);
          return { emailSent: true };
        }
      }

      return { emailSent: true };

    } catch (error) {
      console.error('❌ Enhanced login email service failed:', error);
      return { emailSent: false };
    }
  }

  /**
   * Generate payment confirmation PDF and store in profile
   */
  static async generatePaymentConfirmationPDF(
    paymentData: {
      clientName: string;
      clientEmail: string;
      amount: number;
      paymentMethod: string;
      transactionId: string;
      appointmentDate?: string;
      serviceName?: string;
    },
    options: EmailWithPDFOptions
  ): Promise<{ pdfUrl?: string; pdfId?: string }> {
    try {
      console.log('📄 Generating payment confirmation PDF...');

      const pdfFormData: FormData = {
        clientProfile: {
          firstName: paymentData.clientName.split(' ')[0] || '',
          lastName: paymentData.clientName.split(' ').slice(1).join(' ') || '',
          email: paymentData.clientEmail
        },
        healthForm: null,
        appointment: {
          date: paymentData.appointmentDate,
          service: paymentData.serviceName
        },
        service: {
          name: paymentData.serviceName,
          price: paymentData.amount
        },
        signatures: {
          paymentConfirmation: {
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            transactionId: paymentData.transactionId,
            processedDate: new Date().toISOString()
          }
        }
      };

      const pdfUrl = await PDFService.generateAndStorePDF(
        pdfFormData,
        options.clientId,
        options.appointmentId || `payment-${Date.now()}`
      );

      // Store PDF reference in database
      let pdfId: string | undefined;
      if (options.storePDFInProfile !== false) {
        console.log('💾 Storing payment PDF reference in user profile...');
        pdfId = await PDFDocumentService.createPDFRecord({
          clientId: options.clientId,
          appointmentId: options.appointmentId || `payment-${Date.now()}`,
          formType: 'booking',
          filename: `payment-confirmation-${new Date().toISOString().split('T')[0]}.pdf`,
          downloadURL: pdfUrl,
          filePath: `client-forms/${options.clientId}/payment-confirmation-${Date.now()}.pdf`,
          generatedAt: Timestamp.now()
        });
      }

      console.log('✅ Payment confirmation PDF generated successfully');
      return { pdfUrl, pdfId };

    } catch (error) {
      console.error('❌ Payment PDF generation failed:', error);
      return {};
    }
  }

  /**
   * Generate consent form PDF and store in profile
   */
  static async generateConsentFormPDF(
    consentData: {
      clientName: string;
      clientEmail: string;
      serviceName: string;
      consentItems: string[];
      signature: string;
      signatureDate: string;
    },
    options: EmailWithPDFOptions
  ): Promise<{ pdfUrl?: string; pdfId?: string }> {
    try {
      console.log('📄 Generating consent form PDF...');

      const pdfFormData: FormData = {
        clientProfile: {
          firstName: consentData.clientName.split(' ')[0] || '',
          lastName: consentData.clientName.split(' ').slice(1).join(' ') || '',
          email: consentData.clientEmail
        },
        healthForm: null,
        appointment: null,
        service: {
          name: consentData.serviceName
        },
        signatures: {
          clientSignature: consentData.signature,
          clientSignatureDate: consentData.signatureDate,
          consentGiven: true,
          termsAccepted: true,
          consentItems: consentData.consentItems
        }
      };

      const pdfUrl = await PDFService.generateAndStorePDF(
        pdfFormData,
        options.clientId,
        options.appointmentId || `consent-${Date.now()}`
      );

      // Store PDF reference in database
      let pdfId: string | undefined;
      if (options.storePDFInProfile !== false) {
        console.log('💾 Storing consent PDF reference in user profile...');
        pdfId = await PDFDocumentService.createPDFRecord({
          clientId: options.clientId,
          appointmentId: options.appointmentId || `consent-${Date.now()}`,
          formType: 'consent',
          filename: `consent-form-${new Date().toISOString().split('T')[0]}.pdf`,
          downloadURL: pdfUrl,
          filePath: `client-forms/${options.clientId}/consent-form-${Date.now()}.pdf`,
          generatedAt: Timestamp.now()
        });
      }

      console.log('✅ Consent form PDF generated successfully');
      return { pdfUrl, pdfId };

    } catch (error) {
      console.error('❌ Consent PDF generation failed:', error);
      return {};
    }
  }

  /**
   * Get all PDFs for a client
   */
  static async getClientPDFs(clientId: string): Promise<any[]> {
    try {
      return await PDFDocumentService.getPDFsByClient(clientId);
    } catch (error) {
      console.error('❌ Failed to retrieve client PDFs:', error);
      return [];
    }
  }

  /**
   * Get all PDFs for an appointment
   */
  static async getAppointmentPDFs(appointmentId: string): Promise<any[]> {
    try {
      return await PDFDocumentService.getPDFsByAppointment(appointmentId);
    } catch (error) {
      console.error('❌ Failed to retrieve appointment PDFs:', error);
      return [];
    }
  }
}
