"use client";
import { useState, useEffect, useRef } from "react";

// ─── GOOGLE SHEETS API ─────────────────────────────────────────────────────────

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHrYnQFz50sFEiodZ9IfiIyKwwJ1KpFgnC27I9pkuq7vO1f-iz9P095PfTYkMQuue5/exec";

async function apiGetBookings() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getAll`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function apiCreateBooking(data) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "create", ...data }),
    });
    return await res.json();
  } catch {
    return { error: "Failed" };
  }
}

// ─── DATA ──────────────────────────────────────────────────────────────────────

const VENUES = [
  {
    id: 1,
    name: "C2 Cafe",
    color: "#276749",
    available: true,
    rooms: [
      { name: "ห้องเล็ก", capacity: 20 },
      { name: "ห้องใหญ่", capacity: 30 },
    ],
  },
  {
    id: 2,
    name: "Event Place Asoke",
    color: "#553c9a",
    available: true,
    rooms: [
      { name: "ห้องเล็ก", capacity: 10 },
      { name: "ห้องกลาง", capacity: 40 },
      { name: "ห้องใหญ่", capacity: 120 },
    ],
  },
];

const TEAMS = ["Advisor", "PM", "S&F", "Commu", "Leader Buddy", "Acty", "C&C", "C&T", "In-Hall", "Operation"];

const TESTIMONIALS = [
  {
    name: "Auto",
    role: "Curator, TEDxBangkokYouth 2025",
    quote: "ในฐานะ Curator การมีสถานที่ในการ workshop เป็นประสบการณ์ที่ดีมากครับ",
    avatar: "A",
  },
  {
    name: "Bamboo",
    role: "Speaker, TEDxBangkokYouth 2025",
    quote: "ระบบจองใช้งานง่ายมาก ติดตาม status ได้ตลอด ทีมงานตอบกลับเร็ว ประทับใจมาก",
    avatar: "B",
  },
  {
    name: "Pun",
    role: "Curator Lead, TEDxBangkokYouth 2025",
    quote: "Inspiration Hub is exactly what a modern workshop space should feel like. Creative, warm, and perfectly equipped.",
    avatar: "P",
  },
];

const BOOKING_STATUSES = [
  { key: "pending",     label: "Pending Review", color: "#f6ad55", icon: "⏳" },
  { key: "confirmed",   label: "Confirmed",      color: "#68d391", icon: "✅" },
  { key: "in_progress", label: "In Progress",    color: "#63b3ed", icon: "🔄" },
  { key: "completed",   label: "Completed",      color: "#9f7aea", icon: "🎉" },
  { key: "cancelled",   label: "Cancelled",      color: "#fc8181", icon: "❌" },
];

const FAQS = [
  ["จองสถานที่ล่วงหน้าได้กี่วัน?", "แนะนำจองล่วงหน้าอย่างน้อย 14 วันเพื่อรับรองความพร้อมของสถานที่"],
  ["สามารถยกเลิกการจองได้ไหม?", "ยกเลิกได้แต่ต้องแจ้งล่วงหน้า 1-2 สัปดาห์"],
  ["มีอุปกรณ์ให้ยืมใช้ไหม?", "มีครับ สามารถทักสอบถามก่อนจอง และเพิ่มรายละเอียดที่ต้องการในการจองขั้นตอนสุดท้ายครับ"],
  ["ถ้าเกิดคำถามเพิ่มเติมติดต่อทางไหน?", "สามารถสอบถามได้ในกลุ่มไลน์ แท็ก Auto S&F ได้เลยครับ"],
];

// ─── UTILS ─────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeUp({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

// ─── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar({ activePage, setActivePage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = ["Home", "Spaces", "Bookings", "Community", "FAQ"];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleNav = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled || menuOpen ? "rgba(0,0,0,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        padding: "0 1.25rem",
        transition: "background 0.4s, border-color 0.4s",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

          {/* ── Logo: TEDx แดง / Bangkok Youth ขาว */}
          <button onClick={() => handleNav("home")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 20, letterSpacing: 2 }}>
              <span style={{ color: "#e53e3e" }}>TEDx</span>
              <span style={{ color: "white" }}> Bangkok Youth</span>
            </span>
          </button>

          {/* ── Desktop links (hidden on mobile) */}
          <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="desktop-nav">
            {links.map(l => (
              <button key={l} onClick={() => handleNav(l.toLowerCase())} style={{
                background: "none", border: "none", cursor: "pointer",
                color: activePage === l.toLowerCase() ? "#e53e3e" : "rgba(255,255,255,0.75)",
                fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
                transition: "color 0.2s", fontFamily: "inherit",
              }}>{l}</button>
            ))}
            <button onClick={() => handleNav("spaces")} style={{
              background: "#e53e3e", color: "white", border: "none",
              padding: "9px 18px", fontWeight: 700, fontSize: 11, letterSpacing: 2,
              textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
            }}>Book a Space</button>
          </div>

          {/* ── Hamburger (mobile only) */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="hamburger"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "none", flexDirection: "column", gap: 5 }}
          >
            <span style={{ display: "block", width: 24, height: 2, background: "white", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ display: "block", width: 24, height: 2, background: "white", opacity: menuOpen ? 0 : 1, transition: "all 0.3s" }} />
            <span style={{ display: "block", width: 24, height: 2, background: "white", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </div>

        {/* ── Mobile dropdown menu */}
        {menuOpen && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 0 20px" }}>
            {links.map(l => (
              <button key={l} onClick={() => handleNav(l.toLowerCase())} style={{
                display: "block", width: "100%", background: "none", border: "none",
                color: activePage === l.toLowerCase() ? "#e53e3e" : "rgba(255,255,255,0.8)",
                fontSize: 14, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase",
                padding: "12px 20px", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              }}>{l}</button>
            ))}
            <div style={{ padding: "8px 20px 0" }}>
              <button onClick={() => handleNav("spaces")} style={{
                width: "100%", background: "#e53e3e", color: "white", border: "none",
                padding: "13px", fontWeight: 700, fontSize: 12, letterSpacing: 2,
                textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
              }}>Book a Space</button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; background:black; color:white; }
        input,textarea,select { font-family:'DM Sans',sans-serif; }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:black;} ::-webkit-scrollbar-thumb{background:#e53e3e;}
        select option { background:#1a1a1a; color:white; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────────

function Hero({ setActivePage }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCount(c => c < 2 ? c + 1 : 2), 300);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ position: "relative", height: "100vh", minHeight: 600, background: "black", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 1, height: "40%", background: "linear-gradient(to bottom, transparent, #e53e3e)", opacity: 0.6, zIndex: 2 }} />
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 1, height: "40%", background: "linear-gradient(to top, transparent, #e53e3e)", opacity: 0.3, zIndex: 2 }} />
      <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(60px,15vw,240px)", color: "rgba(255,255,255,0.03)", letterSpacing: -4, whiteSpace: "nowrap", userSelect: "none", zIndex: 1 }}>
        IDEAS HAPPEN HERE
      </div>

      <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 1.5rem", maxWidth: 900, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 32, height: 2, background: "#e53e3e" }} />
          <span style={{ color: "#e53e3e", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Where Ideas Take Shape</span>
          <div style={{ width: 32, height: 2, background: "#e53e3e" }} />
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(56px,12vw,140px)", color: "white", lineHeight: 0.9, letterSpacing: -2, marginBottom: 28, animation: "fadeSlideUp 0.9s ease both" }}>
          <span style={{ display: "block" }}>BOOK YOUR</span>
          <span style={{ display: "block", color: "#e53e3e" }}>STAGE</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(13px,2vw,17px)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7, animation: "fadeSlideUp 0.9s ease 0.2s both" }}>
          ค้นหาสถานที่ที่เหมาะสมกับไอเดียของคุณ ไม่ว่าจะเป็น Workshop ขนาดเล็ก หรือ Stage สำหรับเปลี่ยนโลก
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeSlideUp 0.9s ease 0.35s both" }}>
          <button onClick={() => setActivePage("spaces")}
            onMouseEnter={e => e.target.style.background = "#c53030"}
            onMouseLeave={e => e.target.style.background = "#e53e3e"}
            style={{ background: "#e53e3e", color: "white", border: "none", padding: "14px 32px", fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            Explore Spaces
          </button>
          <button onClick={() => setActivePage("bookings")}
            style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "14px 32px", fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            Track Booking
          </button>
        </div>
        <div style={{ display: "flex", gap: 36, justifyContent: "center", marginTop: 60, animation: "fadeSlideUp 0.9s ease 0.5s both", flexWrap: "wrap" }}>
          {[{ n: count, label: "Spaces Available" }, { n: "500+", label: "Events Hosted" }, { n: "99%", label: "Satisfaction Rate" }].map(({ n, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 32, color: "white", lineHeight: 1 }}>{n}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── VENUE CARD ────────────────────────────────────────────────────────────────

function VenueCard({ venue, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [ref, inView] = useInView();
  return (
    <div ref={ref} onClick={() => onClick(venue)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)",
        background: hovered ? "#111" : "#0a0a0a",
        border: `1px solid ${hovered ? venue.color : "rgba(255,255,255,0.08)"}`,
        cursor: "pointer", position: "relative", overflow: "hidden",
        transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s, border-color 0.3s, background 0.3s`,
      }}>
      <div style={{ height: 3, background: venue.color, width: hovered ? "100%" : "40%", transition: "width 0.4s ease" }} />
      <div style={{ position: "absolute", top: 20, right: 18 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#68d391", boxShadow: "0 0 8px #68d391" }} />
      </div>
      <div style={{ padding: "28px 24px 24px" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 32, color: "white", letterSpacing: 1.5, marginBottom: 20, lineHeight: 1 }}>
          {venue.name}
        </h3>
        <div style={{ marginBottom: 20 }}>
          {venue.rooms.map(r => (
            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 500 }}>{r.name}</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{r.capacity} คน</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: hovered ? venue.color : "transparent", border: `1px solid ${hovered ? venue.color : "rgba(255,255,255,0.2)"}`, color: "white", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 16px", transition: "all 0.3s" }}>
            Book Now
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURED SPACES ──────────────────────────────────────────────────────────

function FeaturedSpaces({ setActivePage, setSelectedVenue }) {
  return (
    <section style={{ background: "black", padding: "80px 1.25rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 2, background: "#e53e3e" }} />
                <span style={{ color: "#e53e3e", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Our Spaces</span>
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(36px,6vw,72px)", color: "white", lineHeight: 0.9, letterSpacing: -1 }}>
                FEATURED<br /><span style={{ color: "rgba(255,255,255,0.2)" }}>SPACES</span>
              </h2>
            </div>
            <button onClick={() => setActivePage("spaces")} style={{ background: "none", border: "none", color: "#e53e3e", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
              View All →
            </button>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {VENUES.map((v, i) => (
            <VenueCard key={v.id} venue={v} index={i} onClick={(venue) => { setSelectedVenue(venue); setActivePage("venue-detail"); }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SPACES PAGE ──────────────────────────────────────────────────────────────

function SpacesPage({ setActivePage, setSelectedVenue }) {
  return (
    <div style={{ background: "black", minHeight: "100vh", paddingTop: 80 }}>
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "40px 1.25rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <FadeUp>
            <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(40px,8vw,96px)", color: "white", lineHeight: 0.9 }}>
              ALL <span style={{ color: "#e53e3e" }}>SPACES</span>
            </h1>
          </FadeUp>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {VENUES.map((v, i) => (
            <VenueCard key={v.id} venue={v} index={i} onClick={(venue) => { setSelectedVenue(venue); setActivePage("venue-detail"); }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── VENUE DETAIL ─────────────────────────────────────────────────────────────

function VenueDetail({ venue, setActivePage, onBookingSubmitted }) {
  const [selectedRoom, setSelectedRoom] = useState(venue.rooms[0].name);
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("12:00");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleBook = async () => {
    if (!date || !nickname || !team) {
      setError("กรุณากรอก วันที่ ชื่อเล่น และเลือกทีม");
      return;
    }
    setSaving(true);
    setError("");
    const result = await apiCreateBooking({
      venue: venue.name,
      room: selectedRoom,
      date,
      timeStart,
      timeEnd,
      team,
      topic,
      notes,
      name: nickname,
      phone,
    });
    setSaving(false);
    if (result.success) {
      onBookingSubmitted();
      setSubmitted(true);
    } else {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (submitted) {
    return (
      <div style={{ background: "black", minHeight: "100vh", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 1.25rem 0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
          <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(36px,8vw,56px)", color: "white", marginBottom: 12 }}>
            BOOKING <span style={{ color: "#e53e3e" }}>SUBMITTED</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 28, fontSize: 14 }}>คำขอจองของคุณถูกบันทึกลง Google Sheets แล้ว</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setActivePage("bookings")} style={{ background: "#e53e3e", color: "white", border: "none", padding: "13px 28px", fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
              Track Status
            </button>
            <button onClick={() => setActivePage("spaces")} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "13px 28px", fontWeight: 700, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
              Browse More
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", color: "white",
    padding: "10px 12px", fontSize: 14, outline: "none", colorScheme: "dark",
  };
  const labelStyle = {
    display: "block", color: "rgba(255,255,255,0.4)", fontSize: 10,
    fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
  };

  return (
    <div style={{ background: "black", minHeight: "100vh", paddingTop: 64 }}>
      {/* Hero band */}
      <div style={{ background: `linear-gradient(135deg, ${venue.color}22, black)`, borderBottom: `1px solid ${venue.color}33`, padding: "48px 1.25rem 36px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <button onClick={() => setActivePage("spaces")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", marginBottom: 20 }}>
            ← Back
          </button>
          <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(40px,8vw,96px)", color: "white", lineHeight: 0.9 }}>
            {venue.name}
          </h1>
        </div>
      </div>

      {/* Content — stack vertically on mobile */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 1.25rem" }}>

        {/* Rooms */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 24, color: "white", letterSpacing: 1, marginBottom: 16 }}>Available Rooms</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {venue.rooms.map(r => (
              <div key={r.name} onClick={() => setSelectedRoom(r.name)} style={{
                border: `1px solid ${selectedRoom === r.name ? venue.color : "rgba(255,255,255,0.08)"}`,
                padding: "16px 20px", cursor: "pointer",
                background: selectedRoom === r.name ? `${venue.color}11` : "transparent",
                transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ color: "white", fontWeight: 600, marginBottom: 2 }}>{r.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{r.capacity} คน</div>
                </div>
                {selectedRoom === r.name && <div style={{ width: 8, height: 8, borderRadius: "50%", background: venue.color, flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", padding: "28px 24px" }}>
          <h3 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 22, color: "white", marginBottom: 20 }}>Book This Space</h3>

          {/* วันที่ */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>วันที่</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>

          {/* เวลา */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>เวลาเริ่ม</label>
              <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>เวลาสิ้นสุด</label>
              <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* ชื่อเล่น */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>ชื่อเล่น</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder="เช่น โอ๊ต, แบม, ปั้น" style={inputStyle} />
          </div>

          {/* เบอร์โทร */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>เบอร์โทรติดต่อ</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="เช่น 0812345678" style={inputStyle} />
          </div>

          {/* ทีม */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>ทีม</label>
            <select value={team} onChange={e => setTeam(e.target.value)} style={{
              ...inputStyle,
              cursor: "pointer",
              color: team ? "white" : "rgba(255,255,255,0.3)",
              background: "#111",
            }}>
              <option value="" disabled style={{ color: "rgba(255,255,255,0.3)" }}>เลือกทีม</option>
              {TEAMS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* วัตถุประสงค์ */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>วัตถุประสงค์การจอง / Topic</label>
            <select value={topic} onChange={e => setTopic(e.target.value)} style={{
              ...inputStyle,
              cursor: "pointer",
              color: topic ? "white" : "rgba(255,255,255,0.3)",
              background: "#111",
            }}>
              <option value="" disabled style={{ color: "rgba(255,255,255,0.3)" }}>เลือกวัตถุประสงค์</option>
              {["ประชุมทีม", "Workshop", "ถ่ายทำ / Content", "Rehearsal", "Brainstorm", "อบรม / Training", "อื่นๆ"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* หมายเหตุ */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>หมายเหตุ</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม เช่น อุปกรณ์ที่ต้องการ..." rows={3}
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {error && (
            <div style={{ color: "#fc8181", fontSize: 12, marginBottom: 14, padding: "8px 12px", background: "rgba(252,129,129,0.1)", border: "1px solid rgba(252,129,129,0.3)" }}>
              {error}
            </div>
          )}

          <button onClick={handleBook} disabled={saving} style={{
            width: "100%", background: saving ? "rgba(255,255,255,0.08)" : venue.color,
            color: "white", border: "none", padding: "15px",
            fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
            cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}>
            {saving ? "กำลังบันทึก..." : "Submit Booking Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKINGS PAGE ────────────────────────────────────────────────────────────

function BookingsPage({ bookings, setBookings }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGetBookings()
      .then(data => { if (data.length > 0) setBookings(data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    const s = statusFilter === "All" || b.status === statusFilter;
    const q = !search
      || (b.id || "").toLowerCase().includes(search.toLowerCase())
      || (b.venue || "").toLowerCase().includes(search.toLowerCase())
      || (b.team || "").toLowerCase().includes(search.toLowerCase())
      || (b.name || "").toLowerCase().includes(search.toLowerCase());
    return s && q;
  });

  return (
    <div style={{ background: "black", minHeight: "100vh", paddingTop: 80 }}>
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "40px 1.25rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <FadeUp>
            <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(36px,7vw,72px)", color: "white", lineHeight: 0.9, marginBottom: 8 }}>
              BOOKING <span style={{ color: "#e53e3e" }}>TRACKER</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>ติดตามสถานะการจองสถานที่ของทีมคุณ</p>
          </FadeUp>
        </div>
      </div>

      {/* Status filter — scrollable on mobile */}
      <div style={{ padding: "20px 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
          {[{ key: "All", label: "All", color: "#fff", icon: "📋" }, ...BOOKING_STATUSES].map(s => {
            const cnt = s.key === "All" ? bookings.length : bookings.filter(b => b.status === s.key).length;
            return (
              <button key={s.key} onClick={() => setStatusFilter(s.key)} style={{
                background: statusFilter === s.key ? `${s.color}22` : "transparent",
                border: `1px solid ${statusFilter === s.key ? s.color : "rgba(255,255,255,0.1)"}`,
                color: s.color, padding: "7px 12px", fontSize: 10, fontWeight: 700,
                letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s", whiteSpace: "nowrap",
              }}>
                {s.icon} {s.label} ({cnt})
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 1.25rem" }}>
        <div style={{ marginBottom: 20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาด้วย ID, สถานที่, ทีม หรือชื่อเล่น..."
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "11px 14px", fontSize: 14, width: "100%", maxWidth: 420, outline: "none" }} />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div>กำลังโหลดข้อมูลจาก Google Sheets...</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((b, i) => {
              const statusObj = BOOKING_STATUSES.find(s => s.key === b.status) || BOOKING_STATUSES[0];
              return (
                <FadeUp key={b.id || i} delay={i * 0.04}>
                  {/* Card — responsive wrap on mobile */}
                  <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", padding: "20px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      {/* Left: ID + info */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 16, color: "#e53e3e", letterSpacing: 1, marginBottom: 6 }}>{b.id}</div>
                        <div style={{ color: "white", fontWeight: 600, marginBottom: 3, fontSize: 14 }}>
                          {b.venue} — <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>{b.room}</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 2 }}>
                          {b.date} · {b.timeStart}–{b.timeEnd}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                          {b.team}{b.name ? ` · ${b.name}` : ""}{b.phone ? ` · ${b.phone}` : ""}
                        </div>
                        {b.topic && <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>📌 {b.topic}</div>}
                        {b.notes && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4, fontStyle: "italic" }}>{b.notes}</div>}
                      </div>

                      {/* Right: status badge only — no action buttons */}
                      <div style={{ background: `${statusObj.color}18`, border: `1px solid ${statusObj.color}55`, color: statusObj.color, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "6px 10px", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", alignSelf: "flex-start" }}>
                        {statusObj.icon} {statusObj.label}
                      </div>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 22, letterSpacing: 2 }}>ไม่พบรายการจอง</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section style={{ background: "#050505", padding: "80px 1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 2, background: "#e53e3e" }} />
            <span style={{ color: "#e53e3e", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Testimonials</span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(32px,6vw,64px)", color: "white", lineHeight: 0.9, marginBottom: 48 }}>
            WHAT THEY<br /><span style={{ color: "rgba(255,255,255,0.2)" }}>SAY ABOUT US</span>
          </h2>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 1, background: "rgba(255,255,255,0.04)" }}>
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.1}>
              <div style={{ background: "#050505", padding: "32px 28px" }}>
                <div style={{ fontSize: 40, color: "#e53e3e", fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: 16, opacity: 0.6 }}>"</div>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#e53e3e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "white", flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer({ setActivePage }) {
  return (
    <footer style={{ background: "black", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 1.25rem 28px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 36, marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 12 }}>
              <span style={{ color: "#e53e3e" }}>TEDx</span>
              <span style={{ color: "white" }}> Bangkok Youth</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, lineHeight: 1.8 }}>
              สถานที่สำหรับไอเดียที่จะเปลี่ยนโลก
            </p>
          </div>
          {[
            {
              title: "Spaces",
              links: [
                { label: "C2 Cafe", page: "spaces" },
                { label: "Event Place Asoke", page: "spaces" },
              ],
            },
            {
              title: "Navigate",
              links: [
                { label: "Home", page: "home" },
                { label: "Bookings", page: "bookings" },
                { label: "FAQ", page: "faq" },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l.label}
                  onClick={() => setActivePage(l.page)}
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "white"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>{l.label}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>© 2026 TEDxBangkokYouth. All rights reserved.</div>
          <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Ideas Worth Spreading</div>
        </div>
      </div>
    </footer>
  );
}

// ─── FAQ PAGE ─────────────────────────────────────────────────────────────────

function FaqPage() {
  return (
    <div style={{ background: "black", minHeight: "100vh", padding: "100px 1.25rem 60px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FadeUp>
          <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(48px,8vw,64px)", color: "white", marginBottom: 40 }}>FAQ</h1>
        </FadeUp>
        {FAQS.map(([q, a]) => (
          <FadeUp key={q}>
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 20, marginBottom: 20 }}>
              <div style={{ color: "white", fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{q}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7 }}>{a}</div>
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [bookings, setBookings] = useState([]);

  const onBookingSubmitted = () => {
    apiGetBookings().then(data => { if (data.length > 0) setBookings(data); });
  };

  useEffect(() => { window.scrollTo(0, 0); }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return (
          <>
            <Hero setActivePage={setActivePage} />
            <FeaturedSpaces setActivePage={setActivePage} setSelectedVenue={setSelectedVenue} />
            <Testimonials />
          </>
        );
      case "spaces":
        return <SpacesPage setActivePage={setActivePage} setSelectedVenue={setSelectedVenue} />;
      case "venue-detail":
        return selectedVenue
          ? <VenueDetail venue={selectedVenue} setActivePage={setActivePage} onBookingSubmitted={onBookingSubmitted} />
          : <SpacesPage setActivePage={setActivePage} setSelectedVenue={setSelectedVenue} />;
      case "bookings":
        return <BookingsPage bookings={bookings} setBookings={setBookings} />;
      case "community":
        return (
          <div style={{ background: "black", minHeight: "100vh", paddingTop: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 1.25rem 0" }}>
            <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "clamp(40px,8vw,64px)", color: "white", textAlign: "center" }}>
              COMMUNITY <span style={{ color: "#e53e3e" }}>COMING SOON</span>
            </h1>
          </div>
        );
      case "faq":
        return <FaqPage />;
      default:
        return null;
    }
  };

  return (
    <div style={{ background: "black", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      {renderPage()}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}