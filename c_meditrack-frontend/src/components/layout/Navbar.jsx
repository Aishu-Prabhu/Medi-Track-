// src/components/layout/Navbar.jsx


import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { getPatientByEmail } from "../../api/patientService";
import { getDoctorByEmail } from "../../api/doctorService";

import {
  getMyNotifications,
  getDoctorNotifications,
  markNotificationRead,
} from "../../api/notificationService";

import { Bell, LogOut } from "lucide-react";

const NAV_LINKS = {
  PATIENT: [
    { to: "/patient/dashboard", label: "Dashboard" },
    { to: "/patient/profile", label: "Profile" },
    { to: "/patient/appointments", label: "Appointments" },
    { to: "/patient/book-appointment", label: "Book Appointment" },
    { to: "/patient/prescriptions", label: "Prescriptions" },
    { to: "/patient/payments", label: "Payments" },
  ],

  DOCTOR: [
    { to: "/doctor/dashboard", label: "Dashboard" },
    { to: "/doctor/appointments", label: "Appointments" },
    { to: "/doctor/prescriptions", label: "Prescriptions" },
    { to: "/doctor/slots", label: "Slots" },
  ],

  ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/patients", label: "Patients" },
    { to: "/admin/doctors", label: "Doctors" },
    { to: "/admin/appointments", label: "Appointments" },
    { to: "/admin/slots", label: "Slots" },
  ],

  SUPER_ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/patients", label: "Patients" },
    { to: "/admin/doctors", label: "Doctors" },
    { to: "/admin/appointments", label: "Appointments" },
    { to: "/admin/slots", label: "Slots" },
    { to: "/admin/create-doctor", label: "Create Doctor" },
    { to: "/admin/create-admin", label: "Create Admin" },
    { to: "/admin/admins", label: "Manage Admins" },
  ],
};

