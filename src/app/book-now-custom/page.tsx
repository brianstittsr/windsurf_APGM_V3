'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useState } from 'react';

interface Service {
  name: string;
  price: string;
  description: string;
  image: string;
}

interface HealthFormData {
  [key: string]: string;
}

export default function BookNowCustom() {
  const [currentStep, setCurrentStep] = useState<'services' | 'calendar' | 'health'>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [healthFormData, setHealthFormData] = useState<HealthFormData>({});

  const services: Service[] = [
    {
      name: "Powder Eyebrows",
      price: "$600.00",
      description: "Powder brows offer a semi-permanent cosmetic tattoo solution that delivers soft, shaded, and natural-looking eyebrows, replicating the effect of makeup. This technique results in a smooth, gradient finish, enhancing the fullness and definition of your brows with a subtle ombré effect that transitions from lighter at the front to darker at the tail.",
      image: "/images/services/powder-brows.jpg"
    },
    {
      name: "Microbladed Eyebrows",
      price: "$600.00",
      description: "Microblading is a precise technique that creates fine, hair-like strokes to enhance the natural appearance of your eyebrows. This service is perfect for clients seeking a subtle and textured brow look that frames the face beautifully and reduces the need for daily makeup application.",
      image: "/images/services/microblading.jpg"
    },
    {
      name: "Bold Combo Eyebrows",
      price: "$707.85",
      description: "Experience the perfect blend of artistry with our Permanent Makeup - Eyebrow/Bold Combo, combining microbladed strokes for natural texture and shaded areas for enhanced definition. This technique delivers a striking and dramatic eyebrow look that lasts, allowing you to wake up with perfectly defined brows every day.",
      image: "/images/services/bold-combo.jpg"
    },
    {
      name: "Blade and Shade Eyebrows",
      price: "$640.00",
      description: "Experience the perfect blend of artistry with our Permanent Makeup - Eyebrows service, incorporating both microbladed strokes for added texture and a shaded body and tail for enhanced definition. This technique yields a soft, natural look that beautifully frames your face and simplifies your beauty routine.",
      image: "/images/services/blade-shade.jpg"
    },
    {
      name: "Ombre Eyebrows",
      price: "$620.00",
      description: "Ombré powder brows create a soft, airy look or a more intense, defined appearance based on your preferences. This technique uses shading to achieve a natural brow that enhances your facial features beautifully.",
      image: "/images/services/ombre-brows.jpg"
    },
    {
      name: "Combo Eyebrows",
      price: "Starting at $640.00",
      description: "Combo brows combine the precision of microbladed strokes with a shaded body and tail, creating a beautifully defined and textured look. This technique offers the benefits of both styles, providing fullness and depth to your eyebrows while maintaining a natural appearance.",
      image: "/images/services/combo-brows.jpg"
    },
    {
      name: "Eyebrow Colour Corrector",
      price: "$395.00",
      description: "This service specializes in neutralizing unwanted tones from old permanent eyebrow makeup, such as red, blue, or gray, restoring them to a soft, natural shade. Please note that this session focuses solely on correction and does not include reshaping or new brow designs, and may be necessary before pursuing a new brow style.",
      image: "/images/services/color-corrector.jpg"
    },
    {
      name: "Annual Touch-Up Combo Colorboost",
      price: "$395.00",
      description: "Refresh and revive your brows with a Combo Colorboost! This service is designed to enhance and maintain the color and shape of previously done microblading, ombré, or combo brows. Perfect for clients who are 6–8 months out from their initial brow service or last touch-up, it helps restore pigment, improve definition, and keep your brows looking fresh and polished.",
      image: "/images/services/touch-up.jpg"
    },
    {
      name: "Permanent Makeup - Lip Liner Designer",
      price: "$120.00",
      description: "Professional lip liner application for enhanced definition and shape.",
      image: "/images/services/lip-liner.jpg"
    },
    {
      name: "Permanent Makeup - Lip Liner Corrective",
      price: "$45.00",
      description: "Corrective lip liner service to fix and enhance existing work.",
      image: "/images/services/lip-corrective.jpg"
    },
    {
      name: "Tiny Tattoo",
      price: "$100.00",
      description: "Tiny Tattoo specializes in creating small, meaningful designs that capture personal significance through fine line artistry. With a size limit of up to 2 inches, clients can upload their exact design or inspiration images when booking to ensure a personalized experience.",
      image: "/images/services/tiny-tattoo.jpg"
    }
  ];

  const healthQuestions = [
    "Do you have any known allergic reactions or sensitivities to any topical or local anesthetics?",
    "Do you have any allergies (i.e. Polysporin, Bacitracin, Neosporin, Latex, etc.)?",
    "Are you allergic to lidocaine or any other numbing agents?",
    "Are you currently pregnant or breast-feeding?",
    "Do you bruise easily?",
    "Do you have any heart conditions or high blood pressure?",
    "Do you have or do you think it is possible that you have any blood borne communicable disease such as HIV or Hepatitis?",
    "Do you have any serious medical conditions?",
    "Does your skin swell easily?",
    "Do you have diabetes, currently on any form of immunosuppressant therapy or any condition that may delay healing?",
    "Do you have any known personal history or family history of Methemoglobinemia?",
    "Have you ever had a Herpes Simplex Type I infection?",
    "Do you use Retin A or Hydroxyl (Glycolic) Acid preparations?",
    "Are you prone to Keloid scarring, hypertrophic scarring or any other form of excessive scarring condition?",
    "Do you suffer from any form of Hyperpigmentary skin condition?",
    "Do you have a bleeding disorder or take blood thinners?",
    "Are you allergic to any sensitive metals?",
    "Have you had any form of cosmetic or surgical procedures, Radiotherapy or Chemotherapy at any time within the last 6 months? (Botox, injections, laser therapies, facelifts, etc.)?"
  ];

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep('calendar');
  };

  const handleDateTimeSelect = (dateTime: string) => {
    setSelectedDateTime(dateTime);
    setCurrentStep('health');
  };

  const handleHealthFormChange = (questionIndex: number, value: string) => {
    setHealthFormData(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleHealthFormSubmit = () => {
    // Handle form submission
    console.log('Booking completed:', {
      service: selectedService,
      dateTime: selectedDateTime,
      healthForm: healthFormData
    });
    alert('Booking completed successfully!');
  };

  // Services Grid Component
  const ServicesGrid = () => (
    <>
      {/* Hero Section */}
      <section className="py-5 bg-light" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold text-dark mb-4">
                Our <span className="text-primary">Services</span>
              </h1>
              <p className="fs-5 text-black mb-5">
                Choose from our comprehensive range of permanent makeup services. 
                Each service is performed with precision and artistry to enhance your natural beauty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Cards Section */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {services.map((service, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="card h-100 shadow-sm border-0">
                  <div className="position-relative">
                    <Image 
                      src={service.image} 
                      className="card-img-top" 
                      alt={service.name}
                      width={400}
                      height={250}
                      style={{ height: '250px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x250/AD6269/FFFFFF?text=' + encodeURIComponent(service.name);
                      }}
                    />
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-primary fs-6 px-3 py-2">
                        {service.price}
                      </span>
                    </div>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold text-dark mb-3">{service.name}</h5>
                    <p className="card-text text-black flex-grow-1 lh-base">
                      {service.description}
                    </p>
                    <button 
                      className="btn btn-primary mt-3 fw-semibold"
                      onClick={() => handleServiceSelect(service)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  // Calendar Component
  const CalendarComponent = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const availableDates = [
      '2025-08-05', '2025-08-06', '2025-08-07', '2025-08-08', '2025-08-09',
      '2025-08-12', '2025-08-13', '2025-08-14', '2025-08-15', '2025-08-16'
    ];

    const availableTimes = [
      '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];

    const handleConfirmDateTime = () => {
      if (selectedDate && selectedTime) {
        handleDateTimeSelect(`${selectedDate} at ${selectedTime}`);
      }
    };

    return (
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow border-0">
                <div className="card-header bg-primary text-center">
                  <h3 className="text-white mb-0">Schedule Your Appointment</h3>
                </div>
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h4 className="text-dark">{selectedService?.name}</h4>
                    <p className="fs-5 fw-bold text-primary">{selectedService?.price}</p>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <h5 className="text-dark mb-3">Select Date</h5>
                      <div className="row g-2">
                        {availableDates.map((date) => (
                          <div key={date} className="col-6">
                            <button
                              className={`btn w-100 ${selectedDate === date ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => setSelectedDate(date)}
                            >
                              {new Date(date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-md-6 mb-4">
                      <h5 className="text-dark mb-3">Select Time</h5>
                      <div className="row g-2">
                        {availableTimes.map((time) => (
                          <div key={time} className="col-6">
                            <button
                              className={`btn w-100 ${selectedTime === time ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-3 justify-content-center">
                    <button 
                      className="btn btn-outline-secondary px-4"
                      onClick={() => setCurrentStep('services')}
                    >
                      Back to Services
                    </button>
                    <button 
                      className="btn btn-primary px-4 fw-semibold"
                      onClick={handleConfirmDateTime}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Continue to Health Form
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Health Form Component
  const HealthFormComponent = () => {
    const [currentSignature, setCurrentSignature] = useState('');
    const employeeSignature = 'Victoria Martinez';

    return (
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card shadow border-0">
                <div className="card-header bg-primary text-center">
                  <h3 className="text-white mb-0">CLIENT HEALTH FORM</h3>
                </div>
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <h4 className="text-dark">{selectedService?.name}</h4>
                    <p className="text-black">Appointment: {selectedDateTime}</p>
                  </div>

                  <form>
                    {healthQuestions.map((question, index) => (
                      <div key={index} className="mb-4">
                        <label className="form-label text-dark fw-semibold">
                          {index + 1}. {question}
                        </label>
                        <div className="d-flex gap-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`question-${index}`}
                              id={`question-${index}-yes`}
                              value="yes"
                              onChange={(e) => handleHealthFormChange(index, e.target.value)}
                            />
                            <label className="form-check-label text-black" htmlFor={`question-${index}-yes`}>
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`question-${index}`}
                              id={`question-${index}-no`}
                              value="no"
                              onChange={(e) => handleHealthFormChange(index, e.target.value)}
                            />
                            <label className="form-check-label text-black" htmlFor={`question-${index}-no`}>
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-top pt-4 mt-5">
                      <div className="mb-4">
                        <p className="text-black small lh-base">
                          The UNDERSIGNED acknowledges that A Pretty Girl Matter, LLC has explained the nature of procedure, including the risks and dangers inherent therein. I HEREBY CONSENT A Pretty Girl Matter, LLC to perform eyebrow microblading treatment and its procedures on me and in consideration of her doing so, I hereby release and forever discharge A Pretty Girl Matter, LLC from all demands, damages, actions or causes of action arising out of the performance of the said treatment procedures, which I, my heirs, executors, administrators or assign can, shall or may have. No refund on any treatment. I accept the above colour, design, and payment terms in this contract. I hereby consent to A Pretty Girl Matter, LLC to take photographs of the undersigned both before and after any procedures being undertaken by A Pretty Girl Matter, LLC at the request of the undersigned. It is further acknowledged that the undersigned authorizes A Pretty Girl Matter, LLC to use such photographs in compiling albums of its various clients for the purposes of showing potential clients the procedures completed.
                        </p>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-dark fw-semibold">Customer&apos;s Signature</label>
                          <input
                            type="text"
                            className="form-control"
                            value={currentSignature}
                            onChange={(e) => setCurrentSignature(e.target.value)}
                            placeholder="Type your full name"
                          />
                          <small className="text-muted">I agree to use electronic records and signatures.</small>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-dark fw-semibold">Employee&apos;s Signature</label>
                          <input
                            type="text"
                            className="form-control"
                            value={employeeSignature}
                            readOnly
                          />
                          <small className="text-muted">Date: {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</small>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-3 justify-content-center mt-4">
                      <button 
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={() => setCurrentStep('calendar')}
                      >
                        Back to Calendar
                      </button>
                      <button 
                        type="button"
                        className="btn btn-primary px-4 fw-semibold"
                        onClick={handleHealthFormSubmit}
                        disabled={!currentSignature || Object.keys(healthFormData).length < healthQuestions.length}
                      >
                        Complete Booking
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 pt-header">
        {currentStep === 'services' && <ServicesGrid />}
        {currentStep === 'calendar' && <CalendarComponent />}
        {currentStep === 'health' && <HealthFormComponent />}
      </main>

      <Footer />
    </div>
  );
}
