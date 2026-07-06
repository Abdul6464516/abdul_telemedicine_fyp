import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authActions";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Heart,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
  UserPlus,
  Loader2,
} from "lucide-react";
import "./auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
const phoneRegex = /^\d{11}$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(3, "Full name must be at least 3 characters"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .regex(usernameRegex, "Username can contain letters, numbers, dot, underscore, and dash"),
    email: z.string().trim().min(1, "Email is required").regex(emailRegex, "Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(strongPasswordRegex, "Password must include uppercase, lowercase, and a number"),
    role: z.enum(["patient", "doctor"]),
    age: z.string().optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    medicalHistory: z.string().max(500, "Medical history should be under 500 characters").optional().or(z.literal("")),
    city: z.string().optional(),
    specialty: z.string().optional(),
    qualifications: z.string().optional(),
    yearsOfExperience: z.string().optional(),
    availability: z.string().optional(),
    chargesPerSession: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "patient") {
      const ageNum = Number(data.age);
      if (!data.age || Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Age must be between 1 and 120", path: ["age"] });
      }
      if (!data.gender) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Gender is required", path: ["gender"] });
      }
      if (!data.phone || !phoneRegex.test(data.phone)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number must be exactly 11 digits", path: ["phone"] });
      }
      if (!data.city || data.city.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required", path: ["city"] });
      }
    }

    if (data.role === "doctor") {
      if (!data.specialty || data.specialty.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specialty is required", path: ["specialty"] });
      }
      if (!data.gender) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Gender is required", path: ["gender"] });
      }
      if (!data.phone || !phoneRegex.test(data.phone)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number must be exactly 11 digits", path: ["phone"] });
      }
      if (!data.qualifications || data.qualifications.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Qualifications are required", path: ["qualifications"] });
      }
      const exp = Number(data.yearsOfExperience);
      if (!data.yearsOfExperience || Number.isNaN(exp) || exp < 0 || exp > 60) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Experience must be between 0 and 60 years", path: ["yearsOfExperience"] });
      }
      const fee = Number(data.chargesPerSession);
      if (!data.chargesPerSession || Number.isNaN(fee) || fee <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Session fee must be a positive number", path: ["chargesPerSession"] });
      }
      if (!data.availability || data.availability.trim().length < 3) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Availability is required", path: ["availability"] });
      }
      if (!data.city || data.city.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required", path: ["city"] });
      }
    }
  });

const roleCards = [
  { value: "patient", label: "Patient", subtitle: "Book appointments", icon: <User size={18} /> },
  { value: "doctor", label: "Doctor", subtitle: "Manage care", icon: <Stethoscope size={18} /> },
];

const perks = [
  { icon: <CheckCircle size={16} />, label: "Free to sign up" },
  { icon: <ShieldCheck size={16} />, label: "Protected records" },
  { icon: <Award size={16} />, label: "Trusted workflow" },
  { icon: <Clock size={16} />, label: "Fast onboarding" },
];

