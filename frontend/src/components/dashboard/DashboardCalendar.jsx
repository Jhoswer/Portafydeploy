import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Sparkles } from "lucide-react";
import { dashboardShell } from "../../styles/components/dashboardShell";

const calendarEvents = {
  "2026-04-04": {
    title: "Actualizar perfil",
    time: "09:30",
    detail: "Revisa titular, foto y biografia antes de publicar cambios.",
    tag: "Perfil",
  },
  "2026-04-11": {
    title: "Subir caso de estudio",
    time: "15:00",
    detail: "Publica el proyecto UX con portada, tecnologias y enlace demo.",
    tag: "Proyecto",
  },
  "2026-04-15": {
    title: "Revisar habilidades",
    time: "11:45",
    detail: "Ordena skills por seniority y deja visibles solo las principales.",
    tag: "Skills",
  },
  "2026-04-23": {
    title: "Conectar CV",
    time: "18:10",
    detail: "Verifica el PDF, los enlaces sociales y el portafolio publico.",
    tag: "Social",
  },
};

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

export default function DashboardCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1));
  const [selectedDate, setSelectedDate] = useState("2026-04-15");
  const viewport = useViewport();
  const isTablet = viewport < 980;
  const isMobile = viewport < 720;
  const calendar = useMemo(() => buildCalendar(currentMonth), [currentMonth]);
  const selectedEvent = calendarEvents[selectedDate];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ ...heroCard, padding: isMobile ? "20px 18px" : heroCard.padding }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={eyebrow}>Calendario</div>
          <h1 style={title}>Agenda visual del perfil</h1>
          <p style={description}>
            Reserva bloques para mejorar tu perfil, subir proyectos, revisar enlaces y mantener visible tu avance.
          </p>
          <div style={badgeRow}>
            <span style={softBadge}>
              <CalendarDays size={14} color="currentColor" />
              Vista mensual
            </span>
            <span style={softBadge}>
              <Sparkles size={14} color="currentColor" />
              Espacio para recordatorios inteligentes
            </span>
          </div>
        </div>
      </section>

      <section
        style={{
          ...calendarLayout,
          gridTemplateColumns: isTablet ? "minmax(0, 1fr)" : calendarLayout.gridTemplateColumns,
        }}
      >
        <article style={calendarCard}>
          <div style={calendarHeader}>
            <button type="button" onClick={() => setCurrentMonth(moveMonth(currentMonth, -1))} style={monthButton}>
              <ChevronLeft size={16} />
            </button>

            <div style={{ textAlign: "center" }}>
              <div style={calendarMonth}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <div style={calendarMeta}>Selecciona un dia y mira el detalle al lado</div>
            </div>

            <button type="button" onClick={() => setCurrentMonth(moveMonth(currentMonth, 1))} style={monthButton}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={calendarGrid}>
            {weekDays.map((day) => (
              <div key={day} style={weekDayCell}>
                {day}
              </div>
            ))}

            {calendar.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} style={emptyCell} />;
              const isSelected = day.key === selectedDate;
              const hasEvent = Boolean(calendarEvents[day.key]);
              const isToday = day.key === "2026-04-05";

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

        <article style={sideCard}>
          <div style={eyebrow}>Detalle</div>
          <div style={focusTitle}>{selectedEvent ? selectedEvent.title : "Dia libre"}</div>
          <div style={focusDate}>{formatDateLabel(selectedDate)}</div>

          <div style={timelineBlock}>
            <div style={timelineHeader}>
              <Clock3 size={15} color="currentColor" />
              <span>{selectedEvent ? selectedEvent.time : "Sin hora asignada"}</span>
            </div>
            <p style={timelineText}>
              {selectedEvent
                ? selectedEvent.detail
                : "Usa este espacio para planear una mejora puntual del perfil o preparar un nuevo proyecto."}
            </p>
          </div>

          <div style={tipsGrid}>
            <div style={tipCard}>
              <div style={tipTitle}>Idea util</div>
              <div style={tipText}>Recordatorios para actualizar el CV antes de postular o compartir tu portafolio.</div>
            </div>
            <div style={tipCard}>
              <div style={tipTitle}>Siguiente paso</div>
              <div style={tipText}>Mas adelante aqui podriamos sumar arrastrar eventos, metas y alertas visuales.</div>
            </div>
          </div>

          {selectedEvent?.tag ? <span style={softBadge}>{selectedEvent.tag}</span> : null}
        </article>
      </section>
    </div>
  );
}

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

