import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, CheckCircle2, Cpu, Droplets, ShieldCheck } from "lucide-react"
import useIoTStore from "../store/iotStore"
import logo from "../assets/logo.png"

// 🚨 IMPORT FIREBASE AUTH LENGKAP
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signInWithPopup, 
  GoogleAuthProvider, 
  getAdditionalUserInfo 
} from "firebase/auth"
import { auth } from "../services/firebase" 

export default function Auth() {
  const [step, setStep] = useState("splash") 
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [guideStep, setGuideStep] = useState(1)

  const [nama, setNama] = useState("")
  const [noHp, setNoHp] = useState("")
  const [tempEmail, setTempEmail] = useState("") 
  const [password, setPassword] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  
  const [phoneError, setPhoneError] = useState("")
  const [passError, setPassError] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const [globalError, setGlobalError] = useState("")
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef([])

  const [confirmationResult, setConfirmationResult] = useState(null)

  const { login, setNewUser } = useIoTStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (step === "splash") {
      const timer = setTimeout(() => setStep("auth"), 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  const handlePhoneChange = (val) => {
    setNoHp(val)
    setGlobalError("")
    const regex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/
    if (!regex.test(val) && val.length > 0) {
      setPhoneError("Format No. HP tidak valid")
    } else {
      setPhoneError("")
    }
  }

  const handlePasswordChange = (val) => {
    setPassword(val)
    setGlobalError("")
    if ((!isLogin || step === "reset_password") && val.length > 0) {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
      setPassError(!regex.test(val) ? "Min. 8 karakter, huruf besar, kecil & angka" : "")
    } else {
      setPassError("")
    }
    if (confirmPass) {
      setConfirmError(val !== confirmPass ? "Kata sandi tidak cocok" : "")
    }
  }

  const handleConfirmChange = (val) => {
    setConfirmPass(val)
    setGlobalError("")
    setConfirmError(val !== password ? "Kata sandi tidak cocok" : "")
  }

  const passStrength = (() => {
    if (!password || (isLogin && step !== "reset_password")) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[a-z]/.test(password)) s++
    if (/\d/.test(password)) s++
    if (/[^a-zA-Z\d]/.test(password)) s++
    return s
  })()
  const strengthColor = ["#e5e7eb", "#dc2626", "#f59e0b", "#f59e0b", "#16a34a", "#15803d"][passStrength]
  const strengthLabel = ["", "Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat"][passStrength]

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    setGlobalError("") 
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      const next = [...otp]
      next[i - 1] = ""
      setOtp(next)
      otpRefs.current[i - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = [...otp]
    digits.split("").forEach((c, i) => { next[i] = c })
    setOtp(next)
    otpRefs.current[Math.min(digits.length, 5)]?.focus()
  }

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          console.log("reCAPTCHA verified");
        }
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLogin) {
      if (phoneError || !noHp || !password) {
        setGlobalError("Harap isi data dengan benar!")
        return
      }
      setIsLoading(true)

      setTimeout(() => {
        setIsLoading(false)
        login({ nama: "Petani " + noHp.slice(-4), noHp: noHp }) 
        navigate("/")
      }, 1500)

    } else {
      if (phoneError || passError || confirmError || !noHp || !password || !confirmPass || !nama) {
        setGlobalError("Harap lengkapi data pendaftaran!")
        return
      }
      
      setIsLoading(true)

      let formattedPhone = noHp
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+62" + formattedPhone.substring(1)
      } else if (formattedPhone.startsWith("62")) {
        formattedPhone = "+" + formattedPhone
      }

      try {
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;

        const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(result);
        
        setStep("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } catch (error) {
        console.error("Gagal kirim OTP:", error);
        setGlobalError("Gagal mengirim OTP. Pastikan nomor HP aktif.");
        
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.render().then(function(widgetId) {
            window.grecaptcha.reset(widgetId);
          });
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    const otpCode = otp.join("");
    
    try {
      const result = await confirmationResult.confirm(otpCode);
      console.log("Berhasil verifikasi nomor HP!", result.user);
      
      setStep("guide");
    } catch (error) {
      console.error("OTP Salah:", error);
      setGlobalError("Kode OTP salah atau sudah kadaluarsa!");
    } finally {
      setIsLoading(false);
    }
  }

  // 🚨 FIREBASE: FUNGSI LOGIN GOOGLE ASLI
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setGlobalError("");
    
    try {
      const provider = new GoogleAuthProvider();
      // Buka pop-up akun Google asli bawaan browser/HP
      const result = await signInWithPopup(auth, provider);
      
      // Deteksi otomatis apakah email ini baru pertama kali daftar
      const details = getAdditionalUserInfo(result);
      
      const accName = result.user.displayName || "Petani";
      const accEmail = result.user.email;

      if (details.isNewUser) {
        setNewUser(true);
        setNama(accName);
        setTempEmail(accEmail);
        
        setStep("guide"); 
        setGuideStep(1);
      } else {
        setNewUser(false);
        login({ nama: accName, email: accEmail });
        navigate("/"); 
      }
    } catch (error) {
      console.error("Gagal login Google:", error);
      setGlobalError("Gagal terhubung dengan Google. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleForgotSubmit = () => {
    if (!noHp || phoneError) {
      setGlobalError("Masukkan Nomor HP yang valid terlebih dahulu!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtp(["", "", "", "", "", ""]);
      setStep("forgot_otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1000);
  }

  const handleForgotOtpSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPassword(""); 
      setConfirmPass("");
      setPassError("");
      setConfirmError("");
      setStep("reset_password");
    }, 1000);
  }

  const handleResetSubmit = () => {
    if (passError || confirmError || !password || !confirmPass) {
      setGlobalError("Pastikan kata sandi baru memenuhi standar keamanan!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("reset_success"); 
    }, 1500);
  }

  const switchTab = (toLogin) => {
    setIsLogin(toLogin)
    setGlobalError(""); setPhoneError(""); setPassError(""); setConfirmError("")
  }

  if (step === "splash") {
    return (
      <div className="app-container" style={{...styles.container, flexDirection: 'column'}}>
        <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
        <img src={logo} alt="IrigasiKu" style={{height: "110px", animation: "pulse 2s infinite ease-in-out"}} />
      </div>
    )
  }

  if (step === "forgot") {
    return (
      <div className="app-container" style={styles.container}>
        {isLoading && <div style={styles.loadingOverlay}><Loader2 size={40} color="#fff" className="animate-spin" /></div>}
        <div style={styles.card}>
          <img src={logo} alt="IrigasiKu" style={styles.logoSmall} />
          <h2 style={{color: "#1f2937", margin: "10px 0 5px", fontSize: "20px"}}>Pemulihan Akun</h2>
          <p style={{color: "#6b7280", fontSize: "13px", marginBottom: "25px"}}>Masukkan Nomor HP yang terdaftar untuk menerima kode verifikasi.</p>
          {globalError && <div style={{background: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "10px", fontSize: "12px", marginBottom: "15px"}}>{globalError}</div>}
          <div style={{position: "relative", marginBottom: "25px"}}>
            <input type="tel" placeholder="Nomor HP" style={{...styles.input, marginBottom: 0, borderColor: phoneError ? "#dc2626" : "#ddd"}} value={noHp} onChange={e => handlePhoneChange(e.target.value)} />
            {phoneError && <span style={styles.errorText}>{phoneError}</span>}
          </div>
          <button style={styles.btnMain} onClick={handleForgotSubmit}>Kirim Kode OTP</button>
          <div style={{marginTop: "20px", color: "#9ca3af", fontSize: "13px", cursor: "pointer"}} onClick={() => {setStep("auth"); setGlobalError("");}}>Kembali ke Login</div>
        </div>
      </div>
    )
  }

  if (step === "forgot_otp") {
    const otpComplete = otp.every(v => v !== "")
    return (
      <div className="app-container" style={styles.container}>
        {isLoading && <div style={styles.loadingOverlay}><Loader2 size={40} color="#fff" className="animate-spin" /></div>}
        <div style={styles.card}>
          <img src={logo} alt="IrigasiKu" style={styles.logoSmall} />
          <h2 style={{color: "#1f2937", margin: "10px 0", fontSize: "20px"}}>Verifikasi Pemulihan</h2>
          <p style={{color: "#6b7280", fontSize: "13px", marginBottom: "30px"}}>Masukkan 6 digit kode yang dikirim ke SMS <b>{noHp}</b></p>
          <div style={{display: "flex", gap: "8px", justifyContent: "center", marginBottom: "30px"}} onPaste={handleOtpPaste}>
            {otp.map((val, i) => (
              <input key={i} ref={el => (otpRefs.current[i] = el)} maxLength={1} type="tel" value={val} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)} style={{...styles.otpBox, borderColor: val ? "#16a34a" : "#e5e7eb", background: val ? "#f0fdf4" : "#fff", color: "#16a34a"}} />
            ))}
          </div>
          <button style={{...styles.btnMain, opacity: otpComplete ? 1 : 0.5}} disabled={!otpComplete} onClick={handleForgotOtpSubmit}>Verifikasi Kode</button>
        </div>
      </div>
    )
  }

  if (step === "reset_password") {
    return (
      <div className="app-container" style={styles.container}>
        {isLoading && <div style={styles.loadingOverlay}><Loader2 size={40} color="#fff" className="animate-spin" /></div>}
        <div style={styles.card}>
          <img src={logo} alt="IrigasiKu" style={styles.logoSmall} />
          <h2 style={{color: "#1f2937", margin: "10px 0", fontSize: "20px"}}>Buat Kata Sandi Baru</h2>
          <p style={{color: "#6b7280", fontSize: "13px", marginBottom: "25px"}}>Pastikan kata sandi baru Anda unik dan mudah diingat.</p>
          {globalError && <div style={{background: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "10px", fontSize: "12px", marginBottom: "15px"}}>{globalError}</div>}
          <div style={{ position: "relative", marginBottom: "15px" }}>
            <input type={showPassword ? "text" : "password"} placeholder="Kata Sandi Baru" style={{...styles.inputPassword, marginBottom: 0, borderColor: passError ? "#dc2626" : "#ddd"}} value={password} onChange={e => handlePasswordChange(e.target.value)} required />
            <div onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</div>
            {password && (
              <div style={{ position: "absolute", bottom: "-18px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{...styles.errorText, position: "static"}}>{passError}</span>
                <span style={{fontSize: "10px", color: strengthColor, fontWeight: "bold", marginLeft: "auto"}}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <div style={{ position: "relative", marginBottom: "25px", marginTop: (passError || password) ? "25px" : "0" }}>
            <input type={showConfirm ? "text" : "password"} placeholder="Konfirmasi Kata Sandi Baru" style={{...styles.inputPassword, marginBottom: 0, borderColor: confirmError ? "#dc2626" : "#ddd"}} value={confirmPass} onChange={e => handleConfirmChange(e.target.value)} required />
            <div onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}</div>
            {confirmError && <span style={styles.errorText}>{confirmError}</span>}
          </div>
          <button style={styles.btnMain} onClick={handleResetSubmit}>Simpan Kata Sandi</button>
        </div>
      </div>
    )
  }

  if (step === "reset_success") {
    return (
      <div className="app-container" style={styles.container}>
        <div style={styles.card}>
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
            <CheckCircle2 size={70} color="#16a34a" />
          </div>
          <h2 style={{color: "#1f2937", margin: "10px 0", fontSize: "22px"}}>Berhasil!</h2>
          <p style={{color: "#6b7280", fontSize: "14px", marginBottom: "30px", lineHeight: "1.5"}}>
            Kata sandi Anda telah berhasil diubah. Silakan masuk menggunakan kata sandi baru Anda.
          </p>
          <button style={styles.btnMain} onClick={() => { setStep("auth"); setIsLogin(true); setPassword(""); setConfirmPass(""); }}>
            Kembali ke Login
          </button>
        </div>
      </div>
    )
  }

  if (step === "otp") {
    const otpComplete = otp.every(v => v !== "")
    return (
      <div className="app-container" style={styles.container}>
        {isLoading && <div style={styles.loadingOverlay}><Loader2 size={40} color="#fff" className="animate-spin" /></div>}
        <div style={styles.card}>
          <img src={logo} alt="IrigasiKu" style={styles.logoSmall} />
          <h2 style={{color: "#1f2937", margin: "10px 0", fontSize: "20px"}}>Verifikasi Keamanan</h2>
          <p style={{color: "#6b7280", fontSize: "13px", marginBottom: "20px"}}>Masukkan 6 digit kode yang dikirim ke SMS <b>{noHp}</b></p>
          
          {globalError && <div style={{background: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "10px", fontSize: "12px", marginBottom: "15px", fontWeight: "bold"}}>{globalError}</div>}

          <div style={{display: "flex", gap: "8px", justifyContent: "center", marginBottom: "30px"}} onPaste={handleOtpPaste}>
            {otp.map((val, i) => (
              <input key={i} ref={el => (otpRefs.current[i] = el)} maxLength={1} type="tel" value={val} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)} style={{...styles.otpBox, borderColor: val ? "#16a34a" : "#e5e7eb", background: val ? "#f0fdf4" : "#fff", color: "#16a34a"}} />
            ))}
          </div>
          <button style={{...styles.btnMain, opacity: otpComplete ? 1 : 0.5}} disabled={!otpComplete || isLoading} onClick={handleVerifyOtp}>Verifikasi Kode</button>
        </div>
      </div>
    )
  }

  if (step === "guide") {
    return (
      <div className="app-container" style={styles.container}>
        <div style={styles.guideCard}>
          
          <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '30px'}}>
            {[1, 2, 3].map((num) => (
              <div key={num} style={{
                height: '8px',
                width: guideStep === num ? '24px' : '8px',
                backgroundColor: guideStep === num ? '#16a34a' : '#e5e7eb',
                borderRadius: '10px',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>

          <div style={{minHeight: "260px", display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {guideStep === 1 && (
              <>
                <div style={styles.illustrationBox}>
                  <Cpu size={55} color="#16a34a" strokeWidth={1.5} />
                </div>
                <h3 style={styles.guideTitle}>Instalasi Alat</h3>
                <p style={styles.guideDesc}>Letakkan box sensor di pinggir saluran irigasi utama. Pastikan antena tidak terhalang agar sinyal stabil.</p>
              </>
            )}
            {guideStep === 2 && (
              <>
                <div style={styles.illustrationBox}>
                  <Droplets size={55} color="#16a34a" strokeWidth={1.5} />
                </div>
                <h3 style={styles.guideTitle}>Kualitas Air</h3>
                <p style={styles.guideDesc}>Status akan menjadi <b>Bahaya</b> jika pH air turun di bawah 6.0 atau naik di atas 9.0 (Sesuai baku mutu PP 22/2021).</p>
              </>
            )}
            {guideStep === 3 && (
              <>
                <div style={styles.illustrationBox}>
                  <ShieldCheck size={55} color="#16a34a" strokeWidth={1.5} />
                </div>
                <h3 style={styles.guideTitle}>Siap Monitoring</h3>
                <p style={styles.guideDesc}>Akun Anda telah diamankan. Data otomatis tersimpan meski berganti hari untuk keperluan analisis histori jangka panjang.</p>
              </>
            )}
          </div>
          
          <button style={styles.btnGreen} onClick={() => { 
            if(guideStep < 3) {
              setGuideStep(guideStep+1); 
            } else { 
              login({ nama: nama || "Petani Baru", noHp: noHp, email: tempEmail }); 
              navigate("/"); 
            } 
          }}>
            {guideStep < 3 ? "Selanjutnya" : "Mulai Monitoring"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container" style={styles.container}>
      {isLoading && <div style={styles.loadingOverlay}><Loader2 size={40} color="#fff" className="animate-spin" /></div>}
      <div style={styles.card}>
        <img src={logo} alt="IrigasiKu" style={styles.logo} />
        <div style={styles.tabWrapper}>
          <div style={{...styles.tab, background: isLogin ? "#fff" : "transparent"}} onClick={() => switchTab(true)}>Masuk</div>
          <div style={{...styles.tab, background: !isLogin ? "#fff" : "transparent"}} onClick={() => switchTab(false)}>Daftar</div>
        </div>
        {globalError && <div style={{background: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "10px", fontSize: "12px", marginBottom: "15px", fontWeight: "bold"}}>{globalError}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input type="text" placeholder="Nama Lengkap" style={styles.input} value={nama} onChange={e => setNama(e.target.value)} required />
          )}
          <div style={{position: "relative", marginBottom: "15px"}}>
            <input type="tel" placeholder="Nomor HP" style={{...styles.input, marginBottom: 0, borderColor: phoneError ? "#dc2626" : "#ddd"}} value={noHp} onChange={e => handlePhoneChange(e.target.value)} required />
            {phoneError && <span style={styles.errorText}>{phoneError}</span>}
          </div>
          <div style={{ position: "relative", marginBottom: "15px", marginTop: phoneError ? "20px" : "0" }}>
            <input type={showPassword ? "text" : "password"} placeholder="Kata Sandi" style={{...styles.inputPassword, marginBottom: 0, borderColor: passError ? "#dc2626" : "#ddd"}} value={password} onChange={e => handlePasswordChange(e.target.value)} required />
            <div onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</div>
            {!isLogin && password && (
              <div style={{ position: "absolute", bottom: "-18px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{...styles.errorText, position: "static"}}>{passError}</span>
                <span style={{fontSize: "10px", color: strengthColor, fontWeight: "bold", marginLeft: "auto"}}>{strengthLabel}</span>
              </div>
            )}
          </div>
          {!isLogin && (
            <div style={{ position: "relative", marginBottom: "15px", marginTop: (passError || password) ? "25px" : "0" }}>
              <input type={showConfirm ? "text" : "password"} placeholder="Konfirmasi Kata Sandi" style={{...styles.inputPassword, marginBottom: 0, borderColor: confirmError ? "#dc2626" : "#ddd"}} value={confirmPass} onChange={e => handleConfirmChange(e.target.value)} required />
              <div onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}</div>
              {confirmError && <span style={styles.errorText}>{confirmError}</span>}
            </div>
          )}
          {isLogin && <div style={{textAlign: "right", marginBottom: "15px", marginTop: passError ? "20px" : "0"}}><span style={{color: "#9ca3af", fontSize: "12px", cursor: "pointer"}} onClick={() => {setStep("forgot"); setGlobalError("");}}>Lupa Kata Sandi?</span></div>}
          
          <button type="submit" style={styles.btnMain} disabled={isLoading}>{isLogin ? "Masuk Sekarang" : "Daftar Akun"}</button>
        
        </form>
        <div style={styles.divider}>{isLogin ? "Atau masuk dengan" : "Atau daftar cepat dengan"}</div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* 🚨 TOMBOL GOOGLE SEKARANG MEMANGGIL FUNGSI FIREBASE ASLI 🚨 */}
          <button style={styles.googleCircleBtn} type="button" onClick={handleGoogleAuth} disabled={isLoading}>
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          </button>
        </div>
        <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      <div id="recaptcha-container"></div>
    </div>
  )
}

const styles = {
  container: { background: "#f8fdf9", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "sans-serif" },
  card: { width: "100%", maxWidth: "380px", padding: "20px", textAlign: "center", boxSizing: "border-box" },
  logo: { height: "75px", marginBottom: "30px" },
  logoSmall: { height: "50px", marginBottom: "15px" },
  tabWrapper: { display: "flex", background: "#e5e7eb", borderRadius: "25px", padding: "4px", marginBottom: "30px" },
  tab: { flex: 1, padding: "12px", borderRadius: "22px", fontSize: "14px", cursor: "pointer", fontWeight: "bold", color: "#1f2937", transition: "0.3s" },
  input: { width: "100%", padding: "16px", borderRadius: "14px", border: "1px solid #ddd", marginBottom: "15px", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  inputPassword: { width: "100%", padding: "16px", paddingRight: "50px", borderRadius: "14px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  errorText: { position: "absolute", bottom: "-16px", left: "5px", color: "#dc2626", fontSize: "10px", fontWeight: "bold" },
  eyeIcon: { position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#9ca3af", display: "flex" },
  
  btnMain: { width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: "#16a34a", color: "#fff", fontWeight: "bold", fontSize: "16px", marginTop: "10px", cursor: "pointer", display: "flex", justifyContent: "center", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)" },
  
  divider: { margin: "25px 0", fontSize: "13px", color: "#9ca3af" },
  googleCircleBtn: { width: "56px", height: "56px", borderRadius: "50%", border: "1px solid #ddd", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
  otpBox: { width: "45px", height: "55px", textAlign: "center", fontSize: "20px", fontWeight: "bold", border: "1px solid #ddd", borderRadius: "12px", outline: "none" },
  loadingOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  guideCard: { width: "100%", maxWidth: "380px", padding: "30px 20px", textAlign: "center", boxSizing: "border-box", background: "#fff", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" },
  illustrationBox: { width: "120px", height: "120px", background: "#f0fdf4", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 20px" },
  guideTitle: { color: "#1f2937", fontSize: "20px", margin: "0 0 10px 0", fontWeight: "bold" },
  guideDesc: { color: "#6b7280", fontSize: "14px", lineHeight: "1.6", margin: "0", padding: "0 10px" },
  btnGreen: { width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: "#16a34a", color: "#fff", fontWeight: "bold", fontSize: "16px", marginTop: "10px", cursor: "pointer", display: "flex", justifyContent: "center", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)" },
}