const SignUp = () => {
  const navigate = useNavigate();
  const { loginUserContext } = useUser();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [step, setStep] = useState(1);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      role: "patient",
      age: "",
      gender: "",
      phone: "",
      medicalHistory: "",
      city: "",
      specialty: "",
      qualifications: "",
      yearsOfExperience: "",
      availability: "",
      chargesPerSession: "",
    },
  });

  const formData = watch();

  const handleSignup = async (values) => {
    setServerError("");
    setLoading(true);

    try {
      const payload = {
        fullName: values.fullName.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      };

      if (values.role === "patient") {
        Object.assign(payload, {
          age: values.age,
          gender: values.gender,
          phone: values.phone,
          medicalHistory: values.medicalHistory,
          city: values.city,
        });
      } else {
        Object.assign(payload, {
          gender: values.gender,
          phone: values.phone,
          specialty: values.specialty,
          qualifications: values.qualifications,
          yearsOfExperience: values.yearsOfExperience,
          availability: values.availability,
          chargesPerSession: values.chargesPerSession,
          city: values.city,
        });
      }

      const data = await registerUser(payload);

      if (data.user.verificationStatus === "pending") {
        setVerificationMessage(`Your ${data.user.role} account has been created successfully. Please wait for administrator verification before signing in.`);
        setShowVerificationModal(true);
        return;
      }

      loginUserContext(data.token, data.user);
      toast.success(`${values.username} has created account`);
      setTimeout(() => {
        if (data.user.role === "patient") navigate("/patient");
        else if (data.user.role === "doctor") navigate("/doctor");
      }, 800);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canGoStep2 =
    formData.fullName?.trim()?.length >= 3 &&
    usernameRegex.test(formData.username || "") &&
    emailRegex.test(formData.email || "") &&
    strongPasswordRegex.test(formData.password || "");

  const canSubmitRoleFields =
    (formData.role === "patient" &&
      Number(formData.age) >= 1 &&
      Number(formData.age) <= 120 &&
      !!formData.gender &&
      phoneRegex.test(formData.phone || "") &&
      !!formData.city?.trim()) ||
    (formData.role === "doctor" &&
      !!formData.specialty?.trim() &&
      !!formData.gender &&
      phoneRegex.test(formData.phone || "") &&
      !!formData.qualifications?.trim() &&
      Number(formData.yearsOfExperience) >= 0 &&
      Number(formData.yearsOfExperience) <= 60 &&
      Number(formData.chargesPerSession) > 0 &&
      !!formData.availability?.trim() &&
      !!formData.city?.trim());

  const inputWrapClass = (name) => {
    const classes = ["auth-input-wrap"];
    if (focusedField === name) classes.push("focused");
    if (errors[name]) classes.push("error");
    return classes.join(" ");
  };

  const renderField = (name, label, icon, type = "text", placeholder = "") => (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <div className={inputWrapClass(name)}>
        <span className="auth-icon">{icon}</span>
        {type === "textarea" ? (
          <textarea
            className="auth-textarea"
            placeholder={placeholder}
            {...register(name, {
              onFocus: () => setFocusedField(name),
              onBlur: () => setFocusedField(""),
            })}
          />
        ) : (
          <input
            className="auth-input"
            type={type}
            placeholder={placeholder}
            {...register(name, {
              onFocus: () => setFocusedField(name),
              onBlur: () => setFocusedField(""),
            })}
          />
        )}
      </div>
      {errors[name] && <div className="auth-error-text">{errors[name].message}</div>}
    </div>
  );

  const renderSelect = (name, label, icon, options) => (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <div className={inputWrapClass(name)}>
        <span className="auth-icon">{icon}</span>
        <select
          className="auth-select"
          {...register(name, {
            onFocus: () => setFocusedField(name),
            onBlur: () => setFocusedField(""),
          })}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      {errors[name] && <div className="auth-error-text">{errors[name].message}</div>}
    </div>
  );

  return (
    <div className="auth-page auth-signup">
      <aside className="auth-hero">
        <div className="auth-hero-inner">
          <button type="button" className="auth-back-link" onClick={() => navigate("/") }>
            <ChevronLeft size={16} /> Back to home
          </button>

          <div className="auth-brand">
            <div className="auth-brand-mark"><Stethoscope size={20} color="#fff" /></div>
            <div className="auth-brand-text">
              <strong>Telemedicine</strong>
              <span>Build a complete care profile</span>
            </div>
          </div>

          <div className="auth-hero-copy">
            <div className="auth-kicker"><UserPlus size={14} /> Create your account</div>
            <h1>Join a healthcare platform that feels polished and memorable.</h1>
            <p>
              New role-based onboarding for patients and doctors with a stronger visual identity, clearer steps,
              and presentation-ready styling.
            </p>
          </div>

          <div className="auth-hero-points">
            {perks.map((item) => (
              <div key={item.label} className="auth-point">
                <div className="auth-point-icon">{item.icon}</div>
                <div>
                  <strong>{item.label}</strong>
                  <span>Easy onboarding</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-hero-visual">
          <div className="auth-image-shell">
            {imageError ? (
              <div className="auth-image-fallback">
                <div className="auth-image-pill">Care onboarding</div>
                <strong>Built for a better first impression</strong>
                <span>Fallback card shown because the remote image is blocked in this environment.</span>
              </div>
            ) : (
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80"
                alt="Doctor and patient consultation"
                onError={() => setImageError(true)}
              />
            )}
            <div className="auth-floating-note">
              <strong>Role aware onboarding</strong>
              <span>Separate experiences for patient and doctor registration.</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-head">
            <h2>{step === 1 ? "Create account" : `${formData.role === "doctor" ? "Doctor" : "Patient"} details`}</h2>
            <p>
              {step === 1
                ? "Start with your basic account information."
                : "Complete the role-specific information to finish signup."}
            </p>
          </div>

          {serverError && (
            <div className="auth-alert">
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit(handleSignup)}>
            {step === 1 && (
              <>
                <div className="auth-role-grid signup">
                  {roleCards.map((role) => (
                    <div
                      key={role.value}
                      className={`auth-role-card ${formData.role === role.value ? "active" : ""}`}
                      onClick={() => {
                        setValue("role", role.value, { shouldValidate: true, shouldDirty: true });
                        setValue("gender", "", { shouldValidate: true, shouldDirty: true });
                      }}
                    >
                      <div className="auth-role-icon">{role.icon}</div>
                      <div className="auth-role-title">{role.label}</div>
                      <div className="auth-role-subtitle">{role.subtitle}</div>
                    </div>
                  ))}
                </div>

                <input type="hidden" {...register("role")} />

                {renderField("fullName", "Full name", <User size={18} />, "text", "Enter your full name")}
                {renderField("username", "Username", <UserPlus size={18} />, "text", "Choose a unique username")}
                {renderField("email", "Email address", <Mail size={18} />, "email", "name@example.com")}

                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className={inputWrapClass("password")}>
                    <span className="auth-icon"><Lock size={18} /></span>
                    <input
                      className="auth-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      {...register("password", {
                        onFocus: () => setFocusedField("password"),
                        onBlur: () => setFocusedField(""),
                      })}
                    />
                    <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                    </button>
                  </div>
                  {errors.password && <div className="auth-error-text">{errors.password.message}</div>}
                </div>

                <button
                  type="button"
                  className="auth-primary-btn"
                  disabled={!canGoStep2}
                  onClick={async () => {
                    const ok = await trigger(["fullName", "username", "email", "password", "role"]);
                    if (ok) setStep(2);
                  }}
                >
                  Continue <ArrowRight size={18} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="auth-step-pill"><Settings size={14} /> Step 2 of 2</div>
                <div className="auth-stepper">
                  <div className="auth-stepper-dot active">1</div>
                  <div className={`auth-stepper-line ${step === 2 ? "active" : ""}`} />
                  <div className="auth-stepper-dot active">2</div>
                </div>

                <button type="button" className="auth-muted-link" onClick={() => setStep(1)}>
                  <ChevronLeft size={14} /> Back to account info
                </button>

                {formData.role === "patient" && (
                  <>
                    <div className="auth-grid-2">
                      {renderField("age", "Age", <User size={18} />, "number", "e.g. 29")}
                      {renderSelect("gender", "Gender", <User size={18} />, [
                        { value: "", label: "Select gender" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ])}
                    </div>
                    <div className="auth-grid-2">
                      {renderField("phone", "Phone", <Phone size={18} />, "tel", "11-digit mobile number")}
                      {renderField("city", "City", <MapPin size={18} />, "text", "e.g. Lahore")}
                    </div>
                    {renderField("medicalHistory", "Medical history (optional)", <FileText size={18} />, "textarea", "Brief history or health notes")}
                  </>
                )}

                {formData.role === "doctor" && (
                  <>
                    <div className="auth-grid-2">
                      {renderField("specialty", "Specialty", <Briefcase size={18} />, "text", "e.g. Cardiology")}
                      {renderSelect("gender", "Gender", <User size={18} />, [
                        { value: "", label: "Select gender" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ])}
                    </div>
                    {renderField("phone", "Phone", <Phone size={18} />, "tel", "11-digit mobile number")}
                    {renderField("qualifications", "Qualifications", <GraduationCap size={18} />, "text", "e.g. MBBS, FCPS")}
                    <div className="auth-grid-2">
                      {renderField("yearsOfExperience", "Experience", <Award size={18} />, "number", "Years")}
                      {renderField("chargesPerSession", "Session fee", <DollarSign size={18} />, "number", "Rs.")}
                    </div>
                    <div className="auth-grid-2">
                      {renderField("availability", "Availability", <Clock size={18} />, "text", "e.g. Mon-Fri 9am-2pm")}
                      {renderField("city", "City", <MapPin size={18} />, "text", "e.g. Karachi")}
                    </div>
                  </>
                )}

                <button type="submit" className="auth-primary-btn" disabled={loading || !canSubmitRoleFields}>
                  {loading ? (
                    <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Creating account...</>
                  ) : (
                    <>Create account <ArrowRight size={18} /></>
                  )}
                </button>
              </>
            )}
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">Already have an account?</span>
            <div className="auth-divider-line" />
          </div>

          <button type="button" className="auth-secondary-btn" onClick={() => navigate("/login") }>
            Sign in instead <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {showVerificationModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <div className="auth-modal-icon"><Info size={34} color="#0f766e" /></div>
            <h3>Account created</h3>
            <p>{verificationMessage}</p>
            <button
              className="auth-primary-btn"
              onClick={() => {
                setShowVerificationModal(false);
                setVerificationMessage("");
                localStorage.clear();
                navigate("/");
              }}
            >
              Back to home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