function formatDateLabel(dateKey) {
  if (!dateKey) return "Sin fecha";
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${day} de ${monthNames[month - 1]} de ${year}`;
}

const heroCard = {
  ...dashboardShell.heroCard,
  padding: "24px 24px",
};

const eyebrow = dashboardShell.eyebrow;

const title = {
  ...dashboardShell.title,
  fontSize: "1.9rem",
};

const description = {
  ...dashboardShell.body,
  maxWidth: 700,
  fontSize: "0.94rem",
  lineHeight: 1.65,
};

const badgeRow = { display: "flex", gap: 10, flexWrap: "wrap" };
const softBadge = dashboardShell.badge;

const calendarLayout = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.45fr) minmax(280px, .82fr)",
  gap: 18,
};

const calendarCard = {
  ...dashboardShell.surfaceCard,
  borderRadius: 24,
  padding: "22px 20px",
};

const sideCard = {
  ...calendarCard,
  display: "grid",
  gap: 14,
  alignContent: "start",
};

const calendarHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
};

const monthButton = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: "1px solid var(--dashboard-card-border)",
  background: "var(--dashboard-icon-bg)",
  color: "var(--text)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const calendarMonth = {
  fontFamily: "var(--f-title)",
  fontSize: "1.05rem",
  fontWeight: 800,
  color: "var(--text)",
};

const calendarMeta = {
  fontFamily: "var(--f-body)",
  fontSize: "0.82rem",
  color: "var(--muted)",
  marginTop: 4,
};

const calendarGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: 8,
};

const weekDayCell = {
  textAlign: "center",
  fontFamily: "var(--f-ui)",
  fontSize: "0.74rem",
  fontWeight: 800,
  color: "var(--muted)",
  paddingBottom: 8,
};

const emptyCell = {
  minHeight: 52,
  borderRadius: 14,
};

const dayCell = (isSelected, hasEvent, isToday) => ({
  minHeight: 56,
  borderRadius: 16,
  border: isSelected
    ? "1px solid rgba(232,72,74,.18)"
    : isToday
      ? "1px solid rgba(205,225,245,.8)"
      : "1px solid rgba(162,214,249,.16)",
  background: isSelected ? "rgba(232,72,74,.10)" : "var(--dashboard-soft-bg)",
  display: "grid",
  placeItems: "center",
  gap: 4,
  cursor: "pointer",
  color: "var(--text)",
  fontFamily: "var(--f-ui)",
  fontWeight: 700,
});

const eventDot = (isSelected) => ({
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: isSelected ? "#ef5759" : "var(--text)",
});

const focusTitle = {
  fontFamily: "var(--f-title)",
  fontSize: "1.4rem",
  fontWeight: 800,
  color: "var(--text)",
};

const focusDate = {
  fontFamily: "var(--f-body)",
  fontSize: "0.88rem",
  color: "var(--muted)",
};

const timelineBlock = {
  padding: "14px 14px 16px",
  borderRadius: 18,
  background: "var(--dashboard-soft-bg)",
  border: "1px solid var(--dashboard-card-border)",
  display: "grid",
  gap: 8,
};

const timelineHeader = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontFamily: "var(--f-ui)",
  fontSize: "0.82rem",
  fontWeight: 700,
  color: "var(--text)",
};

const timelineText = {
  margin: 0,
  fontFamily: "var(--f-body)",
  fontSize: "0.9rem",
  lineHeight: 1.65,
  color: "var(--body)",
};

const tipsGrid = { display: "grid", gap: 10 };
const tipCard = {
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid var(--dashboard-card-border)",
  background: "var(--dashboard-soft-bg)",
};
const tipTitle = {
  fontFamily: "var(--f-ui)",
  fontSize: "0.78rem",
  fontWeight: 800,
  color: "var(--muted)",
  marginBottom: 6,
};
const tipText = {
  fontFamily: "var(--f-body)",
  fontSize: "0.86rem",
  lineHeight: 1.58,
  color: "var(--body)",
};