function Navbar() {
  const { isAuthenticated, role, user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef();

  const links = NAV_LINKS[role] || [];

  useEffect(() => {
    if (
      role === "PATIENT" ||
      role === "DOCTOR"
    ) {
      loadNotifications();

      const timer = setInterval(() => {
        loadNotifications();
      }, 10000);

      return () =>
        clearInterval(timer);
    }
  }, [user, role]);

  useEffect(() => {
    const clickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      clickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        clickOutside
      );
  }, []);

  const loadNotifications =
    async () => {
      try {
        if (!user?.email) return;

        let res;

        // PATIENT
        if (role === "PATIENT") {
          const patientRes =
            await getPatientByEmail(
              user.email
            );

          const patientId =
            patientRes.data.id;

          res =
            await getMyNotifications(
              patientId
            );
        }

        // DOCTOR
        if (role === "DOCTOR") {
          const doctorRes =
            await getDoctorByEmail(
              user.email
            );

          const doctorId =
            doctorRes.data.id;

          res =
            await getDoctorNotifications(
              doctorId
            );
        }

        const sorted = [
          ...(res?.data || []),
        ].sort(
          (a, b) =>
            new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            )
        );

        setNotifications(
          sorted
        );
      } catch (err) {
        console.log(err);
      }
    };

  const unreadCount =
    notifications.filter(
      (n) =>
        !(
          n.read ||
          n.isRead
        )
    ).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path;

  const handleNotificationClick =
    async (n) => {
      try {
        if (
          !(
            n.read ||
            n.isRead
          )
        ) {
          await markNotificationRead(
            n.id
          );

          setNotifications(
            (prev) =>
              prev.map(
                (item) =>
                  item.id ===
                  n.id
                    ? {
                        ...item,
                        read: true,
                        isRead: true,
                      }
                    : item
              )
          );
        }

        const title = (
          n.title || ""
        ).toLowerCase();

        // PATIENT REDIRECTS
        if (
          role === "PATIENT"
        ) {
          if (
            title.includes(
              "payment"
            ) ||
            title.includes(
              "refund"
            )
          ) {
            navigate(
              "/patient/payments"
            );
          } else if (
            title.includes(
              "prescription"
            )
          ) {
            navigate(
              "/patient/prescriptions"
            );
          } else {
            navigate(
              "/patient/appointments"
            );
          }
        }

        // DOCTOR REDIRECTS
        if (
          role === "DOCTOR"
        ) {
          if (
            title.includes(
              "prescription"
            )
          ) {
            navigate(
              "/doctor/prescriptions"
            );
          } else {
            navigate(
              "/doctor/appointments"
            );
          }
        }

        setOpen(false);
      } catch (err) {
        console.log(err);
      }
    };

  const groupByDate = () => {
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();

    notifications.forEach(
      (n) => {
        const d = new Date(
          n.createdAt
        );

        const diff =
          Math.floor(
            (now - d) /
              (1000 *
                60 *
                60 *
                24)
          );

        if (diff === 0)
          today.push(n);
        else if (
          diff === 1
        )
          yesterday.push(n);
        else older.push(n);
      }
    );

    return {
      today,
      yesterday,
      older,
    };
  };

  const groups =
    groupByDate();

  const renderGroup = (
    title,
    data
  ) => {
    if (!data.length)
      return null;

    return (
      <>
        <div
          style={
            styles.groupTitle
          }
        >
          {title}
        </div>

        {data.map((n) => {
          const unread =
            !(
              n.read ||
              n.isRead
            );

          return (
            <div
              key={n.id}
              onClick={() =>
                handleNotificationClick(
                  n
                )
              }
              style={{
                ...styles.note,
                background:
                  unread
                    ? "#f8fbff"
                    : "#ffffff",
              }}
            >
              <div
                style={
                  styles.noteTop
                }
              >
                <span
                  style={{
                    ...styles.dot,
                    background:
                      unread
                        ? "#2563eb"
                        : "#cbd5e1",
                  }}
                />

                <span
                  style={
                    styles.noteTitle
                  }
                >
                  {n.title}
                </span>
              </div>

              <div
                style={
                  styles.noteMsg
                }
              >
                {n.message}
              </div>

              <div
                style={
                  styles.time
                }
              >
                {new Date(
                  n.createdAt
                ).toLocaleString()}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link
          to="/"
          style={styles.logo}
        >
          MediTrack
        </Link>

        {isAuthenticated && (
          <div
            style={
              styles.menu
            }
          >
            {links.map(
              (item) => (
                <Link
                  key={
                    item.to
                  }
                  to={
                    item.to
                  }
                  style={{
                    ...styles.link,
                    ...(isActive(
                      item.to
                    )
                      ? styles.active
                      : {}),
                  }}
                >
                  {
                    item.label
                  }
                </Link>
              )
            )}
          </div>
        )}
      </div>

      <div style={styles.right}>
        {(role ===
          "PATIENT" ||
          role ===
            "DOCTOR") && (
          <div
            ref={
              dropdownRef
            }
            style={{
              position:
                "relative",
            }}
          >
            <button
              style={
                styles.bellBtn
              }
              onClick={() =>
                setOpen(
                  !open
                )
              }
            >
              <Bell size={18} />

              {unreadCount >
                0 && (
                <span
                  style={
                    styles.badge
                  }
                >
                  {
                    unreadCount
                  }
                </span>
              )}
            </button>

            {open && (
              <div
                style={
                  styles.dropdown
                }
              >
                <div
                  style={
                    styles.dropHeader
                  }
                >
                  <span>
                    Notifications
                  </span>

                  <span
                    style={
                      styles.count
                    }
                  >
                    {
                      unreadCount
                    }
                  </span>
                </div>

                <div
                  style={
                    styles.list
                  }
                >
                  {notifications.length ===
                  0 ? (
                    <div
                      style={
                        styles.empty
                      }
                    >
                      No
                      notifications
                    </div>
                  ) : (
                    <>
                      {renderGroup(
                        "Today",
                        groups.today
                      )}
                      {renderGroup(
                        "Yesterday",
                        groups.yesterday
                      )}
                      {renderGroup(
                        "Older",
                        groups.older
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {isAuthenticated && (
          <>
            <div
              style={
                styles.userBox
              }
            >
              <div
                style={
                  styles.email
                }
              >
                {
                  user?.email
                }
              </div>

              <div
                style={
                  styles.role
                }
              >
                {role}
              </div>
            </div>

            <button
              onClick={
                handleLogout
              }
              style={
                styles.logout
              }
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    height: "74px",
    background:
      "rgba(255,255,255,0.78)",
    backdropFilter:
      "blur(12px)",
    borderBottom:
      "1px solid rgba(255,255,255,0.4)",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    padding: "0 34px",
    position:
      "sticky",
    top: 0,
    zIndex: 999,
  },

  left: {
    display: "flex",
    alignItems:
      "center",
    gap: "26px",
  },

  right: {
    display: "flex",
    alignItems:
      "center",
    gap: "14px",
  },

  logo: {
    textDecoration:
      "none",
    fontSize: "30px",
    fontWeight: "800",
    color:
      "#1d4ed8",
  },

  menu: {
    display: "flex",
    gap: "8px",
  },

  link: {
    textDecoration:
      "none",
    color:
      "#475569",
    padding:
      "10px 14px",
    borderRadius:
      "12px",
    fontWeight: "600",
    fontSize: "14px",
  },

  active: {
    background:
      "linear-gradient(135deg,#eff6ff,#eef2ff)",
    color:
      "#1565C0",
  },

  bellBtn: {
    width: "44px",
    height: "44px",
    borderRadius:
      "12px",
    border:
      "1px solid #e2e8f0",
    background:
      "#fff",
    cursor:
      "pointer",
    position:
      "relative",
  },

  badge: {
    position:
      "absolute",
    top: "-6px",
    right: "-6px",
    minWidth: "18px",
    height: "18px",
    borderRadius:
      "50%",
    background:
      "#ef4444",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    justifyContent:
      "center",
    alignItems:
      "center",
  },

  dropdown: {
    position:
      "absolute",
    top: "56px",
    right: 0,
    width: "400px",
    background:
      "#fff",
    borderRadius:
      "18px",
    border:
      "1px solid #eef2f7",
    boxShadow:
      "0 24px 60px rgba(15,23,42,0.18)",
    overflow:
      "hidden",
    zIndex: 99999,
  },

  dropHeader: {
    padding: "16px",
    fontWeight: "700",
    display: "flex",
    justifyContent:
      "space-between",
    borderBottom:
      "1px solid #eef2f7",
  },

  count: {
    background:
      "#eff6ff",
    color:
      "#1d4ed8",
    padding:
      "4px 8px",
    borderRadius:
      "999px",
    fontSize: "12px",
  },

  list: {
    maxHeight:
      "520px",
    overflowY:
      "auto",
  },

  groupTitle: {
    padding:
      "12px 16px",
    fontSize: "12px",
    fontWeight: "700",
    color:
      "#64748b",
    background:
      "#f8fafc",
  },

  note: {
    padding:
      "14px 16px",
    borderBottom:
      "1px solid #f1f5f9",
    cursor:
      "pointer",
  },

  noteTop: {
    display: "flex",
    gap: "8px",
    alignItems:
      "center",
  },

  dot: {
    width: "8px",
    height: "8px",
    borderRadius:
      "50%",
  },

  noteTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color:
      "#0f172a",
  },

  noteMsg: {
    marginTop: "6px",
    fontSize: "13px",
    color:
      "#475569",
    lineHeight:
      "1.45",
  },

  time: {
    marginTop: "8px",
    fontSize: "12px",
    color:
      "#94a3b8",
  },

  empty: {
    padding: "24px",
    textAlign:
      "center",
    color:
      "#64748b",
  },

  userBox: {
    display: "flex",
    flexDirection:
      "column",
    alignItems:
      "flex-end",
  },

  email: {
    fontSize: "13px",
    fontWeight: "600",
  },

  role: {
    fontSize: "11px",
    color:
      "#64748b",
  },

  logout: {
    border: "none",
    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#fff",
    padding:
      "10px 14px",
    borderRadius:
      "12px",
    fontWeight: "700",
    cursor:
      "pointer",
    display: "flex",
    alignItems:
      "center",
    gap: "8px",
  },
};

export default Navbar;