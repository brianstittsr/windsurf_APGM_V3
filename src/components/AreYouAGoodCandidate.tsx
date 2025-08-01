import Link from 'next/link';

export default function AreYouAGoodCandidate() {
  const goodCandidates = [
    {
      icon: "⏰",
      title: "Busy Lifestyle",
      description: "You want to save time on your daily makeup routine"
    },
    {
      icon: "🏊‍♀️",
      title: "Active Person",
      description: "You enjoy swimming, working out, or outdoor activities"
    },
    {
      icon: "👁️",
      title: "Vision Challenges",
      description: "You have difficulty applying makeup due to vision issues"
    },
    {
      icon: "💧",
      title: "Sparse Features",
      description: "You have thin eyebrows, pale lips, or want defined eyes"
    },
    {
      icon: "✈️",
      title: "Frequent Traveler",
      description: "You travel often and want to look put-together anywhere"
    },
    {
      icon: "💄",
      title: "Makeup Lover",
      description: "You love the look of makeup but want a natural base"
    }
  ];

  const considerations = [
    {
      icon: "🤱",
      title: "Pregnancy & Nursing",
      description: "We recommend waiting until after breastfeeding"
    },
    {
      icon: "💊",
      title: "Certain Medications",
      description: "Blood thinners and some medications may affect healing"
    },
    {
      icon: "🩺",
      title: "Medical Conditions",
      description: "Diabetes, autoimmune disorders require medical clearance"
    },
    {
      icon: "🌞",
      title: "Recent Sun Exposure",
      description: "Avoid tanning 2 weeks before and after treatment"
    }
  ];

  return (
    <section className="py-section bg-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="display-2 fw-bold text-dark mb-4">
            Are You A Good
            <span className="text-rose-600"> Candidate?</span>
          </h2>
          <p className="fs-5 text-secondary mx-auto" style={{maxWidth: '48rem'}}>
            Permanent makeup is perfect for many people, but it&apos;s important to understand 
            if you&apos;re a good candidate for the procedure.
          </p>
        </div>

        {/* Perfect Candidates Section */}
        <div className="mb-5">
          <div className="d-flex align-items-center mb-4">
            <div className="d-flex align-items-center justify-content-center me-3 bg-success bg-opacity-10 rounded-circle" style={{width: '2.5rem', height: '2.5rem'}}>
              <svg className="text-success" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="h3 fw-bold text-dark mb-0">Perfect Candidates</h3>
          </div>

          <div className="row g-3">
            {goodCandidates.map((candidate, index) => (
              <div key={index} className="col-lg-6">
                <div className="d-flex align-items-start p-3 bg-success bg-opacity-10 rounded-custom">
                  <div className="me-3" style={{fontSize: '1.2rem'}}>{candidate.icon}</div>
                  <div>
                    <h5 className="fw-semibold text-dark mb-1">{candidate.title}</h5>
                    <p className="text-secondary mb-0 small">{candidate.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Considerations Section */}
        <div className="mb-5">
          <div className="d-flex align-items-center mb-4">
            <div className="d-flex align-items-center justify-content-center me-3 bg-warning bg-opacity-10 rounded-circle" style={{width: '2.5rem', height: '2.5rem'}}>
              <svg className="text-warning" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="h3 fw-bold text-dark mb-0">Important Considerations</h3>
          </div>

          <div className="row g-3">
            {considerations.map((consideration, index) => (
              <div key={index} className="col-lg-6">
                <div className="d-flex align-items-start p-3 bg-warning bg-opacity-10 rounded-custom">
                  <div className="me-3" style={{fontSize: '1.2rem'}}>{consideration.icon}</div>
                  <div>
                    <h5 className="fw-semibold text-dark mb-1">{consideration.title}</h5>
                    <p className="text-secondary mb-0 small">{consideration.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Requirements */}
        <div className="mt-5 bg-gradient-rose rounded-custom-lg p-4">
          <div className="text-center">
            <h3 className="h3 fw-bold text-dark mb-3">Age Requirements</h3>
            <p className="text-secondary mb-0">
              You must be at least 18 years old for permanent makeup procedures. 
              For clients under 21, parental consent may be required.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-5 text-center">
          <div className="bg-white border border-primary border-opacity-25 rounded-custom-lg p-4 mx-auto" style={{maxWidth: '64rem'}}>
            <h3 className="h3 fw-bold text-dark mb-3">
              Still Not Sure If You&apos;re A Good Candidate?
            </h3>
            <p className="text-secondary mb-4">
              Take our quick candidacy assessment to discover if microblading is right for you! 
              This simple evaluation will help determine your readiness based on your lifestyle, health, and beauty goals.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <Link href="/candidate-assessment" className="btn btn-primary rounded-pill px-4 fw-semibold">
                Am I Good Candidate
              </Link>
              <button className="btn btn-outline-primary rounded-pill px-4 fw-semibold">
                Book Now
              </button>
              <button className="btn btn-outline-secondary rounded-pill px-4 fw-semibold">
                Call Us: (919) 441-0932
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
