import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CancellationPolicy() {
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
                  Cancellation <span className="text-primary">Policy</span>
                </h1>
                <p className="fs-5 text-black mb-0">
                  Please review our cancellation and rescheduling policies before booking your appointment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation Policy Content */}
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

                    <div className="alert alert-info border-0" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
                      <h5 style={{color: '#AD6269'}} className="fw-bold mb-2">Important Notice</h5>
                      <p className="text-black mb-0">
                        We understand that sometimes circumstances change. This policy helps us maintain our schedule 
                        and provide the best service to all our clients. Please read carefully and contact us if you 
                        have any questions.
                      </p>
                    </div>

                    {/* Current Policy Text */}
                    <div className="mb-5">
                      <h2 className="h4 fw-bold mb-4" style={{color: '#AD6269', fontFamily: 'Playfair Display, serif'}}>Cancellation Policy</h2>
                      <p className="paragraph-text text-black mb-4">
                        Cancellations made with at least 48 hours' notice are eligible for a one-time rescheduling with a $50 reschedule fee. Both the initial deposit and the reschedule fee will be applied toward the total cost of your service.
                      </p>
                      <p className="paragraph-text text-black mb-4">
                        No-shows will forfeit their deposit and will be required to pay a new deposit to book a future appointment.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold mb-4" style={{color: '#AD6269'}}>Touch-Up Appointment Policy</h2>
                      <p className="paragraph-text text-black mb-4">
                        A minimum of 48 hours' notice is required to cancel or reschedule a touch-up appointment.
                      </p>
                      <p className="paragraph-text text-black mb-4">
                        A non-refundable $50 reschedule fee will apply to any approved changes. The reschedule fee and original deposit are non-refundable.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold mb-4" style={{color: '#AD6269'}}>Deposit Requirements</h2>
                      <ul className="paragraph-text text-black mb-4">
                        <li>A deposit is required to secure your appointment (percentage varies by service)</li>
                        <li>Deposits are applied toward the total cost of your service</li>
                      </ul>
                    </div>

                    {/* Additional Detailed Sections */}
                    <div className="mb-5">
                      <h2 className="h4 fw-bold mb-3" style={{color: '#AD6269'}}>Late Arrival Policy</h2>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="card border-warning">
                            <div className="card-header bg-warning text-dark">
                              <h5 className="mb-0">5-15 Minutes Late</h5>
                            </div>
                            <div className="card-body">
                              <p className="text-black mb-0">
                                Service may be shortened to accommodate the next client. Full payment still required.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card border-danger">
                            <div className="card-header text-white" style={{backgroundColor: '#AD6269'}}>
                              <h5 className="mb-0">15+ Minutes Late</h5>
                            </div>
                            <div className="card-body">
                              <p className="text-black mb-0">
                                Appointment may be cancelled and treated as a no-show. Deposit will be forfeited.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>





                    <div className="mb-5">
                      <h2 className="h4 fw-bold mb-3" style={{color: '#AD6269'}}>How to Cancel or Reschedule</h2>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light border-0">
                            <div className="card-body">
                              <h5 style={{color: '#AD6269'}} className="mb-2">📞 Phone</h5>
                              <p className="text-black mb-0">(919) 441-0932</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light border-0">
                            <div className="card-body">
                              <h5 style={{color: '#AD6269'}} className="mb-2">📧 Email</h5>
                              <p className="text-black mb-0">victoria@aprettygirlmatter.com</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="alert alert-warning border-0 mt-3">
                        <p className="text-black mb-0">
                          <strong>Important:</strong> Cancellations must be confirmed by phone or email. 
                          Text messages alone are not sufficient for cancellation confirmation.
                        </p>
                      </div>
                    </div>





                    {/* Contact Section */}
                    <div className="mb-5">
                      <h2 className="h4 fw-bold mb-3" style={{color: '#AD6269'}}>Contact Us</h2>
                      <p className="text-black mb-3">
                        If you have questions about our cancellation policy or need to discuss a special situation, 
                        please don't hesitate to contact us:
                      </p>
                      <div className="text-black">
                        <p className="mb-2"><strong>A Pretty Girl Matter, LLC</strong></p>
                        <p className="mb-2">4040 Barrett Drive Suite 3<br />Raleigh, NC 27609</p>
                        <p className="mb-2">Phone: (919) 441-0932</p>
                        <p className="mb-0">Email: victoria@aprettygirlmatter.com</p>
                      </div>
                    </div>

                    {/* Signature Section */}
                    <div className="mb-0">
                      <p className="paragraph-text text-black mb-3">Thanks,</p>
                      <div className="paragraph-text text-black">
                        <p className="mb-2"><strong>Victoria Escobar, Owner</strong></p>
                        <p className="mb-2">A Pretty Girl Matter, LLC</p>
                        <p className="mb-0">Victoria@APrettyGirlMatter.com</p>
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
