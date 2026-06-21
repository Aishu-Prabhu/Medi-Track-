// =======================================
// Navbar.test.jsx
// Tests for Navbar.jsx
// =======================================

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor
} from "@testing-library/react";
import Navbar from "./Navbar";
import { useAuth } from "../../context/AuthContext";

import { getPatientByEmail } from "../../api/patientService";
import { getDoctorByEmail } from "../../api/doctorService";
import {
  getMyNotifications,
  getDoctorNotifications,
  markNotificationRead
} from "../../api/notificationService";

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn()
}));

jest.mock("../../api/patientService", () => ({
  getPatientByEmail: jest.fn()
}));

jest.mock("../../api/doctorService", () => ({
  getDoctorByEmail: jest.fn()
}));

jest.mock("../../api/notificationService", () => ({
  getMyNotifications: jest.fn(),
  getDoctorNotifications: jest.fn(),
  markNotificationRead: jest.fn()
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: "/patient/dashboard"
  })
}));

describe("Navbar.jsx", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render logo", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      role: null,
      user: null
    });

    render(<Navbar />);

    expect(
      screen.getByText("MediTrack")
    ).toBeInTheDocument();
  });

  test("should render patient menu links when authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: "PATIENT",
      user: { email: "user@test.com" },
      logout: jest.fn()
    });

    getPatientByEmail.mockResolvedValue({
      data: { id: 1 }
    });

    getMyNotifications.mockResolvedValue({
      data: []
    });

    render(<Navbar />);

    expect(
      screen.getByText("Dashboard")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Profile")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Appointments")
    ).toBeInTheDocument();
  });

  test("should load patient notifications", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: "PATIENT",
      user: { email: "patient@test.com" },
      logout: jest.fn()
    });

    getPatientByEmail.mockResolvedValue({
      data: { id: 22 }
    });

    getMyNotifications.mockResolvedValue({
      data: []
    });

    render(<Navbar />);

    await waitFor(() => {
      expect(
        getPatientByEmail
      ).toHaveBeenCalledWith(
        "patient@test.com"
      );
    });

    expect(
      getMyNotifications
    ).toHaveBeenCalledWith(22);
  });

  test("should load doctor notifications", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: "DOCTOR",
      user: { email: "doctor@test.com" },
      logout: jest.fn()
    });

    getDoctorByEmail.mockResolvedValue({
      data: { id: 55 }
    });

    getDoctorNotifications.mockResolvedValue({
      data: []
    });

    render(<Navbar />);

    await waitFor(() => {
      expect(
        getDoctorByEmail
      ).toHaveBeenCalledWith(
        "doctor@test.com"
      );
    });

    expect(
      getDoctorNotifications
    ).toHaveBeenCalledWith(55);
  });

  test("should open notification dropdown", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: "PATIENT",
      user: { email: "user@test.com" },
      logout: jest.fn()
    });

    getPatientByEmail.mockResolvedValue({
      data: { id: 1 }
    });

    getMyNotifications.mockResolvedValue({
      data: []
    });

    render(<Navbar />);

    const buttons =
      screen.getAllByRole("button");

    fireEvent.click(buttons[0]);

    expect(
      screen.getByText(
        "Notifications"
      )
    ).toBeInTheDocument();
  });

  test("should show unread badge count", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: "PATIENT",
      user: { email: "user@test.com" },
      logout: jest.fn()
    });

    getPatientByEmail.mockResolvedValue({
      data: { id: 1 }
    });

    getMyNotifications.mockResolvedValue({
      data: [
        {
          id: 1,
          title: "Payment",
          message: "Done",
          createdAt: new Date(),
          read: false
        }
      ]
    });

    render(<Navbar />);

    await waitFor(() => {
      expect(
        screen.getByText("1")
      ).toBeInTheDocument();
    });
  });

  test("should logout and navigate to login", () => {
    const logoutMock = jest.fn();

    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: "ADMIN",
      user: { email: "admin@test.com" },
      logout: logoutMock
    });

    render(<Navbar />);

    fireEvent.click(
      screen.getByText("Logout")
    );

    expect(logoutMock)
      .toHaveBeenCalled();

    expect(mockNavigate)
      .toHaveBeenCalledWith(
        "/login"
      );
  });

  test("should mark notification read and redirect patient", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: "PATIENT",
      user: { email: "user@test.com" },
      logout: jest.fn()
    });

    getPatientByEmail.mockResolvedValue({
      data: { id: 1 }
    });

    getMyNotifications.mockResolvedValue({
      data: [
        {
          id: 10,
          title: "Prescription Ready",
          message: "Check now",
          createdAt: new Date(),
          read: false
        }
      ]
    });

    markNotificationRead.mockResolvedValue({});

    render(<Navbar />);

    await waitFor(() => {
      expect(
        screen.getByText("1")
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getAllByRole("button")[0]
    );

    fireEvent.click(
      screen.getByText(
        "Prescription Ready"
      )
    );

    await waitFor(() => {
      expect(
        markNotificationRead
      ).toHaveBeenCalledWith(10);
    });

    expect(mockNavigate)
      .toHaveBeenCalledWith(
        "/patient/prescriptions"
      );
  });

});