import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface FormData {
  clientProfile: any;
  healthForm: any;
  appointment: any;
  service: any;
  signatures: any;
}

export class PDFService {
  /**
   * Generate PDF from HTML element
   */
  static async generatePDFFromElement(element: HTMLElement, filename: string): Promise<Blob> {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  }

  /**
   * Generate comprehensive booking form PDF
   */
  static async generateBookingFormPDF(formData: FormData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('A Pretty Girl Matter - Booking Form', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);

    let yPosition = 45;

    // Service Information
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Service Information', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Service: ${formData.service?.name || 'N/A'}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Price: $${formData.service?.price || 'N/A'}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Duration: ${formData.service?.duration || 'N/A'}`, 20, yPosition);
    yPosition += 15;

    // Appointment Details
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Appointment Details', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${formData.appointment?.date || 'N/A'}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Time: ${formData.appointment?.time || 'N/A'}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Artist: ${formData.appointment?.artist || 'N/A'}`, 20, yPosition);
    yPosition += 15;

    // Client Information
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Client Information', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    if (formData.clientProfile) {
      const profile = formData.clientProfile;
      pdf.text(`Name: ${profile.firstName || ''} ${profile.lastName || ''}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Email: ${profile.email || 'N/A'}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Phone: ${profile.phone || 'N/A'}`, 20, yPosition);
      yPosition += 7;
      
      if (profile.address) {
        pdf.text(`Address: ${profile.address}`, 20, yPosition);
        yPosition += 7;
      }
      
      if (profile.emergencyContactName) {
        pdf.text(`Emergency Contact: ${profile.emergencyContactName}`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Emergency Phone: ${profile.emergencyContactPhone || 'N/A'}`, 20, yPosition);
        yPosition += 7;
      }
    }
    yPosition += 10;

    // Health Information
    if (formData.healthForm) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Health Information', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const health = formData.healthForm;
      
      // Medical conditions
      if (health.medicalConditions && health.medicalConditions.length > 0) {
        pdf.text('Medical Conditions:', 20, yPosition);
        yPosition += 7;
        health.medicalConditions.forEach((condition: string) => {
          pdf.text(`• ${condition}`, 25, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }

      // Medications
      if (health.medications) {
        pdf.text(`Medications: ${health.medications}`, 20, yPosition);
        yPosition += 7;
      }

      // Allergies
      if (health.allergies) {
        pdf.text(`Allergies: ${health.allergies}`, 20, yPosition);
        yPosition += 7;
      }

      // Pregnancy
      if (health.isPregnant !== undefined) {
        pdf.text(`Pregnant: ${health.isPregnant ? 'Yes' : 'No'}`, 20, yPosition);
        yPosition += 7;
      }

      // Skin conditions
      if (health.skinConditions) {
        pdf.text(`Skin Conditions: ${health.skinConditions}`, 20, yPosition);
        yPosition += 7;
      }
    }

    // Add new page if needed
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Signatures
    if (formData.signatures) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Signatures & Consent', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      if (formData.signatures.clientSignature) {
        pdf.text('Client Signature: [Signed Electronically]', 20, yPosition);
        yPosition += 7;
        pdf.text(`Date: ${formData.signatures.clientSignatureDate || new Date().toLocaleDateString()}`, 20, yPosition);
        yPosition += 10;
      }

      if (formData.signatures.consentGiven) {
        pdf.text('✓ Consent to treatment given', 20, yPosition);
        yPosition += 7;
      }

      if (formData.signatures.termsAccepted) {
        pdf.text('✓ Terms and conditions accepted', 20, yPosition);
        yPosition += 7;
      }
    }

    // Footer
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('A Pretty Girl Matter LLC - Professional Semi-Permanent Makeup Services', 20, 280);
    pdf.text('Generated electronically - no physical signature required', 20, 285);

    return pdf.output('blob');
  }

  /**
   * Upload PDF to Firebase Storage
   */
  static async uploadPDFToFirebase(
    pdfBlob: Blob, 
    clientId: string, 
    appointmentId: string, 
    formType: 'booking' | 'health' | 'consent'
  ): Promise<string> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${formType}-form-${timestamp}-${appointmentId}.pdf`;
      const filePath = `client-forms/${clientId}/${filename}`;
      
      const storageRef = ref(storage, filePath);
      
      const metadata = {
        contentType: 'application/pdf',
        customMetadata: {
          clientId,
          appointmentId,
          formType,
          generatedAt: new Date().toISOString()
        }
      };

      const snapshot = await uploadBytes(storageRef, pdfBlob, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('✅ PDF uploaded to Firebase Storage:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading PDF to Firebase:', error);
      throw error;
    }
  }

  /**
   * Generate and store complete booking form PDF
   */
  static async generateAndStorePDF(
    formData: FormData,
    clientId: string,
    appointmentId: string
  ): Promise<string> {
    try {
      console.log('📄 Generating booking form PDF...');
      const pdfBlob = await this.generateBookingFormPDF(formData);
      
      console.log('☁️ Uploading PDF to Firebase Storage...');
      const downloadURL = await this.uploadPDFToFirebase(
        pdfBlob, 
        clientId, 
        appointmentId, 
        'booking'
      );
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Error generating and storing PDF:', error);
      throw error;
    }
  }

  /**
   * Generate PDF from specific form element
   */
  static async generateFormElementPDF(
    elementId: string,
    clientId: string,
    appointmentId: string,
    formType: 'booking' | 'health' | 'consent'
  ): Promise<string> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID ${elementId} not found`);
      }

      console.log(`📄 Generating ${formType} form PDF from element...`);
      const filename = `${formType}-form-${new Date().toISOString().split('T')[0]}`;
      const pdfBlob = await this.generatePDFFromElement(element, filename);
      
      console.log('☁️ Uploading PDF to Firebase Storage...');
      const downloadURL = await this.uploadPDFToFirebase(
        pdfBlob,
        clientId,
        appointmentId,
        formType
      );
      
      return downloadURL;
    } catch (error) {
      console.error(`❌ Error generating ${formType} form PDF:`, error);
      throw error;
    }
  }
}
