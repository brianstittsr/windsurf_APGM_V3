import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
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
                  Privacy <span className="text-primary">Policy</span>
                </h1>
                <p className="fs-5 text-black mb-0">
                  Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
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
                      <h2 className="h4 fw-bold text-primary mb-3">1. Information We Collect</h2>
                      <p className="text-black mb-3">
                        We collect information you provide directly to us, such as when you:
                      </p>
                      <ul className="text-black mb-4">
                        <li>Schedule an appointment or consultation</li>
                        <li>Fill out health forms or questionnaires</li>
                        <li>Contact us via phone, email, or our website</li>
                        <li>Subscribe to our newsletter or marketing communications</li>
                        <li>Provide feedback or reviews</li>
                      </ul>
                      <p className="text-black">
                        This information may include your name, email address, phone number, address, 
                        date of birth, health information, payment information, and any other information 
                        you choose to provide.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">2. How We Use Your Information</h2>
                      <p className="text-black mb-3">
                        We use the information we collect to:
                      </p>
                      <ul className="text-black">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Schedule and manage your appointments</li>
                        <li>Assess your candidacy for semi-permanent makeup procedures</li>
                        <li>Process payments and manage billing</li>
                        <li>Communicate with you about your appointments and services</li>
                        <li>Send you marketing communications (with your consent)</li>
                        <li>Comply with legal obligations and protect our rights</li>
                        <li>Maintain health and safety records as required by law</li>
                      </ul>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">3. Information Sharing and Disclosure</h2>
                      <p className="text-black mb-3">
                        We do not sell, trade, or otherwise transfer your personal information to third parties, 
                        except in the following circumstances:
                      </p>
                      <ul className="text-black">
                        <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our business</li>
                        <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
                        <li><strong>Medical Professionals:</strong> We may share health information with medical professionals when necessary for your care</li>
                        <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, sale, or other business transaction</li>
                      </ul>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">4. Health Information (HIPAA)</h2>
                      <p className="text-black">
                        As a healthcare provider, we are committed to protecting your health information in accordance 
                        with the Health Insurance Portability and Accountability Act (HIPAA). Your health information 
                        will only be used and disclosed as permitted by HIPAA regulations and with your written consent 
                        when required. You have the right to request access to, amendment of, and restrictions on the 
                        use and disclosure of your health information.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">5. Data Security</h2>
                      <p className="text-black">
                        We implement appropriate technical and organizational security measures to protect your personal 
                        information against unauthorized access, alteration, disclosure, or destruction. However, no method 
                        of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee 
                        absolute security.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">6. Data Retention</h2>
                      <p className="text-black">
                        We retain your personal information for as long as necessary to fulfill the purposes outlined 
                        in this privacy policy, comply with legal obligations, resolve disputes, and enforce our agreements. 
                        Health records are maintained in accordance with applicable medical record retention requirements.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">7. Your Rights</h2>
                      <p className="text-black mb-3">
                        You have the right to:
                      </p>
                      <ul className="text-black">
                        <li>Access and receive a copy of your personal information</li>
                        <li>Request correction of inaccurate or incomplete information</li>
                        <li>Request deletion of your personal information (subject to legal requirements)</li>
                        <li>Opt-out of marketing communications</li>
                        <li>Request restrictions on the processing of your information</li>
                      </ul>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">8. Cookies and Website Analytics</h2>
                      <p className="text-black">
                        Our website may use cookies and similar technologies to enhance your browsing experience, 
                        analyze website traffic, and understand user preferences. You can control cookie settings 
                        through your browser preferences.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">9. Third-Party Links</h2>
                      <p className="text-black">
                        Our website may contain links to third-party websites. We are not responsible for the privacy 
                        practices or content of these external sites. We encourage you to review the privacy policies 
                        of any third-party sites you visit.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">10. Changes to This Policy</h2>
                      <p className="text-black">
                        We may update this privacy policy from time to time. We will notify you of any material changes 
                        by posting the new policy on our website and updating the &quot;Last Updated&quot; date. Your continued 
                        use of our services after any changes constitutes acceptance of the updated policy.
                      </p>
                    </div>

                    <div className="mb-0">
                      <h2 className="h4 fw-bold text-primary mb-3">11. Contact Us</h2>
                      <p className="text-black mb-3">
                        If you have any questions about this privacy policy or our privacy practices, please contact us:
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
