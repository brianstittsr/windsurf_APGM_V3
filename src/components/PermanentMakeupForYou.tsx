import Link from 'next/link';

export default function PermanentMakeupForYou() {

  return (
    <section id="services" className="py-section bg-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="main-heading fw-bold text-dark mb-4">
            <span className="text-rose-600">SEMI-PERMANENT MAKEUP</span>
            <br />
            DESIGNED JUST FOR YOU
          </h2>
        </div>

        {/* 2-Column Layout */}
        <div className="row g-5 align-items-center">
          {/* Left Side - Before/After Image */}
          <div className="col-lg-6">
            <div className="position-relative" style={{ height: '400px' }}>
              <img
                src="/images/before-after.png"
                alt="Before and After semi-permanent makeup transformation"
                className="w-100 h-100 img-fluid rounded-custom-lg shadow-custom-lg"
                style={{
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
          
          {/* Right Side - Text Content */}
          <div className="col-lg-6">
            <p className="paragraph-text text-secondary mb-3">
              soft or natural to bold and defined...
            </p>
            <h2 className="sub-heading fw-bold text-dark mb-4">
              THE CHOICE IS <span className="text-primary">YOURS</span>
            </h2>
            <p className="paragraph-text text-secondary lh-base">
              Forget the outdated idea that semi-permanent makeup has to look dark or harsh. At A Pretty Girl Matter, every look is customized to your style and preferences, whether you want a subtle, natural finish or a striking, statement look.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-5">
          <div className="rounded-custom-lg p-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
            <h3 className="sub-heading fw-bold text-dark mb-4">
              Not sure which service is right for you?
            </h3>
            <p className="paragraph-text text-secondary mb-4">
              Book now to complete your free online consultation, and let&apos;s explore the best options tailored to your unique features and lifestyle.
            </p>
            <Link href="/book-now-custom" className="btn btn-primary rounded-pill px-4 fw-semibold book-now-text">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
