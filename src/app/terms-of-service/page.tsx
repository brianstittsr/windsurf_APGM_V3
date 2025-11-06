import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 pt-header">
        {/* Hero Section */}
        <section className="py-5 bg-light" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h1 className="display-4 fw-bold text-dark mb-4">
                  Terms of <span className="text-primary">Service</span>
                </h1>
                <p className="fs-5 text-black mb-0">
                  Please read these terms carefully before using our services or website.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Terms of Service Content */}
        <section className="py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="card shadow border-0">
                  <div className="card-body p-5">
                    <p className="text-black mb-4">
                      <strong>Effective Date:</strong> January 1, 2025<br />
                      <strong>Last Updated:</strong> January 1, 2025
                    </p>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">1. Acceptance of Terms</h2>
                      <p className="text-black">
                        By accessing our website, scheduling an appointment, or using our services, you agree to be bound 
                        by these Terms of Service and all applicable laws and regulations. If you do not agree with any 
                        of these terms, you are prohibited from using or accessing our services.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">2. Services Provided</h2>
                      <p className="text-black mb-3">
                        A Pretty Girl Matter, LLC provides permanent makeup services including but not limited to:
                      </p>
                      <ul className="text-black mb-3">
                        <li>Microblading and powder eyebrows</li>
                        <li>Permanent eyeliner</li>
                        <li>Lip blushing and lip liner</li>
                        <li>Color correction services</li>
                        <li>Touch-up and maintenance services</li>
                        <li>Tiny tattoo services</li>
                      </ul>
                      <p className="text-black">
                        All services are performed by licensed professionals in accordance with state and local regulations.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">3. Client Responsibilities</h2>
                      <p className="text-black mb-3">
                        As a client, you agree to:
                      </p>
                      <ul className="text-black">
                        <li>Provide accurate and complete health information</li>
                        <li>Follow all pre-care and aftercare instructions</li>
                        <li>Arrive on time for scheduled appointments</li>
                        <li>Disclose any medications, allergies, or medical conditions</li>
                        <li>Inform us of any changes to your health status</li>
                        <li>Be at least 18 years of age or have parental consent</li>
                        <li>Not be pregnant or breastfeeding (for certain procedures)</li>
                        <li>Pay all fees in accordance with our payment terms</li>
                      </ul>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">4. Health and Safety</h2>
                      <p className="text-black mb-3">
                        Your health and safety are our top priorities. We reserve the right to:
                      </p>
                      <ul className="text-black mb-3">
                        <li>Refuse service if you are not a suitable candidate</li>
                        <li>Require medical clearance for certain conditions</li>
                        <li>Postpone or cancel procedures for health reasons</li>
                        <li>Modify procedures based on your individual needs</li>
                      </ul>
                      <p className="text-black">
                        All equipment is sterilized and single-use needles are used for each client. We follow strict 
                        sanitation protocols in accordance with health department regulations.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">5. Informed Consent</h2>
                      <p className="text-black">
                        Before any procedure, you will be required to sign an informed consent form acknowledging that 
                        you understand the risks, benefits, and potential complications of permanent makeup procedures. 
                        This includes understanding that results may vary and that touch-up sessions may be necessary.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">6. Payment Terms</h2>
                      <p className="text-black mb-3">
                        Payment is due at the time of service unless other arrangements have been made. We accept:
                      </p>
                      <ul className="text-black mb-3">
                        <li>Cash</li>
                        <li>Credit and debit cards</li>
                        <li>Approved financing options (Cherry, Klarna, PayPal Credit)</li>
                      </ul>
                      <p className="text-black">
                        Prices are subject to change without notice. Any additional services or modifications may incur 
                        additional charges.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">7. Appointment Scheduling and Cancellation</h2>
                      <p className="text-black mb-3">
                        Appointment scheduling and cancellation policies:
                      </p>
                      <ul className="text-black">
                        <li>Appointments must be scheduled in advance</li>
                        <li>A deposit may be required to secure your appointment</li>
                        <li>Cancellations must be made at least 48 hours in advance</li>
                        <li>Late cancellations or no-shows may result in forfeiture of deposit</li>
                        <li>Rescheduling is subject to availability</li>
                        <li>We reserve the right to cancel appointments due to unforeseen circumstances</li>
                      </ul>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">8. Results and Expectations</h2>
                      <p className="text-black">
                        Permanent makeup results vary from person to person based on skin type, lifestyle, and individual 
                        healing processes. We cannot guarantee specific results or longevity of procedures. Touch-up 
                        sessions are typically recommended 4-8 weeks after the initial procedure and may be required 
                        for optimal results.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">9. Photography and Marketing</h2>
                      <p className="text-black">
                        By signing our consent forms, you agree to allow us to photograph your procedures for our portfolio, 
                        marketing materials, and educational purposes. If you prefer not to be photographed, please inform 
                        us before your appointment.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">10. Limitation of Liability</h2>
                      <p className="text-black">
                        A Pretty Girl Matter, LLC and its employees shall not be liable for any indirect, incidental, 
                        special, or consequential damages arising from the use of our services. Our liability is limited 
                        to the amount paid for the specific service in question.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">11. Intellectual Property</h2>
                      <p className="text-black">
                        All content on our website, including text, graphics, logos, and images, is the property of 
                        A Pretty Girl Matter, LLC and is protected by copyright and trademark laws. You may not use, 
                        reproduce, or distribute any content without our written permission.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">12. Dispute Resolution</h2>
                      <p className="text-black">
                        Any disputes arising from these terms or our services shall be resolved through binding arbitration 
                        in accordance with the laws of North Carolina. Both parties agree to attempt mediation before 
                        pursuing legal action.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">13. Modifications to Terms</h2>
                      <p className="text-black">
                        We reserve the right to modify these terms at any time. Changes will be posted on our website 
                        and will become effective immediately upon posting. Your continued use of our services constitutes 
                        acceptance of any modifications.
                      </p>
                    </div>

                    <div className="mb-0">
                      <h2 className="h4 fw-bold text-primary mb-3">14. Contact Information</h2>
                      <p className="text-black mb-3">
                        If you have any questions about these Terms of Service, please contact us:
                      </p>
                      <div className="text-black">
                        <p className="mb-2"><strong>A Pretty Girl Matter, LLC</strong></p>
                        <p className="mb-2">4040 Barrett Drive Suite 3<br />Raleigh, NC 27609</p>
                        <p className="mb-2">Phone: (919) 441-0932</p>
                        <p className="mb-0">Email: victoria@aprettygirlmatter.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
