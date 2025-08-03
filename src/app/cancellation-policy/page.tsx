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
                    <div className="mb-5">
                      <h2 className="h4 fw-bold mb-4" style={{color: '#AD6269'}}>Cancellation Policy</h2>
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
                        <li>A deposit of $200 is required to secure your appointment</li>
                        <li>Deposits are applied toward the total cost of your service</li>
                      </ul>
                    </div>

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
