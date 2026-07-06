import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Heart,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  X,
  Zap,
} from "lucide-react";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const features = [
    {
      icon: <CalendarCheck size={24} />,
      title: "Fast booking",
      desc: "Find verified doctors and lock in appointments without the usual back-and-forth.",
      accent: "var(--brand)",
      tone: "var(--brand-soft)",
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Live consultation",
      desc: "Move from booking to video care with clear patient and doctor workflows.",
      accent: "var(--teal)",
      tone: "var(--teal-soft)",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Secure records",
      desc: "Prescriptions, appointment history, and medical notes stay organized and protected.",
      accent: "var(--gold)",
      tone: "var(--gold-soft)",
    },
    {
      icon: <Sparkles size={24} />,
      title: "Simple experience",
      desc: "A cleaner interface built for patients, doctors, and admins without visual clutter.",
      accent: "var(--rose)",
      tone: "var(--rose-soft)",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create your account",
      text: "Register in a minute and choose your role.",
    },
    {
      number: "02",
      title: "Pick a specialist",
      text: "Browse doctors by specialty, location, and availability.",
    },
    {
      number: "03",
      title: "Book a slot",
      text: "Choose a date and time, then confirm instantly.",
    },
    {
      number: "04",
      title: "Start your care",
      text: "Join the consultation, get prescriptions, and follow up later.",
    },
  ];

  const stats = [
    { value: "10k+", label: "Patients served" },
    { value: "500+", label: "Doctors onboarded" },
    { value: "24/7", label: "Care support" },
    { value: "98%", label: "Satisfaction" },
  ];

  const testimonials = [
    {
      quote:
        "Booking a specialist used to take days. Now I schedule my appointment and consult the same afternoon.",
      name: "Sarah Ahmed",
      role: "Patient",
    },
    {
      quote:
        "Managing my patient schedule and issuing prescriptions online has made my practice far more efficient.",
      name: "Dr. Ali Khan",
      role: "Doctor",
    },
    {
      quote:
        "From consultation to medicine delivery, everything my family needs is available on one platform.",
      name: "Fatima Noor",
      role: "Patient",
    },
  ];

  const renderImage = (
    key,
    src,
    alt,
    className,
    fallbackTitle,
    fallbackText,
  ) => {
    if (brokenImages[key]) {
      return (
        <div className={`${className} image-fallback`}>
          <div className="image-fallback-badge">{fallbackTitle}</div>
          <strong>{alt}</strong>
          <span>{fallbackText}</span>
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="eager"
        onError={() => setBrokenImages((prev) => ({ ...prev, [key]: true }))}
      />
    );
  };

  return (
    <div className="home-shell">
      <header className={`home-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="home-container home-nav-inner">
          <button
            type="button"
            className="home-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Go to top"
          >
            <span className="home-brand-mark">
             <Stethoscope size={20} color="#fff" />
            </span>
            <span>
              <strong>Telemedicine</strong>
              <small>Digital health, reimagined</small>
            </span>
          </button>

          <button
            type="button"
            className="home-menu-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={`home-nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#workflow" onClick={() => setMenuOpen(false)}>
              Workflow
            </a>
            <a href="#stories" onClick={() => setMenuOpen(false)}>
              Stories
            </a>
            <div className="home-nav-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/signup")}
              >
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="home-container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <Zap size={14} /> Designed for modern care
              </div>
              <h1>
                Healthcare that feels <span>clear, calm, and premium</span>.
              </h1>
              <p className="hero-text">
                Connect with verified doctors, book appointments in minutes,
                and get medicines delivered to your door — all through one
                trusted telemedicine platform.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-large"
                  onClick={() => navigate("/signup")}
                >
                  Create account <ArrowRight size={18} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-large"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </button>
              </div>

              <div className="hero-metrics">
                {stats.map((item) => (
                  <div key={item.label} className="metric-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-frame">
                {renderImage(
                  "hero",
                  "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1200&q=80",
                  "Doctor consultation",
                  "visual-main-image",
                  "Live care",
                  "Fallback view when the remote image is blocked",
                )}
                <div className="visual-overlay-card top-left">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>Appointments</strong>
                    <span>Controlled and verified</span>
                  </div>
                </div>
                <div className="visual-overlay-card top-right">
                  <Clock3 size={18} />
                  <div>
                    <strong>Quick access</strong>
                    <span>Book in minutes</span>
                  </div>
                </div>
                <div className="visual-overlay-card bottom-right">
                  <Award size={18} />
                  <div>
                    <strong>Trusted care</strong>
                    <span>Verified specialists</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-strip">
          <div className="home-container feature-grid" id="features">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div
                  className="feature-icon"
                  style={{
                    backgroundColor: feature.tone,
                    color: feature.accent,
                  }}
                >
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="image-story-section">
          <div className="home-container image-story-grid">
            <div className="story-copy">
              <div className="section-label">Complete hospital services</div>
              <h2>
                Everything your health needs, in one connected platform.
              </h2>
              <p>
                From online consultations to lab tests, prescriptions, and
                medicine delivery, our platform brings hospital-grade care
                directly to your home.
              </p>
              <ul className="story-list">
                <li>
                  <CheckCircle2 size={18} /> Verified doctors across every
                  specialty
                </li>
                <li>
                  <CheckCircle2 size={18} /> Video consultations and
                  e-prescriptions
                </li>
                <li>
                  <CheckCircle2 size={18} /> Medicine delivery and lab test
                  booking
                </li>
              </ul>
            </div>

            <div className="story-gallery">
              {renderImage(
                "storyLarge",
                "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
                "Patient consultation",
                "story-image large",
                "Consultation",
                "Fallback when the image cannot load",
              )}
              {renderImage(
                "storyLeft",
                "https://images.unsplash.com/photo-1580281657527-47f249e8f176?auto=format&fit=crop&w=900&q=80",
                "Medical professional",
                "story-image small-left",
                "Specialist",
                "Reliable care visuals",
              )}
              {renderImage(
                "storyRight",
                "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=900&q=80",
                "Healthcare team",
                "story-image small-right",
                "Team care",
                "Support across the platform",
              )}
            </div>
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="home-container">
            <div className="section-heading">
              <div className="section-label">Workflow</div>
              <h2>Simple steps, clear experience.</h2>
              <p>
                A straightforward path from sign-up to consultation, so
                patients and doctors can focus on care instead of paperwork.
              </p>
            </div>

            <div className="workflow-grid">
              {steps.map((step) => (
                <article key={step.number} className="workflow-card">
                  <span className="workflow-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="stories-section" id="stories">
          <div className="home-container">
            <div className="section-heading compact">
              <div className="section-label">Testimonials</div>
              <h2>Trusted by patients and doctors alike.</h2>
            </div>

            <div className="testimonial-grid">
              {testimonials.map((item, index) => (
                <blockquote key={item.name} className="testimonial-card">
                  <div className="stars">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p>“{item.quote}”</p>
                  <footer>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </footer>
                  <div
                    className="testimonial-accent"
                    style={{
                      background: [
                        "var(--brand)",
                        "var(--teal)",
                        "var(--gold)",
                      ][index],
                    }}
                  />
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="home-container cta-card">
            <div>
              <div className="section-label light">Now Live</div>
              <h2>Healthcare made simple, one tap away.</h2>
              <p>
                Book trusted doctors, order medicines, and manage your family's
                health — all from a single, secure telemedicine platform built
                around you.
              </p>
            </div>
            <div className="cta-actions">
              <button
                type="button"
                className="btn btn-primary btn-large"
                onClick={() => navigate("/signup")}
              >
                Create account <ArrowRight size={18} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-large"
                onClick={() => navigate("/login")}
              >
                Open dashboard
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-container footer-grid">
          <div>
            <div className="home-brand footer-brand">
              <span className="home-brand-mark">
              <Stethoscope size={20} color="#fff" />
              </span>
              <span>
                <strong>Telemedicine</strong>
                <small>Modern care platform</small>
              </span>
            </div>
            <p>
              Explore a full range of hospital services — from doctor
              consultations and telemedicine to lab tests, medicine delivery,
              and emergency care — all easily accessible in one place.
            </p>
          </div>
          <div>
            <h4>Navigate</h4>
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#stories">Testimonials</a>
          </div>
          <div>
            <h4>Account</h4>
            <button type="button" onClick={() => navigate("/login")}>
              Sign in
            </button>
            <button type="button" onClick={() => navigate("/signup")}>
              Get started
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
