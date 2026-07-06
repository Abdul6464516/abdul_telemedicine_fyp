import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authActions";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  Clock3,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  Video,
  XCircle,
  Settings,
  Loader2,
} from "lucide-react";
import "./auth.css";

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required")
    .refine((value) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isUsername = /^[a-zA-Z0-9._-]{3,30}$/.test(value);
      return isEmail || isUsername;
    }, "Enter a valid email or username"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  role: z.enum(["patient", "doctor", "admin"]),
});

const roleCards = [
  { value: "patient", label: "Patient", subtitle: "Appointments, prescriptions", icon: <User size={18} /> },
  { value: "doctor", label: "Doctor", subtitle: "Patients, consultations", icon: <Stethoscope size={18} /> },
  { value: "admin", label: "Admin", subtitle: "System control", icon: <Settings size={18} /> },
];

const benefits = [
  { icon: <Video size={16} />, label: "Consultations" },
  { icon: <MessageSquare size={16} />, label: "Secure chat" },
  { icon: <ShieldCheck size={16} />, label: "Protected data" },
  { icon: <Clock3 size={16} />, label: "Fast access" },
];

const Login = () => {
  const navigate = useNavigate();
  const { loginUserContext } = useUser();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      identifier: "",
      password: "",
      role: "patient",
    },
  });

  const selectedRole = watch("role");

  const handleLogin = async (values) => {
    setServerError("");
    setLoading(true);

    try {
      const data = await loginUser({
        identifier: values.identifier.trim(),
        password: values.password,
      });

      if (data.user.role !== values.role) {
        setServerError(`You are registered as a ${data.user.role}, not a ${values.role}. Please select the correct role.`);
        return;
      }

      if (data.user.role !== "admin") {
        if (data.user.verificationStatus === "pending") {
          setStatusMessage("Your account is pending admin approval. Please wait for verification before accessing the system.");
          setShowStatusModal(true);
          return;
        }

        if (data.user.verificationStatus === "rejected") {
          setStatusMessage("Your account has been rejected by the administrator. Please contact support for more information.");
          setShowStatusModal(true);
          return;
        }
      }

      loginUserContext(data.token, data.user);
      toast.success(`Welcome back, ${data.user.fullName}!`);
      setTimeout(() => {
        if (values.role === "patient") navigate("/patient");
        else if (values.role === "doctor") navigate("/doctor");
        else navigate("/admin");
      }, 800);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = statusMessage.includes("pending")
    ? { icon: <AlertCircle size={44} color="#f59e0b" />, title: "Pending Verification" }
    : { icon: <XCircle size={44} color="#ef4444" />, title: "Account Rejected" };

  const inputWrapClass = (name) => {
    const classes = ["auth-input-wrap"];
    if (focusedField === name) classes.push("focused");
    if (errors[name]) classes.push("error");
    return classes.join(" ");
  };

  return (
    <div className="auth-page auth-login">
      <aside className="auth-hero">
        <div className="auth-hero-inner">
          <button type="button" className="auth-back-link" onClick={() => navigate("/") }>
            <ChevronLeft size={16} /> Back to home
          </button>

          <div className="auth-brand">
            <div className="auth-brand-mark"><Heart size={18} fill="currentColor" /></div>
            <div className="auth-brand-text">
              <strong>Telemedicine</strong>
              <span>Modern healthcare access</span>
            </div>
          </div>

          <div className="auth-hero-copy">
            <div className="auth-kicker"><ShieldCheck size={14} /> Secure role-based login</div>
            <h1>Sign in to a cleaner, calmer healthcare workspace.</h1>
            <p>
              A more premium entry point for your telemedicine project with stronger visuals, clear role selection,
              and a presentation-friendly layout.
            </p>
          </div>

          <div className="auth-hero-points">
            {benefits.map((item) => (
              <div key={item.label} className="auth-point">
                <div className="auth-point-icon">{item.icon}</div>
                <div>
                  <strong>{item.label}</strong>
                  <span>Trusted workflow</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-hero-visual">
          <div className="auth-image-shell">
            {imageError ? (
              <div className="auth-image-fallback">
                <div className="auth-image-pill">Live care</div>
                <strong>Remote healthcare ready</strong>
                <span>Fallback card shown because the remote image is blocked in this environment.</span>
              </div>
            ) : (
              <img
                src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1400&q=80"
                alt="Doctor consultation"
                onError={() => setImageError(true)}
              />
            )}
            <div className="auth-floating-note">
              <strong>FYP-ready presentation</strong>
              <span>Same backend, better first impression, cleaner brand feel.</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-head">
            <h2>Welcome back</h2>
            <p>Enter your credentials to continue into your dashboard.</p>
          </div>

          {serverError && (
            <div className="auth-alert">
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          <div className="auth-role-grid login">
            {roleCards.map((role) => (
              <div
                key={role.value}
                className={`auth-role-card ${selectedRole === role.value ? "active" : ""}`}
                onClick={() => setValue("role", role.value, { shouldValidate: true, shouldDirty: true })}
              >
                <div className="auth-role-icon">{role.icon}</div>
                <div className="auth-role-title">{role.label}</div>
                <div className="auth-role-subtitle">{role.subtitle}</div>
              </div>
            ))}
          </div>

          <input type="hidden" {...register("role")} />

          <form className="auth-form" onSubmit={handleSubmit(handleLogin)}>
            <div className="auth-field">
              <label className="auth-label">Email or username</label>
              <div className={inputWrapClass("identifier")}>
                <Mail size={18} className="auth-icon" />
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Enter your email or username"
                  {...register("identifier", {
                    onFocus: () => setFocusedField("identifier"),
                    onBlur: () => setFocusedField(""),
                  })}
                />
              </div>
              {errors.identifier && <div className="auth-error-text">{errors.identifier.message}</div>}
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className={inputWrapClass("password")}>
                <Lock size={18} className="auth-icon" />
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <button type="submit" className="auth-primary-btn" disabled={loading || !isValid}>
              {loading ? (
                <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">New here?</span>
            <div className="auth-divider-line" />
          </div>

          <button type="button" className="auth-secondary-btn" onClick={() => navigate("/signup") }>
            Create a free account <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {showStatusModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <div className="auth-modal-icon">{modalContent.icon}</div>
            <h3>{modalContent.title}</h3>
            <p>{statusMessage}</p>
            <button
              className="auth-primary-btn"
              onClick={() => {
                setShowStatusModal(false);
                setStatusMessage("");
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

export default Login;
