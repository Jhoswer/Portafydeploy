import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Sparkles, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { dashboardShell } from "../../styles/components/dashboardShell";
import { getCalendarEvents, createCalendarEvent } from "../../services/calendarEventService";

// ─── Fecha de hoy real (ya no hardcodeada) ───────────────────────────────────
const TODAY_KEY = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();

export default function DashboardCalendar() {
  const { t } = useTranslation();

  // ─── Estado ────────────────────────────────────────────────────────────────
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(TODAY_KEY);
  const [calendarEvents, setCalendarEvents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", time: "", priority: "normal", tag: "" });
  const [saving, setSaving] = useState(false);

  const viewport = useViewport();
  const isTablet = viewport < 980;
  const isMobile = viewport < 720;
  const calendar = useMemo(() => buildCalendar(currentMonth), [currentMonth]);
  const monthNames = t("appI18n.calendar.months", { returnObjects: true });
  const weekDays = t("appI18n.calendar.weekDays", { returnObjects: true });

  // Eventos del día seleccionado (ahora es array)
  const dayEvents = calendarEvents[selectedDate] || [];
  const firstEvent = dayEvents[0] || null;


  // ─── Carga eventos del backend ─────────────────────────────────────────────
useEffect(() => {
  getCalendarEvents()
    .then(setCalendarEvents)
    .catch(() => {});
}, []);

  // ─── Crear evento ──────────────────────────────────────────────────────────
  async function handleCreateEvent(e) {
  e.preventDefault();
  setSaving(true);
  try {
    const newEvent = await createCalendarEvent(selectedDate, form); // reemplaza 1 con tu auth context
    setCalendarEvents((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newEvent],
    }));
    setShowModal(false);
    setForm({ title: "", description: "", time: "", priority: "normal", tag: "" });
  } finally {
    setSaving(false);
  }
}

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "grid", gap: 20 }}>

      {/* Hero */}
      <section style={{ ...heroCard, padding: isMobile ? "20px 18px" : heroCard.padding }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={eyebrow}>{t("appI18n.calendar.eyebrow")}</div>
          <h1 style={title}>{t("appI18n.calendar.title")}</h1>
          <p style={description}>{t("appI18n.calendar.description")}</p>
          <div style={badgeRow}>
            <span style={softBadge}>
              <CalendarDays size={14} color="currentColor" />
              {t("appI18n.calendar.monthlyView")}
            </span>
            <span style={softBadge}>
              <Sparkles size={14} color="currentColor" />
              {t("appI18n.calendar.smartReminders")}
            </span>
          </div>
        </div>
      </section>

      {/* Calendario + panel lateral */}
      <section
        style={{
          ...calendarLayout,
          gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : calendarLayout.gridTemplateColumns,
        }}
      >
        {/* Grid del calendario */}
        <article style={calendarCard}>
          <div style={calendarHeader}>
            <button type="button" onClick={() => setCurrentMonth(moveMonth(currentMonth, -1))} style={monthButton}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={calendarMonth}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <div style={calendarMeta}>{t("appI18n.calendar.selectDay")}</div>
            </div>
            <button type="button" onClick={() => setCurrentMonth(moveMonth(currentMonth, 1))} style={monthButton}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={calendarGrid}>
            {weekDays.map((day) => (
              <div key={day} style={weekDayCell}>{day}</div>
            ))}
            {calendar.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} style={emptyCell} />;
              const isSelected = day.key === selectedDate;
              const hasEvent = Boolean(calendarEvents[day.key]?.length);
              const isToday = day.key === TODAY_KEY; // ← ya no hardcodeado
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDate(day.key)}
                  style={dayCell(isSelected, hasEvent, isToday)}
                >
                  <span>{day.label}</span>
                  {hasEvent ? <span style={eventDot(isSelected)} /> : null}
                </button>
              );
            })}
          </div>
        </article>

        {/* Panel lateral */}
        <article style={sideCard}>
          <div style={eyebrow}>{t("appI18n.calendar.detail")}</div>

          <div style={focusTitle}>
            {firstEvent ? firstEvent.title : t("appI18n.calendar.freeDay")}
          </div>
          <div style={focusDate}>{formatDateLabel(selectedDate, monthNames, t)}</div>

          <div style={timelineBlock}>
            <div style={timelineHeader}>
              <Clock3 size={15} color="currentColor" />
              <span>{firstEvent?.time ?? t("appI18n.calendar.noTime")}</span>
            </div>
            <p style={timelineText}>
              {firstEvent?.description ?? t("appI18n.calendar.emptyPlan")}
            </p>
          </div>

          {/* Lista de todos los eventos del día */}
          {dayEvents.length > 1 && (
            <div style={{ display: "grid", gap: 6 }}>
              {dayEvents.slice(1).map((ev, i) => (
                <div key={i} style={tipCard}>
                  <div style={tipTitle}>{ev.title}</div>
                  <div style={tipText}>{ev.time} {ev.tag ? `· ${ev.tag}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          {/* Botón crear evento */}
          <button type="button" onClick={() => setShowModal(true)} style={createEventBtn}>
            <Plus size={14} />
            {t("appI18n.calendar.createEvent")}
          </button>

          {firstEvent?.tag && (
            <span style={softBadge}>{firstEvent.tag}</span>
          )}
        </article>
      </section>

      {/* Modal crear evento */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>

            {/* Cabecera del modal */}
            <div style={modalHeader}>
              <span style={modalTitle}>{t("appI18n.calendar.newEvent")}</span>
              <button type="button" onClick={() => setShowModal(false)} style={closeBtn}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={fieldLabel}>{t("appI18n.calendar.fields.title")} *</label>
                <input
                  required
                  style={fieldInput}
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label style={fieldLabel}>{t("appI18n.calendar.fields.description")}</label>
                <textarea
                  style={{ ...fieldInput, minHeight: 72, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={fieldLabel}>{t("appI18n.calendar.fields.time")}</label>
                  <input
                    type="time"
                    style={fieldInput}
                    value={form.time}
                    onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={fieldLabel}>{t("appI18n.calendar.fields.priority")}</label>
                  <select
                    style={fieldInput}
                    value={form.priority}
                    onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                  >
                    <option value="low">{t("appI18n.calendar.priority.low")}</option>
                    <option value="normal">{t("appI18n.calendar.priority.normal")}</option>
                    <option value="high">{t("appI18n.calendar.priority.high")}</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={fieldLabel}>{t("appI18n.calendar.fields.tag")}</label>
                <input
                  style={fieldInput}
                  value={form.tag}
                  onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
                  placeholder="ej: trabajo, salud"
                />
              </div>
              <button type="submit" disabled={saving} style={submitBtn}>
                {saving ? t("appI18n.calendar.saving") : t("appI18n.calendar.save")}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// ─── Helpers (sin cambios) ───────────────────────────────────────────────────
function useViewport() {
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

function buildCalendar(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leading = (firstDay.getDay() + 6) % 7;
  const days = [];
  for (let index = 0; index < leading; index += 1) days.push(null);
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    days.push({ label: day, key });
  }
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function moveMonth(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function formatDateLabel(dateKey, monthNames, t) {
  if (!dateKey) return t("appI18n.calendar.noDate");
  const [year, month, day] = dateKey.split("-").map(Number);
  return t("appI18n.calendar.dateLabel", { day, month: monthNames[month - 1], year });
}

// ─── Estilos (sin cambios excepto los nuevos) ────────────────────────────────
const heroCard = { ...dashboardShell.heroCard, padding: "24px 24px" };
const eyebrow = dashboardShell.eyebrow;
const title = { ...dashboardShell.title, fontSize: "1.9rem" };
const description = { ...dashboardShell.body, maxWidth: 700, fontSize: "0.94rem", lineHeight: 1.65 };
const badgeRow = { display: "flex", gap: 10, flexWrap: "wrap" };
const softBadge = dashboardShell.badge;
const calendarLayout = { display: "grid", gridTemplateColumns: "minmax(0, 1.45fr) minmax(280px, .82fr)", gap: 18 };
const calendarCard = { ...dashboardShell.surfaceCard, borderRadius: 24, padding: "22px 20px" };
const sideCard = { ...calendarCard, display: "grid", gap: 14, alignContent: "start" };
const calendarHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 };
const monthButton = { width: 34, height: 34, borderRadius: 999, border: "1px solid var(--dashboard-card-border)", background: "var(--dashboard-icon-bg)", color: "var(--text)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
const calendarMonth = { fontFamily: "var(--f-title)", fontSize: "1.05rem", fontWeight: 800, color: "var(--text)" };
const calendarMeta = { fontFamily: "var(--f-body)", fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 };
const calendarGrid = { display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 };
const weekDayCell = { textAlign: "center", fontFamily: "var(--f-ui)", fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", paddingBottom: 8 };
const emptyCell = { minHeight: 52, borderRadius: 14 };
const dayCell = (isSelected, hasEvent, isToday) => ({ minHeight: 56, borderRadius: 16, border: isSelected ? "1px solid rgba(232,72,74,.18)" : isToday ? "1px solid rgba(205,225,245,.8)" : "1px solid rgba(162,214,249,.16)", background: isSelected ? "rgba(232,72,74,.10)" : "var(--dashboard-soft-bg)", display: "grid", placeItems: "center", gap: 4, cursor: "pointer", color: "var(--text)", fontFamily: "var(--f-ui)", fontWeight: 700 });
const eventDot = (isSelected) => ({ width: 7, height: 7, borderRadius: "50%", background: isSelected ? "#ef5759" : "var(--text)" });
const focusTitle = { fontFamily: "var(--f-title)", fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" };
const focusDate = { fontFamily: "var(--f-body)", fontSize: "0.88rem", color: "var(--muted)" };
const timelineBlock = { padding: "14px 14px 16px", borderRadius: 18, background: "var(--dashboard-soft-bg)", border: "1px solid var(--dashboard-card-border)", display: "grid", gap: 8 };
const timelineHeader = { display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--f-ui)", fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" };
const timelineText = { margin: 0, fontFamily: "var(--f-body)", fontSize: "0.9rem", lineHeight: 1.65, color: "var(--body)" };
const tipsGrid = { display: "grid", gap: 10 };
const tipCard = { padding: "12px 14px", borderRadius: 16, border: "1px solid var(--dashboard-card-border)", background: "var(--dashboard-soft-bg)" };
const tipTitle = { fontFamily: "var(--f-ui)", fontSize: "0.78rem", fontWeight: 800, color: "var(--muted)", marginBottom: 6 };
const tipText = { fontFamily: "var(--f-body)", fontSize: "0.86rem", lineHeight: 1.58, color: "var(--body)" };

// ─── Estilos nuevos (modal + botón crear) ────────────────────────────────────
const createEventBtn = { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 12, border: "1px solid var(--dashboard-card-border)", background: "var(--dashboard-soft-bg)", color: "var(--text)", fontFamily: "var(--f-ui)", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 };
const modalBox = { background: "var(--dashboard-card-bg, #fff)", borderRadius: 20, border: "1px solid var(--dashboard-card-border)", padding: "24px", width: "min(440px, 92vw)", display: "grid", gap: 16 };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const modalTitle = { fontFamily: "var(--f-title)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text)" };
const closeBtn = { background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" };
const fieldLabel = { display: "block", fontFamily: "var(--f-ui)", fontSize: "0.76rem", fontWeight: 700, color: "var(--muted)", marginBottom: 4 };
const fieldInput = { width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--dashboard-card-border)", background: "var(--dashboard-soft-bg)", color: "var(--text)", fontFamily: "var(--f-body)", fontSize: "0.88rem" };
const submitBtn = { padding: "10px", borderRadius: 12, border: "none", background: "#E24B4A", color: "#fff", fontFamily: "var(--f-ui)", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer" };