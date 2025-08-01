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
                      <h5 className="text-primary fw-bold mb-2">Important Notice</h5>
                      <p className="text-black mb-0">
                        We understand that sometimes circumstances change. This policy helps us maintain our schedule 
                        and provide the best service to all our clients. Please read carefully and contact us if you 
                        have any questions.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">1. Advance Notice Requirements</h2>
                      <div className="row">
                        <div className="col-md-6 mb-4">
                          <div className="card border-primary">
                            <div className="card-header bg-primary text-white">
                              <h5 className="mb-0">Initial Appointments</h5>
                            </div>
                            <div className="card-body">
                              <p className="text-black mb-2"><strong>Minimum Notice:</strong> 48 hours</p>
                              <p className="text-black mb-0">
                                Cancellations made with at least 48 hours notice will receive a full refund of any deposit paid.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-4">
                          <div className="card border-primary">
                            <div className="card-header bg-primary text-white">
                              <h5 className="mb-0">Touch-Up Appointments</h5>
                            </div>
                            <div className="card-body">
                              <p className="text-black mb-2"><strong>Minimum Notice:</strong> 24 hours</p>
                              <p className="text-black mb-0">
                                Touch-up appointments require 24 hours notice for cancellation without penalty.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">2. Deposit and Payment Policy</h2>
                      <div className="mb-4">
                        <h5 className="fw-semibold text-dark mb-2">Deposit Requirements</h5>
                        <ul className="text-black mb-3">
                          <li>A deposit of $100-$200 may be required to secure your appointment</li>
                          <li>Deposits are applied toward the total cost of your service</li>
                          <li>Deposits are fully refundable with proper cancellation notice</li>
                        </ul>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="fw-semibold text-dark mb-2">Late Cancellation Fees</h5>
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <thead className="table-light">
                              <tr>
                                <th className="text-dark">Notice Given</th>
                                <th className="text-dark">Penalty</th>
                                <th className="text-dark">Deposit Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="text-black">48+ hours</td>
                                <td className="text-success fw-semibold">No penalty</td>
                                <td className="text-success">Full refund</td>
                              </tr>
                              <tr>
                                <td className="text-black">24-47 hours</td>
                                <td className="text-warning fw-semibold">50% deposit forfeit</td>
                                <td className="text-warning">Partial refund</td>
                              </tr>
                              <tr>
                                <td className="text-black">Less than 24 hours</td>
                                <td className="text-danger fw-semibold">100% deposit forfeit</td>
                                <td className="text-danger">No refund</td>
                              </tr>
                              <tr>
                                <td className="text-black">No-show</td>
                                <td className="text-danger fw-semibold">100% deposit forfeit + $50 fee</td>
                                <td className="text-danger">No refund</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">3. Rescheduling Policy</h2>
                      <div className="mb-4">
                        <h5 className="fw-semibold text-dark mb-2">Free Rescheduling</h5>
                        <ul className="text-black mb-3">
                          <li>One free reschedule allowed with 48+ hours notice</li>
                          <li>Must be rescheduled within 30 days of original appointment</li>
                          <li>Subject to availability</li>
                        </ul>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="fw-semibold text-dark mb-2">Additional Rescheduling</h5>
                        <ul className="text-black">
                          <li>Second reschedule: $25 fee</li>
                          <li>Third reschedule: $50 fee</li>
                          <li>More than 3 reschedules: New deposit required</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">4. Emergency Situations</h2>
                      <p className="text-black mb-3">
                        We understand that emergencies happen. The following situations may qualify for waived cancellation fees:
                      </p>
                      <ul className="text-black mb-3">
                        <li>Medical emergencies (documentation may be required)</li>
                        <li>Death in the immediate family</li>
                        <li>Severe weather conditions</li>
                        <li>Car accidents or breakdowns</li>
                      </ul>
                      <p className="text-black">
                        Emergency situations will be reviewed on a case-by-case basis. Please contact us as soon as possible 
                        to discuss your situation.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">5. Artist-Initiated Cancellations</h2>
                      <p className="text-black mb-3">
                        If we need to cancel your appointment due to:
                      </p>
                      <ul className="text-black mb-3">
                        <li>Artist illness or emergency</li>
                        <li>Equipment malfunction</li>
                        <li>Facility issues</li>
                        <li>Severe weather</li>
                      </ul>
                      <p className="text-black">
                        You will receive a full refund of any payments made, and we will work with you to reschedule 
                        at your earliest convenience with priority booking.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">6. Health-Related Cancellations</h2>
                      <div className="mb-4">
                        <h5 className="fw-semibold text-dark mb-2">Client Health Issues</h5>
                        <p className="text-black mb-3">
                          If you develop any of the following conditions before your appointment, please reschedule:
                        </p>
                        <ul className="text-black mb-3">
                          <li>Cold, flu, or any illness</li>
                          <li>Skin irritation or infection in the treatment area</li>
                          <li>Recent Botox or facial treatments (within 2 weeks)</li>
                          <li>Pregnancy (if discovered after booking)</li>
                          <li>New medications that may affect healing</li>
                        </ul>
                        <p className="text-black">
                          Health-related cancellations made for the safety of all clients will not incur penalties.
                        </p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">7. How to Cancel or Reschedule</h2>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light border-0">
                            <div className="card-body">
                              <h5 className="text-primary mb-2">📞 Phone</h5>
                              <p className="text-black mb-0">(919) 441-0932</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card bg-light border-0">
                            <div className="card-body">
                              <h5 className="text-primary mb-2">📧 Email</h5>
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

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">8. Refund Processing</h2>
                      <ul className="text-black">
                        <li>Refunds will be processed within 5-7 business days</li>
                        <li>Refunds will be issued to the original payment method</li>
                        <li>Cash payments will be refunded by check or cash</li>
                        <li>Credit card refunds may take 1-2 billing cycles to appear</li>
                      </ul>
                    </div>

                    <div className="mb-5">
                      <h2 className="h4 fw-bold text-primary mb-3">9. Repeat Offenders</h2>
                      <p className="text-black">
                        Clients with a pattern of late cancellations or no-shows may be required to:
                      </p>
                      <ul className="text-black">
                        <li>Pay in full at the time of booking</li>
                        <li>Provide a larger deposit</li>
                        <li>Be placed on a restricted booking list</li>
                      </ul>
                    </div>

                    <div className="mb-0">
                      <h2 className="h4 fw-bold text-primary mb-3">10. Contact Us</h2>
                      <p className="text-black mb-3">
                        If you have questions about our cancellation policy or need to discuss a special situation, 
                        please don&apos;t hesitate to contact us:
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
